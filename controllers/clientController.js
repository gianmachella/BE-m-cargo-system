const Client = require("../models/Client");
const Shipment = require("../models/Shipment");
const Receiver = require("../models/Receiver");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db"); // Asegúrate de que esto esté definido si es necesario para transacciones

const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }, // Búsqueda por teléfono
          ],
        }
      : {};

    const clients = await Client.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      totalItems: clients.count,
      totalPages: Math.ceil(clients.count / limit),
      currentPage: parseInt(page),
      data: clients.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClient = async (req, res) => {
  const { firstName, lastName, phone, email, receivers } = req.body;

  const transaction = await Client.sequelize.transaction();

  try {
    const newClient = await Client.create(
      { firstName, lastName, phone, email },
      { transaction }
    );

    if (!newClient) {
      throw new Error("El cliente no se creó correctamente.");
    }

    // Crear receptores asociados
    if (receivers && receivers.length > 0) {
      const receiversData = receivers.map((receiver) => ({
        ...receiver,
        clientId: newClient.id,
      }));

      if (receiversData.some((r) => !r.firstName || !r.lastName || !r.phone)) {
        throw new Error("Uno o más receptores tienen datos inválidos.");
      }

      await Receiver.bulkCreate(receiversData, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: "Cliente y receptores creados con éxito" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al crear cliente:", error);

    res.status(500).json({
      message: "Error al crear el cliente.",
      error: error.message,
    });
  }
};

// Update client by ID
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email, updatedBy } = req.body;

    const client = await Client.findByPk(id);

    if (!client) return res.status(404).json({ message: "Client not found" });

    client.firstName = firstName;
    client.lastName = lastName;
    client.phone = phone;
    client.email = email;
    client.updatedBy = updatedBy;

    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;

  const transaction = await Client.sequelize.transaction();
  try {
    await Receiver.destroy({ where: { clientId: id }, transaction });

    const client = await Client.findByPk(id, { transaction });
    if (!client) return res.status(404).json({ message: "Client not found" });

    await client.destroy({ transaction });

    await transaction.commit();
    res.json({ message: "Client and associated receivers deleted" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting client:", error);
    res.status(500).json({ message: "Error deleting client and receivers" });
  }
};

const getShipmentsByClient = async (req, res) => {
  try {
    const { id } = req.params; // ID del cliente
    const client = await Client.findByPk(id, {
      include: {
        model: Shipment,
        as: "shipments", // Nombre del alias definido en la relación
      },
    });
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.json(client.shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClientWithReceivers = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, email, receivers } = req.body;

  const transaction = await sequelize.transaction(); // Inicia la transacción

  try {
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Actualizar cliente
    await client.update({ firstName, lastName, phone, email }, { transaction });

    // Actualizar receptores
    for (const receiverData of receivers) {
      const { id: receiverId, ...data } = receiverData;
      const receiver = await Receiver.findByPk(receiverId);

      if (receiver) {
        await receiver.update(data, { transaction });
      } else {
        await Receiver.create(
          { ...data, clientId: client.id },
          { transaction }
        );
      }
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Cliente y receptores actualizados con éxito" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

module.exports = {
  getClientById,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getShipmentsByClient,
  updateClientWithReceivers,
};

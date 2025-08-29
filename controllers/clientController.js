const Client = require("../models/Client");
const Shipment = require("../models/Shipment");
const Receiver = require("../models/Receiver");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

// 📌 Listado con búsqueda y paginación
const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereCondition = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const clients = await Client.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
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

// 📌 Crear cliente + receptores
const createClient = async (req, res) => {
  const { firstName, lastName, phone, email, receivers } = req.body;

  const transaction = await sequelize.transaction();
  try {
    const newClient = await Client.create(
      {
        firstName,
        lastName,
        phone,
        email,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      },
      { transaction }
    );

    if (receivers && receivers.length > 0) {
      const receiversData = receivers.map((receiver) => ({
        ...receiver,
        clientId: newClient.id,
      }));

      await Receiver.bulkCreate(receiversData, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: "Cliente y receptores creados con éxito" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// 📌 Update cliente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email } = req.body;

    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    await client.update({
      firstName,
      lastName,
      phone,
      email,
      updatedBy: req.user.id,
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Delete cliente + receptores
const deleteClient = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  try {
    await Receiver.destroy({ where: { clientId: id }, transaction });

    const client = await Client.findByPk(id, { transaction });
    if (!client) return res.status(404).json({ message: "Client not found" });

    await client.destroy({ transaction });
    await transaction.commit();

    res.json({ message: "Client and associated receivers deleted" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShipmentsByClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id, {
      include: { model: Shipment, as: "shipments" },
    });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client.shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientById,
  getShipmentsByClient,
};

const Receiver = require("../models/Receiver");

// Obtener receptores por cliente
const getReceptorsByClientId = async (req, res) => {
  const { clientId } = req.params;

  try {
    const receivers = await Receiver.findAll({ where: { clientId } });

    if (receivers.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron receptores para este cliente." });
    }

    return res.status(200).json(receivers);
  } catch (error) {
    console.error("❌ Error al obtener los receptores:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los receptores." });
  }
};

// Crear receptor
const createReceiver = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country,
      clientId,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !country ||
      !clientId
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }

    const newReceiver = await Receiver.create({
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country,
      clientId,
      createdBy: req.user?.id || null,
      updatedBy: req.user?.id || null,
    });

    return res.status(201).json(newReceiver);
  } catch (error) {
    console.error("❌ Error al crear receptor:", error);
    return res.status(500).json({ message: "Error al crear el receptor." });
  }
};

// Actualizar receptor
const updateReceiver = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, city, state, country } =
      req.body;

    const receiver = await Receiver.findByPk(id);
    if (!receiver) {
      return res.status(404).json({ message: "Receptor no encontrado" });
    }

    await receiver.update({
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country,
      updatedBy: req.user?.id || receiver.updatedBy,
    });

    return res.status(200).json({ message: "Receptor actualizado", receiver });
  } catch (error) {
    console.error("❌ Error al actualizar receptor:", error);
    return res.status(500).json({ message: "Error al actualizar receptor" });
  }
};

module.exports = { getReceptorsByClientId, createReceiver, updateReceiver };

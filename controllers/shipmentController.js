const Client = require("../models/Client");
const Shipment = require("../models/Shipment");
const Batch = require("../models/Batch");
const Receiver = require("../models/Receiver");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");

const getShipments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const searchCondition = search
      ? {
          [Op.or]: [
            { shipmentNumber: { [Op.like]: `%${search}%` } },
            { status: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const clientSearchCondition = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const totalItems = await Shipment.count({
      where: searchCondition,
      include: [
        {
          model: Client,
          as: "client",
          where: clientSearchCondition,
          required: false,
        },
        { model: Receiver, as: "receiver", required: false },
        { model: Batch, as: "batch", required: false },
      ],
    });

    const shipments = await Shipment.findAll({
      where: searchCondition,
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "firstName", "lastName", "phone", "email"],
          where: clientSearchCondition,
          required: false,
        },
        {
          model: Receiver,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "phone", "address"],
          required: false,
        },
        {
          model: Batch,
          as: "batch",
          attributes: [
            "id",
            "batchNumber",
            "destinationCountry",
            "status",
            "shipmentType",
          ],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page),
      data: shipments,
    });
  } catch (error) {
    console.error("Error al obtener envíos:", error);
    res.status(500).json({ message: error.message });
  }
};

const createShipment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      shipmentNumber,
      batchId,
      clientId,
      receiverId,
      boxes,
      totalWeight,
      totalVolume,
      totalBoxes,
      status,
      insurance,
      insuranceValue,
      paymentMethod,
      declaredValue,
      valuePaid,
    } = req.body;

    const newShipment = await Shipment.create(
      {
        shipmentNumber,
        batchId,
        clientId,
        receiverId,
        boxes,
        totalWeight,
        totalVolume,
        totalBoxes,
        status,
        createdBy: req.user.id, // 👈 siempre del token
        updatedBy: req.user.id, // 👈 siempre del token
        insurance,
        insuranceValue,
        paymentMethod,
        declaredValue,
        valuePaid,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(newShipment);
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error al crear envío:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateShipment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const shipment = await Shipment.findByPk(id);
    if (!shipment) {
      await transaction.rollback();
      return res.status(404).json({ message: "Shipment not found" });
    }

    const {
      shipmentNumber,
      batchId,
      clientId,
      receiverId,
      boxes,
      totalWeight,
      totalVolume,
      totalBoxes,
      status,
      insurance,
      insuranceValue,
      paymentMethod,
      declaredValue,
      valuePaid,
    } = req.body;

    await shipment.update(
      {
        shipmentNumber,
        batchId,
        clientId,
        receiverId,
        boxes,
        totalWeight,
        totalVolume,
        totalBoxes,
        status,
        updatedBy: req.user.id, // 👈 token
        insurance,
        insuranceValue,
        paymentMethod,
        declaredValue,
        valuePaid,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json(shipment);
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error al actualizar envío:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id);
    if (!shipment)
      return res.status(404).json({ message: "Shipment not found" });
    await shipment.destroy();
    res.json({ message: "Shipment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShipmentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findByPk(batchId, {
      include: { model: Shipment, as: "shipments" },
    });
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch.shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShipmentByNumber = async (req, res) => {
  try {
    const { shipmentNumber } = req.params;
    const shipment = await Shipment.findOne({
      where: { shipmentNumber },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "firstName", "lastName", "phone", "email"],
          required: false,
        },
        {
          model: Receiver,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "phone", "address"],
          required: false,
        },
        {
          model: Batch,
          as: "batch",
          attributes: [
            "id",
            "batchNumber",
            "destinationCountry",
            "status",
            "shipmentType",
          ],
          required: false,
        },
      ],
    });
    if (!shipment)
      return res.status(404).json({ message: "Shipment not found" });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  getShipmentsByBatch,
  getShipmentByNumber,
};

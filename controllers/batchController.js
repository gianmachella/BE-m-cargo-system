const { Op } = require("sequelize");
const Batch = require("../models/Batch");
const { sequelize } = require("../config/db");
const Shipment = require("../models/Shipment"); // ✅ Importar modelo Shipment

const getBatches = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const offset = (page - 1) * limit;

  try {
    // Condición para filtrar por número de lote, país de destino o tipo de envío
    const whereCondition = search
      ? {
          [Op.or]: [
            { batchNumber: { [Op.like]: `%${search}%` } },
            { destinationCountry: { [Op.like]: `%${search}%` } },
            { shipmentType: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { rows, count } = await Batch.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error al obtener los lotes:", error);
    res.status(500).json({ message: "Error al obtener los lotes" });
  }
};

// Crear un nuevo lote
const createBatch = async (req, res) => {
  try {
    const newBatch = await Batch.create(req.body);
    res.status(201).json(newBatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un lote por su ID
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBatch = async (req, res) => {
  const transaction = await sequelize.transaction(); // ✅ Iniciar transacción

  try {
    const { id } = req.params;
    const { status } = req.body; // Extraer el nuevo estado del lote

    const batch = await Batch.findByPk(id, {
      include: [
        {
          model: Shipment,
          as: "batchShipments", // ✅ Alias correcto
        },
      ],
      transaction,
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // 🔹 Actualizar el estado del Batch
    await batch.update({ status }, { transaction });

    // 🔹 Si hay envíos asociados, actualizar sus estados también
    if (batch.batchShipments && batch.batchShipments.length > 0) {
      await Shipment.update(
        { status }, // ✅ Se aplica el mismo estado del Batch
        {
          where: { batchId: id },
          transaction,
        }
      );
    }

    await transaction.commit();
    res.json({
      message: "Batch and associated shipments updated successfully",
      batch,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error updating batch and shipments:", error);
    res.status(500).json({ message: error.message });
  }

  try {
    const { id } = req.params;
    const { status } = req.body; // Extraer el nuevo estado

    const batch = await Batch.findByPk(id, {
      include: [
        {
          model: Shipment,
          as: "batchShipments", // Alias correcto usado en la asociación
        },
      ],
      transaction,
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // 🔹 Actualizar el estado del Batch
    await batch.update({ status }, { transaction });

    // 🔹 Si hay envíos asociados, actualizar sus estados también
    if (batch.batchShipments.length > 0) {
      await Shipment.update(
        { status }, // 🔹 Se aplica el mismo estado del Batch
        {
          where: { batchId: id },
          transaction,
        }
      );
    }

    await transaction.commit();
    res.json({
      message: "Batch and associated shipments updated successfully",
      batch,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error updating batch and shipments:", error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un lote por su ID
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await batch.destroy();
    res.json({ message: "Batch deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBatches,
  createBatch,
  getBatchById,
  updateBatch,
  deleteBatch,
};

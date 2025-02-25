const { Op, fn, col } = require("sequelize");
const Client = require("../models/Client");
const Shipment = require("../models/Shipment");
const Batch = require("../models/Batch");

// Get statistics for total number of clients, shipments, and batches with additional filters
const getGeneralStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Optional date filter for createdAt
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          }
        : {};

    const totalClients = await Client.count({ where: dateFilter });
    const totalShipments = await Shipment.count({ where: dateFilter });
    const totalBatches = await Batch.count({ where: dateFilter });

    res.json({
      totalClients,
      totalShipments,
      totalBatches,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get shipment statistics grouped by status or by client
const getShipmentStatistics = async (req, res) => {
  try {
    const { groupBy = "status" } = req.query;

    // Define group by attributes dynamically
    const groupByAttribute = groupBy === "client" ? "clientId" : "status";

    const shipmentStats = await Shipment.findAll({
      attributes: [
        groupByAttribute,
        [fn("COUNT", col(groupByAttribute)), "count"],
      ],
      group: [groupByAttribute],
    });

    res.json(shipmentStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get batch statistics grouped by destination country or by month
const getBatchStatistics = async (req, res) => {
  try {
    const { groupBy = "destinationCountry" } = req.query;

    // Define group by attributes dynamically
    const groupByAttribute =
      groupBy === "month"
        ? fn("MONTH", col("createdAt"))
        : "destinationCountry";

    const batchStats = await Batch.findAll({
      attributes: [
        groupByAttribute,
        [fn("COUNT", col(groupByAttribute)), "count"],
      ],
      group: [groupByAttribute],
    });

    res.json(batchStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGeneralStatistics,
  getShipmentStatistics,
  getBatchStatistics,
};

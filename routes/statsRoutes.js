const express = require("express");
const {
  getGeneralStatistics,
  getShipmentStatistics,
  getBatchStatistics,
} = require("../controllers/statsController");
const { protect } = require("../middlewares/authMiddleware");
const { validateStatsParams } = require("../middlewares/validateStatsParams"); // Middleware de validación
const router = express.Router();

// General statistics route with validation
router
  .route("/general")
  .get(protect, validateStatsParams, getGeneralStatistics);

// Shipment statistics route grouped by status with validation
router
  .route("/shipments")
  .get(protect, validateStatsParams, getShipmentStatistics);

// Batch statistics route grouped by destination country with validation
router.route("/batches").get(protect, validateStatsParams, getBatchStatistics);

module.exports = router;

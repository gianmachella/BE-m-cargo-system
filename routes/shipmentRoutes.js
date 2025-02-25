const express = require("express");
const {
  getShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  getShipmentsByBatch,
} = require("../controllers/shipmentController");
const { protect } = require("../middlewares/authMiddleware");
const { validatePagination } = require("../middlewares/validatePagination");
const router = express.Router();

router
  .route("/")
  .get(protect, validatePagination, getShipments)
  .post(protect, createShipment);

router
  .route("/:id")
  .put(protect, updateShipment)
  .delete(protect, deleteShipment);

router
  .route("/batch/:batchId")
  .get(protect, validatePagination, getShipmentsByBatch);

module.exports = router;

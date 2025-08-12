const express = require("express");
const router = express.Router();
const {
  getShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  getShipmentsByBatch,
  getShipmentByNumber,
} = require("../controllers/shipmentController");
const { protect } = require("../middlewares/authMiddleware");
const { validatePagination } = require("../middlewares/validatePagination");

// público para tracking
router.get("/number/:shipmentNumber", getShipmentByNumber);

router
  .route("/")
  .get(protect, validatePagination, getShipments)
  .post(protect, createShipment);

router
  .route("/batch/:batchId")
  .get(protect, validatePagination, getShipmentsByBatch);

router
  .route("/:id")
  .put(protect, updateShipment)
  .delete(protect, deleteShipment);

module.exports = router;

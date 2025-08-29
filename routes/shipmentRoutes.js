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

// 📦 Ruta pública (tracking por número de envío, sin token)
router.get("/number/:shipmentNumber", getShipmentByNumber);

// 🔒 Rutas protegidas (requieren token válido)
router
  .route("/")
  .get(protect, validatePagination, getShipments) // listar con paginación
  .post(protect, createShipment); // crear envío

router
  .route("/batch/:batchId")
  .get(protect, validatePagination, getShipmentsByBatch); // listar envíos de un lote

router
  .route("/:id")
  .put(protect, updateShipment) // actualizar envío
  .delete(protect, deleteShipment); // eliminar envío

module.exports = router;

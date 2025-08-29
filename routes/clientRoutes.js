const express = require("express");
const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getShipmentsByClient,
  getClientById,
} = require("../controllers/clientController");
const {
  getReceptorsByClientId,
  updateReceiver,
} = require("../controllers/receptorController");
const { protect } = require("../middlewares/authMiddleware");
const { validatePagination } = require("../middlewares/validatePagination");

const router = express.Router();

router
  .route("/")
  .get(protect, validatePagination, getClients)
  .post(protect, createClient);

router
  .route("/:id")
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

router.get("/:clientId/receivers", protect, getReceptorsByClientId);
router.put("/receivers/:id", protect, updateReceiver);

router.get("/:id/shipments", protect, getShipmentsByClient);

module.exports = router;

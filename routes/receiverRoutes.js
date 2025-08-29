const express = require("express");
const {
  getReceptorsByClientId,
  createReceiver,
  updateReceiver,
} = require("../controllers/receptorController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Todas protegidas por token 🔐
router.use(protect);

// Obtener receptores de un cliente
router.get("/client/:clientId", getReceptorsByClientId);

// Crear un nuevo receptor
router.post("/", createReceiver);

// Actualizar receptor
router.put("/:id", updateReceiver);

module.exports = router;

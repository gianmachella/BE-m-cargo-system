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
} = require("../controllers/receptorController"); // Asegúrate de que el path sea correcto
const { protect } = require("../middlewares/authMiddleware");
const { validatePagination } = require("../middlewares/validatePagination"); // Asegúrate de que esta importación sea correcta

const router = express.Router();

router.get("/", getClients); // Obtener todos los clientes
router.get("/:id", getClientById); // Obtener un cliente por ID
router.post("/", createClient); // Crear un nuevo cliente
router.put("/:id", updateClient); // Actualizar cliente
router.delete("/:id", deleteClient); // Eliminar cliente
router.get("/:clientId/receivers", getReceptorsByClientId);

router.put("/receivers/:id", updateReceiver);

module.exports = router;

const express = require("express");
const {
  createReceiver,
  updateReceiver,
} = require("../controllers/receptorController");

const router = express.Router();

// Ruta para crear un receptor
router.post("/", createReceiver);
router.put("/:id", updateReceiver);

module.exports = router;

const express = require("express");
const {
  loginUser,
  registerUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

// Ruta para login
router.post("/login", loginUser);

// Ruta para registrar usuario
router.post("/register", registerUser);

// Ruta para obtener el perfil del usuario (protegida)
router.get("/profile", protect, getUserProfile);

module.exports = router;

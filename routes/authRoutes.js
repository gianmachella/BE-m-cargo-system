const express = require("express");
const {
  loginUser,
  registerUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/profile", protect, getUserProfile);

module.exports = router;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const isBcrypt = (h) =>
  typeof h === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(h);

// ====== LOGIN ======
export const loginUser = async (req, res) => {
  try {
    const { email, password, company } = req.body;

    // Buscar usuario por email y company
    const user = await User.findOne({ where: { email, company } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or company" });
    }

    // Comparar contraseña con bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, company: user.company },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ====== REGISTER ======
const registerUser = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      userName,
      email,
      password,
      company,
      createdBy,
      updatedBy,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !userName ||
      !email ||
      !password ||
      !company ||
      !createdBy ||
      !updatedBy
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }
    email = String(email).trim().toLowerCase();
    company = String(company).trim();

    const existingUser = await User.findOne({ where: { email, company } });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email already in use for this company." });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      company,
      createdBy,
      updatedBy,
    });
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ====== PROFILE ======
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, registerUser, getUserProfile };

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

// Detecta si el hash es bcrypt ($2a/$2b/$2y)
const isBcrypt = (hash = "") => /^\$2[aby]\$/.test(hash);

// ====== LOGIN ======
const loginUser = async (req, res) => {
  console.log("LOGIN ▶︎ inicio");
  try {
    const { email, password, company } = req.body;

    if (!email || !password || !company) {
      return res
        .status(400)
        .json({ message: "Email, password, and company are required" });
    }

    const user = await User.findOne({ where: { email, company } });
    if (!user) {
      console.log("LOGIN ▶︎ no existe usuario con ese email+company");
      return res.status(401).json({ message: "Invalid email or company" });
    }

    console.log(
      "LOGIN ▶︎ hash almacenado:",
      (user.password || "").slice(0, 7),
      "..."
    );

    let ok = false;
    console.log(
      "LOGIN ▶︎ hash len:",
      user.password?.length,
      "isBcrypt?",
      isBcrypt(user.password),
      "prefix:",
      (user.password || "").slice(0, 4)
    );

    if (isBcrypt(user.password)) {
      console.log("LOGIN ▶︎ usando bcrypt.compare");
      ok = await bcrypt.compare(password, user.password);
    } else {
      console.log(
        "LOGIN ▶︎ hash legacy sha256 detectado, comparando y migrando (si coincide)"
      );
      const sha = crypto.createHash("sha256").update(password).digest("hex");
      ok = sha === user.password;
      if (ok) {
        const newHash = await bcrypt.hash(password, 10);
        await user.update({ password: newHash });
        console.log("LOGIN ▶︎ migrado sha256 → bcrypt para", email);
      }
    }

    console.log("LOGIN ▶︎ resultado compare:", ok);
    if (!ok) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, company: user.company },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res
      .status(200)
      .json({ message: "User logged in successfully", token });
  } catch (error) {
    console.error("LOGIN ▶︎ error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====== REGISTER ======
const registerUser = async (req, res) => {
  try {
    console.log("📥 Datos recibidos en el backend:", req.body);

    const {
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

    const existingUser = await User.findOne({ where: { email, company } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use for this company." });
    }

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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

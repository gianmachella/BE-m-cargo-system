const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const isBcrypt = (h) =>
  typeof h === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(h);

// ====== LOGIN ======
const loginUser = async (req, res) => {
  console.log("LOGIN ▶ v2 inicio");
  try {
    let { email, password, company } = req.body;
    if (!email || !password || !company) {
      return res
        .status(400)
        .json({ message: "Email, password, and company are required" });
    }
    email = String(email).trim().toLowerCase();
    company = String(company).trim();

    const user = await User.findOne({ where: { email, company } });
    if (!user)
      return res.status(401).json({ message: "Invalid email or company" });

    if (isBcrypt(user.password)) {
      const ok = await bcrypt.compare(password, user.password);
      console.log("LOGIN ▶ bcrypt.compare:", ok);
      if (!ok) return res.status(401).json({ message: "Invalid password" });
    } else {
      const sha = crypto.createHash("sha256").update(password).digest("hex");
      const ok = sha === user.password;
      console.log("LOGIN ▶ sha256 legacy compare:", ok);
      if (!ok) return res.status(401).json({ message: "Invalid password" });
      const newHash = await bcrypt.hash(password, 10);
      await user.update({ password: newHash });
      console.log("LOGIN ▶ migrado sha256 → bcrypt para", email);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, company: user.company },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res
      .status(200)
      .json({ message: "User logged in successfully", token });
  } catch (error) {
    console.error("LOGIN ▶ error:", error);
    return res.status(500).json({ message: "Server error" });
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

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loginUser = async (req, res) => {
  try {
    const { email, password, company } = req.body;

    const user = await User.findOne({ where: { email, company } });
    console.log("Usuario encontrado:", user);
    console.log("Contraseña ingresada:", password);
    console.log("Contraseña hasheada almacenada:", user.password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or company" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Resultado de la comparación de contraseñas:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, company: user.company },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

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
      return res.status(400).json({ message: "All fields are required" });
    }

    email = String(email).trim().toLowerCase();
    company = String(company).trim();

    const existingUser = await User.findOne({ where: { email, company } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use for this company" });
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
    return res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      company: user.company,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, registerUser, getUserProfile };

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const users = await User.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      totalItems: users.count,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      data: users.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, userId, password, email, createdBy } =
      req.body;

    const userExists = await User.findOne({ where: { userId } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      userId,
      password: hashedPassword,
      email,
      createdBy,
      updatedBy: createdBy,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user and get token
const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, userId: user.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };

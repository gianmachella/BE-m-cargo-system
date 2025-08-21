// utils.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql", // o "postgres"
    logging: false,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión establecida con la DB");
  } catch (error) {
    console.error("❌ Error conectando a la DB:", error);
  }
}

module.exports = { connectDB, sequelize };

const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: console.log,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("📌 Database synced with alter: true (DEV)");
    } else {
      await sequelize.sync();
      console.log("📌 Database synced (PROD, sin alter)");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, connectDB } = require("./config/db");

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    require("./models/associations");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");

    const app = express();

    const allowedOrigins = [
      "https://globalcontrol-system.com",
      "http://localhost:3000",
    ];

    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("CORS no permitido"));
          }
        },
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders:
          "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      })
    );

    app.use(express.json());

    const clientRoutes = require("./routes/clientRoutes");
    const shipmentRoutes = require("./routes/shipmentRoutes");
    const batchRoutes = require("./routes/batchRoutes");
    const userRoutes = require("./routes/userRoutes");
    const authRoutes = require("./routes/authRoutes");
    const receiverRoutes = require("./routes/receiverRoutes");
    const emailRoutes = require("./routes/emailRoutes");

    app.use("/api/clients", clientRoutes);
    app.use("/api/shipments", shipmentRoutes);
    app.use("/api/batches", batchRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/receivers", receiverRoutes);
    app.use("/api", emailRoutes);

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Error initializing server:", error.message);
    process.exit(1);
  }
};

startServer();

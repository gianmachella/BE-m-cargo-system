// app.js (BE completo con CORS + preflight)

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, connectDB } = require("./config/db");

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    // Asociaciones
    require("./models/associations");

    // Sincronización (mantengo tu orden)
    await sequelize.sync({ alter: false });
    await sequelize.sync({});
    console.log("✅ Database synchronized");

    const app = express();

    // --- CORS ---
    const allowedOrigins = [
      "https://globalcontrol-system.com",
      "https://www.globalcontrol-system.com",
      "http://localhost:3000",
    ];

    const corsOptions = {
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error("CORS no permitido"));
      },
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      allowedHeaders:
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    };

    app.use(cors(corsOptions));
    // Preflight para todas las rutas de API
    app.options("/api/*", cors(corsOptions));
    // --- fin CORS ---

    // Body parser
    app.use(express.json());

    // Rutas
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

    const PORT = process.env.PORT || 5000;
    const HOST = "0.0.0.0";

    // Log de rutas registradas
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log(`📌 Ruta registrada: ${middleware.route.path}`);
      }
    });

    app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(`🛠 Ruta registrada: ${r.route.path}`);
      }
    });

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error initializing server:", error.message);
    process.exit(1);
  }
};

startServer();

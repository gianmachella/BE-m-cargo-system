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

    // Sincronización
    await sequelize.sync({ alter: false });
    console.log("✅ Database synchronized");

    const app = express();

    // --- CORS allow-list ---
    const ALLOWED_ORIGINS = new Set([
      "https://globalcontrol-system.com",
      "https://www.globalcontrol-system.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://www.globalcargous.com",
      "https://globalcargous.com",
    ]);

    const corsOptions = {
      origin(origin, cb) {
        console.log("[CORS CHECK]", origin);
        if (!origin) return cb(null, true);
        if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);
        console.error("[CORS] BLOQUEADO:", origin);
        return cb(new Error("CORS no permitido"));
      },
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
      optionsSuccessStatus: 204,
    };

    // --- habilitar CORS ---
    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions)); // preflight

    // Body parser
    app.use(express.json());

    // Rutas
    app.use("/api/clients", require("./routes/clientRoutes"));
    app.use("/api/shipments", require("./routes/shipmentRoutes"));
    app.use("/api/batches", require("./routes/batchRoutes"));
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/receivers", require("./routes/receptorRoutes"));
    app.use("/api", require("./routes/emailRoutes"));

    const PORT = process.env.PORT || 5000;
    const HOST = "0.0.0.0";

    // Log de rutas registradas
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log(`📌 Ruta registrada: ${middleware.route.path}`);
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

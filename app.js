const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, connectDB } = require("./config/db");

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    require("./models/associations");
    await sequelize.sync({ alter: true });

    const app = express();

    const ALLOWED_ORIGINS = new Set([
      "https://globalcontrol-system.com",
      "https://www.globalcontrol-system.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);

    const corsOptions = {
      origin(origin, cb) {
        if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
        return cb(new Error("CORS not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"],
    };

    app.use(cors(corsOptions));
    app.use(express.json());

    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/clients", require("./routes/clientRoutes"));
    app.use("/api/shipments", require("./routes/shipmentRoutes"));
    app.use("/api/batches", require("./routes/batchRoutes"));
    app.use("/api/receivers", require("./routes/receiverRoutes"));
    app.use("/api", require("./routes/emailRoutes"));

    const PORT = process.env.PORT || 5000;
    const HOST = "0.0.0.0";
    app.listen(PORT, HOST, () =>
      console.log(`🚀 Server running on http://${HOST}:${PORT}`)
    );
  } catch (error) {
    process.exit(1);
  }
};

startServer();

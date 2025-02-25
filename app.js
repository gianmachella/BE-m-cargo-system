const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, connectDB } = require("./config/db");

// Configuración de variables de entorno (debe ir al inicio)
dotenv.config();

// Conectar a la base de datos con manejo de errores
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    // Importar asociaciones entre modelos antes de sincronizar
    require("./models/associations");

    // Sincronizar base de datos (Solo usar alter: true en desarrollo)
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");

    // Crear instancia de Express
    const app = express();

    // Habilitar CORS y parseo de JSON
    app.use(cors());
    app.use(express.json());

    // Importar rutas
    const clientRoutes = require("./routes/clientRoutes");
    const shipmentRoutes = require("./routes/shipmentRoutes");
    const batchRoutes = require("./routes/batchRoutes");
    const userRoutes = require("./routes/userRoutes");
    const authRoutes = require("./routes/authRoutes");
    const receiverRoutes = require("./routes/receiverRoutes");
    const emailRoutes = require("./routes/emailRoutes");

    // Usar rutas
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
    process.exit(1); // Sale del proceso si hay un error
  }
};

// Ejecutar la función de inicio
startServer();

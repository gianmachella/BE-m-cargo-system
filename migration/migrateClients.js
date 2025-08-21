// scripts/migrateClients.js
const fs = require("fs");
const path = require("path");
const Client = require("../models/Client");
const { sequelize, connectDB } = require("../config/db");

(async () => {
  try {
    await connectDB();

    // 🔹 Opción 1: limpiar tabla antes de migrar (si quieres un import fresco)
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await sequelize.query("TRUNCATE TABLE Clients;");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("🧹 Tabla Clients limpiada");

    // 🔹 Leer archivo JSON
    const filePath = path.join(__dirname, "firestore-backup", "costumer.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // 🔹 Convertir objeto de Firestore en array (si aplica)
    const clientsArray = Array.isArray(data)
      ? data
      : Object.keys(data).map((key) => ({ firebaseId: key, ...data[key] }));

    // 🔹 Transformar datos al formato SQL
    const clients = clientsArray.map((c) => ({
      firstName: c.name || "N/A",
      lastName: c.lastName || "N/A",
      email:
        c.email?.toLowerCase() ||
        `no-email-${Math.floor(Math.random() * 100000)}@dummy.com`,
      phone: c.phone || "0000000000",
      createdAt: c.createdAt
        ? new Date(c.createdAt._seconds * 1000)
        : new Date(),
      updatedAt: c.updatedAt
        ? new Date(c.updatedAt._seconds * 1000)
        : new Date(),
    }));

    // 🔹 Insertar evitando duplicados por email
    for (const client of clients) {
      await Client.findOrCreate({
        where: { email: client.email },
        defaults: client,
      });
    }

    console.log(`✅ Migración completada. Total procesados: ${clients.length}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error migrando clientes:", err);
    process.exit(1);
  }
})();

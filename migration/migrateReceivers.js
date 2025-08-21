// scripts/migrateReceivers.js
const fs = require("fs");
const path = require("path");
const Client = require("../models/Client");
const Receiver = require("../models/Receiver");
const { sequelize, connectDB } = require("../config/db");

(async () => {
  try {
    await connectDB();

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await sequelize.query("TRUNCATE TABLE Receivers;");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("🧹 Tabla Receivers limpiada");

    const filePath = path.join(__dirname, "firestore-backup", "costumer.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const clientsArray = Array.isArray(data)
      ? data
      : Object.keys(data).map((key) => ({ firebaseId: key, ...data[key] }));

    let totalReceivers = 0;
    let notFoundClients = [];

    for (const c of clientsArray) {
      if (!c.email) continue;

      const client = await Client.findOne({
        where: { email: c.email.toLowerCase() },
      });

      if (!client) {
        console.warn(`⚠️ Cliente no encontrado en DB: ${c.email}`);
        notFoundClients.push(c.email);
        continue;
      }

      if (Array.isArray(c.recipients)) {
        for (const r of c.recipients) {
          await Receiver.create({
            clientId: client.id,
            firstName: r.name || "N/A",
            lastName: r.lastName || "N/A",
            phone: r.phone || "0000000000",
            email: r.email || "",
            address: r.address || "",
            city: typeof r.city === "string" ? r.city : r.city?.name || "",
            state: typeof r.state === "string" ? r.state : r.state?.name || "",
            country:
              typeof r.country === "string" ? r.country : r.country?.name || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          totalReceivers++;
        }
      }
    }

    console.log(
      `✅ Migración de receptores completada. Total insertados: ${totalReceivers}`
    );
    if (notFoundClients.length) {
      console.log(
        "⚠️ Clientes sin receptores migrados (no encontrados):",
        notFoundClients
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error migrando receptores:", err);
    process.exit(1);
  }
})();

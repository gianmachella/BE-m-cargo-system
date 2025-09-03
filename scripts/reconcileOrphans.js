// scripts/reconcileOrphans.js
const fs = require("fs");
const path = require("path");
const { sequelize } = require("../config/db");
const Batch = require("../models/Batch");
const Shipment = require("../models/Shipment");

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // 1. Cargar JSONs
    const lotsPath = path.join(
      __dirname,
      "../migration/firestore-backup/lots.json"
    );
    const shippingsPath = path.join(
      __dirname,
      "../migration/firestore-backup/shipping.json"
    );

    const lots = JSON.parse(fs.readFileSync(lotsPath, "utf8"));
    const shippings = JSON.parse(fs.readFileSync(shippingsPath, "utf8"));

    // 2. Crear índice shipmentNumber -> batchNumber
    const shipmentToBatch = {};
    for (const [lotId, lot] of Object.entries(lots)) {
      if (!lot.number || !Array.isArray(lot.shippings)) continue;
      for (const sn of lot.shippings) {
        shipmentToBatch[sn.trim()] = lot.number;
      }
    }

    // 3. Buscar huérfanos en DB
    const [orphans] = await sequelize.query(
      "SELECT shipmentNumber FROM Shipments WHERE batchId IS NULL"
    );
    console.log(`📦 Orphans encontrados en DB: ${orphans.length}`);

    for (const orphan of orphans) {
      const shipmentNumber = (orphan.shipmentNumber || "").trim();

      const batchNumber = shipmentToBatch[shipmentNumber];
      if (!batchNumber) {
        console.warn(`⚠️ ${shipmentNumber} → No encontrado en lots.json`);
        continue;
      }

      // Buscar batchId en DB
      const batch = await Batch.findOne({ where: { batchNumber } });
      if (!batch) {
        console.warn(
          `⚠️ ${shipmentNumber} → Lote ${batchNumber} no existe en DB`
        );
        continue;
      }

      // Actualizar Shipment
      const [updated] = await Shipment.update(
        { batchId: batch.id },
        { where: { shipmentNumber } }
      );

      if (updated > 0) {
        console.log(
          `✅ ${shipmentNumber} → Asignado a lote ${batchNumber} (ID ${batch.id})`
        );
      } else {
        console.warn(`⚠️ ${shipmentNumber} → No se pudo actualizar en DB`);
      }
    }

    console.log("🎯 Reconciliación finalizada.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

run();

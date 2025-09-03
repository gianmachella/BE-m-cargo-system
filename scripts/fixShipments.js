// scripts/fixShipments.js
const fs = require("fs");
const path = require("path");
const { sequelize } = require("../config/db");
const Batch = require("../models/Batch");
const Shipment = require("../models/Shipment");

const fixShipments = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Contar cuántos Shipments no tienen batchId antes
    const [results] = await sequelize.query(
      "SELECT COUNT(*) AS sinLote FROM Shipments WHERE batchId IS NULL"
    );
    console.log("📊 Shipments sin lote (antes):", results[0].sinLote);

    // Leer el archivo lots.json
    const filePath = path.join(
      __dirname,
      "../migration/firestore-backup/lots.json"
    );
    const rawData = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(rawData);

    // Convertir el objeto en un array de lotes
    const lots = Object.values(parsed);

    for (const lot of lots) {
      const batchNumber = lot.number || lot.lotNumber;
      const shipments = lot.shippings || lot.shipments;

      if (!batchNumber) {
        console.warn("⚠️ Lote sin batchNumber encontrado, se salta:", lot);
        continue;
      }

      const batch = await Batch.findOne({ where: { batchNumber } });
      if (!batch) {
        console.warn(
          `⚠️ No se encontró Batch con número ${batchNumber}, se salta`
        );
        continue;
      }

      if (shipments && Array.isArray(shipments)) {
        for (const shipmentNumber of shipments) {
          const [updated] = await Shipment.update(
            { batchId: batch.id },
            { where: { shipmentNumber } }
          );

          if (updated > 0) {
            console.log(
              `📦 Shipment ${shipmentNumber} asignado al lote ${batchNumber} (ID ${batch.id})`
            );
          } else {
            console.warn(
              `⚠️ Shipment ${shipmentNumber} no encontrado en DB, no se pudo asignar`
            );
          }
        }
      } else {
        console.warn(`⚠️ Lote ${batchNumber} no tiene shipments válidos`);
      }
    }

    // Contar cuántos Shipments siguen sin batchId al final
    const [resultsAfter] = await sequelize.query(
      "SELECT COUNT(*) AS sinLote FROM Shipments WHERE batchId IS NULL"
    );
    console.log("📊 Shipments sin lote (después):", resultsAfter[0].sinLote);

    console.log("✅ Reconciliación completada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la reconciliación:", error);
    process.exit(1);
  }
};

fixShipments();

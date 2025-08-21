// scripts/migrateBatches.js
const fs = require("fs");
const path = require("path");
const Batch = require("../models/Batch");
const Shipment = require("../models/Shipment");
const { sequelize, connectDB } = require("../config/db");

function parseDateLog(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const [month, day, year] = parts;
  const parsed = new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  );

  return isNaN(parsed.getTime()) ? null : parsed;
}

// 🔹 Mapear tipo de envío
function mapShipmentType(type) {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t === "m") return "Marítimo";
  if (t === "a") return "Aéreo";
  if (t === "t") return "Terrestre";
  return type; // fallback si viene algo inesperado
}

(async () => {
  try {
    await connectDB();

    // 🔹 Limpiar tabla antes de migrar
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await sequelize.query("DELETE FROM Batches;");
    await sequelize.query("ALTER TABLE Batches AUTO_INCREMENT = 1;");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("🧹 Tabla Batches limpiada y AUTO_INCREMENT reiniciado");

    // 🔹 Leer archivo JSON
    const filePath = path.join(__dirname, "firestore-backup", "lots.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    let batchesArray = Array.isArray(data)
      ? data
      : Object.keys(data).map((key) => ({ firebaseId: key, ...data[key] }));

    // 🔹 Ordenar por dateLog si existe
    batchesArray = batchesArray.sort((a, b) => {
      const dateA = parseDateLog(a.dateLog);
      const dateB = parseDateLog(b.dateLog);
      if (dateA && dateB) return dateA - dateB;
      if (dateA) return -1;
      if (dateB) return 1;
      return 0;
    });

    let totalBatches = 0;
    let duplicated = [];

    for (const b of batchesArray) {
      let status = "pending"; // por defecto
      let foundAny = false;
      let assignedCount = 0;
      let notFound = [];

      // 🔹 Buscar envíos asociados
      if (Array.isArray(b.shippings) && b.shippings.length > 0) {
        for (const s of b.shippings) {
          const shipment = await Shipment.findOne({
            where: { shipmentNumber: s },
          });

          if (shipment) {
            if (!foundAny) {
              status = shipment.status;
              foundAny = true;
            }
            assignedCount++;
          } else {
            notFound.push(s);
          }
        }
      }

      // 🔹 Normalizar batchNumber
      const batchNumber =
        b.number || b.lotNumber || `NO-NUMBER-${b.firebaseId}`;

      // 🔹 Evitar duplicados
      const existing = await Batch.findOne({ where: { batchNumber } });
      if (existing) {
        duplicated.push(batchNumber);
        continue;
      }

      // 🔹 Parsear createdAt desde dateLog
      const createdAt = parseDateLog(b.dateLog) || new Date();

      // 🔹 Crear y guardar referencia
      const newBatch = await Batch.create({
        batchNumber,
        destinationCountry: b.destination || "",
        shipmentType: mapShipmentType(b.type),
        status,
        shipmentDate: "",
        createdBy: null,
        updatedBy: null,
        createdAt,
        updatedAt: createdAt,
      });

      // 🔹 Vincular envíos al lote
      if (Array.isArray(b.shippings)) {
        for (const s of b.shippings) {
          const shipment = await Shipment.findOne({
            where: { shipmentNumber: s },
          });
          if (shipment) {
            shipment.batchId = newBatch.id;
            await shipment.save();
          }
        }
      }

      console.log(
        `📦 Lote ${batchNumber} creado con tipo "${mapShipmentType(
          b.type
        )}" y status "${status}". Envíos asignados: ${assignedCount}, no encontrados: ${
          notFound.length
        }`
      );
      if (notFound.length) {
        console.log(`   ❌ No encontrados: ${notFound.join(", ")}`);
      }

      totalBatches++;
    }

    console.log(
      `✅ Migración de lotes completada. Total insertados: ${totalBatches}`
    );
    if (duplicated.length) {
      console.log(`⚠️ Lotes duplicados ignorados: ${duplicated.join(", ")}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error migrando lotes:", err);
    process.exit(1);
  }
})();

const fs = require("fs");
const path = require("path");

const Batch = require("../models/Batch");
const { sequelize } = require("../config/db");

const lotes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "lots.json"), "utf-8")
);

function traducirPais(code) {
  const mapa = { col: "Colombia", ve: "Venezuela" };
  return mapa[code?.toLowerCase()] || "Desconocido";
}

function traducirTipo(t) {
  const mapa = { a: "Aéreo", m: "Marítimo" };
  return mapa[t?.toLowerCase()] || "Otro";
}

async function importarLotes() {
  for (const lote of lotes) {
    try {
      const batchNumber = lote.number || `BATCH-${Date.now()}`;
      const destinationCountry = traducirPais(lote.destination);
      const shipmentType = traducirTipo(lote.type);
      const shipments = lote.shippings || [];

      const newBatch = await Batch.create({
        batchNumber,
        destinationCountry,
        status: "Pendiente",
        shipmentType,
        shipmentDate: null,
        shipments,
        createdBy: 1,
        updatedBy: 1,
      });

      console.log(`✅ Lote ${batchNumber} guardado con ID ${newBatch.id}`);
    } catch (error) {
      console.error(`❌ Error con lote ${lote.number}:`, error.message);
    }
  }

  console.log("✅ Importación de lotes finalizada.");
}

importarLotes();

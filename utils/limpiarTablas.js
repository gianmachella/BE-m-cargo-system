const { sequelize } = require("../config/db");
const Shipment = require("../models/Shipment");
const Batch = require("../models/Batch");

async function limpiarTablas() {
  try {
    await sequelize.authenticate();

    await Shipment.destroy({ where: {}, truncate: true });
    console.log("🧹 Tabla Shipments limpiada.");

    await Batch.destroy({ where: {}, truncate: true });
    console.log("🧹 Tabla Batches limpiada.");

    await sequelize.close();
    console.log("✅ Limpieza completada y conexión cerrada.");
  } catch (error) {
    console.error("❌ Error al limpiar tablas:", error.message);
  }
}

limpiarTablas();

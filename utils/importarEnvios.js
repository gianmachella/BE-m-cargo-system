const fs = require("fs");
const path = require("path");

const Shipment = require("../models/Shipment");
const Client = require("../models/Client");
const Receiver = require("../models/Receiver");
const { sequelize } = require("../config/db");

const envios = JSON.parse(
  fs.readFileSync(path.join(__dirname, "shipping.json"), "utf-8")
);

// Mapeo de estados
const statusMap = {
  1: "Recibido en almacén",
  2: "En tránsito terrestre",
  3: "En tránsito marítimo/aéreo",
  4: "En aduana",
  5: "En tránsito a destino",
  6: "Entregado",
};

function convertirFecha(firebaseTimestamp) {
  if (!firebaseTimestamp || !firebaseTimestamp._seconds) return null;
  return new Date(firebaseTimestamp._seconds * 1000);
}

async function importarEnvios() {
  for (const envio of envios) {
    const transaction = await sequelize.transaction();

    try {
      const shipmentNumber = envio.number || `S-${Date.now()}`;
      const shipmentDate = convertirFecha(envio.date);
      const boxes = envio.boxList || [];

      const emailCliente = envio.email?.trim().toLowerCase();

      // Buscar cliente por email
      const cliente = await Client.findOne({ where: { email: emailCliente } });

      if (!cliente) {
        console.warn(
          `⚠️ Cliente con email ${emailCliente} no encontrado. Envío ${shipmentNumber} omitido.`
        );
        await transaction.rollback();
        continue;
      }

      // Buscar receptor asociado (asumiendo solo 1)
      const receptor = await Receiver.findOne({
        where: { clientId: cliente.id },
      });

      if (!receptor) {
        console.warn(
          `⚠️ Receptor de cliente ${cliente.id} no encontrado. Envío ${shipmentNumber} omitido.`
        );
        await transaction.rollback();
        continue;
      }

      const statusTexto = statusMap[envio.status?.toString()] || "Pendiente";

      const newShipment = await Shipment.create(
        {
          shipmentNumber,
          batchId: null, // puedes asociarlo luego si haces match por lote
          clientId: cliente.id,
          receiverId: receptor.id,
          boxes,
          totalWeight: 0,
          totalVolume: 0,
          totalBoxes: boxes.length,
          status: statusTexto,
          insurance: envio.insurance || "No",
          insuranceValue: envio.insuranceValue || "0",
          paymentMethod: envio.paymentMethod || "Efectivo",
          declaredValue: 0,
          valuePaid: 0,
          shipmentDate,
          createdBy: 1,
          updatedBy: 1,
        },
        { transaction }
      );

      await transaction.commit();
      console.log(
        `✅ Envío ${shipmentNumber} guardado con ID ${newShipment.id}`
      );
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error con envío ${envio.number}:`, error.message);
    }
  }

  console.log("✅ Importación de envíos finalizada.");
}

importarEnvios();

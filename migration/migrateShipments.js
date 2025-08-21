// scripts/migrateShipments.js
const fs = require("fs");
const path = require("path");
const Shipment = require("../models/Shipment");
const Receiver = require("../models/Receiver");
const Client = require("../models/Client");
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

function parseFirestoreDate(dateObj) {
  if (!dateObj || typeof dateObj._seconds !== "number") return null;
  return new Date(dateObj._seconds * 1000);
}

// 🔹 Buscar cliente primero y luego receptor
async function findClientAndReceiver(s) {
  let client = null;

  // buscar cliente por email
  if (s.email) {
    client = await Client.findOne({ where: { email: s.email } });
  }

  // si no, por teléfono
  if (!client && s.phone) {
    client = await Client.findOne({ where: { phone: s.phone } });
  }

  // si lo encontré, validar nombre (sendBy)
  if (client && s.sendBy) {
    if (
      client.firstName?.toLowerCase().includes(s.sendBy.toLowerCase()) ||
      client.lastName?.toLowerCase().includes(s.sendBy.toLowerCase())
    ) {
      // ok
    } else {
      console.log(
        `⚠️ Cliente encontrado pero nombre no machéa: shipment=${s.number}, sendBy=${s.sendBy}, client=${client.firstName} ${client.lastName}`
      );
    }
  }

  // buscar receptor de ese cliente
  let receiver = null;
  if (client && s.sendTo && s.sendTo.trim()) {
    receiver = await Receiver.findOne({
      where: {
        clientId: client.id,
        firstName: s.sendTo.trim(),
      },
    });
  }

  // si no hay receptor, genérico
  if (!receiver) {
    receiver = await Receiver.findOrCreate({
      where: { email: "generic@receiver.com" },
      defaults: {
        clientId: client ? client.id : 1, // si hay cliente lo usamos, si no clientId genérico
        firstName: "GENERIC",
        lastName: "RECEIVER",
        phone: "0000000000",
        email: "generic@receiver.com",
        address: "N/A",
        city: "N/A",
        state: "N/A",
        country: "N/A",
      },
    }).then(([rec]) => rec);
  }

  return { client, receiver };
}

(async () => {
  try {
    await connectDB();

    // 🔹 Limpiar tabla antes de migrar
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await sequelize.query("DELETE FROM Shipments;");
    await sequelize.query("ALTER TABLE Shipments AUTO_INCREMENT = 1;");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("🧹 Tabla Shipments limpiada y AUTO_INCREMENT reiniciado");

    // 🔹 Leer archivo JSON
    const filePath = path.join(__dirname, "firestore-backup", "shipping.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const shipmentsArray = Array.isArray(data)
      ? data
      : Object.keys(data).map((key) => ({ firebaseId: key, ...data[key] }));

    let totalShipments = 0;
    let duplicated = [];

    for (const s of shipmentsArray) {
      // 🔹 Normalizar shipmentNumber
      const shipmentNumber = s.number?.trim() || `NO-NUMBER-${s.firebaseId}`;

      // 🔹 Evitar duplicados
      const existing = await Shipment.findOne({ where: { shipmentNumber } });
      if (existing) {
        duplicated.push(shipmentNumber);
        continue;
      }

      // 🔹 Parsear fechas
      const createdAt =
        parseDateLog(s.dateLog) || parseFirestoreDate(s.date) || new Date();

      // 🔹 Calcular totales
      const boxes = Array.isArray(s.boxList) ? s.boxList : [];
      const totalBoxes = boxes.length;
      const totalWeight = boxes.reduce(
        (sum, b) => sum + (parseFloat(b.boxWeight) || 0),
        0
      );
      const totalVolume = 0;

      // 🔹 Buscar cliente y receptor
      const { client, receiver } = await findClientAndReceiver(s);

      // 🔹 Crear envío
      await Shipment.create({
        shipmentNumber,
        clientId: client ? client.id : null,
        batchId: null, // mapear después con lot si hace falta
        receiverId: receiver.id,
        boxes, // 👈 aquí van directas, como en tu JSON
        totalWeight,
        totalVolume,
        totalBoxes,
        status: s.status || "pending",
        insurance: s.insurance || "N/A",
        insuranceValue: s.insuranceValue || "0",
        paymentMethod: s.paymentMethod || "N/A",
        declaredValue: s.declaredValue || 0,
        valuePaid: s.valuePaid || 0,
        createdBy: null,
        updatedBy: null,
        createdAt,
        updatedAt: createdAt,
      });

      console.log(
        `📦 Envío ${shipmentNumber} creado (clientId=${
          client ? client.id : "❌"
        }, receiverId=${receiver.id}) con ${totalBoxes} cajas`
      );

      totalShipments++;
    }

    console.log(
      `✅ Migración de envíos completada. Total insertados: ${totalShipments}`
    );
    if (duplicated.length) {
      console.log(`⚠️ Envíos duplicados ignorados: ${duplicated.join(", ")}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error migrando envíos:", err);
    process.exit(1);
  }
})();

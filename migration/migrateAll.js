const fs = require("fs");
const { sequelize, connectDB } = require("../config/db");

// Models
const Client = require("../models/Client");
const Receiver = require("../models/Receiver");
const Batch = require("../models/Batch");
const Shipment = require("../models/Shipment");

(async () => {
  try {
    await connectDB();

    console.log("🧹 Limpiando tablas en orden...");

    // 1. Primero Shipments
    await Shipment.destroy({ where: {} });
    // 2. Después Batches
    await Batch.destroy({ where: {} });
    // 3. Después Receivers
    await Receiver.destroy({ where: {} });
    // 4. Último Clients
    await Client.destroy({ where: {} });

    console.log("✅ Tablas limpiadas correctamente");

    // ===========================
    // MIGRACIÓN DE CLIENTS
    // ===========================
    const clientsData = JSON.parse(
      fs.readFileSync(__dirname + "/firestore-backup/costumer.json", "utf8")
    );

    const clients = clientsData.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || null,
      phone: c.phone || null,
      createdAt: new Date(c.createdAt._seconds * 1000),
      updatedAt: new Date(c.updatedAt._seconds * 1000),
    }));

    await Client.bulkCreate(clients);
    console.log(`✅ Insertados ${clients.length} clientes`);

    // ===========================
    // MIGRACIÓN DE RECEIVERS
    // ===========================
    const receiversData = JSON.parse(
      fs.readFileSync(__dirname + "/firestore-backup/receiver.json", "utf8")
    );

    const receivers = receiversData.map((r) => ({
      id: r.id,
      clientId: r.clientId,
      name: r.name,
      email: r.email || null,
      phone: r.phone || null,
      createdAt: new Date(r.createdAt._seconds * 1000),
      updatedAt: new Date(r.updatedAt._seconds * 1000),
    }));

    await Receiver.bulkCreate(receivers);
    console.log(`✅ Insertados ${receivers.length} receivers`);

    // ===========================
    // MIGRACIÓN DE BATCHES
    // ===========================
    const batchesData = JSON.parse(
      fs.readFileSync(__dirname + "/firestore-backup/batch.json", "utf8")
    );

    const batches = batchesData.map((b) => ({
      id: b.id,
      clientId: b.clientId,
      receiverId: b.receiverId,
      code: b.code,
      createdAt: new Date(b.createdAt._seconds * 1000),
      updatedAt: new Date(b.updatedAt._seconds * 1000),
    }));

    await Batch.bulkCreate(batches);
    console.log(`✅ Insertados ${batches.length} batches`);

    // ===========================
    // MIGRACIÓN DE SHIPMENTS
    // ===========================
    const shipmentsData = JSON.parse(
      fs.readFileSync(__dirname + "/firestore-backup/shipment.json", "utf8")
    );

    const shipments = shipmentsData.map((s) => ({
      id: s.id,
      batchId: s.batchId,
      clientId: s.clientId,
      receiverId: s.receiverId,
      status: s.status,
      createdAt: new Date(s.createdAt._seconds * 1000),
      updatedAt: new Date(s.updatedAt._seconds * 1000),
    }));

    await Shipment.bulkCreate(shipments);
    console.log(`✅ Insertados ${shipments.length} shipments`);

    console.log("🎉 Migración completa sin errores");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en la migración:", err);
    process.exit(1);
  }
})();

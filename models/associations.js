const Client = require("./Client");
const Shipment = require("./Shipment");
const Batch = require("./Batch");
const Receiver = require("./Receiver");

Client.hasMany(Shipment, {
  as: "shipments",
  foreignKey: "clientId",
  onDelete: "CASCADE",
});
Shipment.belongsTo(Client, {
  as: "client",
  foreignKey: "clientId",
  onDelete: "CASCADE",
});

Shipment.belongsTo(Receiver, {
  as: "receiver",
  foreignKey: "receiverId",
  onDelete: "CASCADE",
});

Client.hasMany(Receiver, {
  as: "receivers",
  foreignKey: "clientId",
  onDelete: "CASCADE",
});

Batch.hasMany(Shipment, {
  as: "batchShipments",
  foreignKey: "batchId",
  onDelete: "CASCADE",
});
Shipment.belongsTo(Batch, {
  as: "batch",
  foreignKey: "batchId",
  onDelete: "CASCADE",
});

module.exports = { Client, Shipment, Batch, Receiver };

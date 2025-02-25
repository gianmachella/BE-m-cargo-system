const Client = require("./Client");
const Shipment = require("./Shipment");

// Definir las relaciones
Client.hasMany(Shipment, { as: "shipments", foreignKey: "clientId" });
Shipment.belongsTo(Client, { as: "client", foreignKey: "clientId" });

module.exports = { Client, Shipment };

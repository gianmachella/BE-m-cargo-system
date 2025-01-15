const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Shipment = sequelize.define("Shipment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  shipmentNumber: { type: DataTypes.STRING, allowNull: false },
  clientId: { type: DataTypes.INTEGER, allowNull: true },
  batchId: { type: DataTypes.INTEGER, allowNull: true },
  receiverId: { type: DataTypes.INTEGER, allowNull: false },
  boxes: { type: DataTypes.JSON, allowNull: false },
  totalWeight: { type: DataTypes.FLOAT, allowNull: false },
  totalVolume: { type: DataTypes.FLOAT, allowNull: false },
  totalBoxes: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Shipment;

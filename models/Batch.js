const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Batch = sequelize.define("Batch", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  batchNumber: { type: DataTypes.STRING, allowNull: false },
  destinationCountry: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  shipmentType: { type: DataTypes.STRING, allowNull: false },
  shipmentDate: { type: DataTypes.STRING, allowNull: true },
  shipments: { type: DataTypes.JSON, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Batch;

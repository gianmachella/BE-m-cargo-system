const { sequelize } = require("../config/db");

async function truncateTable(tableName) {
  try {
    await sequelize.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    await sequelize.query(`TRUNCATE TABLE \`${tableName}\`;`);
    await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    console.log(`🧹 Tabla ${tableName} limpiada`);
  } catch (error) {
    console.error(`❌ Error limpiando ${tableName}:`, error);
    throw error;
  }
}

module.exports = truncateTable;

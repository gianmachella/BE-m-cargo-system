const fs = require("fs");
const path = require("path");

const Client = require("../models/Client");
const Receiver = require("../models/Receiver");
const { sequelize } = require("../config/db");

const clientes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "costumer.json"), "utf-8")
);

async function importarDatos() {
  for (const cliente of clientes) {
    const transaction = await sequelize.transaction();

    try {
      const newClient = await Client.create(
        {
          firstName: cliente.name || "SIN_NOMBRE",
          lastName: cliente.lastName || "SIN_APELLIDO",
          phone: cliente.phone || "0000000000",
          email: cliente.email || "sinemail@example.com",
        },
        { transaction }
      );

      if (cliente.recipients && cliente.recipients.length > 0) {
        const receptores = cliente.recipients.map((r) => ({
          firstName: r.name || "SIN_NOMBRE",
          lastName: r.lastName || "SIN_APELLIDO",
          phone: r.phone || "0000000000",
          address: r.address || "SIN_DIRECCION",
          city: "SIN_CIUDAD",
          state: "SIN_ESTADO",
          country: "Colombia",
          clientId: newClient.id,
        }));

        await Receiver.bulkCreate(receptores, { transaction });
      }

      await transaction.commit();
      console.log(`✅ Cliente ${cliente.name} importado con éxito`);
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error con cliente ${cliente.name}:`, error.message);
    }
  }

  console.log("✅ Importación finalizada.");
}

importarDatos();

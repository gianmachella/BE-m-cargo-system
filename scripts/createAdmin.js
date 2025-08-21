// scripts/createUsers.js
const bcrypt = require("bcrypt");
const { sequelize } = require("../models");
const User = require("../models/User");

(async () => {
  try {
    const users = [
      {
        firstName: "Ruben",
        lastName: "Soto",
        userName: "rsoto",
        email: "rsoto@globalcargous.com",
        password: "GC2020utah..",
        company: "global-cargo",
      },
      {
        firstName: "Rossana",
        lastName: "Hernandez",
        userName: "rhernandez",
        email: "rhernandez@globalcargous.com",
        password: "Hernandez2020!!",
        company: "global-cargo",
      },
      {
        firstName: "Anny",
        lastName: "Castilla",
        userName: "acastilla",
        email: "acastilla@globalcargous.com",
        password: "Castilla2025..",
        company: "global-cargo",
      },
    ];

    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);

      const newUser = await User.create({
        firstName: u.firstName,
        lastName: u.lastName,
        userName: u.userName,
        email: u.email,
        password: hashedPassword,
        company: u.company,
        createdBy: 0,
        updatedBy: 0,
      });

      console.log(`✅ Usuario creado: ${u.email}`);
    }
  } catch (error) {
    console.error("❌ Error creando usuarios:", error);
  } finally {
    await sequelize.close();
  }
})();

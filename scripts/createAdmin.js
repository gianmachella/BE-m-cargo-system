const bcrypt = require("bcrypt");
const { sequelize } = require("../models");
const User = require("../models/User");

(async () => {
  try {
    const hashedPassword = await bcrypt.hash("Dev2020!!", 10);

    const admin = await User.create({
      firstName: "Admin",
      lastName: "System",
      userName: "admin",
      email: "admin@globalcontrol-system.com",
      password: hashedPassword,
      company: "global-cargo",
      createdBy: 0,
      updatedBy: 0,
    });

    console.log("✅ Admin creado:", admin.toJSON());
  } catch (error) {
    console.error("❌ Error creando admin:", error);
  } finally {
    await sequelize.close(); // 👈 ahora sí definido
  }
})();

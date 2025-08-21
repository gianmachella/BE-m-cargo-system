const fs = require("fs");
const admin = require("firebase-admin");

// 👇 Cambia el nombre si tu JSON de credenciales tiene otro
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportFirestore() {
  const collections = await db.listCollections();
  console.log(`Encontradas ${collections.length} colecciones 🚀`);

  for (const col of collections) {
    console.log(`📂 Exportando colección: ${col.id}`);
    const snapshot = await col.get();
    const data = {};

    snapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });

    // Guardar como JSON
    fs.writeFileSync(
      `./firestore-backup/${col.id}.json`,
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Guardado en firestore-backup/${col.id}.json`);
  }

  console.log("🎉 Exportación completada");
}

exportFirestore().catch((err) => console.error("❌ Error:", err));

require('dotenv').config(); // ← DOIT être en tout premier

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion :", err);
  } else {
    console.log("✅ Connexion à la base de données réussie !");
  }
});

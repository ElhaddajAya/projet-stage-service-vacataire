const mysql = require('mysql2');
const dotenv = require('dotenv');

// Charge le fichier .env
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // vide si pas de mot de passe
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err.message);
    return;
  }
  console.log("✅ Connecté à la base de données MySQL");
});

module.exports = db;

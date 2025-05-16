const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

// Connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // vide si pas de mot de passe
  database: process.env.DB_NAME || 'service_vacation',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('✅ Connecté à la base de données MySQL');
  }
});

// Route d'accueil pour vérifier le fonctionnement
app.get('/', (req, res) => {
  res.send('Backend opérationnel 🚀');
});

// Exemple de récupération de vacataires (simple)
app.get('/vacataires', (req, res) => {
  const query = 'SELECT * FROM vacataire';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Erreur lors de la récupération des vacataires');
    } else {
      res.json(results);
    }
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

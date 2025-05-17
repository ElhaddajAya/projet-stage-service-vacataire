const express = require('express');
const db = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend opérationnel 🚀');
});

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

const PORT = process.env.PORT || 5000;
// Démarre le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

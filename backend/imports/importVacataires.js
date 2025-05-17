const xlsx = require('xlsx');
const mysql = require('mysql2');

// Connexion à la base de données depuis le fichier db.js
const db = require('../config/db');
const dotenv = require('dotenv');
// Charge le fichier .env
dotenv.config();

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('✅ Connecté à la base de données MySQL');
});

// Lire le fichier Excel
const workbook = xlsx.readFile('../../vacataires.xlsx');  
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Fonction d'insertion
const insertVacataire = (nom, filiere, semestre, semaines, heures, matiere) => {
  const query = `
    INSERT INTO vacataire (Nom)
    VALUES (?) 
    ON DUPLICATE KEY UPDATE Nom = Nom;
  `;
  db.query(query, [nom], (err, result) => {
    if (err) {
      console.error(`Erreur d'insertion du vacataire ${nom}:`, err);
      return;
    }

    const vacataireId = result.insertId || result[0]?.ID_vacat;

    const queryEnseigner = `
      INSERT INTO enseigner (ID_vacat, ID_fil, Semestre, Nbr_semaines, Nbr_heurs)
      VALUES (?, ?, ?, ?, ?);
    `;
    db.query(queryEnseigner, [vacataireId, filiere, semestre, semaines, heures], (err) => {
      if (err) {
        console.error(`Erreur lors de l'ajout des informations d'enseignement pour ${nom}:`, err);
      } else {
        console.log(`✅ Vacataire ${nom} enregistré avec succès.`);
      }
    });
  });
};

// Parcourir les données et les insérer dans la base de données
data.forEach((row) => {
  const { Nom, filiere, semestre, nbr_semaines, nbr_heures, Matiere } = row;
  insertVacataire(Nom, filiere, semestre, nbr_semaines, nbr_heures, Matiere);
});

// Fermer la connexion après l'importation
db.end(() => {
  console.log('🔗 Connexion fermée.');
});

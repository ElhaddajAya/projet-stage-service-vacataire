const xlsx = require('xlsx');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement à partir de .env
// Important: spécifier le chemin complet au fichier .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Créer une nouvelle connexion à la base de données
const mysql = require('mysql2');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Se connecter à la base de données
db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err.message);
    process.exit(1);
  }
  console.log("✅ Connecté à la base de données MySQL");
});

// Vérifier que les variables d'environnement sont correctement chargées
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_USER: ${process.env.DB_USER !== undefined ? "Défini" : "Non défini"}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD !== undefined ? "Défini" : "Non défini"}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);

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
    
    console.log(`✅ Vacataire ${nom} enregistré avec succès.`);

    // Obtenir l'ID du vacataire inséré ou existant
    let vacataireId;
    if (result.insertId) {
      vacataireId = result.insertId;
      insertEnseignement(vacataireId, filiere, semestre, semaines, heures);
    } else {
      // Si le vacataire existe déjà, récupérer son ID
      const getIdQuery = "SELECT ID_vacat FROM vacataire WHERE Nom = ?";
      db.query(getIdQuery, [nom], (err, results) => {
        if (err || results.length === 0) {
          console.error(`Erreur lors de la récupération de l'ID pour ${nom}:`, err || "Aucun résultat");
          return;
        }
        
        vacataireId = results[0].ID_vacat;
        insertEnseignement(vacataireId, filiere, semestre, semaines, heures);
      });
    }
  });
};

// Fonction pour insérer les informations d'enseignement
const insertEnseignement = (vacataireId, filiere, semestre, semaines, heures) => {
  // Vérifier que toutes les valeurs sont définies
  if (!vacataireId || !filiere || !semestre || !semaines || !heures) {
    console.error(`Données d'enseignement incomplètes: ID:${vacataireId}, Filière:${filiere}, Semestre:${semestre}, Semaines:${semaines}, Heures:${heures}`);
    return;
  }

  const queryEnseigner = `
    INSERT INTO enseigner (ID_vacat, ID_fil, Semestre, Nbr_semaines, Nbr_heurs)
    VALUES (?, ?, ?, ?, ?);
  `;
  
  db.query(queryEnseigner, [vacataireId, filiere, semestre, semaines, heures], (err) => {
    if (err) {
      console.error(`Erreur lors de l'ajout des informations d'enseignement pour ID ${vacataireId}:`, err);
    } else {
      console.log(`✅ Enseignement enregistré avec succès pour vacataire ID ${vacataireId}.`);
    }
  });
};

// Parcourir les données et les insérer dans la base de données
console.log(`Importation de ${data.length} vacataires...`);

let completedImports = 0;
data.forEach((row) => {
  const { Nom, filiere, semestre, nbr_semaines, nbr_heures, Matiere } = row;
  insertVacataire(Nom, filiere, semestre, nbr_semaines, nbr_heures, Matiere);
});

// Surveillez la fin de toutes les opérations asynchones avant de fermer
process.on('beforeExit', () => {
  console.log('Importation terminée.');
  db.end(() => {
    console.log('🔗 Connexion fermée.');
  });
});

console.log('Traitement d\'importation en cours...');
const xlsx = require('xlsx');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mysql = require('mysql2');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err.message);
    process.exit(1);
  }
  console.log("✅ Connecté à la base de données MySQL");
});

// Lire le fichier Excel
const workbook = xlsx.readFile('../../vacataires.xlsx');  
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Récupérer l'ID de la filière à partir de son nom
const getFiliereId = (filiereNom, callback) => {
  const query = "SELECT ID_fil FROM filiere WHERE Nom_fil = ?";
  db.query(query, [filiereNom], (err, results) => {
    if (err) {
      console.error(`❌ Erreur lors de la récupération de l'ID pour la filière ${filiereNom}:`, err);
      callback(null);
      return;
    }

    if (results.length === 0) {
      console.error(`⚠️ Aucune filière trouvée avec le nom "${filiereNom}"`);
      callback(null);
      return;
    }

    callback(results[0].ID_fil);
  });
};

// Vérifier si le vacataire existe déjà dans la base de données
const checkVacataireExists = (nom, callback) => {
  const query = "SELECT ID_vacat FROM vacataire WHERE Nom = ?";
  db.query(query, [nom], (err, results) => {
    if (err) {
      console.error(`❌ Erreur lors de la vérification du vacataire ${nom}:`, err);
      callback(null);
      return;
    }

    if (results.length > 0) {
      callback(results[0].ID_vacat); // Retourner l'ID du vacataire existant
    } else {
      callback(null); // Le vacataire n'existe pas
    }
  });
};

// Vérifier si une entrée existe déjà dans la table enseigner pour ce vacataire et cette filière
const checkEnseignerExists = (vacataireId, filiereId, callback) => {
  const query = "SELECT * FROM enseigner WHERE ID_vacat = ? AND ID_fil = ?";
  db.query(query, [vacataireId, filiereId], (err, results) => {
    if (err) {
      console.error(`❌ Erreur lors de la vérification de l'entrée dans enseigner pour vacataire ${vacataireId} et filière ${filiereId}:`, err);
      callback(false);
      return;
    }

    callback(results.length > 0); // Retourne true si l'entrée existe, false sinon
  });
};

// Fonction d'insertion des informations d'enseignement (Table enseigner)
const insertEnseignement = (vacataireId, filiereId, semestre, semaines, heures, matiere) => {
  // Vérifier et nettoyer les valeurs
  semaines = semaines || 0;  // Valeur par défaut si null ou undefined
  heures = heures || 0;      // Valeur par défaut si null ou undefined
  matiere = matiere || "Inconnue";  // Valeur par défaut pour la matière
  semestre = semestre || "Inconnu"; // Valeur par défaut pour le semestre

  console.log(`📝 Données enseignement :`, { vacataireId, filiereId, semestre, semaines, heures, matiere });

  const queryEnseigner = `
    INSERT INTO enseigner (ID_vacat, ID_fil, Semestre, Nbr_semaines, Nbr_heurs, Matiere)
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  
  db.query(queryEnseigner, [vacataireId, filiereId, semestre, semaines, heures, matiere], (err) => {
    if (err) {
      console.error(`❌ Erreur lors de l'ajout des informations d'enseignement pour vacataire ID ${vacataireId} et filière ID ${filiereId}:`, err);
    } else {
      console.log(`✅ Enseignement enregistré avec succès pour vacataire ID ${vacataireId} dans filière ID ${filiereId}.`);
    }
  });
};

// Fonction d'insertion d'un nouveau vacataire
const insertNewVacataire = (nom, filiereNom, semestre, semaines, heures, matiere) => {
  const query = `
    INSERT INTO vacataire (Nom)
    VALUES (?)
  `;

  db.query(query, [nom], (err, result) => {
    if (err) {
      console.error(`❌ Erreur d'insertion du vacataire ${nom}:`, err);
      return;
    }

    const vacataireId = result.insertId;
    console.log(`✅ Nouveau vacataire inséré avec ID ${vacataireId}`);

    // Récupérer l'ID de la filière et insérer les informations d'enseignement
    getFiliereId(filiereNom, (filiereId) => {
      if (filiereId) {
        insertEnseignement(vacataireId, filiereId, semestre, semaines, heures, matiere);
      }
    });
  });
};

// Fonction principale pour traiter chaque ligne du fichier Excel !!!
const processVacataire = (nom, filiereNom, semestre, semaines, heures, matiere) => {
  // Étape 1 : Vérifier si le vacataire existe déjà
  checkVacataireExists(nom, (vacataireId) => {
    if (vacataireId) {
      // Le vacataire existe déjà
      console.log(`Vacataire ${nom} existe déjà avec ID ${vacataireId}`);

      // Étape 2 : Récupérer l'ID de la filière
      getFiliereId(filiereNom, (filiereId) => {
        if (!filiereId) return; // Sortir si la filière n'existe pas

        // Étape 3 : Vérifier si une entrée existe déjà pour cette combinaison vacataire-filière
        checkEnseignerExists(vacataireId, filiereId, (exists) => {
          if (exists) {
            console.log(`Entrée existante dans 'enseigner' pour vacataire ID ${vacataireId} et filière ID ${filiereId}. Aucune action effectuée.`);
          } else {
            // Insérer une nouvelle entrée dans enseigner pour la nouvelle filière
            console.log(`Nouvelle filière détectée pour vacataire ${nom}. Ajout dans 'enseigner'.`);
            insertEnseignement(vacataireId, filiereId, semestre, semaines, heures, matiere);
          }
        });
      });
    } else {
      // Le vacataire n'existe pas, insérer un nouveau vacataire
      console.log(`📝 Vacataire ${nom} n'existe pas. Création d'un nouveau vacataire.`);
      insertNewVacataire(nom, filiereNom, semestre, semaines, heures, matiere);
    }
  });
};

// Parcourir les données et les insérer
console.log(`Importation de ${data.length} vacataires...`);
data.forEach((row) => {
  const nom = row.Nom;
  const filiere = row.filiere;
  const semestre = row.semestre;
  const semaines = parseInt(row['nbr semaines'] || row['Nbr semaines'] || row['Nbr Semaines'] || row['nbr_semaines']) || 0;
  const heures = parseInt(row['nbr heures'] || row['Nbr heures'] || row['Nbr Heures'] || row['nbr_heures']) || 0;
  const matiere = row.Matiere;

  console.log(`📝 Données nettoyées :`, { nom, filiere, semestre, semaines, heures, matiere });

  processVacataire(nom, filiere, semestre, semaines, heures, matiere);
});

// Fermer la connexion après les opérations
setTimeout(() => {
  db.end(() => {
    console.log('Connexion fermée.');
  });
}, 5000);
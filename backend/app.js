const express = require('express');
const db = require('./config/db');
const dotenv = require('dotenv');
const session = require('express-session');
const fs = require('fs').promises; // Use promises version of fs for async operations

dotenv.config();
const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

const cors = require('cors');
const multer = require('multer');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Important pour les cookies de session
}));

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Configuration session
app.use(session({
  secret: 'vacataires_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));


app.get('/', (req, res) => {
  res.send('Backend opérationnel 🚀');
});

// Route to fetch details of a specific vacataire
app.get('/vacataire-details/:id', (req, res) => {
  const vacataireId = req.params.id;

  const query = `
    SELECT ID_vacat, Nom, Prenom, Numero_tele AS Numero_tele, Email, CIN, Date_naiss, 
           Photo, CV, Attest_non_emploi AS Attestation, Diplome AS Departement, 
           Etat_dossier AS EtatDossier, Etat_virement AS EtatVirement
    FROM vacataire 
    WHERE ID_vacat = ?
  `;
  db.query(query, [vacataireId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des détails du vacataire:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Vacataire non trouvé' });
    }

    res.json(results[0]);
  });
});

// Route to update the Etat_dossier of a vacataire
app.put('/vacataire/:id/update-etat', (req, res) => {
  const vacataireId = req.params.id;
  const { Etat_dossier } = req.body;

  if (!Etat_dossier) {
    return res.status(400).json({ message: 'État du dossier est requis' });
  }

  const query = 'UPDATE vacataire SET Etat_dossier = ? WHERE ID_vacat = ?';
  db.query(query, [Etat_dossier, vacataireId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'état du dossier:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Vacataire non trouvé' });
    }

    res.json({ message: 'État du dossier mis à jour avec succès' });
  });
});

// Route pour récupérer tous les vacataires
app.get('/vacataires', (req, res) => {
  const query = 'SELECT * FROM vacataire';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Erreur lors de la récupération des vacataires');
    } else {
      // Transform results to set default Etat_dossier to 'En attente' if null
      const vacatairesWithDefault = results.map((vacataire) => ({
        ...vacataire,
        Etat_dossier: vacataire.Etat_dossier || 'En attente',
      }));
      res.json(vacatairesWithDefault);
    }
  });
});

// Route pour la connexion d'un vacataire
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
  }

  const query = 'SELECT ID_vacat, Nom FROM vacataire WHERE username = ? AND mdp = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Erreur de connexion:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    // Stocker l'ID du vacataire dans la session
    const vacataire = results[0];
    req.session.userId = vacataire.ID_vacat;
    req.session.nom = vacataire.Nom;
    
    res.json({ 
      message: 'Connexion réussie',
      user: { 
        id: vacataire.ID_vacat,
        nom: vacataire.Nom
      }
    });
  });
});

// Route pour vérifier si un utilisateur est connecté
app.get('/check-auth', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.session.userId,
        nom: req.session.nom
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Route pour mettre à jour les informations du vacataire connecté
app.put('/update-vacataire', (req, res) => {
  const vacataireId = req.session.userId;
  const { nom, prenom, email, telephone, cin, date_naiss } = req.body;

  if (!vacataireId) {
    return res.status(401).json({ message: 'Utilisateur non connecté' });
  }

  const query = `
    UPDATE vacataire 
    SET Nom = ?, Prenom = ?, Email = ?, Numero_tele = ?, CIN = ?, Date_naiss = ? 
    WHERE ID_vacat = ?;
  `;

  db.query(query, [nom, prenom, email, telephone, cin, date_naiss, vacataireId], (err, results) => {
    if (err) {
      console.error('❌ Erreur lors de la mise à jour des informations du vacataire:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    res.json({ message: 'Informations mises à jour avec succès' });
  });
});

// Route pour récupérer les informations du vacataire connecté
app.get('/vacataire-info', (req, res) => {
  const vacataireId = req.session.userId;

  if (!vacataireId) {
    return res.status(401).json({ message: 'Utilisateur non connecté' });
  }

  const query = 'SELECT * FROM vacataire WHERE ID_vacat = ?';
  db.query(query, [vacataireId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des informations du vacataire:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Vacataire non trouvé' });
    }

    res.json(results[0]); // Retourne les informations du vacataire
  });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Route to upload documents and update vacataire table
app.post('/upload-documents', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cin', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'autorisation', maxCount: 1 },
  { name: 'attestation', maxCount: 1 },
]), async (req, res) => {
  const vacataireId = req.session.userId;
  if (!vacataireId) {
    return res.status(401).json({ message: 'Utilisateur non connecté' });
  }

  const {
    photo,
    cin,
    cv,
    diplome,
    autorisation,
    attestation,
  } = req.files || {};
  const { isFonctionnaire } = req.body;

  // Fetch existing vacataire data to preserve unchanged fields and get old file paths
  const getQuery = 'SELECT * FROM vacataire WHERE ID_vacat = ?';
  db.query(getQuery, [vacataireId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données existantes:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Vacataire non trouvé' });
    }

    const existingData = results[0];

    // Prepare update fields, preserving existing values unless a new file is provided
    const updateFields = {
      ...existingData,
      Fonctionnaire: isFonctionnaire === 'true' ? 1 : 0,
    };

    // Only update Etat_dossier to 'En cours' if it is currently 'En attente'
    if (existingData.Etat_dossier === 'En attente') {
      updateFields.Etat_dossier = 'En cours';
    }

    // Track old file paths to delete
    const oldFilesToDelete = [];

    // Update fields with new files and queue old files for deletion
    if (photo) {
      updateFields.Photo = photo[0].path;
      if (existingData.Photo) oldFilesToDelete.push(existingData.Photo);
    }
    if (cin) {
      updateFields.CIN_fichier = cin[0].path;
      if (existingData.CIN_fichier) oldFilesToDelete.push(existingData.CIN_fichier);
    }
    if (cv) {
      updateFields.CV = cv[0].path;
      if (existingData.CV) oldFilesToDelete.push(existingData.CV);
    }
    if (diplome) {
      updateFields.Diplome = diplome[0].path;
      if (existingData.Diplome) oldFilesToDelete.push(existingData.Diplome);
    }
    if (isFonctionnaire === 'true' && autorisation) {
      updateFields.Autorisation_fichier = autorisation[0].path;
      if (existingData.Autorisation_fichier) oldFilesToDelete.push(existingData.Autorisation_fichier);
    }
    if (isFonctionnaire === 'false' && attestation) {
      updateFields.Attest_non_emploi = attestation[0].path;
      if (existingData.Attest_non_emploi) oldFilesToDelete.push(existingData.Attest_non_emploi);
    }

    // Remove ID_vacat from updateFields to avoid updating the primary key
    delete updateFields.ID_vacat;

    // Delete old files asynchronously
    const deleteOldFiles = async () => {
      for (const filePath of oldFilesToDelete) {
        try {
          await fs.unlink(filePath);
          console.log(`Deleted old file: ${filePath}`);
        } catch (deleteErr) {
          console.error(`Error deleting old file ${filePath}:`, deleteErr);
          // Continue even if deletion fails (non-critical error)
        }
      }
    };

    // Perform the database update
    const updateQuery = 'UPDATE vacataire SET ? WHERE ID_vacat = ?';
    db.query(updateQuery, [updateFields, vacataireId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la mise à jour des documents:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Vacataire non trouvé' });
      }

      // Delete old files after successful update
      deleteOldFiles().catch(console.error);

      res.json({ message: 'Documents téléchargés avec succès' });
    });
  });
});

// Route pour la déconnexion
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    res.json({ message: 'Déconnexion réussie' });
  });
});



const PORT = process.env.PORT || 5000;

// Démarre le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
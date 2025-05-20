const express = require('express');
const db = require('./config/db');
const dotenv = require('dotenv');
const session = require('express-session');
const fs = require('fs').promises;

dotenv.config();
const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const cors = require('cors');
const multer = require('multer');
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Configuration session
app.use(session({
  secret: 'vacataires_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 }
}));

app.get('/', (req, res) => res.send('Backend opérationnel 🚀'));

// Route to fetch details of a specific vacataire, including teaching information
app.get('/vacataire-details/:id', (req, res) => {
  const vacataireId = req.params.id;

  // Query to get vacataire details
  const vacataireQuery = `
    SELECT ID_vacat, Nom, Prenom, Numero_tele AS Numero_tele, Email, CIN, Date_naiss, 
           Photo, CV, Attest_non_emploi AS Attestation, Diplome AS Departement, 
           Etat_dossier AS EtatDossier, Etat_virement AS EtatVirement, Fonctionnaire,
           Autorisation_fichier, Attest_non_emploi
    FROM vacataire 
    WHERE ID_vacat = ?
  `;

  // Query to get teaching information with filiere name
  const enseignementQuery = `
    SELECT e.Matiere, e.Nbr_heurs AS Nombre_heures, e.Semestre, e.Nbr_semaines, f.Nom_fil AS Filiere
    FROM enseigner e
    JOIN filiere f ON e.ID_fil = f.ID_fil
    WHERE e.ID_vacat = ?
  `;

  // Execute vacataire query
  db.query(vacataireQuery, [vacataireId], (err, vacataireResults) => {
    if (err) {
      console.error('Erreur lors de la récupération des détails du vacataire:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (vacataireResults.length === 0) {
      return res.status(404).json({ message: 'Vacataire non trouvé' });
    }

    // Execute enseignement query
    db.query(enseignementQuery, [vacataireId], (err, enseignementResults) => {
      if (err) {
        console.error('Erreur lors de la récupération des informations d\'enseignement:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      // Combine results
      const responseData = {
        ...vacataireResults[0],
        Enseignements: enseignementResults
      };

      res.json(responseData);
    });
  });
});

// Route to update the Etat_dossier of a vacataire with Refus_reason
app.put('/vacataire/:id/update-etat', (req, res) => {
  const vacataireId = req.params.id;
  const { Etat_dossier, Refus_reason } = req.body;

  if (!Etat_dossier) return res.status(400).json({ message: 'État du dossier est requis' });

  const query = 'UPDATE vacataire SET Etat_dossier = ?, Refus_reason = ? WHERE ID_vacat = ?';
  db.query(query, [Etat_dossier, Refus_reason ? JSON.stringify(Refus_reason) : null, vacataireId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'état du dossier:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });
    res.json({ message: 'État du dossier mis à jour avec succès' });
  });
});

// Route to update the Etat_virement of a vacataire
app.put('/vacataire/:id/update-virement', (req, res) => {
  const vacataireId = req.params.id;
  const { Etat_virement } = req.body;
  if (!Etat_virement) return res.status(400).json({ message: 'État du virement est requis' });
  const query = 'UPDATE vacataire SET Etat_virement = ? WHERE ID_vacat = ?';
  db.query(query, [Etat_virement, vacataireId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });
    res.json({ message: 'État du virement mis à jour avec succès' });
  });
});

// Route to fetch all vacataires
app.get('/vacataires', (req, res) => {
  if (!req.session.userId || req.session.role !== 'admin') return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  const query = 'SELECT * FROM vacataire';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Erreur lors de la récupération des vacataires');
    const vacatairesWithDefault = results.map((vacataire) => ({
      ...vacataire,
      Etat_dossier: vacataire.Etat_dossier || 'En attente',
      Etat_virement: vacataire.Etat_virement || 'En attente',
    }));
    res.json(vacatairesWithDefault);
  });
});

// Route for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Identifiant et mot de passe requis' });

  const vacataireQuery = 'SELECT ID_vacat, Nom FROM vacataire WHERE username = ? AND mdp = ?';
  db.query(vacataireQuery, [username, password], (err, vacataireResults) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (vacataireResults.length > 0) {
      const vacataire = vacataireResults[0];
      req.session.userId = vacataire.ID_vacat;
      req.session.nom = vacataire.Nom;
      req.session.role = 'vacataire';
      return res.json({ message: 'Connexion réussie', user: { id: vacataire.ID_vacat, nom: vacataire.Nom, role: 'vacataire' } });
    }

    const adminQuery = 'SELECT ID_admin FROM admin WHERE username = ? AND mdp = ?';
    db.query(adminQuery, [username, password], (err, adminResults) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' });
      if (adminResults.length > 0) {
        const admin = adminResults[0];
        req.session.userId = admin.ID_admin;
        req.session.nom = admin.Nom;
        req.session.role = 'admin';
        return res.json({ message: 'Connexion réussie', user: { id: admin.ID_admin, nom: admin.Nom, role: 'admin' } });
      }
      return res.status(401).json({ message: 'Identifiants incorrects' });
    });
  });
});

// Route to check authentication
app.get('/check-auth', (req, res) => {
  if (req.session.userId) res.json({ authenticated: true, user: { id: req.session.userId, nom: req.session.nom } });
  else res.json({ authenticated: false });
});

// Route to update vacataire info
app.put('/update-vacataire', (req, res) => {
  const vacataireId = req.session.userId;
  const { nom, prenom, email, telephone, cin, date_naiss } = req.body;
  if (!vacataireId) return res.status(401).json({ message: 'Utilisateur non connecté' });
  const query = 'UPDATE vacataire SET Nom = ?, Prenom = ?, Email = ?, Numero_tele = ?, CIN = ?, Date_naiss = ? WHERE ID_vacat = ?';
  db.query(query, [nom, prenom, email, telephone, cin, date_naiss, vacataireId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json({ message: 'Informations mises à jour avec succès' });
  });
});

// Route to fetch vacataire info
app.get('/vacataire-info', (req, res) => {
  const vacataireId = req.session.userId;
  if (!vacataireId) return res.status(401).json({ message: 'Utilisateur non connecté' });
  const query = 'SELECT * FROM vacataire WHERE ID_vacat = ?';
  db.query(query, [vacataireId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.length === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });
    const vacataireData = results[0];
    if (vacataireData.Etat_dossier === 'Refusé' && vacataireData.Refus_reason) {
      vacataireData.Refus_reason = JSON.parse(vacataireData.Refus_reason); // Parse Refus_reason
    }
    res.json(vacataireData);
  });
});

// Route to fetch admin info
app.get('/admin-info', (req, res) => {
  const adminId = req.session.userId;
  if (!adminId) return res.status(401).json({ message: 'Utilisateur non connecté' });
  const query = 'SELECT * FROM admin WHERE ID_admin = ?';
  db.query(query, [adminId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.length === 0) return res.status(404).json({ message: 'Admin non trouvé' });
    res.json(results[0]);
  });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Route to upload documents
app.post('/upload-documents', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cin', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'autorisation', maxCount: 1 },
  { name: 'attestation', maxCount: 1 },
]), async (req, res) => {
  const vacataireId = req.session.userId;
  if (!vacataireId) return res.status(401).json({ message: 'Utilisateur non connecté' });

  const { photo, cin, cv, diplome, autorisation, attestation } = req.files || {};
  const { isFonctionnaire } = req.body;

  const getQuery = 'SELECT * FROM vacataire WHERE ID_vacat = ?';
  db.query(getQuery, [vacataireId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.length === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });

    const existingData = results[0];
    const updateFields = { ...existingData, Fonctionnaire: isFonctionnaire === 'true' ? 1 : 0 };
    if (existingData.Etat_dossier === 'En attente') updateFields.Etat_dossier = 'En cours';

    const oldFilesToDelete = [];
    if (photo) { updateFields.Photo = photo[0].path; if (existingData.Photo) oldFilesToDelete.push(existingData.Photo); }
    if (cin) { updateFields.CIN_fichier = cin[0].path; if (existingData.CIN_fichier) oldFilesToDelete.push(existingData.CIN_fichier); }
    if (cv) { updateFields.CV = cv[0].path; if (existingData.CV) oldFilesToDelete.push(existingData.CV); }
    if (diplome) { updateFields.Diplome = diplome[0].path; if (existingData.Diplome) oldFilesToDelete.push(existingData.Diplome); }
    if (isFonctionnaire === 'true' && autorisation) { updateFields.Autorisation_fichier = autorisation[0].path; if (existingData.Autorisation_fichier) oldFilesToDelete.push(existingData.Autorisation_fichier); }
    if (isFonctionnaire === 'false' && attestation) { updateFields.Attest_non_emploi = attestation[0].path; if (existingData.Attest_non_emploi) oldFilesToDelete.push(existingData.Attest_non_emploi); }

    delete updateFields.ID_vacat;

    const deleteOldFiles = async () => {
      for (const filePath of oldFilesToDelete) {
        try { await fs.unlink(filePath); console.log(`Deleted old file: ${filePath}`); } catch (deleteErr) { console.error(`Error deleting old file ${filePath}:`, deleteErr); }
      }
    };

    const updateQuery = 'UPDATE vacataire SET ? WHERE ID_vacat = ?';
    db.query(updateQuery, [updateFields, vacataireId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' });
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });
      deleteOldFiles().catch(console.error);
      res.json({ message: 'Documents téléchargés avec succès' });
    });
  });
});

// Route for logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => err ? res.status(500).json({ message: 'Erreur lors de la déconnexion' }) : res.json({ message: 'Déconnexion réussie' }));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
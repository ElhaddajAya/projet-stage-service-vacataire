//backend/app.js

const express = require('express');
const db = require('./config/db');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();
const app = express();
app.use(express.json());

const cors = require('cors');
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
// backend/app.js

// ... existing imports and middleware ...

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

// ... existing routes ...
// Route pour récupérer tous les vacataires
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

// Route pour récupérer les informations du vacataire connecté
app.get('/vacataire-info', (req, res) => {
  const vacataireId = req.session.userId;

  if (!vacataireId) {
    return res.status(401).json({ message: 'Utilisateur non connecté' });
  }

  const query = 'SELECT Nom, Prenom, Email, Numero_tele, CIN, Photo, Date_naiss FROM vacataire WHERE ID_vacat = ?';
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

// Route pour mettre à jour les informations du vacataire
app.put('/update-vacataire', (req, res) => {
  const { nom, prenom, email, telephone, cin, date_naiss } = req.body;

  // Assure-toi que la session contient l'ID du vacataire connecté
  const vacataireId = req.session.userId;

  if (!vacataireId) {
    return res.status(401).json({ message: 'Non autorisé. Veuillez vous connecter.' });
  }

  const query = `
    UPDATE vacataire
    SET Nom = ?, Prenom = ?, Email = ?, Telephone = ?, CIN = ?, Date_naiss = ?
    WHERE id = ?
  `;

  const values = [nom, prenom, email, telephone, cin, date_naiss, vacataireId];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur MySQL : ", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    return res.status(200).json({ message: "Informations mises à jour avec succès" });
  });
});


// Démarre le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
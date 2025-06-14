const express = require('express');
const db = require('./config/db');
const dotenv = require('dotenv');
const session = require('express-session');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

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

// Email transporter configuration using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email transporter is ready:', success);
  }
});

// Route to fetch details of a specific vacataire, including teaching information
app.get('/vacataire-details/:id', (req, res) => {
  const vacataireId = req.params.id;

  const vacataireQuery = `
    SELECT ID_vacat, Nom, Prenom, Numero_tele AS Numero_tele, Email, CIN, Date_naiss, 
           Photo, CV, Attest_non_emploi AS Attestation, Diplome, 
           Etat_dossier AS EtatDossier, Etat_virement AS EtatVirement, Fonctionnaire,
           Autorisation_fichier, Attest_non_emploi, CIN_fichier, Refus_reason
    FROM vacataire 
    WHERE ID_vacat = ?
  `;

  const enseignementQuery = `
    SELECT e.Matiere, e.Nbr_heurs AS Nombre_heures, e.Semestre, e.Nbr_semaines, f.Nom_fil AS Filiere, d.Nom_Dep AS Departement
    FROM enseigner e
    JOIN filiere f ON e.ID_fil = f.ID_fil
    JOIN departement d ON f.ID_dep = d.ID_dep
    WHERE e.ID_vacat = ?
  `;

  db.query(vacataireQuery, [vacataireId], (err, vacataireResults) => {
    if (err) {
      console.error('Erreur lors de la récupération des détails du vacataire:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (vacataireResults.length === 0) {
      return res.status(404).json({ message: 'Vacataire non trouvé' });
    }

    const vacataireData = vacataireResults[0];
    // Safely parse Refus_reason, handle invalid JSON
    if (vacataireData.Refus_reason) {
      try {
        if (typeof vacataireData.Refus_reason === 'string') {
          vacataireData.Refus_reason = JSON.parse(vacataireData.Refus_reason);
        } else if (typeof vacataireData.Refus_reason === 'object' && vacataireData.Refus_reason !== null) {
          // Already an object, no need to parse
          console.log('Refus_reason is already an object, skipping parse:', vacataireData.Refus_reason);
        } else {
          console.warn('Invalid Refus_reason format, resetting to null:', vacataireData.Refus_reason);
          vacataireData.Refus_reason = null;
        }
      } catch (parseError) {
        console.error('Erreur lors du parsing de Refus_reason:', parseError, 'Valeur:', vacataireData.Refus_reason);
        vacataireData.Refus_reason = null; // Fallback to null if parsing fails
      }
    }

    db.query(enseignementQuery, [vacataireId], (err, enseignementResults) => {
      if (err) {
        console.error('Erreur lors de la récupération des informations d\'enseignement:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      const responseData = {
        ...vacataireData,
        Enseignements: enseignementResults
      };

      res.json(responseData);
    });
  });
});

// Route to update the Etat_dossier of a vacataire with Refus_reason and send email
app.put('/vacataire/:id/update-etat', (req, res) => {
  const vacataireId = req.params.id;
  const { Etat_dossier, Refus_reason } = req.body;

  if (!Etat_dossier) return res.status(400).json({ message: 'État du dossier est requis' });

  let refusReasonToStore = null;
  if (Refus_reason) {
    if (typeof Refus_reason === 'string') {
      console.error('Refus_reason received as string:', Refus_reason);
      return res.status(400).json({ message: 'Refus_reason doit être un objet, pas une chaîne' });
    }
    try {
      refusReasonToStore = JSON.stringify(Refus_reason);
      console.log('Storing Refus_reason:', refusReasonToStore);
    } catch (error) {
      console.error('Erreur lors de la conversion de Refus_reason en JSON:', error);
      return res.status(400).json({ message: 'Format invalide pour Refus_reason' });
    }
  }

  const query = 'UPDATE vacataire SET Etat_dossier = ?, Refus_reason = ? WHERE ID_vacat = ?';
  db.query(query, [Etat_dossier, refusReasonToStore, vacataireId], async (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'état du dossier:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });

    db.query('SELECT Email, Nom, Prenom FROM vacataire WHERE ID_vacat = ?', [vacataireId], async (err, vacataireResults) => {
      if (err || vacataireResults.length === 0) {
        console.error('Erreur lors de la récupération de l\'email:', err);
      } else {
        const vacataire = vacataireResults[0];
        const email = vacataire.Email;
        const fullName = `${vacataire.Nom} ${vacataire.Prenom || ''}`;

        let subject, text;
        if (Etat_dossier === 'Refusé' && Refus_reason) {
          subject = Refus_reason.problemType ? `Refus de dossier - ${Refus_reason.problemType}` : 'Refus de dossier';
          text = Refus_reason.problemType ? `${subject}\n\nDescription : ${Refus_reason.description}` : `Refus de dossier\n\nDescription : ${Refus_reason.description}`;
        } else if (Etat_dossier === 'Validé') {
          subject = 'Validation de votre dossier';
          text = `Bonjour ${fullName},\n\nVotre dossier a bien été validé. Vous allez recevoir votre virement prochainement.\n\nCordialement,\nÉcole Supérieure de Technologie de Salé`;
        }

        if (email && (Etat_dossier === 'Refusé' || Etat_dossier === 'Validé') && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: text + '\n\n--\nÉcole Supérieure de Technologie de Salé',
            attachments: [
              {
                filename: 'logo.jpg',
                path: './public/logo.jpg',
                cid: 'estLogo'
              }
            ]
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully to:', email);
          } catch (emailError) {
            console.error('Error sending email:', emailError);
          }
        } else {
          console.warn('Email not sent: Missing EMAIL_USER, EMAIL_PASS, or email address');
        }
      }
    });

    res.json({ message: 'État du dossier mis à jour avec succès' });
  });
});

// Route to update the Etat_virement of a vacataire and send email
app.put('/vacataire/:id/update-virement', (req, res) => {
  const vacataireId = req.params.id;
  const { Etat_virement } = req.body;
  if (!Etat_virement) return res.status(400).json({ message: 'État du virement est requis' });
  const query = 'UPDATE vacataire SET Etat_virement = ? WHERE ID_vacat = ?';
  db.query(query, [Etat_virement, vacataireId], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });

    if (Etat_virement === 'Effectué') {
      db.query('SELECT Email, Nom, Prenom FROM vacataire WHERE ID_vacat = ?', [vacataireId], async (err, vacataireResults) => {
        if (err || vacataireResults.length === 0) {
          console.error('Erreur lors de la récupération de l\'email:', err);
        } else {
          const vacataire = vacataireResults[0];
          const email = vacataire.Email;
          const fullName = `${vacataire.Nom} ${vacataire.Prenom || ''}`;

          if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: 'Virement effectué',
              text: `Bonjour ${fullName},\n\nVotre virement a été effectué avec succès.\n\nCordialement,\nÉcole Supérieure de Technologie de Salé`,
              attachments: [
                {
                  filename: 'logo.jpg',
                  path: './public/logo.jpg',
                  cid: 'estLogo'
                }
              ]
            };

            try {
              await transporter.sendMail(mailOptions);
              console.log('Email sent successfully to:', email);
            } catch (emailError) {
              console.error('Error sending email:', emailError);
            }
          } else {
            console.warn('Email not sent: Missing EMAIL_USER, EMAIL_PASS, or email address');
          }
        }
      });
    }

    res.json({ message: 'État du virement mis à jour avec succès' });
  });
});

// Route to fetch all vacataires
app.get('/vacataires', (req, res) => {
  if (!req.session.userId || !['superadmin', 'admin', 'comptable'].includes(req.session.role)) {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs, superadmins ou comptables' });
  }
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

// Route de connexion avec vérification du mot de passe haché
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt - Received:', { username, password });
  if (!username || !password) return res.status(400).json({ message: 'Identifiant et mot de passe requis' });

  const vacataireQuery = 'SELECT ID_vacat, Nom, mdp FROM vacataire WHERE username = ?';
  db.query(vacataireQuery, [username], async (err, vacataireResults) => {
    if (err) {
      console.error('Erreur serveur (vacataire):', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (vacataireResults.length > 0) {
      const vacataire = vacataireResults[0];
      console.log('Vacataire found - Stored hash:', vacataire.mdp);
      const match = await bcrypt.compare(password, vacataire.mdp);
      console.log('Password match result:', match);
      if (match) {
        req.session.userId = vacataire.ID_vacat;
        req.session.nom = vacataire.Nom;
        req.session.role = 'vacataire';
        return res.json({ message: 'Connexion réussie', user: { id: vacataire.ID_vacat, nom: vacataire.Nom, role: 'vacataire' } });
      }
    }

    const adminQuery = 'SELECT ID_admin, Nom, Role, isSuspended, mdp FROM admin WHERE username = ?';
    db.query(adminQuery, [username], async (err, adminResults) => {
      if (err) {
        console.error('Erreur serveur (admin):', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (adminResults.length > 0) {
        const admin = adminResults[0];
        console.log('Admin found - Stored hash:', admin.mdp);
        const match = await bcrypt.compare(password, admin.mdp);
        console.log('Password match result:', match);
        if (match) {
          if (admin.isSuspended) {
            return res.status(403).json({ message: 'Votre compte est suspendu. Contactez un superadmin.' });
          }
          req.session.userId = admin.ID_admin;
          req.session.nom = admin.Nom;
          req.session.role = admin.Role;
          return res.json({ message: 'Connexion réussie', user: { id: admin.ID_admin, nom: admin.Nom, role: admin.Role } });
        }
      }
      return res.status(401).json({ message: 'Identifiants incorrects' });
    });
  });
});

// Route to check authentication
app.get('/check-auth', (req, res) => {
  if (req.session.userId) res.json({ authenticated: true, user: { id: req.session.userId, nom: req.session.nom, role: req.session.role } });
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

// Route to update vacataire password with hashing
app.put('/update-vacataire-password', async (req, res) => {
  const vacataireId = req.session.userId;
  const { mdp } = req.body;
  if (!vacataireId) return res.status(401).json({ message: 'Utilisateur non connecté' });
  if (!mdp) return res.status(400).json({ message: 'Mot de passe requis' });

  const hashedPassword = await bcrypt.hash(mdp, 10);
  const query = 'UPDATE vacataire SET mdp = ? WHERE ID_vacat = ?';
  db.query(query, [hashedPassword, vacataireId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  });
});

// Route to update admin info with password hashing
app.put('/update-admin', async (req, res) => {
  const adminId = req.session.userId;
  const { nom, prenom, email, username, mdp } = req.body;
  if (!adminId) return res.status(401).json({ message: 'Utilisateur non connecté' });

  const updateFields = { nom, prenom, email, username };
  if (mdp) {
    updateFields.mdp = await bcrypt.hash(mdp, 10);
  }

  const query = 'UPDATE admin SET ? WHERE ID_admin = ?';
  db.query(query, [updateFields, adminId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour des informations admin:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Admin non trouvé' });
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
    // Safely parse Refus_reason, handle invalid JSON
    if (vacataireData.Refus_reason) {
      try {
        if (typeof vacataireData.Refus_reason === 'string') {
          vacataireData.Refus_reason = JSON.parse(vacataireData.Refus_reason);
        } else if (typeof vacataireData.Refus_reason === 'object' && vacataireData.Refus_reason !== null) {
          // Already an object, no need to parse
          console.log('Refus_reason is already an object, skipping parse:', vacataireData.Refus_reason);
        } else {
          console.warn('Invalid Refus_reason format, resetting to null:', vacataireData.Refus_reason);
          vacataireData.Refus_reason = null;
        }
      } catch (parseError) {
        console.error('Erreur lors du parsing de Refus_reason:', parseError, 'Valeur:', vacataireData.Refus_reason);
        vacataireData.Refus_reason = null; // Fallback to null if parsing fails
      }
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
    if (existingData.Etat_dossier === 'En attente' || existingData.Etat_dossier === 'Refusé') updateFields.Etat_dossier = 'En cours';

    const oldFilesToDelete = [];
    if (photo) { updateFields.Photo = photo[0].path; if (existingData.Photo) oldFilesToDelete.push(existingData.Photo); }
    if (cin) { updateFields.CIN_fichier = cin[0].path; if (existingData.CIN_fichier) oldFilesToDelete.push(existingData.CIN_fichier); }
    if (cv) { updateFields.CV = cv[0].path; if (existingData.CV) oldFilesToDelete.push(existingData.CV); }
    if (diplome) { updateFields.Diplome = diplome[0].path; if (existingData.Diplome) oldFilesToDelete.push(existingData.Diplome); }
    if (isFonctionnaire === 'true' && autorisation) { updateFields.Autorisation_fichier = autorisation[0].path; if (existingData.Autorisation_fichier) oldFilesToDelete.push(existingData.Autorisation_fichier); }
    if (isFonctionnaire === 'false' && attestation) { updateFields.Attest_non_emploi = attestation[0].path; if (existingData.Attest_non_emploi) oldFilesToDelete.push(existingData.Attest_non_emploi); }

    // Ensure Refus_reason is a JSON string if it exists
    if (updateFields.Refus_reason) {
      try {
        updateFields.Refus_reason = JSON.stringify(updateFields.Refus_reason);
      } catch (stringifyErr) {
        console.error('Error stringifying Refus_reason:', stringifyErr);
        updateFields.Refus_reason = null; // Fallback to null if stringification fails
      }
    }

    console.log('Update fields:', updateFields);

    delete updateFields.ID_vacat;

    const deleteOldFiles = async () => {
      for (const filePath of oldFilesToDelete) {
        try { await fs.unlink(filePath); console.log(`Deleted old file: ${filePath}`); } catch (deleteErr) { console.error(`Error deleting old file ${filePath}:`, deleteErr); }
      }
    };

    const updateQuery = 'UPDATE vacataire SET ? WHERE ID_vacat = ?';
    db.query(updateQuery, [updateFields, vacataireId], (err, results) => {
      if (err) {
        console.error('Database update error:', err.code, err.sqlMessage);
        return res.status(500).json({ message: `Erreur lors de la mise à jour de la base de données: ${err.sqlMessage || err.message}` });
      }
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Vacataire non trouvé' });
      deleteOldFiles().catch(console.error);
      res.json({ message: 'Documents téléchargés avec succès' });
    });

    if (existingData.Etat_dossier === 'En attente' || existingData.Etat_dossier === 'Refusé') {
      const updateDossierQuery = 'UPDATE vacataire SET Etat_dossier = ? WHERE ID_vacat = ?';
      db.query(updateDossierQuery, ['En cours', vacataireId], (err) => {
        if (err) console.error('Erreur lors de la mise à jour de l\'état du dossier:', err);
      });
    }
  });
});

// Route for logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => err ? res.status(500).json({ message: 'Erreur lors de la déconnexion' }) : res.json({ message: 'Déconnexion réussie' }));
});

// Route to fetch the delai_depot
app.get('/get-delai-depot', (req, res) => {
  const query = 'SELECT delai_depot FROM settings ORDER BY id DESC LIMIT 1';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du délai de dépôt:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Délai de dépôt non défini' });
    }
    res.json({ delai_depot: results[0].delai_depot });
  });
});

// Route to set the delai_depot (admin only)
app.post('/set-delai-depot', (req, res) => {
  if (!req.session.userId || req.session.role !== 'superadmin') {
    return res.status(403).json({ message: 'Accès réservé aux super administrateurs' });
  }

  const { delai_depot } = req.body;
  if (!delai_depot) {
    return res.status(400).json({ message: 'Délai de dépôt requis' });
  }

  const deadlineDate = new Date(delai_depot);
  if (isNaN(deadlineDate.getTime())) {
    return res.status(400).json({ message: 'Format de date invalide' });
  }

  const query = 'INSERT INTO settings (delai_depot) VALUES (?) ON DUPLICATE KEY UPDATE delai_depot = ?';
  db.query(query, [delai_depot, delai_depot], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du délai de dépôt:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json({ message: 'Délai de dépôt mis à jour avec succès' });
  });
});

// Route to fetch all administrators
app.get('/administrateurs', (req, res) => {
  console.log('Session data:', req.session);
  if (!req.session.userId || !['superadmin', 'admin'].includes(req.session.role)) {
    console.log('Access denied: User not authenticated or not an admin/superadmin', { userId: req.session.userId, role: req.session.role });
    return res.status(403).json({ message: 'Accès réservé aux administrateurs ou superadmins' });
  }

  const query = 'SELECT ID_admin, nom, prenom, username, email, Role, isSuspended FROM admin WHERE Role != "superadmin"';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des administrateurs:', err);
      return res.status(500).send('Erreur lors de la récupération des administrateurs');
    }
    console.log('Administrateurs fetched:', results);
    if (results.length === 0) {
      console.log('No administrators found in the database');
      return res.status(200).json([]);
    }
    res.json(results);
  });
});

// Route to add a new administrator with password hashing
app.post('/add-administrateur', async (req, res) => {
  console.log('Session data:', req.session);
  if (!req.session.userId || req.session.role !== 'superadmin') {
    console.log('Access denied: User not authenticated or not a superadmin', { userId: req.session.userId, role: req.session.role });
    return res.status(403).json({ message: 'Accès réservé aux superadmins' });
  }

  const { nom, prenom, email, Role } = req.body;
  if (!nom || !prenom || !email || !Role) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  const username = `${nom.toLowerCase()}.${prenom.toLowerCase()}`;
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  const mdp = generatePassword();
  const hashedPassword = await bcrypt.hash(mdp, 10);

  const query = 'INSERT INTO admin (nom, prenom, username, email, mdp, Role) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [nom, prenom, username, email, hashedPassword, Role], async (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de l\'administrateur:', err);
      return res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'administrateur' });
    }
    console.log('Administrateur ajouté:', results);

    if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Vos identifiants de connexion',
        text: `Bonjour,\n\nVotre compte administrateur a été créé avec succès.\n\nIdentifiant : ${username}\nMot de passe : ${mdp}\n\nVeuillez vous connecter à l'application pour changer votre mot de passe.\n\nCordialement,\nÉcole Supérieure de Technologie de Salé`,
        attachments: [
          {
            filename: 'logo.jpg',
            path: './public/logo.jpg',
            cid: 'estLogo'
          }
        ]
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else {
      console.warn('Email not sent: Missing EMAIL_USER, EMAIL_PASS, or email address');
    }

    res.status(201).json({ message: 'Administrateur ajouté avec succès', id: results.insertId });
  });
});

// Route to delete an administrator
app.delete('/administrateurs/:id', (req, res) => {
  if (!req.session.userId || req.session.role !== 'superadmin') {
    return res.status(403).json({ message: 'Accès réservé aux superadmins' });
  }

  const adminId = req.params.id;
  const query = 'DELETE FROM admin WHERE ID_admin = ? AND Role != "superadmin"';
  db.query(query, [adminId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'administrateur:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    res.json({ message: 'Administrateur supprimé avec succès' });
  });
});

// Route to suspend or activate an administrator's permissions
app.put('/administrateurs/:id/suspend', (req, res) => {
  if (!req.session.userId || req.session.role !== 'superadmin') {
    return res.status(403).json({ message: 'Accès réservé aux superadmins' });
  }

  const adminId = req.params.id;
  const { isSuspended } = req.body;

  if (typeof isSuspended !== 'boolean') {
    return res.status(400).json({ message: 'isSuspended doit être un booléen' });
  }

  const query = 'UPDATE admin SET isSuspended = ? WHERE ID_admin = ?';
  db.query(query, [isSuspended ? 1 : 0, adminId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de la suspension:', err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    res.json({ message: `Administrateur ${isSuspended ? 'suspendu' : 'activé'} avec succès` });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
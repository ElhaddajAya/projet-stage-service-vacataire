# Instructions pour Configurer l'Envoi d'Emails

Pour activer l'envoi d'emails, configurez les paramètres suivants dans un fichier `.env` à la racine du projet :

1. Copiez `.env.example` et renommez-le en `.env`.
2. Remplissez les champs avec les informations fournies par le département IT de l'EST Salé :
   - `EMAIL_USER` : Adresse email officielle (ex: `noreply@estsale.ac.ma`).
   - `EMAIL_PASS` : Mot de passe ou App Password (à demander au département IT).
   - `EMAIL_SERVICE` : Service email (ex: `gmail`, ou nom du serveur interne).
   - `EMAIL_HOST` : Hôte SMTP (ex: `smtp.gmail.com` pour Gmail).
   - `EMAIL_PORT` : Port SMTP (587 pour TLS, 465 pour SSL).
   - `EMAIL_SECURE` : `true` pour port 465, `false` pour 587.
3. Placez le logo de l'EST Salé (`est_logo.png`) dans le dossier `public/`.
4. Lancez le serveur avec `node app.js` et testez l'envoi d'emails.
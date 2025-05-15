import React, { useState } from 'react';
import "../styles/global.css"; // Assure-toi que le fichier CSS est dans le bon chemin

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion ici
    console.log({ username, password });
  };

  return (
    <div className="center-container">
      <div className="login-box">
        <h1>Espace Enseignant Vacataire</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label>Mot de Passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Connexion</button>
          <div className="forgot-password">
            <a href="#">Mot de passe oublié?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
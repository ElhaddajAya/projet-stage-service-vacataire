import React, { useState } from 'react';
import "../styles/global.css"; // Assure-toi que le fichier CSS est dans le bon chemin
import Header from './Header';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion ici
    console.log({ username, password });
  };

    return (
    <div>
      <Header />
    
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Mot de Passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <br />
          <button type="submit">Connexion</button>
          <br />
          <br />
          <div>
            <a href="#">Mot de passe oublié?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import "../styles/global.css"; 
import Header from './Header'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ username: '', password: '', global: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ username: '', password: '', global: '' });
    setLoading(true);

    if (!username) {
      setError((prev) => ({ ...prev, username: 'Le nom d’utilisateur est requis' }));
      setLoading(false);
      return;
    }

    if (!password) {
      setError((prev) => ({ ...prev, password: 'Le mot de passe est requis' }));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', 
        { username, password }, 
        { withCredentials: true } // Important pour inclure les cookies de session
      );

      if (response.status === 200) {
        navigate('/espace-vacataire/suivi-dossier');
      } else {
        setError((prev) => ({ ...prev, global: response.data.message || 'Erreur lors de la connexion' }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, global: err.response?.data?.message || 'Erreur serveur' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className='form-group'>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder='Entrez votre username'
              disabled={loading}
            />
            {error.username && <div className="error-message">{error.username}</div>}
          </div>

          <div className='form-group'>
            <label>Mot de Passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='Entrez votre mot de passe'
              disabled={loading}
            />
            {error.password && <div className="error-message">{error.password}</div>}
          </div>

          {error.global && <div className="error-global">{error.global}</div>}
          
          <br />
          <button type="submit" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Connexion'}
          </button>
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
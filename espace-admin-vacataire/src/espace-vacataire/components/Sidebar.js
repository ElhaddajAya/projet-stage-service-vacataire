import React, { useState, useEffect } from 'react';
import '../../style/sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import avatar from '../../../src/avatar.png'; // Assure-toi que le logo est dans ton dossier src
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [username, setUsername] = useState('Utilisateur');
  const navigate = useNavigate();

  // Récupérer le nom de l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/check-auth', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        
        if (response.ok && data.authenticated) {
          setUsername(data.user.nom); // Mettre à jour le nom de l'utilisateur
        } else {
          console.error('Utilisateur non authentifié');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification', err);
      }
    };

    fetchUser();
  }, []); // Charger le nom lors du montage

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Rediriger vers la page de connexion après déconnexion
        navigate('/login');
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (err) {
      console.error('Erreur réseau lors de la déconnexion', err);
    }
  };

  return (
    <>
      <input type="checkbox" id="check" />
      <label htmlFor="check">
        <i className="fas fa-bars" id="btn"></i>
        <i className="fas fa-times" id="cancel"></i>
      </label>

      <div className="sidebar">
        <header>
          <img src={avatar} alt="avatar" />
          <p>{username}</p>
        </header>
        <ul>
          <li>
            <a href="#"><i className="fas fa-user"></i> Infos Personelles</a>
          </li>
          <li>
            <a href="#"><i className="fas fa-file-alt"></i> Documents</a>
          </li>
          <li>
            <a href="#"><i className="fas fa-user-cog"></i> Compte</a>
          </li>
          <li onClick={handleLogout}>
            <a href="#"><i className="fas fa-sign-out-alt"></i> Déconnexion</a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;

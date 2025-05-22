import React, { useState, useEffect } from 'react';
import '../../style/sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import avatar from '../../../src/avatar.png'; // Default avatar
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [userData, setUserData] = useState({ nom: 'Utilisateur', prenom: '', photo: null });
  const navigate = useNavigate();

  // Fetch user data including prenom and photo
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/admin-info', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data) {
          setUserData({
            nom: data.nom || 'Utilisateur',
            prenom: data.prenom || ''
          });
        } else {
          console.error('Utilisateur non authentifié ou erreur de données');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des informations utilisateur', err);
      }
    };

    fetchUser();
  }, []); // Load data on mount

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Redirect to login page after logout
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
          <p>
            {userData.prenom && `${userData.prenom} `}
            {userData.nom}
          </p>
        </header>
        <ul>
          <li>
            <a href="#"><i className="fas fa-user"></i> Infos Personelles</a>
          </li>
          <li onClick={() => navigate('/espace-admin/vacataires')}>
            <a href="#"><i className="fas fa-users-line"></i> Vacataires</a>
          </li><li>
            <a href="#"><i className="fas fa-users"></i> Administrateurs</a>
          </li>
          <li>
              <a href="/espace-admin/set-delai-depot">
                <i className="fas fa-clock"></i>
                <span>Délai de Dépôt</span>
              </a>
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
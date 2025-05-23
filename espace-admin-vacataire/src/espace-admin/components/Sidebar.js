import React, { useState, useEffect } from 'react';
import '../../style/sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import avatar from '../../../src/avatar.png'; // Default avatar
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [userData, setUserData] = useState({ nom: 'Utilisateur', prenom: '', photo: null, role: '' });
  const navigate = useNavigate();

  // Fetch user data including prenom, photo, and role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/admin-info', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data) {
          console.log('User data:', data); // Log pour débogage
          setUserData({
            nom: data.nom || 'Utilisateur',
            prenom: data.prenom || '',
            role: data.Role || '', // Utiliser 'Role' pour correspondre à la colonne de la base
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
          <small>{userData.role}</small>
        </header>
        <ul>
          <li>
            <a href="#"><i className="fas fa-user"></i> Infos Personelles</a>
          </li>
          <li onClick={() => navigate('/espace-admin/vacataires')}>
            <a href="#"><i className="fas fa-users-line"></i> Vacataires</a>
          </li>
          {userData.role === 'superadmin' && (
            <li onClick={() => navigate('/espace-admin/administrateurs')}>
              <a href="#"><i className="fas fa-user-shield"></i> Administrateurs</a>
            </li>
          )}
          {userData.role === 'superadmin' && (
            <li onClick={() => navigate('/espace-admin/set-delai-depot')}>
              <a href="#">
                <i className="fas fa-clock"></i>
                <span>Délai de Dépôt</span>
              </a>
            </li>
          )}
          <li onClick={handleLogout}>
            <a href="#"><i className="fas fa-sign-out-alt"></i> Déconnexion</a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
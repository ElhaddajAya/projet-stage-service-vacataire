// src/espace-vacataire/components/Sidebar.js
import React from 'react';
import '../../style/sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import avatar from '../../../src/avatar.png'; // Assure-toi que le logo est dans ton dossier src

const Sidebar = () => {
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
          <p>Utilisateur</p>
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
          <li>
            <a href="#"><i className="fas fa-sign-out-alt"></i> Déconnexion</a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;

// src/espace-vacataire/components/Sidebar.js
import React from 'react';
import '../../style/sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="profile">
        <img src="/user.png" alt="Utilisateur" />
        <p>Utilisateur</p>
      </div>
      <ul className="menu">
        <li>Informations</li>
        <li>Documents</li>
        <li>Compte</li>
      </ul>
      <button className="logout">Déconnexion</button>
    </aside>
  );
};

export default Sidebar;

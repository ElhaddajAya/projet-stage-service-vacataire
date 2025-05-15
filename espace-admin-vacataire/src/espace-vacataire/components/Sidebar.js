// src/espace-vacataire/components/Sidebar.js
import React from 'react';
import '../../style/sidebar.css';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="profile">
        <img src="/user.png" alt="Utilisateur" />
        <p>Utilisateur</p>
      </div>
      <ul className="menu">
        <li>Infos Personelles</li>
        <li>Documents</li>
        <li>Compte</li>
      </ul>
      <button className="logout">Déconnexion</button>
    </aside>
  );
};

export default Sidebar;

// src/espace-vacataire/pages/Phase1.js
import React from 'react';
import HeaderVacataire from '../components/HeaderVacataire';
import Sidebar from '../components/Sidebar';
import '../../style/phase1.css';

const Phase1 = () => {
  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        <HeaderVacataire />
        <div className="content">
          <h2>Phase 1 - Informations Personnelles</h2>
          <form className="form">
            <input type="text" placeholder="Nom" />
            <input type="text" placeholder="Prénom" />
            <input type="email" placeholder="Email" />
            <input type="text" placeholder="Téléphone" />
            <input type="text" placeholder="CIN" />
            <input type="file" />
            <div className="buttons">
              <button type="button">Modifier</button>
              <button type="submit">Soumettre</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Phase1;

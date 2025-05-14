// src/espace-vacataire/components/HeaderVacataire.js
import React from 'react';
import '../../style/header.css';

const HeaderVacataire = () => {
  return (
    <header className="header">
      <img src="/logo.png" alt="Logo EST Salé" className="logo" />
      <h1>Espace Enseignant Vacataire</h1>
    </header>
  );
};

export default HeaderVacataire;

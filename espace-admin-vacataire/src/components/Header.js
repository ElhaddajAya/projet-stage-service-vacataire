import React from 'react';
import logo from '../logo.jpg'; // Assure-toi que le logo est dans ton dossier src
import "../styles/global.css"; // Assure-toi que le fichier CSS est dans le bon chemin

const Header = () => {
  return (
    <header>
      <div>
        <img src={logo} alt="Logo" />
      </div>
      {/* <h1>Service Vacation</h1> */}
    </header>
  );
};

export default Header;
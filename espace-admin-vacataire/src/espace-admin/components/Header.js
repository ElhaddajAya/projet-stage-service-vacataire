import React from 'react';
import logo from '../../../src/logo.jpg'; 
import "../../styles/global.css"; 

const Header = () => {
  return (
    <header>
      <div>
        <img src={logo} alt="Logo" />
      </div>
      <h1>Espace Administrateur</h1>
    </header>
  );
};

export default Header;
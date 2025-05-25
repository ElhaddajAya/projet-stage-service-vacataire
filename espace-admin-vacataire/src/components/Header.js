import React from 'react';
import logo from '../logo.jpg'; 
import "../styles/global.css";

const Header = () => {
  return (
    <header>
      <div>
        <img src={logo} alt="Logo" />
      </div>
    </header>
  );
};

export default Header;
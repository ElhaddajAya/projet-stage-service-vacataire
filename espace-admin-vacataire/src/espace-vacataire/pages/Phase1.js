// src/espace-vacataire/pages/Phase1.js
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import '../../styles/global.css';
import '../../style/phase1.css';

const Phase1 = () => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="main">
        <div className="content">
          <h2>Phase 1 - Informations Personnelles</h2>
          <ProgressBar step={1} />
          <form className="form">
            <div className="form-group">
              <label>Nom</label>
              <input type="text" placeholder="Entrez votre nom" />
            </div>
            
            <div className="form-group">
              <label>Prénom</label>
              <input type="text" placeholder="Entrez votre prénom" />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="exemple@domaine.com"/>
            </div>
            
            <div className="form-group">
              <label>Téléphone</label>
              <input type="text" placeholder="06 00 00 00 00"/>
            </div>
            
            <div className="form-group">
              <label>CIN</label>
              <input type="text"  placeholder="AB123456"/>
            </div>
            
            <div className="form-group file-upload">
              <label>Photo</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                accept="image/*"
              />
              {fileName && <div className="file-name">{fileName}</div>}
            </div>
            
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
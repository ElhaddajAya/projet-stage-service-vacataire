// src/espace-vacataire/pages/SuiviDossier.js
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import '../../styles/global.css';
import '../../style/phase1.css';
import '../../style/phase2.css';
import '../../style/phase3.css';
import Phase1 from './Phase1';
import Phase2 from './Phase2';
import Phase3 from './Phase3';

const SuiviDossier = () => {
  const [currentPhase, setCurrentPhase] = useState(2);

  const handleNextPhase = () => {
    if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handlePreviousPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 1:
        return <Phase1 />;
      case 2:
        return <Phase2 />;
      case 3:
        return <Phase3 />;
      default:
        return <Phase1 />;
    }
  };

  return (
    <div>
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
          <div className="navigation-buttons">
            <button type="button" onClick={handlePreviousPhase} disabled={currentPhase === 1}>
              Précédent
            </button>
            <button type="button" onClick={handleNextPhase} disabled={currentPhase === 3}>
              Suivant
            </button>
          </div>
          <ProgressBar step={currentPhase} />
          {renderPhase()}
        </div>
      </div>
    </div>
  );
};

export default SuiviDossier;
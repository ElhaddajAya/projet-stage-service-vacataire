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
  const [currentPhase, setCurrentPhase] = useState(1);
  const [subStep, setSubStep] = useState(1);

  const handleNextPhase = (newPhase) => {
    if (newPhase && newPhase > currentPhase) {
      setCurrentPhase(newPhase); // Met à jour directement si la phase suivante est spécifiée
    } else if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handlePreviousPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
      if (currentPhase === 3) setSubStep(1);
    }
  };

  const handleNextSubStep = () => {
    if (currentPhase === 3 && subStep < 3) {
      setSubStep(subStep + 1);
    }
  };

  const handleCircleClick = (phase) => {
    setCurrentPhase(phase); // Set the phase to the clicked circle
    if (phase !== 3) {
      setSubStep(1); // Reset subStep if not in Phase 3
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 1:
        return <Phase1 onPhaseComplete={handleNextPhase} />;
      case 2:
        return <Phase2 onPhaseComplete={handleNextPhase} />;
      case 3:
        return <Phase3 onPhaseComplete={handleNextPhase} />;
      default:
        return <Phase1 onPhaseComplete={handleNextPhase} />;
    }
  };

  return (
    <div>
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
          <ProgressBar
            step={currentPhase}
            subStep={currentPhase === 3 ? subStep : 0}
            onCircleClick={handleCircleClick} // Pass the callback
          />
          {renderPhase()}
        </div>
      </div>
    </div>
  );
};

export default SuiviDossier;
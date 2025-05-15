// src/espace-vacataire/pages/Phase3.js
import React, { useState } from 'react';
import '../../style/phase3.css'; // Add this line
const Phase3 = () => {
  // State to simulate the current sub-step (1: En attente, 2: En cours, 3: Effectué)
  const [subStep, setSubStep] = useState(1);

  // Function to simulate next sub-step (for demo purposes)
  const handleNextSubStep = () => {
    if (subStep < 3) {
      setSubStep(subStep + 1);
    }
  };

  return (
    <>
      <h2>Phase 3 - Virement</h2>
      <form className="form">
        <div className="status-container">
          <div className={`status-card ${subStep === 1 ? 'active' : ''}`}>
            <h3>En attente</h3>
            <p>Vos documents ont bien été soumis. Le comptable n’a pas encore traité votre dossier.</p>
          </div>
          <div className={`status-card ${subStep === 2 ? 'active' : ''}`}>
            <h3>En cours</h3>
            <p>Votre dossier est en cours d’étude par le comptable. Cela peut prendre quelques jours.</p>
          </div>
          <div className={`status-card ${subStep === 3 ? 'active' : ''}`}>
            <h3>Effectué</h3>
            <p>Le virement a été effectué. Vous recevrez votre paiement sous peu.</p>
          </div>
        </div>
        {subStep < 3 && (
          <div className="buttons">
            <button type="button" onClick={handleNextSubStep}>
              Simuler prochaine étape
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default Phase3;
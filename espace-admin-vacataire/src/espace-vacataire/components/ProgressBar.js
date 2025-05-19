import React from 'react';
import '../../style/ProgressBar.css';

const ProgressBar = ({ step, subStep = 0, onCircleClick, isVirementEffectue, phase1Complete, phase2Complete }) => {
  // Déterminer si chaque phase doit afficher l'icône de validation
  const isPhaseComplete = (phase) => {
    if (phase === 1) return phase1Complete;
    if (phase === 2) return phase2Complete;
    // Phase 3 : Complète si Etat_dossier est 'Validé' et Etat_virement est 'Effectué'
    // Puisque nous n'avons pas les données directement ici, on s'appuie sur subStep
    if (phase === 3) return step === 3 && subStep >= 3;
    return false;
  };

  return (
    <div className="progress-container">
      {[1, 2, 3].map((item, index) => (
        <div key={index} className="progress-step">
          <div
            className={`circle ${step >= item ? 'active' : ''} ${
              isPhaseComplete(item) ? 'checked' : ''
            } ${isVirementEffectue && item !== 3 ? 'unclickable' : ''}`}
            onClick={isVirementEffectue && item !== 3 ? null : () => onCircleClick && onCircleClick(item)}
            style={{ cursor: isVirementEffectue && item !== 3 ? 'not-allowed' : 'pointer' }}
          >
            {isPhaseComplete(item) && '✓'}
          </div>
          {index < 2 && (
            <div className={`line ${step > item ? 'active' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
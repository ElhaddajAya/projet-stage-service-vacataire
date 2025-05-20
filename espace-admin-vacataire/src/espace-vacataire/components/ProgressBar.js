import React from 'react';
import '../../style/ProgressBar.css';

const ProgressBar = ({ step, subStep = 0, onCircleClick, isVirementEffectue, phase1Complete, phase2Complete, isDisabled }) => {
  const isPhaseComplete = (phase) => {
    if (phase === 1) return phase1Complete;
    if (phase === 2) return phase2Complete;
    if (phase === 3) return step === 3 && subStep >= 3;
    return false;
  };

  return (
    <div className={`progress-container ${isDisabled ? 'disabled' : ''}`}>
      {[1, 2, 3].map((item, index) => (
        <div key={index} className="progress-step">
          <div
            className={`circle ${step >= item ? 'active' : ''} ${isPhaseComplete(item) ? 'checked' : ''} ${
              isVirementEffectue && item !== 3 ? 'unclickable' : ''
            }`}
            onClick={isVirementEffectue && item !== 3 ? null : () => onCircleClick && onCircleClick(item)}
            style={{ cursor: isDisabled || (isVirementEffectue && item !== 3) ? 'not-allowed' : 'pointer' }}
            aria-disabled={isDisabled || (isVirementEffectue && item !== 3)}
          >
            {isPhaseComplete(item) && '✓'}
          </div>
          {index < 2 && <div className={`line ${step > item ? 'active' : ''}`} />}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
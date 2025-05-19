import React from 'react';
import '../../style/ProgressBar.css';

const ProgressBar = ({ step, subStep = 0, onCircleClick, isVirementEffectue }) => {
  return (
    <div className="progress-container">
      {[1, 2, 3].map((item, index) => (
        <div key={index} className="progress-step">
          <div
            className={`circle ${step >= item ? 'active' : ''} ${step > item || (step === 3 && subStep >= index + 1) ? 'checked' : ''}`}
            onClick={isVirementEffectue && item !== 3 ? null : () => onCircleClick && onCircleClick(item)} // Disable click for Phases 1 and 2 if virement effectué
            style={{ cursor: isVirementEffectue && item !== 3 ? 'not-allowed' : 'pointer' }} // Change cursor to indicate non-clickable
          >
            {(step > item || (step === 3 && subStep >= index + 1)) && '✓'}
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
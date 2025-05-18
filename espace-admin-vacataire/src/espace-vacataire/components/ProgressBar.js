// src/components/ProgressBar.js
import React from 'react';
import '../../style/ProgressBar.css';

const ProgressBar = ({ step, subStep = 0 }) => {
  return (
    <div className="progress-container">
      {[1, 2, 3].map((item, index) => (
        <div key={index} className="progress-step">
          <div className={`circle ${step >= item ? 'active' : ''} ${step > item || (step === 3 && subStep >= index + 1) ? 'checked' : ''}`}>
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
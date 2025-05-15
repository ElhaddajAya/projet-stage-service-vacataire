// src/components/ProgressBar.js
import React from 'react';
import '../../style/ProgressBar.css';

const ProgressBar = ({ step }) => {
  return (
    <div className="progress-container">
  {[1, 2, 3].map((item, index) => (
    <div key={index} className="progress-step">
      <div className={`circle ${step >= item ? 'active' : ''}`} />
      {index < 2 && ( // affiche la ligne sauf après le dernier cercle
        <div className={`line ${step > item ? 'active' : ''}`} />
      )}
    </div>
  ))}
</div>

  );
};

export default ProgressBar;

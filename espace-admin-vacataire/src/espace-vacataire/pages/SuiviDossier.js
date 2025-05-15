// src/espace-vacataire/pages/Phase1.js
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import '../../styles/global.css';
import '../../style/phase1.css';
import '../../style/phase2.css';
import Phase1 from './Phase1';
import Phase2 from './Phase2';

const SuiviDossier = () => {
  return (
    <div>
      <Header />
      <Sidebar />
      <div className="main">
        <div className="content">
          {/* <ProgressBar step={1} /> */}
          {/* <Phase1 />  */}

          <ProgressBar step={2} />
          <Phase2 />
        </div>
      </div>
    </div>
  );
};

export default SuiviDossier;
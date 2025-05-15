// src/espace-vacataire/pages/Phase1.js
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import '../../styles/global.css';
import Phase1 from './Phase1';
import Phase2 from './Phase2';
import '../../style/phase3.css';
import Phase3 from './Phase3';
const SuiviDossier = () => {
  return (
    <div>
      <Header />
      <Sidebar />
      <div className="main">
        <div className="content">
          {/* <ProgressBar step={1} />  */}
          {/* <Phase1 />  */}
          {/* <ProgressBar step={2} />
          <Phase2 /> */}
          <ProgressBar step={3} />
          <Phase3 />
        </div>
      </div>
    </div>
  );
};

export default SuiviDossier;
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Phase1 from './espace-vacataire/pages/Phase1';

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Phase1 />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

// espace-admin-vacataire/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import VacataireList from './espace-admin/pages/VacataireList';
import SuiviDossier from './espace-vacataire/pages/SuiviDossier';
import EtudeDossier from './espace-admin/pages/EtudeDossier';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/espace-vacataire/suivi-dossier" element={<SuiviDossier />} />
        <Route path="/espace-admin/vacataires" element={<VacataireList />} />
        <Route path="/espace-admin/etude-dossier/:id" element={<EtudeDossier />} />
      </Routes>
    </Router>
  );
}

export default App;
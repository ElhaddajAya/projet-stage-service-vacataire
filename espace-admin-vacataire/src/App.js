import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import VacataireList from './espace-admin/pages/VacataireList';
import SuiviDossier from './espace-vacataire/pages/SuiviDossier';
import EtudeDossier from './espace-admin/pages/EtudeDossier';
import InfosPersonnelles from './espace-vacataire/pages/InfosPersonnelles';
import Documents from './espace-vacataire/pages/Documents';
import './styles/global.css';
import SetDelaiDepot from './espace-admin/pages/SetDelaiDepot';
import AdminInfosPersonnelles from './espace-admin/pages/AdminInfosPersonnelles';
import AdministrateurList from './espace-admin/pages/AdministrateurList';
import AddAdministrateur from './espace-admin/pages/AddAdministrateur'; // Importer la nouvelle page
import EditAdminInfos from './espace-admin/pages/EditAdminInfos'; // Importer la nouvelle page

// Component to handle dynamic titles
const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    // Determine the title based on the current path
    if (location.pathname === '/login') {
      document.title = 'Espace ESTS Admin-Vacataire';
    } else if (location.pathname.startsWith('/espace-vacataire')) {
      document.title = 'Espace Vacataire';
    } else if (location.pathname.startsWith('/espace-admin')) {
      document.title = 'Espace Admin';
    } else {
      document.title = 'Espace ESTS Admin-Vacataire'; // Default title
    }
  }, [location.pathname]); // Re-run effect when the path changes

  return null; // This component doesn't render anything
};

function App() {
  return (
    <Router>
      <TitleUpdater /> {/* Add the title updater component */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/espace-vacataire/suivi-dossier" element={<SuiviDossier />} />
        <Route path="/espace-admin/vacataires" element={<VacataireList />} />
        <Route path="/espace-admin/etude-dossier/:id" element={<EtudeDossier />} />
        <Route path="/espace-vacataire/infos-personnelles" element={<InfosPersonnelles />} />
        <Route path="/espace-vacataire/documents" element={<Documents />} />
        <Route path="/espace-admin/set-delai-depot" element={<SetDelaiDepot />} />
        <Route path="/espace-admin/infos-personnelles" element={<AdminInfosPersonnelles />} />
        <Route path="/espace-admin/administrateurs" element={<AdministrateurList />} />
        <Route path="/espace-admin/add-administrateur" element={<AddAdministrateur />} /> 
        <Route path="/espace-admin/edit-infos" element={<EditAdminInfos />} />
      </Routes>
    </Router>
  );
}

export default App;
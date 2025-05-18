import './App.css';
import LoginForm from './components/LoginForm';
import VacataireList from './espace-admin/pages/VacataireList';
import SuiviDossier from './espace-vacataire/pages/SuiviDossier';
import './styles/global.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
    return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/espace-vacataire/suivi-dossier" element={<SuiviDossier />} />
        <Route path="/espace-admin/vacataires" element={<VacataireList />} />
      </Routes>
    </Router>
  );
}

export default App;

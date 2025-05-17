import './App.css';
import LoginForm from './components/LoginForm';
import VacataireList from './espace-admin/pages/VacataireList';
import SuiviDossier from './espace-vacataire/pages/SuiviDossier';
import './styles/global.css'

function App() {
    return (
    <div>
          {/* <LoginForm /> */}
          {/* <VacataireList />   */}
          <SuiviDossier />
    </div>
  );
}

export default App;

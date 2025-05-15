import './App.css';
import LoginForm from './components/LoginForm';
import VacataireList from './espace-admin/pages/VacataireList';
import Header from './espace-vacataire/components/Header';
import Phase1 from './espace-vacataire/pages/Phase1';

function App() {
    return (
    <div>
          {/* <VacataireList />  */}
          <Phase1 />
    </div>
  );
}

export default App;

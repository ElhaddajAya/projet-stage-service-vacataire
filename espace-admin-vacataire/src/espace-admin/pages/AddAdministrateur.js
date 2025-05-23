import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../../styles/global.css';
import '../../style/phase1.css';

const AddAdministrateur = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    Role: 'admin',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/add-administrateur', formData, {
        withCredentials: true,
      });
      navigate('/espace-admin/administrateurs');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'administrateur:', error);
      setError('Erreur lors de l\'ajout. Vérifiez les données ou les autorisations.');
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <main className="page-container">
        <h1 className="page-title">Ajouter un Administrateur</h1>
        {error && <div className="error-global">{error}</div>}
        <div className="content">
          <form onSubmit={handleSubmit} className="form">
            <div className="admin-form-row">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Entrez votre nom"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Entrez votre email"
                  required
                />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Entrez votre prénom"
                  required
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select name="Role" value={formData.Role} onChange={handleChange} required>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="comptable">Comptable</option>
                </select>
              </div>
            </div>
            <div className="buttons">
              <button
                type="button"
                className="admin-btn-annuler"
                onClick={() => navigate('/espace-admin/administrateurs')}
              >
                Annuler
              </button>
              <button type="submit" className="admin-btn-valider">Ajouter</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAdministrateur;
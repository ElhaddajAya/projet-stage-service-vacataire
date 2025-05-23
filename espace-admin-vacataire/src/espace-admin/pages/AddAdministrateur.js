import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../../style/addAdministrateur.css';

const AddAdministrateur = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    username: '',
    email: '',
    mdp: '',
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
      await axios.post('http://localhost:5000/administrateurs', formData, {
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
        <div className="table-container">
          <h1 className="page-title">Ajouter un Administrateur</h1>
          {error && <div className="admin-error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="admin-form-container">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Entrez le nom"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Entrez le prénom"
                  required
                />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Entrez le username"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Entrez l'email"
                  required
                />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="mdp"
                value={formData.mdp}
                onChange={handleChange}
                placeholder="Entrez le mot de passe"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Rôle</label>
              <select name="Role" value={formData.Role} onChange={handleChange} required>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
                <option value="comptable">Comptable</option>
              </select>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-valider">Ajouter</button>
              <button
                type="button"
                className="admin-btn-annuler"
                onClick={() => navigate('/espace-admin/administrateurs')}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAdministrateur;
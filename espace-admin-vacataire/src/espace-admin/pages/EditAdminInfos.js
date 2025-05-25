import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../espace-admin/components/Header';
import Sidebar from '../components/Sidebar';
import '../../styles/global.css';
import '../../style/phase1.css'; // Reusing styles from phase1.css for form consistency !!

const EditAdminInfos = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    username: '',
    mdp: '',
    confirmMdp: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/admin-info`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          const data = response.data;
          setFormData({
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            username: data.username || '',
            mdp: '',
            confirmMdp: '',
          });
        } else {
          setError('Erreur lors de la récupération des données');
          if (response.status === 401) {
            navigate('/login');
          }
        }
      } catch (err) {
        setError('Erreur lors de la récupération des données');
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.mdp !== formData.confirmMdp) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        username: formData.username,
      };
      if (formData.mdp) {
        updateData.mdp = formData.mdp;
      }

      const response = await axios.put(`${BACKEND_URL}/update-admin`, updateData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setSuccess('Informations mises à jour avec succès');
        setTimeout(() => navigate('/espace-admin/infos-personnelles'), 1500);
      } else {
        setError('Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <main className="page-container">
        <h1>Modifier les Informations</h1>
        {error && <div className="error-global-form">{error}</div>}
        {success && <div className="success-global">{success}</div>}
        <div className="content">
          <form onSubmit={handleSubmit} className="form">
            <div>
                <div className="form-group">
                <label>Nom</label>
                <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Entrez votre nom"
                />
                </div>
            </div>
            <div>
                <div className="form-group">
                <label>Prénom</label>
                <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Entrez votre prénom"
                />
                </div>
            </div>
            <div>
                <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Entrez votre email"
                />
                </div>
            </div>
            <div>
                <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Entrez votre username"
                />
                </div>
            </div>
            <div>
                <div className="form-group">
                <label>Nouveau Mot de Passe</label>
                <input
                    type="password"
                    name="mdp"
                    value={formData.mdp}
                    onChange={handleChange}
                    placeholder="Entrez votre nouveau mot de passe"
                />
                <small>Laisser vide pour ne pas changer</small>
                </div>
            </div>
            <div>
                <div className="form-group">
                <label>Confirmation de Mot de Passe</label>
                <input
                    type="password"
                    value={formData.confirmMdp}
                    name="confirmMdp"
                    onChange={handleChange}
                    placeholder="Confirmez votre mot de passe"
                />
                </div>
            </div>
            <div className="buttons">
              <button
                type="button"
                className="admin-btn-annuler"
                onClick={() => navigate('/espace-admin/infos-personnelles')}
              >
                Annuler
              </button>
              <button type="submit" className="admin-btn-valider">Mettre à jour</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditAdminInfos;
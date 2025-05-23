import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../components/Sidebar';
import '../../styles/global.css';
import '../../style/phase1.css';

const EditVacatairePassword = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    numeroTele: '',
    cin: '',
    dateNaiss: '',
    mdp: '',
    confirmMdp: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchVacataireData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/vacataire-info`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          const data = response.data;
          setFormData({
            nom: data.Nom || '',
            prenom: data.Prenom || '',
            email: data.Email || '',
            numeroTele: data.Numero_tele || '',
            cin: data.CIN || '',
            dateNaiss: data.Date_naiss ? new Date(data.Date_naiss).toISOString().split('T')[0] : '',
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

    fetchVacataireData();
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
        numeroTele: formData.numeroTele,
        cin: formData.cin,
        dateNaiss: formData.dateNaiss,
      };
      if (formData.mdp) {
        updateData.mdp = formData.mdp;
      }

      const response = await axios.put(`${BACKEND_URL}/update-vacataire-password`, updateData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setSuccess('Mot de passe mis à jour avec succès');
        setTimeout(() => navigate('/espace-vacataire/infos-personnelles'), 1500);
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
        <h1 className="page-title">Modifier le Mot de Passe</h1>
        {error && <div className="error-global-form">{error}</div>}
        {success && <div className="success-global">{success}</div>}
        <div className="content">
          <form onSubmit={handleSubmit} className="form">
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
                  name="confirmMdp"
                  value={formData.confirmMdp}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                />
              </div>
            </div>
            <div className="buttons">
              <button
                type="button"
                className="admin-btn-annuler"
                onClick={() => navigate('/infos-personnelles')}
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

export default EditVacatairePassword;
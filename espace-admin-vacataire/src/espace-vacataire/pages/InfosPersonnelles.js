import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../components/Sidebar'; // Ajusté pour correspondre à la structure
import '../../style/infos-personnelles.css';
import EditVacatairePassword from './EditVacatairePassword';

const InfosPersonnelles = () => {
  const [userData, setUserData] = useState({ nom: '', prenom: '', dateNaiss: '', email: '', numeroTele: '', cin: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/vacataire-info`, {
          withCredentials: true,
        });
        console.log('API Response:', response); // Log complet pour débogage

        if (response.status === 200) {
          const data = response.data;
          if (data) {
            setUserData({
              nom: data.Nom || 'N/A',
              prenom: data.Prenom || 'N/A',
              dateNaiss: data.Date_naiss ? new Date(data.Date_naiss).toISOString().split('T')[0] : 'N/A',
              email: data.Email || 'N/A',
              numeroTele: data.Numero_tele || 'N/A',
              cin: data.CIN || 'N/A',
            });
          } else {
            setError('Aucune donnée reçue de l\'API');
          }
        } else {
          setError(`Erreur API: ${response.status} - ${response.statusText}`);
          if (response.status === 401) {
            navigate('/login'); // Rediriger si non authentifié
          }
        }
      } catch (err) {
        console.error('Fetch error:', err.response ? err.response.data : err.message);
        setError('Erreur lors de la récupération des informations');
        if (err.response && err.response.status === 401) {
          navigate('/login'); // Rediriger si non authentifié (redondance pour sécurité)
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Header />
      <Sidebar />
      <main className="page-container">
        <h1 className="page-title">Informations Personnelles</h1>
        <div className="personal-info-container">
          <div className="info-row">
            <span className="info-label">Nom :</span>
            <span className="info-value">{userData.nom}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Prénom :</span>
            <span className="info-value">{userData.prenom}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date de Naissance :</span>
            <span className="info-value">{userData.dateNaiss}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email :</span>
            <span className="info-value">{userData.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Numéro de Téléphone :</span>
            <span className="info-value">{userData.numeroTele}</span>
          </div>
          <div className="info-row">
            <span className="info-label">CIN :</span>
            <span className="info-value">{userData.cin}</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="btn-update-infos" onClick={() => navigate('/espace-vacataire/edit-password')}>
              Modifier le Mot de Passe
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InfosPersonnelles;
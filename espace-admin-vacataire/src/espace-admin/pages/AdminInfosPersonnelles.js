import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../components/Sidebar';
import '../../style/infos-personnelles.css';

const InfosPersonnelles = () => {
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const authResponse = await axios.get(`${BACKEND_URL}/check-auth`, {
          withCredentials: true,
        });
        if (authResponse.status === 200 && authResponse.data.authenticated) {
          setUserRole(authResponse.data.user.role);
        } else {
          setError('Utilisateur non authentifié');
          navigate('/login');
        }
      } catch (err) {
        setError('Erreur lors de la vérification de l\'authentification');
        navigate('/login');
      }
    };

    const fetchUserData = async () => {
      try {
        let endpoint = userRole === 'vacataire' ? '/vacataire-info' : '/admin-info';
        const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          const data = response.data;
          if (userRole === 'vacataire') {
            setUserData({
              nom: data.Nom || 'N/A',
              prenom: data.Prenom || 'N/A',
              dateNaiss: data.Date_naiss ? new Date(data.Date_naiss).toISOString().split('T')[0] : 'N/A',
              email: data.Email || 'N/A',
              numeroTele: data.Numero_tele || 'N/A',
              cin: data.CIN || 'N/A',
            });
          } else {
            setUserData({
              nom: data.nom || 'N/A',
              prenom: data.prenom || 'N/A',
              email: data.email || 'N/A',
              username: data.username || 'N/A',
            });
          }
        } else {
          setError(`Erreur API: ${response.status} - ${response.statusText}`);
          if (response.status === 401) {
            navigate('/login');
          }
        }
      } catch (err) {
        setError('Erreur lors de la récupération des informations');
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole().then(() => {
      if (userRole) fetchUserData();
    });
  }, [navigate, userRole]);

  const handleEdit = () => {
    navigate('/espace-admin/edit-infos');
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>Aucune donnée disponible</div>;

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
          {userRole === 'vacataire' ? (
            <>
              <div className="info-row">
                <span className="info-label">Date de Naissance :</span>
                <span className="info-value">{userData.dateNaiss}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Numéro de Téléphone :</span>
                <span className="info-value">{userData.numeroTele}</span>
              </div>
              <div className="info-row">
                <span className="info-label">CIN :</span>
                <span className="info-value">{userData.cin}</span>
              </div>
            </>
          ) : (
            <div className="info-row">
              <span className="info-label">Nom d'utilisateur :</span>
              <span className="info-value">{userData.username}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Email :</span>
            <span className="info-value">{userData.email}</span>
          </div>

          {userRole !== 'vacataire' && (
          <div className="" style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="btn-update-infos" onClick={handleEdit}>
              Modifier
            </button>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default InfosPersonnelles;
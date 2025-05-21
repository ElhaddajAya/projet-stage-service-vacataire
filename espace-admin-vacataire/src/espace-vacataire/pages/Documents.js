import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../components/Sidebar';
import '../../style/documents.css'; // Nouveau fichier CSS

const Documents = () => {
  const [userData, setUserData] = useState({
    photo: null,
    cinFichier: null,
    cv: null,
    diplome: null,
    fonctionnaire: false,
    autorisationFichier: null,
    attestNonEmploi: null,
  });
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
        console.log('API Response:', response);

        if (response.status === 200) {
          const data = response.data;
          if (data) {
            setUserData({
              photo: data.Photo || null,
              cinFichier: data.CIN_fichier || null,
              cv: data.CV || null,
              diplome: data.Diplome || null,
              fonctionnaire: data.Fonctionnaire || false,
              autorisationFichier: data.Autorisation_fichier || null,
              attestNonEmploi: data.Attest_non_emploi || null,
            });
          } else {
            setError('Aucune donnée reçue de l\'API');
          }
        } else {
          setError(`Erreur API: ${response.status} - ${response.statusText}`);
          if (response.status === 401) {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Fetch error:', err.response ? err.response.data : err.message);
        setError('Erreur lors de la récupération des documents');
        if (err.response && err.response.status === 401) {
          navigate('/login');
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
        <h1 className="page-title">Mes Documents</h1>
        <div className="documents-container">
          <div className="doc-row">
            <span className="doc-label">Photo :</span>
            {userData.photo ? (
              <a href={`${BACKEND_URL}/${userData.photo}`} target="_blank" rel="noopener noreferrer">
                Voir la Photo
              </a>
            ) : (
              <span>Non disponible</span>
            )}
          </div>
          <div className="doc-row">
            <span className="doc-label">CIN (fichier) :</span>
            {userData.cinFichier ? (
              <a href={`${BACKEND_URL}/${userData.cinFichier}`} target="_blank" rel="noopener noreferrer">
                Voir le fichier CIN
              </a>
            ) : (
              <span>Non disponible</span>
            )}
          </div>
          <div className="doc-row">
            <span className="doc-label">CV :</span>
            {userData.cv ? (
              <a href={`${BACKEND_URL}/${userData.cv}`} target="_blank" rel="noopener noreferrer">
                Voir le CV
              </a>
            ) : (
              <span>Non disponible</span>
            )}
          </div>
          <div className="doc-row">
            <span className="doc-label">Diplôme :</span>
            {userData.diplome ? (
              <a href={`${BACKEND_URL}/${userData.diplome}`} target="_blank" rel="noopener noreferrer">
                Voir le Diplôme
              </a>
            ) : (
              <span>Non disponible</span>
            )}
          </div>
          <div className="doc-row">
            {userData.fonctionnaire ? (
              <>
                <span className="doc-label">Autorisation :</span>
                {userData.autorisationFichier ? (
                  <a href={`${BACKEND_URL}/${userData.autorisationFichier}`} target="_blank" rel="noopener noreferrer">
                    Voir l'Autorisation
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </>
            ) : (
              <>
                <span className="doc-label">Attestation de non-emploi :</span>
                {userData.attestNonEmploi ? (
                  <a href={`${BACKEND_URL}/${userData.attestNonEmploi}`} target="_blank" rel="noopener noreferrer">
                    Voir l'Attestation
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;
// espace-admin-vacataire/src/espace-admin/pages/EtudeDossier.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import '../../styles/global.css';

const EtudeDossier = () => {
  const { id } = useParams(); // Get the vacataire ID from the URL
  const [vacataire, setVacataire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVacataireDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/vacataire-details/${id}`, {
          withCredentials: true,
        });
        setVacataire(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des détails du vacataire');
        console.error('Fetch error:', err);
        setLoading(false);
      }
    };

    fetchVacataireDetails();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!vacataire) return <div>Vacataire non trouvé</div>;

  // Formater la date pour l'affichage (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
  };

  const handleValidateDossier = async () => {
    try {
      await axios.put(
        `http://localhost:5000/vacataire/${id}/update-etat`,
        { Etat_dossier: 'Validé' },
        { withCredentials: true }
      );
      alert('Dossier validé avec succès!');
      navigate('/espace-admin/vacataires');
    } catch (err) {
      console.error('Erreur lors de la validation du dossier:', err);
      setError('Erreur lors de la validation du dossier');
    }
  };

  const handleRefuseDossier = async () => {
    try {
      await axios.put(
        `http://localhost:5000/vacataire/${id}/update-etat`,
        { Etat_dossier: 'Refusé' },
        { withCredentials: true }
      );
      alert('Dossier refusé avec succès!');
      navigate('/espace-admin/vacataires');
    } catch (err) {
      console.error('Erreur lors du refus du dossier:', err);
      setError('Erreur lors du refus du dossier');
    }
  };

  return (
    <div>
      <Header />
      <main className="page-container">
        <h1 className="page-title">Étude du Dossier - {vacataire.Nom} {vacataire.Prenom || ''}</h1>
        <div className="vacataire-details">
          <div className="details-grid">
            <div className="details-section">
              <h2>Informations Personnelles</h2>
              <div className="detail-row">
                <span className="detail-label">Nom:</span>
                <span>{vacataire.Nom}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Prénom:</span>
                <span>{vacataire.Prenom || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date de Naissance:</span>
                <span>{formatDate(vacataire.Date_naiss)}</span> {/* Fixed date formatting */}
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span>{vacataire.Email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Numéro de Téléphone:</span>
                <span>{vacataire.Numero_tele || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">CIN:</span>
                <span>{vacataire.CIN || 'N/A'}</span>
              </div>
            </div>

            <div className="details-section">
              <h2>Documents</h2>
              <div className="detail-row">
                <span className="detail-label">Photo:</span>
                {vacataire.Photo ? (
                  <a href={vacataire.Photo} target="_blank" rel="noopener noreferrer">
                    Voir la Photo
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">CV:</span>
                {vacataire.CV ? (
                  <a href={vacataire.CV} target="_blank" rel="noopener noreferrer">
                    Voir le CV
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">Attestation:</span>
                {vacataire.Attest_non_emploi ? (
                  <a href={vacataire.Attest_non_emploi} target="_blank" rel="noopener noreferrer">
                    Voir l'Attestation
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </div>
            </div>

            <div className="details-section">
              <h2>Autres Informations</h2>
              <div className="detail-row">
                <span className="detail-label">Département:</span>
                <span>{vacataire.Diplome || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">État de Dossier:</span>
                <span>{vacataire.EtatDossier || 'N/A'}</span> {/* Use EtatDossier from backend */}
              </div>
              <div className="detail-row">
                <span className="detail-label">État de Virement:</span>
                <span>{vacataire.EtatVirement || 'N/A'}</span> {/* Use EtatVirement from backend */}
              </div>
            </div>
          </div>

          <div className="button-group">
            <button className="btn-retour" onClick={() => navigate('/espace-admin/vacataires')}>
              Retour
            </button>
            <button className="btn-valider" onClick={handleValidateDossier}>
              Valider dossier
            </button>
            <button className="btn-refuser" onClick={handleRefuseDossier}>
              Refuser dossier
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EtudeDossier;
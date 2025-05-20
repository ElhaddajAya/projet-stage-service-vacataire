import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import '../../styles/global.css';

const EtudeDossier = () => {
  const { id } = useParams();
  const [vacataire, setVacataire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();
  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchVacataireDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/vacataire-details/${id}`, {
          withCredentials: true,
        });
        console.log('Response data:', response.data); // Débogage
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
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
    if (!problemType || !description.trim()) {
      alert('Veuillez sélectionner un type de problème et fournir une description.');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/vacataire/${id}/update-etat`,
        { 
          Etat_dossier: 'Refusé',
          Refus_reason: { problemType, description }
        },
        { withCredentials: true }
      );
      alert('Dossier refusé avec succès!');
      setShowRefuseModal(false);
      setProblemType('');
      setDescription('');
      setShowRefuseModal(false);
      setProblemType('');
      setDescription('');
      navigate('/espace-admin/vacataires');
    } catch (err) {
      console.error('Erreur lors du refus du dossier:', err);
      setError('Erreur lors du refus du dossier');
    }
  };

  const handleOpenRefuseModal = () => {
    setShowRefuseModal(true);
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
                <span className="detail-label">Nom :</span>
                <span>{vacataire.Nom || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Prénom :</span>
                <span>{vacataire.Prenom || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date de Naissance :</span>
                <span>{formatDate(vacataire.Date_naiss)}</span>
                <span>{formatDate(vacataire.Date_naiss)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email :</span>
                <span>{vacataire.Email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Numéro de Téléphone :</span>
                <span>{vacataire.Numero_tele || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">CIN :</span>
                <span>{vacataire.CIN || 'N/A'}</span>
              </div>
            </div>

            <div className="details-section">
              <h2>Documents</h2>
              <div className="detail-row">
                <span className="detail-label">Photo :</span>
                {vacataire.Photo ? (
                  <a href={`http://localhost:5000/${vacataire.Photo}`} target="_blank" rel="noopener noreferrer">
                    Voir la Photo
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">CIN (fichier) :</span>
                {vacataire.CIN_fichier ? (
                  <a href={`${BACKEND_URL}/${vacataire.CIN_fichier}`} target="_blank" rel="noopener noreferrer">
                    Voir le fichier CIN
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">CV :</span>
                {vacataire.CV ? (
                  <a href={`http://localhost:5000/${vacataire.CV}`} target="_blank" rel="noopener noreferrer">
                    Voir le CV
                  </a>
                ) : (
                  <span>Non disponible</span>
                )}
              </div>
              <div className="detail-row">
                {vacataire.Fonctionnaire ? (
                  <>
                    <span className="detail-label">Autorisation :</span>
                    {vacataire.Autorisation_fichier ? (
                      <a href={`http://localhost:5000/${vacataire.Autorisation_fichier}`} target="_blank" rel="noopener noreferrer">
                        Voir l'Autorisation
                      </a>
                    ) : (
                      <span>Non disponible</span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="detail-label">Attestation de non-emploi :</span>
                    {vacataire.Attest_non_emploi ? (
                      <a href={`http://localhost:5000/${vacataire.Attest_non_emploi}`} target="_blank" rel="noopener noreferrer">
                        Voir l'Attestation
                      </a>
                    ) : (
                      <span>Non disponible</span>
                    )}
                  </>
                )}
              </div>
              {vacataire.Fonctionnaire ? (
                <div className="detail-row">
                  <span className="detail-label">Autorisation :</span>
                  {vacataire.Autorisation_fichier ? (
                    <a href={`${BACKEND_URL}/${vacataire.Autorisation_fichier}`} target="_blank" rel="noopener noreferrer">
                      Voir l'Autorisation
                    </a>
                  ) : (
                    <span>Non disponible</span>
                  )}
                </div>
              ) : (
                <div className="detail-row">
                  <span className="detail-label">Attestation de non-emploi :</span>
                  {vacataire.Attest_non_emploi ? (
                    <a href={`${BACKEND_URL}/${vacataire.Attest_non_emploi}`} target="_blank" rel="noopener noreferrer">
                      Voir l'Attestation
                    </a>
                  ) : (
                    <span>Non disponible</span>
                  )}
                </div>
              )}
            </div>

            <div className="details-section">
              <h2>Matières Enseignées</h2>
              {vacataire.Enseignements && vacataire.Enseignements.length > 0 ? (
                <div className="enseignement-table-container">
                  <table className="enseignement-table">
                    <thead>
                      <tr>
                        <th>Matière</th>
                        <th>Filière</th>
                        <th>Nombre d'heures</th>
                        <th>Semestre</th>
                        <th>Nombre de semaines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacataire.Enseignements.map((enseignement, index) => (
                        <tr key={index}>
                          <td>{enseignement.Matiere || 'N/A'}</td>
                          <td>{enseignement.Filiere || 'N/A'}</td>
                          <td>{enseignement.Nombre_heures || 'N/A'}</td>
                          <td>{enseignement.Semestre || 'N/A'}</td>
                          <td>{enseignement.Nbr_semaines || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Aucune matière enseignée enregistrée.</p>
              )}
            </div>
          </div>

          <div className="button-group">
            <button className="btn-retour" onClick={() => navigate('/espace-admin/vacataires')}>
              Retour
            </button>
            <button
              className="btn-valider"
              onClick={handleValidateDossier}
              disabled={vacataire.EtatDossier === 'Validé' && vacataire.EtatVirement === 'Effectué'}
            >
              Valider dossier
            </button>
            <button
              className="btn-refuser"
              onClick={handleOpenRefuseModal}
              disabled={vacataire.EtatDossier === 'Validé' && vacataire.EtatVirement === 'Effectué'}
            >
              Refuser dossier
            </button>
          </div>
        </div>

        {showRefuseModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Spécifier le problème</h2>
              <p>Veuillez indiquer la raison du refus :</p>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    value="Document(s) incorrect(s)"
                    checked={problemType === 'Document(s) incorrect(s)'}
                    onChange={(e) => setProblemType(e.target.value)}
                  />
                  Document(s) incorrect(s)
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Document(s) manquant(s)"
                    checked={problemType === 'Document(s) manquant(s)'}
                    onChange={(e) => setProblemType(e.target.value)}
                  />
                  Document(s) manquant(s)
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Autre"
                    checked={problemType === 'Autre'}
                    onChange={(e) => setProblemType(e.target.value)}
                  />
                  Autre
                </label>
              </div>
              <div className="description-field">
                <label>
                  <p>Description du problème :</p>
                  <p>Description du problème :</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le problème..."
                    rows="4"
                  />
                </label>
              </div>
              <div className="modal-buttons">
                <button
                  className="btn-valider"
                  onClick={handleRefuseDossier}
                  disabled={!problemType || !description.trim() || (vacataire.EtatDossier === 'Validé' && vacataire.EtatVirement === 'Effectué')}
                >
                  Confirmer refus
                </button>
                <button
                  className="btn-annuler"
                  onClick={() => {
                    setShowRefuseModal(false);
                    setProblemType('');
                    setDescription('');
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EtudeDossier;
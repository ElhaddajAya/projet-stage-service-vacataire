import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Phase3 = ({ onPhaseComplete, handleNextSubStep, isRefused }) => {
  const [status, setStatus] = useState({ Etat_dossier: 'En attente', Etat_virement: 'En attente' });
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/vacataire-info', { withCredentials: true });
        const { Etat_dossier, Etat_virement } = response.data;
        setStatus({ Etat_dossier, Etat_virement });
        if (!isRefused) {
          if (Etat_dossier === 'En cours' && Etat_virement === 'En attente') setActiveCard(1);
          else if (Etat_dossier === 'Validé' && Etat_virement === 'En attente') setActiveCard(2);
          else if (Etat_dossier === 'Validé' && Etat_virement === 'Effectué') setActiveCard(3);
          else setActiveCard(0);
        } else setActiveCard(0);
      } catch (err) {
        console.error('Erreur lors de la récupération des statuts:', err);
      }
    };
    fetchStatus();
  }, [isRefused]);

  return (
    <>
      <h2>Phase 3 - Virement</h2>
      <form className="form phase3-form">
        <div className="status-container">
          <div className={`status-card status-card-1 ${!isRefused && activeCard === 1 ? 'active' : ''} ${isRefused ? 'refused' : ''}`} onClick={() => !isRefused && activeCard >= 1 && handleNextSubStep()}>
            <h3>En cours</h3>
            <p>Votre dossier est en cours d’étude par le comptable. Cela peut prendre quelques jours.</p>
          </div>
          <div className={`status-card status-card-2 ${!isRefused && activeCard === 2 ? 'active' : ''} ${isRefused ? 'refused' : ''}`} onClick={() => !isRefused && activeCard >= 2 && handleNextSubStep()}>
            <h3>Dossier validé</h3>
            <p>Votre dossier a été validé. Veuillez attendre votre virement.</p>
          </div>
          <div className={`status-card status-card-3 ${!isRefused && activeCard === 3 ? 'active' : ''} ${isRefused ? 'refused' : ''}`} onClick={() => !isRefused && activeCard >= 3 && handleNextSubStep()}>
            <h3>Effectué</h3>
            <p>Le virement a été effectué. Vous recevrez votre paiement sous peu.</p>
          </div>
        </div>
        {!isRefused && activeCard < 3 && (
          <div className="buttons">
            <button type="button" onClick={handleNextSubStep} disabled={isRefused || activeCard === 3}>
              Simuler prochaine étape
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default Phase3;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Phase3 = ({ onPhaseComplete, subStep, handleNextSubStep }) => {
  const [status, setStatus] = useState({ Etat_dossier: 'en attente', Etat_virement: 'en attente' });
  const [activeCard, setActiveCard] = useState(1);

  // Fetch Etat_dossier and Etat_virement from the backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/vacataire-info', {
          withCredentials: true,
        });
        const { Etat_dossier, Etat_virement } = response.data;
        setStatus({ Etat_dossier, Etat_virement });

        // Determine the active card based on Etat_dossier and Etat_virement
        if (Etat_dossier === 'En attente' && Etat_virement === 'En attente') {
          setActiveCard(1); // Card 1: "En cours"
        } else if (Etat_dossier === 'Validé' && Etat_virement === 'En attente') {
          setActiveCard(2); // Card 2: "Dossier validé, attendez votre virement"
        } else if (Etat_dossier === 'Validé' && Etat_virement === 'Effectué') {
          setActiveCard(3); // Card 3: "Effectué"
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des statuts:', err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <>
      <h2>Phase 3 - Virement</h2>
      <form className="form phase3-form">
        <div className="status-container">
          {/* Card 1: Previously "En cours", now first */}
          <div className={`status-card status-card-1 ${activeCard === 1 ? 'active' : ''}`}>
            <h3>En cours</h3>
            <p>Votre dossier est en cours d’étude par le comptable. Cela peut prendre quelques jours.</p>
          </div>
          {/* Card 2: New card replacing the old "En cours" */}
          <div className={`status-card status-card-2 ${activeCard === 2 ? 'active' : ''}`}>
            <h3>Dossier validé</h3>
            <p>Votre dossier a été validé. Veuillez attendre votre virement.</p>
          </div>
          {/* Card 3: Unchanged "Effectué" */}
          <div className={`status-card status-card-3 ${activeCard === 3 ? 'active' : ''}`}>
            <h3>Effectué</h3>
            <p>Le virement a été effectué. Vous recevrez votre paiement sous peu.</p>
          </div>
        </div>
        {/* {subStep < 3 && (
          <div className="buttons">
            <button type="button" onClick={handleNextSubStep}>
              Simuler prochaine étape
            </button>
          </div>
        )} */}
      </form>
    </>
  );
};

export default Phase3;
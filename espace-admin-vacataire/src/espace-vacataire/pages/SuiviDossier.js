import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import '../../styles/global.css';
import '../../style/phase1.css';
import '../../style/phase2.css';
import '../../style/phase3.css';
import Phase1 from './Phase1';
import Phase2 from './Phase2';
import Phase3 from './Phase3';

const SuiviDossier = () => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [isVirementEffectue, setIsVirementEffectue] = useState(false);
  // message Refuser
  const [dossierStatus, setDossierStatus] = useState(null);


  // Récupérer l'état du vacataire au montage du composant
  useEffect(() => {
    const fetchVacatairePhase = async () => {
      try {
        const response = await fetch('http://localhost:5000/vacataire-info', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          let phase = 1;
          let subStep = 1;

          // Vérifier si les informations personnelles sont complètes (Phase 1)
          const personalInfoComplete =
            data.Nom &&
            data.Prenom &&
            data.Email &&
            data.Numero_tele &&
            data.CIN &&
            data.Date_naiss;

          if (personalInfoComplete) {
            phase = 2; // Passer à la Phase 2 si les informations personnelles sont complètes

            // Vérifier si les documents sont soumis (Phase 2)
            const documentsSubmitted =
              data.Photo &&
              data.CIN_fichier &&
              data.CV &&
              data.Diplome &&
              (data.Fonctionnaire ? data.Autorisation_fichier : data.Attest_non_emploi);

            if (documentsSubmitted || data.Etat_dossier === 'En cours' || data.Etat_dossier === 'Validé') {
              phase = 3; // Passer à la Phase 3 si les documents sont soumis ou si le dossier est en cours/validé

              // Déterminer subStep pour la Phase 3 en fonction de Etat_dossier et Etat_virement
              if (data.Etat_dossier === 'En cours' && data.Etat_virement === 'En attente') {
                subStep = 1; // Carte 1: "En cours"
              } else if (data.Etat_dossier === 'Validé' && data.Etat_virement === 'En attente') {
                subStep = 2; // Carte 2: "Dossier validé"
              } else if (data.Etat_dossier === 'Validé' && data.Etat_virement === 'Effectué') {
                subStep = 3; // Carte 3: "Effectué"
              } else if (data.Etat_dossier === 'Refusé') {
                subStep = 3; // Carte 4: "Dossier refusé"
              }
            }
          }

          // Déterminer si le virement est effectué
          setIsVirementEffectue(data.Etat_virement === 'Effectué' || data.Etat_dossier === 'Validé');
          setCurrentPhase(phase);
          setSubStep(subStep);
          // message Refuser
          setDossierStatus(data.Etat_dossier);
        } else {
          console.error('Erreur lors de la récupération des données du vacataire');
        }
      } catch (err) {
        console.error('Erreur réseau lors de la récupération des données:', err);
      }
    };

    fetchVacatairePhase();
  }, []);

  const handleNextPhase = (newPhase) => {
    if (newPhase && newPhase > currentPhase) {
      setCurrentPhase(newPhase);
    } else if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handlePreviousPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
      if (currentPhase === 3) setSubStep(1);
    }
  };

  const handleNextSubStep = () => {
    if (currentPhase === 3 && subStep < 3) {
      setSubStep(subStep + 1);
    }
  };

  const handleCircleClick = (phase) => {
    // Prevent navigation to Phases 1 and 2 if virement is effectué
    if (isVirementEffectue && phase !== 3) {
      return;
    }
    setCurrentPhase(phase);
    if (phase !== 3) {
      setSubStep(1);
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 1:
        return <Phase1 onPhaseComplete={handleNextPhase} />;
      case 2:
        return <Phase2 onPhaseComplete={handleNextPhase} />;
      case 3:
        return (
          <Phase3
            onPhaseComplete={handleNextPhase}
            subStep={subStep}
            handleNextSubStep={handleNextSubStep}
          />
        );
      default:
        return <Phase1 onPhaseComplete={handleNextPhase} />;
    }
  };

  return (
    <div>
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
           {dossierStatus === 'Refusé' && (
            <div className="message-bar">
               <div id='textMsgBar'>Dossier refusé : </div> Le document CV n'est pas conforme.
            </div>
          )} 
          <ProgressBar
            step={currentPhase}
            subStep={currentPhase === 3 ? subStep : 0}
            onCircleClick={handleCircleClick}
            isVirementEffectue={isVirementEffectue} // Passer la prop
          />
          {renderPhase()}
        </div>
      </div>
    </div>
  );
};

export default SuiviDossier;
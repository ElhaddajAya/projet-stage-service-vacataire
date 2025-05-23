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
  const [dossierStatus, setDossierStatus] = useState(null);
  const [refusReason, setRefusReason] = useState(null);
  const [phase1Complete, setPhase1Complete] = useState(false);
  const [phase2Complete, setPhase2Complete] = useState(false);
  const [delaiDepot, setDelaiDepot] = useState(null);
  const [isPastDeadline, setIsPastDeadline] = useState(false);

  const fetchVacatairePhase = async () => {
    try {
      const response = await fetch('http://localhost:5000/vacataire-info', { method: 'GET', credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        let phase = 1;
        let subStep = 1;

        const personalInfoComplete = data.Nom && data.Prenom && data.Email && data.Numero_tele && data.CIN && data.Date_naiss;
        setPhase1Complete(personalInfoComplete);

        if (personalInfoComplete) {
          phase = 2;
          const documentsSubmitted = data.Photo && data.CIN_fichier && data.CV && data.Diplome && (data.Fonctionnaire ? data.Autorisation_fichier : data.Attest_non_emploi);
          setPhase2Complete(documentsSubmitted);

          if (documentsSubmitted || data.Etat_dossier === 'En cours' || data.Etat_dossier === 'Validé' || data.Etat_dossier === 'Refusé') {
            phase = 3;
            if (data.Etat_dossier === 'En cours' && data.Etat_virement === 'En attente') subStep = 1;
            else if (data.Etat_dossier === 'Validé' && data.Etat_virement === 'En attente') subStep = 2;
            else if (data.Etat_dossier === 'Validé' && data.Etat_virement === 'Effectué') subStep = 3;
            else if (data.Etat_dossier === 'Refusé') subStep = 1;
          }
        }

        setIsVirementEffectue(data.Etat_virement === 'Effectué' || data.Etat_dossier === 'Validé');
        setCurrentPhase(phase);
        setSubStep(subStep);
        setDossierStatus(data.Etat_dossier);
        setRefusReason(data.Etat_dossier === 'Refusé' ? data.Refus_reason : null);
      } else console.error('Erreur lors de la récupération des données du vacataire');
    } catch (err) {
      console.error('Erreur réseau:', err);
    }
  };

  useEffect(() => {
    const fetchDelaiDepot = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-delai-depot', { method: 'GET', credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const deadline = new Date(data.delai_depot);
          setDelaiDepot(deadline);

          const now = new Date();
          setIsPastDeadline(now > deadline);
        } else {
          console.error('Erreur lors de la récupération du délai de dépôt');
        }
      } catch (err) {
        console.error('Erreur réseau:', err);
      }
    };

    fetchVacatairePhase();
    fetchDelaiDepot();
  }, []);

  const handleNextPhase = (newPhase) => {
    if (newPhase > currentPhase) {
      setCurrentPhase(newPhase);
    } else if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1);
    }
    fetchVacatairePhase(); // Re-fetch data to update completion states
  };

  const handlePreviousPhase = () => currentPhase > 1 && (setCurrentPhase(currentPhase - 1) || (currentPhase === 3 && setSubStep(1)));
  const handleNextSubStep = () => currentPhase === 3 && subStep < 3 && setSubStep(subStep + 1);
  const handleCircleClick = (phase) => (isPastDeadline ? null : (setCurrentPhase(phase) || (phase !== 3 && setSubStep(1))));

  const renderPhase = () => {
    switch (currentPhase) {
      case 1: return <Phase1 onPhaseComplete={handleNextPhase} isPastDeadline={isPastDeadline} onUpdate={fetchVacatairePhase} />;
      case 2: return <Phase2 onPhaseComplete={handleNextPhase} isPastDeadline={isPastDeadline} dossierStatus={dossierStatus} onUpdate={fetchVacatairePhase} />;
      case 3: return <Phase3 onPhaseComplete={handleNextPhase} subStep={subStep} handleNextSubStep={handleNextSubStep} isRefused={dossierStatus === 'Refusé'} />;
      default: return <Phase1 onPhaseComplete={handleNextPhase} isPastDeadline={isPastDeadline} onUpdate={fetchVacatairePhase} />;
    }
  };

  return (
    <div>
      <Header />
      <div className="main">
        <input type="checkbox" id="check" />
        <label htmlFor="check">
          <i className="fas fa-bars" id="btn"></i>
          <i className="fas fa-times" id="cancel"></i>
        </label>
        <Sidebar />
        <div className="page-container">
          {delaiDepot && (
            <div className={isPastDeadline ? 'message-bar' : 'message-bar-delai'}>
              {isPastDeadline ? (
                <span>Le délai de dépôt des documents est dépassé.</span>
              ) : (
                <span><strong>Délai de dépôt : </strong>{delaiDepot.toLocaleString()}</span>
              )}
            </div>
          )}
          {dossierStatus === 'Refusé' && refusReason && (
            <div className="message-bar">
              <div id="textMsgBar">{refusReason.title === 'Autre' || !refusReason.title ? "Dossier refusé" : refusReason.title} : </div>
              {refusReason.description && <span>{refusReason.description}</span>}
            </div>
          )}
          <ProgressBar
            step={dossierStatus === 'Refused' ? 3 : currentPhase}
            subStep={currentPhase === 3 ? subStep : 0}
            onCircleClick={handleCircleClick}
            isVirementEffectue={isVirementEffectue}
            phase1Complete={phase1Complete}
            phase2Complete={phase2Complete}
            isDisabled={isPastDeadline}
          />
          <div className="content">
            {renderPhase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiviDossier;
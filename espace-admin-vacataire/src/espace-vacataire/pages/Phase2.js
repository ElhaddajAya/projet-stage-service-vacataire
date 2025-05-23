import React, { useState, useEffect } from 'react';
import '../../style/phase2.css';
import axios from 'axios';

const extractFilename = (path) => {
  if (!path) return null;
  const filename = path.split('/').pop();
  const baseName = filename.split('-').pop();
  return baseName.split('.')[0];
};

const Phase2 = ({ onPhaseComplete, isPastDeadline, dossierStatus, onUpdate }) => {
  const [fileObjects, setFileObjects] = useState(() => {
    const savedFiles = localStorage.getItem('phase2FileObjects');
    return savedFiles ? JSON.parse(savedFiles) : {
      photo: null,
      cin: null,
      cv: null,
      diplome: null,
      autorisation: null,
      attestation: null,
    };
  });
  const [existingFiles, setExistingFiles] = useState({
    photo: null,
    cin: null,
    cv: null,
    diplome: null,
    autorisation: null,
    attestation: null,
  });
  const [isFonctionnaire, setIsFonctionnaire] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('phase2FileObjects', JSON.stringify(fileObjects));
  }, [fileObjects]);

  useEffect(() => {
    const fetchVacataireData = async () => {
      try {
        const response = await fetch('http://localhost:5000/vacataire-info', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setExistingFiles({
            photo: extractFilename(data.Photo),
            cin: extractFilename(data.CIN_fichier),
            cv: extractFilename(data.CV),
            diplome: extractFilename(data.Diplome),
            autorisation: extractFilename(data.Autorisation_fichier),
            attestation: extractFilename(data.Attest_non_emploi),
          });
          setIsFonctionnaire(data.Fonctionnaire !== null ? !!data.Fonctionnaire : null);
        } else {
          console.error('Erreur lors de la récupération des données:', response.status, response.statusText);
          setMessage(`❌ Erreur lors de la récupération des données: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Erreur réseau:', err);
        setMessage('❌ Erreur réseau lors de la récupération des données');
      }
    };

    fetchVacataireData();
  }, []);

  const handleFileChange = (e, fileType) => {
    if (isPastDeadline) return;
    if (e.target.files.length > 0) {
      setFileObjects((prev) => ({
        ...prev,
        [fileType]: e.target.files[0],
      }));
    } else {
      setFileObjects((prev) => ({
        ...prev,
        [fileType]: null,
      }));
    }
  };

  const handleFonctionnaireChange = (value) => {
    if (isPastDeadline) return;
    setIsFonctionnaire(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPastDeadline) {
      setMessage('❌ Le délai de dépôt est dépassé');
      return;
    }
    setMessage('');

    // Validate required fields
    if (!fileObjects.photo && !existingFiles.photo) {
      setMessage('❌ Veuillez sélectionner une photo');
      return;
    }
    if (!fileObjects.cin && !existingFiles.cin) {
      setMessage('❌ Veuillez sélectionner un fichier CIN');
      return;
    }
    if (!fileObjects.cv && !existingFiles.cv) {
      setMessage('❌ Veuillez sélectionner un fichier CV');
      return;
    }
    if (!fileObjects.diplome && !existingFiles.diplome) {
      setMessage('❌ Veuillez sélectionner un fichier Diplômes');
      return;
    }
    if (isFonctionnaire === null) {
      setMessage('❌ Veuillez indiquer si vous êtes fonctionnaire');
      return;
    }
    if (isFonctionnaire && !fileObjects.autorisation && !existingFiles.autorisation) {
      setMessage('❌ Veuillez sélectionner un fichier Autorisation');
      return;
    }
    if (!isFonctionnaire && !fileObjects.attestation && !existingFiles.attestation) {
      setMessage('❌ Veuillez sélectionner une Attestation de non emploi');
      return;
    }

    const formData = new FormData();
    Object.keys(fileObjects).forEach((key) => {
      if (fileObjects[key]) {
        formData.append(key, fileObjects[key]);
        console.log(`Added ${key}: ${fileObjects[key].name}`);
      }
    });
    // Send isFonctionnaire as a string to match backend expectation
    formData.append('isFonctionnaire', String(isFonctionnaire));
    console.log('isFonctionnaire:', String(isFonctionnaire));

    try {
      const response = await axios.post('http://localhost:5000/upload-documents', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setMessage('✅ Documents téléchargés avec succès');
        setFileObjects({
          photo: null,
          cin: null,
          cv: null,
          diplome: null,
          autorisation: null,
          attestation: null,
        });
        localStorage.removeItem('phase2FileObjects');
        const updatedResponse = await fetch('http://localhost:5000/vacataire-info', {
          method: 'GET',
          credentials: 'include',
        });
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setExistingFiles({
            photo: extractFilename(updatedData.Photo),
            cin: extractFilename(updatedData.CIN_fichier),
            cv: extractFilename(updatedData.CV),
            diplome: extractFilename(updatedData.Diplome),
            autorisation: extractFilename(updatedData.Autorisation_fichier),
            attestation: extractFilename(updatedData.Attest_non_emploi),
          });
        }
        onUpdate(); // Trigger parent to re-fetch data
        // if (dossierStatus === 'Refusé') {
        //   window.location.reload();
        // } else {
        //   onPhaseComplete(3);
        // }
        onPhaseComplete(3);

      } else {
        setMessage(`❌ Erreur lors du téléchargement: ${response.status} - ${response.statusText}`);
        console.error('Server response:', response.data);
      }
    } catch (err) {
      setMessage(`❌ Erreur lors du téléchargement: ${err.response?.data?.message || err.message}`);
      console.error('Error details:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <>
      <h2>Phase 2 - Documents exigés</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group file-upload">
          <label>Photo</label>
          <input
            type="file"
            name="photo"
            onChange={(e) => handleFileChange(e, 'photo')}
            accept="image/png, image/jpeg, image/jpg"
            required={!existingFiles.photo}
            disabled={isPastDeadline}
          />
          {(fileObjects.photo || existingFiles.photo) && (
            <div className="file-name">
              {fileObjects.photo ? fileObjects.photo.name : existingFiles.photo}
            </div>
          )}
        </div>

        <div className="form-group file-upload">
          <label>Fichier CIN</label>
          <input
            type="file"
            name="cin"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'cin')}
            required={!existingFiles.cin}
            disabled={isPastDeadline}
          />
          {(fileObjects.cin || existingFiles.cin) && (
            <div className="file-name">
              {fileObjects.cin ? fileObjects.cin.name : existingFiles.cin}
            </div>
          )}
        </div>

        <div className="form-group file-upload">
          <label>Fichier CV</label>
          <input
            accept="application/pdf"
            name="cv"
            type="file"
            onChange={(e) => handleFileChange(e, 'cv')}
            required={!existingFiles.cv}
            disabled={isPastDeadline}
          />
          {(fileObjects.cv || existingFiles.cv) && (
            <div className="file-name">
              {fileObjects.cv ? fileObjects.cv.name : existingFiles.cv}
            </div>
          )}
        </div>

        <div className="form-group file-upload">
          <label>Fichier Diplômes</label>
          <input
            type="file"
            name="diplome"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'diplome')}
            required={!existingFiles.diplome}
            disabled={isPastDeadline}
          />
          {(fileObjects.diplome || existingFiles.diplome) && (
            <div className="file-name">
              {fileObjects.diplome ? fileObjects.diplome.name : existingFiles.diplome}
            </div>
          )}
          <small>Tous les diplômes obtenus dans un seul fichier .pdf</small>
        </div>

        <div className="form-group radio-group">
          <label>Fonctionnaire :</label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="fonctionnaire"
                checked={isFonctionnaire === true}
                onChange={() => handleFonctionnaireChange(true)}
                disabled={isPastDeadline}
              /> Oui
            </label>
            <label>
              <input
                type="radio"
                name="fonctionnaire"
                checked={isFonctionnaire === false}
                onChange={() => handleFonctionnaireChange(false)}
                disabled={isPastDeadline}
              /> Non
            </label>
          </div>
        </div>

        {isFonctionnaire !== null && (
          <div className="form-group file-upload">
            <label>{isFonctionnaire ? 'Fichier Autorisation' : 'Attestation de non emploi'}</label>
            <input
              type="file"
              name={isFonctionnaire ? 'autorisation' : 'attestation'}
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, isFonctionnaire ? 'autorisation' : 'attestation')}
              required={!existingFiles[isFonctionnaire ? 'autorisation' : 'attestation']}
              disabled={isPastDeadline}
            />
            {(fileObjects[isFonctionnaire ? 'autorisation' : 'attestation'] || existingFiles[isFonctionnaire ? 'autorisation' : 'attestation']) && (
              <div className="file-name">
                {fileObjects[isFonctionnaire ? 'autorisation' : 'attestation']
                  ? fileObjects[isFonctionnaire ? 'autorisation' : 'attestation'].name
                  : existingFiles[isFonctionnaire ? 'autorisation' : 'attestation']}
              </div>
            )}
          </div>
        )}

        {message && <div className="error-global">{message}</div>}

        <div className="buttons">
          <button type="button" disabled={isPastDeadline} onClick={() => {
            if (isPastDeadline) return;
            localStorage.removeItem('phase2FileObjects');
            setFileObjects({
              photo: null,
              cin: null,
              cv: null,
              diplome: null,
              autorisation: null,
              attestation: null,
            });
          }}>
            Annuler
          </button>
          <button type="submit" disabled={isPastDeadline}>Soumettre</button>
        </div>
      </form>
    </>
  );
};

export default Phase2;
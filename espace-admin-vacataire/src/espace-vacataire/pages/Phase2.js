import React, { useState, useEffect } from 'react';
import '../../style/phase2.css';
import axios from 'axios';

// Utility function to extract filename from path
const extractFilename = (path) => {
  if (!path) return null;
  return path.split('/').pop(); // e.g., "uploads/1621357890-photo.jpg" -> "1621357890-photo.jpg"
};

const Phase2 = ({ onPhaseComplete }) => {
    const [fileObjects, setFileObjects] = useState({
        photo: null,
        cin: null,
        cv: null,
        diplome: null,
        autorisation: null,
        attestation: null,
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

    const handleFileChange = (e, fileType) => {
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

    // Fetch existing documents and Fonctionnaire status on mount
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
          console.error('Erreur lors de la récupération des données');
        }
      } catch (err) {
        console.error('Erreur réseau', err);
      }
    };

    fetchVacataireData();
  }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const formData = new FormData();
        Object.keys(fileObjects).forEach((key) => {
        if (fileObjects[key]) {
            formData.append(key, fileObjects[key]);
        }
        });
        formData.append('isFonctionnaire', isFonctionnaire !== null ? isFonctionnaire : false);

        try {
        const response = await axios.post('http://localhost:5000/upload-documents', formData, {
            withCredentials: true,
            headers: {
            'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            setMessage('✅ Documents téléchargés avec succès');
            onPhaseComplete(3); // Advance to Phase 3
        } else {
            setMessage('❌ Erreur lors du téléchargement des documents');
        }
        } catch (err) {
        setMessage('❌ Erreur lors du téléchargement des documents');
        console.error(err);
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
                        accept="pdf/pdf"
                        onChange={(e) => handleFileChange(e, 'cin')}
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
                        accept='pdf/pdf'
                        name="cv"
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'cv')}
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
                        accept="pdf/pdf"
                        onChange={(e) => handleFileChange(e, 'diplome')}
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
                                onChange={() => setIsFonctionnaire(true)}
                            /> Oui
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="fonctionnaire" 
                                checked={isFonctionnaire === false} 
                                onChange={() => setIsFonctionnaire(false)}
                            /> Non
                        </label>
                    </div>
                </div>

                {isFonctionnaire !== null && (
                    <div className="form-group file-upload">
                        <label>{isFonctionnaire ? "Fichier Autorisation" : "Attestation de non emploi"}</label>
                        <input 
                            type="file" 
                            name={isFonctionnaire ? "autorisation" : "attestation"}
                            accept="pdf/pdf"
                            onChange={(e) => handleFileChange(e, isFonctionnaire ? 'autorisation' : 'attestation')}
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
                    <button type="button">Annuler</button>
                    <button type="submit">Soumettre</button>
                </div>
            </form>
        </>
    );
};

export default Phase2;

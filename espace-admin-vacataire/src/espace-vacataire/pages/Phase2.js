// src/espace-vacataire/pages/Phase2.js
import React, { useState } from 'react';
import '../../style/phase2.css';

const Phase2 = () => {
    const [fileNames, setFileNames] = useState({});
    const [isFonctionnaire, setIsFonctionnaire] = useState(null);

    const handleFileChange = (e, fileType) => {
        if (e.target.files.length > 0) {
            setFileNames((prev) => ({
                ...prev,
                [fileType]: e.target.files[0].name,
            }));
        } else {
            setFileNames((prev) => ({
                ...prev,
                [fileType]: '',
            }));
        }
    };

    return (
        <>
            <h2>Phase 2 - Documents exigés</h2>
            <form className="form">

                <div className="form-group file-upload">
                    <label>Photo</label>
                    <input 
                        type="file" 
                        name="photo"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        accept="image/*"
                    />
                    {/* {fileName && <div className="file-name">{fileName}</div>} */}
                </div>

                <div className="form-group file-upload">
                    <label>Fichier CIN</label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'cin')}
                    />
                    {/* {fileNames.cin && <div className="file-name">{fileNames.cin}</div>} */}
                </div>

                <div className="form-group file-upload">
                    <label>Fichier CV</label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'cv')}
                    />
                    {/* {fileNames.cv && <div className="file-name">{fileNames.cv}</div>} */}
                </div>

                <div className="form-group file-upload">
                    <label>Fichier Diplômes</label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'diplome')}
                    />
                    {/* {fileNames.diplome && <div className="file-name">{fileNames.diplome}</div>} */}
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
                            onChange={(e) => handleFileChange(e, isFonctionnaire ? 'autorisation' : 'attestation')}
                        />
                        {fileNames[isFonctionnaire ? 'autorisation' : 'attestation'] && (
                            <div className="file-name">
                                {/* {fileNames[isFonctionnaire ? 'autorisation' : 'attestation']} */}
                            </div>
                        )}
                    </div>
                )}

                <div className="buttons">
                    <button type="button">Annuler</button>
                    <button type="submit">Soumettre</button>
                </div>
            </form>
        </>
    );
};

export default Phase2;

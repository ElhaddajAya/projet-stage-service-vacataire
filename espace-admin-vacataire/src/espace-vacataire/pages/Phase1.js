import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../../style/phase1.css';
import { useNavigate } from "react-router-dom";

const Phase1 = ({ onPhaseComplete, isPastDeadline }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cin: '',
    date_naiss: '',
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVacataireData = async () => {
      try {
        const response = await fetch('http://localhost:5000/vacataire-info', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            nom: data.Nom || '',
            prenom: data.Prenom || '',
            email: data.Email || '',
            telephone: data.Numero_tele || '',
            cin: data.CIN || '',
            date_naiss: formatDate(data.Date_naiss) || '',
          });
        } else {
          console.error('Erreur lors de la récupération des données');
        }
      } catch (err) {
        console.error('Erreur réseau', err);
      }
    };

    fetchVacataireData();
  }, []);

  const handleInputChange = (e) => {
    if (isPastDeadline) return; // Prevent changes if past deadline
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPastDeadline) return; // Prevent submission if past deadline
    setMessage('');

    try {
      const response = await axios.put('http://localhost:5000/update-vacataire', formData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setMessage('✅ Informations mises à jour avec succès');
        onPhaseComplete(2);
      } else {
        setMessage('❌ Erreur lors de la mise à jour');
      }
    } catch (err) {
      setMessage('❌ Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  return (
    <>
      <h2>Phase 1 - Informations Personnelles</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="nom"
            placeholder="Entrez votre nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
            disabled={isPastDeadline}
          />
        </div>

        <div className="form-group">
          <label>Prénom</label>
          <input
            type="text"
            name="prenom"
            placeholder="Entrez votre prénom"
            value={formData.prenom}
            onChange={handleInputChange}
            required
            disabled={isPastDeadline}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="exemple@domaine.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isPastDeadline}
          />
        </div>

        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="text"
            name="telephone"
            placeholder="06 00 00 00 00"
            value={formData.telephone}
            onChange={handleInputChange}
            required
            disabled={isPastDeadline}
          />
        </div>

        <div className="form-group">
          <label>CIN</label>
          <input
            type="text"
            name="cin"
            placeholder="AB123456"
            value={formData.cin}
            onChange={handleInputChange}
            required
            disabled={isPastDeadline}
          />
        </div>

        <div className="form-group">
          <label>Date de Naissance</label>
          <input
            type="text"
            name="date_naiss"
            placeholder="JJ/MM/AAAA"
            value={formData.date_naiss}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = formData.date_naiss ? "date" : "text")}
            onChange={handleInputChange}
            required
            disabled={isPastDeadline}
          />
        </div>

        {message && <div className="error-global">{message}</div>}

        <div className="buttons">
          <button type="button" disabled={isPastDeadline}>Annuler</button>
          <button type="submit" disabled={isPastDeadline}>Soumettre</button>
        </div>
      </form>
    </>
  );
};

export default Phase1;
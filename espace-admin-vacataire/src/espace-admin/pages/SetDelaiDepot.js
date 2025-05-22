import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../components/Sidebar';

// Define custom styles directly in the component, no inheritance from global.css
const styles = `

  /* Main container to hold everything */
  .main-container {
    display: block; /* Simple block layout */
    width: 100%;
  }

  /* Content area (replacing page-container) */
  .content-area {
    width: 100%;
    padding-top: 170px; /* Initial top padding to clear header (adjust this) */
    padding-left: 100px; /* Initial padding for sidebar (adjust this) */
    padding-right: 100px; /* Initial padding for right side (adjust this) */
    padding-bottom: 100px; /* Initial bottom padding (adjust this) */
  }

  /* Card container */
  .delai-depot-card {
    background-color: #f9f9f9;
    border: 1px solid #ddd; /* Simple border */
    border-radius: 7px;
    padding: 40px; /* Initial card padding (adjust this) */
    width: 100%;
    max-width: 500px; /* Initial max-width (adjust this) */
    margin: 0 auto; /* Center the card */
    text-align: center;
  }

  /* Title styling */
  .delai-depot-title {
    font-size: 20px; /* Initial font size (adjust this) */
    color: #333;
    margin-bottom: 30px; /* Initial margin (adjust this) */
  }

  /* Form group styling */
  .delai-depot-form .form-group {
    margin-bottom: 15px; /* Initial margin (adjust this) */
  }

  .delai-depot-form label {
    display: block;
    font-size: 16px; /* Initial font size (adjust this) */
    color: #555;
    margin-bottom: 5px; /* Initial margin (adjust this) */
  }

  .delai-depot-form input[type="datetime-local"] {
    width: 100%;
    padding: 10px; /* Initial padding (adjust this) */
    font-size: 16px; /* Initial font size (adjust this) */
    border: 1px solid #ccc; /* Simple border */
    border-radius: 7px; /* Initial border radius (adjust this) */
  }

  .delai-depot-form .error-global {
    margin-top: 10px; /* Initial margin (adjust this) */
    padding: 8px; /* Initial padding (adjust this) */
    font-size: 14px; /* Initial font size (adjust this) */
    color: #d9534f; /* Red for error */
  }

  .delai-depot-form .buttons {
    margin-top: 15px; /* Initial margin (adjust this) */
    display: flex;
    justify-content: center;
    gap: 10px; /* Initial gap (adjust this) */
  }

  .delai-depot-form .buttons button {
    padding: 8px 15px; /* Initial padding (adjust this) */
    font-size: 14px; /* Initial font size (adjust this) */
    border: none;
    border-radius: 4px; /* Initial border radius (adjust this) */
    cursor: pointer;
  }

  .delai-depot-form .buttons .update-btn {
    background-color: #5cb85c; /* Green for update */
    color: white;
  }

  .delai-depot-form .buttons .update-btn:hover {
    background-color: #4cae4c;
  }

  .delai-depot-form .buttons .return-btn {
    background-color: #777; /* Gray for return */
    color: white;
  }

  .delai-depot-form .buttons .return-btn:hover {
    background-color: #666;
  }

  /* Responsive adjustments (optional, adjust as needed) */
  @media (max-width: 600px) {
    .content-area {
      padding-left: 50px; /* Smaller sidebar padding on mobile (adjust this) */
      padding-top: 50px; /* Adjust for smaller screens (adjust this) */
    }

    .delai-depot-card {
      max-width: 90%; /* Adjust this */
      padding: 15px; /* Adjust this */
    }

    .delai-depot-title {
      font-size: 18px; /* Adjust this */
    }

    .delai-depot-form input[type="datetime-local"] {
      font-size: 12px; /* Adjust this */
    }

    .delai-depot-form .buttons button {
      padding: 6px 12px; /* Adjust this */
      font-size: 12px; /* Adjust this */
    }
  }
`;

const SetDelaiDepot = () => {
  const [delaiDepot, setDelaiDepot] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDelaiDepot = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-delai-depot', { withCredentials: true });
        const deadline = new Date(response.data.delai_depot);
        setDelaiDepot(deadline.toISOString().slice(0, 16));
      } catch (err) {
        console.error('Erreur lors de la récupération du délai de dépôt:', err);
        setMessage('Erreur lors de la récupération du délai de dépôt');
      }
    };
    fetchDelaiDepot();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir mettre à jour le délai de dépôt ?");
    if (!confirmUpdate) return;

    try {
      const response = await axios.post('http://localhost:5000/set-delai-depot', { delai_depot: delaiDepot }, { withCredentials: true });
      setMessage('✅ Délai de dépôt mis à jour avec succès');
    } catch (err) {
      setMessage('❌ Erreur lors de la mise à jour du délai de dépôt');
      console.error(err);
    }
  };

  const handleReturn = () => {
    navigate('/espace-admin/vacataires');
  };

  return (
    <div>
      <Header />
      <div className="main-container">
        <input type="checkbox" id="check" />
        <label htmlFor="check">
          <i className="fas fa-bars" id="btn"></i>
          <i className="fas fa-times" id="cancel"></i>
        </label>
        <Sidebar />
        <div className="content-area">
          <style>{styles}</style>
          <div className="delai-depot-card">
            <h1 className="delai-depot-title">Définir le Délai de Dépôt des Documents</h1>
            <form className="delai-depot-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Délai de dépôt (date et heure)</label>
                <input
                  type="datetime-local"
                  value={delaiDepot}
                  onChange={(e) => setDelaiDepot(e.target.value)}
                  required
                />
              </div>
              {message && <div className="error-global">{message}</div>}
              <div className="buttons">
                <button type="button" className="return-btn" onClick={handleReturn}>
                  Retour
                </button>
                <button type="submit" className="update-btn">
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetDelaiDepot;
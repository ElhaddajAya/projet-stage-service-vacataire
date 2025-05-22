import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../components/Sidebar';
import '../../styles/global.css';

const SetDelaiDepot = () => {
  const [delaiDepot, setDelaiDepot] = useState('');
  const [message, setMessage] = useState('');

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

    try {
      const response = await axios.post('http://localhost:5000/set-delai-depot', { delai_depot: delaiDepot }, { withCredentials: true });
      setMessage('Délai de dépôt mis à jour avec succès');
    } catch (err) {
      setMessage('Erreur lors de la mise à jour du délai de dépôt');
      console.error(err);
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
          <h1 className="page-title">Définir le Délai de Dépôt des Documents</h1>
          <form className="delai-form" onSubmit={handleSubmit}>
            <div className="delai-form-container">
              <div className="form-group">
                <label className="delai-label">Délai de dépôt (date et heure)</label>
                <input
                  type="datetime-local"
                  className="delai-input"
                  value={delaiDepot}
                  onChange={(e) => setDelaiDepot(e.target.value)}
                  required
                />
              </div>
              {message && <div className="delai-message">{message}</div>}
              <div className="buttons">
                <button type="submit" className="btn-submit">Mettre à jour</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetDelaiDepot;
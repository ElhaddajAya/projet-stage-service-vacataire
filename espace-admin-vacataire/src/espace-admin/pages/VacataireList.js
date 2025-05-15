import Header from '../components/Header';
import React, { useState } from 'react';

const VacataireList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);

    const handleVirement = () => {
        setShowModal(true);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div>
            <Header />
            <main className="page-container">
                <div className="table-container">
                  <h1 className="page-title">Liste des Vacataires</h1>

                  {/* Barre de recherche */}
                  <input 
                      type="text" 
                      placeholder="Rechercher un vacataire..." 
                      value={searchTerm} 
                      onChange={handleSearch} 
                      className="search-bar"
                  />

                    <table className="table-vacataires">
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>Nom Complet</th>
                              <th>Département</th>
                              <th>Filière</th>
                              <th>État de Dossier</th>
                              <th>Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td>001</td>
                              <td>Ali B.</td>
                              <td>Informatique</td>
                              <td>MI</td>
                              <td>Validé</td>
                              <td>
                                  <button className="btn-valider" onClick={handleVirement}>
                                      Valider Virement
                                  </button>
                              </td>
                          </tr>
                      </tbody>
                  </table>

                  {showModal && (
                      <div className="modal">
                          <div className="modal-content">
                              <p>Confirmer le virement pour Ali B. ?</p>
                              <div className="modal-buttons">
                                  <button className="btn-valider" onClick={() => alert("Virement validé!")}>
                                      Confirmer
                                  </button>
                                  <button className="btn-annuler" onClick={() => setShowModal(false)}>
                                      Annuler
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

                    {/* Pagination */}
                    <div className="pagination">
                      <button className="pagination-btn">&lt;</button>
                      <span className="pagination-count">10</span>
                      <button className="pagination-btn">&gt;</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VacataireList;

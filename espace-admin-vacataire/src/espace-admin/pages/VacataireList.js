// espace-admin-vacataire/src/espace-admin/pages/VacataireList.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const VacataireList = () => {
  const [vacataires, setVacataires] = useState([]);
  const [filteredVacataires, setFilteredVacataires] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVacataire, setSelectedVacataire] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const vacatairesPerPage = 5; // Number of vacataires per page

  const navigate = useNavigate();

  // Fetch vacataires from the backend
  const fetchVacataires = async () => {
    try {
      const response = await axios.get('http://localhost:5000/vacataires', {
        withCredentials: true,
      });
      setVacataires(response.data);
      setFilteredVacataires(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des vacataires:', error);
    }
  };

  useEffect(() => {
    fetchVacataires();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = vacataires.filter((vacataire) => {
      const nom = vacataire.Nom || '';
      const prenom = vacataire.Prenom || '';
      const Etat_virement = vacataire.Etat_virement || '';
      const Etat_dossier = vacataire.Etat_dossier || '';
      const search = searchTerm.toLowerCase();
      return (
        nom.toLowerCase().includes(search) ||
        prenom.toLowerCase().includes(search) ||
        Etat_virement.toLowerCase().includes(search) ||
        Etat_dossier.toLowerCase().includes(search)
      );
    });
    setFilteredVacataires(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, vacataires]);

  // Calculate the vacataires to display on the current page
  const indexOfLastVacataire = currentPage * vacatairesPerPage;
  const indexOfFirstVacataire = indexOfLastVacataire - vacatairesPerPage;
  const currentVacataires = filteredVacataires.slice(indexOfFirstVacataire, indexOfLastVacataire);

  // Calculate total pages
  const totalPages = Math.ceil(filteredVacataires.length / vacatairesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleVirement = (vacataire) => {
    setSelectedVacataire(vacataire);
    setShowModal(true);
  };

  const handleConfirmVirement = async () => {
    if (!selectedVacataire) return;

    try {
      // Send request to update Etat_virement to 'Effectué'
      await axios.put(
        `http://localhost:5000/vacataire/${selectedVacataire.ID_vacat}/update-virement`,
        { Etat_virement: 'Effectué' },
        { withCredentials: true }
      );

      // Refresh the table data
      await fetchVacataires();

      // Close the modal
      setShowModal(false);
      setSelectedVacataire(null);
      alert('Virement validé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la validation du virement:', error);
      alert('Erreur lors de la validation du virement');
    }
  };

  const handleEtudeDossier = (vacataireId) => {
    navigate(`/espace-admin/etude-dossier/${vacataireId}`);
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <main className="page-container">
        <div className="table-container">
          <h1 className="page-title">Liste des Vacataires</h1>

          {/* Barre de recherche avec icône à droite */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher un vacataire..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-bar"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>

          <table className="table-vacataires">
            <thead>
              <tr>
                <th>N/O</th> {/* Changed from ID to Numéro d'ordre */}
                <th>Nom Complet</th>
                <th>État de Virement</th>
                <th>État de Dossier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentVacataires.map((vacataire, index) => (
                <tr key={vacataire.ID_vacat}>
                  <td>{indexOfFirstVacataire + index + 1}</td> {/* Sequential order number */}
                  <td title={`${vacataire.Nom || ''} ${vacataire.Prenom || ''}`}>
                    {`${vacataire.Nom || ''} ${vacataire.Prenom || ''}`}
                  </td>
                  <td title={vacataire.Etat_virement || 'En attente'}>{vacataire.Etat_virement || 'En attente'}</td>
                  <td title={vacataire.Etat_dossier || 'En attente'}>{vacataire.Etat_dossier || 'En attente'}</td>
                  <td>
                    <button
                      className="btn-valider"
                      onClick={() => handleVirement(vacataire)}
                      disabled={vacataire.Etat_dossier !== 'Validé'}
                    >
                      Valider Virement
                    </button>
                    <button
                      className="btn-etude"
                      onClick={() => handleEtudeDossier(vacataire.ID_vacat)}
                    >
                      Étude Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showModal && selectedVacataire && (
            <div className="modal">
              <div className="modal-content">
                <p>Confirmer le virement pour {selectedVacataire.Nom || ''} {selectedVacataire.Prenom || ''} ?</p>
                <div className="modal-buttons">
                  <button
                    className="btn-valider"
                    onClick={handleConfirmVirement}
                  >
                    Confirmer
                  </button>
                  <button
                    className="btn-annuler"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            <span className="pagination-info">
              Page {currentPage} de {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VacataireList;
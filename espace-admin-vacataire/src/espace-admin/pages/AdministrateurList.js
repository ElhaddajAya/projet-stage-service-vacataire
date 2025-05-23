import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../../styles/global.css';

const AdministrateurList = () => {
  const [administrateurs, setAdministrateurs] = useState([]);
  const [filteredAdministrateurs, setFilteredAdministrateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 5;
  const navigate = useNavigate(); // Initialiser useNavigate

  // Fetch administrateurs from the backend
  const fetchAdministrateurs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/administrateurs', {
        withCredentials: true,
      });
      setAdministrateurs(response.data);
      setFilteredAdministrateurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des administrateurs:', error);
    }
  };

  useEffect(() => {
    fetchAdministrateurs();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = administrateurs.filter((admin) => {
      const nom = admin.nom || '';
      const prenom = admin.prenom || '';
      const role = admin.Role || '';
      const search = searchTerm.toLowerCase();
      return (
        nom.toLowerCase().includes(search) ||
        prenom.toLowerCase().includes(search) ||
        role.toLowerCase().includes(search)
      );
    });
    setFilteredAdministrateurs(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, administrateurs]);

  // Calculate the administrateurs to display on the current page
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdministrateurs.slice(indexOfFirstAdmin, indexOfLastAdmin);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAdministrateurs.length / adminsPerPage);

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

  const handleAddAdministrateur = () => {
    navigate('/espace-admin/add-administrateur'); // Rediriger vers la page d'ajout
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <main className="page-container">
        <div className="table-container">
          <h1 className="page-title">Liste des Administrateurs</h1>

          {/* Barre de recherche et bouton Ajouter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un administrateur..."
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
            <button className="btn-add" onClick={handleAddAdministrateur}>
              Ajouter
            </button>
          </div>

          <table className="table-vacataires">
            <thead>
              <tr>
                <th>N/O</th>
                <th>Nom Complet</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {currentAdmins.map((admin, index) => (
                <tr key={admin.ID_admin}>
                  <td>{indexOfFirstAdmin + index + 1}</td>
                  <td title={`${admin.nom || ''} ${admin.prenom || ''}`}>
                    {`${admin.nom || ''} ${admin.prenom || ''}`}
                  </td>
                  <td title={admin.Role || 'Administrateur'}>{admin.Role || 'Administrateur'}</td>
                </tr>
              ))}
            </tbody>
          </table>

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

export default AdministrateurList;
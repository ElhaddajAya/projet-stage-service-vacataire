import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../../styles/global.css';

const AdministrateurList = () => {
  const [administrateurs, setAdministrateurs] = useState([]);
  const [filteredAdministrateurs, setFilteredAdministrateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 5;
  const navigate = useNavigate();

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
    setCurrentPage(1);
  }, [searchTerm, administrateurs]);

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdministrateurs.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredAdministrateurs.length / adminsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddAdministrateur = () => {
    navigate('/espace-admin/add-administrateur');
  };

  const handleDelete = async (adminId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      try {
        await axios.delete(`http://localhost:5000/administrateurs/${adminId}`, {
          withCredentials: true,
        });
        setAdministrateurs(administrateurs.filter((admin) => admin.ID_admin !== adminId));
        setFilteredAdministrateurs(filteredAdministrateurs.filter((admin) => admin.ID_admin !== adminId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression. Vérifiez vos autorisations.');
      }
    }
  };

  const handleSuspend = async (adminId, isSuspended) => {
    try {
      await axios.put(
        `http://localhost:5000/administrateurs/${adminId}/suspend`,
        { isSuspended: !isSuspended },
        { withCredentials: true }
      );
      setAdministrateurs(
        administrateurs.map((admin) =>
          admin.ID_admin === adminId ? { ...admin, isSuspended: !isSuspended } : admin
        )
      );
      setFilteredAdministrateurs(
        filteredAdministrateurs.map((admin) =>
          admin.ID_admin === adminId ? { ...admin, isSuspended: !isSuspended } : admin
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la suspension:', error);
      alert('Erreur lors de la mise à jour. Vérifiez vos autorisations.');
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <main className="page-container">
        <div className="table-container">
          <h1 className="page-title">Liste des Administrateurs</h1>

          <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
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
            </div>
            <button
              className="btn-add"
              onClick={handleAddAdministrateur}
              style={{
                position: 'absolute',
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              Ajouter
            </button>
          </div>

          <table className="table-administrateurs">
            <thead>
              <tr>
                <th>N/O</th>
                <th>Nom Complet</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
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
                  <td>{admin.isSuspended ? 'Suspendu' : 'Actif'}</td>
                  <td>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(admin.ID_admin)}
                    >
                      Supprimer
                    </button>
                    <button
                      className={`action-btn ${admin.isSuspended ? 'activate-btn' : 'suspend-btn'}`}
                      onClick={() => handleSuspend(admin.ID_admin, admin.isSuspended)}
                    >
                      {admin.isSuspended ? 'Activer' : 'Suspendre'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
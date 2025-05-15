import React from 'react';
import "../../styles/global.css"; // Assure-toi que le fichier CSS est dans le bon chemin
import Header from '../components/Header'; // Assure-toi que le chemin est correct

const VacataireList = () => {
    return (
    <div>
      <Header />
      {/* Contenu */}
      <main className="page-container">
        <h2 className="page-title">Liste des Vacataires</h2>

        <div className="table-container">
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
                  <button className="btn-valider">Valider Virement</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pagination-btn">&lt;</button>
          <span className="pagination-count">10</span>
          <button className="pagination-btn">&gt;</button>
        </div>
      </main>
    </div>
  );
};

export default VacataireList;

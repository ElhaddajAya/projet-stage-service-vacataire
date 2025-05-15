import React from 'react';

const VacataireList = () => {
    const vacataires = [
        { id: 1, nom: 'Ali Bensouda', departement: 'Informatique', filiere: 'Développement Web', etat: 'Complet' },
        { id: 2, nom: 'Fatima Zohra', departement: 'Gestion', filiere: 'RH', etat: 'Incomplet' },
        { id: 3, nom: 'Omar El Amrani', departement: 'Marketing', filiere: 'Digital', etat: 'Complet' }
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Liste des Vacataires</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Nom Complet</th>
                        <th className="border p-2">Département</th>
                        <th className="border p-2">Filière</th>
                        <th className="border p-2">Etat de Dossier</th>
                        <th className="border p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {vacataires.map((vacataire) => (
                        <tr key={vacataire.id}>
                            <td className="border p-2">{vacataire.id}</td>
                            <td className="border p-2">{vacataire.nom}</td>
                            <td className="border p-2">{vacataire.departement}</td>
                            <td className="border p-2">{vacataire.filiere}</td>
                            <td className={`border p-2 ${vacataire.etat === 'Complet' ? 'text-green-600' : 'text-red-600'}`}>{vacataire.etat}</td>
                            <td className="border p-2">
                                {vacataire.etat === 'Complet' ? (
                                    <button className="bg-black text-white px-3 py-1 rounded">Valider Virement</button>
                                ) : (
                                    <span className="text-gray-500">En attente</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VacataireList;

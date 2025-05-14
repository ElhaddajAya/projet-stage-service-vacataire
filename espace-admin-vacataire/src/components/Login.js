import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Username:', username, 'Password:', password);
        // TODO: Ajouter la logique d'authentification
    };

    // Simulation de la vérification des identifiants
    // if (username === 'vacataire') {
    //     navigate('/dashboard-vacataire');
    // } else if (username === 'admin' || username === 'comptable' || username === 'chef') {
    //     navigate('/vacataire-list');
    // } else {
    //     alert('Identifiants incorrects');
    // }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded shadow-md w-80">
                <h2 className="text-xl font-bold mb-4 text-center">Espace Enseignant Vacataire - Administrateur</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Entrer votre username"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Mot de Passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Entrer votre mot de passe"
                        />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-2 rounded">Connexion</button>
                    <p className="text-center mt-2 text-gray-600"><a href="#" className="underline">Mot de passe oublié?</a></p>
                </form>
            </div>
        </div>
    );
};

export default Login;

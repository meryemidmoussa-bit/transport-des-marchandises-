import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Menu selon le rôle (acteurs du diagramme de cas d'utilisation)
const MENUS = {
  client: [
    ['/client/commandes', 'Mes commandes'],
    ['/client/commandes/nouvelle', 'Passer une commande'],
  ],
  gestionnaire: [
    ['/gestionnaire/commandes', 'Commandes'],
    ['/gestionnaire/livraisons', 'Livraisons'],
    ['/gestionnaire/camions', 'Camions'],
    ['/gestionnaire/chauffeurs', 'Chauffeurs'],
    ['/gestionnaire/historique', 'Historique'],
  ],
  chauffeur: [['/chauffeur/missions', 'Mes missions']],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <strong className="brand">Fret</strong>
      <nav>
        {MENUS[user.role].map(([path, label]) => (
          <NavLink key={path} to={path} end>{label}</NavLink>
        ))}
      </nav>
      <span className="who">{user.prenom} {user.nom}</span>
      <button className="btn ghost" onClick={handleLogout}>Se déconnecter</button>
    </header>
  );
}
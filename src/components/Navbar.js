import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const ROLES = {
  client: 'Client',
  gestionnaire: 'Gestionnaire',
  chauffeur: 'Chauffeur',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const initiales = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="logo">F</span>
        <div>
          <strong>Fret</strong>
          <small>Transport de marchandises</small>
        </div>
      </div>

      <nav>
        {MENUS[user.role].map(([path, label]) => (
          <NavLink key={path} to={path} end>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-row">
          <span className="avatar">{initiales}</span>
          <div className="user-info">
            <strong>{user.prenom} {user.nom}</strong>
            <small>{ROLES[user.role]}</small>
          </div>
        </div>
        <button className="logout" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
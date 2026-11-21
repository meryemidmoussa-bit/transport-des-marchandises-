import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientCommandes from './pages/ClientCommandes';
import NouvelleCommande from './pages/NouvelleCommande';
import SuiviLivraison from './pages/SuiviLivraison';
import GestCommandes from './pages/GestCommandes';
import GestLivraisons from './pages/GestLivraisons';
import Camions from './pages/Camions';
import Chauffeurs from './pages/Chauffeurs';
import Historique from './pages/Historique';
import Missions from './pages/Missions';
import Echecs from './pages/Echecs';
import BonLivraison from './pages/BonLivraison';
const HOME = {
  client: '/client/commandes',
  gestionnaire: '/gestionnaire/commandes',
  chauffeur: '/chauffeur/missions',
};

export default function App() {
  const { user } = useAuth();
  const G = ['gestionnaire'];

   return (
    <div className={user ? 'layout' : ''}>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user ? HOME[user.role] : '/login'} replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

                    {/* Client */}
          <Route path="/client/commandes" element={<ProtectedRoute roles={['client']}><ClientCommandes /></ProtectedRoute>} />
          <Route path="/client/commandes/nouvelle" element={<ProtectedRoute roles={['client']}><NouvelleCommande /></ProtectedRoute>} />
          <Route path="/client/suivi/:id" element={<ProtectedRoute roles={['client']}><SuiviLivraison /></ProtectedRoute>} />
          <Route path="/client/bon/:id" element={<ProtectedRoute roles={['client']}><BonLivraison /></ProtectedRoute>} />

          {/* Gestionnaire */}
          <Route path="/gestionnaire/commandes" element={<ProtectedRoute roles={G}><GestCommandes /></ProtectedRoute>} />
          <Route path="/gestionnaire/livraisons" element={<ProtectedRoute roles={G}><GestLivraisons /></ProtectedRoute>} />
          <Route path="/gestionnaire/suivi/:id" element={<ProtectedRoute roles={G}><SuiviLivraison /></ProtectedRoute>} />
          <Route path="/gestionnaire/camions" element={<ProtectedRoute roles={G}><Camions /></ProtectedRoute>} />
          <Route path="/gestionnaire/chauffeurs" element={<ProtectedRoute roles={G}><Chauffeurs /></ProtectedRoute>} />
          <Route path="/gestionnaire/historique" element={<ProtectedRoute roles={G}><Historique /></ProtectedRoute>} />

          {/* Chauffeur */}
          <Route path="/chauffeur/missions" element={<ProtectedRoute roles={['chauffeur']}><Missions /></ProtectedRoute>} />

          <Route path="*" element={<p className="muted">Page introuvable.</p>} />
                    <Route path="/client/echecs" element={<ProtectedRoute roles={['client']}><Echecs /></ProtectedRoute>} />
          <Route path="/gestionnaire/echecs" element={<ProtectedRoute roles={G}><Echecs /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
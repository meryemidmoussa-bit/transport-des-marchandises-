import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// Page d'accueil de chaque rôle (on les crée aux étapes suivantes)
const HOME = {
  client: '/client/commandes',
  gestionnaire: '/gestionnaire/commandes',
  chauffeur: '/chauffeur/missions',
};

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user ? HOME[user.role] : '/login'} replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p className="muted">Page introuvable.</p>} />
        </Routes>
      </main>
    </>
  );
}
import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const save = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  // Cas d'utilisation : S'authentifier
  const login = async (email, motDePasse) => {
    const { data } = await api.post('/login', { email, password: motDePasse });
    save(data);
    return data.user;
  };

  // Cas d'utilisation : S'inscrire (client)
  const register = async (form) => {
    const { data } = await api.post('/register', form);
    save(data);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // on ignore l'erreur
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
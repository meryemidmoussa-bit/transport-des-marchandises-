import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', adresse: '', password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' ') : 'Inscription impossible');
    }
  };

  const fields = [
    ['nom', 'Nom'],
    ['prenom', 'Prénom'],
    ['email', 'Email', 'email'],
    ['telephone', 'Téléphone'],
    ['adresse', 'Adresse'],
    ['password', 'Mot de passe', 'password'],
  ];

  return (
    <div className="auth">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Créer un compte client</h1>
        {fields.map(([name, label, type]) => (
          <label key={name}>
            {label}
            <input name={name} type={type || 'text'} value={form[name]} onChange={handleChange} required />
          </label>
        ))}
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">S’inscrire</button>
        <p>
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
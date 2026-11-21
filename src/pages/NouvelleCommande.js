import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const initial = {
  description: '',
  poids: '',
  volume: '',
  adresseEnlevement: '',
  adresseLivraison: '',
  dateSouhaitee: '',
  telDestinataire: '',
};

export default function NouvelleCommande() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/commandes', form);
      navigate('/client/commandes');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors).flat().join(' ')
          : err.response?.data?.message || 'Commande impossible'
      );
    }
  };

  return (
    <section>
      <h1>Passer une commande</h1>
      <form className="form grid" onSubmit={handleSubmit}>
                <h2 className="fiche-titre">Fiche de commande</h2>
        <label className="full">
          Description de la marchandise
          <input name="description" value={form.description} onChange={handleChange} required />
        </label>
        <label>
          Poids (kg)
          <input name="poids" type="number" min="0" step="0.1" value={form.poids} onChange={handleChange} required />
        </label>
        <label>
          Volume (m³)
          <input name="volume" type="number" min="0" step="0.1" value={form.volume} onChange={handleChange} required />
        </label>
        <label>
          Adresse d’enlèvement
          <input name="adresseEnlevement" value={form.adresseEnlevement} onChange={handleChange} required />
        </label>
        <label>
          Adresse de livraison
          <input name="adresseLivraison" value={form.adresseLivraison} onChange={handleChange} required />
        </label>
        <label>
          Date souhaitée
          <input name="dateSouhaitee" type="date" value={form.dateSouhaitee} onChange={handleChange} required />
        </label>
        <label>
          Téléphone du destinataire
          <input name="telDestinataire" value={form.telDestinataire} onChange={handleChange} required />
        </label>
        {error && <p className="error full">{error}</p>}
        <div className="actions full">
          <button className="btn" type="submit">Envoyer la commande</button>
        </div>
      </form>
    </section>
  );
}
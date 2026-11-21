import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import State from '../components/State';
import StatusBadge from '../components/StatusBadge';

export default function GestLivraisons() {
  const { data: livraisons, loading, error, reload } = useFetch('/livraisons');
  const [message, setMessage] = useState('');

  // Cas d'utilisation : Replanifier une livraison
  const replanifier = async (l) => {
    const date = window.prompt('Nouvelle date de départ (AAAA-MM-JJ HH:MM)');
    if (!date) return;
    try {
      await api.patch(`/livraisons/${l.id}/replanifier`, { dateDepart: date });
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Replanification impossible');
    }
  };

  // Cas d'utilisation : Générer le bon de livraison
  const genererBon = async (l) => {
    try {
      await api.post(`/livraisons/${l.id}/bon`);
      setMessage(`Bon généré pour la livraison #${l.id}`);
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Génération impossible');
    }
  };

  return (
    <section>
      <h1>Livraisons</h1>
      {message && <p className="muted">{message}</p>}
      <State
        loading={loading}
        error={error}
        empty={livraisons.length === 0}
        emptyText="Aucune livraison planifiée."
      />
      {livraisons.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Départ</th>
              <th>Camion</th>
              <th>Chauffeur</th>
              <th>Tentatives</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {livraisons.map((l) => (
              <tr key={l.id}>
                <td>#{l.id}</td>
                <td>{l.dateDepart}</td>
                <td>{l.camion?.immatriculation}</td>
                <td>{l.chauffeur?.nom}</td>
                <td>{l.nbTentatives}</td>
                <td><StatusBadge statut={l.statut} /></td>
                <td className="row-actions">
                  <Link className="btn small ghost" to={`/gestionnaire/suivi/${l.id}`}>
                    Détail
                  </Link>
                  {l.statut === 'echec' && (
                    <button className="btn small" onClick={() => replanifier(l)}>
                      Replanifier
                    </button>
                  )}
                  {l.statut === 'livree' && !l.bon && (
                    <button className="btn small" onClick={() => genererBon(l)}>
                      Générer le bon
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import State from '../components/State';
import StatusBadge from '../components/StatusBadge';
import { STATUT_COMMANDE } from '../constants';

export default function ClientCommandes() {
  const { data: commandes, loading, error, reload } = useFetch('/commandes');
  const [filtre, setFiltre] = useState('tous');

  const affichees =
    filtre === 'tous' ? commandes : commandes.filter((c) => c.statut === filtre);

  const annuler = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    await api.patch(`/commandes/${id}/annuler`);
    reload();
  };

  return (
    <section>
      <div className="head">
        <h1>Mes commandes</h1>
        <Link className="btn" to="/client/commandes/nouvelle">
          Passer une commande
        </Link>
      </div>

      <select value={filtre} onChange={(e) => setFiltre(e.target.value)}>
        <option value="tous">Tous les statuts</option>
        {Object.entries(STATUT_COMMANDE).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <State
        loading={loading}
        error={error}
        empty={affichees.length === 0}
        emptyText="Aucune commande. Passez votre première commande."
      />

      {affichees.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Description</th>
              <th>Livraison à</th>
              <th>Date souhaitée</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {affichees.map((c) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.description}</td>
                <td>{c.adresseLivraison}</td>
                <td>{c.dateSouhaitee}</td>
                <td><StatusBadge statut={c.statut} /></td>
                <td className="row-actions">
                  {c.livraison_id && (
                    <Link className="btn small" to={`/client/suivi/${c.livraison_id}`}>
                      Suivre
                    </Link>
                  )}
                  {c.statut === 'en_attente' && (
                    <button className="btn small danger" onClick={() => annuler(c.id)}>
                      Annuler
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
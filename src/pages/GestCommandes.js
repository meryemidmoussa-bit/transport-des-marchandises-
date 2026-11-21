import React, { useState } from 'react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import State from '../components/State';
import StatusBadge from '../components/StatusBadge';

export default function GestCommandes() {
  const { data: commandes, loading, error, reload } = useFetch('/commandes');
  const { data: camions, reload: reloadCamions } = useFetch('/camions');
  const { data: chauffeurs, reload: reloadChauffeurs } = useFetch('/chauffeurs');
  const [planif, setPlanif] = useState(null);
  const [form, setForm] = useState({ camion_id: '', chauffeur_id: '', dateDepart: '' });
  const [message, setMessage] = useState('');

  // Cas d'utilisation : Valider une commande
  const valider = async (id) => {
    await api.patch(`/commandes/${id}/valider`);
    reload();
  };

  // Ressources disponibles seulement
  const camionsDispo = camions.filter((c) => c.etat === 'disponible');
  const chauffeursDispo = chauffeurs.filter((c) => c.disponible);

  // Cas d'utilisation : Planifier une livraison (include : Affecter les ressources)
  const planifier = async (e) => {
    e.preventDefault();
    try {
      await api.post('/livraisons', { commande_id: planif.id, ...form });
      setPlanif(null);
      setForm({ camion_id: '', chauffeur_id: '', dateDepart: '' });
      setMessage('Livraison planifiée');
      reload();
      reloadCamions();
      reloadChauffeurs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Planification impossible');
    }
  };

  return (
    <section>
      <h1>Commandes</h1>
      {message && <p className="muted">{message}</p>}
      <State
        loading={loading}
        error={error}
        empty={commandes.length === 0}
        emptyText="Aucune commande à traiter."
      />
      {commandes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Poids / Volume</th>
              <th>Trajet</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((c) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.client?.nom} {c.client?.prenom}</td>
                <td>{c.poids} kg / {c.volume} m³</td>
                <td>{c.adresseEnlevement} → {c.adresseLivraison}</td>
                <td><StatusBadge statut={c.statut} /></td>
                <td className="row-actions">
                  {c.statut === 'en_attente' && (
                    <button className="btn small" onClick={() => valider(c.id)}>
                      Valider
                    </button>
                  )}
                  {c.statut === 'validee' && !c.livraison_id && (
                    <button className="btn small" onClick={() => setPlanif(c)}>
                      Planifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {planif && (
        <form className="form grid panel" onSubmit={planifier}>
          <h2 className="full">Planifier la commande #{planif.id}</h2>
          <label>
            Camion
            <select
              value={form.camion_id}
              onChange={(e) => setForm({ ...form, camion_id: e.target.value })}
              required
            >
              <option value="">Choisir</option>
              {camionsDispo.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.immatriculation} ({c.capacitePoids} kg)
                </option>
              ))}
            </select>
          </label>
          <label>
            Chauffeur
            <select
              value={form.chauffeur_id}
              onChange={(e) => setForm({ ...form, chauffeur_id: e.target.value })}
              required
            >
              <option value="">Choisir</option>
              {chauffeursDispo.map((c) => (
                <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
              ))}
            </select>
          </label>
          <label>
            Date de départ
            <input
              type="datetime-local"
              value={form.dateDepart}
              onChange={(e) => setForm({ ...form, dateDepart: e.target.value })}
              required
            />
          </label>
          <div className="actions full">
            <button className="btn" type="submit">Planifier</button>
            <button className="btn ghost" type="button" onClick={() => setPlanif(null)}>
              Annuler
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
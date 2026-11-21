import React, { useState } from 'react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import State from '../components/State';
import StatusBadge from '../components/StatusBadge';

const SUIVANT = { planifiee: 'chargee', chargee: 'en_cours', en_cours: 'livree' };
const ACTION = {
  planifiee: 'Confirmer le chargement',
  chargee: 'Démarrer la livraison',
  en_cours: 'Marquer livrée',
};

export default function Missions() {
  const { data: missions, loading, error, reload } = useFetch('/livraisons');
  const [message, setMessage] = useState('');

  const avancer = async (m) => {
    await api.patch(`/livraisons/${m.id}/statut`, { statut: SUIVANT[m.statut] });
    reload();
  };

  const signalerEchec = async (m) => {
    const motif = window.prompt('Motif de l’échec (client absent, adresse introuvable...)');
    if (!motif) return;
    try {
      await api.patch(`/livraisons/${m.id}/statut`, { statut: 'echec', motif });
      setMessage('Échec signalé au gestionnaire');
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signalement impossible');
    }
  };

  return (
    <section>
      <h1>Mes missions</h1>
      {message && <p className="muted">{message}</p>}
      <State
        loading={loading}
        error={error}
        empty={missions.length === 0}
        emptyText="Aucune mission assignée."
      />
      <div className="cards">
        {missions.map((m) => (
          <article key={m.id} className="card">
            <div className="head">
              <h2>Mission #{m.id}</h2>
              <StatusBadge statut={m.statut} />
            </div>
            <p>
              {m.commande?.adresseEnlevement} → {m.commande?.adresseLivraison}
            </p>
            <p className="muted">
              {m.commande?.description} — {m.commande?.poids} kg
            </p>
            <p className="muted">Tél. destinataire : {m.commande?.telDestinataire}</p>
            <div className="actions">
              {SUIVANT[m.statut] && (
                <button className="btn" onClick={() => avancer(m)}>
                  {ACTION[m.statut]}
                </button>
              )}
              {['chargee', 'en_cours'].includes(m.statut) && (
                <button className="btn danger" onClick={() => signalerEchec(m)}>
                  Signaler un échec
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
            {m.bon && <p className="muted">Bon de livraison : {m.bon.numero}</p>}
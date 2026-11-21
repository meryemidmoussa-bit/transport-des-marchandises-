import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import State from '../components/State';
import StatusBadge from '../components/StatusBadge';

export default function SuiviLivraison() {
  const { id } = useParams();
  const { data: livraison, loading, error, reload } = useFetch(`/livraisons/${id}`);
  const [message, setMessage] = useState('');

  const signer = async () => {
    try {
      await api.patch(`/bons/${livraison.bon.id}/signer`);
      setMessage('Bon de livraison signé');
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signature impossible');
    }
  };

  if (loading || error) return <State loading={loading} error={error} />;

  const suivis = livraison.suivis || [];
  const peutSigner =
    livraison.statut === 'livree' && livraison.bon && !livraison.bon.signe;

  return (
    <section>
      <div className="head">
        <h1>Livraison #{livraison.id}</h1>
        <StatusBadge statut={livraison.statut} />
      </div>

      <ol className="timeline">
        {suivis.map((s) => (
          <li key={s.id}>
            <StatusBadge statut={s.statut} />
            <span className="muted">
              {new Date(s.dateHeure).toLocaleString('fr-FR')}
            </span>
            {s.motif && <p>Motif : {s.motif}</p>}
          </li>
        ))}
      </ol>
      {suivis.length === 0 && <p className="muted">Aucune étape enregistrée.</p>}

      {livraison.bon && (
        <div className="panel">
          <p>
            Bon n° {livraison.bon.numero} —{' '}
            {livraison.bon.signe ? 'signé' : 'en attente de signature'}
          </p>
          {peutSigner && (
            <button className="btn" onClick={signer}>
              Signer le bon de livraison
            </button>
          )}
        </div>
      )}
      {message && <p className="muted">{message}</p>}
    </section>
  );
}
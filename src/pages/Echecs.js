import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import State from '../components/State';
import StatusBadge from '../components/StatusBadge';

export default function Echecs() {
  const { user } = useAuth();
  const { data: livraisons, loading, error, reload } = useFetch('/livraisons');
  const estClient = user.role === 'client';

  // Actualisation automatique toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(reload, 5000);
    return () => clearInterval(timer);
  }, [reload]);

  // On récupère toutes les étapes "échec" de toutes les livraisons (flatMap, filter, map)
  const echecs = livraisons
    .flatMap((l) =>
      (l.suivis || [])
        .filter((s) => s.statut === 'echec')
        .map((s) => ({ ...s, livraison: l }))
    )
    .sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure));

  return (
    <section>
      <h1>{estClient ? 'Notifications' : 'Échecs de livraison'}</h1>
      <p className="muted">
        {estClient
          ? 'Les problèmes survenus pendant la livraison de vos commandes.'
          : 'Les échecs signalés par les chauffeurs.'}
      </p>

      <State
        loading={loading && livraisons.length === 0}
        error={error}
        empty={echecs.length === 0}
        emptyText="Aucun échec signalé."
      />

      <div className="cards">
        {echecs.map((e) => {
          const l = e.livraison;
          const resolu = l.statut !== 'echec';
          return (
            <article key={e.id} className="card alerte">
              <div className="head">
                <h2>Livraison #{l.id}</h2>
                <StatusBadge statut="echec" />
              </div>
              <p>
                Motif : <strong>{e.motif || 'Non précisé'}</strong>
              </p>
              <p className="muted">
                Signalé le {new Date(e.dateHeure).toLocaleString('fr-FR')}
              </p>
              <p>
                {l.commande?.adresseEnlevement} → {l.commande?.adresseLivraison}
              </p>
              {!estClient && (
                <p className="muted">
                  Chauffeur : {l.chauffeur?.nom} {l.chauffeur?.prenom}
                </p>
              )}
              <p className="muted">
                État actuel : <StatusBadge statut={l.statut} />{' '}
                {resolu && '(replanifiée)'}
              </p>
              <div className="actions">
                <Link
                  className="btn small ghost"
                  to={estClient ? `/client/suivi/${l.id}` : `/gestionnaire/suivi/${l.id}`}
                >
                  Voir le suivi
                </Link>
                {!estClient && !resolu && (
                  <Link className="btn small" to="/gestionnaire/livraisons">
                    Replanifier
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
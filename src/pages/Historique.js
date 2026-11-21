import React from 'react';
import useFetch from '../hooks/useFetch';
import State from '../components/State';
import StatusBadge from '../components/StatusBadge';

export default function Historique() {
  const { data: livraisons, loading, error } = useFetch('/livraisons');

  // reduce() du cours : nombre de livraisons par statut
  const stats = livraisons.reduce((acc, l) => {
    acc[l.statut] = (acc[l.statut] || 0) + 1;
    return acc;
  }, {});

  // Cas d'utilisation : Exporter les rapports (CSV)
  const exporter = () => {
    const lignes = ['id;depart;arrivee;statut;tentatives'];
    livraisons.forEach((l) =>
      lignes.push(`${l.id};${l.dateDepart};${l.dateArrivee || ''};${l.statut};${l.nbTentatives}`)
    );
    const blob = new Blob([lignes.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rapport-livraisons.csv';
    a.click();
  };

  return (
    <section>
      <div className="head">
        <h1>Historique</h1>
        <button className="btn" onClick={exporter} disabled={livraisons.length === 0}>
          Exporter en CSV
        </button>
      </div>

      <div className="stats">
        {Object.entries(stats).map(([statut, n]) => (
          <div key={statut} className="stat">
            <strong>{n}</strong>
            <StatusBadge statut={statut} />
          </div>
        ))}
      </div>

      <State
        loading={loading}
        error={error}
        empty={livraisons.length === 0}
        emptyText="Aucun historique."
      />
      {livraisons.length > 0 && (
        <table>
          <thead>
            <tr><th>N°</th><th>Départ</th><th>Arrivée</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {livraisons.map((l) => (
              <tr key={l.id}>
                <td>#{l.id}</td>
                <td>{l.dateDepart}</td>
                <td>{l.dateArrivee || '—'}</td>
                <td><StatusBadge statut={l.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
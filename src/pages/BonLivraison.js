import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import State from '../components/State';

const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

export default function BonLivraison() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: l, loading, error, reload } = useFetch(`/livraisons/${id}`);
  const [message, setMessage] = useState('');

  // Le nom du fichier PDF = titre de la page
  useEffect(() => {
    if (l && l.bon) document.title = `Bon-${l.bon.numero}`;
    return () => { document.title = 'Fret'; };
  }, [l]);

  const signer = async () => {
    try {
      await api.patch(`/bons/${l.bon.id}/signer`);
      setMessage('Bon signé');
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signature impossible');
    }
  };

  if (loading || error) return <State loading={loading} error={error} />;
  if (!l.bon) return <p className="muted">Le bon de livraison n’a pas encore été généré.</p>;

  const c = l.commande || {};
  const client = c.client || user;
  const peutSigner = l.statut === 'livree' && !l.bon.signe && user.role === 'client';

  return (
    <section>
      <div className="bon-actions no-print">
        <Link className="btn ghost" to={`/client/suivi/${l.id}`}>← Retour au suivi</Link>
        <button className="btn" onClick={() => window.print()}>Télécharger en PDF</button>
        {peutSigner && <button className="btn" onClick={signer}>Signer le bon</button>}
      </div>
      {message && <p className="muted no-print">{message}</p>}

      <article className="bon">
        <header className="bon-head">
          <div className="bon-logo">
            <span>F</span>
            <div>
              <strong>Fret</strong>
              <small>Transport de marchandises</small>
            </div>
          </div>
          <div className="bon-titre">
            <h1>Bon de livraison</h1>
            <p>N° {l.bon.numero}</p>
            <p>Émis le {date(l.bon.dateEmission)}</p>
          </div>
        </header>

        <div className="bon-grid">
          <div className="bon-box">
            <h3>Client</h3>
            <p><strong>{client?.prenom} {client?.nom}</strong></p>
            <p>{client?.telephone}</p>
            <p>{client?.adresse}</p>
          </div>
          <div className="bon-box">
            <h3>Destinataire</h3>
            <p><strong>Tél. : {c.telDestinataire}</strong></p>
            <p>{c.adresseLivraison}</p>
          </div>
          <div className="bon-box">
            <h3>Enlèvement</h3>
            <p>{c.adresseEnlevement}</p>
          </div>
          <div className="bon-box">
            <h3>Transport</h3>
            <p>Camion : {l.camion?.immatriculation} ({l.camion?.type})</p>
            <p>Chauffeur : {l.chauffeur?.prenom} {l.chauffeur?.nom}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Marchandise</th>
              <th>Poids</th>
              <th>Volume</th>
              <th>Départ</th>
              <th>Arrivée</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{c.description}</td>
              <td>{c.poids} kg</td>
              <td>{c.volume} m³</td>
              <td>{date(l.dateDepart)}</td>
              <td>{date(l.dateArrivee)}</td>
            </tr>
          </tbody>
        </table>

        <div className="bon-sign">
          <div>
            Signature du chauffeur
          </div>
          <div>
            Signature du client
            {l.bon.signe && (
              <p className="bon-stamp">
                SIGNÉ ✓<br />
                {client?.prenom} {client?.nom}
              </p>
            )}
          </div>
        </div>

        <p className="bon-pied">
          Document généré par Fret — bon n° {l.bon.numero}
        </p>
      </article>
    </section>
  );
}
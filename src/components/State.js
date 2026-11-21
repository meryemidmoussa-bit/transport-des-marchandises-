import React from 'react';

export default function State({ loading, error, empty, emptyText }) {
  if (loading) return <p className="muted">Chargement...</p>;
  if (error) return <p className="error">Erreur : {error}</p>;
  if (empty) return <p className="muted">{emptyText}</p>;
  return null;
}
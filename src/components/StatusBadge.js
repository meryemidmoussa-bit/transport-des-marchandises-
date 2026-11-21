import React from 'react';
import { LABELS } from '../constants';

export default function StatusBadge({ statut }) {
  return <span className={`badge ${statut}`}>{LABELS[statut] || statut}</span>;
}
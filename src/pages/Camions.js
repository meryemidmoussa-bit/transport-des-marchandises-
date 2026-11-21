import React from 'react';
import CrudPage from '../components/CrudPage';

const fields = [
  { name: 'immatriculation', label: 'Immatriculation' },
  { name: 'type', label: 'Type' },
  { name: 'capacitePoids', label: 'Capacité poids (kg)', type: 'number' },
  { name: 'capaciteVolume', label: 'Capacité volume (m³)', type: 'number' },
  { name: 'etat', label: 'État (disponible, en_service, maintenance)' },
];

const columns = [
  { key: 'immatriculation', label: 'Immatriculation' },
  { key: 'type', label: 'Type' },
  { key: 'capacitePoids', label: 'Poids max (kg)' },
  { key: 'capaciteVolume', label: 'Volume max (m³)' },
  { key: 'etat', label: 'État' },
];

export default function Camions() {
  return <CrudPage title="Camions" endpoint="/camions" fields={fields} columns={columns} />;
}
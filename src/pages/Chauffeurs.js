import React from 'react';
import CrudPage from '../components/CrudPage';

const fields = [
  { name: 'nom', label: 'Nom' },
  { name: 'prenom', label: 'Prénom' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'telephone', label: 'Téléphone' },
  { name: 'numPermis', label: 'N° de permis' },
];

const columns = [
  { key: 'nom', label: 'Nom' },
  { key: 'prenom', label: 'Prénom' },
  { key: 'telephone', label: 'Téléphone' },
  { key: 'numPermis', label: 'Permis' },
  { key: 'disponible', label: 'Disponible', render: (c) => (c.disponible ? 'Oui' : 'Non') },
];

export default function Chauffeurs() {
  return <CrudPage title="Chauffeurs" endpoint="/chauffeurs" fields={fields} columns={columns} />;
}
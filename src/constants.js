export const STATUT_COMMANDE = {
  en_attente: 'En attente',
  validee: 'Validée',
  annulee: 'Annulée',
};

export const STATUT_LIVRAISON = {
  planifiee: 'Planifiée',
  chargee: 'Chargée',
  en_cours: 'En cours',
  livree: 'Livrée',
  echec: 'Échec',
};

export const LABELS = { ...STATUT_COMMANDE, ...STATUT_LIVRAISON };
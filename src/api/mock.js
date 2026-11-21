// API simulée : permet de tester le front sans Laravel
const KEY = 'mockdb';

const seed = {
  seq: 100,
  users: [
    { id: 1, nom: 'Admin', prenom: 'Gestionnaire', email: 'gestionnaire@test.com', password: '1234', role: 'gestionnaire' },
    { id: 2, nom: 'Alami', prenom: 'Sara', email: 'client@test.com', password: '1234', role: 'client', telephone: '0600000000', adresse: 'Agadir' },
    { id: 3, nom: 'Benali', prenom: 'Youssef', email: 'chauffeur@test.com', password: '1234', role: 'chauffeur', telephone: '0611111111', numPermis: 'P-1234', disponible: true },
  ],
  camions: [
    { id: 1, immatriculation: '12345-A-1', type: 'Fourgon', capacitePoids: 3000, capaciteVolume: 20, etat: 'disponible' },
  ],
  commandes: [],
  livraisons: [],
  bons: [],
};

const load = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // on ignore
  }
  return structuredClone(seed);
};
const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
const nextId = (db) => {
  db.seq += 1;
  return db.seq;
};
const pub = ({ password, ...rest }) => rest;

const fail = (status, message) => {
  const e = new Error(message);
  e.response = { status, data: { message } };
  throw e;
};

const addSuivi = (db, l, statut, motif = '') => {
  l.suivis.push({ id: nextId(db), statut, dateHeure: new Date().toISOString(), motif });
};

const expandCommande = (db, c) => ({ ...c, client: pub(db.users.find((u) => u.id === c.client_id)) });

const expandLivraison = (db, l) => {
  const chauffeur = db.users.find((u) => u.id === l.chauffeur_id);
  return {
    ...l,
    camion: db.camions.find((c) => c.id === l.camion_id),
    chauffeur: chauffeur && pub(chauffeur),
    commande: db.commandes.find((c) => c.id === l.commande_id),
    bon: db.bons.find((b) => b.livraison_id === l.id),
  };
};

const libererRessources = (db, l) => {
  const camion = db.camions.find((c) => c.id === l.camion_id);
  const chauffeur = db.users.find((u) => u.id === l.chauffeur_id);
  if (camion) camion.etat = 'disponible';
  if (chauffeur) chauffeur.disponible = true;
};

const occuperRessources = (db, l) => {
  const camion = db.camions.find((c) => c.id === l.camion_id);
  const chauffeur = db.users.find((u) => u.id === l.chauffeur_id);
  if (camion) camion.etat = 'en_service';
  if (chauffeur) chauffeur.disponible = false;
};

function route(db, method, path, body, me) {
  let m;

  // ---------- Authentification ----------
  if (method === 'post' && path === '/login') {
    const u = db.users.find((x) => x.email === body.email && x.password === body.password);
    if (!u) fail(401, 'Email ou mot de passe incorrect');
    return { token: `mock-${u.id}`, user: pub(u) };
  }
  if (method === 'post' && path === '/register') {
    if (db.users.some((x) => x.email === body.email)) fail(422, 'Cet email existe déjà');
    const u = { id: nextId(db), ...body, role: 'client' };
    db.users.push(u);
    return { token: `mock-${u.id}`, user: pub(u) };
  }
  if (path === '/logout') return {};
  if (!me) fail(401, 'Non authentifié');

  // ---------- Commandes ----------
  if (method === 'get' && path === '/commandes') {
    const list = me.role === 'client' ? db.commandes.filter((c) => c.client_id === me.id) : db.commandes;
    return list.map((c) => expandCommande(db, c));
  }
  if (method === 'post' && path === '/commandes') {
    const c = {
      id: nextId(db), client_id: me.id, statut: 'en_attente', livraison_id: null,
      ...body, poids: Number(body.poids), volume: Number(body.volume),
    };
    db.commandes.push(c);
    return c;
  }
  m = path.match(/^\/commandes\/(\d+)\/(valider|annuler)$/);
  if (method === 'patch' && m) {
    const c = db.commandes.find((x) => x.id === Number(m[1]));
    if (!c) fail(404, 'Commande introuvable');
    if (m[2] === 'annuler' && c.statut !== 'en_attente') fail(422, 'Seule une commande en attente peut être annulée');
    c.statut = m[2] === 'valider' ? 'validee' : 'annulee';
    return c;
  }

  // ---------- Camions et chauffeurs (CRUD) ----------
  m = path.match(/^\/(camions|chauffeurs)(?:\/(\d+))?$/);
  if (m) {
    const isCh = m[1] === 'chauffeurs';
    const all = isCh ? db.users.filter((u) => u.role === 'chauffeur') : db.camions;
    if (method === 'get') return all.map(pub);
    if (method === 'post') {
      const item = isCh
        ? { id: nextId(db), ...body, role: 'chauffeur', password: '1234', disponible: true }
        : { id: nextId(db), ...body, capacitePoids: Number(body.capacitePoids), capaciteVolume: Number(body.capaciteVolume) };
      (isCh ? db.users : db.camions).push(item);
      return pub(item);
    }
    const list = isCh ? db.users : db.camions;
    const item = list.find((x) => x.id === Number(m[2]));
    if (!item) fail(404, 'Élément introuvable');
    if (method === 'put') {
      Object.assign(item, body);
      if (!isCh) {
        item.capacitePoids = Number(item.capacitePoids);
        item.capaciteVolume = Number(item.capaciteVolume);
      }
      return pub(item);
    }
    if (method === 'delete') {
      list.splice(list.indexOf(item), 1);
      return {};
    }
  }

  // ---------- Livraisons ----------
  if (method === 'get' && path === '/livraisons') {
    const list = db.livraisons.filter((l) => {
      if (me.role === 'chauffeur') return l.chauffeur_id === me.id;
      if (me.role === 'client') {
        const c = db.commandes.find((x) => x.id === l.commande_id);
        return c && c.client_id === me.id;
      }
      return true;
    });
    return list.map((l) => expandLivraison(db, l));
  }
  if (method === 'post' && path === '/livraisons') {
    const cmd = db.commandes.find((x) => x.id === Number(body.commande_id));
    const camion = db.camions.find((x) => x.id === Number(body.camion_id));
    const chauffeur = db.users.find((x) => x.id === Number(body.chauffeur_id));
    if (!cmd || !camion || !chauffeur) fail(422, 'Données incomplètes');
    if (cmd.poids > camion.capacitePoids || cmd.volume > camion.capaciteVolume) {
      fail(422, 'Capacité du camion insuffisante');
    }
    const l = {
      id: nextId(db), commande_id: cmd.id, camion_id: camion.id, chauffeur_id: chauffeur.id,
      dateDepart: body.dateDepart, dateArrivee: null, statut: 'planifiee', nbTentatives: 0, suivis: [],
    };
    addSuivi(db, l, 'planifiee');
    cmd.livraison_id = l.id;
    occuperRessources(db, l);
    db.livraisons.push(l);
    return l;
  }
  m = path.match(/^\/livraisons\/(\d+)$/);
  if (method === 'get' && m) {
    const l = db.livraisons.find((x) => x.id === Number(m[1]));
    if (!l) fail(404, 'Livraison introuvable');
    return expandLivraison(db, l);
  }
  m = path.match(/^\/livraisons\/(\d+)\/(statut|replanifier|bon)$/);
  if (m) {
    const l = db.livraisons.find((x) => x.id === Number(m[1]));
    if (!l) fail(404, 'Livraison introuvable');
    if (m[2] === 'statut') {
      l.statut = body.statut;
      if (body.statut === 'livree') l.dateArrivee = new Date().toISOString();
      if (body.statut === 'echec') l.nbTentatives += 1;
      if (body.statut === 'livree' || body.statut === 'echec') libererRessources(db, l);
      addSuivi(db, l, body.statut, body.motif);
      return l;
    }
    if (m[2] === 'replanifier') {
      if (l.statut !== 'echec') fail(422, 'Seule une livraison en échec peut être replanifiée');
      l.statut = 'planifiee';
      l.dateDepart = body.dateDepart;
      occuperRessources(db, l);
      addSuivi(db, l, 'planifiee', 'Replanifiée');
      return l;
    }
    if (m[2] === 'bon') {
      if (db.bons.some((b) => b.livraison_id === l.id)) fail(422, 'Bon déjà généré');
      const bon = {
        id: nextId(db), livraison_id: l.id, numero: `BL-${l.id}-${new Date().getFullYear()}`,
        dateEmission: new Date().toISOString(), signe: false, observations: '',
      };
      db.bons.push(bon);
      return bon;
    }
  }
  m = path.match(/^\/bons\/(\d+)\/signer$/);
  if (method === 'patch' && m) {
    const bon = db.bons.find((b) => b.id === Number(m[1]));
    if (!bon) fail(404, 'Bon introuvable');
    bon.signe = true;
    return bon;
  }

  return fail(404, `Route inconnue : ${method.toUpperCase()} ${path}`);
}

// Adaptateur axios : remplace l'appel réseau
export default function mockAdapter(config) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const db = load();
        const method = config.method.toLowerCase();
        const path = config.url.split('?')[0];
        const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
        const auth = String(config.headers.get('Authorization') || '');
        const userId = Number(auth.replace('Bearer mock-', ''));
        const me = db.users.find((u) => u.id === userId);
        const data = route(db, method, path, body, me);
        save(db);
        resolve({ data, status: 200, statusText: 'OK', headers: {}, config });
      } catch (e) {
        reject(e);
      }
    }, 200);
  });
}
import { supabase } from './supabaseClient';

export const REPRISE_REPAS_STORAGE_KEY = 'reprises_repas_consommes';

export const MOMENTS_SUPABASE = {
  'Petit-déjeuner': 'matin',
  'Déjeuner': 'midi',
  'Dîner': 'soir',
  'Collation': 'collation',
  'Autre': 'collation',
  matin: 'matin',
  midi: 'midi',
  soir: 'soir',
  collation: 'collation'
};

export function normaliserMomentReprise(moment) {
  return MOMENTS_SUPABASE[moment] || 'collation';
}

export function genererClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, caractere => {
    const aleatoire = Math.floor(Math.random() * 16);
    const valeur = caractere === 'x' ? aleatoire : (aleatoire & 0x3) | 0x8;
    return valeur.toString(16);
  });
}

export function lireRepasRepriseLocaux() {
  if (typeof window === 'undefined') return [];
  try {
    const valeur = JSON.parse(localStorage.getItem(REPRISE_REPAS_STORAGE_KEY) || '[]');
    return Array.isArray(valeur) ? valeur : [];
  } catch (error) {
    console.warn('[REPRISE] Copie locale des repas illisible:', error);
    return [];
  }
}

export function sauvegarderRepasRepriseLocal(repas) {
  const repasLocaux = lireRepasRepriseLocaux();
  const index = repasLocaux.findIndex(item => item.client_id === repas.client_id);
  if (index >= 0) repasLocaux[index] = { ...repasLocaux[index], ...repas };
  else repasLocaux.push(repas);
  localStorage.setItem(REPRISE_REPAS_STORAGE_KEY, JSON.stringify(repasLocaux));
  return repas;
}

export async function trouverJourRepriseDistant({ repriseId, userId, jourNumero }) {
  const { data, error } = await supabase
    .from('reprises_jours_valides')
    .select('id')
    .eq('reprise_id', repriseId)
    .eq('user_id', userId)
    .eq('jour_numero', jourNumero)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) throw new Error(`Journée ${jourNumero} introuvable dans Supabase`);
  return data.id;
}

export function construireRepasRepriseDistant(repas, userId, jourId) {
  return {
    reprise_id: repas.reprise_id,
    jour_id: jourId,
    user_id: userId,
    client_id: repas.client_id,
    moment: normaliserMomentReprise(repas.moment),
    aliment_nom: repas.aliment_nom || 'Jeûne',
    quantite: repas.quantite === null || repas.quantite === undefined ? null : String(repas.quantite),
    conforme: Boolean(repas.conforme),
    consomme_le: repas.consomme_le,
    date_repas: repas.date_repas,
    heure_repas: repas.heure_repas || null,
    saisie_retroactive: Boolean(repas.saisie_retroactive),
    kcal: repas.kcal === '' || repas.kcal === null || repas.kcal === undefined ? null : Number(repas.kcal),
    note: repas.note || null,
    ressenti: repas.ressenti || null,
    evaluation_reprise: repas.evaluation_reprise || null,
    updated_at: new Date().toISOString()
  };
}

export async function synchroniserRepasReprise(repas) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user?.id) throw new Error('Utilisateur non connecté');
  if (!repas.reprise_id) throw new Error('Programme de reprise non identifié');

  const jourId = repas.jour_id || await trouverJourRepriseDistant({
    repriseId: repas.reprise_id,
    userId: user.id,
    jourNumero: repas.jour_numero
  });
  const payload = construireRepasRepriseDistant(repas, user.id, jourId);
  const { data, error } = await supabase
    .from('reprises_repas_consommes')
    .upsert(payload, { onConflict: 'user_id,client_id' })
    .select('id, jour_id, client_id')
    .single();

  if (error) throw error;
  const synchronise = {
    ...repas,
    id_distant: data.id,
    jour_id: data.jour_id,
    statut_sync: 'synchronise',
    synchronise_le: new Date().toISOString(),
    erreur_sync: null
  };
  sauvegarderRepasRepriseLocal(synchronise);
  return synchronise;
}

export async function synchroniserRepasRepriseEnAttente() {
  const enAttente = lireRepasRepriseLocaux().filter(repas => repas.statut_sync !== 'synchronise');
  const resultats = [];
  for (const repas of enAttente) {
    try {
      resultats.push(await synchroniserRepasReprise(repas));
    } catch (error) {
      sauvegarderRepasRepriseLocal({
        ...repas,
        statut_sync: 'en_attente',
        erreur_sync: error.message
      });
    }
  }
  return resultats;
}

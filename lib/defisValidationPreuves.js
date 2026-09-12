import { supabase } from './supabaseClient';

const dateLocaleISO = (date) => {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
};

function ajouterJours(date, jours) {
  const copie = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copie.setDate(copie.getDate() + jours);
  return copie;
}

function fenetreDuree(defi) {
  if (defi?.progression_model !== 'duration' || !defi?.started_at || !defi?.duree) return null;
  const debut = new Date(defi.started_at);
  const multiplicateur = defi.duree_unite === 'semaine' ? 7 : 1;
  const fin = ajouterJours(debut, Number(defi.duree) * multiplicateur);
  return { debut: dateLocaleISO(debut), finExclusive: dateLocaleISO(fin) };
}

async function utilisateurCourant() {
  const { data, error } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (error || !userId) throw new Error('Utilisateur non authentifié');
  return userId;
}

/**
 * Collecte uniquement des faits. Ce service ne décide jamais qu'un défi est réussi
 * et n'écrit aucune progression.
 */
export async function chargerPreuvesValidationDefi(defi, options = {}) {
  if (!defi?.id) throw new Error('Défi invalide');

  const userId = await utilisateurCourant();
  const date = options.date instanceof Date ? options.date : new Date(options.date || Date.now());
  const dateJour = dateLocaleISO(date);

  const { data: defiActif, error: defiError } = await supabase
    .from('defis')
    .select('id,nom,description,type,theme,duree,unite,status,progress,user_id,started_at,ended_at,progression_model,duree_unite')
    .eq('id', defi.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (defiError) throw defiError;
  if (!defiActif) throw new Error('Défi introuvable');

  const periode = fenetreDuree(defiActif);
  const peutObserver = defiActif.status === 'en cours' || (defiActif.status === 'terminé' && periode);
  if (!peutObserver) {
    return {
      userId,
      date: dateJour,
      defi: defiActif,
      actif: false,
      periode,
      repas: [],
      extras: [],
      journal: []
    };
  }

  let repasQuery = supabase
    .from('repas_reels')
    .select('id,date,type,type_repas,aliment,categorie,quantite,grammes,kcal,satiete,satiété_respectée,ressenti,pourquoi,regle_respectee,repas_planifie_respecte,note,heure,occurrence_repas_id')
    .eq('user_id', userId);

  let extrasQuery = supabase
    .from('extras')
    .select('id,date,heure,type,aliment,quantite,grammes,kcal,contexte,humeur,lie_a_repas_id,tag,commentaire')
    .eq('user_id', userId);

  if (periode) {
    repasQuery = repasQuery.gte('date', periode.debut).lt('date', periode.finExclusive);
    extrasQuery = extrasQuery.gte('date', periode.debut).lt('date', periode.finExclusive);
  } else {
    repasQuery = repasQuery.eq('date', dateJour);
    extrasQuery = extrasQuery.eq('date', dateJour);
  }

  const [repasResult, extrasResult, journalResult] = await Promise.all([
    repasQuery.order('date', { ascending: true }).order('heure', { ascending: true }),
    extrasQuery.order('date', { ascending: true }).order('heure', { ascending: true }),
    supabase
      .from('journal_defis')
      .select('id,defi_id,jour,engagements,note_personnelle,score,valide,created_at,updated_at')
      .eq('user_id', userId)
      .eq('defi_id', defi.id)
      .order('jour', { ascending: true })
  ]);

  const erreur = [repasResult, extrasResult, journalResult].find(resultat => resultat.error)?.error;
  if (erreur) throw erreur;

  return {
    userId,
    date: dateJour,
    defi: defiActif,
    actif: defiActif.status === 'en cours',
    periode,
    repas: repasResult.data || [],
    extras: extrasResult.data || [],
    journal: journalResult.data || []
  };
}

import { normaliserPeriodeReconstituee } from './trouSuivi';

const TABLE_PERIODES = 'suivi_periodes_estimees';
const COLONNES = 'id, date_debut, date_fin, statut, reproposer_apres, qualite_alimentaire, frequence_extras, repas_moyens, challenge_realise, challenge_type, challenge_duree, evolution_poids, energie_globale, classification, source, created_at, updated_at';

export async function chargerPeriodesReconstituees(client, userId) {
  if (!client || !userId) return { data: [], error: new Error('Utilisateur connecté requis.') };
  const { data, error } = await client
    .from(TABLE_PERIODES)
    .select(COLONNES)
    .eq('user_id', userId)
    .order('date_debut', { ascending: false });
  return { data: error ? [] : (data || []).map(normaliserPeriodeReconstituee), error };
}

export async function sauvegarderPeriodeReconstituee(client, userId, payload) {
  if (!client || !userId) return { data: null, error: new Error('Utilisateur connecté requis.') };
  const ligne = {
    user_id: userId,
    date_debut: payload.dateDebut,
    date_fin: payload.dateFin,
    statut: 'reconstituee',
    reproposer_apres: null,
    qualite_alimentaire: payload.qualiteAlimentaire || null,
    frequence_extras: payload.frequenceExtras || null,
    repas_moyens: payload.repasMoyens || null,
    challenge_realise: payload.challengeRealise === 'oui' || payload.challengeRealise === true,
    challenge_type: payload.challengeType || null,
    challenge_duree: payload.challengeDuree || null,
    evolution_poids: payload.evolutionPoids || null,
    energie_globale: payload.energieGlobale || null,
    classification: payload.classification || {},
    source: 'questionnaire',
    updated_at: new Date().toISOString()
  };
  const { data, error } = await client
    .from(TABLE_PERIODES)
    .upsert(ligne, { onConflict: 'user_id,date_debut,date_fin' })
    .select(COLONNES)
    .single();
  return { data: error ? null : normaliserPeriodeReconstituee(data), error };
}

export async function synchroniserTrousSuiviEnAttente(client, userId, trous, periodes = []) {
  if (!client || !userId) return { data: [], error: new Error('Utilisateur connecté requis.') };
  const clesExistantes = new Set((periodes || []).map(p => `${p.dateDebut}:${p.dateFin}`));
  const lignes = (trous || []).filter(t => !clesExistantes.has(`${t.dateDebut}:${t.dateFin}`)).map(t => ({
    user_id: userId, date_debut: t.dateDebut, date_fin: t.dateFin,
    statut: 'a_completer', reproposer_apres: null,
    source: 'detection_automatique', updated_at: new Date().toISOString()
  }));
  if (lignes.length === 0) return { data: [], error: null };
  const { data, error } = await client.from(TABLE_PERIODES).upsert(lignes, {
    onConflict: 'user_id,date_debut,date_fin', ignoreDuplicates: true
  }).select(COLONNES);
  return { data: error ? [] : (data || []).map(normaliserPeriodeReconstituee), error };
}

export async function reporterPeriodeReconstituee(client, userId, suggestion, jours = 7) {
  if (!client || !userId) return { data: null, error: new Error('Utilisateur connecté requis.') };
  const date = new Date();
  date.setDate(date.getDate() + jours);
  const { data, error } = await client
    .from(TABLE_PERIODES)
    .upsert({
      user_id: userId,
      date_debut: suggestion.dateDebut,
      date_fin: suggestion.dateFin,
      statut: 'reportee',
      reproposer_apres: date.toISOString().slice(0, 10),
      source: 'questionnaire',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date_debut,date_fin' })
    .select(COLONNES)
    .single();
  return { data: error ? null : normaliserPeriodeReconstituee(data), error };
}

export async function ignorerPeriodeReconstituee(client, userId, suggestion) {
  if (!client || !userId) return { data: null, error: new Error('Utilisateur connecté requis.') };
  const { data, error } = await client.from(TABLE_PERIODES).upsert({
    user_id: userId, date_debut: suggestion.dateDebut, date_fin: suggestion.dateFin,
    statut: 'ignoree', reproposer_apres: null, source: 'choix_utilisateur',
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,date_debut,date_fin' }).select(COLONNES).single();
  return { data: error ? null : normaliserPeriodeReconstituee(data), error };
}

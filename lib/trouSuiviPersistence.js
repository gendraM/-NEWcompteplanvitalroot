import { normaliserPeriodeReconstituee } from './trouSuivi';

const COLONNES = 'id, date_debut, date_fin, statut, reproposer_apres, qualite_alimentaire, frequence_extras, repas_moyens, challenge_realise, challenge_type, challenge_duree, evolution_poids, energie_globale, classification, source, created_at, updated_at';

export async function chargerPeriodesReconstituees(client, userId) {
  if (!client || !userId) return { data: [], error: new Error('Utilisateur connecté requis.') };
  const { data, error } = await client
    .from('suivi_periodes_reconstituees')
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
    repas_moyens: payload.repasMoyens === '4+'
      ? 4
      : (payload.repasMoyens ? Number(payload.repasMoyens) || null : null),
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
    .from('suivi_periodes_reconstituees')
    .upsert(ligne, { onConflict: 'user_id,date_debut,date_fin' })
    .select(COLONNES)
    .single();
  return { data: error ? null : normaliserPeriodeReconstituee(data), error };
}

export async function reporterPeriodeReconstituee(client, userId, suggestion, jours = 7) {
  if (!client || !userId) return { data: null, error: new Error('Utilisateur connecté requis.') };
  const date = new Date();
  date.setDate(date.getDate() + jours);
  const { data, error } = await client
    .from('suivi_periodes_reconstituees')
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

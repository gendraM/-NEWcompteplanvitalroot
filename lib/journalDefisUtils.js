// Fonctions utilitaires pour le suivi quotidien des défis personnalisés
import { supabase } from './supabaseClient';

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) throw new Error('Utilisateur non authentifié');
  return data.user.id;
}

export async function sauvegarderEngagements(defiId, jour, engagements, notePersonnelle = '') {
  try {
    const userId = await getAuthenticatedUserId();
    const { data: existant, error: selectError } = await supabase.from('journal_defis').select('id, valide').eq('defi_id', defiId).eq('jour', jour).eq('user_id', userId).maybeSingle();
    if (selectError) return { success: false, error: selectError.message };
    if (existant?.valide) return { success: false, error: 'Cette journée est déjà validée' };
    const payload = { defi_id: defiId, user_id: userId, jour, engagements, note_personnelle: notePersonnelle, score: null, valide: false, updated_at: new Date().toISOString() };
    const query = existant ? supabase.from('journal_defis').update(payload).eq('id', existant.id).eq('user_id', userId) : supabase.from('journal_defis').insert([payload]);
    const { error } = await query;
    return error ? { success: false, error: error.message } : { success: true };
  } catch (err) { return { success: false, error: err.message }; }
}

// Contrat direct pour le composant JournalDefiPersonnalise : retourne la ligne ou null.
export async function chargerJournalDefi(defiId, jour) {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase.from('journal_defis').select('*').eq('defi_id', defiId).eq('jour', jour).eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

export async function chargerHistoriqueDefi(defiId) {
  try {
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase.from('journal_defis').select('*').eq('defi_id', defiId).eq('user_id', userId).order('jour', { ascending: true });
    return error ? { data: [], error: error.message } : { data: data || [] };
  } catch (err) { return { data: [], error: err.message }; }
}

// La validation métier + l'incrément de progression sont effectués dans une seule
// transaction PostgreSQL. Un second appel pour le même (user, défi, jour) est idempotent.
export async function validerEtapeDefi(defiId, jour, engagements) {
  try {
    await getAuthenticatedUserId();
    const { data, error } = await supabase.rpc('valider_journal_defi_atomique', {
      p_defi_id: defiId,
      p_jour: jour,
      p_engagements: engagements,
    });
    if (error) return { success: false, etapeValidee: false, progressionIncrementee: false, error: error.message };
    return {
      success: data?.success === true,
      etapeValidee: data?.etapeValidee === true,
      progressionIncrementee: data?.progressionIncrementee === true,
      newProgress: data?.newProgress ?? 0,
      nouvelleProgression: data?.nouvelleProgression ?? data?.newProgress ?? 0,
      nouveauStatus: data?.nouveauStatus,
      dejaValidee: data?.dejaValidee === true,
    };
  } catch (err) {
    return { success: false, etapeValidee: false, progressionIncrementee: false, error: err.message };
  }
}

function engagementTenu(engagement) { return engagement?.tenu === true || engagement?.valide === true; }
export function calculerScore(engagements) {
  if (!engagements || engagements.length === 0) return '0/0';
  const tenus = engagements.filter(engagementTenu).length;
  return `${tenus}/${engagements.length}`;
}
export function calculerScoreNumerique(engagements) {
  if (!engagements || engagements.length === 0) return 0;
  return engagements.filter(engagementTenu).length / engagements.length;
}

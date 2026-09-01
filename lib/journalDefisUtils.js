// Fonctions utilitaires pour le suivi quotidien des défis personnalisés
import { supabase } from './supabaseClient';
import { validerEtapeDefi as incrementerProgressionDefi } from './defisUtils';

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) throw new Error('Utilisateur non authentifié');
  return data.user.id;
}

export async function sauvegarderEngagements(defiId, jour, engagements, notePersonnelle = '') {
  try {
    const userId = await getAuthenticatedUserId();
    const { data: existant, error: selectError } = await supabase
      .from('journal_defis')
      .select('id, valide')
      .eq('defi_id', defiId)
      .eq('jour', jour)
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) return { success: false, error: selectError.message };
    if (existant?.valide) return { success: false, error: 'Cette journée est déjà validée' };

    const payload = {
      defi_id: defiId,
      user_id: userId,
      jour,
      engagements,
      note_personnelle: notePersonnelle,
      score: null,
      valide: false,
      updated_at: new Date().toISOString()
    };

    const query = existant
      ? supabase.from('journal_defis').update(payload).eq('id', existant.id).eq('user_id', userId)
      : supabase.from('journal_defis').insert([payload]);
    const { error } = await query;
    return error ? { success: false, error: error.message } : { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function chargerJournalDefi(defiId, jour) {
  try {
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
      .from('journal_defis')
      .select('*')
      .eq('defi_id', defiId)
      .eq('jour', jour)
      .eq('user_id', userId)
      .maybeSingle();
    return error ? { data: null, error: error.message } : { data: data || null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function chargerHistoriqueDefi(defiId) {
  try {
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
      .from('journal_defis')
      .select('*')
      .eq('defi_id', defiId)
      .eq('user_id', userId)
      .order('jour', { ascending: true });
    return error ? { data: [], error: error.message } : { data: data || [] };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

/**
 * Valide une journée. Une journée déjà validée ne peut jamais incrémenter deux fois.
 */
export async function validerEtapeDefi(defiId, jour, engagements) {
  try {
    const userId = await getAuthenticatedUserId();
    const score = calculerScore(engagements);
    const scoreNumerique = calculerScoreNumerique(engagements);
    const etapeValidee = scoreNumerique >= (2 / 3);

    const { data: journal, error: journalSelectError } = await supabase
      .from('journal_defis')
      .select('id, valide')
      .eq('defi_id', defiId)
      .eq('jour', jour)
      .eq('user_id', userId)
      .maybeSingle();

    if (journalSelectError) return { success: false, etapeValidee: false, error: journalSelectError.message };
    if (!journal) return { success: false, etapeValidee: false, error: 'Journal du jour introuvable' };
    if (journal.valide) {
      const { data: defi } = await supabase.from('defis').select('progress').eq('id', defiId).eq('user_id', userId).maybeSingle();
      return { success: true, etapeValidee: true, progressionIncrementee: false, newProgress: defi?.progress || 0 };
    }

    const { error: journalError } = await supabase
      .from('journal_defis')
      .update({ engagements, score, valide: etapeValidee, updated_at: new Date().toISOString() })
      .eq('id', journal.id)
      .eq('user_id', userId);

    if (journalError) return { success: false, etapeValidee: false, error: journalError.message };
    if (!etapeValidee) return { success: true, etapeValidee: false, progressionIncrementee: false };

    const { data: defi, error: defiError } = await supabase
      .from('defis')
      .select('*')
      .eq('id', defiId)
      .eq('user_id', userId)
      .single();
    if (defiError) return { success: false, etapeValidee: true, error: defiError.message };

    const progression = await incrementerProgressionDefi(defi);
    return {
      ...progression,
      etapeValidee: true,
      progressionIncrementee: progression.progressionIncrementee === true,
      newProgress: progression.newProgress ?? progression.nouvelleProgression ?? defi.progress
    };
  } catch (err) {
    return { success: false, etapeValidee: false, error: err.message };
  }
}

export function calculerScore(engagements) {
  if (!engagements || engagements.length === 0) return '0/0';
  const tenus = engagements.filter(e => e.tenu === true).length;
  return `${tenus}/${engagements.length}`;
}

export function calculerScoreNumerique(engagements) {
  if (!engagements || engagements.length === 0) return 0;
  return engagements.filter(e => e.tenu === true).length / engagements.length;
}

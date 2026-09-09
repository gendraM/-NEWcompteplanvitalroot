import { supabase } from './supabaseClient';
import { VALIDATION_DECISION } from './defisValidationReferentiel';

/**
 * Unique point d'écriture du nouveau moteur de validation.
 * Une décision non validée ne peut jamais modifier la progression.
 */
export async function appliquerDecisionValidation(defi, decision, options = {}) {
  if (!defi?.id) return { success: false, error: 'Défi invalide' };
  if (!decision) return { success: false, error: 'Décision absente' };

  if (decision.decision === VALIDATION_DECISION.ALREADY_VALIDATED) {
    return { success: true, progressionIncrementee: false, dejaValidee: true };
  }

  if (decision.decision !== VALIDATION_DECISION.VALIDATED) {
    return {
      success: true,
      progressionIncrementee: false,
      etapeValidee: false,
      decision: decision.decision
    };
  }

  if (!decision.preuveId) {
    return { success: false, progressionIncrementee: false, error: 'Preuve idempotente absente' };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    return { success: false, progressionIncrementee: false, error: 'Utilisateur non authentifié' };
  }

  const { data, error } = await supabase.rpc('valider_preuve_defi_atomique', {
    p_defi_id: defi.id,
    p_preuve_id: decision.preuveId,
    p_validation_mode: decision.mode,
    p_preuve_source: options.source || decision.donnees?.source || null,
    p_donnees: decision.donnees || {}
  });

  if (error) {
    return { success: false, progressionIncrementee: false, error: error.message };
  }

  return {
    success: data?.success === true,
    etapeValidee: data?.etapeValidee === true,
    progressionIncrementee: data?.progressionIncrementee === true,
    dejaValidee: data?.dejaValidee === true,
    newProgress: data?.newProgress ?? 0,
    nouvelleProgression: data?.nouvelleProgression ?? data?.newProgress ?? 0,
    nouveauStatus: data?.nouveauStatus
  };
}

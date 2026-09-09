import { supabase } from './supabaseClient';

/** Point d'entrée unique pour démarrer un défi sans dupliquer la logique en UI. */
export async function demarrerDefi(defiId) {
  if (!defiId) return { success: false, error: 'Défi introuvable' };

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    return { success: false, error: 'Utilisateur non authentifié' };
  }

  const { data, error } = await supabase.rpc('demarrer_defi', { p_defi_id: defiId });
  if (error) return { success: false, error: error.message || 'Erreur lors du démarrage du défi' };
  return data || { success: true };
}

import { supabase } from './supabaseClient';

export const DELAI_PAS_MAINTENANT_JOURS = 7;

const utilisateurCourant = async () => {
  const { data, error } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (error || !userId) throw new Error('Utilisateur non authentifié');
  return userId;
};

export async function chargerDefisEnPause() {
  const userId = await utilisateurCourant();
  const { data, error } = await supabase
    .from('defis_solicitations')
    .select('defi_id,next_eligible_at')
    .eq('user_id', userId)
    .eq('statut', 'pas_maintenant')
    .gt('next_eligible_at', new Date().toISOString());

  if (error) throw error;
  return (data || []).map(item => item.defi_id);
}

export async function propositionEnPause(defiId) {
  if (!defiId) return false;
  const defisEnPause = await chargerDefisEnPause();
  return defisEnPause.some(id => Number(id) === Number(defiId));
}

export async function enregistrerReponseProposition(defiId, statut) {
  if (!defiId || !['pas_maintenant', 'accepte'].includes(statut)) {
    throw new Error('Réponse de proposition invalide');
  }

  const userId = await utilisateurCourant();
  const maintenant = new Date();
  const prochaineEligibilite = statut === 'pas_maintenant'
    ? new Date(maintenant.getTime() + DELAI_PAS_MAINTENANT_JOURS * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('defis_solicitations')
    .upsert({
      user_id: userId,
      defi_id: defiId,
      statut,
      last_response_at: maintenant.toISOString(),
      next_eligible_at: prochaineEligibilite,
      updated_at: maintenant.toISOString()
    }, { onConflict: 'user_id,defi_id' });

  if (error) throw error;
  return { success: true, nextEligibleAt: prochaineEligibilite };
}

import { supabase } from './supabaseClient';

async function utilisateurAuthentifie() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) throw new Error('Utilisateur non authentifié');
  return data.user.id;
}

export async function chargerObservationsDuree(defiId) {
  const userId = await utilisateurAuthentifie();
  const { data, error } = await supabase
    .from('defis_observations_duree')
    .select('*')
    .eq('defi_id', defiId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sauvegarderObservationDuree(defi, decision, reponse, donnees = {}) {
  if (!defi?.id || !decision?.preuveId) throw new Error('Observation invalide');
  if (!['oui', 'non', 'autre'].includes(reponse)) throw new Error('Réponse invalide');

  const userId = await utilisateurAuthentifie();
  const payload = {
    user_id: userId,
    defi_id: defi.id,
    preuve_id: decision.preuveId,
    reponse,
    donnees: {
      ...(decision.donnees || {}),
      ...(donnees || {}),
      raison: decision.raison || null
    },
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('defis_observations_duree')
    .upsert(payload, { onConflict: 'user_id,defi_id,preuve_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

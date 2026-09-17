import { calculerProgressionPalier, extraireSemainesPalier } from './ideauxPalier';

export function rattacherProgressionAuxIdeaux(ideaux = [], seancesReelles = []) {
  const seancesParIdeal = new Map();

  for (const seance of seancesReelles || []) {
    if (!seance?.ideal_id) continue;
    const groupe = seancesParIdeal.get(seance.ideal_id) || [];
    groupe.push(seance);
    seancesParIdeal.set(seance.ideal_id, groupe);
  }

  return (ideaux || []).map((ideal) => {
    const seances = seancesParIdeal.get(ideal.id) || [];
    const semaines = extraireSemainesPalier(ideal.plan_data, ideal);
    return {
      ...ideal,
      seances_reelles: seances,
      progression_palier: calculerProgressionPalier(semaines, seances),
    };
  });
}

export async function chargerIdeauxAvecProgression(supabase, userId) {
  let ideauxQuery = supabase.from('ideaux').select('*').order('date_cible', { ascending: true });
  if (userId) ideauxQuery = ideauxQuery.eq('user_id', userId);
  const { data: ideaux, error: ideauxError } = await ideauxQuery;
  if (ideauxError) throw ideauxError;

  const ids = (ideaux || []).map((ideal) => ideal.id);
  if (!ids.length) return [];

  let seancesQuery = supabase.from('seances_reelles').select('*').in('ideal_id', ids);
  if (userId) seancesQuery = seancesQuery.eq('user_id', userId);
  const { data: seances, error: seancesError } = await seancesQuery;
  if (seancesError) throw seancesError;

  return rattacherProgressionAuxIdeaux(ideaux, seances || []);
}

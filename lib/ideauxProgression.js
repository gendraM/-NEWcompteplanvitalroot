import { calculerProgressionPalier, extraireSemainesPalier } from './ideauxPalier';

function normaliserId(value) {
  return value == null ? null : String(value);
}

export function rattacherProgressionAuxIdeaux(ideaux = [], seancesReelles = []) {
  const seancesParIdeal = new Map();

  for (const seance of seancesReelles || []) {
    const idealId = normaliserId(seance?.ideal_id);
    if (!idealId) continue;
    const groupe = seancesParIdeal.get(idealId) || [];
    groupe.push(seance);
    seancesParIdeal.set(idealId, groupe);
  }

  return (ideaux || []).map((ideal) => {
    const idealId = normaliserId(ideal?.id);
    const seances = idealId ? (seancesParIdeal.get(idealId) || []) : [];
    const semaines = extraireSemainesPalier(ideal?.plan_data, ideal);

    return {
      ...ideal,
      seances_reelles: seances,
      progression_palier: calculerProgressionPalier(semaines, seances),
    };
  });
}

export async function chargerIdeauxAvecProgression(supabase, userId) {
  if (!supabase?.from) throw new Error('Client Supabase invalide');

  let ideauxQuery = supabase.from('ideaux').select('*').order('date_cible', { ascending: true });
  if (userId) ideauxQuery = ideauxQuery.eq('user_id', userId);

  const { data: ideaux, error: ideauxError } = await ideauxQuery;
  if (ideauxError) throw ideauxError;

  const listeIdeaux = ideaux || [];
  const ids = listeIdeaux.map((ideal) => ideal?.id).filter(Boolean);
  if (!ids.length) return rattacherProgressionAuxIdeaux(listeIdeaux, []);

  let seancesQuery = supabase.from('seances_reelles').select('*').in('ideal_id', ids);
  if (userId) seancesQuery = seancesQuery.eq('user_id', userId);

  const { data: seances, error: seancesError } = await seancesQuery;
  if (seancesError) throw seancesError;

  return rattacherProgressionAuxIdeaux(listeIdeaux, seances || []);
}

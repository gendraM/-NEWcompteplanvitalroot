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

import { extraireSemainesPalier, seanceEstFaite } from './ideauxPalier';

function datesPrevues(semaines = []) {
  return new Set(
    semaines.flatMap((semaine) =>
      (semaine?.actions || []).map((action) => action?.date).filter(Boolean)
    )
  );
}

export function calculerBilanPalier(ideal, seancesReelles = []) {
  const semaines = extraireSemainesPalier(ideal?.plan_data, ideal);
  const prevues = datesPrevues(semaines);

  const prevuesRealisees = new Set(
    (seancesReelles || [])
      .filter(
        (seance) =>
          !seance?.bonus &&
          seanceEstFaite(seance) &&
          prevues.has(seance?.date_prevue)
      )
      .map((seance) => seance.date_prevue)
  );

  const bonusRealises = (seancesReelles || []).filter(
    (seance) => seance?.bonus === true && seanceEstFaite(seance)
  );

  const totalPrevu = prevues.size;
  const realisePrevu = prevuesRealisees.size;
  const supplementaires = bonusRealises.length;
  const totalReel = realisePrevu + supplementaires;

  return {
    totalPrevu,
    realisePrevu,
    engagementPourcentage: totalPrevu > 0
      ? Math.round((realisePrevu / totalPrevu) * 100)
      : 0,
    engagementTermine: totalPrevu > 0 && realisePrevu === totalPrevu,
    supplementaires,
    totalReel,
  };
}

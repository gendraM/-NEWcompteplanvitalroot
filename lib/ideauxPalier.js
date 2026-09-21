export function getPalierDureeSemaines(ideal) {
  const valeur = Number(ideal?.plan_params_valides?.palierDuree);
  return Number.isInteger(valeur) && valeur > 0 ? valeur : 4;
}

export function extraireSemainesPalier(planData, ideal) {
  const limite = getPalierDureeSemaines(ideal);
  const semaines = [];

  for (const mois of planData?.mois || []) {
    for (const semaine of mois.semaines || []) {
      if (semaines.length >= limite) return semaines;
      semaines.push({ ...semaine, mois: mois.numero, annee: mois.annee });
    }
  }

  return semaines;
}

export function seanceEstFaite(seance) {
  return seance?.fait === true;
}

export function normaliserSeancePourEcriture(seance) {
  const fait = seance?.fait === true;
  return {
    ...seance,
    fait,
    statut: fait ? 'fait' : 'à faire',
    date_reelle: fait ? (seance.date_reelle || new Date().toISOString().slice(0, 10)) : null,
  };
}

function datesPrevuesDuPalier(semaines = []) {
  return new Set(
    semaines.flatMap((semaine) =>
      (semaine?.actions || []).map((action) => action?.date).filter(Boolean)
    )
  );
}

export function calculerProgressionPalier(semaines, seancesReelles = []) {
  const datesPrevues = datesPrevuesDuPalier(semaines || []);
  const datesFaites = new Set(
    (seancesReelles || [])
      .filter(
        (seance) =>
          !seance?.bonus &&
          seanceEstFaite(seance) &&
          datesPrevues.has(seance?.date_prevue)
      )
      .map((seance) => seance.date_prevue)
  );

  const total = datesPrevues.size;
  const faites = datesFaites.size;

  return {
    total,
    faites,
    pourcentage: total > 0 ? Math.round((faites / total) * 100) : 0,
    termine: total > 0 && faites === total,
  };
}

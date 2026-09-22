function nombre(valeur) {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

export function analyserRealisationSeance(seance) {
  if (!seance || seance.fait !== true || seance.bonus === true) return null;

  const dureePrevue = nombre(seance.duree_prevue);
  const dureeReelle = nombre(seance.duree_reelle);
  const depassementDuree = dureePrevue !== null && dureeReelle !== null
    ? dureeReelle - dureePrevue
    : null;

  return {
    datePrevue: seance.date_prevue || null,
    dateReelle: seance.date_reelle || seance.date_prevue || null,
    decalee: Boolean(seance.date_reelle && seance.date_prevue && seance.date_reelle !== seance.date_prevue),
    dureePrevue,
    dureeReelle,
    depassementDuree,
    depasseObjectif: depassementDuree !== null && depassementDuree > 0,
  };
}

export function construireSignauxPalier(seances = []) {
  const realisees = (seances || [])
    .map(analyserRealisationSeance)
    .filter(Boolean);

  const avecDuree = realisees.filter(
    (seance) => seance.dureePrevue !== null && seance.dureeReelle !== null
  );
  const depassements = avecDuree.filter((seance) => seance.depasseObjectif);
  const decalees = realisees.filter((seance) => seance.decalee);

  const dureeMoyenneReelle = avecDuree.length
    ? Math.round(avecDuree.reduce((total, seance) => total + seance.dureeReelle, 0) / avecDuree.length)
    : null;

  return {
    seancesRealisees: realisees.length,
    seancesDecalees: decalees.length,
    depassementsObjectif: depassements.length,
    dureeMoyenneReelle,
    depassementRepete: avecDuree.length >= 2 && depassements.length / avecDuree.length >= 0.6,
  };
}

/** Moteur métier unique de progression des extras. */
export const PALIERS_EXTRAS = Object.freeze([
  { palier: 5, prochainPalier: 3, semainesRequises: 4 },
  { palier: 3, prochainPalier: 2, semainesRequises: 8 },
  { palier: 2, prochainPalier: 1, semainesRequises: 12 },
  { palier: 1, prochainPalier: null, semainesRequises: 0 },
]);

const lireNombre = valeur => {
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
};
const estValidee = semaine => semaine?.validee === true || semaine?.validee === 'true' || semaine?.validee === 1;
const lireDateSemaine = semaine => semaine?.weekStart || semaine?.semaine_debut || '';

export function evaluerSemaineExtras(semaine, palier) {
  const extras = lireNombre(semaine?.extras_count);
  const kcalExtras = lireNombre(semaine?.kcal_extras);
  const budgetExtras = lireNombre(semaine?.budget_extras);
  const cloturee = estValidee(semaine);
  const frequenceRespectee = extras !== null && extras <= palier;
  const budgetDisponible = budgetExtras !== null && budgetExtras > 0;
  const caloriesRespectees = budgetDisponible && kcalExtras !== null && kcalExtras <= budgetExtras;
  return {
    cloturee,
    frequenceRespectee,
    caloriesRespectees,
    budgetDisponible,
    comptePourProgression: cloturee && frequenceRespectee && caloriesRespectees,
  };
}

export function calculerProgressionExtras(semaines = []) {
  const semainesTriees = [...(Array.isArray(semaines) ? semaines : [])]
    .filter(semaine => lireDateSemaine(semaine))
    .sort((a, b) => lireDateSemaine(a).localeCompare(lireDateSemaine(b)));
  let indexPalier = 0;
  let semainesAcquises = 0;
  const historique = [];
  for (const semaine of semainesTriees) {
    const configuration = PALIERS_EXTRAS[indexPalier];
    if (!configuration || configuration.prochainPalier === null) break;
    const evaluation = evaluerSemaineExtras(semaine, configuration.palier);
    if (evaluation.comptePourProgression) semainesAcquises += 1;
    historique.push({ weekStart: lireDateSemaine(semaine), palierApplique: configuration.palier, ...evaluation });
    if (semainesAcquises >= configuration.semainesRequises) {
      indexPalier += 1;
      semainesAcquises = 0;
    }
  }
  const configuration = PALIERS_EXTRAS[indexPalier] || PALIERS_EXTRAS[PALIERS_EXTRAS.length - 1];
  return {
    palier: configuration.palier,
    prochainPalier: configuration.prochainPalier,
    semainesRequises: configuration.semainesRequises,
    semainesAcquises,
    semainesRestantes: configuration.prochainPalier === null ? 0 : Math.max(0, configuration.semainesRequises - semainesAcquises),
    historique,
  };
}

export function getVerbatimProgressionExtras(progression) {
  if (!progression || progression.prochainPalier === null) return 'Tes choix suivent le rythme que tu as créé.';
  const nombre = progression.semainesRestantes;
  return `Tes choix se rapprochent du rythme que tu veux créer. Encore ${nombre} semaine${nombre > 1 ? 's' : ''} dans cette direction avant d’évoluer vers le palier ${progression.prochainPalier}.`;
}

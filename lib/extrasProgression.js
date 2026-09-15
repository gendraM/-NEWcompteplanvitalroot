/** Moteur métier unique de progression des extras. */
export const PALIERS_EXTRAS = Object.freeze([
  { palier: 5, prochainPalier: 3, semainesRequises: 4 },
  { palier: 3, prochainPalier: 2, semainesRequises: 8 },
  { palier: 2, prochainPalier: 1, semainesRequises: 12 },
  { palier: 1, prochainPalier: null, semainesRequises: 0 },
]);

export const SEMAINES_DEPASSEMENT_POUR_ADAPTATION = 3;

const lireNombre = valeur => {
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
};
const estValidee = semaine => semaine?.validee === true || semaine?.validee === 'true' || semaine?.validee === 1;
const lireDateSemaine = semaine => semaine?.weekStart || semaine?.semaine_debut || '';

function ecartEnJours(dateDebut, dateFin) {
  const debut = new Date(`${dateDebut}T12:00:00`);
  const fin = new Date(`${dateFin}T12:00:00`);
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) return null;
  return Math.round((fin - debut) / 86400000);
}

export function evaluerSemaineExtras(semaine, palier) {
  const extras = lireNombre(semaine?.extras_count);
  const kcalExtras = lireNombre(semaine?.kcal_extras);
  const budgetExtras = lireNombre(semaine?.budget_extras);
  const cloturee = estValidee(semaine);
  const frequenceRespectee = extras !== null && extras <= palier;
  const frequenceDepassee = cloturee && extras !== null && extras > palier;
  const budgetDisponible = budgetExtras !== null && budgetExtras > 0;
  const caloriesRespectees = budgetDisponible && kcalExtras !== null && kcalExtras <= budgetExtras;
  return {
    cloturee,
    frequenceRespectee,
    frequenceDepassee,
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
  let serieDepassement = 0;
  let derniereSemaineObservee = null;
  const historique = [];
  const transitions = [];
  const adaptations = [];
  const acquisParPalier = new Map(
    PALIERS_EXTRAS.map(configuration => [configuration.palier, { nombre: 0, semaines: [] }])
  );

  for (const semaine of semainesTriees) {
    const configuration = PALIERS_EXTRAS[indexPalier];
    if (!configuration) break;

    const weekStart = lireDateSemaine(semaine);
    const evaluation = evaluerSemaineExtras(semaine, configuration.palier);
    const suitLaSemainePrecedente = derniereSemaineObservee !== null
      && ecartEnJours(derniereSemaineObservee, weekStart) === 7;

    if (evaluation.frequenceDepassee) {
      serieDepassement = suitLaSemainePrecedente ? serieDepassement + 1 : 1;
    } else {
      serieDepassement = 0;
    }

    const acquis = acquisParPalier.get(configuration.palier);
    if (configuration.prochainPalier !== null && evaluation.comptePourProgression) {
      acquis.nombre += 1;
      acquis.semaines.push({
        weekStart,
        extrasCount: lireNombre(semaine?.extras_count),
        kcalExtras: lireNombre(semaine?.kcal_extras),
        budgetExtras: lireNombre(semaine?.budget_extras),
      });
    }

    const entreeHistorique = {
      weekStart,
      palierApplique: configuration.palier,
      serieDepassement,
      ...evaluation,
    };
    historique.push(entreeHistorique);

    if (indexPalier > 0 && serieDepassement >= SEMAINES_DEPASSEMENT_POUR_ADAPTATION) {
      const palierAdapte = PALIERS_EXTRAS[indexPalier - 1].palier;
      const adaptation = {
        palierDepart: configuration.palier,
        palierAdapte,
        semainesConsecutives: SEMAINES_DEPASSEMENT_POUR_ADAPTATION,
        semaineDecisive: weekStart,
      };
      adaptations.push(adaptation);
      entreeHistorique.adaptation = adaptation;
      indexPalier -= 1;
      serieDepassement = 0;
      derniereSemaineObservee = weekStart;
      continue;
    }

    if (
      configuration.prochainPalier !== null
      && acquis.nombre >= configuration.semainesRequises
    ) {
      transitions.push({
        code: `extras-palier-${configuration.prochainPalier}`,
        nom: 'Nouveau rythme',
        palierDepart: configuration.palier,
        palierAtteint: configuration.prochainPalier,
        semainesRequises: configuration.semainesRequises,
        semaineDecisive: weekStart,
        semaines: [...acquis.semaines],
      });
      acquis.nombre = 0;
      acquis.semaines = [];
      indexPalier += 1;
      serieDepassement = 0;
    }

    derniereSemaineObservee = weekStart;
  }

  const configuration = PALIERS_EXTRAS[indexPalier] || PALIERS_EXTRAS[PALIERS_EXTRAS.length - 1];
  const acquisActuels = acquisParPalier.get(configuration.palier) || { nombre: 0, semaines: [] };
  const derniereAdaptation = adaptations[adaptations.length - 1] || null;
  const derniereSemaine = historique[historique.length - 1]?.weekStart || null;

  return {
    palier: configuration.palier,
    prochainPalier: configuration.prochainPalier,
    semainesRequises: configuration.semainesRequises,
    semainesAcquises: acquisActuels.nombre,
    semainesRestantes: configuration.prochainPalier === null
      ? 0
      : Math.max(0, configuration.semainesRequises - acquisActuels.nombre),
    serieDepassement,
    historique,
    transitions,
    adaptations,
    derniereAdaptation,
    adaptationRecente: derniereAdaptation?.semaineDecisive === derniereSemaine,
  };
}

export function getVerbatimProgressionExtras(progression) {
  if (progression?.adaptationRecente) {
    return `Ton rythme a été plus présent ces dernières semaines. Ton palier s’adapte à ${progression.palier} moments pour repartir d’un repère qui correspond mieux à ce que tu vis aujourd’hui.`;
  }
  if (!progression || progression.prochainPalier === null) return 'Tes choix suivent le rythme que tu as créé.';
  const nombre = progression.semainesRestantes;
  return `Tes choix se rapprochent du rythme que tu veux créer. Encore ${nombre} semaine${nombre > 1 ? 's' : ''} dans cette direction avant d’évoluer vers le palier ${progression.prochainPalier}.`;
}

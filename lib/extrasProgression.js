/** Moteur métier partagé de progression récente des extras. */
export const PALIERS_EXTRAS = Object.freeze([
  { palier: 5, prochainPalier: 3, semainesRequises: 4, tailleFenetre: 5 },
  { palier: 3, prochainPalier: 2, semainesRequises: 8, tailleFenetre: 10 },
  { palier: 2, prochainPalier: 1, semainesRequises: 12, tailleFenetre: 15 },
  { palier: 1, prochainPalier: null, semainesRequises: 0, tailleFenetre: 15 },
]);

export const SEMAINES_DEPASSEMENT_POUR_ADAPTATION = 3;

const lireNombre = valeur => {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
};
const estValidee = semaine => semaine?.validee === true || semaine?.validee === 'true' || semaine?.validee === 1;
const lireDateSemaine = semaine => semaine?.weekStart || semaine?.semaine_debut || '';

function dateUtc(date) {
  const resultat = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(resultat.getTime()) ? null : resultat;
}
function ecartEnSemaines(dateDebut, dateFin) {
  const debut = dateUtc(dateDebut);
  const fin = dateUtc(dateFin);
  if (!debut || !fin) return null;
  return Math.round((fin - debut) / 604800000);
}
function ajouterSemaines(date, nombre) {
  const resultat = dateUtc(date);
  if (!resultat) return null;
  resultat.setUTCDate(resultat.getUTCDate() + nombre * 7);
  return resultat.toISOString().slice(0, 10);
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
    donneesFiables: extras !== null && kcalExtras !== null && budgetDisponible,
    frequenceRespectee,
    frequenceDepassee,
    caloriesRespectees,
    budgetDisponible,
    comptePourProgression: cloturee && frequenceRespectee && caloriesRespectees,
  };
}

function preuveSemaine(semaine) {
  return {
    weekStart: lireDateSemaine(semaine),
    extrasCount: lireNombre(semaine?.extras_count),
    kcalExtras: lireNombre(semaine?.kcal_extras),
    budgetExtras: lireNombre(semaine?.budget_extras),
  };
}

export function calculerProgressionExtras(semaines = []) {
  const semainesTriees = [...(Array.isArray(semaines) ? semaines : [])]
    .filter(semaine => lireDateSemaine(semaine))
    .sort((a, b) => lireDateSemaine(a).localeCompare(lireDateSemaine(b)));

  let indexPalier = 0;
  let serieDepassement = 0;
  let derniereDate = null;
  let fenetreRecente = [];
  const historique = [];
  const transitions = [];
  const adaptations = [];
  const paliersDejaAtteints = new Set();

  const ajouterDansFenetre = entree => {
    const configuration = PALIERS_EXTRAS[indexPalier];
    fenetreRecente.push(entree);
    fenetreRecente = fenetreRecente.slice(-configuration.tailleFenetre);
  };

  for (const semaine of semainesTriees) {
    const weekStart = lireDateSemaine(semaine);
    const distance = derniereDate ? ecartEnSemaines(derniereDate, weekStart) : 1;

    if (derniereDate && distance > 1) {
      for (let manque = 1; manque < distance; manque += 1) {
        const dateManquante = ajouterSemaines(derniereDate, manque);
        if (!dateManquante) continue;
        ajouterDansFenetre({ weekStart: dateManquante, manquante: true, comptePourProgression: false });
        historique.push({
          weekStart: dateManquante,
          palierApplique: PALIERS_EXTRAS[indexPalier].palier,
          manquante: true,
          comptePourProgression: false,
          serieDepassement: 0,
        });
      }
      serieDepassement = 0;
    }

    const configuration = PALIERS_EXTRAS[indexPalier];
    const evaluation = evaluerSemaineExtras(semaine, configuration.palier);
    const consecutive = derniereDate !== null && distance === 1;
    serieDepassement = evaluation.frequenceDepassee
      ? (consecutive ? serieDepassement + 1 : 1)
      : 0;

    const entree = {
      weekStart,
      palierApplique: configuration.palier,
      ...evaluation,
      serieDepassement,
    };
    ajouterDansFenetre({ ...preuveSemaine(semaine), ...evaluation });
    historique.push(entree);

    if (indexPalier > 0 && serieDepassement >= SEMAINES_DEPASSEMENT_POUR_ADAPTATION) {
      const palierAdapte = PALIERS_EXTRAS[indexPalier - 1].palier;
      const adaptation = {
        type: 'adapted_up',
        palierDepart: configuration.palier,
        palierAdapte,
        semainesConsecutives: SEMAINES_DEPASSEMENT_POUR_ADAPTATION,
        semaineDecisive: weekStart,
      };
      adaptations.push(adaptation);
      entree.adaptation = adaptation;
      indexPalier -= 1;
      serieDepassement = 0;
      fenetreRecente = [];
      derniereDate = weekStart;
      continue;
    }

    const semainesRespectees = fenetreRecente.filter(item => item.comptePourProgression);
    if (configuration.prochainPalier !== null && semainesRespectees.length >= configuration.semainesRequises) {
      const retrouve = paliersDejaAtteints.has(configuration.prochainPalier);
      const transition = {
        type: retrouve ? 'reached_again' : 'first_reached',
        code: `extras-palier-${configuration.prochainPalier}`,
        nom: 'Nouveau rythme',
        palierDepart: configuration.palier,
        palierAtteint: configuration.prochainPalier,
        semainesRequises: configuration.semainesRequises,
        tailleFenetre: configuration.tailleFenetre,
        semaineDecisive: weekStart,
        semaines: semainesRespectees.map(item => ({
          weekStart: item.weekStart,
          extrasCount: item.extrasCount,
          kcalExtras: item.kcalExtras,
          budgetExtras: item.budgetExtras,
        })),
      };
      transitions.push(transition);
      paliersDejaAtteints.add(configuration.prochainPalier);
      entree.transition = transition;
      indexPalier += 1;
      serieDepassement = 0;
      fenetreRecente = [];
    }

    derniereDate = weekStart;
  }

  const configuration = PALIERS_EXTRAS[indexPalier] || PALIERS_EXTRAS[PALIERS_EXTRAS.length - 1];
  const semainesRespectees = fenetreRecente.filter(item => item.comptePourProgression);
  const derniereAdaptation = adaptations[adaptations.length - 1] || null;
  const derniereTransition = transitions[transitions.length - 1] || null;
  const derniereSemaine = historique[historique.length - 1]?.weekStart || null;

  return {
    palier: configuration.palier,
    prochainPalier: configuration.prochainPalier,
    semainesRequises: configuration.semainesRequises,
    tailleFenetre: configuration.tailleFenetre,
    semainesAcquises: semainesRespectees.length,
    semainesObservees: fenetreRecente.length,
    semainesRestantes: configuration.prochainPalier === null
      ? 0
      : Math.max(0, configuration.semainesRequises - semainesRespectees.length),
    semainesRecentes: fenetreRecente,
    serieDepassement,
    historique,
    transitions,
    adaptations,
    derniereTransition,
    derniereAdaptation,
    adaptationRecente: derniereAdaptation?.semaineDecisive === derniereSemaine,
    rythmeRetrouve: derniereTransition?.type === 'reached_again'
      && derniereTransition?.semaineDecisive === derniereSemaine,
  };
}


export function getEtatConstanceExtras(progression) {
  if (progression?.adaptationRecente) {
    return {
      code: 'ADAPT',
      label: 'Mon rythme s’adapte',
      message: 'Le repère évolue pour rester proche de ce que tu vis aujourd’hui.',
    };
  }
  if (progression?.rythmeRetrouve) {
    return {
      code: 'GROW',
      label: 'Je retrouve mon rythme',
      message: 'Tu reviens vers un rythme que tu avais déjà réussi à créer.',
    };
  }
  if (
    progression?.prochainPalier === null
    || Number(progression?.semainesAcquises || 0) >= Math.min(4, Number(progression?.semainesRequises || 0))
  ) {
    return {
      code: 'ALIGN',
      label: 'Je maintiens ce rythme',
      message: 'Tes choix récents consolident le rythme que tu construis.',
    };
  }
  return {
    code: 'CREATE',
    label: 'Je crée ce rythme',
    message: 'Chaque semaine récente dans cette direction construit progressivement ton rythme.',
  };
}

export function getVerbatimProgressionExtras(progression) {
  if (progression?.adaptationRecente) {
    return `Ces dernières semaines ont été plus chargées. Ton palier s’adapte à ${progression.palier} moments pour rester proche de ce que tu vis aujourd’hui.`;
  }
  if (progression?.rythmeRetrouve) {
    return 'Tu retrouves le rythme que tu avais créé. Cette étape montre ta capacité à revenir dans ta direction.';
  }
  if (!progression || progression.prochainPalier === null) return 'Tes choix suivent le rythme que tu as créé.';
  const nombre = progression.semainesRestantes;
  return `Sur les ${progression.tailleFenetre} dernières semaines, encore ${nombre} semaine${nombre > 1 ? 's' : ''} dans cette direction pour évoluer vers le palier ${progression.prochainPalier}.`;
}

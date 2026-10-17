import { calculerProgressionExtras, getEtatConstanceExtras, getVerbatimProgressionExtras } from './extrasProgression';
import { regrouperRepasReelsParOccurrence, calculerScoreAlignementParOccurrence } from './alignementRepas';
import { calculerCouvertureSemaine } from './trouSuivi';
import { compterMomentsExtras } from './validationSemaine';

export function compterExtrasObserves(repas = []) {
  return repas.length ? compterMomentsExtras(repas) : null;
}

const nombreFini = valeur => {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
};

const dateValide = valeur => {
  if (!valeur) return null;
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function evaluerDisponibiliteDonnees({ poids = [], semainesExtras = [] } = {}) {
  const poidsValides = (poids || []).filter(item => dateValide(item?.date) && nombreFini(item?.poids) !== null);
  const semainesValides = (semainesExtras || []).filter(item => item?.weekStart || item?.semaine_debut);
  return {
    poids: {
      disponible: poidsValides.length > 0,
      suffisantPourTendance: poidsValides.length >= 2,
      nombreObservations: poidsValides.length,
    },
    extras: {
      disponible: semainesValides.length > 0,
      nombreSemaines: semainesValides.length,
    },
  };
}


const normaliserSignal = valeur => String(valeur ?? '')
  .trim()
  .toLocaleLowerCase('fr')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const estOui = valeur => valeur === true || ['oui', 'true', '1'].includes(normaliserSignal(valeur));
const estNon = valeur => valeur === false || ['non', 'false', '0'].includes(normaliserSignal(valeur));

// Un signal contradictoire dans une occurrence reste inconnu, pas un vote par aliment.
function signalUnique(lignes, champ, decoder) {
  const valeurs = [...new Set(lignes.map(l => decoder(l?.[champ])).filter(v => v !== null))];
  return valeurs.length === 1 ? valeurs[0] : null;
}
const decoderFaim = valeur => {
  const signal = normaliserSignal(valeur).replace(/[’]/g, "'");
  if (["j'avais faim", 'faim'].includes(signal)) return true;
  if (["je n'avais pas faim", "je n'ai pas faim", 'pas de faim', 'sans faim', 'envie'].includes(signal)) return false;
  return null;
};
const decoderSatiete = valeur => estOui(valeur) ? true : estNon(valeur) ? false : null;

export function construireMealSignals(repas = []) {
  const occurrences = regrouperRepasReelsParOccurrence(repas);
  const faim = occurrences.map(({ lignes }) => signalUnique(lignes, 'raison_manger', decoderFaim));
  const satiete = occurrences.map(({ lignes }) => signalUnique(lignes, 'satiete', decoderSatiete));
  const faimConnue = faim.filter(v => v !== null);
  const satieteConnue = satiete.filter(v => v !== null);
  const pourcentage = valeurs => valeurs.length ? Math.round(valeurs.filter(Boolean).length / valeurs.length * 100) : null;
  // Sans plan chargé, seule une confirmation existante constitue une preuve d'alignement.
  const confirmes = occurrences.filter(({ lignes }) => lignes.some(l => typeof l.repas_planifie_respecte === 'boolean'));
  const alignement = calculerScoreAlignementParOccurrence(confirmes.flatMap(o => o.lignes));
  return {
    disponible: occurrences.length > 0,
    nombreRepas: occurrences.length,
    message: occurrences.length ? null : 'Aucun repas renseigné sur cette période.',
    faim: { renseignee: faimConnue.length, avecFaim: faimConnue.filter(Boolean).length, pourcentageAvecFaim: pourcentage(faimConnue) },
    satiete: { renseignee: satieteConnue.length, respectee: satieteConnue.filter(Boolean).length, pourcentageRespectee: pourcentage(satieteConnue),
      sansFaim: occurrences.filter(({ lignes }) => lignes.some(l => normaliserSignal(l.satiete) === 'pas de faim')).length },
    alignementPlan: { renseigne: alignement.occurrences, respecte: alignement.alignees, pourcentage: alignement.occurrences ? alignement.score : null },
    ressentis: { renseignes: occurrences.filter(({ lignes }) => lignes.some(l => String(l.ressenti ?? '').trim())).length },
  };
}

export function construireWellbeingStatus(checkins = []) {
  const lignes = (Array.isArray(checkins) ? checkins : [])
    .filter(item => item?.humeur !== null && item?.humeur !== undefined && String(item.humeur).trim());

  if (!lignes.length) {
    return { disponible: false, message: 'Pas encore assez de données de bien-être.' };
  }

  const repartition = lignes.reduce((acc, item) => {
    const humeur = String(item.humeur).trim();
    acc[humeur] = (acc[humeur] || 0) + 1;
    return acc;
  }, {});
  const dominante = Object.entries(repartition).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    disponible: true,
    nombreCheckins: lignes.length,
    humeurDominante: dominante,
    repartition,
  };
}

export function construireWeightStatus(poids = [], objectifPoids = null, poidsDepartParcours = null) {
  const observations = (Array.isArray(poids) ? poids : [])
    .map(item => ({ date: dateValide(item?.date), poids: nombreFini(item?.poids) }))
    .filter(item => item.date && item.poids !== null)
    .sort((a, b) => a.date - b.date);

  if (!observations.length) {
    return { disponible: false, suffisantPourTendance: false, objectif: nombreFini(objectifPoids), departParcours: nombreFini(poidsDepartParcours), message: 'Pas encore de donnée de poids.' };
  }

  const depart = observations[0];
  const actuel = observations[observations.length - 1];
  const objectif = nombreFini(objectifPoids);
  const variationDepuisDepart = observations.length >= 2
    ? Number((actuel.poids - depart.poids).toFixed(1))
    : null;

  let direction = 'insuffisant';
  if (variationDepuisDepart !== null) {
    if (Math.abs(variationDepuisDepart) < 0.1) direction = 'stable';
    else direction = variationDepuisDepart < 0 ? 'baisse' : 'hausse';
  }

  return {
    disponible: true,
    suffisantPourTendance: observations.length >= 2,
    nombreObservations: observations.length,
    departParcours: nombreFini(poidsDepartParcours),
    debutPeriode: { date: depart.date.toISOString().slice(0, 10), poids: depart.poids },
    depart: { date: depart.date.toISOString().slice(0, 10), poids: depart.poids },
    actuel: { date: actuel.date.toISOString().slice(0, 10), poids: actuel.poids },
    objectif,
    variationDepuisDepart,
    direction,
    ecartObjectif: objectif === null ? null : Number((actuel.poids - objectif).toFixed(1)),
  };
}

export function construireExtrasStatus(semaines = []) {
  if (!Array.isArray(semaines) || semaines.length === 0) {
    return {
      disponible: false,
      message: 'Pas encore assez de données pour situer ton rythme Extras.',
    };
  }

  const progression = calculerProgressionExtras(semaines);
  const etat = getEtatConstanceExtras(progression);

  return {
    disponible: true,
    palier: progression.palier,
    prochainPalier: progression.prochainPalier,
    semainesAcquises: progression.semainesAcquises,
    semainesRequises: progression.semainesRequises,
    semainesRestantes: progression.semainesRestantes,
    tailleFenetre: progression.tailleFenetre,
    adaptationRecente: progression.adaptationRecente,
    rythmeRetrouve: progression.rythmeRetrouve,
    etat,
    message: getVerbatimProgressionExtras(progression),
  };
}

export function construireActiveChallenge(defis = []) {
  const actifs = (Array.isArray(defis) ? defis : []).filter(defi => defi?.status === 'en cours');
  if (!actifs.length) return null;
  const defi = actifs[0];
  // Le moteur Défis V2 n'est pas intégré. Aucun ratio progress/duree :
  // il ne représente pas indistinctement les modèles durée et occurrences.
  return {
    id: defi.id ?? null,
    nom: defi.nom || 'Défi en cours',
    description: defi.description || null,
    progressionPourcentage: null,
    progressionLibelle: null,
    startedAt: defi.started_at || null,
    modeleProgression: defi.progression_model || defi.modele_progression || null,
    dependanceProgression: true,
    anomaliePlusieursActifs: actifs.length > 1,
  };
}

export function construireActiveIdeal(ideaux = []) {
  const liste = Array.isArray(ideaux) ? ideaux : [];
  if (!liste.length) return null;
  const actifs = liste.filter(ideal => ideal?.statut === 'en cours');
  const ideal = actifs[0];
  if (!ideal) return null;
  const progression = ideal?.progression_palier || null;
  return {
    id: ideal?.id ?? null,
    titre: ideal?.titre || 'Mon idéal',
    indicateur: ideal?.indicateur_principal || null,
    dateCible: ideal?.date_cible || null,
    progressionPalier: progression,
    cyclePalier: ideal?.cycle_palier || null,
    bilanPalier: ideal?.bilan_palier || null,
  };
}


// Lecture factuelle validée : aucun score de priorité, seuil de 70 % ou
// variation minimale transformant une observation en réussite.
export function construireLectureParcours({ weightStatus, extrasStatus } = {}) {
  const highlights = [];
  const pointsObservation = [];
  if (weightStatus?.suffisantPourTendance && Number.isFinite(weightStatus.variationDepuisDepart)) {
    const variation = weightStatus.variationDepuisDepart;
    highlights.push({ code: 'poids-evolution', domaine: 'poids', titre: 'Variation observée',
      message: `${variation > 0 ? '+' : ''}${variation} kg entre la première et la dernière mesure de la période.` });
  }
  if (extrasStatus?.disponible && extrasStatus?.rythmeRetrouve) {
    highlights.push({ code: 'extras-rythme-retrouve', domaine: 'extras', titre: 'Repère Extras', message: extrasStatus.message });
  }
  if (extrasStatus?.disponible && extrasStatus?.adaptationRecente) {
    pointsObservation.push({ code: 'extras-adaptation', domaine: 'extras', titre: 'Ton rythme s’adapte', message: extrasStatus.message });
  }
  return { highlights, pointsAppui: [], pointsObservation };
}

export function construireSyntheseTableauDeBord({
  poids = [],
  objectifPoids = null,
  poidsDepartParcours = null,
  periodes = [],
  dateDebut = null,
  dateFin = null,
  semainesExtras = [],
  defis = [],
  ideaux = [],
  repas = [],
  humeurCheckins = [],
} = {}) {
  const dataAvailability = evaluerDisponibiliteDonnees({ poids, semainesExtras });
  const weightStatus = construireWeightStatus(poids, objectifPoids, poidsDepartParcours);
  const extrasStatus = construireExtrasStatus(semainesExtras);
  const mealSignals = construireMealSignals(repas);
  const wellbeingStatus = construireWellbeingStatus(humeurCheckins);
  const activeChallenge = construireActiveChallenge(defis);
  const activeIdeal = construireActiveIdeal(ideaux);
  const lecture = construireLectureParcours({
    weightStatus, extrasStatus, mealSignals, wellbeingStatus, activeChallenge, activeIdeal,
  });

  return {
    dataAvailability,
    couverture: dateDebut && dateFin ? calculerCouvertureSemaine({ repas, periodes, dateDebut, dateFin }) : null,
    weightStatus,
    extrasStatus,
    mealSignals,
    wellbeingStatus,
    activeChallenge,
    activeIdeal,
    activeJourneyPhase: null,
    ...lecture,
  };
}

import { calculerProgressionExtras, getEtatConstanceExtras, getVerbatimProgressionExtras } from './extrasProgression';

const nombreFini = valeur => {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
};

const dateValide = valeur => {
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

export function construireWeightStatus(poids = [], objectifPoids = null) {
  const observations = (Array.isArray(poids) ? poids : [])
    .map(item => ({ date: dateValide(item?.date), poids: nombreFini(item?.poids) }))
    .filter(item => item.date && item.poids !== null)
    .sort((a, b) => a.date - b.date);

  if (!observations.length) {
    return { disponible: false, suffisantPourTendance: false, message: 'Pas encore de donnée de poids.' };
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
  const progress = nombreFini(defi?.progress) ?? 0;
  const max = nombreFini(defi?.duree) ?? 1;
  return {
    id: defi.id ?? null,
    nom: defi.nom || 'Défi en cours',
    description: defi.description || null,
    progress,
    max,
    progressionPourcentage: max > 0 ? Math.min(100, Math.round((progress / max) * 100)) : null,
    startedAt: defi.started_at || null,
    modeleProgression: defi.progression_model || defi.modele_progression || null,
    anomaliePlusieursActifs: actifs.length > 1,
  };
}

export function construireActiveIdeal(ideaux = []) {
  const liste = Array.isArray(ideaux) ? ideaux : [];
  if (!liste.length) return null;
  const actifs = liste.filter(ideal => !['termine', 'terminé', 'archive', 'archivé'].includes(String(ideal?.statut || '').toLowerCase()));
  const ideal = actifs[0] || liste[0];
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

export function construireSyntheseTableauDeBord({
  poids = [],
  objectifPoids = null,
  semainesExtras = [],
  defis = [],
  ideaux = [],
} = {}) {
  return {
    dataAvailability: evaluerDisponibiliteDonnees({ poids, semainesExtras }),
    weightStatus: construireWeightStatus(poids, objectifPoids),
    extrasStatus: construireExtrasStatus(semainesExtras),
    // Contrats réservés : ils seront raccordés aux moteurs canoniques des chantiers concernés.
    mealSignals: null,
    wellbeingStatus: null,
    activeChallenge: construireActiveChallenge(defis),
    activeIdeal: construireActiveIdeal(ideaux),
    activeJourneyPhase: null,
    highlights: [],
    pointsAppui: [],
    pointsObservation: [],
  };
}

import { extraireSemainesPalier } from './ideauxPalier';

const JOUR_MS = 24 * 60 * 60 * 1000;

function dateISO(date) {
  const valeur = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(valeur.getTime())) return null;
  return valeur.toISOString().slice(0, 10);
}

function bornerEntier(valeur, min, max, fallback) {
  const nombre = Number.parseInt(valeur, 10);
  if (!Number.isFinite(nombre)) return fallback;
  return Math.min(max, Math.max(min, nombre));
}

export function getNumeroPalierCourant(ideal) {
  return bornerEntier(ideal?.palier_numero, 1, 999, 1);
}

export function getFinPalier(ideal) {
  const semaines = extraireSemainesPalier(ideal?.plan_data, ideal);
  const dates = semaines.flatMap((semaine) =>
    (semaine?.actions || []).map((action) => action?.date).filter(Boolean)
  );
  if (dates.length) return dates.sort().at(-1);

  const debut = ideal?.plan_params_valides?.dateDebut || ideal?.date_debut;
  if (!debut) return null;
  const dateFin = new Date(`${dateISO(debut)}T12:00:00Z`);
  const duree = Number(ideal?.plan_params_valides?.palierDuree) || 4;
  dateFin.setUTCDate(dateFin.getUTCDate() + duree * 7 - 1);
  return dateISO(dateFin);
}

export function evaluerEtatCycle(ideal, aujourdHui = new Date()) {
  const aujourdHuiISO = dateISO(aujourdHui);
  const finPalier = getFinPalier(ideal);
  const cible = dateISO(ideal?.date_cible);
  const estEchu = Boolean(ideal?.plan_valide && finPalier && aujourdHuiISO > finPalier);
  const joursDepuisFin = estEchu
    ? Math.max(0, Math.floor((new Date(`${aujourdHuiISO}T12:00:00Z`) - new Date(`${finPalier}T12:00:00Z`)) / JOUR_MS))
    : 0;

  return {
    numero: getNumeroPalierCourant(ideal),
    finPalier,
    estEchu,
    joursDepuisFin,
    longueInterruption: estEchu && joursDepuisFin >= 28,
    cibleDepassee: Boolean(cible && aujourdHuiISO > cible),
    repriseNecessaire: estEchu && ideal?.statut !== 'atteint' && ideal?.statut !== 'en pause',
  };
}

function appliquerProgressionObservee(proposition, ideal) {
  const progression = ideal?.proposition_progression;
  if (!progression || progression.type !== 'progresser') return {
    ...proposition,
    progressionObservee: progression || null,
  };

  const suivante = Number(progression.nouvelleCible);
  if (!Number.isFinite(suivante)) return proposition;

  if (progression.dimension === 'duree') {
    return { ...proposition, duree: suivante, progressionObservee: progression };
  }
  if (progression.dimension === 'frequence') {
    return { ...proposition, frequence: bornerEntier(suivante, 1, 7, proposition.frequence), progressionObservee: progression };
  }
  if (progression.dimension === 'vitesse') {
    return { ...proposition, intensite: `${String(suivante).replace('.', ',')} km/h`, progressionObservee: progression };
  }

  return { ...proposition, progressionObservee: progression };
}

export function construirePropositionReprise(ideal, questionnaire, aujourdHui = new Date()) {
  if (questionnaire?.objectifToujoursSouhaite !== 'oui') return null;

  const cycle = evaluerEtatCycle(ideal, aujourdHui);
  const anciensParams = ideal?.plan_params_valides || {};
  const dateDebut = dateISO(aujourdHui);
  const dateCible = cycle.cibleDepassee
    ? dateISO(questionnaire?.nouvelleDateCible)
    : dateISO(ideal?.date_cible);

  if (!dateCible || dateCible <= dateDebut) {
    throw new Error('Une nouvelle date cible postérieure à la reprise est nécessaire.');
  }

  const ancienneDuree = bornerEntier(anciensParams.duree, 5, 180, 15);
  const niveau = questionnaire?.niveauActuel || 'semblable';
  const duree = niveau === 'plus_bas'
    ? Math.max(10, ancienneDuree - 5)
    : niveau === 'plus_haut'
      ? Math.min(180, ancienneDuree + 5)
      : ancienneDuree;
  const frequence = bornerEntier(questionnaire?.rythmeRealiste, 1, 7, anciensParams.frequence || 3);
  const joursExistants = Array.isArray(anciensParams.joursProposes) && anciensParams.joursProposes.length
    ? anciensParams.joursProposes
    : ['lundi', 'mercredi', 'samedi'];
  const joursDisponibles = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const joursProposes = [...new Set([...joursExistants, ...joursDisponibles])].slice(0, frequence);

  const proposition = {
    numero: cycle.numero + 1,
    titre: ideal?.titre,
    indicateur: ideal?.indicateur_principal,
    dateCible,
    dateDebut,
    frequence,
    duree,
    intensite: anciensParams.intensite || ideal?.plan_data?.objectif?.intensite || '',
    joursProposes,
    palierDuree: bornerEntier(anciensParams.palierDuree, 2, 12, 4),
    raisonAdaptation: niveau === 'plus_bas'
      ? 'reprendre avec une durée légèrement réduite'
      : niveau === 'plus_haut'
        ? 'faire progresser une seule dimension avec prudence'
        : 'reprendre sur une base connue et réaliste',
  };

  // La réalité observée préremplit la proposition, mais ne crée ni ne valide
  // aucune séance : l'utilisateur garde la décision finale.
  return niveau === 'plus_bas'
    ? { ...proposition, progressionObservee: ideal?.proposition_progression || null }
    : appliquerProgressionObservee(proposition, ideal);
}

export function creerArchivePalier(ideal, questionnaire, dateCloture = new Date()) {
  const cycle = evaluerEtatCycle(ideal, dateCloture);
  return {
    numero: cycle.numero,
    statut: ideal?.bilan_palier?.engagementTermine ? 'realise' : 'termine_partiellement',
    date_debut: dateISO(ideal?.plan_params_valides?.dateDebut || ideal?.date_debut),
    date_fin: cycle.finPalier,
    date_cloture: dateISO(dateCloture),
    parametres: ideal?.plan_params_valides || null,
    plan_data: ideal?.plan_data || null,
    bilan: ideal?.bilan_palier || null,
    reprise: questionnaire || null,
  };
}

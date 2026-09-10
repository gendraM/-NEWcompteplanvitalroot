import { regrouperRepasReelsParOccurrence } from './alignementRepas';

export const CONFIG_POINT_AJUSTEMENT_ALIMENTAIRE = Object.freeze({
  historiqueJours: 15,
  occurrencesCourantesMinimum: 3,
  occurrencesComparablesMinimum: 3,
  repetitionsSignalMinimum: 2,
  joursDisponibles: Object.freeze([4, 5, 6])
});

export const STATUTS_POINT_AJUSTEMENT_ALIMENTAIRE = Object.freeze({
  PRET: 'PRET',
  NO_INTERVENTION: 'NO_INTERVENTION'
});

export const ACTIONS_POINT_AJUSTEMENT_AUTORISEES = Object.freeze({
  AUCUNE_ACTION: 'aucune_action',
  CONSERVER_PLAN: 'conserver_plan',
  AJUSTER_REPAS_PLANIFIE: 'ajuster_repas_planifie',
  UTILISER_VALEUR_SURE: 'utiliser_valeur_sure'
});

const RESSENTIS_FAVORABLES = new Set(['leger', 'satisfait', 'j assume']);
const RESSENTIS_DIFFICILES = new Set(['lourd', 'ballonne', 'je regrette', 'je culpabilise']);

function normaliserTexte(valeur = '') {
  return String(valeur)
    .trim()
    .toLocaleLowerCase('fr')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normaliserDate(date) {
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (!correspondance) return null;
  const [, annee, mois, jour] = correspondance;
  const instant = Date.UTC(Number(annee), Number(mois) - 1, Number(jour));
  const verification = new Date(instant).toISOString().slice(0, 10);
  return verification === `${annee}-${mois}-${jour}` ? verification : null;
}

function ajouterJours(date, nombreJours) {
  const [annee, mois, jour] = date.split('-').map(Number);
  return new Date(Date.UTC(annee, mois - 1, jour + nombreJours)).toISOString().slice(0, 10);
}

function obtenirJourSemaine(date) {
  const [annee, mois, jour] = date.split('-').map(Number);
  return new Date(Date.UTC(annee, mois - 1, jour)).getUTCDay();
}

function obtenirLundi(date) {
  const decalage = (obtenirJourSemaine(date) + 6) % 7;
  return ajouterJours(date, -decalage);
}

export function obtenirFenetrePointAjustementAlimentaire(dateReference) {
  const date = normaliserDate(dateReference);
  if (!date) return null;

  const lundi = obtenirLundi(date);
  const mercredi = ajouterJours(lundi, 2);
  const jeudi = ajouterJours(lundi, 3);
  const samedi = ajouterJours(lundi, 5);
  const historiqueJours = CONFIG_POINT_AJUSTEMENT_ALIMENTAIRE.historiqueJours;

  return {
    dateReference: date,
    observation: { debut: lundi, fin: mercredi },
    historique: { debut: ajouterJours(mercredi, -(historiqueJours - 1)), fin: mercredi },
    affichage: { debut: jeudi, fin: samedi },
    disponible: CONFIG_POINT_AJUSTEMENT_ALIMENTAIRE.joursDisponibles.includes(obtenirJourSemaine(date))
  };
}

export function estActionPointAjustementAutorisee(action) {
  return Object.values(ACTIONS_POINT_AJUSTEMENT_AUTORISEES).includes(action);
}

function estVrai(valeur) {
  return valeur === true || ['oui', 'true', '1'].includes(normaliserTexte(valeur));
}

function estFaux(valeur) {
  return valeur === false || ['non', 'false', '0'].includes(normaliserTexte(valeur));
}

function valeursUniques(lignes, champ) {
  const valeurs = [];
  const dejaVues = new Set();

  lignes.forEach(ligne => {
    const valeur = ligne?.[champ];
    if (valeur === null || valeur === undefined || String(valeur).trim() === '') return;
    const cle = normaliserTexte(valeur);
    if (!cle || dejaVues.has(cle)) return;
    dejaVues.add(cle);
    valeurs.push(String(valeur).trim());
  });

  return valeurs;
}

function estNoteAutomatique(note) {
  return /^\s*repas\s+compos[eé]\s*:/i.test(String(note || ''));
}

function extraireNotesUtilisateur(lignes) {
  return valeursUniques(lignes, 'note').filter(note => !estNoteAutomatique(note));
}

function convertirListe(valeur) {
  if (Array.isArray(valeur)) return valeur;
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return [];

  if (typeof valeur === 'string') {
    try {
      const resultat = JSON.parse(valeur);
      if (Array.isArray(resultat)) return resultat;
    } catch (_) {
      // Une ancienne valeur texte reste une information exploitable telle quelle.
    }
  }

  return [valeur];
}

function extraireDetailsSignaux(lignes) {
  const details = lignes.flatMap(ligne => convertirListe(ligne?.details_signaux));
  const dejaVus = new Set();
  return details.reduce((resultat, detail) => {
    const texte = String(detail ?? '').trim();
    const cle = normaliserTexte(texte);
    if (!cle || dejaVus.has(cle)) return resultat;
    dejaVus.add(cle);
    resultat.push(texte);
    return resultat;
  }, []);
}

function extraireSignaux(lignes) {
  const satietes = lignes.flatMap(ligne => [ligne?.satiete, ligne?.['satiété_respectée']]);
  const ressentis = valeursUniques(lignes, 'ressenti').map(normaliserTexte);
  const positifs = new Set();
  const vigilances = new Set();

  if (satietes.some(valeur => estVrai(valeur))) positifs.add('satiete_respectee');
  if (satietes.some(valeur => normaliserTexte(valeur) === 'non')) vigilances.add('satiete_non_respectee');
  if (satietes.some(valeur => normaliserTexte(valeur) === 'pas de faim')) vigilances.add('repas_sans_faim');
  if (ressentis.some(ressenti => RESSENTIS_FAVORABLES.has(ressenti))) positifs.add('ressenti_favorable');
  ressentis.filter(ressenti => RESSENTIS_DIFFICILES.has(ressenti))
    .forEach(ressenti => vigilances.add(`ressenti:${ressenti}`));
  if (lignes.some(ligne => ligne?.repas_planifie_respecte === true)) positifs.add('alignement_plan');
  if (lignes.some(ligne => ligne?.est_extra === true || ligne?.isFastFood === true || Boolean(ligne?.fastFoodType))) {
    vigilances.add('extra');
  }
  if (lignes.some(ligne => estFaux(ligne?.regle_respectee))) vigilances.add('portion_non_respectee');

  return { positifs: [...positifs], vigilances: [...vigilances] };
}

function copierComposition(lignes) {
  return lignes.map(ligne => ({
    aliment: ligne?.aliment ?? null,
    categorie: ligne?.categorie ?? null,
    quantite: ligne?.quantite ?? null,
    kcal: ligne?.kcal ?? null,
    qn: ligne?.qn ?? null
  }));
}

function calculerKcalTotal(lignes) {
  const calories = lignes.map(ligne => {
    if (ligne?.kcal === null || ligne?.kcal === undefined || String(ligne.kcal).trim() === '') return null;
    const valeur = Number(ligne.kcal);
    return Number.isFinite(valeur) ? valeur : null;
  });
  return calories.length > 0 && calories.every(Number.isFinite)
    ? Math.round(calories.reduce((total, valeur) => total + valeur, 0))
    : null;
}

function reconstruireOccurrence(groupe) {
  const dates = groupe.lignes.map(ligne => normaliserDate(ligne?.date)).filter(Boolean);
  if (dates.length !== groupe.lignes.length || new Set(dates).size !== 1) return null;

  const types = valeursUniques(groupe.lignes, 'type');
  const aliments = valeursUniques(groupe.lignes, 'aliment');
  const signaux = extraireSignaux(groupe.lignes);

  return {
    occurrenceId: String(groupe.cle),
    date: dates[0],
    type: types[0] || 'Repas',
    cleType: normaliserTexte(types[0] || 'repas'),
    aliments,
    composition: copierComposition(groupe.lignes),
    kcalTotal: calculerKcalTotal(groupe.lignes),
    heures: valeursUniques(groupe.lignes, 'heure'),
    contextesUtilisateur: valeursUniques(groupe.lignes, 'pourquoi'),
    notesUtilisateur: extraireNotesUtilisateur(groupe.lignes),
    detailsSignaux: extraireDetailsSignaux(groupe.lignes),
    signauxPositifs: signaux.positifs,
    signauxVigilance: signaux.vigilances
  };
}

function regrouperParType(occurrences) {
  const groupes = new Map();
  occurrences.forEach(occurrence => {
    if (!groupes.has(occurrence.cleType)) groupes.set(occurrence.cleType, []);
    groupes.get(occurrence.cleType).push(occurrence);
  });
  return groupes;
}

function compterSignaux(occurrences, champ) {
  const parSignal = new Map();
  occurrences.forEach(occurrence => {
    occurrence[champ].forEach(signal => {
      if (!parSignal.has(signal)) parSignal.set(signal, []);
      parSignal.get(signal).push(occurrence);
    });
  });
  return parSignal;
}

function construireElementsPositifs(occurrences) {
  return Array.from(regrouperParType(occurrences).values()).flatMap(comparables =>
    Array.from(compterSignaux(comparables, 'signauxPositifs').entries())
      .filter(([, avecSignal]) => avecSignal.length >= CONFIG_POINT_AJUSTEMENT_ALIMENTAIRE.repetitionsSignalMinimum)
      .map(([signal, avecSignal]) => ({
        type: comparables[0].type,
        signal,
        occurrencesComparables: comparables.length,
        occurrencesAvecSignal: avecSignal.length,
        occurrenceIds: avecSignal.map(occurrence => occurrence.occurrenceId),
        dates: avecSignal.map(occurrence => occurrence.date)
      }))
  );
}

function construireVigilances(occurrences) {
  return Array.from(regrouperParType(occurrences).values()).flatMap(comparables => {
    if (comparables.length < CONFIG_POINT_AJUSTEMENT_ALIMENTAIRE.occurrencesComparablesMinimum) return [];

    return Array.from(compterSignaux(comparables, 'signauxVigilance').entries())
      .filter(([, avecSignal]) => avecSignal.length >= CONFIG_POINT_AJUSTEMENT_ALIMENTAIRE.repetitionsSignalMinimum)
      .map(([signal, avecSignal]) => ({
        type: comparables[0].type,
        signal,
        occurrencesComparables: comparables.length,
        occurrencesAvecSignal: avecSignal.length,
        occurrenceIds: avecSignal.map(occurrence => occurrence.occurrenceId),
        dates: avecSignal.map(occurrence => occurrence.date),
        formulation: 'association_repetee_non_causale'
      }));
  });
}

function construireResultatSansIntervention(fenetre, raison) {
  return {
    statut: STATUTS_POINT_AJUSTEMENT_ALIMENTAIRE.NO_INTERVENTION,
    raison,
    fenetre,
    actionsAutorisees: Object.values(ACTIONS_POINT_AJUSTEMENT_AUTORISEES),
    occurrencesObservees: [],
    elementsPositifs: [],
    vigilances: []
  };
}

export function analyserPointAjustementAlimentaire(repasReels = [], options = {}) {
  const fenetre = obtenirFenetrePointAjustementAlimentaire(options.dateReference);
  if (!fenetre) return construireResultatSansIntervention(null, 'date_invalide');
  if (!fenetre.disponible) return construireResultatSansIntervention(fenetre, 'hors_periode');

  const occurrencesHistorique = regrouperRepasReelsParOccurrence(repasReels)
    .map(reconstruireOccurrence)
    .filter(Boolean)
    .filter(occurrence =>
      occurrence.date >= fenetre.historique.debut
      && occurrence.date <= fenetre.historique.fin
    );
  const occurrencesObservees = occurrencesHistorique.filter(occurrence =>
    occurrence.date >= fenetre.observation.debut
    && occurrence.date <= fenetre.observation.fin
  );
  const donneesExploitables = occurrencesObservees.some(occurrence =>
    occurrence.notesUtilisateur.length > 0
    || occurrence.detailsSignaux.length > 0
    || occurrence.signauxPositifs.length > 0
    || occurrence.signauxVigilance.length > 0
  );

  if (
    occurrencesObservees.length < CONFIG_POINT_AJUSTEMENT_ALIMENTAIRE.occurrencesCourantesMinimum
    || !donneesExploitables
  ) {
    return {
      ...construireResultatSansIntervention(fenetre, 'donnees_insuffisantes'),
      occurrencesObservees
    };
  }

  return {
    statut: STATUTS_POINT_AJUSTEMENT_ALIMENTAIRE.PRET,
    raison: null,
    fenetre,
    actionsAutorisees: Object.values(ACTIONS_POINT_AJUSTEMENT_AUTORISEES),
    occurrencesObservees,
    elementsPositifs: construireElementsPositifs(occurrencesObservees),
    vigilances: construireVigilances(occurrencesHistorique)
  };
}

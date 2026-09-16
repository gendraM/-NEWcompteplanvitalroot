const JOUR_MS = 24 * 60 * 60 * 1000;

export function parseDateLocale(dateIso) {
  if (typeof dateIso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return null;
  const [annee, mois, jour] = dateIso.split('-').map(Number);
  const date = new Date(annee, mois - 1, jour);
  date.setHours(0, 0, 0, 0);
  if (
    date.getFullYear() !== annee
    || date.getMonth() !== mois - 1
    || date.getDate() !== jour
  ) return null;
  return date;
}

export function formatDateLocale(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

export function enumererDates(dateDebut, dateFin) {
  const debut = parseDateLocale(dateDebut);
  const fin = parseDateLocale(dateFin);
  if (!debut || !fin || fin < debut) return [];
  const dates = [];
  const curseur = new Date(debut);
  while (curseur <= fin) {
    dates.push(formatDateLocale(curseur));
    curseur.setDate(curseur.getDate() + 1);
  }
  return dates;
}

export function normaliserPeriodeReconstituee(ligne) {
  if (!ligne) return null;
  return {
    id: ligne.id || null,
    dateDebut: ligne.dateDebut || ligne.date_debut,
    dateFin: ligne.dateFin || ligne.date_fin,
    statut: ligne.statut || 'reconstituee',
    reproposerApres: ligne.reproposerApres || ligne.reproposer_apres || null,
    qualiteAlimentaire: ligne.qualiteAlimentaire || ligne.qualite_alimentaire || null,
    frequenceExtras: ligne.frequenceExtras || ligne.frequence_extras || null,
    repasMoyens: ligne.repasMoyens || ligne.repas_moyens || null,
    challengeRealise: ligne.challengeRealise ?? ligne.challenge_realise ?? false,
    challengeType: ligne.challengeType || ligne.challenge_type || '',
    challengeDuree: ligne.challengeDuree || ligne.challenge_duree || '',
    evolutionPoids: ligne.evolutionPoids || ligne.evolution_poids || null,
    energieGlobale: ligne.energieGlobale || ligne.energie_globale || null,
    classification: ligne.classification || {},
    source: ligne.source || 'questionnaire'
  };
}

function couvreExactement(periode, dateDebut, dateFin) {
  return periode?.dateDebut === dateDebut && periode?.dateFin === dateFin;
}

export function detecterTrouSuivi({
  repas = [],
  periodes = [],
  dateReference,
  seuilJours = 14
}) {
  const reference = parseDateLocale(dateReference);
  if (!reference || !Number.isInteger(seuilJours) || seuilJours < 1) return null;

  const datesObservees = Array.from(new Set(
    (Array.isArray(repas) ? repas : [])
      .map(repasLigne => repasLigne?.date)
      .filter(date => parseDateLocale(date) && date <= dateReference)
  )).sort();

  if (datesObservees.length === 0) return null;
  const derniereDateObservee = datesObservees[datesObservees.length - 1];
  const derniereDate = parseDateLocale(derniereDateObservee);
  const nbJoursSansSaisie = Math.round((reference - derniereDate) / JOUR_MS);
  if (nbJoursSansSaisie < seuilJours) return null;

  const debut = new Date(derniereDate);
  debut.setDate(debut.getDate() + 1);
  const dateDebut = formatDateLocale(debut);
  const dateFin = dateReference;
  const periodesNormalisees = (Array.isArray(periodes) ? periodes : [])
    .map(normaliserPeriodeReconstituee)
    .filter(Boolean);

  const dejaReconstituee = periodesNormalisees.some(periode => (
    periode.statut === 'reconstituee' && couvreExactement(periode, dateDebut, dateFin)
  ));
  if (dejaReconstituee) return null;

  const reportActif = periodesNormalisees.some(periode => (
    periode.statut === 'reportee'
    && couvreExactement(periode, dateDebut, dateFin)
    && periode.reproposerApres
    && periode.reproposerApres > dateReference
  ));
  if (reportActif) return null;

  return { dateDebut, dateFin, derniereDateObservee, nbJoursSansSaisie };
}

export function calculerCouvertureSemaine({
  repas = [],
  periodes = [],
  dateDebut,
  dateFin
}) {
  const jours = enumererDates(dateDebut, dateFin);
  const joursSemaine = new Set(jours);
  const observes = new Set(
    (Array.isArray(repas) ? repas : [])
      .map(ligne => ligne?.date)
      .filter(date => joursSemaine.has(date))
  );
  const reconstitues = new Set();

  (Array.isArray(periodes) ? periodes : [])
    .map(normaliserPeriodeReconstituee)
    .filter(periode => periode?.statut === 'reconstituee')
    .forEach(periode => {
      enumererDates(periode.dateDebut, periode.dateFin).forEach(date => {
        if (joursSemaine.has(date) && !observes.has(date)) reconstitues.add(date);
      });
    });

  const joursObserves = observes.size;
  const joursReconstitues = reconstitues.size;
  const joursSansDonnee = Math.max(0, jours.length - joursObserves - joursReconstitues);
  const fiabilitePourcent = jours.length > 0
    ? Math.round((joursObserves / jours.length) * 100)
    : 0;

  return { joursObserves, joursReconstitues, joursSansDonnee, fiabilitePourcent };
}

export const MODES_HORIZON_PLANNING = Object.freeze({
  SEMAINE: 'semaine',
  QUINZE_JOURS: 'quinze_jours',
  MOIS: 'mois'
});

function dateValide(date) {
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (!correspondance) return null;
  const [, annee, mois, jour] = correspondance;
  const valeur = new Date(Date.UTC(Number(annee), Number(mois) - 1, Number(jour)));
  return valeur.toISOString().slice(0, 10) === `${annee}-${mois}-${jour}` ? valeur : null;
}

function formaterDate(date) {
  return date.toISOString().slice(0, 10);
}

export function ajouterJoursPlanning(date, nombreJours) {
  const valeur = dateValide(date);
  if (!valeur || !Number.isInteger(nombreJours)) return null;
  valeur.setUTCDate(valeur.getUTCDate() + nombreJours);
  return formaterDate(valeur);
}

export function obtenirDebutSemaine(date) {
  const valeur = dateValide(date);
  if (!valeur) return null;
  const decalage = (valeur.getUTCDay() + 6) % 7;
  valeur.setUTCDate(valeur.getUTCDate() - decalage);
  return formaterDate(valeur);
}

function listerDates(debut, nombreJours) {
  return Array.from({ length: nombreJours }, (_, index) => ajouterJoursPlanning(debut, index));
}

export function obtenirPeriodePlanning(mode, dateAncrage) {
  const ancrage = dateValide(dateAncrage);
  if (!ancrage) return null;

  if (mode === MODES_HORIZON_PLANNING.QUINZE_JOURS) {
    const debut = formaterDate(ancrage);
    const dates = listerDates(debut, 15);
    return { mode, debut, fin: dates.at(-1), dates };
  }

  if (mode === MODES_HORIZON_PLANNING.MOIS) {
    const annee = ancrage.getUTCFullYear();
    const mois = ancrage.getUTCMonth();
    const debut = formaterDate(new Date(Date.UTC(annee, mois, 1)));
    const dernierJour = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();
    const dates = listerDates(debut, dernierJour);
    return { mode, debut, fin: dates.at(-1), dates };
  }

  const debut = obtenirDebutSemaine(formaterDate(ancrage));
  const dates = listerDates(debut, 7);
  return { mode: MODES_HORIZON_PLANNING.SEMAINE, debut, fin: dates.at(-1), dates };
}

export function naviguerDansPlanning(mode, dateAncrage, direction) {
  if (![1, -1].includes(direction) || !dateValide(dateAncrage)) return null;
  if (mode === MODES_HORIZON_PLANNING.MOIS) {
    const date = dateValide(dateAncrage);
    date.setUTCMonth(date.getUTCMonth() + direction, 1);
    return formaterDate(date);
  }
  const pas = mode === MODES_HORIZON_PLANNING.QUINZE_JOURS ? 15 : 7;
  return ajouterJoursPlanning(dateAncrage, direction * pas);
}

export function creerCleGroupePlanifie(ligne, index = 0) {
  if (ligne?.combo_valide === true && ligne?.created_at && ligne?.date && ligne?.type) {
    return `assiette:${ligne.date}:${ligne.type}:${ligne.created_at}`;
  }
  return `ligne:${ligne?.id || index}`;
}

export function regrouperRepasPlanifies(repas = []) {
  const groupes = new Map();
  (Array.isArray(repas) ? repas : []).forEach((ligne, index) => {
    if (!ligne || typeof ligne !== 'object') return;
    const cle = creerCleGroupePlanifie(ligne, index);
    if (!groupes.has(cle)) groupes.set(cle, { cle, date: ligne.date, type: ligne.type, lignes: [] });
    groupes.get(cle).lignes.push(ligne);
  });
  return Array.from(groupes.values());
}

const JOUR_MS = 24 * 60 * 60 * 1000;

function estDateIso(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function dateIsoVersNombre(value) {
  if (!estDateIso(value)) return null;
  const [annee, mois, jour] = value.split('-').map(Number);
  return Date.UTC(annee, mois - 1, jour);
}

function nombreVersDateIso(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function normaliserDatesObservees(repas = []) {
  return Array.from(new Set(
    repas
      .map((repasOuDate) => typeof repasOuDate === 'string' ? repasOuDate : repasOuDate?.date)
      .filter(estDateIso)
  )).sort();
}

function detecterPeriodesSansSuivi(repas = [], minimumJours = 14) {
  const dates = normaliserDatesObservees(repas);
  const periodes = [];

  for (let index = 1; index < dates.length; index += 1) {
    const precedent = dateIsoVersNombre(dates[index - 1]);
    const suivant = dateIsoVersNombre(dates[index]);
    const nbJoursSansSaisie = Math.round((suivant - precedent) / JOUR_MS) - 1;

    if (nbJoursSansSaisie < minimumJours) continue;

    periodes.push({
      dateDebut: nombreVersDateIso(precedent + JOUR_MS),
      dateFin: nombreVersDateIso(suivant - JOUR_MS),
      nbJoursSansSaisie
    });
  }

  return periodes;
}

function periodeCorrespondante(periodes, dateSelectionnee) {
  if (!estDateIso(dateSelectionnee)) return null;
  return periodes.find(({ dateDebut, dateFin }) => (
    dateSelectionnee >= dateDebut && dateSelectionnee <= dateFin
  )) || null;
}

function choisirPeriodeAProposer({
  repas = [],
  periodesTraitees = [],
  dateSelectionnee = null,
  dateReference = new Date().toISOString().slice(0, 10),
  minimumJours = 14
} = {}) {
  const candidates = detecterPeriodesSansSuivi(repas, minimumJours).filter((periode) => {
    const traitement = periodesTraitees.find((item) => (
      item.date_debut === periode.dateDebut && item.date_fin === periode.dateFin
    ));

    if (!traitement) return true;
    if (traitement.statut === 'completee' || traitement.statut === 'reconstituee') return false;
    if (traitement.statut === 'reportee' && traitement.reproposer_apres > dateReference) return false;
    return true;
  });

  if (dateSelectionnee) return periodeCorrespondante(candidates, dateSelectionnee);
  return candidates[candidates.length - 1] || null;
}

module.exports = {
  choisirPeriodeAProposer,
  detecterPeriodesSansSuivi,
  periodeCorrespondante
};

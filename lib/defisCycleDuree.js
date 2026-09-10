const MS_JOUR = 24 * 60 * 60 * 1000;

function dateLocale(value) {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function jourCalendaireUtc(value) {
  const d = value instanceof Date ? value : new Date(value);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Calcule l'avancement temporel d'un défi de durée.
 * Le nombre de repas/observations n'incrémente jamais le jour courant.
 */
export function calculerCycleDuree(defi, maintenant = new Date()) {
  const duree = Number(defi?.duree || 0);
  if (!defi?.started_at || duree <= 0) {
    return { actif: false, jourCourant: 0, joursEcoules: 0, duree, termine: false };
  }

  const debut = dateLocale(defi.started_at);
  const courant = dateLocale(maintenant);
  const ecart = Math.max(0, Math.floor((jourCalendaireUtc(courant) - jourCalendaireUtc(debut)) / MS_JOUR));
  const jourCourant = Math.min(ecart + 1, duree);
  const termine = ecart >= duree;
  const dateFin = new Date(debut);
  dateFin.setDate(dateFin.getDate() + duree);

  return {
    actif: defi.status === 'en cours' && !termine,
    jourCourant,
    joursEcoules: Math.min(ecart, duree),
    duree,
    termine,
    dateDebut: debut,
    dateFin
  };
}

export function construireProgressionDuree(defi, maintenant = new Date()) {
  const cycle = calculerCycleDuree(defi, maintenant);
  return {
    ...cycle,
    libelle: cycle.jourCourant > 0 ? `Jour ${cycle.jourCourant} sur ${cycle.duree}` : null
  };
}

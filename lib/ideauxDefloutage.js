const FLOU_MAX_PX = 12;
const JOUR_MS = 24 * 60 * 60 * 1000;

function dateValide(valeur) {
  if (!valeur) return null;
  const date = new Date(`${String(valeur).slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ratioBilan(bilan, statut) {
  if (statut === 'realise' || bilan?.engagementTermine === true) return 1;
  const pourcentage = Number(bilan?.engagementPourcentage);
  if (!Number.isFinite(pourcentage)) return 0;
  return Math.min(1, Math.max(0, pourcentage / 100));
}

function nombrePaliersRestants(ideal) {
  const debut = dateValide(ideal?.plan_params_valides?.dateDebut || ideal?.date_debut);
  const cible = dateValide(ideal?.date_cible);
  const dureeSemaines = Number(ideal?.plan_params_valides?.palierDuree);
  if (!debut || !cible || !Number.isFinite(dureeSemaines) || dureeSemaines <= 0) return 1;

  const jours = Math.max(1, Math.ceil((cible - debut) / JOUR_MS) + 1);
  return Math.max(1, Math.ceil(jours / (dureeSemaines * 7)));
}

/**
 * Traduit la progression réellement vécue en dévoilement de l'image.
 * Les paliers archivés comptent selon leur bilan, le palier courant selon
 * ses séances prévues réalisées. Les bonus n'interviennent pas : ils sont
 * déjà exclus de progression_palier par le moteur commun.
 */
export function calculerDefloutageIdeal(ideal) {
  if (ideal?.statut === 'atteint') {
    return { pourcentage: 100, ratio: 1, flouPx: 0, equivalentsRealises: 1, totalEstime: 1 };
  }

  const archives = Array.isArray(ideal?.cycle_paliers) ? ideal.cycle_paliers : [];
  const equivalentsArchives = archives.reduce(
    (total, palier) => total + ratioBilan(palier?.bilan, palier?.statut),
    0
  );
  const progressionCourante = Number(ideal?.progression_palier?.pourcentage);
  const equivalentCourant = Number.isFinite(progressionCourante)
    ? Math.min(1, Math.max(0, progressionCourante / 100))
    : 0;
  const totalEstime = Math.max(archives.length + 1, archives.length + nombrePaliersRestants(ideal));
  const equivalentsRealises = Math.min(totalEstime, equivalentsArchives + equivalentCourant);
  const ratio = totalEstime > 0 ? equivalentsRealises / totalEstime : 0;

  return {
    pourcentage: Math.round(ratio * 100),
    ratio,
    flouPx: Number((FLOU_MAX_PX * (1 - ratio)).toFixed(2)),
    equivalentsRealises,
    totalEstime,
  };
}


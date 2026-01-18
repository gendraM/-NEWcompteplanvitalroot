// lib/repartitionExtras.js

/**
 * Calcule la répartition des extras par type (mini, normal, majeur) sur la semaine
 * @param {Array} repasSemaine - Liste des repas de la semaine
 * @returns {Object} - { mini: n, normal: n, majeur: n }
 */
export function calculerRepartitionTypes(repasSemaine) {
  const repartition = { mini: 0, normal: 0, majeur: 0 };
  if (!Array.isArray(repasSemaine)) return repartition;
  repasSemaine.forEach(r => {
    if (r.est_extra && r.type_extra && repartition.hasOwnProperty(r.type_extra)) {
      repartition[r.type_extra]++;
    }
  });
  return repartition;
}

/**
 * Calcule la répartition des extras par moment de la journée (matin, midi, soir, collation)
 * @param {Array} repasSemaine - Liste des repas de la semaine
 * @returns {Object} - { matin: n, midi: n, soir: n, collation: n }
 */
export function calculerRepartitionMoments(repasSemaine) {
  const moments = { matin: 0, midi: 0, soir: 0, collation: 0 };
  if (!Array.isArray(repasSemaine)) return moments;
  repasSemaine.forEach(r => {
    if (r.est_extra && r.moment && moments.hasOwnProperty(r.moment)) {
      moments[r.moment]++;
    }
  });
  return moments;
}

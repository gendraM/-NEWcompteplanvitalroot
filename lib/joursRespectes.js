// lib/joursRespectes.js

/**
 * Calcule le nombre de jours respectés et non respectés sur la semaine
 * Un jour est "respecté" si aucun extra n'est consommé ce jour-là
 * @param {Array} repasSemaine - Liste des repas de la semaine
 * @param {string} weekStart - Date de début de semaine (YYYY-MM-DD)
 * @returns {Object} - { joursRespectes: n, joursNonRespectes: n }
 */
export function calculerJoursRespectes(repasSemaine, weekStart) {
  if (!Array.isArray(repasSemaine) || !weekStart) return { joursRespectes: 0, joursNonRespectes: 0 };
  const debut = new Date(weekStart);
  const jours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(debut);
    d.setDate(debut.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  let respectes = 0;
  let nonRespectes = 0;
  jours.forEach(jour => {
    const repasJour = repasSemaine.filter(r => r.date === jour);
    const aExtra = repasJour.some(r => r.est_extra);
    if (repasJour.length > 0 && !aExtra) respectes++;
    else if (repasJour.length > 0 && aExtra) nonRespectes++;
  });
  return { joursRespectes: respectes, joursNonRespectes: nonRespectes };
}

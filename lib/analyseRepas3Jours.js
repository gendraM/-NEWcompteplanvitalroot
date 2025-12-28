import { supabase } from '../lib/supabaseClient';

/**
 * Récupère les 3 derniers jours de repas pour l'utilisateur connecté.
 * Retourne un tableau [{ date, repas: [ ... ] }]
 */
/**
 * Récupère les 3 jours précédant une date métier (startDate) pour l'utilisateur connecté.
 * @param {string} userId
 * @param {string|Date} [dateRef] - Date de référence (format YYYY-MM-DD ou Date JS). Si non fourni, prend la date système.
 */

export async function getAnalyse3DerniersJoursRepas(userId, dateRef) {
  let ref = dateRef ? new Date(dateRef) : new Date();
  ref.setHours(0,0,0,0);
  // Générer les 3 dates précédentes (J-1, J-2, J-3)
  const joursCibles = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(ref);
    d.setDate(ref.getDate() - i);
    joursCibles.push(d.toISOString().slice(0,10));
  }

  // --- Synchronisation localStorage <-> Supabase au premier affichage ---
  let repas = [];
  let error = null;
  let localRepas = [];
  let localRepasRaw = null;
  if (typeof window !== 'undefined') {
    try {
      localRepasRaw = window.localStorage.getItem('repas');
      if (localRepasRaw) {
        localRepas = JSON.parse(localRepasRaw);
      }
    } catch (e) { /* ignore */ }
  }
  // Si localStorage.repas est vide, on synchronise depuis Supabase
  if (!localRepas || localRepas.length === 0) {
    if (userId) {
      ({ data: repas, error } = await supabase
        .from('repas_reels')
        .select('*')
        .eq('user_id', userId)
        .in('date', joursCibles)
        .order('date', { ascending: false }));
    } else {
      ({ data: repas, error } = await supabase
        .from('repas_reels')
        .select('*')
        .in('date', joursCibles)
        .order('date', { ascending: false }));
    }
    if (repas && Array.isArray(repas) && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('repas', JSON.stringify(repas));
        localRepas = repas;
      } catch (e) { /* ignore */ }
    }
  }
  // L’analyse s’appuie toujours sur localStorage.repas (localRepas)
  const repasParJour = {};
  for (const r of localRepas) {
    const d = r.date?.slice(0, 10);
    if (!d) continue;
    if (joursCibles.includes(d)) {
      if (!repasParJour[d]) repasParJour[d] = [];
      repasParJour[d].push(r);
    }
  }
  return joursCibles.map(date => ({ date, repas: repasParJour[date] || [] }));

}

/**
 * NOUVEAU (P2) : Analyse les repas du jour pour suggérer automatiquement
 * quels critères de cristallisation sont respectés.
 * 
 * @param {Array} criteres - Liste des 5 critères du jour (depuis CRITERES_CRISTALLISATION)
 * @param {Array} repasJour - Liste des repas saisis pour le jour
 * @returns {Object} - { "crit_1_1": { suggere: true/false, raison: "..." }, ... }
 */
export function analyserCriteresAutomatiques(criteres, repasJour) {
  if (!criteres || !Array.isArray(criteres)) return {};
  if (!repasJour || !Array.isArray(repasJour)) return {};

  const suggestions = {};

  criteres.forEach(critere => {
    let suggere = false;
    let raison = "";

    try {
      // Analyse selon le type de critère
      switch (critere.type) {
        case 'extras':
          // Vérifier absence d'extras dans les repas
          const hasExtra = repasJour.some(r => r.est_extra === true);
          if (!hasExtra && repasJour.length > 0) {
            suggere = true;
            raison = "Aucun extra détecté dans tes repas du jour";
          }
          break;

        case 'hydratation':
          // Si données hydratation disponibles dans repas
          // Pour l'instant, pas de données hydratation dans repas_reels
          // On ne suggère pas automatiquement
          break;

        case 'timing':
          // Analyser horaires des repas
          if (repasJour.length > 0) {
            const heures = repasJour
              .filter(r => r.heure)
              .map(r => {
                const [h] = r.heure.split(':');
                return parseInt(h, 10);
              });
            
            // Exemple : dernier repas avant 19h
            if (critere.nom && critere.nom.toLowerCase().includes('19h')) {
              const dernierRepas = Math.max(...heures);
              if (dernierRepas < 19) {
                suggere = true;
                raison = `Dernier repas à ${dernierRepas}h (avant 19h)`;
              }
            }
          }
          break;

        case 'composition':
          // Analyser composition des repas (légumes, protéines, etc.)
          if (repasJour.length > 0) {
            // Vérifier présence de légumes dans tous les repas
            if (critere.nom && critere.nom.toLowerCase().includes('légumes')) {
              const tousAvecLegumes = repasJour.every(r => 
                r.aliments && r.aliments.some(a => 
                  a.toLowerCase().includes('légume') || 
                  a.toLowerCase().includes('salade') ||
                  a.toLowerCase().includes('tomate') ||
                  a.toLowerCase().includes('carotte')
                )
              );
              if (tousAvecLegumes) {
                suggere = true;
                raison = "Légumes présents dans tous tes repas";
              }
            }
          }
          break;

        case 'comportement':
          // Comportements alimentaires (mastication, pleine conscience, etc.)
          // Pas de données automatiques disponibles
          // Ne pas suggérer
          break;

        case 'quantite':
          // Analyser portions/quantités
          if (repasJour.length > 0) {
            // Vérifier si portions raisonnables (données calories si disponibles)
            const caloriesTotal = repasJour.reduce((sum, r) => sum + (r.calories || 0), 0);
            if (critere.nom && critere.nom.toLowerCase().includes('portion') && caloriesTotal > 0 && caloriesTotal < 2000) {
              suggere = true;
              raison = `Portions raisonnables (${caloriesTotal} kcal estimées)`;
            }
          }
          break;

        case 'qualite':
          // Qualité des aliments (bio, brut, etc.)
          // Pas de données automatiques
          // Ne pas suggérer
          break;

        default:
          // Type non géré
          break;
      }
    } catch (error) {
      console.error('[ANALYSE CRITERES] Erreur analyse critère:', critere.id, error);
      // En cas d'erreur, ne pas suggérer
      suggere = false;
    }

    suggestions[critere.id] = { suggere, raison };
  });

  return suggestions;
}

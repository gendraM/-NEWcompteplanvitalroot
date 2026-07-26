/**
 * analyzeHistorique.js
 * Module d'apprentissage : analyse des reprises archivées pour propositions intelligentes,
 * détection de jours critiques et statistiques globales.
 *
 * Fonctions exposées :
 *   analyserHistorique(historiqueReprises, jourActuel, phaseActuelle)
 *   trouverAlimentsGagnants(historiqueReprises, jour, phase)
 *   detecterJoursCritiques(historiqueReprises)
 *   calculerStatsGlobales(historiqueReprises)
 */

// Seuil minimum de stagnation pour signaler un jour comme "à risque" (40% des reprises)
const SEUIL_STAGNATION = 0.4;
// Seuil pour classer un jour comme "critique" plutôt que "attention" (66% des reprises)
const SEUIL_CRITIQUE = 0.66;

/**
 * Trouve les aliments ayant eu du succès lors de reprises précédentes
 * au même jour et à la même phase.
 *
 * @param {Array} historiqueReprises - Tableau des reprises archivées
 * @param {number} jour - Numéro du jour actuel
 * @param {number|string} phase - Numéro ou libellé de la phase actuelle
 * @returns {Array} Liste triée d'aliments gagnants avec métriques
 */
function trouverAlimentsGagnants(historiqueReprises, jour, phase) {
  if (!Array.isArray(historiqueReprises) || historiqueReprises.length === 0) return [];
  if (jour == null || phase == null) return [];

  const phaseNum = Number(phase);
  const stats = {};

  historiqueReprises.forEach(function(reprise) {
    if (!Array.isArray(reprise.repasConsommes)) return;

    const repriseReussie = reprise.bilan && reprise.bilan.reprise_reussie === true;

    reprise.repasConsommes.forEach(function(repas) {
      const jourRepas = repas.jour_reprise != null ? repas.jour_reprise : repas.jour_numero;
      const phaseRepas = Number(
        repas.phase_reprise != null ? repas.phase_reprise : (repas.phase != null ? repas.phase : 0)
      );

      if (Number(jourRepas) !== Number(jour) || phaseRepas !== phaseNum) return;

      let aliments = [];
      if (Array.isArray(repas.aliments)) {
        aliments = repas.aliments.map(function(a) {
          return typeof a === 'string' ? a : (a && a.nom) || null;
        }).filter(Boolean);
      } else if (repas.nom_aliment) {
        aliments = [repas.nom_aliment];
      } else if (repas.nom_repas) {
        aliments = [repas.nom_repas];
      }

      aliments.forEach(function(aliment) {
        if (!stats[aliment]) {
          stats[aliment] = { aliment: aliment, succes: 0, echecs: 0, apparitions: 0 };
        }
        stats[aliment].apparitions += 1;
        if (repriseReussie) {
          stats[aliment].succes += 1;
        } else {
          stats[aliment].echecs += 1;
        }
      });
    });
  });

  return Object.values(stats)
    // Trier par succès décroissant, puis par moins d'échecs en cas d'égalité
    .sort(function(a, b) { return b.succes - a.succes || a.echecs - b.echecs; })
    .slice(0, 5);
}

/**
 * Détecte les jours/phases problématiques (stagnation ou arrêt fréquent)
 * sur l'ensemble des reprises archivées.
 *
 * @param {Array} historiqueReprises - Tableau des reprises archivées
 * @returns {Array} Liste des jours critiques avec stats
 */
function detecterJoursCritiques(historiqueReprises) {
  if (!Array.isArray(historiqueReprises) || historiqueReprises.length === 0) return [];

  const compteursJour = {};

  historiqueReprises.forEach(function(reprise) {
    const joursValidesObj = Array.isArray(reprise.joursValides) ? reprise.joursValides : [];
    const totalJours = reprise.duree || 0;
    const phaseMax = reprise.phaseMaxAtteinte || 0;
    const repasConsommes = Array.isArray(reprise.repasConsommes) ? reprise.repasConsommes : [];

    const pairesJourPhase = new Set();
    repasConsommes.forEach(function(repas) {
      const jour = repas.jour_reprise != null ? repas.jour_reprise : repas.jour_numero;
      const phase = Number(
        repas.phase_reprise != null ? repas.phase_reprise : (repas.phase != null ? repas.phase : 1)
      );
      if (jour != null) pairesJourPhase.add(jour + '_' + phase);
    });

    if (!reprise.bilan || reprise.bilan.reprise_reussie !== true) {
      const dernierJourItem = joursValidesObj.length > 0
        ? joursValidesObj[joursValidesObj.length - 1]
        : null;
      const dernierJour = dernierJourItem != null
        ? (typeof dernierJourItem === 'object' ? dernierJourItem.jour_numero : dernierJourItem)
        : null;

      if (dernierJour != null && dernierJour < totalJours) {
        const phaseEstimee = phaseMax || 1;
        const cle = dernierJour + '_' + phaseEstimee;
        if (!compteursJour[cle]) {
          compteursJour[cle] = { jour: dernierJour, phase: phaseEstimee, stagnations: 0, total: 0 };
        }
        compteursJour[cle].stagnations += 1;
        compteursJour[cle].total += 1;
      }
    }

    pairesJourPhase.forEach(function(paire) {
      if (!compteursJour[paire]) {
        const parts = paire.split('_');
        compteursJour[paire] = { jour: Number(parts[0]), phase: Number(parts[1]), stagnations: 0, total: 0 };
      }
      compteursJour[paire].total += 1;
    });
  });

  return Object.values(compteursJour)
    .filter(function(c) { return c.stagnations > 0 && c.stagnations / Math.max(c.total, 1) >= SEUIL_STAGNATION; })
    .map(function(c) {
      return {
        jour: c.jour,
        phase: c.phase,
        stagnations: c.stagnations,
        total: c.total,
        tauxStagnation: Math.round((c.stagnations / Math.max(c.total, 1)) * 100),
        alerte: c.stagnations / Math.max(c.total, 1) >= SEUIL_CRITIQUE ? 'CRITIQUE' : 'ATTENTION',
      };
    })
    .sort(function(a, b) { return b.tauxStagnation - a.tauxStagnation; });
}

/**
 * Calcule les statistiques globales sur l'ensemble des reprises archivées.
 *
 * @param {Array} historiqueReprises - Tableau des reprises archivées
 * @returns {Object} Statistiques globales
 */
function calculerStatsGlobales(historiqueReprises) {
  if (!Array.isArray(historiqueReprises) || historiqueReprises.length === 0) {
    return {
      totalReprises: 0,
      repriseReussies: 0,
      tauxReussite: 0,
      phaseStats: {},
      alimentMeilleur: null,
      evolutionPoidsMoyen: null,
    };
  }

  const totalReprises = historiqueReprises.length;
  const repriseReussies = historiqueReprises.filter(function(r) {
    return r.bilan && r.bilan.reprise_reussie === true;
  }).length;

  const phaseStats = {};
  for (let p = 1; p <= 5; p++) {
    const atteintes = historiqueReprises.filter(function(r) {
      return (r.phaseMaxAtteinte || 0) >= p;
    }).length;
    phaseStats['Phase ' + p] = {
      atteinte: atteintes,
      total: totalReprises,
      taux: Math.round((atteintes / totalReprises) * 100),
      compteur: atteintes + '/' + totalReprises,
    };
  }

  const compteurAliments = {};
  historiqueReprises.forEach(function(reprise) {
    if (!reprise.bilan || !reprise.bilan.reprise_reussie) return;
    const alimentsParPhase = reprise.alimentsConsommesParPhase || {};
    Object.values(alimentsParPhase).forEach(function(aliments) {
      (Array.isArray(aliments) ? aliments : []).forEach(function(a) {
        const nom = typeof a === 'string' ? a : (a && a.nom);
        if (nom) {
          compteurAliments[nom] = (compteurAliments[nom] || 0) + 1;
        }
      });
    });
  });
  const alimentsSorted = Object.entries(compteurAliments).sort(function(a, b) { return b[1] - a[1]; });
  const alimentMeilleur = alimentsSorted.length > 0
    ? { aliment: alimentsSorted[0][0], occurrences: alimentsSorted[0][1] }
    : null;

  const repriseAvecPoids = historiqueReprises.filter(function(r) {
    return r.bilan_reprise &&
      r.bilan_reprise.poids_debut_reprise != null &&
      r.bilan_reprise.poids_fin_reprise != null;
  });
  let evolutionPoidsMoyen = null;
  if (repriseAvecPoids.length > 0) {
    const totalEvol = repriseAvecPoids.reduce(function(sum, r) {
      return sum + (r.bilan_reprise.poids_fin_reprise - r.bilan_reprise.poids_debut_reprise);
    }, 0);
    evolutionPoidsMoyen = parseFloat((totalEvol / repriseAvecPoids.length).toFixed(2));
  }

  return {
    totalReprises: totalReprises,
    repriseReussies: repriseReussies,
    tauxReussite: Math.round((repriseReussies / totalReprises) * 100),
    phaseStats: phaseStats,
    alimentMeilleur: alimentMeilleur,
    evolutionPoidsMoyen: evolutionPoidsMoyen,
  };
}

/**
 * Orchestrateur principal : analyse l'historique et retourne propositions,
 * alertes et statistiques pour le jour/phase actuel.
 *
 * @param {Array} historiqueReprises - Tableau des reprises archivées
 * @param {number} jourActuel - Numéro du jour courant dans la reprise en cours
 * @param {number|string} phaseActuelle - Numéro ou libellé de la phase courante
 * @returns {Object} Résultat de l'analyse
 */
function analyserHistorique(historiqueReprises, jourActuel, phaseActuelle) {
  const vide = {
    propositionsAliments: [],
    alertesJoursCritiques: [],
    statsGlobales: {},
    recommandations: [],
  };

  if (!Array.isArray(historiqueReprises) || historiqueReprises.length === 0) return vide;

  const propositionsAliments = trouverAlimentsGagnants(historiqueReprises, jourActuel, phaseActuelle);
  const tousJoursCritiques = detecterJoursCritiques(historiqueReprises);
  const phaseNum = Number(phaseActuelle);
  const alertesJoursCritiques = tousJoursCritiques.filter(function(c) {
    return c.jour === Number(jourActuel) && c.phase === phaseNum;
  });
  const statsGlobales = calculerStatsGlobales(historiqueReprises);

  const recommandations = [];

  if (propositionsAliments.length > 0) {
    const top = propositionsAliments[0];
    recommandations.push(
      '✨ Jour ' + jourActuel + ' Phase ' + phaseActuelle + ' : Tu réussis bien avec ' + top.aliment + ' (' + top.succes + ' fois). Continue !'
    );
  }

  if (alertesJoursCritiques.length > 0) {
    const alerte = alertesJoursCritiques[0];
    recommandations.push(
      '⚠️ Jour ' + alerte.jour + ' Phase ' + alerte.phase + ' : Stagnation fréquente (' + alerte.stagnations + '/' + alerte.total + ' reprises). Sois vigilant !'
    );
    const alimJourPrecedent = trouverAlimentsGagnants(historiqueReprises, alerte.jour - 1, phaseActuelle);
    if (alimJourPrecedent.length > 0) {
      recommandations.push(
        '💡 Essaie ' + alimJourPrecedent[0].aliment + ' — ça a bien marché au Jour ' + (alerte.jour - 1) + ' Phase ' + phaseActuelle + '.'
      );
    }
  }

  if (statsGlobales.alimentMeilleur && recommandations.length === 0) {
    recommandations.push(
      '🏆 Aliment clé dans tes reprises réussies : ' + statsGlobales.alimentMeilleur.aliment
    );
  }

  return {
    propositionsAliments: propositionsAliments,
    alertesJoursCritiques: alertesJoursCritiques,
    statsGlobales: statsGlobales,
    recommandations: recommandations,
  };
}

module.exports = {
  trouverAlimentsGagnants: trouverAlimentsGagnants,
  detecterJoursCritiques: detecterJoursCritiques,
  calculerStatsGlobales: calculerStatsGlobales,
  analyserHistorique: analyserHistorique,
};

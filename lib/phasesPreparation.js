// Module partagé pour le calcul dynamique des phases de préparation
// Adapte automatiquement les phases selon la durée disponible

/**
 * Calcule les phases adaptées en fonction de la durée disponible
 * @param {Date} dateJeune - Date de début du jeûne
 * @param {Date} dateDebutPreparation - Date de début de la préparation (par défaut: aujourd'hui)
 * @param {Array} criteresMetier - Liste des critères métier pour les associer aux phases
 * @returns {Array} Phases adaptées avec debut, fin, nom, objectif, criteres
 */
export function calculerPhasesAdaptees(dateJeune, dateDebutPreparation = null, criteresMetier = []) {
  if (!dateJeune) return [];
  
  const today = new Date(dateDebutPreparation || new Date());
  today.setHours(0, 0, 0, 0);
  const dateJ0 = new Date(dateJeune);
  dateJ0.setHours(0, 0, 0, 0);
  
  const joursDisponibles = Math.floor((dateJ0 - today) / (1000 * 60 * 60 * 24));
  
  // Plan adapté selon la durée disponible
  if (joursDisponibles >= 25) {
    // Plan LONG (25+ jours) : Préparation optimale 30 jours
    return [
      {
        id: 'phase1',
        nom: 'Phase 1 : Allègement',
        debut: -30,
        fin: -18,
        objectif: 'Rééquilibrer l\'alimentation et limiter les excès',
        criteres: criteresMetier.filter(c => c.jalon === 30)
      },
      {
        id: 'phase2',
        nom: 'Phase 2 : Végétalisation',
        debut: -17,
        fin: -8,
        objectif: 'Alléger la digestion et supprimer les toxines',
        criteres: criteresMetier.filter(c => [17, 14, 12].includes(c.jalon))
      },
      {
        id: 'phase3',
        nom: 'Phase 3 : Pré-jeûne',
        debut: -7,
        fin: 0,
        objectif: 'Préparer le corps au jeûne immédiat',
        criteres: criteresMetier.filter(c => c.jalon === 7)
      }
    ];
  } else if (joursDisponibles >= 12) {
    // Plan MOYEN (12-24 jours) : Préparation accélérée 14 jours
    return [
      {
        id: 'phase1',
        nom: 'Phase 1 : Allègement',
        debut: -14,
        fin: -8,
        objectif: 'Rééquilibrer rapidement l\'alimentation',
        criteres: criteresMetier.filter(c => [30, 17, 14].includes(c.jalon))
      },
      {
        id: 'phase2',
        nom: 'Phase 2 : Végétalisation',
        debut: -7,
        fin: -1,
        objectif: 'Alléger la digestion et préparer le jeûne',
        criteres: criteresMetier.filter(c => [12, 7].includes(c.jalon))
      },
      {
        id: 'phase3',
        nom: 'Phase 3 : Pré-jeûne',
        debut: 0,
        fin: 0,
        objectif: 'Dernier jour avant le jeûne',
        criteres: criteresMetier.filter(c => c.jalon === 7)
      }
    ];
  } else if (joursDisponibles >= 7) {
    // Plan COURT (7-11 jours) : Préparation intensive
    return [
      {
        id: 'phase1',
        nom: 'Phase 1 : Préparation intensive',
        debut: -Math.min(joursDisponibles, 10),
        fin: -3,
        objectif: 'Préparation express multi-critères',
        criteres: criteresMetier.filter(c => [30, 17, 14, 12].includes(c.jalon))
      },
      {
        id: 'phase2',
        nom: 'Phase 2 : Pré-jeûne',
        debut: -2,
        fin: 0,
        objectif: 'Préparation finale immédiate',
        criteres: criteresMetier.filter(c => c.jalon === 7)
      }
    ];
  } else {
    // Plan MINIMAL (<7 jours) : Préparation minimale
    return [
      {
        id: 'phase-unique',
        nom: 'Préparation express',
        debut: -joursDisponibles,
        fin: 0,
        objectif: 'Préparation minimale (durée insuffisante pour préparation optimale)',
        criteres: criteresMetier.filter(c => [7, 14].includes(c.jalon))
      }
    ];
  }
}

/**
 * Détecte la phase actuellement active
 * @param {Date} dateJeune - Date de début du jeûne
 * @param {Date} dateDebutPreparation - Date de début de la préparation
 * @returns {Object} { phaseActive, nomPhase, periodeStart, periodeEnd, jCourant }
 */
export function detecterPhaseActive(dateJeune, dateDebutPreparation = null) {
  if (!dateJeune) {
    return { phaseActive: null, nomPhase: 'Préparation du jeûne', periodeStart: null, periodeEnd: null, jCourant: null };
  }
  
  const phases = calculerPhasesAdaptees(dateJeune, dateDebutPreparation);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateJ0 = new Date(dateJeune);
  dateJ0.setHours(0, 0, 0, 0);
  
  const jCourant = -Math.floor((dateJ0 - today) / (1000 * 60 * 60 * 24));
  
  // Trouver la phase active
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    if (jCourant >= phase.debut && jCourant <= phase.fin) {
      return {
        phaseActive: i + 1,
        nomPhase: phase.nom,
        periodeStart: new Date(dateJ0.getTime() + phase.debut * 24 * 60 * 60 * 1000),
        periodeEnd: new Date(dateJ0.getTime() + phase.fin * 24 * 60 * 60 * 1000),
        jCourant
      };
    }
  }
  
  // Aucune phase active
  const premierephase = phases[0];
  const dernierephase = phases[phases.length - 1];
  
  if (jCourant < premierephase.debut) {
    return {
      phaseActive: null,
      nomPhase: `Préparation du jeûne (démarrage dans ${Math.abs(jCourant - premierephase.debut)} jours)`,
      periodeStart: null,
      periodeEnd: null,
      jCourant
    };
  } else {
    return {
      phaseActive: null,
      nomPhase: 'Préparation terminée',
      periodeStart: null,
      periodeEnd: null,
      jCourant
    };
  }
}

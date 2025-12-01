// Module métier partagé pour la préparation au jeûne
// Centralise la logique des phases, critères, calculs dynamiques, et validation automatique
// Strictement conforme au plan validé et à la logique métier

// --- Types ---
/**
 * Une phase de préparation
 * @typedef {Object} PhasePreparation
 * @property {string} id - Identifiant unique de la phase
 * @property {string} nom - Nom affiché de la phase
 * @property {number} debut - Jour de début relatif (ex: -14 pour J-14)
 * @property {number} fin - Jour de fin relatif (ex: -7 pour J-7)
 * @property {Array<CriterePreparation>} criteres - Critères à valider pour cette phase
 */

/**
 * Un critère métier à valider
 * @typedef {Object} CriterePreparation
 * @property {string} id - Identifiant unique du critère
 * @property {string} description - Texte affiché
 * @property {function(Object): boolean} validation - Fonction de validation automatique (reçoit le contexte du jour)
 */

// --- Définition des phases et critères ---

const PHASES_PREPARATION = [
  {
    id: 'phase1',
    nom: 'Phase 1 : Allègement',
    debut: -14,
    fin: -8,
    criteres: [
      {
        id: 'repas_sans_proteines_animales',
        description: 'Au moins un repas sans protéines animales',
        validation: ({ repas }) => repas.some(r => !r.contientProteinesAnimales),
      },
      {
        id: 'aucun_repas_apres_19h',
        description: 'Aucun repas après 19h',
        validation: ({ repas }) => repas.every(r => r.heure <= 19),
      },
    ],
  },
  {
    id: 'phase2',
    nom: 'Phase 2 : Végétalisation',
    debut: -7,
    fin: -1,
    criteres: [
      {
        id: 'repas_100_vegetal',
        description: 'Tous les repas 100% végétal',
        validation: ({ repas }) => repas.every(r => r.estVegetal),
      },
      {
        id: 'aucun_repas_apres_19h',
        description: 'Aucun repas après 19h',
        validation: ({ repas }) => repas.every(r => r.heure <= 19),
      },
    ],
  },
  {
    id: 'phase3',
    nom: 'Phase 3 : Pré-jeûne',
    debut: 0,
    fin: 0,
    criteres: [
      {
        id: 'repas_legers',
        description: 'Repas très légers (fruits/légumes cuits)',
        validation: ({ repas }) => repas.every(r => r.type === 'leger'),
      },
      {
        id: 'aucun_repas_apres_19h',
        description: 'Aucun repas après 19h',
        validation: ({ repas }) => repas.every(r => r.heure <= 19),
      },
    ],
  },
];

// --- Fonctions métier ---

/**
 * Retourne la phase métier en cours pour un jour donné (relatif à J0)
 * @param {number} jourRelatif - Jour par rapport à J0 (ex: -10, -3, 0)
 * @returns {PhasePreparation}
 */
export function getPhaseDuJour(jourRelatif) {
  return PHASES_PREPARATION.find(phase => jourRelatif >= phase.debut && jourRelatif <= phase.fin);
}

/**
 * Retourne la liste des critères à valider pour un jour donné
 * @param {number} jourRelatif
 * @returns {Array<CriterePreparation>}
 */
export function getCriteresDuJour(jourRelatif) {
  const phase = getPhaseDuJour(jourRelatif);
  return phase ? phase.criteres : [];
}

/**
 * Calcule la validation automatique des critères pour un jour donné
 * @param {number} jourRelatif
 * @param {Object} contexteJour - { repas: Array<{heure:number, contientProteinesAnimales:boolean, estVegetal:boolean, type:string}> }
 * @returns {Array<{id:string, valide:boolean, description:string}>}
 */
export function validerCriteresDuJour(jourRelatif, contexteJour) {
  const criteres = getCriteresDuJour(jourRelatif);
  return criteres.map(critere => ({
    id: critere.id,
    description: critere.description,
    valide: critere.validation(contexteJour),
  }));
}

/**
 * Retourne la liste complète des phases métier
 */
export function getPhasesPreparation() {
  return PHASES_PREPARATION;
}

// --- Export par défaut (optionnel) ---
export default {
  getPhaseDuJour,
  getCriteresDuJour,
  validerCriteresDuJour,
  getPhasesPreparation,
};

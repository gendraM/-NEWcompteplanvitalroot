// Module métier partagé pour la préparation au jeûne
// Source UNIQUE de vérité (Phase 1 du plan de conformité du 29/06/2026) :
// modèle aligné sur celui réellement affiché dans pages/preparation-jeune.js
// (3 phases, 9 critères, jalons J-30/J-17/J-14/J-12/J-7).
// Ne pas redéfinir des phases/critères ailleurs : tout consommateur doit importer d'ici.

// --- Types ---
/**
 * Un critère métier de préparation
 * @typedef {Object} CriterePreparation
 * @property {number} id - Identifiant unique du critère (1 à 9)
 * @property {string} label - Libellé court affiché (listes, historique)
 * @property {number} jalon - Jalon J-XX auquel le critère est rattaché (30, 17, 14, 12 ou 7)
 * @property {string} description - Texte explicatif ("pourquoi")
 * @property {string} titre - Titre affiché dans les cartes de critère
 * @property {string} conseil - Conseil pratique associé
 */

/**
 * Une phase de préparation
 * @typedef {Object} PhasePreparation
 * @property {string} id - Identifiant unique de la phase
 * @property {string} nom - Nom affiché de la phase
 * @property {number} debut - Jour de début relatif à J0 (ex: -30)
 * @property {number} fin - Jour de fin relatif à J0 (ex: -18)
 * @property {string} objectif - Objectif métier de la phase
 * @property {number[]} jalons - Jalons de critères rattachés à cette phase
 */

// --- Référentiel unique des 9 critères ---

export const CRITERES_PREPARATION = [
  { id: 1, label: "Respect strict des quantités à chaque repas", jalon: 30, description: "Réapprendre à ton corps ce qu'est une vraie portion", titre: "Respect strict des quantités", conseil: "Réapprendre à ton corps ce qu'est une vraie portion" },
  { id: 2, label: "Supprimer les féculents le soir (lun-dim)", jalon: 17, description: "Alléger la digestion le soir pour préparer le jeûne", titre: "Supprimer les féculents le soir", conseil: "Alléger la digestion le soir pour préparer le jeûne" },
  { id: 3, label: "Action immédiate après le repas (marche/ménage)", jalon: 17, description: "Activer la digestion et éviter le stockage", titre: "Action immédiate après le repas", conseil: "Activer la digestion et éviter le stockage (marche/ménage)" },
  { id: 4, label: "Éliminer tous produits transformés", jalon: 14, description: "Limiter les toxines et l'inflammation", titre: "Éliminer tous produits transformés", conseil: "Limiter les toxines et l'inflammation" },
  { id: 5, label: "Éliminer toutes sucreries", jalon: 14, description: "Stabiliser la glycémie et l'énergie", titre: "Éliminer toutes sucreries", conseil: "Stabiliser la glycémie et l'énergie" },
  { id: 6, label: "2 jours de jeûne plein (préparation métabolique)", jalon: 12, description: "Tester la tolérance au jeûne", titre: "2 jours de jeûne plein", conseil: "Tester la tolérance au jeûne (préparation métabolique)" },
  { id: 7, label: "2 litres d'eau par jour (suivi automatique)", jalon: 7, description: "Hydratation optimale avant le jeûne", titre: "2 litres d'eau par jour", conseil: "Hydratation optimale avant le jeûne (suivi automatique)" },
  { id: 8, label: "Pas de repas après 19h00", jalon: 7, description: "Préparer le système digestif au jeûne", titre: "Pas de repas après 19h00", conseil: "Préparer le système digestif au jeûne" },
  { id: 9, label: "Plage alimentaire limitée à 45 minutes par repas", jalon: 7, description: "Limiter le grignotage et améliorer la digestion", titre: "Plage alimentaire 45 min max", conseil: "Limiter le grignotage et améliorer la digestion" },
];

// --- Référentiel unique des 3 phases (dates alignées sur pages/preparation-jeune.js) ---

export const PHASES_PREPARATION = [
  {
    id: 'phase1-fondation',
    nom: 'Phase 1 : Allègement',
    debut: -30,
    fin: -18,
    objectif: "Rééquilibrer l'alimentation et limiter les excès",
    jalons: [30],
  },
  {
    id: 'phase2-intensification',
    nom: 'Phase 2 : Végétalisation',
    debut: -17,
    fin: -8,
    objectif: 'Alléger la digestion et supprimer les toxines',
    jalons: [17, 14, 12],
  },
  {
    id: 'phase3-prejeune',
    nom: 'Phase 3 : Pré-jeûne',
    debut: -7,
    fin: 0,
    objectif: 'Préparer le corps au jeûne immédiat',
    jalons: [7],
  },
];

// --- Fonctions métier ---

/**
 * Retourne la liste complète des phases, chacune enrichie de ses critères (jointure sur `jalon`)
 * @returns {Array<PhasePreparation & { criteres: CriterePreparation[] }>}
 */
export function getPhasesPreparation() {
  return PHASES_PREPARATION.map(phase => ({
    ...phase,
    criteres: CRITERES_PREPARATION.filter(critere => phase.jalons.includes(critere.jalon)),
  }));
}

/**
 * Retourne la phase métier en cours pour un jour donné (relatif à J0)
 * @param {number} jourRelatif - Jour par rapport à J0 (ex: -30, -10, 0)
 * @returns {(PhasePreparation & { criteres: CriterePreparation[] })|null}
 */
export function getPhaseDuJour(jourRelatif) {
  const phases = getPhasesPreparation();
  return phases.find(phase => jourRelatif >= phase.debut && jourRelatif <= phase.fin) || null;
}

/**
 * Retourne la liste des critères rattachés à la phase active pour un jour donné
 * @param {number} jourRelatif
 * @returns {Array<CriterePreparation>}
 */
export function getCriteresDuJour(jourRelatif) {
  const phase = getPhaseDuJour(jourRelatif);
  return phase ? phase.criteres : [];
}

/**
 * Retourne l'état de validation des critères du jour à partir d'une map de statuts
 * (produite par lib/validerCriterePreparation.js::getCriteresPreparation()).
 * La validation effective des critères (manuelle ou auto) reste portée par
 * lib/validerCriterePreparation.js ; cette fonction ne fait que projeter ce statut
 * sur les critères de la phase du jour.
 * @param {number} jourRelatif
 * @param {Object<number, {validé:boolean}>} [statutsCriteres]
 * @returns {Array<{id:number, label:string, description:string, valide:boolean}>}
 */
export function validerCriteresDuJour(jourRelatif, statutsCriteres = {}) {
  const criteres = getCriteresDuJour(jourRelatif);
  return criteres.map(critere => ({
    id: critere.id,
    label: critere.label,
    description: critere.description,
    valide: Boolean(statutsCriteres[critere.id]?.validé),
  }));
}

// --- Export par défaut (optionnel) ---
export default {
  CRITERES_PREPARATION,
  PHASES_PREPARATION,
  getPhasesPreparation,
  getPhaseDuJour,
  getCriteresDuJour,
  validerCriteresDuJour,
};

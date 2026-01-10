/**
 * EXTRAS - Gestion des types d'extras et conversion calorique
 * Phase 2 : Types Extras + Granularité
 * Date : 10 janvier 2026
 */

/**
 * Types d'extras disponibles avec valeurs caloriques
 * Mise à jour selon règle métier : extra = NATURE (hors repas), pas calories
 */
export const TYPES_EXTRAS = {
  mini: {
    label: "Mini extra",
    emoji: "🍬",
    seuil_min: 0,
    seuil_max: 149,
    description: "Petit plaisir ponctuel et maîtrisé",
    exemples: "2 carrés chocolat, bonbon, yaourt sucré",
    impact: "faible"
  },
  normal: {
    label: "Extra normal",
    emoji: "🍰",
    seuil_min: 150,
    seuil_max: 280,
    description: "Dessert ou plaisir sucré classique",
    exemples: "Part de gâteau, viennoiserie, glace",
    impact: "modéré"
  },
  double: {
    label: "Extra 2x",
    emoji: "🍕",
    seuil_min: 281,
    seuil_max: 500,
    description: "Plaisir conséquent hors repas à planifier",
    exemples: "Pâtisserie généreuse, pop-corn cinéma, apéritif",
    impact: "élevé"
  },
  majeur: {
    label: "Extra majeur",
    emoji: "�",
    seuil_min: 501,
    seuil_max: 99999,
    description: "Extra à très fort impact sur le budget",
    exemples: "Pop-corn XXL, apéritif conséquent, confiserie importante",
    impact: "très élevé"
  }
};

/**
 * Détermine automatiquement le type d'extra selon les kcal réelles
 * 
 * @param {number} kcal - Kilocalories réelles consommées
 * @returns {string} Type d'extra ('mini' | 'normal' | 'double' | 'majeur')
 */
export function detecterTypeExtra(kcal) {
  const kcalNum = parseFloat(kcal);
  
  // Validation
  if (isNaN(kcalNum) || kcalNum <= 0) {
    console.warn('detecterTypeExtra: kcal invalides, fallback "mini"', kcal);
    return 'mini';
  }

  // Auto-détection selon paliers
  if (kcalNum < 150) return 'mini';
  if (kcalNum <= 280) return 'normal';
  if (kcalNum <= 500) return 'double';
  return 'majeur'; // > 500 kcal = extra MAJEUR (fort impact budget)
}

/**
 * Obtient le label complet d'un type d'extra
 * 
 * @param {string} typeExtra - Type d'extra
 * @returns {string} Label formaté avec emoji
 */
export function getLabelExtra(typeExtra) {
  const type = typeExtra?.toLowerCase()?.trim();
  
  if (TYPES_EXTRAS[type]) {
    return `${TYPES_EXTRAS[type].emoji} ${TYPES_EXTRAS[type].label}`;
  }
  
  return `${TYPES_EXTRAS.normal.emoji} ${TYPES_EXTRAS.normal.label}`;
}

/**
 * Obtient la description d'un type d'extra
 * 
 * @param {string} typeExtra - Type d'extra
 * @returns {string} Description
 */
export function getDescriptionExtra(typeExtra) {
  const type = typeExtra?.toLowerCase()?.trim();
  
  if (TYPES_EXTRAS[type]) {
    return TYPES_EXTRAS[type].description;
  }
  
  return TYPES_EXTRAS.normal.description;
}

/**
 * Liste tous les types d'extras pour affichage
 * 
 * @returns {Array} Tableau d'objets {value, label, description, exemples}
 */
export function getOptionsExtras() {
  return Object.entries(TYPES_EXTRAS).map(([key, config]) => ({
    value: key,
    label: `${config.emoji} ${config.label}`,
    seuil: `${config.seuil_min}-${config.seuil_max === 99999 ? '∞' : config.seuil_max} kcal`,
    description: config.description,
    exemples: config.exemples,
    impact: config.impact
  }));
}

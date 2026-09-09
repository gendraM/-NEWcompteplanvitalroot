export const VALIDATION_MODE = Object.freeze({
  AUTOMATIC: 'automatic',
  DECLARATIVE: 'declarative',
  MIXED: 'mixed'
});

export const VALIDATION_DECISION = Object.freeze({
  VALIDATED: 'validated',
  NEEDS_CONFIRMATION: 'needs_confirmation',
  INSUFFICIENT_DATA: 'insufficient_data',
  NOT_VALIDATED: 'not_validated',
  ALREADY_VALIDATED: 'already_validated'
});

// Registre métier V1. Le nom est utilisé tant que les défis historiques ne disposent
// pas encore d'une clé métier stable en base. Aucun validateur ne doit inférer un mode
// absent du registre : le fallback prudent reste déclaratif.
const REGISTRE_VALIDATION = Object.freeze({
  '🍎 Pas de dessert par automatisme': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'jour' },
  '🧠 Je suis plus fort·e que mes excuses': { mode: VALIDATION_MODE.DECLARATIVE, unitePreuve: 'repas' },
  '🧀 1 portion ça suffit': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'jour' },
  '💡 J’écoute mon ventre': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'repas' },
  '🚫 Le faux allié': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'jour' },
  '🌡️ Chaud devant… mais doux !': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'diner' },
  '🔄 Je brise la chaîne': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'jour' },
  '🔥 1 vraie faim = 1 vrai repas': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'tentative' },
  '✨ Je me programme du plaisir': { mode: VALIDATION_MODE.MIXED, unitePreuve: 'semaine' },
  '💧 1 cru par jour': { mode: VALIDATION_MODE.AUTOMATIC, unitePreuve: 'jour', fallback: VALIDATION_MODE.MIXED }
});

export function getValidationConfig(defi) {
  const config = REGISTRE_VALIDATION[defi?.nom];
  if (config) return { ...config };
  return {
    mode: VALIDATION_MODE.DECLARATIVE,
    unitePreuve: defi?.unite || 'etape',
    personnalise: true
  };
}

export function creerDecisionValidation({
  decision,
  mode,
  preuveId = null,
  raison = '',
  donnees = null
}) {
  if (!Object.values(VALIDATION_DECISION).includes(decision)) {
    throw new Error('Décision de validation inconnue');
  }
  if (!Object.values(VALIDATION_MODE).includes(mode)) {
    throw new Error('Mode de validation inconnu');
  }
  return { decision, mode, preuveId, raison, donnees };
}

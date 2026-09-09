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

export const PROGRESSION_MODEL = Object.freeze({
  DURATION: 'duration',
  OCCURRENCES: 'occurrences'
});

// La durée et les observations sont deux notions distinctes.
// Exemple : un défi de satiété peut durer 5 jours tout en observant plusieurs repas par jour.
const REGISTRE_VALIDATION = Object.freeze({
  '🍎 Pas de dessert par automatisme': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.DURATION, dureeUnite: 'jour', observationUnite: 'dejeuner' },
  '🧠 Je suis plus fort·e que mes excuses': { mode: VALIDATION_MODE.DECLARATIVE, progressionModel: PROGRESSION_MODEL.OCCURRENCES, observationUnite: 'repas' },
  '🧀 1 portion ça suffit': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.DURATION, dureeUnite: 'jour', observationUnite: 'repas' },
  '💡 J’écoute mon ventre': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.DURATION, dureeUnite: 'jour', observationUnite: 'repas' },
  '🚫 Le faux allié': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.DURATION, dureeUnite: 'jour', observationUnite: 'extra' },
  '🌡️ Chaud devant… mais doux !': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.OCCURRENCES, observationUnite: 'diner' },
  '🔄 Je brise la chaîne': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.DURATION, dureeUnite: 'jour', observationUnite: 'sequence' },
  '🔥 1 vraie faim = 1 vrai repas': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.OCCURRENCES, observationUnite: 'tentative' },
  '✨ Je me programme du plaisir': { mode: VALIDATION_MODE.MIXED, progressionModel: PROGRESSION_MODEL.DURATION, dureeUnite: 'semaine', observationUnite: 'extra' },
  '💧 1 cru par jour': { mode: VALIDATION_MODE.AUTOMATIC, progressionModel: PROGRESSION_MODEL.DURATION, dureeUnite: 'jour', observationUnite: 'repas', fallback: VALIDATION_MODE.MIXED }
});

export function getValidationConfig(defi) {
  const config = REGISTRE_VALIDATION[defi?.nom];
  if (config) return { ...config };
  return {
    mode: VALIDATION_MODE.DECLARATIVE,
    progressionModel: PROGRESSION_MODEL.OCCURRENCES,
    observationUnite: defi?.unite || 'etape',
    personnalise: true
  };
}

export function creerDecisionValidation({ decision, mode, preuveId = null, raison = '', donnees = null }) {
  if (!Object.values(VALIDATION_DECISION).includes(decision)) throw new Error('Décision de validation inconnue');
  if (!Object.values(VALIDATION_MODE).includes(mode)) throw new Error('Mode de validation inconnu');
  return { decision, mode, preuveId, raison, donnees };
}

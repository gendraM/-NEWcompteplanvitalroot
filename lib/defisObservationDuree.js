import { getValidationConfig, PROGRESSION_MODEL, VALIDATION_MODE } from './defisValidationReferentiel';

const REGLES_OBSERVATION_DUREE = Object.freeze({
  '🍎 Pas de dessert par automatisme': {
    source: 'repas',
    unite: 'dejeuner',
    automatiqueSi: 'absence_de_dessert_identifiable',
    confirmationSi: 'dessert_present_pour_distinguer_automatisme_et_choix'
  },
  '🧀 1 portion ça suffit': {
    source: 'repas',
    unite: 'repas',
    automatiqueSi: 'seconde_portion_explicitement_identifiable',
    confirmationSi: 'nombre_de_portions_indeterminable'
  },
  '🚫 Le faux allié': {
    source: 'repas_et_extras',
    unite: 'extra',
    automatiqueSi: null,
    confirmationSi: 'intention_de_compensation_non_deductible_des_donnees'
  },
  '🔄 Je brise la chaîne': {
    source: 'repas_et_extras',
    unite: 'sequence',
    automatiqueSi: 'sequence_sucre_gras_explicitement_identifiable',
    confirmationSi: 'sequence_ou_intention_ambigue'
  },
  '✨ Je me programme du plaisir': {
    source: 'extras',
    unite: 'extra',
    automatiqueSi: 'extra_planifie_et_realise_identifiable',
    confirmationSi: 'planification_ou_realisation_indeterminable'
  },
  '💧 1 cru par jour': {
    source: 'repas',
    unite: 'jour',
    automatiqueSi: 'aliment_cru_non_sucre_identifiable',
    confirmationSi: 'preparation_alimentaire_indeterminable'
  }
});

/**
 * Décrit comment observer un défi DURATION sans jamais faire avancer son calendrier.
 * Les chaînes automatiqueSi/confirmationSi sont des contrats métier : elles évitent
 * de déduire une intention humaine lorsque les données ne suffisent pas.
 */
export function getRegleObservationDuree(defi) {
  const validation = getValidationConfig(defi);
  if (validation.progressionModel !== PROGRESSION_MODEL.DURATION) return null;

  const regle = REGLES_OBSERVATION_DUREE[defi?.nom];
  if (!regle) return null;

  return {
    ...regle,
    mode: validation.mode,
    fallback: validation.fallback || null,
    progressionModel: validation.progressionModel,
    dureeUnite: validation.dureeUnite,
    observationUnite: validation.observationUnite
  };
}

export function observationDureeNecessiteConfirmation(defi) {
  const regle = getRegleObservationDuree(defi);
  if (!regle) return false;
  return regle.mode === VALIDATION_MODE.MIXED || Boolean(regle.fallback);
}

export function listerReglesObservationDuree() {
  return Object.entries(REGLES_OBSERVATION_DUREE).map(([nom, regle]) => ({ nom, ...regle }));
}

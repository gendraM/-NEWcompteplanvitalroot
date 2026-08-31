import { genererOccurrenceRepasId } from './repasComposes';

export function construirePayloadRepasEnCours(aliments, contexte = {}, occurrenceRepasId = null) {
  if (!Array.isArray(aliments) || aliments.length === 0) {
    throw new Error('Au moins un aliment est nécessaire pour enregistrer le repas.');
  }

  const occurrence_repas_id = occurrenceRepasId || genererOccurrenceRepasId();

  return aliments.map(aliment => ({
    ...contexte,
    ...aliment,
    occurrence_repas_id,
  }));
}

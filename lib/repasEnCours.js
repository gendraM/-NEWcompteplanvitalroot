import { genererOccurrenceRepasId } from './repasComposes';

const CHAMPS_CONTEXTE_REPAS = [
  'type',
  'date',
  'heure',
  'satiete',
  'pourquoi',
  'ressenti',
  'details_signaux',
  'note'
];

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

export function creerCleRepasEnCours(date, type) {
  if (!date || !type) return null;
  return `${date}::${type}`;
}

export function construirePayloadRepasEnCoursDepuisLignes(lignes, occurrenceRepasId = null) {
  if (!Array.isArray(lignes) || lignes.length === 0) {
    throw new Error('Au moins un aliment est nécessaire pour enregistrer le repas.');
  }

  const derniereLigne = lignes[lignes.length - 1];
  const contexte = CHAMPS_CONTEXTE_REPAS.reduce((resultat, champ) => {
    resultat[champ] = derniereLigne?.[champ] ?? null;
    return resultat;
  }, {});

  const aliments = lignes.map(ligne => {
    if (!ligne || typeof ligne !== 'object' || Array.isArray(ligne)) {
      throw new Error('Une ligne du repas en cours est invalide.');
    }

    return Object.fromEntries(
      Object.entries(ligne).filter(([champ]) => !CHAMPS_CONTEXTE_REPAS.includes(champ))
    );
  });

  return construirePayloadRepasEnCours(aliments, contexte, occurrenceRepasId);
}

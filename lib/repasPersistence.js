export function normaliserRepasPourPersistance(repasData, userId = null) {
  const repasList = Array.isArray(repasData) ? repasData : [repasData];

  if (repasList.length === 0) {
    throw new Error('Au moins un repas est nécessaire pour la persistance.');
  }

  return repasList.map((repas, index) => {
    if (!repas || typeof repas !== 'object' || Array.isArray(repas)) {
      throw new Error(`Repas invalide à l'index ${index}.`);
    }

    return {
      ...repas,
      user_id: repas.user_id || userId || null,
    };
  });
}

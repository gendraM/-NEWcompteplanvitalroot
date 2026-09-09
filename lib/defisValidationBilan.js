const estOui = valeur => String(valeur ?? '').trim().toLowerCase() === 'oui' || valeur === true;
const estNon = valeur => String(valeur ?? '').trim().toLowerCase() === 'non' || valeur === false;

/**
 * Agrège les observations sans transformer chaque repas en progression du défi.
 * Pour un défi de durée, le temps écoulé et la qualité comportementale restent séparés.
 */
export function bilanSatieteJour(repas = []) {
  const observations = repas.reduce((bilan, repasItem) => {
    const valeur = repasItem['satiété_respectée'] ?? repasItem.satiete;
    if (estOui(valeur)) {
      bilan.observables += 1;
      bilan.respectes += 1;
    } else if (estNon(valeur)) {
      bilan.observables += 1;
      bilan.nonRespectes += 1;
    } else {
      bilan.nonRenseignes += 1;
    }
    return bilan;
  }, { observables: 0, respectes: 0, nonRespectes: 0, nonRenseignes: 0 });

  return {
    ...observations,
    tauxRespect: observations.observables > 0
      ? Math.round((observations.respectes / observations.observables) * 100)
      : null,
    observable: observations.observables > 0
  };
}

export function bilanSatietePeriode(repas = []) {
  const parJour = repas.reduce((acc, repasItem) => {
    if (!repasItem?.date) return acc;
    if (!acc[repasItem.date]) acc[repasItem.date] = [];
    acc[repasItem.date].push(repasItem);
    return acc;
  }, {});

  const jours = Object.entries(parJour).map(([date, repasJour]) => ({
    date,
    ...bilanSatieteJour(repasJour)
  }));

  const totaux = jours.reduce((acc, jour) => {
    acc.observables += jour.observables;
    acc.respectes += jour.respectes;
    acc.nonRespectes += jour.nonRespectes;
    acc.nonRenseignes += jour.nonRenseignes;
    if (jour.observable) acc.joursObservables += 1;
    return acc;
  }, { observables: 0, respectes: 0, nonRespectes: 0, nonRenseignes: 0, joursObservables: 0 });

  return {
    jours,
    ...totaux,
    tauxRespect: totaux.observables > 0
      ? Math.round((totaux.respectes / totaux.observables) * 100)
      : null
  };
}

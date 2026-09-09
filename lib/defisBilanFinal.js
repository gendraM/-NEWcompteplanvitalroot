import { bilanSatietePeriode } from './defisValidationBilan';
import { calculerCycleDuree } from './defisCycleDuree';

export const BILAN_NIVEAU = Object.freeze({
  NON_OBSERVABLE: 'non_observable',
  OBSERVE: 'observe'
});

/**
 * Le bilan décrit ce qui a été observé. Il ne transforme jamais un taux en réussite/échec.
 */
export function construireBilanFinalSatiete(defi, repas = [], maintenant = new Date()) {
  const cycle = calculerCycleDuree(defi, maintenant);
  const debut = cycle.dateDebut;
  const fin = cycle.dateFin;

  const repasPeriode = repas.filter(item => {
    if (!item?.date || !debut || !fin) return false;
    const date = new Date(`${item.date}T12:00:00`);
    return date >= debut && date < fin;
  });

  const bilan = bilanSatietePeriode(repasPeriode);
  const observable = bilan.observables > 0;

  return {
    pret: cycle.termine,
    niveau: observable ? BILAN_NIVEAU.OBSERVE : BILAN_NIVEAU.NON_OBSERVABLE,
    dureeJours: cycle.duree,
    joursObservables: bilan.joursObservables,
    repasObservables: bilan.observables,
    respectes: bilan.respectes,
    nonRespectes: bilan.nonRespectes,
    nonRenseignes: bilan.nonRenseignes,
    tauxRespect: bilan.tauxRespect,
    jours: bilan.jours,
    message: observable
      ? `Sur ${bilan.observables} repas observés, tu as respecté ta satiété ${bilan.respectes} fois${bilan.tauxRespect !== null ? ` (${bilan.tauxRespect} %)` : ''}. Ce bilan est un repère pour mieux comprendre tes sensations, pas une note.`
      : `La période du défi est terminée, mais il n'y a pas assez d'informations pour tirer un bilan sur ta satiété. Aucun échec n'est déduit de données manquantes.`
  };
}

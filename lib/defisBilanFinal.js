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


const normaliserTexte = valeur => String(valeur ?? '').trim().toLowerCase();

function estDejeunerBilan(item) {
  const type = normaliserTexte(item?.type_repas || item?.type);
  return type === 'dejeuner' || type === 'déjeuner' || type === 'midi';
}

function estDessertBilan(item) {
  const texte = [item?.aliment, item?.categorie, item?.note].map(normaliserTexte).filter(Boolean).join(' ');
  return /(^|\s)(dessert|gateau|gâteau|tarte|glace|patisserie|pâtisserie|mousse|brownie|cookie|biscuit|flan|creme dessert|crème dessert)(\s|$)/.test(texte);
}

function extraSemblePlanifieBilan(extra) {
  const texte = [extra?.tag, extra?.contexte, extra?.commentaire].map(normaliserTexte).filter(Boolean).join(' ');
  return /(^|\s)(planifie|planifié|prevu|prévu|programme|programmé|anticipe|anticipé)(\s|$)/.test(texte);
}

function bilanGenerique(defi, maintenant, message, donnees = {}) {
  const cycle = calculerCycleDuree(defi, maintenant);
  return {
    pret: cycle.termine,
    niveau: BILAN_NIVEAU.OBSERVE,
    dureeJours: cycle.duree,
    message,
    ...donnees
  };
}

/**
 * Bilans DURATION : ils décrivent uniquement les faits réellement observables.
 * Les confirmations qui ne sont pas encore persistées ne sont jamais inventées.
 */
export function construireBilanFinalDuree(defi, preuves = {}, maintenant = new Date()) {
  if (!defi?.nom) return null;
  if (defi.nom === '💡 J’écoute mon ventre') return construireBilanFinalSatiete(defi, preuves.repas || [], maintenant);

  const repas = preuves.repas || [];
  const extras = preuves.extras || [];
  const confirmations = preuves.observationsDuree || [];
  const oui = confirmations.filter(item => item.reponse === 'oui').length;
  const non = confirmations.filter(item => item.reponse === 'non').length;
  const incertain = confirmations.filter(item => item.reponse === 'autre').length;
  const resumeConfirmations = confirmations.length
    ? ` Tu as aussi répondu à ${confirmations.length} observation${confirmations.length > 1 ? 's' : ''} : ${oui} oui, ${non} non${incertain ? ` et ${incertain} sans certitude` : ''}.`
    : '';

  if (defi.nom === '🍎 Pas de dessert par automatisme') {
    const dejeuners = repas.filter(estDejeunerBilan);
    const desserts = dejeuners.filter(estDessertBilan);
    return bilanGenerique(
      defi,
      maintenant,
      dejeuners.length
        ? `Sur les déjeuners saisis pendant ce défi, ${desserts.length} comportaient un dessert identifiable. Ce bilan décrit tes saisies ; il ne suppose pas si le dessert était automatique, choisi ou lié à une occasion.${resumeConfirmations}`
        : 'La période est terminée, mais aucun déjeuner exploitable n’est disponible pour décrire ce défi. Rien n’est interprété comme un échec.',
      { observations: dejeuners.length, elementsIdentifies: desserts.length }
    );
  }

  if (defi.nom === '🧀 1 portion ça suffit') {
    return bilanGenerique(
      defi,
      maintenant,
      repas.length
        ? `${repas.length} lignes de repas ont été disponibles pendant le défi. Les quantités saisies ne permettent pas, à elles seules, de conclure combien de portions ont réellement été prises. Le bilan reste donc descriptif.${resumeConfirmations}`
        : 'Aucune donnée de repas exploitable n’est disponible pour cette période. Aucun échec n’est déduit.',
      { observations: repas.length }
    );
  }

  if (defi.nom === '🚫 Le faux allié') {
    return bilanGenerique(
      defi,
      maintenant,
      extras.length
        ? `${extras.length} extra${extras.length > 1 ? 's ont' : ' a'} été saisi${extras.length > 1 ? 's' : ''} pendant la période. Leur présence ne permet pas de conclure qu’il s’agissait d’une compensation : cette intention n’est jamais déduite automatiquement.${resumeConfirmations}`
        : 'Aucun extra n’est enregistré sur la période. Cela ne permet pas, à lui seul, de conclure sur le mécanisme de compensation.',
      { observations: extras.length }
    );
  }

  if (defi.nom === '🔄 Je brise la chaîne') {
    return bilanGenerique(
      defi,
      maintenant,
      repas.length || extras.length
        ? 'Tes repas et extras de la période ont été relus pour repérer d’éventuels enchaînements. Les confirmations enregistrées sont relues sans transformer une proximité alimentaire en intention ou en échec.' + resumeConfirmations
        : 'Il n’y a pas assez de saisies pour décrire d’éventuels enchaînements sur cette période. Aucun échec n’est déduit.',
      { observations: repas.length + extras.length }
    );
  }

  if (defi.nom === '✨ Je me programme du plaisir') {
    const planifies = extras.filter(extraSemblePlanifieBilan);
    return bilanGenerique(
      defi,
      maintenant,
      planifies.length
        ? `${planifies.length} extra${planifies.length > 1 ? 's consommés comportent' : ' consommé comporte'} une indication explicite de planification. Un changement de programme n’est pas considéré comme un échec.${resumeConfirmations}`
        : extras.length
          ? 'Des extras ont été saisis, mais les données conservées ne permettent pas de confirmer qu’ils avaient été planifiés. Le bilan ne l’infère pas.'
          : 'Aucun extra consommé n’est visible sur la semaine. Cela ne permet pas de savoir si un plaisir avait été planifié puis modifié ou non réalisé.',
      { observations: extras.length, elementsIdentifies: planifies.length }
    );
  }

  if (defi.nom === '💧 1 cru par jour') {
    return bilanGenerique(
      defi,
      maintenant,
      repas.length
        ? 'Des repas ont été saisis pendant la période, mais les données actuelles ne permettent pas de prouver de façon fiable qu’un aliment était à la fois cru et non sucré. Le bilan reste volontairement prudent.' + resumeConfirmations
        : 'Aucun repas exploitable n’est disponible sur la période. Aucun échec n’est déduit.',
      { observations: repas.length }
    );
  }

  return null;
}

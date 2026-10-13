import { ACTIONS_POINT_AJUSTEMENT_AUTORISEES, estActionPointAjustementAutorisee } from './pointAjustementAlimentaire';

const LIMITES = Object.freeze({
  occurrences: 20,
  notesParOccurrence: 3,
  caracteresNote: 350,
  valeursSures: 3,
  caracteresTexte: 700
});

function texteLimite(valeur, limite) {
  return String(valeur ?? '').trim().slice(0, limite);
}

function listeTextes(valeurs, maximum = 10, limite = 120) {
  if (!Array.isArray(valeurs)) return [];
  return valeurs.map(valeur => texteLimite(valeur, limite)).filter(Boolean).slice(0, maximum);
}

function nombreConnu(valeur) {
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
}

function copierComposition(composition) {
  if (!Array.isArray(composition)) return [];
  return composition.slice(0, 12).map(ligne => ({
    aliment: texteLimite(ligne?.aliment, 120),
    categorie: texteLimite(ligne?.categorie, 80) || null,
    quantite: texteLimite(ligne?.quantite, 80) || null,
    kcal: nombreConnu(ligne?.kcal),
    qn: nombreConnu(ligne?.qn)
  })).filter(ligne => ligne.aliment);
}

export function construireContextePointAjustement(analyse = {}, valeursSures = []) {
  const occurrences = Array.isArray(analyse?.occurrencesObservees)
    ? analyse.occurrencesObservees.slice(0, LIMITES.occurrences)
    : [];

  return {
    fenetre: analyse?.fenetre?.observation || null,
    occurrences: occurrences.map(occurrence => ({
      id: texteLimite(occurrence?.occurrenceId, 120),
      date: texteLimite(occurrence?.date, 10),
      type: texteLimite(occurrence?.type, 60),
      composition: copierComposition(occurrence?.composition),
      kcalTotal: nombreConnu(occurrence?.kcalTotal),
      heures: listeTextes(occurrence?.heures, 3, 10),
      contextesUtilisateur: listeTextes(occurrence?.contextesUtilisateur, 3, 180),
      notesUtilisateur: listeTextes(
        occurrence?.notesUtilisateur,
        LIMITES.notesParOccurrence,
        LIMITES.caracteresNote
      ),
      detailsSignaux: listeTextes(occurrence?.detailsSignaux, 8, 120),
      signauxPositifs: listeTextes(occurrence?.signauxPositifs, 8, 80),
      signauxVigilance: listeTextes(occurrence?.signauxVigilance, 8, 80)
    })).filter(occurrence => occurrence.id && occurrence.date),
    elementsPositifs: (Array.isArray(analyse?.elementsPositifs) ? analyse.elementsPositifs : []).map(element => ({
      type: texteLimite(element?.type, 60),
      signal: texteLimite(element?.signal, 80),
      occurrencesComparables: Number(element?.occurrencesComparables) || 0,
      occurrencesAvecSignal: Number(element?.occurrencesAvecSignal) || 0,
      occurrenceIds: listeTextes(element?.occurrenceIds, 20, 120)
    })),
    vigilances: (Array.isArray(analyse?.vigilances) ? analyse.vigilances : []).map(vigilance => ({
      type: texteLimite(vigilance?.type, 60),
      signal: texteLimite(vigilance?.signal, 80),
      occurrencesComparables: Number(vigilance?.occurrencesComparables) || 0,
      occurrencesAvecSignal: Number(vigilance?.occurrencesAvecSignal) || 0,
      occurrenceIds: listeTextes(vigilance?.occurrenceIds, 20, 120),
      formulation: 'association_repetee_non_causale'
    })),
    valeursSures: (Array.isArray(valeursSures) ? valeursSures : []).slice(0, LIMITES.valeursSures).map(valeurSure => ({
      cle: texteLimite(valeurSure?.cleComposition, 500),
      nombreOccurrences: Number(valeurSure?.nombreOccurrences) || 0,
      nombreResultatsPositifs: Number(valeurSure?.nombreResultatsPositifs) || 0,
      composition: copierComposition(valeurSure?.composition),
      kcalTotal: nombreConnu(valeurSure?.kcalTotal)
    })).filter(valeurSure => valeurSure.cle && valeurSure.composition.length >= 2),
    actionsAutorisees: Object.values(ACTIONS_POINT_AJUSTEMENT_AUTORISEES)
  };
}

function lireObjetJson(valeur) {
  if (valeur && typeof valeur === 'object' && !Array.isArray(valeur)) return valeur;
  const nettoye = String(valeur || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(nettoye);
}

function validerBloc(bloc, idsAutorises, minimumPreuves = 2) {
  if (!bloc || typeof bloc !== 'object') return null;
  const texte = texteLimite(bloc.texte, LIMITES.caracteresTexte);
  const occurrenceIds = listeTextes(bloc.occurrenceIds, 20, 120)
    .filter(id => idsAutorises.has(id));
  const idsUniques = [...new Set(occurrenceIds)];
  if (!texte || idsUniques.length < minimumPreuves) return null;
  return { texte, occurrenceIds: idsUniques };
}

export function validerReponsePointAjustementIA(reponse, contexte = {}) {
  let objet;
  try {
    objet = lireObjetJson(reponse);
  } catch {
    return null;
  }

  const occurrences = Array.isArray(contexte?.occurrences) ? contexte.occurrences : [];
  const idsNotes = new Set(
    occurrences.filter(occurrence => occurrence.notesUtilisateur?.length).map(occurrence => occurrence.id)
  );
  const idsPositifs = new Set(
    (contexte?.elementsPositifs || []).flatMap(element => element.occurrenceIds || [])
  );
  const idsVigilance = new Set(
    (contexte?.vigilances || []).flatMap(vigilance => vigilance.occurrenceIds || [])
  );
  const idsAttention = new Set([...idsVigilance, ...idsNotes]);
  const idsPreuves = new Set([...idsPositifs, ...idsAttention]);
  const valeursSures = Array.isArray(contexte?.valeursSures) ? contexte.valeursSures : [];
  const ceQuiFonctionne = validerBloc(objet?.ceQuiFonctionne, idsPositifs);
  const pointAttention = validerBloc(objet?.pointAttention, idsAttention);

  let proposition = null;
  if (objet?.proposition && typeof objet.proposition === 'object') {
    const texte = texteLimite(objet.proposition.texte, LIMITES.caracteresTexte);
    const action = texteLimite(objet.proposition.action, 80);
    const occurrenceIds = listeTextes(objet.proposition.occurrenceIds, 20, 120)
      .filter(id => idsPreuves.has(id));
    const idsUniques = [...new Set(occurrenceIds)];
    const valeurSureCle = texteLimite(objet.proposition.valeurSureCle, 500) || null;
    const valeurSure = valeurSureCle
      ? valeursSures.find(candidat => candidat.cle === valeurSureCle) || null
      : null;
    const actionValeurSureValide = action !== ACTIONS_POINT_AJUSTEMENT_AUTORISEES.UTILISER_VALEUR_SURE || valeurSure;

    if (
      texte
      && estActionPointAjustementAutorisee(action)
      && action !== ACTIONS_POINT_AJUSTEMENT_AUTORISEES.AUCUNE_ACTION
      && actionValeurSureValide
      && idsUniques.length >= 2
    ) {
      proposition = {
        texte,
        action,
        occurrenceIds: idsUniques,
        valeurSure
      };
    }
  }

  if (!ceQuiFonctionne && !pointAttention && !proposition) return null;
  return { ceQuiFonctionne, pointAttention, proposition };
}

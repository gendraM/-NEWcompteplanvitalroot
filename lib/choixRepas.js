const SOURCES_CHOIX_REPAS = Object.freeze({
  REPAS_COMPOSE: 'repas_compose',
  VALEUR_SURE: 'valeur_sure',
  PLANNING: 'planning',
  IA: 'ia'
});

export const ACTIONS_CHOIX_REPAS = Object.freeze({
  PREPARER: 'preparer',
  PLANIFIER: 'planifier',
  MODIFIER: 'modifier',
  ENREGISTRER: 'enregistrer'
});

function texte(valeur) {
  return String(valeur ?? '').trim();
}

function nombrePositifOuNull(valeur) {
  if (valeur === null || valeur === undefined || texte(valeur) === '') return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) && nombre > 0 ? nombre : null;
}

function normaliserComposition(composition = []) {
  return (Array.isArray(composition) ? composition : [])
    .map((item, index) => ({
      id: item?.id || `choix-${index + 1}`,
      nom: texte(item?.nom || item?.aliment),
      categorie: texte(item?.categorie) || null,
      quantite: item?.quantite ?? item?.quantite_valeur ?? null,
      unite: texte(item?.unite || item?.quantite_unite) || null,
      kcal: item?.kcal === null || item?.kcal === undefined || texte(item?.kcal) === ''
        ? null
        : Number(item.kcal),
      qn: item?.qn === null || item?.qn === undefined || texte(item?.qn) === ''
        ? null
        : Number(item.qn)
    }))
    .filter(item => item.nom);
}

function construireChoix({
  source,
  sourceId = null,
  titre,
  composition,
  preparation = null,
  dureeMinutes = null,
  difficulte = null,
  observation = null,
  actions = [ACTIONS_CHOIX_REPAS.PREPARER, ACTIONS_CHOIX_REPAS.PLANIFIER]
}) {
  return {
    source,
    sourceId: sourceId || null,
    titre: texte(titre) || 'Repas sans nom',
    composition: normaliserComposition(composition),
    preparation: texte(preparation) || null,
    dureeMinutes: nombrePositifOuNull(dureeMinutes),
    difficulte: texte(difficulte) || null,
    observation: texte(observation) || null,
    actions: Array.from(new Set(actions.filter(Boolean)))
  };
}

export function choixDepuisRepasCompose(repas = {}) {
  return construireChoix({
    source: SOURCES_CHOIX_REPAS.REPAS_COMPOSE,
    sourceId: repas.id,
    titre: repas.nom,
    composition: repas.composition,
    preparation: repas.preparation,
    dureeMinutes: repas.dureeMinutes ?? repas.duree_minutes,
    difficulte: repas.difficulte,
    actions: [
      ACTIONS_CHOIX_REPAS.PREPARER,
      ACTIONS_CHOIX_REPAS.PLANIFIER,
      ACTIONS_CHOIX_REPAS.MODIFIER
    ]
  });
}

export function choixDepuisValeurSure(repere = {}) {
  const composition = (repere.composition || []).map(item => ({
    ...item,
    nom: item.nom || item.aliment
  }));
  return construireChoix({
    source: SOURCES_CHOIX_REPAS.VALEUR_SURE,
    sourceId: repere.cleComposition,
    titre: repere.nom || composition.map(item => item.nom).filter(Boolean).join(' + '),
    composition,
    observation: repere.raison,
    actions: [ACTIONS_CHOIX_REPAS.PREPARER, ACTIONS_CHOIX_REPAS.PLANIFIER]
  });
}

export function choixDepuisRepasPlanifie(repas = {}) {
  const lignes = Array.isArray(repas) ? repas : (repas.lignes || repas.composition || [repas]);
  const premiere = lignes[0] || {};
  const composition = lignes.map(item => ({
    id: item.id,
    nom: item.nom || item.aliment,
    categorie: item.categorie,
    quantite: item.quantite,
    unite: item.unite,
    kcal: item.kcal,
    qn: item.qn
  }));
  return construireChoix({
    source: SOURCES_CHOIX_REPAS.PLANNING,
    sourceId: repas.id || premiere.id || null,
    titre: repas.nom || composition.map(item => item.nom).filter(Boolean).join(' + '),
    composition,
    actions: [ACTIONS_CHOIX_REPAS.PREPARER]
  });
}

export function normaliserContexteChoixRepas(contexte = {}) {
  const origines = new Set(['volontaire', 'suivi', 'planning']);
  return {
    origine: origines.has(contexte.origine) ? contexte.origine : 'volontaire',
    dateCible: texte(contexte.dateCible) || null,
    typeRepasCible: texte(contexte.typeRepasCible) || null,
    contrainteTempsMinutes: nombrePositifOuNull(contexte.contrainteTempsMinutes),
    repasNonPlanifie: contexte.repasNonPlanifie === true,
    intention: texte(contexte.intention) || null
  };
}

export { SOURCES_CHOIX_REPAS };

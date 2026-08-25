export const CONTEXTE_LISTE_GENERAL = Object.freeze({
  type: 'plan_general',
  parcours_id: null,
  criteres_actifs: [],
  aliments_triggers: [],
  objectif_qn: null
});

function valeursUniques(valeurs) {
  if (!Array.isArray(valeurs)) return [];
  return Array.from(new Set(valeurs.filter(valeur => valeur !== null && valeur !== undefined && valeur !== '')));
}

function criteresActifs(criteres) {
  if (Array.isArray(criteres)) return criteres;
  if (!criteres || typeof criteres !== 'object') return [];
  if (Array.isArray(criteres.criteres)) return criteres.criteres;
  return Object.entries(criteres)
    .filter(([, valeur]) => valeur === true || (valeur && typeof valeur === 'object' && valeur.actif !== false))
    .map(([id, valeur]) => (valeur && typeof valeur === 'object' ? { id, ...valeur } : id));
}

function alimentsDeclencheurs(bilan) {
  if (!bilan || typeof bilan !== 'object') return [];
  const candidats = [
    bilan.aliments_triggers,
    bilan.aliments_declencheurs,
    bilan.alimentsDeclencheurs,
    bilan.triggers?.aliments
  ];
  return valeursUniques(candidats.find(Array.isArray) || []);
}

export function construireContexteCristallisation(parcours) {
  return {
    type: 'cristallisation',
    parcours_id: parcours?.id || null,
    criteres_actifs: criteresActifs(parcours?.criteres_personnalises),
    aliments_triggers: alimentsDeclencheurs(parcours?.bilan_reprise),
    // Le QN cible n'est pas défini de façon fiable dans le parcours actuel.
    // Le champ est préparé, mais aucune valeur n'est inventée.
    objectif_qn: null
  };
}

export function estContexteCristallisation(contexte) {
  return contexte?.type === 'cristallisation';
}

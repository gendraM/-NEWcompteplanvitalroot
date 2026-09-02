function normaliserLibelle(valeur = '') {
  return String(valeur)
    .trim()
    .toLocaleLowerCase('fr')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export const STATUTS_ALIGNEMENT_REPAS = Object.freeze({
  ALIGNE: 'aligne',
  AJUSTE: 'ajuste',
  SPONTANE: 'spontane',
  LIBRE: 'libre',
  EN_ATTENTE: 'en_attente'
});

export const LIBELLES_ALIGNEMENT_REPAS = Object.freeze({
  [STATUTS_ALIGNEMENT_REPAS.ALIGNE]: 'Repas aligné',
  [STATUTS_ALIGNEMENT_REPAS.AJUSTE]: 'Repas ajusté',
  [STATUTS_ALIGNEMENT_REPAS.SPONTANE]: 'Repas spontané',
  [STATUTS_ALIGNEMENT_REPAS.LIBRE]: 'Repas libre'
});

function trouverCorrespondance(lignePlanifiee, lignesReelles, utilisees, mode) {
  const valeurPlanifiee = normaliserLibelle(
    mode === 'aliment' ? lignePlanifiee?.aliment : lignePlanifiee?.categorie
  );
  if (!valeurPlanifiee) return -1;

  return lignesReelles.findIndex((ligneReelle, index) => {
    if (utilisees.has(index)) return false;
    const valeurReelle = normaliserLibelle(
      mode === 'aliment' ? ligneReelle?.aliment : ligneReelle?.categorie
    );
    return valeurReelle === valeurPlanifiee;
  });
}

export function classifierAlignementRepas(lignesPlanifiees = [], lignesReelles = []) {
  const plan = Array.isArray(lignesPlanifiees) ? lignesPlanifiees.filter(Boolean) : [];
  const reel = Array.isArray(lignesReelles) ? lignesReelles.filter(Boolean) : [];

  if (plan.length === 0) {
    return {
      statut: reel.length > 0 ? STATUTS_ALIGNEMENT_REPAS.LIBRE : STATUTS_ALIGNEMENT_REPAS.EN_ATTENTE,
      correspondances: 0,
      lignesPlanifiees: 0,
      lignesReelles: reel.length
    };
  }

  if (reel.length === 0) {
    return {
      statut: STATUTS_ALIGNEMENT_REPAS.EN_ATTENTE,
      correspondances: 0,
      lignesPlanifiees: plan.length,
      lignesReelles: 0
    };
  }

  if (reel.some(ligne => ligne?.repas_planifie_respecte === true)) {
    return {
      statut: STATUTS_ALIGNEMENT_REPAS.ALIGNE,
      correspondances: plan.length,
      lignesPlanifiees: plan.length,
      lignesReelles: reel.length,
      source: 'confirmation_existante'
    };
  }

  const utilisees = new Set();
  const planCorrespondant = new Set();

  // Le nom exact est prioritaire afin qu'une catégorie large ne consomme pas
  // une ligne qui correspond précisément à un autre aliment planifié.
  plan.forEach((lignePlanifiee, indexPlan) => {
    const indexReel = trouverCorrespondance(lignePlanifiee, reel, utilisees, 'aliment');
    if (indexReel >= 0) {
      utilisees.add(indexReel);
      planCorrespondant.add(indexPlan);
    }
  });

  // Une substitution de même catégorie conserve l'intention du repas.
  plan.forEach((lignePlanifiee, indexPlan) => {
    if (planCorrespondant.has(indexPlan)) return;
    const indexReel = trouverCorrespondance(lignePlanifiee, reel, utilisees, 'categorie');
    if (indexReel >= 0) {
      utilisees.add(indexReel);
      planCorrespondant.add(indexPlan);
    }
  });

  const correspondances = planCorrespondant.size;
  const statut = correspondances === plan.length
    ? STATUTS_ALIGNEMENT_REPAS.ALIGNE
    : correspondances > 0
      ? STATUTS_ALIGNEMENT_REPAS.AJUSTE
      : STATUTS_ALIGNEMENT_REPAS.SPONTANE;

  return {
    statut,
    correspondances,
    lignesPlanifiees: plan.length,
    lignesReelles: reel.length,
    source: 'comparaison_automatique'
  };
}

export function regrouperRepasReelsParOccurrence(repasReels = [], { date, type } = {}) {
  const groupes = new Map();

  (Array.isArray(repasReels) ? repasReels : []).forEach((ligne, index) => {
    if (!ligne || (date && ligne.date !== date) || (type && ligne.type !== type)) return;
    const cle = ligne.occurrence_repas_id || `historique:${ligne.id || index}`;
    if (!groupes.has(cle)) groupes.set(cle, { cle, lignes: [], ordre: index, dateCreation: '' });
    const groupe = groupes.get(cle);
    groupe.lignes.push(ligne);
    groupe.ordre = Math.max(groupe.ordre, index);
    if (ligne.created_at && String(ligne.created_at) > groupe.dateCreation) {
      groupe.dateCreation = String(ligne.created_at);
    }
  });

  return Array.from(groupes.values());
}

export function obtenirDerniereOccurrenceRepas(repasReels = [], contexte = {}) {
  const groupes = regrouperRepasReelsParOccurrence(repasReels, contexte);
  if (groupes.length === 0) return [];

  return groupes.reduce((derniere, groupe) => {
    if (!derniere) return groupe;
    if (groupe.dateCreation && derniere.dateCreation) {
      return groupe.dateCreation > derniere.dateCreation ? groupe : derniere;
    }
    if (groupe.dateCreation && !derniere.dateCreation) return groupe;
    if (!groupe.dateCreation && derniere.dateCreation) return derniere;
    return groupe.ordre > derniere.ordre ? groupe : derniere;
  }, null).lignes;
}

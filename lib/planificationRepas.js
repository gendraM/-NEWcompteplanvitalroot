import {
  calculerCaloriesAliment,
  extraireQuantiteReference,
  normaliserUnite
} from './socleQuantitesCalories';

function nombreFini(valeur) {
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return null;
  const nombre = Number(String(valeur).trim().replace(',', '.'));
  return Number.isFinite(nombre) ? nombre : null;
}

export function trouverAlimentReferentiel(referentiel = [], nom = '') {
  const nomNormalise = String(nom).trim().toLocaleLowerCase('fr');
  return referentiel.find(aliment =>
    String(aliment?.nom || '').trim().toLocaleLowerCase('fr') === nomNormalise
  ) || null;
}

export function obtenirSaisieParDefaut(aliment) {
  if (!aliment) return { quantite: '', unite: '', kcal: null };

  const unite = normaliserUnite(aliment.unite) || String(aliment.unite || '').trim();
  const reference = extraireQuantiteReference(aliment.portionDefaut, unite);
  const quantite = reference?.valeur ?? aliment.quantite ?? '';
  const resultat = calculerCaloriesAliment(aliment, aliment.portionDefaut || quantite, unite);

  return {
    quantite: quantite === null || quantite === undefined ? '' : String(quantite),
    unite,
    kcal: resultat.statut === 'ok' ? resultat.kcal : null
  };
}

export function serialiserQuantitePlanifiee(quantite, unite) {
  const quantiteTexte = String(quantite ?? '').trim();
  if (!String(unite || '').trim()) {
    const mesureComplete = quantiteTexte.match(/^([0-9]+(?:[.,][0-9]+)?)\s+(.+)$/);
    if (mesureComplete) {
      return serialiserQuantitePlanifiee(mesureComplete[1], mesureComplete[2]);
    }
  }
  const valeur = nombreFini(quantite);
  const uniteNormalisee = normaliserUnite(unite) || String(unite || '').trim();
  if (valeur === null || valeur <= 0 || !uniteNormalisee) return null;
  return `${valeur} ${uniteNormalisee}`;
}

export function calculerKcalPlanifiees(aliment, quantite, unite, kcalCorrigees = null) {
  const correction = nombreFini(kcalCorrigees);
  if (correction !== null && correction >= 0) {
    return { kcal: Math.round(correction), statut: 'ok', source: 'correction_utilisateur' };
  }
  return calculerCaloriesAliment(aliment, quantite, unite);
}

export function normaliserRepasPlanifie(repas, referentiel = []) {
  const aliment = trouverAlimentReferentiel(referentiel, repas?.aliment);
  const kcalEnregistrees = nombreFini(repas?.kcal);
  let kcal = kcalEnregistrees === null ? null : Math.round(kcalEnregistrees);

  if (kcal === null && repas?.quantite && aliment) {
    const calculees = calculerCaloriesAliment(aliment, repas.quantite, aliment.unite);
    if (calculees.statut === 'ok') kcal = calculees.kcal;
  }

  return {
    ...repas,
    quantite_affichee: repas?.quantite ? String(repas.quantite) : null,
    kcal_calculees: kcal,
    donnees_completes: Boolean(repas?.quantite) && kcal !== null
  };
}

export function calculerTotauxPlanning(planning = {}, referentiel = []) {
  return Object.fromEntries(Object.entries(planning).map(([date, repasDuJour]) => {
    const repas = (repasDuJour || []).map(item => normaliserRepasPlanifie(item, referentiel));
    const parType = repas.reduce((totaux, item) => {
      if (item.kcal_calculees === null) return totaux;
      totaux[item.type] = (totaux[item.type] || 0) + item.kcal_calculees;
      return totaux;
    }, {});
    const elementsComplets = repas.filter(item => item.kcal_calculees !== null).length;

    return [date, {
      parType,
      totalJour: Object.values(parType).reduce((total, kcal) => total + kcal, 0),
      elementsComplets,
      elementsTotal: repas.length,
      complet: repas.length > 0 && elementsComplets === repas.length
    }];
  }));
}

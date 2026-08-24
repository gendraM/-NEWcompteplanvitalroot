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
  const nomNormalise = normaliserNomAliment(nom);
  return referentiel.find(aliment =>
    normaliserNomAliment(aliment?.nom) === nomNormalise
  ) || null;
}

export function normaliserNomAliment(nom = '') {
  return String(nom)
    .trim()
    .toLocaleLowerCase('fr')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function rechercherAlimentsReferentiel(referentiel = [], recherche = '', limite = 20) {
  const rechercheNormalisee = normaliserNomAliment(recherche);
  if (!rechercheNormalisee) return [];

  return referentiel
    .filter(aliment => normaliserNomAliment(aliment?.nom).includes(rechercheNormalisee))
    .sort((a, b) => {
      const nomA = normaliserNomAliment(a?.nom);
      const nomB = normaliserNomAliment(b?.nom);
      const scoreA = nomA === rechercheNormalisee ? 0 : nomA.startsWith(rechercheNormalisee) ? 1 : 2;
      const scoreB = nomB === rechercheNormalisee ? 0 : nomB.startsWith(rechercheNormalisee) ? 1 : 2;
      return scoreA - scoreB || nomA.localeCompare(nomB, 'fr');
    })
    .slice(0, limite);
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

export function extraireQuantitePlanifiee(quantite) {
  const texte = String(quantite ?? '').trim();
  const correspondance = texte.match(/^([0-9]+(?:[.,][0-9]+)?)\s+(.+)$/);
  if (!correspondance) return { quantite: null, unite: '' };
  return {
    quantite: nombreFini(correspondance[1]),
    unite: normaliserUnite(correspondance[2]) || correspondance[2].trim()
  };
}

export function calculerKcalPlanifiees(aliment, quantite, unite, kcalCorrigees = null) {
  const correction = nombreFini(kcalCorrigees);
  if (correction !== null && correction >= 0) {
    return { kcal: Math.round(correction), statut: 'ok', source: 'correction_utilisateur' };
  }
  return calculerCaloriesAliment(aliment, quantite, unite);
}

export function construireComposantAssiette(aliment, quantite, unite = null, id = null) {
  if (!aliment) return { composant: null, erreur: 'Sélectionne un aliment du référentiel.' };
  const uniteRetenue = unite || obtenirSaisieParDefaut(aliment).unite;
  const quantiteEnregistree = serialiserQuantitePlanifiee(quantite, uniteRetenue);
  const calories = calculerKcalPlanifiees(aliment, quantite, uniteRetenue);
  if (!quantiteEnregistree || calories.statut !== 'ok') {
    return { composant: null, erreur: calories.message || 'La portion de cet aliment est incomplète.' };
  }

  return {
    erreur: null,
    composant: {
      id: id || `${normaliserNomAliment(aliment.nom)}-${Date.now()}`,
      nom: aliment.nom,
      categorie: aliment.categorie || '',
      quantite: Number(String(quantite).replace(',', '.')),
      unite: uniteRetenue,
      kcal: calories.kcal,
      qn: Number.isFinite(Number(aliment.qn)) ? Number(aliment.qn) : null
    }
  };
}

export function construireAjoutSuggestion(referentiel = [], suggestion = {}, assiette = []) {
  const nomSuggestion = suggestion?.aliment || suggestion?.nom || '';
  const aliment = trouverAlimentReferentiel(referentiel, nomSuggestion);
  if (!aliment) {
    return { erreur: `La suggestion « ${nomSuggestion || 'inconnue'} » n’existe pas dans le référentiel.`, composant: null };
  }
  if (assiette.some(item => normaliserNomAliment(item.nom) === normaliserNomAliment(aliment.nom))) {
    return { erreur: `${aliment.nom} est déjà dans ce repas.`, composant: null };
  }
  const valeurs = obtenirSaisieParDefaut(aliment);
  return construireComposantAssiette(aliment, valeurs.quantite, valeurs.unite);
}

export function construireOccurrencesAssiette(composition = [], { userId, date, type } = {}) {
  if (!userId || !date || !type || !composition.length) return [];
  const comboValide = composition.length > 1;
  return composition.map(composant => ({
    user_id: userId,
    date,
    type,
    aliment: composant.nom,
    categorie: composant.categorie || '',
    quantite: serialiserQuantitePlanifiee(composant.quantite, composant.unite),
    kcal: Number.isFinite(Number(composant.kcal)) ? Math.round(Number(composant.kcal)) : null,
    combo_valide: comboValide
  })).filter(item => item.quantite && item.kcal !== null);
}

export async function enregistrerAssiettePlanifiee(supabase, composition = [], contexte = {}) {
  if (!supabase?.from) return { data: null, error: new Error('Connexion Supabase indisponible.') };
  const occurrences = construireOccurrencesAssiette(composition, contexte);
  if (!occurrences.length || occurrences.length !== composition.length) {
    return { data: null, error: new Error('Le repas contient une donnée incomplète.') };
  }
  return supabase.from('repas_planifies').insert(occurrences).select('*');
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

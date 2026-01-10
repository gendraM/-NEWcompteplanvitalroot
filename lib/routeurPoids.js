/**
 * ROUTEUR POIDS - Calculs métaboliques personnalisés
 * Phase 0 : Infrastructure
 * Date : 10 janvier 2026
 * 
 * Fonctions :
 * - calculerBMR : Métabolisme de base (formule Mifflin-St Jeor)
 * - calculerTDEE : Dépense énergétique totale quotidienne
 * - calculerBudgetExtras : Budget hebdomadaire extras en kcal
 */

/**
 * Calcule le BMR (Basal Metabolic Rate) - Métabolisme de base
 * Formule Mifflin-St Jeor (la plus précise scientifiquement)
 * 
 * @param {string} sexe - 'M' (Homme) ou 'F' (Femme)
 * @param {number} age - Âge en années
 * @param {number} taille_cm - Taille en centimètres
 * @param {number} poids_kg - Poids en kilogrammes
 * @returns {number} BMR en kcal/jour
 */
export function calculerBMR(sexe, age, taille_cm, poids_kg) {
  // Validation des paramètres
  if (!sexe || !age || !taille_cm || !poids_kg) {
    console.error('calculerBMR: Paramètres manquants', { sexe, age, taille_cm, poids_kg });
    return null;
  }

  if (age <= 0 || taille_cm <= 0 || poids_kg <= 0) {
    console.error('calculerBMR: Valeurs invalides', { age, taille_cm, poids_kg });
    return null;
  }

  // Formule Mifflin-St Jeor
  // Femme : (10 × poids) + (6.25 × taille) - (5 × âge) - 161
  // Homme : (10 × poids) + (6.25 × taille) - (5 × âge) + 5
  
  let bmr;
  if (sexe === 'F') {
    bmr = (10 * poids_kg) + (6.25 * taille_cm) - (5 * age) - 161;
  } else if (sexe === 'M') {
    bmr = (10 * poids_kg) + (6.25 * taille_cm) - (5 * age) + 5;
  } else {
    console.error('calculerBMR: Sexe invalide', sexe);
    return null;
  }

  return Math.round(bmr);
}

/**
 * Calcule le TDEE (Total Daily Energy Expenditure)
 * Dépense énergétique totale quotidienne = BMR × coefficient d'activité
 * 
 * @param {number} bmr - Métabolisme de base en kcal/jour
 * @param {string} niveau_activite - 'sedentaire' | 'modere' | 'actif' | 'intense'
 * @returns {number} TDEE en kcal/jour
 */
export function calculerTDEE(bmr, niveau_activite) {
  // Validation
  if (!bmr || bmr <= 0) {
    console.error('calculerTDEE: BMR invalide', bmr);
    return null;
  }

  if (!niveau_activite) {
    console.error('calculerTDEE: Niveau activité manquant');
    return null;
  }

  // Coefficients d'activité (standards scientifiques)
  const coefficients = {
    sedentaire: 1.2,   // Peu ou pas d'exercice
    modere: 1.5,       // Exercice modéré 3-5 jours/semaine
    actif: 1.7,        // Exercice intense 6-7 jours/semaine
    intense: 2.0       // Exercice très intense ou travail physique
  };

  const coefficient = coefficients[niveau_activite];
  
  if (!coefficient) {
    console.error('calculerTDEE: Niveau activité invalide', niveau_activite);
    return null;
  }

  const tdee = bmr * coefficient;
  return Math.round(tdee);
}

/**
 * Calcule le budget extras hebdomadaire en kcal
 * Basé sur l'objectif et le TDEE
 * 
 * @param {string} objectif - 'perte' | 'maintien' | 'prise'
 * @param {number} tdee - Dépense énergétique quotidienne en kcal/jour
 * @returns {number} Budget extras hebdomadaire en kcal
 */
export function calculerBudgetExtras(objectif, tdee) {
  // Validation
  if (!objectif || !tdee || tdee <= 0) {
    console.error('calculerBudgetExtras: Paramètres invalides', { objectif, tdee });
    return null;
  }

  // Logique métier :
  // - Perte de poids : budget restreint (300-500 kcal/semaine)
  // - Maintien : budget modéré (500-700 kcal/semaine)
  // - Prise de masse : budget généreux (700-1000 kcal/semaine)
  
  let budgetHebdo;

  switch (objectif) {
    case 'perte':
      // Budget conservateur pour perte de poids
      // ~10-15% du TDEE hebdomadaire (TDEE × 7 × 0.10)
      budgetHebdo = Math.round(tdee * 7 * 0.10);
      // Plafond min/max
      budgetHebdo = Math.max(300, Math.min(500, budgetHebdo));
      break;

    case 'maintien':
      // Budget modéré pour maintien
      // ~15-20% du TDEE hebdomadaire
      budgetHebdo = Math.round(tdee * 7 * 0.15);
      budgetHebdo = Math.max(500, Math.min(700, budgetHebdo));
      break;

    case 'prise':
      // Budget généreux pour prise de masse
      // ~20-25% du TDEE hebdomadaire
      budgetHebdo = Math.round(tdee * 7 * 0.20);
      budgetHebdo = Math.max(700, Math.min(1000, budgetHebdo));
      break;

    default:
      console.error('calculerBudgetExtras: Objectif invalide', objectif);
      return null;
  }

  return budgetHebdo;
}

/**
 * Calcule tous les indicateurs en une seule fois
 * Fonction utilitaire pour obtenir profil complet
 * 
 * @param {Object} profil - Objet profil utilisateur
 * @returns {Object} Tous les calculs (BMR, TDEE, budget)
 */
export function calculerProfilComplet(profil) {
  const { sexe, age, taille, poids_de_depart, niveau_activite, objectif } = profil;

  // Calcul BMR
  const bmr = calculerBMR(sexe, age, taille, poids_de_depart);
  if (!bmr) return null;

  // Calcul TDEE
  const tdee = calculerTDEE(bmr, niveau_activite);
  if (!tdee) return null;

  // Calcul budget extras
  const budgetExtras = calculerBudgetExtras(objectif, tdee);
  if (!budgetExtras) return null;

  return {
    bmr,
    tdee,
    budgetExtras,
    // Informations complémentaires
    deficit_quotidien_perte: objectif === 'perte' ? Math.round(tdee * 0.20) : 0, // 20% déficit
    apport_calorique_cible: objectif === 'perte' 
      ? Math.round(tdee * 0.80) 
      : tdee,
    disclaimer: "Ces valeurs sont des estimations basées sur des formules scientifiques. Consultez un professionnel pour un suivi personnalisé."
  };
}

/**
 * Vérifie si un profil est complet (tous champs requis pour calculs)
 * 
 * @param {Object} profil - Objet profil utilisateur
 * @returns {boolean} true si profil complet, false sinon
 */
export function estProfilComplet(profil) {
  if (!profil) return false;
  
  const champsRequis = ['sexe', 'age', 'taille', 'poids_de_depart', 'niveau_activite', 'objectif'];
  
  for (const champ of champsRequis) {
    if (!profil[champ]) {
      return false;
    }
  }
  
  return true;
}

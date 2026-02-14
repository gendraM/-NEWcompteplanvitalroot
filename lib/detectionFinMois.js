/**
 * @fileoverview Détection de fin de mois pour déclenchement bilan mensuel
 * @description Vérifie si la validation d'une semaine correspond à la dernière validation du mois
 * @author Compte Plan Vital
 * @date 2026-01-21
 */

/**
 * Détermine si une date de validation hebdomadaire correspond à la dernière validation du mois
 * 
 * LOGIQUE HYBRIDE :
 * - Les semaines sont fixes (lundi-dimanche) pour cohérence validation
 * - La détection vérifie si le lundi suivant est dans un nouveau mois
 * - Exemple : Semaine du 27 janvier (lundi) → lundi suivant = 3 février → DERNIÈRE VALIDATION JANVIER
 * 
 * CAS D'USAGE :
 * - Déclenche pop-up bilan mensuel après validation dernière semaine
 * - Évite affichage pop-up pour semaines "normales" du mois
 * - Gère correctement les chevauchements semaine/mois (ex: 29 jan - 4 fév)
 * 
 * @param {string|Date} dateSemaine - Date de début de semaine (lundi) ou date quelconque de la semaine validée
 * @returns {boolean} true si c'est la dernière validation du mois, false sinon
 * 
 * @example
 * // Semaine du 27 janvier 2026 (dernière semaine qui commence en janvier)
 * estDerniereValidationDuMois('2026-01-27') // true (lundi suivant = 3 février)
 * 
 * @example
 * // Semaine du 20 janvier 2026 (semaine classique)
 * estDerniereValidationDuMois('2026-01-20') // false (lundi suivant = 27 janvier)
 * 
 * @example
 * // Semaine du 23 février 2026 (dernière semaine de février non-bissextile)
 * estDerniereValidationDuMois('2026-02-23') // true (lundi suivant = 2 mars)
 */
export function estDerniereValidationDuMois(dateSemaine) {
  // 🧪 MODE TEST : Décommenter la ligne ci-dessous pour forcer la détection
  // return true;
  
  // Sécurité : Gérer valeurs nulles/undefined
  if (!dateSemaine) {
    console.warn('[detectionFinMois] Date null/undefined fournie, retourne false');
    return false;
  }

  // Conversion en objet Date
  const dateValidation = new Date(dateSemaine);
  
  // Validation : Vérifier date valide
  if (isNaN(dateValidation.getTime())) {
    console.error('[detectionFinMois] Date invalide:', dateSemaine);
    return false;
  }

  // Calculer le lundi de la semaine validée (au cas où dateValidation n'est pas un lundi)
  const lundiCourant = new Date(dateValidation);
  const jourSemaine = lundiCourant.getDay(); // 0 (dimanche) à 6 (samedi)
  const joursDiff = jourSemaine === 0 ? -6 : 1 - jourSemaine; // Si dimanche, reculer de 6 jours
  lundiCourant.setDate(lundiCourant.getDate() + joursDiff);
  
  // Calculer le lundi de la semaine suivante (+7 jours)
  const lundiSuivant = new Date(lundiCourant);
  lundiSuivant.setDate(lundiCourant.getDate() + 7);

  // Récupérer les mois
  const moisCourant = lundiCourant.getMonth(); // 0-11 (janvier-décembre)
  const moisSuivant = lundiSuivant.getMonth();

  // Détection : Si le lundi suivant est dans un mois différent → dernière validation du mois
  const estDerniere = moisCourant !== moisSuivant;

  // Logs debug (à désactiver en production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[detectionFinMois] Analyse:', {
      dateValidation: dateValidation.toISOString().split('T')[0],
      lundiCourant: lundiCourant.toISOString().split('T')[0],
      lundiSuivant: lundiSuivant.toISOString().split('T')[0],
      moisCourant: moisCourant + 1, // Afficher 1-12 pour lisibilité
      moisSuivant: moisSuivant + 1,
      estDerniere
    });
  }

  return estDerniere;
}

/**
 * Récupère le mois et l'année correspondant à la validation
 * 
 * USAGE : Passer ces valeurs à BilanMensuelModal pour requêter les données exactes du mois
 * 
 * @param {string|Date} dateSemaine - Date de la semaine validée
 * @returns {{mois: number, annee: number} | null} Objet {mois: 1-12, annee: YYYY} ou null si date invalide
 * 
 * @example
 * getMoisAnneeValidation('2026-01-27') // { mois: 1, annee: 2026 }
 */
export function getMoisAnneeValidation(dateSemaine) {
  if (!dateSemaine) {
    console.warn('[detectionFinMois] Date null/undefined fournie à getMoisAnneeValidation');
    return null;
  }

  const date = new Date(dateSemaine);
  
  if (isNaN(date.getTime())) {
    console.error('[detectionFinMois] Date invalide dans getMoisAnneeValidation:', dateSemaine);
    return null;
  }

  return {
    mois: date.getMonth() + 1, // Convertir 0-11 en 1-12
    annee: date.getFullYear()
  };
}

/**
 * Vérifie si le mois a assez de données pour générer un bilan pertinent
 * 
 * RÈGLE MÉTIER : Minimum 14 jours de saisies (50% du mois) pour afficher bilan
 * 
 * @param {number} nbJoursSaisis - Nombre de jours avec au moins 1 repas saisi
 * @param {number} nbJoursTotal - Nombre de jours dans le mois (28-31)
 * @returns {boolean} true si assez de données, false sinon
 * 
 * @example
 * aDonneesMinimales(20, 31) // true (20/31 = 64%)
 * aDonneesMinimales(10, 30) // false (10/30 = 33%)
 */
export function aDonneesMinimales(nbJoursSaisis, nbJoursTotal) {
  const seuilMinimal = 14; // Minimum absolu (50% d'un mois de 28 jours)
  const tauxRemplissage = nbJoursSaisis / nbJoursTotal;

  return nbJoursSaisis >= seuilMinimal && tauxRemplissage >= 0.5;
}

/**
 * Calcule la date de début et de fin exacte du mois pour requêtes SQL
 * 
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année (YYYY)
 * @returns {{debut: string, fin: string}} Dates au format 'YYYY-MM-DD'
 * 
 * @example
 * getDatesExactesMois(1, 2026) // { debut: '2026-01-01', fin: '2026-01-31' }
 * getDatesExactesMois(2, 2024) // { debut: '2024-02-01', fin: '2024-02-29' } (bissextile)
 */
export function getDatesExactesMois(mois, annee) {
  // Date de début : 1er jour du mois à 00:00:00
  const debut = new Date(annee, mois - 1, 1);
  
  // Date de fin : Dernier jour du mois à 23:59:59
  // Astuce : jour 0 du mois suivant = dernier jour du mois courant
  const fin = new Date(annee, mois, 0);

  return {
    debut: debut.toISOString().split('T')[0], // Format YYYY-MM-DD
    fin: fin.toISOString().split('T')[0]
  };
}

/**
 * Vérifie si l'utilisateur a déjà validé le bilan mensuel
 * 
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année (YYYY)
 * @param {string} userId - ID utilisateur Supabase
 * @returns {Promise<boolean>} true si bilan déjà validé, false sinon
 */
export async function bilanMensuelDejaValide(mois, annee, userId) {
  if (!userId) {
    console.error('[detectionFinMois] userId manquant dans bilanMensuelDejaValide');
    return false;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('bilans_mensuels')
      .select('id')
      .eq('user_id', userId)
      .eq('mois', mois)
      .eq('annee', annee)
      .eq('valide', true)
      .limit(1);

    if (error) {
      console.error('[detectionFinMois] Erreur vérification bilan validé:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('[detectionFinMois] Exception vérification bilan:', err);
    return false;
  }
}

/**
 * Calcule le jour relatif entre la date du jeûne et la date courante
 * @param {Date|string} dateJeune - Date du jeûne (objet Date ou string ISO)
 * @param {Date|string} dateCourante - Date courante (objet Date ou string ISO)
 * @returns {number} - Nombre de jours entre dateJeune et dateCourante (J-xx)
 */
export function calculerJourRelatif(dateJeune, dateCourante) {
  if (!dateJeune || !dateCourante) return null;
  const dJeune = typeof dateJeune === 'string' ? new Date(dateJeune) : dateJeune;
  const dCourante = typeof dateCourante === 'string' ? new Date(dateCourante) : dateCourante;
  // Calcul en jours, arrondi à l'entier inférieur
  return Math.floor((dJeune.setHours(0,0,0,0) - dCourante.setHours(0,0,0,0)) / (1000*60*60*24));
}
// Fonction utilitaire centralisée pour la validation d’un critère de préparation
// Respect strict du template : aucune logique métier dans les pages, traçabilité, audit

/**
 * Valide un critère de préparation et met à jour le localStorage
 * @param {string} id - Identifiant du critère
 * @param {string} dateValidation - Date de validation (ISO ou locale)
 * @returns {object} - Nouvel état des critères après mise à jour
 */
export function validerCriterePreparation(id, dateValidation) {
  if (!id || !dateValidation) {
    throw new Error('id et dateValidation sont requis');
  }
  // Clé partagée pour le stockage des critères
  const STORAGE_KEY = 'preparationJeuneCriteres';
  // Récupérer l’état actuel
  let criteres = {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    criteres = data ? JSON.parse(data) : {};
  } catch (e) {
    criteres = {};
  }
  // Mettre à jour le critère
  criteres[id] = {
    validé: true,
    dateValidation,
  };
  // Sauvegarder l’état mis à jour
  localStorage.setItem(STORAGE_KEY, JSON.stringify(criteres));
  return criteres;
}

/**
 * Récupère l’état actuel des critères de préparation
 * @returns {object}
 */
export function getCriteresPreparation() {
  const STORAGE_KEY = 'preparationJeuneCriteres';
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Retourne la fenêtre de validation (date limite) pour un jalon donné
 * Règles métier :
 * - J-30 validable jusqu'à J-18 (fenêtre de 12 jours)
 * - J-17, J-14, J-12 validables jusqu'à J-8
 * - J-7 validable jusqu'à J-0 (jour du jeûne)
 * @param {number} jalon - Le jalon (jour) du critère (ex: -30, -17, -7)
 * @returns {number} - La date limite de validation (ex: -18 pour J-30)
 */
export function getFenetreValidation(jalon) {
  if (jalon === -30) return -18;  // J-30 validable jusqu'à J-18
  if ([-17, -14, -12].includes(jalon)) return -8;  // J-17/14/12 validables jusqu'à J-8
  if (jalon === -7) return 0;  // J-7 validable jusqu'à J-0
  return jalon;  // Par défaut, pas de fenêtre étendue
}

/**
 * Retourne le statut d'un critère selon le jour courant et son jalon
 * @param {object} critere - Objet critère avec propriété jalon (ex: { id: 1, jalon: 30 })
 * @param {number} jourCourant - Jour courant relatif (ex: -25, -17, -10)
 * @returns {object} - Objet {statut, couleur, message, actionPossible}
 */
export function getStatutCritere(critere, jourCourant) {
  if (!critere || typeof jourCourant !== 'number') {
    return {
      statut: 'À VENIR',
      couleur: 'gray',
      message: 'En attente',
      actionPossible: false
    };
  }

  const jalon = critere.jalon * -1; // Convertir J-30 → -30
  const fenetre = getFenetreValidation(jalon);
  
  // Critère pas encore atteint
  if (jourCourant < jalon) {
    const joursRestants = Math.abs(jourCourant - jalon);
    return {
      statut: 'À VENIR',
      couleur: 'gray',
      message: `Disponible dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`,
      actionPossible: false
    };
  }
  
  // Critère dans la fenêtre de validation
  if (jourCourant >= jalon && jourCourant <= fenetre) {
    const estEnCours = jourCourant === jalon;
    return {
      statut: estEnCours ? 'EN COURS' : 'ACTIF',
      couleur: 'green',
      message: estEnCours ? 'À valider aujourd\'hui' : 'Clique pour valider ton engagement',
      actionPossible: true
    };
  }
  
  // Critère verrouillé (hors fenêtre)
  return {
    statut: 'VERROUILLÉ',
    couleur: 'red',
    message: `Ce critère devait démarrer à J-${critere.jalon}. Concentre-toi sur les critères restants.`,
    actionPossible: false
  };
}

/**
 * Vérifie si la période de validation d'un critère est active selon le jalon et la date courante
 * Intègre les fenêtres de validation pour gérer les scénarios de démarrage tardif
 * @param {number} jalon - Le jalon (jour) associé au critère (ex: -30, -17, -7)
 * @param {number} jourCourant - Le jour courant du parcours (ex: -25, -17, -10)
 * @returns {boolean} - true si la période est active (dans la fenêtre de validation), false sinon
 */
export function isPeriodeActive(jalon, jourCourant) {
  if (typeof jalon !== 'number' || typeof jourCourant !== 'number') return false;
  
  const fenetre = getFenetreValidation(jalon);
  
  // La période est active si le jour courant est entre le jalon et la fenêtre de validation
  // Exemple : J-30 (jalon=-30) validable de J-30 (jourCourant=-30) à J-18 (fenetre=-18)
  return jourCourant >= jalon && jourCourant <= fenetre;
}

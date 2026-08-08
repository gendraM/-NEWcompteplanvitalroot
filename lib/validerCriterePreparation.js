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
    typeValidation: 'manuel',
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

// ═══════════════════════════════════════════════════════════════════════════════
// NOUVELLES FONCTIONS — VALIDATION AUTOMATIQUE DES CRITÈRES (26/12/2025)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validation automatique d'un critère (préserve les validations manuelles existantes)
 * @param {number} critereId - ID du critère (1, 2, 7, 8, 9)
 * @returns {boolean} - true si validé avec succès
 */
export function validerCritereAuto(critereId) {
  if (typeof window === 'undefined') return false;
  
  const STORAGE_KEY = 'preparationJeuneCriteres';
  
  try {
    const criteres = getCriteresPreparation();
    
    // Ne pas écraser si le critère est déjà validé, quel que soit l'historique local existant
    if (criteres[critereId]?.validé) {
      return false;
    }
    
    criteres[critereId] = {
      validé: true,
      dateValidation: new Date().toISOString(),
      typeValidation: 'auto' // Distinction validation auto/manuelle
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(criteres));
    return true;
  } catch (e) {
    console.error('[validerCritereAuto] Erreur:', e);
    return false;
  }
}

/**
 * Récupère le statut de validation automatique d'un critère
 * @param {number} critereId - ID du critère
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {object} - { joursRespectés, validé, typeValidation }
 */
export function getStatutCritereAuto(critereId, repas7j = []) {
  let joursRespectés = 0;
  let seuil = 5; // Par défaut 5/7 jours
  
  switch (critereId) {
    case 1:
      joursRespectés = analyserPortions(repas7j);
      seuil = 6; // Critère 1 nécessite 6/7 jours
      break;
    case 2:
      joursRespectés = detecterFeculents(repas7j);
      break;
    case 7:
      joursRespectés = calculerHydratation(repas7j);
      break;
    case 8:
      joursRespectés = verifierHeureRepas(repas7j);
      break;
    case 9:
      joursRespectés = calculerDureeRepas(repas7j);
      break;
    default:
      return { joursRespectés: 0, validé: false, typeValidation: null };
  }
  
  const criteres = getCriteresPreparation();
  const typeValidation = criteres[critereId]?.typeValidation || null;
  
  return {
    joursRespectés,
    validé: joursRespectés >= seuil,
    typeValidation
  };
}

/**
 * Critère 1 : Analyser les portions sur 7 jours
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {number} - Nombre de jours avec portions correctes
 */
export function analyserPortions(repas7j = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) return 0;
  
  // Grouper par date
  const parDate = {};
  repas7j.forEach(repas => {
    const date = repas.date;
    if (!parDate[date]) parDate[date] = [];
    parDate[date].push(repas);
  });
  
  let joursOK = 0;
  
  // Pour chaque jour, vérifier si les portions sont correctes
  Object.keys(parDate).forEach(date => {
    const repasJour = parDate[date];
    let portionsCorrectes = 0;
    let totalRepas = 0;
    
    repasJour.forEach(repas => {
      // Ignorer les extras et fast food
      if (repas.est_extra || repas.isFastFood) return;
      
      totalRepas++;
      
      // Vérifier si la quantité correspond aux repères visuels
      const quantite = (repas.quantite || '').toLowerCase();
      const reperages = [
        'poing', 'fourchette', 'paume', 'main', 
        '6-8 c.à.s', '1 paume', '2 mains', '1 verre'
      ];
      
      const aRepereVisuel = reperages.some(repere => quantite.includes(repere));
      
      if (aRepereVisuel) {
        portionsCorrectes++;
      }
    });
    
    // Si ≥ 80% des repas du jour ont des portions correctes
    if (totalRepas > 0 && (portionsCorrectes / totalRepas) >= 0.8) {
      joursOK++;
    }
  });
  
  return joursOK;
}

/**
 * Critère 2 : Détecter l'absence de féculents au dîner
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {number} - Nombre de jours SANS féculents au dîner
 */
export function detecterFeculents(repas7j = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) return 0;
  
  const feculents = [
    'pain', 'pâtes', 'pâte', 'riz', 'pomme de terre', 'pommes de terre',
    'quinoa', 'boulgour', 'semoule', 'couscous', 'féculent',
    'penne', 'spaghetti', 'tagliatelle', 'linguine'
  ];
  
  // Grouper les dîners par date
  const dinersParDate = {};
  repas7j.forEach(repas => {
    if (repas.type === 'Dîner' || repas.type === 'Diner') {
      const date = repas.date;
      if (!dinersParDate[date]) dinersParDate[date] = [];
      dinersParDate[date].push(repas);
    }
  });
  
  let joursSansFeculents = 0;
  
  Object.keys(dinersParDate).forEach(date => {
    const diners = dinersParDate[date];
    let contientFeculent = false;
    
    diners.forEach(diner => {
      const aliment = (diner.aliment || '').toLowerCase();
      const categorie = (diner.categorie || '').toLowerCase();
      
      // Vérifier si l'aliment ou la catégorie contient un féculent
      const estFeculent = feculents.some(fec => 
        aliment.includes(fec) || categorie.includes(fec)
      );
      
      if (estFeculent) {
        contientFeculent = true;
      }
    });
    
    if (!contientFeculent && diners.length > 0) {
      joursSansFeculents++;
    }
  });
  
  return joursSansFeculents;
}

/**
 * Critère 7 : Calculer l'hydratation (≥ 2L/jour)
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {number} - Nombre de jours avec ≥ 2000ml
 */
export function calculerHydratation(repas7j = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) return 0;
  
  // Grouper par date
  const parDate = {};
  repas7j.forEach(repas => {
    const date = repas.date;
    if (!parDate[date]) parDate[date] = 0;
    
    // Chercher les boissons dans les repas
    const aliment = (repas.aliment || '').toLowerCase();
    const categorie = (repas.categorie || '').toLowerCase();
    
    // Mots-clés pour l'hydratation
    const motsEau = ['eau', 'verre', 'bouteille', 'tisane', 'thé', 'infusion'];
    
    if (motsEau.some(mot => aliment.includes(mot) || categorie.includes(mot))) {
      // Estimer la quantité d'eau
      const quantite = (repas.quantite || '').toLowerCase();
      
      let ml = 0;
      if (quantite.includes('2l') || quantite.includes('2 l')) ml = 2000;
      else if (quantite.includes('1.5l') || quantite.includes('1,5')) ml = 1500;
      else if (quantite.includes('1l') || quantite.includes('1 l')) ml = 1000;
      else if (quantite.includes('bouteille')) ml = 500;
      else if (quantite.includes('verre')) ml = 250;
      else if (quantite.includes('litre')) ml = 1000;
      
      parDate[date] += ml;
    }
  });
  
  let joursOK = 0;
  Object.values(parDate).forEach(totalMl => {
    if (totalMl >= 2000) joursOK++;
  });
  
  return joursOK;
}

/**
 * Critère 8 : Vérifier que le dernier repas est avant 19h
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {number} - Nombre de jours avec dernier repas avant 19h
 */
export function verifierHeureRepas(repas7j = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) return 0;
  
  // Grouper par date
  const parDate = {};
  repas7j.forEach(repas => {
    const date = repas.date;
    if (!parDate[date]) parDate[date] = [];
    parDate[date].push(repas);
  });
  
  let joursOK = 0;
  
  Object.keys(parDate).forEach(date => {
    const repasJour = parDate[date];
    let dernierHeure = null;
    
    repasJour.forEach(repas => {
      if (repas.heureRepas) {
        const heure = repas.heureRepas;
        if (!dernierHeure || heure > dernierHeure) {
          dernierHeure = heure;
        }
      }
    });
    
    // Vérifier si < 19:00
    if (dernierHeure && dernierHeure < '19:00') {
      joursOK++;
    }
  });
  
  return joursOK;
}

/**
 * Critère 9 : Calculer la durée des repas (≤ 45 minutes)
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {number} - Nombre de jours avec durée ≤ 45 min
 */
export function calculerDureeRepas(repas7j = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) return 0;
  
  // Grouper par date et par type de repas
  const parDateEtType = {};
  repas7j.forEach(repas => {
    const cle = `${repas.date}_${repas.type}`;
    if (!parDateEtType[cle]) parDateEtType[cle] = [];
    parDateEtType[cle].push(repas);
  });
  
  let joursOK = 0;
  const datesTraitees = new Set();
  
  Object.keys(parDateEtType).forEach(cle => {
    const repas = parDateEtType[cle];
    const date = cle.split('_')[0];
    
    if (repas.length > 1 && repas[0].heureRepas) {
      // Trier par heure
      repas.sort((a, b) => (a.heureRepas || '').localeCompare(b.heureRepas || ''));
      
      const premiere = repas[0].heureRepas;
      const derniere = repas[repas.length - 1].heureRepas;
      
      // Calculer la durée en minutes
      const [h1, m1] = premiere.split(':').map(Number);
      const [h2, m2] = derniere.split(':').map(Number);
      const dureeMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      
      if (dureeMinutes <= 45 && !datesTraitees.has(date)) {
        joursOK++;
        datesTraitees.add(date);
      }
    } else if (repas.length === 1 && !datesTraitees.has(date)) {
      // Un seul repas = durée <= 45min par défaut
      joursOK++;
      datesTraitees.add(date);
    }
  });
  
  return joursOK;
}

/**
 * Fonction utilitaire : Convertir le label du critère en ID numérique
 * @param {string} label - Label du critère
 * @returns {number|null} - ID du critère (1-9) ou null
 */
export function getCritereIdFromLabel(label) {
  if (!label) return null;
  
  const mapping = {
    'Respect strict des quantités à chaque repas': 1,
    'Pas de féculents le soir (lun-dim) + action après repas': 2,
    'Éliminer tous produits transformés et sucreries': 3,
    '2 jours de jeûne plein': 4,
    '2L d\'eau/jour, pas de repas après 19h, plage 45min': 7, // Critère combiné 7+8+9
  };
  
  return mapping[label] || null;
}

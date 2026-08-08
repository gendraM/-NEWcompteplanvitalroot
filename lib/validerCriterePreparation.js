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

const SEUILS_CRITERES_AUTO = {
  1: 6,
  2: 5,
  3: 5,
  4: 2,
  5: 5,
  6: 2,
  7: 5,
  8: 5,
  9: 5,
};

export function getSeuilCritereAuto(critereId) {
  return SEUILS_CRITERES_AUTO[critereId] || 5;
}

/**
 * Récupère le statut de validation automatique d'un critère
 * @param {number} critereId - ID du critère
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {object} - { joursRespectés, validé, typeValidation }
 */
export function getStatutCritereAuto(critereId, repas7j = []) {
  let joursRespectés = 0;
  let seuil = getSeuilCritereAuto(critereId);
  const referentielAliments = arguments[2] || [];
  const options = arguments[3] || {};
  const jeuneConfig = options.jeuneConfig || null;
  let joursAmbigus = 0;
  let joursNonConformes = 0;
  let validationAssisteeRequise = false;
  let eligibleValidationAssistee = false;
  
  switch (critereId) {
    case 1:
      joursRespectés = analyserPortions(repas7j, referentielAliments);
      seuil = 6; // Critère 1 nécessite 6/7 jours
      break;
    case 2:
      joursRespectés = detecterFeculents(repas7j);
      break;
    case 3: {
      const analyse = detecterProduitsTransformesEtSucres(repas7j, referentielAliments);
      joursRespectés = analyse.joursConformes;
      joursAmbigus = analyse.joursAmbigus;
      joursNonConformes = analyse.joursNonConformes;
      break;
    }
    case 4: {
      const cibleConfig = Number.parseInt(jeuneConfig?.nombreJeunes, 10);
      if (Number.isFinite(cibleConfig) && cibleConfig > 0) {
        seuil = cibleConfig;
      }
      const analyse = detecterJoursJeunePlein(repas7j, referentielAliments);
      joursRespectés = analyse.joursConformes;
      joursAmbigus = analyse.joursAmbigus;
      joursNonConformes = analyse.joursNonConformes;
      break;
    }
    case 5: {
      const analyse = detecterTransitionPreJeune(repas7j, referentielAliments);
      joursRespectés = analyse.joursConformes;
      joursAmbigus = analyse.joursAmbigus;
      joursNonConformes = analyse.joursNonConformes;
      break;
    }
    case 6: {
      const cibleConfig = Number.parseInt(jeuneConfig?.nombreJeunes, 10);
      if (Number.isFinite(cibleConfig) && cibleConfig > 0) {
        seuil = cibleConfig;
      }
      const analyse = detecterJoursJeunePlein(repas7j, referentielAliments);
      joursRespectés = analyse.joursConformes;
      joursAmbigus = analyse.joursAmbigus;
      joursNonConformes = analyse.joursNonConformes;
      validationAssisteeRequise = true;
      eligibleValidationAssistee = joursRespectés >= seuil;
      break;
    }
    case 7:
      joursRespectés = calculerHydratation(repas7j, referentielAliments);
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
    validé: validationAssisteeRequise ? false : joursRespectés >= seuil,
    typeValidation,
    joursAmbigus,
    joursNonConformes,
    seuil,
    validationAssisteeRequise,
    eligibleValidationAssistee
  };
}

function normaliserTextePortion(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function extraireQuantiteReference(portionDefaut, unite) {
  const texte = normaliserTextePortion(portionDefaut);
  const uniteNormalisee = normaliserTextePortion(unite);

  const match = texte.match(/(\d+(?:[\.,]\d+)?)/);
  if (match) {
    return Number.parseFloat(match[1].replace(',', '.'));
  }

  const unitesMonoPortion = [
    'bol', 'assiette', 'barquette', 'sachet', 'part', 'verre',
    'piece', 'tranche', 'brochette', 'pot', 'portion', 'menu',
    'combo', 'sandwich', 'rouleau', 'bouteille'
  ];

  if (unitesMonoPortion.some(token => texte.includes(token) || uniteNormalisee === token)) {
    return 1;
  }

  return null;
}

function trouverAlimentReferentiel(aliment, referentielAliments = []) {
  if (!aliment || !Array.isArray(referentielAliments) || referentielAliments.length === 0) return null;
  const nomRecherche = normaliserTextePortion(aliment);
  return referentielAliments.find(item => normaliserTextePortion(item.nom) === nomRecherche) || null;
}

function lireQuantiteNumerique(repas) {
  if (Number.isFinite(repas?.quantite_nombre)) return Number(repas.quantite_nombre);

  const texte = String(repas?.quantite ?? '').replace(',', '.').trim();
  const valeur = Number.parseFloat(texte);
  return Number.isFinite(valeur) ? valeur : null;
}

function construireCleRepas(repas) {
  return `${repas.date}__${repas.type || repas.type_repas || 'Repas'}`;
}

export function getResumePortionParJour(repas7j = [], referentielAliments = []) {
  const resultats = {};
  if (!Array.isArray(repas7j) || repas7j.length === 0) return resultats;

  const repasParJourEtType = {};
  repas7j.forEach(repas => {
    if (repas.est_extra || repas.isFastFood) return;
    const cle = construireCleRepas(repas);
    if (!repasParJourEtType[cle]) repasParJourEtType[cle] = [];
    repasParJourEtType[cle].push(repas);
  });

  Object.values(repasParJourEtType).forEach(itemsRepas => {
    const date = itemsRepas[0]?.date;
    if (!date) return;

    if (!resultats[date]) {
      resultats[date] = {
        repasAnalysables: 0,
        repasConformes: 0,
        alimentsAnalysables: 0,
        alimentsConformes: 0,
      };
    }

    let alimentsAnalysables = 0;
    let alimentsConformes = 0;
    itemsRepas.forEach(repas => {
      const respectPortion = evaluerRespectPortionRepas(repas, referentielAliments);
      if (respectPortion === null) return;
      alimentsAnalysables++;
      if (respectPortion) alimentsConformes++;
    });

    if (alimentsAnalysables === 0) return;

    const repasConforme = (alimentsConformes / alimentsAnalysables) >= 0.8;
    resultats[date].repasAnalysables++;
    if (repasConforme) resultats[date].repasConformes++;
    resultats[date].alimentsAnalysables += alimentsAnalysables;
    resultats[date].alimentsConformes += alimentsConformes;
  });

  return resultats;
}

function extraireVolumeReferenceMl(alimentRef) {
  if (!alimentRef) return null;

  const portionDefaut = normaliserTextePortion(alimentRef.portionDefaut);
  const unite = normaliserTextePortion(alimentRef.unite);
  const match = portionDefaut.match(/(\d+(?:[\.,]\d+)?)/);
  const nombre = match ? Number.parseFloat(match[1].replace(',', '.')) : null;

  if (unite === 'ml' || portionDefaut.includes('ml')) return Number.isFinite(nombre) ? nombre : 100;
  if (unite === 'cl' || portionDefaut.includes('cl')) return Number.isFinite(nombre) ? nombre * 10 : null;
  if (unite === 'l' || /(^|[^a-z])l([^a-z]|$)/.test(portionDefaut)) return Number.isFinite(nombre) ? nombre * 1000 : 1000;
  if (unite === 'verre' || portionDefaut.includes('verre')) return Number.isFinite(nombre) ? nombre * 250 : 250;
  if (unite === 'tasse' || portionDefaut.includes('tasse')) return Number.isFinite(nombre) ? nombre * 200 : 200;
  if (unite === 'bouteille' || portionDefaut.includes('bouteille')) return Number.isFinite(nombre) ? nombre * 500 : 500;

  return null;
}

function estBoissonHydratante(repas, alimentRef) {
  const aliment = normaliserTextePortion(repas?.aliment);
  const categorie = normaliserTextePortion(repas?.categorie);
  const sousCategorie = normaliserTextePortion(alimentRef?.sousCategorie);
  const marque = normaliserTextePortion(alimentRef?.marque);
  const texte = [aliment, categorie, sousCategorie, marque].join(' ');
  const motsHydratants = ['eau', 'tisane', 'infusion', 'the', 'thé'];
  return motsHydratants.some(mot => texte.includes(mot));
}

export function calculerVolumeHydratationRepas(repas, referentielAliments = []) {
  const alimentRef = trouverAlimentReferentiel(repas?.aliment, referentielAliments);
  if (!estBoissonHydratante(repas, alimentRef)) return 0;

  const quantite = lireQuantiteNumerique(repas);
  const volumeReferenceMl = extraireVolumeReferenceMl(alimentRef);

  if (Number.isFinite(quantite) && Number.isFinite(volumeReferenceMl)) {
    return quantite * volumeReferenceMl;
  }

  const quantiteTexte = normaliserTextePortion(repas?.quantite_affichage || repas?.quantite);
  if (quantiteTexte.includes('2l') || quantiteTexte.includes('2 l')) return 2000;
  if (quantiteTexte.includes('1.5l') || quantiteTexte.includes('1,5')) return 1500;
  if (quantiteTexte.includes('1l') || quantiteTexte.includes('1 l')) return 1000;
  if (quantiteTexte.includes('bouteille')) return 500;
  if (quantiteTexte.includes('verre')) return 250;
  if (quantiteTexte.includes('litre')) return 1000;

  return 0;
}

export function evaluerRespectPortionRepas(repas, referentielAliments = []) {
  if (!repas) return null;

  if (typeof repas.regle_respectee === 'boolean') {
    return repas.regle_respectee;
  }

  const quantiteTexte = normaliserTextePortion(repas.quantite);
  const reperagesVisuels = [
    'poing', 'fourchette', 'paume', 'main',
    '6-8 c.a.s', '1 paume', '2 mains', '1 verre'
  ];

  if (reperagesVisuels.some(repere => quantiteTexte.includes(repere))) {
    return true;
  }

  const quantiteNumerique = Number.parseFloat(String(repas.quantite ?? '').replace(',', '.'));
  const alimentRef = trouverAlimentReferentiel(repas.aliment, referentielAliments);
  const quantiteReference = alimentRef
    ? extraireQuantiteReference(alimentRef.portionDefaut, alimentRef.unite)
    : null;

  if (alimentRef && Number.isFinite(quantiteNumerique) && Number.isFinite(quantiteReference)) {
    return quantiteNumerique <= quantiteReference;
  }

  return null;
}

/**
 * Critère 1 : Analyser les portions sur 7 jours
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {number} - Nombre de jours avec portions correctes
 */
export function analyserPortions(repas7j = [], referentielAliments = []) {
  const resumeParJour = getResumePortionParJour(repas7j, referentielAliments);
  return Object.values(resumeParJour).filter(jour => jour.repasAnalysables > 0 && (jour.repasConformes / jour.repasAnalysables) >= 0.8).length;
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

function normaliserTexteAnalyse(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function classerRepasCritere3(repas, referentielAliments = []) {
  const aliment = normaliserTexteAnalyse(repas?.aliment);
  const categorie = normaliserTexteAnalyse(repas?.categorie);
  const tag = normaliserTexteAnalyse(repas?.tag);
  const note = normaliserTexteAnalyse(repas?.note);

  if (!aliment && !categorie && !tag && !note) {
    return 'ambigu';
  }

  if (categorie === 'jeune') {
    return 'conforme';
  }

  const referentiel = trouverAlimentReferentiel(repas?.aliment, referentielAliments);
  const categorieRef = normaliserTexteAnalyse(referentiel?.categorie);
  const sousCategorieRef = normaliserTexteAnalyse(referentiel?.sousCategorie);
  const marqueRef = normaliserTexteAnalyse(referentiel?.marque);

  const categoriesInterdites = new Set(['confiserie', 'snack', 'dessert', 'fast-food']);
  if (categoriesInterdites.has(categorie) || categoriesInterdites.has(categorieRef)) {
    return 'non-conforme';
  }

  const texte = [aliment, categorie, tag, note, sousCategorieRef, marqueRef].join(' ');
  const marqueursNonConformes = [
    'sucr', 'bonbon', 'confiser', 'biscuit', 'gateau', 'chocolat', 'soda',
    'boisson sucre', 'ultra-transform', 'industriel', 'chips', 'barre chocolate',
    'patisser', 'dessert glace', 'milkshake', 'cookie', 'donut', 'brownie'
  ];

  if (marqueursNonConformes.some(mot => texte.includes(mot))) {
    return 'non-conforme';
  }

  if (!referentiel && !repas?.categorie && !repas?.tag) {
    return 'ambigu';
  }

  return 'conforme';
}

/**
 * Critère 3 : Éliminer les produits transformés et sucreries
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @param {Array} referentielAliments - Référentiel des aliments
 * @returns {{ joursConformes: number, joursAmbigus: number, joursNonConformes: number }}
 */
export function detecterProduitsTransformesEtSucres(repas7j = [], referentielAliments = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) {
    return { joursConformes: 0, joursAmbigus: 0, joursNonConformes: 0 };
  }

  const parDate = {};
  repas7j.forEach(repas => {
    const date = repas?.date;
    if (!date) return;
    if (!parDate[date]) parDate[date] = [];
    parDate[date].push(repas);
  });

  let joursConformes = 0;
  let joursAmbigus = 0;
  let joursNonConformes = 0;

  Object.values(parDate).forEach(repasJour => {
    let hasNonConforme = false;
    let hasAmbigu = false;
    let hasConforme = false;

    repasJour.forEach(repas => {
      const classification = classerRepasCritere3(repas, referentielAliments);
      if (classification === 'non-conforme') hasNonConforme = true;
      if (classification === 'ambigu') hasAmbigu = true;
      if (classification === 'conforme') hasConforme = true;
    });

    if (hasNonConforme) {
      joursNonConformes++;
      return;
    }

    if (hasConforme) {
      joursConformes++;
      return;
    }

    if (hasAmbigu) {
      joursAmbigus++;
    }
  });

  return { joursConformes, joursAmbigus, joursNonConformes };
}

function normaliserCategoriePourTransition(value) {
  return normaliserTexteAnalyse(value)
    .replace('proteines', 'proteines')
    .replace('boissons', 'boisson');
}

/**
 * Critère 4 : Suivi des jeûnes réalisés selon configuration utilisateur
 * @param {Array} repas7j
 * @param {Array} referentielAliments
 * @returns {{ joursConformes: number, joursAmbigus: number, joursNonConformes: number }}
 */
export function detecterJoursJeunePlein(repas7j = [], referentielAliments = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) {
    return { joursConformes: 0, joursAmbigus: 0, joursNonConformes: 0 };
  }

  const parDate = {};
  repas7j.forEach(repas => {
    if (!repas?.date) return;
    if (!parDate[repas.date]) parDate[repas.date] = [];
    parDate[repas.date].push(repas);
  });

  let joursConformes = 0;
  let joursAmbigus = 0;
  let joursNonConformes = 0;

  Object.values(parDate).forEach(repasJour => {
    const hasJeuneMarque = repasJour.some(repas => normaliserTexteAnalyse(repas?.categorie) === 'jeune');
    if (!hasJeuneMarque) return;

    // Un jeûne "réalisé" est compté dès qu'une entrée Jeûne est explicitement saisie.
    // On ne force pas le "jeûne plein" ici: la durée/type est portée par la configuration utilisateur.
    joursConformes++;
  });

  return { joursConformes, joursAmbigus, joursNonConformes };
}

function classerRepasTransitionPreJeune(repas, referentielAliments = []) {
  const categorie = normaliserCategoriePourTransition(repas?.categorie);
  const aliment = normaliserTexteAnalyse(repas?.aliment);
  const tag = normaliserTexteAnalyse(repas?.tag);
  const note = normaliserTexteAnalyse(repas?.note);
  const referentiel = trouverAlimentReferentiel(repas?.aliment, referentielAliments);
  const categorieRef = normaliserCategoriePourTransition(referentiel?.categorie);

  const categoriesInterdites = new Set(['confiserie', 'snack', 'dessert', 'fast-food']);
  const categoriesTolerees = new Set(['jeune', 'legumes', 'proteines', 'boisson', 'fruit', 'salade', 'soupe']);
  const texte = [aliment, categorie, categorieRef, tag, note].join(' ');
  const marqueursInterdits = ['sucr', 'bonbon', 'soda', 'chips', 'biscuit', 'gateau', 'alcool', 'ultra-transform'];

  if (categoriesInterdites.has(categorie) || categoriesInterdites.has(categorieRef)) {
    return 'non-conforme';
  }

  if (marqueursInterdits.some(mot => texte.includes(mot))) {
    return 'non-conforme';
  }

  if (categoriesTolerees.has(categorie) || categoriesTolerees.has(categorieRef)) {
    return 'conforme';
  }

  if (!aliment && !categorie && !tag && !note) {
    return 'ambigu';
  }

  return 'ambigu';
}

/**
 * Critère 5 : Transition alimentaire pré-jeûne
 * @param {Array} repas7j
 * @param {Array} referentielAliments
 * @returns {{ joursConformes: number, joursAmbigus: number, joursNonConformes: number }}
 */
export function detecterTransitionPreJeune(repas7j = [], referentielAliments = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) {
    return { joursConformes: 0, joursAmbigus: 0, joursNonConformes: 0 };
  }

  const parDate = {};
  repas7j.forEach(repas => {
    if (!repas?.date) return;
    if (!parDate[repas.date]) parDate[repas.date] = [];
    parDate[repas.date].push(repas);
  });

  let joursConformes = 0;
  let joursAmbigus = 0;
  let joursNonConformes = 0;

  Object.values(parDate).forEach(repasJour => {
    let hasConforme = false;
    let hasAmbigu = false;
    let hasNonConforme = false;

    repasJour.forEach(repas => {
      const statut = classerRepasTransitionPreJeune(repas, referentielAliments);
      if (statut === 'conforme') hasConforme = true;
      if (statut === 'ambigu') hasAmbigu = true;
      if (statut === 'non-conforme') hasNonConforme = true;
    });

    if (hasNonConforme) {
      joursNonConformes++;
      return;
    }
    if (hasConforme) {
      joursConformes++;
      return;
    }
    if (hasAmbigu) {
      joursAmbigus++;
    }
  });

  return { joursConformes, joursAmbigus, joursNonConformes };
}

/**
 * Critère 7 : Calculer l'hydratation (≥ 2L/jour)
 * @param {Array} repas7j - Repas des 7 derniers jours
 * @returns {number} - Nombre de jours avec ≥ 2000ml
 */
export function calculerHydratation(repas7j = [], referentielAliments = []) {
  if (!Array.isArray(repas7j) || repas7j.length === 0) return 0;
  
  // Grouper par date
  const parDate = {};
  repas7j.forEach(repas => {
    const date = repas.date;
    if (!parDate[date]) parDate[date] = 0;

    parDate[date] += calculerVolumeHydratationRepas(repas, referentielAliments);
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
      const heureSource = repas.heureRepas || repas.heure_repas || repas.heure;
      if (heureSource) {
        const heure = heureSource;
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
    
    const heuresRepas = repas.map(item => item.heureRepas || item.heure_repas || item.heure).filter(Boolean);
    if (repas.length > 1 && heuresRepas.length > 0) {
      // Trier par heure
      repas.sort((a, b) => ((a.heureRepas || a.heure_repas || a.heure || '')).localeCompare(b.heureRepas || b.heure_repas || b.heure || ''));
      
      const premiere = repas[0].heureRepas || repas[0].heure_repas || repas[0].heure;
      const derniere = repas[repas.length - 1].heureRepas || repas[repas.length - 1].heure_repas || repas[repas.length - 1].heure;
      
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

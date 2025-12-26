/**
 * ============================================================================
 * RÉFÉRENTIEL CRITÈRES CRISTALLISATION - DYNAMIQUES
 * ============================================================================
 * 
 * 6 types de critères générés DYNAMIQUEMENT depuis bilan_reprise
 * Pas de valeurs hardcodées - tout calculé selon patterns utilisateur
 * 
 * Date: 26 Décembre 2025
 * Phase: Post-reprise (45 jours d'ancrage)
 * 
 * ============================================================================
 */

/**
 * ============================================================================
 * TYPE 1: EXTRAS FRÉQUENTS
 * ============================================================================
 * Activé si: >10 extras pendant phase reprise
 * Objectif: Réduction drastique (68% minimum)
 * Validation: Quotidienne + Hebdomadaire
 */
export const CRITERE_EXTRAS_FREQUENTS = {
  id: 'extras_frequents',
  nom: 'Réduction extras',
  
  conditions_activation: {
    seuil_reprise: 10,
    formule: 'bilan_reprise.extras.total > 10',
    description: 'Activé si plus de 10 extras consommés pendant la phase reprise'
  },
  
  configuration: {
    /**
     * Calcule le seuil cible personnalisé
     * @param {Object} bilanReprise - Données phase reprise
     * @returns {Object} Configuration critère
     */
    calcul_seuil: (bilanReprise) => {
      const extrasReprise = bilanReprise.extras.total;
      const dureeReprise = bilanReprise.duree_jours || 21;
      const extrasParJour = extrasReprise / dureeReprise;
      
      // Objectif: réduction de 68% minimum
      const reduction = Math.ceil(extrasReprise * 0.68);
      const seuilCible = Math.max(3, extrasReprise - reduction); // Min 3/semaine
      const seuilCibleParSemaine = Math.round((seuilCible / dureeReprise) * 7);
      
      return {
        seuil_actuel: extrasReprise,
        seuil_actuel_par_jour: extrasParJour.toFixed(2),
        seuil_cible: seuilCibleParSemaine,
        seuil_cible_par_jour: (seuilCibleParSemaine / 7).toFixed(2),
        reduction_pourcent: Math.round((reduction / extrasReprise) * 100),
        titre: `Maximum ${seuilCibleParSemaine} extras par semaine`,
        description: `Réduis de ${Math.round((reduction / extrasReprise) * 100)}% tes extras (de ${extrasReprise} à ${seuilCibleParSemaine}/semaine)`,
        types_triggers: bilanReprise.extras.types_frequents || []
      };
    },
    
    /**
     * Validation quotidienne
     * @param {Array} repasJour - Repas du jour
     * @returns {Boolean}
     */
    validation_quotidienne: (repasJour) => {
      return repasJour.filter(r => r.est_extra).length === 0;
    },
    
    /**
     * Validation hebdomadaire
     * @param {Array} repasSemaine - Repas de la semaine
     * @param {Number} seuilCible - Maximum extras/semaine
     * @returns {Boolean}
     */
    validation_hebdomadaire: (repasSemaine, seuilCible) => {
      const extrasSemaine = repasSemaine.filter(r => r.est_extra).length;
      return extrasSemaine <= seuilCible;
    }
  },
  
  messages: {
    encouragement: '💪 Bravo ! Aucun extra aujourd'hui',
    encouragement_streak: '🔥 {{streak}} jours sans extras ! Continue',
    alerte: '⚠️ Extra détecté. Tu as déjà {{nb_extras}} extras cette semaine (max {{seuil_cible}})',
    alerte_critique: '🚨 Limite dépassée ! {{nb_extras}}/{{seuil_cible}} extras cette semaine',
    victoire_21j: '🏆 21 jours consécutifs sans extras ! Habitude VAINCUE !',
    victoire_finale: '🎯 45 jours terminés : Extras réduits de {{reduction}}% !'
  },
  
  tracking: {
    comportement_cible: 'pas_extra_journalier',
    victoire_21j: true,
    comparaison_reprise: true
  }
};

/**
 * ============================================================================
 * TYPE 2: FÉCULENTS SOIR (après 19h)
 * ============================================================================
 * Activé si: >5 occurrences féculents après 19h pendant reprise
 * Objectif: 0 féculent après 19h
 * Validation: Quotidienne (vérification heure)
 */
export const CRITERE_FECULENTS_SOIR = {
  id: 'feculents_soir',
  nom: 'Pas de féculents après 19h',
  
  conditions_activation: {
    seuil_reprise: 5,
    formule: 'bilan_reprise.feculents_soir.occurrences > 5',
    description: 'Activé si plus de 5 repas avec féculents après 19h pendant reprise'
  },
  
  configuration: {
    calcul_seuil: (bilanReprise) => {
      const occurrences = bilanReprise.feculents_soir.occurrences;
      const pourcentage = bilanReprise.feculents_soir.pourcentage;
      const typesFrequents = bilanReprise.feculents_soir.types_frequents || ['pâtes', 'riz', 'pain'];
      
      return {
        seuil_actuel: occurrences,
        pourcentage_reprise: pourcentage,
        seuil_cible: 0, // Objectif: aucun féculent après 19h
        titre: 'Aucun féculent après 19h',
        description: `Supprime les féculents le soir (tu en avais ${occurrences} fois pendant reprise)`,
        types_problematiques: typesFrequents,
        heure_limite: '19:00'
      };
    },
    
    validation_quotidienne: (repasJour) => {
      const repasSoir = repasJour.filter(r => {
        if (!r.heure) return false;
        const heure = parseInt(r.heure.split(':')[0]);
        return heure >= 19;
      });
      
      const feculentsSoir = repasSoir.filter(r => 
        r.categorie === 'feculent' || 
        ['pâtes', 'riz', 'pain', 'pommes de terre', 'quinoa'].some(f => 
          r.aliment.toLowerCase().includes(f)
        )
      );
      
      return feculentsSoir.length === 0;
    }
  },
  
  messages: {
    encouragement: '✅ Parfait ! Aucun féculent après 19h',
    encouragement_streak: '🌙 {{streak}} jours sans féculents le soir',
    alerte: '⚠️ Féculent détecté à {{heure}}. Privilégie légumes + protéines le soir',
    suggestion: '💡 Remplace {{feculent}} par: légumes vapeur + poisson/poulet',
    victoire_21j: '🏆 21 jours : Nouveau timing ancré !',
    victoire_finale: '🎯 Nouveau comportement acquis : Féculents uniquement matin/midi'
  },
  
  tracking: {
    comportement_cible: 'feculents_timing_ok',
    victoire_21j: true,
    comparaison_reprise: true
  }
};

/**
 * ============================================================================
 * TYPE 3: QUALITÉ NUTRITIONNELLE FAIBLE
 * ============================================================================
 * Activé si: QN moyen < 3.2 pendant reprise
 * Objectif: QN moyen ≥ 3.5
 * Validation: Quotidienne (moyenne des repas)
 */
export const CRITERE_QN_FAIBLE = {
  id: 'qn_faible',
  nom: 'Amélioration Qualité Nutritionnelle',
  
  conditions_activation: {
    seuil_reprise: 3.2,
    formule: 'bilan_reprise.qn_moyen < 3.2',
    description: 'Activé si QN moyen inférieur à 3.2 pendant reprise'
  },
  
  configuration: {
    calcul_seuil: (bilanReprise) => {
      const qnMoyenReprise = bilanReprise.qn_moyen;
      const qnCible = 3.5;
      const ameliorationRequise = ((qnCible - qnMoyenReprise) / qnMoyenReprise * 100).toFixed(1);
      
      const categoriesProblematiques = bilanReprise.qn_details?.categories_faibles || ['extras', 'feculents'];
      
      return {
        seuil_actuel: qnMoyenReprise,
        seuil_cible: qnCible,
        amelioration_pourcent: ameliorationRequise,
        titre: `QN moyen ≥ ${qnCible}`,
        description: `Améliore ton QN de ${ameliorationRequise}% (de ${qnMoyenReprise} à ${qnCible})`,
        categories_a_ameliorer: categoriesProblematiques
      };
    },
    
    validation_quotidienne: (repasJour) => {
      if (repasJour.length === 0) return false;
      
      // Calculer QN moyen du jour (ignorer extras qui ont QN=1)
      const repasNormaux = repasJour.filter(r => !r.est_extra);
      if (repasNormaux.length === 0) return false;
      
      const qnMoyen = repasNormaux.reduce((sum, r) => {
        // QN par catégorie: légume=5, protéine=4, féculent=3, fruit=4, extra=1
        const qn = r.qn || getQNParCategorie(r.categorie);
        return sum + qn;
      }, 0) / repasNormaux.length;
      
      return qnMoyen >= 3.5;
    }
  },
  
  messages: {
    encouragement: '🌟 Excellent ! QN moyen du jour: {{qn_jour}} (objectif: 3.5)',
    encouragement_streak: '📈 {{streak}} jours avec QN ≥ 3.5',
    alerte: '⚠️ QN du jour: {{qn_jour}} (objectif: 3.5). Ajoute plus de légumes',
    suggestion: '💡 Pour améliorer: Remplace {{aliment_faible}} par {{alternative_meilleure}}',
    victoire_21j: '🏆 21 jours : Qualité nutritionnelle excellente !',
    victoire_finale: '🎯 QN moyen cristallisation: {{qn_final}} (+{{amelioration}}%)'
  },
  
  tracking: {
    comportement_cible: 'qn_quotidien_bon',
    victoire_21j: true,
    comparaison_reprise: true
  }
};

/**
 * ============================================================================
 * TYPE 4: QUANTITÉS EXCESSIVES
 * ============================================================================
 * Activé si: Taux conformité portions < 75%
 * Objectif: Taux conformité ≥ 90%
 * Validation: Quotidienne (vérif grammes vs portions recommandées)
 */
export const CRITERE_QUANTITES_EXCESSIVES = {
  id: 'quantites_excessives',
  nom: 'Respect des portions',
  
  conditions_activation: {
    seuil_reprise: 75,
    formule: 'bilan_reprise.quantites_excessives.taux_conformite < 75',
    description: 'Activé si taux conformité portions inférieur à 75% pendant reprise'
  },
  
  configuration: {
    calcul_seuil: (bilanReprise) => {
      const tauxActuel = bilanReprise.quantites_excessives.taux_conformite;
      const tauxCible = 90;
      const categoriesProblematiques = bilanReprise.quantites_excessives.categories_problematiques || [];
      
      return {
        seuil_actuel: tauxActuel,
        seuil_cible: tauxCible,
        amelioration_requise: tauxCible - tauxActuel,
        titre: `Taux conformité ≥ ${tauxCible}%`,
        description: `Respecte les portions recommandées (actuellement ${tauxActuel}%)`,
        categories_attention: categoriesProblematiques
      };
    },
    
    validation_quotidienne: (repasJour, referentielAliments) => {
      if (repasJour.length === 0) return false;
      
      let conformes = 0;
      let total = 0;
      
      repasJour.forEach(repas => {
        if (repas.est_extra) return; // Ignorer extras
        
        const ref = referentielAliments.find(r => 
          r.aliment.toLowerCase() === repas.aliment.toLowerCase()
        );
        
        if (!ref || !ref.portion_max || !repas.grammes) return;
        
        total++;
        const portionMax = parseFloat(ref.portion_max);
        if (repas.grammes <= portionMax) {
          conformes++;
        }
      });
      
      if (total === 0) return false;
      const tauxConformite = (conformes / total) * 100;
      return tauxConformite >= 90;
    }
  },
  
  messages: {
    encouragement: '✅ Portions parfaites ! Conformité: {{taux}}%',
    encouragement_streak: '⚖️ {{streak}} jours avec portions respectées',
    alerte: '⚠️ Portion excessive: {{aliment}} ({{grammes}}g, max {{max}}g)',
    suggestion: '💡 Réduis {{aliment}} de {{grammes}}g à {{portion_ideale}}g',
    victoire_21j: '🏆 21 jours : Portions maîtrisées !',
    victoire_finale: '🎯 Conformité finale: {{taux_final}}% (+{{amelioration}}%)'
  },
  
  tracking: {
    comportement_cible: 'portions_respectees',
    victoire_21j: true,
    comparaison_reprise: true
  }
};

/**
 * ============================================================================
 * TYPE 5: JEÛNES IRRÉGULIERS
 * ============================================================================
 * Activé si: Taux réussite jeûnes < 70% pendant reprise
 * Objectif: 2 jeûnes ponctuels/semaine (100% réussite)
 * Validation: Hebdomadaire
 */
export const CRITERE_JEUNES_IRREGULIERS = {
  id: 'jeunes_irreguliers',
  nom: 'Jeûnes ponctuels réguliers',
  
  conditions_activation: {
    seuil_reprise: 70,
    formule: 'bilan_reprise.jeunes_ponctuels.taux < 70',
    description: 'Activé si taux réussite jeûnes inférieur à 70% pendant reprise'
  },
  
  configuration: {
    calcul_seuil: (bilanReprise) => {
      const tauxActuel = bilanReprise.jeunes_ponctuels.taux;
      const reussis = bilanReprise.jeunes_ponctuels.reussis;
      const total = bilanReprise.jeunes_ponctuels.total_jours || 21;
      const tauxCible = 100;
      
      return {
        seuil_actuel: tauxActuel,
        jeunes_reussis_reprise: reussis,
        total_jours_reprise: total,
        seuil_cible: tauxCible,
        objectif_semaine: 2, // 2 jeûnes/semaine
        titre: '2 jeûnes ponctuels par semaine',
        description: `Maintiens tes jeûnes réguliers (tu avais ${tauxActuel}% de réussite en reprise)`
      };
    },
    
    validation_hebdomadaire: (jeunesSemaine) => {
      // jeunesSemaine = array d'objets {date, reussi: boolean}
      const reussis = jeunesSemaine.filter(j => j.reussi).length;
      return reussis >= 2;
    }
  },
  
  messages: {
    encouragement: '🌙 Jeûne ponctuel validé ! {{nb_reussis}}/2 cette semaine',
    encouragement_complet: '✨ Parfait ! 2 jeûnes réussis cette semaine',
    encouragement_streak: '🔥 {{streak}} semaines avec 2 jeûnes',
    alerte: '⚠️ {{nb_reussis}}/2 jeûnes cette semaine. Planifie le prochain',
    rappel: '📅 N'oublie pas ton jeûne ponctuel cette semaine',
    victoire_21j: '🏆 21 jours : Régularité jeûnes acquise !',
    victoire_finale: '🎯 Cristallisation: {{taux_final}}% jeûnes réussis'
  },
  
  tracking: {
    comportement_cible: 'jeunes_reguliers',
    victoire_21j: false, // Validation hebdomadaire, pas quotidienne
    comparaison_reprise: true
  }
};

/**
 * ============================================================================
 * TYPE 6: PRATIQUES SPIRITUELLES FAIBLES
 * ============================================================================
 * Activé si: Moyenne < 3 pratiques/jour OU irrégularité
 * Objectif: Minimum 3 pratiques/jour régulièrement
 * Validation: Quotidienne
 */
export const CRITERE_PRATIQUES_SPIRITUELLES = {
  id: 'pratiques_spirituelles_faibles',
  nom: 'Pratiques spirituelles régulières',
  
  conditions_activation: {
    seuil_reprise: 3,
    formule: 'bilan_reprise.pratiques_spirituelles.moyenne_par_jour < 3 || bilan_reprise.pratiques_spirituelles.irregularite === true',
    description: 'Activé si moins de 3 pratiques/jour OU irrégularité pendant reprise'
  },
  
  configuration: {
    calcul_seuil: (bilanReprise) => {
      const moyenneActuelle = bilanReprise.pratiques_spirituelles.moyenne_par_jour;
      const irregulier = bilanReprise.pratiques_spirituelles.irregularite;
      const moyenneCible = 3;
      
      return {
        seuil_actuel: moyenneActuelle,
        irregularite_reprise: irregulier,
        seuil_cible: moyenneCible,
        titre: `Minimum ${moyenneCible} pratiques par jour`,
        description: `Maintiens tes pratiques régulièrement (moyenne reprise: ${moyenneActuelle.toFixed(1)})`,
        pratiques_types: ['Prière', 'Méditation', 'Lecture Bible', 'Adoration', 'Service']
      };
    },
    
    validation_quotidienne: (pratiquesJour) => {
      // pratiquesJour = array d'objets pratiques spirituelles
      return pratiquesJour.length >= 3;
    }
  },
  
  messages: {
    encouragement: '🙏 Excellent ! {{nb_pratiques}} pratiques aujourd'hui',
    encouragement_streak: '✨ {{streak}} jours avec ≥3 pratiques',
    alerte: '⚠️ {{nb_pratiques}}/3 pratiques aujourd'hui',
    suggestion: '💡 Ajoute: {{pratiques_manquantes}}',
    victoire_21j: '🏆 21 jours : Vie spirituelle ancrée !',
    victoire_finale: '🎯 Moyenne finale: {{moyenne_finale}} pratiques/jour'
  },
  
  tracking: {
    comportement_cible: 'pratiques_regulieres',
    victoire_21j: true,
    comparaison_reprise: true
  }
};

/**
 * ============================================================================
 * RÉFÉRENTIEL COMPLET
 * ============================================================================
 * Export de tous les critères pour génération dynamique
 */
export const REFERENTIEL_CRITERES_CRISTALLISATION = {
  extras_frequents: CRITERE_EXTRAS_FREQUENTS,
  feculents_soir: CRITERE_FECULENTS_SOIR,
  qn_faible: CRITERE_QN_FAIBLE,
  quantites_excessives: CRITERE_QUANTITES_EXCESSIVES,
  jeunes_irreguliers: CRITERE_JEUNES_IRREGULIERS,
  pratiques_spirituelles_faibles: CRITERE_PRATIQUES_SPIRITUELLES
};

/**
 * ============================================================================
 * FONCTION GÉNÉRATION CRITÈRES PERSONNALISÉS
 * ============================================================================
 * Génère les critères actifs selon bilan_reprise
 * @param {Object} bilanReprise - Bilan transmis depuis reprise-alimentaire
 * @returns {Array} Critères personnalisés activés
 */
export function genererCriteresPersonnalises(bilanReprise) {
  const criteresActives = [];
  
  // Vérifier chaque critère
  Object.entries(REFERENTIEL_CRITERES_CRISTALLISATION).forEach(([key, critere]) => {
    // Évaluer condition d'activation
    const condition = critere.conditions_activation.formule;
    const estActive = evaluerCondition(condition, bilanReprise);
    
    if (estActive) {
      // Générer configuration personnalisée
      const config = critere.configuration.calcul_seuil(bilanReprise);
      
      criteresActives.push({
        id: critere.id,
        nom: critere.nom,
        type: key,
        ...config,
        messages: critere.messages,
        tracking: critere.tracking,
        validation_quotidienne: critere.configuration.validation_quotidienne,
        validation_hebdomadaire: critere.configuration.validation_hebdomadaire
      });
    }
  });
  
  return criteresActives;
}

/**
 * Évalue une condition d'activation de manière SÉCURISÉE (sans eval)
 * @param {String} formule - Formule à évaluer (ex: "bilan_reprise.extras.total > 10")
 * @param {Object} bilanReprise - Données bilan
 * @returns {Boolean}
 */
function evaluerCondition(formule, bilanReprise) {
  try {
    // Parser la formule de manière sécurisée
    // Format attendu: "bilan_reprise.chemin.vers.propriete OPERATEUR valeur"
    
    // Extraire les parties de la formule
    const regex = /bilan_reprise\.([a-zA-Z0-9_.]+)\s*(>|<|>=|<=|===|!==|==|!=)\s*([0-9]+(?:\.[0-9]+)?|true|false)/;
    const match = formule.match(regex);
    
    if (!match) {
      console.warn('Formule non reconnue:', formule);
      return false;
    }
    
    const [, chemin, operateur, valeurStr] = match;
    
    // Accéder à la propriété de manière sécurisée
    const valeurBilan = getNestedProperty(bilanReprise, chemin);
    
    if (valeurBilan === undefined) {
      console.warn(`Propriété ${chemin} non trouvée dans bilan_reprise`);
      return false;
    }
    
    // Convertir la valeur de comparaison
    let valeurComparaison;
    if (valeurStr === 'true') valeurComparaison = true;
    else if (valeurStr === 'false') valeurComparaison = false;
    else valeurComparaison = parseFloat(valeurStr);
    
    // Effectuer la comparaison de manière sécurisée
    return comparerValeurs(valeurBilan, operateur, valeurComparaison);
    
  } catch (error) {
    console.error('Erreur évaluation condition:', error);
    return false;
  }
}

/**
 * Accède à une propriété imbriquée de manière sécurisée
 * @param {Object} obj - Objet source
 * @param {String} chemin - Chemin vers propriété (ex: "extras.total")
 * @returns {*} Valeur ou undefined
 */
function getNestedProperty(obj, chemin) {
  return chemin.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Compare deux valeurs selon un opérateur
 * @param {*} valeur1 - Première valeur
 * @param {String} operateur - Opérateur de comparaison
 * @param {*} valeur2 - Seconde valeur
 * @returns {Boolean}
 */
function comparerValeurs(valeur1, operateur, valeur2) {
  switch (operateur) {
    case '>': return valeur1 > valeur2;
    case '<': return valeur1 < valeur2;
    case '>=': return valeur1 >= valeur2;
    case '<=': return valeur1 <= valeur2;
    case '===': return valeur1 === valeur2;
    case '==': return valeur1 == valeur2;
    case '!==': return valeur1 !== valeur2;
    case '!=': return valeur1 != valeur2;
    default:
      console.warn('Opérateur non reconnu:', operateur);
      return false;
  }
}

/**
 * Obtient le QN par catégorie (mapping standard)
 * @param {String} categorie - Catégorie aliment
 * @returns {Number} QN (1-5)
 */
function getQNParCategorie(categorie) {
  const mapping = {
    'legume': 5,
    'proteine': 4,
    'feculent': 3,
    'fruit': 4,
    'extra': 1,
    'matiere_grasse': 2
  };
  return mapping[categorie?.toLowerCase()] || 3;
}

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */
export default {
  REFERENTIEL_CRITERES_CRISTALLISATION,
  genererCriteresPersonnalises,
  // Export critères individuels
  CRITERE_EXTRAS_FREQUENTS,
  CRITERE_FECULENTS_SOIR,
  CRITERE_QN_FAIBLE,
  CRITERE_QUANTITES_EXCESSIVES,
  CRITERE_JEUNES_IRREGULIERS,
  CRITERE_PRATIQUES_SPIRITUELLES
};

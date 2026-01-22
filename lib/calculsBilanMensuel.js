import { supabase } from './supabaseClient';
import { getDatesExactesMois } from './detectionFinMois';

/**
 * calculsBilanMensuel.js
 * 
 * Fonctions de calcul pour générer les 6 sections du bilan mensuel
 * Phase 2 : Structure vide avec TODOs
 * Phase 3-8 : Implémentation des calculs pour chaque section
 */

/**
 * Section 1: Tendance poids & objectif
 * 
 * Calcule:
 * - poids_debut: Premier poids saisi du mois
 * - poids_fin: Dernier poids saisi du mois
 * - evolution_kg: Différence en kg
 * - evolution_pourcent: Différence en %
 * - trajectoire: "excellente" | "bonne" | "attention" | "difficile"
 * - poids_mois_prochain: Projection basée sur tendance
 * 
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_1_tendance_poids
 * 
 * Note: Utilise RLS Supabase pour isolation utilisateur (pas besoin de userId explicite)
 */
export async function calculerSection1TendancePoids(mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 1 - Tendance poids', { mois, annee });
    
    // 1. Récupérer dates exactes du mois
    const { debut, fin } = getDatesExactesMois(mois, annee);
    console.log('[CALCUL BILAN] Période:', { debut, fin });
    
    // 2. Query historique_poids pour la période
    // Note: La table utilise RLS, pas besoin de .eq('user_id', userId)
    const { data: poids, error } = await supabase
      .from('historique_poids')
      .select('date, poids')
      .gte('date', debut)
      .lte('date', fin)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('[CALCUL BILAN] Erreur query historique_poids:', error);
      return null;
    }
    
    // Validation: besoin d'au moins 2 pesées
    if (!poids || poids.length < 2) {
      console.log('[CALCUL BILAN] Données insuffisantes:', poids?.length || 0, 'pesées');
      
      // Essayer de récupérer la projection du mois précédent
      const moisPrecedent = mois === 1 ? 12 : mois - 1;
      const anneePrecedente = mois === 1 ? annee - 1 : annee;
      
      const { data: bilanPrecedent } = await supabase
        .from('bilans_mensuels')
        .select('section_1_tendance_poids')
        .eq('mois', moisPrecedent)
        .eq('annee', anneePrecedente)
        .maybeSingle();
      
      const projectionPrecedente = bilanPrecedent?.section_1_tendance_poids?.poids_mois_prochain || null;
      console.log('[CALCUL BILAN] Projection mois précédent:', projectionPrecedente);
      
      // Chercher le dernier poids connu (toutes dates avant ce mois)
      let dernierPoidsConnu = null;
      if (poids?.length === 0) {
        const { data: dernierPoids } = await supabase
          .from('historique_poids')
          .select('date, poids')
          .lt('date', debut)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (dernierPoids) {
          const dateDebut = new Date(debut);
          const dateDernierPoids = new Date(dernierPoids.date);
          const diffMs = dateDebut - dateDernierPoids;
          const ancienneteMois = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
          
          dernierPoidsConnu = {
            poids: dernierPoids.poids,
            date: dernierPoids.date,
            anciennete_mois: ancienneteMois
          };
          console.log('[CALCUL BILAN] Dernier poids connu:', dernierPoidsConnu);
        }
      }
      
      return {
        erreur: 'donnees_insuffisantes',
        message: 'Au moins 2 pesées nécessaires pour calculer la tendance',
        nb_pesees: poids?.length || 0,
        projection_precedente: projectionPrecedente,
        pesee_unique: poids?.length === 1 ? poids[0].poids : null,
        dernier_poids_connu: dernierPoidsConnu
      };
    }
    
    // 3. Calculer évolution
    const poids_debut = poids[0].poids;
    const poids_fin = poids[poids.length - 1].poids;
    const evolution_kg = poids_fin - poids_debut;
    const evolution_pourcent = (evolution_kg / poids_debut) * 100;
    
    console.log('[CALCUL BILAN] Évolution:', {
      poids_debut,
      poids_fin,
      evolution_kg: evolution_kg.toFixed(2),
      evolution_pourcent: evolution_pourcent.toFixed(2)
    });
    
    // 4. Déterminer trajectoire (basée sur évolution kg)
    let trajectoire = 'stable';
    let emoji_trajectoire = '➡️';
    let couleur_trajectoire = '#64748b'; // Gris
    
    if (evolution_kg <= -2) {
      trajectoire = 'excellente';
      emoji_trajectoire = '🌟';
      couleur_trajectoire = '#22c55e'; // Vert foncé
    } else if (evolution_kg <= -0.8) {
      trajectoire = 'bonne';
      emoji_trajectoire = '✅';
      couleur_trajectoire = '#10b981'; // Vert
    } else if (evolution_kg <= -0.3) {
      trajectoire = 'stable_positive';
      emoji_trajectoire = '👍';
      couleur_trajectoire = '#84cc16'; // Vert clair
    } else if (evolution_kg <= 0.3) {
      trajectoire = 'stable';
      emoji_trajectoire = '➡️';
      couleur_trajectoire = '#64748b'; // Gris
    } else if (evolution_kg <= 0.8) {
      trajectoire = 'attention';
      emoji_trajectoire = '⚠️';
      couleur_trajectoire = '#f59e0b'; // Orange
    } else if (evolution_kg <= 1.5) {
      trajectoire = 'difficile';
      emoji_trajectoire = '🔴';
      couleur_trajectoire = '#ef4444'; // Rouge
    } else {
      trajectoire = 'critique';
      emoji_trajectoire = '🚨';
      couleur_trajectoire = '#dc2626'; // Rouge foncé
    }
    
    // 5. Projeter mois suivant (extrapolation linéaire)
    const poids_mois_prochain = parseFloat((poids_fin + evolution_kg).toFixed(1));
    
    // 6. Calculer moyenne mensuelle
    const somme_poids = poids.reduce((sum, p) => sum + p.poids, 0);
    const poids_moyen = parseFloat((somme_poids / poids.length).toFixed(1));
    
    // 7. Identifier poids min/max du mois
    const poids_min = Math.min(...poids.map(p => p.poids));
    const poids_max = Math.max(...poids.map(p => p.poids));
    const amplitude = poids_max - poids_min;
    
    // 8. Préparer courbe pour graphique (tous les points)
    const courbe_poids = poids.map(p => ({
      date: p.date,
      poids: p.poids
    }));
    
    const result = {
      poids_debut,
      poids_fin,
      evolution_kg: parseFloat(evolution_kg.toFixed(2)),
      evolution_pourcent: parseFloat(evolution_pourcent.toFixed(2)),
      trajectoire,
      emoji_trajectoire,
      couleur_trajectoire,
      poids_mois_prochain,
      poids_moyen,
      poids_min,
      poids_max,
      amplitude: parseFloat(amplitude.toFixed(1)),
      nb_pesees: poids.length,
      courbe_poids,
      date_debut: poids[0].date,
      date_fin: poids[poids.length - 1].date
    };
    
    console.log('[CALCUL BILAN] ✅ Section 1 calculée:', result);
    return result;
  } catch (err) {
    console.error('[CALCUL BILAN] Erreur Section 1:', err);
    return null;
  }
}

/**
 * Section 2: Budget calorique
 * 
 * Calcule:
 * - total_consomme: Somme kcal de tous repas du mois
 * - budget_mensuel: objectif_jour * nb_jours
 * - ecart_budget: total - budget
 * - moyenne_jour: total / nb_jours
 * - repartition_repas: { petit_dejeuner: X, dejeuner: Y, diner: Z, collation: W }
 * - repartition_extras: { matin: X, apres_midi: Y, soir: Z }
 * 
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @param {number} objectifCaloriqueJour - Objectif calorique journalier
 * @returns {Promise<Object|null>} JSONB section_2_budget_calorique
 */
export async function calculerSection2BudgetCalorique(mois, annee, objectifCaloriqueJour = 1900) {
  try {
    console.log('[CALCUL BILAN] Section 2 - Budget calorique', { mois, annee, objectifCaloriqueJour });
    
    // 1. Récupérer dates exactes du mois
    const { debut, fin } = getDatesExactesMois(mois, annee);
    const nbJoursTotal = new Date(annee, mois, 0).getDate();
    console.log('[CALCUL BILAN] Période:', { debut, fin, nbJoursTotal });
    
    // 2. Query repas_reels pour période
    console.log('[CALCUL BILAN] Requête repas_reels...');
    const { data: repas, error } = await supabase
      .from('repas_reels')
      .select('date, type, kcal, est_extra')
      .gte('date', debut)
      .lte('date', fin);
    
    console.log(`[CALCUL BILAN] Repas récupérés: ${repas?.length || 0} enregistrements`);
    if (repas && repas.length > 0) {
      console.log('[CALCUL BILAN] Premier repas:', repas[0]);
    }
    
    if (error) {
      console.error('[CALCUL BILAN] Erreur query repas_reels:', error);
      return null;
    }
    
    // Validation: au moins 1 repas
    if (!repas || repas.length === 0) {
      console.log('[CALCUL BILAN] Aucun repas trouvé');
      return {
        erreur: 'aucun_repas',
        message: 'Aucun repas enregistré ce mois-ci',
        nb_repas: 0
      };
    }
    
    console.log('[CALCUL BILAN] Repas trouvés:', repas.length);
    
    // 3. Calculer totaux
    const total_consomme = repas.reduce((sum, r) => sum + (r.kcal || 0), 0);
    const budget_mensuel = objectifCaloriqueJour * nbJoursTotal;
    const ecart_budget = total_consomme - budget_mensuel;
    const ecart_pourcent = (ecart_budget / budget_mensuel) * 100;
    
    const joursUniques = new Set(repas.map(r => r.date)).size;
    const moyenne_jour = joursUniques > 0 ? total_consomme / joursUniques : 0;
    
    console.log('[CALCUL BILAN] Budget:', {
      total_consomme,
      budget_mensuel,
      ecart_budget,
      ecart_pourcent: ecart_pourcent.toFixed(2)
    });
    
    // 4. Répartition par type de repas
    const typesRepas = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];
    const repartition_repas = typesRepas.map(type => {
      const repasType = repas.filter(r => r.type === type);
      const total = repasType.reduce((sum, r) => sum + (r.kcal || 0), 0);
      const pourcent = total_consomme > 0 ? (total / total_consomme) * 100 : 0;
      return {
        type,
        total,
        pourcent: parseFloat(pourcent.toFixed(1)),
        nb_repas: repasType.length
      };
    });
    
    // 5. Répartition extras par moment (calculé depuis type de repas)
    const repasExtras = repas.filter(r => r.est_extra === true);
    const nb_extras = repasExtras.length;
    
    // Fonction pour déterminer le moment depuis le type de repas
    const getMomentFromType = (type) => {
      if (type === 'Petit-déjeuner') return 'matin';
      if (type === 'Déjeuner') return 'apres_midi';
      if (type === 'Dîner') return 'soir';
      if (type === 'Collation') return 'apres_midi'; // Par défaut collation = après-midi
      return 'soir'; // Fallback
    };
    
    const moments = ['matin', 'apres_midi', 'soir'];
    const repartition_extras = moments.map(moment => {
      const extrasM = repasExtras.filter(r => getMomentFromType(r.type) === moment);
      const count = extrasM.length;
      const pourcent = nb_extras > 0 ? (count / nb_extras) * 100 : 0;
      return {
        moment,
        count,
        pourcent: parseFloat(pourcent.toFixed(1))
      };
    });
    
    const extras_moyens_jour = joursUniques > 0 ? nb_extras / joursUniques : 0;
    
    const result = {
      total_consomme,
      budget_mensuel,
      ecart_budget,
      ecart_pourcent: parseFloat(ecart_pourcent.toFixed(1)),
      moyenne_jour: parseFloat(moyenne_jour.toFixed(0)),
      repartition_repas,
      repartition_extras,
      nb_jours_saisis: joursUniques,
      nb_jours_total: nbJoursTotal,
      nb_extras,
      extras_moyens_jour: parseFloat(extras_moyens_jour.toFixed(1)),
      nb_repas_total: repas.length
    };
    
    console.log('[CALCUL BILAN] ✅ Section 2 calculée:', result);
    return result;
  } catch (err) {
    console.error('[CALCUL BILAN] ❌ Erreur Section 2:', error);
    console.error('[CALCUL BILAN] Stack trace:', error.stack);
    return null;
  }
}

/**
 * Section 3: Patterns comportementaux
 * 
 * Calcule:
 * - jours_conformes: Nombre de jours où budget respecté
 * - jours_depasses: Nombre de jours où budget dépassé
 * - points_forts: ["Budget respecté 85% du temps", "Extras maîtrisés", ...]
 * - points_amelioration: ["Excès récurrents le weekend", "Soir difficile", ...]
 * - insights_temporels: { weekend_vs_semaine, moments_critiques }
 * 
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @param {number} objectifCaloriqueJour - Objectif calorique journalier
 * @returns {Promise<Object|null>} JSONB section_3_patterns
 */
export async function calculerSection3Patterns(mois, annee, objectifCaloriqueJour = 1900) {
  try {
    console.log('[CALCUL BILAN] Section 3 - Patterns comportementaux', { mois, annee });
    
    // 1. Récupérer tous les repas du mois
    const { debut, fin } = getDatesExactesMois(mois, annee);
    const { data: repas, error } = await supabase
      .from('repas_reels')
      .select('date, type, kcal, est_extra')
      .gte('date', debut)
      .lte('date', fin);
    
    if (error) {
      console.error('[CALCUL BILAN] Erreur query repas:', error);
      return null;
    }
    
    if (!repas || repas.length === 0) {
      return {
        erreur: 'aucun_repas',
        message: 'Aucune donnée pour analyser les patterns'
      };
    }
    
    // 2. Grouper les repas par jour et calculer les calories quotidiennes
    const repasByDate = {};
    repas.forEach(r => {
      if (!repasByDate[r.date]) {
        repasByDate[r.date] = { total: 0, extras: 0, repas: [] };
      }
      repasByDate[r.date].total += r.kcal || 0;
      if (r.est_extra) repasByDate[r.date].extras++;
      repasByDate[r.date].repas.push(r);
    });
    
    // 3. Analyser conformité (jours dans le budget ±10%)
    const joursAnalyses = Object.keys(repasByDate);
    const margeToleranceHaut = objectifCaloriqueJour * 1.1; // +10%
    const margeToleranceBas = objectifCaloriqueJour * 0.9;  // -10%
    
    let jours_conformes = 0;
    let jours_depasses = 0;
    let jours_sous_objectif = 0;
    
    joursAnalyses.forEach(date => {
      const total = repasByDate[date].total;
      if (total >= margeToleranceBas && total <= margeToleranceHaut) {
        jours_conformes++;
      } else if (total > margeToleranceHaut) {
        jours_depasses++;
      } else {
        jours_sous_objectif++;
      }
    });
    
    const taux_conformite = (jours_conformes / joursAnalyses.length) * 100;
    
    // 4. Analyser weekend vs semaine
    let kcal_weekend = 0;
    let jours_weekend = 0;
    let kcal_semaine = 0;
    let jours_semaine = 0;
    
    joursAnalyses.forEach(date => {
      const dayOfWeek = new Date(date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (isWeekend) {
        kcal_weekend += repasByDate[date].total;
        jours_weekend++;
      } else {
        kcal_semaine += repasByDate[date].total;
        jours_semaine++;
      }
    });
    
    const moyenne_weekend = jours_weekend > 0 ? kcal_weekend / jours_weekend : 0;
    const moyenne_semaine = jours_semaine > 0 ? kcal_semaine / jours_semaine : 0;
    const ecart_weekend_semaine = moyenne_weekend - moyenne_semaine;
    
    // 5. Identifier les moments critiques (types de repas problématiques)
    const caloriesByType = {};
    const countByType = {};
    
    repas.forEach(r => {
      if (!caloriesByType[r.type]) {
        caloriesByType[r.type] = 0;
        countByType[r.type] = 0;
      }
      caloriesByType[r.type] += r.kcal || 0;
      countByType[r.type]++;
    });
    
    const moyennesByType = {};
    Object.keys(caloriesByType).forEach(type => {
      moyennesByType[type] = caloriesByType[type] / countByType[type];
    });
    
    // 6. Générer points forts
    const points_forts = [];
    
    if (taux_conformite >= 80) {
      points_forts.push(`Excellente régularité : ${Math.round(taux_conformite)}% des jours dans l'objectif`);
    } else if (taux_conformite >= 60) {
      points_forts.push(`Bonne régularité : ${Math.round(taux_conformite)}% des jours dans l'objectif`);
    }
    
    const extras_total = repas.filter(r => r.est_extra).length;
    const extras_par_jour = extras_total / joursAnalyses.length;
    if (extras_par_jour < 0.5) {
      points_forts.push('Extras très bien maîtrisés (moins de 1 tous les 2 jours)');
    } else if (extras_par_jour < 1) {
      points_forts.push('Extras bien gérés (moins de 1 par jour)');
    }
    
    if (Math.abs(ecart_weekend_semaine) < 200) {
      points_forts.push('Cohérence weekend/semaine : écart minimal');
    }
    
    // 7. Générer points d'amélioration
    const points_amelioration = [];
    
    if (jours_depasses > jours_conformes) {
      points_amelioration.push(`Dépassements fréquents : ${jours_depasses} jours sur ${joursAnalyses.length}`);
    }
    
    if (ecart_weekend_semaine > 300) {
      points_amelioration.push(`Excès le weekend : +${Math.round(ecart_weekend_semaine)} kcal/jour en moyenne`);
    }
    
    if (extras_par_jour > 1.5) {
      points_amelioration.push(`Extras trop fréquents : ${extras_par_jour.toFixed(1)} par jour en moyenne`);
    }
    
    // Identifier le type de repas le plus calorique
    const typeMaxCalories = Object.keys(moyennesByType).reduce((a, b) => 
      moyennesByType[a] > moyennesByType[b] ? a : b
    );
    if (moyennesByType[typeMaxCalories] > objectifCaloriqueJour * 0.4) {
      points_amelioration.push(`${typeMaxCalories} trop copieux : ${Math.round(moyennesByType[typeMaxCalories])} kcal en moyenne`);
    }
    
    // Si aucun point fort, ajouter un encouragement
    if (points_forts.length === 0) {
      points_forts.push('Marge de progression identifiée, tu vas y arriver !');
    }
    
    // Si aucun point d'amélioration, féliciter
    if (points_amelioration.length === 0) {
      points_amelioration.push('Aucun point majeur à améliorer, continue comme ça ! 🎉');
    }
    
    const result = {
      jours_conformes,
      jours_depasses,
      jours_sous_objectif,
      taux_conformite: parseFloat(taux_conformite.toFixed(1)),
      points_forts,
      points_amelioration,
      insights_temporels: {
        moyenne_weekend: Math.round(moyenne_weekend),
        moyenne_semaine: Math.round(moyenne_semaine),
        ecart_weekend_semaine: Math.round(ecart_weekend_semaine),
        jours_weekend,
        jours_semaine
      },
      moments_critiques: moyennesByType,
      nb_jours_analyses: joursAnalyses.length
    };
    
    console.log('[CALCUL BILAN] ✅ Section 3 calculée:', result);
    return result;
  } catch (err) {
    console.error('[CALCUL BILAN] ❌ Erreur Section 3:', err);
    console.error('[CALCUL BILAN] Stack:', err.stack);
    return null;
  }
}

/**
 * Section 4: Qualité nutritionnelle
 * 
 * Calcule:
 * - distribution_qn: { "1": 5, "2": 8, "3": 12, "4": 7, "5": 3 }
 * - moyenne_qn: Moyenne pondérée
 * - tendance: "amelioration" | "stable" | "deterioration" (vs mois N-1)
 * - progression_vs_mois_precedent: +0.3 points
 * - meilleurs_repas: Top 3 repas avec QN=5
 * - repas_a_ameliorer: Top 3 repas avec QN=1
 * 
 * @param {string} userId - UUID utilisateur
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_4_qualite_nutritionnelle
 */
export async function calculerSection4QualiteNutritionnelle(userId, mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 4 - Qualité nutritionnelle', { userId, mois, annee });
    
    // TODO Phase 6: Implémenter calcul
    // 1. Query repas_reels avec champ qualite_nutritionnelle
    // 2. Calculer distribution QN 1-5
    // 3. Calculer moyenne
    // 4. Comparer avec mois précédent
    // 5. Identifier meilleurs/pires repas
    
    return null; // TODO Phase 6
  } catch (err) {
    console.error('[CALCUL BILAN] Erreur Section 4:', err);
    return null;
  }
}

/**
 * Section 5: Bien-être & ressentis
 * 
 * Calcule:
 * - moyenne_satiete: Moyenne des scores satiété (1-5)
 * - moyenne_humeur: Moyenne des scores humeur (1-5)
 * - distribution_satiete: { "1": X, "2": Y, "3": Z, "4": W, "5": V }
 * - distribution_humeur: Idem
 * - semaines_critiques: [{ semaine: 3, raison: "Satiété faible + humeur négative" }]
 * - jours_excellents: Nombre de jours avec satiété=5 ET humeur=5
 * 
 * @param {string} userId - UUID utilisateur
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_5_bien_etre
 */
export async function calculerSection5BienEtre(userId, mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 5 - Bien-être & ressentis', { userId, mois, annee });
    
    // TODO Phase 7: Implémenter calcul
    // 1. Query repas_reels avec champs satiete + ressenti
    // 2. Mapper texte vers scores (1-5)
    // 3. Calculer moyennes + distributions
    // 4. Identifier semaines critiques (moyenne < 3)
    // 5. Compter jours excellents
    
    return null; // TODO Phase 7
  } catch (err) {
    console.error('[CALCUL BILAN] Erreur Section 5:', err);
    return null;
  }
}

/**
 * Section 6: Projection mois suivant
 * 
 * Génère:
 * - objectif_poids: Poids cible pour fin du mois suivant
 * - objectif_budget: Budget calorique recommandé
 * - ajustements_strategiques: ["Réduire extras de 20%", "Améliorer QN soir", ...]
 * - points_vigilance: ["Weekend à surveiller", "Stress au travail"]
 * - checkpoints_hebdo: [
 *     { semaine: 1, objectif: "Stabiliser extras" },
 *     { semaine: 2, objectif: "Améliorer QN soir" },
 *     { semaine: 3, objectif: "Confirmer tendance poids" },
 *     { semaine: 4, objectif: "Préparer validation mensuelle" }
 *   ]
 * 
 * @param {string} userId - UUID utilisateur
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_6_projection
 */
export async function calculerSection6Projection(userId, mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 6 - Projection mois suivant', { userId, mois, annee });
    
    // TODO Phase 8: Implémenter calcul
    // 1. Récupérer données sections 1-5
    // 2. Générer objectif poids basé sur tendance
    // 3. Générer recommandations budget
    // 4. Identifier ajustements prioritaires
    // 5. Créer points vigilance
    // 6. Générer 4 checkpoints hebdo
    
    return null; // TODO Phase 8
  } catch (err) {
    console.error('[CALCUL BILAN] Erreur Section 6:', err);
    return null;
  }
}

/**
 * Génère le bilan mensuel complet avec les 6 sections
 * et l'insère dans la table bilans_mensuels
 * 
 * @param {string} userId - UUID utilisateur
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} Bilan complet ou null si erreur
 */
export async function genererBilanCompletMensuel(userId, mois, annee) {
  try {
    console.log('[CALCUL BILAN] Génération bilan complet', { userId, mois, annee });
    
    // Récupérer dates exactes
    const { debut, fin } = getDatesExactesMois(mois, annee);
    
    // TODO Phase 3-8: Appeler les 6 fonctions de calcul
    const section1 = await calculerSection1TendancePoids(userId, mois, annee);
    const section2 = await calculerSection2BudgetCalorique(userId, mois, annee);
    const section3 = await calculerSection3Patterns(userId, mois, annee);
    const section4 = await calculerSection4QualiteNutritionnelle(userId, mois, annee);
    const section5 = await calculerSection5BienEtre(userId, mois, annee);
    const section6 = await calculerSection6Projection(userId, mois, annee);
    
    // Calculer métadonnées
    const { data: repas } = await supabase
      .from('repas_reels')
      .select('date')
      .eq('user_id', userId)
      .gte('date', debut)
      .lte('date', fin);
    
    const joursUniques = new Set(repas?.map(r => r.date) || []);
    const nb_jours_saisis = joursUniques.size;
    
    // Calculer nombre de jours total du mois
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    const nb_jours_total = Math.round((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;
    
    const taux_remplissage = nb_jours_total > 0 ? (nb_jours_saisis / nb_jours_total) * 100 : 0;
    
    // Compter repas et extras
    const { data: repasDetails } = await supabase
      .from('repas_reels')
      .select('is_extra')
      .eq('user_id', userId)
      .gte('date', debut)
      .lte('date', fin);
    
    const nb_repas_total = repasDetails?.length || 0;
    const nb_extras_total = repasDetails?.filter(r => r.is_extra).length || 0;
    
    // Insérer dans bilans_mensuels
    const { data: bilan, error } = await supabase
      .from('bilans_mensuels')
      .insert({
        user_id: userId,
        mois,
        annee,
        date_debut_periode: debut,
        date_fin_periode: fin,
        valide: false,
        section_1_tendance_poids: section1,
        section_2_budget_calorique: section2,
        section_3_patterns: section3,
        section_4_qualite_nutritionnelle: section4,
        section_5_bien_etre: section5,
        section_6_projection: section6,
        nb_jours_total,
        nb_jours_saisis,
        taux_remplissage,
        nb_repas_total,
        nb_extras_total
      })
      .select()
      .single();
    
    if (error) {
      console.error('[CALCUL BILAN] Erreur insertion:', error);
      return null;
    }
    
    console.log('[CALCUL BILAN] ✅ Bilan généré et sauvegardé', bilan.id);
    return bilan;
  } catch (err) {
    console.error('[CALCUL BILAN] Erreur génération bilan:', err);
    return null;
  }
}

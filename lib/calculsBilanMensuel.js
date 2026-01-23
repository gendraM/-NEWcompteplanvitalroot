import { supabase } from './supabaseClient';
import { getDatesExactesMois } from './detectionFinMois';
import { calculerProfilComplet } from './routeurPoids';

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
 * - repartition_categories: { proteines: X%, feculents: Y%, legumes: Z%, fruits: W%, extras: V% }
 * - nb_fast_food: Nombre de repas fast-food
 * - fast_food_frequence: Moyenne par semaine
 * - score_qualite: Score global 0-100 basé sur équilibre
 * - points_attention: ["Trop de féculents", "Pas assez de légumes"...]
 * 
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_4_qualite_nutritionnelle
 */
export async function calculerSection4QualiteNutritionnelle(mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 4 - Qualité nutritionnelle', { mois, annee });
    
    // 1. Récupérer tous les repas du mois avec catégories
    const { debut, fin } = getDatesExactesMois(mois, annee);
    const { data: repas, error } = await supabase
      .from('repas_reels')
      .select('id, date, type, aliment, categorie, kcal, tag')
      .gte('date', debut)
      .lte('date', fin);
    
    if (error) {
      console.error('[CALCUL BILAN] Erreur query repas:', error);
      return null;
    }
    
    if (!repas || repas.length === 0) {
      return {
        erreur: 'aucun_repas',
        message: 'Aucune donnée pour analyser la qualité nutritionnelle'
      };
    }
    
    // 2. Compter les catégories
    const categories = {
      'protéine': 0,
      'féculent': 0,
      'légume': 0,
      'fruit': 0,
      'extra': 0,
      'autre': 0
    };
    
    repas.forEach(r => {
      const cat = r.categorie?.toLowerCase() || 'autre';
      if (categories[cat] !== undefined) {
        categories[cat]++;
      } else {
        categories['autre']++;
      }
    });
    
    const total_repas = repas.length;
    
    // 3. Calculer pourcentages
    const repartition_categories = Object.keys(categories).map(cat => ({
      categorie: cat,
      nombre: categories[cat],
      pourcent: parseFloat(((categories[cat] / total_repas) * 100).toFixed(1))
    })).filter(c => c.nombre > 0); // Garder seulement les catégories présentes
    
    // 4. Analyser fast-food
    const fast_food = repas.filter(r => 
      r.tag?.toLowerCase().includes('fast-food') || 
      r.aliment?.toLowerCase().includes('mcdonald') ||
      r.aliment?.toLowerCase().includes('burger') ||
      r.aliment?.toLowerCase().includes('kfc')
    );
    
    const nb_fast_food = fast_food.length;
    const nbJoursTotal = new Date(annee, mois, 0).getDate();
    const nb_semaines = nbJoursTotal / 7;
    const fast_food_par_semaine = nb_fast_food / nb_semaines;
    
    // 5. Calculer score de qualité (0-100)
    let score_qualite = 100;
    
    // Pénalités
    const pct_proteines = (categories['protéine'] / total_repas) * 100;
    const pct_legumes = (categories['légume'] / total_repas) * 100;
    const pct_feculents = (categories['féculent'] / total_repas) * 100;
    const pct_extras = (categories['extra'] / total_repas) * 100;
    
    // Pas assez de protéines (<20%)
    if (pct_proteines < 20) score_qualite -= 15;
    
    // Pas assez de légumes (<25%)
    if (pct_legumes < 25) score_qualite -= 20;
    
    // Trop de féculents (>40%)
    if (pct_feculents > 40) score_qualite -= 15;
    
    // Trop d'extras (>20%)
    if (pct_extras > 20) score_qualite -= 20;
    
    // Fast-food fréquent (>1/semaine)
    if (fast_food_par_semaine > 1) score_qualite -= 15;
    
    score_qualite = Math.max(0, score_qualite); // Minimum 0
    
    // 6. Générer points d'attention
    const points_attention = [];
    
    if (pct_proteines < 20) {
      points_attention.push(`Pas assez de protéines : ${pct_proteines.toFixed(0)}% (recommandé: 25-30%)`);
    }
    
    if (pct_legumes < 25) {
      points_attention.push(`Manque de légumes : ${pct_legumes.toFixed(0)}% (recommandé: 30-40%)`);
    }
    
    if (pct_feculents > 40) {
      points_attention.push(`Excès de féculents : ${pct_feculents.toFixed(0)}% (recommandé: 20-30%)`);
    }
    
    if (pct_extras > 20) {
      points_attention.push(`Trop d'extras : ${pct_extras.toFixed(0)}% (à limiter à 10-15%)`);
    }
    
    if (fast_food_par_semaine > 1) {
      points_attention.push(`Fast-food trop fréquent : ${fast_food_par_semaine.toFixed(1)} par semaine (max: 1)`);
    }
    
    // 7. Générer points positifs
    const points_positifs = [];
    
    if (pct_proteines >= 25) {
      points_positifs.push('Bon apport en protéines');
    }
    
    if (pct_legumes >= 30) {
      points_positifs.push('Excellente consommation de légumes');
    }
    
    if (fast_food_par_semaine <= 0.5) {
      points_positifs.push('Fast-food bien maîtrisé');
    }
    
    if (pct_extras <= 15) {
      points_positifs.push('Extras limités, bravo !');
    }
    
    // Si aucun point positif, encouragement
    if (points_positifs.length === 0) {
      points_positifs.push('Continue tes efforts, tu vas y arriver !');
    }
    
    const result = {
      repartition_categories,
      nb_fast_food,
      fast_food_par_semaine: parseFloat(fast_food_par_semaine.toFixed(1)),
      score_qualite: Math.round(score_qualite),
      points_attention,
      points_positifs,
      nb_repas_total: total_repas,
      equilibre: {
        proteines: pct_proteines.toFixed(1),
        legumes: pct_legumes.toFixed(1),
        feculents: pct_feculents.toFixed(1),
        extras: pct_extras.toFixed(1)
      }
    };
    
    console.log('[CALCUL BILAN] ✅ Section 4 calculée:', result);
    return result;
  } catch (err) {
    console.error('[CALCUL BILAN] ❌ Erreur Section 4:', err);
    console.error('[CALCUL BILAN] Stack:', err.stack);
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
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_5_bien_etre
 */
export async function calculerSection5BienEtre(mois, annee) {
  try {
    console.log('[CALCUL BILAN] === DÉBUT SECTION 5 - Bien-être & ressentis ===');
    console.log('[CALCUL BILAN] Paramètres:', { mois, annee });
    
    // Récupérer dates du mois
    const { debut, fin } = getDatesExactesMois(mois, annee);
    console.log('[CALCUL BILAN] Période:', debut, '→', fin);
    
    // Query repas avec satiété, ressenti ET données croisées (type, catégorie, extras, tags)
    const { data: repas, error } = await supabase
      .from('repas_reels')
      .select('date, satiete, ressenti, type, categorie, est_extra, tag, aliment, kcal')
      .gte('date', debut)
      .lte('date', fin)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('[CALCUL BILAN] Erreur query repas:', error);
      throw error;
    }
    
    console.log('[CALCUL BILAN] Repas récupérés:', repas?.length || 0);
    
    if (!repas || repas.length === 0) {
      console.log('[CALCUL BILAN] Aucun repas trouvé');
      return { erreur: 'aucun_repas' };
    }
    
    // Mapping satiété texte → score (1-5)
    const mapSatieteScore = (satieteTexte) => {
      if (!satieteTexte) return null;
      const map = {
        'oui': 5,                // Respecté satiété = excellent
        'non': 2,                // Dépassé = faible
        'pas de faim': 3         // Mangé sans faim = moyen
      };
      return map[satieteTexte] || null;
    };
    
    // Mapping ressenti → score (1-5)
    const mapRessentiScore = (ressentiTexte) => {
      if (!ressentiTexte) return null;
      const map = {
        'léger': 5, 'satisfait': 5,
        "j'assume": 4,
        'neutre': 3,
        'lourd': 2,
        'ballonné': 1, 'je regrette': 1, 'je culpabilise': 1
      };
      return map[ressentiTexte] || null;
    };
    
    // Calculs satiété
    const repasAvecSatiete = repas.filter(r => r.satiete);
    const scoresSatiete = repasAvecSatiete.map(r => mapSatieteScore(r.satiete)).filter(s => s !== null);
    
    const moyenne_satiete = scoresSatiete.length > 0
      ? (scoresSatiete.reduce((sum, s) => sum + s, 0) / scoresSatiete.length)
      : 0;
    
    // Distribution satiété
    const distribution_satiete = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    scoresSatiete.forEach(score => {
      distribution_satiete[score.toString()]++;
    });
    
    // Calculs ressenti (humeur)
    const repasAvecRessenti = repas.filter(r => r.ressenti);
    const scoresRessenti = repasAvecRessenti.map(r => mapRessentiScore(r.ressenti)).filter(s => s !== null);
    
    const moyenne_humeur = scoresRessenti.length > 0
      ? (scoresRessenti.reduce((sum, s) => sum + s, 0) / scoresRessenti.length)
      : 0;
    
    // Distribution humeur
    const distribution_humeur = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    scoresRessenti.forEach(score => {
      distribution_humeur[score.toString()]++;
    });
    
    // Grouper par jour pour analyses avancées
    const repasByDate = {};
    repas.forEach(r => {
      const date = r.date;
      if (!repasByDate[date]) {
        repasByDate[date] = { satiete: [], ressenti: [] };
      }
      
      const scoreSat = mapSatieteScore(r.satiete);
      const scoreRes = mapRessentiScore(r.ressenti);
      
      if (scoreSat !== null) repasByDate[date].satiete.push(scoreSat);
      if (scoreRes !== null) repasByDate[date].ressenti.push(scoreRes);
    });
    
    // Jours excellents (satiété=5 ET humeur=5 en moyenne du jour)
    let jours_excellents = 0;
    Object.values(repasByDate).forEach(jour => {
      const moyenneSatJour = jour.satiete.length > 0
        ? jour.satiete.reduce((s, v) => s + v, 0) / jour.satiete.length
        : 0;
      const moyenneResJour = jour.ressenti.length > 0
        ? jour.ressenti.reduce((s, v) => s + v, 0) / jour.ressenti.length
        : 0;
      
      if (moyenneSatJour === 5 && moyenneResJour === 5) {
        jours_excellents++;
      }
    });
    
    // Analyse par semaine pour identifier semaines critiques
    const semaines_critiques = [];
    const joursParSemaine = {};
    
    Object.entries(repasByDate).forEach(([dateStr, jour]) => {
      const date = new Date(dateStr);
      const debutMois = new Date(annee, mois - 1, 1);
      const diffJours = Math.floor((date - debutMois) / (1000 * 60 * 60 * 24));
      const numSemaine = Math.floor(diffJours / 7) + 1;
      
      if (!joursParSemaine[numSemaine]) {
        joursParSemaine[numSemaine] = { satiete: [], ressenti: [] };
      }
      
      joursParSemaine[numSemaine].satiete.push(...jour.satiete);
      joursParSemaine[numSemaine].ressenti.push(...jour.ressenti);
    });
    
    // Identifier semaines avec moyenne < 3 (critique)
    Object.entries(joursParSemaine).forEach(([numSemaine, donnees]) => {
      const moyenneSat = donnees.satiete.length > 0
        ? donnees.satiete.reduce((s, v) => s + v, 0) / donnees.satiete.length
        : 0;
      const moyenneRes = donnees.ressenti.length > 0
        ? donnees.ressenti.reduce((s, v) => s + v, 0) / donnees.ressenti.length
        : 0;
      
      const raisons = [];
      if (moyenneSat > 0 && moyenneSat < 3) raisons.push('satiété faible');
      if (moyenneRes > 0 && moyenneRes < 3) raisons.push('humeur négative');
      
      if (raisons.length > 0) {
        semaines_critiques.push({
          semaine: parseInt(numSemaine),
          raison: raisons.join(' + '),
          moyenne_satiete: parseFloat(moyenneSat.toFixed(1)),
          moyenne_humeur: parseFloat(moyenneRes.toFixed(1))
        });
      }
    });
    
    // Points positifs et d'amélioration
    const points_positifs = [];
    const points_amelioration = [];
    
    if (moyenne_satiete >= 4) {
      points_positifs.push(`Excellente écoute de la satiété (${moyenne_satiete.toFixed(1)}/5)`);
    }
    if (moyenne_humeur >= 4) {
      points_positifs.push(`État émotionnel très positif (${moyenne_humeur.toFixed(1)}/5)`);
    }
    if (jours_excellents > 0) {
      points_positifs.push(`${jours_excellents} jour(s) excellent(s) ce mois-ci`);
    }
    if (distribution_satiete["5"] > distribution_satiete["2"]) {
      points_positifs.push(`Plus souvent rassasié(e) que dépassé(e)`);
    }
    
    if (moyenne_satiete < 3) {
      points_amelioration.push(`Satiété à améliorer : ${moyenne_satiete.toFixed(1)}/5 (objectif ≥ 4)`);
    }
    if (moyenne_humeur < 3) {
      points_amelioration.push(`Ressenti émotionnel à renforcer : ${moyenne_humeur.toFixed(1)}/5`);
    }
    if (distribution_satiete["2"] > repasAvecSatiete.length * 0.3) {
      points_amelioration.push(`Trop souvent dépassé(e) (${distribution_satiete["2"]} repas)`);
    }
    if (semaines_critiques.length > 0) {
      points_amelioration.push(`${semaines_critiques.length} semaine(s) critique(s) détectée(s)`);
    }
    
    // ========================================
    // ANALYSES CROISÉES (nouvelles)
    // ========================================
    
    // 1. ANALYSE DES DÉPASSEMENTS DE SATIÉTÉ (satiete='non' = score 2)
    const depassements = repas.filter(r => r.satiete === 'non');
    const analyse_depassements = {
      total: depassements.length,
      par_type: {},
      avec_extras: 0,
      avec_fast_food: 0,
      categories_frequentes: {}
    };
    
    depassements.forEach(r => {
      // Par type de repas
      const type = r.type || 'Inconnu';
      analyse_depassements.par_type[type] = (analyse_depassements.par_type[type] || 0) + 1;
      
      // Extras
      if (r.est_extra) analyse_depassements.avec_extras++;
      
      // Fast-food
      if (r.tag?.toLowerCase().includes('fast-food') || 
          r.aliment?.toLowerCase().includes('mcdonald') ||
          r.aliment?.toLowerCase().includes('burger') ||
          r.aliment?.toLowerCase().includes('kfc')) {
        analyse_depassements.avec_fast_food++;
      }
      
      // Catégories
      const cat = r.categorie || 'autre';
      analyse_depassements.categories_frequentes[cat] = (analyse_depassements.categories_frequentes[cat] || 0) + 1;
    });
    
    // Insights dépassements
    const insights_depassements = [];
    if (depassements.length > 0) {
      const pctExtras = (analyse_depassements.avec_extras / depassements.length) * 100;
      const pctFastFood = (analyse_depassements.avec_fast_food / depassements.length) * 100;
      
      if (pctExtras >= 50) {
        insights_depassements.push(`${pctExtras.toFixed(0)}% des dépassements sont liés à des extras`);
      }
      if (pctFastFood >= 30) {
        insights_depassements.push(`${pctFastFood.toFixed(0)}% impliquent du fast-food`);
      }
      
      // Moment le plus critique
      const typePlusFrequent = Object.entries(analyse_depassements.par_type)
        .sort((a, b) => b[1] - a[1])[0];
      if (typePlusFrequent) {
        const [type, count] = typePlusFrequent;
        const pct = (count / depassements.length) * 100;
        if (pct >= 40) {
          insights_depassements.push(`Dépassements fréquents au ${type.toLowerCase()} (${pct.toFixed(0)}%)`);
        }
      }
    }
    
    // 2. CORRÉLATIONS HUMEUR NÉGATIVE x ALIMENTATION
    const humeurNegative = repas.filter(r => 
      ['ballonné', 'je regrette', 'je culpabilise', 'lourd'].includes(r.ressenti)
    );
    
    const analyse_humeur_negative = {
      total: humeurNegative.length,
      par_type: {},
      avec_extras: 0,
      avec_fast_food: 0,
      categories: {},
      kcal_moyen: 0
    };
    
    let totalKcal = 0;
    humeurNegative.forEach(r => {
      // Par type
      const type = r.type || 'Inconnu';
      analyse_humeur_negative.par_type[type] = (analyse_humeur_negative.par_type[type] || 0) + 1;
      
      // Extras
      if (r.est_extra) analyse_humeur_negative.avec_extras++;
      
      // Fast-food
      if (r.tag?.toLowerCase().includes('fast-food') || 
          r.aliment?.toLowerCase().includes('mcdonald') ||
          r.aliment?.toLowerCase().includes('burger') ||
          r.aliment?.toLowerCase().includes('kfc')) {
        analyse_humeur_negative.avec_fast_food++;
      }
      
      // Catégories
      const cat = r.categorie || 'autre';
      analyse_humeur_negative.categories[cat] = (analyse_humeur_negative.categories[cat] || 0) + 1;
      
      // Kcal
      if (r.kcal) totalKcal += r.kcal;
    });
    
    analyse_humeur_negative.kcal_moyen = humeurNegative.length > 0 
      ? Math.round(totalKcal / humeurNegative.length)
      : 0;
    
    // Insights humeur négative
    const insights_humeur_negative = [];
    if (humeurNegative.length > 0) {
      const pctExtras = (analyse_humeur_negative.avec_extras / humeurNegative.length) * 100;
      const pctFastFood = (analyse_humeur_negative.avec_fast_food / humeurNegative.length) * 100;
      
      if (pctExtras >= 40) {
        insights_humeur_negative.push(`${pctExtras.toFixed(0)}% des repas à humeur négative sont des extras`);
      }
      if (pctFastFood >= 25) {
        insights_humeur_negative.push(`Fast-food associé à humeur négative (${pctFastFood.toFixed(0)}% des cas)`);
      }
      
      // Moment le plus critique
      const typePlusFrequent = Object.entries(analyse_humeur_negative.par_type)
        .sort((a, b) => b[1] - a[1])[0];
      if (typePlusFrequent) {
        const [type, count] = typePlusFrequent;
        const pct = (count / humeurNegative.length) * 100;
        if (pct >= 35) {
          insights_humeur_negative.push(`Humeur négative surtout au ${type.toLowerCase()} (${pct.toFixed(0)}%)`);
        }
      }
      
      // Catégorie dominante
      const catDominante = Object.entries(analyse_humeur_negative.categories)
        .sort((a, b) => b[1] - a[1])[0];
      if (catDominante) {
        const [cat, count] = catDominante;
        const pct = (count / humeurNegative.length) * 100;
        if (pct >= 30 && cat === 'extra') {
          insights_humeur_negative.push(`Catégorie "${cat}" fréquente lors d'humeur négative`);
        }
      }
    }
    
    // 3. MATRICE CROISÉE : Satiété x Humeur
    const matrice_croisee = {
      satiete_ok_humeur_ok: 0,      // sat>=4 ET humeur>=4
      satiete_ok_humeur_ko: 0,      // sat>=4 ET humeur<=3
      satiete_ko_humeur_ok: 0,      // sat<=3 ET humeur>=4
      satiete_ko_humeur_ko: 0       // sat<=3 ET humeur<=3
    };
    
    repas.forEach(r => {
      const scoreSat = mapSatieteScore(r.satiete);
      const scoreRes = mapRessentiScore(r.ressenti);
      
      if (scoreSat !== null && scoreRes !== null) {
        if (scoreSat >= 4 && scoreRes >= 4) {
          matrice_croisee.satiete_ok_humeur_ok++;
        } else if (scoreSat >= 4 && scoreRes <= 3) {
          matrice_croisee.satiete_ok_humeur_ko++;
        } else if (scoreSat <= 3 && scoreRes >= 4) {
          matrice_croisee.satiete_ko_humeur_ok++;
        } else if (scoreSat <= 3 && scoreRes <= 3) {
          matrice_croisee.satiete_ko_humeur_ko++;
        }
      }
    });
    
    // Insights matrice
    const insights_matrice = [];
    const totalMatrice = Object.values(matrice_croisee).reduce((s, v) => s + v, 0);
    if (totalMatrice > 0) {
      const pctVertueux = (matrice_croisee.satiete_ok_humeur_ok / totalMatrice) * 100;
      const pctCritique = (matrice_croisee.satiete_ko_humeur_ko / totalMatrice) * 100;
      
      if (pctVertueux >= 40) {
        insights_matrice.push(`Cercle vertueux : ${pctVertueux.toFixed(0)}% des repas avec satiété ET humeur positives`);
      }
      if (pctCritique >= 15) {
        insights_matrice.push(`⚠️ ${pctCritique.toFixed(0)}% des repas cumulent satiété dépassée ET humeur négative`);
      }
    }
    
    const resultat = {
      moyenne_satiete: parseFloat(moyenne_satiete.toFixed(1)),
      moyenne_humeur: parseFloat(moyenne_humeur.toFixed(1)),
      distribution_satiete,
      distribution_humeur,
      nb_repas_satiete: repasAvecSatiete.length,
      nb_repas_ressenti: repasAvecRessenti.length,
      jours_excellents,
      semaines_critiques,
      points_positifs,
      points_amelioration,
      // Nouvelles analyses croisées
      analyse_depassements,
      insights_depassements,
      analyse_humeur_negative,
      insights_humeur_negative,
      matrice_croisee,
      insights_matrice
    };
    
    console.log('[CALCUL BILAN] === FIN SECTION 5 ===');
    console.log('[CALCUL BILAN] Résultat:', resultat);
    
    return resultat;
    
  } catch (err) {
    console.error('[CALCUL BILAN] ❌ Erreur Section 5:', err);
    console.error('[CALCUL BILAN] Stack:', err.stack);
    return null;
  }
}

/**
 * Section 6: Projection mois suivant
 * 
 * Génère des recommandations personnalisées basées sur les 5 sections précédentes
 * 
 * @param {number} mois - Mois analysé (1-12)
 * @param {number} annee - Année analysée
 * @param {Object} sections - Données des 5 sections précédentes
 * @returns {Promise<Object|null>} JSONB section_6_projection
 */
export async function calculerSection6Projection(mois, annee, sections) {
  try {
    console.log('[CALCUL BILAN] === DÉBUT SECTION 6 - Projection mois suivant ===');
    console.log('[CALCUL BILAN] Paramètres:', { mois, annee });
    
    if (!sections || !sections.section1 || !sections.section2) {
      console.log('[CALCUL BILAN] Sections précédentes manquantes');
      return { erreur: 'donnees_insuffisantes' };
    }
    
    const { section1, section2, section3, section4, section5 } = sections;
    
    // ========================================
    // 1. OBJECTIF POIDS MOIS SUIVANT
    // ========================================
    let objectif_poids = null;
    let objectif_poids_message = '';
    
    if (section1?.poids_actuel) {
      const poidsActuel = section1.poids_actuel;
      const evolution = section1.evolution_kg || 0;
      
      // Si perte > 0, continuer sur même rythme
      if (evolution < -0.5) {
        objectif_poids = parseFloat((poidsActuel + evolution).toFixed(1));
        objectif_poids_message = `Continuer la perte au même rythme (${Math.abs(evolution)} kg/mois)`;
      } 
      // Si stabilité, viser légère perte
      else if (evolution >= -0.5 && evolution <= 0.5) {
        objectif_poids = parseFloat((poidsActuel - 1).toFixed(1));
        objectif_poids_message = 'Viser une légère perte de 1 kg';
      }
      // Si prise de poids, stabiliser d'abord
      else {
        objectif_poids = poidsActuel;
        objectif_poids_message = 'Objectif : stabiliser le poids';
      }
    }
    
    // ========================================
    // 2. BUDGET CALORIQUE RECOMMANDÉ
    // ========================================
    // Utiliser l'objectif qui a servi aux calculs du mois
    let objectif_budget = 1900; // Valeur par défaut
    if (section2?.budget_mensuel && section2?.nb_jours_total && section2.nb_jours_total > 0) {
      objectif_budget = Math.round(section2.budget_mensuel / section2.nb_jours_total);
    }
    let ajustement_budget_message = `Maintenir ${objectif_budget} kcal/jour`;
    
    // ========================================
    // 3. AJUSTEMENTS STRATÉGIQUES
    // ========================================
    const ajustements_strategiques = [];
    
    // Basé sur Section 2 (Budget)
    if (section2) {
      const extrasParJour = section2.extras_moyens_jour || 0;
      if (extrasParJour > 1.5) {
        ajustements_strategiques.push(`Réduire extras à 1/jour maximum (actuellement ${extrasParJour.toFixed(1)}/jour)`);
      }
      
      // Répartition repas
      if (section2.repartition_repas) {
        const diner = section2.repartition_repas.find(r => r.type === 'Dîner');
        if (diner && diner.pourcent > 35) {
          ajustements_strategiques.push(`Alléger le dîner (${diner.pourcent}% des kcal, objectif < 30%)`);
        }
      }
    }
    
    // Basé sur Section 3 (Patterns)
    if (section3) {
      const tauxConformite = section3.taux_conformite || 0;
      if (tauxConformite < 70) {
        ajustements_strategiques.push(`Améliorer conformité budget (actuellement ${tauxConformite}%, objectif ≥ 80%)`);
      }
      
      if (section3.insights_temporels) {
        const ecartWeekend = Math.abs(section3.insights_temporels.ecart_weekend_semaine || 0);
        if (ecartWeekend > 150) {
          ajustements_strategiques.push(`Stabiliser weekend (écart actuel: ${ecartWeekend} kcal vs semaine)`);
        }
      }
    }
    
    // Basé sur Section 4 (Qualité)
    if (section4) {
      const scoreQualite = section4.score_qualite || 0;
      if (scoreQualite < 70) {
        ajustements_strategiques.push(`Améliorer qualité nutritionnelle (score actuel: ${scoreQualite}/100)`);
      }
      
      const fastFoodSemaine = section4.fast_food_par_semaine || 0;
      if (fastFoodSemaine > 1) {
        ajustements_strategiques.push(`Limiter fast-food à 1x/semaine max (actuellement ${fastFoodSemaine.toFixed(1)}/semaine)`);
      }
      
      // Equilibre catégories
      if (section4.equilibre) {
        const proteines = parseFloat(section4.equilibre.proteines);
        const legumes = parseFloat(section4.equilibre.legumes);
        
        if (proteines < 20) {
          ajustements_strategiques.push(`Augmenter protéines (${proteines}%, objectif ≥ 25%)`);
        }
        if (legumes < 25) {
          ajustements_strategiques.push(`Augmenter légumes (${legumes}%, objectif ≥ 30%)`);
        }
      }
    }
    
    // Basé sur Section 5 (Bien-être)
    if (section5) {
      const moyenneSatiete = section5.moyenne_satiete || 0;
      const moyenneHumeur = section5.moyenne_humeur || 0;
      
      if (moyenneSatiete < 3.5) {
        ajustements_strategiques.push(`Renforcer écoute satiété (score actuel: ${moyenneSatiete}/5)`);
      }
      if (moyenneHumeur < 3.5) {
        ajustements_strategiques.push(`Identifier sources humeur négative et agir`);
      }
    }
    
    // Limiter à 5 ajustements max
    const ajustements_prioritaires = ajustements_strategiques.slice(0, 5);
    
    // ========================================
    // 4. POINTS DE VIGILANCE
    // ========================================
    const points_vigilance = [];
    
    if (section3?.insights_temporels?.moyenne_weekend > section3?.insights_temporels?.moyenne_semaine + 100) {
      points_vigilance.push('Weekends à surveiller : tendance aux excès');
    }
    
    if (section2?.nb_extras > 40) {
      points_vigilance.push('Extras fréquents : risque de routine');
    }
    
    if (section5?.semaines_critiques?.length > 1) {
      points_vigilance.push(`Périodes difficiles récurrentes (${section5.semaines_critiques.length} semaines critiques)`);
    }
    
    if (section4?.nb_fast_food > 5) {
      points_vigilance.push('Fast-food trop fréquent : impact qualité');
    }
    
    if (section5?.analyse_depassements?.total > 15) {
      points_vigilance.push(`Dépassements satiété fréquents (${section5.analyse_depassements.total} repas)`);
    }
    
    // ========================================
    // 5. CHECKPOINTS HEBDOMADAIRES
    // ========================================
    const checkpoints_hebdo = [
      {
        semaine: 1,
        objectif: ajustements_prioritaires[0] || 'Stabiliser les bonnes habitudes',
        indicateur: 'Budget respecté 5j/7'
      },
      {
        semaine: 2,
        objectif: ajustements_prioritaires[1] || 'Améliorer qualité nutritionnelle',
        indicateur: 'Score QN ≥ 75'
      },
      {
        semaine: 3,
        objectif: ajustements_prioritaires[2] || 'Confirmer tendance poids',
        indicateur: 'Poids en baisse ou stable'
      },
      {
        semaine: 4,
        objectif: 'Préparer validation mensuelle',
        indicateur: 'Tous les indicateurs au vert'
      }
    ];
    
    // ========================================
    // 6. POINTS FORTS À MAINTENIR
    // ========================================
    const points_forts_a_maintenir = [];
    
    if (section3?.taux_conformite >= 80) {
      points_forts_a_maintenir.push('Excellente conformité budget');
    }
    if (section4?.score_qualite >= 80) {
      points_forts_a_maintenir.push('Très bonne qualité nutritionnelle');
    }
    if (section5?.moyenne_satiete >= 4) {
      points_forts_a_maintenir.push('Bonne écoute de la satiété');
    }
    if (section5?.moyenne_humeur >= 4) {
      points_forts_a_maintenir.push('État émotionnel positif');
    }
    if (section1?.evolution_kg < -1) {
      points_forts_a_maintenir.push('Perte de poids régulière');
    }
    
    const resultat = {
      objectif_poids,
      objectif_poids_message,
      objectif_budget,
      ajustement_budget_message,
      ajustements_strategiques: ajustements_prioritaires,
      points_vigilance,
      checkpoints_hebdo,
      points_forts_a_maintenir
    };
    
    console.log('[CALCUL BILAN] === FIN SECTION 6 ===');
    console.log('[CALCUL BILAN] Résultat:', resultat);
    
    return resultat;
    
  } catch (err) {
    console.error('[CALCUL BILAN] ❌ Erreur Section 6:', err);
    console.error('[CALCUL BILAN] Stack:', err.stack);
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
    
    // Récupérer profil utilisateur pour calculer objectif calorique
    let objectifCaloriqueJour = 1900; // Valeur par défaut
    const { data: profil, error: profilError } = await supabase
      .from('profil')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (profilError) {
      console.log('[CALCUL BILAN] Erreur récupération profil:', profilError);
    }
    
    if (profil && profil.sexe && profil.niveau_activite) {
      // Déterminer objectif type (perte/maintien/prise)
      let objectifType = 'perte';
      if (profil.poids_de_depart && profil.objectif) {
        if (profil.poids_de_depart > profil.objectif) {
          objectifType = 'perte';
        } else if (profil.poids_de_depart < profil.objectif) {
          objectifType = 'prise';
        } else {
          objectifType = 'maintien';
        }
      }
      
      const profilComplet = {
        sexe: profil.sexe,
        age: profil.age,
        taille: profil.taille,
        poids_de_depart: profil.poids_de_depart,
        niveau_activite: profil.niveau_activite,
        objectif: objectifType
      };
      
      const calculs = calculerProfilComplet(profilComplet);
      if (calculs && calculs.apport_calorique_cible) {
        objectifCaloriqueJour = calculs.apport_calorique_cible;
        console.log('[CALCUL BILAN] Objectif calorique personnalisé:', objectifCaloriqueJour, 'kcal/jour');
      }
    } else {
      console.log('[CALCUL BILAN] Profil incomplet, utilisation valeur par défaut:', objectifCaloriqueJour, 'kcal/jour');
    }
    
    // Appeler les 6 fonctions de calcul avec objectif calorique
    const section1 = await calculerSection1TendancePoids(mois, annee);
    const section2 = await calculerSection2BudgetCalorique(mois, annee, objectifCaloriqueJour);
    const section3 = await calculerSection3Patterns(mois, annee, objectifCaloriqueJour);
    const section4 = await calculerSection4QualiteNutritionnelle(mois, annee);
    const section5 = await calculerSection5BienEtre(mois, annee);
    
    // Pour Section 6, utiliser l'objectif réel du mois (depuis section2)
    const section6 = await calculerSection6Projection(mois, annee, { section1, section2, section3, section4, section5 });
    
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

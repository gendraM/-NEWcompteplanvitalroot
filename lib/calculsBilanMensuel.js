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
 * @param {string} userId - UUID utilisateur
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_1_tendance_poids
 */
export async function calculerSection1TendancePoids(userId, mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 1 - Tendance poids', { userId, mois, annee });
    
    // TODO Phase 3: Implémenter calcul
    // 1. Récupérer dates exactes du mois
    // const { debut, fin } = getDatesExactesMois(mois, annee);
    
    // 2. Query historique_poids pour la période
    // const { data: poids, error } = await supabase
    //   .from('historique_poids')
    //   .select('date, poids')
    //   .eq('user_id', userId)
    //   .gte('date', debut)
    //   .lte('date', fin)
    //   .order('date', { ascending: true });
    
    // 3. Calculer évolution
    // const poids_debut = poids[0]?.poids;
    // const poids_fin = poids[poids.length - 1]?.poids;
    // const evolution_kg = poids_fin - poids_debut;
    // const evolution_pourcent = (evolution_kg / poids_debut) * 100;
    
    // 4. Déterminer trajectoire
    // let trajectoire = 'stable';
    // if (evolution_kg < -2) trajectoire = 'excellente';
    // else if (evolution_kg < -0.5) trajectoire = 'bonne';
    // else if (evolution_kg > 0.5) trajectoire = 'attention';
    // else if (evolution_kg > 1.5) trajectoire = 'difficile';
    
    // 5. Projeter mois suivant
    // const poids_mois_prochain = poids_fin + evolution_kg;
    
    return null; // TODO Phase 3
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
 * @param {string} userId - UUID utilisateur
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_2_budget_calorique
 */
export async function calculerSection2BudgetCalorique(userId, mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 2 - Budget calorique', { userId, mois, annee });
    
    // TODO Phase 4: Implémenter calcul
    // 1. Récupérer dates exactes
    // const { debut, fin } = getDatesExactesMois(mois, annee);
    
    // 2. Query repas_reels pour période
    // const { data: repas, error } = await supabase
    //   .from('repas_reels')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .gte('date', debut)
    //   .lte('date', fin);
    
    // 3. Calculer totaux
    // const total_consomme = repas.reduce((sum, r) => sum + (r.kcal || 0), 0);
    
    // 4. Répartition par type de repas
    // const repartition_repas = {
    //   petit_dejeuner: repas.filter(r => r.type === 'petit_dejeuner').reduce(...),
    //   dejeuner: ...,
    //   diner: ...,
    //   collation: ...
    // };
    
    // 5. Répartition extras par moment
    // const repartition_extras = {
    //   matin: repas.filter(r => r.is_extra && r.moment === 'matin')...,
    //   apres_midi: ...,
    //   soir: ...
    // };
    
    return null; // TODO Phase 4
  } catch (err) {
    console.error('[CALCUL BILAN] Erreur Section 2:', err);
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
 * @param {string} userId - UUID utilisateur
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 * @returns {Promise<Object|null>} JSONB section_3_patterns
 */
export async function calculerSection3Patterns(userId, mois, annee) {
  try {
    console.log('[CALCUL BILAN] Section 3 - Patterns comportementaux', { userId, mois, annee });
    
    // TODO Phase 5: Implémenter calcul
    // 1. Analyser conformité jour par jour
    // 2. Identifier récurrences (weekend, soir, stress...)
    // 3. Détecter points forts vs points d'amélioration
    // 4. Générer insights temporels
    
    return null; // TODO Phase 5
  } catch (err) {
    console.error('[CALCUL BILAN] Erreur Section 3:', err);
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

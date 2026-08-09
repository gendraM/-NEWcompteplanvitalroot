/**
 * ============================================================================
 * API CRISTALLISATION - Supabase
 * ============================================================================
 * 
 * Gestion phase cristallisation (45 jours post-reprise)
 * Pattern: NO AUTH (user_id fixe: 'laurelle_test_user')
 * Inspiré de journalSpirituelAPI.js
 * 
 * Date: 26 Décembre 2025
 * 
 * ============================================================================
 */

import { supabase } from './supabaseClient';
import { genererCriteresPersonnalises } from '../data/referentiel';
/**
 * ============================================================================
 * ARCHIVÉ : API CRISTALLISATION (NO AUTH, user_id fixe)
 * ============================================================================
 *
 * ⚠️ Ce fichier est obsolète et ne doit plus être utilisé.
 * Il utilisait un user_id fixe ('laurelle_test_user') et n'est PAS compatible avec l'authentification multi-utilisateur Supabase.
 *
 * → Utiliser cristallisationAPI.js pour toute nouvelle intégration.
 *
 * Date d'archivage : 12 janvier 2026
 *
 * ============================================================================
 */

/**
 * Récupère le parcours cristallisation actif (en_cours)
 * @returns {Object|null} Parcours actif ou null
 */
export const getParcoursCristallisationActif = async () => {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('parcours_cristallisation')
    .select('*')
    .eq('user_id', userId)
    .eq('statut', 'en_cours')
    .order('date_debut', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Aucun parcours trouvé
    throw error;
  }
  
  return data;
};

/**
 * Récupère un parcours par ID
 * @param {String} parcoursId - UUID du parcours
 * @returns {Object} Parcours
 */
export const getParcoursById = async (parcoursId) => {
  const { data, error } = await supabase
    .from('parcours_cristallisation')
    .select('*')
    .eq('id', parcoursId)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Crée un nouveau parcours cristallisation
 * @param {Object} bilanReprise - Bilan transmis depuis reprise-alimentaire-apres-jeune.js
 * @returns {Object} Parcours créé
 */
export const createParcoursCristallisation = async (bilanReprise) => {
  const userId = getLocalUserId();
  
  // Générer critères personnalisés depuis bilan
  const criteresPersonnalises = genererCriteresPersonnalises(bilanReprise);
  
  // Calculer dates
  const dateDebut = new Date();
  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateFin.getDate() + 45);
  
  const { data, error } = await supabase
    .from('parcours_cristallisation')
    .insert([{
      user_id: userId,
      duree_jours: 45,
      date_debut: dateDebut.toISOString().split('T')[0],
      date_fin: dateFin.toISOString().split('T')[0],
      jour_courant: 1,
      bilan_reprise: bilanReprise,
      criteres_personnalises: criteresPersonnalises,
      progression: [],
      tracking_comportements: {},
      victoires: [],
      mauvaises_habitudes_vaincues: [],
      statut: 'en_cours'
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  console.log(`✅ Parcours cristallisation créé: ${criteresPersonnalises.length} critères actifs`);
  return data;
};

/**
 * Met à jour le statut d'un parcours
 * @param {String} parcoursId - UUID du parcours
 * @param {String} statut - en_cours, terminee, abandonnee
 * @returns {Object} Parcours mis à jour
 */
export const updateStatutParcours = async (parcoursId, statut) => {
  const { data, error } = await supabase
    .from('parcours_cristallisation')
    .update({ 
      statut,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Calcule le jour courant automatiquement
 * @param {Date} dateDebut - Date début parcours
 * @returns {Number} Jour courant (1-45)
 */
export const calculerJourCourant = (dateDebut) => {
  const debut = new Date(dateDebut);
  const aujourdhui = new Date();
  const diffTime = Math.abs(aujourdhui - debut);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(diffDays, 45)); // Entre 1 et 45
};

// ============================================================================
// PROGRESSION QUOTIDIENNE
// ============================================================================

/**
 * Valide les critères du jour
 * @param {String} parcoursId - UUID du parcours
 * @param {Number} jour - Jour à valider (1-45)
 * @param {Object} validation - Résultats validation critères
 * @returns {Object} Parcours mis à jour
 */
export const updateCriteresDuJour = async (parcoursId, jour, validation) => {
  const parcours = await getParcoursById(parcoursId);
  
  // Récupérer progression actuelle
  const progression = parcours.progression || [];
  
  // Trouver ou créer entrée pour ce jour
  const indexJour = progression.findIndex(p => p.jour === jour);
  
  const entreeJour = {
    jour,
    date: validation.date || new Date().toISOString().split('T')[0],
    criteres_valides: validation.criteres_valides || [],
    criteres_echoues: validation.criteres_echoues || [],
    score_jour: validation.score_jour || 0,
    score_max: validation.score_max || 5,
    feedback: validation.feedback || '',
    jeune_ponctuel_fait: validation.jeune_ponctuel_fait || false,
    poids_jour: validation.poids_jour || null,
    qn_moyen_jour: validation.qn_moyen_jour || null,
    nb_extras_jour: validation.nb_extras_jour || 0,
    valide: true,
    valide_le: new Date().toISOString()
  };
  
  if (indexJour >= 0) {
    progression[indexJour] = entreeJour;
  } else {
    progression.push(entreeJour);
  }
  
  // Mettre à jour parcours
  const { data, error } = await supabase
    .from('parcours_cristallisation')
    .update({ 
      progression,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Récupère la progression d'un jour spécifique
 * @param {String} parcoursId - UUID du parcours
 * @param {Number} jour - Jour (1-45)
 * @returns {Object|null} Progression du jour ou null
 */
export const getProgressionJour = async (parcoursId, jour) => {
  const parcours = await getParcoursById(parcoursId);
  const progression = parcours.progression || [];
  return progression.find(p => p.jour === jour) || null;
};

// ============================================================================
// TRACKING COMPORTEMENTS
// ============================================================================

/**
 * Met à jour le tracking d'un comportement
 * @param {String} parcoursId - UUID du parcours
 * @param {String} comportement - ID comportement (ex: "pas_extra_journalier")
 * @param {Boolean} succes - Succès ou échec
 * @returns {Object} Parcours mis à jour
 */
export const trackComportement = async (parcoursId, comportement, succes) => {
  const parcours = await getParcoursById(parcoursId);
  
  const tracking = parcours.tracking_comportements || {};
  
  // Initialiser tracking si n'existe pas
  if (!tracking[comportement]) {
    tracking[comportement] = {
      streak_actuel: 0,
      streak_max: 0,
      dernier_succes: null,
      total_succes: 0,
      total_tentatives: 0,
      taux_reussite: 0
    };
  }
  
  const t = tracking[comportement];
  t.total_tentatives++;
  
  if (succes) {
    t.streak_actuel++;
    t.streak_max = Math.max(t.streak_max, t.streak_actuel);
    t.dernier_succes = new Date().toISOString().split('T')[0];
    t.total_succes++;
  } else {
    t.streak_actuel = 0;
  }
  
  t.taux_reussite = Math.round((t.total_succes / t.total_tentatives) * 100);
  
  // Mettre à jour
  const { data, error } = await supabase
    .from('parcours_cristallisation')
    .update({ 
      tracking_comportements: tracking,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Vérifie si un comportement mérite une victoire (21+ jours)
 * @param {String} parcoursId - UUID du parcours
 * @param {String} comportement - ID comportement
 * @returns {Boolean} True si victoire débloquée
 */
export const verifierVictoire = async (parcoursId, comportement) => {
  const parcours = await getParcoursById(parcoursId);
  const tracking = parcours.tracking_comportements || {};
  
  if (!tracking[comportement]) return false;
  
  const streak = tracking[comportement].streak_actuel;
  
  // Victoire si 21+ jours consécutifs
  if (streak >= 21) {
    // Vérifier si victoire déjà débloquée
    const victoires = parcours.victoires || [];
    const dejaDebloque = victoires.some(v => v.comportement === `${comportement}_21j`);
    
    if (!dejaDebloque) {
      // Ajouter victoire
      victoires.push({
        comportement: `${comportement}_21j`,
        titre: `21 jours : ${comportement}`,
        description: `Tu as tenu 21 jours consécutifs`,
        badge: '🏆',
        date_obtention: new Date().toISOString().split('T')[0],
        jour_obtention: calculerJourCourant(parcours.date_debut)
      });
      
      await supabase
        .from('parcours_cristallisation')
        .update({ 
          victoires,
          updated_at: new Date().toISOString()
        })
        .eq('id', parcoursId);
      
      return true;
    }
  }
  
  return false;
};

/**
 * Calcule les mauvaises habitudes vaincues
 * @param {String} parcoursId - UUID du parcours
 * @returns {Array} Mauvaises habitudes vaincues
 */
export const calculerHabitudesVaincues = async (parcoursId) => {
  const parcours = await getParcoursById(parcoursId);
  const bilanReprise = parcours.bilan_reprise;
  const tracking = parcours.tracking_comportements || {};
  
  const habitudesVaincues = [];
  
  // Extras fréquents
  if (bilanReprise.extras?.total > 10 && tracking.pas_extra_journalier) {
    const tauxReprise = bilanReprise.extras.par_jour * 7; // /semaine
    const tauxCristallisation = (7 - tracking.pas_extra_journalier.taux_reussite / 100 * 7);
    const reduction = Math.round((1 - tauxCristallisation / tauxReprise) * 100);
    
    if (reduction >= 68 && tracking.pas_extra_journalier.streak_actuel >= 21) {
      habitudesVaincues.push({
        habitude: 'extras_frequents',
        titre: 'Extras quotidiens',
        taux_reprise: Math.round(tauxReprise),
        taux_cristallisation: Math.round(tauxCristallisation),
        reduction_pourcent: reduction,
        maintien_jours: tracking.pas_extra_journalier.streak_actuel,
        date_victoire: new Date().toISOString().split('T')[0],
        badge: '🎯'
      });
    }
  }
  
  return habitudesVaincues;
};

// ============================================================================
// CONSEILS CRISTALLISATION
// ============================================================================

/**
 * Génère un conseil pour le prochain repas
 * @param {String} parcoursId - UUID du parcours
 * @param {Object} context - Contexte (patterns détectés, aliments triggers)
 * @returns {Object|null} Conseil généré ou null si déjà un conseil aujourd'hui
 */
export const genererConseilProchainRepas = async (parcoursId, context) => {
  const userId = getLocalUserId();
  const aujourdhui = new Date().toISOString().split('T')[0];
  
  // Vérifier règle: 1 conseil MAX par jour et par type repas
  const { data: conseilsExistants } = await supabase
    .from('conseils_cristallisation')
    .select('*')
    .eq('user_id', userId)
    .eq('parcours_id', parcoursId)
    .eq('date_generation', aujourdhui)
    .eq('type_repas', context.type_repas);
  
  if (conseilsExistants && conseilsExistants.length > 0) {
    console.log(`⚠️ Conseil déjà généré aujourd'hui pour ${context.type_repas}`);
    return null;
  }
  
  // Créer conseil
  const { data, error } = await supabase
    .from('conseils_cristallisation')
    .insert([{
      user_id: userId,
      parcours_id: parcoursId,
      date_generation: aujourdhui,
      type_repas: context.type_repas, // dejeuner, diner
      cible: context.cible, // soir, lendemain
      pattern_detecte: context.pattern_detecte,
      aliments_triggers: context.aliments_triggers || [],
      moment_critique: context.moment_critique || null,
      contexte_emotionnel: context.contexte_emotionnel || null,
      message: context.message,
      alternatives_suggerees: context.alternatives || [],
      strategies: context.strategies || [],
      conditions_reconnaissance: {
        conseil_en_cours: true,
        bon_type_repas: context.type_repas,
        alternative_presente: context.alternatives?.[0]?.nom || null
      }
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  console.log(`✅ Conseil généré pour ${context.cible} - Type: ${context.type_repas}`);
  return data;
};

/**
 * Vérifie si un conseil a été appliqué
 * @param {String} conseilId - UUID du conseil
 * @param {Object} repasReel - Repas réel saisi
 * @returns {Boolean} True si conseil appliqué
 */
export const verifierApplicationConseil = async (conseilId, repasReel) => {
  const { data: conseil } = await supabase
    .from('conseils_cristallisation')
    .select('*')
    .eq('id', conseilId)
    .single();
  
  if (!conseil) return false;
  
  const conditions = conseil.conditions_reconnaissance;
  
  // 3 conditions pour reconnaissance
  const condition1 = conditions.conseil_en_cours === true;
  const condition2 = repasReel.type === conditions.bon_type_repas;
  const condition3 = conseil.alternatives_suggerees.some(alt => 
    repasReel.aliment.toLowerCase().includes(alt.nom.toLowerCase())
  );
  
  const applique = condition1 && condition2 && condition3;
  
  if (applique) {
    // Marquer comme appliqué + reconnaissance
    const impact = {
      qn_prevu: 3.5,
      qn_obtenu: repasReel.qn || 4,
      gain_qn: (repasReel.qn || 4) - 3.5,
      calories_economisees: repasReel.calories ? 250 : null
    };
    
    await supabase
      .from('conseils_cristallisation')
      .update({
        applique: true,
        date_application: new Date().toISOString(),
        repas_reel_id: repasReel.id,
        points_obtenus: 10,
        badge_debloque: '🌟 Conseil appliqué',
        impact_mesure: impact,
        notification_envoyee: false
      })
      .eq('id', conseilId);
    
    console.log(`🌟 Conseil appliqué ! +10 points`);
    return true;
  }
  
  return false;
};

/**
 * Récupère les conseils d'un parcours
 * @param {String} parcoursId - UUID du parcours
 * @param {Boolean} appliquesUniquement - Filtrer uniquement conseils appliqués
 * @returns {Array} Conseils
 */
export const getConseilsParcours = async (parcoursId, appliquesUniquement = false) => {
  let query = supabase
    .from('conseils_cristallisation')
    .select('*')
    .eq('parcours_id', parcoursId)
    .order('date_generation', { ascending: false });
  
  if (appliquesUniquement) {
    query = query.eq('applique', true);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// ============================================================================
// LISTES COURSES
// ============================================================================

/**
 * Enregistre une liste courses générée
 * @param {String} parcoursId - UUID du parcours
 * @param {Object} listeData - Données liste courses
 * @returns {Object} Liste enregistrée
 */
export const enregistrerListeCourses = async (parcoursId, listeData) => {
  const userId = getLocalUserId();
  
  const { data, error } = await supabase
    .from('listes_courses_generees')
    .insert([{
      user_id: userId,
      parcours_id: parcoursId,
      semaine_debut: listeData.semaine_debut,
      semaine_fin: listeData.semaine_fin,
      nb_jours: listeData.nb_jours || 7,
      liste_json: listeData.liste_json,
      criteres_actifs: listeData.criteres_actifs || [],
      aliments_triggers: listeData.aliments_triggers || [],
      objectif_qn: listeData.objectif_qn || 3.5,
      objectif_conformite: listeData.objectif_conformite || 90,
      analyse_conformite: listeData.analyse_conformite || {}
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  console.log(`✅ Liste courses enregistrée: ${listeData.liste_json.stats.total_aliments} aliments`);
  return data;
};

/**
 * Récupère les listes courses d'un parcours
 * @param {String} parcoursId - UUID du parcours
 * @returns {Array} Listes courses
 */
export const getListesCoursesParcours = async (parcoursId) => {
  const { data, error } = await supabase
    .from('listes_courses_generees')
    .select('*')
    .eq('parcours_id', parcoursId)
    .order('semaine_debut', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// ============================================================================
// EXPORTS
// ============================================================================
export default {
  // Parcours
  getParcoursCristallisationActif,
  getParcoursById,
  createParcoursCristallisation,
  updateStatutParcours,
  calculerJourCourant,
  
  // Progression
  updateCriteresDuJour,
  getProgressionJour,
  
  // Tracking
  trackComportement,
  verifierVictoire,
  calculerHabitudesVaincues,
  
  // Conseils
  genererConseilProchainRepas,
  verifierApplicationConseil,
  getConseilsParcours,
  
  // Listes courses
  enregistrerListeCourses,
  getListesCoursesParcours
};

/**
 * ============================================================================
 * API CRISTALLISATION - Supabase
 * ============================================================================
 * 
 * Gestion phase cristallisation (45 jours post-reprise)
 * Pattern: AUTH standard (user_id dynamique comme repas_reels, defis, etc.)
 * 
 * Date: 26 Décembre 2025
 * ============================================================================
 */

import { supabase } from './supabaseClient';
import { genererCriteresPersonnalises } from '../data/referentiel';

// ============================================================================
// HELPER : Identifiant utilisateur (pattern standard app)
// ============================================================================
async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ============================================================================
// PARCOURS CRISTALLISATION
// ============================================================================

/**
 * Récupère le parcours cristallisation actif (en_cours)
 * @returns {Object|null} Parcours actif ou null
 */
export const getParcoursCristallisationActif = async () => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log('Utilisateur non connecté');
      return null;
    }

    const { data, error } = await supabase
      .from('parcours_cristallisation')
      .select('*')
      .eq('user_id', userId)
      .eq('statut', 'en_cours')
      .order('date_debut', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    console.log('Parcours actif récupéré:', data?.id);
    return data;
  } catch (error) {
    console.error('Erreur getParcoursCristallisationActif:', error);
    throw error;
  }
};

/**
 * Récupère un parcours par ID
 * @param {String} parcoursId - UUID du parcours
 * @returns {Object|null}
 */
export const getParcoursById = async (parcoursId) => {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('parcours_cristallisation')
      .select('*')
      .eq('id', parcoursId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur getParcoursById:', error);
    throw error;
  }
};

/**
 * Crée un nouveau parcours cristallisation
 * @param {Object} bilanReprise - Données depuis reprise-alimentaire-apres-jeune.js
 * @returns {Object} Parcours créé
 */
export const createParcoursCristallisation = async (bilanReprise) => {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error('Utilisateur non connecté');
    }

    // Générer critères personnalisés depuis bilan
    const criteresPersonnalises = genererCriteresPersonnalises(bilanReprise);
    
    const dateDebut = new Date();
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + 44);
    
    const { data, error } = await supabase
      .from('parcours_cristallisation')
      .insert({
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
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Parcours cristallisation créé:', data.id);
    return data;
  } catch (error) {
    console.error('Erreur createParcoursCristallisation:', error);
    throw error;
  }
};

/**
 * Met à jour le statut d'un parcours
 * @param {String} parcoursId 
 * @param {String} statut - en_cours|terminee|abandonnee
 * @returns {Object}
 */
export const updateStatutParcours = async (parcoursId, statut) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('Non connecté');

    const { data, error } = await supabase
      .from('parcours_cristallisation')
      .update({ statut })
      .eq('id', parcoursId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    console.log('Statut parcours mis à jour:', statut);
    return data;
  } catch (error) {
    console.error('Erreur updateStatutParcours:', error);
    throw error;
  }
};

/**
 * Calcule le jour courant (1-45) depuis date_debut
 * @param {String} dateDebut - Format YYYY-MM-DD
 * @returns {Number} Jour entre 1 et 45
 */
export const calculerJourCourant = (dateDebut) => {
  const debut = new Date(dateDebut);
  const aujourdhui = new Date();
  const diffTime = aujourdhui - debut;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(45, diffDays + 1));
};

// ============================================================================
// PROGRESSION QUOTIDIENNE
// ============================================================================

/**
 * Met à jour les critères du jour
 * @param {String} parcoursId 
 * @param {Number} jour - Jour 1-45
 * @param {Object} validation - Résultats validation
 * @returns {Object}
 */
export const updateCriteresDuJour = async (parcoursId, jour, validation) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('Non connecté');

    const parcours = await getParcoursById(parcoursId);
    if (!parcours) throw new Error('Parcours introuvable');
    
    const progression = parcours.progression || [];
    
    // Chercher si jour déjà validé
    const indexJour = progression.findIndex(p => p.jour === jour);
    
    const entreeJour = {
      jour,
      date: new Date().toISOString().split('T')[0],
      criteres_valides: validation.criteres_valides || [],
      criteres_echoues: validation.criteres_echoues || [],
      score_jour: validation.score_jour || 0,
      score_max: validation.score_max || 0,
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
    
    const { data, error } = await supabase
      .from('parcours_cristallisation')
      .update({ 
        progression,
        jour_courant: jour
      })
      .eq('id', parcoursId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    console.log(`Jour ${jour} validé`);
    return data;
  } catch (error) {
    console.error('Erreur updateCriteresDuJour:', error);
    throw error;
  }
};

/**
 * Récupère la progression d'un jour
 * @param {String} parcoursId 
 * @param {Number} jour 
 * @returns {Object|null}
 */
export const getProgressionJour = async (parcoursId, jour) => {
  try {
    const parcours = await getParcoursById(parcoursId);
    if (!parcours) return null;
    
    const progression = parcours.progression || [];
    return progression.find(p => p.jour === jour) || null;
  } catch (error) {
    console.error('Erreur getProgressionJour:', error);
    throw error;
  }
};

// ============================================================================
// TRACKING COMPORTEMENTS
// ============================================================================

/**
 * Track un comportement (streak, taux réussite)
 * @param {String} parcoursId 
 * @param {String} comportement - Nom du comportement
 * @param {Boolean} succes - Succès aujourd'hui
 * @returns {Object}
 */
export const trackComportement = async (parcoursId, comportement, succes) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('Non connecté');

    const parcours = await getParcoursById(parcoursId);
    if (!parcours) throw new Error('Parcours introuvable');
    
    const tracking = parcours.tracking_comportements || {};
    const aujourdhui = new Date().toISOString().split('T')[0];
    
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
    
    const comp = tracking[comportement];
    comp.total_tentatives += 1;
    
    if (succes) {
      comp.total_succes += 1;
      comp.streak_actuel += 1;
      comp.dernier_succes = aujourdhui;
      
      if (comp.streak_actuel > comp.streak_max) {
        comp.streak_max = comp.streak_actuel;
      }
    } else {
      comp.streak_actuel = 0;
    }
    
    comp.taux_reussite = Math.round((comp.total_succes / comp.total_tentatives) * 100);
    
    const { data, error } = await supabase
      .from('parcours_cristallisation')
      .update({ tracking_comportements: tracking })
      .eq('id', parcoursId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    console.log(`Comportement ${comportement} tracké:`, comp);
    return data;
  } catch (error) {
    console.error('Erreur trackComportement:', error);
    throw error;
  }
};

/**
 * Vérifie si victoire 21 jours débloquée
 * @param {String} parcoursId 
 * @param {String} comportement 
 * @returns {Boolean} True si victoire débloquée
 */
export const verifierVictoire = async (parcoursId, comportement) => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const parcours = await getParcoursById(parcoursId);
    if (!parcours) return false;
    
    const tracking = parcours.tracking_comportements || {};
    const comp = tracking[comportement];
    
    if (!comp || comp.streak_actuel < 21) return false;
    
    // Vérifier si victoire déjà débloquée
    const victoires = parcours.victoires || [];
    const dejaDebloque = victoires.some(v => v.comportement === comportement);
    
    if (dejaDebloque) return false;
    
    // Débloquer victoire
    victoires.push({
      comportement,
      titre: `21 jours: ${comportement}`,
      description: `Streak de 21 jours consécutifs pour ${comportement}`,
      badge: '🏆',
      date_obtention: new Date().toISOString().split('T')[0],
      jour_obtention: parcours.jour_courant
    });
    
    const { error } = await supabase
      .from('parcours_cristallisation')
      .update({ victoires })
      .eq('id', parcoursId)
      .eq('user_id', userId);
    
    if (error) throw error;
    console.log(`🏆 Victoire 21j débloquée: ${comportement}`);
    return true;
  } catch (error) {
    console.error('Erreur verifierVictoire:', error);
    return false;
  }
};

/**
 * Calcule les mauvaises habitudes vaincues
 * @param {String} parcoursId 
 * @returns {Array} Habitudes vaincues
 */
export const calculerHabitudesVaincues = async (parcoursId) => {
  try {
    const parcours = await getParcoursById(parcoursId);
    if (!parcours) return [];
    
    const bilanReprise = parcours.bilan_reprise;
    const tracking = parcours.tracking_comportements || {};
    const habitudesVaincues = [];
    
    // Logique: taux cristallisation ≤32% du taux reprise + streak ≥21j
    Object.entries(tracking).forEach(([comportement, stats]) => {
      if (stats.streak_actuel >= 21) {
        const tauxReprise = bilanReprise[comportement]?.taux || 100;
        const tauxCristallisation = 100 - stats.taux_reussite;
        const reduction = ((tauxReprise - tauxCristallisation) / tauxReprise) * 100;
        
        if (reduction >= 68) {
          habitudesVaincues.push({
            habitude: comportement,
            titre: comportement.replace(/_/g, ' '),
            taux_reprise: tauxReprise,
            taux_cristallisation: tauxCristallisation,
            reduction_pourcent: Math.round(reduction),
            maintien_jours: stats.streak_actuel,
            date_victoire: stats.dernier_succes,
            badge: '🎯'
          });
        }
      }
    });
    
    return habitudesVaincues;
  } catch (error) {
    console.error('Erreur calculerHabitudesVaincues:', error);
    return [];
  }
};

// ============================================================================
// CONSEILS INTELLIGENTS
// ============================================================================

/**
 * Génère un conseil pour NEXT meal
 * @param {String} parcoursId 
 * @param {Object} context - {type_repas, pattern, aliments_triggers, etc.}
 * @returns {Object|null} Conseil ou null si quota jour dépassé
 */
export const genererConseilProchainRepas = async (parcoursId, context) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('Non connecté');

    // Vérifier quota 1 MAX/jour/type
    const { data: existants } = await supabase
      .from('conseils_cristallisation')
      .select('id')
      .eq('user_id', userId)
      .eq('type_repas', context.type_repas)
      .eq('date_generation', new Date().toISOString().split('T')[0]);
    
    if (existants && existants.length > 0) {
      console.log('Conseil déjà généré aujourd\'hui pour', context.type_repas);
      return null;
    }
    
    const { data, error } = await supabase
      .from('conseils_cristallisation')
      .insert({
        user_id: userId,
        parcours_id: parcoursId,
        date_generation: new Date().toISOString().split('T')[0],
        type_repas: context.type_repas,
        cible: context.cible || null,
        pattern_detecte: context.pattern || '',
        aliments_triggers: context.aliments_triggers || [],
        moment_critique: context.moment_critique || null,
        contexte_emotionnel: context.contexte_emotionnel || null,
        message: context.message,
        alternatives_suggerees: context.alternatives || [],
        strategies: context.strategies || [],
        conditions_reconnaissance: context.conditions || {}
      })
      .select()
      .single();
    
    if (error) throw error;
    console.log('Conseil généré:', data.id);
    return data;
  } catch (error) {
    console.error('Erreur genererConseilProchainRepas:', error);
    throw error;
  }
};

/**
 * Vérifie si conseil a été appliqué
 * @param {String} conseilId 
 * @param {Object} repasReel - Repas saisi avec composition
 * @returns {Boolean}
 */
export const verifierApplicationConseil = async (conseilId, repasReel) => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { data: conseil } = await supabase
      .from('conseils_cristallisation')
      .select('*')
      .eq('id', conseilId)
      .eq('user_id', userId)
      .single();
    
    if (!conseil || conseil.applique) return false;
    
    // Vérifier 3 conditions
    const conditions = conseil.conditions_reconnaissance || {};
    const alternatives = conseil.alternatives_suggerees || [];
    
    const aUtiliseAlternative = alternatives.some(alt => 
      repasReel.composition?.some(c => c.nom === alt.nom)
    );
    
    if (aUtiliseAlternative) {
      const { error } = await supabase
        .from('conseils_cristallisation')
        .update({
          applique: true,
          date_application: new Date().toISOString().split('T')[0],
          repas_reel_id: repasReel.id,
          points_obtenus: 10,
          badge_debloque: '⭐',
          impact_mesure: {
            qn_avant: conditions.qn_habituel || null,
            qn_apres: repasReel.qn || null
          }
        })
        .eq('id', conseilId)
        .eq('user_id', userId);
      
      if (error) throw error;
      console.log('✅ Conseil appliqué!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur verifierApplicationConseil:', error);
    return false;
  }
};

/**
 * Récupère tous les conseils d'un parcours
 * @param {String} parcoursId 
 * @param {Boolean} appliquesUniquement 
 * @returns {Array}
 */
export const getConseilsParcours = async (parcoursId, appliquesUniquement = false) => {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    let query = supabase
      .from('conseils_cristallisation')
      .select('*')
      .eq('user_id', userId)
      .eq('parcours_id', parcoursId)
      .order('date_generation', { ascending: false });
    
    if (appliquesUniquement) {
      query = query.eq('applique', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erreur getConseilsParcours:', error);
    return [];
  }
};

// ============================================================================
// LISTES COURSES
// ============================================================================

/**
 * Enregistre une liste de courses générée
 * @param {String} parcoursId 
 * @param {Object} listeData - {semaine_debut, liste_json, criteres, etc.}
 * @returns {Object}
 */
export const enregistrerListeCourses = async (parcoursId, listeData) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('Non connecté');

    const { data, error } = await supabase
      .from('listes_courses_generees')
      .insert({
        user_id: userId,
        parcours_id: parcoursId,
        semaine_debut: listeData.semaine_debut,
        semaine_fin: listeData.semaine_fin,
        nb_jours: listeData.nb_jours,
        liste_json: listeData.liste_json,
        criteres_actifs: listeData.criteres_actifs || [],
        aliments_triggers: listeData.aliments_triggers || [],
        objectif_qn: listeData.objectif_qn || null,
        objectif_conformite: listeData.objectif_conformite || null,
        analyse_conformite: listeData.analyse_conformite || {}
      })
      .select()
      .single();
    
    if (error) throw error;
    console.log('Liste courses enregistrée:', data.id);
    return data;
  } catch (error) {
    console.error('Erreur enregistrerListeCourses:', error);
    throw error;
  }
};

/**
 * Récupère listes courses d'un parcours
 * @param {String} parcoursId 
 * @returns {Array}
 */
export const getListesCoursesParcours = async (parcoursId) => {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('listes_courses_generees')
      .select('*')
      .eq('user_id', userId)
      .eq('parcours_id', parcoursId)
      .order('semaine_debut', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur getListesCoursesParcours:', error);
    return [];
  }
};

// Export default
export default {
  getParcoursCristallisationActif,
  getParcoursById,
  createParcoursCristallisation,
  updateStatutParcours,
  calculerJourCourant,
  updateCriteresDuJour,
  getProgressionJour,
  trackComportement,
  verifierVictoire,
  calculerHabitudesVaincues,
  genererConseilProchainRepas,
  verifierApplicationConseil,
  getConseilsParcours,
  enregistrerListeCourses,
  getListesCoursesParcours
};

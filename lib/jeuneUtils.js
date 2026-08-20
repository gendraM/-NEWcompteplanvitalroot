import { supabase } from './supabaseClient';
import { genererProgrammeReprise } from './genererProgrammeReprise';

// ═══════════════════════════════════════════════════════════
// DÉTECTION J-3 ET GÉNÉRATION AUTOMATIQUE DU PLAN
// ═══════════════════════════════════════════════════════════

/**
 * Vérifie si l'utilisateur est à J-3 de la fin de son jeûne
 * et génère automatiquement le programme de reprise si nécessaire
 * 
 * À appeler :
 * - Au login de l'utilisateur
 * - Sur la page /jeune
 * - Via un cron quotidien (recommandé)
 * 
 * @param {string} userId - ID de l'utilisateur connecté
 * @returns {Object} - {needsValidation: boolean, programmeId: string|null, message: string}
 */
export async function verifierFinJeuneProche(userId) {
  try {
    // Récupération des données de jeûne en cours de l'utilisateur
    const jeuneEnCours = await getJeuneEnCours(userId);

    if (!jeuneEnCours) {
      return {
        needsValidation: false,
        programmeId: null,
        message: 'Aucun jeûne en cours'
      };
    }

    // Vérification si un programme de reprise existe déjà
    const programmeExistant = await getProgrammeRepriseExistant(userId, jeuneEnCours.id);
    if (programmeExistant) {
      return {
        needsValidation: programmeExistant.statut === 'proposition',
        programmeId: programmeExistant.id,
        message: programmeExistant.statut === 'proposition' 
          ? 'Programme en attente de validation'
          : 'Programme déjà validé'
      };
    }

    // Calcul des jours restants avant fin du jeûne
    const joursRestants = calculerJoursRestants(jeuneEnCours.date_fin);

    // Si J-3 exactement, génération automatique du programme
    if (joursRestants === 3) {
      const programme = await genererEtSauvegarderProgramme(userId, jeuneEnCours);
      
      return {
        needsValidation: true,
        programmeId: programme.id,
        message: '🎯 J-3 ! Ton programme de reprise est prêt. Valide-le pour préparer ta sortie de jeûne.',
        programme: programme
      };
    }

    // Si J-2, J-1 ou J-0 sans programme, alerte urgente
    if (joursRestants >= 0 && joursRestants < 3) {
      const programme = await genererEtSauvegarderProgramme(userId, jeuneEnCours);
      
      return {
        needsValidation: true,
        programmeId: programme.id,
        message: `⚠️ URGENT : J-${joursRestants} ! Valide ton programme de reprise MAINTENANT pour sécuriser ta sortie de jeûne.`,
        urgence: true,
        programme: programme
      };
    }

    return {
      needsValidation: false,
      programmeId: null,
      message: `${joursRestants} jours avant la fin de ton jeûne`
    };

  } catch (error) {
    console.error('Erreur vérification J-3:', error);
    return {
      needsValidation: false,
      programmeId: null,
      message: 'Erreur lors de la vérification',
      error: error.message
    };
  }
}

/**
 * Récupère le jeûne en cours pour un utilisateur
 * (À adapter selon ton implémentation : localStorage, Supabase table jeunes, etc.)
 * 
 * @param {string} userId - ID utilisateur
 * @returns {Object|null} - Objet jeûne avec {id, duree_jours, date_debut, date_fin, poids_depart}
 */
async function getJeuneEnCours(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('parcours_jeune')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'jeune')
    .eq('statut', 'en_cours')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erreur récupération du parcours jeûne actif:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    date_debut: data.date_debut_jeune || data.date_debut,
    date_fin: data.date_fin_jeune || data.date_fin
  };
}

/**
 * Vérifie si un programme de reprise existe déjà pour ce jeûne
 * @param {string} userId - ID utilisateur
 * @param {string} jeuneId - ID du jeûne (nullable)
 * @returns {Object|null} - Programme existant ou null
 */
async function getProgrammeRepriseExistant(userId, jeuneId) {
  const query = supabase
    .from('reprises_alimentaires')
    .select('*')
    .eq('user_id', userId)
    .in('statut', ['proposition', 'plan_valide', 'en_cours']);

  if (jeuneId) {
    query.eq('parcours_id', jeuneId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Erreur récupération programme existant:', error);
    return null;
  }

  return data;
}

/**
 * Calcule le nombre de jours restants avant une date donnée
 * @param {string} dateFin - Date de fin au format ISO (YYYY-MM-DD)
 * @returns {number} - Nombre de jours (peut être négatif si date passée)
 */
function calculerJoursRestants(dateFin) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  const fin = new Date(dateFin);
  fin.setHours(0, 0, 0, 0);

  const diffTime = fin - aujourdhui;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Génère le programme de reprise et le sauvegarde en base
 * @param {string} userId - ID utilisateur
 * @param {Object} jeuneData - Données du jeûne {id, duree_jours, date_fin, poids_depart}
 * @returns {Object} - Programme sauvegardé avec son ID
 */
export async function genererEtSauvegarderProgramme(userId, jeuneData) {
  // Génération du programme avec la fonction principale
  const programme = genererProgrammeReprise({
    dureeJeune: jeuneData.duree_jours,
    poidsDepart: jeuneData.poids_depart || null,
    dateFin: jeuneData.date_fin,
    options: {
      genere_automatiquement: true,
      genere_le: new Date().toISOString()
    }
  });

  // Préparation de l'objet pour insertion Supabase
  const programmeToInsert = {
    user_id: userId,
    parcours_id: jeuneData.parcours_id || jeuneData.id || null,
    jeune_id: jeuneData.parcours_id || jeuneData.id || null,
    duree_jeune_jours: programme.duree_jeune_jours,
    poids_depart: jeuneData.poids_depart || null, // ✅ Ajout poids début jeûne
    poids_fin_jeune: jeuneData.poids_fin || jeuneData.poids_fin_jeune || null, // ✅ Ajout poids fin jeûne
    date_debut_jeune: jeuneData.date_debut || null, // ✅ Ajout date début jeûne
    date_fin_jeune: jeuneData.date_fin || null, // ✅ Ajout date fin jeûne
    message_personnel: jeuneData.message_personnel || jeuneData.message_perso || null, // ✅ Ajout message
    duree_reprise_jours: programme.duree_reprise_jours,
    date_debut_reprise: programme.date_debut_reprise,
    date_fin_reprise: programme.date_fin_reprise,
    phases: programme.phases,
    liste_courses: programme.liste_courses,
    statut: 'proposition',
    plan_genere_le: new Date().toISOString()
  };

  // Insertion en base
  const { data: programmeInsere, error: insertError } = await supabase
    .from('reprises_alimentaires')
    .insert([programmeToInsert])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Erreur insertion programme: ${insertError.message}`);
  }

  // Insertion des jours détaillés dans reprises_jours_valides
  const joursToInsert = programme.jours_detailles.map(jour => ({
    reprise_id: programmeInsere.id,
    user_id: userId,
    jour_numero: jour.jour_numero,
    date: jour.date,
    phase: `phase${Number(String(jour.phase).replace('phase', ''))}`,
    aliments_autorises: jour.aliments_autorises,
    message_contextuel: jour.message_contextuel,
    valide: false
  }));

  const { error: joursError } = await supabase
    .from('reprises_jours_valides')
    .upsert(joursToInsert, { onConflict: 'reprise_id,jour_numero' });

  if (joursError) {
    throw new Error(`Erreur insertion journées du programme: ${joursError.message}`);
  }

  return programmeInsere;
}

// ═══════════════════════════════════════════════════════════
// FONCTIONS DE GESTION DU PROGRAMME
// ═══════════════════════════════════════════════════════════

/**
 * Valide le programme de reprise (passage de 'proposition' à 'plan_valide')
 * @param {string} programmeId - ID du programme
 * @param {string} userId - ID utilisateur (pour sécurité)
 * @returns {Object} - {success: boolean, message: string}
 */
export async function validerProgrammeReprise(programmeId, userId, personnalisationCourses = {}) {
  const miseAJour = {
    statut: 'plan_valide',
    plan_valide_le: new Date().toISOString()
  };
  if (Array.isArray(personnalisationCourses.listeCourses)) {
    miseAJour.liste_courses = personnalisationCourses.listeCourses;
  }
  if (personnalisationCourses.choixCourses) {
    miseAJour.options = {
      ...(personnalisationCourses.optionsExistantes || {}),
      choix_courses: personnalisationCourses.choixCourses,
      liste_courses_personnalisee: true,
      periode_liste_courses: personnalisationCourses.periode || null
    };
  }
  const { data, error } = await supabase
    .from('reprises_alimentaires')
    .update(miseAJour)
    .eq('id', programmeId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: `Erreur validation: ${error.message}`
    };
  }

  return {
    success: true,
    message: '✅ Programme validé ! Profite de tes derniers jours de jeûne en paix.',
    programme: data
  };
}

/**
 * Démarre la reprise (passage de 'plan_valide' à 'en_cours')
 * @param {string} programmeId - ID du programme
 * @param {string} userId - ID utilisateur
 * @returns {Object} - {success: boolean, message: string}
 */
export async function demarrerReprise(programmeId, userId) {
  const { data, error } = await supabase
    .from('reprises_alimentaires')
    .update({
      statut: 'en_cours',
      reprise_commencee_le: new Date().toISOString()
    })
    .eq('id', programmeId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: `Erreur démarrage: ${error.message}`
    };
  }

  return {
    success: true,
    message: '🎉 Bienvenue dans ta reprise alimentaire !',
    programme: data
  };
}

/**
 * Valide un jour de reprise
 * @param {string} jourId - ID du jour dans reprises_jours_valides
 * @param {string} userId - ID utilisateur
 * @returns {Object} - {success: boolean, message: string}
 */
export async function validerJourReprise(jourId, userId) {
  const { data, error } = await supabase
    .from('reprises_jours_valides')
    .update({
      valide: true,
      valide_le: new Date().toISOString()
    })
    .eq('id', jourId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: `Erreur validation jour: ${error.message}`
    };
  }

  // Vérifier si tous les jours sont validés pour marquer le programme comme terminé
  await verifierProgrammeTermine(data.reprise_id, userId);

  return {
    success: true,
    message: '✅ Jour validé ! Continue comme ça.',
    jour: data
  };
}

/**
 * Vérifie si tous les jours sont validés et marque le programme comme terminé
 * @param {string} programmeId - ID du programme
 * @param {string} userId - ID utilisateur
 */
async function verifierProgrammeTermine(programmeId, userId) {
  const { data: jours, error } = await supabase
    .from('reprises_jours_valides')
    .select('valide')
    .eq('reprise_id', programmeId)
    .eq('user_id', userId);

  if (error || !jours) return;

  const tousValides = jours.every(j => j.valide === true);

  if (tousValides) {
    await supabase
      .from('reprises_alimentaires')
      .update({
        statut: 'termine',
        reprise_terminee_le: new Date().toISOString()
      })
      .eq('id', programmeId)
      .eq('user_id', userId);
  }
}

/**
 * Récupère le programme de reprise en cours pour un utilisateur
 * @param {string} userId - ID utilisateur
 * @returns {Object|null} - Programme avec ses jours
 */
export async function getProgrammeRepriseEnCours(userId) {
  const { data: programme, error } = await supabase
    .from('reprises_alimentaires')
    .select(`
      *,
      jours:reprises_jours_valides(*)
    `)
    .eq('user_id', userId)
    .in('statut', ['plan_valide', 'en_cours'])
    .single();

  if (error) {
    console.error('Erreur récupération programme:', error);
    return null;
  }

  return programme;
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════
// Toutes les fonctions sont déjà exportées individuellement avec 'export async function'
// Pas besoin de bloc export supplémentaire

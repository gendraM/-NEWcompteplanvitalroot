/**
 * API pour Parcours Jeûne - Supabase NO AUTH
 * Architecture identique à journalSpirituelAPI.js
 * Remplace localStorage pour persistence multi-appareils
 */

import { supabase } from './supabaseClient';

// ==========================================
// HELPER : Identifiant utilisateur FIXE
// ==========================================
const getLocalUserId = () => {
  return 'laurelle_test_user'; // ID fixe pour test mono-utilisateur
};

// ==========================================
// PARCOURS JEÛNE
// ==========================================

/**
 * Récupérer le parcours jeûne actif
 */
export const getParcoursJeuneActif = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('parcours_jeune')
    .select('*')
    .eq('user_id', userId)
    .eq('statut', 'en_cours')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

/**
 * Créer un nouveau parcours jeûne
 */
export const createParcoursJeune = async (parcours) => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('parcours_jeune')
    .insert([{
      user_id: userId,
      type: parcours.type || 'jeune',
      date_debut: parcours.date_debut,
      date_fin: parcours.date_fin || null,
      duree_jours: parcours.duree_jours,
      statut: parcours.statut || 'en_cours',
      jours_valides: parcours.jours_valides || [],
      outils_actives: parcours.outils_actives || {},
      message_perso: parcours.message_perso || null,
      progression: parcours.progression || {}
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Mettre à jour jours validés
 */
export const updateJoursValides = async (parcoursId, joursValides) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      jours_valides: joursValides,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Mettre à jour message personnel
 */
export const updateMessagePerso = async (parcoursId, message) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      message_perso: message,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Mettre à jour outils activés
 */
export const updateOutilsActives = async (parcoursId, outils) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      outils_actives: outils,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Terminer le parcours jeûne
 */
export const terminerParcoursJeune = async (parcoursId, dateFin) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      statut: 'termine',
      date_fin: dateFin,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ==========================================
// POIDS (depuis historique_poids existant)
// ==========================================

/**
 * Récupérer le dernier poids enregistré
 */
export const getDernierPoids = async () => {
  try {
    // Option 1 : Depuis historique_poids
    const { data: histoPoids } = await supabase
      .from('historique_poids')
      .select('poids, date')
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (histoPoids?.poids) return histoPoids.poids;
    
    // Option 2 : Depuis profil.poids_de_depart
    const { data: profil } = await supabase
      .from('profil')
      .select('poids_de_depart')
      .single();
    
    return profil?.poids_de_depart || null;
  } catch (error) {
    console.warn('Erreur lecture poids Supabase:', error);
    return null;
  }
};

// ==========================================
// REPAS (depuis repas_reels existant)
// ==========================================

/**
 * Récupérer les derniers repas (pour analyse J1)
 */
export const getDerniersRepas = async (limit = 3) => {
  try {
    const { data } = await supabase
      .from('repas_reels')
      .select('aliment, categorie, date, type, est_extra')
      .order('date', { ascending: false })
      .limit(limit);
    
    return data || [];
  } catch (error) {
    console.warn('Erreur lecture repas Supabase:', error);
    return [];
  }
};

/**
 * API pour Parcours Jeûne - Supabase NO AUTH
 * Architecture identique à journalSpirituelAPI.js
 * Remplace localStorage pour persistence multi-appareils
 */

import { supabase } from './supabaseClient';

const resolveUserId = async (userId) => {
  if (userId) return userId;

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};



// ==========================================
// PARCOURS JEÛNE
// ==========================================

/**
 * Récupérer le parcours jeûne actif
 */
export const getParcoursJeuneActif = async (userId) => {
  const currentUserId = await resolveUserId(userId);
  if (!currentUserId) return null;

  const { data, error } = await supabase
    .from('parcours_jeune')
    .select('*')
    .eq('user_id', currentUserId)
    .eq('statut', 'en_cours')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

/**
 * Créer un nouveau parcours jeûne
 */
export const createParcoursJeune = async (parcours, userId) => {
  const currentUserId = await resolveUserId(userId);
  if (!currentUserId) {
    throw new Error('Utilisateur Supabase introuvable pour créer le parcours jeune');
  }

  const { data, error } = await supabase
    .from('parcours_jeune')
    .insert([{
      user_id: currentUserId,
      type: parcours.type || 'jeune',
      date_debut: parcours.date_debut,
      date_fin: parcours.date_fin || null,
      duree_jours: parcours.duree_jours,
      statut: parcours.statut || 'en_cours',
      jours_valides: parcours.jours_valides || [],
      outils_actives: parcours.outils_actives || {},
      message_perso: parcours.message_perso || null,
      progression: parcours.progression || {},
      date_debut_preparation: parcours.date_debut_preparation || null,
      date_fin_preparation: parcours.date_fin_preparation || null,
      date_debut_jeune: parcours.date_debut_jeune || null,
      date_fin_jeune: parcours.date_fin_jeune || null,
      date_debut_reprise: parcours.date_debut_reprise || null,
      date_fin_reprise: parcours.date_fin_reprise || null,
      date_debut_consolidation: parcours.date_debut_consolidation || null,
      date_fin_consolidation: parcours.date_fin_consolidation || null,
      duree_preparation_jours: parcours.duree_preparation_jours || null,
      duree_reprise_jours: parcours.duree_reprise_jours || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Récupérer un parcours précis appartenant à l'utilisateur connecté.
 */
export const getParcoursJeuneById = async (parcoursId, userId) => {
  const currentUserId = await resolveUserId(userId);
  if (!parcoursId || !currentUserId) return null;

  const { data, error } = await supabase
    .from('parcours_jeune')
    .select('*')
    .eq('id', parcoursId)
    .eq('user_id', currentUserId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

/**
 * Faire évoluer le parcours central de la préparation vers la phase de jeûne.
 * L'ancienne table "jeune" n'est pas utilisée pour les nouveaux parcours.
 */
export const demarrerPhaseJeune = async (parcoursId, userId, jeune = {}) => {
  const currentUserId = await resolveUserId(userId);
  if (!parcoursId || !currentUserId) {
    throw new Error('Parcours ou utilisateur introuvable pour démarrer le jeûne');
  }

  const dateDebutJeune = jeune.date_debut_jeune
    || new Date().toISOString().slice(0, 10);

  const payload = {
    type: 'jeune',
    statut: 'en_cours',
    date_fin_preparation: jeune.date_fin_preparation || dateDebutJeune,
    date_debut_jeune: dateDebutJeune,
    updated_at: new Date().toISOString()
  };

  if (jeune.duree_jours !== undefined && jeune.duree_jours !== null) {
    payload.duree_jours = jeune.duree_jours;
  }
  if (jeune.message_perso !== undefined) {
    payload.message_perso = jeune.message_perso;
  }

  const { data, error } = await supabase
    .from('parcours_jeune')
    .update(payload)
    .eq('id', parcoursId)
    .eq('user_id', currentUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Clore uniquement la phase de jeûne sans terminer le cycle complet.
 */
export const terminerPhaseJeune = async (parcoursId, userId, fin = {}) => {
  const currentUserId = await resolveUserId(userId);
  if (!parcoursId || !currentUserId) return null;

  const dateFinJeune = fin.date_fin_jeune
    || new Date().toISOString().slice(0, 10);

  const progression = fin.progression || undefined;
  const payload = {
    date_fin_jeune: dateFinJeune,
    updated_at: new Date().toISOString()
  };

  if (progression !== undefined) payload.progression = progression;

  const { data, error } = await supabase
    .from('parcours_jeune')
    .update(payload)
    .eq('id', parcoursId)
    .eq('user_id', currentUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Faire évoluer le parcours central vers la reprise alimentaire.
 */
export const demarrerPhaseReprise = async (parcoursId, userId, reprise = {}) => {
  const currentUserId = await resolveUserId(userId);
  if (!parcoursId || !currentUserId) {
    throw new Error('Parcours ou utilisateur introuvable pour démarrer la reprise');
  }

  const dateDebutReprise = reprise.date_debut_reprise
    || new Date().toISOString().slice(0, 10);

  const payload = {
    type: 'reprise',
    statut: 'en_cours',
    date_fin_jeune: reprise.date_fin_jeune || dateDebutReprise,
    date_debut_reprise: dateDebutReprise,
    updated_at: new Date().toISOString()
  };

  if (reprise.duree_reprise_jours !== undefined && reprise.duree_reprise_jours !== null) {
    payload.duree_reprise_jours = reprise.duree_reprise_jours;
  }

  const { data, error } = await supabase
    .from('parcours_jeune')
    .update(payload)
    .eq('id', parcoursId)
    .eq('user_id', currentUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Clore la reprise et ouvrir la consolidation sur le même cycle.
 */
export const terminerPhaseReprise = async (parcoursId, userId, fin = {}) => {
  const currentUserId = await resolveUserId(userId);
  if (!parcoursId || !currentUserId) return null;

  const dateFinReprise = fin.date_fin_reprise
    || new Date().toISOString().slice(0, 10);

  const payload = {
    type: 'consolidation',
    statut: 'en_cours',
    date_fin_reprise: dateFinReprise,
    date_debut_consolidation: fin.date_debut_consolidation || dateFinReprise,
    updated_at: new Date().toISOString()
  };

  if (fin.progression !== undefined) payload.progression = fin.progression;

  const { data, error } = await supabase
    .from('parcours_jeune')
    .update(payload)
    .eq('id', parcoursId)
    .eq('user_id', currentUserId)
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
 * Mettre à jour l'état détaillé du parcours actif.
 * `progression` accueille les données complémentaires déjà utilisées par la page
 * (messages par jour, conseils, bilan) sans modifier le schéma existant.
 */
export const updateEtatParcours = async (parcoursId, userId, etat = {}) => {
  if (!parcoursId || !userId) return null;

  const payload = { updated_at: new Date().toISOString() };
  if (etat.joursValides !== undefined) payload.jours_valides = etat.joursValides;
  if (etat.outils !== undefined) payload.outils_actives = etat.outils;
  if (etat.messagePerso !== undefined) payload.message_perso = etat.messagePerso;
  if (etat.progression !== undefined) payload.progression = etat.progression;

  const { data, error } = await supabase
    .from('parcours_jeune')
    .update(payload)
    .eq('id', parcoursId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/** Récupérer tous les jeûnes terminés ou supprimés d'un utilisateur. */
export const getHistoriqueParcoursJeune = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('parcours_jeune')
    .select('*')
    .eq('user_id', userId)
    .in('statut', ['termine', 'supprime'])
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

/** Archiver l'état complet d'un jeûne dans sa ligne parcours_jeune. */
export const archiverParcoursJeune = async (parcoursId, userId, archive) => {
  if (!parcoursId || !userId) return null;
  const progressionExistante = archive.progression || {};
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({
      statut: 'termine',
      date_fin: archive.dateFin,
      jours_valides: archive.joursValides || [],
      outils_actives: archive.outils || {},
      message_perso: archive.messagePerso || '',
      progression: {
        ...progressionExistante,
        archive: {
          bilan: archive.bilan || null,
          programmeReprise: archive.programmeReprise || null,
          messagesPersoJour: archive.messagesPersoJour || {},
          donneesSpirituellesCount: archive.donneesSpirituellesCount || 0,
          dateArchivage: archive.dateArchivage
        }
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const supprimerParcoursJeune = async (parcoursId, userId) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ statut: 'supprime', updated_at: new Date().toISOString() })
    .eq('id', parcoursId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const restaurerParcoursJeune = async (parcoursId, userId) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ statut: 'termine', updated_at: new Date().toISOString() })
    .eq('id', parcoursId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const supprimerParcoursJeuneDefinitivement = async (parcoursId, userId) => {
  const { error } = await supabase
    .from('parcours_jeune')
    .delete()
    .eq('id', parcoursId)
    .eq('user_id', userId);
  if (error) throw error;
  return true;
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

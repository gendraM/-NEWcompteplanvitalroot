/**
 * API pour Journal Spirituel - Supabase
 * Remplace localStorage/IndexedDB par Supabase
 * ARCHITECTURE: Pas d'authentification (localStorage ID)
 */

import { supabase } from './supabaseClient';

// ==========================================
// HELPER : Identifiant utilisateur LOCAL
// ==========================================
const getLocalUserId = () => {
  // Version FIXE pour test mono-utilisateur
  // Garantit que les données restent accessibles même si localStorage effacé
  return 'laurelle_test_user';
  
  // Ancienne version (localStorage dynamique) - à réactiver pour multi-utilisateurs
  // let userId = localStorage.getItem('journal_user_id');
  // if (!userId) {
  //   userId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  //   localStorage.setItem('journal_user_id', userId);
  // }
  // return userId;
};

// ==========================================
// MÉDITATIONS
// ==========================================
export const getMeditations = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_meditations')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createMeditation = async (meditation) => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_meditations')
    .insert([{
      user_id: userId,
      jour_jeune: meditation.jourJeune,
      type_meditation: meditation.type,
      duree: meditation.duree,
      ressenti: meditation.ressenti,
      notes: meditation.notes || '',
      date: meditation.date || new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteMeditation = async (id) => {
  const { error } = await supabase
    .from('journal_spirituel_meditations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ==========================================
// VERSETS
// ==========================================
export const getVersets = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_versets')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createVerset = async (verset) => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_versets')
    .insert([{
      user_id: userId,
      reference: verset.reference,
      texte: verset.texte,
      note: verset.note || '',
      favori: verset.favori || false,
      date: verset.date || new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateVerset = async (id, updates) => {
  const { data, error } = await supabase
    .from('journal_spirituel_versets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteVerset = async (id) => {
  const { error } = await supabase
    .from('journal_spirituel_versets')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ==========================================
// QUESTIONS
// ==========================================
export const getQuestions = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_questions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createQuestion = async (question) => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_questions')
    .insert([{
      user_id: userId,
      jour_jeune: question.jourJeune,
      question: question.question,
      reponse: question.reponse,
      type: question.type,
      date: question.date || new Date().toISOString(),
      date_modification: question.dateModification || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateQuestion = async (id, updates) => {
  const { data, error } = await supabase
    .from('journal_spirituel_questions')
    .update({
      ...updates,
      date_modification: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteQuestion = async (id) => {
  const { error } = await supabase
    .from('journal_spirituel_questions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ==========================================
// INTENTIONS
// ==========================================
export const getIntentions = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_intentions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createIntention = async (intention) => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_intentions')
    .insert([{
      user_id: userId,
      texte: intention.texte,
      progression: intention.progression || 0,
      accompli: intention.accompli || false,
      date: intention.date || new Date().toISOString(),
      date_accomplissement: intention.dateAccomplissement || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateIntention = async (id, updates) => {
  const { data, error } = await supabase
    .from('journal_spirituel_intentions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteIntention = async (id) => {
  const { error } = await supabase
    .from('journal_spirituel_intentions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ==========================================
// AUDIOS (métadonnées + Storage)
// ==========================================
export const getAudios = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_audios')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const uploadAudio = async (audioBlob, metadata) => {
  const userId = getLocalUserId();
  const audioId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const filePath = `${userId}/${audioId}.webm`;

  // Upload fichier vers Storage
  const { error: uploadError } = await supabase.storage
    .from('journal-spirituel-audios')
    .upload(filePath, audioBlob, {
      contentType: 'audio/webm',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Créer métadonnées en DB
  const { data, error: insertError } = await supabase
    .from('journal_spirituel_audios')
    .insert([{
      user_id: userId,
      type: metadata.type,
      titre: metadata.titre || 'Sans titre',
      note: metadata.note || '',
      tags: metadata.tags || [],
      jour_jeune: metadata.jourJeune,
      duree: metadata.duree,
      taille: audioBlob.size,
      storage_path: filePath,
      date: metadata.date || new Date().toISOString()
    }])
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
};

export const getAudioUrl = async (storagePath) => {
  const { data, error } = await supabase.storage
    .from('journal-spirituel-audios')
    .createSignedUrl(storagePath, 3600); // URL valide 1h

  if (error) throw error;
  return data.signedUrl;
};

export const downloadAudio = async (storagePath, titre) => {
  const { data, error } = await supabase.storage
    .from('journal-spirituel-audios')
    .download(storagePath);

  if (error) throw error;

  // Créer lien de téléchargement
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${titre}.webm`;
  a.click();
  URL.revokeObjectURL(url);
};

export const deleteAudio = async (id, storagePath) => {
  // Supprimer fichier du Storage
  const { error: storageError } = await supabase.storage
    .from('journal-spirituel-audios')
    .remove([storagePath]);

  if (storageError) throw storageError;

  // Supprimer métadonnées de la DB
  const { error: dbError } = await supabase
    .from('journal_spirituel_audios')
    .delete()
    .eq('id', id);

  if (dbError) throw dbError;
};

export const getAudiosStats = async () => {
  const audios = await getAudios();
  const tailleTotal = audios.reduce((acc, audio) => acc + (audio.taille || 0), 0);
  
  return {
    nombreAudios: audios.length,
    tailleBytes: tailleTotal,
    tailleMB: (tailleTotal / (1024 * 1024)).toFixed(2),
    tailleGB: (tailleTotal / (1024 * 1024 * 1024)).toFixed(3)
  };
};

// ==========================================
// ÉCRITS
// ==========================================
export const getEcrits = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_ecrits')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createEcrit = async (ecrit) => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('journal_spirituel_ecrits')
    .insert([{
      user_id: userId,
      titre: ecrit.titre || 'Sans titre',
      texte: ecrit.texte,
      jour_jeune: ecrit.jourJeune,
      nb_caracteres: ecrit.texte.length,
      date: ecrit.date || new Date().toISOString(),
      date_modification: ecrit.dateModification || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateEcrit = async (id, updates) => {
  const { data, error } = await supabase
    .from('journal_spirituel_ecrits')
    .update({
      ...updates,
      nb_caracteres: updates.texte ? updates.texte.length : undefined,
      date_modification: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteEcrit = async (id) => {
  const { error } = await supabase
    .from('journal_spirituel_ecrits')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

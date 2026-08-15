import { supabase } from './supabaseClient';

const NOTES_STORAGE_KEY = 'notesPreparationJeuneById';
const HISTORIQUE_STORAGE_KEY = 'historiquePreparationsJeune';

function isBrowser() {
  return typeof window !== 'undefined';
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readNotesMap() {
  if (!isBrowser()) return {};
  return safeParse(localStorage.getItem(NOTES_STORAGE_KEY), {});
}

function writeNotesMap(notesMap) {
  if (!isBrowser()) return;
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesMap));
}

function syncNoteToHistoriqueLocal(preparationId, note) {
  if (!isBrowser()) return;
  const historique = safeParse(localStorage.getItem(HISTORIQUE_STORAGE_KEY), []);
  const index = historique.findIndex((item) => item?.id === preparationId);
  if (index === -1) return;
  const updated = [...historique];
  updated[index] = {
    ...updated[index],
    notesPerso: note,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(HISTORIQUE_STORAGE_KEY, JSON.stringify(updated));
}

export function getNotePreparationJeune(preparationId, fallbackPreparation = null) {
  if (!preparationId) return fallbackPreparation?.notesPerso || '';
  const map = readNotesMap();
  if (typeof map[preparationId] === 'string') return map[preparationId];
  return fallbackPreparation?.notesPerso || '';
}

export async function saveNotePreparationJeune({ preparationId, note, userId = null }) {
  if (!preparationId) return { success: false, source: 'none', error: 'missing_preparation_id' };
  const safeNote = typeof note === 'string' ? note : '';

  try {
    const map = readNotesMap();
    map[preparationId] = safeNote;
    writeNotesMap(map);
    syncNoteToHistoriqueLocal(preparationId, safeNote);

    if (userId) {
      const { error } = await supabase
        .from('preparations_jeune')
        .update({
          notesPerso: safeNote,
          updatedAt: new Date().toISOString(),
        })
        .eq('userId', userId)
        .eq('id', preparationId);
      if (error) throw error;
    }

    return { success: true, source: userId ? 'local+supabase' : 'local' };
  } catch (e) {
    console.warn('Erreur sauvegarde note préparation jeune', e);
    return { success: false, source: 'local', error: e?.message || 'save_failed' };
  }
}

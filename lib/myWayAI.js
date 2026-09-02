import { supabase } from './supabaseClient';

export async function reformulateMyWayDirection({ content, pourquoi = '' }) {
  const normalizedContent = String(content || '').trim();
  if (!normalizedContent) throw new Error('Le texte à reformuler est vide.');

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error('Utilisateur non connecté');

  const response = await fetch('/api/my-way/reformulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      content: normalizedContent,
      pourquoi: String(pourquoi || '').trim(),
    }),
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload?.error || "La reformulation n'est pas disponible pour le moment.");
  }

  const proposal = String(payload?.proposal || '').trim();
  if (!proposal) throw new Error("La reformulation n'a pas renvoyé de proposition.");

  return proposal;
}

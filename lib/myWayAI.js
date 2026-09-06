import { supabase } from './supabaseClient';

async function authenticatedPost(path, body) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error('Utilisateur non connecté');

  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  let payload = {};
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok) throw new Error(payload?.error || "My Way n'est pas disponible pour le moment.");
  return payload;
}

export async function reformulateMyWayDirection({ content, pourquoi = '' }) {
  const normalizedContent = String(content || '').trim();
  if (!normalizedContent) throw new Error('Le texte à reformuler est vide.');
  const payload = await authenticatedPost('/api/my-way/reformulate', {
    content: normalizedContent,
    pourquoi: String(pourquoi || '').trim(),
  });
  const proposal = String(payload?.proposal || '').trim();
  if (!proposal) throw new Error("La reformulation n'a pas renvoyé de proposition.");
  return proposal;
}

export async function proposeMyWayIncarnations({ direction }) {
  const normalizedDirection = String(direction || '').trim();
  if (!normalizedDirection) throw new Error('Une direction validée est nécessaire.');
  const payload = await authenticatedPost('/api/my-way/incarnation', { direction: normalizedDirection });
  const proposals = Array.isArray(payload?.proposals)
    ? payload.proposals.map((value) => String(value || '').trim()).filter(Boolean)
    : [];
  if (!proposals.length) throw new Error("My Way n'a pas renvoyé de proposition concrète.");
  return proposals;
}

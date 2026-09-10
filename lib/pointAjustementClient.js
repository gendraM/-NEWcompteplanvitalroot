import { supabase } from './supabaseClient';

export async function obtenirPointAjustementAlimentaire(dateReference) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error('Utilisateur non connecté');

  const response = await fetch('/api/plan/point-ajustement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ dateReference })
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) throw new Error(payload?.error || "Le point d'ajustement n'est pas disponible.");
  return payload;
}

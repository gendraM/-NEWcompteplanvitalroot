import { createClient } from '@supabase/supabase-js';
import { collectMyWayObservations } from '../../../lib/myWayObserve';

function createAuthenticatedClient(url, anonKey, accessToken) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return res.status(500).json({ error: 'Configuration Supabase incomplète.' });

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) return res.status(401).json({ error: 'Session utilisateur requise.' });

  const client = createAuthenticatedClient(supabaseUrl, supabaseAnonKey, accessToken);
  const { data: { user }, error: authError } = await client.auth.getUser(accessToken);
  if (authError || !user) return res.status(401).json({ error: 'Session utilisateur invalide.' });

  const result = await collectMyWayObservations(client, user.id);
  return res.status(200).json(result);
}

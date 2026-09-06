import { createClient } from '@supabase/supabase-js';

function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) return payload.output_text.trim();
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text.trim();
    }
  }
  return '';
}

function parseJsonObject(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!openAiKey) return res.status(503).json({ error: "My Way n'est pas configuré pour le moment." });
  if (!supabaseUrl || !supabaseAnonKey) return res.status(500).json({ error: 'Configuration Supabase incomplète.' });

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) return res.status(401).json({ error: 'Session utilisateur requise.' });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !user) return res.status(401).json({ error: 'Session utilisateur invalide.' });

  const direction = String(req.body?.direction || '').trim();
  if (!direction) return res.status(400).json({ error: 'Une direction validée est nécessaire.' });
  if (direction.length > 2500) return res.status(400).json({ error: 'La direction est trop longue.' });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MY_WAY_MODEL || 'gpt-5.6-luna',
        instructions: [
          "Tu aides Mon Plan Vital à traduire une direction personnelle validée en incarnations possibles dans la vie réelle.",
          "Tu ne diagnostiques pas la personne et tu ne prétends jamais savoir ce qu'elle fait déjà.",
          "Propose 2 à 4 manières concrètes et simples dont cette direction POURRAIT se vivre. Ce sont des hypothèses à valider, jamais des vérités sur l'utilisateur.",
          "Chaque proposition doit être directement reliée à une idée explicitement présente dans la direction. N'ajoute aucune nouvelle valeur, aspiration, objectif ou domaine de vie.",
          "Une incarnation est un principe de manière de vivre, de choisir ou de revenir à soi. Ce n'est ni une tâche, ni une habitude chiffrée, ni un challenge, ni une règle alimentaire imposée.",
          "Ne transforme pas automatiquement une aspiration en objectif et ne crée aucune action Idéaux.",
          "Utilise la première personne, un français naturel et adulte. Une phrase courte par proposition.",
          "Retourne uniquement un JSON valide de la forme {\"proposals\":[\"...\",\"...\"]}, sans markdown ni commentaire."
        ].join('\n'),
        input: `DIRECTION VALIDÉE — Qui je choisis de devenir :\n${direction}`,
        max_output_tokens: 400
      })
    });

    if (!response.ok) {
      console.error('Erreur OpenAI My Way incarnation:', response.status);
      return res.status(502).json({ error: "My Way n'a pas pu proposer de traduction concrète pour le moment." });
    }

    const payload = await response.json();
    const parsed = parseJsonObject(extractOutputText(payload));
    const proposals = Array.isArray(parsed?.proposals)
      ? parsed.proposals.map((value) => String(value || '').trim()).filter(Boolean).slice(0, 4)
      : [];
    if (!proposals.length) throw new Error('Réponse IA sans proposition exploitable');
    return res.status(200).json({ proposals });
  } catch (error) {
    console.error('Erreur incarnation My Way:', error?.message || error);
    return res.status(502).json({ error: "My Way n'a pas pu proposer de traduction concrète pour le moment." });
  }
}

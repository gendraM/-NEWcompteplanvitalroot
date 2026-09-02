import { createClient } from '@supabase/supabase-js';

function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text.trim();
      }
    }
  }

  return '';
}

function parseJsonObject(text) {
  const cleaned = String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

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

  if (!openAiKey) {
    return res.status(503).json({ error: "La reformulation My Way n'est pas configurée pour le moment." });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Configuration Supabase incomplète.' });
  }

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!accessToken) {
    return res.status(401).json({ error: 'Session utilisateur requise.' });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !user) {
    return res.status(401).json({ error: 'Session utilisateur invalide.' });
  }

  const content = String(req.body?.content || '').trim();
  const pourquoi = String(req.body?.pourquoi || '').trim();

  if (!content) {
    return res.status(400).json({ error: 'Un texte est nécessaire pour proposer une reformulation.' });
  }

  if (content.length > 2500 || pourquoi.length > 1500) {
    return res.status(400).json({ error: 'Le texte est trop long pour cette reformulation.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MY_WAY_MODEL || 'gpt-5.6-luna',
        instructions: [
          "Tu aides une application de développement personnel appelée Mon Plan Vital.",
          "Ta seule tâche est de reformuler une direction personnelle déjà exprimée par l'utilisateur.",
          "Tu agis comme un miroir : tu clarifies sans inventer, diagnostiquer, moraliser ni ajouter de nouveaux objectifs.",
          "Préserve les dimensions réellement présentes dans le texte, y compris la spiritualité si elle est mentionnée.",
          "Écris à la première personne, en français naturel, avec un ton chaleureux et adulte.",
          "La proposition doit rester fidèle au sens, être concise et cohérente, idéalement en 2 à 4 phrases.",
          "Ne classe pas automatiquement des éléments en objectifs, aspirations ou habitudes.",
          "Retourne uniquement un objet JSON valide de la forme {\"proposal\":\"...\"}, sans markdown ni commentaire.",
        ].join('\n'),
        input: [
          "Contexte facultatif — Pourquoi j'ai commencé :",
          pourquoi || '(non renseigné)',
          '',
          "Texte utilisateur — Qui je choisis de devenir :",
          content,
        ].join('\n'),
        max_output_tokens: 350,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('Erreur OpenAI My Way:', response.status, body.slice(0, 500));
      return res.status(502).json({ error: "My Way n'a pas pu proposer de reformulation pour le moment." });
    }

    const payload = await response.json();
    const outputText = extractOutputText(payload);
    const parsed = parseJsonObject(outputText);
    const proposal = String(parsed?.proposal || '').trim();

    if (!proposal) {
      throw new Error('Réponse IA sans proposition exploitable');
    }

    return res.status(200).json({ proposal });
  } catch (error) {
    console.error('Erreur reformulation My Way:', error?.message || error);
    return res.status(502).json({ error: "My Way n'a pas pu proposer de reformulation pour le moment." });
  }
}

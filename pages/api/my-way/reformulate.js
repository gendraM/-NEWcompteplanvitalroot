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
  if (!openAiKey) return res.status(503).json({ error: "La reformulation My Way n'est pas configurée pour le moment." });
  if (!supabaseUrl || !supabaseAnonKey) return res.status(500).json({ error: 'Configuration Supabase incomplète.' });

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) return res.status(401).json({ error: 'Session utilisateur requise.' });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !user) return res.status(401).json({ error: 'Session utilisateur invalide.' });

  const content = String(req.body?.content || '').trim();
  const pourquoi = String(req.body?.pourquoi || '').trim();
  if (!content) return res.status(400).json({ error: 'Un texte est nécessaire pour proposer une reformulation.' });
  if (content.length > 2500 || pourquoi.length > 1500) return res.status(400).json({ error: 'Le texte est trop long pour cette reformulation.' });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MY_WAY_MODEL || 'gpt-5.6-luna',
        instructions: [
          "Tu aides une application de développement personnel appelée Mon Plan Vital.",
          "Ta seule tâche est de reformuler la direction personnelle déjà exprimée par l'utilisateur.",
          "Tu es un miroir sémantique, pas un coach qui complète la pensée de l'utilisateur.",
          "Chaque idée de la proposition doit être directement traçable au texte utilisateur. Le Pourquoi sert uniquement à comprendre le sens d'une formulation ambiguë : n'en transfère aucune nouvelle idée dans la direction.",
          "N'ajoute aucune aspiration, conséquence, bénéfice, opportunité, intention, valeur, objectif, émotion ou projection qui n'est pas explicitement présente dans le texte utilisateur.",
          "N'invente aucun lien de cause à effet entre les idées. N'utilise pas de formulations d'embellissement qui élargissent le sens, par exemple 'accueillir les opportunités', 'vivre la vie de mes rêves' ou équivalent, sauf si l'utilisateur l'a lui-même exprimé.",
          "Tu peux uniquement corriger la langue, regrouper les répétitions, ordonner les idées et rendre le texte plus fluide.",
          "Préserve toutes les dimensions réellement présentes, y compris la spiritualité si elle est mentionnée, sans en ajouter.",
          "Écris à la première personne, en français naturel, chaleureux et adulte, idéalement en 2 à 4 phrases.",
          "Ne classe pas automatiquement les éléments en objectifs, aspirations ou habitudes.",
          "Avant de répondre, vérifie silencieusement chaque proposition : si une idée n'a pas d'équivalent dans le texte utilisateur, retire-la.",
          "Retourne uniquement un objet JSON valide de la forme {\"proposal\":\"...\"}, sans markdown ni commentaire."
        ].join('\n'),
        input: [
          "Contexte facultatif — Pourquoi j'ai commencé (contexte seulement, ne pas y prélever de nouvelles idées) :",
          pourquoi || '(non renseigné)',
          '',
          "SOURCE UNIQUE DES IDÉES À REFORMULER — Qui je choisis de devenir :",
          content
        ].join('\n'),
        max_output_tokens: 350
      })
    });

    if (!response.ok) {
      console.error('Erreur OpenAI My Way:', response.status);
      return res.status(502).json({ error: "My Way n'a pas pu proposer de reformulation pour le moment." });
    }

    const payload = await response.json();
    const parsed = parseJsonObject(extractOutputText(payload));
    const proposal = String(parsed?.proposal || '').trim();
    if (!proposal) throw new Error('Réponse IA sans proposition exploitable');
    return res.status(200).json({ proposal });
  } catch (error) {
    console.error('Erreur reformulation My Way:', error?.message || error);
    return res.status(502).json({ error: "My Way n'a pas pu proposer de reformulation pour le moment." });
  }
}

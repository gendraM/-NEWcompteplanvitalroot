import { supabase } from './supabaseClient';

export function construireBadgePalierExtras(userId, transition, dateObtention = new Date().toISOString()) {
  if (!userId || !transition?.code || !transition?.palierAtteint) return null;
  return {
    user_id: userId,
    code: transition.code,
    type: 'extras_palier',
    nom: transition.nom || 'Nouveau rythme',
    description: `Tu as créé un rythme plus aligné avec ton objectif. Palier ${transition.palierAtteint} atteint.`,
    date_obtention: dateObtention,
    details: {
      palier_depart: transition.palierDepart,
      palier_atteint: transition.palierAtteint,
      semaines_requises: transition.semainesRequises,
      semaine_decisive: transition.semaineDecisive,
      semaines: transition.semaines || [],
    },
  };
}

export async function enregistrerBadgePalierExtras(userId, transition, dateObtention) {
  const badge = construireBadgePalierExtras(userId, transition, dateObtention);
  if (!badge) return { badge: null, nouveau: false, error: new Error('Badge extras incomplet.') };

  const { data: existant, error: lectureError } = await supabase
    .from('badges').select('*').eq('user_id', userId).eq('code', badge.code).maybeSingle();
  if (lectureError) return { badge: null, nouveau: false, error: lectureError };
  if (existant) return { badge: existant, nouveau: false, error: null };

  const { data, error } = await supabase.from('badges').insert(badge).select().single();
  return { badge: data || badge, nouveau: !error, error };
}

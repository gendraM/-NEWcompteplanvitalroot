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

export function preparerBadgesPalierExtras(userId, progression, semaines = []) {
  if (!userId || !Array.isArray(progression?.transitions)) return [];

  const semainesParDate = new Map(
    (Array.isArray(semaines) ? semaines : [])
      .map(semaine => [semaine?.weekStart || semaine?.semaine_debut, semaine])
      .filter(([weekStart]) => Boolean(weekStart))
  );

  return progression.transitions
    .map(transition => {
      const semaineDecisive = semainesParDate.get(transition.semaineDecisive);
      const dateObtention = semaineDecisive?.date_validation || new Date().toISOString();
      return {
        transition,
        dateObtention,
        badge: construireBadgePalierExtras(userId, transition, dateObtention),
      };
    })
    .filter(item => Boolean(item.badge));
}

async function lireBadgeExistant(userId, code) {
  return supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .maybeSingle();
}

export async function enregistrerBadgePalierExtras(userId, transition, dateObtention) {
  const badge = construireBadgePalierExtras(userId, transition, dateObtention);
  if (!badge) return { badge: null, nouveau: false, error: new Error('Badge extras incomplet.') };

  const { data: existant, error: lectureError } = await lireBadgeExistant(userId, badge.code);
  if (lectureError) return { badge: null, nouveau: false, error: lectureError };
  if (existant) return { badge: existant, nouveau: false, error: null };

  const { data, error } = await supabase.from('badges').insert(badge).select().single();
  if (error?.code === '23505') {
    const { data: badgeConcurrent, error: relectureError } = await lireBadgeExistant(userId, badge.code);
    return {
      badge: badgeConcurrent,
      nouveau: false,
      error: relectureError,
    };
  }

  return { badge: data || badge, nouveau: !error, error };
}

export async function synchroniserBadgesPalierExtras(userId, progression, semaines = []) {
  const badges = [];
  const nouveaux = [];
  const erreurs = [];

  for (const item of preparerBadgesPalierExtras(userId, progression, semaines)) {
    const resultat = await enregistrerBadgePalierExtras(userId, item.transition, item.dateObtention);
    if (resultat.error) {
      erreurs.push({ code: item.transition.code, error: resultat.error });
      continue;
    }
    if (resultat.badge) badges.push(resultat.badge);
    if (resultat.nouveau && resultat.badge) nouveaux.push(resultat.badge);
  }

  return { badges, nouveaux, erreurs };
}


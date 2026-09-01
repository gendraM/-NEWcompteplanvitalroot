import { supabase } from './supabaseClient';
import { defisReferentiel } from './defisReferentiel';
import { DEFIS_STATUS } from './defisUtils';

/** Initialise les défis de référence pour l'utilisateur authentifié, sans doublon. */
export async function initDefisUser() {
  let inserted = 0;
  let skipped = 0;
  const errors = [];

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (authError || !userId) return { inserted, skipped, errors: [authError || new Error('Utilisateur non authentifié')] };

  for (const defi of defisReferentiel) {
    const { data: existing, error: errorSelect } = await supabase
      .from('defis')
      .select('id')
      .eq('user_id', userId)
      .eq('description', defi.description)
      .limit(1);
    if (errorSelect) { errors.push(errorSelect); continue; }
    if (existing?.length) { skipped++; continue; }

    const { error: errorInsert } = await supabase.from('defis').insert({
      user_id: userId,
      type: defi.type,
      theme: defi.theme,
      nom: defi.nom,
      description: defi.description,
      duree: defi.duree,
      unite: defi.unite,
      progress: 0,
      status: DEFIS_STATUS.DISPONIBLE,
      created_at: new Date().toISOString()
    });
    if (errorInsert) { errors.push(errorInsert); continue; }
    inserted++;
  }
  return { inserted, skipped, errors };
}

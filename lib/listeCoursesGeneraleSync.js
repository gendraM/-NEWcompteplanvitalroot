function nombreJoursInclus(debut, fin) {
  const dateDebut = new Date(`${debut}T12:00:00Z`);
  const dateFin = new Date(`${fin}T12:00:00Z`);
  return Math.round((dateFin - dateDebut) / 86400000) + 1;
}

export function construireSnapshotListeCoursesGenerale(liste, prixEstime = null, prixReel = null) {
  return {
    version: 1,
    contexte: 'plan_general',
    periode: liste.periode,
    articles: liste.articles || [],
    incomplets: liste.incomplets || [],
    resume: liste.resume || {},
    prix_estime: prixEstime === '' ? null : prixEstime,
    prix_reel: prixReel === '' ? null : prixReel,
    enregistre_le: new Date().toISOString()
  };
}

export function restaurerSnapshotListeCoursesGenerale(ligne) {
  const snapshot = ligne?.liste_json;
  if (!snapshot || snapshot.contexte !== 'plan_general' || !Array.isArray(snapshot.articles)) return null;
  return {
    id: ligne.id,
    liste: {
      periode: snapshot.periode || { debut: ligne.semaine_debut, fin: ligne.semaine_fin },
      articles: snapshot.articles,
      incomplets: Array.isArray(snapshot.incomplets) ? snapshot.incomplets : [],
      resume: snapshot.resume || {}
    },
    prix_estime: snapshot.prix_estime ?? null,
    prix_reel: snapshot.prix_reel ?? null,
    enregistre_le: snapshot.enregistre_le || ligne.created_at || null
  };
}

export async function chargerListeCoursesGenerale(supabase, userId, debut, fin) {
  if (!supabase || !userId || !debut || !fin) return { data: null, error: null };
  const { data, error } = await supabase
    .from('listes_courses_generees')
    .select('id, semaine_debut, semaine_fin, liste_json, created_at')
    .eq('user_id', userId)
    .eq('semaine_debut', debut)
    .eq('semaine_fin', fin)
    .is('parcours_id', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data: restaurerSnapshotListeCoursesGenerale(data), error };
}

export async function sauvegarderListeCoursesGenerale(supabase, userId, liste, prixEstime = null, prixReel = null, ligneId = null) {
  if (!supabase || !userId || !liste?.periode?.debut || !liste?.periode?.fin) {
    return { data: null, error: new Error('Liste ou utilisateur incomplet.') };
  }
  const snapshot = construireSnapshotListeCoursesGenerale(liste, prixEstime, prixReel);
  const payload = {
    user_id: userId,
    parcours_id: null,
    semaine_debut: liste.periode.debut,
    semaine_fin: liste.periode.fin,
    nb_jours: nombreJoursInclus(liste.periode.debut, liste.periode.fin),
    liste_json: snapshot
  };

  let id = ligneId;
  if (!id) {
    const existante = await chargerListeCoursesGenerale(supabase, userId, liste.periode.debut, liste.periode.fin);
    if (existante.error) return existante;
    id = existante.data?.id || null;
  }

  const requete = id
    ? supabase.from('listes_courses_generees').update(payload).eq('id', id).eq('user_id', userId)
    : supabase.from('listes_courses_generees').insert(payload);
  const { data, error } = await requete.select('id, created_at').single();
  return { data: data ? { ...data, snapshot } : null, error };
}

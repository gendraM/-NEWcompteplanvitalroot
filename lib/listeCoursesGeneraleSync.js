import { CONTEXTE_LISTE_GENERAL, estContexteCristallisation } from './contexteListeCourses';

function nombreJoursInclus(debut, fin) {
  const dateDebut = new Date(`${debut}T12:00:00Z`);
  const dateFin = new Date(`${fin}T12:00:00Z`);
  return Math.round((dateFin - dateDebut) / 86400000) + 1;
}

export function construireSnapshotListeCoursesGenerale(liste, prixEstime = null, prixReel = null, contexte = CONTEXTE_LISTE_GENERAL) {
  return {
    version: 1,
    contexte: estContexteCristallisation(contexte) ? 'cristallisation' : 'plan_general',
    parcours_id: contexte?.parcours_id || null,
    criteres_actifs: contexte?.criteres_actifs || [],
    aliments_triggers: contexte?.aliments_triggers || [],
    objectif_qn: contexte?.objectif_qn ?? null,
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
  if (!snapshot || !['plan_general', 'cristallisation'].includes(snapshot.contexte) || !Array.isArray(snapshot.articles)) return null;
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
    enregistre_le: snapshot.enregistre_le || ligne.created_at || null,
    contexte: {
      type: snapshot.contexte,
      parcours_id: snapshot.parcours_id || ligne.parcours_id || null,
      criteres_actifs: snapshot.criteres_actifs || ligne.criteres_actifs || [],
      aliments_triggers: snapshot.aliments_triggers || ligne.aliments_triggers || [],
      objectif_qn: snapshot.objectif_qn ?? ligne.objectif_qn ?? null
    }
  };
}

export async function chargerListeCoursesGenerale(supabase, userId, debut, fin, contexte = CONTEXTE_LISTE_GENERAL) {
  if (!supabase || !userId || !debut || !fin) return { data: null, error: null };
  if (estContexteCristallisation(contexte) && !contexte.parcours_id) {
    return { data: null, error: new Error('Aucun parcours de cristallisation actif.') };
  }
  let requete = supabase
    .from('listes_courses_generees')
    .select('id, parcours_id, semaine_debut, semaine_fin, liste_json, criteres_actifs, aliments_triggers, objectif_qn, created_at')
    .eq('user_id', userId)
    .eq('semaine_debut', debut)
    .eq('semaine_fin', fin);
  requete = estContexteCristallisation(contexte)
    ? requete.eq('parcours_id', contexte.parcours_id)
    : requete.is('parcours_id', null);
  const { data, error } = await requete
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data: restaurerSnapshotListeCoursesGenerale(data), error };
}

export async function sauvegarderListeCoursesGenerale(supabase, userId, liste, prixEstime = null, prixReel = null, ligneId = null, contexte = CONTEXTE_LISTE_GENERAL) {
  if (!supabase || !userId || !liste?.periode?.debut || !liste?.periode?.fin) {
    return { data: null, error: new Error('Liste ou utilisateur incomplet.') };
  }
  if (estContexteCristallisation(contexte) && !contexte.parcours_id) {
    return { data: null, error: new Error('Aucun parcours de cristallisation actif.') };
  }
  const snapshot = construireSnapshotListeCoursesGenerale(liste, prixEstime, prixReel, contexte);
  const payload = {
    user_id: userId,
    parcours_id: contexte?.parcours_id || null,
    semaine_debut: liste.periode.debut,
    semaine_fin: liste.periode.fin,
    nb_jours: nombreJoursInclus(liste.periode.debut, liste.periode.fin),
    liste_json: snapshot,
    criteres_actifs: contexte?.criteres_actifs || [],
    aliments_triggers: contexte?.aliments_triggers || [],
    objectif_qn: contexte?.objectif_qn ?? null
  };

  let id = ligneId;
  if (!id) {
    const existante = await chargerListeCoursesGenerale(supabase, userId, liste.periode.debut, liste.periode.fin, contexte);
    if (existante.error) return existante;
    id = existante.data?.id || null;
  }

  const requete = id
    ? supabase.from('listes_courses_generees').update(payload).eq('id', id).eq('user_id', userId)
    : supabase.from('listes_courses_generees').insert(payload);
  const { data, error } = await requete.select('id, created_at').single();
  return { data: data ? { ...data, snapshot } : null, error };
}

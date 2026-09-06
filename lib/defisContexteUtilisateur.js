import { supabase } from './supabaseClient';
import { detecterSignauxDefis, choisirPropositionDefi } from './defisMoteurIntelligent';

const dateISO = (date) => date.toISOString().slice(0, 10);

export async function chargerContexteDefisUtilisateur() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user?.id) {
    throw new Error('Utilisateur non authentifié');
  }

  const aujourdHui = new Date();
  const debut7j = new Date(aujourdHui);
  debut7j.setDate(debut7j.getDate() - 6);

  const [repasResult, extrasResult, semaineResult, poidsResult, defisResult] = await Promise.all([
    supabase
      .from('repas_reels')
      .select('date,satiete,humeur_associee,repas_planifie_respecte,est_extra')
      .eq('user_id', user.id)
      .gte('date', dateISO(debut7j))
      .lte('date', dateISO(aujourdHui)),
    supabase
      .from('extras')
      .select('date,kcal,contexte,humeur,type')
      .eq('user_id', user.id)
      .gte('date', dateISO(debut7j))
      .lte('date', dateISO(aujourdHui)),
    supabase
      .from('semaines_validees')
      .select('weekStart,validee,extras_count,kcal_extras,budget_extras,satiete_moyenne,humeur_dominante,nb_jours_saisis')
      .eq('user_id', user.id)
      .order('weekStart', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('historique_poids')
      .select('date,poids')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(6),
    supabase
      .from('defis')
      .select('id,nom,description,type,theme,duree,unite,status,progress')
      .eq('user_id', user.id)
  ]);

  const resultats = [repasResult, extrasResult, semaineResult, poidsResult, defisResult];
  const erreur = resultats.find(resultat => resultat.error)?.error;
  if (erreur) throw erreur;

  const defis = defisResult.data || [];
  return {
    userId: user.id,
    repas7j: repasResult.data || [],
    extras7j: extrasResult.data || [],
    derniereSemaine: semaineResult.data || null,
    poids: poidsResult.data || [],
    defisDisponibles: defis.filter(defi => ['disponible', 'en attente'].includes(defi.status)),
    defiActif: defis.find(defi => defi.status === 'en cours') || null
  };
}

export async function obtenirPropositionDefiIntelligente() {
  const contexte = await chargerContexteDefisUtilisateur();
  const signaux = detecterSignauxDefis(contexte);
  const humeur = contexte.derniereSemaine?.humeur_dominante || '';
  const decision = choisirPropositionDefi({
    signaux,
    defisDisponibles: contexte.defisDisponibles,
    defiActif: contexte.defiActif,
    humeur
  });

  return {
    ...decision,
    signaux,
    contexte: {
      repasObserves: contexte.repas7j.length,
      extrasObserves: contexte.extras7j.length,
      mesuresPoids: contexte.poids.length,
      humeur,
      defiActif: contexte.defiActif?.nom || null
    }
  };
}

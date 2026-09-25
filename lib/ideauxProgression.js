import { calculerProgressionPalier, extraireSemainesPalier } from './ideauxPalier';
import { calculerBilanPalier } from './ideauxBilanPalier';
import { evaluerEtatCycle, getNumeroPalierCourant } from './ideauxCycle';
import { creerProfilIndicateurs, construireSignauxIndicateurs } from './ideauxIndicateurs';
import { construirePropositionProgression } from './ideauxProgressionAdaptative';

function extraireNombre(valeur) {
  if (typeof valeur === 'number') return Number.isFinite(valeur) ? valeur : null;
  if (typeof valeur !== 'string') return null;
  const match = valeur.replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function construireProfilIdeal(ideal) {
  const params = ideal?.plan_params_valides || {};
  const actionType = ideal?.plan_data?.objectif?.routines?.[0]?.action_type;
  const estCourse = actionType === 'course';

  if (estCourse) {
    return creerProfilIndicateurs('course', {
      duree: extraireNombre(params.duree ?? ideal?.plan_data?.objectif?.duree_unite),
      vitesse: extraireNombre(params.vitesse ?? params.intensite ?? ideal?.plan_data?.objectif?.intensite),
      frequence: extraireNombre(params.frequence ?? ideal?.plan_data?.objectif?.frequence_par_semaine),
    });
  }

  return creerProfilIndicateurs(ideal?.type_ideal || 'generique', {
    indicateurs: Array.isArray(params.indicateurs) ? params.indicateurs : [],
  });
}

function realisationsPourIndicateurs(seances = []) {
  return (seances || [])
    .filter((seance) => seance?.fait === true && seance?.bonus !== true)
    .map((seance) => ({
      duree: seance?.duree_reelle,
      distance: seance?.distance_km,
      vitesse: seance?.vitesse,
    }));
}

function normaliserId(value) {
  return value == null ? null : String(value);
}

export function rattacherProgressionAuxIdeaux(ideaux = [], seancesReelles = []) {
  const seancesParIdeal = new Map();

  for (const seance of seancesReelles || []) {
    const idealId = normaliserId(seance?.ideal_id);
    if (!idealId) continue;
    const groupe = seancesParIdeal.get(idealId) || [];
    groupe.push(seance);
    seancesParIdeal.set(idealId, groupe);
  }

  return (ideaux || []).map((ideal) => {
    const idealId = normaliserId(ideal?.id);
    const toutesLesSeances = idealId ? (seancesParIdeal.get(idealId) || []) : [];
    const numeroPalier = getNumeroPalierCourant(ideal);
    const seances = toutesLesSeances.filter(
      (seance) => Number(seance?.palier_numero || 1) === numeroPalier
    );
    const semaines = extraireSemainesPalier(ideal?.plan_data, ideal);
    const profilIndicateurs = construireProfilIdeal(ideal);
    const signauxIndicateurs = construireSignauxIndicateurs(
      profilIndicateurs,
      realisationsPourIndicateurs(seances)
    );
    const propositionProgression = construirePropositionProgression(
      profilIndicateurs,
      signauxIndicateurs
    );

    return {
      ...ideal,
      seances_reelles: seances,
      historique_seances_reelles: toutesLesSeances,
      progression_palier: calculerProgressionPalier(semaines, seances),
      bilan_palier: calculerBilanPalier(ideal, seances),
      cycle_palier: evaluerEtatCycle(ideal),
      profil_indicateurs: profilIndicateurs,
      signaux_indicateurs: signauxIndicateurs,
      proposition_progression: propositionProgression,
    };
  });
}

export async function chargerIdeauxAvecProgression(supabase, userId) {
  if (!supabase?.from) throw new Error('Client Supabase invalide');

  let ideauxQuery = supabase.from('ideaux').select('*').order('date_cible', { ascending: true });
  if (userId) ideauxQuery = ideauxQuery.eq('user_id', userId);

  const { data: ideaux, error: ideauxError } = await ideauxQuery;
  if (ideauxError) throw ideauxError;

  const listeIdeaux = ideaux || [];
  const ids = listeIdeaux.map((ideal) => ideal?.id).filter(Boolean);
  if (!ids.length) return rattacherProgressionAuxIdeaux(listeIdeaux, []);

  let seancesQuery = supabase.from('seances_reelles').select('*').in('ideal_id', ids);
  if (userId) seancesQuery = seancesQuery.eq('user_id', userId);

  const { data: seances, error: seancesError } = await seancesQuery;
  if (seancesError) throw seancesError;

  return rattacherProgressionAuxIdeaux(listeIdeaux, seances || []);
}

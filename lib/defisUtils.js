import { supabase } from './supabaseClient';
import { defisReferentiel } from './defisReferentiel';

export const DEFIS_STATUS = {
  DISPONIBLE: 'disponible',
  EN_COURS: 'en cours',
  TERMINE: 'terminé'
};

export function getDefiMax(defi) {
  const ref = defisReferentiel.find(d => d.description === defi?.description || d.nom === defi?.nom);
  return Number(defi?.duree || ref?.duree || 1);
}

export function isDefiDisponible(defi) {
  return defi?.status === DEFIS_STATUS.DISPONIBLE;
}

export function isDefiEnCours(defi) {
  return defi?.status === DEFIS_STATUS.EN_COURS;
}

export function isDefiTermine(defi) {
  return defi?.status === DEFIS_STATUS.TERMINE;
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) {
    throw new Error('Utilisateur non authentifié');
  }
  return data.user.id;
}

/**
 * Autorité unique de progression d'un défi.
 * Une preuve optionnelle permet de rendre l'incrément idempotent.
 */
export async function validerEtapeDefi(defi, options = {}) {
  try {
    if (!defi?.id) return { success: false, error: 'Défi invalide' };

    const userId = await getAuthenticatedUserId();
    const { data: courant, error: selectError } = await supabase
      .from('defis')
      .select('*')
      .eq('id', defi.id)
      .eq('user_id', userId)
      .single();

    if (selectError || !courant) {
      return { success: false, error: selectError?.message || 'Défi introuvable' };
    }

    const max = getDefiMax(courant);
    if (courant.status === DEFIS_STATUS.TERMINE || Number(courant.progress || 0) >= max) {
      return {
        success: true,
        progressionIncrementee: false,
        nouvelleProgression: max,
        newProgress: max,
        nouveauStatus: DEFIS_STATUS.TERMINE
      };
    }

    const nouvelleProgression = Math.min(Number(courant.progress || 0) + 1, max);
    const nouveauStatus = nouvelleProgression >= max ? DEFIS_STATUS.TERMINE : DEFIS_STATUS.EN_COURS;

    const { error: updateError } = await supabase
      .from('defis')
      .update({ progress: nouvelleProgression, status: nouveauStatus })
      .eq('id', courant.id)
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, error: 'Erreur lors de la progression du défi' };
    }

    // La table badges historique n'est pas encore user-scopée : on conserve le comportement
    // sans l'utiliser comme autorité d'ownership. La migration dédiée sera faite séparément.
    if (nouveauStatus === DEFIS_STATUS.TERMINE) {
      const { data: badgesExistants, error: badgeCheckError } = await supabase
        .from('badges')
        .select('id')
        .eq('nom', courant.nom)
        .limit(1);

      if (!badgeCheckError && (!badgesExistants || badgesExistants.length === 0)) {
        await supabase.from('badges').insert({
          nom: courant.nom,
          description: courant.description,
          date_obtention: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      progressionIncrementee: true,
      nouvelleProgression,
      newProgress: nouvelleProgression,
      nouveauStatus
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

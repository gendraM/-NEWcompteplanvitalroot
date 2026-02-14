import { supabase } from "../lib/supabaseClient";

/**
 * Charge tous les repas de la table repas_reels entre deux dates (incluses)
 * @param {string} dateDebut - format YYYY-MM-DD
 * @param {string} dateFin - format YYYY-MM-DD
 * @returns {Promise<Array>} Liste des repas
 */
export async function fetchRepasPeriode(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return [];
  const { data, error } = await supabase
    .from("repas_reels")
    .select("*")
    .gte("date", dateDebut)
    .lte("date", dateFin);
  if (error) throw new Error("Erreur chargement repas: " + error.message);
  return data || [];
}

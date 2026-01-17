
import { useState, useEffect } from 'react';
import foodsGlobal from '../data/referentiel';
import { supabase } from './supabaseClient';

/**
 * Hook pour fusionner le référentiel global et utilisateur
 * Retourne les listes séparées et fusionnées
 */
export default function useUserReferentiel(userId) {
  console.log('[DEBUG useUserReferentiel] hook appelé avec userId:', userId);
  const [referentielGlobal, setReferentielGlobal] = useState([]);
  const [referentielCustom, setReferentielCustom] = useState([]);
  const [referentielComplet, setReferentielComplet] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReferentielGlobal(foodsGlobal);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchCustomAliments() {
      console.log('[DEBUG useUserReferentiel] fetchCustomAliments lancé pour userId:', userId);
      setLoading(true);
      // 1. Aliments approuvés (publics)
      const { data: approuves, error: errorA } = await supabase
        .from('referentiel_user_custom')
        .select('aliment_data')
        .eq('statut', 'approuve');
      if (errorA) {
        console.error('[DEBUG useUserReferentiel] ERREUR récupération approuves:', errorA);
      }
      // 2. Aliments de l'utilisateur (privés, tous statuts)
      const { data: userCustom, error: errorU } = await supabase
        .from('referentiel_user_custom')
        .select('aliment_data, statut')
        .eq('user_id', userId);
      if (errorU) {
        console.error('[DEBUG useUserReferentiel] ERREUR récupération userCustom:', errorU);
      }

      if (!isMounted) return;

      let customs = [];
      if (approuves) {
        customs = customs.concat(approuves.map(a => ({ ...a.aliment_data, statut: 'approuve' })));
      }
      if (userCustom) {
        // Ajoute TOUS les aliments personnalisés de l'utilisateur, en parsant aliment_data (JSON)
        customs = customs.concat(
          userCustom
            .filter(a => a.aliment_data)
            .map(a => {
              let data = a.aliment_data;
              if (typeof data === 'string') {
                try {
                  data = JSON.parse(data);
                } catch (e) {
                  console.error('[DEBUG useUserReferentiel] Erreur JSON.parse aliment_data:', a.aliment_data, e);
                }
              }
              return { ...data, statut: a.statut };
            })
        );
      }
      // LOG détaillé pour debug
      console.log('[DEBUG useUserReferentiel] customs récupérés:', customs.map(a => ({ nom: a.nom, statut: a.statut })));
      setReferentielCustom(customs);
      setLoading(false);
    }
    if (userId) fetchCustomAliments();
    return () => { isMounted = false; };
  }, [userId]);

  useEffect(() => {
    const fusion = [...referentielGlobal, ...referentielCustom];
    console.log('[DEBUG useUserReferentiel] fusion finale:', fusion.map(a => ({ nom: a.nom, statut: a.statut })));
    setReferentielComplet(fusion);
  }, [referentielGlobal, referentielCustom]);

  return { referentielGlobal, referentielCustom, referentielComplet, loading };
}

import { useState, useEffect } from 'react';
import foodsGlobal from '../data/referentiel';
import foodsUser from '../data/foods_user'; // à remplacer par accès Supabase

/**
 * Hook pour fusionner le référentiel global et utilisateur
 * Retourne les listes séparées et fusionnées
 */
export default function useUserReferentiel(userId) {
  const [referentielGlobal, setReferentielGlobal] = useState([]);
  const [referentielCustom, setReferentielCustom] = useState([]);
  const [referentielComplet, setReferentielComplet] = useState([]);

  useEffect(() => {
    // Charger le référentiel global
    setReferentielGlobal(foodsGlobal);
    // Charger le référentiel utilisateur (mock ici)
    setReferentielCustom(foodsUser.filter(a => a.user_id === userId));
  }, [userId]);

  useEffect(() => {
    setReferentielComplet([...referentielGlobal, ...referentielCustom]);
  }, [referentielGlobal, referentielCustom]);

  return { referentielGlobal, referentielCustom, referentielComplet };
}

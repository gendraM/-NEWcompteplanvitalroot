import { useCallback, useEffect, useState } from 'react';
import ModeTrouSuiviCard from './ModeTrouSuiviCard';
import { supabase } from '../lib/supabaseClient';
import { choisirPeriodeAProposer } from '../lib/periodesSansSuivi';

function ajouterJours(dateIso, jours) {
  const date = new Date(`${dateIso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + jours);
  return date.toISOString().slice(0, 10);
}

export default function ModeTrouSuiviConnecte({ dateSelectionnee = null }) {
  const [userId, setUserId] = useState(null);
  const [repas, setRepas] = useState([]);
  const [periodesTraitees, setPeriodesTraitees] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [messageErreur, setMessageErreur] = useState('');

  const charger = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      setUserId(null);
      setSuggestion(null);
      return;
    }

    setUserId(user.id);
    const [resultatRepas, resultatPeriodes] = await Promise.all([
      supabase.from('repas_reels').select('date').order('date', { ascending: true }),
      supabase
        .from('suivi_periodes_estimees')
        .select('date_debut,date_fin,statut,reproposer_apres')
        .eq('user_id', user.id)
    ]);

    if (resultatRepas.error || resultatPeriodes.error) {
      console.error('[TrouSuivi] Chargement impossible', resultatRepas.error || resultatPeriodes.error);
      setMessageErreur('La recherche des périodes sans suivi est momentanément indisponible.');
      setSuggestion(null);
      return;
    }

    setMessageErreur('');
    setRepas(resultatRepas.data || []);
    setPeriodesTraitees(resultatPeriodes.data || []);
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    setSuggestion(choisirPeriodeAProposer({
      repas,
      periodesTraitees,
      dateSelectionnee
    }));
  }, [dateSelectionnee, repas, periodesTraitees]);

  const enregistrer = async (payload) => {
    if (!userId) return;
    const { error } = await supabase.from('suivi_periodes_estimees').upsert({
      user_id: userId,
      date_debut: payload.dateDebut,
      date_fin: payload.dateFin,
      qualite_alimentaire: payload.qualiteAlimentaire || null,
      frequence_extras: payload.frequenceExtras || null,
      repas_moyens: payload.repasMoyens || null,
      challenge_realise: payload.challengeRealise === 'oui',
      challenge_type: payload.challengeType || null,
      challenge_duree: payload.challengeDuree || null,
      evolution_poids: payload.evolutionPoids || null,
      energie_globale: payload.energieGlobale || null,
      classification: payload.classification || {},
      source: 'questionnaire_periode',
      statut: 'completee',
      reproposer_apres: null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date_debut,date_fin' });

    if (error) {
      console.error('[TrouSuivi] Enregistrement impossible', error);
      setMessageErreur("La période n'a pas pu être enregistrée. Réessaie dans quelques instants.");
      return;
    }
    await charger();
  };

  const reporter = async () => {
    if (!userId || !suggestion) return;
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from('suivi_periodes_estimees').upsert({
      user_id: userId,
      date_debut: suggestion.dateDebut,
      date_fin: suggestion.dateFin,
      classification: {},
      source: 'questionnaire_periode',
      statut: 'reportee',
      reproposer_apres: ajouterJours(aujourdHui, 7),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date_debut,date_fin' });

    if (error) {
      console.error('[TrouSuivi] Report impossible', error);
      setMessageErreur("Le report n'a pas pu être enregistré.");
      return;
    }
    await charger();
  };

  return (
    <>
      <ModeTrouSuiviCard suggestion={suggestion} onSave={enregistrer} onDismiss={reporter} />
      {messageErreur && (
        <div role="alert" style={{ color: '#b91c1c', marginBottom: 16, fontSize: 14 }}>
          {messageErreur}
        </div>
      )}
    </>
  );
}

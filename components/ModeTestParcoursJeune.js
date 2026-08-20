import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const lireJson = cle => {
  try { return JSON.parse(localStorage.getItem(cle) || 'null'); }
  catch { return null; }
};

const decalerDate = (valeur, jours = -1) => {
  if (!valeur) return null;
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + jours);
  return date.toISOString().slice(0, 10);
};

export default function ModeTestParcoursJeune() {
  const router = useRouter();
  const [actif, setActif] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    setActif(localStorage.getItem('modeTestParcoursJeune') === 'true');
  }, [router.asPath]);

  if (!actif || router.pathname === '/test-reprise') return null;

  const estPreparation = router.pathname === '/preparation-jeune';
  const estJeune = router.pathname === '/jeune';
  const estReprise = router.pathname === '/reprise-alimentaire-apres-jeune';
  const peutAvancer = estPreparation || estJeune || estReprise;

  const avancerPreparation = async user => {
    const preparation = lireJson('preparationData');
    if (!preparation?.startDate) {
      throw new Error('Commence d’abord ta préparation sur la page actuelle.');
    }
    const prochaineDateJeune = decalerDate(preparation.startDate);
    const preparationMaj = { ...preparation, startDate: prochaineDateJeune };
    localStorage.setItem('preparationData', JSON.stringify(preparationMaj));
    localStorage.setItem('dateJeune', prochaineDateJeune);

    if (user?.id && preparation.id) {
      const { error } = await supabase.from('preparations_jeune')
        .update({ date_debut_jeune: prochaineDateJeune, updated_at: new Date().toISOString() })
        .eq('id', preparation.id).eq('user_id', user.id);
      if (error) throw error;
    }

    const parcoursId = preparation.parcoursId || preparation.jeuneId || localStorage.getItem('parcoursJeuneActifId');
    if (user?.id && parcoursId) {
      const { error } = await supabase.from('parcours_jeune')
        .update({ date_debut_jeune: prochaineDateJeune, updated_at: new Date().toISOString() })
        .eq('id', parcoursId).eq('user_id', user.id);
      if (error) throw error;
    }
  };

  const avancerJeune = async user => {
    const preparation = lireJson('preparationData') || {};
    const dateActuelle = preparation.startDate
      || localStorage.getItem(user?.id ? `dateDebutJeune_${user.id}` : 'dateDebutJeune')
      || localStorage.getItem('dateDebutJeune');
    if (!dateActuelle) throw new Error('Aucun jeûne démarré n’a été trouvé.');
    const nouvelleDate = decalerDate(dateActuelle);

    localStorage.setItem('dateDebutJeune', nouvelleDate);
    localStorage.setItem('preparationData', JSON.stringify({ ...preparation, startDate: nouvelleDate }));
    if (user?.id) localStorage.setItem(`dateDebutJeune_${user.id}`, nouvelleDate);

    if (user?.id) {
      const parcoursId = localStorage.getItem('parcoursJeuneActifId');
      let requete = supabase.from('parcours_jeune').update({
        date_debut: nouvelleDate,
        date_debut_jeune: nouvelleDate,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);
      requete = parcoursId
        ? requete.eq('id', parcoursId)
        : requete.eq('statut', 'en_cours');
      const { error } = await requete;
      if (error) throw error;
    }
  };

  const avancerReprise = async user => {
    const programme = lireJson('programmeRepriseValide');
    if (!programme?.date_debut_reprise) throw new Error('Aucune reprise validée n’a été trouvée.');

    const debut = decalerDate(programme.date_debut_reprise);
    const fin = decalerDate(programme.date_fin_reprise);
    const jours = (programme.jours_detailles || programme.jours || []).map(jour => ({
      ...jour,
      date: decalerDate(jour.date)
    }));
    const programmeMaj = { ...programme, date_debut_reprise: debut, date_fin_reprise: fin, jours_detailles: jours };
    localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeMaj));

    if (user?.id && programme.id) {
      const { error } = await supabase.from('reprises_alimentaires').update({
        date_debut_reprise: debut,
        date_fin_reprise: fin,
        updated_at: new Date().toISOString()
      }).eq('id', programme.id).eq('user_id', user.id);
      if (error) throw error;

      const { data: joursDistants, error: erreurJours } = await supabase
        .from('reprises_jours_valides').select('id, date')
        .eq('reprise_id', programme.id).eq('user_id', user.id);
      if (erreurJours) throw erreurJours;
      for (const jour of joursDistants || []) {
        const { error: erreurJour } = await supabase.from('reprises_jours_valides')
          .update({ date: decalerDate(jour.date) })
          .eq('id', jour.id).eq('user_id', user.id);
        if (erreurJour) throw erreurJour;
      }
    }
  };

  const passerJourSuivant = async () => {
    setChargement(true);
    setErreur('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (estPreparation) await avancerPreparation(user);
      if (estJeune) await avancerJeune(user);
      if (estReprise) await avancerReprise(user);
      router.reload();
    } catch (e) {
      console.error('[MODE TEST] Passage au jour suivant impossible:', e);
      setErreur(e.message || 'Passage au jour suivant impossible.');
      setChargement(false);
    }
  };

  const quitter = () => {
    localStorage.removeItem('modeTestParcoursJeune');
    localStorage.removeItem('test_modeRepriseActif');
    localStorage.setItem('repriseMode', 'normal');
    setActif(false);
    router.push('/profil');
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10000, padding: '10px 16px', background: '#fff3cd', borderBottom: '2px solid #f59e0b', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <strong>🧪 Mode test actif</strong>
        {peutAvancer && (
          <button onClick={passerJourSuivant} disabled={chargement} style={{ border: 0, borderRadius: 7, padding: '8px 14px', background: '#1976d2', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {chargement ? 'Avancement…' : 'Passer au jour suivant'}
          </button>
        )}
        <button onClick={quitter} style={{ border: '1px solid #795548', borderRadius: 7, padding: '7px 14px', background: '#fff', color: '#5d4037', fontWeight: 700, cursor: 'pointer' }}>
          Quitter le mode test
        </button>
      </div>
      {erreur && <div style={{ textAlign: 'center', color: '#b71c1c', marginTop: 7 }}>{erreur}</div>}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { createParcoursJeune, demarrerPhaseJeune } from '../lib/parcoursJeuneAPI';
import { savePreparationJeuneSupabase } from '../lib/preparationsJeune';
import { avancerDateModeTest, getDateMetierISO, initialiserDateModeTest } from '../lib/modeTestClock';

const lireJson = cle => {
  try { return JSON.parse(localStorage.getItem(cle) || 'null'); }
  catch { return null; }
};

export default function ModeTestParcoursJeune() {
  const router = useRouter();
  const [actif, setActif] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [dateVirtuelle, setDateVirtuelle] = useState(null);

  useEffect(() => {
    const actifDansUrl = router.query.modeTest === '1';
    if (actifDansUrl) localStorage.setItem('modeTestParcoursJeune', 'true');
    const modeActif = actifDansUrl || localStorage.getItem('modeTestParcoursJeune') === 'true';
    setActif(modeActif);
    if (modeActif) setDateVirtuelle(initialiserDateModeTest());
  }, [router.asPath, router.query.modeTest]);

  if (!actif) return null;

  const estPreparation = router.pathname === '/preparation-jeune';
  const estJeune = router.pathname === '/jeune';
  const estReprise = router.pathname === '/reprise-alimentaire-apres-jeune';
  const peutAvancer = estPreparation || estJeune || estReprise;
  const preparationTest = estPreparation ? lireJson('preparationData') : null;
  const dateJeuneAtteinte = Boolean(
    preparationTest?.startDate
    && preparationTest.startDate <= dateVirtuelle
  );

  const passerJourSuivant = async () => {
    setChargement(true);
    setErreur('');
    try {
      avancerDateModeTest();
      router.reload();
    } catch (e) {
      console.error('[MODE TEST] Passage au jour suivant impossible:', e);
      setErreur(e.message || 'Passage au jour suivant impossible.');
      setChargement(false);
    }
  };

  const demarrerJeuneTest = async () => {
    setChargement(true);
    setErreur('');
    try {
      const { data: { user }, error: erreurUtilisateur } = await supabase.auth.getUser();
      if (erreurUtilisateur || !user?.id) {
        throw new Error('La session Supabase est introuvable. Reconnecte-toi puis réessaie.');
      }

      const preparation = lireJson('preparationData');
      if (!preparation) throw new Error('Aucune préparation active n’a été trouvée.');

      const aujourdHui = getDateMetierISO();
      const duree = Number(preparation.duration || localStorage.getItem('dureeJeune')) || 5;
      let parcoursId = preparation.parcoursId
        || preparation.jeuneId
        || localStorage.getItem('parcoursJeuneActifId');

      if (!parcoursId) {
        const parcours = await createParcoursJeune({
          type: 'preparation',
          date_debut: aujourdHui,
          date_debut_preparation: aujourdHui,
          date_debut_jeune: aujourdHui,
          duree_jours: duree,
          statut: 'en_cours',
          progression: { source: 'mode-test-parcours-jeune' }
        }, user.id);
        parcoursId = parcours.id;
      }

      await demarrerPhaseJeune(parcoursId, user.id, {
        date_debut_jeune: aujourdHui,
        date_fin_preparation: aujourdHui,
        duree_jours: duree,
        message_perso: preparation.messagePerso || preparation.msgTexte || null
      });

      const preparationLiee = {
        ...preparation,
        parcoursId,
        jeuneId: parcoursId,
        startDate: aujourdHui
      };
      await savePreparationJeuneSupabase(user.id, preparationLiee);

      localStorage.setItem('preparationData', JSON.stringify(preparationLiee));
      localStorage.setItem('parcoursJeuneActifId', parcoursId);
      localStorage.setItem('phaseJeuneCommencee', 'true');
      localStorage.setItem('dateDebutJeune', aujourdHui);
      localStorage.setItem(`dateDebutJeune_${user.id}`, aujourdHui);
      localStorage.setItem('dureeJeune', String(duree));
      localStorage.setItem(`dureeJeune_${user.id}`, JSON.stringify(duree));
      localStorage.setItem('joursValides', '[]');
      localStorage.setItem(`joursValides_${user.id}`, '[]');
      localStorage.setItem('bilanPreparationJeune', JSON.stringify(preparationLiee));

      await router.push('/jeune');
    } catch (e) {
      console.error('[MODE TEST] Démarrage du jeûne impossible:', e);
      setErreur(e.message || 'Démarrage du jeûne impossible.');
      setChargement(false);
    }
  };

  const quitter = () => {
    localStorage.removeItem('modeTestParcoursJeune');
    localStorage.removeItem('modeTestDateVirtuelle');
    localStorage.removeItem('test_modeRepriseActif');
    localStorage.setItem('repriseMode', 'normal');
    setActif(false);
    router.push('/profil');
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10000, padding: '10px 16px', background: '#fff3cd', borderBottom: '2px solid #f59e0b', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <strong>🧪 Mode test actif</strong>
        {dateVirtuelle && <span>Date simulée : <b>{new Date(`${dateVirtuelle}T12:00:00`).toLocaleDateString('fr-FR')}</b></span>}
        {peutAvancer && (
          <button onClick={passerJourSuivant} disabled={chargement} style={{ border: 0, borderRadius: 7, padding: '8px 14px', background: '#1976d2', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {chargement ? 'Avancement…' : 'Passer au jour suivant'}
          </button>
        )}
        {estPreparation && dateJeuneAtteinte && (
          <button onClick={demarrerJeuneTest} disabled={chargement} style={{ border: 0, borderRadius: 7, padding: '8px 14px', background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {chargement ? 'Démarrage…' : 'Démarrer le jeûne (test)'}
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

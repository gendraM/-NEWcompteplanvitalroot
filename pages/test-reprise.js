import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const iso = date => date.toISOString().slice(0, 10);
const dateDecalee = jours => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + jours);
  return iso(date);
};
const lireJson = cle => {
  try { return JSON.parse(localStorage.getItem(cle) || 'null'); }
  catch { return null; }
};

export default function TestParcoursJeune() {
  const [jourPreparation, setJourPreparation] = useState(10);
  const [jourJeune, setJourJeune] = useState(1);
  const [jourReprise, setJourReprise] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => localStorage.setItem('modeTestParcoursJeune', 'true'), []);

  const executer = async action => {
    setLoading(true);
    setMessage('');
    try { await action(); }
    catch (error) {
      console.error('[MODE TEST PARCOURS JEÛNE]', error);
      setMessage(`❌ ${error.message}`);
    } finally { setLoading(false); }
  };

  const simulerJourJeune = () => executer(async () => {
    const dateDebut = dateDecalee(-(jourJeune - 1));
    const joursValides = Array.from({ length: Math.max(0, jourJeune - 1) }, (_, index) => index + 1);
    const preparation = lireJson('preparationData') || {};
    const duree = Number(preparation.duration || localStorage.getItem('dureeJeune') || 7);

    localStorage.setItem('modeTestParcoursJeune', 'true');
    localStorage.setItem('phaseJeuneCommencee', 'true');
    localStorage.setItem('preparationActive', 'false');
    localStorage.setItem('dateDebutJeune', dateDebut);
    localStorage.setItem('dureeJeune', String(duree));
    localStorage.setItem('joursValides', JSON.stringify(joursValides));
    localStorage.setItem('preparationData', JSON.stringify({ ...preparation, startDate: dateDebut, duration: duree }));

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      localStorage.setItem(`dateDebutJeune_${user.id}`, dateDebut);
      localStorage.setItem(`dureeJeune_${user.id}`, JSON.stringify(duree));
      localStorage.setItem(`joursValides_${user.id}`, JSON.stringify(joursValides));
      const { data: parcours, error: lecture } = await supabase
        .from('parcours_jeune').select('id').eq('user_id', user.id)
        .eq('statut', 'en_cours').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (lecture) throw lecture;
      if (parcours?.id) {
        const { error } = await supabase.from('parcours_jeune').update({
          type: 'jeune', date_debut: dateDebut, date_debut_jeune: dateDebut,
          duree_jours: duree, jours_valides: joursValides, updated_at: new Date().toISOString()
        }).eq('id', parcours.id).eq('user_id', user.id);
        if (error) throw error;
        localStorage.setItem('parcoursJeuneActifId', parcours.id);
      }
    }
    setMessage(`✅ Parcours positionné au jour ${jourJeune} du jeûne.`);
  });

  const simulerJourPreparation = () => executer(async () => {
    const preparation = lireJson('preparationData');
    if (!preparation) throw new Error('Crée d’abord la préparation depuis son écran, puis reviens ici.');
    const dateJeune = dateDecalee(jourPreparation);
    const preparationDecalee = { ...preparation, startDate: dateJeune };

    localStorage.setItem('modeTestParcoursJeune', 'true');
    localStorage.setItem('preparationActive', 'true');
    localStorage.setItem('phaseJeuneCommencee', 'false');
    localStorage.setItem('dateJeune', dateJeune);
    localStorage.setItem('preparationData', JSON.stringify(preparationDecalee));

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      if (preparation.id) {
        const { error } = await supabase.from('preparations_jeune')
          .update({ date_debut_jeune: dateJeune, updated_at: new Date().toISOString() })
          .eq('id', preparation.id).eq('user_id', user.id);
        if (error) throw error;
      }
      const parcoursId = preparation.parcoursId || preparation.jeuneId || localStorage.getItem('parcoursJeuneActifId');
      if (parcoursId) {
        const { error } = await supabase.from('parcours_jeune').update({
          type: 'preparation', date_debut_jeune: dateJeune, updated_at: new Date().toISOString()
        }).eq('id', parcoursId).eq('user_id', user.id);
        if (error) throw error;
      }
    }
    setMessage(`✅ Préparation positionnée à J-${jourPreparation} avant le jeûne.`);
  });

  const simulerJourReprise = () => executer(async () => {
    const programme = lireJson('programmeRepriseValide') || lireJson('programmeReprise');
    if (!programme) throw new Error('Aucun programme trouvé. Génère puis valide d’abord le programme depuis le parcours.');
    const duree = Number(programme.duree_reprise_jours || programme.jours_detailles?.length || 1);
    if (jourReprise > duree) throw new Error(`Ce programme contient seulement ${duree} jours.`);

    const dateDebut = dateDecalee(-(jourReprise - 1));
    const dateFin = new Date(`${dateDebut}T12:00:00`);
    dateFin.setDate(dateFin.getDate() + duree - 1);
    const jours = (programme.jours_detailles || programme.jours || []).map((jour, index) => ({
      ...jour, date: dateDecalee(index - (jourReprise - 1))
    }));
    const programmeDecale = {
      ...programme, date_debut_reprise: dateDebut, date_fin_reprise: iso(dateFin),
      jours_detailles: jours, statut: programme.statut === 'proposition' ? 'plan_valide' : programme.statut
    };
    localStorage.setItem('modeTestParcoursJeune', 'true');
    localStorage.setItem('repriseMode', 'test');
    localStorage.setItem('test_modeRepriseActif', 'true');
    localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeDecale));
    localStorage.setItem('test_programmeRepriseValide', JSON.stringify(programmeDecale));

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id && programme.id) {
      const { error: repriseError } = await supabase.from('reprises_alimentaires').update({
        date_debut_reprise: dateDebut, date_fin_reprise: iso(dateFin),
        statut: programmeDecale.statut, updated_at: new Date().toISOString()
      }).eq('id', programme.id).eq('user_id', user.id);
      if (repriseError) throw repriseError;

      const { data: joursDistants, error: joursError } = await supabase
        .from('reprises_jours_valides').select('id, jour_numero')
        .eq('reprise_id', programme.id).eq('user_id', user.id);
      if (joursError) throw joursError;
      for (const jour of joursDistants || []) {
        const { error } = await supabase.from('reprises_jours_valides')
          .update({ date: dateDecalee((jour.jour_numero - 1) - (jourReprise - 1)) })
          .eq('id', jour.id).eq('user_id', user.id);
        if (error) throw error;
      }
    }
    setMessage(`✅ Programme positionné au jour ${jourReprise} de la reprise.`);
  });

  const desactiver = () => {
    localStorage.removeItem('modeTestParcoursJeune');
    localStorage.removeItem('test_modeRepriseActif');
    localStorage.setItem('repriseMode', 'normal');
    setMessage('Mode test désactivé. Aucune donnée supprimée.');
  };

  const card = { background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: 18, marginBottom: 16 };
  const lien = { display: 'inline-block', background: '#1976d2', color: '#fff', padding: '10px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 };
  const bouton = { ...lien, border: 0, cursor: loading ? 'wait' : 'pointer' };

  return <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui', background: '#f7f8fa' }}>
    <h1>🧪 Mode test parcours jeûne</h1>
    <p style={{ background: '#fff3cd', padding: 14, borderRadius: 8 }}>
      Ce mode utilise les véritables écrans et leur fonctionnement Supabase. Il accélère seulement les dates et ne supprime aucune donnée.
    </p>
    {message && <p style={{ background: '#e8f5e9', padding: 12, borderRadius: 8 }}>{message}</p>}

    <section style={card}><h2>1. Préparation au jeûne</h2>
      <p>Crée d’abord la préparation depuis son écran réel, puis reviens choisir le nombre de jours restant avant le jeûne.</p>
      <input type="number" min="0" max="30" value={jourPreparation} onChange={e => setJourPreparation(Number(e.target.value))} style={{ width: 70, padding: 9, marginRight: 10 }} />
      <button disabled={loading} onClick={simulerJourPreparation} style={bouton}>Positionner à J-{jourPreparation}</button>
      <Link href="/preparation-jeune" style={{ ...lien, marginLeft: 10 }}>Ouvrir la préparation</Link>
    </section>

    <section style={card}><h2>2. Jeûne</h2>
      <p>Choisis le jour à afficher. Les jours antérieurs seront considérés comme validés.</p>
      <input type="number" min="1" max="30" value={jourJeune} onChange={e => setJourJeune(Number(e.target.value))} style={{ width: 70, padding: 9, marginRight: 10 }} />
      <button disabled={loading} onClick={simulerJourJeune} style={bouton}>Positionner ce jour</button>
      <Link href="/jeune" style={{ ...lien, marginLeft: 10 }}>Ouvrir le suivi</Link>
    </section>

    <section style={card}><h2>3. Programme et liste de courses</h2>
      <p>La génération reste celle du suivi du jeûne. Ouvre ensuite le véritable écran de validation.</p>
      <Link href="/validation-plan-reprise" style={lien}>Ouvrir le plan et la liste</Link>
    </section>

    <section style={card}><h2>4. Reprise alimentaire</h2>
      <p>Après génération et validation, choisis le jour de reprise à tester.</p>
      <input type="number" min="1" max="60" value={jourReprise} onChange={e => setJourReprise(Number(e.target.value))} style={{ width: 70, padding: 9, marginRight: 10 }} />
      <button disabled={loading} onClick={simulerJourReprise} style={bouton}>Positionner ce jour</button>
      <Link href="/reprise-alimentaire-apres-jeune?test=1" style={{ ...lien, marginLeft: 10 }}>Ouvrir la reprise</Link>
    </section>

    <section style={card}><h2>Sortir du mode test</h2>
      <button onClick={desactiver} style={{ ...bouton, background: '#616161' }}>Désactiver sans supprimer</button>
      <Link href="/" style={{ ...lien, marginLeft: 10, background: '#455a64' }}>Retour à l’accueil</Link>
    </section>
  </main>;
}

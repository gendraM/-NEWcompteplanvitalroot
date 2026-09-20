import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { obtenirUserIdIdeaux } from '../lib/ideauxAuth';
import {
  extraireSemainesPalier,
  seanceEstFaite,
  normaliserSeancePourEcriture,
  calculerProgressionPalier,
} from '../lib/ideauxPalier';

export default function PlanActionPage() {
  const router = useRouter();
  const { id } = router.query;

  const [ideal, setIdeal] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [selectedSemaine, setSelectedSemaine] = useState(0);
  const [reel, setReel] = useState([]);
  const [seancesReelles, setSeancesReelles] = useState([]);
  const [seancesBonus, setSeancesBonus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    loadIdeal();
  }, [id]);

  async function loadIdeal() {
    try {
      const userId = await obtenirUserIdIdeaux(supabase);
      const { data, error } = await supabase
        .from('ideaux')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setIdeal(data);
      setPlanData(data.plan_data);
      await loadSeancesReelles(id, data.plan_data, data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement idéal:', err);
      setMessage('❌ Erreur de chargement');
      setLoading(false);
    }
  }

  async function loadSeancesReelles(idealId, plan, idealData = ideal) {
    try {
      const userId = await obtenirUserIdIdeaux(supabase);
      const { data, error } = await supabase
        .from('seances_reelles')
        .select('*')
        .eq('ideal_id', idealId)
        .eq('user_id', userId)
        .order('date_prevue', { ascending: true });

      if (error) throw error;

      if (data && plan) {
        const semaines = extraireSemainesPalier(plan, idealData);
        const bonusSeances = data.filter((s) => s.bonus === true);
        const normalSeances = data.filter((s) => !s.bonus);

        const newReel = semaines.map((sem) =>
          (sem.actions || []).map((action) => {
            const seance = normalSeances.find((s) => s.date_prevue === action.date);
            return {
              fait: seanceEstFaite(seance),
              duree: seance?.duree_reelle || seance?.duree_prevue || 15,
              distance_km: seance?.distance_km || 0,
              vitesse: seance?.vitesse || null,
              date: action.date,
            };
          })
        );

        setReel(newReel);
        setSeancesReelles(normalSeances);
        setSeancesBonus(bonusSeances);
      }
    } catch (err) {
      console.error('Erreur chargement séances:', err);
    }
  }

  function getSemaineCourante(semaines) {
    if (!semaines.length) return 0;
    const today = new Date();
    for (let i = 0; i < semaines.length; i++) {
      const debutSemaine = new Date(semaines[i].debut);
      const finSemaine = new Date(debutSemaine);
      finSemaine.setDate(debutSemaine.getDate() + 6);
      if (today >= debutSemaine && today <= finSemaine) return i;
    }
    if (today > new Date(semaines[semaines.length - 1].debut)) return semaines.length - 1;
    return 0;
  }

  async function handleSaveSeanceReelle(semIdx, actIdx, fait, duree, distanceKm, vitesse) {
    if (!id || !planData || !ideal) return;

    const semaines = extraireSemainesPalier(planData, ideal);
    const sem = semaines[semIdx];
    if (!sem?.actions?.[actIdx]) {
      console.error('Semaine ou action introuvable:', { semIdx, actIdx, sem });
      return;
    }
    const action = sem.actions[actIdx];

    try {
      const userId = await obtenirUserIdIdeaux(supabase);
      const payload = normaliserSeancePourEcriture({
        user_id: userId,
        ideal_id: id,
        date_prevue: action.date,
        date_reelle: fait ? new Date().toISOString().slice(0, 10) : null,
        jour: action.jour,
        action_type: action.action_type,
        duree_prevue: planData.objectif?.duree_unite || 15,
        duree_reelle: fait ? duree : null,
        distance_km: fait ? (distanceKm || 0) : null,
        vitesse: fait ? (vitesse || null) : null,
        intensite: planData.objectif?.intensite || '7,6 km/h',
        fait,
        bonus: false,
        semaine_numero: sem.numero,
        mois_numero: sem.mois,
        annee: sem.annee,
      });

      const { data, error } = await supabase
        .from('seances_reelles')
        .upsert(payload, { onConflict: 'ideal_id,date_prevue' })
        .select()
        .single();

      if (error) throw error;
      setSeancesReelles((prev) => {
        const sansSeance = prev.filter((s) => s.date_prevue !== data.date_prevue);
        return [...sansSeance, data];
      });
    } catch (err) {
      console.error('Erreur sauvegarde séance:', err);
      setMessage('❌ La séance n’a pas pu être enregistrée');
    }
  }

  function handleCheck(semIdx, actIdx) {
    const newReel = reel.map((semaine) => semaine.map((item) => ({ ...item })));
    const currentValue = newReel[semIdx][actIdx].fait;
    newReel[semIdx][actIdx].fait = !currentValue;
    setReel(newReel);
    handleSaveSeanceReelle(
      semIdx,
      actIdx,
      !currentValue,
      newReel[semIdx][actIdx].duree,
      newReel[semIdx][actIdx].distance_km,
      newReel[semIdx][actIdx].vitesse
    );
  }

  function handleDureeChange(semIdx, actIdx, newDuree) {
    const newReel = reel.map((semaine) => semaine.map((item) => ({ ...item })));
    newReel[semIdx][actIdx].duree = parseInt(newDuree) || 15;
    setReel(newReel);
    if (newReel[semIdx][actIdx].fait) {
      handleSaveSeanceReelle(semIdx, actIdx, true, parseInt(newDuree) || 15, newReel[semIdx][actIdx].distance_km, newReel[semIdx][actIdx].vitesse);
    }
  }

  function handleDistanceChange(semIdx, actIdx, newDistance) {
    const newReel = reel.map((semaine) => semaine.map((item) => ({ ...item })));
    newReel[semIdx][actIdx].distance_km = parseFloat(newDistance) || 0;
    setReel(newReel);
    if (newReel[semIdx][actIdx].fait) {
      handleSaveSeanceReelle(semIdx, actIdx, true, newReel[semIdx][actIdx].duree, parseFloat(newDistance) || 0, newReel[semIdx][actIdx].vitesse);
    }
  }

  function handleVitesseChange(semIdx, actIdx, newVitesse) {
    const newReel = reel.map((semaine) => semaine.map((item) => ({ ...item })));
    newReel[semIdx][actIdx].vitesse = parseFloat(newVitesse) || null;
    setReel(newReel);
    if (newReel[semIdx][actIdx].fait) {
      handleSaveSeanceReelle(semIdx, actIdx, true, newReel[semIdx][actIdx].duree, newReel[semIdx][actIdx].distance_km, parseFloat(newVitesse) || null);
    }
  }

  async function handleAddSeanceBonus() {
    const semaines = extraireSemainesPalier(planData, ideal);
    const semaine = semaines[selectedSemaine];
    const dateBonus = new Date().toISOString().slice(0, 10);

    try {
      const userId = await obtenirUserIdIdeaux(supabase);
      const { data, error } = await supabase
        .from('seances_reelles')
        .insert(normaliserSeancePourEcriture({
          user_id: userId,
          ideal_id: id,
          date_prevue: dateBonus,
          date_reelle: dateBonus,
          jour: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date().getDay()],
          action_type: planData.objectif?.routines?.[0]?.action_type || 'course',
          duree_prevue: 0,
          duree_reelle: 15,
          distance_km: 0,
          intensite: planData.objectif?.intensite || '7,6 km/h',
          fait: true,
          bonus: true,
          semaine_numero: semaine?.numero || selectedSemaine + 1,
          mois_numero: semaine?.mois || null,
          annee: semaine?.annee || null,
        }))
        .select()
        .single();

      if (error) throw error;
      setSeancesBonus((prev) => [...prev, data]);
      setMessage('✅ Séance bonus ajoutée !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erreur ajout séance bonus:', err);
      setMessage('❌ Erreur lors de l\'ajout');
    }
  }

  async function handleDeleteSeanceBonus(bonusId) {
    try {
      const userId = await obtenirUserIdIdeaux(supabase);
      const { error } = await supabase.from('seances_reelles').delete().eq('id', bonusId).eq('user_id', userId);
      if (error) throw error;
      setSeancesBonus((prev) => prev.filter((s) => s.id !== bonusId));
      setMessage('✅ Séance bonus supprimée');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div>Chargement...</div></div>;
  }

  if (!ideal || !planData) {
    return <div style={{ minHeight: '100vh', padding: 40 }}><div style={{ textAlign: 'center', color: '#e53935' }}>❌ Plan introuvable</div></div>;
  }

  // Le défloutage multi-paliers sera fiabilisé dans son lot dédié.
  // On conserve volontairement le flou actuel plutôt que d'inférer une progression fausse.
  const blur = 12;
  const semaines = extraireSemainesPalier(planData, ideal);
  const semaineCourante = getSemaineCourante(semaines);
  const progression = calculerProgressionPalier(semaines, seancesReelles);

  if (!semaines.length) {
    return <div style={{ minHeight: '100vh', padding: 40 }}><div style={{ textAlign: 'center', color: '#e53935' }}>❌ Aucune semaine disponible dans ce palier</div></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0f7fa 0%, #fff 100%)', padding: 0 }}>
      <div style={{ position: 'absolute', top: 18, left: 24 }}>
        <a href="/ideaux" style={{ display: 'inline-block', background: '#00bcd4', color: '#fff', borderRadius: 8, padding: '7px 18px', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>← Retour aux idéaux</a>
      </div>

      <div style={{ background: 'linear-gradient(90deg, #00bcd4 0%, #43a047 100%)', color: '#fff', padding: '2.2rem 0 1.2rem 0', textAlign: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, marginBottom: 32, position: 'relative' }}>
        {ideal.image_url && (
          <div style={{ position: 'absolute', left: 24, top: 18, width: 120, height: 80, overflow: 'hidden', borderRadius: 12 }}>
            <img src={ideal.image_url} alt="visuel idéal" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${blur}px)`, transition: 'filter 0.5s', display: 'block' }} />
          </div>
        )}
        <div style={{ fontSize: '2.7rem', fontWeight: 900, marginBottom: 8 }}>🎯 Plan d'action</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>{ideal.titre}</div>
        <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: 6 }}>Indicateur : {ideal.indicateur_principal}</div>
        <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: 600 }}>📅 Palier 1 · {semaines.length} semaine{semaines.length > 1 ? 's' : ''}</div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 60px 20px' }}>
        {message && <div style={{ background: message.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: message.startsWith('✅') ? '#43a047' : '#e53935', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontWeight: 600, textAlign: 'center' }}>{message}</div>}

        <div style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 12, border: '2px solid #43a047' }}>
          <div style={{ fontWeight: 700, color: '#43a047', marginBottom: 8, fontSize: 18 }}>📊 Progression du palier</div>
          <div style={{ background: '#e0e0e0', height: 28, borderRadius: 14, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ background: 'linear-gradient(90deg, #43a047, #66bb6a)', height: '100%', width: `${progression.pourcentage}%`, transition: 'width 0.3s' }} />
          </div>
          <div style={{ color: '#43a047', fontWeight: 600, fontSize: 16 }}>{progression.faites}/{progression.total} séances réalisées ({progression.pourcentage}%)</div>
          {progression.termine && <div style={{ marginTop: 10, color: '#2e7d32', fontWeight: 700 }}>🎉 Palier réalisé. Ton bilan servira à construire la suite en gardant ton objectif final comme cap.</div>}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {semaines.map((s, i) => {
            const isCourante = i === semaineCourante;
            const isFuture = i > semaineCourante;
            return (
              <button key={i} onClick={() => setSelectedSemaine(i)} style={{ background: selectedSemaine === i ? '#00bcd4' : isCourante ? '#43a047' : isFuture ? '#e0e0e0' : '#b2ebf2', color: selectedSemaine === i || isCourante ? '#fff' : isFuture ? '#999' : '#1976d2', border: isCourante ? '3px solid #2e7d32' : 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 16, cursor: 'pointer', position: 'relative' }}>
                Semaine {i + 1}
                {isCourante && <span style={{ position: 'absolute', top: -8, right: -8, background: '#ffa726', color: '#fff', borderRadius: '50%', width: 24, height: 24, fontSize: 14 }}>🔥</span>}
              </button>
            );
          })}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 20, marginBottom: 16 }}>Semaine {selectedSemaine + 1} : {semaines[selectedSemaine]?.debut}</div>

          {(semaines[selectedSemaine]?.actions || []).map((action, actIdx) => {
            const reelItem = reel[selectedSemaine]?.[actIdx] || { fait: false, duree: 15, distance_km: 0 };
            return (
              <div key={actIdx} style={{ marginBottom: 16, padding: 12, background: reelItem.fait ? '#e8f5e9' : '#f5f5f5', borderRadius: 8, border: reelItem.fait ? '2px solid #43a047' : '1px solid #ddd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <input type="checkbox" checked={reelItem.fait} onChange={() => handleCheck(selectedSemaine, actIdx)} style={{ width: 20, height: 20, cursor: 'pointer' }} />
                  <div><div style={{ fontWeight: 700, color: '#1976d2' }}>{action.jour} {action.date}</div><div style={{ color: '#666', fontSize: 14 }}>{action.action_type}</div></div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginLeft: 32, flexWrap: 'wrap' }}>
                  <label><input type="number" min="5" max="180" value={reelItem.duree} onChange={(e) => handleDureeChange(selectedSemaine, actIdx, e.target.value)} style={{ width: 60 }} /> min</label>
                  <label><input type="number" min="0" max="100" step="0.1" value={reelItem.distance_km} onChange={(e) => handleDistanceChange(selectedSemaine, actIdx, e.target.value)} style={{ width: 70 }} /> km</label>
                  <label><input type="number" min="0" max="50" step="0.1" value={reelItem.vitesse || ''} onChange={(e) => handleVitesseChange(selectedSemaine, actIdx, e.target.value)} style={{ width: 80 }} /> km/h</label>
                </div>
              </div>
            );
          })}

          {seancesBonus.filter((s) => s.semaine_numero === (semaines[selectedSemaine]?.numero || selectedSemaine + 1)).map((bonus) => (
            <div key={bonus.id} style={{ marginBottom: 16, padding: 12, background: '#fff3e0', borderRadius: 8, border: '2px solid #ffa726' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><b>🌟 BONUS</b> · {bonus.jour} {bonus.date_reelle} · {bonus.duree_reelle} min · {bonus.distance_km || 0} km</div><button onClick={() => handleDeleteSeanceBonus(bonus.id)}>✕</button></div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={handleAddSeanceBonus} style={{ background: '#ffa726', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>➕ Ajouter une séance bonus</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_FAST_FOOD_INTERVAL_DAYS, normalizeIntervalDays, getFastFoodRhythm, differenceInCalendarDays, parseLocalDate } from '../lib/fastFoodRhythm';

const formatDate = (value) => {
  const d = parseLocalDate(value);
  return d ? d.toLocaleDateString('fr-FR') : '—';
};
const dayKey = (value) => String(value || '').slice(0, 10);
const card = { background:'#fff', padding:'clamp(14px, 4vw, 20px)', borderRadius:14, boxShadow:'0 2px 12px #e6e6e6', marginBottom:18 };

export default function HistoriqueFastFood() {
  const [events, setEvents] = useState([]);
  const [legacy, setLegacy] = useState([]);
  const [intervalDays, setIntervalDays] = useState(DEFAULT_FAST_FOOD_INTERVAL_DAYS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId || authError) {
        if (active) { setError('Connecte-toi pour consulter ton historique personnel.'); setLoading(false); }
        return;
      }
      const [meals, historical, profile] = await Promise.all([
        supabase.from('repas_reels').select('id,date,aliment,tag,heure,kcal,calories,occurrence_repas_id').eq('user_id',userId).eq('categorie','fast-food').order('date',{ascending:true}),
        supabase.from('fast_food_history').select('id,date,restaurant,aliments,calories').eq('user_id',userId).order('date',{ascending:false}),
        supabase.from('profil').select('fast_food_interval_days').eq('user_id',userId).order('created_at',{ascending:false}).limit(1).maybeSingle()
      ]);
      if (!active) return;
      if (meals.error) setError('Impossible de charger les repas Fast Food : ' + meals.error.message);
      else setEvents(meals.data || []);
      // Legacy entries remain separate: they may duplicate meals already saved in repas_reels.
      if (!historical.error) setLegacy(historical.data || []);
      setIntervalDays(normalizeIntervalDays(profile.data?.fast_food_interval_days));
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const timeline = useMemo(() => {
    // Multiple meal rows on the same calendar day represent one Fast Food occasion.
    const dates = [...new Set(events.map(e => dayKey(e.date)).filter(Boolean))].sort();
    return dates.map((date, index) => {
      const spacing = index === 0 ? null : differenceInCalendarDays(date, dates[index - 1]);
      const previousSpacing = index < 2 ? null : differenceInCalendarDays(dates[index - 1], dates[index - 2]);
      return {date, spacing, previousSpacing, reached: spacing !== null && spacing >= intervalDays, meals: events.filter(e => dayKey(e.date) === date)};
    }).reverse();
  }, [events, intervalDays]);
  const completed = timeline.filter(t => t.spacing !== null);
  const record = completed.length ? Math.max(...completed.map(t => t.spacing)) : null;
  const average = completed.length ? Math.round(completed.reduce((sum,t) => sum + t.spacing,0) / completed.length) : null;
  const latest = timeline[0];
  const rhythm = latest ? getFastFoodRhythm({lastFastFoodDate:latest.date,intervalDays}) : null;
  const visible = timeline.filter(t => {
    if (period === 'all') return true;
    const d = parseLocalDate(t.date);
    const now = new Date();
    if (!d) return false;
    if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  });
  // Legacy records are not automatically matched by date: two different meals can share a date.
  const unmatchedLegacy = legacy.filter(item => !timeline.some(t => t.date === dayKey(item.date)));
  const recordDate = completed.find(t => t.spacing === record)?.date;

  return <main style={{maxWidth:850,margin:'0 auto',padding:'24px 16px',color:'#263238'}}>
    <h1 style={{fontSize:'clamp(25px, 5vw, 34px)',lineHeight:1.2}}>🍔 Mon parcours Fast Food</h1>
    <p style={{color:'#607d8b'}}>Observe ton rythme, tes progrès et les étapes déjà franchies, sans jugement.</p>
    {loading ? <p>Chargement de ton historique…</p> : error ? <p role="alert" style={{color:'#b71c1c'}}>{error}</p> : <>
      <section style={card}>
        <h2 style={{marginTop:0}}>Mon rythme actuel</h2>
        <p>Objectif personnel : <strong>{intervalDays} jours entre deux Fast Food</strong></p>
        {rhythm ? <>
          <p>Dernier Fast Food : <strong>{formatDate(latest.date)}</strong></p>
          <p>Prochain repère : <strong>{formatDate(rhythm.nextReferenceDate)}</strong></p>
          <p style={{fontWeight:600,color:rhythm.targetReached?'#2e7d32':'#a64b16'}}>{rhythm.targetReached ? 'Objectif atteint : '+rhythm.elapsedDays+' jours depuis le dernier Fast Food.' : 'Encore '+rhythm.remainingDays+' jour(s) avant ton repère.'}</p>
        </> : <p>Aucune consommation enregistrée dans tes repas réels pour le moment.</p>}
      </section>
      <section style={card}>
        <h2 style={{marginTop:0,fontSize:'clamp(20px, 4vw, 26px)'}}>Mes progrès dans le temps</h2>
        <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
          <div><strong>{completed.length}</strong><div>Intervalles mesurés</div></div>
          <div><strong>{completed.filter(t=>t.reached).length}</strong><div>Objectifs atteints</div></div>
          <div><strong>{record === null ? '—' : record+' j'}</strong><div>Record personnel{recordDate ? ' · '+formatDate(recordDate) : ''}</div></div>
          <div><strong>{average === null ? '—' : average+' j'}</strong><div>Espacement moyen</div></div>
        </div>
        <p style={{fontSize:13,color:'#607d8b'}}>Les intervalles sont calculés entre deux dates de consommation distinctes. Le rythme en cours est présenté séparément.</p>
        {completed.length > 0 && <div aria-label="Évolution des espacements" style={{display:'flex',flexDirection:'column',gap:10}}>
          {[...completed].reverse().map(item => <div key={item.date} style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{minWidth:90,fontSize:13}}>{formatDate(item.date)}</span>
            <div style={{background:'#edf2f5',height:15,borderRadius:8,flex:1,overflow:'hidden'}}>
              <div style={{height:'100%',width:Math.min(100,100*item.spacing/Math.max(record,intervalDays,1))+'%',background:item.reached?'#2e7d32':'#ed8a45',borderRadius:8}} />
            </div>
            <strong style={{minWidth:55,textAlign:'right'}}>{item.spacing} j</strong>
          </div>)}
        </div>}
      </section>
      <section style={card}>
        <h2 style={{marginTop:0,fontSize:'clamp(20px, 4vw, 26px)',lineHeight:1.25}}>Mes consommations et mes intervalles</h2>
        <label htmlFor="ff-period">Période affichée : </label>
        <select id="ff-period" value={period} onChange={e=>setPeriod(e.target.value)} style={{padding:8,marginBottom:16}}>
          <option value="all">Tout l'historique</option><option value="month">Ce mois</option><option value="year">Cette année</option>
        </select>
        <p style={{fontSize:13,color:'#607d8b'}}>Les intervalles sont calculés sur l'historique complet, même si tu filtres l'affichage.</p>
        {visible.length === 0 ? <p>Aucun Fast Food enregistré sur cette période.</p> : visible.map(item => {
          const change = item.previousSpacing === null || item.spacing === null ? null : item.spacing - item.previousSpacing;
          const progress = item.spacing === null ? 0 : Math.min(100, Math.round(item.spacing / intervalDays * 100));
          return <article key={item.date} style={{borderTop:'1px solid #e2e8eb',padding:'16px 0'}}>
            <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:8}}>
              <strong style={{fontSize:18}}>{formatDate(item.date)}</strong>
              {item.spacing !== null && <span style={{fontSize:12,padding:'5px 9px',borderRadius:20,background:item.reached?'#e8f5e9':'#fff3e0',color:item.reached?'#216c35':'#94521c',fontWeight:600}}>{item.reached?'✓ Objectif atteint':'Objectif à poursuivre'}</span>}
            </div>
            <div style={{color:'#455a64',fontSize:14,margin:'8px 0'}}>
              {item.meals.map((meal,index) => <div key={meal.id || index}>{meal.aliment || meal.tag || 'Repas Fast Food'}{meal.heure ? ' · '+meal.heure : ''}</div>)}
            </div>
            {item.spacing === null ? <p style={{color:'#607d8b',fontSize:14}}>Premier repère enregistré : pas encore d'intervalle à comparer.</p> : <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(125px,1fr))',gap:8,marginTop:12}}>
                <div style={{background:'#f4f7f8',padding:12,borderRadius:10}}><div style={{fontSize:12,color:'#607d8b'}}>Espacement réalisé</div><strong style={{fontSize:23}}>{item.spacing} j</strong></div>
                <div style={{background:'#f4f7f8',padding:12,borderRadius:10}}><div style={{fontSize:12,color:'#607d8b'}}>Intervalle précédent</div><strong style={{fontSize:23}}>{item.previousSpacing === null ? '—' : item.previousSpacing+' j'}</strong></div>
              </div>
              <div style={{height:9,background:'#edf2f5',borderRadius:9,overflow:'hidden',marginTop:12}} role="progressbar" aria-label="Part de l'objectif d'espacement réalisée" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div style={{width:progress+'%',height:'100%',background:item.reached?'#2e7d32':'#ed8a45',borderRadius:9}} />
              </div>
              <div style={{fontSize:12,color:'#607d8b',marginTop:5}}>{item.spacing} jours sur {intervalDays} jours d'objectif</div>
              {change !== null && <p style={{fontSize:14,fontWeight:600,color:change>0?'#2e7d32':'#607d8b',margin:'10px 0 0'}}>{change>0?'↗ +'+change+' jours : ton espacement progresse !':change===0?'→ Espacement stable par rapport au précédent.':'↘ '+Math.abs(change)+' jours de moins que le précédent intervalle.'}</p>}
            </>}
          </article>;
        })}
      </section>
      {unmatchedLegacy.length > 0 && <p style={{color:'#607d8b',fontSize:13}}>{unmatchedLegacy.length} ancienne(s) entrée(s) non rapprochée(s) des repas réels. Elles sont préservées, mais exclues des statistiques pour éviter les doublons.</p>}
    </>}
  </main>;
}

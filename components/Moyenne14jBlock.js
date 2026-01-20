import React from 'react';

export default function Moyenne14jBlock({ selectedDate, bilan }) {
  const [loading, setLoading] = React.useState(true);
  const [total14j, setTotal14j] = React.useState(null);
  const [moyenne14j, setMoyenne14j] = React.useState(null);
  const [ecartN1, setEcartN1] = React.useState(null);
  const [ecartN, setEcartN] = React.useState(null);

  React.useEffect(() => {
    async function fetchData() {
      if (!selectedDate || !bilan?.objectifHebdo) { setLoading(false); return; }
      const { supabase } = await import('../lib/supabaseClient');
      const objectifJour = Math.round(bilan.objectifHebdo/7);
      // Dates pour 14j
      const end = new Date(selectedDate);
      end.setHours(23,59,59,999);
      const start14 = new Date(end); start14.setDate(end.getDate() - 13); start14.setHours(0,0,0,0);
      const fmt = d => d.toISOString().slice(0,10);
      // Récupérer tous les repas sur 14j
      const { data, error } = await supabase
        .from('repas_reels')
        .select('kcal, date')
        .gte('date', fmt(start14))
        .lte('date', fmt(end));
      if (error) { setLoading(false); return; }
      // Grouper par jour
      const jours = {};
      (data||[]).forEach(r => {
        const d = r.date.slice(0,10);
        if (!jours[d]) jours[d] = 0;
        jours[d] += r.kcal || 0;
      });
      // Calculer total 14j et moyenne 14j
      let total = 0;
      for (let i=0; i<14; ++i) {
        const d = new Date(start14); d.setDate(start14.getDate()+i);
        const key = d.toISOString().slice(0,10);
        total += jours[key] || 0;
      }
      const totalObjectif = objectifJour * 14;
      const surplus14j = total - totalObjectif;
      setTotal14j(surplus14j);
      setMoyenne14j(Math.round(surplus14j/14));

      // Récupérer les écarts hebdo N-1 et N depuis la table semaines_validees
      const { formatDate, getMonday } = await import('../lib/validationSemaine');
      const weekStartN = formatDate(getMonday(selectedDate), 'yyyy-MM-dd');
      const dateN1 = new Date(weekStartN); dateN1.setDate(dateN1.getDate() - 7);
      const weekStartN1 = formatDate(dateN1, 'yyyy-MM-dd');
      const { data: semN1, error: errN1 } = await supabase
        .from('semaines_validees')
        .select('ecart_hebdo')
        .eq('weekStart', weekStartN1)
        .single();
      const { data: semN, error: errN } = await supabase
        .from('semaines_validees')
        .select('ecart_hebdo')
        .eq('weekStart', weekStartN)
        .single();
      setEcartN1(semN1?.ecart_hebdo ?? null);
      setEcartN(semN?.ecart_hebdo ?? null);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate, bilan?.objectifHebdo]);

  if (loading) return null;
  if (total14j === null || moyenne14j === null) return null;

  // Visuel sobre et élégant
  return (
    <section style={{
      background: '#f8fafc',
      borderRadius: 12,
      padding: '1.3rem 1.5rem',
      marginTop: '1.3rem',
      boxShadow: '0 2px 8px #e0e7ef',
      border: '1.5px solid #dbeafe',
      maxWidth: 540,
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div style={{fontWeight:700, color:'#2563eb', fontSize:'1.13rem', marginBottom:'0.7rem', letterSpacing:0.1}}>
        Lecture sur 14 jours — ce qui s’accumule
      </div>
      <div style={{fontSize:'1.08rem', color:'#222', marginBottom:'0.3rem'}}>
        Sur les 14 derniers jours :<br/>
        <span style={{fontWeight:700, color: total14j > 0 ? '#e74c3c' : '#27ae60', fontSize:'1.18rem'}}>
          Ton corps a reçu {total14j > 0 ? '+' : ''}{total14j.toLocaleString()} kcal au-dessus de ton objectif.
        </span>
      </div>
      <div style={{color:'#64748b', fontSize:'0.97rem', marginBottom:'0.7rem'}}>
        Pris isolément, chaque jour peut sembler anodin.<br/>
        Mais sur 14 jours, ces écarts s’additionnent et commencent à orienter la trajectoire.
      </div>

      <div style={{fontWeight:600, color:'#2563eb', fontSize:'1.07rem', marginBottom:'0.3rem'}}>Lecture du rythme réel</div>
      <div style={{fontSize:'1.05rem', color:'#222', marginBottom:'0.2rem'}}>
        Cela représente une moyenne de <b>{moyenne14j > 0 ? '+' : ''}{moyenne14j.toLocaleString()} kcal par jour</b> au-dessus de l’objectif.
      </div>
      <div style={{color:'#64748b', fontSize:'0.97rem', marginBottom:'0.7rem'}}>
        Le corps ne réagit pas aux journées isolées,<br/>il réagit à ce rythme répété jour après jour.
      </div>

      <div style={{fontWeight:600, color:'#2563eb', fontSize:'1.07rem', marginBottom:'0.3rem'}}>Mise en perspective temporelle (semaines)</div>
      <div style={{fontSize:'1.01rem', color:'#222', marginBottom:'0.2rem'}}>
        Détail des deux semaines :<br/>
        <span style={{display:'inline-block',marginTop:'0.2rem'}}>
          • Semaine N-1 : <b>{ecartN1 !== null ? (ecartN1 > 0 ? '+' : '') + ecartN1.toLocaleString() : '—'} kcal</b><br/>
          • Semaine N : <b>{ecartN !== null ? (ecartN > 0 ? '+' : '') + ecartN.toLocaleString() : '—'} kcal</b>
        </span>
      </div>
      <div style={{color:'#64748b', fontSize:'0.97rem', marginBottom:'0.7rem'}}>
        Les deux semaines sont au-dessus de l’objectif,<br/>avec un écart très proche d’une semaine à l’autre.
      </div>

      <div style={{fontWeight:600, color:'#2563eb', fontSize:'1.07rem', marginBottom:'0.3rem'}}>Traduction consciente</div>
      <div style={{fontSize:'1.01rem', color:'#222', marginBottom:'0.7rem'}}>
        Cela signifie que, sur deux semaines consécutives,<br/>
        le corps reçoit un message de continuité plutôt que d’ajustement.
      </div>

      <div style={{color:'#334155', fontSize:'1.01rem', fontStyle:'italic', borderTop:'1px solid #e5e7eb', paddingTop:'0.7rem', marginTop:'0.7rem', textAlign:'center'}}>
        Une journée ne décide rien.<br/>
        Une semaine oriente.<br/>
        Deux semaines commencent à s’imprimer.
      </div>
    </section>
  );
}

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import BilanHebdoModal from "../components/BilanHebdoModal";
import { formatDate, getMonday, addDays } from "../lib/validationSemaine";

export default function HistoriqueBilans() {
  const [semainesValidees, setSemainesValidees] = useState([]);
  const [bilanModalOpen, setBilanModalOpen] = useState(false);
  const [bilanData, setBilanData] = useState(null);

  useEffect(() => {
    async function fetchBilans() {
      // Récupérer toutes les semaines validées avec tous les champs bilan
      const { data: semaines } = await supabase
        .from("semaines_validees")
        .select("*")
        .order("weekStart", { ascending: false });
      // Tolérance sur le champ validee (true, "true", 1, etc.)
      setSemainesValidees((semaines || []).filter(s => s.validee === true || s.validee === 1 || s.validee === "true"));
    }
    fetchBilans();
  }, []);

  // Handler pour ouvrir la modale bilan
  const handleOpenBilan = (bilan) => {
    if (!bilan) return;
    // Calcul période métier (lundi-dimanche)
    const debut = getMonday(bilan.weekStart);
    const fin = addDays(debut, 6);
    setBilanData({
      periode: `${formatDate(debut, 'd MMMM yyyy')} au ${formatDate(fin, 'd MMMM yyyy')}`,
      titre: "Bilan de ta semaine alimentaire",
      sousTitre: `Semaine du ${formatDate(debut, 'dd/MM/yyyy')} au ${formatDate(fin, 'dd/MM/yyyy')}`,
      verbatim: bilan.verbatim || "Ton corps évolue dans le temps. Ce bilan te montre la trajectoire, pas un jugement.",
      extras: bilan.extras_count,
      budget: bilan.budget_utilise,
      calories: bilan.calories_totales,
      objectifCalories: bilan.objectif_calorique,
      joursRespectes: bilan.jours_respectes,
      tendance: bilan.tendance_mensuelle,
      pointsForts: bilan.points_forts,
      axesAmelioration: bilan.axes_amelioration,
      motDoux: bilan.mot_doux || "Cette semaine a été riche, mais pas de panique : ton corps a besoin de temps pour intégrer de nouvelles habitudes. L’important, c’est la régularité. Tu es sur la bonne voie !",
      feedbackDetaille: bilan.feedback_detaille,
      ...bilan
    });
    setBilanModalOpen(true);
  };

  return (
    <div style={{maxWidth:700,margin:"0 auto",padding:"32px 8px 64px",fontFamily:"system-ui,Arial,sans-serif"}}>
      <h1 style={{textAlign:"center",marginBottom:24,fontWeight:800,fontSize:32,letterSpacing:"0.5px",color:"#1976d2"}}>
        🥗 Bilans hebdomadaires alimentaires
      </h1>
      <ul style={{listStyle:'none',padding:0}}>
        {semainesValidees.length === 0 && (
          <li style={{color:'#888',textAlign:'center',margin:'2rem 0'}}>Aucun bilan hebdomadaire validé pour l’instant.</li>
        )}
        {semainesValidees.map((bilan) => {
          const debut = getMonday(bilan.weekStart);
          const fin = addDays(debut, 6);
          // Format UX : Semaine du 05/01/2026 au 11/01/2026
          function fmt(d) {
            const pad = n => String(n).padStart(2, '0');
            return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
          }
          return (
            <li key={bilan.weekStart} style={{marginBottom:16,background:'#f8fafc',borderRadius:8,padding:'12px 18px',boxShadow:'0 1px 4px #e0e0e0'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <span>
                  <b>Semaine du {fmt(debut)} au {fmt(fin)}</b>
                </span>
                <button style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:600,cursor:'pointer'}} onClick={()=>handleOpenBilan(bilan)}>
                  Voir bilan
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div style={{textAlign:"center",marginTop:32}}>
        <a href="/tableau-de-bord" style={{color:"#1976d2",fontWeight:700,fontSize:18,textDecoration:"none"}}>← Retour au tableau de bord</a>
      </div>
      <BilanHebdoModal
        open={bilanModalOpen}
        onClose={()=>setBilanModalOpen(false)}
        bilan={bilanData}
        onLearnMore={()=>setBilanModalOpen(false)}
      />
    </div>
  );
}

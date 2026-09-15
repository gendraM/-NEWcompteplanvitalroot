import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import BilanHebdoModal from "../components/BilanHebdoModal";
import { formatDate, getMonday, addDays } from "../lib/validationSemaine";
import { evaluerSemaineExtras } from "../lib/extrasProgression";

function lireNombreHistorique(valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
}

function lireKcalExtras(bilan) {
  const valeurEnregistree = lireNombreHistorique(bilan?.kcal_extras);
  if (valeurEnregistree !== null) return valeurEnregistree;
  if (!bilan?.extras_details) return null;
  try {
    const details = typeof bilan.extras_details === 'string'
      ? JSON.parse(bilan.extras_details)
      : bilan.extras_details;
    if (!Array.isArray(details)) return null;
    return details.reduce((sum, extra) => sum + (Number(extra?.kcal) || 0), 0);
  } catch (error) {
    console.warn('[HISTORIQUE] Détail extras illisible :', error);
    return null;
  }
}

function getResumeExtras(bilan) {
  const extras = lireNombreHistorique(bilan?.extras_count);
  const kcalExtras = lireKcalExtras(bilan);
  const budgetExtras = lireNombreHistorique(bilan?.budget_extras);
  const palier = lireNombreHistorique(bilan?.bilan_abc?.palierExtras);
  const valeurs = [
    palier !== null ? `Palier ${palier}` : null,
    extras !== null ? `${extras} moment${extras > 1 ? 's' : ''}` : null,
    kcalExtras !== null ? `${kcalExtras} kcal${budgetExtras > 0 ? ` sur ${budgetExtras} kcal` : ''}` : null,
  ].filter(Boolean);
  const evaluation = palier !== null
    ? evaluerSemaineExtras({ ...bilan, kcal_extras: kcalExtras, budget_extras: budgetExtras }, palier)
    : null;
  return {
    texte: valeurs.length > 0 ? valeurs.join(' · ') : 'Repères extras non enregistrés',
    aConstruitLeChemin: evaluation?.comptePourProgression === true,
  };
}

export default function HistoriqueBilans() {
  const [semainesValidees, setSemainesValidees] = useState([]);
  const [bilanModalOpen, setBilanModalOpen] = useState(false);
  const [bilanData, setBilanData] = useState(null);

  useEffect(() => {
    async function fetchBilans() {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) {
        setSemainesValidees([]);
        return;
      }
      const { data: semaines } = await supabase
        .from("semaines_validees")
        .select("*")
        .eq("user_id", userId)
        .not("bilan_abc", "is", null)  // Filtrer uniquement bilans avec données ABC
        .not("weekStart", "is", null)   // Filtrer uniquement nouveau schéma
        .order("weekStart", { ascending: false });
      
      console.log('[HISTORIQUE] Semaines récupérées:', semaines?.length || 0);
      setSemainesValidees((semaines || []).filter(s => s.validee === true || s.validee === 1 || s.validee === "true"));
    }
    fetchBilans();
  }, []);

  const handleOpenBilan = (bilan) => {
    if (!bilan) return;
    
    // Les kcal peuvent être reconstituées depuis le détail réellement enregistré.
    // Le budget, lui, n'est jamais recalculé avec le profil actuel : on préserve l'histoire.
    const kcalExtras = lireKcalExtras(bilan);
    const budgetExtras = lireNombreHistorique(bilan.budget_extras);
    const extras = lireNombreHistorique(bilan.extras_count);
    
    console.log('[HISTORIQUE] Ouverture bilan:', {
      weekStart: bilan.weekStart,
      hasBilanABC: !!bilan.bilan_abc,
      extras_count: bilan.extras_count,
      kcalExtras,
      budgetExtras
    });
    
    const debut = getMonday(bilan.weekStart);
    const fin = addDays(debut, 6);
    
    setBilanData({
      weekStart: bilan.weekStart,
      periode: `${formatDate(debut, 'd MMMM yyyy')} au ${formatDate(fin, 'd MMMM yyyy')}`,
      titre: "Bilan de ta semaine alimentaire",
      sousTitre: `Semaine du ${formatDate(debut, 'dd/MM/yyyy')} au ${formatDate(fin, 'dd/MM/yyyy')}`,
      apportsTotaux: bilan.apports_totaux || null,
      objectifHebdo: bilan.objectif_hebdo || null,
      kcalExtras: kcalExtras,
      budgetExtras: budgetExtras,
      extras: extras,
      variation: bilan.variation || null,
      tendance_7j: bilan.tendance_7j || null,
      ecart_hebdo: bilan.ecart_hebdo || null,
      projection_poids: bilan.projection_poids || null,
      // Section 7 - Données ressenti
      satieteMoyenne: bilan.satiete_moyenne || null,
      humeurDominante: bilan.humeur_dominante || null,
      noteUtilisateur: bilan.note_utilisateur || null,
      nbRepasSatiete: bilan.nb_repas_satiete || 0,
      nbRepasRessenti: bilan.nb_repas_ressenti || 0,
      bilan_abc: bilan.bilan_abc || null,
      verbatim: bilan.verbatim || "Ton corps évolue dans le temps. Ce bilan te montre la trajectoire, pas un jugement.",
      message_feedback: bilan.message_feedback || null,
      motDoux: bilan.mot_doux || "Cette semaine a été riche, mais pas de panique : ton corps a besoin de temps pour intégrer de nouvelles habitudes. L'important, c'est la régularité. Tu es sur la bonne voie !",
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
          <li style={{color:'#888',textAlign:'center',margin:'2rem 0'}}>Aucun bilan hebdomadaire validé pour l'instant.</li>
        )}
        {semainesValidees.map((bilan) => {
          const debut = getMonday(bilan.weekStart);
          const fin = addDays(debut, 6);
          const resumeExtras = getResumeExtras(bilan);
          function fmt(d) {
            const pad = n => String(n).padStart(2, '0');
            return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
          }
          return (
            <li key={bilan.weekStart} style={{marginBottom:16,background:'#f8fafc',borderRadius:8,padding:'12px 18px',boxShadow:'0 1px 4px #e0e0e0'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <span style={{minWidth:0}}>
                  <b>Semaine du {fmt(debut)} au {fmt(fin)}</b>
                  <span style={{display:'block', marginTop:5, color:'#475569', fontSize:14}}>{resumeExtras.texte}</span>
                  {resumeExtras.aConstruitLeChemin && (
                    <span style={{display:'block', marginTop:3, color:'#15803d', fontSize:13, fontWeight:600}}>Cette semaine a construit ton chemin.</span>
                  )}
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

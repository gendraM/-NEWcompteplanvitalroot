// Composant de suivi quotidien pour défis personnalisés
import { useState, useEffect } from "react";
import { sauvegarderEngagements, chargerJournalDefi, validerEtapeDefi, calculerScore } from "../lib/journalDefisUtils";

export default function JournalDefiPersonnalise({ defi, jourActuel, onProgressionUpdate }) {
  const [engagements, setEngagements] = useState([]);
  const [nouvelEngagement, setNouvelEngagement] = useState("");
  const [notePersonnelle, setNotePersonnelle] = useState("");
  const [journalCharge, setJournalCharge] = useState(false);
  const [etapeValidee, setEtapeValidee] = useState(false);
  const [message, setMessage] = useState("");
  const [heureActuelle, setHeureActuelle] = useState(new Date());

  useEffect(() => { const interval = setInterval(() => setHeureActuelle(new Date()), 60000); return () => clearInterval(interval); }, []);
  const getHeure = () => heureActuelle.getHours();
  const estMatin = () => getHeure() >= 5 && getHeure() < 14;
  const estSoir = () => getHeure() >= 17 && getHeure() < 24;
  const getCreneauActuel = () => estMatin() ? "matin" : estSoir() ? "soir" : "hors-créneau";
  const dateMetier = date => date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => { if (defi?.id && jourActuel) chargerJournal(); }, [defi?.id, jourActuel]);

  const chargerJournal = async () => {
    setJournalCharge(false);
    try {
      const journal = await chargerJournalDefi(defi.id, jourActuel);
      setEngagements(journal?.engagements || []);
      setNotePersonnelle(journal?.note_personnelle || "");
      setEtapeValidee(journal?.valide === true);
    } catch (error) {
      console.error("Erreur chargement journal:", error);
      setMessage("Erreur lors du chargement");
    } finally { setJournalCharge(true); }
  };

  const ajouterEngagement = () => { if (nouvelEngagement.trim() && engagements.length < 5) { setEngagements([...engagements, { texte: nouvelEngagement.trim(), valide: false }]); setNouvelEngagement(""); } };
  const supprimerEngagement = index => setEngagements(engagements.filter((_, i) => i !== index));
  const toggleEngagement = index => setEngagements(engagements.map((eng, i) => i === index ? { ...eng, valide: !eng.valide } : eng));

  const sauvegarderDeclaration = async () => {
    if (!engagements.length) return setMessage("Ajoutez au moins 1 engagement");
    if (!estMatin()) return setMessage("⏰ Les engagements ne peuvent être déclarés qu'entre 5h et 14h");
    try {
      const maintenant = new Date();
      const dateJour = dateMetier(maintenant);
      const heureComplete = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const engagementsAvecDate = engagements.map(eng => ({ ...eng, date_declaration: maintenant.toISOString(), date_jour: dateJour, heure_declaration: heureComplete }));
      const result = await sauvegarderEngagements(defi.id, jourActuel, engagementsAvecDate, notePersonnelle);
      if (!result.success) return setMessage(result.error || "Erreur lors de la sauvegarde");
      setEngagements(engagementsAvecDate);
      setMessage(`✓ Engagements sauvegardés le ${dateJour} à ${heureComplete}`);
      setTimeout(() => setMessage(""), 4000);
    } catch (error) { console.error(error); setMessage("Erreur lors de la sauvegarde"); }
  };

  const validerJournee = async () => {
    if (!engagements.length) return setMessage("Déclarez d'abord vos engagements du matin");
    if (!estSoir()) return setMessage("⏰ La validation ne peut se faire qu'entre 17h et minuit");
    const maintenant = new Date();
    const dateJourActuelle = dateMetier(maintenant);
    const premierEngagement = engagements[0];
    if (!premierEngagement?.date_declaration) return setMessage("⚠️ Sauvegardez d'abord vos engagements du matin avant de valider la journée.");
    if (dateMetier(new Date(premierEngagement.date_declaration)) !== dateJourActuelle) return setMessage("⚠️ Vous ne pouvez valider que les engagements déclarés aujourd'hui.");
    try {
      const heureComplete = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const engagementsAvecValidation = engagements.map(eng => ({ ...eng, date_validation: eng.valide ? maintenant.toISOString() : null, heure_validation: eng.valide ? heureComplete : null }));
      const result = await validerEtapeDefi(defi.id, jourActuel, engagementsAvecValidation);
      if (!result.success) return setMessage(result.error || "Erreur lors de la validation");
      setEngagements(engagementsAvecValidation);
      setEtapeValidee(result.etapeValidee === true);
      if (result.progressionIncrementee) {
        setMessage(`✓ Journée validée le ${dateJourActuelle} à ${heureComplete} ! Progression : ${result.newProgress}/${defi.duree}`);
        onProgressionUpdate?.(result.newProgress);
      } else if (result.etapeValidee) {
        setMessage("✓ Cette journée avait déjà été validée. La progression n'a pas été comptée deux fois.");
      } else {
        setMessage(`Journée enregistrée (${calculerScore(engagementsAvecValidation)} validés). Minimum 2/3 requis pour progresser.`);
      }
      setTimeout(() => setMessage(""), 5000);
    } catch (error) { console.error(error); setMessage("Erreur lors de la validation"); }
  };

  if (!journalCharge) return <div style={{ textAlign: 'center', padding: '48px 0' }}>⏳ Chargement...</div>;
  const creneauActuel = getCreneauActuel();
  const indicateur = creneauActuel === 'matin' ? { emoji:'☀️', texte:'Créneau matin actif (5h-14h)' } : creneauActuel === 'soir' ? { emoji:'🌙', texte:'Créneau soir actif (17h-minuit)' } : { emoji:'⏸️', texte:'Hors créneau' };
  const dateComplete = heureActuelle.toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
    <div style={{ background:'linear-gradient(to right, #8B5CF6, #4F46E5)', borderRadius:16, padding:24, color:'white' }}>
      <h2>{defi.nom}</h2><p>📆 {dateComplete}</p><div>📅 Jour {jourActuel} / {defi.duree} · ✅ {defi.progress || 0} jours validés · {indicateur.emoji} {indicateur.texte}</div>
    </div>
    {message && <div style={{ padding:16, borderRadius:12, background:message.includes('✓') ? '#D1FAE5' : '#FEF3C7' }}>{message}</div>}
    {!etapeValidee && <div style={{ background:'#EFF6FF', borderRadius:16, padding:24, opacity:!estMatin()?0.7:1 }}>
      <h3>☀️ Ce matin</h3><p>Déclarez 1 à 5 engagements concrets pour aujourd'hui.</p>
      {engagements.map((eng,index)=><div key={index} style={{ display:'flex', gap:12, marginBottom:8 }}><span>{index+1}. {eng.texte}</span><button onClick={()=>supprimerEngagement(index)}>✕</button></div>)}
      {engagements.length < 5 && <div style={{ display:'flex', gap:12 }}><input value={nouvelEngagement} onChange={e=>setNouvelEngagement(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();ajouterEngagement();}}} placeholder="Ex : Boire 2L d'eau"/><button onClick={ajouterEngagement}>+ Ajouter</button></div>}
      <textarea value={notePersonnelle} onChange={e=>setNotePersonnelle(e.target.value)} placeholder="Note personnelle (optionnelle)" rows={3} style={{ width:'100%', marginTop:16 }}/>
      <button onClick={sauvegarderDeclaration} disabled={!engagements.length || !estMatin()} style={{ marginTop:16 }}>💾 Sauvegarder mes engagements</button>
    </div>}
    {engagements.length > 0 && <div style={{ background:'#FAF5FF', borderRadius:16, padding:24, opacity:!estSoir()&&!etapeValidee?0.7:1 }}>
      <h3>🌙 Ce soir</h3><p>Cochez les engagements accomplis (minimum 2/3 pour valider la journée).</p>
      {engagements.map((eng,index)=><label key={index} style={{ display:'block', marginBottom:10 }}><input type="checkbox" checked={!!eng.valide} onChange={()=>toggleEngagement(index)} disabled={etapeValidee}/> {eng.texte}</label>)}
      <div>Score actuel : <strong>{calculerScore(engagements)}</strong></div>
      {!etapeValidee ? <button onClick={validerJournee} disabled={!estSoir()} style={{ marginTop:16 }}>✓ Valider la journée</button> : <div style={{ marginTop:16, padding:12, background:'#D1FAE5' }}>✓ Journée déjà validée</div>}
    </div>}
  </div>;
}

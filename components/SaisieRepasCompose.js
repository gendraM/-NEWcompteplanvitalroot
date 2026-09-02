import { useEffect, useState } from 'react';
import { construireOccurrencesReelles, listerRepasComposes } from '../lib/repasComposes';

export default function SaisieRepasCompose({ supabase, userId, date, type, onSave }) {
  const [modeles, setModeles] = useState([]);
  const [modeleId, setModeleId] = useState('');
  const [heure, setHeure] = useState(() => new Date().toTimeString().slice(0, 5));
  const [satiete, setSatiete] = useState('');
  const [ressenti, setRessenti] = useState('');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    let actif = true;
    listerRepasComposes(supabase, userId).then(({ data, error }) => {
      if (!actif) return;
      if (error) setFeedback(`Chargement impossible : ${error.message}`);
      else setModeles(data);
    });
    return () => { actif = false; };
  }, [supabase, userId]);

  const enregistrer = async () => {
    const modele = modeles.find(item => item.id === modeleId);
    if (!modele) return setFeedback('Choisis un repas composé.');
    const occurrences = construireOccurrencesReelles(modele, { userId, date, type, heure: heure || null, satiete, ressenti, note });
    setChargement(true); setFeedback('');
    if (!onSave) {
      setFeedback("L'enregistrement du repas est indisponible.");
      setChargement(false);
      return;
    }
    const resultat = await onSave(occurrences);
    if (!resultat?.ok) setFeedback(`Enregistrement impossible : ${resultat?.error?.message || 'erreur inconnue'}`);
    else { setFeedback(`${modele.nom} enregistré : ${occurrences.length} aliments ajoutés.`); setModeleId(''); setNote(''); }
    setChargement(false);
  };

  if (!userId || !modeles.length) return null;
  const selection = modeles.find(item => item.id === modeleId);
  return (
    <section style={{ background: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>🍽️ Utiliser un repas composé</h3>
      <p>Ajoute tous les aliments d’une assiette enregistrée en une seule fois.</p>
      <select value={modeleId} onChange={e => setModeleId(e.target.value)} style={{ marginRight: 8 }}>
        <option value="">Choisir un repas composé</option>
        {modeles.map(modele => <option key={modele.id} value={modele.id}>{modele.nom} — {modele.resume.kcalTotal} kcal</option>)}
      </select>
      {selection && <div style={{ margin: '8px 0', fontSize: 14 }}>{selection.composition.map(item => `${item.nom} (${item.quantite} ${item.unite})`).join(' + ')}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
        <input type="time" value={heure} onChange={e => setHeure(e.target.value)} aria-label="Heure du repas composé" />
        <select value={satiete} onChange={e => setSatiete(e.target.value)}><option value="">Satiété (facultatif)</option><option value="oui">Oui</option><option value="non">Non</option></select>
        <input value={ressenti} onChange={e => setRessenti(e.target.value)} placeholder="Ressenti (facultatif)" />
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (facultative)" />
      </div>
      <button onClick={enregistrer} disabled={chargement || !modeleId} style={{ border: 0, borderRadius: 8, padding: '8px 14px', background: '#8e24aa', color: 'white', fontWeight: 700 }}>
        Enregistrer tout le repas
      </button>
      {feedback && <div role="status" style={{ marginTop: 8 }}>{feedback}</div>}
    </section>
  );
}

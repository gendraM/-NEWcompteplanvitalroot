import { useEffect, useState } from 'react';
import { ajusterCompositionRepas, construireOccurrencesReelles, listerRepasComposes } from '../lib/repasComposes';

export default function SaisieRepasCompose({ supabase, userId, date, type, onSave }) {
  const [modeles, setModeles] = useState([]);
  const [modeleId, setModeleId] = useState('');
  const [quantites, setQuantites] = useState([]);
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
    const ajustement = ajusterCompositionRepas(modele.composition, quantites);
    if (!ajustement.valide) return setFeedback(ajustement.erreurs[0] || 'Vérifie les quantités du repas.');
    const modeleAjuste = { ...modele, composition: ajustement.composition };
    const occurrences = construireOccurrencesReelles(modeleAjuste, { userId, date, type, heure: heure || null, satiete, ressenti, note });
    setChargement(true); setFeedback('');
    if (!onSave) {
      setFeedback("L'enregistrement du repas est indisponible.");
      setChargement(false);
      return;
    }
    const resultat = await onSave(occurrences);
    if (!resultat?.ok) setFeedback(`Enregistrement impossible : ${resultat?.error?.message || 'erreur inconnue'}`);
    else { setFeedback(`${modele.nom} enregistré : ${occurrences.length} aliments ajoutés.`); setModeleId(''); setQuantites([]); setNote(''); }
    setChargement(false);
  };

  const selectionnerModele = event => {
    const prochainModeleId = event.target.value;
    const prochainModele = modeles.find(item => item.id === prochainModeleId);
    setModeleId(prochainModeleId);
    setQuantites(prochainModele ? prochainModele.composition.map(item => String(item.quantite ?? '')) : []);
    setFeedback('');
  };

  const modifierQuantite = (index, valeur) => {
    setQuantites(courantes => courantes.map((quantite, position) => position === index ? valeur : quantite));
  };

  if (!userId || !modeles.length) return null;
  const selection = modeles.find(item => item.id === modeleId);
  const ajustement = selection ? ajusterCompositionRepas(selection.composition, quantites) : null;
  return (
    <section style={{ background: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>🍽️ Utiliser un repas composé</h3>
      <p>Ajoute tous les aliments d’une assiette enregistrée en une seule fois.</p>
      <select value={modeleId} onChange={selectionnerModele} style={{ marginRight: 8 }}>
        <option value="">Choisir un repas composé</option>
        {modeles.map(modele => <option key={modele.id} value={modele.id}>{modele.nom} — {modele.resume.kcalTotal} kcal</option>)}
      </select>
      {selection && (
        <div style={{ margin: '12px 0' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Ajuster les quantités pour ce repas</div>
          {selection.composition.map((item, index) => (
            <div key={item.id || index} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 80px auto', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span>{item.nom}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0.01"
                step="any"
                value={quantites[index] ?? ''}
                onChange={event => modifierQuantite(index, event.target.value)}
                aria-label={`Quantité de ${item.nom}`}
                style={{ width: '100%' }}
              />
              <span>{item.unite}</span>
              <span style={{ gridColumn: '1 / -1', textAlign: 'right', color: '#555', fontSize: 13 }}>
                {ajustement?.composition[index]?.kcal ?? '—'} kcal pour cette quantité
              </span>
            </div>
          ))}
          <div style={{ textAlign: 'right', fontWeight: 700, marginTop: 10 }}>
            Total ajusté : {ajustement?.valide ? ajustement.resume.kcalTotal : '—'} kcal
          </div>
          {!ajustement?.valide && (
            <div style={{ color: '#b71c1c', marginTop: 6 }}>{ajustement?.erreurs[0]}</div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
        <input type="time" value={heure} onChange={e => setHeure(e.target.value)} aria-label="Heure du repas composé" />
        <select value={satiete} onChange={e => setSatiete(e.target.value)}><option value="">Satiété (facultatif)</option><option value="oui">Oui</option><option value="non">Non</option></select>
        <input value={ressenti} onChange={e => setRessenti(e.target.value)} placeholder="Ressenti (facultatif)" />
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (facultative)" />
      </div>
      <button onClick={enregistrer} disabled={chargement || !modeleId || !ajustement?.valide} style={{ border: 0, borderRadius: 8, padding: '8px 14px', background: '#8e24aa', color: 'white', fontWeight: 700 }}>
        Enregistrer tout le repas
      </button>
      {feedback && <div role="status" style={{ marginTop: 8 }}>{feedback}</div>}
    </section>
  );
}

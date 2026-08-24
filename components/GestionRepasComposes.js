import { useEffect, useMemo, useState } from 'react';
import {
  creerRepasCompose,
  modifierRepasCompose,
  supprimerRepasCompose,
  listerRepasComposes,
  construireOccurrencesPlanifiees
} from '../lib/repasComposes';
import { extraireQuantitePlanifiee, normaliserRepasPlanifie, trouverAlimentReferentiel } from '../lib/planificationRepas';

const bouton = { border: 0, borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontWeight: 600 };

export default function GestionRepasComposes({ supabase, userId, planning, referentiel, date, type, onChangeDate, onChangeType, onPlanningChange }) {
  const [modeles, setModeles] = useState([]);
  const [nom, setNom] = useState('');
  const [edition, setEdition] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [chargement, setChargement] = useState(false);

  const composantsCourants = useMemo(() => (planning[date] || [])
    .filter(item => item.type === type)
    .map((item, index) => {
      const normalise = normaliserRepasPlanifie(item, referentiel);
      const mesure = extraireQuantitePlanifiee(item.quantite);
      const reference = trouverAlimentReferentiel(referentiel, item.aliment);
      return {
        id: item.id || `plan-${index + 1}`,
        nom: item.aliment,
        categorie: item.categorie || reference?.categorie || '',
        quantite: mesure.quantite,
        unite: mesure.unite,
        kcal: normalise.kcal_calculees,
        qn: Number.isFinite(Number(reference?.qn)) ? Number(reference.qn) : null
      };
    }), [planning, date, type, referentiel]);

  const recharger = async () => {
    if (!userId) return setModeles([]);
    const { data, error } = await listerRepasComposes(supabase, userId);
    if (error) setFeedback(`Impossible de charger les repas composés : ${error.message}`);
    else setModeles(data);
  };

  useEffect(() => { recharger(); }, [userId]);

  const enregistrerCourant = async () => {
    setChargement(true); setFeedback('');
    const { error } = await creerRepasCompose(supabase, { userId, nom, composition: composantsCourants });
    if (error) setFeedback(error.message);
    else { setNom(''); setFeedback('Repas composé enregistré.'); await recharger(); }
    setChargement(false);
  };

  const planifier = async modele => {
    const occurrences = construireOccurrencesPlanifiees(modele, { userId, date, type });
    if (!date) return setFeedback('Choisis d’abord une date dans le formulaire de planification.');
    if (!occurrences.length) return setFeedback('Ce modèle ne contient pas une composition exploitable.');
    setChargement(true); setFeedback('');
    const { error } = await supabase.from('repas_planifies').insert(occurrences);
    if (error) setFeedback(`Planification impossible : ${error.message}`);
    else { setFeedback(`${modele.nom} a été ajouté au planning.`); await onPlanningChange(); }
    setChargement(false);
  };

  const sauvegarderEdition = async () => {
    const { error } = await modifierRepasCompose(supabase, edition.id, { userId, nom: edition.nom, composition: edition.composition });
    if (error) return setFeedback(error.message);
    setEdition(null); setFeedback('Modèle modifié.'); await recharger();
  };

  const dupliquer = async modele => {
    const { error } = await creerRepasCompose(supabase, { userId, nom: `${modele.nom} (copie)`, composition: modele.composition });
    if (error) return setFeedback(error.message);
    setFeedback('Modèle dupliqué.'); await recharger();
  };

  const supprimer = async modele => {
    if (!window.confirm(`Supprimer le modèle « ${modele.nom} » ? Les repas déjà planifiés resteront inchangés.`)) return;
    const { error } = await supprimerRepasCompose(supabase, modele.id, userId);
    if (error) return setFeedback(error.message);
    setFeedback('Modèle supprimé.'); await recharger();
  };

  return (
    <section style={{ background: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: 12, padding: 16, margin: '20px 0' }}>
      <h2 style={{ marginTop: 0 }}>🍽️ Mes repas composés</h2>
      <p>Enregistre plusieurs aliments déjà placés au même repas, puis réutilise l’assiette complète en une seule action.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select value={type} onChange={e => onChangeType(e.target.value)}>
          {['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'].map(item => <option key={item}>{item}</option>)}
        </select>
        <input type="date" value={date} onChange={e => onChangeDate(e.target.value)} />
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom du repas composé" />
        <button style={{ ...bouton, background: '#8e24aa', color: 'white' }} disabled={chargement || composantsCourants.length < 2 || !nom.trim()} onClick={enregistrerCourant}>
          Enregistrer les {composantsCourants.length} aliments de ce repas
        </button>
      </div>
      {date && <p style={{ fontSize: 14 }}>Sélection actuelle : <b>{type}</b> du <b>{date}</b> — {composantsCourants.length} aliment(s).</p>}
      {feedback && <div role="status" style={{ margin: '10px 0', color: feedback.includes('impossible') || feedback.includes('absent') ? '#b71c1c' : '#2e7d32' }}>{feedback}</div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {modeles.map(modele => (
          <article key={modele.id} style={{ background: 'white', borderRadius: 10, padding: 12 }}>
            {edition?.id === modele.id ? (
              <>
                <input value={edition.nom} onChange={e => setEdition({ ...edition, nom: e.target.value })} style={{ marginBottom: 8 }} />
                {edition.composition.map((item, index) => (
                  <div key={item.id || index} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                    <input value={item.nom} onChange={e => { const composition = [...edition.composition]; composition[index] = { ...item, nom: e.target.value }; setEdition({ ...edition, composition }); }} placeholder="Aliment" />
                    <input value={item.categorie} onChange={e => { const composition = [...edition.composition]; composition[index] = { ...item, categorie: e.target.value }; setEdition({ ...edition, composition }); }} placeholder="Catégorie" />
                    <input type="number" min="0.01" value={item.quantite ?? ''} onChange={e => { const composition = [...edition.composition]; composition[index] = { ...item, quantite: e.target.value }; setEdition({ ...edition, composition }); }} style={{ width: 80 }} />
                    <input value={item.unite} onChange={e => { const composition = [...edition.composition]; composition[index] = { ...item, unite: e.target.value }; setEdition({ ...edition, composition }); }} style={{ width: 70 }} />
                    <input type="number" min="0" value={item.kcal ?? ''} onChange={e => { const composition = [...edition.composition]; composition[index] = { ...item, kcal: e.target.value }; setEdition({ ...edition, composition }); }} style={{ width: 80 }} />
                    <button style={{ ...bouton, background: '#ffebee' }} onClick={() => setEdition({ ...edition, composition: edition.composition.filter((_, i) => i !== index) })}>Retirer</button>
                  </div>
                ))}
                <button style={{ ...bouton, background: '#8e24aa', color: 'white', marginRight: 6 }} onClick={sauvegarderEdition}>Enregistrer</button>
                <button style={bouton} onClick={() => setEdition(null)}>Annuler</button>
              </>
            ) : (
              <>
                <b>{modele.nom}</b> — {modele.resume.kcalTotal} kcal{modele.resume.qnMoyen !== null ? ` • QN moyen ${modele.resume.qnMoyen}` : ''}
                <div style={{ fontSize: 14, margin: '5px 0 9px' }}>{modele.composition.map(item => `${item.nom} (${item.quantite} ${item.unite})`).join(' + ')}</div>
                <button style={{ ...bouton, background: '#43a047', color: 'white', marginRight: 6 }} disabled={chargement || !date} onClick={() => planifier(modele)}>Planifier ici</button>
                <button style={{ ...bouton, marginRight: 6 }} onClick={() => setEdition({ ...modele, composition: modele.composition.map(item => ({ ...item })) })}>Modifier</button>
                <button style={{ ...bouton, marginRight: 6 }} onClick={() => dupliquer(modele)}>Dupliquer</button>
                <button style={{ ...bouton, background: '#ffebee', color: '#b71c1c' }} onClick={() => supprimer(modele)}>Supprimer</button>
              </>
            )}
          </article>
        ))}
        {!modeles.length && <p>Aucun repas composé enregistré pour le moment.</p>}
      </div>
    </section>
  );
}

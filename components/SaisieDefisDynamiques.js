// Défi 2 : Je suis plus fort·e que mes excuses (validation par repas, confirmation résistance à la compensation)
function DefiExcuses({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [typeRepas, setTypeRepas] = useState('Déjeuner');
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as résisté à l’envie de compenser.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#f3e5f5', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div>
                <label>Type de repas :
                    <select value={typeRepas} onChange={e => setTypeRepas(e.target.value)} style={{marginLeft:8}}>
                        <option>Petit-déjeuner</option>
                        <option>Déjeuner</option>
                        <option>Collation</option>
                        <option>Dîner</option>
                        <option>Autre</option>
                    </select>
                </label>
            </div>
            <div style={{ margin: '8px 0' }}>
                Heure de prise du repas (optionnel) :
                <input
                    type="time"
                    value={heureRepas}
                    onChange={e => setHeureRepas(e.target.value)}
                    style={{ marginLeft: 8, width: 110 }}
                />
                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
            </div>
            <div style={{marginTop:8}}>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    J’ai résisté à l’envie de compenser à ce repas
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 5 : Le faux allié (validation par jour, confirmation aucune compensation par aliment gras)
function DefiFauxAllie({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [kcal, setKcal] = useState('');
    const referentielAliments = require('../data/referentiel.js').default || [];
    const alimentsFromReferentiel = Array.from(new Set(referentielAliments.map(a => a.nom).filter(Boolean)));
    React.useEffect(() => {
        if (!aliment || aliment.trim() === '') return;
        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
        if (found) {
            if (found.categorie) setCategorie(found.categorie);
            if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal));
            if (found.portionDefaut) setQuantite(found.portionDefaut);
        }
    }, [aliment]);
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!aliment.trim()) {
            setErreur('Merci de saisir un aliment.');
            return;
        }
        if (!confirmation) {
            setErreur('Merci de confirmer qu’aucun aliment gras n’a été pris pour compenser un extra.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
            setAliment('');
            setCategorie('');
            setKcal('');
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#ffebee', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div style={{ marginBottom: 10 }}>
                <label>Aliment :
                    <input list="alimentOptions" type="text" value={aliment} onChange={e => setAliment(e.target.value)} style={{ marginLeft: 8 }} />
                    <datalist id="alimentOptions">
                        {alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Catégorie :
                    <input type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} />
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Kcal :
                    <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} />
                </label>
            </div>
            <div style={{ margin: '8px 0' }}>
                Heure de prise du repas (optionnel) :
                <input type="time" value={heureRepas} onChange={e => setHeureRepas(e.target.value)} style={{ marginLeft: 8, width: 110 }} />
                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
            </div>
            <div style={{marginTop:8}}>
                <label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> Aucun aliment gras n’a été pris pour compenser un extra aujourd’hui</label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 7 : Je brise la chaîne
function DefiBriseChaine({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    const getDefaultHeure = () => new Date().toTimeString().slice(0,5);
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [kcal, setKcal] = useState('');
    const referentielAliments = require('../data/referentiel.js').default || [];
    const alimentsFromReferentiel = Array.from(new Set(referentielAliments.map(a => a.nom).filter(Boolean)));
    React.useEffect(() => {
        if (!aliment || aliment.trim() === '') return;
        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
        if (found) {
            if (found.categorie) setCategorie(found.categorie);
            if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal));
            if (found.portionDefaut) setQuantite(found.portionDefaut);
        }
    }, [aliment]);
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!aliment.trim()) return setErreur('Merci de saisir un aliment.');
        if (!confirmation) return setErreur('Merci de confirmer qu’aucun enchaînement sucre-gras n’a eu lieu aujourd’hui.');
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.'); refreshDefis(); setConfirmation(false); setAliment(''); setCategorie(''); setKcal('');
        } else setErreur(res.error || 'Erreur lors de la validation.');
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e1f5fe', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3><p>{defi.description}</p>
            <div style={{ marginBottom: 10 }}><label>Aliment :<input list="alimentOptionsChaine" type="text" value={aliment} onChange={e => setAliment(e.target.value)} style={{ marginLeft: 8 }} /><datalist id="alimentOptionsChaine">{alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}</datalist></label></div>
            <div style={{ marginBottom: 10 }}><label>Catégorie :<input type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} /></label></div>
            <div style={{ marginBottom: 10 }}><label>Kcal :<input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} /></label></div>
            <div><label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> Aucun enchaînement sucre-gras aujourd’hui</label></div>
            <div style={{ margin: '8px 0' }}>Heure de prise du repas (optionnel) :<input type="time" value={heureRepas} onChange={e => setHeureRepas(e.target.value)} style={{ marginLeft: 8, width: 110 }} /><span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span></div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}{message && <p style={{color:'green'}}>{message}</p>}<button type="submit">Valider l’étape</button>
        </form>
    );
}

function DefiVraieFaim({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false); const [message, setMessage] = useState(''); const [erreur, setErreur] = useState('');
    if (!defi) return null;
    const handleSubmit = async (e) => { e.preventDefault(); setMessage(''); setErreur(''); if (!confirmation) return setErreur('Merci de confirmer que tu as vérifié la vraie faim.'); const { validerEtapeDefi } = await import('../lib/defisUtils'); const res = await validerEtapeDefi(defi); if (res.success) { setMessage('Bravo ! Étape validée.'); refreshDefis(); setConfirmation(false); } else setErreur(res.error || 'Erreur lors de la validation.'); };
    return <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#fff3e0', borderRadius:10, padding:18}}><h3>{defi.nom}</h3><p>{defi.description}</p><div><label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> J’ai vérifié que la faim était réelle avant de manger</label></div>{erreur && <p style={{color:'red'}}>{erreur}</p>}{message && <p style={{color:'green'}}>{message}</p>}<button type="submit">Valider l’étape</button></form>;
}

function DefiPlaisir({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false); const [message, setMessage] = useState(''); const [erreur, setErreur] = useState('');
    if (!defi) return null;
    const handleSubmit = async (e) => { e.preventDefault(); setMessage(''); setErreur(''); if (!confirmation) return setErreur('Merci de confirmer que tu as planifié et profité de ton extra.'); const { validerEtapeDefi } = await import('../lib/defisUtils'); const res = await validerEtapeDefi(defi); if (res.success) { setMessage('Bravo ! Étape validée.'); refreshDefis(); setConfirmation(false); } else setErreur(res.error || 'Erreur lors de la validation.'); };
    return <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#fce4ec', borderRadius:10, padding:18}}><h3>{defi.nom}</h3><p>{defi.description}</p><div><label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> J’ai planifié et profité de mon extra sans culpabilité</label></div>{erreur && <p style={{color:'red'}}>{erreur}</p>}{message && <p style={{color:'green'}}>{message}</p>}<button type="submit">Valider l’étape</button></form>;
}

function DefiUnCru({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false); const [message, setMessage] = useState(''); const [erreur, setErreur] = useState(''); const [aliment, setAliment] = useState(''); const [categorie, setCategorie] = useState(''); const [kcal, setKcal] = useState('');
    const referentielAliments = require('../data/referentiel.js').default || []; const alimentsFromReferentiel = Array.from(new Set(referentielAliments.map(a => a.nom).filter(Boolean)));
    React.useEffect(() => { if (!aliment || aliment.trim() === '') return; const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase()); if (found) { if (found.categorie) setCategorie(found.categorie); if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal)); if (found.portionDefaut) setQuantite(found.portionDefaut); } }, [aliment]);
    if (!defi) return null;
    const handleSubmit = async (e) => { e.preventDefault(); setMessage(''); setErreur(''); if (!aliment) return setErreur('Merci de préciser l’aliment cru ajouté.'); if (!confirmation) return setErreur('Merci de confirmer que l’aliment était cru et non sucré.'); const { validerEtapeDefi } = await import('../lib/defisUtils'); const res = await validerEtapeDefi(defi); if (res.success) { setMessage('Bravo ! Étape validée.'); refreshDefis(); setConfirmation(false); setAliment(''); setCategorie(''); setKcal(''); } else setErreur(res.error || 'Erreur lors de la validation.'); };
    return <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e0f7fa', borderRadius:10, padding:18}}><h3>{defi.nom}</h3><p>{defi.description}</p><div style={{ marginBottom: 10 }}><label>Aliment :<input list="alimentOptionsCru" type="text" value={aliment} onChange={e => setAliment(e.target.value)} style={{marginRight:8}} /><datalist id="alimentOptionsCru">{alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}</datalist></label></div><div style={{ marginBottom: 10 }}><label>Catégorie :<input type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} /></label></div><div style={{ marginBottom: 10 }}><label>Kcal :<input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} /></label></div><div><label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> Aliment cru et non sucré ajouté aujourd’hui</label></div>{erreur && <p style={{color:'red'}}>{erreur}</p>}{message && <p style={{color:'green'}}>{message}</p>}<button type="submit">Valider l’étape</button></form>;
}
import React, { useState } from 'react';
import { useDefis } from './DefisContext';
import { defisReferentiel } from '../lib/defisReferentiel';
import { supabase } from '../lib/supabaseClient';

function DefiPasDeDessert({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false); const [message, setMessage] = useState(''); const [erreur, setErreur] = useState(''); const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    if (!defi) return null;
    const handleSubmit = async (e) => { e.preventDefault(); setMessage(''); setErreur(''); if (!confirmation) return setErreur('Merci de confirmer que tu as terminé ton déjeuner sans dessert.'); const { validerEtapeDefi } = await import('../lib/defisUtils'); const res = await validerEtapeDefi(defi); if (res.success) { setMessage('Bravo ! Étape validée.'); refreshDefis(); setConfirmation(false); } else setErreur(res.error || 'Erreur lors de la validation.'); };
    return <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e3f2fd', borderRadius:10, padding:18}}><h3>{defi.nom}</h3><p>{defi.description}</p><div><label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> J’ai terminé mon déjeuner sans dessert aujourd’hui</label></div>{erreur && <p style={{color:'red'}}>{erreur}</p>}{message && <p style={{color:'green'}}>{message}</p>}<button type="submit">Valider l’étape</button></form>;
}

function DefiEcouteVentre({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false); const [message, setMessage] = useState(''); const [erreur, setErreur] = useState(''); const [typeRepas, setTypeRepas] = useState('Déjeuner');
    const getDefaultHeure = () => new Date().toTimeString().slice(0,5); const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    if (!defi) return null;
    const handleSubmit = async (e) => { e.preventDefault(); setMessage(''); setErreur(''); if (!confirmation) return setErreur('Merci de confirmer que tu t’es arrêté dès la satiété.'); const { validerEtapeDefi } = await import('../lib/defisUtils'); const res = await validerEtapeDefi(defi); if (res.success) { setMessage('Bravo ! Étape validée.'); refreshDefis(); setConfirmation(false); } else setErreur(res.error || 'Erreur lors de la validation.'); };
    return <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e8f5e9', borderRadius:10, padding:18}}><h3>{defi.nom}</h3><p>{defi.description}</p><div><label>Type de repas :<select value={typeRepas} onChange={e => setTypeRepas(e.target.value)} style={{marginLeft:8}}><option>Petit-déjeuner</option><option>Déjeuner</option><option>Collation</option><option>Dîner</option><option>Autre</option></select></label></div><div style={{ margin: '8px 0' }}>Heure de prise du repas (optionnel) :<input type="time" value={heureRepas} onChange={e => setHeureRepas(e.target.value)} style={{ marginLeft: 8, width: 110 }} /><span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span></div><div style={{marginTop:8}}><label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> Je me suis arrêté dès la satiété à ce repas</label></div>{erreur && <p style={{color:'red'}}>{erreur}</p>}{message && <p style={{color:'green'}}>{message}</p>}<button type="submit">Valider l’étape</button></form>;
}

function DefiChaudDoux({ defi, refreshDefis }) {
    const [cuisson, setCuisson] = useState('vapeur'); const [confirmation, setConfirmation] = useState(false); const [message, setMessage] = useState(''); const [erreur, setErreur] = useState(''); const getDefaultHeure = () => new Date().toTimeString().slice(0,5); const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    if (!defi) return null;
    const handleSubmit = async (e) => { e.preventDefault(); setMessage(''); setErreur(''); if (!confirmation) return setErreur('Merci de confirmer que tu as choisi une cuisson douce.'); const { validerEtapeDefi } = await import('../lib/defisUtils'); const res = await validerEtapeDefi(defi); if (res.success) { setMessage('Bravo ! Étape validée.'); refreshDefis(); setConfirmation(false); } else setErreur(res.error || 'Erreur lors de la validation.'); };
    return <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#fffde7', borderRadius:10, padding:18}}><h3>{defi.nom}</h3><p>{defi.description}</p><div><label>Mode de cuisson :<select value={cuisson} onChange={e => setCuisson(e.target.value)} style={{marginLeft:8}}><option value="vapeur">Vapeur</option><option value="mijoté">Mijoté</option><option value="cru">Cru</option><option value="autre">Autre</option></select></label></div><div style={{ margin: '8px 0' }}>Heure de prise du repas (optionnel) :<input type="time" value={heureRepas} onChange={e => setHeureRepas(e.target.value)} style={{ marginLeft: 8, width: 110 }} /><span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span></div><div style={{marginTop:8}}><label><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} /> J’ai choisi une cuisson douce pour ce dîner</label></div>{erreur && <p style={{color:'red'}}>{erreur}</p>}{message && <p style={{color:'green'}}>{message}</p>}<button type="submit">Valider l’étape</button></form>;
}

export default function SaisieDefisDynamiques({ refreshDefis: refreshDefisProp }) {
    const contexteDefis = useDefis() || {};
    const refreshDefis = refreshDefisProp || contexteDefis.refreshDefis || (async () => {});
    const [showForm, setShowForm] = useState(false);
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('alimentaire');
    const [duree, setDuree] = useState('');
    const [unite, setUnite] = useState('jour');
    const [erreur, setErreur] = useState('');
    const [message, setMessage] = useState('');

    const isValid = nom.trim() && description.trim() && duree.trim() && Number(duree) > 0;

    const handleSave = async (e) => {
        e.preventDefault();
        setErreur(''); setMessage('');
        if (!isValid) {
            setErreur('Merci de renseigner le nom, ce que tu veux accomplir et une durée supérieure à 0.');
            return;
        }

        const { data: authData, error: authError } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (authError || !userId) {
            setErreur('❌ Vous devez être connecté pour créer un défi.');
            return;
        }

        const { error: insertError } = await supabase
            .from('defis')
            .insert([{
                user_id: userId,
                type: type || 'personnalise',
                theme: 'Défi perso',
                nom: nom.trim(),
                description: description.trim(),
                duree: parseInt(duree, 10),
                unite: unite || 'jour',
                status: 'disponible',
                progress: 0
            }]);

        if (insertError) {
            console.error('Erreur insertion défi :', insertError.message);
            setErreur(`❌ Erreur : ${insertError.message}`);
            return;
        }

        setMessage('✅ Ton défi est prêt. Retrouve-le dans « Défis disponibles » pour le commencer.');
        await refreshDefis();

        setTimeout(() => {
            setNom(''); setDescription(''); setType('alimentaire'); setDuree(''); setUnite('jour'); setMessage(''); setShowForm(false);
        }, 2000);
    };

    return (
        <div style={{margin:'24px 0'}}>
            <button onClick={() => setShowForm(v => !v)} style={{marginBottom:16, background:'#1976d2', color:'#fff', border:'none', borderRadius:6, padding:'8px 18px', fontWeight:600}}>
                {showForm ? 'Annuler' : 'Créer un défi personnalisé'}
            </button>
            {showForm && (
                <form onSubmit={handleSave} style={{background:'#f5f5f5', borderRadius:10, padding:18, marginBottom:24, boxShadow:'0 2px 8px #0001'}}>
                    <h3>Créer un défi personnalisé</h3>
                    <div style={{marginBottom:10}}><label>Nom du défi* :<input type="text" value={nom} onChange={e => setNom(e.target.value)} style={{marginLeft:8, width:220}} required /></label></div>
                    <div style={{marginBottom:10}}><label>Ce que je veux accomplir* :<br/><textarea value={description} onChange={e => setDescription(e.target.value)} style={{marginTop:4, width:320, minHeight:60}} placeholder="Ex. M'arrêter de manger dès que je ressens la satiété" required /></label></div>
                    <div style={{marginBottom:10}}><label>Type :<select value={type} onChange={e => setType(e.target.value)} style={{marginLeft:8}}><option value="alimentaire">Alimentaire</option><option value="activité">Activité</option><option value="autre">Autre</option></select></label></div>
                    <div style={{marginBottom:10}}>
                        <label>Durée :<input type="number" value={duree} onChange={e => setDuree(e.target.value)} style={{marginLeft:8, width:80}} min={1} required /></label>
                        <label style={{marginLeft:16}}>Unité :<select value={unite} onChange={e => setUnite(e.target.value)} style={{marginLeft:8}}><option value="jour">Jour</option><option value="semaine">Semaine</option><option value="portion">Portion</option><option value="minute">Minute</option><option value="autre">Autre</option></select></label>
                    </div>
                    <div style={{marginBottom:14, padding:'10px 12px', background:'#ede7f6', borderRadius:8, color:'#5e35b1'}}>
                        📔 Le suivi se fera dans ton journal. Tu définiras tes engagements, puis tu confirmeras ceux que tu as tenus. Une journée progresse quand au moins 2 engagements sur 3 sont tenus.
                    </div>
                    {erreur && <p style={{color:'red'}}>{erreur}</p>}
                    {message && <p style={{color:'green'}}>{message}</p>}
                    <button type="submit" style={{background:'#388e3c', color:'#fff', border:'none', borderRadius:6, padding:'8px 18px', fontWeight:600, marginTop:8}}>Créer mon défi</button>
                </form>
            )}
        </div>
    );
}
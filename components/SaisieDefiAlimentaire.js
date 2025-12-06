import React, { useState, useEffect, useMemo } from 'react';
import { validerCriterePreparation } from '../lib/validerCriterePreparation';
import { useDefis } from './DefisContext';
import referentielAliments from '../data/referentiel';

export default function SaisieDefiAlimentaire() {
    const { defisEnCours, refreshDefis } = useDefis();
    const defi = defisEnCours.find(d => d.nom === '🧀 1 portion ça suffit');
    
    if (!defi) return null; // Afficher uniquement si défi actif
    
    const repasTypes = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner", "Autre"];
    
    // Listes dynamiques issues du référentiel
    const categorieOptions = useMemo(() => {
        try {
            const cats = (referentielAliments || []).map(a => a.categorie).filter(Boolean);
            return Array.from(new Set(cats)).concat(['Jeûne']);
        } catch (e) {
            return ['Jeûne'];
        }
    }, []);
    
    const alimentsFromReferentiel = useMemo(() => {
        try {
            return (referentielAliments || []).map(a => a.nom).filter(Boolean);
        } catch (e) {
            return [];
        }
    }, []);
    
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    
    // États du formulaire
    const [type, setType] = useState('Déjeuner');
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    const [heure, setHeure] = useState(getDefaultHeure());
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [quantite, setQuantite] = useState('1');
    const [kcal, setKcal] = useState('');
    const [note, setNote] = useState('');
    const [ressenti, setRessenti] = useState('');
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    // Remise à zéro automatique des champs non requis si catégorie = Jeûne
    useEffect(() => {
        if (categorie === "Jeûne") {
            setAliment('');
            setQuantite('');
            setKcal('');
        }
    }, [categorie]);

    // Pré-remplissage automatique lors de la sélection d'un aliment
    useEffect(() => {
        if (!aliment || aliment.trim() === '') return;
        const found = (referentielAliments || []).find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
        if (found) {
            if (found.categorie) setCategorie(found.categorie);
            if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal));
            if (found.portionDefaut !== undefined && found.portionDefaut !== null) {
                setQuantite(String(found.portionDefaut));
            } else if (found.portionMax !== undefined && found.portionMax !== null) {
                setQuantite(String(found.portionMax));
            }
        }
    }, [aliment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErreur('');
        
        const isJeune = categorie === "Jeûne";
        if (!isJeune && !aliment.trim()) {
            setErreur('Merci de saisir un aliment.');
            return;
        }

        // Validation du critère « Respect des quantités »
        let critereValide = false;
        if (!isJeune) {
            const found = (referentielAliments || []).find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
            if (!found) {
                setErreur('Aliment non reconnu dans le référentiel.');
                return;
            }
            
            let portionMax = 1;
            if (found.portionMax) {
                const match = String(found.portionMax).match(/([0-9]+([.,][0-9]+)?)/);
                portionMax = match ? parseFloat(match[1].replace(',', '.')) : 1;
            }
            const quantiteNum = quantite === '' ? 0 : isNaN(Number(quantite)) ? 0 : Number(quantite);
            if (quantiteNum <= portionMax) {
                critereValide = true;
            }
        } else {
            critereValide = true;
        }

        // Enregistrement dans localStorage
        const quantiteToSend = isJeune ? null : (quantite === '' ? null : isNaN(Number(quantite)) ? quantite : Number(quantite));
        const kcalToSend = isJeune ? null : (kcal === '' ? null : isNaN(Number(kcal)) ? kcal : Number(kcal));
        const alimentToSend = isJeune ? '' : aliment;
        const categorieToSend = isJeune ? 'Jeûne' : categorie;
        
        const repasPayload = {
            id: Date.now().toString(),
            type,
            date,
            heure,
            aliment: alimentToSend,
            categorie: categorieToSend,
            quantite: quantiteToSend,
            kcal: kcalToSend,
            est_extra: false,
            note,
            ressenti,
            satiete: ''
        };

        try {
            const existing = JSON.parse(localStorage.getItem('repasReels') || '[]');
            existing.push(repasPayload);
            localStorage.setItem('repasReels', JSON.stringify(existing));
            console.log('[SaisieDefiAlimentaire] Repas enregistré:', repasPayload);
        } catch (error) {
            setErreur("Erreur sauvegarde localStorage : " + error.message);
            return;
        }

        // Validation du critère métier
        if (critereValide) {
            validerCriterePreparation('quantites', new Date().toISOString());
            setMessage('Bravo ! Repas enregistré et critère « Respect des quantités » validé.');
        } else {
            setErreur('Attention, tu as dépassé la portion recommandée pour cet aliment. Critère non validé.');
            return;
        }

        // Valider l'étape du défi
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            refreshDefis();
            setAliment('');
            setCategorie('');
            setQuantite('1');
            setKcal('');
            setNote('');
            setRessenti('');
        } else {
            setErreur(res.error || 'Erreur lors de la validation du défi.');
        }
    };

    return (
        <div style={{ background: '#fffde7', border: '1px solid #ffe082', borderRadius: 10, padding: 24, margin: '24px 0' }}>
            <h3>Défi en cours : {defi.nom}</h3>
            <p>{defi.description}</p>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Type de repas :
                        <select value={type} onChange={e => setType(e.target.value)} style={{ marginLeft: 8 }}>
                            {repasTypes.map(rt => <option key={rt}>{rt}</option>)}
                        </select>
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Date :
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginLeft: 8 }} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Heure de prise du repas (optionnel) :
                        <input type="time" value={heure} onChange={e => setHeure(e.target.value)} style={{ marginLeft: 8, width: 110 }} />
                        <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Aliment mangé :
                        <input
                            list="alimentOptions"
                            type="text"
                            value={aliment}
                            onChange={e => setAliment(e.target.value)}
                            placeholder="Saisissez ou sélectionnez un aliment"
                            style={{ marginLeft: 8 }}
                            required={categorie !== "Jeûne"}
                        />
                        <datalist id="alimentOptions">
                            {alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}
                        </datalist>
                    </label>
                    {/* Affichage portion recommandée */}
                    {(() => {
                        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
                        if (!found || !found.portionDefaut) return null;
                        return (
                            <div style={{ fontSize: 12, marginTop: 4, marginBottom: 8, color: '#666' }}>
                                📏 Portion recommandée : {found.portionDefaut}
                            </div>
                        );
                    })()}
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Catégorie :
                        <input list="categorieOptions" type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} />
                        <datalist id="categorieOptions">
                            {categorieOptions.map(opt => <option key={opt} value={opt} />)}
                        </datalist>
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Quantité :
                        <input type="text" value={quantite} onChange={e => setQuantite(e.target.value)} style={{ marginLeft: 8, width: 60 }} required={categorie !== "Jeûne"} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Kcal :
                        <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} required={categorie !== "Jeûne"} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Note (contexte, réflexion, etc.) :
                        <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{ marginLeft: 8, width: 220 }} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Ressenti physique après le repas :
                        <input type="text" value={ressenti} onChange={e => setRessenti(e.target.value)} style={{ marginLeft: 8, width: 180 }} />
                    </label>
                </div>
                {erreur && <p style={{ color: 'red' }} aria-live="assertive">{erreur}</p>}
                {message && <p style={{ color: 'green' }} aria-live="polite">{message}</p>}
                <button type="submit" style={{ marginTop: 16 }}>Valider l'étape du défi et enregistrer le repas</button>
            </form>
        </div>
    );
}

import React, { useState, useEffect, useMemo } from 'react';
import referentielAliments from '../data/referentiel';

export default function SaisieRepriseJeune({ phaseReprise, jourReprise, programmeReprise }) {
    console.log('[SaisieRepriseJeune] Props reçues:', { phaseReprise, jourReprise, programmeReprise });
    
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

    // Recalcul automatique des kcal selon la quantité
    useEffect(() => {
        if (!aliment || aliment.trim() === '' || !quantite || quantite.trim() === '') return;
        const found = (referentielAliments || []).find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
        if (found && found.kcal) {
            let portionBase = 1;
            if (found.portionDefaut) {
                const match = String(found.portionDefaut).match(/([0-9]+([.,][0-9]+)?)/);
                portionBase = match ? parseFloat(match[1].replace(',', '.')) : 1;
            }
            const quantiteSaisie = String(quantite).match(/([0-9]+([.,][0-9]+)?)/);
            if (quantiteSaisie) {
                const quantiteNum = parseFloat(quantiteSaisie[1].replace(',', '.'));
                const kcalCalcules = Math.round((found.kcal / portionBase) * quantiteNum);
                setKcal(String(kcalCalcules));
            }
        }
    }, [aliment, quantite]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErreur('');
        
        const isJeune = categorie === "Jeûne";
        if (!isJeune && !aliment.trim()) {
            setErreur('Merci de saisir un aliment.');
            return;
        }

        // Recherche de l'aliment dans le référentiel UNIQUE
        const alimentRef = (referentielAliments || []).find(a => 
            a.nom.toLowerCase() === aliment.trim().toLowerCase()
        );

        if (!isJeune && !alimentRef) {
            setErreur('Aliment non reconnu dans le référentiel.');
            return;
        }

        // Validation des 4 critères (si aliment trouvé et champs reprise disponibles)
        let criteresValidés = [];
        let criteresNonValidés = [];

        if (alimentRef) {
            // 1️⃣ Critère Phase (seulement si champ 'phase' existe)
            if (alimentRef.phase !== undefined) {
                if (alimentRef.phase <= phaseReprise) {
                    criteresValidés.push('✅ Aliment autorisé Phase ' + phaseReprise);
                } else {
                    criteresNonValidés.push('❌ Aliment Phase ' + alimentRef.phase + ' (tu es en Phase ' + phaseReprise + ')');
                }
            } else {
                // Pas de champ phase → considéré comme autorisé
                criteresValidés.push('✅ Aliment autorisé (phase non spécifiée)');
            }
            
            // 2️⃣ Critère Horaires féculents
            if (alimentRef.categorie === 'féculent' && phaseReprise >= 4) {
                const heureNum = heure ? parseInt(heure.split(':')[0]) : new Date().getHours();
                if (heureNum >= 19) {
                    criteresNonValidés.push('❌ Féculent après 19h');
                } else {
                    criteresValidés.push('✅ Horaires respectés');
                }
            } else {
                criteresValidés.push('✅ Horaires OK');
            }
            
            // 3️⃣ Critère Quantités
            const quantiteNum = quantite === '' ? 0 : isNaN(Number(quantite)) ? 0 : Number(quantite);
            const portionDefaut = alimentRef.portionDefaut || alimentRef.portionMax || 1;
            let portionMax = portionDefaut;
            if (typeof portionDefaut === 'string') {
                const match = portionDefaut.match(/([0-9]+([.,][0-9]+)?)/);
                portionMax = match ? parseFloat(match[1].replace(',', '.')) : 1;
            }
            if (quantiteNum <= portionMax) {
                criteresValidés.push('✅ Quantité respectée');
            } else {
                criteresNonValidés.push('❌ Quantité dépassée (' + quantiteNum + ' > ' + portionMax + ')');
            }
            
            // 4️⃣ Critère Qualité (QN) - seulement si champ 'qn' existe
            if (alimentRef.qn !== undefined) {
                if (alimentRef.qn >= 4) {
                    criteresValidés.push('✅ Qualité excellente (QN: ' + alimentRef.qn + '/5)');
                } else if (alimentRef.qn >= 3) {
                    criteresValidés.push('⚠️ Qualité correcte (QN: ' + alimentRef.qn + '/5)');
                } else {
                    criteresNonValidés.push('❌ Aliment ultra-transformé (QN: ' + alimentRef.qn + '/5)');
                }
            } else {
                // Pas de champ QN → pas de validation qualité
                criteresValidés.push('ℹ️ Qualité non évaluée');
            }
        }

        // Enregistrement dans localStorage
        const alimentToSend = isJeune ? '' : aliment;
        const quantiteToSend = isJeune ? null : (quantite === '' ? null : isNaN(Number(quantite)) ? quantite : Number(quantite));
        
        const repasPayload = {
            id: Date.now().toString(),
            reprise_id: programmeReprise?.id || null,
            jour_numero: jourReprise,
            phase: phaseReprise,
            moment: type,
            aliment_nom: alimentToSend,
            quantite: quantiteToSend,
            kcal: isJeune ? null : kcal,
            note,
            ressenti,
            conforme: criteresNonValidés.length === 0,
            consomme_le: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        try {
            const existing = JSON.parse(localStorage.getItem('reprises_repas_consommes') || '[]');
            existing.push(repasPayload);
            localStorage.setItem('reprises_repas_consommes', JSON.stringify(existing));
            console.log('[SaisieRepriseJeune] Repas enregistré:', repasPayload);
        } catch (error) {
            setErreur("Erreur sauvegarde localStorage : " + error.message);
            return;
        }

        // Message de confirmation avec détail des critères
        const totalCriteres = 4;
        const criteresOK = criteresValidés.filter(c => c.startsWith('✅')).length;
        const criteresKO = criteresNonValidés.length;
        
        let messageFinal = '';
        
        // En-tête avec statut global
        if (criteresKO === 0) {
            messageFinal = '✅ Repas enregistré avec succès !\n\n';
            messageFinal += '🎯 Validation des critères : ' + criteresOK + '/' + totalCriteres + ' ✅\n\n';
        } else {
            messageFinal = '📝 Repas enregistré (avec réserves)\n\n';
            messageFinal += '📊 Validation des critères : ' + criteresOK + '/' + totalCriteres + ' validés\n\n';
        }
        
        // Détail des critères validés
        if (criteresValidés.length > 0) {
            messageFinal += criteresValidés.join('\n') + '\n';
        }
        
        // Détail des critères non validés
        if (criteresNonValidés.length > 0) {
            messageFinal += '\n' + criteresNonValidés.join('\n') + '\n';
        }
        
        // Conseil pédagogique selon les critères non validés
        if (criteresKO > 0) {
            messageFinal += '\n💡 Conseil : ';
            if (criteresNonValidés.some(c => c.includes('ultra-transformé'))) {
                messageFinal += 'Privilégie les aliments bruts (QN ≥ 4) pour optimiser ta récupération digestive.';
            } else if (criteresNonValidés.some(c => c.includes('Phase'))) {
                messageFinal += 'Attends quelques jours avant de réintroduire cet aliment progressivement.';
            } else if (criteresNonValidés.some(c => c.includes('Quantité'))) {
                messageFinal += 'Respecte les portions recommandées pour éviter la surcharge digestive.';
            } else if (criteresNonValidés.some(c => c.includes('19h'))) {
                messageFinal += 'Évite les féculents le soir pour faciliter la digestion nocturne.';
            }
        }
        
        setMessage(messageFinal);

        // Réinitialiser le formulaire
        setAliment('');
        setCategorie('');
        setQuantite('1');
        setKcal('');
        setNote('');
        setRessenti('');
    };

    return (
        <div style={{ background: '#fffde7', border: '1px solid #ffe082', borderRadius: 10, padding: 24, margin: '24px 0' }}>
            {/* Bandeau reprise alimentaire */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 2px 8px rgba(102,126,234,0.2)'
            }}>
                🌱 Reprise alimentaire active — Jour {jourReprise} — Phase {phaseReprise}
                <div style={{fontSize: 13, opacity: 0.9, marginTop: 4, fontWeight: 500}}>
                    ⚠️ Seuls les aliments autorisés pour ta phase seront validés
                </div>
            </div>
            
            {/* Critères du jour */}
            <div style={{
                background: 'white',
                border: '2px solid #667eea',
                borderRadius: 8,
                padding: '16px',
                marginBottom: 16
            }}>
                <div style={{fontWeight: 'bold', fontSize: 16, marginBottom: 12, color: '#667eea'}}>
                    ✅ Critères de validation du jour {jourReprise} (Phase {phaseReprise})
                </div>
                <div style={{fontSize: 14, lineHeight: 1.8}}>
                    <div style={{marginBottom: 6}}>
                        <span style={{fontWeight: 600}}>1️⃣ Aliments autorisés :</span> Uniquement les aliments de Phase {phaseReprise} ou inférieure
                    </div>
                    <div style={{marginBottom: 6}}>
                        <span style={{fontWeight: 600}}>2️⃣ Horaires féculents :</span> {phaseReprise >= 4 ? 'Pas de féculents après 19h' : 'Tous horaires autorisés'}
                    </div>
                    <div style={{marginBottom: 6}}>
                        <span style={{fontWeight: 600}}>3️⃣ Quantités :</span> Respecter les portions recommandées
                    </div>
                    <div>
                        <span style={{fontWeight: 600}}>4️⃣ Qualité alimentaire :</span> Privilégier les aliments bruts (QN ≥ 4)
                    </div>
                </div>
            </div>
            
            <h3>📝 Saisie repas en mode reprise</h3>
            <p>Enregistre tes repas pour suivre ta reprise alimentaire après jeûne.</p>
            
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
                    {/* Affichage portion + QN */}
                    {(() => {
                        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
                        if (!found) return null;
                        return (
                            <div style={{ fontSize: 12, marginTop: 4, marginBottom: 8, color: '#666' }}>
                                {found.portionDefaut && (
                                    <span>📏 Portion recommandée : {found.portionDefaut}</span>
                                )}
                                {found.qn !== undefined && (
                                    <span style={{ marginLeft: found.portionDefaut ? 12 : 0 }}>
                                        (QN: {found.qn}/5)
                                    </span>
                                )}
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
                {erreur && <p style={{ color: 'red', whiteSpace: 'pre-wrap' }} aria-live="assertive">{erreur}</p>}
                {message && <p style={{ color: 'green', whiteSpace: 'pre-wrap' }} aria-live="polite">{message}</p>}
                <button type="submit" style={{ marginTop: 16, padding: '10px 20px', fontSize: 16, fontWeight: 600, background: '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    Enregistrer le repas
                </button>
            </form>
        </div>
    );
}

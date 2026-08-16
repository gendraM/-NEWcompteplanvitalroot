import React, { useState, useEffect, useMemo } from 'react';
import referentielAliments from '../data/referentiel';

export default function SaisieRepriseJeune({ phaseReprise, jourReprise, programmeReprise, dateRepas }) {
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
    const [date, setDate] = useState(dateRepas || new Date().toISOString().slice(0,10));
    const [heure, setHeure] = useState(getDefaultHeure());
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [quantite, setQuantite] = useState('1');
    const [kcal, setKcal] = useState('');
    const [note, setNote] = useState('');
    const [ressenti, setRessenti] = useState('');
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    // La date sélectionnée dans le suivi est la date réelle du repas.
    // Elle peut correspondre à une journée passée que l'utilisatrice complète après coup.
    useEffect(() => {
        if (dateRepas) setDate(dateRepas);
    }, [dateRepas]);

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

        // Message de confirmation avec détail des critères (AVANT repasPayload)
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

        // Enregistrement dans localStorage
        const alimentToSend = isJeune ? '' : aliment;
        const quantiteToSend = isJeune ? null : (quantite === '' ? null : isNaN(Number(quantite)) ? quantite : Number(quantite));
        const dateSaisie = new Date();
        const dateSaisieISO = dateSaisie.toISOString();
        const dateSaisieJour = [
            dateSaisie.getFullYear(),
            String(dateSaisie.getMonth() + 1).padStart(2, '0'),
            String(dateSaisie.getDate()).padStart(2, '0')
        ].join('-');
        const dateRepasEffective = date || dateRepas || dateSaisieJour;
        const saisieRetroactive = dateRepasEffective < dateSaisieJour;
        
        const repasPayload = {
            id: Date.now().toString(),
            reprise_id: programmeReprise?.id || null,
            jour_numero: jourReprise,
            jour_reprise: jourReprise, // Pour compatibilité avec page reprise
            phase: phaseReprise,
            phase_reprise: phaseReprise, // Pour compatibilité avec page reprise
            // `date` est conservé pour compatibilité avec les écrans existants.
            date: dateRepasEffective,
            date_repas: dateRepasEffective,
            heure: heure,
            heure_repas: heure,
            saisie_retroactive: saisieRetroactive,
            moment: type,
            aliment_nom: alimentToSend,
            quantite: quantiteToSend,
            kcal: isJeune ? null : kcal,
            note,
            ressenti,
            conforme: criteresNonValidés.length === 0,
            validation: {
                phase_ok: criteresValidés.some(c => c.includes('Phase')),
                horaire_ok: criteresValidés.some(c => c.includes('Horaire') || c.includes('féculents')),
                quantite_ok: criteresValidés.some(c => c.includes('Quantité')),
                qn_ok: criteresValidés.some(c => c.includes('QN') || c.includes('Qualité')),
                message: messageFinal
            },
            consomme_le: `${dateRepasEffective}T${heure || '00:00'}:00`,
            created_at: dateSaisieISO
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
        <div style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            border: '1px solid #e0e7ff', 
            borderRadius: 16, 
            padding: '28px', 
            margin: '24px 0',
            boxShadow: '0 4px 16px rgba(102,126,234,0.1)'
        }}>
            {/* Bandeau reprise alimentaire */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 24,
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{fontSize: 18, fontWeight: 700, marginBottom: 6}}>
                        🌱 Reprise alimentaire active
                    </div>
                    <div style={{fontSize: 14, opacity: 0.95}}>
                        Jour {jourReprise} — Phase {phaseReprise}
                    </div>
                    <div style={{fontSize: 12, opacity: 0.85, marginTop: 6, fontWeight: 500}}>
                        ⚠️ Seuls les aliments autorisés pour ta phase seront validés
                    </div>
                </div>
                <a
                    href="/reprise-alimentaire-apres-jeune"
                    style={{
                        background: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: 6,
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                >
                    <span>📋</span> Voir mon plan
                </a>
            </div>
            
            {/* Critères du jour */}
            <div style={{
                background: 'white',
                border: '2px solid #a5b4fc',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 24,
                boxShadow: '0 2px 8px rgba(165,180,252,0.15)'
            }}>
                <div style={{
                    fontWeight: 700, 
                    fontSize: 17, 
                    marginBottom: 16, 
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <span>✅</span> Critères de validation du jour {jourReprise} (Phase {phaseReprise})
                </div>
                <div style={{fontSize: 14, lineHeight: 2}}>
                    <div style={{
                        marginBottom: 8,
                        padding: '8px 12px',
                        background: '#f0f9ff',
                        borderRadius: 6,
                        borderLeft: '3px solid #3b82f6'
                    }}>
                        <span style={{fontWeight: 600, color: '#1e40af'}}>1️⃣ Aliments autorisés :</span>{' '}
                        <span style={{color: '#475569'}}>Phase {phaseReprise} ou inférieure uniquement</span>
                    </div>
                    <div style={{
                        marginBottom: 8,
                        padding: '8px 12px',
                        background: '#fef3c7',
                        borderRadius: 6,
                        borderLeft: '3px solid #f59e0b'
                    }}>
                        <span style={{fontWeight: 600, color: '#92400e'}}>2️⃣ Horaires féculents :</span>{' '}
                        <span style={{color: '#475569'}}>{phaseReprise >= 4 ? 'Pas de féculents après 19h' : 'Tous horaires autorisés'}</span>
                    </div>
                    <div style={{
                        marginBottom: 8,
                        padding: '8px 12px',
                        background: '#f0fdf4',
                        borderRadius: 6,
                        borderLeft: '3px solid #10b981'
                    }}>
                        <span style={{fontWeight: 600, color: '#065f46'}}>3️⃣ Quantités :</span>{' '}
                        <span style={{color: '#475569'}}>Respecter les portions recommandées</span>
                    </div>
                    <div style={{
                        padding: '8px 12px',
                        background: '#fef2f2',
                        borderRadius: 6,
                        borderLeft: '3px solid #ef4444'
                    }}>
                        <span style={{fontWeight: 600, color: '#991b1b'}}>4️⃣ Qualité alimentaire :</span>{' '}
                        <span style={{color: '#475569'}}>Privilégier les aliments bruts (QN ≥ 4)</span>
                    </div>
                </div>
            </div>
            
            {/* Formulaire de saisie */}
            <div style={{
                background: 'white',
                borderRadius: 12,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <span>📝</span> Saisie repas en mode reprise
                </h3>
                <p style={{margin: '0 0 20px 0', color: '#64748b', fontSize: 14}}>
                    Enregistre tes repas pour suivre ta reprise alimentaire après jeûne.
                </p>
            
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                    <div style={{flex: '1 1 200px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Type de repas
                        </label>
                        <select 
                            value={type} 
                            onChange={e => setType(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        >
                            {repasTypes.map(rt => <option key={rt}>{rt}</option>)}
                        </select>
                    </div>
                    <div style={{flex: '1 1 150px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Date
                        </label>
                        <input 
                            type="date" 
                            value={date} 
                            readOnly
                            title="Cette date correspond à la journée sélectionnée dans le suivi"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none',
                                background: '#f8fafc'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                    <div style={{flex: '1 1 130px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Heure <span style={{fontSize: 12, fontWeight: 400, color: '#9ca3af'}}>(optionnel)</span>
                        </label>
                        <input 
                            type="time" 
                            value={heure} 
                            onChange={e => setHeure(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                </div>
                <div>
                    <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                        Aliment mangé
                    </label>
                    <input
                            list="alimentOptions"
                            type="text"
                            value={aliment}
                            onChange={e => setAliment(e.target.value)}
                            placeholder="Saisissez ou sélectionnez un aliment"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            required={categorie !== "Jeûne"}
                        />
                        <datalist id="alimentOptions">
                            {alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}
                        </datalist>
                    {/* Affichage portion + QN */}
                    {(() => {
                        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
                        if (!found) return null;
                        return (
                            <div style={{
                                fontSize: 13,
                                marginTop: 8,
                                padding: '8px 12px',
                                background: '#f0f9ff',
                                borderRadius: 6,
                                color: '#1e40af',
                                border: '1px solid #bfdbfe'
                            }}>
                                {found.portionDefaut && (
                                    <span>📏 Portion recommandée : <strong>{found.portionDefaut}</strong></span>
                                )}
                                {found.qn !== undefined && (
                                    <span style={{ marginLeft: found.portionDefaut ? 12 : 0 }}>
                                        QN: <strong>{found.qn}/5</strong>
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </div>
                <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                    <div style={{flex: '1 1 200px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Catégorie
                        </label>
                        <input 
                            list="categorieOptions" 
                            type="text" 
                            value={categorie} 
                            onChange={e => setCategorie(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <datalist id="categorieOptions">
                            {categorieOptions.map(opt => <option key={opt} value={opt} />)}
                        </datalist>
                    </div>
                    <div style={{flex: '1 1 120px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Quantité (g)
                        </label>
                        <input 
                            type="text" 
                            value={quantite} 
                            onChange={e => setQuantite(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            required={categorie !== "Jeûne"} 
                        />
                    </div>
                    <div style={{flex: '1 1 100px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Kcal
                        </label>
                        <input 
                            type="number" 
                            value={kcal} 
                            onChange={e => setKcal(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            required={categorie !== "Jeûne"} 
                        />
                    </div>
                </div>
                <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                    <div style={{flex: '1 1 300px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Note <span style={{fontSize: 12, fontWeight: 400, color: '#9ca3af'}}>(contexte, réflexion...)</span>
                        </label>
                        <input 
                            type="text" 
                            value={note} 
                            onChange={e => setNote(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                    <div style={{flex: '1 1 250px'}}>
                        <label style={{display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#374151'}}>
                            Ressenti physique après le repas
                        </label>
                        <input 
                            type="text" 
                            value={ressenti} 
                            onChange={e => setRessenti(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '2px solid #e5e7eb',
                                fontSize: 14,
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                </div>
                {erreur && (
                    <div style={{
                        marginTop: 16,
                        padding: '12px 16px',
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        borderRadius: 8,
                        color: '#991b1b',
                        fontSize: 14,
                        whiteSpace: 'pre-wrap'
                    }} aria-live="assertive">
                        {erreur}
                    </div>
                )}
                {message && (
                    <div style={{
                        marginTop: 16,
                        padding: 20,
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        border: '2px solid #86efac',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(134,239,172,0.2)'
                    }} aria-live="polite">
                        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
                            <span style={{fontSize: 24}}>📋</span>
                            <div>
                                <h4 style={{margin: 0, fontSize: 16, fontWeight: 700, color: '#065f46'}}>
                                    Repas enregistré avec réserves
                                </h4>
                                <p style={{margin: '4px 0 0 0', fontSize: 13, color: '#047857'}}>
                                    {message?.match(/Validation des critères : (\d+)\/4/)?.[1] || '0'}/4 critères validés
                                </p>
                            </div>
                        </div>
                        
                        {message?.includes('❌') && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                marginTop: 12,
                                padding: 12,
                                background: 'white',
                                borderRadius: 8,
                                border: '1px solid #fca5a5'
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
                                    <span style={{fontSize: 16}}>⚠️</span>
                                    <strong style={{fontSize: 14, color: '#991b1b'}}>Points d'attention :</strong>
                                </div>
                                {message?.split('\n').filter(line => line.includes('❌')).map((line, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'start',
                                        gap: 8,
                                        padding: '8px 12px',
                                        background: '#fef2f2',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        color: '#991b1b'
                                    }}>
                                        <span>❌</span>
                                        <span style={{flex: 1}}>{line.replace('❌', '').trim()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {message?.includes('💡') && (
                            <div style={{
                                marginTop: 12,
                                padding: 12,
                                background: '#fef3c7',
                                borderRadius: 8,
                                border: '1px solid #fbbf24',
                                fontSize: 13,
                                color: '#92400e'
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
                                    <span style={{fontSize: 16}}>💡</span>
                                    <strong>Conseil :</strong>
                                </div>
                                {message?.split('\n').find(line => line.includes('💡'))?.replace('💡', '').trim()}
                            </div>
                        )}
                        
                        <button 
                            onClick={() => window.location.href = '/reprise-alimentaire-apres-jeune'}
                            style={{
                                marginTop: 16,
                                padding: '10px 20px',
                                fontSize: 14,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                width: '100%',
                                boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            📊 Voir mon plan détaillé
                        </button>
                    </div>
                )}
                <button 
                    type="submit" 
                    style={{
                        marginTop: 20,
                        padding: '12px 32px',
                        fontSize: 16,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                        transition: 'transform 0.2s',
                        width: '100%'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    ✅ Enregistrer le repas
                </button>
            </form>
            </div>
        </div>
    );
}

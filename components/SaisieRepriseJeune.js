import React, { useState, useEffect, useMemo } from 'react';
import referentielAliments from '../data/referentiel';
import alimentsRepriseJeune from '../data/alimentsRepriseJeune';
import {
    PHASES_REPRISE,
    evaluerAlimentReprise,
    getAlimentsDisponiblesPhase,
    getContraintesAliment,
    trouverRegleReprise
} from '../lib/repriseJeuneMetier';
import {
    genererClientId,
    sauvegarderRepasRepriseLocal,
    synchroniserRepasReprise,
    synchroniserRepasRepriseEnAttente
} from '../lib/repriseRepasSync';

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
            const nomsReprise = alimentsRepriseJeune.map(a => a.nom);
            const nomsGeneraux = (referentielAliments || []).map(a => a.nom).filter(Boolean);
            return Array.from(new Set([...nomsReprise, ...nomsGeneraux]));
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
    const [preparation, setPreparation] = useState(null);
    const [texture, setTexture] = useState(null);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    const jourDansPhase = useMemo(() => {
        const debut = programmeReprise?.phases?.[`phase${phaseReprise}`]?.debut;
        return debut ? Math.max(1, Number(jourReprise) - Number(debut) + 1) : 1;
    }, [jourReprise, phaseReprise, programmeReprise]);

    const alimentsDisponibles = useMemo(
        () => getAlimentsDisponiblesPhase(phaseReprise, jourDansPhase),
        [phaseReprise, jourDansPhase]
    );

    const alimentRefSelectionne = useMemo(() =>
        (referentielAliments || []).find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase()) || null,
    [aliment]);
    const regleSelectionnee = useMemo(
        () => trouverRegleReprise(alimentRefSelectionne || aliment),
        [alimentRefSelectionne, aliment]
    );
    const contraintesSelectionnees = useMemo(
        () => getContraintesAliment(regleSelectionnee || aliment),
        [regleSelectionnee, aliment]
    );

    useEffect(() => {
        synchroniserRepasRepriseEnAttente().catch(error =>
            console.warn('[REPRISE] Synchronisation différée:', error)
        );
        const reprendreSynchronisation = () => {
            synchroniserRepasRepriseEnAttente().catch(error =>
                console.warn('[REPRISE] Synchronisation différée:', error)
            );
        };
        window.addEventListener('online', reprendreSynchronisation);
        return () => window.removeEventListener('online', reprendreSynchronisation);
    }, []);

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
        const found = (referentielAliments || []).find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase())
            || trouverRegleReprise(aliment);
        if (found) {
            if (found.categorie) setCategorie(found.categorie);
            if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal));
            if (found.portionDefaut !== undefined && found.portionDefaut !== null) {
                setQuantite(String(found.portionDefaut));
            } else if (found.portionMax !== undefined && found.portionMax !== null) {
                setQuantite(String(found.portionMax));
            }
        }
        setPreparation(null);
        setTexture(null);
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

        const isJeune = categorie === 'Jeûne';
        const regle = trouverRegleReprise(alimentRefSelectionne || aliment);
        if (!isJeune && !aliment.trim()) {
            setErreur('Merci de saisir un aliment.');
            return;
        }
        if (!isJeune && !alimentRefSelectionne && !regle) {
            setErreur('Aliment non reconnu dans le référentiel ou dans les règles de reprise.');
            return;
        }

        const alimentEvalue = alimentRefSelectionne || regle;
        const evaluation = isJeune
            ? {
                statut: 'jeune',
                conforme: true,
                phase_ok: true,
                jour_ok: true,
                qn_ok: true,
                preparation_ok: true,
                texture_ok: true,
                regle: null,
                attendu: null
            }
            : evaluerAlimentReprise({
                aliment: alimentEvalue,
                phase: phaseReprise,
                jourDansPhase,
                preparation,
                texture
            });

        const dateSaisie = new Date();
        const dateSaisieISO = dateSaisie.toISOString();
        const dateSaisieJour = [
            dateSaisie.getFullYear(),
            String(dateSaisie.getMonth() + 1).padStart(2, '0'),
            String(dateSaisie.getDate()).padStart(2, '0')
        ].join('-');
        const dateRepasEffective = date || dateRepas || dateSaisieJour;
        const saisieRetroactive = dateRepasEffective < dateSaisieJour;
        const clientId = genererClientId();

        const messagesStatut = {
            autorise: '✅ Repas enregistré : il correspond aux règles de cette phase.',
            a_confirmer: '📝 Repas enregistré. La préparation ou la texture reste à confirmer.',
            phase_suivante: `📝 Repas enregistré. Cet aliment est prévu à partir de la phase ${evaluation.attendu?.phase}.`,
            jour_suivant: `📝 Repas enregistré. Cet aliment sera disponible à partir du jour ${evaluation.attendu?.jour_phase_min} de cette phase.`,
            ecart: '📝 Repas enregistré avec un écart par rapport à la préparation, la texture ou au QN attendu.',
            non_reference_reprise: '📝 Repas enregistré. Cet aliment ne possède pas encore de règle spécifique de reprise.',
            jeune: '✅ Journée de jeûne enregistrée.'
        };
        const messageFinal = messagesStatut[evaluation.statut] || '📝 Repas enregistré.';

        const repasPayload = {
            id: clientId,
            client_id: clientId,
            reprise_id: programmeReprise?.id || null,
            jour_id: null,
            jour_numero: Number(jourReprise),
            jour_reprise: Number(jourReprise),
            phase: Number(phaseReprise),
            phase_reprise: Number(phaseReprise),
            date: dateRepasEffective,
            date_repas: dateRepasEffective,
            heure,
            heure_repas: heure || null,
            saisie_retroactive: saisieRetroactive,
            moment: type,
            aliment_nom: isJeune ? 'Jeûne' : aliment,
            quantite: isJeune ? null : (quantite || null),
            kcal: isJeune || kcal === '' ? null : Number(kcal),
            note,
            ressenti,
            conforme: evaluation.conforme,
            preparation,
            texture,
            evaluation_reprise: {
                statut: evaluation.statut,
                phase_ok: evaluation.phase_ok,
                jour_ok: evaluation.jour_ok,
                qn_ok: evaluation.qn_ok,
                preparation,
                preparation_ok: evaluation.preparation_ok,
                texture,
                texture_ok: evaluation.texture_ok,
                attendu: evaluation.attendu,
                regle_nom: evaluation.regle?.nom || null,
                phase_metier: PHASES_REPRISE[Number(phaseReprise)]
            },
            validation: {
                phase_ok: evaluation.phase_ok,
                horaire_ok: true,
                quantite_ok: null,
                qn_ok: evaluation.qn_ok,
                preparation_ok: evaluation.preparation_ok,
                texture_ok: evaluation.texture_ok,
                message: messageFinal
            },
            consomme_le: `${dateRepasEffective}T${heure || '00:00'}:00`,
            created_at: dateSaisieISO,
            statut_sync: 'en_attente',
            erreur_sync: null
        };

        try {
            sauvegarderRepasRepriseLocal(repasPayload);
        } catch (error) {
            setErreur('Erreur de sauvegarde locale : ' + error.message);
            return;
        }

        try {
            await synchroniserRepasReprise(repasPayload);
            setMessage(messageFinal + '\n☁️ Synchronisé avec ton compte.');
        } catch (error) {
            sauvegarderRepasRepriseLocal({
                ...repasPayload,
                statut_sync: 'en_attente',
                erreur_sync: error.message
            });
            setMessage(messageFinal + '\n📱 Conservé sur cet appareil, synchronisation automatique en attente.');
        }

        setAliment('');
        setCategorie('');
        setQuantite('1');
        setKcal('');
        setNote('');
        setRessenti('');
        setPreparation(null);
        setTexture(null);
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
                        Les écarts restent enregistrables et sont clairement signalés
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
                        <span style={{color: '#475569'}}>QN minimum {PHASES_REPRISE[Number(phaseReprise)]?.qnMinimum || 3}</span>
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
                            {alimentsDisponibles.map(opt => <option key={`reprise-${opt.nom}`} value={opt.nom} label="Disponible dans ta reprise" />)}
                            {alimentsFromReferentiel
                                .filter(opt => !alimentsDisponibles.some(disponible => disponible.nom === opt))
                                .map(opt => <option key={opt} value={opt} />)}
                        </datalist>
                    {/* Affichage portion + QN */}
                    {(() => {
                        const found = alimentRefSelectionne || regleSelectionnee;
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
                {contraintesSelectionnees.preparations.length > 0 && (
                    <fieldset style={{border:'1px solid #c7d2fe', borderRadius:10, padding:14}}>
                        <legend style={{fontWeight:700, color:'#4338ca'}}>Comment était-il préparé ?</legend>
                        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                            {[...contraintesSelectionnees.preparations, 'Je ne sais pas'].map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setPreparation(option)}
                                    style={{
                                        border:'1px solid #818cf8',
                                        borderRadius:20,
                                        padding:'8px 12px',
                                        background: preparation === option ? '#4f46e5' : 'white',
                                        color: preparation === option ? 'white' : '#3730a3',
                                        cursor:'pointer'
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                )}
                {contraintesSelectionnees.textures.length > 0 && (
                    <fieldset style={{border:'1px solid #c7d2fe', borderRadius:10, padding:14}}>
                        <legend style={{fontWeight:700, color:'#4338ca'}}>Quelle était sa texture ?</legend>
                        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                            {[...contraintesSelectionnees.textures, 'Je ne sais pas'].map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setTexture(option)}
                                    style={{
                                        border:'1px solid #818cf8',
                                        borderRadius:20,
                                        padding:'8px 12px',
                                        background: texture === option ? '#4f46e5' : 'white',
                                        color: texture === option ? 'white' : '#3730a3',
                                        cursor:'pointer'
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                )}
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
                                    {message.includes('✅') ? 'Repas conforme enregistré' : 'Repas enregistré avec suivi'}
                                </h4>
                                <p style={{margin: '4px 0 0 0', fontSize: 13, color: '#047857'}}>
                                    La saisie reste conservée, même en cas d’écart ou d’information inconnue.
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

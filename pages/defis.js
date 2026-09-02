import BandeauDefiActif from '../components/BandeauDefiActif';
import SaisieDefisDynamiques from '../components/SaisieDefisDynamiques';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { defisReferentiel } from '../lib/defisReferentiel';
import { DEFIS_STATUS, getDefiMax, isDefiDisponible, isDefiEnCours, isDefiTermine } from '../lib/defisUtils';
import { initDefisUser } from '../lib/initDefisUser';
import { useRouter } from 'next/router';
import { useDefis } from '../components/DefisContext';

// Composant retour en arrière
function RetourArriere() {
    return (
        <div style={{ margin: '2rem 0 1.5rem 0', textAlign: 'center' }}>
            <button onClick={() => window.history.back()} style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                fontWeight: 700,
                fontSize: 17,
                cursor: 'pointer',
                boxShadow: '0 1px 6px #e0e0e0',
            }}>
                ← Retour
            </button>
        </div>
    );
}

const Defis = () => {
    const [defis, setDefis] = useState([]);
    const router = useRouter();
    const { refreshDefis } = useDefis();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('disponibles'); // onglet actif
    const [actionLoading, setActionLoading] = useState(false); // Pour feedback bouton
    const [userId, setUserId] = useState(null);

    // Fonction de chargement des défis (réutilisable)
    const loadDefis = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            const uid = authData?.user?.id;

            if (authError || !uid) {
                setUserId(null);
                setDefis([]);
                setError('Utilisateur non authentifié');
                return;
            }

            setUserId(uid);

            // Une seule autorité d'initialisation : ajoute uniquement les défis de référence manquants.
            const initResult = await initDefisUser();
            if (initResult?.errors?.length) {
                console.warn('Initialisation défis partielle:', initResult.errors);
            }

            let { data, error: loadError } = await supabase
                .from('defis')
                .select('*')
                .eq('user_id', uid);

            if (loadError) throw loadError;

            // Normalisation non destructive des anciens enregistrements de cet utilisateur.
            for (const defi of data || []) {
                const ref = defisReferentiel.find(d => d.description === defi.description);
                const normalisations = {};

                if (ref && defi.nom !== ref.nom) {
                    normalisations.nom = ref.nom;
                }
                if (defi.status === 'en attente') {
                    normalisations.status = DEFIS_STATUS.DISPONIBLE;
                }

                if (Object.keys(normalisations).length > 0) {
                    const { error: updateError } = await supabase
                        .from('defis')
                        .update(normalisations)
                        .eq('id', defi.id)
                        .eq('user_id', uid);

                    if (updateError) {
                        console.warn('Normalisation défi impossible:', defi.id, updateError);
                    }
                }
            }

            const { data: finalData, error: finalError } = await supabase
                .from('defis')
                .select('*')
                .eq('user_id', uid);

            if (finalError) throw finalError;
            setDefis(finalData || []);
        } catch (err) {
            console.error('Erreur chargement défis:', err);
            setError('Erreur lors du chargement des défis');
        } finally {
            setLoading(false);
        }
    };

    const synchroniserDefis = async () => {
        await Promise.all([loadDefis(), refreshDefis()]);
    };

    // useEffect pour charger les défis au montage
    useEffect(() => {
        loadDefis();
    }, []);

    // Handler pour réinitialiser un défi
    const handleReinitialiserDefi = async (defi) => {
        if (!userId) {
            setError('Utilisateur non authentifié');
            return;
        }

        setActionLoading(defi.id);
        const { error: updateError } = await supabase
            .from('defis')
            .update({ progress: 0, status: DEFIS_STATUS.DISPONIBLE })
            .eq('id', defi.id)
            .eq('user_id', userId);

        if (updateError) {
            setError('Erreur lors de la réinitialisation du défi');
            setActionLoading(false);
            return;
        }

        await synchroniserDefis();
        setActionLoading(false);
    };

    // Handler pour supprimer un défi personnalisé
    const handleSupprimerDefi = async (defiId) => {
        if (!userId) {
            setError('Utilisateur non authentifié');
            return;
        }

        if (!window.confirm('Voulez-vous vraiment supprimer ce défi personnalisé ?')) {
            return;
        }

        setActionLoading(defiId);
        console.log('Suppression défi ID:', defiId);

        const { error: deleteError } = await supabase
            .from('defis')
            .delete()
            .eq('id', defiId)
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Erreur suppression:', deleteError);
            setError('Erreur lors de la suppression du défi');
            setActionLoading(false);
            return;
        }

        console.log('Défi supprimé, rechargement...');
        await synchroniserDefis();
        setActionLoading(false);
        alert('✅ Défi supprimé avec succès !');
    };

    // Handler pour démarrer un défi
    const handleCommencerDefi = async (defiId) => {
        if (!userId) {
            setError('Utilisateur non authentifié');
            return;
        }

        setActionLoading(defiId); // Pour feedback visuel

        const defi = defis.find(d => d.id === defiId);
        if (!defi) {
            setError('Défi introuvable');
            setActionLoading(false);
            return;
        }

        const estDefiPersonnalise = defi.type === 'personnalise' || defi.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi.description);

        // Un démarrage ne valide aucune étape : progression toujours à 0.
        const { error: updateError } = await supabase
            .from('defis')
            .update({ progress: 0, status: DEFIS_STATUS.EN_COURS })
            .eq('id', defiId)
            .eq('user_id', userId);

        if (updateError) {
            setError('Erreur lors du démarrage du défi');
            setActionLoading(false);
            return;
        }

        await synchroniserDefis();

        if (estDefiPersonnalise) {
            setActionLoading(false);
            router.push(`/journal-defi/${defiId}`);
            return;
        }

        setActionLoading(false);
    };

    // Handler pour incrémenter la progression d'un défi en cours
    const handleAccomplirEtape = async (defi) => {
        setActionLoading(defi.id);
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);

        if (!res.success) {
            setError(res.error || 'Erreur lors de la progression du défi');
            setActionLoading(false);
            return;
        }

        await synchroniserDefis();
        setActionLoading(false);
    };

    if (loading) {
        return <div>Chargement des défis...</div>;
    }
    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    // Filtres selon l'état métier, pas uniquement la valeur de progression.
    const defisDisponibles = defis.filter(isDefiDisponible);
    const defisEnCours = defis.filter(isDefiEnCours);
    const defisTermines = defis.filter(isDefiTermine);
    const defiActif = defisEnCours[0] || null;
    const estDefiActifAvecJournal = defiActif && (
        defiActif.type === 'personnalise' ||
        defiActif.type === 'alimentaire' ||
        !defisReferentiel.find(d => d.description === defiActif.description)
    );

    return (
        <div>
            {defiActif && (
                <BandeauDefiActif
                    defi={defiActif}
                    progression={defiActif.progress || 0}
                    onOpenJournal={() => estDefiActifAvecJournal
                        ? router.push(`/journal-defi/${defiActif.id}`)
                        : setTab('en-cours')}
                />
            )}
            <RetourArriere />
            <h1>Mes défis</h1>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <button
                    onClick={() => setTab('disponibles')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'disponibles' ? '2px solid #1976d2' : '1px solid #ccc',
                        background: tab === 'disponibles' ? '#e3f2fd' : '#fff',
                        fontWeight: tab === 'disponibles' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Défis disponibles</button>
                <button
                    onClick={() => setTab('en-cours')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'en-cours' ? '2px solid #0288d1' : '1px solid #ccc',
                        background: tab === 'en-cours' ? '#e1f5fe' : '#fff',
                        fontWeight: tab === 'en-cours' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Défis en cours</button>
                <button
                    onClick={() => setTab('termines')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'termines' ? '2px solid #388e3c' : '1px solid #ccc',
                        background: tab === 'termines' ? '#e0ffe0' : '#fff',
                        fontWeight: tab === 'termines' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Défis terminés</button>
                <button
                    onClick={() => setTab('creer')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'creer' ? '2px solid #9c27b0' : '1px solid #ccc',
                        background: tab === 'creer' ? '#f3e5f5' : '#fff',
                        fontWeight: tab === 'creer' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Créer un défi</button>
            </div>
            {tab === 'disponibles' && (
                <>
                    <p>Défis que tu peux commencer à tout moment.</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisDisponibles.length === 0 && <li>Aucun défi disponible.</li>}
                        {defisDisponibles.map(defi => {
                            const max = getDefiMax(defi);
                            const estDefiPersonnalise = defi.type === 'personnalise' || defi.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi.description);
                            return (
                                <li key={defi.id} style={{ marginBottom: 24, border: '1px solid #eee', borderRadius: 10, padding: 20, background: '#fff' }}>
                                    <h2 style={{ margin: 0, fontSize: 22 }}>{defi.nom}</h2>
                                    <div style={{ margin: '8px 0', color: '#1976d2', fontWeight: 600 }}>Durée : {max} {defi.unite}</div>
                                    <div style={{ marginBottom: 12, color: '#555' }}>Ce qu’il faut faire : <br /><span style={{ fontWeight: 500 }}>{defi.description}</span></div>
                                    <div style={{ marginBottom: 10, color: '#ff9800', fontWeight: 500 }}>Récompense : possibilité de débloquer un badge</div>
                                    <button
                                        style={{ marginTop: 10, padding: '8px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', fontWeight: 700, fontSize: 16, opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                        onClick={() => handleCommencerDefi(defi.id)}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === defi.id ? 'Démarrage...' : 'Commencer ce défi'}
                                    </button>
                                    {estDefiPersonnalise && (
                                        <button
                                            style={{ marginTop: 10, marginLeft: 10, padding: '8px 20px', borderRadius: 8, background: '#d32f2f', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', fontWeight: 600, fontSize: 16, opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                            onClick={() => {
                                                console.log('🗑️ Clic bouton Supprimer, defiId:', defi.id);
                                                handleSupprimerDefi(defi.id);
                                            }}
                                            disabled={!!actionLoading}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {tab === 'en-cours' && (
                <>
                    <p>Voici les défis que tu as commencés. Reste motivé et progresse !</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisEnCours.length === 0 && <li>Aucun défi en cours.</li>}
                        {defisEnCours.map(defi => {
                            const max = getDefiMax(defi);
                            return (
                                <li key={defi.id} style={{ marginBottom: 20, border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#f9f9f9' }}>
                                    <h2 style={{ margin: 0, fontSize: 20 }}>{defi.nom}</h2>
                                    <div style={{ marginBottom: 8, color: '#555' }}>{defi.description}</div>
                                    <div>Type : {defi.type}</div>
                                    <div>Progression : {defi.progress} / {max}</div>
                                    <div>Status : {defi.status}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>Créé le : {new Date(defi.created_at).toLocaleDateString('fr-FR')}</div>
                                    {(defi.type === 'personnalise' || defi.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi.description)) ? (
                                        <button
                                            style={{ marginTop: 10, padding: '6px 16px', borderRadius: 6, background: '#9c27b0', color: '#fff', border: 'none', cursor: 'pointer' }}
                                            onClick={() => router.push('/journal-defi/' + defi.id)}
                                        >
                                            📔 Ouvrir le journal
                                        </button>
                                    ) : (
                                        <button
                                            style={{ marginTop: 10, padding: '6px 16px', borderRadius: 6, background: '#80cbc4', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                            onClick={() => handleAccomplirEtape(defi)}
                                            disabled={!!actionLoading}
                                        >
                                            {actionLoading === defi.id ? 'Mise à jour...' : 'J\'ai accompli une étape'}
                                        </button>
                                    )}
                                    <button
                                        style={{ marginTop: 10, marginLeft: 10, padding: '6px 16px', borderRadius: 6, background: '#e57373', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                        onClick={() => handleReinitialiserDefi(defi)}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === defi.id ? 'Réinitialisation...' : 'Réinitialiser'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {tab === 'termines' && (
                <>
                    <p>Bravo pour ces défis terminés ! Tu peux en recommencer ou en choisir d’autres.</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisTermines.length === 0 && <li>Aucun défi terminé.</li>}
                        {defisTermines.map(defi => {
                            const max = getDefiMax(defi);
                            return (
                                <li key={defi.id} style={{ marginBottom: 24, border: '1px solid #eee', borderRadius: 10, padding: 20, background: '#e0ffe0' }}>
                                    <h2 style={{ margin: 0, fontSize: 22 }}>{defi.nom}</h2>
                                    <div style={{ marginBottom: 8, color: '#555' }}>{defi.description}</div>
                                    <div>Type : {defi.type}</div>
                                    <div>Progression : {defi.progress} / {max}</div>
                                    <div>Status : {defi.status}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>Créé le : {new Date(defi.created_at).toLocaleDateString('fr-FR')}</div>
                                    <div style={{ color: '#388e3c', marginTop: 10 }}>🎉 Défi complété ! Bravo !</div>
                                    <div style={{ marginTop: 10, color: '#ff9800', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>Badge débloqué !</span>
                                        <span style={{ fontSize: 24 }}>🏅</span>
                                    </div>
                                    <button
                                        style={{ marginTop: 10, padding: '6px 16px', borderRadius: 6, background: '#e57373', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                        onClick={() => handleReinitialiserDefi(defi)}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === defi.id ? 'Réinitialisation...' : 'Réinitialiser'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {tab === 'creer' && (
                <>
                    <p>Créez vos propres défis personnalisés et suivez-les au quotidien.</p>
                    <SaisieDefisDynamiques refreshDefis={synchroniserDefis} />
                </>
            )}
        </div>
    );
};

export default Defis;

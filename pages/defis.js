import SaisieDefisDynamiques from '../components/SaisieDefisDynamiques';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { defisReferentiel } from '../lib/defisReferentiel';
import { DEFIS_STATUS, getDefiMax, isDefiDisponible, isDefiEnCours, isDefiTermine } from '../lib/defisUtils';
import { useRouter } from 'next/router';

function RetourArriere() {
    return (
        <div style={{ margin: '2rem 0 1.5rem 0', textAlign: 'center' }}>
            <button onClick={() => window.history.back()} style={{
                background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer',
                boxShadow: '0 1px 6px #e0e0e0'
            }}>← Retour</button>
        </div>
    );
}

const Defis = () => {
    const [defis, setDefis] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('disponibles');
    const [actionLoading, setActionLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    const loadDefis = async () => {
        setLoading(true);
        setError(null);

        const { data: authData, error: authError } = await supabase.auth.getUser();
        const uid = authData?.user?.id;
        if (authError || !uid) {
            setError('Utilisateur non authentifié');
            setLoading(false);
            return;
        }
        setUserId(uid);

        let { data, error: loadError } = await supabase
            .from('defis')
            .select('*')
            .eq('user_id', uid);

        if (loadError) {
            setError('Erreur lors du chargement des défis');
            setLoading(false);
            return;
        }

        if (!data || data.length === 0) {
            const defisToInsert = defisReferentiel.map(defi => ({
                user_id: uid,
                type: defi.type,
                theme: defi.theme,
                nom: defi.nom,
                description: defi.description,
                duree: defi.duree,
                unite: defi.unite,
                status: DEFIS_STATUS.DISPONIBLE,
                progress: 0
            }));
            const { error: insertError } = await supabase.from('defis').insert(defisToInsert);
            if (insertError) {
                setError('Erreur lors de l\'initialisation des défis');
                setLoading(false);
                return;
            }
            const reload = await supabase.from('defis').select('*').eq('user_id', uid);
            data = reload.data || [];
        }

        for (const defi of data) {
            const ref = defisReferentiel.find(d => d.description === defi.description);
            const normalisations = {};
            if (ref && defi.nom !== ref.nom) normalisations.nom = ref.nom;
            if (defi.status === 'en attente') normalisations.status = DEFIS_STATUS.DISPONIBLE;
            if (Object.keys(normalisations).length > 0) {
                await supabase
                    .from('defis')
                    .update(normalisations)
                    .eq('id', defi.id)
                    .eq('user_id', uid);
            }
        }

        const { data: finalData, error: finalError } = await supabase
            .from('defis')
            .select('*')
            .eq('user_id', uid);
        if (finalError) setError('Erreur lors du rechargement des défis');
        else setDefis(finalData || []);
        setLoading(false);
    };

    useEffect(() => { loadDefis(); }, []);

    const handleReinitialiserDefi = async (defi) => {
        if (!userId) return;
        setActionLoading(defi.id);
        const { error: updateError } = await supabase
            .from('defis')
            .update({ progress: 0, status: DEFIS_STATUS.DISPONIBLE })
            .eq('id', defi.id)
            .eq('user_id', userId);
        if (updateError) setError('Erreur lors de la réinitialisation du défi');
        else await loadDefis();
        setActionLoading(false);
    };

    const handleSupprimerDefi = async (defiId) => {
        if (!userId || !window.confirm('Voulez-vous vraiment supprimer ce défi personnalisé ?')) return;
        setActionLoading(defiId);
        const { error: deleteError } = await supabase
            .from('defis')
            .delete()
            .eq('id', defiId)
            .eq('user_id', userId);
        if (deleteError) setError('Erreur lors de la suppression du défi');
        else await loadDefis();
        setActionLoading(false);
    };

    const handleCommencerDefi = async (defiId) => {
        if (!userId) return;
        setActionLoading(defiId);
        const defi = defis.find(d => d.id === defiId);
        const estDefiPersonnalise = defi?.type === 'personnalise' || defi?.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi?.description);

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

        if (estDefiPersonnalise) {
            setActionLoading(false);
            router.push(`/journal-defi/${defiId}`);
            return;
        }

        await loadDefis();
        setActionLoading(false);
    };

    const handleAccomplirEtape = async (defi) => {
        setActionLoading(defi.id);
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (!res.success) setError(res.error || 'Erreur lors de la progression du défi');
        else await loadDefis();
        setActionLoading(false);
    };

    if (loading) return <div>Chargement des défis...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const defisDisponibles = defis.filter(isDefiDisponible);
    const defisEnCours = defis.filter(isDefiEnCours);
    const defisTermines = defis.filter(isDefiTermine);

    return (
        <div>
            <RetourArriere />
            <h1>Mes défis</h1>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <button onClick={() => setTab('disponibles')}>Défis disponibles</button>
                <button onClick={() => setTab('en-cours')}>Défis en cours</button>
                <button onClick={() => setTab('termines')}>Défis terminés</button>
                <button onClick={() => setTab('creer')}>Créer un défi</button>
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
                                    <h2>{defi.nom}</h2>
                                    <div>Durée : {max} {defi.unite}</div>
                                    <div>{defi.description}</div>
                                    <button onClick={() => handleCommencerDefi(defi.id)} disabled={!!actionLoading}>
                                        {actionLoading === defi.id ? 'Démarrage...' : 'Commencer ce défi'}
                                    </button>
                                    {estDefiPersonnalise && (
                                        <button onClick={() => handleSupprimerDefi(defi.id)} disabled={!!actionLoading} style={{ marginLeft: 10 }}>🗑️ Supprimer</button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}

            {tab === 'en-cours' && (
                <>
                    <p>Voici les défis que tu as commencés.</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisEnCours.length === 0 && <li>Aucun défi en cours.</li>}
                        {defisEnCours.map(defi => {
                            const max = getDefiMax(defi);
                            const estDefiPersonnalise = defi.type === 'personnalise' || defi.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi.description);
                            return (
                                <li key={defi.id} style={{ marginBottom: 20, border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                                    <h2>{defi.nom}</h2>
                                    <div>{defi.description}</div>
                                    <div>Progression : {defi.progress || 0} / {max}</div>
                                    {estDefiPersonnalise ? (
                                        <button onClick={() => router.push('/journal-defi/' + defi.id)}>📔 Ouvrir le journal</button>
                                    ) : (
                                        <button onClick={() => handleAccomplirEtape(defi)} disabled={!!actionLoading}>
                                            {actionLoading === defi.id ? 'Mise à jour...' : 'J\'ai accompli une étape'}
                                        </button>
                                    )}
                                    <button onClick={() => handleReinitialiserDefi(defi)} disabled={!!actionLoading} style={{ marginLeft: 10 }}>Réinitialiser</button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}

            {tab === 'termines' && (
                <>
                    <p>Bravo pour ces défis terminés !</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisTermines.length === 0 && <li>Aucun défi terminé.</li>}
                        {defisTermines.map(defi => (
                            <li key={defi.id} style={{ marginBottom: 24, border: '1px solid #eee', borderRadius: 10, padding: 20, background: '#e0ffe0' }}>
                                <h2>{defi.nom}</h2>
                                <div>{defi.description}</div>
                                <div>Progression : {defi.progress || 0} / {getDefiMax(defi)}</div>
                                <div>🎉 Défi complété !</div>
                                <button onClick={() => handleReinitialiserDefi(defi)} disabled={!!actionLoading}>Réinitialiser</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {tab === 'creer' && (
                <>
                    <p>Créez vos propres défis personnalisés et suivez-les au quotidien.</p>
                    <SaisieDefisDynamiques refreshDefis={loadDefis} />
                </>
            )}
        </div>
    );
};

export default Defis;

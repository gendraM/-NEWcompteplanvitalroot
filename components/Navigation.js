
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import DefisEnCoursBanner from './DefisEnCoursBanner';
import StartPreparationModal from './StartPreparationModal';
import UserDebugPanel from './UserDebugPanel';



const navLinks = [
    { href: '/profil', label: 'Profil' },
    { href: '/tableau-de-bord', label: 'Tableau de bord' },
];


const Navigation = () => {
    console.log('[Navigation] Composant monté');
    const [showPseudoModal, setShowPseudoModal] = useState(false);
    useEffect(() => {
        // Log pour debug
        console.log('[Navigation] user:', user);
        console.log('[Navigation] user.user_metadata:', user?.user_metadata);
        // Correction : afficher la modale si pseudo est absent, même si user_metadata existe mais ne contient pas pseudo
        if (
            user &&
            !loading &&
            (
                !user.user_metadata ||
                typeof user.user_metadata !== 'object' ||
                !('pseudo' in user.user_metadata) ||
                !user.user_metadata.pseudo ||
                user.user_metadata.pseudo.trim() === ''
            )
        ) {
            setShowPseudoModal(true);
        }
    }, [user, loading]);
    {showPseudoModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: '2rem',
                            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
                            minWidth: 320,
                            textAlign: 'center'
                        }}>
                            <h2>Choisissez votre pseudo</h2>
                            <p>Pour personnaliser votre profil, veuillez saisir un pseudo unique.</p>
                            <PseudoForm onClose={() => setShowPseudoModal(false)} />
                        </div>
                    </div>
                )}
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const { user, loading } = useAuth();

    // Affichage dynamique du nom/prénom/email utilisateur connecté
    // Affichage du pseudo utilisateur uniquement
    let displayPseudo = '';
    if (user) {
        displayPseudo = user.user_metadata?.pseudo || '';
    }

    // Handler pour la validation de la modale
    const handleStartPreparation = (data) => {
        // Redirection avec passage des infos en query string (simple)
        const params = new URLSearchParams({
            startDate: data.startDate,
            duration: data.duration,
            goal: data.goal,
        });
        router.push(`/preparation-jeune.js?${params.toString()}`);
    };

    // Handler de déconnexion avec feedback
    const [logoutMessage, setLogoutMessage] = useState('');
    const handleLogout = async () => {
        const { supabase } = await import('../lib/supabaseClient');
        console.log('[Navigation] Début handleLogout, user:', user);
        await supabase.auth.signOut();
        console.log('[Navigation] Après signOut, user:', user);
        setLogoutMessage('Déconnexion réussie.');
        setTimeout(() => {
            setLogoutMessage('');
            window.location.href = '/login';
        }, 1200);
    };

    return (
        <>
            <nav
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 16px 0 rgba(79,143,255,0.07)',
                    border: '1px solid #E3EAF2',
                    padding: '18px 0',
                    margin: '24px auto 32px auto',
                    maxWidth: 900,
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                }}
                aria-label="Navigation principale"
            >
                {/* Affichage du pseudo utilisateur connecté */}
                {!loading && user && displayPseudo && (
                    <div style={{
                        position: 'absolute',
                        right: 32,
                        top: 18,
                        color: '#34495e',
                        fontWeight: 600,
                        fontSize: '1.05em',
                        background: '#f5f8fa',
                        borderRadius: 8,
                        padding: '6px 16px',
                        boxShadow: '0 1px 4px #e0e0e0',
                        zIndex: 2
                    }}>
                        {displayPseudo}
                    </div>
                )}
                <ul
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '18px 32px',
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        alignItems: 'center',
                    }}
                >
                    {navLinks.map(link => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                style={{
                                    color: '#4F8FFF',
                                    fontWeight: 700,
                                    fontSize: '1.08em',
                                    textDecoration: 'none',
                                    padding: '7px 16px',
                                    borderRadius: 8,
                                    transition: 'background 0.18s, color 0.18s',
                                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                                    display: 'inline-block',
                                }}
                                onMouseOver={e => {
                                    e.target.style.background = '#F5F8FA';
                                    e.target.style.color = '#1976d2';
                                }}
                                onMouseOut={e => {
                                    e.target.style.background = 'none';
                                    e.target.style.color = '#4F8FFF';
                                }}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button
                            style={{
                                background: '#4F8FFF',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '1.08em',
                                border: 'none',
                                borderRadius: 8,
                                padding: '7px 16px',
                                cursor: 'pointer',
                                fontFamily: 'Inter, Roboto, Arial, sans-serif',
                                marginLeft: 8,
                                boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                                transition: 'background 0.18s, color 0.18s',
                            }}
                            onClick={() => setShowModal(true)}
                        >
                            Me préparer à jeûner
                        </button>
                    </li>
                    <li>
                        {!loading && user ? (
                            <button
                                style={{
                                    background: '#fff',
                                    color: '#4F8FFF',
                                    fontWeight: 700,
                                    fontSize: '1.08em',
                                    border: '1px solid #4F8FFF',
                                    borderRadius: 8,
                                    padding: '7px 16px',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                                    marginLeft: 8,
                                    boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                                    transition: 'background 0.18s, color 0.18s',
                                }}
                                onClick={handleLogout}
                            >
                                Se déconnecter
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                style={{
                                    background: '#fff',
                                    color: '#4F8FFF',
                                    fontWeight: 700,
                                    fontSize: '1.08em',
                                    border: '1px solid #4F8FFF',
                                    borderRadius: 8,
                                    padding: '7px 16px',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                                    marginLeft: 8,
                                    boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                                    transition: 'background 0.18s, color 0.18s',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                }}
                            >
                                Se connecter
                            </Link>
                        )}
                        {logoutMessage && (
                            <span style={{ color: '#1976d2', marginLeft: 12, fontWeight: 500 }}>{logoutMessage}</span>
                        )}
                    </li>
                </ul>
            </nav>
            <StartPreparationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleStartPreparation}
            />
            <DefisEnCoursBanner />
            <UserDebugPanel />
        </>
    );
};

export default Navigation;
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PseudoForm({ onClose }) {
    const { user, refreshUserSession } = useAuth();
    const [pseudo, setPseudo] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (!pseudo.trim()) {
            setError('Le pseudo est obligatoire');
            setLoading(false);
            return;
        }
        try {
            const { supabase } = await import('../lib/supabaseClient');
            const { error: updateError } = await supabase.auth.updateUser({
                data: { ...user.user_metadata, pseudo }
            });
            if (updateError) {
                setError(updateError.message || 'Erreur lors de la mise à jour');
            } else {
                // Synchroniser le contexte sans reload global
                await refreshUserSession();
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1200);
            }
        } catch (err) {
            setError('Erreur inattendue');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input
                type="text"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                placeholder="Votre pseudo"
                style={{ padding: '0.75rem 1rem', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: '1rem' }}
                disabled={loading}
                autoFocus
            />
            {error && <div style={{ color: '#c33', fontSize: '0.95rem' }}>{error}</div>}
            {success && <div style={{ color: '#27ae60', fontSize: '0.95rem' }}>Pseudo enregistré !</div>}
            <button
                type="submit"
                style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={loading}
            >
                {loading ? 'Enregistrement...' : 'Valider mon pseudo'}
            </button>
        </form>
    );
}
import { useAuth } from '../contexts/AuthContext';

export default function UserDebugPanel() {
    const { user, session, loading } = useAuth();
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            background: '#fff',
            border: '2px solid #667eea',
            borderRadius: '12px 0 0 0',
            padding: '1rem 2rem',
            boxShadow: '0 2px 12px rgba(102,126,234,0.15)',
            zIndex: 9999,
            fontSize: '0.95rem',
            color: '#34495e',
            minWidth: 320
        }}>
            <h3 style={{marginTop:0, color:'#667eea'}}>Debug Utilisateur</h3>
            <div><strong>Chargement :</strong> {loading ? 'Oui' : 'Non'}</div>
            <div><strong>Session :</strong> {session ? 'Active' : 'Aucune'}</div>
            <div><strong>User ID :</strong> {user?.id || 'null'}</div>
            <div><strong>Pseudo :</strong> {user?.user_metadata?.pseudo || 'non défini'}</div>
            <div><strong>Email :</strong> {user?.email || 'non défini'}</div>
            <div><strong>Connecté :</strong> {user ? 'Oui' : 'Non'}</div>
        </div>
    );
}

/**
 * BANDEAU COMPLETION PROFIL
 * Affiché pour utilisateurs existants avec profil incomplet
 * (sexe ou niveau_activite manquants)
 * Phase 0 : Migration utilisateurs existants
 */

import Link from 'next/link';

export default function BandeauCompletionProfil({ onClose }) {
  const styles = {
    bandeau: {
      background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 100%)',
      color: '#fff',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    message: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '1rem',
      fontWeight: '500'
    },
    icon: {
      fontSize: '1.5rem'
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    button: {
      background: '#fff',
      color: '#3498db',
      border: 'none',
      borderRadius: 20,
      padding: '0.5rem 1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.95rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s'
    },
    closeButton: {
      background: 'transparent',
      color: '#fff',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.25rem 0.5rem',
      opacity: 0.8,
      transition: 'opacity 0.2s'
    }
  };

  return (
    <div style={styles.bandeau}>
      <div style={styles.message}>
        <span style={styles.icon}>🎯</span>
        <span>
          <strong>Nouvelles fonctionnalités disponibles !</strong> 
          <br />
          Complétez votre profil pour des recommandations personnalisées (budget extras, calculs métaboliques)
        </span>
      </div>
      <div style={styles.actions}>
        <Link href="/profil">
          <button 
            style={styles.button}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Compléter mon profil →
          </button>
        </Link>
        <button 
          style={styles.closeButton}
          onClick={onClose}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
          title="Masquer (réapparaîtra au prochain démarrage)"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

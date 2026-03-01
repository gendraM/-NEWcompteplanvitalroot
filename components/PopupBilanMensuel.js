import React from 'react';

/**
 * Pop-up notification bilan mensuel disponible
 * Affiché après validation de la dernière semaine du mois
 */
export default function PopupBilanMensuel({ 
  isOpen, 
  mois, 
  annee, 
  onClose, 
  onVoirBilan 
}) {
  if (!isOpen) return null;

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const nomMois = moisNoms[mois - 1] || 'Mois inconnu';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 20,
          padding: '32px 24px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          color: '#fff',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 20,
            color: '#fff',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          aria-label="Fermer"
        >
          ×
        </button>

        {/* Icône */}
        <div
          style={{
            fontSize: 64,
            marginBottom: 16,
            animation: 'bounce 1s ease-in-out',
          }}
        >
          🎉
        </div>

        {/* Titre */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: '0 0 12px 0',
            lineHeight: 1.3,
          }}
        >
          Bilan mensuel disponible !
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            margin: '0 0 24px 0',
            opacity: 0.95,
          }}
        >
          <strong>{nomMois} {annee}</strong> est terminé.
          <br />
          Découvrez votre bilan mensuel complet !
        </p>

        {/* Boutons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={onVoirBilan}
            style={{
              background: '#fff',
              color: '#667eea',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            📊 Voir mon bilan mensuel
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#fff',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)'}
            onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'}
          >
            Plus tard
          </button>
        </div>

        {/* Animation CSS */}
        <style jsx>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

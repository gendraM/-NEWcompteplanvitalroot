import React, { useState, useEffect } from 'react';

/**
 * Composant Journal de Ressenti quotidien
 * S'intègre avec le système de validation existant
 * Stockage localStorage compatible avec l'architecture actuelle
 */
export default function JournalRessenti({ 
  jourNum, 
  phase, 
  date, 
  repriseMode = 'production',
  onRessentiSauve 
}) {
  const [ressenti, setRessenti] = useState({
    energie: '',
    digestion: '',
    sommeil: '',
    humeur: '',
    signaux_corps: [],
    notes_libres: ''
  });
  
  const [sauvegarde, setSauvegarde] = useState(false);

  // Critères selon documentation Phase 1
  const signauxDisponibles = {
    positifs: [
      'Chaleur dans le ventre',
      'Appétit doux',
      'Digestion sans douleur', 
      'Énergie stable',
      'Relaxation',
      'Gargouillements normaux'
    ],
    alertes: [
      'Diarrhée',
      'Nausées',
      'Crampes',
      'Lourdeurs',
      'Fatigue intense',
      'Douleurs abdominales'
    ]
  };

  // Chargement du ressenti existant au mount
  useEffect(() => {
    const cleRessenti = repriseMode === 'test' 
      ? 'test_reprise_ressenti' 
      : 'reprise_ressenti';
    
    const ressentisSauves = JSON.parse(localStorage.getItem(cleRessenti) || '[]');
    const ressentiJour = ressentisSauves.find(r => 
      r.jour_numero === jourNum && 
      r.phase === phase &&
      r.date === date
    );
    
    if (ressentiJour) {
      setRessenti(ressentiJour.ressenti);
      setSauvegarde(true);
    }
  }, [jourNum, phase, date, repriseMode]);

  const sauvegarderRessenti = () => {
    const cleRessenti = repriseMode === 'test' 
      ? 'test_reprise_ressenti' 
      : 'reprise_ressenti';
    
    const ressentisSauves = JSON.parse(localStorage.getItem(cleRessenti) || '[]');
    
    // Supprimer ressenti existant pour ce jour
    const ressentisFiltrés = ressentisSauves.filter(r => 
      !(r.jour_numero === jourNum && r.phase === phase && r.date === date)
    );
    
    // Ajouter nouveau ressenti
    ressentisFiltrés.push({
      jour_numero: jourNum,
      phase: phase,
      date: date,
      ressenti: ressenti,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(cleRessenti, JSON.stringify(ressentisFiltrés));
    setSauvegarde(true);
    
    // Callback pour intégration avec système validation
    if (onRessentiSauve) {
      onRessentiSauve({
        jourNum,
        phase,
        ressenti,
        hasAlerts: ressenti.signaux_corps.some(s => signauxDisponibles.alertes.includes(s))
      });
    }
  };

  const toggleSignal = (signal) => {
    setRessenti(prev => ({
      ...prev,
      signaux_corps: prev.signaux_corps.includes(signal)
        ? prev.signaux_corps.filter(s => s !== signal)
        : [...prev.signaux_corps, signal]
    }));
    setSauvegarde(false);
  };

  const signauxAlertes = ressenti.signaux_corps.filter(s => 
    signauxDisponibles.alertes.includes(s)
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)',
      borderRadius: 12,
      padding: '1.2rem',
      marginBottom: '1rem',
      border: '1px solid #9c27b0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#6a1b9a'
      }}>
        📝 Journal de Ressenti - Phase {phase} J{jourNum}
        {sauvegarde && <span style={{ color: '#4caf50', fontSize: '1rem' }}>✅</span>}
      </div>

      {/* Échelles rapides */}
      <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '1rem' }}>
        {['energie', 'digestion', 'sommeil', 'humeur'].map(critere => (
          <div key={critere} style={{
            padding: '0.6rem',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: 8,
            border: '1px solid #e0e0e0'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#333',
              textTransform: 'capitalize'
            }}>
              {critere.replace('_', ' ')}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['😞', '😐', '🙂', '😊', '🤩'].map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRessenti(prev => ({ ...prev, [critere]: emoji }));
                    setSauvegarde(false);
                  }}
                  style={{
                    fontSize: '1.5rem',
                    border: ressenti[critere] === emoji ? '2px solid #9c27b0' : '1px solid #ddd',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    backgroundColor: ressenti[critere] === emoji ? '#f3e5f5' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Signaux corps */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '0.6rem',
          color: '#333'
        }}>
          Signaux de ton corps (clique pour sélectionner)
        </label>
        
        <div style={{ marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#4caf50', fontWeight: 600, marginBottom: '0.3rem' }}>
            ✅ Signaux positifs
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {signauxDisponibles.positifs.map(signal => (
              <button
                key={signal}
                onClick={() => toggleSignal(signal)}
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.8rem',
                  border: ressenti.signaux_corps.includes(signal) ? '2px solid #4caf50' : '1px solid #ddd',
                  borderRadius: 16,
                  backgroundColor: ressenti.signaux_corps.includes(signal) ? '#e8f5e8' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {signal}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', color: '#f44336', fontWeight: 600, marginBottom: '0.3rem' }}>
            ⚠️ Signaux d'alerte
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {signauxDisponibles.alertes.map(signal => (
              <button
                key={signal}
                onClick={() => toggleSignal(signal)}
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.8rem',
                  border: ressenti.signaux_corps.includes(signal) ? '2px solid #f44336' : '1px solid #ddd',
                  borderRadius: 16,
                  backgroundColor: ressenti.signaux_corps.includes(signal) ? '#ffebee' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {signal}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes libres */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '0.4rem',
          color: '#333'
        }}>
          Notes libres (optionnel)
        </label>
        <textarea
          value={ressenti.notes_libres}
          onChange={(e) => {
            setRessenti(prev => ({ ...prev, notes_libres: e.target.value }));
            setSauvegarde(false);
          }}
          placeholder="Comment te sens-tu aujourd'hui ? Observations particulières..."
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '0.6rem',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            resize: 'vertical',
            backgroundColor: 'rgba(255,255,255,0.8)'
          }}
        />
      </div>

      {/* Alertes automatiques */}
      {signauxAlertes.length > 0 && (
        <div style={{
          padding: '0.8rem',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: 8,
          marginBottom: '1rem'
        }}>
          <div style={{ color: '#d32f2f', fontWeight: 600, marginBottom: '0.4rem' }}>
            ⚠️ Signaux d'alerte détectés
          </div>
          <div style={{ fontSize: '0.85rem', color: '#d32f2f' }}>
            {signauxAlertes.join(', ')} - Signifie que tu vas peut-être trop vite. 
            Reviens aux liquides uniquement et consulte si ça persiste.
          </div>
        </div>
      )}

      {/* Bouton sauvegarde */}
      <button
        onClick={sauvegarderRessenti}
        disabled={sauvegarde}
        style={{
          width: '100%',
          padding: '0.8rem',
          backgroundColor: sauvegarde ? '#4caf50' : '#9c27b0',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: '1rem',
          fontWeight: 600,
          cursor: sauvegarde ? 'default' : 'pointer',
          transition: 'all 0.3s',
          opacity: sauvegarde ? 0.7 : 1
        }}
      >
        {sauvegarde ? '✅ Ressenti sauvegardé' : '💾 Sauvegarder mon ressenti'}
      </button>
    </div>
  );
}
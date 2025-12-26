/**
 * 🔔 NOTIFICATIONS DOUCES - PHASE 4
 * Système de notifications discrètes pour respecter les horaires Phase 4
 * Architecture identique à NotificationsPhase2.js (succès éprouvé)
 * Horaires Phase 4 : Féculents doux (J11+) - MIDI UNIQUEMENT
 */

import { useState } from 'react';

export default function NotificationsPhase4({ jourNum, onRecettesClick }) {
  // Horaires Phase 4 - Féculents doux (J11+)
  const horairesPhase4 = [
    { 
      heure: '08:00', 
      label: '8h', 
      aliment: 'Flocons d\'avoine cuits', 
      quantite: '2 CS dans lait végétal', 
      type: 'matin' 
    },
    { 
      heure: '11:00', 
      label: '11h', 
      aliment: 'Fruit frais mûr', 
      quantite: '1/2 banane OU 1 pomme', 
      type: 'matinee' 
    },
    { 
      heure: '13:00', 
      label: '13h MIDI', 
      aliment: 'FÉCULENT DOUX', 
      quantite: 'Patate douce 80g OU riz complet 1,5 CS OU quinoa 1,5 CS', 
      type: 'midi',
      important: true 
    },
    { 
      heure: '16:00', 
      label: '16h', 
      aliment: 'Lentilles corail mixées', 
      quantite: '2 CS bien cuites', 
      type: 'aprem' 
    },
    { 
      heure: '19:00', 
      label: '19h', 
      aliment: 'Légumes + protéines végétales', 
      quantite: 'Éviter féculents le soir', 
      type: 'soir' 
    }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.3)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🍠</span>
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#fff'
            }}>
              Phase 4 - Féculents doux
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.9)',
              marginTop: '2px'
            }}>
              Jour {jourNum} • Sortie progressive de la cétose
            </div>
          </div>
        </div>
        {onRecettesClick && (
          <button
            onClick={onRecettesClick}
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.4)',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.35)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.25)';
            }}
          >
            📖 Voir les recettes
          </button>
        )}
      </div>

      {/* Message MIDI UNIQUEMENT */}
      <div style={{
        background: 'rgba(230, 81, 0, 0.3)',
        border: '2px solid rgba(230, 81, 0, 0.5)',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '14px',
        color: '#fff'
      }}>
        <div style={{
          fontWeight: 700,
          marginBottom: '4px',
          fontSize: '0.95rem'
        }}>
          ⚠️ Règle importante Phase 4
        </div>
        <div style={{
          fontSize: '0.85rem',
          lineHeight: '1.3'
        }}>
          Les <strong>FÉCULENTS</strong> (patate douce, riz, quinoa, pain) sont autorisés <strong>UNIQUEMENT À MIDI</strong> (13h).
          <br/>Exception : Flocons d'avoine le matin, lentilles corail mixées l'après-midi.
        </div>
      </div>

      {/* Horaires */}
      <div style={{
        display: 'grid',
        gap: '8px'
      }}>
        {horairesPhase4.map((horaire, idx) => (
          <div
            key={idx}
            style={{
              background: horaire.important 
                ? 'rgba(230, 81, 0, 0.25)' 
                : 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '10px 12px',
              border: horaire.important 
                ? '2px solid rgba(230, 81, 0, 0.6)' 
                : '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <div style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#fff',
              minWidth: '70px'
            }}>
              {horaire.label}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 600,
                color: '#fff',
                marginBottom: '2px',
                fontSize: '0.9rem'
              }}>
                {horaire.aliment}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.3'
              }}>
                {horaire.quantite}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note finale */}
      <div style={{
        marginTop: '12px',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        💡 Réintroduction progressive des glucides • Portions mesurées • Bien mastiquer
      </div>
    </div>
  );
}

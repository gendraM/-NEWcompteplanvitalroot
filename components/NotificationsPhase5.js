/**
 * 🔔 Notifications Phase 5 — Alimentation normale contrôlée
 * 5 horaires clés par jour (8h, 11h, 13h MIDI important, 16h, 19h)
 * Couleur : Vert clair (#10B981/#34D399) — gradient cohérent Phase 3
 * Pattern identique à NotificationsPhase4.js (prouvé stable)
 */

import { useState, useEffect } from 'react';

const NotificationsPhase5 = ({ jourNum, onRecettesClick }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !jourNum) return <></>;

  // 5 horaires clés Phase 5
  const horairesPhase5 = [
    {
      heure: '08:00',
      label: '8h',
      aliment: '🍎 Fruit frais',
      quantite: '200g (pomme, poire, banane, raisin)',
      type: 'matin',
      conseil: 'Démarrer digestion avec fibres + vitamines'
    },
    {
      heure: '11:00',
      label: '11h',
      aliment: '🥛 Collation légère',
      quantite: '100ml lait fermenté OU 30g yaourt 0% OU 25g fromage blanc',
      type: 'collation',
      conseil: 'Protéines + calcium pour fixation'
    },
    {
      heure: '13:00',
      label: '13h',
      aliment: '🥗 Assiette équilibrée MIDI',
      quantite: '50% légumes + 25% protéine + 25% glucides',
      type: 'midi',
      important: true,
      conseil: '★★★ ESSENTIEL — Plus gros repas Phase 5'
    },
    {
      heure: '16:00',
      label: '16h',
      aliment: '🥜 Collation',
      quantite: '15g fruits secs OU 30g pain complet + fromage OU 150ml lait',
      type: 'collation',
      conseil: 'Énergie soutenue fin après-midi'
    },
    {
      heure: '19:00',
      label: '19h',
      aliment: '🍽️ Repas léger SOIR',
      quantite: '50% légumes + 20% protéine légère + 30% féculents légers',
      type: 'soir',
      important: true,
      conseil: 'Protéines + féculents — facile à digérer'
    }
  ];

  return (
    <div style={{ marginTop: '16px', padding: '12px', background: '#f0f9f7', borderRadius: '8px' }}>
      {/* Titre Phase 5 */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#10B981', fontSize: '1.1rem' }}>
          📅 Jour {jourNum} — Phase 5 : Alimentation contrôlée
        </h3>
        <p style={{ margin: '0', fontSize: '0.85rem', color: '#047857', fontWeight: 500 }}>
          50% légumes • 25% protéines • 25% glucides complexes
        </p>
      </div>

      {/* Horaires */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {horairesPhase5.map((h, idx) => (
          <div
            key={idx}
            style={{
              background: h.important ? '#e0f7f4' : 'white',
              border: h.important ? '2px solid #10B981' : '1px solid #d0e8e3',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '0.85rem'
            }}
          >
            {/* Heure + label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <strong style={{ color: '#10B981' }}>
                {h.label}
                {h.important && ' ⭐'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>{h.heure}</span>
            </div>

            {/* Aliment */}
            <div style={{ color: '#333', marginBottom: '4px', fontWeight: 500 }}>
              {h.aliment}
            </div>

            {/* Quantité */}
            <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '6px', lineHeight: '1.3' }}>
              {h.quantite}
            </div>

            {/* Conseil */}
            <div style={{ color: '#047857', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '6px' }}>
              💡 {h.conseil}
            </div>

            {/* Bouton recettes pour MIDI/SOIR */}
            {(h.type === 'midi' || h.type === 'soir') && (
              <button
                onClick={() => onRecettesClick('saumon')}
                style={{
                  background: 'linear-gradient(135deg, #10B981, #34D399)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
              >
                🥘 Voir recettes
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Message équilibre Phase 5 */}
      <div
        style={{
          marginTop: '12px',
          background: '#10B981',
          color: 'white',
          borderRadius: '6px',
          padding: '10px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 500
        }}
      >
        ✨ Phase 5 = Alimentation normale contrôlée • Ratio : 50% 🥗 légumes / 25% 🍗 protéines / 25% 🍚 glucides
      </div>
    </div>
  );
};

export default NotificationsPhase5;

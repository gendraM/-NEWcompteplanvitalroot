import { useEffect } from 'react';

export default function ExtrasBadgeCelebrationModal({ badge, open, onClose }) {
  useEffect(() => {
    if (!open || !badge) return;
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.65 } });
    });
  }, [open, badge]);

  if (!open || !badge) return null;
  const palier = badge.details?.palier_atteint;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="extras-badge-title" style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(20,24,22,.58)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 12 }}>
      <section style={{ width: '100%', maxWidth: 460, background: '#fffdf8', color: '#29332e', borderRadius: 24, padding: '1.5rem 1.2rem 1rem', textAlign: 'center', boxShadow: '0 -8px 35px rgba(0,0,0,.22)' }}>
        <div aria-hidden="true" style={{ width: 88, height: 88, margin: '0 auto', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#dbe9dc', border: '7px solid #f1c868', fontSize: 36 }}>✦</div>
        <div style={{ marginTop: 12, color: '#6d765f', fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>Nouveau badge obtenu</div>
        <h2 id="extras-badge-title" style={{ margin: '.35rem 0', fontSize: 22 }}>{badge.nom}</h2>
        <p style={{ margin: '0 0 1rem', lineHeight: 1.5 }}>Tu as créé un rythme plus aligné avec ton objectif.<br /><strong>Palier {palier} atteint</strong></p>
        <button type="button" onClick={onClose} style={{ width: '100%', border: 0, borderRadius: 12, padding: '.8rem 1rem', background: '#456f52', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Continuer</button>
        <div style={{ marginTop: 9, color: '#68736c', fontSize: 12 }}>Le badge est conservé automatiquement dans ton tableau de bord.</div>
      </section>
    </div>
  );
}

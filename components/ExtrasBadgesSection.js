import { useState } from 'react';

const dateFr = value => value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date non disponible';
function periodeSemaine(weekStart) {
  if (!weekStart) return 'Semaine non disponible';
  const debut = new Date(`${weekStart}T12:00:00`);
  const fin = new Date(debut); fin.setDate(debut.getDate() + 6);
  return `${debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

export default function ExtrasBadgesSection({ badges = [] }) {
  const [selection, setSelection] = useState(null);
  if (!badges.length) return null;
  return (
    <section style={{ padding: '1.5rem', background: '#fafafa', borderRadius: 15, boxShadow: '0 2px 8px #e0e0e0', margin: '2rem 0' }}>
      <h2 style={{ marginTop: 0, color: '#6d4c9f', textAlign: 'center' }}>Mon chemin · Extras</h2>
      <p style={{ color: '#68736c', textAlign: 'center' }}>Les étapes que tu as déjà construites restent visibles ici.</p>
      <div style={{ display: 'grid', gap: 12 }}>
        {badges.map(badge => <button key={badge.id || badge.code} type="button" onClick={() => setSelection(badge)} style={{ width: '100%', border: 0, background: '#fff', color: '#29332e', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px #e0e0e0', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer' }}>
          <span aria-hidden="true" style={{ flex: '0 0 60px', width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#dbe9dc', border: '5px solid #f1c868', fontSize: 25 }}>✦</span>
          <span><strong>{badge.nom}</strong><span style={{ display: 'block', color: '#68736c', fontSize: 13, marginTop: 4 }}>Obtenu le {dateFr(badge.date_obtention)}</span><span style={{ display: 'block', color: '#456f52', fontSize: 13, marginTop: 4 }}>Palier {badge.details?.palier_atteint} atteint · Voir le détail</span></span>
          <span aria-hidden="true" style={{ marginLeft: 'auto', fontSize: 22 }}>›</span>
        </button>)}
      </div>
      {selection && <BadgeDetail badge={selection} onClose={() => setSelection(null)} />}
    </section>
  );
}

function BadgeDetail({ badge, onClose }) {
  const semaines = badge.details?.semaines || [];
  const decisive = semaines[semaines.length - 1];
  return <div role="dialog" aria-modal="true" aria-labelledby="badge-detail-title" style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(20,24,22,.58)', display: 'grid', placeItems: 'center', padding: 12 }}>
    <section style={{ width: '100%', maxWidth: 470, maxHeight: '88vh', overflowY: 'auto', boxSizing: 'border-box', background: '#fffdf8', color: '#29332e', borderRadius: 24, padding: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 id="badge-detail-title" style={{ margin: 0, fontSize: 19 }}>Détail du badge</h2><button type="button" aria-label="Fermer le détail" onClick={onClose} style={{ border: 0, background: 'transparent', color: '#29332e', fontSize: 24, cursor: 'pointer' }}>×</button></div>
      <div style={{ textAlign: 'center', padding: '.7rem 0 1rem' }}><div aria-hidden="true" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#dbe9dc', border: '6px solid #f1c868', fontSize: 30 }}>✦</div><h3 style={{ margin: '.7rem 0 .2rem' }}>{badge.nom}</h3><div style={{ color: '#68736c', fontSize: 13 }}>Obtenu le {dateFr(badge.date_obtention)} · Palier {badge.details?.palier_atteint} atteint</div></div>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px #e0e0e0' }}><strong>Ce qui t’a permis de l’obtenir</strong><p>✓ {badge.details?.semaines_requises} semaines validées dans la direction de ton palier {badge.details?.palier_depart}</p><p>✓ Moments d’extra respectés chaque semaine prise en compte</p><p style={{ marginBottom: 0 }}>✓ Budget calorique respecté chaque semaine prise en compte</p></div>
      <h3 style={{ fontSize: 16, marginBottom: 6 }}>Les semaines qui ont construit ce cap</h3>
      {semaines.map(semaine => <div key={semaine.weekStart} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '.65rem 0', borderBottom: '1px solid #dde3de', fontSize: 13 }}><span>{periodeSemaine(semaine.weekStart)}</span><span style={{ color: '#497456', whiteSpace: 'nowrap' }}>Validée ✓</span></div>)}
      {decisive && <div style={{ marginTop: 14, padding: 13, borderRadius: 13, background: '#eeece5', fontSize: 13, lineHeight: 1.45 }}><strong>Semaine décisive :</strong> {decisive.extrasCount} moments sur {badge.details.palier_depart} · {decisive.kcalExtras} kcal sur {decisive.budgetExtras}. Les deux repères ont été respectés.</div>}
    </section>
  </div>;
}

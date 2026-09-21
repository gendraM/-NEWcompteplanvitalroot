import { useState } from 'react';
import { calculerMeilleureConstanceExtras } from '../lib/extrasProgression';

const dateFr = value => value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date non disponible';
function periodeSemaine(weekStart) {
  if (!weekStart) return 'Semaine non disponible';
  const debut = new Date(`${weekStart}T12:00:00`);
  if (Number.isNaN(debut.getTime())) return 'Semaine non disponible';
  const fin = new Date(debut); fin.setDate(debut.getDate() + 6);
  return `${debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

function lireDetails(details) {
  if (!details) return {};
  if (typeof details === 'object') return details;
  if (typeof details !== 'string') return {};
  try {
    const resultat = JSON.parse(details);
    return resultat && typeof resultat === 'object' ? resultat : {};
  } catch {
    return {};
  }
}

export default function ExtrasBadgesSection({ badges = [], events = [], semaines = [] }) {
  const [selection, setSelection] = useState(null);
  const badgesSurs = Array.isArray(badges) ? badges : [];
  const evenementsSurs = Array.isArray(events) ? events : [];
  if (!badgesSurs.length) return null;
  return (
    <section style={{ padding: '1.5rem', background: '#fafafa', borderRadius: 15, boxShadow: '0 2px 8px #e0e0e0', margin: '2rem 0' }}>
      <h2 style={{ marginTop: 0, color: '#6d4c9f', textAlign: 'center' }}>Mon chemin · Extras</h2>
      <p style={{ color: '#68736c', textAlign: 'center' }}>Les étapes que tu as déjà construites restent visibles ici.</p>
      <div style={{ display: 'grid', gap: 12 }}>
        {badgesSurs.map(badge => {
          const details = lireDetails(badge?.details);
          const palier = Number(details.palier_atteint);
          const retours = evenementsSurs.filter(event => event?.type === 'reached_again' && Number(event?.palier_arrivee) === palier);
          const dernierRetour = retours[retours.length - 1];
          return <button key={badge.id || badge.code} type="button" onClick={() => setSelection(badge)} style={{ width: '100%', border: 0, background: '#fff', color: '#29332e', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px #e0e0e0', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer' }}>
            <span aria-hidden="true" style={{ flex: '0 0 60px', width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#dbe9dc', border: '5px solid #f1c868', fontSize: 25 }}>✦</span>
            <span>
              <strong>{badge.nom}</strong>
              <span style={{ display: 'block', color: '#68736c', fontSize: 13, marginTop: 4 }}>Obtenu le {dateFr(badge.date_obtention)}</span>
              {dernierRetour && <span style={{ display: 'block', color: '#6d4c9f', fontSize: 13, marginTop: 4 }}>Rythme retrouvé le {dateFr(dernierRetour.semaine_decisive)} · {retours.length} retour{retours.length > 1 ? 's' : ''}</span>}
              <span style={{ display: 'block', color: '#456f52', fontSize: 13, marginTop: 4 }}>Palier {palier} atteint · Voir le détail</span>
            </span>
            <span aria-hidden="true" style={{ marginLeft: 'auto', fontSize: 22 }}>›</span>
          </button>;
        })}
      </div>
      {selection && <BadgeDetail badge={selection} events={evenementsSurs} semaines={semaines} onClose={() => setSelection(null)} />}
    </section>
  );
}

function BadgeDetail({ badge, events, semaines: semainesValidees, onClose }) {
  const details = lireDetails(badge?.details);
  const semainesBadge = Array.isArray(details.semaines) ? details.semaines : [];
  const decisive = semainesBadge[semainesBadge.length - 1];
  const palier = Number(details.palier_atteint);
  const retours = events.filter(event => event.type === 'reached_again' && Number(event.palier_arrivee) === palier);
  const adaptations = events.filter(event => event.type === 'adapted_up' && Number(event.palier_depart) === palier);
  const debutDuRythme = details.semaine_decisive || semainesBadge[semainesBadge.length - 1]?.weekStart || null;
  const meilleureConstance = calculerMeilleureConstanceExtras(semainesValidees, palier, debutDuRythme);
  return <div role="dialog" aria-modal="true" aria-labelledby="badge-detail-title" style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(20,24,22,.58)', display: 'grid', placeItems: 'center', padding: 12 }}>
    <section style={{ width: '100%', maxWidth: 470, maxHeight: '88vh', overflowY: 'auto', boxSizing: 'border-box', background: '#fffdf8', color: '#29332e', borderRadius: 24, padding: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 id="badge-detail-title" style={{ margin: 0, fontSize: 19 }}>Détail du badge</h2><button type="button" aria-label="Fermer le détail" onClick={onClose} style={{ border: 0, background: 'transparent', color: '#29332e', fontSize: 24, cursor: 'pointer' }}>×</button></div>
      <div style={{ textAlign: 'center', padding: '.7rem 0 1rem' }}><div aria-hidden="true" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#dbe9dc', border: '6px solid #f1c868', fontSize: 30 }}>✦</div><h3 style={{ margin: '.7rem 0 .2rem' }}>{badge.nom}</h3><div style={{ color: '#68736c', fontSize: 13 }}>Obtenu le {dateFr(badge.date_obtention)} · Palier {details.palier_atteint} atteint</div></div>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px #e0e0e0' }}><strong>Ce qui t’a permis de l’obtenir</strong><p>✓ {details.semaines_requises} semaines validées dans la direction de ton palier {details.palier_depart}</p><p>✓ Moments d’extra respectés chaque semaine prise en compte</p><p style={{ marginBottom: 0 }}>✓ Budget calorique respecté chaque semaine prise en compte</p></div>
      <h3 style={{ fontSize: 16, marginBottom: 6 }}>Les semaines qui ont construit ce cap</h3>
      {semainesBadge.map(semaine => <div key={semaine.weekStart} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '.65rem 0', borderBottom: '1px solid #dde3de', fontSize: 13 }}><span>{periodeSemaine(semaine.weekStart)}</span><span style={{ color: '#497456', whiteSpace: 'nowrap' }}>Validée ✓</span></div>)}
      {decisive && <div style={{ marginTop: 14, padding: 13, borderRadius: 13, background: '#eeece5', fontSize: 13, lineHeight: 1.45 }}><strong>Semaine décisive :</strong> {decisive.extrasCount} moments sur {details.palier_depart} · {decisive.kcalExtras} kcal sur {decisive.budgetExtras}. Les deux repères ont été respectés.</div>}
      <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: '#eef5ef', fontSize: 13, lineHeight: 1.5 }}>
        <strong>Meilleure période de constance</strong>
        {meilleureConstance ? (
          <p style={{ marginBottom: 0 }}>
            {meilleureConstance.nombreSemaines} semaine{meilleureConstance.nombreSemaines > 1 ? 's' : ''} consécutive{meilleureConstance.nombreSemaines > 1 ? 's' : ''}, du {dateFr(meilleureConstance.debut)} au {dateFr(meilleureConstance.fin)}.
          </p>
        ) : (
          <p style={{ marginBottom: 0 }}>Cette période se construira avec les prochaines semaines fiables dans ce rythme.</p>
        )}
      </div>
      {(retours.length > 0 || adaptations.length > 0) && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: '#f3eff8', fontSize: 13, lineHeight: 1.5 }}>
          <strong>La suite de ton chemin</strong>
          {adaptations.map(event => <p key={event.id || `adapt-${event.semaine_decisive}`} style={{ marginBottom: 4 }}>Le {dateFr(event.semaine_decisive)}, ton palier s’est adapté à {event.palier_arrivee} moments.</p>)}
          {retours.map(event => <p key={event.id || `retour-${event.semaine_decisive}`} style={{ marginBottom: 4 }}>Le {dateFr(event.semaine_decisive)}, tu as retrouvé ce rythme.</p>)}
        </div>
      )}
    </section>
  </div>;
}

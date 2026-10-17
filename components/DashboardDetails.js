import Link from 'next/link';

export const DASHBOARD_DOMAINS = [
  { id: 'poids', title: 'Poids', href: '/suivi-poids', sources: ['poids'] },
  { id: 'extras', title: 'Extras', href: '/extras', sources: ['repas', 'semaines', 'evenementsExtras'] },
  { id: 'repas', title: 'Repas & faim/satiété', href: '/suivi', sources: ['repas'] },
  { id: 'bienetre', title: 'Bien-être / humeur', href: '/suivi', sources: ['humeurs'] },
  { id: 'defis', title: 'Défis', href: '/defis', sources: ['defis'] },
  { id: 'ideaux', title: 'Idéaux', href: '/ideaux', sources: ['ideaux'] },
  { id: 'jeune', title: 'Jeûne / reprise', href: '/jeune', sources: [] },
  { id: 'badges', title: 'Badges', href: '/defis', sources: ['badges'] },
  { id: 'fastfood', title: 'Fast-food', href: '/historique-fast-food', sources: ['repas'] },
  { id: 'regularite', title: 'Validation & régularité', href: '/historique-bilans-mensuels', sources: ['semaines', 'periodes', 'repas'] },
];

export default function DashboardDetails({ content, descriptions = {}, errors = [], openDomains = [], onDomainToggle }) {
  return <section id="dashboard-details-existants" aria-labelledby="dashboard-details-title" style={{ scrollMarginTop: 24, marginTop: 24 }}>
    <h2 id="dashboard-details-title">Détails & analyses</h2>
    <p>Ouvre un domaine pour retrouver ses observations, graphiques et historiques. La période sélectionnée s’applique aux données de période ; les repères du parcours gardent leur historique.</p>
    {DASHBOARD_DOMAINS.map(domain => {
      const unavailable = domain.sources.some(source => errors.includes(source));
      return <details key={domain.id} open={openDomains.includes(domain.id)} onToggle={event => onDomainToggle?.(domain.id, event.currentTarget.open)} data-dashboard-domain={domain.id} style={{ border: '1px solid #dce6ef', borderRadius: 12, marginBottom: 12, background: '#fff' }}>
        <summary style={{ cursor: 'pointer', padding: '16px 18px', fontWeight: 700, color: '#17324d', fontSize: 18 }}>{domain.title}</summary>
        <div style={{ padding: '0 18px 18px', minWidth: 0 }}>
          {unavailable ? <p role="status">Certaines données de ce domaine sont indisponibles. Elles ne sont pas considérées comme absentes.</p> : <>
            <p>{descriptions[domain.id]}</p>
            {content[domain.id]}
          </>}
          <Link href={domain.href}>Ouvrir le module {domain.title}</Link>
        </div>
      </details>;
    })}
  </section>;
}

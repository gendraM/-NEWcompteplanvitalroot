import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DashboardDetails, { DASHBOARD_DOMAINS } from '../components/DashboardDetails';

test('dix domaines repliables conservent leur contenu et leurs accès aux modules', () => {
  const content = Object.fromEntries(DASHBOARD_DOMAINS.map(d => [d.id, <p key={d.id}>Historique {d.id}</p>]));
  const html = renderToStaticMarkup(<DashboardDetails content={content} />);
  expect((html.match(/<details /g) || []).length).toBe(10);
  expect(html).not.toContain(' open=');
  for (const domain of DASHBOARD_DOMAINS) {
    expect(html).toContain(`Historique ${domain.id}`);
    expect(html).toContain(`href="${domain.href}"`);
  }
});
test('une erreur de domaine ne cache pas les domaines indépendants ni leurs liens', () => {
  const html = renderToStaticMarkup(<DashboardDetails content={{ poids: <p>Courbe indisponible</p>, ideaux: <p>Palier observé</p> }} errors={['poids']} />);
  expect(html).toContain('données de ce domaine sont indisponibles');
  expect(html).not.toContain('Courbe indisponible');
  expect(html).toContain('Palier observé');
  expect(html).toContain('href="/suivi-poids"');
});

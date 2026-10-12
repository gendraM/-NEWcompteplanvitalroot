import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DashboardSummary from '../components/DashboardSummary';
import { construireSyntheseTableauDeBord } from '../lib/dashboardSynthesis';

test('une erreur de lecture ne devient ni absence de défi/Idéal ni profil non renseigné', () => {
  const html = renderToStaticMarkup(<DashboardSummary synthese={construireSyntheseTableauDeBord()} errors={['defis', 'ideaux', 'profil', 'repas', 'periodes', 'semaines']} />);
  expect(html).toContain('Défis indisponibles');
  expect(html).toContain('Idéaux indisponibles');
  expect(html).toContain('Objectif : indisponible');
  expect(html).not.toContain('Aucun défi actif');
  expect(html).not.toContain('Aucun Idéal actif');
  expect(html).not.toContain('non renseigné');
});

test('les liens restaurés et les repères du profil restent accessibles avec une période vide', () => {
  const html = renderToStaticMarkup(<DashboardSummary synthese={construireSyntheseTableauDeBord({ objectifPoids: 70, poidsDepartParcours: 95 })} />);
  expect(html).toContain('Objectif : 70 kg');
  expect(html).toContain('Départ du parcours : 95 kg');
  for (const href of ['/suivi', '/suivi-poids', '/ideaux', '/defis', '#dashboard-details-existants']) {
    expect(html).toContain(`href="${href}"`);
  }
});

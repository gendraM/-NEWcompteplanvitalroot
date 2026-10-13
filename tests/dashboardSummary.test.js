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

test('le graphique de satiété utilise les occurrences explicites et exclut les réponses inconnues', () => {
  const synthese = construireSyntheseTableauDeBord({ repas: [
    { id: 'a1', occurrence_repas_id: 'a', satiete: 'oui' },
    { id: 'a2', occurrence_repas_id: 'a', satiete: 'oui' },
    { id: 'b', occurrence_repas_id: 'b', satiete: 'non' },
    { id: 'c', occurrence_repas_id: 'c', satiete: 'pas de faim' },
  ] });
  const html = renderToStaticMarkup(<DashboardSummary synthese={synthese} />);
  expect(html).toContain('50% de satiété respectée sur 2 occurrences renseignées');
  expect(html).toContain('réponses absentes ou inconnues sont exclues');
});

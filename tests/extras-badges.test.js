const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../lib/extrasBadges.js'), 'utf8')
  .replace("import { supabase } from './supabaseClient';", '')
  .replace(/export\s+/g, '')
  .concat('\nmodule.exports = { construireBadgePalierExtras, preparerBadgesPalierExtras, preparerEvenementsPalierExtras };');
const context = { module: { exports: {} }, exports: {}, console, supabase: {} };
vm.createContext(context);
vm.runInContext(source, context);
const { construireBadgePalierExtras, preparerBadgesPalierExtras, preparerEvenementsPalierExtras } = context.module.exports;

test('le badge conserve sa date, ses critères et ses semaines justificatives', () => {
  const badge = construireBadgePalierExtras('user-1', {
    code: 'extras-palier-3', nom: 'Nouveau rythme', palierDepart: 5, palierAtteint: 3, semainesRequises: 4, semaineDecisive: '2026-09-01',
    semaines: [{ weekStart: '2026-09-01', extrasCount: 3, kcalExtras: 1420, budgetExtras: 2000 }],
  }, '2026-09-06T18:30:00.000Z');
  expect(badge).toMatchObject({ user_id: 'user-1', code: 'extras-palier-3', type: 'extras_palier', nom: 'Nouveau rythme', date_obtention: '2026-09-06T18:30:00.000Z', details: { palier_depart: 5, palier_atteint: 3, semaines_requises: 4, semaine_decisive: '2026-09-01' } });
  expect(badge.details.semaines[0]).toEqual({ weekStart: '2026-09-01', extrasCount: 3, kcalExtras: 1420, budgetExtras: 2000 });
});


test('la synchronisation prépare tous les badges avec la date de validation décisive', () => {
  const badges = preparerBadgesPalierExtras('user-1', {
    transitions: [
      { code: 'extras-palier-3', palierDepart: 5, palierAtteint: 3, semainesRequises: 4, semaineDecisive: '2026-01-26', semaines: [] },
      { code: 'extras-palier-2', palierDepart: 3, palierAtteint: 2, semainesRequises: 8, semaineDecisive: '2026-06-08', semaines: [] },
    ],
  }, [
    { weekStart: '2026-01-26', date_validation: '2026-02-14T12:56:41.482Z' },
    { weekStart: '2026-06-08', date_validation: '2026-06-14T20:00:00.000Z' },
  ]);

  expect(badges).toHaveLength(2);
  expect(badges[0].badge).toMatchObject({ code: 'extras-palier-3', date_obtention: '2026-02-14T12:56:41.482Z' });
  expect(badges[1].badge).toMatchObject({ code: 'extras-palier-2', date_obtention: '2026-06-14T20:00:00.000Z' });
});

test('les retours et adaptations deviennent des événements distincts sans dupliquer le badge', () => {
  const evenements = preparerEvenementsPalierExtras('user-1', {
    transitions: [
      { type: 'first_reached', palierDepart: 5, palierAtteint: 3, semaineDecisive: '2026-01-26', semainesRequises: 4, tailleFenetre: 5, semaines: [] },
      { type: 'reached_again', palierDepart: 5, palierAtteint: 3, semaineDecisive: '2026-09-14', semainesRequises: 4, tailleFenetre: 5, semaines: [] },
    ],
    adaptations: [
      { type: 'adapted_up', palierDepart: 3, palierAdapte: 5, semaineDecisive: '2026-08-10', semainesConsecutives: 3 },
    ],
  });

  expect(evenements).toHaveLength(3);
  expect(evenements[0]).toMatchObject({
    type: 'first_reached', palier_depart: 5, palier_arrivee: 3, semaine_decisive: '2026-01-26',
  });
  expect(evenements[1]).toMatchObject({
    type: 'adapted_up', palier_depart: 3, palier_arrivee: 5, semaine_decisive: '2026-08-10',
  });
  expect(evenements[2]).toMatchObject({
    type: 'reached_again', palier_depart: 5, palier_arrivee: 3, semaine_decisive: '2026-09-14',
  });
});

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function charger() {
  const source = fs.readFileSync(path.join(__dirname, '../lib/repriseRepasSync.js'), 'utf8')
    .replace("import { supabase } from './supabaseClient';", 'const supabase = {};')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .replace(/export async function /g, 'async function ')
    .concat('\nmodule.exports={normaliserMomentReprise,construireRepasRepriseDistant};');
  const context = { module: { exports: {} }, exports: {}, Date };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.module.exports;
}

const sync = charger();

describe('Synchronisation Supabase des repas de reprise', () => {
  test.each([
    ['Petit-déjeuner', 'matin'], ['Déjeuner', 'midi'], ['Dîner', 'soir'], ['Collation', 'collation'], ['Autre', 'collation']
  ])('convertit %s vers %s', (visible, attendu) => {
    expect(sync.normaliserMomentReprise(visible)).toBe(attendu);
  });

  test('construit le payload conforme aux 19 colonnes existantes', () => {
    const payload = sync.construireRepasRepriseDistant({
      reprise_id: 'r1', client_id: 'c1', moment: 'Déjeuner', aliment_nom: 'Saumon frais',
      quantite: 100, conforme: true, consomme_le: '2026-08-20T12:00:00Z',
      date_repas: '2026-08-20', heure_repas: '12:00', saisie_retroactive: false,
      kcal: 200, note: 'ok', ressenti: 'bien', evaluation_reprise: { statut: 'autorise' }
    }, 'u1', 'j1');
    expect(payload).toMatchObject({
      reprise_id: 'r1', jour_id: 'j1', user_id: 'u1', client_id: 'c1', moment: 'midi',
      aliment_nom: 'Saumon frais', quantite: '100', kcal: 200,
      evaluation_reprise: { statut: 'autorise' }
    });
  });
});

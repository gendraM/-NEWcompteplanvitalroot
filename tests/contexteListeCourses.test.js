const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = { module: { exports: {} }, exports: {}, Object, Array, Set };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../lib/contexteListeCourses.js'), 'utf8')
    .replace('export const CONTEXTE_LISTE_GENERAL', 'const CONTEXTE_LISTE_GENERAL')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { CONTEXTE_LISTE_GENERAL, construireContexteCristallisation, estContexteCristallisation };');
  vm.runInContext(source, context, { filename: 'contexteListeCourses.js' });
  return context.module.exports;
}

const {
  CONTEXTE_LISTE_GENERAL,
  construireContexteCristallisation,
  estContexteCristallisation
} = chargerModule();

describe('Contexte de la liste de courses', () => {
  test('conserve un contexte général sans parcours', () => {
    expect(CONTEXTE_LISTE_GENERAL).toMatchObject({ type: 'plan_general', parcours_id: null, objectif_qn: null });
    expect(estContexteCristallisation(CONTEXTE_LISTE_GENERAL)).toBe(false);
  });

  test('transmet le parcours, ses critères et les aliments déclencheurs explicites', () => {
    const contexte = construireContexteCristallisation({
      id: 'parcours-1',
      criteres_personnalises: [{ id: 'c1' }],
      bilan_reprise: { aliments_declencheurs: ['chips', 'chocolat', 'chips'] }
    });
    expect(contexte).toMatchObject({
      type: 'cristallisation',
      parcours_id: 'parcours-1',
      criteres_actifs: [{ id: 'c1' }],
      aliments_triggers: ['chips', 'chocolat'],
      objectif_qn: null
    });
    expect(estContexteCristallisation(contexte)).toBe(true);
  });

  test('n’invente ni déclencheur ni objectif QN lorsqu’ils ne sont pas fournis', () => {
    const contexte = construireContexteCristallisation({ id: 'parcours-2', bilan_reprise: { qn_moyen: 2.5 } });
    expect(contexte.aliments_triggers).toEqual([]);
    expect(contexte.objectif_qn).toBe(null);
  });
});

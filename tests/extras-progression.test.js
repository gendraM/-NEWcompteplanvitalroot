const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../lib/extrasProgression.js'), 'utf8')
  .replace(/export\s+/g, '')
  .concat('\nmodule.exports = { calculerProgressionExtras, evaluerSemaineExtras, getVerbatimProgressionExtras };');
const context = { module: { exports: {} }, exports: {}, console };
vm.createContext(context);
vm.runInContext(source, context);
const { calculerProgressionExtras, evaluerSemaineExtras, getVerbatimProgressionExtras } = context.module.exports;

function semaine(index, extras, kcal = 300, budget = 450, autres = {}) {
  return { weekStart: `2026-01-${String(index + 1).padStart(2, '0')}`, validee: true, extras_count: extras, kcal_extras: kcal, budget_extras: budget, ...autres };
}

describe('progression extras 5 → 3 → 2 → 1', () => {
  test('démarre au palier 5', () => expect(calculerProgressionExtras([])).toMatchObject({ palier: 5, prochainPalier: 3, semainesRestantes: 4 }));
  test('passe au palier 3 après 4 semaines acquises', () => {
    expect(calculerProgressionExtras([semaine(0, 5), semaine(7, 4), semaine(14, 3), semaine(21, 5)])).toMatchObject({ palier: 3, prochainPalier: 2, semainesRestantes: 8 });
  });
  test('un dépassement met en pause sans remettre les acquis à zéro', () => {
    expect(calculerProgressionExtras([semaine(0, 4), semaine(7, 6), semaine(14, 5), semaine(21, 4)])).toMatchObject({ palier: 5, semainesAcquises: 3, semainesRestantes: 1 });
  });
  test('fréquence et calories doivent rester dans le cadre', () => {
    expect(evaluerSemaineExtras(semaine(0, 3, 700, 450), 5)).toMatchObject({ frequenceRespectee: true, caloriesRespectees: false, comptePourProgression: false });
  });
  test('une semaine non clôturée ne compte pas', () => expect(evaluerSemaineExtras(semaine(0, 3, 300, 450, { validee: false }), 5).comptePourProgression).toBe(false));
  test('produit le verbatim validé', () => {
    const progression = calculerProgressionExtras([semaine(0, 4), semaine(7, 4), semaine(14, 4)]);
    expect(getVerbatimProgressionExtras(progression)).toBe('Tes choix se rapprochent du rythme que tu veux créer. Encore 1 semaine dans cette direction avant d’évoluer vers le palier 3.');
  });
});

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

function semaineHebdo(index, extras, kcal = 300, budget = 450, autres = {}) {
  const date = new Date('2026-01-05T12:00:00');
  date.setDate(date.getDate() + index * 7);
  return { weekStart: date.toISOString().slice(0, 10), validee: true, extras_count: extras, kcal_extras: kcal, budget_extras: budget, ...autres };
}

describe('progression extras 5 → 3 → 2 → 1', () => {
  test('démarre au palier 5', () => expect(calculerProgressionExtras([])).toMatchObject({ palier: 5, prochainPalier: 3, semainesRestantes: 4 }));
  test('passe au palier 3 après 4 semaines acquises', () => {
    const resultat = calculerProgressionExtras([semaine(0, 5), semaine(7, 4), semaine(14, 3), semaine(21, 5)]);
    expect(resultat).toMatchObject({ palier: 3, prochainPalier: 2, semainesRestantes: 8 });
    expect(resultat.transitions[0]).toMatchObject({ code: 'extras-palier-3', nom: 'Nouveau rythme', palierDepart: 5, palierAtteint: 3, semainesRequises: 4, semaineDecisive: '2026-01-22' });
    expect(resultat.transitions[0].semaines).toHaveLength(4);
  });
  test('un dépassement met en pause sans remettre les acquis à zéro', () => {
    expect(calculerProgressionExtras([semaine(0, 4), semaine(7, 6), semaine(14, 5), semaine(21, 4)])).toMatchObject({ palier: 5, semainesAcquises: 3, semainesRestantes: 1 });
  });
  test('fréquence et calories doivent rester dans le cadre', () => {
    expect(evaluerSemaineExtras(semaine(0, 3, 700, 450), 5)).toMatchObject({ frequenceRespectee: true, caloriesRespectees: false, comptePourProgression: false });
  });
  test('une semaine hors budget ne figure pas dans les preuves du badge', () => {
    const resultat = calculerProgressionExtras([semaine(0, 4), semaine(7, 4, 700, 450), semaine(14, 4), semaine(21, 4), semaine(28, 4)]);
    expect(resultat.transitions[0].semaines.map(item => item.weekStart)).not.toContain('2026-01-08');
  });
  test('une semaine non clôturée ne compte pas', () => expect(evaluerSemaineExtras(semaine(0, 3, 300, 450, { validee: false }), 5).comptePourProgression).toBe(false));
  test('produit le verbatim validé', () => {
    const progression = calculerProgressionExtras([semaine(0, 4), semaine(7, 4), semaine(14, 4)]);
    expect(getVerbatimProgressionExtras(progression)).toBe('Tes choix se rapprochent du rythme que tu veux créer. Encore 1 semaine dans cette direction avant d’évoluer vers le palier 3.');
  });
});

describe('adaptation du palier au rythme observé', () => {
  const versPalier3 = [0, 1, 2, 3].map(index => semaineHebdo(index, 4));

  test('une ou deux semaines dépassées ne font pas remonter le palier', () => {
    const resultat = calculerProgressionExtras([...versPalier3, semaineHebdo(4, 4), semaineHebdo(5, 5)]);
    expect(resultat).toMatchObject({ palier: 3, serieDepassement: 2 });
    expect(resultat.adaptations).toHaveLength(0);
  });

  test('trois semaines consécutives dépassées adaptent le palier d’un niveau', () => {
    const resultat = calculerProgressionExtras([...versPalier3, semaineHebdo(4, 4), semaineHebdo(5, 5), semaineHebdo(6, 4)]);
    expect(resultat).toMatchObject({ palier: 5, adaptationRecente: true });
    expect(resultat.adaptations[0]).toMatchObject({ palierDepart: 3, palierAdapte: 5, semainesConsecutives: 3, semaineDecisive: '2026-02-16' });
    expect(getVerbatimProgressionExtras(resultat)).toBe('Ton rythme a été plus présent ces dernières semaines. Ton palier s’adapte à 5 moments pour repartir d’un repère qui correspond mieux à ce que tu vis aujourd’hui.');
  });

  test('les semaines acquises au palier inférieur restent mémorisées', () => {
    const resultat = calculerProgressionExtras([
      ...versPalier3,
      semaineHebdo(4, 2), semaineHebdo(5, 2),
      semaineHebdo(6, 4), semaineHebdo(7, 5), semaineHebdo(8, 4),
      semaineHebdo(9, 4), semaineHebdo(10, 4), semaineHebdo(11, 4), semaineHebdo(12, 4),
    ]);
    expect(resultat).toMatchObject({ palier: 3, semainesAcquises: 2, semainesRestantes: 6 });
  });

  test('un dépassement calorique seul ne fait pas remonter le palier', () => {
    const resultat = calculerProgressionExtras([
      ...versPalier3,
      semaineHebdo(4, 2, 700), semaineHebdo(5, 2, 700), semaineHebdo(6, 2, 700),
    ]);
    expect(resultat).toMatchObject({ palier: 3, serieDepassement: 0, semainesAcquises: 0 });
    expect(resultat.adaptations).toHaveLength(0);
  });

  test('une semaine manquante interrompt la série de dépassements', () => {
    const resultat = calculerProgressionExtras([...versPalier3, semaineHebdo(4, 4), semaineHebdo(5, 5), semaineHebdo(7, 4)]);
    expect(resultat).toMatchObject({ palier: 3, serieDepassement: 1 });
    expect(resultat.adaptations).toHaveLength(0);
  });
});

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../lib/extrasProgression.js'), 'utf8')
  .replace(/export\s+/g, '')
  .concat('\nmodule.exports = { calculerProgressionExtras, evaluerSemaineExtras, getVerbatimProgressionExtras, getEtatConstanceExtras };');
const context = { module: { exports: {} }, exports: {}, console, Date, Math, Set };
vm.createContext(context);
vm.runInContext(source, context);
const { calculerProgressionExtras, evaluerSemaineExtras, getVerbatimProgressionExtras, getEtatConstanceExtras } = context.module.exports;

function semaine(index, extras, kcal = 300, budget = 450, autres = {}) {
  const date = new Date('2026-01-05T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + index * 7);
  return { weekStart: date.toISOString().slice(0, 10), validee: true, extras_count: extras, kcal_extras: kcal, budget_extras: budget, ...autres };
}

describe('constance récente extras 5 → 3 → 2 → 1', () => {
  test('démarre au palier 5 avec une fenêtre de cinq semaines', () => {
    expect(calculerProgressionExtras([])).toMatchObject({
      palier: 5, prochainPalier: 3, semainesRestantes: 4, tailleFenetre: 5,
    });
  });

  test('passe au palier 3 avec quatre semaines respectées parmi cinq', () => {
    const resultat = calculerProgressionExtras([
      semaine(0, 5), semaine(1, 6), semaine(2, 4), semaine(3, 5), semaine(4, 3),
    ]);
    expect(resultat).toMatchObject({ palier: 3, prochainPalier: 2, semainesRestantes: 8 });
    expect(resultat.transitions[0]).toMatchObject({
      type: 'first_reached', code: 'extras-palier-3', palierDepart: 5,
      palierAtteint: 3, semainesRequises: 4, tailleFenetre: 5,
    });
    expect(resultat.transitions[0].semaines).toHaveLength(4);
  });

  test('trois semaines respectées parmi cinq ne suffisent pas', () => {
    const resultat = calculerProgressionExtras([
      semaine(0, 5), semaine(1, 6), semaine(2, 6), semaine(3, 5), semaine(4, 3),
    ]);
    expect(resultat).toMatchObject({ palier: 5, semainesAcquises: 3, semainesRestantes: 1 });
    expect(resultat.transitions).toHaveLength(0);
  });

  test('passe au palier 2 avec huit semaines respectées parmi dix', () => {
    const versPalier3 = [0, 1, 2, 3].map(index => semaine(index, 4));
    const versPalier2 = [
      semaine(4, 3), semaine(5, 3), semaine(6, 4), semaine(7, 3), semaine(8, 2),
      semaine(9, 4), semaine(10, 2), semaine(11, 3), semaine(12, 3), semaine(13, 2),
    ];
    const resultat = calculerProgressionExtras([...versPalier3, ...versPalier2]);
    expect(resultat.palier).toBe(2);
    expect(resultat.transitions[1]).toMatchObject({
      type: 'first_reached', palierDepart: 3, palierAtteint: 2,
      semainesRequises: 8, tailleFenetre: 10,
    });
  });

  test('fréquence, calories et validation sont toutes nécessaires', () => {
    expect(evaluerSemaineExtras(semaine(0, 3, 700), 5))
      .toMatchObject({ frequenceRespectee: true, caloriesRespectees: false, comptePourProgression: false });
    expect(evaluerSemaineExtras(semaine(0, 3, 300, 450, { validee: false }), 5).comptePourProgression)
      .toBe(false);
  });

  test('une semaine sans données fiables reste visible mais ne progresse pas', () => {
    const resultat = calculerProgressionExtras([
      semaine(0, 4), semaine(1, null, null, null), semaine(2, 4), semaine(3, 4),
    ]);
    expect(resultat).toMatchObject({ palier: 5, semainesAcquises: 3 });
    expect(resultat.semainesRecentes[1]).toMatchObject({ donneesFiables: false, comptePourProgression: false });
  });

  test('une semaine calendaires absente occupe la fenêtre récente sans devenir un échec définitif', () => {
    const resultat = calculerProgressionExtras([
      semaine(0, 4), semaine(1, 4), semaine(3, 4), semaine(4, 4),
    ]);
    expect(resultat.palier).toBe(3);
    expect(resultat.historique.some(item => item.manquante && item.weekStart === '2026-01-19')).toBe(true);
  });
});

describe('adaptation et retour à un ancien palier', () => {
  const versPalier3 = [0, 1, 2, 3].map(index => semaine(index, 4));

  test('une ou deux semaines dépassées ne font pas remonter le palier', () => {
    const resultat = calculerProgressionExtras([...versPalier3, semaine(4, 4), semaine(5, 5)]);
    expect(resultat).toMatchObject({ palier: 3, serieDepassement: 2 });
    expect(resultat.adaptations).toHaveLength(0);
  });

  test('trois semaines consécutives dépassées adaptent le palier d’un niveau', () => {
    const resultat = calculerProgressionExtras([
      ...versPalier3, semaine(4, 4), semaine(5, 5), semaine(6, 4),
    ]);
    expect(resultat).toMatchObject({ palier: 5, adaptationRecente: true, semainesAcquises: 0 });
    expect(resultat.adaptations[0]).toMatchObject({
      type: 'adapted_up', palierDepart: 3, palierAdapte: 5, semainesConsecutives: 3,
    });
    expect(getVerbatimProgressionExtras(resultat))
      .toContain('Ton palier s’adapte à 5 moments');
  });

  test('une semaine manquante interrompt la série de dépassements', () => {
    const resultat = calculerProgressionExtras([
      ...versPalier3, semaine(4, 4), semaine(5, 5), semaine(7, 4),
    ]);
    expect(resultat).toMatchObject({ palier: 3, serieDepassement: 1 });
    expect(resultat.adaptations).toHaveLength(0);
  });

  test('le retour au palier 3 est reconnu sans créer une nouvelle nature de badge', () => {
    const resultat = calculerProgressionExtras([
      ...versPalier3,
      semaine(4, 4), semaine(5, 5), semaine(6, 4),
      semaine(7, 4), semaine(8, 4), semaine(9, 4), semaine(10, 4),
    ]);
    expect(resultat.palier).toBe(3);
    expect(resultat.rythmeRetrouve).toBe(true);
    expect(resultat.transitions).toHaveLength(2);
    expect(resultat.transitions[1]).toMatchObject({
      type: 'reached_again', code: 'extras-palier-3', palierAtteint: 3,
    });
  });

  test('les anciennes semaines vers le palier 2 ne survivent pas à une remontée', () => {
    const resultat = calculerProgressionExtras([
      ...versPalier3,
      semaine(4, 2), semaine(5, 2), semaine(6, 2), semaine(7, 2),
      semaine(8, 2), semaine(9, 2), semaine(10, 2),
      semaine(11, 4), semaine(12, 4), semaine(13, 4),
      semaine(14, 4), semaine(15, 4), semaine(16, 4), semaine(17, 4),
    ]);
    expect(resultat.palier).toBe(3);
    expect(resultat.rythmeRetrouve).toBe(true);
    expect(resultat.semainesAcquises).toBe(0);
    expect(resultat.semainesRestantes).toBe(8);
  });

  test('un dépassement calorique seul ne fait pas remonter le palier', () => {
    const resultat = calculerProgressionExtras([
      ...versPalier3, semaine(4, 2, 700), semaine(5, 2, 700), semaine(6, 2, 700),
    ]);
    expect(resultat).toMatchObject({ palier: 3, serieDepassement: 0, semainesAcquises: 0 });
    expect(resultat.adaptations).toHaveLength(0);
  });
});

describe('états de constance visibles', () => {
  test('CREATE accompagne le début de construction', () => {
    expect(getEtatConstanceExtras({ semainesAcquises: 2, semainesRequises: 8, prochainPalier: 2 }).code).toBe('CREATE');
  });
  test('ALIGN reconnaît un rythme récent déjà maintenu', () => {
    expect(getEtatConstanceExtras({ semainesAcquises: 4, semainesRequises: 8, prochainPalier: 2 }).code).toBe('ALIGN');
  });
  test('ADAPT est prioritaire lors d’une adaptation récente', () => {
    expect(getEtatConstanceExtras({ adaptationRecente: true, rythmeRetrouve: true }).code).toBe('ADAPT');
  });
  test('GROW reconnaît le retour à un ancien palier', () => {
    expect(getEtatConstanceExtras({ rythmeRetrouve: true }).code).toBe('GROW');
  });
});

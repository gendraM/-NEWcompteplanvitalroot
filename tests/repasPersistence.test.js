const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);

  const source = fs.readFileSync(path.join(__dirname, '../lib/repasPersistence.js'), 'utf8')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { normaliserRepasPourPersistance };');

  vm.runInContext(source, context, { filename: 'repasPersistence.js' });
  return context.module.exports;
}

const { normaliserRepasPourPersistance } = chargerModule();

describe('normaliserRepasPourPersistance', () => {
  test('conserve le contrat historique mono-ligne', () => {
    const resultat = normaliserRepasPourPersistance(
      { aliment: 'Poulet', kcal: 180 },
      'user-test'
    );

    expect(resultat).toHaveLength(1);
    expect(resultat[0]).toMatchObject({
      aliment: 'Poulet',
      kcal: 180,
      user_id: 'user-test',
    });
  });

  test('accepte plusieurs lignes sans modifier leurs données métier', () => {
    const resultat = normaliserRepasPourPersistance([
      { aliment: 'Poulet', occurrence_repas_id: 'occurrence-1' },
      { aliment: 'Haricots verts', occurrence_repas_id: 'occurrence-1' },
    ], 'user-test');

    expect(resultat).toHaveLength(2);
    expect(resultat.map(r => r.aliment)).toEqual(['Poulet', 'Haricots verts']);
    expect(resultat.every(r => r.user_id === 'user-test')).toBe(true);
    expect(resultat.every(r => r.occurrence_repas_id === 'occurrence-1')).toBe(true);
  });

  test('préserve un user_id déjà présent sur une ligne', () => {
    const resultat = normaliserRepasPourPersistance(
      { aliment: 'Poulet', user_id: 'user-explicite' },
      'user-session'
    );

    expect(resultat[0].user_id).toBe('user-explicite');
  });

  test('refuse un tableau vide ou une ligne invalide', () => {
    expect(() => normaliserRepasPourPersistance([], 'user-test')).toThrow('Au moins un repas');
    expect(() => normaliserRepasPourPersistance([null], 'user-test')).toThrow('Repas invalide');
  });
});

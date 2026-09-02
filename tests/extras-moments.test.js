const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../lib/validationSemaine.js'), 'utf8')
  .replace(/export\s+/g, '')
  .concat('\nmodule.exports = { calculerExtrasSemaine };');
const context = { module: { exports: {} }, exports: {}, console, Date, Math, Set, Map };
vm.createContext(context);
vm.runInContext(source, context);
const { calculerExtrasSemaine } = context.module.exports;

describe('lecture unifiée des moments extras', () => {
  test('une assiette composée reste un seul moment et additionne ses calories', () => {
    const resultat = calculerExtrasSemaine('2026-09-01', [
      { id: 1, date: '2026-09-02', type: 'Déjeuner', aliment: 'Gâteau', kcal: 600, est_extra: true, occurrence_repas_id: 'occ-1' },
      { id: 2, date: '2026-09-02', type: 'Déjeuner', aliment: 'Glace', kcal: 400, est_extra: true, occurrence_repas_id: 'occ-1' },
    ]);
    expect(resultat.count).toBe(1);
    expect(resultat.kcalTotal).toBe(1000);
    expect(resultat.details[0]).toMatchObject({ kcal: 1000, type_extra: 'majeur' });
  });
  test('deux occurrences distinctes restent deux moments', () => {
    const resultat = calculerExtrasSemaine('2026-09-01', [
      { id: 1, date: '2026-09-02', aliment: 'Gâteau', kcal: 200, est_extra: true, occurrence_repas_id: 'occ-1' },
      { id: 2, date: '2026-09-03', aliment: 'Glace', kcal: 180, est_extra: true, occurrence_repas_id: 'occ-2' },
    ]);
    expect(resultat.count).toBe(2);
    expect(resultat.kcalTotal).toBe(380);
  });
});

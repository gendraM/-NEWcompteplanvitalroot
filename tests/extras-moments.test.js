const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../lib/validationSemaine.js'), 'utf8')
  .replace(/export\s+/g, '')
  .concat('\nmodule.exports = { calculerExtrasSemaine, compterMomentsExtras };');
const context = { module: { exports: {} }, exports: {}, console, Date, Math, Set, Map };
vm.createContext(context);
vm.runInContext(source, context);
const { calculerExtrasSemaine, compterMomentsExtras } = context.module.exports;

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

  test('le graphique compte les memes moments que la carte', () => {
    const repas = [
      { id: 1, date: '2026-09-02', aliment: 'Pizza', est_extra: true, occurrence_repas_id: 'occ-1' },
      { id: 2, date: '2026-09-02', aliment: 'Dessert', est_extra: true, occurrence_repas_id: 'occ-1' },
      { id: 3, date: '2026-09-04', aliment: 'Biscuit', est_extra: true, occurrence_repas_id: 'occ-2' },
      { id: 4, date: '2026-09-04', aliment: 'Legumes', est_extra: false, occurrence_repas_id: 'occ-3' },
    ];

    expect(compterMomentsExtras(repas)).toBe(2);
    expect(calculerExtrasSemaine('2026-09-01', repas).count).toBe(2);
  });

  test('reconnaît les anciennes lignes dont la catégorie affichée est extra', () => {
    const resultat = calculerExtrasSemaine('2026-09-07', [
      { id: 1, date: '2026-09-07', aliment: 'Brioche', categorie: 'viennoiserie', kcal: 194, est_extra: true, occurrence_repas_id: 'occ-1' },
      { id: 2, date: '2026-09-08', aliment: 'Pizza (part)', categorie: 'extra', kcal: 500, est_extra: false, occurrence_repas_id: 'occ-2' },
      { id: 3, date: '2026-09-10', aliment: 'Biscuits fourrés (BN)', categorie: ' EXTRA ', kcal: 180, est_extra: false, occurrence_repas_id: 'occ-3' },
    ]);

    expect(resultat.count).toBe(3);
    expect(resultat.kcalTotal).toBe(874);
    expect(resultat.details.map(extra => extra.nom)).toEqual([
      'Brioche',
      'Pizza (part)',
      'Biscuits fourrés (BN)',
    ]);
  });
});

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const contexte = { module: { exports: {} }, exports: {}, Date, Map, Object, Array, Number, String };
  vm.createContext(contexte);
  const source = fs.readFileSync(path.join(__dirname, '../lib/horizonPlanning.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { MODES_HORIZON_PLANNING, ajouterJoursPlanning, obtenirDebutSemaine, obtenirPeriodePlanning, naviguerDansPlanning, creerCleGroupePlanifie, regrouperRepasPlanifies };');
  vm.runInContext(source, contexte, { filename: 'horizonPlanning.js' });
  return contexte.module.exports;
}

const {
  MODES_HORIZON_PLANNING,
  obtenirPeriodePlanning,
  naviguerDansPlanning,
  regrouperRepasPlanifies
} = chargerModule();

describe('Horizons du planning alimentaire', () => {
  test('la semaine va toujours du lundi au dimanche, même à cheval sur deux mois', () => {
    const periode = obtenirPeriodePlanning(MODES_HORIZON_PLANNING.SEMAINE, '2026-09-02');
    expect(periode.debut).toBe('2026-08-31');
    expect(periode.fin).toBe('2026-09-06');
    expect(Array.from(periode.dates)).toHaveLength(7);
  });

  test('les 15 prochains jours incluent le jour choisi et franchissent le changement de mois', () => {
    const periode = obtenirPeriodePlanning(MODES_HORIZON_PLANNING.QUINZE_JOURS, '2026-09-25');
    expect(periode.debut).toBe('2026-09-25');
    expect(periode.fin).toBe('2026-10-09');
    expect(Array.from(periode.dates)).toHaveLength(15);
  });

  test('l’aperçu mensuel couvre exactement un mois bissextile', () => {
    const periode = obtenirPeriodePlanning(MODES_HORIZON_PLANNING.MOIS, '2028-02-14');
    expect(periode.debut).toBe('2028-02-01');
    expect(periode.fin).toBe('2028-02-29');
    expect(Array.from(periode.dates)).toHaveLength(29);
  });

  test('la navigation avance selon l’horizon choisi', () => {
    expect(naviguerDansPlanning(MODES_HORIZON_PLANNING.SEMAINE, '2026-09-02', 1)).toBe('2026-09-09');
    expect(naviguerDansPlanning(MODES_HORIZON_PLANNING.QUINZE_JOURS, '2026-09-02', -1)).toBe('2026-08-18');
    expect(naviguerDansPlanning(MODES_HORIZON_PLANNING.MOIS, '2026-12-20', 1)).toBe('2027-01-01');
  });

  test('regroupe uniquement les lignes Supabase d’une même assiette composée', () => {
    const lignes = [
      { id: 'a', date: '2026-09-07', type: 'Dîner', created_at: '2026-09-01T10:00:00Z', combo_valide: true, aliment: 'Riz' },
      { id: 'b', date: '2026-09-07', type: 'Dîner', created_at: '2026-09-01T10:00:00Z', combo_valide: true, aliment: 'Poisson' },
      { id: 'c', date: '2026-09-07', type: 'Dîner', created_at: '2026-09-01T11:00:00Z', combo_valide: true, aliment: 'Fruit' }
    ];

    const groupes = regrouperRepasPlanifies(lignes);
    expect(groupes).toHaveLength(2);
    expect(Array.from(groupes[0].lignes).map(ligne => ligne.id)).toEqual(['a', 'b']);
    expect(Array.from(groupes[1].lignes).map(ligne => ligne.id)).toEqual(['c']);
  });

  test('conserve les repas simples et les anciennes lignes comme occurrences indépendantes', () => {
    const lignes = [
      { id: 'simple-1', date: '2026-09-07', type: 'Déjeuner', combo_valide: false },
      { id: 'ancien-1', date: '2026-09-07', type: 'Déjeuner' }
    ];
    expect(regrouperRepasPlanifies(lignes)).toHaveLength(2);
  });

  test('ne modifie pas le tableau ni ses lignes pendant le regroupement', () => {
    const lignes = [{ id: 'a', date: '2026-09-07', type: 'Dîner', combo_valide: false }];
    const copie = JSON.parse(JSON.stringify(lignes));
    regrouperRepasPlanifies(lignes);
    expect(lignes).toEqual(copie);
  });

  test('refuse une date impossible sans fabriquer de période', () => {
    expect(obtenirPeriodePlanning(MODES_HORIZON_PLANNING.SEMAINE, '2026-02-31')).toBeNull();
  });
});

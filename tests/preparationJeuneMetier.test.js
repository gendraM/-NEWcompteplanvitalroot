// Le repo n'a pas de config Babel : les libs en ESM doivent être chargées via vm
// (même convention que tests/validerCriterePreparation.auto.test.js)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModuleMetier() {
  const filePath = path.join(__dirname, '../lib/preparationJeuneMetier.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export function /g, 'function ')
    .replace(/export const /g, 'const ')
    .replace(/export default[\s\S]*?;\s*$/, '')
    .concat('\nmodule.exports = { CRITERES_PREPARATION, PHASES_PREPARATION, getPhasesPreparation, getPhaseDuJour, getCriteresDuJour, validerCriteresDuJour };');

  const context = { module: { exports: {} }, exports: {}, console };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'preparationJeuneMetier.js' });
  return context.module.exports;
}

const {
  CRITERES_PREPARATION,
  PHASES_PREPARATION,
  getPhasesPreparation,
  getPhaseDuJour,
  getCriteresDuJour,
} = chargerModuleMetier();

describe('Modèle métier canonique de la préparation au jeûne', () => {
  test('expose exactement 9 critères avec les jalons attendus', () => {
    expect(CRITERES_PREPARATION).toHaveLength(9);
    expect(CRITERES_PREPARATION.map(c => c.jalon)).toEqual([30, 17, 17, 14, 14, 12, 7, 7, 7]);
  });

  test('expose exactement 3 phases avec les bornes J-30 → J0', () => {
    expect(PHASES_PREPARATION).toHaveLength(3);
    expect(PHASES_PREPARATION.map(p => [p.debut, p.fin])).toEqual([
      [-30, -18],
      [-17, -8],
      [-7, 0],
    ]);
  });

  test('getPhasesPreparation() répartit les 9 critères sans perte ni doublon', () => {
    const phases = getPhasesPreparation();
    const totalCriteres = phases.reduce((acc, phase) => acc + phase.criteres.length, 0);
    expect(totalCriteres).toBe(9);
  });

  test('getPhaseDuJour() retrouve la bonne phase à chaque jalon', () => {
    expect(getPhaseDuJour(-30).id).toBe('phase1-fondation');
    expect(getPhaseDuJour(-17).id).toBe('phase2-intensification');
    expect(getPhaseDuJour(-7).id).toBe('phase3-prejeune');
    expect(getPhaseDuJour(0).id).toBe('phase3-prejeune');
  });

  test('getCriteresDuJour() retourne les critères de la phase active', () => {
    expect(getCriteresDuJour(-30).map(c => c.id)).toEqual([1]);
    expect(getCriteresDuJour(-7).map(c => c.id)).toEqual([7, 8, 9]);
  });
});

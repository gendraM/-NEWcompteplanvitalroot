const fs = require('fs');
const path = require('path');
const vm = require('vm');

function charger() {
  const dataSource = fs.readFileSync(path.join(__dirname, '../data/alimentsRepriseJeune.js'), 'utf8')
    .replace(/export \{ alimentsRepriseJeune \};?/g, '')
    .replace(/export default alimentsRepriseJeune;?/g, '')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = alimentsRepriseJeune;');
  const dataContext = { module: { exports: {} }, exports: {} };
  vm.createContext(dataContext);
  vm.runInContext(dataSource, dataContext);

  const source = fs.readFileSync(path.join(__dirname, '../lib/repriseJeuneMetier.js'), 'utf8')
    .replace("import alimentsRepriseJeune from '../data/alimentsRepriseJeune';", 'const alimentsRepriseJeune = globalThis.alimentsRepriseJeune;')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports={PHASES_REPRISE,CORRESPONDANCES_REFERENTIEL_REPRISE,trouverRegleReprise,getContraintesAliment,getAlimentsIntroduitsPhase,getAlimentsDisponiblesPhase,evaluerAlimentReprise,harmoniserJoursProgramme};');
  const context = { module: { exports: {} }, exports: {}, alimentsRepriseJeune: dataContext.module.exports };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { aliments: dataContext.module.exports, ...context.module.exports };
}

const metier = charger();

describe('Règles métier D1 à D5 de la reprise', () => {
  test('conserve 80 règles et 77 noms uniques', () => {
    expect(metier.aliments).toHaveLength(80);
    expect(new Set(metier.aliments.map(a => a.nom)).size).toBe(77);
  });

  test('applique les seuils QN par phase', () => {
    expect([1, 2].map(p => metier.PHASES_REPRISE[p].qnMinimum)).toEqual([4, 4]);
    expect([3, 4, 5].map(p => metier.PHASES_REPRISE[p].qnMinimum)).toEqual([3, 3, 3]);
  });

  test('réaligne les phases 3 à 5', () => {
    const phase3 = metier.getAlimentsIntroduitsPhase(3).map(a => a.nom);
    const phase4j1 = metier.getAlimentsIntroduitsPhase(4, 1).map(a => a.nom);
    const phase4j2 = metier.getAlimentsIntroduitsPhase(4, 2).map(a => a.nom);
    const phase5 = metier.getAlimentsIntroduitsPhase(5).map(a => a.nom);
    expect(phase3).toContain('Œuf mollet');
    expect(phase3).not.toEqual(expect.arrayContaining(['Saumon vapeur', 'Sardines nature', 'Thon au naturel', 'Fromage blanc 0%']));
    expect(phase4j1).toEqual(expect.arrayContaining(['Poulet vapeur', 'Dinde vapeur', 'Poisson blanc vapeur ou papillote']));
    expect(phase4j1).not.toContain('Concombre épluché');
    expect(phase4j2).toEqual(expect.arrayContaining(['Concombre épluché', 'Carotte très finement râpée', 'Tomate pelée']));
    expect(phase5).toEqual(expect.arrayContaining(['Saumon vapeur', 'Sardines nature', 'Thon au naturel', 'Fromage blanc 0%', 'Pain complet au levain']));
  });

  test('ne crée aucune équivalence arbitraire pour les neuf ambiguïtés', () => {
    ['compote de pomme', 'yaourt nature', 'kiwi', 'chocolat noir 70', 'pain complet']
      .forEach(nom => expect(metier.CORRESPONDANCES_REFERENTIEL_REPRISE[nom]).toBeUndefined());
    expect(metier.trouverRegleReprise('Pomme cuite').nom).toBe('Pomme cuite');
    expect(metier.trouverRegleReprise('Saumon frais').nom).toBe('Saumon sauvage');
  });

  test('distingue préparation adaptée, différente et inconnue', () => {
    const base = { aliment: { nom: 'Saumon frais', qn: 4 }, phase: 5 };
    expect(metier.evaluerAlimentReprise({ ...base, preparation: 'vapeur', texture: 'tendre' }).statut).toBe('autorise');
    expect(metier.evaluerAlimentReprise({ ...base, preparation: 'frit', texture: 'tendre' }).statut).toBe('ecart');
    expect(metier.evaluerAlimentReprise({ ...base, preparation: 'Je ne sais pas', texture: 'Je ne sais pas' }).statut).toBe('a_confirmer');
  });

  test('harmonise les anciennes phases texte et les aliments cumulés', () => {
    const jours = metier.harmoniserJoursProgramme([
      { jour_numero: 1, phase: 'phase3' },
      { jour_numero: 2, phase: 'phase4' },
      { jour_numero: 3, phase: 'phase4' }
    ]);
    expect(jours.map(j => j.phase)).toEqual([3, 4, 4]);
    expect(jours[1].aliments_autorises.some(a => a.phase_introduction === 3 && !a.nouveau_dans_phase)).toBe(true);
    expect(jours[1].aliments_autorises.some(a => a.nom === 'Concombre épluché')).toBe(false);
    expect(jours[2].aliments_autorises.some(a => a.nom === 'Concombre épluché')).toBe(true);
  });
});

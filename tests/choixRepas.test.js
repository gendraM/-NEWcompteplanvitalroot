const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const contexte = { module: { exports: {} }, exports: {} };
  vm.createContext(contexte);
  const source = fs.readFileSync(path.join(__dirname, '../lib/choixRepas.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .replace(/export \{ SOURCES_CHOIX_REPAS \};/, '')
    .concat('\nmodule.exports = { SOURCES_CHOIX_REPAS, ACTIONS_CHOIX_REPAS, choixDepuisRepasCompose, choixDepuisValeurSure, choixDepuisRepasPlanifie, normaliserContexteChoixRepas };');
  vm.runInContext(source, contexte, { filename: 'choixRepas.js' });
  return contexte.module.exports;
}

const {
  choixDepuisRepasCompose,
  choixDepuisValeurSure,
  choixDepuisRepasPlanifie,
  normaliserContexteChoixRepas
} = chargerModule();

describe('contrat commun choix repas', () => {
  test('adapte un repas composé sans inventer une durée absente', () => {
    const choix = choixDepuisRepasCompose({
      id: 'modele-1',
      nom: 'Poulet courgettes',
      composition: [
        { nom: 'Poulet', categorie: 'protéine', quantite: 150, unite: 'g', kcal: 180 },
        { nom: 'Courgettes', categorie: 'légume', quantite: 250, unite: 'g', kcal: 45 }
      ]
    });
    expect(choix).toMatchObject({
      source: 'repas_compose',
      sourceId: 'modele-1',
      titre: 'Poulet courgettes',
      dureeMinutes: null
    });
    expect(choix.actions).toEqual(['preparer', 'planifier', 'modifier']);
  });

  test('adapte une valeur sûre et conserve son observation factuelle', () => {
    const choix = choixDepuisValeurSure({
      cleComposition: 'courgettes|poulet',
      raison: 'Tu as choisi cette assiette 4 fois.',
      composition: [
        { aliment: 'Poulet', categorie: 'protéine', quantite: '150 g', kcal: 180 },
        { aliment: 'Courgettes', categorie: 'légume', quantite: '250 g', kcal: 45 }
      ]
    });
    expect(choix.source).toBe('valeur_sure');
    expect(choix.observation).toBe('Tu as choisi cette assiette 4 fois.');
    expect(choix.composition.map(item => item.nom)).toEqual(['Poulet', 'Courgettes']);
  });

  test('adapte plusieurs lignes planifiées en un seul choix sans nouveau stockage', () => {
    const choix = choixDepuisRepasPlanifie([
      { id: 'p1', aliment: 'Saumon', categorie: 'poisson', quantite: '120 g', kcal: 220 },
      { id: 'p2', aliment: 'Haricots verts', categorie: 'légume', quantite: '200 g', kcal: 60 }
    ]);
    expect(choix.source).toBe('planning');
    expect(choix.composition).toHaveLength(2);
    expect(choix.actions).toEqual(['preparer']);
  });

  test('le contexte reste séparé et ne déduit ni fatigue ni risque extra', () => {
    const contexte = normaliserContexteChoixRepas({
      origine: 'suivi',
      dateCible: '2026-09-18',
      typeRepasCible: 'Dîner',
      repasNonPlanifie: true,
      contrainteTempsMinutes: 10,
      fatigue: true,
      risqueExtra: true
    });
    expect(contexte).toEqual({
      origine: 'suivi',
      dateCible: '2026-09-18',
      typeRepasCible: 'Dîner',
      contrainteTempsMinutes: 10,
      repasNonPlanifie: true,
      intention: null
    });
    expect(contexte.fatigue).toBeUndefined();
    expect(contexte.risqueExtra).toBeUndefined();
  });
});

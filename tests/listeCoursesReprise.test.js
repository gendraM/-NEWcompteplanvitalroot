const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const filePath = path.join(__dirname, '../lib/listeCoursesReprise.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { normaliserListeCoursesReprise, grouperListeCoursesReprise };');

  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'listeCoursesReprise.js' });
  return context.module.exports;
}

const {
  normaliserListeCoursesReprise,
  grouperListeCoursesReprise
} = chargerModule();

describe('Liste de courses canonique de la reprise', () => {
  test('conserve le tableau généré et ses quantités', () => {
    const resultat = normaliserListeCoursesReprise([
      { nom: 'Bouillon', quantite: '1L', categorie: 'liquide', phase: 1, priorite: 'haute' }
    ]);

    expect(resultat).toEqual([
      { nom: 'Bouillon', quantite: '1L', categorie: 'liquide', phase: 1, priorite: 'haute' }
    ]);
  });

  test('convertit encore un ancien objet groupé', () => {
    const resultat = normaliserListeCoursesReprise({
      legumes: {
        aliments: ['Carotte', 'Courgette'],
        quantite_estimee: '500g'
      }
    });

    expect(resultat.map(item => [item.nom, item.quantite, item.categorie])).toEqual([
      ['Carotte', '500g', 'legumes'],
      ['Courgette', '500g', 'legumes']
    ]);
  });

  test('regroupe le format canonique pour la présentation sans le recalculer', () => {
    const groupes = grouperListeCoursesReprise([
      { nom: 'Bouillon', quantite: '1L', categorie: 'liquide' },
      { nom: 'Carotte', quantite: '300g', categorie: 'légume' }
    ]);

    expect(Object.keys(groupes)).toEqual(['liquide', 'légume']);
    expect(groupes.liquide[0].nom).toBe('Bouillon');
    expect(groupes['légume'][0].quantite).toBe('300g');
  });

  test('ignore proprement les données absentes ou invalides', () => {
    expect(normaliserListeCoursesReprise(null)).toEqual([]);
    expect(normaliserListeCoursesReprise([null, {}, { nom: 'Infusion' }])).toHaveLength(1);
  });
});

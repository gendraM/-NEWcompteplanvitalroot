const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../data/profilsAlimentaires.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { PROFILS_ALIMENTAIRES, cleProfilAlimentaire, enrichirAvecProfilAlimentaire, enrichirReferentielAvecProfils };');
  vm.runInContext(source, context, { filename: 'profilsAlimentaires.js' });
  return context.module.exports;
}

const {
  cleProfilAlimentaire,
  enrichirAvecProfilAlimentaire,
  enrichirReferentielAvecProfils
} = chargerModule();

describe('Profils alimentaires additifs', () => {
  test('construit une clé stable avec nom, marque et catégorie', () => {
    expect(cleProfilAlimentaire({
      nom: 'Poêlée de légumes',
      marque: null,
      categorie: 'accompagnement'
    })).toBe('poelee de legumes||accompagnement');
  });

  test('enrichit uniquement les deux accompagnements validés', () => {
    const poelee = enrichirAvecProfilAlimentaire({
      nom: 'Poêlée de légumes', categorie: 'accompagnement', marque: null
    });
    const ratatouille = enrichirAvecProfilAlimentaire({
      nom: 'Ratatouille rapide', categorie: 'accompagnement', marque: null
    });
    expect(poelee.profilAlimentaire).toEqual({ rolesRepas: ['legume'], faitAvec: 'plusieurs_aliments' });
    expect(ratatouille.profilAlimentaire).toEqual({ rolesRepas: ['legume'], faitAvec: 'plusieurs_aliments' });
  });

  test('ne force aucun profil sur un cas non validé', () => {
    const sauce = { nom: 'Sauce pesto vert', categorie: 'sauce', marque: 'Barilla' };
    expect(enrichirAvecProfilAlimentaire(sauce)).toEqual(sauce);
  });

  test('préserve un profil déjà porté par un aliment utilisateur', () => {
    const custom = {
      nom: 'Mon aliment',
      categorie: 'personnalise',
      profilAlimentaire: { rolesRepas: ['proteine'], faitAvec: 'un_aliment' }
    };
    expect(enrichirAvecProfilAlimentaire(custom)).toBe(custom);
  });

  test('enrichit une liste sans modifier les objets sans correspondance', () => {
    const riz = { nom: 'Riz', categorie: 'féculent' };
    const resultat = enrichirReferentielAvecProfils([
      riz,
      { nom: 'Poêlée de légumes', categorie: 'accompagnement', marque: null }
    ]);
    expect(resultat[0]).toBe(riz);
    expect(resultat[1].profilAlimentaire.rolesRepas).toEqual(['legume']);
  });
});

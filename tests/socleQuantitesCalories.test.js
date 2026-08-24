const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const filePath = path.join(__dirname, '../lib/socleQuantitesCalories.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { normaliserUnite, convertirQuantiteEnUniteBase, extraireQuantiteReference, calculerCaloriesAliment, arrondirQuantiteAchat, formaterQuantite, cleAgregationArticle, agregerArticles };');

  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'socleQuantitesCalories.js' });
  return context.module.exports;
}

function chargerReferentiel() {
  const filePath = path.join(__dirname, '../data/referentiel.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .replace(/export default referentielAliments;?/, 'module.exports = referentielAliments;');

  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'referentiel.js' });
  return context.module.exports;
}

const {
  convertirQuantiteEnUniteBase,
  extraireQuantiteReference,
  calculerCaloriesAliment,
  arrondirQuantiteAchat,
  formaterQuantite,
  agregerArticles
} = chargerModule();

describe('Socle commun des quantités', () => {
  test('convertit uniquement les unités de masse, volume et comptage explicitement compatibles', () => {
    expect(convertirQuantiteEnUniteBase(1.25, 'kg')).toEqual({ valeur: 1250, unite: 'g' });
    expect(convertirQuantiteEnUniteBase(75, 'cl')).toEqual({ valeur: 750, unite: 'ml' });
    expect(convertirQuantiteEnUniteBase(2, 'pièces')).toEqual({ valeur: 2, unite: 'unité' });
    expect(convertirQuantiteEnUniteBase('inconnu', 'g')).toBeNull();
  });

  test('retrouve la quantité correspondant à l’unité demandée dans une portion descriptive', () => {
    expect(extraireQuantiteReference('1 tartelette (90g)', 'g')).toEqual({ valeur: 90, unite: 'g' });
    expect(extraireQuantiteReference('1 petite boîte (80g)', 'boite')).toEqual({ valeur: 1, unite: 'boite' });
    expect(extraireQuantiteReference('1/4 unité', 'unité')).toEqual({ valeur: 0.25, unite: 'unité' });
    expect(extraireQuantiteReference('barquette', 'barquette')).toEqual({ valeur: 1, unite: 'barquette' });
    expect(extraireQuantiteReference('portion libre', 'g')).toBeNull();
  });

  test('applique les arrondis et formats d’achat déjà validés par la reprise', () => {
    expect(arrondirQuantiteAchat(1001, 'g')).toBe(1010);
    expect(arrondirQuantiteAchat(101, 'ml')).toBe(150);
    expect(arrondirQuantiteAchat(1.2, 'unité')).toBe(2);
    expect(formaterQuantite(1050, 'g')).toBe('1.05 kg');
    expect(formaterQuantite(1500, 'ml')).toBe('1.5 L');
  });

  test('additionne les masses compatibles même lorsqu’elles sont saisies en g et kg', () => {
    const resultat = agregerArticles([
      {
        nom: 'Carottes', categorie: 'légume', preparation: 'Vapeur', phase: 2,
        quantite_valeur: 500, quantite_unite: 'g', utilisations_estimees: 2
      },
      {
        nom: 'Carottes', categorie: 'légume', preparation: 'Vapeur', phase: 3,
        quantite_valeur: 0.75, quantite_unite: 'kg', utilisations_estimees: 3
      }
    ]);

    expect(resultat).toHaveLength(1);
    expect(resultat[0]).toMatchObject({
      quantite: '1.25 kg',
      quantite_valeur: 1250,
      quantite_unite: 'g',
      utilisations_estimees: 5,
      phases: [2, 3]
    });
  });

  test('sépare un même aliment lorsque la préparation ou l’unité sont incompatibles', () => {
    const resultat = agregerArticles([
      { nom: 'Carottes', categorie: 'légume', preparation: 'Vapeur', phase: 2, quantite_valeur: 200, quantite_unite: 'g' },
      { nom: 'Carottes', categorie: 'légume', preparation: 'Râpées', phase: 4, quantite_valeur: 100, quantite_unite: 'g' },
      { nom: 'Carottes', categorie: 'légume', preparation: 'Vapeur', phase: 2, quantite_valeur: 1, quantite_unite: 'unité' }
    ]);

    expect(resultat).toHaveLength(3);
  });
});

describe('Socle commun des calories', () => {
  test('calcule depuis un ratio kcal par unité explicite', () => {
    expect(calculerCaloriesAliment({ unite: 'g', kcalParUnite: 2 }, 75, 'g')).toMatchObject({
      kcal: 150,
      statut: 'ok',
      source: 'kcal_par_unite'
    });
  });

  test('calcule depuis les kcal de la portion de référence', () => {
    expect(calculerCaloriesAliment({ unite: 'g', portionDefaut: '120g', kcal: 220 }, 60, 'g')).toMatchObject({
      kcal: 110,
      statut: 'ok',
      source: 'portion_reference'
    });
  });

  test('interprète une portion descriptive complète sans multiplier le premier nombre par erreur', () => {
    expect(calculerCaloriesAliment({ unite: 'g', portionDefaut: '1 tartelette (90g)', kcal: 220 }, '1 tartelette (90g)', 'g')).toMatchObject({
      kcal: 220,
      statut: 'ok',
      source: 'portion_reference'
    });
  });

  test('interprète le nom d’un conditionnement comme une portion unique', () => {
    expect(calculerCaloriesAliment({ unite: 'barquette', portionDefaut: 'barquette', kcal: 430 }, 'barquette', 'barquette')).toMatchObject({
      kcal: 430,
      statut: 'ok',
      source: 'portion_reference'
    });
  });

  test('reconnaît exactement une portion textuelle du référentiel même sans conversion disponible', () => {
    expect(calculerCaloriesAliment({ unite: 'sandwich', portionDefaut: '30cm', kcal: 620 }, '30cm', 'sandwich')).toMatchObject({
      kcal: 620,
      statut: 'ok',
      source: 'portion_reference'
    });
    expect(calculerCaloriesAliment({ unite: 'portion', portionDefaut: '½ mangue', kcal: 70 }, '½ mangue', 'portion')).toMatchObject({
      kcal: 70,
      statut: 'ok'
    });
  });

  test('utilise la masse écrite dans une portion conditionnée lorsque l’utilisateur saisit des grammes', () => {
    expect(calculerCaloriesAliment({ unite: 'boite', portionDefaut: '1 petite boîte (80g)', kcal: 100 }, 40, 'g')).toMatchObject({
      kcal: 50,
      statut: 'ok',
      source: 'portion_reference'
    });
  });

  test('prend en charge une valeur explicitement fournie pour 100 g', () => {
    expect(calculerCaloriesAliment({ unite: 'g', kcalPour100g: 250 }, 40, 'g')).toMatchObject({
      kcal: 100,
      statut: 'ok',
      source: 'pour_100g'
    });
  });

  test('accepte une valeur calorique nulle explicite', () => {
    expect(calculerCaloriesAliment({ unite: 'ml', kcalParUnite: 0 }, 250, 'ml')).toMatchObject({
      kcal: 0,
      statut: 'ok'
    });
  });

  test('signale une donnée incomplète lorsque la conversion serait arbitraire', () => {
    expect(calculerCaloriesAliment({ unite: 'g', portionDefaut: '120g', kcal: 220 }, 2, 'tranches')).toMatchObject({
      kcal: null,
      statut: 'incomplet'
    });
    expect(calculerCaloriesAliment({ unite: 'g', portionDefaut: '120g' }, 60, 'g')).toMatchObject({
      kcal: null,
      statut: 'incomplet'
    });
    expect(calculerCaloriesAliment({ unite: 'g', kcal: 220 }, '', 'g')).toMatchObject({
      kcal: null,
      statut: 'incomplet'
    });
  });

  test('reproduit sans écart les kcal des 616 portions par défaut du référentiel général', () => {
    const referentiel = chargerReferentiel();
    expect(referentiel).toHaveLength(616);

    referentiel.forEach(aliment => {
      const resultat = calculerCaloriesAliment(aliment, aliment.portionDefaut, aliment.unite);
      expect(resultat.statut).toBe('ok');
      expect(resultat.kcal).toBe(Math.round(Number(aliment.kcal)));
    });
  });
});

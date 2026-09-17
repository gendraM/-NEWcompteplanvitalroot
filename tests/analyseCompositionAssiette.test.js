const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../lib/analyseCompositionAssiette.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { DIMENSIONS_ASSIETTE, STATUT_DIMENSION, dimensionsPourCategorie, dimensionsPourAliment, analyserCompositionAssiette };');
  vm.runInContext(source, context, { filename: 'analyseCompositionAssiette.js' });
  return context.module.exports;
}

const {
  DIMENSIONS_ASSIETTE,
  dimensionsPourCategorie,
  dimensionsPourAliment,
  analyserCompositionAssiette
} = chargerModule();

describe('Analyse pédagogique de composition de l’assiette', () => {
  test('reconnaît les catégories historiques avec accents et variantes', () => {
    expect(dimensionsPourCategorie('protéine')).toEqual(['proteine']);
    expect(dimensionsPourCategorie('LÉGUMES')).toEqual(['legume']);
    expect(dimensionsPourCategorie('féculent')).toEqual(['feculent']);
    expect(dimensionsPourCategorie('matières grasses')).toEqual(['matiere_grasse']);
  });

  test('reconnaît les catégories spécialisées déjà présentes dans le référentiel', () => {
    expect(dimensionsPourCategorie('poisson')).toContain(DIMENSIONS_ASSIETTE.PROTEINE);
    expect(dimensionsPourCategorie('charcuterie')).toContain(DIMENSIONS_ASSIETTE.PROTEINE);
    expect(dimensionsPourCategorie('céréales')).toContain(DIMENSIONS_ASSIETTE.FECULENT);
    expect(dimensionsPourCategorie('gras_vegetal')).toContain(DIMENSIONS_ASSIETTE.MATIERE_GRASSE);
  });

  test('une légumineuse peut remplir deux rôles sans modifier sa catégorie source', () => {
    const roles = dimensionsPourCategorie('légumineuse');
    expect(roles).toContain(DIMENSIONS_ASSIETTE.PROTEINE);
    expect(roles).toContain(DIMENSIONS_ASSIETTE.FECULENT);

    const resultat = analyserCompositionAssiette([
      { id: 'lentilles', nom: 'Lentilles', categorie: 'légumineuse' }
    ]);
    expect(resultat.dimensions.proteine.statut).toBe('present');
    expect(resultat.dimensions.feculent.statut).toBe('present');
  });

  test('un rôle explicite peut préciser un aliment ambigu sans changer sa catégorie', () => {
    const aliment = {
      nom: 'Aliment personnalisé',
      categorie: 'ma catégorie',
      rolesAssiette: ['proteine']
    };
    expect(dimensionsPourAliment(aliment)).toEqual(['proteine']);
    const resultat = analyserCompositionAssiette([aliment]);
    expect(resultat.dimensions.proteine.statut).toBe('present');
    expect(resultat.qualiteDonnees.categoriesNonReconnues).toEqual([]);
  });

  test('ne classe pas automatiquement les laitages comme protéines', () => {
    expect(dimensionsPourCategorie('laitier')).toEqual([]);
    expect(dimensionsPourCategorie('fromage')).toEqual([]);
  });

  test('décrit une assiette sans produire de score ni de verdict', () => {
    const resultat = analyserCompositionAssiette([
      { id: '1', nom: 'Saumon frais', categorie: 'poisson' },
      { id: '2', nom: 'Courgette', categorie: 'légume' },
      { id: '3', nom: 'Riz basmati', categorie: 'féculent' },
      { id: '4', nom: 'Avocat', categorie: 'gras_vegetal' }
    ]);

    expect(resultat.version).toBe(2);
    expect(resultat.dimensions.proteine.statut).toBe('present');
    expect(resultat.dimensions.legume.statut).toBe('present');
    expect(resultat.dimensions.feculent.statut).toBe('present');
    expect(resultat.dimensions.matiere_grasse.statut).toBe('present');
    expect(resultat).not.toHaveProperty('score');
    expect(resultat).not.toHaveProperty('conforme');
  });

  test('ne devine pas une dimension depuis le nom d’un aliment', () => {
    const resultat = analyserCompositionAssiette([
      { nom: 'Poulet maison', categorie: 'catégorie personnalisée' }
    ]);

    expect(resultat.dimensions.proteine.statut).toBe('absent');
    expect(resultat.qualiteDonnees.categoriesNonReconnues).toEqual([
      { nom: 'Poulet maison', categorie: 'catégorie personnalisée' }
    ]);
  });

  test('signale séparément la cuisson tant qu’elle n’est pas renseignée', () => {
    expect(analyserCompositionAssiette([]).dimensions.cuisson).toEqual({
      statut: 'non_renseigne', valeur: null
    });

    expect(analyserCompositionAssiette([], { modeCuisson: 'vapeur' }).dimensions.cuisson).toEqual({
      statut: 'renseigne', valeur: 'vapeur'
    });
  });

  test('reste stable sur une assiette vide ou des catégories absentes', () => {
    const resultat = analyserCompositionAssiette([null, { nom: 'Aliment sans catégorie' }]);
    expect(resultat.vide).toBe(false);
    expect(resultat.qualiteDonnees.categoriesRenseignees).toBe(0);
    expect(resultat.dimensions.legume.statut).toBe('absent');
  });
});

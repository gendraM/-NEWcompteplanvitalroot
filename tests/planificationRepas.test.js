const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModules() {
  const contexteSocle = { module: { exports: {} }, exports: {} };
  vm.createContext(contexteSocle);

  const socle = fs.readFileSync(path.join(__dirname, '../lib/socleQuantitesCalories.js'), 'utf8')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { calculerCaloriesAliment, extraireQuantiteReference, normaliserUnite };');
  vm.runInContext(socle, contexteSocle, { filename: 'socleQuantitesCalories.js' });
  const fonctionsSocle = contexteSocle.module.exports;

  const context = { module: { exports: {} }, exports: {}, __socle: fonctionsSocle };
  vm.createContext(context);
  const planification = fs.readFileSync(path.join(__dirname, '../lib/planificationRepas.js'), 'utf8')
    .replace(/import \{[\s\S]*?\} from '\.\/socleQuantitesCalories';/, 'const { calculerCaloriesAliment, extraireQuantiteReference, normaliserUnite } = __socle;')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { trouverAlimentReferentiel, obtenirSaisieParDefaut, serialiserQuantitePlanifiee, extraireQuantitePlanifiee, calculerKcalPlanifiees, normaliserRepasPlanifie, calculerTotauxPlanning };');
  vm.runInContext(planification, context, { filename: 'planificationRepas.js' });
  return context.module.exports;
}

const {
  obtenirSaisieParDefaut,
  serialiserQuantitePlanifiee,
  extraireQuantitePlanifiee,
  calculerKcalPlanifiees,
  normaliserRepasPlanifie,
  calculerTotauxPlanning
} = chargerModules();

const referentiel = [
  { nom: 'Poulet', categorie: 'protéine', portionDefaut: '120g', unite: 'g', kcal: 198 },
  { nom: 'Pomme', categorie: 'fruit', portionDefaut: '1 unité', unite: 'piece', kcal: 80 }
];

describe('Planification enrichie', () => {
  test('préremplit quantité, unité et calories depuis la portion du référentiel', () => {
    expect(obtenirSaisieParDefaut(referentiel[0])).toEqual({ quantite: '120', unite: 'g', kcal: 198 });
    expect(obtenirSaisieParDefaut(referentiel[1])).toEqual({ quantite: '1', unite: 'unité', kcal: 80 });
  });

  test('enregistre la quantité et son unité dans le champ texte existant', () => {
    expect(serialiserQuantitePlanifiee('150', 'grammes')).toBe('150 g');
    expect(serialiserQuantitePlanifiee('2', 'piece')).toBe('2 unité');
    expect(serialiserQuantitePlanifiee('150 g', '')).toBe('150 g');
    expect(serialiserQuantitePlanifiee('', 'g')).toBeNull();
  });

  test('relit la quantité et l’unité d’une occurrence pour créer un modèle composé', () => {
    expect(extraireQuantitePlanifiee('150 grammes')).toEqual({ quantite: 150, unite: 'g' });
    expect(extraireQuantitePlanifiee('2,5 portions')).toEqual({ quantite: 2.5, unite: 'portions' });
    expect(extraireQuantitePlanifiee('ancienne valeur')).toEqual({ quantite: null, unite: '' });
  });

  test('recalcule les calories et accepte une correction explicite', () => {
    expect(calculerKcalPlanifiees(referentiel[0], 60, 'g')).toMatchObject({ kcal: 99, statut: 'ok' });
    expect(calculerKcalPlanifiees(referentiel[0], 60, 'g', 105)).toMatchObject({ kcal: 105, source: 'correction_utilisateur' });
  });

  test('conserve un ancien repas incomplet sans inventer de quantité ou de calories', () => {
    expect(normaliserRepasPlanifie({ aliment: 'Poulet', type: 'Déjeuner' }, referentiel)).toMatchObject({
      quantite_affichee: null,
      kcal_calculees: null,
      donnees_completes: false
    });
  });

  test('retrouve les calories calculables d’un ancien repas qui possède déjà une quantité', () => {
    expect(normaliserRepasPlanifie({ aliment: 'Poulet', type: 'Déjeuner', quantite: '60 g' }, referentiel)).toMatchObject({
      kcal_calculees: 99,
      donnees_completes: true
    });
  });

  test('calcule les totaux par repas et par journée en signalant les journées incomplètes', () => {
    const totaux = calculerTotauxPlanning({
      '2026-08-24': [
        { aliment: 'Poulet', type: 'Déjeuner', quantite: '120 g', kcal: 198 },
        { aliment: 'Pomme', type: 'Déjeuner', quantite: '1 unité', kcal: 80 },
        { aliment: 'Ancien repas', type: 'Dîner' }
      ]
    }, referentiel)['2026-08-24'];

    expect(totaux.parType).toEqual({ Déjeuner: 278 });
    expect(totaux.totalJour).toBe(278);
    expect(totaux).toMatchObject({ elementsComplets: 2, elementsTotal: 3, complet: false });
  });
});

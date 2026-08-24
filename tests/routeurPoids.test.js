const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const filePath = path.join(__dirname, '../lib/routeurPoids.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { calculerBMR, calculerTDEE, calculerBudgetExtras, calculerProfilComplet, estProfilComplet };');

  const context = {
    module: { exports: {} },
    exports: {},
    console: { error: () => {} }
  };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'routeurPoids.js' });
  return context.module.exports;
}

const {
  calculerBMR,
  calculerTDEE,
  calculerBudgetExtras,
  calculerProfilComplet,
  estProfilComplet
} = chargerModule();

describe('Routeur poids utilisé comme référence du budget calorique', () => {
  test('calcule le métabolisme de base avec la formule propre au sexe', () => {
    expect(calculerBMR('F', 40, 165, 70)).toBe(1370);
    expect(calculerBMR('M', 40, 165, 70)).toBe(1536);
  });

  test('applique le coefficient d’activité au BMR', () => {
    expect(calculerTDEE(1370, 'sedentaire')).toBe(1644);
    expect(calculerTDEE(1370, 'modere')).toBe(2055);
    expect(calculerTDEE(1370, 'actif')).toBe(2329);
    expect(calculerTDEE(1370, 'intense')).toBe(2740);
  });

  test('respecte les planchers et plafonds du budget extras actuel', () => {
    expect(calculerBudgetExtras('perte', 2055)).toBe(500);
    expect(calculerBudgetExtras('maintien', 2055)).toBe(700);
    expect(calculerBudgetExtras('prise', 2055)).toBe(1000);
  });

  test('produit l’objectif calorique quotidien du profil sans le confondre avec les extras', () => {
    const resultat = calculerProfilComplet({
      sexe: 'F',
      age: 40,
      taille: 1.65,
      poids_de_depart: 70,
      niveau_activite: 'modere',
      objectif: 'perte'
    });

    expect(resultat).toMatchObject({
      bmr: 1370,
      tdee: 2055,
      budgetExtras: 500,
      deficit_quotidien_perte: 411,
      apport_calorique_cible: 1644
    });
  });

  test('conserve le TDEE comme objectif quotidien hors perte de poids', () => {
    const resultat = calculerProfilComplet({
      sexe: 'M',
      age: 40,
      taille: 165,
      poids_de_depart: 70,
      niveau_activite: 'sedentaire',
      objectif: 'maintien'
    });

    expect(resultat.apport_calorique_cible).toBe(resultat.tdee);
    expect(resultat.deficit_quotidien_perte).toBe(0);
  });

  test('refuse un profil ou des paramètres incomplets au lieu d’inventer une valeur', () => {
    expect(estProfilComplet(null)).toBe(false);
    expect(estProfilComplet({ sexe: 'F' })).toBe(false);
    expect(calculerBMR('F', 0, 165, 70)).toBeNull();
    expect(calculerTDEE(1370, 'inconnu')).toBeNull();
    expect(calculerBudgetExtras('inconnu', 2055)).toBeNull();
  });
});

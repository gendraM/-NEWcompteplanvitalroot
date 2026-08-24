const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = {
    module: { exports: {} }, exports: {},
    __plan: {
      normaliserRepasPlanifie: ligne => ({
        ...ligne,
        quantite_affichee: ligne.quantite ? String(ligne.quantite) : null,
        kcal_calculees: Number.isFinite(Number(ligne.kcal)) && ligne.kcal !== null && ligne.kcal !== '' ? Math.round(Number(ligne.kcal)) : null,
        donnees_completes: Boolean(ligne.quantite) && Number.isFinite(Number(ligne.kcal)) && ligne.kcal !== null && ligne.kcal !== ''
      })
    },
    __routeur: {
      calculerProfilComplet: profil => profil.sexe && profil.age && profil.taille && profil.poids_de_depart && profil.niveau_activite
        ? { apport_calorique_cible: profil.objectif === 'perte' ? 1730 : 2100 }
        : null
    }
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../lib/budgetCaloriquePlan.js'), 'utf8')
    .replace("import { normaliserRepasPlanifie } from './planificationRepas';", 'const { normaliserRepasPlanifie } = __plan;')
    .replace("import { calculerProfilComplet } from './routeurPoids';", 'const { calculerProfilComplet } = __routeur;')
    .replace(/export async function /g, 'async function ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { validerPeriodeBudget, determinerObjectifCaloriqueProfil, chargerObjectifCaloriqueProfil, construireBudgetCaloriquePlan };');
  vm.runInContext(source, context, { filename: 'budgetCaloriquePlan.js' });
  return context.module.exports;
}

const { validerPeriodeBudget, determinerObjectifCaloriqueProfil, chargerObjectifCaloriqueProfil, construireBudgetCaloriquePlan } = chargerModule();

describe('Budget calorique prévisionnel du planning', () => {
  test('refuse une date impossible ou une période inversée', () => {
    expect(validerPeriodeBudget('2026-02-30', '2026-03-02').valide).toBe(false);
    expect(validerPeriodeBudget('2026-08-30', '2026-08-24').valide).toBe(false);
  });

  test('réutilise l’objectif du routeur poids et refuse un profil incomplet', () => {
    expect(determinerObjectifCaloriqueProfil({ sexe: 'F', age: 33, taille: 165, poids_de_depart: 80, objectif: 70, niveau_activite: 'modere' }))
      .toMatchObject({ disponible: true, objectif_calorique_jour: 1730, source: 'routeur_poids', type_objectif: 'perte' });
    expect(determinerObjectifCaloriqueProfil({ poids_de_depart: 80, objectif: 70 }).disponible).toBe(false);
  });

  test('charge exclusivement le dernier profil appartenant à l’utilisateur connecté', async () => {
    const appels = [];
    const requete = {
      select: valeur => { appels.push(['select', valeur]); return requete; },
      eq: (colonne, valeur) => { appels.push(['eq', colonne, valeur]); return requete; },
      order: (colonne, options) => { appels.push(['order', colonne, options]); return requete; },
      limit: async valeur => {
        appels.push(['limit', valeur]);
        return { data: [{ sexe: 'F', age: 33, taille: 165, poids_de_depart: 80, objectif: 70, niveau_activite: 'modere' }], error: null };
      }
    };
    const supabase = { from: table => { appels.push(['from', table]); return requete; } };
    const resultat = await chargerObjectifCaloriqueProfil(supabase, 'user-1');

    expect(resultat).toMatchObject({ disponible: true, objectif_calorique_jour: 1730, error: null });
    expect(appels).toContainEqual(['eq', 'user_id', 'user-1']);
    expect(appels).toContainEqual(['order', 'created_at', { ascending: false }]);
    expect(appels).toContainEqual(['limit', 1]);
  });

  test('structure la période par jour, moment et ingrédient', () => {
    const resultat = construireBudgetCaloriquePlan([
      { id: '1', date: '2026-08-24', type: 'Dîner', aliment: 'Saumon', quantite: '120 g', kcal: 250 },
      { id: '2', date: '2026-08-24', type: 'Déjeuner', aliment: 'Poulet', quantite: '120 g', kcal: 198 },
      { id: '3', date: '2026-08-24', type: 'Déjeuner', aliment: 'Riz', quantite: '80 g', kcal: 104 }
    ], { debut: '2026-08-24', fin: '2026-08-25', objectifCaloriqueJour: 1730 });

    expect(resultat.jours).toHaveLength(2);
    expect(resultat.jours[0].repas.map(item => item.type)).toEqual(['Déjeuner', 'Dîner']);
    expect(resultat.jours[0].repas[0]).toMatchObject({ total_kcal_connues: 302, elements_total: 2, complet: true });
    expect(resultat.jours[0].repas[0].ingredients.map(item => item.aliment)).toEqual(['Poulet', 'Riz']);
    expect(resultat.jours[1]).toMatchObject({ statut: 'vide', repas: [], ecart_calorique: null });
  });

  test('additionne les calories connues sans inventer celles qui manquent', () => {
    const resultat = construireBudgetCaloriquePlan([
      { id: '1', date: '2026-08-24', type: 'Déjeuner', aliment: 'Poulet', quantite: '120 g', kcal: 198 },
      { id: '2', date: '2026-08-24', type: 'Déjeuner', aliment: 'Ancien aliment', quantite: null, kcal: null }
    ], { debut: '2026-08-24', fin: '2026-08-24', objectifCaloriqueJour: 1730 });

    expect(resultat.jours[0]).toMatchObject({ statut: 'incomplet', total_kcal_connues: 198, ecart_calorique: null });
    expect(resultat.jours[0].repas[0].ingredients[1]).toMatchObject({ calories_connues: false, kcal: null });
    expect(resultat.resume).toMatchObject({ total_kcal_connues: 198, jours_incomplets: 1, ecart_calorique_periode: null });
  });

  test('calcule les écarts seulement lorsque la journée et la période sont complètes', () => {
    const resultat = construireBudgetCaloriquePlan([
      { id: '1', date: '2026-08-24', type: 'Déjeuner', aliment: 'Jour 1', quantite: '1 portion', kcal: 1600 },
      { id: '2', date: '2026-08-25', type: 'Dîner', aliment: 'Jour 2', quantite: '1 portion', kcal: 1820 }
    ], { debut: '2026-08-24', fin: '2026-08-25', objectifCaloriqueJour: 1730 });

    expect(resultat.jours.map(item => item.ecart_calorique)).toEqual([-130, 90]);
    expect(resultat.resume).toMatchObject({
      total_kcal_connues: 3420,
      moyenne_kcal_par_jour_periode: 1710,
      objectif_calorique_periode: 3460,
      ecart_calorique_periode: -40,
      periode_complete: true
    });
  });

  test('distingue la moyenne de toute la période de celle des jours renseignés', () => {
    const resultat = construireBudgetCaloriquePlan([
      { id: '1', date: '2026-08-24', type: 'Déjeuner', aliment: 'Repas', quantite: '1 portion', kcal: 1600 }
    ], { debut: '2026-08-24', fin: '2026-08-25' });

    expect(resultat.resume).toMatchObject({
      moyenne_kcal_par_jour_periode: 800,
      moyenne_kcal_par_jour_renseigne: 1600,
      jours_renseignes: 1,
      jours_vides: 1,
      ecart_calorique_periode: null
    });
  });

  test('ne recompte pas une même ligne Supabase', () => {
    const ligne = { id: 'unique', date: '2026-08-24', type: 'Déjeuner', aliment: 'Poulet', quantite: '120 g', kcal: 198 };
    const resultat = construireBudgetCaloriquePlan([ligne, ligne], { debut: '2026-08-24', fin: '2026-08-24' });
    expect(resultat.resume).toMatchObject({ lignes_planifiees: 1, total_kcal_connues: 198 });
  });

  test('conserve les ingrédients photographiés du repas composé sans inventer son nom', () => {
    const resultat = construireBudgetCaloriquePlan([
      { id: '1', date: '2026-08-24', type: 'Déjeuner', aliment: 'Poulet', quantite: '120 g', kcal: 198, combo_valide: true },
      { id: '2', date: '2026-08-24', type: 'Déjeuner', aliment: 'Riz', quantite: '80 g', kcal: 104, combo_valide: true }
    ], { debut: '2026-08-24', fin: '2026-08-24' });

    expect(resultat.jours[0].repas[0].ingredients.map(item => item.aliment)).toEqual(['Poulet', 'Riz']);
    expect(resultat.jours[0].repas[0].ingredients.every(item => item.combo_valide)).toBe(true);
  });
});

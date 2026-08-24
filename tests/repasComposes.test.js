const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = {
    module: { exports: {} },
    exports: {},
    __planification: {
      serialiserQuantitePlanifiee: (quantite, unite) => `${Number(quantite)} ${unite}`
    }
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../lib/repasComposes.js'), 'utf8')
    .replace("import { serialiserQuantitePlanifiee } from './planificationRepas';", 'const { serialiserQuantitePlanifiee } = __planification;')
    .replace(/export async function /g, 'async function ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { normaliserComposantRepas, validerCompositionRepas, calculerResumeRepasCompose, construirePayloadRepasCompose, normaliserRepasCompose, construireOccurrencesPlanifiees, construireOccurrencesReelles };');
  vm.runInContext(source, context, { filename: 'repasComposes.js' });
  return context.module.exports;
}

const {
  validerCompositionRepas,
  calculerResumeRepasCompose,
  construirePayloadRepasCompose,
  normaliserRepasCompose,
  construireOccurrencesPlanifiees,
  construireOccurrencesReelles
} = chargerModule();

const composition = [
  { id: 'poulet', nom: 'Poulet', categorie: 'protéine', quantite: 120, unite: 'g', kcal: 198, qn: 4 },
  { id: 'riz', nom: 'Riz', categorie: 'féculent', quantite: 80, unite: 'g', kcal: 104, qn: 3 },
  { id: 'brocolis', nom: 'Brocolis', categorie: 'légume', quantite: 150, unite: 'g', kcal: 51, qn: 5 }
];

describe('Repas composés réutilisables', () => {
  test('refuse un modèle incomplet ou limité à un seul aliment', () => {
    expect(validerCompositionRepas(composition.slice(0, 1)).valide).toBe(false);
    expect(validerCompositionRepas([{ ...composition[0], kcal: null }, composition[1]]).valide).toBe(false);
  });

  test('calcule les calories totales et le QN moyen pondéré', () => {
    expect(calculerResumeRepasCompose(composition)).toEqual({ kcalTotal: 353, qnMoyen: 3.85, nombreAliments: 3 });
  });

  test('construit le format canonique compatible avec la table existante', () => {
    const resultat = construirePayloadRepasCompose({ userId: 'user-1', nom: 'Poulet riz brocolis', composition });
    expect(resultat.valide).toBe(true);
    expect(resultat.payload).toMatchObject({
      user_id: 'user-1',
      nom: 'Poulet riz brocolis',
      quantite_par_assiette: { version: 1, kcal_total: 353, qn_moyen: 3.85 }
    });
    expect(resultat.payload.composition).toHaveLength(3);
  });

  test('normalise un ancien modèle sans casser son affichage', () => {
    const modele = normaliserRepasCompose({ nom: null, composition: null });
    expect(modele.nom).toBe('Repas sans nom');
    expect(modele.composition).toEqual([]);
    expect(modele.resume.kcalTotal).toBe(0);
  });

  test('planifie chaque composant en une action et photographie les valeurs du modèle', () => {
    const occurrences = construireOccurrencesPlanifiees({ id: 'modele-1', nom: 'Assiette', composition }, {
      userId: 'user-1', date: '2026-08-25', type: 'Déjeuner'
    });
    expect(occurrences).toHaveLength(3);
    expect(occurrences[0]).toMatchObject({ aliment: 'Poulet', quantite: '120 g', kcal: 198, combo_valide: true });
    composition[0].quantite = 999;
    expect(occurrences[0].quantite).toBe('120 g');
    composition[0].quantite = 120;
  });

  test('prépare les lignes consommées avec un identifiant commun sans transformer le nom du modèle en aliment', () => {
    const occurrences = construireOccurrencesReelles({ id: 'modele-1', nom: 'Assiette', composition }, {
      userId: 'user-1', date: '2026-08-25', type: 'Déjeuner', heure: '12:30', satiete: 'oui'
    });
    expect(occurrences).toHaveLength(3);
    expect(occurrences.map(item => item.aliment)).toEqual(['Poulet', 'Riz', 'Brocolis']);
    expect(new Set(occurrences.map(item => item.tag))).toEqual(new Set(['repas_compose:modele-1:Assiette']));
    expect(occurrences[0]).toMatchObject({ heure: '12:30', satiete: 'oui', est_extra: false });
  });
});

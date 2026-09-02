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
    .concat('\nmodule.exports = { genererOccurrenceRepasId, normaliserComposantRepas, validerCompositionRepas, calculerResumeRepasCompose, ajusterCompositionRepas, construirePayloadRepasCompose, normaliserRepasCompose, construireOccurrencesPlanifiees, construireOccurrencesReelles };');
  vm.runInContext(source, context, { filename: 'repasComposes.js' });
  return context.module.exports;
}

const {
  genererOccurrenceRepasId,
  validerCompositionRepas,
  calculerResumeRepasCompose,
  ajusterCompositionRepas,
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

  test('ajuste les quantités et les calories sans modifier le modèle enregistré', () => {
    const origine = JSON.parse(JSON.stringify(composition));
    const resultat = ajusterCompositionRepas(composition, ['60', '100', '150']);

    expect(resultat.valide).toBe(true);
    expect(resultat.composition).toEqual([
      expect.objectContaining({ nom: 'Poulet', quantite: 60, unite: 'g', kcal: 99 }),
      expect.objectContaining({ nom: 'Riz', quantite: 100, unite: 'g', kcal: 130 }),
      expect.objectContaining({ nom: 'Brocolis', quantite: 150, unite: 'g', kcal: 51 })
    ]);
    expect(resultat.resume.kcalTotal).toBe(280);
    expect(composition).toEqual(origine);

    const occurrences = construireOccurrencesReelles({ id: 'modele-1', nom: 'Assiette', composition: resultat.composition }, {
      userId: 'user-1', date: '2026-09-02', type: 'Dîner'
    });
    expect(occurrences[0]).toMatchObject({ aliment: 'Poulet', quantite: '60 g', kcal: 99 });
    expect(occurrences[1]).toMatchObject({ aliment: 'Riz', quantite: '100 g', kcal: 130 });
  });

  test('refuse une quantité vide, nulle ou négative', () => {
    expect(ajusterCompositionRepas(composition, ['', '80', '150']).valide).toBe(false);
    expect(ajusterCompositionRepas(composition, ['120', '0', '150']).valide).toBe(false);
    expect(ajusterCompositionRepas(composition, ['120', '80', '-1']).valide).toBe(false);
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

  test('génère un identifiant UUID v4 pour une nouvelle occurrence', () => {
    const ids = Array.from({ length: 100 }, () => genererOccurrenceRepasId());
    const formatUuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(ids.every(id => formatUuidV4.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(100);
  });

  test('prépare les lignes consommées avec un identifiant commun sans transformer le nom du modèle en aliment', () => {
    const occurrences = construireOccurrencesReelles({ id: 'modele-1', nom: 'Assiette', composition }, {
      userId: 'user-1', date: '2026-08-25', type: 'Déjeuner', heure: '12:30', satiete: 'oui'
    });
    expect(occurrences).toHaveLength(3);
    expect(occurrences.map(item => item.aliment)).toEqual(['Poulet', 'Riz', 'Brocolis']);
    expect(new Set(occurrences.map(item => item.tag))).toEqual(new Set(['repas_compose:modele-1:Assiette']));
    expect(new Set(occurrences.map(item => item.occurrence_repas_id)).size).toBe(1);
    expect(occurrences[0].occurrence_repas_id).toBeTruthy();
    expect(occurrences[0]).toMatchObject({ heure: '12:30', satiete: 'oui', est_extra: false });
  });

  test('deux consommations du même modèle reçoivent deux occurrences différentes', () => {
    const contexte = { userId: 'user-1', date: '2026-08-25', type: 'Déjeuner' };
    const premiere = construireOccurrencesReelles({ id: 'modele-1', nom: 'Assiette', composition }, contexte);
    const seconde = construireOccurrencesReelles({ id: 'modele-1', nom: 'Assiette', composition }, contexte);
    expect(premiere[0].occurrence_repas_id).not.toBe(seconde[0].occurrence_repas_id);
  });

  test('accepte un identifiant fourni par le repas en cours', () => {
    const occurrenceRepasId = '123e4567-e89b-42d3-a456-426614174000';
    const occurrences = construireOccurrencesReelles({ id: 'modele-1', nom: 'Assiette', composition }, {
      userId: 'user-1', date: '2026-08-25', type: 'Déjeuner', occurrenceRepasId
    });
    expect(occurrences.every(item => item.occurrence_repas_id === occurrenceRepasId)).toBe(true);
  });
});

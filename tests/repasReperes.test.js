const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const contexteAlignement = { module: { exports: {} }, exports: {} };
  vm.createContext(contexteAlignement);
  const alignement = fs.readFileSync(path.join(__dirname, '../lib/alignementRepas.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { regrouperRepasReelsParOccurrence };');
  vm.runInContext(alignement, contexteAlignement, { filename: 'alignementRepas.js' });

  const contexte = {
    module: { exports: {} },
    exports: {},
    __alignement: contexteAlignement.module.exports
  };
  vm.createContext(contexte);
  const source = fs.readFileSync(path.join(__dirname, '../lib/repasReperes.js'), 'utf8')
    .replace("import { regrouperRepasReelsParOccurrence } from './alignementRepas';", 'const { regrouperRepasReelsParOccurrence } = __alignement;')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { CONFIG_REPAS_REPERES, detecterCandidatsRepasReperes };');
  vm.runInContext(source, contexte, { filename: 'repasReperes.js' });
  return contexte.module.exports;
}

const { detecterCandidatsRepasReperes } = chargerModule();

function occurrence(id, date, aliments, contexte = {}) {
  return aliments.map((aliment, index) => ({
    id: `${id}-${index}`,
    occurrence_repas_id: id,
    date,
    type: 'Dîner',
    aliment: aliment.aliment,
    categorie: aliment.categorie,
    quantite: aliment.quantite,
    kcal: aliment.kcal,
    created_at: `${date}T19:00:0${index}Z`,
    ...contexte
  }));
}

const assiette = [
  { aliment: 'Poisson blanc', categorie: 'poisson', quantite: '120 g', kcal: 110 },
  { aliment: 'Haricots verts', categorie: 'légume', quantite: '150 g', kcal: 45 }
];

describe('Détection des repas repères', () => {
  test('ne propose rien avant trois occurrences comparables', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-09-01', assiette, { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-09-03', assiette, { ressenti: 'satisfait' })
    ];
    expect(detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' })).toEqual([]);
  });

  test('reconnaît une composition répétée indépendamment de l’ordre des aliments', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-08-25', assiette, { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-08-30', [...assiette].reverse(), { ressenti: 'léger' }),
      ...occurrence('occ-3', '2026-09-05', assiette, { repas_planifie_respecte: true })
    ];
    const [resultat] = detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' });
    expect(resultat).toMatchObject({
      nombreOccurrences: 3,
      nombreResultatsPositifs: 3,
      premiereDate: '2026-08-25',
      derniereDate: '2026-09-05',
      kcalTotal: 155,
      signaux: { alignement: 1, satiete: 1, ressenti: 1 }
    });
  });

  test('exige plusieurs occurrences associées à un résultat positif', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-08-25', assiette, { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-08-30', assiette),
      ...occurrence('occ-3', '2026-09-05', assiette)
    ];
    expect(detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' })).toEqual([]);
  });

  test('ignore les lignes historiques sans identifiant et les repas mono-aliment', () => {
    const historiques = [
      { id: 1, date: '2026-09-01', aliment: 'Poisson blanc', satiete: 'oui' },
      { id: 2, date: '2026-09-01', aliment: 'Haricots verts', satiete: 'oui' }
    ];
    const monos = [1, 2, 3].flatMap(numero => occurrence(
      `mono-${numero}`,
      `2026-09-0${numero}`,
      [assiette[0]],
      { satiete: 'oui' }
    ));
    expect(detecterCandidatsRepasReperes([...historiques, ...monos], { dateReference: '2026-09-06' })).toEqual([]);
  });

  test('exclut les occurrences qui sont des extras ou des fast-foods', () => {
    const cas = [
      [
        ...occurrence('occ-1', '2026-08-25', assiette, { satiete: 'oui' }),
        ...occurrence('occ-2', '2026-08-30', assiette, { satiete: 'oui' }),
        ...occurrence('occ-3', '2026-09-05', assiette, { est_extra: true })
      ],
      [
        ...occurrence('occ-1', '2026-08-25', assiette, { satiete: 'oui' }),
        ...occurrence('occ-2', '2026-08-30', assiette, { satiete: 'oui' }),
        ...occurrence('occ-3', '2026-09-05', assiette, { tag: 'fast-food:restaurant' })
      ]
    ];
    cas.forEach(lignes => {
      expect(detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' })).toEqual([]);
    });
  });

  test('reconnaît aussi le champ historique de satiété lorsqu’une occurrence le possède', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-08-25', assiette, { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-08-30', assiette, { 'satiété_respectée': 'oui' }),
      ...occurrence('occ-3', '2026-09-05', assiette)
    ];
    const [resultat] = detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' });
    expect(resultat).toMatchObject({
      nombreResultatsPositifs: 2,
      signaux: { alignement: 0, satiete: 2, ressenti: 0 }
    });
  });

  test('applique une fenêtre inclusive de quinze jours et ignore les dates futures', () => {
    const lignes = [
      ...occurrence('hors-fenetre', '2026-08-22', assiette, { satiete: 'oui' }),
      ...occurrence('borne', '2026-08-23', assiette, { satiete: 'oui' }),
      ...occurrence('milieu', '2026-08-30', assiette, { satiete: 'oui' }),
      ...occurrence('reference', '2026-09-06', assiette),
      ...occurrence('future', '2026-09-07', assiette, { satiete: 'oui' })
    ];
    const [resultat] = detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' });
    expect(resultat).toMatchObject({ nombreOccurrences: 3, premiereDate: '2026-08-23', derniereDate: '2026-09-06' });
  });

  test('reprend la composition complète de l’occurrence positive la plus récente sans inventer les valeurs absentes', () => {
    const assietteRecente = [
      { aliment: 'Poisson blanc', categorie: 'poisson', quantite: '180 g', kcal: 165 },
      { aliment: 'Haricots verts', categorie: 'légume', quantite: null, kcal: null }
    ];
    const lignes = [
      ...occurrence('occ-1', '2026-08-25', assiette, { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-08-30', assiette, { repas_planifie_respecte: true }),
      ...occurrence('occ-3', '2026-09-05', assietteRecente, { ressenti: 'J’assume' })
    ];
    const [resultat] = detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' });
    expect(resultat.composition).toEqual([
      expect.objectContaining({ aliment: 'Poisson blanc', quantite: '180 g', kcal: 165 }),
      expect.objectContaining({ aliment: 'Haricots verts', quantite: null, kcal: null })
    ]);
    expect(resultat.kcalTotal).toBeNull();
    expect(resultat.raison).toContain('3 fois ces quinze derniers jours');
  });

  test('ne modifie pas les lignes reçues', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-08-25', assiette, { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-08-30', assiette, { satiete: 'oui' }),
      ...occurrence('occ-3', '2026-09-05', assiette)
    ];
    const origine = JSON.parse(JSON.stringify(lignes));
    detecterCandidatsRepasReperes(lignes, { dateReference: '2026-09-06' });
    expect(lignes).toEqual(origine);
  });
});

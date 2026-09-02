const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../lib/alignementRepas.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { STATUTS_ALIGNEMENT_REPAS, LIBELLES_ALIGNEMENT_REPAS, classifierAlignementRepas, regrouperRepasReelsParOccurrence, calculerScoreAlignementParOccurrence, obtenirDerniereOccurrenceRepas };');
  vm.runInContext(source, context, { filename: 'alignementRepas.js' });
  return context.module.exports;
}

const {
  STATUTS_ALIGNEMENT_REPAS,
  classifierAlignementRepas,
  regrouperRepasReelsParOccurrence,
  calculerScoreAlignementParOccurrence,
  obtenirDerniereOccurrenceRepas
} = chargerModule();

const planCompose = [
  { aliment: 'Poisson blanc', categorie: 'poisson' },
  { aliment: 'Haricots verts', categorie: 'légume' }
];

describe('Alignement automatique d’un repas', () => {
  test('reconnaît automatiquement la même recette composée', () => {
    const resultat = classifierAlignementRepas(planCompose, [
      { aliment: 'haricots verts', categorie: 'LÉGUME' },
      { aliment: 'Poisson blanc', categorie: 'poisson' }
    ]);

    expect(resultat).toMatchObject({
      statut: STATUTS_ALIGNEMENT_REPAS.ALIGNE,
      correspondances: 2,
      lignesPlanifiees: 2
    });
  });

  test('considère une substitution de même catégorie comme alignée', () => {
    const resultat = classifierAlignementRepas(planCompose, [
      { aliment: 'Saumon', categorie: 'poisson' },
      { aliment: 'Brocolis', categorie: 'legume' },
      { aliment: 'Citron', categorie: 'condiment' }
    ]);

    expect(resultat.statut).toBe(STATUTS_ALIGNEMENT_REPAS.ALIGNE);
  });

  test('qualifie d’ajusté un repas qui conserve une partie du plan', () => {
    const resultat = classifierAlignementRepas(planCompose, [
      { aliment: 'Poisson blanc', categorie: 'poisson' },
      { aliment: 'Riz', categorie: 'féculent' }
    ]);

    expect(resultat).toMatchObject({
      statut: STATUTS_ALIGNEMENT_REPAS.AJUSTE,
      correspondances: 1
    });
  });

  test('qualifie de spontané un autre choix sans correspondance', () => {
    const resultat = classifierAlignementRepas(planCompose, [
      { aliment: 'Pizza', categorie: 'fast-food' }
    ]);

    expect(resultat.statut).toBe(STATUTS_ALIGNEMENT_REPAS.SPONTANE);
  });

  test('qualifie de libre un repas saisi sans planning', () => {
    expect(classifierAlignementRepas([], [{ aliment: 'Soupe' }]).statut)
      .toBe(STATUTS_ALIGNEMENT_REPAS.LIBRE);
  });

  test('n’affiche aucun jugement tant que le repas n’est pas saisi', () => {
    expect(classifierAlignementRepas(planCompose, []).statut)
      .toBe(STATUTS_ALIGNEMENT_REPAS.EN_ATTENTE);
  });

  test('respecte la confirmation historique mono-aliment', () => {
    const resultat = classifierAlignementRepas(
      [{ aliment: 'Poulet', categorie: 'protéine' }],
      [{ aliment: 'Autre aliment', categorie: 'autre', repas_planifie_respecte: true }]
    );

    expect(resultat).toMatchObject({
      statut: STATUTS_ALIGNEMENT_REPAS.ALIGNE,
      source: 'confirmation_existante'
    });
  });

  test('regroupe toutes les lignes d’une même occurrence sans mélanger les repas', () => {
    const lignes = [
      { id: 1, date: '2026-09-02', type: 'Dîner', aliment: 'Poisson', occurrence_repas_id: 'occ-1' },
      { id: 2, date: '2026-09-02', type: 'Dîner', aliment: 'Haricots', occurrence_repas_id: 'occ-1' },
      { id: 3, date: '2026-09-02', type: 'Déjeuner', aliment: 'Soupe', occurrence_repas_id: 'occ-2' }
    ];

    const groupes = regrouperRepasReelsParOccurrence(lignes, { date: '2026-09-02', type: 'Dîner' });
    expect(groupes).toHaveLength(1);
    expect(groupes[0].lignes.map(ligne => ligne.aliment)).toEqual(['Poisson', 'Haricots']);
  });

  test('sélectionne l’occurrence complète la plus récente', () => {
    const lignes = [
      { date: '2026-09-02', type: 'Dîner', aliment: 'Soupe', occurrence_repas_id: 'ancienne', created_at: '2026-09-02T18:00:00Z' },
      { date: '2026-09-02', type: 'Dîner', aliment: 'Poisson', occurrence_repas_id: 'recente', created_at: '2026-09-02T20:00:00Z' },
      { date: '2026-09-02', type: 'Dîner', aliment: 'Haricots', occurrence_repas_id: 'recente', created_at: '2026-09-02T20:00:01Z' }
    ];

    expect(obtenirDerniereOccurrenceRepas(lignes, { date: '2026-09-02', type: 'Dîner' }))
      .toHaveLength(2);
  });

  test('compte une assiette composée comme une seule occurrence dans le score', () => {
    const resultat = calculerScoreAlignementParOccurrence([
      { id: 1, type: 'Dîner', aliment: 'Poisson', categorie: 'poisson', occurrence_repas_id: 'occ-1' },
      { id: 2, type: 'Dîner', aliment: 'Haricots', categorie: 'légume', occurrence_repas_id: 'occ-1' },
      { id: 3, type: 'Déjeuner', aliment: 'Pizza', categorie: 'fast-food', occurrence_repas_id: 'occ-2', est_extra: true }
    ], {
      Dîner: planCompose,
      Déjeuner: [{ aliment: 'Soupe', categorie: 'légume' }]
    });

    expect(resultat).toEqual({ score: 50, occurrences: 2, alignees: 1 });
  });

  test('préserve chaque ligne historique sans identifiant comme une occurrence distincte', () => {
    const resultat = calculerScoreAlignementParOccurrence([
      { id: 10, type: 'Dîner', aliment: 'Soupe', repas_planifie_respecte: true },
      { id: 11, type: 'Déjeuner', aliment: 'Pizza', est_extra: true }
    ]);

    expect(resultat).toEqual({ score: 50, occurrences: 2, alignees: 1 });
  });

  test('conserve la confirmation historique au niveau de toute l’occurrence', () => {
    const resultat = calculerScoreAlignementParOccurrence([
      { type: 'Dîner', aliment: 'Poisson', occurrence_repas_id: 'occ-confirmee', repas_planifie_respecte: true },
      { type: 'Dîner', aliment: 'Haricots', occurrence_repas_id: 'occ-confirmee' }
    ]);

    expect(resultat).toEqual({ score: 100, occurrences: 1, alignees: 1 });
  });

  test('ne transforme pas un repas libre ou vide en repas aligné', () => {
    expect(calculerScoreAlignementParOccurrence([
      { id: 20, type: 'Dîner', aliment: 'Soupe' }
    ], {})).toEqual({ score: 0, occurrences: 1, alignees: 0 });
    expect(calculerScoreAlignementParOccurrence([], {}))
      .toEqual({ score: 0, occurrences: 0, alignees: 0 });
  });
});

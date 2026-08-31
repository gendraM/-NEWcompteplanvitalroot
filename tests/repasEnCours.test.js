import { construirePayloadRepasEnCours } from '../lib/repasEnCours';

describe('construirePayloadRepasEnCours', () => {
  const contexte = {
    type: 'Déjeuner',
    date: '2026-08-31',
    heure: '12:30',
    satiete: 'oui',
    ressenti: 'satisfait',
    note: 'Repas test',
  };

  test('conserve le comportement mono-aliment avec une occurrence', () => {
    const lignes = construirePayloadRepasEnCours([
      { aliment: 'Poulet', categorie: 'volaille', quantite: 120, kcal: 180 }
    ], contexte, '11111111-1111-4111-8111-111111111111');

    expect(lignes).toHaveLength(1);
    expect(lignes[0]).toMatchObject({
      aliment: 'Poulet',
      type: 'Déjeuner',
      satiete: 'oui',
      occurrence_repas_id: '11111111-1111-4111-8111-111111111111',
    });
  });

  test('partage la même occurrence entre plusieurs aliments', () => {
    const lignes = construirePayloadRepasEnCours([
      { aliment: 'Poulet', categorie: 'volaille', quantite: 120, kcal: 180 },
      { aliment: 'Haricots verts', categorie: 'légumes', quantite: 150, kcal: 45 },
      { aliment: 'Patate douce', categorie: 'féculent', quantite: 120, kcal: 108 },
    ], contexte, '22222222-2222-4222-8222-222222222222');

    expect(lignes).toHaveLength(3);
    expect(new Set(lignes.map(ligne => ligne.occurrence_repas_id))).toEqual(
      new Set(['22222222-2222-4222-8222-222222222222'])
    );
  });

  test('partage le contexte global sans écraser les données propres à chaque aliment', () => {
    const lignes = construirePayloadRepasEnCours([
      { aliment: 'Poulet', est_extra: false, regle_respectee: true },
      { aliment: 'Glace', est_extra: true, regle_respectee: false },
    ], contexte, '33333333-3333-4333-8333-333333333333');

    expect(lignes[0]).toMatchObject({ satiete: 'oui', ressenti: 'satisfait', est_extra: false, regle_respectee: true });
    expect(lignes[1]).toMatchObject({ satiete: 'oui', ressenti: 'satisfait', est_extra: true, regle_respectee: false });
  });

  test('refuse un repas vide', () => {
    expect(() => construirePayloadRepasEnCours([], contexte)).toThrow('Au moins un aliment');
  });
});

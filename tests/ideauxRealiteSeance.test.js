import { analyserRealisationSeance, construireSignauxPalier } from '../lib/ideauxRealiteSeance';

describe('réalité des séances Idéaux', () => {
  test('une séance prévue lundi réalisée mardi reste une séance prévue', () => {
    const analyse = analyserRealisationSeance({
      fait: true,
      bonus: false,
      date_prevue: '2026-09-21',
      date_reelle: '2026-09-22',
      duree_prevue: 10,
      duree_reelle: 14,
    });

    expect(analyse.decalee).toBe(true);
    expect(analyse.datePrevue).toBe('2026-09-21');
    expect(analyse.dateReelle).toBe('2026-09-22');
    expect(analyse.depassementDuree).toBe(4);
    expect(analyse.depasseObjectif).toBe(true);
  });

  test('un dépassement isolé est valorisé sans devenir automatiquement un nouveau standard', () => {
    const signaux = construireSignauxPalier([
      { fait: true, bonus: false, duree_prevue: 10, duree_reelle: 14 },
      { fait: true, bonus: false, duree_prevue: 10, duree_reelle: 10 },
      { fait: true, bonus: false, duree_prevue: 10, duree_reelle: 10 },
    ]);

    expect(signaux.depassementsObjectif).toBe(1);
    expect(signaux.depassementRepete).toBe(false);
  });

  test('des dépassements répétés deviennent un signal pour le prochain palier', () => {
    const signaux = construireSignauxPalier([
      { fait: true, bonus: false, duree_prevue: 10, duree_reelle: 14 },
      { fait: true, bonus: false, duree_prevue: 10, duree_reelle: 13 },
      { fait: true, bonus: false, duree_prevue: 10, duree_reelle: 12 },
      { fait: true, bonus: false, duree_prevue: 10, duree_reelle: 10 },
    ]);

    expect(signaux.depassementsObjectif).toBe(3);
    expect(signaux.depassementRepete).toBe(true);
    expect(signaux.dureeMoyenneReelle).toBe(12);
  });

  test('une vraie séance supplémentaire reste distincte', () => {
    expect(analyserRealisationSeance({
      fait: true,
      bonus: true,
      duree_prevue: 10,
      duree_reelle: 14,
    })).toBeNull();
  });
});

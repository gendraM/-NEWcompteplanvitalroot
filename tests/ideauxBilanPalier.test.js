import { calculerBilanPalier } from '../lib/ideauxBilanPalier';

describe('bilan du palier Idéaux', () => {
  const ideal = {
    id: 'ideal-1',
    plan_params_valides: { palierDuree: 1 },
    plan_data: {
      mois: [{
        numero: 9,
        annee: 2026,
        semaines: [{
          numero: 1,
          actions: [
            { date: '2026-09-14' },
            { date: '2026-09-16' },
          ],
        }],
      }],
    },
  };

  test('sépare les séances prévues réalisées des séances supplémentaires', () => {
    const bilan = calculerBilanPalier(ideal, [
      { ideal_id: 'ideal-1', date_prevue: '2026-09-14', fait: true, bonus: false },
      { ideal_id: 'ideal-1', date_prevue: '2026-09-16', fait: true, bonus: false },
      { ideal_id: 'ideal-1', date_prevue: '2026-09-18', fait: true, bonus: true },
    ]);

    expect(bilan).toEqual({
      totalPrevu: 2,
      realisePrevu: 2,
      engagementPourcentage: 100,
      engagementTermine: true,
      supplementaires: 1,
      totalReel: 3,
    });
  });

  test('un bonus ne transforme pas le respect du programme en 150%', () => {
    const bilan = calculerBilanPalier(ideal, [
      { date_prevue: '2026-09-14', fait: true, bonus: false },
      { date_prevue: '2026-09-16', fait: true, bonus: false },
      { date_prevue: '2026-09-18', fait: true, bonus: true },
    ]);

    expect(bilan.engagementPourcentage).toBe(100);
    expect(bilan.supplementaires).toBe(1);
    expect(bilan.totalReel).toBe(3);
  });

  test('conserve la réalité complète quand une séance prévue manque mais des bonus existent', () => {
    const bilan = calculerBilanPalier(ideal, [
      { date_prevue: '2026-09-14', fait: true, bonus: false },
      { date_prevue: '2026-09-18', fait: true, bonus: true },
      { date_prevue: '2026-09-20', fait: true, bonus: true },
    ]);

    expect(bilan).toEqual({
      totalPrevu: 2,
      realisePrevu: 1,
      engagementPourcentage: 50,
      engagementTermine: false,
      supplementaires: 2,
      totalReel: 3,
    });
  });

  test('ne compte pas un bonus seulement enregistré mais non réalisé', () => {
    const bilan = calculerBilanPalier(ideal, [
      { date_prevue: '2026-09-14', fait: true, bonus: false },
      { date_prevue: '2026-09-18', fait: false, bonus: true },
    ]);

    expect(bilan.supplementaires).toBe(0);
    expect(bilan.totalReel).toBe(1);
  });
});

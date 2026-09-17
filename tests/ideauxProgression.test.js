import { rattacherProgressionAuxIdeaux } from '../lib/ideauxProgression';

describe('rattacherProgressionAuxIdeaux', () => {
  it('rattache les séances au bon idéal et calcule le palier validé', () => {
    const ideaux = [{
      id: 'ideal-1',
      plan_params_valides: { palierDuree: 1 },
      plan_data: {
        mois: [{ numero: 9, annee: 2026, semaines: [{ numero: 1, actions: [{ date: '2026-09-14' }, { date: '2026-09-16' }] }] }],
      },
    }];
    const seances = [
      { ideal_id: 'ideal-1', date_prevue: '2026-09-14', fait: true, bonus: false },
      { ideal_id: 'ideal-1', date_prevue: '2026-09-16', fait: false, bonus: false },
      { ideal_id: 'autre', date_prevue: '2026-09-14', fait: true, bonus: false },
    ];

    const [ideal] = rattacherProgressionAuxIdeaux(ideaux, seances);
    expect(ideal.seances_reelles).toHaveLength(2);
    expect(ideal.progression_palier).toEqual({ total: 2, faites: 1, pourcentage: 50, termine: false });
  });
});

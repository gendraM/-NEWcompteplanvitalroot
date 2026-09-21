import {
  calculerProgressionPalier,
  extraireSemainesPalier,
  getPalierDureeSemaines,
  normaliserSeancePourEcriture,
  seanceEstFaite,
} from '../lib/ideauxPalier';

describe('socle Idéaux - palier', () => {
  const plan = {
    mois: [
      {
        numero: 9,
        annee: 2026,
        semaines: [
          { numero: 1, actions: [{ date: '2026-09-01' }] },
          { numero: 2, actions: [{ date: '2026-09-08' }] },
          { numero: 3, actions: [{ date: '2026-09-15' }] },
          { numero: 4, actions: [{ date: '2026-09-22' }] },
        ],
      },
    ],
  };

  test('utilise la durée du palier validé au lieu de forcer 4 semaines', () => {
    const ideal = { plan_params_valides: { palierDuree: 3 } };
    expect(getPalierDureeSemaines(ideal)).toBe(3);
    expect(extraireSemainesPalier(plan, ideal)).toHaveLength(3);
  });

  test('garde 4 semaines uniquement comme fallback pour les anciens idéaux', () => {
    expect(getPalierDureeSemaines({})).toBe(4);
  });

  test('fait=true est la seule preuve de réalisation', () => {
    expect(seanceEstFaite({ fait: true, statut: 'fait' })).toBe(true);
    expect(seanceEstFaite({ fait: false, statut: 'fait' })).toBe(false);
    expect(seanceEstFaite({ statut: 'fait' })).toBe(false);
  });

  test('normalise aussi le décochage pour ne pas conserver un ancien statut fait', () => {
    const normalisee = normaliserSeancePourEcriture({ fait: false, statut: 'fait', date_reelle: '2026-09-17' });
    expect(normalisee.fait).toBe(false);
    expect(normalisee.statut).toBe('à faire');
    expect(normalisee.date_reelle).toBeNull();
  });

  test('calcule la progression uniquement sur les séances prévues du palier', () => {
    const semaines = extraireSemainesPalier(plan, { plan_params_valides: { palierDuree: 3 } });
    const progression = calculerProgressionPalier(semaines, [
      { date_prevue: '2026-09-01', fait: true, bonus: false },
      { date_prevue: '2026-09-08', fait: true, bonus: false },
      { date_prevue: '2026-09-15', fait: false, bonus: false },
      { date_prevue: '2026-09-22', fait: true, bonus: false },
      { date_prevue: '2026-09-15', fait: true, bonus: true },
    ]);

    expect(progression).toEqual({ total: 3, faites: 2, pourcentage: 67, termine: false });
  });

  test('ne dépasse jamais 100% si une séance prévue est présente plusieurs fois', () => {
    const semaines = [{ numero: 1, actions: [{ date: '2026-09-01' }] }];
    const progression = calculerProgressionPalier(semaines, [
      { date_prevue: '2026-09-01', fait: true, bonus: false },
      { date_prevue: '2026-09-01', fait: true, bonus: false },
    ]);

    expect(progression).toEqual({ total: 1, faites: 1, pourcentage: 100, termine: true });
  });

  test('ignore les actions sans date exploitable dans le dénominateur', () => {
    const progression = calculerProgressionPalier([
      { numero: 1, actions: [{ date: '2026-09-01' }, {}, { date: null }] },
    ], [
      { date_prevue: '2026-09-01', fait: true, bonus: false },
    ]);

    expect(progression).toEqual({ total: 1, faites: 1, pourcentage: 100, termine: true });
  });
});

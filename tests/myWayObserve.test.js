import { buildIdeauxObservations, buildMealObservation, buildWeightObservation } from '../lib/myWayObserve';

describe('P5.1 OBSERVE déterministe', () => {
  test('regroupe les lignes aliments d’un même repas avant de compter les extras', () => {
    const fact = buildMealObservation([
      { date: '2026-09-01', type: 'Déjeuner', heure: '12:00', occurrence_repas_id: 'a', est_extra: false },
      { date: '2026-09-01', type: 'Déjeuner', heure: '12:00', occurrence_repas_id: 'a', est_extra: true },
      { date: '2026-09-01', type: 'Dîner', heure: '19:00', occurrence_repas_id: 'b', est_extra: false },
      { date: '2026-09-02', type: 'Déjeuner', heure: '12:00', occurrence_repas_id: 'c', est_extra: false },
      { date: '2026-09-02', type: 'Dîner', heure: '19:00', occurrence_repas_id: 'd', est_extra: false },
    ]);
    expect(fact.metrics).toEqual({ mealCount: 4, extraCount: 1 });
    expect(fact.text).toContain('4 repas');
    expect(fact.text).toContain('1 marqué comme extra');
  });

  test('retourne NO FACT implicite si les repas sont trop peu nombreux', () => {
    expect(buildMealObservation([{ date: '2026-09-01', type: 'Dîner', heure: '19:00' }])).toBeNull();
  });

  test('le poids reste une variation mesurée sans interprétation', () => {
    const fact = buildWeightObservation([
      { date: '2026-08-01', poids: 100 },
      { date: '2026-09-01', poids: 98.5 },
    ]);
    expect(fact.metrics.delta).toBe(-1.5);
    expect(fact.text).toContain('variation -1,5 kg');
    expect(fact.text).not.toMatch(/réussi|progrès|mieux|bravo/i);
  });

  test('Idéaux compte seulement les séances arrivées et fait=true', () => {
    const facts = buildIdeauxObservations(
      [{ id: 'ideal-1', titre: 'Courir 6 km' }],
      [
        { ideal_id: 'ideal-1', date_prevue: '2026-09-01', fait: true },
        { ideal_id: 'ideal-1', date_prevue: '2026-09-02', fait: false, statut: 'fait' },
        { ideal_id: 'ideal-1', date_prevue: '2026-10-01', fait: true },
      ],
      new Date('2026-09-09T12:00:00Z')
    );
    expect(facts).toHaveLength(1);
    expect(facts[0].metrics).toEqual({ idealId: 'ideal-1', plannedCount: 2, completedCount: 1 });
  });
});

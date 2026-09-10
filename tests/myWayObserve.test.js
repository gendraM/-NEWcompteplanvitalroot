import { buildIdeauxObservations, buildIdeauxRecoveryTrends, buildMealObservation, buildWeightObservation } from '../lib/myWayObserve';

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

const NOW = new Date('2026-09-10T12:00:00Z');
const IDEAL = [{ id: 'ideal-1', titre: 'Bouger régulièrement' }];
const s = (date_prevue, fait, extra = {}) => ({ ideal_id: 'ideal-1', date_prevue, fait, ...extra });

describe('P5.2 tendance de reprise après interruption', () => {
  test('détecte une reprise plus rapide', () => {
    const trend = buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', false), s('2026-07-20', false), s('2026-07-21', true),
      s('2026-07-27', false), s('2026-07-28', false), s('2026-07-29', true),
      s('2026-08-18', false), s('2026-08-19', true),
      s('2026-08-28', false), s('2026-08-29', true),
    ], NOW)[0];
    expect(trend.direction).toBe('faster');
    expect(trend.evidenceLevel).toBe('P3');
    expect(trend.metrics.previousEpisodeCount).toBe(2);
    expect(trend.metrics.recentEpisodeCount).toBe(2);
    expect(trend.metrics.previousAverageMissedBeforeRecovery).toBe(2.5);
    expect(trend.metrics.recentAverageMissedBeforeRecovery).toBe(1);
  });

  test('retourne aucun trend si une période a moins de 2 épisodes', () => {
    expect(buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', false), s('2026-07-20', true),
      s('2026-08-18', false), s('2026-08-19', true),
      s('2026-08-28', false), s('2026-08-29', true),
    ], NOW)).toEqual([]);
  });

  test('retourne aucun trend sous les seuils de changement', () => {
    expect(buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', false), s('2026-07-20', true),
      s('2026-07-27', false), s('2026-07-28', false), s('2026-07-29', true),
      s('2026-08-18', false), s('2026-08-19', false), s('2026-08-20', true),
      s('2026-08-28', false), s('2026-08-29', false), s('2026-08-30', true),
    ], NOW)).toEqual([]);
  });

  test('exclut les séances futures', () => {
    const trends = buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', false), s('2026-07-20', true),
      s('2026-07-27', false), s('2026-07-28', false), s('2026-07-29', true),
      s('2026-08-18', false), s('2026-08-19', true),
      s('2026-08-28', false), s('2026-08-29', true),
      s('2026-09-11', false), s('2026-09-12', false), s('2026-09-13', true),
    ], NOW);
    expect(trends[0].metrics.recentEpisodeCount).toBe(2);
  });

  test('utilise uniquement fait === true comme preuve de réalisation', () => {
    const trends = buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', false), s('2026-07-20', true),
      s('2026-07-27', false), s('2026-07-28', false), s('2026-07-29', true),
      s('2026-08-18', false, { statut: 'fait' }), s('2026-08-19', true),
      s('2026-08-28', false, { statut: 'fait' }), s('2026-08-29', true),
    ], NOW);
    expect(trends[0].metrics.recentAverageMissedBeforeRecovery).toBe(1);
  });

  test('statut fait avec fait=false ne constitue pas une reprise', () => {
    const trends = buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', false), s('2026-07-20', true),
      s('2026-07-27', false), s('2026-07-28', false), s('2026-07-29', true),
      s('2026-08-18', false), s('2026-08-19', false, { statut: 'fait' }), s('2026-08-20', true),
      s('2026-08-28', false), s('2026-08-29', false, { statut: 'fait' }), s('2026-08-30', true),
    ], NOW);
    expect(trends).toEqual([]);
  });

  test('détecte aussi une reprise plus lente', () => {
    const trend = buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', true),
      s('2026-07-27', false), s('2026-07-28', true),
      s('2026-08-18', false), s('2026-08-19', false), s('2026-08-20', true),
      s('2026-08-28', false), s('2026-08-29', false), s('2026-08-30', false), s('2026-08-31', true),
    ], NOW)[0];
    expect(trend.direction).toBe('slower');
    expect(trend.metrics.previousAverageMissedBeforeRecovery).toBe(1);
    expect(trend.metrics.recentAverageMissedBeforeRecovery).toBe(2.5);
  });

  test('reste factuel sans vocabulaire psychologique ou identitaire', () => {
    const trend = buildIdeauxRecoveryTrends(IDEAL, [
      s('2026-07-18', false), s('2026-07-19', false), s('2026-07-20', true),
      s('2026-07-27', false), s('2026-07-28', false), s('2026-07-29', true),
      s('2026-08-18', false), s('2026-08-19', true),
      s('2026-08-28', false), s('2026-08-29', true),
    ], NOW)[0];
    expect(trend.text).not.toMatch(/bravo|constance|volonté|transformation|identité|motivation|psycholog/i);
  });
});

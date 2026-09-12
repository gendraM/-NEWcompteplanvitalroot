import { buildIdeauxWeightTrends } from '../lib/myWayObserve';

const NOW = new Date('2026-09-10T12:00:00Z');
const IDEAL = [{ id: 'ideal-1', titre: 'Bouger régulièrement' }];
const s = (date_prevue, fait, extra = {}) => ({ ideal_id: 'ideal-1', date_prevue, fait, ...extra });
const w = (date, poids) => ({ date, poids });
const sessions = (previousDone = 1, recentDone = 3) => [
  ...['2026-07-18','2026-07-22','2026-07-27','2026-08-05'].map((date, i) => s(date, i < previousDone)),
  ...['2026-08-18','2026-08-24','2026-08-30','2026-09-05'].map((date, i) => s(date, i < recentDone)),
];
const weights = [w('2026-07-18', 80), w('2026-08-05', 80.2), w('2026-08-18', 79), w('2026-09-05', 78.8)];

describe('P5.3 croisement longitudinal Idéaux × poids', () => {
  test('détecte deux évolutions coexistantes sans causalité', () => {
    const trend = buildIdeauxWeightTrends(IDEAL, sessions(), weights, NOW)[0];
    expect(trend.kind).toBe('ideal_weight_coevolution');
    expect(trend.evidenceLevel).toBe('P3');
    expect(trend.sourceTables).toEqual(['ideaux', 'seances_reelles', 'historique_poids']);
    expect(trend.direction).toEqual({ engagement: 'up', weight: 'down' });
    expect(trend.metrics.previousCompletionRate).toBe(0.25);
    expect(trend.metrics.recentCompletionRate).toBe(0.75);
    expect(trend.metrics.weightDelta).toBe(-1.2);
  });

  test('reste silencieux avec moins de deux pesées dans une période', () => {
    expect(buildIdeauxWeightTrends(IDEAL, sessions(), [w('2026-07-18', 80), w('2026-08-18', 79), w('2026-09-05', 78.8)], NOW)).toEqual([]);
  });

  test('reste silencieux avec moins de quatre séances dans une période', () => {
    expect(buildIdeauxWeightTrends(IDEAL, sessions().slice(1), weights, NOW)).toEqual([]);
  });

  test('reste silencieux si la variation de réalisation est inférieure à 20 points', () => {
    expect(buildIdeauxWeightTrends(IDEAL, sessions(2, 2), weights, NOW)).toEqual([]);
  });

  test('reste silencieux si la variation de poids médian est inférieure à 0,5 kg', () => {
    const stable = [w('2026-07-18', 80), w('2026-08-05', 80.1), w('2026-08-18', 79.9), w('2026-09-05', 80)];
    expect(buildIdeauxWeightTrends(IDEAL, sessions(), stable, NOW)).toEqual([]);
  });

  test('exclut les séances futures et exige fait === true', () => {
    const data = [...sessions(), s('2026-09-11', true), s('2026-09-12', true), s('2026-09-13', false, { statut: 'fait' })];
    const trend = buildIdeauxWeightTrends(IDEAL, data, weights, NOW)[0];
    expect(trend.metrics.recentSessionCount).toBe(4);
    expect(trend.metrics.recentCompletionRate).toBe(0.75);
  });

  test('détecte aussi engagement en baisse et poids en hausse sans jugement', () => {
    const risingWeights = [w('2026-07-18', 78.8), w('2026-08-05', 79), w('2026-08-18', 80), w('2026-09-05', 80.2)];
    const trend = buildIdeauxWeightTrends(IDEAL, sessions(3, 1), risingWeights, NOW)[0];
    expect(trend.direction).toEqual({ engagement: 'down', weight: 'up' });
    expect(trend.text).not.toMatch(/échec|régression|progrès|réussi|bravo/i);
  });

  test('le texte ne contient aucune causalité ni interprétation psychologique', () => {
    const trend = buildIdeauxWeightTrends(IDEAL, sessions(), weights, NOW)[0];
    expect(trend.text).not.toMatch(/grâce à|parce que|a permis|entraîne|provoque|motivation|volonté|identité|psycholog/i);
    expect(trend.text).toContain('Sur la même période');
  });
});

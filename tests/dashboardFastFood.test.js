import { getFastFoodRhythm } from '../lib/fastFoodRhythm';

test.each([21, 30, 45, 17])('repère canonique Fast-food de %i jours, sans +45 implicite', intervalDays => {
  const rythme = getFastFoodRhythm({ lastFastFoodDate: '2026-09-01', referenceDate: '2026-09-11', intervalDays });
  expect(rythme.remainingDays).toBe(intervalDays - 10);
  expect(rythme.targetDays).toBe(intervalDays);
});
test('historique absent ne fabrique ni prochaine date ni réussite', () => {
  expect(getFastFoodRhythm({ intervalDays: 30 })).toMatchObject({ hasHistory: false, nextReferenceDate: null, remainingDays: null, targetReached: false });
});
test('le passage d’heure ne change pas le délai calendaire', () => {
  const rythme = getFastFoodRhythm({ lastFastFoodDate: '2026-10-24', referenceDate: '2026-10-26', intervalDays: 21 });
  expect(rythme.elapsedDays).toBe(2);
  expect(rythme.remainingDays).toBe(19);
});

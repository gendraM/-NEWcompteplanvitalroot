import { selectObserveIntervention } from '../lib/myWayObserve';

const p1 = { id: 'weight-history', evidenceLevel: 'P1', family: 'corps', text: 'Variation brute.' };
const recovery = { id: 'ideal-recovery-1', kind: 'recovery_after_interruption', evidenceLevel: 'P3', family: 'engagement', text: 'Reprise plus rapide.' };
const cross = { id: 'ideal-weight-1', kind: 'ideal_weight_coevolution', evidenceLevel: 'P3', family: 'cross_module', text: 'Deux évolutions coexistent.' };

describe('P5.4 sélection déterministe d’intervention OBSERVE', () => {
  test('retourne NO_INTERVENTION sans candidat', () => {
    expect(selectObserveIntervention([])).toEqual({ status: 'NO_INTERVENTION', observation: null });
  });

  test('n’expose pas un fait P1 banal', () => {
    expect(selectObserveIntervention([p1])).toEqual({ status: 'NO_INTERVENTION', observation: null });
  });

  test('sélectionne une tendance longitudinale P3', () => {
    expect(selectObserveIntervention([recovery]).observation).toBe(recovery);
  });

  test('privilégie le croisement transversal lorsqu’il concurrence une tendance simple', () => {
    expect(selectObserveIntervention([recovery, cross]).observation).toBe(cross);
  });

  test('ne répète pas une observation déjà présentée', () => {
    expect(selectObserveIntervention([recovery], [{ observationId: recovery.id }]))
      .toEqual({ status: 'NO_INTERVENTION', observation: null });
  });

  test('peut sélectionner un autre insight si le premier a déjà été présenté', () => {
    expect(selectObserveIntervention([recovery, cross], [{ observationId: cross.id }]).observation).toBe(recovery);
  });

  test('une nouvelle observation du même type avec un nouvel identifiant reste éligible', () => {
    const evolved = { ...recovery, id: 'ideal-recovery-1-period-2' };
    expect(selectObserveIntervention([evolved], [{ observationId: recovery.id }]).observation).toBe(evolved);
  });

  test('ignore les candidats non reconnus même s’ils sont P3', () => {
    const unknown = { id: 'unknown-1', kind: 'unknown_detector', evidenceLevel: 'P3' };
    expect(selectObserveIntervention([unknown])).toEqual({ status: 'NO_INTERVENTION', observation: null });
  });
});

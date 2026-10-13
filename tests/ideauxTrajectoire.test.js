import { construireTrajectoireIdeal, extraireObjectifCourse } from '../lib/ideauxTrajectoire';

describe('trajectoire des Idéaux', () => {
  test('extrait le cap final sans confondre distance et vitesse', () => {
    expect(extraireObjectifCourse('Courir 6 km à 7,6 km/h')).toMatchObject({ distanceKm: 6, vitesseKmh: 7.6 });
  });

  test('conserve le sous-objectif saisi par utilisateur', () => {
    expect(extraireObjectifCourse('3 séances par semaine, 15 minutes à 8 km/h')).toMatchObject({
      frequenceHebdomadaire: 3, dureeMinutes: 15, vitesseKmh: 8,
    });
  });

  test('compare les paliers et projette sans promettre le cap', () => {
    const seances = [
      ...Array.from({ length: 12 }, (_, index) => ({ palier_numero: 1, fait: index < 5, bonus: false, duree_reelle: 10, vitesse: 7 })),
      ...Array.from({ length: 12 }, (_, index) => ({ palier_numero: 2, fait: index < 9, bonus: false, duree_reelle: 15.7, vitesse: 7.2 })),
    ];
    const trajectoire = construireTrajectoireIdeal({
      titre: 'Courir 6 km à 7,6 km/h',
      indicateur_principal: '3 séances par semaine, 15 minutes à 8 km/h',
      palier_numero: 2,
      date_cible: '2027-01-17',
      cycle_palier: { finPalier: '2026-09-20' },
      plan_params_valides: { palierDuree: 4, duree: 10, intensite: '7,2 km/h' },
      historique_seances_reelles: seances,
      proposition_progression: { type: 'progresser', dimension: 'duree', ancienneCible: 10, nouvelleCible: 12 },
    });
    expect(trajectoire.courant).toMatchObject({ prevues: 12, faites: 9, dureeMoyenne: 15.7, vitesseMoyenne: 7.2 });
    expect(trajectoire.comparaison.regularitePoints).toBe(33);
    expect(trajectoire.projection).toMatchObject({ dureeRequise: 47.4, paliersRestants: 4, dureeProjetee: 18, vitesseProjetee: 7.2, objectifAtteignable: false });
  });

  test('ne fabrique pas de comparaison sans palier précédent', () => {
    const trajectoire = construireTrajectoireIdeal({ palier_numero: 1, historique_seances_reelles: [{ palier_numero: 1, fait: true, bonus: false, duree_reelle: 10 }] });
    expect(trajectoire.comparaison).toBeNull();
  });
});

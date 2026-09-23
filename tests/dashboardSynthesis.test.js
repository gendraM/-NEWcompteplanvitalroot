import {
  construireExtrasStatus,
  construireActiveChallenge,
  construireActiveIdeal,
  construireMealSignals,
  construireWellbeingStatus,
  construireSyntheseTableauDeBord,
  construireWeightStatus,
  evaluerDisponibiliteDonnees,
} from '../lib/dashboardSynthesis';

describe('dashboardSynthesis', () => {
  test('absence de données reste neutre et ne devient pas un échec', () => {
    const synthese = construireSyntheseTableauDeBord();
    expect(synthese.dataAvailability.poids.disponible).toBe(false);
    expect(synthese.weightStatus.disponible).toBe(false);
    expect(synthese.extrasStatus.disponible).toBe(false);
  });

  test('un seul poids ne fabrique pas de tendance', () => {
    const statut = construireWeightStatus([{ date: '2026-09-20', poids: 82.4 }], 70);
    expect(statut.disponible).toBe(true);
    expect(statut.suffisantPourTendance).toBe(false);
    expect(statut.variationDepuisDepart).toBeNull();
    expect(statut.direction).toBe('insuffisant');
  });

  test('le poids expose départ, actuel et objectif sans moyenne', () => {
    const statut = construireWeightStatus([
      { date: '2026-09-01', poids: 84.2 },
      { date: '2026-09-20', poids: 82.4 },
    ], 70);
    expect(statut.depart.poids).toBe(84.2);
    expect(statut.actuel.poids).toBe(82.4);
    expect(statut.objectif).toBe(70);
    expect(statut.variationDepuisDepart).toBe(-1.8);
    expect(statut.direction).toBe('baisse');
  });

  test('la disponibilité compte seulement les observations de poids valides', () => {
    const dispo = evaluerDisponibiliteDonnees({
      poids: [
        { date: '2026-09-01', poids: 84 },
        { date: 'date-invalide', poids: 83 },
        { date: '2026-09-20', poids: null },
      ],
    });
    expect(dispo.poids.nombreObservations).toBe(1);
    expect(dispo.poids.suffisantPourTendance).toBe(false);
  });

  test('Extras délègue la progression au moteur métier partagé', () => {
    const semaines = Array.from({ length: 4 }, (_, index) => ({
      weekStart: `2026-08-${String(3 + index * 7).padStart(2, '0')}`,
      validee: true,
      extras_count: 2,
      kcal_extras: 300,
      budget_extras: 500,
    }));
    const statut = construireExtrasStatus(semaines);
    expect(statut.disponible).toBe(true);
    expect(statut.palier).toBe(3);
    expect(statut.prochainPalier).toBe(2);
  });
  test('le dashboard expose un seul défi actif sans modifier sa progression', () => {
    const actif = construireActiveChallenge([
      { id: 1, nom: 'Marcher', status: 'en cours', progress: 2, duree: 5 },
      { id: 2, nom: 'Autre', status: 'disponible', progress: 0, duree: 3 },
    ]);
    expect(actif.nom).toBe('Marcher');
    expect(actif.progressionPourcentage).toBe(40);
    expect(actif.anomaliePlusieursActifs).toBe(false);
  });

  test('une anomalie de plusieurs défis actifs est signalée sans arbitrage destructif', () => {
    const actif = construireActiveChallenge([
      { id: 1, nom: 'A', status: 'en cours' },
      { id: 2, nom: 'B', status: 'en cours' },
    ]);
    expect(actif.anomaliePlusieursActifs).toBe(true);
  });

  test('Idéaux consomme la progression canonique déjà calculée', () => {
    const progression = { pourcentage: 50 };
    const actif = construireActiveIdeal([
      { id: 'i1', titre: 'Courir', progression_palier: progression, cycle_palier: { etat: 'actif' } },
    ]);
    expect(actif.titre).toBe('Courir');
    expect(actif.progressionPalier).toBe(progression);
  });
  test('faim et satiété restent deux indicateurs distincts', () => {
    const signaux = construireMealSignals([
      { raison_manger: "J'avais faim", satiete: true, repas_planifie_respecte: true, ressenti: 'léger' },
      { raison_manger: 'envie', satiete: 'pas de faim', repas_planifie_respecte: false, ressenti: 'lourd' },
      { raison_manger: "J'avais faim", satiete: true, repas_planifie_respecte: true, ressenti: 'satisfait' },
    ]);
    expect(signaux.faim.pourcentageAvecFaim).toBe(67);
    expect(signaux.satiete.pourcentageRespectee).toBe(67);
    expect(signaux.satiete.sansFaim).toBe(1);
    expect(signaux.alignementPlan.pourcentage).toBe(67);
    expect(signaux.reculSuffisant).toBe(true);
  });

  test('le bien-être reste descriptif et ne crée aucune causalité', () => {
    const statut = construireWellbeingStatus([
      { humeur: 'Calme' },
      { humeur: 'Calme' },
      { humeur: 'Fatiguée' },
    ]);
    expect(statut.humeurDominante).toBe('Calme');
    expect(statut.nombreCheckins).toBe(3);
    expect(statut).not.toHaveProperty('cause');
  });
});

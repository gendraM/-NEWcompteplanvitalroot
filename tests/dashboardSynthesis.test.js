import {
  construireExtrasStatus,
  compterExtrasObserves,
  construireActiveChallenge,
  construireActiveIdeal,
  construireMealSignals,
  construireWellbeingStatus,
  construireLectureParcours,
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
    expect(actif.progressionPourcentage).toBeNull();
    expect(actif.dependanceProgression).toBe(true);
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
      { id: 'i1', titre: 'Courir', statut: 'en cours', progression_palier: progression, cycle_palier: { etat: 'actif' } },
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
    expect(signaux.satiete.pourcentageRespectee).toBe(100);
    expect(signaux.satiete.renseignee).toBe(2);
    expect(signaux.satiete.sansFaim).toBe(1);
    expect(signaux.alignementPlan.pourcentage).toBe(67);
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
  test('la lecture du parcours limite le bruit à deux éléments par zone', () => {
    const lecture = construireLectureParcours({
      weightStatus: { suffisantPourTendance: true, variationDepuisDepart: -2 },
      extrasStatus: { disponible: true, prochainPalier: 1, semainesAcquises: 5, message: 'Rythme régulier.' },
      mealSignals: {
        reculSuffisant: true,
        satiete: { renseignee: 5, pourcentageRespectee: 80, sansFaim: 2 },
        alignementPlan: { renseigne: 5, pourcentage: 80 },
      },
      wellbeingStatus: { reculSuffisant: true, humeurDominante: 'Calme' },
      activeChallenge: { nom: 'Marcher' },
      activeIdeal: { titre: 'Bouger régulièrement' },
    });
    expect(lecture.highlights.length).toBeLessThanOrEqual(2);
    expect(lecture.pointsAppui.length).toBeLessThanOrEqual(2);
    expect(lecture.pointsObservation.length).toBeLessThanOrEqual(2);
  });

  test('une adaptation Extras est une observation et non un échec', () => {
    const lecture = construireLectureParcours({
      extrasStatus: { disponible: true, adaptationRecente: true, message: 'Ton repère évolue.' },
    });
    expect(lecture.pointsObservation[0].code).toBe('extras-adaptation');
    expect(lecture.pointsObservation[0].titre).toBe('Ton rythme s’adapte');
  });

  test('les données insuffisantes ne fabriquent pas de jugement', () => {
    const lecture = construireLectureParcours({
      mealSignals: { reculSuffisant: false },
      wellbeingStatus: { reculSuffisant: false },
    });
    expect(lecture.highlights).toEqual([]);
    expect(lecture.pointsAppui).toEqual([]);
    expect(lecture.pointsObservation).toEqual([]);
  });
});


describe('contrats de reprise du dashboard', () => {
  test('le départ du parcours reste fixe lorsque la période change', () => {
    const mois = construireWeightStatus([{ date: '2026-10-02', poids: 82 }, { date: '2026-10-12', poids: 81 }], 70, 95);
    const semaine = construireWeightStatus([{ date: '2026-10-12', poids: 81 }], 70, 95);
    expect(mois.departParcours).toBe(95);
    expect(semaine.departParcours).toBe(95);
    expect(mois.debutPeriode.poids).toBe(82);
    expect(semaine.debutPeriode.poids).toBe(81);
    expect(semaine.variationDepuisDepart).toBeNull();
  });
  test('profil sans mesure et objectif absent restent distincts', () => {
    expect(construireWeightStatus([], null, 90)).toMatchObject({ disponible: false, objectif: null, departParcours: 90 });
    expect(construireWeightStatus([{ date: null, poids: 80 }]).disponible).toBe(false);
  });
  test('trois aliments d’un repas ne font qu’une occurrence et un signal', () => {
    const lignes = ['riz', 'poisson', 'legumes'].map((aliment, i) => ({ id: i, aliment, occurrence_repas_id: 'midi', raison_manger: "J’avais faim", satiete: 'oui', repas_planifie_respecte: true }));
    const signaux = construireMealSignals(lignes);
    expect(signaux.nombreRepas).toBe(1);
    expect(signaux.faim.renseignee).toBe(1);
    expect(signaux.satiete.renseignee).toBe(1);
    expect(signaux.alignementPlan).toEqual({ renseigne: 1, respecte: 1, pourcentage: 100 });
  });
  test.each(["Je n'avais pas faim", "Je n’ai pas faim", 'pas de faim', 'sans faim'])('la négation %s ne devient pas une affirmation de faim', raison_manger => {
    expect(construireMealSignals([{ raison_manger }]).faim).toMatchObject({ renseignee: 1, avecFaim: 0, pourcentageAvecFaim: 0 });
  });
  test('des champs manquants ne deviennent pas des réponses négatives', () => {
    const signaux = construireMealSignals([{ id: 1 }, { id: 2, raison_manger: 'inconnue', satiete: 'pas de faim' }]);
    expect(signaux.faim.pourcentageAvecFaim).toBeNull();
    expect(signaux.satiete.pourcentageRespectee).toBeNull();
    expect(signaux.alignementPlan.pourcentage).toBeNull();
  });
  test('les réponses oui/non de satiété respectent le formulaire', () => {
    const signaux = construireMealSignals([{ satiete: 'oui' }, { satiete: 'non' }, { satiete: 'pas de faim' }]);
    expect(signaux.satiete).toMatchObject({ renseignee: 2, respectee: 1, pourcentageRespectee: 50, sansFaim: 1 });
  });
  test('des signaux contradictoires dans une occurrence restent inconnus', () => {
    const signaux = construireMealSignals([{ occurrence_repas_id: 'm', satiete: 'oui' }, { occurrence_repas_id: 'm', satiete: 'non' }]);
    expect(signaux.nombreRepas).toBe(1);
    expect(signaux.satiete.pourcentageRespectee).toBeNull();
  });
  test.each(['atteint', 'terminé', 'termine', 'archivé', 'en pause', undefined])('un Idéal %s ne devient pas actif', statut => {
    expect(construireActiveIdeal([{ titre: 'Courir', statut }])).toBeNull();
  });
  test('une reprise Idéal nécessaire est restituée sans activation', () => {
    const cycle = { repriseNecessaire: true, longueInterruption: true };
    const ideal = { statut: 'en cours', cycle_palier: cycle };
    expect(construireActiveIdeal([ideal]).cyclePalier).toBe(cycle);
    expect(ideal.cycle_palier).toEqual(cycle);
  });
  test.each(['duration', 'occurrences'])('le modèle %s ne fabrique pas progress/duree', progression_model => {
    expect(construireActiveChallenge([{ status: 'en cours', progression_model, progress: 99, duree: 7 }]).progressionPourcentage).toBeNull();
  });
  test('un champ de présentation non contractuel ne simule pas le moteur Défis absent', () => {
    expect(construireActiveChallenge([{ status: 'en cours', progression_model: 'duration', progress: 99, duree: 7, dashboard_presentation: { pourcentage: 14, libelle: 'Jour 1 sur 7' } }])).toMatchObject({ progressionPourcentage: null, progressionLibelle: null });
  });
  test('un défi terminé ne devient pas actif', () => {
    expect(construireActiveChallenge([{ status: 'terminé' }])).toBeNull();
  });
  test('la couverture distingue observé, reconstitué et absent, sans observations fictives', () => {
    const synthese = construireSyntheseTableauDeBord({
      repas: [{ date: '2026-10-12' }, { date: '2026-10-12' }],
      periodes: [{ date_debut: '2026-10-12', date_fin: '2026-10-14', statut: 'reconstituee' }],
      dateDebut: '2026-10-12', dateFin: '2026-10-18',
    });
    expect(synthese.couverture).toMatchObject({ joursObserves: 1, joursReconstitues: 2, joursSansDonnee: 4 });
    expect(synthese.mealSignals.nombreRepas).toBe(2);
  });
  test('une longue période vide n’est pas un échec ni une série prolongée', () => {
    const synthese = construireSyntheseTableauDeBord({ dateDebut: '2026-01-01', dateFin: '2026-10-12' });
    expect(synthese.couverture.joursObserves).toBe(0);
    expect(synthese.couverture.joursSansDonnee).toBe(285);
    expect(synthese.extrasStatus.disponible).toBe(false);
    expect(synthese.highlights).toEqual([]);
  });
});


test('les graphiques Extras distinguent une période sans saisie d’un zéro observé', () => {
  expect(compterExtrasObserves([])).toBeNull();
  expect(compterExtrasObserves([{ id: 'r', est_extra: false }])).toBe(0);
  expect(compterExtrasObserves([{ id: 'r', occurrence_repas_id: 'm', est_extra: true }, { id: 's', occurrence_repas_id: 'm', est_extra: true }])).toBe(1);
});

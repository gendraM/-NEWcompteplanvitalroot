import {
  construirePropositionReprise,
  creerArchivePalier,
  evaluerEtatCycle,
} from '../lib/ideauxCycle';

const ideal = {
  palier_numero: 1,
  plan_valide: true,
  statut: 'en cours',
  titre: 'Courir régulièrement',
  indicateur_principal: '3 séances par semaine',
  date_cible: '2026-01-02',
  plan_params_valides: {
    dateDebut: '2025-09-03',
    palierDuree: 4,
    frequence: 3,
    duree: 15,
    intensite: '7,6 km/h',
    joursProposes: ['lundi', 'mercredi', 'samedi'],
  },
  plan_data: {
    mois: [{ semaines: [
      { debut: '2025-09-03', actions: [{ date: '2025-09-03' }] },
      { debut: '2025-09-10', actions: [{ date: '2025-09-10' }] },
      { debut: '2025-09-17', actions: [{ date: '2025-09-17' }] },
      { debut: '2025-09-24', actions: [{ date: '2025-09-29' }] },
    ] }],
  },
  bilan_palier: { totalPrevu: 4, realisePrevu: 4, engagementTermine: true },
};

describe('cycle de reprise Idéaux', () => {
  test('détecte un palier échu et une longue interruption', () => {
    expect(evaluerEtatCycle(ideal, new Date('2026-09-21T12:00:00Z'))).toMatchObject({
      numero: 1,
      finPalier: '2025-09-29',
      estEchu: true,
      longueInterruption: true,
      cibleDepassee: true,
      repriseNecessaire: true,
    });
  });

  test('exige une nouvelle date lorsque la cible est dépassée', () => {
    expect(() => construirePropositionReprise(ideal, {
      objectifToujoursSouhaite: 'oui',
      niveauActuel: 'semblable',
      rythmeRealiste: 2,
    }, new Date('2026-09-21T12:00:00Z'))).toThrow('nouvelle date cible');
  });

  test('propose une reprise actuelle sans augmenter mécaniquement le niveau', () => {
    expect(construirePropositionReprise(ideal, {
      objectifToujoursSouhaite: 'oui',
      niveauActuel: 'plus_bas',
      rythmeRealiste: 2,
      nouvelleDateCible: '2027-03-01',
    }, new Date('2026-09-21T12:00:00Z'))).toMatchObject({
      numero: 2,
      dateDebut: '2026-09-21',
      dateCible: '2027-03-01',
      frequence: 2,
      duree: 10,
      palierDuree: 4,
    });
  });

  test('archive le bilan et les paramètres historiques du palier', () => {
    expect(creerArchivePalier(ideal, { causeInterruption: 'sante' }, new Date('2026-09-21T12:00:00Z'))).toMatchObject({
      numero: 1,
      statut: 'realise',
      date_debut: '2025-09-03',
      date_fin: '2025-09-29',
      reprise: { causeInterruption: 'sante' },
    });
  });
});

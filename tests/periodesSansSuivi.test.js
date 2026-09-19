const {
  choisirPeriodeAProposer,
  detecterPeriodesSansSuivi,
  periodeCorrespondante
} = require('../lib/periodesSansSuivi');

describe('périodes sans suivi', () => {
  const repas = [
    { date: '2026-01-30' },
    { date: '2026-01-31' },
    { date: '2026-05-01' },
    { date: '2026-05-02' }
  ];

  test('détecte toute la période entre deux utilisations réelles', () => {
    expect(detecterPeriodesSansSuivi(repas)).toEqual([{
      dateDebut: '2026-02-01',
      dateFin: '2026-04-30',
      nbJoursSansSaisie: 89
    }]);
  });

  test('ne crée rien avant la première utilisation ni après la dernière', () => {
    const periodes = detecterPeriodesSansSuivi(repas);
    expect(periodeCorrespondante(periodes, '2026-01-01')).toBeNull();
    expect(periodeCorrespondante(periodes, '2026-06-30')).toBeNull();
  });

  test('une date au milieu du trou ouvre le questionnaire de toute la période', () => {
    expect(choisirPeriodeAProposer({ repas, dateSelectionnee: '2026-03-12' })).toMatchObject({
      dateDebut: '2026-02-01',
      dateFin: '2026-04-30'
    });
  });

  test('ignore les interruptions de moins de quatorze jours', () => {
    expect(detecterPeriodesSansSuivi(['2026-06-01', '2026-06-15'])).toEqual([]);
  });

  test('ne repropose pas une période complétée', () => {
    expect(choisirPeriodeAProposer({
      repas,
      periodesTraitees: [{
        date_debut: '2026-02-01',
        date_fin: '2026-04-30',
        statut: 'completee'
      }]
    })).toBeNull();
  });

  test('respecte un report puis repropose après sa date', () => {
    const periodesTraitees = [{
      date_debut: '2026-02-01',
      date_fin: '2026-04-30',
      statut: 'reportee',
      reproposer_apres: '2026-09-26'
    }];
    expect(choisirPeriodeAProposer({ repas, periodesTraitees, dateReference: '2026-09-19' })).toBeNull();
    expect(choisirPeriodeAProposer({ repas, periodesTraitees, dateReference: '2026-09-27' })).not.toBeNull();
  });
});

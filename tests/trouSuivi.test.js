const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const filePath = path.join(__dirname, '../lib/trouSuivi.js');
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports={parseDateLocale,formatDateLocale,enumererDates,normaliserPeriodeReconstituee,detecterTrouSuivi,calculerCouvertureSemaine};');
  const context = { module: { exports: {} }, exports: {}, Date, Set, Array, Number, Math };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.module.exports;
}

const { detecterTrouSuivi, calculerCouvertureSemaine } = chargerModule();

describe('Restauration des trous de suivi', () => {
  test('ne propose rien après 13 jours sans saisie', () => {
    expect(detecterTrouSuivi({
      repas: [{ date: '2026-09-01' }],
      dateReference: '2026-09-14'
    })).toBeNull();
  });

  test('propose la période exacte dès 14 jours sans saisie', () => {
    expect(detecterTrouSuivi({
      repas: [{ date: '2026-09-01' }],
      dateReference: '2026-09-15'
    })).toEqual({
      dateDebut: '2026-09-02',
      dateFin: '2026-09-15',
      derniereDateObservee: '2026-09-01',
      nbJoursSansSaisie: 14
    });
  });

  test('ne repropose pas une période déjà reconstituée', () => {
    expect(detecterTrouSuivi({
      repas: [{ date: '2026-09-01' }],
      periodes: [{ date_debut: '2026-09-02', date_fin: '2026-09-15', statut: 'reconstituee' }],
      dateReference: '2026-09-15'
    })).toBeNull();
  });

  test('respecte le délai choisi avec Plus tard', () => {
    expect(detecterTrouSuivi({
      repas: [{ date: '2026-09-01' }],
      periodes: [{
        dateDebut: '2026-09-02', dateFin: '2026-09-15', statut: 'reportee', reproposerApres: '2026-09-20'
      }],
      dateReference: '2026-09-15'
    })).toBeNull();
  });

  test('distingue jours observés, reconstitués et sans donnée', () => {
    expect(calculerCouvertureSemaine({
      repas: [{ date: '2026-09-14' }, { date: '2026-09-15' }],
      periodes: [{ dateDebut: '2026-09-16', dateFin: '2026-09-18', statut: 'reconstituee' }],
      dateDebut: '2026-09-14',
      dateFin: '2026-09-20'
    })).toEqual({
      joursObserves: 2,
      joursReconstitues: 3,
      joursSansDonnee: 2,
      fiabilitePourcent: 29
    });
  });

  test('une période reportée ne compte jamais comme donnée reconstituée', () => {
    expect(calculerCouvertureSemaine({
      repas: [],
      periodes: [{ dateDebut: '2026-09-14', dateFin: '2026-09-20', statut: 'reportee' }],
      dateDebut: '2026-09-14',
      dateFin: '2026-09-20'
    })).toEqual({
      joursObserves: 0,
      joursReconstitues: 0,
      joursSansDonnee: 7,
      fiabilitePourcent: 0
    });
  });
});

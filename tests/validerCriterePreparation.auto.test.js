const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModuleValidation() {
  const filePath = path.join(__dirname, '../lib/validerCriterePreparation.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export function /g, 'function ')
    .replace(/export const /g, 'const ')
    .concat('\nmodule.exports = { calculerJourRelatif, validerCriterePreparation, getCriteresPreparation, getFenetreValidation, getStatutCritere, isPeriodeActive, validerCritereAuto, getStatutCritereAuto, analyserPortions, detecterFeculents, calculerHydratation, verifierHeureRepas, calculerDureeRepas, getCritereIdFromLabel };');

  const storage = new Map();
  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    }
  };

  const context = {
    module: { exports: {} },
    exports: {},
    console,
    localStorage,
    window: { localStorage },
    Date,
    JSON,
    Math,
    Array,
    Object,
    Set,
    String,
    Number,
    Boolean
  };

  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'validerCriterePreparation.js' });

  return {
    api: context.module.exports,
    localStorage
  };
}

function repasBase(date, overrides = {}) {
  return {
    date,
    type: 'Déjeuner',
    aliment: 'salade',
    categorie: 'legumes',
    quantite: '1 poing',
    heureRepas: '12:30',
    ...overrides
  };
}

describe('Auto-validation des critères de préparation', () => {
  let api;
  let localStorage;

  beforeEach(() => {
    const moduleCharge = chargerModuleValidation();
    api = moduleCharge.api;
    localStorage = moduleCharge.localStorage;
    localStorage.clear();
  });

  test('critère 1 : valide à 6 jours corrects sur 7', () => {
    const repas = [];
    for (let index = 1; index <= 6; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, { quantite: '1 poing' }));
    }
    repas.push(repasBase('2026-06-07', { quantite: 'tres grande portion' }));

    const statut = api.getStatutCritereAuto(1, repas);

    expect(statut.joursRespectés).toBe(6);
    expect(statut.validé).toBe(true);

    api.validerCritereAuto(1);
    expect(api.getCriteresPreparation()[1]).toMatchObject({ validé: true, typeValidation: 'auto' });
  });

  test('critère 2 : valide à 5 dîners sans féculents', () => {
    const repas = [];
    for (let index = 1; index <= 5; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        type: 'Dîner',
        aliment: 'poisson',
        categorie: 'proteines',
        heureRepas: '18:30'
      }));
    }
    repas.push(repasBase('2026-06-06', {
      type: 'Dîner',
      aliment: 'riz complet',
      categorie: 'feculent',
      heureRepas: '18:30'
    }));

    const statut = api.getStatutCritereAuto(2, repas);

    expect(statut.joursRespectés).toBe(5);
    expect(statut.validé).toBe(true);
  });

  test('critère 7 : valide à 5 jours avec 2L d eau', () => {
    const repas = [];
    for (let index = 1; index <= 5; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        aliment: 'eau',
        categorie: 'boisson',
        quantite: '2L'
      }));
    }
    repas.push(repasBase('2026-06-06', {
      aliment: 'eau',
      categorie: 'boisson',
      quantite: '1L'
    }));

    const statut = api.getStatutCritereAuto(7, repas);

    expect(statut.joursRespectés).toBe(5);
    expect(statut.validé).toBe(true);
  });

  test('critère 8 : valide à 5 jours avec dernier repas avant 19h', () => {
    const repas = [];
    for (let index = 1; index <= 5; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        type: 'Dîner',
        heureRepas: '18:45'
      }));
    }
    repas.push(repasBase('2026-06-06', {
      type: 'Dîner',
      heureRepas: '19:30'
    }));

    const statut = api.getStatutCritereAuto(8, repas);

    expect(statut.joursRespectés).toBe(5);
    expect(statut.validé).toBe(true);
  });

  test('critère 9 : valide à 5 jours avec repas limités à 45 minutes', () => {
    const repas = [];
    for (let index = 1; index <= 5; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, { type: 'Déjeuner', heureRepas: '12:00' }));
      repas.push(repasBase(`2026-06-0${index}`, { type: 'Déjeuner', heureRepas: '12:40', aliment: 'legumes' }));
    }
    repas.push(repasBase('2026-06-06', { type: 'Déjeuner', heureRepas: '12:00' }));
    repas.push(repasBase('2026-06-06', { type: 'Déjeuner', heureRepas: '13:10', aliment: 'legumes' }));

    const statut = api.getStatutCritereAuto(9, repas);

    expect(statut.joursRespectés).toBe(5);
    expect(statut.validé).toBe(true);
  });

  test('la validation auto ne doit jamais écraser une validation manuelle', () => {
    api.validerCriterePreparation(2, '2026-06-29T10:00:00.000Z');

    expect(api.getCriteresPreparation()[2]).toMatchObject({ validé: true, typeValidation: 'manuel' });
    expect(api.validerCritereAuto(2)).toBe(false);
    expect(api.getCriteresPreparation()[2]).toMatchObject({ validé: true, typeValidation: 'manuel' });
  });
});
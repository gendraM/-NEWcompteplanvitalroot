const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModuleValidation() {
  const filePath = path.join(__dirname, '../lib/validerCriterePreparation.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export function /g, 'function ')
    .replace(/export const /g, 'const ')
    .concat('\nmodule.exports = { calculerJourRelatif, validerCriterePreparation, getCriteresPreparation, getFenetreValidation, getStatutCritere, isPeriodeActive, validerCritereAuto, getSeuilCritereAuto, getStatutCritereAuto, analyserPortions, detecterFeculents, calculerHydratation, verifierHeureRepas, calculerDureeRepas, detecterJoursJeunePlein, detecterTransitionPreJeune, getCritereIdFromLabel, evaluerRespectPortionRepas };');

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

  test('critère 1 : valide aussi via le référentiel sur des quantités numériques', () => {
    const repas = [];
    const referentiel = [{ nom: 'Pad Thaï poulet', portionDefaut: 'bol', unite: 'bol' }];

    for (let index = 1; index <= 6; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        aliment: 'Pad Thaï poulet',
        categorie: 'asiatique',
        quantite: 1,
      }));
    }

    const statut = api.getStatutCritereAuto(1, repas, referentiel);

    expect(statut.joursRespectés).toBe(6);
    expect(statut.validé).toBe(true);
  });

  test('critère 1 : utilise la confirmation manuelle si l’aliment n’est pas au référentiel', () => {
    const repas = [];

    for (let index = 1; index <= 6; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        aliment: 'Plat maison inconnu',
        quantite: 1,
        regle_respectee: true,
      }));
    }

    const statut = api.getStatutCritereAuto(1, repas, []);

    expect(statut.joursRespectés).toBe(6);
    expect(statut.validé).toBe(true);
  });

  test('critère 1 : un repas composé compte comme 1 repas et non 4 lignes', () => {
    const referentiel = [
      { nom: 'Steak', portionDefaut: '100g', unite: 'g' },
      { nom: 'Riz blanc / basmati', portionDefaut: '2 CS', unite: 'CS' },
      { nom: 'Yaourt nature', portionDefaut: '1 pot', unite: 'pot' },
      { nom: 'Eau', portionDefaut: '1 verre', unite: 'verre' },
    ];
    const repas = [];

    for (let index = 1; index <= 6; index += 1) {
      const date = `2026-06-0${index}`;
      repas.push(repasBase(date, { type: 'Petit-déjeuner', aliment: 'Steak', quantite: 0.8 }));
      repas.push(repasBase(date, { type: 'Petit-déjeuner', aliment: 'Riz blanc / basmati', quantite: 1 }));
      repas.push(repasBase(date, { type: 'Petit-déjeuner', aliment: 'Yaourt nature', quantite: 1 }));
      repas.push(repasBase(date, { type: 'Petit-déjeuner', aliment: 'Eau', quantite: 1 }));
    }

    const statut = api.getStatutCritereAuto(1, repas, referentiel);

    expect(statut.joursRespectés).toBe(6);
    expect(statut.validé).toBe(true);
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

  test('critère 3 : valide à 5 jours conformes sans produits transformés ni sucreries', () => {
    const repas = [];

    for (let index = 1; index <= 5; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        aliment: 'salade verte',
        categorie: 'legumes'
      }));
    }

    repas.push(repasBase('2026-06-06', {
      aliment: 'bonbons gélifiés',
      categorie: 'confiserie'
    }));

    const statut = api.getStatutCritereAuto(3, repas);

    expect(statut.joursRespectés).toBe(5);
    expect(statut.joursNonConformes).toBe(1);
    expect(statut.validé).toBe(true);
  });

  test('critère 3 : un jour ambigu n’est pas compté comme conforme', () => {
    const repas = [];

    for (let index = 1; index <= 4; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        aliment: 'poisson grillé',
        categorie: 'proteines'
      }));
    }

    repas.push(repasBase('2026-06-05', {
      aliment: '',
      categorie: '',
      note: ''
    }));

    const statut = api.getStatutCritereAuto(3, repas);

    expect(statut.joursRespectés).toBe(4);
    expect(statut.joursAmbigus).toBe(1);
    expect(statut.validé).toBe(false);
  });

  test('critère 4 : compte 2 jours de jeûne plein sur catégorie Jeûne', () => {
    const repas = [
      repasBase('2026-06-01', { categorie: 'Jeûne', aliment: '', quantite: null, kcal: null }),
      repasBase('2026-06-02', { categorie: 'Jeûne', aliment: '', quantite: null, kcal: null }),
      repasBase('2026-06-03', { categorie: 'legumes', aliment: 'salade verte', quantite: '1 poing' })
    ];

    const statut = api.getStatutCritereAuto(4, repas);

    expect(statut.joursRespectés).toBe(2);
    expect(statut.seuil).toBe(2);
    expect(statut.validé).toBe(true);
  });

  test('critère 5 : transition pré-jeûne invalide si snack sucré détecté', () => {
    const repas = [];

    for (let index = 1; index <= 5; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        aliment: 'poisson vapeur',
        categorie: 'proteines'
      }));
    }

    repas.push(repasBase('2026-06-06', {
      aliment: 'cookies chocolat',
      categorie: 'snack'
    }));

    const statut = api.getStatutCritereAuto(5, repas);

    expect(statut.joursRespectés).toBe(5);
    expect(statut.joursNonConformes).toBe(1);
    expect(statut.validé).toBe(true);
  });

  test('critère 6 : mode assisté propose la validation sans auto-valider', () => {
    const repas = [
      repasBase('2026-06-01', { categorie: 'Jeûne', aliment: '', quantite: null, kcal: null }),
      repasBase('2026-06-02', { categorie: 'Jeûne', aliment: '', quantite: null, kcal: null }),
      repasBase('2026-06-03', { categorie: 'legumes', aliment: 'salade verte', quantite: '1 poing' })
    ];

    const statut = api.getStatutCritereAuto(6, repas);

    expect(statut.validationAssisteeRequise).toBe(true);
    expect(statut.eligibleValidationAssistee).toBe(true);
    expect(statut.validé).toBe(false);
  });

  test('critère 7 : valide à 5 jours avec 2L d eau', () => {
    const repas = [];
    const referentiel = [{ nom: 'Eau', categorie: 'boisson', portionDefaut: '1 bouteille', unite: 'bouteille' }];
    for (let index = 1; index <= 5; index += 1) {
      repas.push(repasBase(`2026-06-0${index}`, {
        aliment: 'Eau',
        categorie: 'boisson',
        quantite: 4
      }));
    }
    repas.push(repasBase('2026-06-06', {
      aliment: 'Eau',
      categorie: 'boisson',
      quantite: 2
    }));

    const statut = api.getStatutCritereAuto(7, repas, referentiel);

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

  test('critère 8 : accepte les heures non paddées (ex: 9:5) et rejette après 19h', () => {
    const repas = [
      repasBase('2026-06-01', { type: 'Déjeuner', heureRepas: '9:5' }),
      repasBase('2026-06-01', { type: 'Dîner', heureRepas: '18:59' }),
      repasBase('2026-06-02', { type: 'Dîner', heureRepas: '19:00' }),
    ];

    const statut = api.getStatutCritereAuto(8, repas);

    expect(statut.joursRespectés).toBe(1);
    expect(statut.validé).toBe(false);
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

  test('critère 9 : une journée n’est pas conforme si un type de repas dépasse 45 min', () => {
    const repas = [
      repasBase('2026-06-01', { type: 'Déjeuner', heureRepas: '12:00' }),
      repasBase('2026-06-01', { type: 'Déjeuner', heureRepas: '12:30', aliment: 'legumes' }),
      repasBase('2026-06-01', { type: 'Dîner', heureRepas: '19:00' }),
      repasBase('2026-06-01', { type: 'Dîner', heureRepas: '20:10', aliment: 'soupe' }),
      repasBase('2026-06-02', { type: 'Déjeuner', heureRepas: '12:15' }),
    ];

    const statut = api.getStatutCritereAuto(9, repas);

    expect(statut.joursRespectés).toBe(1);
    expect(statut.validé).toBe(false);
  });

  test('la validation auto ne doit jamais écraser une validation manuelle', () => {
    api.validerCriterePreparation(2, '2026-06-29T10:00:00.000Z');

    expect(api.getCriteresPreparation()[2]).toMatchObject({ validé: true, typeValidation: 'manuel' });
    expect(api.validerCritereAuto(2)).toBe(false);
    expect(api.getCriteresPreparation()[2]).toMatchObject({ validé: true, typeValidation: 'manuel' });
  });
});
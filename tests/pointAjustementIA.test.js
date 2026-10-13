const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const actions = {
    AUCUNE_ACTION: 'aucune_action',
    CONSERVER_PLAN: 'conserver_plan',
    AJUSTER_REPAS_PLANIFIE: 'ajuster_repas_planifie',
    UTILISER_VALEUR_SURE: 'utiliser_valeur_sure'
  };
  const contexte = {
    module: { exports: {} },
    exports: {},
    __actions: actions,
    __estAction: action => Object.values(actions).includes(action)
  };
  vm.createContext(contexte);
  const source = fs.readFileSync(path.join(__dirname, '../lib/pointAjustementPresentation.js'), 'utf8')
    .replace(
      "import { ACTIONS_POINT_AJUSTEMENT_AUTORISEES, estActionPointAjustementAutorisee } from './pointAjustementAlimentaire';",
      'const ACTIONS_POINT_AJUSTEMENT_AUTORISEES = __actions; const estActionPointAjustementAutorisee = __estAction;'
    )
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { construireContextePointAjustement, validerReponsePointAjustementIA };');
  vm.runInContext(source, contexte, { filename: 'pointAjustementPresentation.js' });
  return contexte.module.exports;
}

const { construireContextePointAjustement, validerReponsePointAjustementIA } = chargerModule();

const analyse = {
  fenetre: { observation: { debut: '2026-09-07', fin: '2026-09-09' } },
  occurrencesObservees: [
    {
      occurrenceId: 'occ-1', date: '2026-09-07', type: 'Dîner',
      composition: [{ aliment: 'Poisson', categorie: 'poisson', quantite: '120 g', kcal: 110, qn: 5 }],
      kcalTotal: 110, heures: ['19:30'], contextesUtilisateur: [],
      notesUtilisateur: ['Journée chargée'], detailsSignaux: [],
      signauxPositifs: ['satiete_respectee'], signauxVigilance: []
    },
    {
      occurrenceId: 'occ-2', date: '2026-09-08', type: 'Dîner',
      composition: [{ aliment: 'Omelette' }], notesUtilisateur: ['Beaucoup de travail'],
      signauxPositifs: ['satiete_respectee'], signauxVigilance: ['ressenti:lourd']
    },
    {
      occurrenceId: 'occ-3', date: '2026-09-09', type: 'Dîner',
      composition: [{ aliment: 'Ratatouille' }], notesUtilisateur: [],
      signauxPositifs: [], signauxVigilance: ['ressenti:lourd']
    }
  ],
  elementsPositifs: [{ type: 'Dîner', signal: 'satiete_respectee', occurrencesComparables: 3, occurrencesAvecSignal: 2, occurrenceIds: ['occ-1', 'occ-2'] }],
  vigilances: [{ type: 'Dîner', signal: 'ressenti:lourd', occurrencesComparables: 3, occurrencesAvecSignal: 2, occurrenceIds: ['occ-2', 'occ-3'] }]
};

const valeurSure = {
  cleComposition: 'haricots|poisson', nombreOccurrences: 3, nombreResultatsPositifs: 2,
  composition: [{ aliment: 'Poisson', quantite: '120 g', kcal: 110 }, { aliment: 'Haricots', quantite: '150 g', kcal: 45 }],
  kcalTotal: 155
};

describe('Contrat IA du point d’ajustement', () => {
  test('transmet les faits connus, les notes et la liste fermée sans inventer les valeurs absentes', () => {
    const contexte = construireContextePointAjustement(analyse, [valeurSure]);
    expect(contexte.occurrences).toHaveLength(3);
    expect(contexte.occurrences[0]).toMatchObject({
      id: 'occ-1', notesUtilisateur: ['Journée chargée'], kcalTotal: 110
    });
    expect(contexte.occurrences[1].kcalTotal).toBeNull();
    expect(contexte.occurrences[1].composition[0].kcal).toBeNull();
    expect(contexte.valeursSures[0]).toMatchObject({ cle: 'haricots|poisson', kcalTotal: 155 });
    expect(contexte.actionsAutorisees).toEqual(expect.arrayContaining([
      'aucune_action', 'conserver_plan', 'ajuster_repas_planifie', 'utiliser_valeur_sure'
    ]));
  });

  test('accepte une réponse appuyée sur plusieurs occurrences existantes', () => {
    const contexte = construireContextePointAjustement(analyse, [valeurSure]);
    const carte = validerReponsePointAjustementIA({
      ceQuiFonctionne: { texte: 'La satiété a été respectée sur deux dîners.', occurrenceIds: ['occ-1', 'occ-2'] },
      pointAttention: { texte: 'Deux dîners ont été notés lourds.', occurrenceIds: ['occ-2', 'occ-3'] },
      proposition: {
        texte: 'Je te conseille de préparer une valeur sûre pour un des prochains dîners.',
        action: 'utiliser_valeur_sure', occurrenceIds: ['occ-2', 'occ-3'], valeurSureCle: 'haricots|poisson'
      }
    }, contexte);
    expect(carte.proposition).toMatchObject({
      action: 'utiliser_valeur_sure',
      valeurSure: expect.objectContaining({ cle: 'haricots|poisson' })
    });
  });

  test('rejette un constat fondé sur une occurrence isolée', () => {
    const contexte = construireContextePointAjustement(analyse, []);
    const carte = validerReponsePointAjustementIA({
      ceQuiFonctionne: null,
      pointAttention: { texte: 'Un fait isolé présenté comme une tendance.', occurrenceIds: ['occ-1'] },
      proposition: null
    }, contexte);
    expect(carte).toBeNull();
  });

  test('rejette une action inventée et une valeur sûre absente', () => {
    const contexte = construireContextePointAjustement(analyse, [valeurSure]);
    const actionInventee = validerReponsePointAjustementIA({
      proposition: { texte: 'Interdire cet aliment.', action: 'interdire_aliment', occurrenceIds: ['occ-1'] }
    }, contexte);
    const valeurAbsente = validerReponsePointAjustementIA({
      proposition: { texte: 'Réutiliser une assiette.', action: 'utiliser_valeur_sure', valeurSureCle: 'inconnue', occurrenceIds: ['occ-1'] }
    }, contexte);
    expect(actionInventee).toBeNull();
    expect(valeurAbsente).toBeNull();
  });

  test('rejette aussi une proposition sans faits identifiables', () => {
    const contexte = construireContextePointAjustement(analyse, [valeurSure]);
    expect(validerReponsePointAjustementIA({
      proposition: {
        texte: 'Je te conseille de modifier le plan.',
        action: 'ajuster_repas_planifie',
        occurrenceIds: []
      }
    }, contexte)).toBeNull();
  });

  test('rejette un JSON invalide au lieu d’afficher un texte non contrôlé', () => {
    expect(validerReponsePointAjustementIA('Voici mon analyse libre', construireContextePointAjustement(analyse))).toBeNull();
  });
});

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModules() {
  const contexteSocle = { module: { exports: {} }, exports: {} };
  vm.createContext(contexteSocle);

  const socle = fs.readFileSync(path.join(__dirname, '../lib/socleQuantitesCalories.js'), 'utf8')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { calculerCaloriesAliment, extraireQuantiteReference, normaliserUnite };');
  vm.runInContext(socle, contexteSocle, { filename: 'socleQuantitesCalories.js' });
  const fonctionsSocle = contexteSocle.module.exports;

  const context = { module: { exports: {} }, exports: {}, __socle: fonctionsSocle };
  vm.createContext(context);
  const planification = fs.readFileSync(path.join(__dirname, '../lib/planificationRepas.js'), 'utf8')
    .replace(/import \{[\s\S]*?\} from '\.\/socleQuantitesCalories';/, 'const { calculerCaloriesAliment, extraireQuantiteReference, normaliserUnite } = __socle;')
    .replace(/export async function /g, 'async function ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { normaliserNomAliment, trouverAlimentReferentiel, rechercherAlimentsReferentiel, obtenirSaisieParDefaut, serialiserQuantitePlanifiee, extraireQuantitePlanifiee, calculerKcalPlanifiees, construireComposantAssiette, construireAjoutSuggestion, construireOccurrencesAssiette, enregistrerAssiettePlanifiee, normaliserRepasPlanifie, grouperRepasPlanifiesParType, calculerTotauxPlanning };');
  vm.runInContext(planification, context, { filename: 'planificationRepas.js' });
  return context.module.exports;
}

const {
  trouverAlimentReferentiel,
  rechercherAlimentsReferentiel,
  obtenirSaisieParDefaut,
  serialiserQuantitePlanifiee,
  extraireQuantitePlanifiee,
  calculerKcalPlanifiees,
  construireComposantAssiette,
  construireAjoutSuggestion,
  construireOccurrencesAssiette,
  enregistrerAssiettePlanifiee,
  normaliserRepasPlanifie,
  grouperRepasPlanifiesParType,
  calculerTotauxPlanning
} = chargerModules();

const referentiel = [
  { nom: 'Poulet', categorie: 'protéine', portionDefaut: '120g', unite: 'g', kcal: 198 },
  { nom: 'Pomme', categorie: 'fruit', portionDefaut: '1 unité', unite: 'piece', kcal: 80 },
  { nom: 'Œuf', categorie: 'protéine', portionDefaut: '1 œuf', unite: 'piece', kcal: 80, kcalParUnite: 80, qn: 3 }
];

describe('Planification enrichie', () => {
  test('retrouve une fiche canonique malgré les accents et la ligature œ', () => {
    expect(trouverAlimentReferentiel(referentiel, 'oeuf')?.nom).toBe('Œuf');
    expect(rechercherAlimentsReferentiel(referentiel, 'OE')[0]?.nom).toBe('Œuf');
  });

  test('préremplit quantité, unité et calories depuis la portion du référentiel', () => {
    expect(obtenirSaisieParDefaut(referentiel[0])).toEqual({ quantite: '120', unite: 'g', kcal: 198 });
    expect(obtenirSaisieParDefaut(referentiel[1])).toEqual({ quantite: '1', unite: 'unité', kcal: 80 });
  });

  test('enregistre la quantité et son unité dans le champ texte existant', () => {
    expect(serialiserQuantitePlanifiee('150', 'grammes')).toBe('150 g');
    expect(serialiserQuantitePlanifiee('2', 'piece')).toBe('2 unité');
    expect(serialiserQuantitePlanifiee('150 g', '')).toBe('150 g');
    expect(serialiserQuantitePlanifiee('', 'g')).toBeNull();
  });

  test('relit la quantité et l’unité d’une occurrence pour créer un modèle composé', () => {
    expect(extraireQuantitePlanifiee('150 grammes')).toEqual({ quantite: 150, unite: 'g' });
    expect(extraireQuantitePlanifiee('2,5 portions')).toEqual({ quantite: 2.5, unite: 'portions' });
    expect(extraireQuantitePlanifiee('ancienne valeur')).toEqual({ quantite: null, unite: '' });
  });

  test('recalcule les calories et accepte une correction explicite', () => {
    expect(calculerKcalPlanifiees(referentiel[0], 60, 'g')).toMatchObject({ kcal: 99, statut: 'ok' });
    expect(calculerKcalPlanifiees(referentiel[0], 60, 'g', 105)).toMatchObject({ kcal: 105, source: 'correction_utilisateur' });
  });

  test('conserve un ancien repas incomplet sans inventer de quantité ou de calories', () => {
    expect(normaliserRepasPlanifie({ aliment: 'Poulet', type: 'Déjeuner' }, referentiel)).toMatchObject({
      quantite_affichee: null,
      kcal_calculees: null,
      donnees_completes: false
    });
  });

  test('retrouve les calories calculables d’un ancien repas qui possède déjà une quantité', () => {
    expect(normaliserRepasPlanifie({ aliment: 'Poulet', type: 'Déjeuner', quantite: '60 g' }, referentiel)).toMatchObject({
      kcal_calculees: 99,
      donnees_completes: true
    });
  });

  test('conserve toutes les lignes d’un repas planifié composé', () => {
    const lignes = [
      { id: '1', type: 'Déjeuner', aliment: 'Poulet', quantite: '120 g' },
      { id: '2', type: 'Déjeuner', aliment: 'Haricots verts', quantite: '200 g' },
      { id: '3', type: 'Dîner', aliment: 'Soupe', quantite: '1 bol' }
    ];

    const groupes = grouperRepasPlanifiesParType(lignes);

    expect(groupes['Déjeuner']).toHaveLength(2);
    expect(groupes['Déjeuner'].map(repas => repas.aliment)).toEqual(['Poulet', 'Haricots verts']);
    expect(groupes['Dîner']).toHaveLength(1);
  });

  test('calcule les totaux par repas et par journée en signalant les journées incomplètes', () => {
    const totaux = calculerTotauxPlanning({
      '2026-08-24': [
        { aliment: 'Poulet', type: 'Déjeuner', quantite: '120 g', kcal: 198 },
        { aliment: 'Pomme', type: 'Déjeuner', quantite: '1 unité', kcal: 80 },
        { aliment: 'Ancien repas', type: 'Dîner' }
      ]
    }, referentiel)['2026-08-24'];

    expect(totaux.parType).toEqual({ Déjeuner: 278 });
    expect(totaux.totalJour).toBe(278);
    expect(totaux).toMatchObject({ elementsComplets: 2, elementsTotal: 3, complet: false });
  });

  test('construit un composant avec portion et calories issues du référentiel', () => {
    expect(construireComposantAssiette(referentiel[2], '2', 'unité', 'oeuf-1')).toEqual({
      erreur: null,
      composant: {
        id: 'oeuf-1', nom: 'Œuf', categorie: 'protéine', quantite: 2,
        unite: 'unité', kcal: 160, qn: 3
      }
    });
  });

  test('ajoute une suggestion avec la portion et les calories du référentiel', () => {
    expect(construireAjoutSuggestion(referentiel, { aliment: 'oeuf' }, [])).toMatchObject({
      erreur: null,
      composant: { nom: 'Œuf', categorie: 'protéine', quantite: 1, unite: 'unité', kcal: 80 }
    });
  });

  test('refuse une suggestion absente ou déjà présente dans le repas', () => {
    expect(construireAjoutSuggestion(referentiel, { aliment: 'Inconnu' }, [])).toMatchObject({ composant: null });
    expect(construireAjoutSuggestion(referentiel, { aliment: 'oeuf' }, [{ nom: 'Œuf' }])).toMatchObject({
      erreur: 'Œuf est déjà dans ce repas.',
      composant: null
    });
  });

  test('prépare toutes les lignes du repas pour un enregistrement immédiat dans le planning', () => {
    const oeuf = construireComposantAssiette(referentiel[2], '2', 'unité', 'oeuf-1').composant;
    const pomme = construireComposantAssiette(referentiel[1], '1', 'unité', 'pomme-1').composant;
    const occurrences = construireOccurrencesAssiette([oeuf, pomme], {
      userId: 'user-1', date: '2026-08-24', type: 'Petit-déjeuner'
    });

    expect(occurrences).toHaveLength(2);
    expect(occurrences[0]).toMatchObject({
      user_id: 'user-1', aliment: 'Œuf', quantite: '2 unité', kcal: 160, combo_valide: true
    });
    expect(occurrences[1]).toMatchObject({ aliment: 'Pomme', combo_valide: true });
  });

  test('un aliment seul reste un repas planifié simple et non un combo', () => {
    const oeuf = construireComposantAssiette(referentiel[2], '1', 'unité', 'oeuf-1').composant;
    expect(construireOccurrencesAssiette([oeuf], {
      userId: 'user-1', date: '2026-08-24', type: 'Petit-déjeuner'
    })[0]).toMatchObject({ aliment: 'Œuf', combo_valide: false });
  });

  test('envoie le repas à Supabase et demande le retour des lignes créées', async () => {
    const oeuf = construireComposantAssiette(referentiel[2], '1', 'unité', 'oeuf-1').composant;
    let table = null;
    let payload = null;
    let selection = null;
    const supabase = {
      from: nom => {
        table = nom;
        return {
          insert: lignes => {
            payload = lignes;
            return {
              select: colonnes => {
                selection = colonnes;
                return Promise.resolve({ data: [{ id: 'ligne-1', ...lignes[0] }], error: null });
              }
            };
          }
        };
      }
    };

    const resultat = await enregistrerAssiettePlanifiee(supabase, [oeuf], {
      userId: 'user-1', date: '2026-08-24', type: 'Petit-déjeuner'
    });

    expect(table).toBe('repas_planifies');
    expect(payload).toHaveLength(1);
    expect(selection).toBe('*');
    expect(resultat.error).toBeNull();
    expect(resultat.data[0]).toMatchObject({ id: 'ligne-1', aliment: 'Œuf' });
  });
});

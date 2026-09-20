// Analyse pédagogique d'une assiette planifiée.
// Ce moteur ne décide jamais si un repas est « bon » ou « mauvais » :
// il décrit uniquement les dimensions qu'il peut reconnaître avec les données disponibles.

export const DIMENSIONS_ASSIETTE = Object.freeze({
  PROTEINE: 'proteine',
  LEGUME: 'legume',
  FECULENT: 'feculent',
  MATIERE_GRASSE: 'matiere_grasse',
  CUISSON: 'cuisson'
});

export const STATUT_DIMENSION = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  INCONNU: 'inconnu',
  RENSEIGNE: 'renseigne',
  NON_RENSEIGNE: 'non_renseigne'
});

function normaliserTexte(valeur = '') {
  return String(valeur)
    .trim()
    .toLocaleLowerCase('fr')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Correspondances explicites entre catégories du référentiel et rôles dans l'assiette.
// Un aliment peut avoir plusieurs rôles. Le rôle ne remplace jamais sa catégorie source.
const CATEGORIES_PAR_DIMENSION = Object.freeze({
  [DIMENSIONS_ASSIETTE.PROTEINE]: new Set([
    'proteine', 'proteines', 'viande', 'viandes', 'poisson', 'poissons',
    'oeuf', 'oeufs', 'charcuterie'
  ]),
  [DIMENSIONS_ASSIETTE.LEGUME]: new Set([
    'legume', 'legumes', 'crudite', 'crudites'
  ]),
  [DIMENSIONS_ASSIETTE.FECULENT]: new Set([
    'feculent', 'feculents', 'cereale', 'cereales', 'pain', 'pains'
  ]),
  [DIMENSIONS_ASSIETTE.MATIERE_GRASSE]: new Set([
    'matiere grasse', 'matieres grasses', 'huile', 'huiles', 'gras vegetal'
  ])
});

// Certaines catégories sont trop ambiguës pour être traduites en un seul rôle.
// Les légumineuses ont notamment une place mixte : féculent + source protéique végétale.
const CATEGORIES_MULTI_ROLES = Object.freeze({
  legumineuse: [DIMENSIONS_ASSIETTE.PROTEINE, DIMENSIONS_ASSIETTE.FECULENT],
  legumineuses: [DIMENSIONS_ASSIETTE.PROTEINE, DIMENSIONS_ASSIETTE.FECULENT]
});

const ROLES_PROFIL_CONNUS = new Set(['proteine', 'legume', 'feculent', 'matiere grasse', 'fruit']);

const ROLE_CANONIQUE = Object.freeze({
  proteine: DIMENSIONS_ASSIETTE.PROTEINE,
  legume: DIMENSIONS_ASSIETTE.LEGUME,
  feculent: DIMENSIONS_ASSIETTE.FECULENT,
  'matiere grasse': DIMENSIONS_ASSIETTE.MATIERE_GRASSE
});

function normaliserRolesExplicites(item = {}) {
  // profilAlimentaire est la cible. Les anciens champs restent lus pour compatibilité.
  const roles = item?.profilAlimentaire?.rolesRepas ?? item?.rolesAssiette ?? item?.roles_assiette;
  if (!Array.isArray(roles)) return [];
  return [...new Set(
    roles
      .map(role => ROLE_CANONIQUE[normaliserTexte(role)])
      .filter(Boolean)
  )];
}

export function dimensionsPourCategorie(categorie = '') {
  const categorieNormalisee = normaliserTexte(categorie);
  if (!categorieNormalisee) return [];

  if (CATEGORIES_MULTI_ROLES[categorieNormalisee]) {
    return [...CATEGORIES_MULTI_ROLES[categorieNormalisee]];
  }

  return Object.entries(CATEGORIES_PAR_DIMENSION)
    .filter(([, categories]) => categories.has(categorieNormalisee))
    .map(([dimension]) => dimension);
}

function profilAlimentaireEstRenseigne(item = {}) {
  const roles = item?.profilAlimentaire?.rolesRepas;
  if (!Array.isArray(roles) || roles.length === 0) return false;
  return roles.some(role => ROLES_PROFIL_CONNUS.has(normaliserTexte(role)));
}

function alimentEstInterpretable(item = {}) {
  return dimensionsPourAliment(item).length > 0 || profilAlimentaireEstRenseigne(item);
}

export function dimensionsPourAliment(item = {}) {
  const rolesExplicites = normaliserRolesExplicites(item);
  if (rolesExplicites.length) return rolesExplicites;
  return dimensionsPourCategorie(item?.categorie);
}

function analyserDimension(composition, dimension) {
  const reconnus = composition.filter(item => dimensionsPourAliment(item).includes(dimension));
  const donneesIncompletes = composition.some(item => !alimentEstInterpretable(item));

  return {
    statut: reconnus.length
      ? STATUT_DIMENSION.PRESENT
      : (composition.length === 0 || donneesIncompletes ? STATUT_DIMENSION.INCONNU : STATUT_DIMENSION.ABSENT),
    aliments: reconnus.map(item => ({
      id: item?.id ?? null,
      nom: item?.nom || '',
      categorie: item?.categorie || '',
      rolesAssiette: dimensionsPourAliment(item)
    }))
  };
}

export function analyserCompositionAssiette(composition = [], options = {}) {
  const assiette = Array.isArray(composition) ? composition.filter(Boolean) : [];
  const categoriesRenseignees = assiette.filter(item => normaliserTexte(item?.categorie)).length;
  const categoriesNonReconnues = assiette
    .filter(item => normaliserTexte(item?.categorie) && !alimentEstInterpretable(item))
    .map(item => ({ nom: item?.nom || '', categorie: item?.categorie || '' }));
  const categoriesManquantes = assiette
    .filter(item => !normaliserTexte(item?.categorie) && !alimentEstInterpretable(item))
    .map(item => ({ nom: item?.nom || '' }));

  const modeCuisson = String(options?.modeCuisson || '').trim();

  return {
    version: 4,
    vide: assiette.length === 0,
    dimensions: {
      [DIMENSIONS_ASSIETTE.PROTEINE]: analyserDimension(assiette, DIMENSIONS_ASSIETTE.PROTEINE),
      [DIMENSIONS_ASSIETTE.LEGUME]: analyserDimension(assiette, DIMENSIONS_ASSIETTE.LEGUME),
      [DIMENSIONS_ASSIETTE.FECULENT]: analyserDimension(assiette, DIMENSIONS_ASSIETTE.FECULENT),
      [DIMENSIONS_ASSIETTE.MATIERE_GRASSE]: analyserDimension(assiette, DIMENSIONS_ASSIETTE.MATIERE_GRASSE),
      [DIMENSIONS_ASSIETTE.CUISSON]: {
        statut: modeCuisson ? STATUT_DIMENSION.RENSEIGNE : STATUT_DIMENSION.NON_RENSEIGNE,
        valeur: modeCuisson || null
      }
    },
    qualiteDonnees: {
      aliments: assiette.length,
      categoriesRenseignees,
      categoriesNonReconnues,
      categoriesManquantes
    }
  };
}

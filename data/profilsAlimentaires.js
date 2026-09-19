// Couche additive de métadonnées métier.
// Ne remplace jamais data/referentiel.js et ne duplique pas les recettes.

function normaliserCle(valeur = '') {
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

export function cleProfilAlimentaire(aliment = {}) {
  return [
    normaliserCle(aliment?.nom),
    normaliserCle(aliment?.marque),
    normaliserCle(aliment?.categorie)
  ].join('|');
}

export const PROFILS_ALIMENTAIRES = Object.freeze({
  'poelee de legumes||accompagnement': Object.freeze({
    rolesRepas: Object.freeze(['legume']),
    nature: 'composite'
  }),
  'ratatouille rapide||accompagnement': Object.freeze({
    rolesRepas: Object.freeze(['legume']),
    nature: 'composite'
  })
});

export function enrichirAvecProfilAlimentaire(aliment = {}) {
  if (!aliment || typeof aliment !== 'object') return aliment;

  // Un profil déjà porté par l'aliment (ex. aliment utilisateur futur)
  // reste prioritaire sur la couche globale.
  if (aliment.profilAlimentaire) return aliment;

  const profil = PROFILS_ALIMENTAIRES[cleProfilAlimentaire(aliment)];
  if (!profil) return aliment;

  return {
    ...aliment,
    profilAlimentaire: {
      ...profil,
      rolesRepas: [...profil.rolesRepas]
    }
  };
}

export function enrichirReferentielAvecProfils(aliments = []) {
  if (!Array.isArray(aliments)) return [];
  return aliments.map(enrichirAvecProfilAlimentaire);
}

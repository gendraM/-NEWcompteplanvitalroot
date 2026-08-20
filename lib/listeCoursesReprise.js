const CATEGORIE_PAR_DEFAUT = 'autre';

function normaliserItem(item, categorie = CATEGORIE_PAR_DEFAUT) {
  if (typeof item === 'string') {
    return {
      nom: item,
      quantite: '',
      categorie,
      phase: null,
      priorite: 'normale'
    };
  }

  if (!item || typeof item !== 'object' || !item.nom) return null;

  return {
    nom: item.nom,
    quantite: item.quantite || item.portion || '',
    categorie: item.categorie || categorie,
    phase: item.phase ?? null,
    priorite: item.priorite || 'normale'
  };
}

/**
 * Convertit les formats historiques et le format courant en une liste unique.
 * Le format canonique reste un tableau afin de pouvoir être stocké tel quel en JSONB.
 */
export function normaliserListeCoursesReprise(listeCourses) {
  if (Array.isArray(listeCourses)) {
    return listeCourses
      .map(item => normaliserItem(item))
      .filter(Boolean);
  }

  if (!listeCourses || typeof listeCourses !== 'object') return [];

  return Object.entries(listeCourses).flatMap(([categorie, infos]) => {
    const aliments = Array.isArray(infos) ? infos : infos?.aliments;
    if (!Array.isArray(aliments)) return [];

    return aliments
      .map(item => {
        const normalise = normaliserItem(item, categorie);
        if (!normalise) return null;
        if (!normalise.quantite && infos?.quantite_estimee) {
          normalise.quantite = infos.quantite_estimee;
        }
        return normalise;
      })
      .filter(Boolean);
  });
}

export function grouperListeCoursesReprise(listeCourses) {
  return normaliserListeCoursesReprise(listeCourses).reduce((groupes, item) => {
    const categorie = item.categorie || CATEGORIE_PAR_DEFAUT;
    if (!groupes[categorie]) groupes[categorie] = [];
    groupes[categorie].push(item);
    return groupes;
  }, {});
}


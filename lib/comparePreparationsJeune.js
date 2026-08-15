function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortByDateAsc(preparations = []) {
  return [...preparations].sort((a, b) => {
    const da = new Date(a?.dateFin || a?.createdAt || a?.dateDebut || 0).getTime();
    const db = new Date(b?.dateFin || b?.createdAt || b?.dateDebut || 0).getTime();
    return da - db;
  });
}

function getTendance(delta) {
  if (delta > 0) return 'progression';
  if (delta < 0) return 'regression';
  return 'stable';
}

function buildDelta(current, previous) {
  const difference = current - previous;
  return {
    current,
    previous,
    delta: difference,
    tendance: getTendance(difference),
  };
}

export function comparePreparationsJeune(preparationCourante, preparationPrecedente) {
  if (!preparationCourante) return null;
  if (!preparationPrecedente) {
    return {
      hasComparison: false,
      message: 'Aucune préparation précédente disponible.',
      preparationCourante,
      preparationPrecedente: null,
      tauxReussite: null,
      criteresValides: null,
      nbCriteresTotal: null,
    };
  }

  return {
    hasComparison: true,
    preparationCourante,
    preparationPrecedente,
    tauxReussite: buildDelta(
      toNumber(preparationCourante?.tauxReussite),
      toNumber(preparationPrecedente?.tauxReussite)
    ),
    criteresValides: buildDelta(
      toNumber(preparationCourante?.nbCriteresValides),
      toNumber(preparationPrecedente?.nbCriteresValides)
    ),
    nbCriteresTotal: buildDelta(
      toNumber(preparationCourante?.nbCriteresTotal),
      toNumber(preparationPrecedente?.nbCriteresTotal)
    ),
  };
}

export function comparerAvecPreparationPrecedente(preparations = [], preparationCouranteId) {
  const liste = sortByDateAsc(preparations);
  if (liste.length === 0) return null;

  const indexCourant = liste.findIndex((p) => p?.id === preparationCouranteId);
  if (indexCourant <= 0) {
    const preparationCourante = indexCourant >= 0 ? liste[indexCourant] : liste[liste.length - 1];
    return comparePreparationsJeune(preparationCourante, null);
  }

  const preparationCourante = liste[indexCourant];
  const preparationPrecedente = liste[indexCourant - 1];
  return comparePreparationsJeune(preparationCourante, preparationPrecedente);
}

export default comparerAvecPreparationPrecedente;

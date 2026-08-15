function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getDateValue(preparation) {
  return preparation?.dateFin || preparation?.createdAt || preparation?.dateDebut || null;
}

function getLabelCritere(critere) {
  return critere?.label || critere?.titre || critere?.id || 'Critère';
}

export function calculerStatistiquesPreparationsJeune(preparations = []) {
  const liste = Array.isArray(preparations) ? preparations : [];
  const totalPreparations = liste.length;

  if (totalPreparations === 0) {
    return {
      totalPreparations: 0,
      moyenneCriteresValides: 0,
      moyenneTauxReussite: 0,
      meilleurTauxReussite: 0,
      plusFaibleTauxReussite: 0,
      evolution: [],
      criteresClassement: [],
      criteresPlusValides: [],
      criteresMoinsValides: [],
    };
  }

  const sommeCriteresValides = liste.reduce((acc, prep) => acc + toNumber(prep?.nbCriteresValides), 0);
  const sommeTauxReussite = liste.reduce((acc, prep) => acc + toNumber(prep?.tauxReussite), 0);
  const tauxList = liste.map((prep) => toNumber(prep?.tauxReussite));

  const moyenneCriteresValides = round(sommeCriteresValides / totalPreparations, 2);
  const moyenneTauxReussite = round(sommeTauxReussite / totalPreparations, 2);
  const meilleurTauxReussite = round(Math.max(...tauxList), 2);
  const plusFaibleTauxReussite = round(Math.min(...tauxList), 2);

  const evolution = [...liste]
    .sort((a, b) => new Date(getDateValue(a) || 0).getTime() - new Date(getDateValue(b) || 0).getTime())
    .map((prep, index) => ({
      index: index + 1,
      id: prep?.id || String(index + 1),
      date: getDateValue(prep),
      tauxReussite: round(toNumber(prep?.tauxReussite), 2),
      nbCriteresValides: toNumber(prep?.nbCriteresValides),
      nbCriteresTotal: toNumber(prep?.nbCriteresTotal),
    }));

  const criteresMap = new Map();
  for (const prep of liste) {
    for (const critere of prep?.criteres || []) {
      const key = critere?.id || getLabelCritere(critere);
      if (!criteresMap.has(key)) {
        criteresMap.set(key, {
          id: key,
          label: getLabelCritere(critere),
          apparitions: 0,
          validations: 0,
        });
      }
      const stats = criteresMap.get(key);
      stats.apparitions += 1;
      if (critere?.valide) stats.validations += 1;
    }
  }

  const criteresClassement = [...criteresMap.values()]
    .map((item) => ({
      ...item,
      tauxValidation: item.apparitions > 0 ? round((item.validations / item.apparitions) * 100, 2) : 0,
    }))
    .sort((a, b) => b.tauxValidation - a.tauxValidation);

  return {
    totalPreparations,
    moyenneCriteresValides,
    moyenneTauxReussite,
    meilleurTauxReussite,
    plusFaibleTauxReussite,
    evolution,
    criteresClassement,
    criteresPlusValides: criteresClassement.slice(0, 3),
    criteresMoinsValides: [...criteresClassement].reverse().slice(0, 3),
  };
}

export default calculerStatistiquesPreparationsJeune;

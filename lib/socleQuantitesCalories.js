const UNITES = {
  g: 'g',
  gramme: 'g',
  grammes: 'g',
  kg: 'kg',
  kilogramme: 'kg',
  kilogrammes: 'kg',
  ml: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  cl: 'cl',
  centilitre: 'cl',
  centilitres: 'cl',
  l: 'L',
  litre: 'L',
  litres: 'L',
  unite: 'unité',
  unites: 'unité',
  piece: 'unité',
  pieces: 'unité',
  cs: 'CS',
  cac: 'càc',
  cc: 'càc'
};

function texteComparable(valeur) {
  return String(valeur || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function nombreFini(valeur) {
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return null;
  const nombre = typeof valeur === 'number'
    ? valeur
    : Number(String(valeur).trim().replace(',', '.'));
  return Number.isFinite(nombre) ? nombre : null;
}

function lireNombreDebut(valeur) {
  if (typeof valeur === 'number') return Number.isFinite(valeur) ? valeur : null;
  const texte = String(valeur || '').trim().replace(',', '.');
  const fractionsUnicode = { '½': 0.5, '¼': 0.25, '¾': 0.75 };
  if (fractionsUnicode[texte.charAt(0)] !== undefined) return fractionsUnicode[texte.charAt(0)];
  const fraction = texte.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (fraction) {
    const denominateur = Number(fraction[2]);
    return denominateur > 0 ? Number(fraction[1]) / denominateur : null;
  }
  const nombre = texte.match(/^-?\d+(?:\.\d+)?/);
  return nombre ? Number(nombre[0]) : null;
}

export function normaliserUnite(unite) {
  const texte = texteComparable(unite).replace(/[.]/g, '');
  if (!texte) return null;
  return UNITES[texte] || String(unite).trim();
}

export function convertirQuantiteEnUniteBase(valeur, unite) {
  const quantite = nombreFini(valeur);
  const uniteNormalisee = normaliserUnite(unite);
  if (quantite === null || !uniteNormalisee) return null;

  if (uniteNormalisee === 'kg') return { valeur: quantite * 1000, unite: 'g' };
  if (uniteNormalisee === 'cl') return { valeur: quantite * 10, unite: 'ml' };
  if (uniteNormalisee === 'L') return { valeur: quantite * 1000, unite: 'ml' };
  return { valeur: quantite, unite: uniteNormalisee };
}

function extraireMesureMasseVolume(texteSource) {
  const texte = String(texteSource || '');
  const mesure = texte.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|l)\b/i);
  return mesure
    ? convertirQuantiteEnUniteBase(mesure[1].replace(',', '.'), mesure[2])
    : null;
}

export function extraireQuantiteReference(portionDefaut, uniteSouhaitee) {
  const texte = String(portionDefaut || '').trim();
  const portionComparable = texteComparable(texte);
  const uniteNormalisee = normaliserUnite(uniteSouhaitee);
  if (!texte || !uniteNormalisee) return null;

  const mesure = extraireMesureMasseVolume(texte);
  const uniteBaseSouhaitee = convertirQuantiteEnUniteBase(1, uniteNormalisee);
  if (mesure && uniteBaseSouhaitee && mesure.unite === uniteBaseSouhaitee.unite) {
    return mesure;
  }

  if (['g', 'kg', 'ml', 'cl', 'L'].includes(uniteNormalisee)) return null;
  const mentionsAttendues = {
    'unité': ['unite', 'piece'],
    CS: ['cs', 'cuillere a soupe'],
    'càc': ['cac', 'cc', 'cuillere a cafe']
  }[uniteNormalisee] || [texteComparable(uniteNormalisee)];
  const commenceParUnComptage = /^\s*(?:\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+)\s+\p{L}/iu.test(texte);
  const mentionUnite = mentionsAttendues.some(mention => portionComparable.includes(mention));
  if (!mentionUnite && !commenceParUnComptage) return null;
  const valeur = lireNombreDebut(texte);
  if (valeur !== null) return convertirQuantiteEnUniteBase(valeur, uniteNormalisee);
  return mentionUnite ? convertirQuantiteEnUniteBase(1, uniteNormalisee) : null;
}

function resultatCalories(kcal, source, quantite, unite) {
  return {
    kcal: Math.round(kcal),
    statut: 'ok',
    source,
    quantite,
    unite,
    message: null
  };
}

function resultatIncomplet(message, quantite = null, unite = null) {
  return {
    kcal: null,
    statut: 'incomplet',
    source: null,
    quantite,
    unite,
    message
  };
}

export function calculerCaloriesAliment(aliment, quantiteSaisie, uniteSaisie = null) {
  if (!aliment || typeof aliment !== 'object') {
    return resultatIncomplet('Aliment absent.');
  }

  const uniteDeclaree = normaliserUnite(uniteSaisie || aliment.unite);
  if (!uniteDeclaree) {
    return resultatIncomplet('Unité absente.', lireNombreDebut(quantiteSaisie), null);
  }

  const kcalPortionExacte = nombreFini(aliment.kcal);
  if (
    kcalPortionExacte !== null &&
    String(quantiteSaisie || '').trim() &&
    String(aliment.portionDefaut || '').trim() &&
    texteComparable(quantiteSaisie) === texteComparable(aliment.portionDefaut)
  ) {
    return resultatCalories(
      kcalPortionExacte,
      'portion_reference',
      lireNombreDebut(quantiteSaisie) ?? 1,
      uniteDeclaree
    );
  }

  const quantiteDecrite = typeof quantiteSaisie === 'string'
    ? extraireMesureMasseVolume(quantiteSaisie) || extraireQuantiteReference(quantiteSaisie, uniteDeclaree)
    : null;
  const quantite = quantiteDecrite?.valeur ?? lireNombreDebut(quantiteSaisie);
  const unite = quantiteDecrite?.unite || uniteDeclaree;
  if (quantite === null || quantite < 0) {
    return resultatIncomplet('Quantité absente ou invalide.', null, unite);
  }

  const quantiteConvertie = quantiteDecrite || convertirQuantiteEnUniteBase(quantite, unite);
  if (!quantiteConvertie) {
    return resultatIncomplet('Quantité impossible à convertir.', quantite, unite);
  }

  const kcalPour100 = [aliment.kcalPour100g, aliment.kcalPar100g, aliment.kcal_100g]
    .map(nombreFini)
    .find(valeur => valeur !== null);
  if (kcalPour100 !== undefined && quantiteConvertie.unite === 'g') {
    return resultatCalories(
      (quantiteConvertie.valeur / 100) * kcalPour100,
      'pour_100g',
      quantite,
      unite
    );
  }

  const uniteAliment = normaliserUnite(aliment.unite);
  const uniteAlimentBase = convertirQuantiteEnUniteBase(1, uniteAliment);
  const kcalReference = nombreFini(aliment.kcal);
  const quantiteReferenceDirecte = nombreFini(aliment.quantite);
  if (kcalReference !== null && quantiteReferenceDirecte !== null && quantiteReferenceDirecte > 0 && uniteAlimentBase) {
    const referenceConvertie = convertirQuantiteEnUniteBase(quantiteReferenceDirecte, uniteAliment);
    if (referenceConvertie?.unite === quantiteConvertie.unite) {
      return resultatCalories(
        quantiteConvertie.valeur * (kcalReference / referenceConvertie.valeur),
        'quantite_reference',
        quantite,
        unite
      );
    }
  }

  const referencePortion = kcalReference !== null
    ? extraireQuantiteReference(aliment.portionDefaut, unite)
    : null;
  if (referencePortion?.unite === quantiteConvertie.unite && referencePortion.valeur > 0) {
    return resultatCalories(
      quantiteConvertie.valeur * (kcalReference / referencePortion.valeur),
      'portion_reference',
      quantite,
      unite
    );
  }

  const kcalParUnite = nombreFini(aliment.kcalParUnite);
  if (
    kcalParUnite !== null &&
    uniteAlimentBase &&
    uniteAlimentBase.unite === quantiteConvertie.unite
  ) {
    const ratioBase = kcalParUnite / uniteAlimentBase.valeur;
    return resultatCalories(
      quantiteConvertie.valeur * ratioBase,
      'kcal_par_unite',
      quantite,
      unite
    );
  }

  if (kcalReference === null) {
    return resultatIncomplet('Valeur calorique absente.', quantite, unite);
  }

  return resultatIncomplet(
    'La quantité saisie ne peut pas être reliée à la portion calorique de référence.',
    quantite,
    unite
  );
}

export function arrondirQuantiteAchat(valeur, unite) {
  const convertie = convertirQuantiteEnUniteBase(valeur, unite);
  if (!convertie) return null;
  if (convertie.unite === 'unité') return Math.max(1, Math.ceil(convertie.valeur));
  if (convertie.unite === 'g') return Math.max(10, Math.ceil(convertie.valeur / 10) * 10);
  if (convertie.unite === 'ml') return Math.max(50, Math.ceil(convertie.valeur / 50) * 50);
  return Math.ceil(convertie.valeur * 100) / 100;
}

export function formaterQuantite(valeur, unite) {
  const convertie = convertirQuantiteEnUniteBase(valeur, unite);
  if (!convertie) return null;
  if (convertie.unite === 'g' && convertie.valeur >= 1000) {
    return `${Number((convertie.valeur / 1000).toFixed(2))} kg`;
  }
  if (convertie.unite === 'ml' && convertie.valeur >= 1000) {
    return `${Number((convertie.valeur / 1000).toFixed(2))} L`;
  }
  return `${convertie.valeur} ${convertie.unite}${convertie.unite === 'unité' && convertie.valeur > 1 ? 's' : ''}`;
}

export function cleAgregationArticle(article) {
  const unite = convertirQuantiteEnUniteBase(1, article?.quantite_unite)?.unite || normaliserUnite(article?.quantite_unite) || '';
  return [article?.nom, article?.categorie, article?.preparation || '', unite].join('|');
}

export function agregerArticles(articles = []) {
  return Array.from(articles.reduce((agreges, article) => {
    const quantiteConvertie = convertirQuantiteEnUniteBase(article?.quantite_valeur, article?.quantite_unite);
    const articleNormalise = quantiteConvertie
      ? {
          ...article,
          quantite_valeur: quantiteConvertie.valeur,
          quantite_unite: quantiteConvertie.unite,
          quantite: formaterQuantite(quantiteConvertie.valeur, quantiteConvertie.unite)
        }
      : { ...article };
    const cle = cleAgregationArticle(articleNormalise);
    const existant = agreges.get(cle);
    if (
      !existant ||
      !Number.isFinite(articleNormalise.quantite_valeur) ||
      !Number.isFinite(existant.quantite_valeur)
    ) {
      agreges.set(existant ? `${cle}|phase${articleNormalise.phase}` : cle, articleNormalise);
      return agreges;
    }

    const quantiteValeur = existant.quantite_valeur + articleNormalise.quantite_valeur;
    agreges.set(cle, {
      ...existant,
      quantite_valeur: quantiteValeur,
      quantite: formaterQuantite(quantiteValeur, existant.quantite_unite),
      utilisations_estimees: Number(existant.utilisations_estimees || 0) + Number(articleNormalise.utilisations_estimees || 0),
      phases: Array.from(new Set([...(existant.phases || [existant.phase]), articleNormalise.phase])).sort()
    });
    return agreges;
  }, new Map()).values());
}

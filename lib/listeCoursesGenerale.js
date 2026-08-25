import {
  agregerArticles,
  arrondirQuantiteAchat,
  formaterQuantite
} from './socleQuantitesCalories';
import {
  extraireQuantitePlanifiee,
  trouverAlimentReferentiel
} from './planificationRepas';

function texteComparable(valeur) {
  return String(valeur || '')
    .trim()
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/\s+/g, ' ');
}

function identifiantStable(valeurs) {
  return valeurs
    .map(texteComparable)
    .filter(Boolean)
    .join('__')
    .replace(/[^a-z0-9]+/g, '-');
}

export function validerPeriodeCourses(debut, fin) {
  const format = /^\d{4}-\d{2}-\d{2}$/;
  if (!format.test(String(debut || '')) || !format.test(String(fin || ''))) {
    return { valide: false, erreur: 'Choisis une date de début et une date de fin.' };
  }
  if (debut > fin) return { valide: false, erreur: 'La date de fin doit être postérieure à la date de début.' };
  return { valide: true, erreur: null };
}

export function construireArticlePlanifie(repas, referentiel = []) {
  const nomSaisi = String(repas?.aliment || '').trim();
  const reference = trouverAlimentReferentiel(referentiel, nomSaisi);
  const nom = reference?.nom || nomSaisi;
  const categorie = String(repas?.categorie || reference?.categorie || 'autre').trim();
  const qnReference = Number(reference?.qn);
  const qn = Number.isFinite(qnReference) && qnReference >= 1 && qnReference <= 5 ? qnReference : null;
  const mesure = extraireQuantitePlanifiee(repas?.quantite);

  if (!nom) {
    return { complet: false, raison: 'Aliment absent', nom: 'Ligne sans aliment', categorie, date: repas?.date || null, source_id: repas?.id || null };
  }
  if (mesure.quantite === null || mesure.quantite <= 0 || !mesure.unite) {
    return { complet: false, raison: 'Quantité ou unité non renseignée', nom, categorie, date: repas?.date || null, source_id: repas?.id || null };
  }

  return {
    complet: true,
    article: {
      nom,
      categorie,
      qn,
      preparation: repas?.preparation || null,
      quantite_valeur: mesure.quantite,
      quantite_unite: mesure.unite,
      utilisations_estimees: 1,
      source_ids: repas?.id ? [repas.id] : [],
      dates_utilisation: repas?.date ? [repas.date] : []
    }
  };
}

function fusionnerTraces(articlesAgreges, articlesSources) {
  return articlesAgreges.map(article => {
    const sources = articlesSources.filter(source =>
      texteComparable(source.nom) === texteComparable(article.nom) &&
      texteComparable(source.categorie) === texteComparable(article.categorie) &&
      texteComparable(source.preparation) === texteComparable(article.preparation) &&
      texteComparable(source.quantite_unite) === texteComparable(article.quantite_unite)
    );
    return {
      ...article,
      source_ids: Array.from(new Set(sources.flatMap(source => source.source_ids || []))),
      dates_utilisation: Array.from(new Set(sources.flatMap(source => source.dates_utilisation || []))).sort()
    };
  });
}

export function construireListeCoursesGenerale(repasPlanifies = [], { debut, fin, referentiel = [] } = {}) {
  const periode = validerPeriodeCourses(debut, fin);
  if (!periode.valide) return { valide: false, erreur: periode.erreur, articles: [], incomplets: [], resume: null };

  const idsVus = new Set();
  const lignes = (repasPlanifies || []).filter((repas, index) => {
    if (!repas || repas.date < debut || repas.date > fin) return false;
    const identifiant = repas.id ? `id:${repas.id}` : `ligne:${index}`;
    if (idsVus.has(identifiant)) return false;
    idsVus.add(identifiant);
    return true;
  });

  const complets = [];
  const incompletsParCle = new Map();
  lignes.forEach(repas => {
    const resultat = construireArticlePlanifie(repas, referentiel);
    if (resultat.complet) {
      complets.push(resultat.article);
      return;
    }
    const cle = [resultat.nom, resultat.categorie, resultat.raison].map(texteComparable).join('|');
    const existant = incompletsParCle.get(cle) || {
      nom: resultat.nom,
      categorie: resultat.categorie,
      raison: resultat.raison,
      occurrences: 0,
      dates_utilisation: []
    };
    existant.occurrences += 1;
    if (resultat.date && !existant.dates_utilisation.includes(resultat.date)) existant.dates_utilisation.push(resultat.date);
    incompletsParCle.set(cle, existant);
  });

  const agreges = fusionnerTraces(agregerArticles(complets), complets).map(article => {
    const quantiteAchat = arrondirQuantiteAchat(article.quantite_valeur, article.quantite_unite);
    return {
      ...article,
      article_id: identifiantStable([article.nom, article.categorie, article.preparation, article.quantite_unite]),
      besoin_valeur: article.quantite_valeur,
      besoin_unite: article.quantite_unite,
      quantite_planifiee: formaterQuantite(article.quantite_valeur, article.quantite_unite),
      quantite_valeur: quantiteAchat,
      quantite: formaterQuantite(quantiteAchat, article.quantite_unite)
    };
  }).sort((a, b) => a.categorie.localeCompare(b.categorie, 'fr') || a.nom.localeCompare(b.nom, 'fr'));

  const incomplets = Array.from(incompletsParCle.values())
    .map(item => ({ ...item, dates_utilisation: item.dates_utilisation.sort() }))
    .sort((a, b) => a.categorie.localeCompare(b.categorie, 'fr') || a.nom.localeCompare(b.nom, 'fr'));

  return {
    valide: true,
    erreur: null,
    periode: { debut, fin },
    articles: agreges,
    incomplets,
    resume: {
      lignes_planifiees: lignes.length,
      utilisations_agregees: complets.length,
      articles_distincts: agreges.length,
      lignes_incompletes: incomplets.reduce((total, item) => total + item.occurrences, 0),
      complet: incomplets.length === 0
    }
  };
}

export function grouperListeCoursesGenerale(articles = []) {
  return (articles || []).reduce((groupes, article) => {
    const categorie = article.categorie || 'autre';
    if (!groupes[categorie]) groupes[categorie] = [];
    groupes[categorie].push(article);
    return groupes;
  }, {});
}

export const STATUTS_COURSES_GENERALES = ['a_acheter', 'panier', 'deja_disponible'];

const FORMATS_ACHAT_COURANTS = [
  {
    correspond: article => texteComparable(article.nom).includes('oeuf'),
    formats: [
      { id: 'boite-6', valeur: 6, unite: 'unité', libelle: 'Boîte de 6' },
      { id: 'boite-10', valeur: 10, unite: 'unité', libelle: 'Boîte de 10' },
      { id: 'boite-12', valeur: 12, unite: 'unité', libelle: 'Boîte de 12' }
    ]
  },
  {
    correspond: article => article.categorie === 'féculent' && /pates|spaghetti|penne|fusilli|macaroni|tagliatelle/.test(texteComparable(article.nom)),
    formats: [
      { id: 'paquet-500g', valeur: 500, unite: 'g', libelle: 'Paquet de 500 g' },
      { id: 'paquet-1kg', valeur: 1000, unite: 'g', libelle: 'Paquet de 1 kg' }
    ]
  },
  {
    correspond: article => article.categorie === 'féculent' && /^(riz|quinoa|boulgour|semoule)/.test(texteComparable(article.nom)),
    formats: [
      { id: 'paquet-500g', valeur: 500, unite: 'g', libelle: 'Paquet de 500 g' },
      { id: 'paquet-1kg', valeur: 1000, unite: 'g', libelle: 'Paquet de 1 kg' }
    ]
  }
];

export function formatsAchatCourants(article) {
  return FORMATS_ACHAT_COURANTS.find(groupe => groupe.correspond(article))?.formats || [];
}

function mesureAchatBase(valeur, unite) {
  const nombre = Number(String(valeur ?? '').replace(',', '.'));
  if (!Number.isFinite(nombre) || nombre <= 0) return null;
  const normalisee = texteComparable(unite);
  if (normalisee === 'kg') return { valeur: nombre * 1000, unite: 'g' };
  if (normalisee === 'l') return { valeur: nombre * 1000, unite: 'ml' };
  if (['piece', 'pieces', 'unite', 'unites'].includes(normalisee)) return { valeur: nombre, unite: 'unité' };
  if (['g', 'ml'].includes(normalisee)) return { valeur: nombre, unite: normalisee };
  return { valeur: nombre, unite: String(unite || '').trim() };
}

export function calculerAchatConditionne(article, conditionnement = null) {
  const besoin = mesureAchatBase(article?.besoin_valeur ?? article?.quantite_valeur, article?.besoin_unite ?? article?.quantite_unite);
  if (!besoin) return { statut: 'incomplet', calcul_automatique: false, message: 'Besoin planifié incomplet.' };
  if (!conditionnement) {
    return { statut: 'a_choisir', calcul_automatique: false, besoin, message: 'Format d’achat à choisir.' };
  }
  if (conditionnement.mode === 'au_besoin') {
    const total = arrondirQuantiteAchat(besoin.valeur, besoin.unite);
    return {
      statut: 'ok',
      calcul_automatique: true,
      besoin,
      nombre_conditionnements: null,
      quantite_achat: formaterQuantite(total, besoin.unite),
      reliquat: Math.max(0, total - besoin.valeur),
      reliquat_formate: formaterQuantite(Math.max(0, total - besoin.valeur), besoin.unite)
    };
  }
  const format = mesureAchatBase(conditionnement.valeur, conditionnement.unite);
  if (!format) return { statut: 'incomplet', calcul_automatique: false, besoin, message: 'Contenu du conditionnement à compléter.' };
  const compatible = format.unite === besoin.unite;
  const nombreManuel = Number(conditionnement.nombre_conditionnements);
  const nombre = compatible
    ? Math.ceil(besoin.valeur / format.valeur)
    : Number.isInteger(nombreManuel) && nombreManuel > 0 ? nombreManuel : null;
  if (!nombre) {
    return {
      statut: 'nombre_a_saisir',
      calcul_automatique: false,
      besoin,
      format,
      message: `Le besoin est exprimé en ${besoin.unite} et le paquet en ${format.unite} : indique le nombre de paquets.`
    };
  }
  const total = nombre * format.valeur;
  const reliquat = compatible ? Math.max(0, total - besoin.valeur) : null;
  return {
    statut: 'ok',
    calcul_automatique: compatible,
    besoin,
    format,
    nombre_conditionnements: nombre,
    quantite_achat: formaterQuantite(total, format.unite),
    reliquat,
    reliquat_formate: reliquat === null ? null : formaterQuantite(reliquat, format.unite)
  };
}

export function normaliserPrixCoursesGenerales(valeur) {
  if (valeur === '' || valeur === null || valeur === undefined) return null;
  const nombre = Number(String(valeur).replace(',', '.'));
  if (!Number.isFinite(nombre) || nombre < 0) return null;
  return Math.round(nombre * 100) / 100;
}

export function initialiserSuiviCoursesGenerales(articles = [], articlesPrecedents = []) {
  const precedents = new Map((articlesPrecedents || []).map(article => [article.article_id, article]));
  return (articles || []).map(article => {
    const precedent = precedents.get(article.article_id) || {};
    return {
      ...article,
      statut_achat: STATUTS_COURSES_GENERALES.includes(precedent.statut_achat)
        ? precedent.statut_achat
        : 'a_acheter',
      conditionnement_achat: precedent.conditionnement_achat || null,
      statut_modifie_le: precedent.statut_modifie_le || null
    };
  });
}

export function modifierSuiviCourseGenerale(articles = [], articleId, modification = {}) {
  return (articles || []).map(article => {
    if (article.article_id !== articleId) return article;
    const prochain = { ...article };
    if (Object.prototype.hasOwnProperty.call(modification, 'statut_achat')) {
      if (STATUTS_COURSES_GENERALES.includes(modification.statut_achat)) {
        prochain.statut_achat = modification.statut_achat;
        prochain.statut_modifie_le = new Date().toISOString();
      }
    }
    if (Object.prototype.hasOwnProperty.call(modification, 'conditionnement_achat')) {
      prochain.conditionnement_achat = modification.conditionnement_achat || null;
    }
    return prochain;
  });
}

export function resumerSuiviCoursesGenerales(articles = []) {
  const resume = {
    total: articles.length,
    a_acheter: 0,
    panier: 0,
    deja_disponible: 0,
  };
  (articles || []).forEach(article => {
    const statut = STATUTS_COURSES_GENERALES.includes(article.statut_achat) ? article.statut_achat : 'a_acheter';
    resume[statut] += 1;
  });
  resume.traites = resume.panier + resume.deja_disponible;
  return resume;
}

export function resumerPrixListeCoursesGenerale(prixEstime, prixReel) {
  const estime = normaliserPrixCoursesGenerales(prixEstime);
  const reel = normaliserPrixCoursesGenerales(prixReel);
  return {
    prix_estime: estime,
    prix_reel: reel,
    ecart: estime !== null && reel !== null ? Math.round((reel - estime) * 100) / 100 : null
  };
}

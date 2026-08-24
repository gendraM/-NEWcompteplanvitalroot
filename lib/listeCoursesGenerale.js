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


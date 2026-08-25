const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = {
    module: { exports: {} }, exports: {},
    __socle: {
      agregerArticles: articles => {
        const groupes = new Map();
        articles.forEach(article => {
          const unite = article.quantite_unite === 'kg' ? 'g' : article.quantite_unite;
          const valeur = article.quantite_unite === 'kg' ? article.quantite_valeur * 1000 : article.quantite_valeur;
          const cle = [article.nom, article.categorie, article.preparation || '', unite].join('|');
          const actuel = groupes.get(cle);
          groupes.set(cle, actuel ? { ...actuel, quantite_valeur: actuel.quantite_valeur + valeur, utilisations_estimees: actuel.utilisations_estimees + 1 } : { ...article, quantite_valeur: valeur, quantite_unite: unite });
        });
        return [...groupes.values()];
      },
      arrondirQuantiteAchat: (valeur, unite) => unite === 'g' ? Math.ceil(valeur / 10) * 10 : unite === 'ml' ? Math.ceil(valeur / 50) * 50 : unite === 'unité' ? Math.ceil(valeur) : valeur,
      formaterQuantite: (valeur, unite) => unite === 'g' && valeur >= 1000 ? `${valeur / 1000} kg` : `${valeur} ${unite}`
    },
    __plan: {
      extraireQuantitePlanifiee: valeur => {
        const match = String(valeur || '').match(/^([0-9]+(?:[.,][0-9]+)?)\s+(.+)$/);
        return match ? { quantite: Number(match[1].replace(',', '.')), unite: match[2] } : { quantite: null, unite: '' };
      },
      trouverAlimentReferentiel: (referentiel, nom) => referentiel.find(item => item.nom.toLowerCase() === String(nom).toLowerCase()) || null
    }
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../lib/listeCoursesGenerale.js'), 'utf8')
    .replace(/import \{[\s\S]*?\} from '\.\/socleQuantitesCalories';/, 'const { agregerArticles, arrondirQuantiteAchat, formaterQuantite } = __socle;')
    .replace(/import \{[\s\S]*?\} from '\.\/planificationRepas';/, 'const { extraireQuantitePlanifiee, trouverAlimentReferentiel } = __plan;')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { validerPeriodeCourses, construireArticlePlanifie, construireListeCoursesGenerale, grouperListeCoursesGenerale, formatsAchatCourants, calculerAchatConditionne, initialiserSuiviCoursesGenerales, modifierSuiviCourseGenerale, resumerSuiviCoursesGenerales, resumerPrixListeCoursesGenerale };');
  vm.runInContext(source, context, { filename: 'listeCoursesGenerale.js' });
  return context.module.exports;
}

const {
  validerPeriodeCourses,
  construireListeCoursesGenerale,
  grouperListeCoursesGenerale,
  formatsAchatCourants,
  calculerAchatConditionne,
  initialiserSuiviCoursesGenerales,
  modifierSuiviCourseGenerale,
  resumerSuiviCoursesGenerales,
  resumerPrixListeCoursesGenerale
} = chargerModule();
const referentiel = [{ nom: 'Carottes', categorie: 'légume', qn: 5 }, { nom: 'Poulet', categorie: 'protéine', qn: 4 }];

describe('Liste de courses générale depuis le planning', () => {
  test('refuse une période absente ou inversée', () => {
    expect(validerPeriodeCourses('', '2026-08-30').valide).toBe(false);
    expect(validerPeriodeCourses('2026-08-30', '2026-08-24').valide).toBe(false);
  });

  test('conserve uniquement les lignes de la période demandée', () => {
    const resultat = construireListeCoursesGenerale([
      { id: '1', date: '2026-08-24', aliment: 'Poulet', categorie: 'protéine', quantite: '120 g' },
      { id: '2', date: '2026-09-01', aliment: 'Poulet', categorie: 'protéine', quantite: '120 g' }
    ], { debut: '2026-08-24', fin: '2026-08-30', referentiel });
    expect(resultat.resume.lignes_planifiees).toBe(1);
    expect(resultat.articles[0]).toMatchObject({ quantite: '120 g', categorie: 'protéine', qn: 4 });
  });

  test('n’invente aucun QN lorsque le référentiel n’en fournit pas', () => {
    const resultat = construireListeCoursesGenerale([
      { id: '1', date: '2026-08-24', aliment: 'Lait', categorie: 'boisson', quantite: '1 L' }
    ], { debut: '2026-08-24', fin: '2026-08-30', referentiel: [{ nom: 'Lait', categorie: 'boisson' }] });
    expect(resultat.articles[0]).toMatchObject({ categorie: 'boisson', qn: null });
  });

  test('additionne les mêmes aliments et convertit les unités compatibles', () => {
    const resultat = construireListeCoursesGenerale([
      { id: '1', date: '2026-08-24', aliment: 'Carottes', categorie: 'légume', quantite: '500 g' },
      { id: '2', date: '2026-08-25', aliment: 'carottes', categorie: 'légume', quantite: '0.75 kg' }
    ], { debut: '2026-08-24', fin: '2026-08-30', referentiel });
    expect(resultat.articles).toHaveLength(1);
    expect(resultat.articles[0]).toMatchObject({ nom: 'Carottes', quantite: '1.25 kg', utilisations_estimees: 2 });
  });

  test('arrondit seulement après avoir additionné les quantités planifiées', () => {
    const resultat = construireListeCoursesGenerale([
      { id: '1', date: '2026-08-24', aliment: 'Lait', categorie: 'boisson', quantite: '110 ml' },
      { id: '2', date: '2026-08-25', aliment: 'Lait', categorie: 'boisson', quantite: '115 ml' }
    ], { debut: '2026-08-24', fin: '2026-08-30' });
    expect(resultat.articles[0]).toMatchObject({ besoin_valeur: 225, besoin_unite: 'ml', quantite_planifiee: '225 ml', quantite: '250 ml' });
  });

  test('propose seulement des formats courants identifiés comme tels', () => {
    expect(formatsAchatCourants({ nom: 'Œuf', categorie: 'protéine' }).map(item => item.valeur)).toEqual([6, 10, 12]);
    expect(formatsAchatCourants({ nom: 'Haricots verts', categorie: 'légume' })).toEqual([]);
  });

  test('calcule une boîte et le reste à partir du besoin exact en œufs', () => {
    expect(calculerAchatConditionne(
      { besoin_valeur: 2, besoin_unite: 'unité' },
      { valeur: 6, unite: 'unité' }
    )).toMatchObject({ statut: 'ok', calcul_automatique: true, nombre_conditionnements: 1, quantite_achat: '6 unité', reliquat: 4 });
  });

  test('calcule deux paquets de 500 g pour un besoin de 720 g', () => {
    expect(calculerAchatConditionne(
      { besoin_valeur: 720, besoin_unite: 'g' },
      { valeur: 500, unite: 'g' }
    )).toMatchObject({ statut: 'ok', nombre_conditionnements: 2, quantite_achat: '1 kg', reliquat: 280 });
  });

  test('ne convertit pas arbitrairement des cuillères en grammes', () => {
    const article = { besoin_valeur: 6, besoin_unite: 'CS' };
    const incomplet = calculerAchatConditionne(article, { valeur: 500, unite: 'g' });
    expect(incomplet).toMatchObject({ statut: 'nombre_a_saisir', calcul_automatique: false });
    const manuel = calculerAchatConditionne(article, { valeur: 500, unite: 'g', nombre_conditionnements: 2 });
    expect(manuel).toMatchObject({ statut: 'ok', calcul_automatique: false, nombre_conditionnements: 2, quantite_achat: '1 kg', reliquat: null });
  });

  test('demande un format avant de calculer l’achat', () => {
    expect(calculerAchatConditionne({ besoin_valeur: 500, besoin_unite: 'g' })).toMatchObject({ statut: 'a_choisir' });
  });

  test('signale les anciennes lignes incomplètes sans inventer de quantité', () => {
    const resultat = construireListeCoursesGenerale([
      { id: '1', date: '2026-08-24', aliment: 'Poulet', categorie: 'protéine', quantite: null },
      { id: '2', date: '2026-08-25', aliment: 'Poulet', categorie: 'protéine', quantite: '' }
    ], { debut: '2026-08-24', fin: '2026-08-30', referentiel });
    expect(resultat.articles).toEqual([]);
    expect(resultat.incomplets[0]).toMatchObject({ nom: 'Poulet', occurrences: 2, raison: 'Quantité ou unité non renseignée' });
    expect(resultat.resume).toMatchObject({ lignes_incompletes: 2, complet: false });
  });

  test('ne compte pas deux fois une même ligne Supabase', () => {
    const ligne = { id: 'unique', date: '2026-08-24', aliment: 'Poulet', categorie: 'protéine', quantite: '120 g' };
    const resultat = construireListeCoursesGenerale([ligne, ligne], { debut: '2026-08-24', fin: '2026-08-30', referentiel });
    expect(resultat.resume.lignes_planifiees).toBe(1);
    expect(resultat.articles[0].quantite).toBe('120 g');
  });

  test('compte les ingrédients photographiés du repas composé sans ajouter son nom comme article', () => {
    const resultat = construireListeCoursesGenerale([
      { id: 'p', date: '2026-08-24', aliment: 'Poulet', categorie: 'protéine', quantite: '120 g', combo_valide: true },
      { id: 'c', date: '2026-08-24', aliment: 'Carottes', categorie: 'légume', quantite: '150 g', combo_valide: true }
    ], { debut: '2026-08-24', fin: '2026-08-30', referentiel });
    expect(resultat.articles.map(item => item.nom).sort()).toEqual(['Carottes', 'Poulet']);
  });

  test('regroupe dynamiquement toutes les catégories présentes', () => {
    const groupes = grouperListeCoursesGenerale([
      { nom: 'Poulet', categorie: 'protéine' }, { nom: 'Carottes', categorie: 'légume' }, { nom: 'Cumin', categorie: 'épicerie' }
    ]);
    expect(Object.keys(groupes).sort()).toEqual(['légume', 'protéine', 'épicerie']);
  });

  test('initialise les articles à acheter sans ajouter de prix par aliment', () => {
    const articles = initialiserSuiviCoursesGenerales([{ article_id: 'carottes', nom: 'Carottes' }]);
    expect(articles[0]).toMatchObject({ statut_achat: 'a_acheter' });
    expect(articles[0]).not.toHaveProperty('prix_estime');
    expect(articles[0]).not.toHaveProperty('prix_reel');
  });

  test('conserve le statut des articles identiques après recalcul du plan', () => {
    const precedent = [{ article_id: 'carottes', nom: 'Carottes', quantite: '500 g', statut_achat: 'panier', conditionnement_achat: { mode: 'personnalise', valeur: 1, unite: 'kg' } }];
    const recalcules = initialiserSuiviCoursesGenerales([
      { article_id: 'carottes', nom: 'Carottes', quantite: '750 g' },
      { article_id: 'poulet', nom: 'Poulet', quantite: '250 g' }
    ], precedent);
    expect(recalcules[0]).toMatchObject({ quantite: '750 g', statut_achat: 'panier', conditionnement_achat: { valeur: 1, unite: 'kg' } });
    expect(recalcules[1]).toMatchObject({ statut_achat: 'a_acheter' });
  });

  test('modifie le statut pratique sans ajouter de prix par aliment', () => {
    let articles = initialiserSuiviCoursesGenerales([{ article_id: 'poulet', nom: 'Poulet' }]);
    articles = modifierSuiviCourseGenerale(articles, 'poulet', { statut_achat: 'deja_disponible' });
    expect(articles[0]).toMatchObject({ statut_achat: 'deja_disponible' });
    expect(articles[0].statut_modifie_le).toBeTruthy();
  });

  test('calcule la progression indépendamment du prix global du panier', () => {
    const resume = resumerSuiviCoursesGenerales([
      { statut_achat: 'a_acheter' },
      { statut_achat: 'panier' },
      { statut_achat: 'deja_disponible' }
    ]);
    expect(resume).toMatchObject({
      total: 3,
      a_acheter: 1,
      panier: 1,
      deja_disponible: 1,
      traites: 2
    });
  });

  test('compare une seule estimation au total payé pour toute la liste', () => {
    expect(resumerPrixListeCoursesGenerale('50,00', '47.80')).toEqual({ prix_estime: 50, prix_reel: 47.8, ecart: -2.2 });
    expect(resumerPrixListeCoursesGenerale('', '47.80')).toEqual({ prix_estime: null, prix_reel: 47.8, ecart: null });
  });
});

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
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { validerPeriodeCourses, construireArticlePlanifie, construireListeCoursesGenerale, grouperListeCoursesGenerale };');
  vm.runInContext(source, context, { filename: 'listeCoursesGenerale.js' });
  return context.module.exports;
}

const { validerPeriodeCourses, construireListeCoursesGenerale, grouperListeCoursesGenerale } = chargerModule();
const referentiel = [{ nom: 'Carottes', categorie: 'légume' }, { nom: 'Poulet', categorie: 'protéine' }];

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
    expect(resultat.articles[0].quantite).toBe('120 g');
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
    expect(resultat.articles[0]).toMatchObject({ quantite_planifiee: '225 ml', quantite: '250 ml' });
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
});


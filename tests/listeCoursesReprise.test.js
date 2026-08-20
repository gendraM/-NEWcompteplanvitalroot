const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const filePath = path.join(__dirname, '../lib/listeCoursesReprise.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = source
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { normaliserListeCoursesReprise, grouperListeCoursesReprise, creerConfigurationCoursesReprise, choixCoursesComplets, genererListeCoursesPersonnalisee, initialiserEtatsListeCourses, modifierStatutArticle, alternativesArticle, remplacerArticleCourses };');

  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'listeCoursesReprise.js' });
  return context.module.exports;
}

const {
  normaliserListeCoursesReprise,
  grouperListeCoursesReprise,
  creerConfigurationCoursesReprise,
  choixCoursesComplets,
  genererListeCoursesPersonnalisee,
  initialiserEtatsListeCourses,
  modifierStatutArticle,
  alternativesArticle,
  remplacerArticleCourses
} = chargerModule();

const programmeSixJours = {
  duree_reprise_jours: 6,
  phases: {
    phase1: { debut: 1, fin: 1 },
    phase2: { debut: 2, fin: 2 },
    phase3: { debut: 3, fin: 3 },
    phase4: { debut: 4, fin: 5 },
    phase5: { debut: 6, fin: 6 }
  }
};

describe('Liste de courses canonique de la reprise', () => {
  test('conserve le tableau généré et ses quantités', () => {
    const resultat = normaliserListeCoursesReprise([
      { nom: 'Bouillon', quantite: '1L', categorie: 'liquide', phase: 1, priorite: 'haute' }
    ]);

    expect(resultat).toMatchObject([
      { nom: 'Bouillon', quantite: '1L', categorie: 'liquide', phase: 1, priorite: 'haute' }
    ]);
  });

  test('convertit encore un ancien objet groupé', () => {
    const resultat = normaliserListeCoursesReprise({
      legumes: {
        aliments: ['Carotte', 'Courgette'],
        quantite_estimee: '500g'
      }
    });

    expect(resultat.map(item => [item.nom, item.quantite, item.categorie])).toEqual([
      ['Carotte', '500g', 'legumes'],
      ['Courgette', '500g', 'legumes']
    ]);
  });

  test('regroupe le format canonique pour la présentation sans le recalculer', () => {
    const groupes = grouperListeCoursesReprise([
      { nom: 'Bouillon', quantite: '1L', categorie: 'liquide' },
      { nom: 'Carotte', quantite: '300g', categorie: 'légume' }
    ]);

    expect(Object.keys(groupes)).toEqual(['liquide', 'légume']);
    expect(groupes.liquide[0].nom).toBe('Bouillon');
    expect(groupes['légume'][0].quantite).toBe('300g');
  });

  test('ignore proprement les données absentes ou invalides', () => {
    expect(normaliserListeCoursesReprise(null)).toEqual([]);
    expect(normaliserListeCoursesReprise([null, {}, { nom: 'Infusion' }])).toHaveLength(1);
  });

  test('ne propose que les groupes réellement accessibles sur la période', () => {
    const configuration = creerConfigurationCoursesReprise(programmeSixJours);
    expect(configuration.periode.libelle).toBe('J1 à J6');
    expect(configuration.indispensables.map(item => item.nom)).toContain('Légumes pour bouillon clair');
    expect(configuration.groupes.map(groupe => groupe.id)).not.toContain('texture-lisse');
    expect(configuration.groupes.map(groupe => groupe.id)).toContain('crudite-douce');
  });

  test('exige un choix dans chaque groupe visible', () => {
    const configuration = creerConfigurationCoursesReprise(programmeSixJours);
    expect(choixCoursesComplets(configuration, {})).toBe(false);
    const choix = Object.fromEntries(configuration.groupes.map(groupe => [groupe.id, [groupe.options[0].nom]]));
    expect(choixCoursesComplets(configuration, choix)).toBe(true);
  });

  test('génère uniquement les indispensables et alternatives retenues', () => {
    const configuration = creerConfigurationCoursesReprise(programmeSixJours);
    const choix = Object.fromEntries(configuration.groupes.map(groupe => [groupe.id, [groupe.options[0].nom]]));
    const liste = genererListeCoursesPersonnalisee(programmeSixJours, choix);
    expect(liste.some(item => item.type === 'indispensable')).toBe(true);
    expect(liste.some(item => item.nom === 'Infusion menthe')).toBe(false);
    expect(liste.some(item => item.nom === 'Poulet' && item.preparation.includes('80 à 120 g'))).toBe(true);
    expect(liste.every(item => item.quantite && item.phase)).toBe(true);
  });

  test('répartit les utilisations lorsque plusieurs alternatives sont choisies', () => {
    const choix = {
      'proteine-animale': ['Poulet', 'Dinde']
    };
    const liste = genererListeCoursesPersonnalisee(programmeSixJours, choix);
    const poulet = liste.find(item => item.nom === 'Poulet');
    const dinde = liste.find(item => item.nom === 'Dinde');
    expect(poulet.quantite).toBe('100 g');
    expect(dinde.quantite).toBe('100 g');
    expect(poulet).toMatchObject({
      utilisations_estimees: 1,
      portion_par_utilisation: 100,
      unite_portion: 'g',
      quantite_valeur: 100,
      quantite_unite: 'g'
    });
  });

  test('calcule la quantité depuis la portion et les utilisations couvertes', () => {
    const programme = {
      duree_reprise_jours: 7,
      phases: { phase4: { debut: 1, fin: 7 } }
    };
    const liste = genererListeCoursesPersonnalisee(programme, {
      'proteine-animale': ['Poulet'],
      'feculent-doux': ['Patates douces'],
      'crudite-douce': ['Tomates']
    });

    expect(liste.find(item => item.nom === 'Poulet')).toMatchObject({
      quantite: '700 g',
      utilisations_estimees: 7,
      portion_par_utilisation: 100
    });
    expect(liste.find(item => item.nom === 'Tomates')).toMatchObject({
      quantite: '6 unités',
      utilisations_estimees: 6
    });
  });

  test('affiche les grands totaux dans une unité d’achat lisible', () => {
    const programme = {
      duree_reprise_jours: 7,
      phases: { phase4: { debut: 1, fin: 7 } }
    };
    const liste = genererListeCoursesPersonnalisee(programme, {
      'proteine-animale': ['Poulet'],
      'feculent-doux': ['Patates douces'],
      'crudite-douce': ['Carottes']
    });

    expect(liste.find(item => item.nom === 'Patates douces').quantite).toBe('1.05 kg');
  });

  test('initialise les anciennes listes avec un identifiant et le statut à acheter', () => {
    const liste = initialiserEtatsListeCourses([{ nom: 'Poulet', quantite: '200 g', groupe_id: 'proteine-animale', phase: 4 }]);
    expect(liste[0].article_id).toContain('poulet');
    expect(liste[0].statut_achat).toBe('a_acheter');
  });

  test('conserve l’article en changeant uniquement son état pratique', () => {
    const liste = initialiserEtatsListeCourses([{ nom: 'Poulet', quantite: '200 g', groupe_id: 'proteine-animale', phase: 4 }]);
    const resultat = modifierStatutArticle(liste, liste[0].article_id, 'achete');
    expect(resultat[0]).toMatchObject({ nom: 'Poulet', quantite: '200 g', statut_achat: 'achete' });
    expect(resultat[0].statut_modifie_le).toBeTruthy();
  });

  test('ne propose que les substitutions du même groupe', () => {
    const liste = genererListeCoursesPersonnalisee(programmeSixJours, { 'proteine-animale': ['Poulet'] });
    const poulet = initialiserEtatsListeCourses(liste).find(item => item.nom === 'Poulet');
    expect(alternativesArticle(programmeSixJours, poulet).map(item => item.nom)).toEqual(['Dinde', 'Poisson blanc']);
  });

  test('remplace une alternative sans recréer le programme ni perdre les autres choix', () => {
    const configuration = creerConfigurationCoursesReprise(programmeSixJours);
    const choix = Object.fromEntries(configuration.groupes.map(groupe => [groupe.id, [groupe.options[0].nom]]));
    const liste = initialiserEtatsListeCourses(genererListeCoursesPersonnalisee(programmeSixJours, choix));
    const poulet = liste.find(item => item.nom === 'Poulet');
    const resultat = remplacerArticleCourses(programmeSixJours, liste, poulet.article_id, 'Dinde', choix);
    expect(resultat.remplace).toBe(true);
    expect(resultat.liste.some(item => item.nom === 'Dinde')).toBe(true);
    expect(resultat.liste.some(item => item.nom === 'Poulet')).toBe(false);
    expect(resultat.choix['feculent-doux']).toEqual(choix['feculent-doux']);
  });

  test('interdit le remplacement d’un indispensable', () => {
    const liste = initialiserEtatsListeCourses(genererListeCoursesPersonnalisee(programmeSixJours, {}));
    const indispensable = liste.find(item => item.type === 'indispensable');
    const resultat = remplacerArticleCourses(programmeSixJours, liste, indispensable.article_id, 'Courgettes', {});
    expect(resultat.remplace).toBe(false);
  });

  test('génère une période suivante depuis le même programme', () => {
    const programmeLong = {
      duree_reprise_jours: 20,
      phases: { phase5: { debut: 8, fin: 20 } }
    };
    const configuration = creerConfigurationCoursesReprise(programmeLong, 14, 8);
    expect(configuration.periode).toMatchObject({ debut: 8, fin: 14, libelle: 'J8 à J14' });
    const choix = Object.fromEntries(configuration.groupes.map(groupe => [groupe.id, [groupe.options[0].nom]]));
    const liste = genererListeCoursesPersonnalisee(programmeLong, choix, 14, 8);
    expect(liste.find(item => item.nom === 'Saumon frais')).toMatchObject({ quantite:'700 g', utilisations_estimees:7 });
    expect(liste.every(item => item.phase === 5)).toBe(true);
  });
});

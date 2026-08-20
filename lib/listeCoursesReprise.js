const CATEGORIE_PAR_DEFAUT = 'autre';

const CONFIGURATION_COURSES_PAR_PHASE = {
  1: {
    indispensables: [
      { id: 'base-bouillon', nom: 'Légumes pour bouillon clair', categorie: 'légume', quantiteParJour: 250, unite: 'g', preparation: 'Bouillon filtré, sans morceaux' }
    ],
    groupes: [
      {
        id: 'boisson-douce', titre: 'Choisis une boisson douce', minimum: 1,
        options: [
          { nom: 'Carottes pour jus filtré', categorie: 'légume', quantiteParJour: 250, unite: 'g', preparation: 'Jus filtré et dilué' },
          { nom: 'Concombre pour jus', categorie: 'légume', quantiteParJour: 0.5, unite: 'unité', preparation: 'Pressé et dilué' },
          { nom: 'Infusion menthe', categorie: 'boisson', quantiteFixe: '1 boîte', preparation: 'Sans sucre' },
          { nom: 'Gingembre frais', categorie: 'épicerie', quantiteFixe: '100 g', preparation: 'Infusion sans sucre' },
          { nom: 'Eau de coco nature', categorie: 'boisson', quantiteParJour: 200, unite: 'ml', preparation: '100 % pure' }
        ]
      },
      {
        id: 'texture-lisse', titre: 'Choisis une base pour les textures très lisses', minimum: 1, jourPhaseMin: 2,
        options: [
          { nom: 'Carottes', categorie: 'légume', quantiteParJour: 200, unite: 'g', preparation: 'Vapeur puis mixées très lisses' },
          { nom: 'Courgettes', categorie: 'légume', quantiteParJour: 200, unite: 'g', preparation: 'Vapeur puis mixées très lisses' }
        ]
      }
    ]
  },
  2: {
    indispensables: [],
    groupes: [
      {
        id: 'legume-doux', titre: 'Choisis au moins un légume doux', minimum: 1,
        options: [
          { nom: 'Courgettes', categorie: 'légume', quantiteParJour: 200, unite: 'g', preparation: 'Vapeur, texture fondante' },
          { nom: 'Carottes', categorie: 'légume', quantiteParJour: 200, unite: 'g', preparation: 'Vapeur, texture fondante' },
          { nom: 'Fenouil', categorie: 'légume', quantiteParJour: 200, unite: 'g', preparation: 'Bien cuit' },
          { nom: 'Courge ou potimarron', categorie: 'légume', quantiteParJour: 200, unite: 'g', preparation: 'Bien cuit ou en purée' }
        ]
      },
      {
        id: 'fruit-cuit', titre: 'Choisis un fruit cuit', minimum: 1,
        options: [
          { nom: 'Pommes', categorie: 'fruit', quantiteParJour: 1, unite: 'unité', preparation: 'Cuites, sans sucre ajouté' },
          { nom: 'Poires', categorie: 'fruit', quantiteParJour: 1, unite: 'unité', preparation: 'Cuites, sans sucre ajouté' },
          { nom: 'Compote maison sans sucre', categorie: 'fruit', quantiteParJour: 100, unite: 'g', preparation: 'Maison, sans sucre ajouté' }
        ]
      },
      {
        id: 'lipide-doux', titre: 'Choisis un premier lipide doux', minimum: 1,
        options: [
          { nom: "Huile d'olive vierge", categorie: 'lipide', quantiteFixe: '1 bouteille', preparation: 'Ajoutée crue en petite quantité' },
          { nom: 'Avocats mûrs', categorie: 'fruit', quantiteParJour: 0.5, unite: 'unité', preparation: 'Bien mûrs, écrasés' }
        ]
      }
    ]
  },
  3: {
    indispensables: [],
    groupes: [
      {
        id: 'proteine-legere', titre: 'Choisis une protéine légère', minimum: 1,
        options: [
          { nom: 'Œufs', categorie: 'protéine', quantiteParJour: 1, unite: 'unité', preparation: 'Mollets ou pochés, en fin de phase' },
          { nom: 'Lentilles corail', categorie: 'légumineuse', quantiteParJour: 60, unite: 'g', preparation: 'Bien cuites' }
        ]
      },
      {
        id: 'feculent-digeste', titre: 'Choisis un féculent digeste', minimum: 1,
        options: [
          { nom: 'Riz basmati', categorie: 'féculent', quantiteParJour: 60, unite: 'g', preparation: 'Bien cuit' }
        ]
      }
    ]
  },
  4: {
    indispensables: [],
    groupes: [
      {
        id: 'proteine-animale', titre: 'Choisis une protéine animale légère', minimum: 1,
        options: [
          { nom: 'Poulet', categorie: 'protéine', quantiteParJour: 100, unite: 'g', preparation: 'Vapeur, portion de 80 à 120 g' },
          { nom: 'Dinde', categorie: 'protéine', quantiteParJour: 100, unite: 'g', preparation: 'Vapeur, portion de 80 à 120 g' },
          { nom: 'Poisson blanc', categorie: 'protéine', quantiteParJour: 100, unite: 'g', preparation: 'Vapeur ou papillote, portion de 80 à 120 g' }
        ]
      },
      {
        id: 'feculent-doux', titre: 'Choisis un féculent doux', minimum: 1,
        options: [
          { nom: 'Patates douces', categorie: 'féculent', quantiteParJour: 150, unite: 'g', preparation: 'Vapeur' },
          { nom: 'Riz complet', categorie: 'féculent', quantiteParJour: 60, unite: 'g', preparation: 'Bien cuit' },
          { nom: 'Quinoa', categorie: 'féculent', quantiteParJour: 60, unite: 'g', preparation: 'Bien rincé et cuit' }
        ]
      },
      {
        id: 'crudite-douce', titre: 'Choisis une petite crudité douce', minimum: 1, jourPhaseMin: 2,
        options: [
          { nom: 'Concombre', categorie: 'légume', quantiteParJour: 0.5, unite: 'unité', preparation: 'Épluché' },
          { nom: 'Carottes', categorie: 'légume', quantiteParJour: 100, unite: 'g', preparation: 'Très finement râpées' },
          { nom: 'Tomates', categorie: 'légume', quantiteParJour: 1, unite: 'unité', preparation: 'Pelées' }
        ]
      }
    ]
  },
  5: {
    indispensables: [],
    groupes: [
      {
        id: 'proteine-phase5', titre: 'Choisis une protéine pour la phase 5', minimum: 1,
        options: [
          { nom: 'Saumon frais', categorie: 'protéine', quantiteParJour: 100, unite: 'g', preparation: 'Vapeur ou papillote' },
          { nom: 'Sardines nature', categorie: 'protéine', quantiteParJour: 100, unite: 'g', preparation: 'Nature, non frites' },
          { nom: 'Thon au naturel', categorie: 'protéine', quantiteParJour: 100, unite: 'g', preparation: 'Au naturel' },
          { nom: 'Lentilles vertes', categorie: 'légumineuse', quantiteParJour: 60, unite: 'g', preparation: 'Bien cuites' }
        ]
      },
      {
        id: 'feculent-phase5', titre: 'Choisis un féculent complet', minimum: 1,
        options: [
          { nom: 'Pain complet au levain', categorie: 'féculent', quantiteParJour: 60, unite: 'g', preparation: 'Au levain naturel' },
          { nom: 'Pâtes complètes', categorie: 'féculent', quantiteParJour: 70, unite: 'g', preparation: 'Al dente' },
          { nom: 'Sarrasin', categorie: 'féculent', quantiteParJour: 60, unite: 'g', preparation: 'Bien cuit' }
        ]
      },
      {
        id: 'fruit-phase5', titre: 'Choisis un fruit frais', minimum: 1,
        options: [
          { nom: 'Pommes', categorie: 'fruit', quantiteParJour: 1, unite: 'unité', preparation: 'Crues' },
          { nom: 'Poires', categorie: 'fruit', quantiteParJour: 1, unite: 'unité', preparation: 'Crues' },
          { nom: 'Kiwis', categorie: 'fruit', quantiteParJour: 1, unite: 'unité', preparation: 'Fiche spécifique de la reprise' }
        ]
      }
    ]
  }
};

function phaseSurPeriode(programme, phase, limiteJours = 7) {
  const configuration = programme?.phases?.[`phase${phase}`];
  if (!configuration) return null;
  const debut = Math.max(1, Number(configuration.debut));
  const fin = Math.min(limiteJours, Number(configuration.fin), Number(programme.duree_reprise_jours || limiteJours));
  if (!Number.isFinite(debut) || !Number.isFinite(fin) || fin < debut) return null;
  return { debut, fin, nombreJours: fin - debut + 1 };
}

function arrondirQuantiteAchat(valeur, unite) {
  if (unite === 'unité') return Math.max(1, Math.ceil(valeur));
  if (unite === 'g') return Math.max(10, Math.ceil(valeur / 10) * 10);
  if (unite === 'ml') return Math.max(50, Math.ceil(valeur / 50) * 50);
  return Math.ceil(valeur * 100) / 100;
}

function formaterQuantite(valeur, unite) {
  if (unite === 'g' && valeur >= 1000) {
    return `${Number((valeur / 1000).toFixed(2))} kg`;
  }
  if (unite === 'ml' && valeur >= 1000) {
    return `${Number((valeur / 1000).toFixed(2))} L`;
  }
  return `${valeur} ${unite}${unite === 'unité' && valeur > 1 ? 's' : ''}`;
}

function construireArticle(option, phase, jours, type, groupeId = null, nombreOptions = 1) {
  const utilisationsEstimees = Math.max(1, Math.ceil(jours / Math.max(1, nombreOptions)));
  const quantiteValeur = option.quantiteFixe
    ? null
    : arrondirQuantiteAchat(option.quantiteParJour * utilisationsEstimees, option.unite);
  const quantite = option.quantiteFixe || formaterQuantite(quantiteValeur, option.unite);
  return {
    nom: option.nom,
    quantite,
    categorie: option.categorie,
    phase,
    priorite: type === 'indispensable' ? 'haute' : 'normale',
    type,
    groupe_id: groupeId,
    preparation: option.preparation || null,
    utilisations_estimees: utilisationsEstimees,
    portion_par_utilisation: option.quantiteParJour || null,
    unite_portion: option.unite || null,
    quantite_valeur: quantiteValeur,
    quantite_unite: option.unite || null
  };
}

function cleAgregation(article) {
  return [article.nom, article.categorie, article.preparation || '', article.quantite_unite || ''].join('|');
}

function agregerArticles(articles) {
  return Array.from(articles.reduce((agreges, article) => {
    const cle = cleAgregation(article);
    const existant = agreges.get(cle);
    if (!existant || article.quantite_valeur === null || existant.quantite_valeur === null) {
      agreges.set(existant ? `${cle}|phase${article.phase}` : cle, { ...article });
      return agreges;
    }

    const quantiteValeur = existant.quantite_valeur + article.quantite_valeur;
    agreges.set(cle, {
      ...existant,
      quantite_valeur: quantiteValeur,
      quantite: formaterQuantite(quantiteValeur, existant.quantite_unite),
      utilisations_estimees: existant.utilisations_estimees + article.utilisations_estimees,
      phases: Array.from(new Set([...(existant.phases || [existant.phase]), article.phase])).sort()
    });
    return agreges;
  }, new Map()).values());
}

export function creerConfigurationCoursesReprise(programme, limiteJours = 7) {
  const periodeFin = Math.min(limiteJours, Number(programme?.duree_reprise_jours || limiteJours));
  const indispensables = [];
  const groupes = [];

  Object.entries(CONFIGURATION_COURSES_PAR_PHASE).forEach(([phaseTexte, configuration]) => {
    const phase = Number(phaseTexte);
    const periode = phaseSurPeriode(programme, phase, periodeFin);
    if (!periode) return;

    configuration.indispensables.forEach(option => {
      indispensables.push(construireArticle(option, phase, periode.nombreJours, 'indispensable'));
    });

    configuration.groupes.forEach(groupe => {
      const debutEligible = periode.debut + Number(groupe.jourPhaseMin || 1) - 1;
      if (debutEligible > periode.fin) return;
      groupes.push({
        ...groupe,
        phase,
        joursEligibles: periode.fin - debutEligible + 1
      });
    });
  });

  return {
    periode: { debut: 1, fin: periodeFin, libelle: `J1 à J${periodeFin}` },
    indispensables,
    groupes
  };
}

export function choixCoursesComplets(configuration, choix = {}) {
  return configuration.groupes.every(groupe =>
    (choix[groupe.id] || []).length >= Number(groupe.minimum || 0)
  );
}

export function genererListeCoursesPersonnalisee(programme, choix = {}, limiteJours = 7) {
  const configuration = creerConfigurationCoursesReprise(programme, limiteJours);
  const articlesChoisis = configuration.groupes.flatMap(groupe => {
    const nomsChoisis = choix[groupe.id] || [];
    const options = groupe.options.filter(option => nomsChoisis.includes(option.nom));
    return options.map(option => construireArticle(
      option,
      groupe.phase,
      groupe.joursEligibles,
      'choix',
      groupe.id,
      options.length
    ));
  });

  return agregerArticles([...configuration.indispensables, ...articlesChoisis]).sort((a, b) =>
    a.phase - b.phase || a.categorie.localeCompare(b.categorie) || a.nom.localeCompare(b.nom)
  );
}

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
    priorite: item.priorite || 'normale',
    type: item.type || null,
    groupe_id: item.groupe_id || null,
    preparation: item.preparation || null,
    utilisations_estimees: item.utilisations_estimees || null,
    portion_par_utilisation: item.portion_par_utilisation ?? null,
    unite_portion: item.unite_portion || null,
    quantite_valeur: item.quantite_valeur ?? null,
    quantite_unite: item.quantite_unite || null,
    phases: item.phases || null
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

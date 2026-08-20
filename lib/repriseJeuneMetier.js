import alimentsRepriseJeune from '../data/alimentsRepriseJeune';

export const PHASES_REPRISE = {
  1: {
    nom: 'Liquides et textures très lisses',
    objectif: 'Réhydratation et reprise digestive très progressive',
    familles: ['liquide', 'semi-liquide'],
    preparations: ['filtré', 'dilué', 'mixé'],
    textures: ['liquide', 'très lisse'],
    qnMinimum: 4
  },
  2: {
    nom: 'Fibres douces et premières huiles',
    objectif: 'Réactiver doucement le transit avec des aliments cuits',
    familles: ['liquide', 'légume', 'fruit', 'lipide'],
    preparations: ['vapeur', 'cuit', 'mixé'],
    textures: ['lisse', 'fondante', 'écrasée'],
    qnMinimum: 4
  },
  3: {
    nom: 'Solides légers et protéines végétales',
    objectif: 'Réintroduire les solides digestes et les protéines végétales',
    familles: ['légume', 'féculent', 'protéine', 'lipide', 'bouillon'],
    preparations: ['vapeur', 'poché', 'mollet', 'bien cuit'],
    textures: ['tendre', 'fondante', 'écrasée'],
    qnMinimum: 3
  },
  4: {
    nom: 'Protéines animales légères et crudités douces',
    objectif: 'Ajouter les protéines maigres puis de petites crudités',
    familles: ['protéine', 'légume', 'féculent', 'fruit'],
    preparations: ['vapeur', 'papillote', 'bien cuit'],
    textures: ['tendre', 'épluchée', 'pelée', 'très finement râpée'],
    qnMinimum: 3
  },
  5: {
    nom: 'Alimentation complète contrôlée',
    objectif: 'Élargir progressivement l’alimentation et stabiliser les habitudes',
    familles: ['féculent', 'feculent', 'légumineuse', 'produit_laitier', 'fruit', 'viande', 'poisson', 'douceur', 'oleagineux', 'protéine', 'lipide'],
    preparations: ['vapeur', 'papillote', 'bien cuit', 'al dente'],
    textures: ['normale', 'tendre'],
    qnMinimum: 3
  }
};

const normaliser = valeur => String(valeur || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// Un alias n'est ajouté que lorsque l'identité alimentaire est suffisamment fiable.
// Les conditions de cuisson et de texture restent portées par la règle de reprise.
export const CORRESPONDANCES_REFERENTIEL_REPRISE = {
  'courgettes cuites': 'Courgette cuite vapeur',
  'fenouil cuit': 'Fenouil cuit',
  'epinards cuits': 'Épinards cuits',
  'huile d olive crue': "Huile d'olive vierge",
  'avocat': 'Avocat',
  'oeuf': 'Œuf mollet',
  'sardines boite nature': 'Sardines nature',
  'puree d amandes noisette': "Purée d'amandes",
  'puree d amande': "Purée d'amandes",
  'fromage blanc': 'Fromage blanc 0%',
  'fromage blanc 0': 'Fromage blanc 0%',
  'thon naturel': 'Thon au naturel',
  'thon naturel boite': 'Thon au naturel',
  'lentilles cuites': 'Lentilles corail',
  'haricots verts': 'Haricots verts',
  'patate douce': 'Patate douce',
  'riz complet': 'Riz complet',
  'quinoa': 'Quinoa',
  'flocons d avoine': "Flocons d'avoine",
  'sarrasin kasha': 'Sarrasin',
  'banane': 'Banane mûre',
  'pois chiches cuits': 'Pois chiches cuits',
  'pomme de terre': 'Pomme de terre vapeur',
  'millet': 'Millet',
  'pates completes': 'Pâtes complètes',
  'haricots rouges cuits': 'Haricots rouges',
  'chevre frais': 'Fromage chèvre frais',
  'comte': 'Fromage comté AOP',
  'pomme': 'Pomme crue bio',
  'epeautre petit epeautre': 'Épeautre complet',
  'boeuf maigre 5 mg': 'Bœuf maigre (5% MG)',
  'maquereau filet': 'Maquereau frais',
  'poisson blanc': 'Poisson blanc vapeur ou papillote',
  'poulet': 'Poulet vapeur',
  'blanc de dinde': 'Dinde vapeur',
  'concombre': 'Concombre épluché',
  'carottes rapees': 'Carotte très finement râpée',
  'tomate': 'Tomate pelée',
  'saumon frais': 'Saumon sauvage'
};

const REGLES_PREPARATION = {
  'Bouillon de légumes clair': { preparations: ['filtré'], textures: ['liquide'] },
  'Bouillon de poulet maison': { preparations: ['filtré', 'dégraissé'], textures: ['liquide'] },
  'Jus de carotte filtré': { preparations: ['filtré', 'dilué'], textures: ['liquide'] },
  'Jus de concombre': { preparations: ['pressé', 'dilué'], textures: ['liquide'] },
  'Purée de carotte lisse': { preparations: ['vapeur', 'mixé'], textures: ['très lisse'] },
  'Purée de courgette lisse': { preparations: ['vapeur', 'mixé'], textures: ['très lisse'] },
  'Courgette cuite vapeur': { preparations: ['vapeur'], textures: ['écrasée', 'fondante'] },
  'Carotte cuite vapeur': { preparations: ['vapeur'], textures: ['mixée', 'fondante'] },
  'Œuf mollet': { preparations: ['mollet', 'poché'], textures: [] },
  'Œuf poché': { preparations: ['poché', 'mollet'], textures: [] },
  'Poulet vapeur': { preparations: ['vapeur'], textures: ['tendre'] },
  'Dinde vapeur': { preparations: ['vapeur'], textures: ['tendre'] },
  'Poisson blanc vapeur ou papillote': { preparations: ['vapeur', 'papillote'], textures: ['tendre'] },
  'Concombre épluché': { preparations: ['cru'], textures: ['épluchée'] },
  'Carotte très finement râpée': { preparations: ['cru'], textures: ['très finement râpée'] },
  'Tomate pelée': { preparations: ['cru'], textures: ['pelée'] },
  'Pomme de terre vapeur': { preparations: ['vapeur'], textures: ['fondante'] },
  'Pain complet au levain': { preparations: ['levain'], textures: [] },
  'Saumon sauvage': { preparations: ['vapeur', 'papillote'], textures: ['tendre'] },
  'Saumon vapeur': { preparations: ['vapeur', 'papillote'], textures: ['tendre'] }
};

const indexRegles = new Map(alimentsRepriseJeune.map(aliment => [normaliser(aliment.nom), aliment]));

export function trouverRegleReprise(alimentOuNom) {
  const nom = typeof alimentOuNom === 'string' ? alimentOuNom : alimentOuNom?.nom;
  const cle = normaliser(nom);
  const directe = indexRegles.get(cle);
  if (directe) return directe;

  const nomReprise = CORRESPONDANCES_REFERENTIEL_REPRISE[cle];
  return nomReprise ? indexRegles.get(normaliser(nomReprise)) || null : null;
}

export function getContraintesAliment(alimentOuNom) {
  const regle = trouverRegleReprise(alimentOuNom);
  if (!regle) return { preparations: [], textures: [] };
  return REGLES_PREPARATION[regle.nom] || { preparations: [], textures: [] };
}

export function getAlimentsIntroduitsPhase(phase, jourDansPhase = 1) {
  return alimentsRepriseJeune.filter(aliment =>
    aliment.phase === Number(phase)
    && (!aliment.jourPhaseMin || jourDansPhase >= aliment.jourPhaseMin)
  );
}

export function getAlimentsDisponiblesPhase(phase, jourDansPhase = 1) {
  return alimentsRepriseJeune.filter(aliment =>
    aliment.phase < Number(phase)
    || (aliment.phase === Number(phase) && (!aliment.jourPhaseMin || jourDansPhase >= aliment.jourPhaseMin))
  );
}

export function evaluerAlimentReprise({
  aliment,
  phase,
  jourDansPhase = 1,
  preparation = null,
  texture = null
}) {
  const phaseCourante = Number(phase);
  const regle = trouverRegleReprise(aliment);
  const qn = Number(aliment?.qn ?? regle?.qn);
  const phaseMetier = PHASES_REPRISE[phaseCourante];

  if (!regle) {
    return {
      statut: 'non_reference_reprise',
      conforme: false,
      phase_ok: false,
      jour_ok: false,
      qn_ok: Number.isFinite(qn) ? qn >= phaseMetier.qnMinimum : null,
      preparation_ok: null,
      texture_ok: null,
      regle: null,
      attendu: null
    };
  }

  const contraintes = getContraintesAliment(regle);
  const phaseOk = regle.phase <= phaseCourante;
  const jourOk = regle.phase < phaseCourante || !regle.jourPhaseMin || jourDansPhase >= regle.jourPhaseMin;
  const qnOk = Number.isFinite(qn) ? qn >= phaseMetier.qnMinimum : null;
  const preparationOk = contraintes.preparations.length === 0
    ? true
    : preparation === null || preparation === 'Je ne sais pas'
      ? null
      : contraintes.preparations.includes(preparation);
  const textureOk = contraintes.textures.length === 0
    ? true
    : texture === null || texture === 'Je ne sais pas'
      ? null
      : contraintes.textures.includes(texture);

  let statut = 'autorise';
  if (!phaseOk) statut = 'phase_suivante';
  else if (!jourOk) statut = 'jour_suivant';
  else if (qnOk === false || preparationOk === false || textureOk === false) statut = 'ecart';
  else if (preparationOk === null || textureOk === null) statut = 'a_confirmer';

  return {
    statut,
    conforme: statut === 'autorise',
    phase_ok: phaseOk,
    jour_ok: jourOk,
    qn_ok: qnOk,
    preparation_ok: preparationOk,
    texture_ok: textureOk,
    regle,
    attendu: {
      phase: regle.phase,
      jour_phase_min: regle.jourPhaseMin || 1,
      qn_minimum: phaseMetier.qnMinimum,
      preparations: contraintes.preparations,
      textures: contraintes.textures,
      portion: regle.portionDefaut
    }
  };
}

export function harmoniserJoursProgramme(jours = []) {
  const compteursPhase = {};
  return [...jours]
    .sort((a, b) => Number(a.jour_numero) - Number(b.jour_numero))
    .map(jour => {
      const phase = Number(String(jour.phase).replace('phase', ''));
      compteursPhase[phase] = (compteursPhase[phase] || 0) + 1;
      const jourDansPhase = compteursPhase[phase];
      return {
        ...jour,
        phase,
        aliments_autorises: getAlimentsDisponiblesPhase(phase, jourDansPhase).map(aliment => ({
          nom: aliment.nom,
          categorie: aliment.categorie,
          portion: aliment.portionDefaut,
          unite: aliment.unite,
          conseil: aliment.conseil,
          favoriseCetose: aliment.favoriseCetose,
          phase_introduction: aliment.phase,
          nouveau_dans_phase: aliment.phase === phase
        }))
      };
    });
}

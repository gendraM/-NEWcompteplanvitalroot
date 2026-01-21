// Module de génération de défis comportementaux personnalisés pour la cristallisation
// Respecte le plan validé, sans enrichissement global ni dépendance à un système de connexion

/**
 * Génère une liste de défis comportementaux adaptés à la phase de cristallisation
 * selon les difficultés/contextes détectés dans le bilan de reprise.
 * @param {Object} options - Données d'entrée (difficultés, contexte, bilan, etc.)
 * @param {Array<string>} options.difficultes - Difficultés déclarées (ex: ['oubli', 'flemme', 'pas le temps', ...])
 * @param {Array<string>} options.contextes - Contextes spécifiques (ex: ['regles', 'stress', 'voyage', 'maladie'])
 * @returns {Array<Object>} Liste de défis personnalisés
 */
export function genererDefisCristallisation({ difficultes = [], contextes = [] }) {
  // Référentiel local des défis (strictement local, pas d'enrichissement global)
  const referentielDefis = {
    oubli: {
      titre: "Saisie quotidienne 3 min",
      description: "Note chaque repas pendant 21 jours pour ancrer la discipline.",
      duree: 21,
      type: "discipline"
    },
    flemme: {
      titre: "Saisie rapide",
      description: "Valide chaque repas en moins de 2 minutes pour garder le rythme.",
      duree: 14,
      type: "motivation"
    },
    "pas le temps": {
      titre: "Saisie express",
      description: "Consacre 1 minute après chaque repas pour noter l'essentiel.",
      duree: 10,
      type: "organisation"
    },
    "pas compris": {
      titre: "Tutoriel guidé",
      description: "Suis le tutoriel pour bien comprendre la saisie des repas.",
      duree: 7,
      type: "apprentissage"
    },
    "honte ecarts": {
      titre: "Focus progrès",
      description: "Chaque jour, note un progrès sans jugement.",
      duree: 14,
      type: "bienveillance"
    },
    motivation: {
      titre: "Objectif court terme",
      description: "Fixe-toi un objectif sur 7 jours et valide-le chaque jour.",
      duree: 7,
      type: "motivation"
    },
    regles: {
      titre: "Gestion fringales hormonales",
      description: "Observe et adapte ton alimentation pendant la période hormonale.",
      duree: 7,
      type: "adaptation"
    },
    stress: {
      titre: "Journal émotions",
      description: "Prends 2 minutes chaque soir pour noter ton ressenti.",
      duree: 10,
      type: "gestion du stress"
    },
    voyage: {
      titre: "Adaptation repas",
      description: "Note chaque adaptation de repas lors de tes déplacements.",
      duree: 7,
      type: "flexibilite"
    },
    maladie: {
      titre: "Repos et adaptation",
      description: "Prends soin de toi, adapte ton alimentation et note tes ressentis.",
      duree: 7,
      type: "sante"
    },
    // Ajouts pour chaque case du questionnaire
    organisation: {
      titre: "Organisation quotidienne",
      description: "Prépare ton planning repas chaque matin pour limiter les imprévus.",
      duree: 10,
      type: "organisation"
    },
    tentations: {
      titre: "Gérer les tentations",
      description: "Identifie et anticipe les situations à risque pour éviter les écarts.",
      duree: 10,
      type: "gestion des tentations"
    },
    entourage: {
      titre: "Pression de l'entourage",
      description: "Affirme tes choix alimentaires face à l'entourage, note chaque situation.",
      duree: 7,
      type: "environnement social"
    },
    fatigue: {
      titre: "Énergie et récupération",
      description: "Prends soin de ton sommeil et note ton niveau d'énergie chaque jour.",
      duree: 7,
      type: "récupération"
    },
    comprehension: {
      titre: "Compréhension des consignes",
      description: "Relis les consignes et pose tes questions si besoin, note tes incompréhensions.",
      duree: 7,
      type: "apprentissage"
    },
    faim: {
      titre: "Gestion de la faim",
      description: "Observe ta faim réelle, note-la avant chaque repas.",
      duree: 7,
      type: "écoute corporelle"
    },
    frustration: {
      titre: "Canaliser la frustration",
      description: "Identifie les sources de frustration et trouve une alternative positive.",
      duree: 7,
      type: "gestion émotionnelle"
    },
    culpabilité: {
      titre: "Sortir de la culpabilité",
      description: "Chaque jour, note une réussite sans jugement.",
      duree: 7,
      type: "bienveillance"
    },
    grignotage: {
      titre: "Stop grignotage",
      description: "Repère les envies de grignotage et trouve une alternative saine.",
      duree: 10,
      type: "gestion des envies"
    },
    ecart: {
      titre: "Limiter les écarts",
      description: "Analyse chaque écart et note ce que tu pourrais faire différemment.",
      duree: 7,
      type: "auto-analyse"
    }
  };

  // Génération des défis selon difficultés
  const defis = [];
  const dejaAjoutes = new Set();
  difficultes.forEach(diff => {
    const cle = diff.toLowerCase();
    if (referentielDefis[cle]) {
      defis.push({ ...referentielDefis[cle], origine: "difficulte" });
      dejaAjoutes.add(cle);
    } else if (cle && !dejaAjoutes.has(cle)) {
      // Génération dynamique pour toute difficulté non reconnue
      defis.push({
        titre: `Défi personnalisé : ${diff}`,
        description: `Chaque jour, note comment tu gères : « ${diff} » ou ce que tu mets en place pour progresser sur ce point.`,
        duree: 7,
        type: "personnalise",
        origine: "dynamique"
      });
      dejaAjoutes.add(cle);
    }
  });

  // Génération des défis selon contextes
  contextes.forEach(ctx => {
    const cle = ctx.toLowerCase();
    if (referentielDefis[cle]) {
      // Évite doublon si déjà ajouté via difficulté
      if (!defis.find(d => d.titre === referentielDefis[cle].titre)) {
        defis.push({ ...referentielDefis[cle], origine: "contexte" });
      }
    } else if (cle && !dejaAjoutes.has(cle)) {
      defis.push({
        titre: `Défi personnalisé : ${ctx}`,
        description: `Chaque jour, note comment tu gères : « ${ctx} » ou ce que tu mets en place pour progresser sur ce point.`,
        duree: 7,
        type: "personnalise",
        origine: "dynamique"
      });
      dejaAjoutes.add(cle);
    }
  });

  // Fallback générique si aucune difficulté/context détectée
  if (defis.length === 0) {
    defis.push({
      titre: "Défi discipline cristallisation",
      description: "Valide chaque repas pendant 10 jours pour ancrer la régularité.",
      duree: 10,
      type: "discipline",
      origine: "generique"
    });
  }

  return defis;
}

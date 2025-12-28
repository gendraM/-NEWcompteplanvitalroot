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
    }
  };

  // Génération des défis selon difficultés
  const defis = [];
  difficultes.forEach(diff => {
    const cle = diff.toLowerCase();
    if (referentielDefis[cle]) {
      defis.push({ ...referentielDefis[cle], origine: "difficulte" });
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

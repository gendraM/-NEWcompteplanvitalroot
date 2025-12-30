// analyseContexteReprise.js
// Module d'analyse contextuelle pour extraire des difficultés, besoins et axes d'adaptation à partir d'un retour utilisateur riche (texte structuré ou libre)

/**
 * Analyse un texte de feedback utilisateur (journal, bilan, etc.) et extrait :
 *  - difficultés rencontrées (mots-clés, catégories)
 *  - besoins exprimés
 *  - suggestions d'adaptations
 *  - contexte alimentaire ou émotionnel
 *
 * @param {string} texteFeedback - Texte libre ou structuré du retour utilisateur
 * @returns {Object} Résultat de l'analyse contextuelle
 *   {
 *     difficultes: [string], // mots-clés ou catégories
 *     besoins: [string],
 *     suggestions: [string],
 *     contexte: string // résumé ou extrait
 *   }
 */
function analyseContexteReprise(texteFeedback) {
  if (!texteFeedback || typeof texteFeedback !== 'string') {
    return {
      difficultes: [],
      besoins: [],
      suggestions: [],
      contexte: ''
    };
  }

  // Listes de mots-clés pour détection simple (à enrichir)
  const difficultesKeywords = [
    'faim', 'fringale', 'fatigue', 'tentation', 'stress', 'émotion', 'envie', 'craquage',
    'difficulté', 'manque', 'isolement', 'solitude', 'frustration', 'culpabilité', 'peur',
    'reprise', 'écart', 'excès', 'grignotage', 'compulsion', 'dérive', 'doute', 'lassitude'
  ];
  const besoinsKeywords = [
    'besoin', 'aide', 'soutien', 'conseil', 'motivation', 'encouragement', 'écoute',
    'accompagnement', 'rappel', 'structure', 'cadre', 'plan', 'astuce', 'solution', 'outil'
  ];
  const suggestionsKeywords = [
    'je propose', 'il faudrait', 'j’aimerais', 'je souhaite', 'pourquoi pas', 'serait utile',
    'serait bien', 'on pourrait', 'je suggère', 'je recommande'
  ];

  // Extraction naïve par recherche de mots-clés (améliorable par NLP)
  const difficultes = difficultesKeywords.filter(mot =>
    texteFeedback.toLowerCase().includes(mot)
  );
  const besoins = besoinsKeywords.filter(mot =>
    texteFeedback.toLowerCase().includes(mot)
  );
  // Suggestions : extraire phrases contenant un mot-clé suggestion
  const suggestions = [];
  const lignes = texteFeedback.split(/[\n\r]+/);
  for (const ligne of lignes) {
    for (const mot of suggestionsKeywords) {
      if (ligne.toLowerCase().includes(mot)) {
        suggestions.push(ligne.trim());
        break;
      }
    }
  }

  // Contexte : première phrase ou résumé (améliorable)
  const contexte = lignes[0]?.trim() || '';

  return {
    difficultes,
    besoins,
    suggestions,
    contexte
  };
}

module.exports = {
  analyseContexteReprise
};

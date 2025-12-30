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

    // Listes de mots-clés enrichies
    const difficultesKeywords = [
      'faim', 'fringale', 'fatigue', 'tentation', 'stress', 'émotion', 'envie', 'craquage',
      'difficulté', 'manque', 'isolement', 'solitude', 'frustration', 'culpabilité', 'peur',
      'reprise', 'écart', 'excès', 'grignotage', 'compulsion', 'dérive', 'doute', 'lassitude',
      'douleur', 'inconfort', 'lourdeur', 'crampe', 'gargouillis', 'culpabilité', 'perte du cadre',
      'déconnexion', 'déclencheur', 'tension', 'nervosité', 'besoin de réconfort', 'perte de satiété',
      'perte du sentiment de sécurité', 'regret', 'déviation', 'dérapage', 'déconnexion de la satiété'
    ];
    const besoinsKeywords = [
      'besoin', 'aide', 'soutien', 'conseil', 'motivation', 'encouragement', 'écoute',
      'accompagnement', 'rappel', 'structure', 'cadre', 'plan', 'astuce', 'solution', 'outil',
      'retour à une structure claire', 'poursuite guidée', 'ancrage', 'équilibre', 'sécurité', 'guidance'
    ];
    const suggestionsKeywords = [
      'je propose', 'il faudrait', 'j’aimerais', 'je souhaite', 'pourquoi pas', 'serait utile',
      'serait bien', 'on pourrait', 'je suggère', 'je recommande', 'ce que tu fais demain', 'à ajuster', 'à corriger'
    ];

    // Découpage en sections thématiques (titres, emojis, séparateurs)
    const sectionSeparators = /🔹|✅|🧠|🍽️|✔|❌|👉|➡️|🌅|🍎|🥣|🚫|🧂|\n\n|\r\n\r\n/;
    const sections = texteFeedback.split(sectionSeparators).map(s => s.trim()).filter(Boolean);

    // Extraction de listes à puces et d'éléments par section
    let difficultes = [];
    let besoins = [];
    let suggestions = [];
    let aliments = [];
    let comportements = [];
    let declencheurs = [];
    let ressentis = [];

    for (const section of sections) {
      // Extraction par mots-clés
      difficultes.push(...difficultesKeywords.filter(mot => section.toLowerCase().includes(mot)));
      besoins.push(...besoinsKeywords.filter(mot => section.toLowerCase().includes(mot)));
      // Suggestions : extraire phrases contenant un mot-clé suggestion
      for (const mot of suggestionsKeywords) {
        if (section.toLowerCase().includes(mot)) {
          suggestions.push(section);
          break;
        }
      }
      // Extraction de listes à puces (aliments, ressentis, comportements)
      const bulletItems = section.match(/^[\-*•✔️➡️👉]+\s*(.+)$/gmi);
      if (bulletItems) {
        for (const item of bulletItems) {
          const clean = item.replace(/^[\-*•✔️➡️👉]+\s*/, '').trim();
          // Catégorisation simple
          if (/poulet|poisson|riz|patate|banane|compote|légume|fruit|bouillon|soupe|semoule|fromage|plat|viande|sashimi|brochette|sandwich|balisto|candy|glace|pop-corn|banane|plantain|ratatouille|manioc|aubergine|oignon|tomate|carotte|courgette|poireau|potiron|potimarron|haricot|persil|thym|laurier|huile|sel|eau|jus|purée|velouté|ragoût/i.test(clean)) {
            aliments.push(clean);
          } else if (/faim|satiété|culpabilité|frustration|fatigue|tension|nervosité|regret|sécurité|inconfort|lourdeur|douleur|crampe|gargouillis|envie|besoin|perte|déconnexion|déclencheur|sentiment|reconfort|écoute|motivation|ancrage|équilibre|guidance|succès|validation|tolérance|ressenti|émotion/i.test(clean)) {
            ressentis.push(clean);
          } else if (/dépassement|recherche|association|accumulation|augmentation|écoute|déclencheur|déconnexion|perte|planifier|corriger|équilibrer|ajouter|éviter|manger|boire|punition|restriction|micro-portion|portion|sensation|comportement|grignotage|compulsion|déviation|dérapage|structure|cadre|guidance|sécurité|proposition|proposer|suggérer|recommander|conseiller|valider|corriger|ajuster/i.test(clean)) {
            comportements.push(clean);
          } else if (/soir|tension|nervosité|fatigue|frustration|besoin de réconfort/i.test(clean)) {
            declencheurs.push(clean);
          }
        }
      }
    }

    // Nettoyage doublons
    difficultes = [...new Set(difficultes)];
    besoins = [...new Set(besoins)];
    suggestions = [...new Set(suggestions)];
    aliments = [...new Set(aliments)];
    comportements = [...new Set(comportements)];
    declencheurs = [...new Set(declencheurs)];
    ressentis = [...new Set(ressentis)];

    // Contexte : première section ou résumé
    const contexte = sections[0]?.slice(0, 200) || '';

    return {
      difficultes,
      besoins,
      suggestions,
      aliments,
      comportements,
      declencheurs,
      ressentis,
      contexte,
      sections // pour debug/affichage avancé
    };
}

module.exports = {
  analyseContexteReprise
};

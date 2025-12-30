// Module transverse pour la gestion et la transmission des adaptations/difficultés de la reprise vers la cristallisation
// Ne contient aucune logique d’exploitation ou d’UI

export function enregistrerAdaptationsReprise(adaptations) {
  // Stockage local (localStorage), extensible Supabase
  localStorage.setItem('adaptationsReprisePourCristallisation', JSON.stringify({
    ...adaptations,
    date: new Date().toISOString()
  }));
}

export function recupererAdaptationsReprise() {
  try {
    return JSON.parse(localStorage.getItem('adaptationsReprisePourCristallisation')) || null;
  } catch {
    return null;
  }
}

// Exemple de structure d'adaptations transmises :
// {
//   difficulte: 'oubli',
//   contexte: 'stress',
//   suggestions: ['rappels', 'badge discipliné'],
//   autres: 'texte libre utilisateur',
//   date: '2025-12-30T12:34:56Z'
// }

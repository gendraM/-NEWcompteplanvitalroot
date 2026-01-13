// Mock temporaire pour le référentiel utilisateur
// À remplacer par accès Supabase

const foodsUser = [
  // Exemple d’aliment personnalisé
  {
    id: 1,
    user_id: 'demo',
    nom: 'Poulet basquaise maison',
    categorie: 'protéine',
    sousCategorie: 'volaille',
    unite: 'g',
    quantite: 150,
    kcal: 180,
    qn: 4,
    portionDefaut: '1 portion (150g)',
    marque: '',
    alternatives: ['Poulet rôti']
  }
  // Ajouter d’autres aliments personnalisés ici
];

export default foodsUser;

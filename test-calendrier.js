// Test calendrier janvier 2026
const dates = [
  '2026-01-26',  // Lundi ?
  '2026-01-27',  // Mardi ?
  '2026-01-19',  // Lundi ?
];

console.log('=== VÉRIFICATION CALENDRIER JANVIER 2026 ===\n');

dates.forEach(d => {
  const date = new Date(d + 'T12:00:00');
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  console.log(`${d} = ${jours[date.getDay()]}`);
});

// Test fonction détection
function estDerniereValidationDuMois(dateSemaine) {
  const dateValidation = new Date(dateSemaine + 'T12:00:00');
  const lundiCourant = new Date(dateValidation);
  const jourSemaine = lundiCourant.getDay();
  const joursDiff = jourSemaine === 0 ? -6 : 1 - jourSemaine;
  lundiCourant.setDate(lundiCourant.getDate() + joursDiff);
  
  const lundiSuivant = new Date(lundiCourant);
  lundiSuivant.setDate(lundiCourant.getDate() + 7);
  
  const moisCourant = lundiCourant.getMonth();
  const moisSuivant = lundiSuivant.getMonth();
  
  console.log(`  Lundi courant: ${lundiCourant.toISOString().split('T')[0]}`);
  console.log(`  Lundi suivant: ${lundiSuivant.toISOString().split('T')[0]}`);
  console.log(`  Résultat: ${moisCourant !== moisSuivant ? '✅ DERNIÈRE' : '❌ PAS dernière'}\n`);
  
  return moisCourant !== moisSuivant;
}

console.log('\n=== TEST DÉTECTION FIN DE MOIS ===\n');

console.log('--- Test 26 janvier (lundi) ---');
estDerniereValidationDuMois('2026-01-26');

console.log('--- Test 19 janvier (lundi) ---');
estDerniereValidationDuMois('2026-01-19');

console.log('--- Test 27 janvier (mardi) ---');
estDerniereValidationDuMois('2026-01-27');

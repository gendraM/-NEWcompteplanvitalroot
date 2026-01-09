/**
 * TESTS PHASE 4 - VALIDATION SEMAINE
 * Tests unitaires et fonctionnels pour vérifier conformité
 * Date: 9 janvier 2026
 */

// ═══════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════
const { 
  calculerExtrasSemaine, 
  genererMessageFeedback, 
  calculerVariation,
  getSemainesNonValidees,
  formatDate,
  getMonday,
  addDays,
  isDateInRange
} = require('../lib/validationSemaine');

// ═══════════════════════════════════════════════════════════
// DONNÉES DE TEST
// ═══════════════════════════════════════════════════════════

const repasMock = [
  // Semaine du 8 janvier (2 fast-food)
  { date: '2026-01-08', type: 'Déjeuner', categorie: 'fast-food', nom: 'Big Mac', moment: 'Déjeuner' },
  { date: '2026-01-10', type: 'Dîner', tag: 'fast-food', nom: 'Pizza', moment: 'Dîner' },
  { date: '2026-01-09', type: 'Déjeuner', categorie: 'normal', nom: 'Salade', moment: 'Déjeuner' },
  
  // Semaine du 1er janvier (0 fast-food)
  { date: '2026-01-02', type: 'Déjeuner', categorie: 'normal', nom: 'Poulet', moment: 'Déjeuner' },
  { date: '2026-01-03', type: 'Dîner', categorie: 'normal', nom: 'Poisson', moment: 'Dîner' },
];

const semainesValideesNormales = [
  { weekStart: '2026-01-06', validee: true, extras_count: 1 },
  { weekStart: '2025-12-30', validee: true, extras_count: 3 },
];

// ═══════════════════════════════════════════════════════════
// TESTS HELPERS DATE
// ═══════════════════════════════════════════════════════════

console.log('\n🧪 === TESTS HELPERS DATE ===\n');

// Test 1: formatDate - dates valides
console.log('Test 1.1: formatDate yyyy-MM-dd');
const test1_1 = formatDate(new Date('2026-01-09'), 'yyyy-MM-dd');
console.log(`  Résultat: "${test1_1}"`);
console.log(`  Attendu: "2026-01-09"`);
console.log(`  ✅ ${test1_1 === '2026-01-09' ? 'PASS' : '❌ FAIL'}`);

console.log('\nTest 1.2: formatDate d MMMM yyyy');
const test1_2 = formatDate(new Date('2026-01-09'), 'd MMMM yyyy');
console.log(`  Résultat: "${test1_2}"`);
console.log(`  Attendu: "9 janvier 2026"`);
console.log(`  ✅ ${test1_2 === '9 janvier 2026' ? 'PASS' : '❌ FAIL'}`);

// Test 2: formatDate - date invalide
console.log('\nTest 2: formatDate date invalide');
const test2 = formatDate('invalid-date', 'yyyy-MM-dd');
console.log(`  Résultat: "${test2}"`);
console.log(`  Attendu: "" (string vide)`);
console.log(`  ✅ ${test2 === '' ? 'PASS' : '❌ FAIL'}`);

// Test 3: getMonday
console.log('\nTest 3: getMonday (vendredi 9 janvier 2026)');
const test3 = getMonday(new Date('2026-01-09'));
const test3Str = test3.toISOString().slice(0, 10);
console.log(`  Résultat: "${test3Str}"`);
console.log(`  Attendu: "2026-01-05" (lundi de la semaine)`);
console.log(`  ✅ ${test3Str === '2026-01-05' ? 'PASS' : '❌ FAIL'}`);

// Test 4: addDays
console.log('\nTest 4: addDays (+3 jours)');
const test4 = addDays(new Date('2026-01-09'), 3);
const test4Str = test4.toISOString().slice(0, 10);
console.log(`  Résultat: "${test4Str}"`);
console.log(`  Attendu: "2026-01-12"`);
console.log(`  ✅ ${test4Str === '2026-01-12' ? 'PASS' : '❌ FAIL'}`);

// Test 5: isDateInRange
console.log('\nTest 5.1: isDateInRange (dans la plage)');
const test5_1 = isDateInRange('2026-01-09', '2026-01-06', '2026-01-12');
console.log(`  Résultat: ${test5_1}`);
console.log(`  Attendu: true`);
console.log(`  ✅ ${test5_1 === true ? 'PASS' : '❌ FAIL'}`);

console.log('\nTest 5.2: isDateInRange (hors plage)');
const test5_2 = isDateInRange('2026-01-15', '2026-01-06', '2026-01-12');
console.log(`  Résultat: ${test5_2}`);
console.log(`  Attendu: false`);
console.log(`  ✅ ${test5_2 === false ? 'PASS' : '❌ FAIL'}`);

// ═══════════════════════════════════════════════════════════
// TESTS CALCULS MÉTIER
// ═══════════════════════════════════════════════════════════

console.log('\n\n🧪 === TESTS CALCULS MÉTIER ===\n');

// Test 6: calculerExtrasSemaine - semaine avec 2 extras
console.log('Test 6: calculerExtrasSemaine (semaine 8 janvier)');
const test6 = calculerExtrasSemaine('2026-01-06', repasMock);
console.log(`  Résultat count: ${test6.count}`);
console.log(`  Résultat details:`, test6.details);
console.log(`  Attendu count: 2`);
console.log(`  ✅ ${test6.count === 2 ? 'PASS' : '❌ FAIL'}`);
console.log(`  Détails OK: ${test6.details.length === 2 ? 'PASS' : '❌ FAIL'}`);

// Test 7: calculerExtrasSemaine - semaine sans extra
console.log('\nTest 7: calculerExtrasSemaine (semaine 30 déc)');
const test7 = calculerExtrasSemaine('2025-12-30', repasMock);
console.log(`  Résultat count: ${test7.count}`);
console.log(`  Attendu: 0`);
console.log(`  ✅ ${test7.count === 0 ? 'PASS' : '❌ FAIL'}`);

// Test 8: calculerExtrasSemaine - repasReels null
console.log('\nTest 8: calculerExtrasSemaine (repasReels null)');
const test8 = calculerExtrasSemaine('2026-01-06', null);
console.log(`  Résultat count: ${test8.count}`);
console.log(`  Attendu: 0`);
console.log(`  ✅ ${test8.count === 0 ? 'PASS' : '❌ FAIL'}`);

// Test 9: genererMessageFeedback - 0 extra
console.log('\nTest 9: genererMessageFeedback (0 extra)');
const test9 = genererMessageFeedback(0, 2);
console.log(`  Résultat: "${test9}"`);
console.log(`  Contient "Incroyable": ${test9.includes('Incroyable') ? 'PASS' : '❌ FAIL'}`);

// Test 10: genererMessageFeedback - dans quota
console.log('\nTest 10: genererMessageFeedback (2 extras, quota 2)');
const test10 = genererMessageFeedback(2, 2);
console.log(`  Résultat: "${test10}"`);
console.log(`  Contient "Bravo" ou "quota": ${test10.includes('Bravo') || test10.includes('quota') ? 'PASS' : '❌ FAIL'}`);

// Test 11: genererMessageFeedback - dépassement
console.log('\nTest 11: genererMessageFeedback (5 extras, quota 2)');
const test11 = genererMessageFeedback(5, 2);
console.log(`  Résultat: "${test11}"`);
console.log(`  Contient "Dépassement": ${test11.includes('Dépassement') ? 'PASS' : '❌ FAIL'}`);

// Test 12: calculerVariation
console.log('\nTest 12: calculerVariation (+1)');
const test12 = calculerVariation(2, semainesValideesNormales, '2026-01-13');
console.log(`  Résultat: ${test12}`);
console.log(`  Attendu: 1 (2 - 1)`);
console.log(`  ✅ ${test12 === 1 ? 'PASS' : '❌ FAIL'}`);

// Test 13: getSemainesNonValidees
console.log('\nTest 13: getSemainesNonValidees (4 semaines)');
const test13 = getSemainesNonValidees(semainesValideesNormales, 4);
console.log(`  Résultat length: ${test13.length}`);
console.log(`  Attendu: >= 2 (4 semaines - 2 validées)`);
console.log(`  ✅ ${test13.length >= 2 ? 'PASS' : '❌ FAIL'}`);

// ═══════════════════════════════════════════════════════════
// RÉSUMÉ TESTS
// ═══════════════════════════════════════════════════════════

console.log('\n\n📊 === RÉSUMÉ DES TESTS ===\n');
console.log('Tests helpers date: 7/7 attendus');
console.log('Tests calculs métier: 8/8 attendus');
console.log('\n✅ Total: 15 tests unitaires créés');
console.log('\n⚠️  TESTS FONCTIONNELS À FAIRE MANUELLEMENT:');
console.log('   1. Démarrer npm run dev');
console.log('   2. Aller sur /suivi');
console.log('   3. Sélectionner dimanche');
console.log('   4. Cliquer "Valider la semaine"');
console.log('   5. Vérifier modal s\'ouvre avec données');
console.log('   6. Vérifier données en BDD (Supabase)');
console.log('   7. Fermer modal');
console.log('   8. Sélectionner lundi');
console.log('   9. Vérifier badge "Voir feedback" apparaît');
console.log('   10. Cliquer badge → vérifier modal s\'ouvre\n');

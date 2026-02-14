/**
 * TESTS - Fonction convertirExtraEnKcal
 * Phase 2 : Validation conversion types extras
 */

const { convertirExtraEnKcal, getLabelExtra, getOptionsExtras } = require('../lib/extras.js');

console.log('=== TESTS convertirExtraEnKcal ===\n');

// Test 1: Types valides
console.log('✅ Test 1: Types valides');
console.log('mini:', convertirExtraEnKcal('mini'), '(attendu: 90)');
console.log('normal:', convertirExtraEnKcal('normal'), '(attendu: 220)');
console.log('double:', convertirExtraEnKcal('double'), '(attendu: 350)');
console.log('triple:', convertirExtraEnKcal('triple'), '(attendu: 800)');
console.log('');

// Test 2: Variations casse
console.log('✅ Test 2: Variations de casse');
console.log('MINI:', convertirExtraEnKcal('MINI'), '(attendu: 90)');
console.log('Normal:', convertirExtraEnKcal('Normal'), '(attendu: 220)');
console.log('TRIPLE:', convertirExtraEnKcal('TRIPLE'), '(attendu: 800)');
console.log('');

// Test 3: Espaces
console.log('✅ Test 3: Espaces');
console.log('" mini ":', convertirExtraEnKcal(' mini '), '(attendu: 90)');
console.log('" normal  ":', convertirExtraEnKcal(' normal  '), '(attendu: 220)');
console.log('');

// Test 4: Valeurs invalides (fallback "normal" = 220)
console.log('⚠️ Test 4: Fallback sur valeurs invalides');
console.log('null:', convertirExtraEnKcal(null), '(attendu: 220 - fallback)');
console.log('undefined:', convertirExtraEnKcal(undefined), '(attendu: 220 - fallback)');
console.log('"":', convertirExtraEnKcal(''), '(attendu: 220 - fallback)');
console.log('"inconnu":', convertirExtraEnKcal('inconnu'), '(attendu: 220 - fallback)');
console.log('123:', convertirExtraEnKcal(123), '(attendu: 220 - fallback)');
console.log('');

// Test 5: Labels
console.log('✅ Test 5: Labels');
console.log('mini:', getLabelExtra('mini'));
console.log('normal:', getLabelExtra('normal'));
console.log('double:', getLabelExtra('double'));
console.log('triple:', getLabelExtra('triple'));
console.log('');

// Test 6: Options pour sélecteur
console.log('✅ Test 6: Options sélecteur');
const options = getOptionsExtras();
console.log('Nombre d\'options:', options.length, '(attendu: 4)');
options.forEach(opt => {
  console.log(`- ${opt.label}`);
});
console.log('');

console.log('=== TESTS TERMINÉS ===');

/**
 * TESTS DES 5 SCÉNARIOS DE VERROUILLAGE DES CRITÈRES
 * Date : 6 décembre 2025
 * 
 * Objectif : Valider le comportement des fonctions getFenetreValidation(), 
 * isPeriodeActive() et getStatut() selon les scénarios utilisateurs
 */

import { getFenetreValidation, isPeriodeActive } from '../lib/validerCriterePreparation.js';

// ========================================
// TEST 1 : getFenetreValidation()
// ========================================
console.log('========================================');
console.log('TEST 1 : getFenetreValidation()');
console.log('========================================');

const testFenetre = [
  { jalon: -30, attendu: -18, description: 'J-30 validable jusqu\'à J-18' },
  { jalon: -17, attendu: -8, description: 'J-17 validable jusqu\'à J-8' },
  { jalon: -14, attendu: -8, description: 'J-14 validable jusqu\'à J-8' },
  { jalon: -12, attendu: -8, description: 'J-12 validable jusqu\'à J-8' },
  { jalon: -7, attendu: 0, description: 'J-7 validable jusqu\'à J-0' },
];

testFenetre.forEach(test => {
  const resultat = getFenetreValidation(test.jalon);
  const status = resultat === test.attendu ? '✅' : '❌';
  console.log(`${status} ${test.description}`);
  console.log(`   Jalon: ${test.jalon}, Attendu: ${test.attendu}, Résultat: ${resultat}`);
});

// ========================================
// TEST 2 : SCÉNARIO 1 - Démarrage idéal J-30
// ========================================
console.log('\n========================================');
console.log('TEST 2 : SCÉNARIO 1 - Démarrage J-30');
console.log('========================================');
console.log('User démarre exactement à J-30');
console.log('Tous les critères doivent être ACTIFS/EN COURS');

const jourCourantS1 = -30;
const criteres = [
  { id: 1, jalon: -30 },
  { id: 2, jalon: -17 },
  { id: 3, jalon: -17 },
  { id: 4, jalon: -14 },
  { id: 5, jalon: -14 },
  { id: 6, jalon: -12 },
  { id: 7, jalon: -7 },
  { id: 8, jalon: -7 },
  { id: 9, jalon: -7 },
];

criteres.forEach(c => {
  const actif = isPeriodeActive(c.jalon, jourCourantS1);
  const statut = jourCourantS1 === c.jalon ? 'EN COURS' : (jourCourantS1 < c.jalon ? 'À VENIR' : (actif ? 'ACTIF' : 'VERROUILLÉ'));
  const status = (c.id === 1 && statut === 'EN COURS') || (c.id !== 1 && statut === 'À VENIR') ? '✅' : '❌';
  console.log(`${status} Critère ${c.id} (J-${Math.abs(c.jalon)}) : ${statut} | isPeriodeActive: ${actif}`);
});

// ========================================
// TEST 3 : SCÉNARIO 2 - Démarrage J-25 (léger retard)
// ========================================
console.log('\n========================================');
console.log('TEST 3 : SCÉNARIO 2 - Démarrage J-25');
console.log('========================================');
console.log('User démarre à J-25 (5 jours après J-30)');
console.log('Critère J-30 doit encore être ACTIF (fenêtre jusqu\'à J-18)');

const jourCourantS2 = -25;

criteres.forEach(c => {
  const actif = isPeriodeActive(c.jalon, jourCourantS2);
  const statut = jourCourantS2 === c.jalon ? 'EN COURS' : (jourCourantS2 < c.jalon ? 'À VENIR' : (actif ? 'ACTIF' : 'VERROUILLÉ'));
  const attendu = c.id === 1 ? 'ACTIF' : 'À VENIR';
  const status = statut === attendu ? '✅' : '❌';
  console.log(`${status} Critère ${c.id} (J-${Math.abs(c.jalon)}) : ${statut} (attendu: ${attendu}) | isPeriodeActive: ${actif}`);
});

// ========================================
// TEST 4 : SCÉNARIO 3 - Démarrage J-20 (tardif)
// ========================================
console.log('\n========================================');
console.log('TEST 4 : SCÉNARIO 3 - Démarrage J-20');
console.log('========================================');
console.log('User démarre à J-20 (10 jours après J-30)');
console.log('Critère J-30 doit être ACTIF (fenêtre jusqu\'à J-18)');

const jourCourantS3 = -20;

criteres.forEach(c => {
  const actif = isPeriodeActive(c.jalon, jourCourantS3);
  const statut = jourCourantS3 === c.jalon ? 'EN COURS' : (jourCourantS3 < c.jalon ? 'À VENIR' : (actif ? 'ACTIF' : 'VERROUILLÉ'));
  const attendu = c.id === 1 ? 'ACTIF' : 'À VENIR';
  const status = statut === attendu ? '✅' : '❌';
  console.log(`${status} Critère ${c.id} (J-${Math.abs(c.jalon)}) : ${statut} (attendu: ${attendu}) | isPeriodeActive: ${actif}`);
});

// ========================================
// TEST 5 : SCÉNARIO 3bis - Démarrage J-17 (limite)
// ========================================
console.log('\n========================================');
console.log('TEST 5 : SCÉNARIO 3bis - Démarrage J-17');
console.log('========================================');
console.log('User démarre à J-17 (13 jours après J-30)');
console.log('Critère J-30 doit être VERROUILLÉ (fenêtre fermée à J-18)');

const jourCourantS3bis = -17;

criteres.forEach(c => {
  const actif = isPeriodeActive(c.jalon, jourCourantS3bis);
  let statut;
  if (jourCourantS3bis === c.jalon) {
    statut = 'EN COURS';
  } else if (jourCourantS3bis < c.jalon) {
    statut = 'À VENIR';
  } else {
    statut = actif ? 'ACTIF' : 'VERROUILLÉ';
  }
  
  let attendu;
  if (c.id === 1) attendu = 'VERROUILLÉ'; // J-30 verrouillé
  else if ([2, 3].includes(c.id)) attendu = 'EN COURS'; // J-17 en cours
  else attendu = 'À VENIR';
  
  const status = statut === attendu ? '✅' : '❌';
  console.log(`${status} Critère ${c.id} (J-${Math.abs(c.jalon)}) : ${statut} (attendu: ${attendu}) | isPeriodeActive: ${actif}`);
});

// ========================================
// TEST 6 : SCÉNARIO 4 - Démarrage J-9 (très tardif)
// ========================================
console.log('\n========================================');
console.log('TEST 6 : SCÉNARIO 4 - Démarrage J-9');
console.log('========================================');
console.log('User démarre à J-9');
console.log('Critères J-30, J-17, J-14, J-12 VERROUILLÉS');
console.log('Seuls J-7 accessibles');

const jourCourantS4 = -9;

criteres.forEach(c => {
  const actif = isPeriodeActive(c.jalon, jourCourantS4);
  let statut;
  if (jourCourantS4 === c.jalon) {
    statut = 'EN COURS';
  } else if (jourCourantS4 < c.jalon) {
    statut = 'À VENIR';
  } else {
    statut = actif ? 'ACTIF' : 'VERROUILLÉ';
  }
  
  let attendu;
  if ([1, 2, 3, 4, 5, 6].includes(c.id)) attendu = 'VERROUILLÉ';
  else attendu = 'À VENIR'; // J-7 pas encore atteint
  
  const status = statut === attendu ? '✅' : '❌';
  console.log(`${status} Critère ${c.id} (J-${Math.abs(c.jalon)}) : ${statut} (attendu: ${attendu}) | isPeriodeActive: ${actif}`);
});

// ========================================
// TEST 7 : SCÉNARIO 5 - Démarrage J-2 (extrême)
// ========================================
console.log('\n========================================');
console.log('TEST 7 : SCÉNARIO 5 - Démarrage J-2');
console.log('========================================');
console.log('User démarre à J-2');
console.log('Tous les critères VERROUILLÉS');

const jourCourantS5 = -2;

criteres.forEach(c => {
  const actif = isPeriodeActive(c.jalon, jourCourantS5);
  let statut;
  if (jourCourantS5 === c.jalon) {
    statut = 'EN COURS';
  } else if (jourCourantS5 < c.jalon) {
    statut = 'À VENIR';
  } else {
    statut = actif ? 'ACTIF' : 'VERROUILLÉ';
  }
  
  const attendu = 'VERROUILLÉ';
  const status = statut === attendu ? '✅' : '❌';
  console.log(`${status} Critère ${c.id} (J-${Math.abs(c.jalon)}) : ${statut} (attendu: ${attendu}) | isPeriodeActive: ${actif}`);
});

// ========================================
// RÉSUMÉ
// ========================================
console.log('\n========================================');
console.log('RÉSUMÉ DES TESTS');
console.log('========================================');
console.log('Si tous les tests affichent ✅, l\'implémentation est conforme aux scénarios.');
console.log('Si des ❌ apparaissent, la logique doit être corrigée.');

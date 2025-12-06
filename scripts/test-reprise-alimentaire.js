/**
 * ═══════════════════════════════════════════════════════════════════════
 * SCRIPT DE TEST - REPRISE ALIMENTAIRE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Ce script crée des données de test pour valider le système de reprise
 * alimentaire dans Supabase.
 * 
 * USAGE:
 * 1. Configurer SUPABASE_URL et SUPABASE_ANON_KEY ci-dessous
 * 2. Exécuter: node scripts/test-reprise-alimentaire.js
 * 3. Aller sur /suivi dans l'app pour voir le bandeau reprise
 * 4. Tester la saisie d'aliments avec validation
 * 
 * LE SCRIPT VA:
 * - Créer un programme de reprise actif (commencé il y a 3 jours)
 * - Générer 10 jours de programme (Phase 1-2)
 * - Simuler que tu es au J+3 (Phase 2, jour 3)
 * - Créer 2 repas valides pour J+1 et J+2
 * 
 * NETTOYAGE:
 * Pour supprimer les données test:
 * DELETE FROM reprises_jours_valides WHERE reprise_id IN 
 *   (SELECT id FROM reprises_alimentaires WHERE created_by = 'TEST_USER');
 * DELETE FROM repas_reels WHERE contexte_reprise = true;
 * DELETE FROM reprises_alimentaires WHERE created_by = 'TEST_USER';
 * ═══════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ CONFIGURATION - Remplacer par tes vraies clés
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User ID test (remplacer par ton vrai user_id si tu veux tester avec ton compte)
const TEST_USER_ID = 'TEST_USER';

async function creerProgrammeRepriseTest() {
  console.log('🧪 [TEST] Création programme reprise alimentaire...\n');

  // 1️⃣ Supprimer anciennes données test
  console.log('🗑️  Nettoyage anciennes données test...');
  await supabase.from('reprises_jours_valides').delete().eq('reprise_id', TEST_USER_ID);
  await supabase.from('repas_reels').delete().eq('programme_reprise_id', TEST_USER_ID);
  await supabase.from('reprises_alimentaires').delete().eq('id', TEST_USER_ID);
  console.log('✅ Nettoyage terminé\n');

  // 2️⃣ Créer programme commencé il y a 3 jours
  const dateDebutReprise = new Date();
  dateDebutReprise.setDate(dateDebutReprise.getDate() - 3); // Commencé il y a 3 jours
  dateDebutReprise.setHours(0, 0, 0, 0);

  const dateFinJeune = new Date(dateDebutReprise);
  dateFinJeune.setDate(dateFinJeune.getDate() - 1); // Jeûne terminé la veille

  console.log('📅 Date fin jeûne:', dateFinJeune.toISOString().split('T')[0]);
  console.log('📅 Date début reprise:', dateDebutReprise.toISOString().split('T')[0]);
  console.log('📅 Aujourd\'hui = J+3 (Phase 2)\n');

  const programmeReprise = {
    id: TEST_USER_ID,
    created_by: TEST_USER_ID,
    date_fin_jeune: dateFinJeune.toISOString(),
    duree_jeune_jours: 7,
    type_jeune: 'hydrique',
    duree_reprise_jours: 10,
    statut: 'en_cours',
    reprise_commencee_le: dateDebutReprise.toISOString(),
    created_at: new Date().toISOString()
  };

  const { data: repriseData, error: repriseError } = await supabase
    .from('reprises_alimentaires')
    .insert([programmeReprise])
    .select()
    .single();

  if (repriseError) {
    console.error('❌ Erreur création reprise:', repriseError);
    return;
  }

  console.log('✅ Programme reprise créé:', repriseData.id);

  // 3️⃣ Générer les 10 jours (Phase 1: J1-2, Phase 2: J3-5, Phase 3: J6-8, Phase 4: J9-10)
  const jours = [];
  for (let i = 1; i <= 10; i++) {
    const dateJour = new Date(dateDebutReprise);
    dateJour.setDate(dateJour.getDate() + (i - 1));
    
    let phase = 1;
    if (i >= 3 && i <= 5) phase = 2;
    else if (i >= 6 && i <= 8) phase = 3;
    else if (i >= 9) phase = 4;

    jours.push({
      reprise_id: TEST_USER_ID,
      jour_numero: i,
      date: dateJour.toISOString().split('T')[0],
      phase: phase,
      valide: i <= 2, // J+1 et J+2 déjà validés
      valide_le: i <= 2 ? new Date().toISOString() : null,
      nb_repas_enregistres: i <= 2 ? 3 : 0
    });
  }

  const { error: joursError } = await supabase
    .from('reprises_jours_valides')
    .insert(jours);

  if (joursError) {
    console.error('❌ Erreur création jours:', joursError);
    return;
  }

  console.log(`✅ ${jours.length} jours générés (Phase 1-4)\n`);

  // 4️⃣ Créer repas valides pour J+1 et J+2 (pour historique)
  const repas = [];
  
  // J+1 Phase 1 - 3 repas (eau, bouillon, tisane)
  const dateJ1 = new Date(dateDebutReprise);
  repas.push(
    {
      type: 'Petit-déjeuner',
      date: dateJ1.toISOString().split('T')[0],
      heure: '08:00',
      aliment: 'Eau',
      categorie: 'liquide',
      quantite: '250',
      kcal: 0,
      est_extra: false,
      contexte_reprise: true,
      jour_reprise: 1,
      phase_reprise: 1,
      programme_reprise_id: TEST_USER_ID
    },
    {
      type: 'Déjeuner',
      date: dateJ1.toISOString().split('T')[0],
      heure: '12:30',
      aliment: 'Bouillon de légumes',
      categorie: 'liquide',
      quantite: '250',
      kcal: 20,
      est_extra: false,
      contexte_reprise: true,
      jour_reprise: 1,
      phase_reprise: 1,
      programme_reprise_id: TEST_USER_ID
    },
    {
      type: 'Dîner',
      date: dateJ1.toISOString().split('T')[0],
      heure: '19:00',
      aliment: 'Tisane verveine',
      categorie: 'liquide',
      quantite: '200',
      kcal: 0,
      est_extra: false,
      contexte_reprise: true,
      jour_reprise: 1,
      phase_reprise: 1,
      programme_reprise_id: TEST_USER_ID
    }
  );

  // J+2 Phase 1 - 3 repas
  const dateJ2 = new Date(dateDebutReprise);
  dateJ2.setDate(dateJ2.getDate() + 1);
  repas.push(
    {
      type: 'Petit-déjeuner',
      date: dateJ2.toISOString().split('T')[0],
      heure: '08:15',
      aliment: 'Jus de fruits frais',
      categorie: 'liquide',
      quantite: '200',
      kcal: 80,
      est_extra: false,
      contexte_reprise: true,
      jour_reprise: 2,
      phase_reprise: 1,
      programme_reprise_id: TEST_USER_ID
    },
    {
      type: 'Déjeuner',
      date: dateJ2.toISOString().split('T')[0],
      heure: '12:45',
      aliment: 'Bouillon miso',
      categorie: 'liquide',
      quantite: '250',
      kcal: 35,
      est_extra: false,
      contexte_reprise: true,
      jour_reprise: 2,
      phase_reprise: 1,
      programme_reprise_id: TEST_USER_ID
    },
    {
      type: 'Dîner',
      date: dateJ2.toISOString().split('T')[0],
      heure: '19:30',
      aliment: 'Eau citronnée',
      categorie: 'liquide',
      quantite: '250',
      kcal: 5,
      est_extra: false,
      contexte_reprise: true,
      jour_reprise: 2,
      phase_reprise: 1,
      programme_reprise_id: TEST_USER_ID
    }
  );

  const { error: repasError } = await supabase
    .from('repas_reels')
    .insert(repas);

  if (repasError) {
    console.error('❌ Erreur création repas:', repasError);
    return;
  }

  console.log(`✅ ${repas.length} repas historiques créés (J+1 et J+2)\n`);

  // 5️⃣ Récapitulatif
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 PROGRAMME TEST CRÉÉ AVEC SUCCÈS !');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 Configuration:');
  console.log(`   - Programme ID: ${TEST_USER_ID}`);
  console.log(`   - Statut: en_cours`);
  console.log(`   - Jour actuel: J+3 (Phase 2)`);
  console.log(`   - Durée totale: 10 jours`);
  console.log(`   - Jours validés: J+1, J+2`);
  console.log(`   - Repas historiques: ${repas.length}`);
  console.log('');
  console.log('🧪 TESTS À EFFECTUER:');
  console.log('   1. Aller sur /suivi → Bandeau violet "Phase 2 - Jour 3" doit s\'afficher');
  console.log('   2. Essayer d\'ajouter "Concombre" (Phase 2) → ✅ Devrait être accepté');
  console.log('   3. Essayer d\'ajouter "Riz complet" (Phase 4) → ❌ Devrait être refusé');
  console.log('   4. Essayer "Quinoa" après 19h → ❌ Devrait être refusé (féculent soir)');
  console.log('   5. Essayer quantité excessive → ❌ Devrait être refusé');
  console.log('   6. Aller sur /reprise-alimentaire-apres-jeune → Voir progression');
  console.log('   7. Essayer de valider J+3 avec <2 repas → ❌ Devrait bloquer');
  console.log('   8. Ajouter 2 repas conformes → ✅ Puis valider J+3');
  console.log('');
  console.log('🗑️  NETTOYAGE (exécuter dans Supabase SQL Editor):');
  console.log('   DELETE FROM reprises_jours_valides WHERE reprise_id = \'TEST_USER\';');
  console.log('   DELETE FROM repas_reels WHERE programme_reprise_id = \'TEST_USER\';');
  console.log('   DELETE FROM reprises_alimentaires WHERE id = \'TEST_USER\';');
  console.log('═══════════════════════════════════════════════════════════');
}

// Exécution
creerProgrammeRepriseTest()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Erreur:', err);
    process.exit(1);
  });

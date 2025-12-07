#!/usr/bin/env node
/**
 * Script de test Supabase - Vérifie que les tables existent
 * Usage: node scripts/test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables SUPABASE manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'journal_spirituel_meditations',
  'journal_spirituel_versets',
  'journal_spirituel_questions',
  'journal_spirituel_intentions',
  'journal_spirituel_audios',
  'journal_spirituel_ecrits'
];

async function testTables() {
  console.log('🔍 Vérification des tables Supabase...\n');
  
  let allOk = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        allOk = false;
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      allOk = false;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (allOk) {
    console.log('✅ TOUTES LES TABLES EXISTENT');
    console.log('➡️  Tu peux activer Supabase dans les composants');
  } else {
    console.log('❌ TABLES MANQUANTES');
    console.log('➡️  Exécute SQL_JOURNAL_SPIRITUEL_NO_AUTH.sql dans Supabase Dashboard');
    console.log('   1. Ouvre https://supabase.com/dashboard/project/rvpysxqnomslngxjinge/editor');
    console.log('   2. Copie le contenu de /docs/SQL_JOURNAL_SPIRITUEL_NO_AUTH.sql');
    console.log('   3. Exécute le SQL (bouton Run)');
    console.log('   4. Relance ce script: node scripts/test-supabase.js');
  }
}

testTables().catch(console.error);

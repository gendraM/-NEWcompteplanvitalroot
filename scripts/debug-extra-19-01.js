/**
 * SCRIPT DEBUG - Enquête extra 19/01 non comptabilisé
 * But : Vérifier pourquoi l'extra du 19/01 n'apparaît pas dans BudgetExtrasCard
 */

import { createClient } from '@supabase/supabase-js';

// Hardcodé pour debug rapide
const supabaseUrl = 'https://rvpysxqnomslngxjinge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cHlzeHFub21zbG5neGppbmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzUzMTQsImV4cCI6MjA2MzYxMTMxNH0.msrK6D82Mq6q29Key_A0k6cGg1jqT98O7EnP52Q1wrk';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables SUPABASE manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investiguer() {
  console.log('\n🔍 === ENQUÊTE EXTRA 19/01/2026 ===\n');

  // 1. Chercher tous les repas du 19/01
  console.log('1️⃣ Tous les repas du 19/01/2026 :');
  const { data: tousRepas, error: err1 } = await supabase
    .from('repas_reels')
    .select('*')
    .eq('date', '2026-01-19')
    .order('created_at', { ascending: true });

  if (err1) {
    console.error('Erreur:', err1);
  } else {
    console.log(`   → ${tousRepas.length} repas trouvés`);
    tousRepas.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.type || 'N/A'} - ${r.aliment} - ${r.kcal} kcal - est_extra=${r.est_extra} - créé le ${r.created_at}`);
    });
  }

  // 2. Chercher spécifiquement les extras du 19/01
  console.log('\n2️⃣ Extras du 19/01/2026 (est_extra=true) :');
  const { data: extras, error: err2 } = await supabase
    .from('repas_reels')
    .select('*')
    .eq('date', '2026-01-19')
    .eq('est_extra', true);

  if (err2) {
    console.error('Erreur:', err2);
  } else {
    console.log(`   → ${extras.length} extras trouvés`);
    extras.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.aliment} - ${r.kcal} kcal - créé le ${r.created_at}`);
    });
  }

  // 3. Vérifier la semaine du 19/01 (du lundi 13 au dimanche 19)
  console.log('\n3️⃣ Semaine du 19/01/2026 (13/01 → 19/01) :');
  const { data: semaineExtras, error: err3 } = await supabase
    .from('repas_reels')
    .select('date, aliment, kcal, est_extra, created_at')
    .eq('est_extra', true)
    .gte('date', '2026-01-13')
    .lte('date', '2026-01-19')
    .order('date', { ascending: true });

  if (err3) {
    console.error('Erreur:', err3);
  } else {
    console.log(`   → ${semaineExtras.length} extras dans la semaine`);
    
    // Grouper par date
    const parDate = {};
    semaineExtras.forEach(r => {
      if (!parDate[r.date]) parDate[r.date] = [];
      parDate[r.date].push(r);
    });
    
    Object.keys(parDate).sort().forEach(date => {
      const repas = parDate[date];
      const totalKcal = repas.reduce((sum, r) => sum + (r.kcal || 0), 0);
      console.log(`   📅 ${date} : ${repas.length} extras, ${totalKcal} kcal`);
      repas.forEach(r => {
        console.log(`      - ${r.aliment} (${r.kcal} kcal)`);
      });
    });
  }

  // 4. Vérifier extras_budget table
  console.log('\n4️⃣ Entrée extras_budget pour semaine du 13/01 :');
  const { data: budgetSemaine, error: err4 } = await supabase
    .from('extras_budget')
    .select('*')
    .eq('date_semaine', '2026-01-13')
    .maybeSingle();

  if (err4) {
    console.error('Erreur:', err4);
  } else if (!budgetSemaine) {
    console.log('   ⚠️ Aucune entrée trouvée');
  } else {
    console.log(`   → Budget hebdo: ${budgetSemaine.budget_hebdo} kcal`);
    console.log(`   → Budget consommé: ${budgetSemaine.budget_consomme} kcal`);
    console.log(`   → Budget réservé: ${budgetSemaine.budget_reserve} kcal`);
    console.log(`   → Budget libre: ${budgetSemaine.budget_libre} kcal`);
    console.log(`   → Créé le: ${budgetSemaine.created_at}`);
    console.log(`   → Màj le: ${budgetSemaine.updated_at}`);
  }

  // 5. Calculer manuellement le total des extras de la semaine
  console.log('\n5️⃣ Calcul manuel total extras semaine :');
  if (semaineExtras) {
    const totalManuel = semaineExtras.reduce((sum, r) => sum + (r.kcal || 0), 0);
    console.log(`   → Total calculé: ${totalManuel} kcal`);
    if (budgetSemaine) {
      const diff = totalManuel - budgetSemaine.budget_consomme;
      if (diff !== 0) {
        console.log(`   ❌ ÉCART DÉTECTÉ: ${diff} kcal de différence`);
        console.log(`   → La BDD devrait contenir ${budgetSemaine.budget_consomme} kcal`);
        console.log(`   → Mais le total réel est ${totalManuel} kcal`);
      } else {
        console.log(`   ✅ Cohérent avec extras_budget`);
      }
    }
  }

  console.log('\n✅ Enquête terminée\n');
}

investiguer().catch(console.error);

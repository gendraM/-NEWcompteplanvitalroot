// Script de vérification des entrées de la table semaines_validees
// Affiche toutes les entrées, met en évidence la semaine du 5 au 11/01/2026

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function auditSemainesValidees() {
  const { data, error } = await supabase
    .from('semaines_validees')
    .select('*')
    .order('weekStart', { ascending: true });

  if (error) {
    console.error('Erreur Supabase:', error);
    return;
  }

  console.log('--- Audit de la table semaines_validees ---');
  data.forEach((row) => {
    const weekStart = row.weekStart;
    // Semaine du 5 au 11 janvier 2026 : lundi = 2026-01-05, dimanche = 2026-01-11
    if (weekStart === '2026-01-05' || weekStart === '2026-01-04') {
      console.log('>>> SEMAINE CIBLE <<<');
    }
    console.log({
      weekStart: row.weekStart,
      validee: row.validee,
      extras_count: row.extras_count,
      date_validation: row.date_validation,
      message_feedback: row.message_feedback,
      points_forts: row.points_forts,
      axes_amelioration: row.axes_amelioration,
      tendance_mensuelle: row.tendance_mensuelle,
      feedback_detaille: row.feedback_detaille,
    });
  });
}

auditSemainesValidees();

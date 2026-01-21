-- ================================================================
-- MIGRATION SUPABASE : Enrichissement table semaines_validees
-- ================================================================
-- Date : 9 janvier 2026
-- Objectif : Ajouter colonnes pour feedback validation semaine
-- Référence : PLAN_IMPLEMENTATION_VALIDATION_SEMAINE.md
-- ================================================================

-- Backup recommandé avant exécution :
-- pg_dump -U postgres -h localhost -d postgres -t semaines_validees > backup_semaines_validees_2026-01-09.sql

BEGIN;

-- ================================================================
-- 1. AJOUT COLONNES FEEDBACK
-- ================================================================

-- Date de validation (quand l'utilisateur a validé)
ALTER TABLE semaines_validees 
  ADD COLUMN IF NOT EXISTS date_validation TIMESTAMPTZ;

-- Nombre d'extras comptés dans la semaine
ALTER TABLE semaines_validees 
  ADD COLUMN IF NOT EXISTS extras_count INTEGER DEFAULT 0;

-- Détails des extras (JSON array)
-- Format: [{ type: "fast-food", nom: "McDo", date: "2026-01-07" }, ...]
ALTER TABLE semaines_validees 
  ADD COLUMN IF NOT EXISTS extras_details JSONB DEFAULT '[]'::jsonb;

-- Message feedback personnalisé généré
ALTER TABLE semaines_validees 
  ADD COLUMN IF NOT EXISTS message_feedback TEXT;

-- Variation vs semaine précédente (+1, -2, etc.)
ALTER TABLE semaines_validees 
  ADD COLUMN IF NOT EXISTS variation INTEGER DEFAULT 0;

-- ================================================================
-- 2. COMMENTAIRES COLONNES (documentation)
-- ================================================================

COMMENT ON COLUMN semaines_validees.date_validation IS 
  'Timestamp de la validation par l''utilisateur';

COMMENT ON COLUMN semaines_validees.extras_count IS 
  'Nombre total d''extras (fast-food + restaurants) dans la semaine';

COMMENT ON COLUMN semaines_validees.extras_details IS 
  'Tableau JSON des extras détaillés: [{ type, nom, date, kcal }]';

COMMENT ON COLUMN semaines_validees.message_feedback IS 
  'Message personnalisé affiché à l''utilisateur après validation';

COMMENT ON COLUMN semaines_validees.variation IS 
  'Évolution nombre extras vs semaine précédente (positif = augmentation)';

-- ================================================================
-- 3. INDEX PERFORMANCE (optionnel)
-- ================================================================

-- Index sur date_validation pour requêtes historiques
CREATE INDEX IF NOT EXISTS idx_semaines_validees_date_validation 
  ON semaines_validees(date_validation);

-- Index sur extras_count pour statistiques
CREATE INDEX IF NOT EXISTS idx_semaines_validees_extras_count 
  ON semaines_validees(extras_count);

-- ================================================================
-- 4. VÉRIFICATION STRUCTURE
-- ================================================================

-- Afficher structure table après migration
-- \d semaines_validees

COMMIT;

-- ================================================================
-- ROLLBACK EN CAS D'ERREUR
-- ================================================================
-- Si erreur pendant migration, exécuter :
-- 
-- BEGIN;
-- ALTER TABLE semaines_validees DROP COLUMN IF EXISTS date_validation;
-- ALTER TABLE semaines_validees DROP COLUMN IF EXISTS extras_count;
-- ALTER TABLE semaines_validees DROP COLUMN IF EXISTS extras_details;
-- ALTER TABLE semaines_validees DROP COLUMN IF EXISTS message_feedback;
-- ALTER TABLE semaines_validees DROP COLUMN IF EXISTS variation;
-- DROP INDEX IF EXISTS idx_semaines_validees_date_validation;
-- DROP INDEX IF EXISTS idx_semaines_validees_extras_count;
-- COMMIT;
-- ================================================================

-- ================================================================
-- TEST POST-MIGRATION
-- ================================================================
-- Vérifier colonnes créées :
-- SELECT column_name, data_type, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'semaines_validees' 
-- ORDER BY ordinal_position;

-- Tester insertion :
-- INSERT INTO semaines_validees (
--   weekStart, 
--   validee, 
--   date_validation, 
--   extras_count, 
--   extras_details, 
--   message_feedback, 
--   variation
-- ) VALUES (
--   '2026-01-06',
--   true,
--   NOW(),
--   2,
--   '[{"type":"fast-food","nom":"McDo","date":"2026-01-07"}]'::jsonb,
--   'Excellente semaine ! Tu as respecté ton quota.',
--   -1
-- );
-- ================================================================

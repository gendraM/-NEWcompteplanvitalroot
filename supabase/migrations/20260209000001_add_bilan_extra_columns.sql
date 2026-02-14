-- Migration : Ajout colonnes bilan hebdo - kcal extras, budget, ressenti
-- Date : 2026-02-09
-- Auteur : Phase 3 Bilan ABC - Corrections données manquantes

-- Ajouter colonnes pour données extras
ALTER TABLE semaines_validees
ADD COLUMN IF NOT EXISTS kcal_extras NUMERIC,
ADD COLUMN IF NOT EXISTS budget_extras NUMERIC;

-- Ajouter colonnes pour données ressenti (Section 7)
ALTER TABLE semaines_validees
ADD COLUMN IF NOT EXISTS satiete_moyenne NUMERIC,
ADD COLUMN IF NOT EXISTS humeur_dominante TEXT,
ADD COLUMN IF NOT EXISTS note_utilisateur TEXT,
ADD COLUMN IF NOT EXISTS nb_repas_satiete INTEGER,
ADD COLUMN IF NOT EXISTS nb_repas_ressenti INTEGER;

-- Ajouter commentaires sur colonnes
COMMENT ON COLUMN semaines_validees.kcal_extras IS 'Total kcal des extras de la semaine';
COMMENT ON COLUMN semaines_validees.budget_extras IS 'Budget extras hebdomadaire calculé depuis le profil';
COMMENT ON COLUMN semaines_validees.satiete_moyenne IS 'Moyenne satiété sur 5 (calculée sur repas avec données)';
COMMENT ON COLUMN semaines_validees.humeur_dominante IS 'Ressenti dominant de la semaine (mode statistique)';
COMMENT ON COLUMN semaines_validees.note_utilisateur IS 'Commentaire/note libre utilisateur';
COMMENT ON COLUMN semaines_validees.nb_repas_satiete IS 'Nombre de repas avec satiété renseignée';
COMMENT ON COLUMN semaines_validees.nb_repas_ressenti IS 'Nombre de repas avec ressenti renseigné';

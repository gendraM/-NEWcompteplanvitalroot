-- Migration : Ajout colonnes ressenti Section 7
-- Date : 2026-02-09
-- Ajout des données de ressenti utilisateur dans les bilans hebdo

ALTER TABLE semaines_validees
ADD COLUMN IF NOT EXISTS satiete_moyenne NUMERIC,
ADD COLUMN IF NOT EXISTS humeur_dominante TEXT,
ADD COLUMN IF NOT EXISTS note_utilisateur TEXT,
ADD COLUMN IF NOT EXISTS nb_repas_satiete INTEGER,
ADD COLUMN IF NOT EXISTS nb_repas_ressenti INTEGER;

-- Commentaires
COMMENT ON COLUMN semaines_validees.satiete_moyenne IS 'Moyenne satiété sur 5 (calculée sur repas avec données)';
COMMENT ON COLUMN semaines_validees.humeur_dominante IS 'Ressenti dominant de la semaine (mode statistique)';
COMMENT ON COLUMN semaines_validees.note_utilisateur IS 'Commentaire/note libre utilisateur';
COMMENT ON COLUMN semaines_validees.nb_repas_satiete IS 'Nombre de repas avec satiété renseignée';
COMMENT ON COLUMN semaines_validees.nb_repas_ressenti IS 'Nombre de repas avec ressenti renseigné';

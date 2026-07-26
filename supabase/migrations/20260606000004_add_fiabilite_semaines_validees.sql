-- Ajout fiabilite observe/estime dans les bilans hebdomadaires
ALTER TABLE IF EXISTS semaines_validees
  ADD COLUMN IF NOT EXISTS jours_observes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS jours_estimes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fiabilite_pourcent integer NOT NULL DEFAULT 100;

DO $$
BEGIN
  IF to_regclass('public.semaines_validees') IS NOT NULL THEN
    BEGIN
      ALTER TABLE semaines_validees
        ADD CONSTRAINT chk_semaines_validees_jours_non_negatifs
        CHECK (jours_observes >= 0 AND jours_estimes >= 0);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;

    BEGIN
      ALTER TABLE semaines_validees
        ADD CONSTRAINT chk_semaines_validees_fiabilite
        CHECK (fiabilite_pourcent >= 0 AND fiabilite_pourcent <= 100);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_semaines_validees_fiabilite
  ON semaines_validees(fiabilite_pourcent);

COMMENT ON COLUMN semaines_validees.jours_observes IS 'Nombre de jours avec donnees observees (repas reels) sur la semaine.';
COMMENT ON COLUMN semaines_validees.jours_estimes IS 'Nombre de jours couverts uniquement par des periodes estimees.';
COMMENT ON COLUMN semaines_validees.fiabilite_pourcent IS 'Fiabilite des donnees hebdo = observes / (observes + estimes) * 100.';
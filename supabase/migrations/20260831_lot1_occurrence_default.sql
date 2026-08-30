-- Lot 1 (complément) : toute nouvelle ligne de repas réel doit disposer
-- d'un identifiant d'occurrence, même si le client n'en fournit pas.
-- Les repas composés fournissent explicitement un même UUID à toutes
-- leurs lignes ; ce DEFAULT couvre les saisies simples et les anciens
-- chemins d'insertion sans modifier leur logique métier.

ALTER TABLE public.repas_reels
  ALTER COLUMN occurrence_repas_id SET DEFAULT gen_random_uuid();

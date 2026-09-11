-- Unifie la référence hebdomadaire des budgets extras sur le lundi ISO.
-- Les dates des repas dans repas_reels ne sont pas modifiées.

BEGIN;

-- Conserver la valeur historique avant toute normalisation.
ALTER TABLE public.extras_budget
  ADD COLUMN IF NOT EXISTS date_semaine_origine DATE;

COMMENT ON COLUMN public.extras_budget.date_semaine_origine IS
  'Ancienne valeur de date_semaine conservée lors de la normalisation vers le lundi ISO.';

UPDATE public.extras_budget
SET date_semaine_origine = date_semaine
WHERE EXTRACT(ISODOW FROM date_semaine) = 7
  AND date_semaine_origine IS NULL;

-- Un dimanche hérité du décalage UTC représente ici le lundi suivant.
-- Ne pas écraser une référence du lundi qui existe déjà pour le même compte.
UPDATE public.extras_budget AS dimanche
SET date_semaine = dimanche.date_semaine + 1
WHERE EXTRACT(ISODOW FROM dimanche.date_semaine) = 7
  AND NOT EXISTS (
    SELECT 1
    FROM public.extras_budget AS lundi
    WHERE lundi.user_id = dimanche.user_id
      AND lundi.date_semaine = dimanche.date_semaine + 1
      AND lundi.id <> dimanche.id
  );

-- Empêche deux budgets actifs portant exactement la même clé utilisateur/semaine.
CREATE UNIQUE INDEX IF NOT EXISTS idx_extras_budget_user_semaine_unique
  ON public.extras_budget(user_id, date_semaine);

-- NOT VALID conserve les éventuels dimanches historiques en collision (ex. 06/09
-- lorsqu'un 07/09 existe déjà), tout en refusant désormais toute nouvelle clé
-- hebdomadaire qui ne serait pas un lundi.
ALTER TABLE public.extras_budget
  ADD CONSTRAINT extras_budget_date_semaine_lundi
  CHECK (EXTRACT(ISODOW FROM date_semaine) = 1) NOT VALID;

COMMENT ON COLUMN public.extras_budget.date_semaine IS
  'Clé technique de semaine : lundi ISO. Les repas restent saisissables tous les jours.';

COMMIT;

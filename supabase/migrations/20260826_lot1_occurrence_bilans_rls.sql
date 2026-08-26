-- Lot 1 — Plan alimentaire intelligent
-- Migration de structure et sécurité appliquée le 26/08/2026.
-- IMPORTANT : le rattachement des anciennes lignes user_id NULL au compte test actif
-- a été réalisé et contrôlé directement sur la base AVANT activation des RLS.
-- Ce backfill de données n'est volontairement pas rejoué ici : aucun identifiant
-- utilisateur spécifique à un environnement ne doit être codé en dur dans une migration.

BEGIN;

-- 1. Identifiant d'occurrence de repas.
-- Nullable afin de ne pas fabriquer artificiellement des occurrences pour l'historique.
ALTER TABLE public.repas_reels
  ADD COLUMN IF NOT EXISTS occurrence_repas_id UUID;

-- 2. Une validation hebdomadaire par utilisateur et par semaine.
ALTER TABLE public.semaines_validees
  DROP CONSTRAINT IF EXISTS semaines_validees_weekStart_key;

ALTER TABLE public.semaines_validees
  DROP CONSTRAINT IF EXISTS semaines_validees_user_weekstart_key;

ALTER TABLE public.semaines_validees
  ADD CONSTRAINT semaines_validees_user_weekstart_key
  UNIQUE NULLS NOT DISTINCT (user_id, "weekStart");

-- 3. Suppression des anciennes politiques permissives connues.
DROP POLICY IF EXISTS "allow policies for all" ON public.repas_complets;
DROP POLICY IF EXISTS "Allow policie for all" ON public.repas_planifies;
DROP POLICY IF EXISTS "Allow policie for al" ON public.repas_reels;
DROP POLICY IF EXISTS "Allow policie for all" ON public.repas_reels;
DROP POLICY IF EXISTS "Allow policies for al" ON public.repas_reels;
DROP POLICY IF EXISTS "Allow policies for all" ON public.repas_reels;
DROP POLICY IF EXISTS "allow policies for all" ON public.semaines_validees;

ALTER TABLE public.repas_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repas_planifies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repas_complets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semaines_validees ENABLE ROW LEVEL SECURITY;

-- Permet de rejouer proprement la migration dans un environnement où ces politiques existent déjà.
DROP POLICY IF EXISTS "repas_reels_select_own" ON public.repas_reels;
DROP POLICY IF EXISTS "repas_reels_insert_own" ON public.repas_reels;
DROP POLICY IF EXISTS "repas_reels_update_own" ON public.repas_reels;
DROP POLICY IF EXISTS "repas_reels_delete_own" ON public.repas_reels;
DROP POLICY IF EXISTS "repas_planifies_select_own" ON public.repas_planifies;
DROP POLICY IF EXISTS "repas_planifies_insert_own" ON public.repas_planifies;
DROP POLICY IF EXISTS "repas_planifies_update_own" ON public.repas_planifies;
DROP POLICY IF EXISTS "repas_planifies_delete_own" ON public.repas_planifies;
DROP POLICY IF EXISTS "repas_complets_select_own" ON public.repas_complets;
DROP POLICY IF EXISTS "repas_complets_insert_own" ON public.repas_complets;
DROP POLICY IF EXISTS "repas_complets_update_own" ON public.repas_complets;
DROP POLICY IF EXISTS "repas_complets_delete_own" ON public.repas_complets;
DROP POLICY IF EXISTS "semaines_validees_select_own" ON public.semaines_validees;
DROP POLICY IF EXISTS "semaines_validees_insert_own" ON public.semaines_validees;
DROP POLICY IF EXISTS "semaines_validees_update_own" ON public.semaines_validees;
DROP POLICY IF EXISTS "semaines_validees_delete_own" ON public.semaines_validees;

-- 4. RLS propriétaire : chaque utilisateur authentifié ne peut agir que sur ses lignes.
CREATE POLICY "repas_reels_select_own" ON public.repas_reels
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_reels_insert_own" ON public.repas_reels
FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_reels_update_own" ON public.repas_reels
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_reels_delete_own" ON public.repas_reels
FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "repas_planifies_select_own" ON public.repas_planifies
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_planifies_insert_own" ON public.repas_planifies
FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_planifies_update_own" ON public.repas_planifies
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_planifies_delete_own" ON public.repas_planifies
FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "repas_complets_select_own" ON public.repas_complets
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_complets_insert_own" ON public.repas_complets
FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_complets_update_own" ON public.repas_complets
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "repas_complets_delete_own" ON public.repas_complets
FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "semaines_validees_select_own" ON public.semaines_validees
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "semaines_validees_insert_own" ON public.semaines_validees
FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "semaines_validees_update_own" ON public.semaines_validees
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "semaines_validees_delete_own" ON public.semaines_validees
FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMIT;

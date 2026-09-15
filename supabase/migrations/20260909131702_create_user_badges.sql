BEGIN;
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'defi',
  nom TEXT NOT NULL,
  description TEXT,
  date_obtention TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT badges_code_not_empty CHECK (length(trim(code)) > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS badges_user_code_unique ON public.badges(user_id, code);
CREATE INDEX IF NOT EXISTS badges_user_date_idx ON public.badges(user_id, date_obtention DESC);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_select_own" ON public.badges;
DROP POLICY IF EXISTS "badges_insert_own" ON public.badges;
DROP POLICY IF EXISTS "badges_update_own" ON public.badges;
CREATE POLICY "badges_select_own" ON public.badges FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "badges_insert_own" ON public.badges FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "badges_update_own" ON public.badges FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
GRANT SELECT, INSERT, UPDATE ON public.badges TO authenticated;
COMMENT ON TABLE public.badges IS 'Badges utilisateur persistés avec leurs critères et preuves d’obtention.';
COMMENT ON COLUMN public.badges.code IS 'Identifiant métier stable et unique par utilisateur.';
COMMENT ON COLUMN public.badges.details IS 'Critères et données ayant déclenché le badge.';
COMMIT;

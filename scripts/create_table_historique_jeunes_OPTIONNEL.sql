-- =====================================================
-- TABLE OPTIONNELLE : historique_jeunes
-- =====================================================
-- ⚠️ CETTE TABLE N'EST PAS NÉCESSAIRE ACTUELLEMENT
-- L'historique fonctionne 100% en localStorage
-- Créer cette table UNIQUEMENT si besoin backup Supabase
-- =====================================================

CREATE TABLE IF NOT EXISTS public.historique_jeunes (
  -- Clé primaire
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User (NO AUTH pattern - user_id fixe)
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  
  -- Identifiant jeûne (date_debut + durée)
  jeune_id TEXT NOT NULL, -- Format: "2025-12-10_10j"
  
  -- Dates
  date_debut DATE NOT NULL,
  date_fin DATE,
  date_archivage TIMESTAMPTZ DEFAULT NOW(),
  
  -- Durée et progression
  duree_jours INTEGER NOT NULL,
  jours_valides INTEGER[] NOT NULL, -- [1,2,3,4,5,6,7,8,9,10]
  
  -- Données complètes jeûne (JSONB pour flexibilité)
  outils JSONB, -- { "1": [...], "2": [...], ... }
  message_perso TEXT,
  bilan JSONB, -- Bilan complet généré
  programme_reprise JSONB, -- Programme reprise validé
  
  -- Statut
  statut TEXT DEFAULT 'termine', -- 'termine', 'archive'
  
  -- Corbeille (soft delete)
  supprime BOOLEAN DEFAULT FALSE,
  date_suppression TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_historique_jeunes_user_id ON public.historique_jeunes(user_id);
CREATE INDEX IF NOT EXISTS idx_historique_jeunes_jeune_id ON public.historique_jeunes(jeune_id);
CREATE INDEX IF NOT EXISTS idx_historique_jeunes_date_debut ON public.historique_jeunes(date_debut DESC);
CREATE INDEX IF NOT EXISTS idx_historique_jeunes_supprime ON public.historique_jeunes(supprime) WHERE supprime = FALSE;

-- RLS (même pattern NO AUTH que parcours_jeune)
ALTER TABLE public.historique_jeunes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent lire historique_jeunes"
  ON public.historique_jeunes
  FOR SELECT
  USING (true);

CREATE POLICY "Tous peuvent insérer historique_jeunes"
  ON public.historique_jeunes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tous peuvent modifier historique_jeunes"
  ON public.historique_jeunes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tous peuvent supprimer historique_jeunes"
  ON public.historique_jeunes
  FOR DELETE
  USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_historique_jeunes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historique_jeunes_updated_at
  BEFORE UPDATE ON public.historique_jeunes
  FOR EACH ROW
  EXECUTE FUNCTION update_historique_jeunes_updated_at();

-- Nettoyage automatique corbeille (>30 jours)
-- Option 1 : Fonction manuelle à appeler
CREATE OR REPLACE FUNCTION nettoyer_corbeille_jeunes()
RETURNS INTEGER AS $$
DECLARE
  nb_supprimes INTEGER;
BEGIN
  DELETE FROM public.historique_jeunes
  WHERE supprime = TRUE
    AND date_suppression < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS nb_supprimes = ROW_COUNT;
  RETURN nb_supprimes;
END;
$$ LANGUAGE plpgsql;

-- Option 2 : Cron job Supabase (si extension pg_cron activée)
-- SELECT cron.schedule(
--   'nettoyage-corbeille-jeunes',
--   '0 2 * * *', -- Tous les jours à 2h du matin
--   $$ SELECT nettoyer_corbeille_jeunes(); $$
-- );

-- =====================================================
-- EXEMPLE USAGE (SI TABLE CRÉÉE)
-- =====================================================

-- Insérer jeûne archivé
-- INSERT INTO public.historique_jeunes (
--   jeune_id, date_debut, date_fin, duree_jours, jours_valides,
--   outils, message_perso, bilan, programme_reprise
-- ) VALUES (
--   '2025-12-10_10j',
--   '2025-12-10',
--   '2025-12-19',
--   10,
--   ARRAY[1,2,3,4,5,6,7,8,9,10],
--   '{"1": ["outil1", "outil2"], "2": [...]}'::JSONB,
--   'Mon message personnel',
--   '{"score": 85, "commentaire": "..."}'::JSONB,
--   '{"duree_reprise_jours": 7, "jours": [...]}'::JSONB
-- );

-- Récupérer historique utilisateur
-- SELECT * FROM public.historique_jeunes
-- WHERE supprime = FALSE
-- ORDER BY date_debut DESC;

-- Soft delete (corbeille)
-- UPDATE public.historique_jeunes
-- SET supprime = TRUE, date_suppression = NOW()
-- WHERE jeune_id = '2025-12-10_10j';

-- Restaurer depuis corbeille
-- UPDATE public.historique_jeunes
-- SET supprime = FALSE, date_suppression = NULL
-- WHERE jeune_id = '2025-12-10_10j';

-- Suppression définitive
-- DELETE FROM public.historique_jeunes
-- WHERE jeune_id = '2025-12-10_10j';

-- Nettoyage manuel corbeille
-- SELECT nettoyer_corbeille_jeunes();

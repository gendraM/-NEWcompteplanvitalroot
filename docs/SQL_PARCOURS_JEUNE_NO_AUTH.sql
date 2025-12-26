-- Table parcours_jeune : Stockage progression jeûne (NO AUTH)
CREATE TABLE IF NOT EXISTS parcours_jeune (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('preparation', 'jeune', 'reprise', 'consolidation')),
  date_debut DATE NOT NULL,
  date_fin DATE,
  duree_jours INTEGER CHECK (duree_jours > 0 AND duree_jours <= 365),
  statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'abandonne')),
  jours_valides JSONB DEFAULT '[]'::jsonb,
  outils_actives JSONB DEFAULT '{}'::jsonb,
  message_perso TEXT,
  progression JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour optimisation requêtes
CREATE INDEX IF NOT EXISTS idx_parcours_jeune_user_id ON parcours_jeune(user_id);
CREATE INDEX IF NOT EXISTS idx_parcours_jeune_type ON parcours_jeune(type);
CREATE INDEX IF NOT EXISTS idx_parcours_jeune_statut ON parcours_jeune(statut);
CREATE INDEX IF NOT EXISTS idx_parcours_jeune_user_statut ON parcours_jeune(user_id, statut);
CREATE INDEX IF NOT EXISTS idx_parcours_jeune_date_debut ON parcours_jeune(date_debut DESC);

-- Désactiver RLS (architecture NO AUTH)
ALTER TABLE parcours_jeune DISABLE ROW LEVEL SECURITY;

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_parcours_jeune_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_parcours_jeune_updated_at
  BEFORE UPDATE ON parcours_jeune
  FOR EACH ROW
  EXECUTE FUNCTION update_parcours_jeune_updated_at();

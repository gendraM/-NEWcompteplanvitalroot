-- Migration : Création table extras_budget
-- Date : 10 janvier 2026
-- Phase 3 : Budget Calorique Extras

-- Table de suivi du budget extras hebdomadaire
CREATE TABLE IF NOT EXISTS extras_budget (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_semaine DATE NOT NULL, -- Date du lundi de la semaine concernée
  budget_hebdo INTEGER NOT NULL DEFAULT 0, -- Budget total calculé par routeur poids (kcal)
  budget_consomme INTEGER NOT NULL DEFAULT 0, -- Budget consommé (somme kcal extras)
  budget_reserve INTEGER NOT NULL DEFAULT 0, -- Budget réservé pour extras planifiés
  budget_libre INTEGER GENERATED ALWAYS AS (budget_hebdo - budget_consomme - budget_reserve) STORED, -- Budget disponible (calculé automatiquement)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_extras_budget_user ON extras_budget(user_id);
CREATE INDEX IF NOT EXISTS idx_extras_budget_semaine ON extras_budget(date_semaine);
CREATE INDEX IF NOT EXISTS idx_extras_budget_user_semaine ON extras_budget(user_id, date_semaine);

-- RLS (Row Level Security) : Chaque utilisateur ne voit que ses données
ALTER TABLE extras_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leur propre budget extras"
  ON extras_budget
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent insérer leur propre budget extras"
  ON extras_budget
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leur propre budget extras"
  ON extras_budget
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leur propre budget extras"
  ON extras_budget
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction de trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_extras_budget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_extras_budget_updated_at
  BEFORE UPDATE ON extras_budget
  FOR EACH ROW
  EXECUTE FUNCTION update_extras_budget_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE extras_budget IS 'Suivi hebdomadaire du budget calorique extras (Phase 3)';
COMMENT ON COLUMN extras_budget.budget_hebdo IS 'Budget total kcal calculé par routeur poids pour la semaine';
COMMENT ON COLUMN extras_budget.budget_consomme IS 'Somme des kcal extras effectivement consommés';
COMMENT ON COLUMN extras_budget.budget_reserve IS 'Kcal réservés pour extras planifiés (Phase 5)';
COMMENT ON COLUMN extras_budget.budget_libre IS 'Budget disponible = hebdo - consommé - réservé (auto-calculé)';

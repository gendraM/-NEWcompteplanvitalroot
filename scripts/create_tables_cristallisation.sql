-- ============================================================================
-- CRISTALLISATION: 3 TABLES (Architecture cohérente avec app existante)
-- Pattern: user_id dynamique (comme repas_reels, defis, etc.)
-- ============================================================================

-- TABLE 1: Programme 45 jours personnalisé
CREATE TABLE IF NOT EXISTS parcours_cristallisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duree_jours INTEGER NOT NULL DEFAULT 45,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  jour_courant INTEGER DEFAULT 1,
  bilan_reprise JSONB NOT NULL,
  criteres_personnalises JSONB NOT NULL,
  progression JSONB DEFAULT '[]'::jsonb,
  tracking_comportements JSONB DEFAULT '{}'::jsonb,
  victoires JSONB DEFAULT '[]'::jsonb,
  mauvaises_habitudes_vaincues JSONB DEFAULT '[]'::jsonb,
  statut TEXT DEFAULT 'en_cours',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parcours_user ON parcours_cristallisation(user_id);
CREATE INDEX idx_parcours_statut ON parcours_cristallisation(statut);
CREATE INDEX idx_parcours_dates ON parcours_cristallisation(date_debut, date_fin);

-- RLS activé (comme les autres tables)
ALTER TABLE parcours_cristallisation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parcours" ON parcours_cristallisation
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parcours" ON parcours_cristallisation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parcours" ON parcours_cristallisation
  FOR UPDATE USING (auth.uid() = user_id);

-- TABLE 2: Conseils NEXT meal (1 MAX/jour/type)
CREATE TABLE IF NOT EXISTS conseils_cristallisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parcours_id UUID REFERENCES parcours_cristallisation(id) ON DELETE CASCADE,
  date_generation DATE NOT NULL,
  type_repas TEXT NOT NULL,
  cible TEXT,
  pattern_detecte TEXT,
  aliments_triggers JSONB DEFAULT '[]'::jsonb,
  moment_critique TEXT,
  contexte_emotionnel TEXT,
  message TEXT NOT NULL,
  alternatives_suggerees JSONB DEFAULT '[]'::jsonb,
  strategies JSONB DEFAULT '[]'::jsonb,
  applique BOOLEAN DEFAULT FALSE,
  date_application DATE,
  repas_reel_id UUID,
  conditions_reconnaissance JSONB,
  points_obtenus INTEGER DEFAULT 0,
  badge_debloque TEXT,
  impact_mesure JSONB,
  notification_envoyee BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conseils_user_date ON conseils_cristallisation(user_id, date_generation);
CREATE INDEX idx_conseils_parcours ON conseils_cristallisation(parcours_id);
CREATE INDEX idx_conseils_applique ON conseils_cristallisation(applique);
CREATE INDEX idx_conseils_type ON conseils_cristallisation(type_repas);

ALTER TABLE conseils_cristallisation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conseils" ON conseils_cristallisation
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conseils" ON conseils_cristallisation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conseils" ON conseils_cristallisation
  FOR UPDATE USING (auth.uid() = user_id);

-- TABLE 3: Listes courses générées
CREATE TABLE IF NOT EXISTS listes_courses_generees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parcours_id UUID REFERENCES parcours_cristallisation(id) ON DELETE CASCADE,
  semaine_debut DATE NOT NULL,
  semaine_fin DATE NOT NULL,
  nb_jours INTEGER NOT NULL,
  liste_json JSONB NOT NULL,
  criteres_actifs JSONB,
  aliments_triggers JSONB,
  objectif_qn NUMERIC,
  objectif_conformite INTEGER,
  analyse_conformite JSONB,
  pdf_url TEXT,
  pdf_genere_le TIMESTAMPTZ,
  email_envoye BOOLEAN DEFAULT FALSE,
  email_envoye_a TEXT,
  email_envoye_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listes_user_semaine ON listes_courses_generees(user_id, semaine_debut);
CREATE INDEX idx_listes_parcours ON listes_courses_generees(parcours_id);
CREATE INDEX idx_listes_semaine ON listes_courses_generees(semaine_debut);

ALTER TABLE listes_courses_generees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listes" ON listes_courses_generees
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listes" ON listes_courses_generees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FONCTION: Calculer jour courant (1-45)
CREATE OR REPLACE FUNCTION calculer_jour_courant(date_debut DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, LEAST(45, (CURRENT_DATE - date_debut)::INTEGER + 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- FONCTION: Vérifier 1 conseil MAX/jour
CREATE OR REPLACE FUNCTION conseil_deja_genere_aujourdhui(
  p_user_id UUID,
  p_type_repas TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  nb_conseils INTEGER;
BEGIN
  SELECT COUNT(*) INTO nb_conseils
  FROM conseils_cristallisation
  WHERE user_id = p_user_id
    AND type_repas = p_type_repas
    AND date_generation = CURRENT_DATE;
  
  RETURN (nb_conseils > 0);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_parcours_updated_at
  BEFORE UPDATE ON parcours_cristallisation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- VÉRIFICATION
DO $$
BEGIN
  RAISE NOTICE 'Tables cristallisation créées ✅';
  RAISE NOTICE 'RLS activé + Policies créées ✅';
END $$;

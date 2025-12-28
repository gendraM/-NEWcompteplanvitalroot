-- ============================================================================
-- SCRIPT CRÉATION TABLES CRISTALLISATION
-- ============================================================================
-- Date: 26 Décembre 2025
-- Phase: Post-reprise alimentaire (45 jours d'ancrage)
-- Pattern: NO AUTH (user_id fixe: 'laurelle_test_user')
-- ============================================================================

-- ============================================================================
-- TABLE 1: parcours_cristallisation
-- ============================================================================
-- Programme personnalisé de 45 jours avec critères dynamiques
-- Génère les critères depuis bilan_reprise (pas hardcodés)
-- Tracking précis: nouveaux comportements gagnés vs mauvaises habitudes vaincues
-- ============================================================================

CREATE TABLE IF NOT EXISTS parcours_cristallisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'laurelle_test_user',
  
  -- ========================================
  -- Durée et dates du parcours
  -- ========================================
  duree_jours INTEGER NOT NULL DEFAULT 45,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  jour_courant INTEGER DEFAULT 1, -- Calculé automatiquement depuis date_debut
  
  -- ========================================
  -- Bilan reprise (transmis depuis reprise-alimentaire-apres-jeune.js)
  -- ========================================
  bilan_reprise JSONB NOT NULL,
  -- Structure attendue:
  -- {
  --   "extras": {
  --     "total": 22,
  --     "par_jour": 1.05,
  --     "types_frequents": ["chocolat", "biscuits", "chips"]
  --   },
  --   "feculents_soir": {
  --     "occurrences": 12,
  --     "pourcentage": 57
  --   },
  --   "qn_moyen": 3.1,
  --   "quantites_excessives": {
  --     "taux_conformite": 68,
  --     "categories_problematiques": ["feculents", "proteines"]
  --   },
  --   "jeunes_ponctuels": {
  --     "total_jours": 21,
  --     "reussis": 14,
  --     "taux": 67
  --   },
  --   "pratiques_spirituelles": {
  --     "moyenne_par_jour": 2.3,
  --     "irregularite": true
  --   }
  -- }
  
  -- ========================================
  -- Critères personnalisés dynamiques
  -- ========================================
  criteres_personnalises JSONB NOT NULL,
  -- Généré depuis referentiel_criteres_cristallisation.js
  -- Structure:
  -- [
  --   {
  --     "id": "extras_reduction",
  --     "type": "extras_frequents",
  --     "titre": "Maximum 3 extras par semaine",
  --     "description": "Réduis de 68% tes extras (de 22 à 3/semaine)",
  --     "seuil_actuel": 22,
  --     "seuil_cible": 3,
  --     "unite": "extras/semaine",
  --     "validation_type": "quotidienne",
  --     "messages": {
  --       "encouragement": "Bravo ! Aucun extra aujourd'hui 💪",
  --       "alerte": "⚠️ Extra détecté. Tu as déjà {{nb_extras}} extras cette semaine",
  --       "victoire": "🏆 21 jours sans extras ! Habitude vaincue !"
  --     }
  --   }
  -- ]
  
  -- ========================================
  -- Progression quotidienne (45 jours)
  -- ========================================
  progression JSONB DEFAULT '[]'::jsonb,
  -- Structure:
  -- [
  --   {
  --     "jour": 1,
  --     "date": "2025-12-26",
  --     "criteres_valides": ["quantites_ok", "pas_feculents_soir", "qn_bon"],
  --     "criteres_echoues": ["extra_consomme", "pas_jeune"],
  --     "score_jour": 3,
  --     "score_max": 5,
  --     "feedback": "Bon démarrage ! Continue comme ça 💪",
  --     "jeune_ponctuel_fait": false,
  --     "poids_jour": 76.8,
  --     "qn_moyen_jour": 3.2,
  --     "nb_extras_jour": 1,
  --     "valide": true,
  --     "valide_le": "2025-12-26T22:30:00Z"
  --   }
  -- ]
  
  -- ========================================
  -- Tracking nouveaux comportements gagnés
  -- ========================================
  tracking_comportements JSONB DEFAULT '{}'::jsonb,
  -- Structure:
  -- {
  --   "pas_extra_journalier": {
  --     "streak_actuel": 5,
  --     "streak_max": 7,
  --     "dernier_succes": "2025-12-25",
  --     "total_succes": 38,
  --     "taux_reussite": 84
  --   },
  --   "feculents_timing_ok": {
  --     "streak_actuel": 12,
  --     "streak_max": 12,
  --     "dernier_succes": "2025-12-25",
  --     "total_succes": 42,
  --     "taux_reussite": 93
  --   }
  -- }
  
  -- ========================================
  -- Victoires débloquées (badges)
  -- ========================================
  victoires JSONB DEFAULT '[]'::jsonb,
  -- Structure:
  -- [
  --   {
  --     "comportement": "pas_extra_21j",
  --     "titre": "21 jours sans extras",
  --     "description": "Tu as tenu 21 jours consécutifs sans aucun extra",
  --     "badge": "🏆",
  --     "date_obtention": "2025-01-15",
  --     "jour_obtention": 21
  --   }
  -- ]
  
  -- ========================================
  -- Mauvaises habitudes vaincues
  -- ========================================
  mauvaises_habitudes_vaincues JSONB DEFAULT '[]'::jsonb,
  -- Structure:
  -- [
  --   {
  --     "habitude": "extras_frequents",
  --     "titre": "Extras quotidiens",
  --     "taux_reprise": 105,
  --     "taux_cristallisation": 20,
  --     "reduction_pourcent": 81,
  --     "maintien_jours": 21,
  --     "date_victoire": "2025-01-20",
  --     "badge": "🎯"
  --   }
  -- ]
  
  -- ========================================
  -- Statut du parcours
  -- ========================================
  statut TEXT DEFAULT 'en_cours',
  -- Valeurs possibles: en_cours, terminee, abandonnee
  
  -- ========================================
  -- Métadonnées
  -- ========================================
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_parcours_cristallisation_user_id 
  ON parcours_cristallisation(user_id);
CREATE INDEX IF NOT EXISTS idx_parcours_cristallisation_statut 
  ON parcours_cristallisation(statut);
CREATE INDEX IF NOT EXISTS idx_parcours_cristallisation_date_debut 
  ON parcours_cristallisation(date_debut);
CREATE INDEX IF NOT EXISTS idx_parcours_cristallisation_date_fin 
  ON parcours_cristallisation(date_fin);

-- Désactiver RLS (NO AUTH pattern)
ALTER TABLE parcours_cristallisation DISABLE ROW LEVEL SECURITY;

-- Commentaires
COMMENT ON TABLE parcours_cristallisation IS 'Programme personnalisé de 45 jours post-reprise avec critères dynamiques générés depuis bilan_reprise';
COMMENT ON COLUMN parcours_cristallisation.bilan_reprise IS 'Données transmises depuis reprise-alimentaire-apres-jeune.js pour génération critères personnalisés';
COMMENT ON COLUMN parcours_cristallisation.criteres_personnalises IS 'Critères dynamiques générés depuis referentiel_criteres_cristallisation.js (PAS hardcodés)';
COMMENT ON COLUMN parcours_cristallisation.tracking_comportements IS 'Tracking précis des nouveaux comportements gagnés avec streaks et taux réussite';
COMMENT ON COLUMN parcours_cristallisation.mauvaises_habitudes_vaincues IS 'Mauvaises habitudes vaincues avec comparaison taux reprise vs cristallisation';

-- ============================================================================
-- TABLE 2: conseils_cristallisation
-- ============================================================================
-- Système conseils intelligents pour NEXT meal (pas pendant saisie)
-- 1 conseil MAX par jour et par type repas
-- Reconnaissance si appliqué: +10 points + badge
-- ============================================================================

CREATE TABLE IF NOT EXISTS conseils_cristallisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'laurelle_test_user',
  parcours_id UUID REFERENCES parcours_cristallisation(id) ON DELETE CASCADE,
  
  -- ========================================
  -- Conseil généré
  -- ========================================
  date_generation DATE NOT NULL,
  type_repas TEXT NOT NULL, -- dejeuner, diner
  cible TEXT NOT NULL, -- soir (aujourd'hui), lendemain
  
  -- ========================================
  -- Pattern détecté qui a déclenché conseil
  -- ========================================
  pattern_detecte TEXT NOT NULL, 
  -- Valeurs: extra_frequents, feculents_soir, qn_faible, quantite_excessive, variete_faible, comportemental
  
  aliments_triggers JSONB,
  -- ["chocolat", "biscuits", "chips"]
  
  moment_critique TEXT,
  -- "apres_midi" (16h-19h), "soir" (19h-22h), "matin" (7h-10h)
  
  contexte_emotionnel TEXT,
  -- "stress", "fatigue", "ennui", "celebration", null
  
  -- ========================================
  -- Contenu du conseil
  -- ========================================
  message TEXT NOT NULL,
  -- "Évite le chocolat ce soir. Tu as déjà eu 2 extras cette semaine."
  
  alternatives_suggerees JSONB,
  -- [
  --   {
  --     "nom": "Pomme",
  --     "qn": 5,
  --     "portion": "1 unité",
  --     "raison": "Satisfait l'envie de sucré sans être un extra"
  --   },
  --   {
  --     "nom": "Yaourt nature",
  --     "qn": 4,
  --     "portion": "125g",
  --     "raison": "Protéines + satiété"
  --   }
  -- ]
  
  strategies JSONB,
  -- [
  --   "Boire un grand verre d'eau avant",
  --   "Attendre 15 minutes pour voir si l'envie passe",
  --   "Faire une activité distrayante"
  -- ]
  
  -- ========================================
  -- Suivi de l'application
  -- ========================================
  applique BOOLEAN DEFAULT false,
  date_application TIMESTAMPTZ,
  repas_reel_id BIGINT, -- Référence à repas_reels si appliqué
  
  -- Conditions de reconnaissance (3 conditions)
  conditions_reconnaissance JSONB,
  -- {
  --   "conseil_en_cours": true,
  --   "bon_type_repas": "diner",
  --   "alternative_presente": "Pomme"
  -- }
  
  -- ========================================
  -- Reconnaissance
  -- ========================================
  points_obtenus INTEGER DEFAULT 0, -- +10 si appliqué
  badge_debloque TEXT, -- "🌟 Conseil appliqué"
  
  impact_mesure JSONB,
  -- {
  --   "qn_prevu": 3.5,
  --   "qn_obtenu": 4.2,
  --   "gain_qn": 0.7,
  --   "calories_economisees": 250
  -- }
  
  notification_envoyee BOOLEAN DEFAULT false,
  
  -- ========================================
  -- Métadonnées
  -- ========================================
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_conseils_user_date 
  ON conseils_cristallisation(user_id, date_generation);
CREATE INDEX IF NOT EXISTS idx_conseils_parcours 
  ON conseils_cristallisation(parcours_id);
CREATE INDEX IF NOT EXISTS idx_conseils_appliques 
  ON conseils_cristallisation(applique);
CREATE INDEX IF NOT EXISTS idx_conseils_type_repas 
  ON conseils_cristallisation(type_repas);

-- Désactiver RLS (NO AUTH pattern)
ALTER TABLE conseils_cristallisation DISABLE ROW LEVEL SECURITY;

-- Commentaires
COMMENT ON TABLE conseils_cristallisation IS 'Conseils intelligents pour NEXT meal (1 MAX par jour et par type repas). Reconnaissance +10 points si appliqué.';
COMMENT ON COLUMN conseils_cristallisation.cible IS 'soir (aujourdhui) ou lendemain. JAMAIS pendant saisie (trop tard).';
COMMENT ON COLUMN conseils_cristallisation.applique IS 'TRUE si utilisateur a suivi le conseil (détection automatique via 3 conditions)';
COMMENT ON COLUMN conseils_cristallisation.conditions_reconnaissance IS '3 conditions pour reconnaissance: conseil en cours + bon type repas + alternative présente dans repas_reels';

-- ============================================================================
-- TABLE 3: listes_courses_generees
-- ============================================================================
-- Stockage listes courses générées depuis /plan.js
-- Enrichies avec BDD + contexte cristallisation
-- Stats prévision: QN moyen, conformité, budget
-- ============================================================================

CREATE TABLE IF NOT EXISTS listes_courses_generees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'laurelle_test_user',
  parcours_id UUID REFERENCES parcours_cristallisation(id) ON DELETE CASCADE,
  
  -- ========================================
  -- Période planifiée
  -- ========================================
  semaine_debut DATE NOT NULL,
  semaine_fin DATE NOT NULL,
  nb_jours INTEGER DEFAULT 7,
  
  -- ========================================
  -- Liste courses complète (sortie processus 5 étapes)
  -- ========================================
  liste_json JSONB NOT NULL,
  -- Structure:
  -- {
  --   "categories": [
  --     {
  --       "nom": "Légumes",
  --       "ordre": 1,
  --       "aliments": [
  --         {
  --           "nom": "Courgettes",
  --           "quantite_totale_planifiee": 900,
  --           "quantite_courses": 1400,
  --           "unite": "g",
  --           "qn": 5,
  --           "est_trigger": false,
  --           "alertes": [],
  --           "recommandations": ["Privilégie bio si possible"],
  --           "nb_portions": 6,
  --           "prix_estime": 4.2
  --         }
  --       ]
  --     },
  --     {
  --       "nom": "Protéines",
  --       "ordre": 2,
  --       "aliments": [...]
  --     }
  --   ],
  --   "stats": {
  --     "total_aliments": 24,
  --     "qn_moyen_prevu": 3.8,
  --     "budget_estime": 67.5,
  --     "conformite_cristallisation": 92,
  --     "nb_aliments_triggers": 1,
  --     "nb_alertes": 2
  --   }
  -- }
  
  -- ========================================
  -- Contexte cristallisation transmis
  -- ========================================
  criteres_actifs JSONB,
  -- ["pas_extras", "feculents_matin_midi_uniquement", "qn_min_3.5"]
  
  aliments_triggers JSONB,
  -- ["chocolat", "chips", "biscuits"]
  
  objectif_qn NUMERIC,
  -- 3.5
  
  objectif_conformite INTEGER,
  -- 90 (%)
  
  -- ========================================
  -- Analyse conformité
  -- ========================================
  analyse_conformite JSONB,
  -- {
  --   "conformite_globale": 92,
  --   "problemes_detectes": [
  --     {
  --       "type": "aliment_trigger",
  --       "aliment": "Chocolat noir",
  --       "quantite": 200,
  --       "recommandation": "Remplace par fruits secs (QN similaire, pas trigger)"
  --     }
  --   ],
  --   "points_forts": [
  --     "Excellente variété légumes (12 types)",
  --     "QN moyen prévu: 3.8 (objectif: 3.5)"
  --   ]
  -- }
  
  -- ========================================
  -- Export
  -- ========================================
  pdf_url TEXT,
  pdf_genere_le TIMESTAMPTZ,
  
  email_envoye BOOLEAN DEFAULT false,
  email_envoye_a TEXT,
  email_envoye_le TIMESTAMPTZ,
  
  -- ========================================
  -- Métadonnées
  -- ========================================
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_listes_courses_user_date 
  ON listes_courses_generees(user_id, semaine_debut);
CREATE INDEX IF NOT EXISTS idx_listes_courses_parcours 
  ON listes_courses_generees(parcours_id);
CREATE INDEX IF NOT EXISTS idx_listes_courses_semaine_debut 
  ON listes_courses_generees(semaine_debut);

-- Désactiver RLS (NO AUTH pattern)
ALTER TABLE listes_courses_generees DISABLE ROW LEVEL SECURITY;

-- Commentaires
COMMENT ON TABLE listes_courses_generees IS 'Listes courses générées depuis /plan.js avec enrichissement BDD + contexte cristallisation';
COMMENT ON COLUMN listes_courses_generees.liste_json IS 'Résultat processus 5 étapes: récupération → agrégation → enrichissement → filtrage → génération finale';
COMMENT ON COLUMN listes_courses_generees.analyse_conformite IS 'Analyse automatique conformité aux critères cristallisation avec problèmes détectés et recommandations';
COMMENT ON COLUMN listes_courses_generees.criteres_actifs IS 'Critères cristallisation actifs transmis depuis /cristallisation-quotidien.js';

-- ============================================================================
-- TRIGGERS AUTO-UPDATE
-- ============================================================================

-- Trigger pour updated_at sur parcours_cristallisation
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parcours_cristallisation_updated_at
  BEFORE UPDATE ON parcours_cristallisation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour calculer jour_courant automatiquement
CREATE OR REPLACE FUNCTION calculer_jour_courant(date_debut_param DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, EXTRACT(DAY FROM (CURRENT_DATE - date_debut_param))::INTEGER + 1);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculer_jour_courant IS 'Calcule le jour courant (1-45) depuis date_debut. Utilisé dans /cristallisation-quotidien.js';

-- Fonction pour vérifier si conseil déjà généré aujourd'hui
CREATE OR REPLACE FUNCTION conseil_deja_genere_aujourdhui(
  user_id_param TEXT,
  type_repas_param TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  count_conseils INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_conseils
  FROM conseils_cristallisation
  WHERE user_id = user_id_param
    AND type_repas = type_repas_param
    AND date_generation = CURRENT_DATE;
  
  RETURN count_conseils > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION conseil_deja_genere_aujourdhui IS 'Vérifie règle: 1 conseil MAX par jour et par type repas';

-- ============================================================================
-- DONNÉES EXEMPLE (pour tests)
-- ============================================================================

-- Exemple parcours cristallisation
-- INSERT INTO parcours_cristallisation (
--   user_id,
--   date_debut,
--   date_fin,
--   bilan_reprise,
--   criteres_personnalises
-- ) VALUES (
--   'laurelle_test_user',
--   '2025-12-26',
--   '2026-02-08',
--   '{
--     "extras": {"total": 22, "par_jour": 1.05, "types_frequents": ["chocolat", "biscuits"]},
--     "feculents_soir": {"occurrences": 12, "pourcentage": 57},
--     "qn_moyen": 3.1
--   }'::jsonb,
--   '[
--     {
--       "id": "extras_reduction",
--       "type": "extras_frequents",
--       "titre": "Maximum 3 extras par semaine",
--       "seuil_cible": 3
--     }
--   ]'::jsonb
-- );

-- ============================================================================
-- VÉRIFICATION TABLES CRÉÉES
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parcours_cristallisation') THEN
    RAISE NOTICE '✅ Table parcours_cristallisation créée avec succès';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conseils_cristallisation') THEN
    RAISE NOTICE '✅ Table conseils_cristallisation créée avec succès';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listes_courses_generees') THEN
    RAISE NOTICE '✅ Table listes_courses_generees créée avec succès';
  END IF;
  
  RAISE NOTICE '🎯 3 tables cristallisation créées - RLS désactivé (NO AUTH pattern)';
END $$;

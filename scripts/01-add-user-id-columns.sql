-- ============================================================================
-- PHASE 2 : MIGRATION BDD - AJOUT COLONNES user_id
-- ============================================================================
-- Date: 10/01/2026
-- Objectif: Ajouter la colonne user_id à toutes les tables utilisateur
-- Sécurité: Colonne nullable au départ (migration progressive)
-- ============================================================================

-- IMPORTANT: Exécuter ce script dans l'éditeur SQL de Supabase Dashboard
-- Après exécution, AUCUNE donnée ne sera perdue
-- Les données existantes auront user_id = NULL (temporairement)

BEGIN;

-- ============================================================================
-- PARTIE 1 : Tables principales profil et suivi
-- ============================================================================

-- Table profil
ALTER TABLE public.profil 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table historique_poids
ALTER TABLE public.historique_poids 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 2 : Tables jeûne
-- ============================================================================

-- Table jeune
ALTER TABLE public.jeune 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table jeune_jour
ALTER TABLE public.jeune_jour 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table jeune_analyse
ALTER TABLE public.jeune_analyse 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table preparations_jeune
ALTER TABLE public.preparations_jeune 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table bilans_jeune
ALTER TABLE public.bilans_jeune 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table parcours_jeune
ALTER TABLE public.parcours_jeune 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 3 : Tables reprise alimentaire
-- ============================================================================

-- Table reprises_alimentaires
ALTER TABLE public.reprises_alimentaires 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table reprises_jours_valides
ALTER TABLE public.reprises_jours_valides 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table reprises_repas_consommes
ALTER TABLE public.reprises_repas_consommes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 4 : Tables défis
-- ============================================================================

-- Table defis
ALTER TABLE public.defis 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table defis_personnalises
ALTER TABLE public.defis_personnalises 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table journal_defis
ALTER TABLE public.journal_defis 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table defis_cristallisation
ALTER TABLE public.defis_cristallisation 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table journal_defi_cristallisation
ALTER TABLE public.journal_defi_cristallisation 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 5 : Tables journal spirituel
-- ============================================================================

-- Table journal_spirituel_audios
ALTER TABLE public.journal_spirituel_audios 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table journal_spirituel_ecrits
ALTER TABLE public.journal_spirituel_ecrits 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table journal_spirituel_intentions
ALTER TABLE public.journal_spirituel_intentions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table journal_spirituel_meditations
ALTER TABLE public.journal_spirituel_meditations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table journal_spirituel_questions
ALTER TABLE public.journal_spirituel_questions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table journal_spirituel_versets
ALTER TABLE public.journal_spirituel_versets 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 6 : Tables feedbacks et statistiques
-- ============================================================================

-- Table feedbacks
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table stats_comportementales
ALTER TABLE public.stats_comportementales 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 7 : Tables repas et alimentation
-- ============================================================================

-- Table plan_alimentaire
ALTER TABLE public.plan_alimentaire 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table repas_planifies
ALTER TABLE public.repas_planifies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table repas_reels
ALTER TABLE public.repas_reels 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table repas_complets
ALTER TABLE public.repas_complets 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 8 : Tables extras et fast-food
-- ============================================================================

-- Table extras
ALTER TABLE public.extras 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table extras_budget
ALTER TABLE public.extras_budget 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table fast_food_history
ALTER TABLE public.fast_food_history 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 9 : Tables cristallisation
-- ============================================================================

-- Table badges_cristallisation
ALTER TABLE public.badges_cristallisation 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table conseils_cristallisation
ALTER TABLE public.conseils_cristallisation 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table parcours_cristallisation
ALTER TABLE public.parcours_cristallisation 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table validations_cristallisation
ALTER TABLE public.validations_cristallisation 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 10 : Tables idéaux, routines et actions
-- ============================================================================

-- Table ideaux
ALTER TABLE public.ideaux 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table routines
ALTER TABLE public.routines 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table actions
ALTER TABLE public.actions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table objectifs
ALTER TABLE public.objectifs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 11 : Tables diverses
-- ============================================================================

-- Table seances_reelles
ALTER TABLE public.seances_reelles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table alternatives
ALTER TABLE public.alternatives 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table combos_enregistres
ALTER TABLE public.combos_enregistres 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table listes_courses_generees
ALTER TABLE public.listes_courses_generees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table messages_dynamiques
ALTER TABLE public.messages_dynamiques 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table semaines_validees
ALTER TABLE public.semaines_validees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table unites_personnelles
ALTER TABLE public.unites_personnelles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PARTIE 12 : Création des index pour performance
-- ============================================================================

-- Index sur profil
CREATE INDEX IF NOT EXISTS idx_profil_user_id ON public.profil(user_id);

-- Index sur historique_poids
CREATE INDEX IF NOT EXISTS idx_historique_poids_user_id ON public.historique_poids(user_id);

-- Index sur jeune
CREATE INDEX IF NOT EXISTS idx_jeune_user_id ON public.jeune(user_id);

-- Index sur jeune_jour
CREATE INDEX IF NOT EXISTS idx_jeune_jour_user_id ON public.jeune_jour(user_id);

-- Index sur preparations_jeune
CREATE INDEX IF NOT EXISTS idx_preparations_jeune_user_id ON public.preparations_jeune(user_id);

-- Index sur defis
CREATE INDEX IF NOT EXISTS idx_defis_user_id ON public.defis(user_id);

-- Index sur journal_defis
CREATE INDEX IF NOT EXISTS idx_journal_defis_user_id ON public.journal_defis(user_id);

-- Index sur feedbacks
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON public.feedbacks(user_id);

-- Index sur ideaux
CREATE INDEX IF NOT EXISTS idx_ideaux_user_id ON public.ideaux(user_id);

-- Index sur repas_reels
CREATE INDEX IF NOT EXISTS idx_repas_reels_user_id ON public.repas_reels(user_id);

-- Index sur extras_budget
CREATE INDEX IF NOT EXISTS idx_extras_budget_user_id ON public.extras_budget(user_id);

-- ============================================================================
-- COMMIT ET VÉRIFICATION
-- ============================================================================

COMMIT;

-- Vérification du nombre de colonnes ajoutées
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- ✅ Si aucune erreur : migration structure OK
-- ⚠️ Données existantes ont user_id = NULL (normal à ce stade)
-- 🚀 Prêt pour Phase 3 : association données utilisateur
-- ============================================================================

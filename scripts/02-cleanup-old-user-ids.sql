-- ============================================================================
-- SCRIPT DE NETTOYAGE - Réinitialiser les anciens user_id TEXT
-- ============================================================================
-- Date: 11/01/2026
-- Objectif: Mettre à NULL tous les anciens user_id de type TEXT
-- Raison: Préparer l'association avec le vrai UUID lors de l'inscription
-- ============================================================================

-- IMPORTANT: Exécuter AVANT de créer ton compte
-- Cela permet de repartir sur une base propre

BEGIN;


ALTER TABLE public.bilans_jeune 
ALTER COLUMN user_id DROP NOT NULL;



UPDATE public.bilans_jeune 
SET user_id = NULL 
WHERE user_id IS NOT NULL;





COMMIT;

SELECT 
    'bilans_jeune' as table_name,
    COUNT(*) as lignes_avec_user_id
FROM public.bilans_jeune 
WHERE user_id IS NOT NULL



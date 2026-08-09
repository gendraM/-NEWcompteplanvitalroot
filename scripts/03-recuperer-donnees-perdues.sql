-- ============================================================================
-- PHASE 3 : RÉCUPÉRATION DES DONNÉES PERDUES (user_id = NULL)
-- ============================================================================
-- Date: 14 février 2026
-- Objectif: Associer toutes les données sans user_id au premier utilisateur
-- Contexte: Avec RLS activée, les données user_id=NULL sont invisibles
-- ============================================================================

-- IMPORTANT: Exécuter ce script dans l'éditeur SQL de Supabase Dashboard
-- Ce script récupère 277 repas_reels actuellement invisibles

BEGIN;

-- ============================================================================
-- ÉTAPE 1 : Vérification de l'état AVANT migration
-- ============================================================================

DO $$
DECLARE
  nb_users INTEGER;
  premier_user_id UUID;
BEGIN
  -- Compter le nombre d'utilisateurs
  SELECT COUNT(*) INTO nb_users FROM auth.users;
  
  IF nb_users = 0 THEN
    RAISE EXCEPTION 'ERREUR: Aucun utilisateur trouvé. Créez d\'abord un compte via l\'app.';
  END IF;
  
  -- Récupérer l'ID du premier utilisateur (celui qui possède déjà des données)
  SELECT id INTO premier_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;
  
  RAISE NOTICE 'Utilisateur cible: %', premier_user_id;
END $$;

-- ============================================================================
-- ÉTAPE 2 : Statistiques AVANT migration
-- ============================================================================

SELECT 
  'AVANT MIGRATION' as etape,
  'repas_reels' as table_name,
  COUNT(*) as total,
  COUNT(user_id) as avec_user_id,
  COUNT(*) - COUNT(user_id) as orphelins_invisibles
FROM repas_reels;

-- ============================================================================
-- ÉTAPE 3 : Association des données orphelines
-- ============================================================================

-- Récupération des 277 repas_reels perdus
UPDATE repas_reels
SET user_id = (
  SELECT id 
  FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Vérifier s'il reste des données orphelines dans d'autres tables
-- (normalement non, d'après les résultats fournis)

UPDATE profil
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

UPDATE historique_poids
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

UPDATE defis
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

UPDATE ideaux
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

UPDATE jeune
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

UPDATE preparations_jeune
SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE user_id IS NULL;

-- ============================================================================
-- ÉTAPE 4 : Statistiques APRÈS migration
-- ============================================================================

SELECT 
  'APRÈS MIGRATION' as etape,
  'repas_reels' as table_name,
  COUNT(*) as total,
  COUNT(user_id) as avec_user_id,
  COUNT(*) - COUNT(user_id) as orphelins_restants
FROM repas_reels;

-- ============================================================================
-- ÉTAPE 5 : Vérification complète toutes tables
-- ============================================================================

SELECT 'profil' as table_name,
  COUNT(*) as total,
  COUNT(user_id) as avec_user_id,
  COUNT(*) - COUNT(user_id) as sans_user_id
FROM profil
UNION ALL
SELECT 'historique_poids',
  COUNT(*),
  COUNT(user_id),
  COUNT(*) - COUNT(user_id)
FROM historique_poids
UNION ALL
SELECT 'jeune',
  COUNT(*),
  COUNT(user_id),
  COUNT(*) - COUNT(user_id)
FROM jeune
UNION ALL
SELECT 'defis',
  COUNT(*),
  COUNT(user_id),
  COUNT(*) - COUNT(user_id)
FROM defis
UNION ALL
SELECT 'preparations_jeune',
  COUNT(*),
  COUNT(user_id),
  COUNT(*) - COUNT(user_id)
FROM preparations_jeune
UNION ALL
SELECT 'repas_reels',
  COUNT(*),
  COUNT(user_id),
  COUNT(*) - COUNT(user_id)
FROM repas_reels
UNION ALL
SELECT 'ideaux',
  COUNT(*),
  COUNT(user_id),
  COUNT(*) - COUNT(user_id)
FROM ideaux;

COMMIT;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Toutes les lignes doivent afficher : sans_user_id = 0
-- Si c'est le cas → ✅ SUCCÈS : 277 repas récupérés
-- ============================================================================


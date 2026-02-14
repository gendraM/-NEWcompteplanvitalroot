-- Vérification RLS sur historique_poids
-- À exécuter dans l'éditeur SQL Supabase

-- 1. Vérifier si RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'historique_poids';

-- 2. Lister les policies existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'historique_poids';

-- 3. Compter les pesées (SANS RLS - utiliser BYPASS RLS ou dans SQL Editor avec service_role)
SELECT COUNT(*) as nb_pesees, MIN(date) as premiere, MAX(date) as derniere
FROM historique_poids;

-- 4. Voir les données janvier 2026 (SANS RLS)
SELECT id, date, poids, created_at
FROM historique_poids
WHERE date >= '2026-01-01' AND date <= '2026-01-31'
ORDER BY date;

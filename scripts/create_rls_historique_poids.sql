-- Configuration RLS pour historique_poids
-- À exécuter dans l'éditeur SQL Supabase (Dashboard)

-- 1. Activer RLS sur la table (si pas déjà fait)
ALTER TABLE historique_poids ENABLE ROW LEVEL SECURITY;

-- 2. DROP les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view own poids" ON historique_poids;
DROP POLICY IF EXISTS "Users can insert own poids" ON historique_poids;
DROP POLICY IF EXISTS "Users can update own poids" ON historique_poids;
DROP POLICY IF EXISTS "Users can delete own poids" ON historique_poids;

-- PROBLÈME : historique_poids n'a PAS de colonne user_id !
-- Il faut SOIT :
-- Option A : Ajouter user_id à la table
-- Option B : Désactiver RLS (mode test/dev)
-- Option C : Policy basée sur auth.uid() avec JOIN sur autre table

-- ===========================
-- SOLUTION TEMPORAIRE : DÉSACTIVER RLS
-- ===========================
ALTER TABLE historique_poids DISABLE ROW LEVEL SECURITY;

-- NOTE : En production, il faudrait :
-- 1. Ajouter colonne user_id à historique_poids
-- 2. Migrer les données existantes
-- 3. Créer policies basées sur user_id
-- 4. Réactiver RLS

-- ===========================
-- SOLUTION PERMANENTE (à faire plus tard)
-- ===========================
-- 1. Ajouter user_id
-- ALTER TABLE historique_poids ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- CREATE INDEX idx_historique_poids_user_id ON historique_poids(user_id);

-- 2. Activer RLS
-- ALTER TABLE historique_poids ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- CREATE POLICY "Users can view own poids" ON historique_poids
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own poids" ON historique_poids
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own poids" ON historique_poids
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own poids" ON historique_poids
--   FOR DELETE USING (auth.uid() = user_id);

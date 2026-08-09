-- Supprimer les pesées de test janvier 2026
-- À exécuter dans Supabase SQL Editor après vos tests

-- Option 1 : Supprimer TOUTES les pesées de janvier 2026
DELETE FROM historique_poids 
WHERE date >= '2026-01-01' 
AND date <= '2026-01-31'
AND user_id = '21611093-6230-4305-81f7-57a0034d6188';

-- Option 2 : Supprimer UNIQUEMENT les 7 pesées test spécifiques
-- DELETE FROM historique_poids 
-- WHERE date IN ('2026-01-02', '2026-01-05', '2026-01-08', '2026-01-12', '2026-01-15', '2026-01-19', '2026-01-22')
-- AND user_id = '21611093-6230-4305-81f7-57a0034d6188';

-- Vérifier qu'elles sont bien supprimées
SELECT date, poids FROM historique_poids 
WHERE date >= '2026-01-01' AND date <= '2026-01-31'
ORDER BY date;
-- Devrait retourner 0 rows

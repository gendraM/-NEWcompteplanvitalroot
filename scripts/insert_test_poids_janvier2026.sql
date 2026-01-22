-- Insérer des pesées de test pour janvier 2026
-- À exécuter dans Supabase SQL Editor

-- Remplacer 'VOTRE_USER_ID' par votre vrai user_id (celui du JSON : 21611093-6230-4305-81f7-57a0034d6188)

-- Pesées janvier 2026 (évolution -2kg sur le mois)
INSERT INTO historique_poids (date, poids, user_id, created_at) VALUES
  ('2026-01-02', 101.0, '21611093-6230-4305-81f7-57a0034d6188', '2026-01-02 08:00:00+00'),
  ('2026-01-05', 100.8, '21611093-6230-4305-81f7-57a0034d6188', '2026-01-05 08:00:00+00'),
  ('2026-01-08', 100.5, '21611093-6230-4305-81f7-57a0034d6188', '2026-01-08 08:00:00+00'),
  ('2026-01-12', 100.2, '21611093-6230-4305-81f7-57a0034d6188', '2026-01-12 08:00:00+00'),
  ('2026-01-15', 99.8, '21611093-6230-4305-81f7-57a0034d6188', '2026-01-15 08:00:00+00'),
  ('2026-01-19', 99.5, '21611093-6230-4305-81f7-57a0034d6188', '2026-01-19 08:00:00+00'),
  ('2026-01-22', 99.0, '21611093-6230-4305-81f7-57a0034d6188', '2026-01-22 08:00:00+00')
ON CONFLICT DO NOTHING;

-- Vérifier l'insertion
SELECT date, poids, user_id 
FROM historique_poids 
WHERE date >= '2026-01-01' AND date <= '2026-01-31'
ORDER BY date;

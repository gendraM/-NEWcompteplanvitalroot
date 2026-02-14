-- Script de test : fallback "données insuffisantes"
-- À exécuter dans Supabase SQL Editor

-- SCÉNARIO 1 : 0 pesée + projection mois précédent disponible
-- ============================================================
-- Prérequis : Avoir un bilan de décembre 2025 avec projection

-- 1. Insérer un bilan décembre 2025 avec projection
INSERT INTO bilans_mensuels (user_id, mois, annee, date_debut_periode, date_fin_periode, section_1_tendance_poids)
VALUES (
  '21611093-6230-4305-81f7-57a0034d6188',
  12,
  2025,
  '2025-12-01',
  '2025-12-31',
  '{
    "poids_debut": 102.5,
    "poids_fin": 100.8,
    "evolution_kg": -1.7,
    "evolution_pourcent": -1.66,
    "trajectoire": "bonne",
    "poids_mois_prochain": 99.1,
    "nb_pesees": 5
  }'::jsonb
)
ON CONFLICT (user_id, mois, annee) DO UPDATE
SET section_1_tendance_poids = EXCLUDED.section_1_tendance_poids;

-- 2. Supprimer toutes les pesées janvier 2026
DELETE FROM historique_poids 
WHERE date >= '2026-01-01' AND date <= '2026-01-31'
AND user_id = '21611093-6230-4305-81f7-57a0034d6188';

-- 3. Vérifier : 0 pesée janvier 2026
SELECT COUNT(*) as nb_pesees_janvier FROM historique_poids 
WHERE date >= '2026-01-01' AND date <= '2026-01-31';

-- TEST : Valider une semaine janvier → Devrait afficher :
-- ✅ "Vous n'avez pas encore pesé ce mois-ci"
-- ✅ Projection précédente : 99.1 kg
-- ✅ Bouton "Saisir ma première pesée"


-- SCÉNARIO 2 : 1 pesée (insuffisant pour tendance)
-- ================================================

-- 1. Ajouter 1 seule pesée
INSERT INTO historique_poids (date, poids, user_id) 
VALUES ('2026-01-10', 99.5, '21611093-6230-4305-81f7-57a0034d6188');

-- TEST : Valider une semaine janvier → Devrait afficher :
-- ✅ "Il vous faut au moins 2 pesées" (actuellement: 1 pesée)
-- ✅ Poids actuel : 99.5 kg
-- ✅ Projection précédente : 99.1 kg (si dispo)
-- ✅ Bouton "Ajouter une pesée"


-- SCÉNARIO 3 : 2+ pesées (fonctionnel)
-- ====================================

-- 1. Ajouter une 2e pesée
INSERT INTO historique_poids (date, poids, user_id) 
VALUES ('2026-01-20', 98.8, '21611093-6230-4305-81f7-57a0034d6188');

-- TEST : Valider une semaine janvier → Devrait afficher :
-- ✅ Section 1 complète avec graphique
-- ✅ Trajectoire "bonne" (-0.7 kg)


-- NETTOYAGE après tests
-- =====================

-- Supprimer bilan test décembre 2025
-- DELETE FROM bilans_mensuels WHERE user_id = '21611093-6230-4305-81f7-57a0034d6188' AND mois = 12 AND annee = 2025;

-- Supprimer pesées test janvier 2026
-- DELETE FROM historique_poids WHERE date >= '2026-01-01' AND date <= '2026-01-31' AND user_id = '21611093-6230-4305-81f7-57a0034d6188';

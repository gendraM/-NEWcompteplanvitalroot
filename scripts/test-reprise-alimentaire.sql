-- ═══════════════════════════════════════════════════════════════════════
-- SCRIPT SQL - DONNÉES TEST REPRISE ALIMENTAIRE
-- ═══════════════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor
-- Crée un programme de reprise actif pour tester le système
-- ═══════════════════════════════════════════════════════════════════════

-- 🗑️ NETTOYAGE DONNÉES TEST PRÉCÉDENTES
DELETE FROM reprises_jours_valides WHERE reprise_id = 'TEST_USER';
DELETE FROM repas_reels WHERE programme_reprise_id = 'TEST_USER';
DELETE FROM reprises_alimentaires WHERE id = 'TEST_USER';

-- ══════════════════════════════════════════════════════════════════════
-- 1️⃣ CRÉER PROGRAMME REPRISE (commencé il y a 3 jours)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO reprises_alimentaires (
  id,
  created_by,
  date_fin_jeune,
  duree_jeune_jours,
  type_jeune,
  duree_reprise_jours,
  statut,
  reprise_commencee_le,
  created_at
) VALUES (
  'TEST_USER',
  'TEST_USER',
  (CURRENT_DATE - INTERVAL '4 days')::date,          -- Jeûne terminé il y a 4 jours
  7,                                                   -- Jeûne de 7 jours
  'hydrique',
  10,                                                  -- Reprise de 10 jours
  'en_cours',
  (CURRENT_DATE - INTERVAL '3 days')::timestamp,     -- Reprise commencée il y a 3 jours
  NOW()
);

-- ══════════════════════════════════════════════════════════════════════
-- 2️⃣ GÉNÉRER 10 JOURS DE PROGRAMME (Phase 1-4)
-- ══════════════════════════════════════════════════════════════════════

-- Phase 1: J1-J2 (Liquides uniquement)
INSERT INTO reprises_jours_valides (reprise_id, jour_numero, date, phase, valide, valide_le, nb_repas_enregistres)
VALUES 
  ('TEST_USER', 1, (CURRENT_DATE - INTERVAL '3 days')::date, 1, true, NOW(), 3),
  ('TEST_USER', 2, (CURRENT_DATE - INTERVAL '2 days')::date, 1, true, NOW(), 3);

-- Phase 2: J3-J5 (Liquides + Légumes)
INSERT INTO reprises_jours_valides (reprise_id, jour_numero, date, phase, valide, valide_le, nb_repas_enregistres)
VALUES 
  ('TEST_USER', 3, CURRENT_DATE, 2, false, NULL, 0),                          -- AUJOURD'HUI ← Test ici
  ('TEST_USER', 4, (CURRENT_DATE + INTERVAL '1 day')::date, 2, false, NULL, 0),
  ('TEST_USER', 5, (CURRENT_DATE + INTERVAL '2 days')::date, 2, false, NULL, 0);

-- Phase 3: J6-J8 (+ Fruits + Protéines végétales)
INSERT INTO reprises_jours_valides (reprise_id, jour_numero, date, phase, valide, valide_le, nb_repas_enregistres)
VALUES 
  ('TEST_USER', 6, (CURRENT_DATE + INTERVAL '3 days')::date, 3, false, NULL, 0),
  ('TEST_USER', 7, (CURRENT_DATE + INTERVAL '4 days')::date, 3, false, NULL, 0),
  ('TEST_USER', 8, (CURRENT_DATE + INTERVAL '5 days')::date, 3, false, NULL, 0);

-- Phase 4: J9-J10 (+ Féculents, pas le soir)
INSERT INTO reprises_jours_valides (reprise_id, jour_numero, date, phase, valide, valide_le, nb_repas_enregistres)
VALUES 
  ('TEST_USER', 9, (CURRENT_DATE + INTERVAL '6 days')::date, 4, false, NULL, 0),
  ('TEST_USER', 10, (CURRENT_DATE + INTERVAL '7 days')::date, 4, false, NULL, 0);

-- ══════════════════════════════════════════════════════════════════════
-- 3️⃣ CRÉER REPAS HISTORIQUES (J+1 et J+2 déjà validés)
-- ══════════════════════════════════════════════════════════════════════

-- J+1 Phase 1: 3 repas liquides
INSERT INTO repas_reels (
  type, date, heure, aliment, categorie, quantite, kcal, 
  est_extra, note, ressenti, satiete,
  contexte_reprise, jour_reprise, phase_reprise, programme_reprise_id
) VALUES 
  (
    'Petit-déjeuner', 
    (CURRENT_DATE - INTERVAL '3 days')::date, 
    '08:00', 
    'Eau', 
    'liquide', 
    '250', 
    0, 
    false, 
    'Premier jour de reprise', 
    'Bien', 
    '',
    true, 
    1, 
    1, 
    'TEST_USER'
  ),
  (
    'Déjeuner', 
    (CURRENT_DATE - INTERVAL '3 days')::date, 
    '12:30', 
    'Bouillon de légumes', 
    'liquide', 
    '250', 
    20, 
    false, 
    'Bouillon fait maison', 
    'Agréable', 
    '',
    true, 
    1, 
    1, 
    'TEST_USER'
  ),
  (
    'Dîner', 
    (CURRENT_DATE - INTERVAL '3 days')::date, 
    '19:00', 
    'Tisane verveine', 
    'liquide', 
    '200', 
    0, 
    false, 
    '', 
    '', 
    '',
    true, 
    1, 
    1, 
    'TEST_USER'
  );

-- J+2 Phase 1: 3 repas liquides
INSERT INTO repas_reels (
  type, date, heure, aliment, categorie, quantite, kcal, 
  est_extra, note, ressenti, satiete,
  contexte_reprise, jour_reprise, phase_reprise, programme_reprise_id
) VALUES 
  (
    'Petit-déjeuner', 
    (CURRENT_DATE - INTERVAL '2 days')::date, 
    '08:15', 
    'Jus de fruits frais', 
    'liquide', 
    '200', 
    80, 
    false, 
    'Orange pressée', 
    'Énergisant', 
    '',
    true, 
    2, 
    1, 
    'TEST_USER'
  ),
  (
    'Déjeuner', 
    (CURRENT_DATE - INTERVAL '2 days')::date, 
    '12:45', 
    'Bouillon miso', 
    'liquide', 
    '250', 
    35, 
    false, 
    'Avec algues wakame', 
    'Savoureux', 
    '',
    true, 
    2, 
    1, 
    'TEST_USER'
  ),
  (
    'Dîner', 
    (CURRENT_DATE - INTERVAL '2 days')::date, 
    '19:30', 
    'Eau citronnée', 
    'liquide', 
    '250', 
    5, 
    false, 
    'Citron bio', 
    '', 
    '',
    true, 
    2, 
    1, 
    'TEST_USER'
  );

-- ══════════════════════════════════════════════════════════════════════
-- 📊 VÉRIFICATIONS
-- ══════════════════════════════════════════════════════════════════════

-- Programme créé
SELECT 
  id, 
  statut, 
  date_fin_jeune,
  duree_reprise_jours,
  reprise_commencee_le,
  CURRENT_DATE - DATE(reprise_commencee_le) AS jours_depuis_debut
FROM reprises_alimentaires 
WHERE id = 'TEST_USER';

-- Jours générés
SELECT 
  jour_numero,
  date,
  phase,
  valide,
  nb_repas_enregistres,
  CASE 
    WHEN date < CURRENT_DATE THEN 'Passé'
    WHEN date = CURRENT_DATE THEN '⚡ AUJOURD\'HUI'
    ELSE 'Futur'
  END AS statut_jour
FROM reprises_jours_valides 
WHERE reprise_id = 'TEST_USER'
ORDER BY jour_numero;

-- Repas historiques
SELECT 
  jour_reprise,
  phase_reprise,
  type,
  aliment,
  quantite,
  heure
FROM repas_reels 
WHERE programme_reprise_id = 'TEST_USER'
ORDER BY jour_reprise, heure;

-- ══════════════════════════════════════════════════════════════════════
-- ✅ RÉSULTAT ATTENDU
-- ══════════════════════════════════════════════════════════════════════
-- Programme: TEST_USER, statut en_cours, commencé il y a 3 jours
-- Aujourd'hui = J+3, Phase 2
-- J+1 et J+2 validés (3 repas chacun)
-- J+3 à J+10 non validés (0 repas)
--
-- 🧪 TESTS À FAIRE:
-- 1. Aller sur /suivi → Bandeau "Phase 2 - Jour 3" visible
-- 2. Ajouter "Concombre" (Phase 2) → ✅ Accepté
-- 3. Ajouter "Riz complet" (Phase 4) → ❌ Refusé
-- 4. Ajouter "Quinoa" après 19h → ❌ Refusé (féculent soir)
-- 5. Valider J+3 sans repas → ❌ Bloqué (<2 repas)
-- 6. Ajouter 2 repas → Valider J+3 → ✅ Validé
-- ══════════════════════════════════════════════════════════════════════

-- ============================================================================
-- SCRIPT DE VÉRIFICATION - Identifier les tables manquantes
-- ============================================================================
-- Ce script compare les tables existantes avec celles du script de migration
-- ============================================================================

-- ÉTAPE 1 : Lister TOUTES les tables public existantes
SELECT 
    table_name,
    'Table existante' as statut
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================

-- ÉTAPE 2 : Vérifier quelles tables N'ONT PAS encore user_id
SELECT 
    table_name,
    'MANQUE user_id' as statut
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.table_name = t.table_name
    AND c.column_name = 'user_id'
)
ORDER BY table_name;

-- ============================================================================

-- ÉTAPE 3 : Tables listées dans le script de migration (45 tables)
WITH tables_migration AS (
    SELECT unnest(ARRAY[
        'actions',
        'alternatives',
        'badges_cristallisation',
        'bilans_jeune',
        'combos_enregistres',
        'conseils_cristallisation',
        'defis',
        'defis_cristallisation',
        'defis_personnalises',
        'extras',
        'fast_food_history',
        'feedbacks',
        'historique_poids',
        'ideaux',
        'jeune',
        'jeune_analyse',
        'jeune_jour',
        'journal_defi_cristallisation',
        'journal_defis',
        'journal_spirituel_audios',
        'journal_spirituel_ecrits',
        'journal_spirituel_intentions',
        'journal_spirituel_meditations',
        'journal_spirituel_questions',
        'journal_spirituel_versets',
        'listes_courses_generees',
        'messages_dynamiques',
        'objectifs',
        'parcours_cristallisation',
        'parcours_jeune',
        'plan_alimentaire',
        'preparations_jeune',
        'profil',
        'repas_complets',
        'repas_planifies',
        'repas_reels',
        'reprises_alimentaires',
        'reprises_jours_valides',
        'reprises_repas_consommes',
        'routines',
        'seances_reelles',
        'semaines_validees',
        'stats_comportementales',
        'unites_personnelles',
        'validations_cristallisation'
    ]) as table_name
)
SELECT COUNT(*) as nb_tables_dans_script
FROM tables_migration;

-- ============================================================================

-- ÉTAPE 4 : Tables qui EXISTENT mais NE SONT PAS dans le script de migration
WITH tables_migration AS (
    SELECT unnest(ARRAY[
        'actions',
        'alternatives',
        'badges_cristallisation',
        'bilans_jeune',
        'combos_enregistres',
        'conseils_cristallisation',
        'defis',
        'defis_cristallisation',
        'defis_personnalises',
        'extras',
        'fast_food_history',
        'feedbacks',
        'historique_poids',
        'ideaux',
        'jeune',
        'jeune_analyse',
        'jeune_jour',
        'journal_defi_cristallisation',
        'journal_defis',
        'journal_spirituel_audios',
        'journal_spirituel_ecrits',
        'journal_spirituel_intentions',
        'journal_spirituel_meditations',
        'journal_spirituel_questions',
        'journal_spirituel_versets',
        'listes_courses_generees',
        'messages_dynamiques',
        'objectifs',
        'parcours_cristallisation',
        'parcours_jeune',
        'plan_alimentaire',
        'preparations_jeune',
        'profil',
        'repas_complets',
        'repas_planifies',
        'repas_reels',
        'reprises_alimentaires',
        'reprises_jours_valides',
        'reprises_repas_consommes',
        'routines',
        'seances_reelles',
        'semaines_validees',
        'stats_comportementales',
        'unites_personnelles',
        'validations_cristallisation'
    ]) as table_name
)
SELECT 
    t.table_name,
    '⚠️ MANQUANTE DANS SCRIPT' as statut,
    'Ajouter à la migration' as action_requise
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name NOT IN (SELECT table_name FROM tables_migration)
-- Exclure table referentiel_aliments (données de référence partagées)
AND t.table_name != 'referentiel_aliments'
ORDER BY t.table_name;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Cette requête devrait afficher les 2 tables manquantes
-- (probablement des tables récemment ajoutées)
-- ============================================================================

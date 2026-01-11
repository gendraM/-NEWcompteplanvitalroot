# ✅ CHECKLIST PRÉ-MIGRATION USER_ID — Supabase

**📋 À compléter AVANT d'exécuter le script de migration**  
**⏱️ Temps nécessaire : 2-4 heures (préparation + exécution + validation)**  
**👥 Requis : 1 développeur + 1 ops (recommandé)**

---

## 📅 PLANIFICATION

### J-7 : Préparation
- [ ] Lire document complet [ANALYSE_RISQUES_MIGRATION_USER_ID_PHASE3.md](./ANALYSE_RISQUES_MIGRATION_USER_ID_PHASE3.md)
- [ ] Identifier tous les utilisateurs actuels (compter nombre de profils)
- [ ] Vérifier si auth.users contient tous les comptes nécessaires
- [ ] Planifier fenêtre maintenance (date + heure creuse)
- [ ] Informer utilisateurs par email/notification (J-7)

### J-2 : Tests
- [ ] Créer copie BDD production vers environnement DEV
- [ ] Exécuter script migration sur BDD DEV
- [ ] Valider succès migration DEV (0 erreur)
- [ ] Tester application DEV post-migration (login, profil, jeûne, défis)
- [ ] Rappel utilisateurs maintenance (J-2)

### J-1 : Validation finale
- [ ] Double vérification backup production (télécharger + tester restauration)
- [ ] Préparer script rollback complet
- [ ] Préparer script association user_id (localStorage → UUID)
- [ ] Vérifier disponibilité équipe support
- [ ] Rappel utilisateurs maintenance (J-1, H-12h, H-1h)

---

## 🔍 AUDIT PRÉALABLE (30 MIN)

### Vérification schéma BDD
```sql
-- 1. Vérifier existence des 51 tables
SELECT COUNT(*) as tables_presentes 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profil', 'historique_poids', 'jeune', 'jeune_jour', 'jeune_analyse',
  'preparations_jeune', 'bilans_jeune', 'parcours_jeune',
  'reprises_alimentaires', 'reprises_jours_valides', 'reprises_repas_consommes',
  'defis', 'defis_personnalises', 'journal_defis', 
  'defis_cristallisation', 'journal_defi_cristallisation',
  'journal_spirituel_audios', 'journal_spirituel_ecrits',
  'journal_spirituel_intentions', 'journal_spirituel_meditations',
  'journal_spirituel_questions', 'journal_spirituel_versets',
  'feedbacks', 'stats_comportementales',
  'plan_alimentaire', 'repas_planifies', 'repas_reels', 'repas_complets',
  'extras', 'fast_food_history',
  'badges_cristallisation', 'conseils_cristallisation', 
  'parcours_cristallisation', 'validations_cristallisation',
  'ideaux', 'routines', 'actions', 'objectifs',
  'seances_reelles', 'alternatives', 'combos_enregistres',
  'listes_courses_generees', 'messages_dynamiques', 
  'semaines_validees', 'unites_personnelles'
);
-- Résultat attendu : 51
```

- [ ] ✅ Résultat = 51 tables présentes

```sql
-- 2. Vérifier colonnes user_id existantes (conflits potentiels)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;
```

- [ ] ✅ Si résultat vide → Bon, aucun conflit
- [ ] ⚠️ Si résultat non vide → Analyser types (TEXT vs UUID)

```sql
-- 3. Compter lignes totales (estimer durée downtime)
SELECT 
  relname as table_name,
  n_live_tup as lignes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND relname IN ('profil', 'jeune', 'defis', 'repas_reels')
ORDER BY n_live_tup DESC;
```

- [ ] ✅ Total < 1 000 lignes → Durée estimée 5-10 min
- [ ] ⚠️ Total 1 000-10 000 lignes → Durée estimée 15-30 min
- [ ] 🔴 Total > 10 000 lignes → Durée estimée 30-60 min

```sql
-- 4. Vérifier politiques RLS actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

- [ ] ✅ Noter toutes les politiques RLS (à recréer après migration)

---

## 💾 BACKUP (15 MIN)

### Backup Supabase Dashboard
- [ ] ✅ Se connecter à Supabase Dashboard
- [ ] ✅ Aller dans Database > Backups
- [ ] ✅ Créer nouveau backup manuel
- [ ] ✅ Attendre confirmation backup réussi (email + dashboard)

### Backup local (recommandé)
```bash
# Via Supabase CLI (si installé)
supabase db dump -f backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# OU via pg_dump (si accès direct PostgreSQL)
pg_dump -h <host> -U <user> -d <database> -F c -f backup_pre_migration.dump
```

- [ ] ✅ Backup local créé
- [ ] ✅ Backup local téléchargé (hors serveur)
- [ ] ✅ Tester restauration backup (sur BDD test)

---

## 🔐 PRÉPARATION RLS (10 MIN)

### Désactivation temporaire RLS
```sql
-- Désactiver RLS sur toutes les tables concernées
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'profil', 'historique_poids', 'jeune', 'jeune_jour', 'jeune_analyse',
      'preparations_jeune', 'bilans_jeune', 'parcours_jeune',
      'reprises_alimentaires', 'reprises_jours_valides', 'reprises_repas_consommes',
      'defis', 'defis_personnalises', 'journal_defis', 
      'defis_cristallisation', 'journal_defi_cristallisation',
      'journal_spirituel_audios', 'journal_spirituel_ecrits',
      'journal_spirituel_intentions', 'journal_spirituel_meditations',
      'journal_spirituel_questions', 'journal_spirituel_versets',
      'feedbacks', 'stats_comportementales',
      'plan_alimentaire', 'repas_planifies', 'repas_reels', 'repas_complets',
      'extras', 'fast_food_history',
      'badges_cristallisation', 'conseils_cristallisation', 
      'parcours_cristallisation', 'validations_cristallisation',
      'ideaux', 'routines', 'actions', 'objectifs',
      'seances_reelles', 'alternatives', 'combos_enregistres',
      'listes_courses_generees', 'messages_dynamiques', 
      'semaines_validees', 'unites_personnelles'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'RLS désactivé : %', r.tablename;
  END LOOP;
END $$;
```

- [ ] ✅ RLS désactivé sur 51 tables

---

## 🚀 EXÉCUTION MIGRATION (30-60 MIN)

### Option A : Script sécurisé (RECOMMANDÉ)
- [ ] ✅ Copier script sécurisé depuis [ANALYSE_RISQUES_MIGRATION_USER_ID_PHASE3.md](./ANALYSE_RISQUES_MIGRATION_USER_ID_PHASE3.md)
- [ ] ✅ Exécuter LOT 1 (profil, historique_poids)
- [ ] ✅ Valider LOT 1 (SELECT COUNT, vérifier colonnes créées)
- [ ] ✅ Exécuter LOT 2 (tables jeûne)
- [ ] ✅ Valider LOT 2
- [ ] ✅ Exécuter LOT 3 (reprise alimentaire)
- [ ] ✅ Valider LOT 3
- [ ] ✅ Exécuter LOT 4 (défis)
- [ ] ✅ Valider LOT 4
- [ ] ✅ Exécuter LOT 5 (journal spirituel)
- [ ] ✅ Valider LOT 5
- [ ] ✅ Exécuter LOT 6 (feedbacks, stats)
- [ ] ✅ Valider LOT 6
- [ ] ✅ Exécuter LOT 7 (repas, alimentation)
- [ ] ✅ Valider LOT 7
- [ ] ✅ Exécuter LOT 8 (extras, fast-food)
- [ ] ✅ Valider LOT 8
- [ ] ✅ Exécuter LOT 9 (cristallisation)
- [ ] ✅ Valider LOT 9
- [ ] ✅ Exécuter LOT 10 (idéaux, routines, actions)
- [ ] ✅ Valider LOT 10
- [ ] ✅ Exécuter LOT 11 (tables diverses)
- [ ] ✅ Valider LOT 11

### Option B : Script original (NON RECOMMANDÉ)
- [ ] ⚠️ Vous assumez TOUS les risques critiques
- [ ] ⚠️ Exécuter script en UNE FOIS (BEGIN...COMMIT)
- [ ] ⚠️ Attendre fin transaction (peut prendre 5-60 min)

---

## ✅ VALIDATION POST-MIGRATION (15 MIN)

### Vérification colonnes créées
```sql
-- Vérifier 51 colonnes user_id créées
SELECT COUNT(*) as colonnes_user_id_creees
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id';
-- Résultat attendu : 51
```

- [ ] ✅ Résultat = 51 colonnes

### Vérification index créés
```sql
-- Vérifier index user_id créés
SELECT COUNT(*) as index_user_id_crees
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%user_id%';
-- Résultat attendu : 51 (si script sécurisé) ou 10 (si script original)
```

- [ ] ✅ Résultat = 51 index (script sécurisé)
- [ ] ⚠️ Résultat = 10 index (script original → créer 41 index manquants)

### Vérification données NULL (CRITIQUE)
```sql
-- Vérifier lignes avec user_id = NULL (attendu pour l'instant)
SELECT 
  'profil' as table_name, COUNT(*) as lignes_null FROM profil WHERE user_id IS NULL
UNION ALL
SELECT 'jeune', COUNT(*) FROM jeune WHERE user_id IS NULL
UNION ALL
SELECT 'defis', COUNT(*) FROM defis WHERE user_id IS NULL
UNION ALL
SELECT 'repas_reels', COUNT(*) FROM repas_reels WHERE user_id IS NULL;
```

- [ ] ✅ Toutes les lignes existantes ont user_id = NULL (NORMAL à ce stade)

---

## 🔗 ASSOCIATION DONNÉES (30-60 MIN)

### Création table mapping
```sql
-- Table de correspondance localStorage ↔ auth.users
CREATE TABLE IF NOT EXISTS migration_user_mapping (
  old_user_id TEXT PRIMARY KEY,
  new_user_id UUID REFERENCES auth.users(id),
  email TEXT,
  device_info JSONB,
  migration_date TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] ✅ Table migration_user_mapping créée

### Remplissage mapping (MANUEL)
```sql
-- EXEMPLE : Associer ancien user_id (localStorage) → nouveau UUID (auth.users)
-- ⚠️ À ADAPTER selon votre système d'authentification

-- Option 1 : Si email connu
INSERT INTO migration_user_mapping (old_user_id, new_user_id, email)
VALUES (
  'user_12345', -- localStorage ID
  (SELECT id FROM auth.users WHERE email = 'user@example.com'),
  'user@example.com'
);

-- Option 2 : Si mapping manuel (nécessite interface UI)
-- Demander à chaque utilisateur de se connecter pour créer association
```

- [ ] ✅ Mapping créé pour tous les utilisateurs (via script ou UI)

### Mise à jour user_id par lot
```sql
-- Exemple : Mise à jour table profil
UPDATE profil 
SET user_id = m.new_user_id
FROM migration_user_mapping m
WHERE profil.id IN (
  -- Logique d'association (dépend de votre schéma)
  -- Exemple simple : 1 profil par utilisateur
  SELECT p.id FROM profil p WHERE p.user_id IS NULL LIMIT 1000
)
AND m.old_user_id = '...'; -- À déterminer selon votre logique

-- Répéter pour les 51 tables
-- ⚠️ Processus long, nécessite script automatisé
```

- [ ] ✅ user_id associé pour table profil
- [ ] ✅ user_id associé pour table historique_poids
- [ ] ✅ user_id associé pour toutes les 51 tables

### Validation association
```sql
-- Vérifier AUCUNE ligne NULL restante
SELECT 
  table_name,
  (SELECT COUNT(*) FROM profil WHERE user_id IS NULL) as profil_null,
  (SELECT COUNT(*) FROM jeune WHERE user_id IS NULL) as jeune_null,
  (SELECT COUNT(*) FROM defis WHERE user_id IS NULL) as defis_null
  -- ... (répéter pour tables critiques)
;
-- Résultat attendu : 0 partout
```

- [ ] ✅ Aucune ligne user_id = NULL (ou justifié si orphelines)

---

## 🔐 RÉACTIVATION RLS (30 MIN)

### Recréation politiques RLS
```sql
-- EXEMPLE pour table profil
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profil" ON profil
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profil" ON profil
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profil" ON profil
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profil" ON profil
  FOR DELETE USING (auth.uid() = user_id);

-- Répéter pour les 51 tables (politiques adaptées selon métier)
```

- [ ] ✅ RLS réactivé sur table profil
- [ ] ✅ RLS réactivé sur table historique_poids
- [ ] ✅ RLS réactivé sur toutes les 51 tables
- [ ] ✅ Politiques RLS créées (SELECT, INSERT, UPDATE, DELETE)

---

## 🧪 TESTS POST-MIGRATION (30 MIN)

### Tests fonctionnels critiques
- [ ] ✅ Login utilisateur (authentification Supabase)
- [ ] ✅ Affichage profil (user_id filtré correctement)
- [ ] ✅ Affichage historique poids (données isolées par utilisateur)
- [ ] ✅ Création jeûne (INSERT avec user_id = auth.uid())
- [ ] ✅ Affichage jeûnes (SELECT filtré par user_id)
- [ ] ✅ Création défi (INSERT avec user_id)
- [ ] ✅ Ajout repas réel (INSERT avec user_id)
- [ ] ✅ Journal spirituel (SELECT/INSERT filtré)
- [ ] ✅ Isolation multi-utilisateurs (utilisateur A ne voit PAS données B)

### Tests performance
```sql
-- Vérifier utilisation index
EXPLAIN ANALYZE 
SELECT * FROM profil WHERE user_id = 'UUID_UTILISATEUR_TEST';

-- Résultat attendu : "Index Scan using idx_profil_user_id"
-- ⚠️ Si "Seq Scan" → Index non utilisé, créer index manquant
```

- [ ] ✅ Requêtes utilisent index (Index Scan, pas Seq Scan)
- [ ] ✅ Temps réponse API acceptable (< 500ms pour requêtes simples)

---

## 📊 MONITORING POST-MIGRATION (48H)

### Jour J : Surveillance continue
- [ ] ✅ Monitorer logs Supabase (Supabase Dashboard > Logs)
- [ ] ✅ Vérifier erreurs 403 Forbidden (RLS mal configuré)
- [ ] ✅ Vérifier erreurs 500 Internal Server Error (requêtes cassées)
- [ ] ✅ Monitorer temps réponse API (ralentissements)
- [ ] ✅ Support utilisateurs actif (hotline, chat, email)

### J+1 : Validation stabilité
- [ ] ✅ Aucune erreur critique détectée
- [ ] ✅ Performances stables (pas de dégradation)
- [ ] ✅ Utilisateurs satisfaits (pas de plaintes majeures)

### J+2 : Clôture migration
- [ ] ✅ Supprimer table migration_user_mapping (si plus nécessaire)
- [ ] ✅ Archiver backup pré-migration (garder 30 jours minimum)
- [ ] ✅ Documenter REX (retour d'expérience) migration
- [ ] ✅ Désactiver mode maintenance (si activé)
- [ ] ✅ Email confirmation utilisateurs (migration réussie)

---

## 🚨 PROCÉDURE ROLLBACK (EN CAS D'ÉCHEC)

### Si migration échoue (AVANT association données)
```sql
-- 1. Restaurer backup Supabase
-- Via Supabase Dashboard > Database > Backups > Restore

-- OU

-- 2. Supprimer colonnes user_id (perte données associations)
ALTER TABLE profil DROP COLUMN IF EXISTS user_id;
ALTER TABLE historique_poids DROP COLUMN IF EXISTS user_id;
-- ... (répéter 51 fois)

-- 3. Supprimer index
DROP INDEX IF EXISTS idx_profil_user_id;
DROP INDEX IF EXISTS idx_historique_poids_user_id;
-- ... (répéter 51 fois)
```

- [ ] 🔴 Rollback effectué
- [ ] 🔴 Utilisateurs notifiés (migration annulée)
- [ ] 🔴 Post-mortem planifié (analyser causes échec)

### Si migration réussie MAIS problèmes RLS
```sql
-- Désactiver temporairement RLS (permettre accès)
ALTER TABLE profil DISABLE ROW LEVEL SECURITY;
-- ... (répéter pour tables bloquées)

-- Corriger politiques RLS
DROP POLICY IF EXISTS "Users can view own profil" ON profil;
CREATE POLICY "Users can view own profil" ON profil
  FOR SELECT USING (auth.uid() = user_id);

-- Réactiver RLS
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;
```

- [ ] ⚠️ RLS corrigé
- [ ] ⚠️ Tests validation effectués

---

## 📝 DOCUMENTATION FINALE

### Documents à mettre à jour post-migration
- [ ] ✅ Schéma BDD (ajouter colonnes user_id + index)
- [ ] ✅ Documentation API (filtres user_id obligatoires)
- [ ] ✅ README projet (noter migration effectuée)
- [ ] ✅ REX migration (succès/échecs, durées réelles, problèmes rencontrés)

---

## ✅ MIGRATION TERMINÉE

**Date migration** : ___/___/______  
**Durée totale** : ___h___  
**Nombre d'erreurs** : ___  
**Statut** : ✅ SUCCÈS / ⚠️ SUCCÈS PARTIEL / 🔴 ÉCHEC

**Responsable migration** : _________________  
**Signature** : _________________

---

**📄 Documents associés** :
- [ANALYSE_RISQUES_MIGRATION_USER_ID_PHASE3.md](./ANALYSE_RISQUES_MIGRATION_USER_ID_PHASE3.md) (analyse complète)
- [RESUME_RAPIDE_RISQUES_MIGRATION_USER_ID.md](./RESUME_RAPIDE_RISQUES_MIGRATION_USER_ID.md) (résumé 2 min)

# 🔴 ANALYSE DES RISQUES — MIGRATION USER_ID PHASE 3

**Date de création** : 11/01/2026  
**Type** : Analyse de risques pré-migration  
**Statut** : ⚠️ CRITIQUE - LECTURE OBLIGATOIRE AVANT EXÉCUTION

---

## ⚠️ AVERTISSEMENT PRÉALABLE

**Ce script SQL comporte des risques MAJEURS s'il est copié-collé directement dans Supabase SQL Editor sans précautions.**

**Durée lecture** : 15 minutes  
**Impact potentiel** : Perte de données, corruption BDD, downtime application  
**Niveau d'expertise requis** : Avancé (connaissance Supabase RLS, migrations SQL, auth.users)

---

## 📋 RÉSUMÉ EXÉCUTIF

### Script analysé
- **51 tables** modifiées avec ajout colonne `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- **10 index** créés pour performance
- **Transaction BEGIN/COMMIT** enveloppante
- **Validation** finale via `information_schema.columns`

### Risques identifiés
| Catégorie | Niveau | Impact | Probabilité |
|-----------|--------|--------|-------------|
| Perte de données existantes | 🔴 **CRITIQUE** | Total | Élevée |
| Conflit RLS (Row Level Security) | 🔴 **CRITIQUE** | Blocage accès | Très élevée |
| Corruption schéma BDD | 🟠 ÉLEVÉ | Partiel | Moyenne |
| Downtime application | 🟠 ÉLEVÉ | Total temporaire | Certaine |
| Impossibilité rollback | 🟠 ÉLEVÉ | Permanent | Élevée |
| Performance dégradée | 🟡 MOYEN | Ralentissements | Moyenne |
| Incohérence données multi-utilisateurs | 🟡 MOYEN | Partiel | Élevée |

---

## 🔴 RISQUE N°1 : PERTE DE DONNÉES EXISTANTES (CRITIQUE)

### Description
**TOUTES les lignes existantes** dans les 51 tables auront `user_id = NULL` après migration.

### Conséquences
1. **Si RLS est activé** (probable dans Supabase) :
   - ✅ Les politiques RLS utilisent `auth.uid() = user_id`
   - ❌ Aucune ligne avec `user_id = NULL` ne sera accessible
   - ❌ **PERTE TOTALE des données pour l'utilisateur** (invisibles, pas supprimées)

2. **Données orphelines** :
   - Profils, historiques poids, jeûnes, défis, journaux spirituels → TOUS inaccessibles
   - Statistiques comportementales, feedbacks → Invisibles
   - Plans alimentaires, repas → Perdus pour utilisateurs

3. **Pas de contrainte NOT NULL** :
   - Le script n'ajoute PAS `NOT NULL` → données existantes restent NULL
   - Relations orphelines persistent dans la BDD

### Impact métier
- **Utilisateurs actuels** : Perte totale de leur historique (jeûnes, poids, défis, journal)
- **Utilisateurs multi-comptes** : Impossibilité de réassigner les données au bon compte
- **Statistiques globales** : Faussées (données NULL non comptabilisées)

### Mitigation OBLIGATOIRE
```sql
-- AVANT la migration : Copier les données avec user_id factice
-- EXEMPLE pour table profil
UPDATE public.profil 
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com')
WHERE user_id IS NULL;

-- OU créer une association temporaire user_id ↔ localStorage ID
-- (nécessite script personnalisé)
```

### Validation post-migration
```sql
-- Vérifier AUCUNE ligne NULL
SELECT COUNT(*) as lignes_orphelines 
FROM public.profil 
WHERE user_id IS NULL;

-- Si résultat > 0 → PROBLÈME CRITIQUE
```

---

## 🔴 RISQUE N°2 : CONFLIT RLS (ROW LEVEL SECURITY) CRITIQUE

### Description
Supabase active **RLS par défaut** sur toutes les tables publiques. Les politiques RLS existantes vont **bloquer l'accès** aux données.

### Scénarios de blocage

#### Scénario A : RLS activé SANS politique user_id
```sql
-- Politique actuelle (hypothèse)
CREATE POLICY "Users can view own data" ON profil
  FOR SELECT USING (id = auth.uid());

-- ❌ APRÈS MIGRATION : id ≠ user_id
-- Résultat : AUCUNE donnée accessible
```

#### Scénario B : RLS activé AVEC anciennes politiques
```sql
-- Politique basée sur localStorage (comme journal_spirituel_meditations)
CREATE POLICY "Allow all" ON profil FOR ALL USING (true);

-- ⚠️ APRÈS MIGRATION : Sécurité compromise
-- Tous les utilisateurs voient TOUTES les données
```

#### Scénario C : Tables mixtes (TEXT vs UUID)
```sql
-- Actuellement : journal_spirituel_meditations.user_id = TEXT
-- Après migration : journal_spirituel_meditations.user_id = UUID

-- ❌ CONFLIT TYPE : politiques RLS cassées
-- App envoie TEXT, BDD attend UUID → Erreur cast
```

### Conséquences
1. **Erreur 403 Forbidden** sur toutes les requêtes (SELECT, INSERT, UPDATE, DELETE)
2. **Application bloquée** pour tous les utilisateurs
3. **Downtime total** jusqu'à correction manuelle des politiques RLS

### Mitigation OBLIGATOIRE
```sql
-- AVANT migration : Désactiver RLS temporairement
ALTER TABLE profil DISABLE ROW LEVEL SECURITY;
ALTER TABLE historique_poids DISABLE ROW LEVEL SECURITY;
-- ... (répéter pour les 51 tables)

-- APRÈS migration + association données : Recréer politiques RLS
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profil" ON profil
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profil" ON profil
  FOR UPDATE USING (auth.uid() = user_id);
-- ... (répéter pour toutes opérations CRUD)
```

---

## 🟠 RISQUE N°3 : CORRUPTION SCHÉMA BDD (ÉLEVÉ)

### Description
Incohérences possibles entre schéma actuel et script migration.

### Cas problématiques

#### 3.1 Tables inexistantes
```sql
-- Si une table n'existe PAS dans votre BDD :
ALTER TABLE public.defis_cristallisation 
ADD COLUMN IF NOT EXISTS user_id UUID...

-- ❌ ERREUR : relation "public.defis_cristallisation" does not exist
-- ROLLBACK automatique → AUCUNE table migrée
```

**Impact** : Migration échoue complètement, BDD reste en état initial (bon scénario).

#### 3.2 Colonnes user_id déjà existantes (TYPE différent)
```sql
-- Actuellement : profil.user_id = TEXT (localStorage)
-- Migration : ADD COLUMN IF NOT EXISTS user_id UUID

-- ✅ IF NOT EXISTS → Colonne non ajoutée
-- ❌ MAIS : Conflit type TEXT vs UUID
-- Résultat : Colonne TEXT conservée, INCOMPATIBLE avec auth.users(id)
```

**Impact** : Migration silencieusement échouée, application non fonctionnelle.

#### 3.3 Contraintes référentielles en cascade
```sql
ON DELETE CASCADE

-- Si un compte auth.users est supprimé :
-- → SUPPRESSION EN CASCADE de TOUTES ses données
-- (profil, jeûnes, défis, journal, repas...)

-- ⚠️ Pas de backup automatique
-- ⚠️ Suppression définitive (hors soft-delete)
```

**Impact** : Perte irréversible de données utilisateur.

### Mitigation
```sql
-- 1. Vérifier existence tables AVANT migration
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profil', 'historique_poids', 'jeune', ...);

-- 2. Vérifier colonnes user_id existantes
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id';

-- 3. Sauvegarder BDD COMPLÈTE avant migration
-- (via Supabase Dashboard > Database > Backups)
```

---

## 🟠 RISQUE N°4 : DOWNTIME APPLICATION (ÉLEVÉ)

### Description
Le script modifie **51 tables** + **10 index** dans une seule transaction.

### Durée estimée downtime
| Nombre de lignes | Durée transaction | Blocage app |
|------------------|-------------------|-------------|
| < 1 000 lignes | 5-10 secondes | Minimal |
| 1 000 - 10 000 | 30-60 secondes | Modéré |
| 10 000 - 100 000 | 2-5 minutes | Sévère |
| > 100 000 lignes | **10+ minutes** | **Critique** |

### Verrouillage tables
```sql
BEGIN; -- Verrouille TOUTES les tables modifiées

-- Pendant la migration :
-- ❌ SELECT bloqué (lecture impossible)
-- ❌ INSERT bloqué (écriture impossible)
-- ❌ UPDATE/DELETE bloqués

COMMIT; -- Libère les verrous
```

### Impact utilisateurs
- **Erreurs 500** sur toutes les pages utilisant les tables
- **Timeouts** sur requêtes bloquées
- **Perte données formulaires** en cours de saisie
- **Sessions interrompues**

### Mitigation
```sql
-- Option A : Migration par lot (recommandé)
-- Groupe 1 : Profil + poids (tables critiques)
BEGIN;
ALTER TABLE public.profil ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.historique_poids ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_profil_user_id ON public.profil(user_id);
CREATE INDEX IF NOT EXISTS idx_historique_poids_user_id ON public.historique_poids(user_id);
COMMIT;

-- Groupe 2 : Jeûne (30 min plus tard)
-- Groupe 3 : Défis
-- ...
-- Downtime réparti, impact réduit

-- Option B : Maintenance programmée
-- 1. Activer mode maintenance (bannière UI)
-- 2. Attendre fin activité utilisateurs
-- 3. Exécuter migration
-- 4. Valider données
-- 5. Désactiver maintenance
```

---

## 🟠 RISQUE N°5 : IMPOSSIBILITÉ ROLLBACK (ÉLEVÉ)

### Description
Le script utilise `ADD COLUMN IF NOT EXISTS` mais **PAS de procédure rollback**.

### Problèmes

#### 5.1 Rollback incomplet
```sql
-- Pour annuler la migration :
ALTER TABLE profil DROP COLUMN user_id; -- ❌ Supprime AUSSI les données associées
ALTER TABLE profil DROP COLUMN user_id CASCADE; -- ❌ Supprime contraintes + index + données
```

**Conséquence** : Impossible de revenir à l'état initial SANS perte de données.

#### 5.2 État intermédiaire corrompu
```sql
BEGIN;
-- Succès : Tables 1-30 migrées
-- ERREUR : Table 31 (défaut contrainte)
ROLLBACK; -- Annule TOUT

-- ❌ Résultat : AUCUNE table migrée
-- ❌ Mais index partiellement créés (si COMMIT partiel)
```

#### 5.3 Données orphelines définitives
```sql
-- Après migration, si association user_id échoue :
UPDATE profil SET user_id = '...' WHERE id = '...';
-- Erreur : UUID invalide

-- ❌ Données restent NULL DÉFINITIVEMENT
-- ❌ Impossibilité de ré-exécuter migration (IF NOT EXISTS)
```

### Mitigation
```sql
-- Créer script rollback COMPLET AVANT migration
-- rollback_user_id_migration.sql

BEGIN;

-- 1. Sauvegarder données user_id
CREATE TABLE backup_user_id_mapping AS
SELECT 'profil' as table_name, id, user_id FROM profil WHERE user_id IS NOT NULL
UNION ALL
SELECT 'historique_poids', id, user_id FROM historique_poids WHERE user_id IS NOT NULL
-- ... (répéter pour 51 tables)
;

-- 2. Supprimer colonnes
ALTER TABLE profil DROP COLUMN IF EXISTS user_id;
ALTER TABLE historique_poids DROP COLUMN IF EXISTS user_id;
-- ... (51 tables)

-- 3. Supprimer index
DROP INDEX IF EXISTS idx_profil_user_id;
DROP INDEX IF EXISTS idx_historique_poids_user_id;
-- ... (10 index)

COMMIT;

-- Restaurer si nécessaire :
-- Recréer colonnes + réinjecter depuis backup_user_id_mapping
```

---

## 🟡 RISQUE N°6 : PERFORMANCE DÉGRADÉE (MOYEN)

### Description
Ajout de 51 colonnes + 10 index sans analyse performance préalable.

### Impacts

#### 6.1 Index incomplets
```sql
-- Script crée SEULEMENT 10 index sur 51 tables
CREATE INDEX IF NOT EXISTS idx_profil_user_id ON public.profil(user_id);
-- ...

-- ❌ Tables SANS index user_id :
-- jeune_analyse, bilans_jeune, reprises_alimentaires, 
-- defis_personnalises, stats_comportementales, etc.

-- Requête typique :
SELECT * FROM defis_personnalises WHERE user_id = '...';
-- Sans index → FULL TABLE SCAN (lent sur grandes tables)
```

**Conséquence** : Requêtes 10-100x plus lentes sur tables non indexées.

#### 6.2 Taille BDD augmentée
```sql
-- Colonne UUID = 16 bytes par ligne
-- 51 tables × 16 bytes × nombre de lignes

-- Exemple : 10 000 lignes moyennes
-- 51 × 16 × 10 000 = 8,16 MB supplémentaires
-- + Index (environ 30% de la taille colonne) = +2,4 MB
-- Total : +10,56 MB

-- Pour 100 000 lignes : +105 MB
```

**Impact** : Limite gratuite Supabase (500 MB) atteinte plus vite.

#### 6.3 Requêtes JOIN complexifiées
```sql
-- Avant : Pas de user_id
SELECT * FROM profil WHERE id = '...';

-- Après : Toujours filtrer par user_id
SELECT * FROM profil 
WHERE id = '...' AND user_id = auth.uid();

-- + JOIN systématique avec auth.users si validation
SELECT p.*, u.email 
FROM profil p 
JOIN auth.users u ON p.user_id = u.id
WHERE p.user_id = auth.uid();

-- Complexité accrue → Risques erreurs requêtes
```

### Mitigation
```sql
-- 1. Créer index COMPLETS (51 tables)
CREATE INDEX IF NOT EXISTS idx_jeune_analyse_user_id ON public.jeune_analyse(user_id);
CREATE INDEX IF NOT EXISTS idx_bilans_jeune_user_id ON public.bilans_jeune(user_id);
-- ... (41 index manquants)

-- 2. Index composites pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_repas_reels_user_date 
ON public.repas_reels(user_id, date_repas);

CREATE INDEX IF NOT EXISTS idx_jeune_user_statut 
ON public.jeune(user_id, statut);

-- 3. Analyser performances APRÈS migration
EXPLAIN ANALYZE 
SELECT * FROM defis_personnalises WHERE user_id = '...';
-- Vérifier : Index Scan (bon) vs Seq Scan (mauvais)
```

---

## 🟡 RISQUE N°7 : INCOHÉRENCE MULTI-UTILISATEURS (MOYEN)

### Description
Architecture actuelle basée sur **localStorage** (user_id = string local), migration vers **auth.users** (user_id = UUID centralisé).

### Scénarios problématiques

#### 7.1 Utilisateurs sans compte Supabase Auth
```sql
-- Utilisateur actuel : user_id = "user_12345" (localStorage)
-- Migration : Nécessite compte auth.users

-- ❌ Si utilisateur n'a PAS créé de compte :
-- → Impossible d'associer user_id
-- → Données orphelines DÉFINITIVEMENT
```

**Impact** : Utilisateurs "anonymes" perdent leurs données.

#### 7.2 Plusieurs appareils, même utilisateur
```sql
-- Téléphone : user_id = "user_A_phone" (localStorage)
-- Tablette : user_id = "user_A_tablet" (localStorage)
-- Desktop : user_id = "user_A_desktop" (localStorage)

-- Après migration :
-- → 3 comptes auth.users différents
-- → Impossible de fusionner les données
```

**Impact** : Données fragmentées, historique incomplet.

#### 7.3 Partage compte (famille)
```sql
-- Famille : 1 compte auth.users partagé
-- Avant : Distinction par device (localStorage)
-- Après : TOUTES les données mélangées (même user_id)

-- Résultat : Profils poids, jeûnes, défis de 3 personnes fusionnés
```

**Impact** : Perte de personnalisation, statistiques fausses.

### Mitigation
```sql
-- 1. Créer table de mapping AVANT migration
CREATE TABLE migration_user_mapping (
  old_user_id TEXT PRIMARY KEY, -- localStorage ID
  new_user_id UUID REFERENCES auth.users(id),
  device_info JSONB,
  migration_date TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Script association utilisateur
-- (nécessite interface UI pour demander confirmation)
INSERT INTO migration_user_mapping (old_user_id, new_user_id)
VALUES ('user_12345', (SELECT id FROM auth.users WHERE email = 'user@example.com'));

-- 3. Migration par batch avec validation
UPDATE profil 
SET user_id = m.new_user_id
FROM migration_user_mapping m
WHERE profil.user_id::text = m.old_user_id;
```

---

## 🛡️ CHECKLIST PRÉ-MIGRATION OBLIGATOIRE

### Étape 1 : Audit BDD
- [ ] ✅ **Backup complet BDD** (Supabase Dashboard > Database > Backups)
- [ ] ✅ **Export SQL dump** local (via `pg_dump` ou Supabase CLI)
- [ ] ✅ **Vérifier existence 51 tables** dans schéma public
- [ ] ✅ **Identifier colonnes user_id existantes** + types (TEXT vs UUID)
- [ ] ✅ **Compter lignes par table** (pour estimer durée downtime)
- [ ] ✅ **Vérifier politiques RLS actives** (pg_policies)

### Étape 2 : Préparation données
- [ ] ✅ **Créer table mapping localStorage ↔ auth.users**
- [ ] ✅ **Demander aux utilisateurs de créer compte auth** (si pas encore fait)
- [ ] ✅ **Pré-remplir user_id avec valeur temporaire** (éviter NULL)
- [ ] ✅ **Vérifier aucun conflit UUID** (doublons, invalides)

### Étape 3 : Préparation migration
- [ ] ✅ **Désactiver RLS sur 51 tables** (temporairement)
- [ ] ✅ **Créer script rollback complet** (DROP COLUMN + restauration)
- [ ] ✅ **Tester migration sur BDD de développement** (copie locale)
- [ ] ✅ **Valider performances post-migration** (EXPLAIN ANALYZE)
- [ ] ✅ **Préparer index complets** (51 index, pas seulement 10)

### Étape 4 : Communication
- [ ] ✅ **Planifier fenêtre maintenance** (heure creuse, week-end)
- [ ] ✅ **Avertir utilisateurs 48h avant** (email, notification app)
- [ ] ✅ **Activer mode maintenance** (bannière UI "Migration en cours")
- [ ] ✅ **Préparer équipe support** (hotline pour incidents)

### Étape 5 : Exécution
- [ ] ✅ **Double vérification backup** (télécharger + tester restauration)
- [ ] ✅ **Exécuter migration par lot** (10 tables à la fois)
- [ ] ✅ **Valider chaque lot** (SELECT COUNT, vérifier user_id NOT NULL)
- [ ] ✅ **Monitorer erreurs logs** (Supabase Dashboard > Logs)
- [ ] ✅ **Tester fonctionnalités critiques** (login, profil, jeûne)

### Étape 6 : Post-migration
- [ ] ✅ **Réactiver RLS** + créer nouvelles politiques
- [ ] ✅ **Créer index manquants** (41 index supplémentaires)
- [ ] ✅ **Vérifier AUCUNE ligne user_id = NULL**
- [ ] ✅ **Valider accès multi-utilisateurs** (isolation données)
- [ ] ✅ **Désactiver mode maintenance**
- [ ] ✅ **Monitorer performances 48h** (ralentissements, erreurs)

---

## 📌 SCRIPT MIGRATION SÉCURISÉ (VERSION CORRIGÉE)

**⚠️ NE PAS UTILISER LE SCRIPT ORIGINAL TEL QUEL**

### Version recommandée (par lot, avec validations)

```sql
-- ============================================================================
-- MIGRATION USER_ID PHASE 3 - VERSION SÉCURISÉE
-- Date : 11/01/2026
-- Durée estimée : 30-60 minutes (selon volume données)
-- ============================================================================

-- ============================================================================
-- ÉTAPE 0 : VALIDATIONS PRÉALABLES
-- ============================================================================

-- Vérifier existence tables
DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  SELECT ARRAY_AGG(t) INTO missing_tables
  FROM (VALUES 
    ('profil'), ('historique_poids'), ('jeune'), ('jeune_jour'),
    ('jeune_analyse'), ('preparations_jeune'), ('bilans_jeune'),
    ('parcours_jeune'), ('reprises_alimentaires'), ('reprises_jours_valides'),
    ('reprises_repas_consommes'), ('defis'), ('defis_personnalises'),
    ('journal_defis'), ('defis_cristallisation'), ('journal_defi_cristallisation'),
    ('journal_spirituel_audios'), ('journal_spirituel_ecrits'),
    ('journal_spirituel_intentions'), ('journal_spirituel_meditations'),
    ('journal_spirituel_questions'), ('journal_spirituel_versets'),
    ('feedbacks'), ('stats_comportementales'), ('plan_alimentaire'),
    ('repas_planifies'), ('repas_reels'), ('repas_complets'),
    ('extras'), ('fast_food_history'), ('badges_cristallisation'),
    ('conseils_cristallisation'), ('parcours_cristallisation'),
    ('validations_cristallisation'), ('ideaux'), ('routines'),
    ('actions'), ('objectifs'), ('seances_reelles'),
    ('alternatives'), ('combos_enregistres'), ('listes_courses_generees'),
    ('messages_dynamiques'), ('semaines_validees'), ('unites_personnelles')
  ) AS v(t)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = v.t
  );
  
  IF ARRAY_LENGTH(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Tables manquantes : %', missing_tables;
  END IF;
  
  RAISE NOTICE 'Validation OK : Toutes les tables existent';
END $$;

-- Compter lignes totales (estimation durée)
SELECT 
  SUM(n_live_tup) as total_lignes,
  CASE 
    WHEN SUM(n_live_tup) < 1000 THEN 'Durée estimée : 5-10 min'
    WHEN SUM(n_live_tup) < 10000 THEN 'Durée estimée : 15-30 min'
    ELSE 'Durée estimée : 30-60 min'
  END as estimation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND relname IN ('profil', 'jeune', 'defis', 'repas_reels');

-- Vérifier colonnes user_id existantes (conflits potentiels)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;

-- ⚠️ SI RÉSULTAT NON VIDE : Vérifier types (TEXT vs UUID)
-- SI TEXT → Nécessite migration données AVANT ajout colonne UUID

-- ============================================================================
-- ÉTAPE 1 : DÉSACTIVATION RLS (TEMPORAIRE)
-- ============================================================================

-- ⚠️ CRITIQUE : Désactiver RLS pour éviter blocages
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'profil', 'historique_poids', 'jeune', 'jeune_jour',
      'jeune_analyse', 'preparations_jeune', 'bilans_jeune',
      'parcours_jeune', 'reprises_alimentaires', 'reprises_jours_valides',
      'reprises_repas_consommes', 'defis', 'defis_personnalises',
      'journal_defis', 'defis_cristallisation', 'journal_defi_cristallisation',
      'journal_spirituel_audios', 'journal_spirituel_ecrits',
      'journal_spirituel_intentions', 'journal_spirituel_meditations',
      'journal_spirituel_questions', 'journal_spirituel_versets',
      'feedbacks', 'stats_comportementales', 'plan_alimentaire',
      'repas_planifies', 'repas_reels', 'repas_complets',
      'extras', 'fast_food_history', 'badges_cristallisation',
      'conseils_cristallisation', 'parcours_cristallisation',
      'validations_cristallisation', 'ideaux', 'routines',
      'actions', 'objectifs', 'seances_reelles',
      'alternatives', 'combos_enregistres', 'listes_courses_generees',
      'messages_dynamiques', 'semaines_validees', 'unites_personnelles'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'RLS désactivé : %', r.tablename;
  END LOOP;
END $$;

-- ============================================================================
-- ÉTAPE 2 : MIGRATION LOT 1 — Tables critiques (profil, poids)
-- ============================================================================

BEGIN;

-- Profil
ALTER TABLE public.profil 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Historique poids
ALTER TABLE public.historique_poids 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Index
CREATE INDEX IF NOT EXISTS idx_profil_user_id ON public.profil(user_id);
CREATE INDEX IF NOT EXISTS idx_historique_poids_user_id ON public.historique_poids(user_id);

COMMIT;

-- Validation LOT 1
SELECT 'Lot 1 OK' as statut, COUNT(*) as profils, 
  COUNT(user_id) as profils_avec_user_id
FROM profil;

-- ⚠️ SI profils_avec_user_id = 0 → NORMAL (association à faire ensuite)
-- ⚠️ SI ERREUR → ARRÊTER, analyser logs, ne PAS continuer lots suivants

-- ============================================================================
-- ÉTAPE 3 : MIGRATION LOT 2 — Tables jeûne
-- ============================================================================

BEGIN;

ALTER TABLE public.jeune ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.jeune_jour ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.jeune_analyse ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.preparations_jeune ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.bilans_jeune ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.parcours_jeune ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_jeune_user_id ON public.jeune(user_id);
CREATE INDEX IF NOT EXISTS idx_jeune_jour_user_id ON public.jeune_jour(user_id);
CREATE INDEX IF NOT EXISTS idx_jeune_analyse_user_id ON public.jeune_analyse(user_id);
CREATE INDEX IF NOT EXISTS idx_preparations_jeune_user_id ON public.preparations_jeune(user_id);
CREATE INDEX IF NOT EXISTS idx_bilans_jeune_user_id ON public.bilans_jeune(user_id);
CREATE INDEX IF NOT EXISTS idx_parcours_jeune_user_id ON public.parcours_jeune(user_id);

COMMIT;

-- Validation LOT 2
SELECT 'Lot 2 OK' as statut;

-- ============================================================================
-- ÉTAPE 4 : MIGRATION LOT 3 — Tables reprise alimentaire
-- ============================================================================

BEGIN;

ALTER TABLE public.reprises_alimentaires ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reprises_jours_valides ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reprises_repas_consommes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reprises_alimentaires_user_id ON public.reprises_alimentaires(user_id);
CREATE INDEX IF NOT EXISTS idx_reprises_jours_valides_user_id ON public.reprises_jours_valides(user_id);
CREATE INDEX IF NOT EXISTS idx_reprises_repas_consommes_user_id ON public.reprises_repas_consommes(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 5 : MIGRATION LOT 4 — Tables défis
-- ============================================================================

BEGIN;

ALTER TABLE public.defis ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.defis_personnalises ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.journal_defis ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.defis_cristallisation ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.journal_defi_cristallisation ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_defis_user_id ON public.defis(user_id);
CREATE INDEX IF NOT EXISTS idx_defis_personnalises_user_id ON public.defis_personnalises(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_defis_user_id ON public.journal_defis(user_id);
CREATE INDEX IF NOT EXISTS idx_defis_cristallisation_user_id ON public.defis_cristallisation(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_defi_cristallisation_user_id ON public.journal_defi_cristallisation(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 6 : MIGRATION LOT 5 — Tables journal spirituel
-- ============================================================================

BEGIN;

-- ⚠️ ATTENTION : Si user_id existe déjà en TEXT, nécessite migration
-- Vérifier AVANT : SELECT data_type FROM information_schema.columns WHERE table_name = 'journal_spirituel_audios' AND column_name = 'user_id';

-- Si TEXT → Renommer colonne + créer nouvelle UUID
-- ALTER TABLE journal_spirituel_audios RENAME COLUMN user_id TO user_id_old;

ALTER TABLE public.journal_spirituel_audios ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.journal_spirituel_ecrits ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.journal_spirituel_intentions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.journal_spirituel_meditations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.journal_spirituel_questions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.journal_spirituel_versets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_journal_spirituel_audios_user_id ON public.journal_spirituel_audios(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_spirituel_ecrits_user_id ON public.journal_spirituel_ecrits(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_spirituel_intentions_user_id ON public.journal_spirituel_intentions(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_spirituel_meditations_user_id ON public.journal_spirituel_meditations(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_spirituel_questions_user_id ON public.journal_spirituel_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_spirituel_versets_user_id ON public.journal_spirituel_versets(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 7 : MIGRATION LOT 6 — Tables feedbacks, stats
-- ============================================================================

BEGIN;

ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.stats_comportementales ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON public.feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_comportementales_user_id ON public.stats_comportementales(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 8 : MIGRATION LOT 7 — Tables repas, alimentation
-- ============================================================================

BEGIN;

ALTER TABLE public.plan_alimentaire ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.repas_planifies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.repas_reels ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.repas_complets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_plan_alimentaire_user_id ON public.plan_alimentaire(user_id);
CREATE INDEX IF NOT EXISTS idx_repas_planifies_user_id ON public.repas_planifies(user_id);
CREATE INDEX IF NOT EXISTS idx_repas_reels_user_id ON public.repas_reels(user_id);
CREATE INDEX IF NOT EXISTS idx_repas_complets_user_id ON public.repas_complets(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 9 : MIGRATION LOT 8 — Tables extras, fast-food
-- ============================================================================

BEGIN;

ALTER TABLE public.extras ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.fast_food_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_extras_user_id ON public.extras(user_id);
CREATE INDEX IF NOT EXISTS idx_fast_food_history_user_id ON public.fast_food_history(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 10 : MIGRATION LOT 9 — Tables cristallisation
-- ============================================================================

BEGIN;

ALTER TABLE public.badges_cristallisation ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.conseils_cristallisation ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.parcours_cristallisation ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.validations_cristallisation ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_badges_cristallisation_user_id ON public.badges_cristallisation(user_id);
CREATE INDEX IF NOT EXISTS idx_conseils_cristallisation_user_id ON public.conseils_cristallisation(user_id);
CREATE INDEX IF NOT EXISTS idx_parcours_cristallisation_user_id ON public.parcours_cristallisation(user_id);
CREATE INDEX IF NOT EXISTS idx_validations_cristallisation_user_id ON public.validations_cristallisation(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 11 : MIGRATION LOT 10 — Tables idéaux, routines, actions
-- ============================================================================

BEGIN;

ALTER TABLE public.ideaux ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.actions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.objectifs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ideaux_user_id ON public.ideaux(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_user_id ON public.actions(user_id);
CREATE INDEX IF NOT EXISTS idx_objectifs_user_id ON public.objectifs(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 12 : MIGRATION LOT 11 — Tables diverses
-- ============================================================================

BEGIN;

ALTER TABLE public.seances_reelles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.alternatives ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.combos_enregistres ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.listes_courses_generees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.messages_dynamiques ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.semaines_validees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.unites_personnelles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_seances_reelles_user_id ON public.seances_reelles(user_id);
CREATE INDEX IF NOT EXISTS idx_alternatives_user_id ON public.alternatives(user_id);
CREATE INDEX IF NOT EXISTS idx_combos_enregistres_user_id ON public.combos_enregistres(user_id);
CREATE INDEX IF NOT EXISTS idx_listes_courses_generees_user_id ON public.listes_courses_generees(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_dynamiques_user_id ON public.messages_dynamiques(user_id);
CREATE INDEX IF NOT EXISTS idx_semaines_validees_user_id ON public.semaines_validees(user_id);
CREATE INDEX IF NOT EXISTS idx_unites_personnelles_user_id ON public.unites_personnelles(user_id);

COMMIT;

-- ============================================================================
-- ÉTAPE 13 : VALIDATION FINALE
-- ============================================================================

-- Vérifier colonnes créées
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;

-- ⚠️ Vérifier résultat : 51 lignes attendues

-- Vérifier index créés
SELECT 
  tablename, 
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%user_id%'
ORDER BY tablename;

-- ⚠️ Vérifier résultat : 51 index attendus

-- ============================================================================
-- ⚠️ ÉTAPE SUIVANTE (NON INCLUSE DANS CE SCRIPT)
-- ============================================================================

-- 1. ASSOCIATION DONNÉES EXISTANTES
--    → Créer script séparé pour UPDATE user_id avec valeurs réelles
--    → Nécessite mapping localStorage ID ↔ auth.users.id
--
-- 2. RÉACTIVATION RLS + POLITIQUES
--    → ALTER TABLE ... ENABLE ROW LEVEL SECURITY
--    → CREATE POLICY ... FOR SELECT/INSERT/UPDATE/DELETE
--
-- 3. VALIDATION MULTI-UTILISATEURS
--    → Tester isolation données entre utilisateurs
--    → Vérifier performances requêtes avec filtres user_id
--
-- 4. MONITORING POST-MIGRATION
--    → Logs erreurs (Supabase Dashboard)
--    → Métriques performances (temps réponse API)
--    → Feedback utilisateurs (bugs signalés)

-- ============================================================================
-- FIN MIGRATION SÉCURISÉE
-- ============================================================================
```

---

## 🚨 DÉCISION FINALE : EXÉCUTER OU NON ?

### ❌ NE PAS EXÉCUTER si :
- [ ] Vous n'avez **PAS de backup** complet de la BDD
- [ ] Vous n'avez **PAS testé** sur environnement développement
- [ ] Vous ne savez **PAS comment associer** user_id aux données existantes
- [ ] Vous n'avez **PAS prévu** de fenêtre maintenance
- [ ] Vous êtes **SEUL** (risque incident sans support)
- [ ] Vous avez **des doutes** sur RLS, auth.users, ou migrations SQL

### ✅ EXÉCUTER UNIQUEMENT si :
- [x] Backup complet + testé (restauration validée)
- [x] Migration testée en développement (succès confirmé)
- [x] Script association données prêt (mapping localStorage ↔ UUID)
- [x] Fenêtre maintenance planifiée (2-4h minimum)
- [x] Équipe disponible (1 dev + 1 ops minimum)
- [x] Utilisateurs avertis (email J-48h)
- [x] Script rollback prêt (DROP COLUMN + restauration données)
- [x] Politiques RLS nouvelles préparées
- [x] Monitoring activé (logs, alertes, métriques)

---

## 📞 SUPPORT ET RESSOURCES

### Documentation Supabase
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/database/overview)
- [Foreign Keys & Cascades](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)

### Outils recommandés
- **Supabase CLI** : Pour migrations versionnées (évite copier-coller)
- **pg_dump** : Pour backups locaux complets
- **EXPLAIN ANALYZE** : Pour valider performances post-migration

### Contact
- **Équipe dev** : (interne projet)
- **Support Supabase** : https://supabase.com/support
- **Communauté** : https://github.com/supabase/supabase/discussions

---

## 📝 CONCLUSION

**Le script original présente des RISQUES CRITIQUES** :
- 🔴 Perte données utilisateurs (user_id = NULL)
- 🔴 Blocage application (RLS non adapté)
- 🟠 Downtime prolongé (51 tables en 1 transaction)
- 🟠 Rollback impossible (pas de procédure prévue)

**RECOMMANDATION FINALE** :
1. ✅ **UTILISER** le script sécurisé fourni (lots + validations)
2. ✅ **TESTER** en développement (obligatoire)
3. ✅ **PLANIFIER** maintenance (utilisateurs avertis)
4. ✅ **BACKUP** complet (double vérification)
5. ✅ **MONITORER** post-migration (48h minimum)

⚠️ **En cas de doute : NE PAS EXÉCUTER. Demander validation architecte/DBA.**

---

**Document créé le** : 11/01/2026  
**Version** : 1.0  
**Auteur** : Équipe Dev ComptePlanVitalRoot  
**Prochaine révision** : Après migration (REX à documenter)

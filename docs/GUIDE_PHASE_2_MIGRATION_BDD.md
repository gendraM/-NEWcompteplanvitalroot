# 📘 GUIDE D'EXÉCUTION - PHASE 2 : Migration BDD

**Date :** 10 janvier 2026  
**Phase :** 2/5 - Ajout colonnes user_id  
**Durée estimée :** 5-10 minutes  
**Risque :** Très faible (colonnes nullables, aucune suppression)

---

## ✅ Pré-requis

- [ ] Phase 1 terminée et commitée
- [ ] Accès au Dashboard Supabase (https://supabase.com)
- [ ] Projet Supabase ouvert
- [ ] **IMPORTANT :** Ne pas s'être inscrit sur l'app

---

## 🎯 Objectif

Ajouter une colonne `user_id UUID` dans **toutes les tables utilisateur** pour préparer l'isolation des données.

**Ce qui va se passer :**
- ✅ Ajout de `user_id` dans ~45 tables
- ✅ Création d'index pour performance
- ✅ Aucune donnée supprimée
- ✅ Données existantes : `user_id = NULL` (temporaire)

---

## 📋 Instructions étape par étape

### Étape 1 : Ouvrir l'éditeur SQL Supabase

1. Va sur **https://supabase.com/dashboard**
2. Sélectionne ton projet
3. Dans le menu gauche, clique sur **"SQL Editor"**
4. Clique sur **"New query"**

### Étape 2 : Copier le script SQL

1. Ouvre le fichier : `scripts/01-add-user-id-columns.sql`
2. **Copie tout le contenu** (Ctrl+A puis Ctrl+C)
3. **Colle dans l'éditeur SQL** Supabase

### Étape 3 : Exécuter le script

1. **Lis rapidement le script** pour comprendre ce qu'il fait
2. Clique sur le bouton **"Run"** (ou Ctrl+Enter)
3. **Attends** que l'exécution se termine (10-30 secondes)

### Étape 4 : Vérifier le résultat

**Tu devrais voir en sortie :**

```
✅ Success. No rows returned

Puis un tableau avec ~45 lignes :
| table_name              | column_name | data_type | is_nullable |
|-------------------------|-------------|-----------|-------------|
| actions                 | user_id     | uuid      | YES         |
| alternatives            | user_id     | uuid      | YES         |
| badges_cristallisation  | user_id     | uuid      | YES         |
| ...                     | ...         | ...       | ...         |
```

**Si tu vois ce tableau → ✅ SUCCÈS !**

### Étape 5 : Vérification manuelle (optionnel)

Dans l'éditeur SQL, exécute :

```sql
-- Compte combien de tables ont user_id
SELECT COUNT(*) as nb_tables_migrees
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id';
```

**Résultat attendu :** ~45 tables

### Étape 6 : Vérifier que les données existantes sont intactes

Exécute :

```sql
-- Vérifie profil
SELECT COUNT(*) as nb_profils, 
       COUNT(user_id) as nb_avec_user_id
FROM public.profil;
```

**Résultat attendu :**
- `nb_profils` : 1 (ou plus si tu as créé plusieurs profils)
- `nb_avec_user_id` : 0 (normal à ce stade)

**Si `nb_profils` ≥ 1 et `nb_avec_user_id` = 0 → ✅ PARFAIT !**

---

## ⚠️ En cas d'erreur

### Erreur : "permission denied"
**Solution :** Tu n'as pas les droits admin sur Supabase
- Vérifie que c'est bien TON projet
- Assure-toi d'être le propriétaire du projet

### Erreur : "column user_id already exists"
**Solution :** Le script a déjà été exécuté
- Pas de problème, passe directement à la Phase 3
- Vérifie avec la requête de l'Étape 5

### Erreur : "relation does not exist"
**Solution :** Une table mentionnée n'existe pas
- C'est normal si tu n'utilises pas toutes les fonctionnalités
- Le script utilise `IF NOT EXISTS`, donc ça ne devrait pas bloquer
- Si le script s'arrête, commente les lignes concernées avec `--`

---

## 🎉 Validation Phase 2

**Checklist de validation :**

- [ ] Script SQL exécuté sans erreur
- [ ] Tableau de résultat affiche ~45 tables
- [ ] Colonne `user_id` de type `uuid` et `nullable = YES`
- [ ] Données existantes toujours présentes (vérification profil)
- [ ] `user_id` des données existantes = NULL (normal)

**Si toutes les cases cochées → Phase 2 VALIDÉE ✅**

---

## 🚀 Prochaine étape

**Phase 3 :** Inscription de ton compte utilisateur + association automatique de tes données

**⚠️ NE PAS s'inscrire avant d'avoir exécuté ce script SQL !**

Une fois la Phase 2 validée, reviens dans le chat pour lancer la Phase 3.

---

## 📊 Statistiques

**Tables migrées :** 45  
**Colonnes ajoutées :** 45  
**Index créés :** 10  
**Données perdues :** 0  
**Risque :** Très faible (rollback possible)

---

## 🔄 Rollback (si nécessaire)

Si tu veux annuler la migration :

```sql
-- Supprime toutes les colonnes user_id
-- ⚠️ À faire UNIQUEMENT si problème critique

BEGIN;

ALTER TABLE public.profil DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.historique_poids DROP COLUMN IF EXISTS user_id;
-- ... (répéter pour chaque table)

COMMIT;
```

**Note :** Le rollback complet est dans `scripts/99-rollback-phase-2.sql` (à créer si besoin)

---

**Date d'exécution :** ____ / ____ / ____  
**Heure :** ____ h ____  
**Statut :** ☐ Succès  ☐ Erreur  ☐ En cours

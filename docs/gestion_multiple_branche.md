# 🌿 GUIDE COMPLET : GESTION MULTIPLE BRANCHES GIT

**Date de création :** 3 décembre 2025  
**Contexte :** Collaboration entre gendraM et laurellebaylemankassa-create

---

## 📚 TABLE DES MATIÈRES

1. [Comprendre les concepts de base](#1-comprendre-les-concepts-de-base)
2. [Configuration initiale](#2-configuration-initiale)
3. [Workflow quotidien](#3-workflow-quotidien)
4. [Synchronisation entre comptes](#4-synchronisation-entre-comptes)
5. [Résolution de conflits](#5-résolution-de-conflits)
6. [Commandes de diagnostic](#6-commandes-de-diagnostic)
7. [Scénarios courants](#7-scénarios-courants)
8. [Aide-mémoire](#8-aide-mémoire)

---

## 1. COMPRENDRE LES CONCEPTS DE BASE

### 🎯 Qu'est-ce qu'une branche ?

Une **branche** est une ligne de développement indépendante qui permet de travailler sur des fonctionnalités sans affecter le code principal.

```
main                  ──●──●──●──●──●──  (branche principale)
                         ↓
AVANCEMENT-IDEAUX     ──●──●──●──●──●──  (branche de travail)
```

### 🌍 Qu'est-ce qu'un remote ?

Un **remote** est un dépôt distant (sur GitHub) auquel vous pouvez envoyer ou récupérer du code.

**Dans votre cas :**
```
origin   → https://github.com/gendraM/-NEWcompteplanvitalroot.git
laurelle → https://github.com/laurellebaylemankassa-create/-NEWcompteplanvitalroot.git
```

### 📊 Visualisation de votre setup

```
┌─────────────────────────────────────────────────────────────┐
│                    VOTRE ORDINATEUR                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Branche locale: AVANCEMENT-IDEAUX-/TBS-OBJECTIF   │     │
│  │ (Votre travail en cours)                           │     │
│  └────────────────────────────────────────────────────┘     │
│                           ↓↑                                 │
│                  git push / git pull                         │
│                           ↓↑                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
        ┌───────────────────┴────────────────────┐
        ↓                                        ↓
┌──────────────────┐                  ┌──────────────────┐
│  GITHUB gendraM  │                  │ GITHUB laurelle  │
│  (origin)        │ ← git fetch →    │  (remote)        │
│  - main          │   git merge      │  - main          │
│  - AVANCEMENT    │                  │                  │
└──────────────────┘                  └──────────────────┘
```

---

## 2. CONFIGURATION INITIALE

### ✅ Étape 1 : Vérifier la configuration actuelle

```bash
# Afficher tous les remotes configurés
git remote -v
```

**Résultat attendu :**
```
origin    https://github.com/gendraM/-NEWcompteplanvitalroot.git (fetch)
origin    https://github.com/gendraM/-NEWcompteplanvitalroot.git (push)
laurelle  https://github.com/laurellebaylemankassa-create/-NEWcompteplanvitalroot.git (fetch)
laurelle  https://github.com/laurellebaylemankassa-create/-NEWcompteplanvitalroot.git (push)
```

### ✅ Étape 2 : Ajouter un remote (si pas encore fait)

```bash
# Ajouter le dépôt de Laurelle comme remote
git remote add laurelle https://github.com/laurellebaylemankassa-create/-NEWcompteplanvitalroot.git
```

### ✅ Étape 3 : Vérifier les branches

```bash
# Voir toutes les branches (locales et distantes)
git branch -a
```

**Résultat typique :**
```
* AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS  ← Branche actuelle (*)
  main
  remotes/origin/AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS
  remotes/origin/main
  remotes/laurelle/main
```

---

## 3. WORKFLOW QUOTIDIEN

### 🔄 Workflow standard : Commit → Push → Fetch → Merge

```bash
# ═══════════════════════════════════════════════════════════
# ÉTAPE 1 : SAUVEGARDER VOTRE TRAVAIL LOCAL
# ═══════════════════════════════════════════════════════════

# 1. Voir les fichiers modifiés
git status

# 2. Ajouter les fichiers modifiés
git add .
# ou fichier par fichier :
git add docs/mon-fichier.md

# 3. Créer un commit avec un message clair
git commit -m "docs: Ajout guide gestion branches"

# 4. Envoyer sur VOTRE dépôt (origin)
git push origin AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS
# Raccourci si branche trackée :
git push


# ═══════════════════════════════════════════════════════════
# ÉTAPE 2 : RÉCUPÉRER LE TRAVAIL DE LAURELLE
# ═══════════════════════════════════════════════════════════

# 5. Télécharger les modifications de Laurelle (sans modifier votre code)
git fetch laurelle

# 6. Voir ce qui a changé chez Laurelle
git log HEAD..laurelle/main --oneline

# 7. Fusionner ses modifications dans votre branche
git merge laurelle/main

# 8. Si tout va bien, pousser le résultat
git push
```

### ⏱️ Timeline visuelle du workflow

```
Votre code local
    │
    │  1. git add + commit
    │  "Je sauvegarde mon travail"
    ↓
Branche locale propre
    │
    │  2. git push
    │  "J'envoie sur mon GitHub"
    ↓
GitHub gendraM (origin)
    ╱
   ╱  3. git fetch laurelle
  ╱   "Je télécharge les modifs de Laurelle"
 ╱
GitHub laurelle
    │
    │  4. git merge laurelle/main
    │  "Je fusionne ses modifs dans mon code"
    ↓
Code fusionné localement
    │
    │  5. git push
    │  "J'envoie le résultat sur mon GitHub"
    ↓
GitHub gendraM (à jour)
```

---

## 4. SYNCHRONISATION ENTRE COMPTES

### 📥 Scénario A : Récupérer les modifications de Laurelle

**Quand :** Laurelle a fait des commits sur `main`, vous voulez les intégrer dans votre branche `AVANCEMENT`.

```bash
# 1. Télécharger ses modifications
git fetch laurelle

# 2. Vérifier ce qui a changé
git log HEAD..laurelle/main --oneline

# 3. Si des commits apparaissent, les fusionner
git merge laurelle/main

# 4. Résoudre les conflits si nécessaire (voir section 5)

# 5. Pousser le résultat
git push
```

**Si aucun commit n'apparaît à l'étape 2 :** Vous êtes déjà à jour ! ✅

### 📤 Scénario B : Envoyer vos modifications à Laurelle

**Quand :** Vous avez fait des commits sur `AVANCEMENT`, Laurelle doit les récupérer.

#### Option 1 : Via Pull Request (RECOMMANDÉ)

1. **Aller sur GitHub** : https://github.com/gendraM/-NEWcompteplanvitalroot
2. **Cliquer sur "Pull requests"** → "New pull request"
3. **Configurer :**
   - Base : `main`
   - Compare : `AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS`
4. **Créer la Pull Request**
5. **Merger** après validation

#### Option 2 : Laurelle récupère directement

**Sur le compte de Laurelle :**
```bash
# 1. Ajouter votre dépôt comme remote (si pas fait)
git remote add gendra https://github.com/gendraM/-NEWcompteplanvitalroot.git

# 2. Télécharger vos modifications
git fetch gendra

# 3. Fusionner dans sa branche main
git checkout main
git merge gendra/AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS

# 4. Pousser
git push origin main
```

---

## 5. RÉSOLUTION DE CONFLITS

### 🚨 Qu'est-ce qu'un conflit ?

Un **conflit** survient quand Git ne peut pas fusionner automatiquement deux versions d'un même fichier.

**Exemple :**
```
Vous avez modifié :   ligne 10 → "Version A"
Laurelle a modifié :  ligne 10 → "Version B"
Git ne sait pas laquelle garder !
```

### 🛠️ Résoudre un conflit

```bash
# 1. Tenter le merge
git merge laurelle/main

# Git vous dit :
# CONFLICT (content): Merge conflict in pages/suivi.js
# Automatic merge failed; fix conflicts and then commit the result.

# 2. Voir les fichiers en conflit
git status

# 3. Ouvrir le fichier en conflit dans VS Code
# Chercher les marqueurs :

<<<<<<< HEAD
Votre version du code
=======
Version de Laurelle
>>>>>>> laurelle/main

# 4. Choisir la version à garder :
# - Garder VOTRE version : supprimer les marqueurs et la version de Laurelle
# - Garder SA version : supprimer les marqueurs et votre version
# - Garder LES DEUX : fusionner manuellement

# 5. Marquer comme résolu
git add pages/suivi.js

# 6. Finaliser le merge
git commit
# (Un message de commit sera pré-rempli)

# 7. Pousser
git push
```

### 💡 Astuce : Éviter les conflits

- ✅ Communiquer avec Laurelle sur qui modifie quoi
- ✅ Push/fetch régulièrement (au moins 1x par jour)
- ✅ Travailler sur des fichiers différents quand possible
- ✅ Faire des commits atomiques (petits et fréquents)

---

## 6. COMMANDES DE DIAGNOSTIC

### 🔍 Vérifier l'état actuel

```bash
# Où suis-je ? Qu'ai-je modifié ?
git status

# Sur quelle branche suis-je ?
git branch

# Quels sont mes remotes ?
git remote -v

# Afficher l'historique récent
git log --oneline -10

# Afficher l'historique graphique (toutes branches)
git log --all --oneline --graph --decorate -20
```

### 📊 Comparer les branches

```bash
# Voir les commits que Laurelle a et que je n'ai pas
git log HEAD..laurelle/main --oneline

# Voir les commits que j'ai et que Laurelle n'a pas
git log laurelle/main..HEAD --oneline

# Voir les fichiers qui ont changé entre deux branches
git diff laurelle/main..HEAD --name-only

# Voir les différences détaillées d'un fichier
git diff laurelle/main..HEAD -- pages/suivi.js
```

### 🔎 Trouver un commit ou un fichier

```bash
# Chercher un commit par message
git log --all --grep="audit"

# Chercher dans quel commit un fichier a été modifié
git log --all -- docs/AUDIT_REPRISE_ALIMENTAIRE_CONFORMITE.md

# Voir qui a modifié quelle ligne d'un fichier
git blame pages/suivi.js
```

---

## 7. SCÉNARIOS COURANTS

### 📌 Scénario 1 : "Je veux mettre à jour ma branche avec main"

**Situation :** Vous travaillez sur `AVANCEMENT`, mais `main` a évolué.

```bash
# Solution 1 : Merge (recommandé)
git fetch origin main
git merge origin/main

# Solution 2 : Rebase (historique plus propre, mais plus risqué)
git fetch origin main
git rebase origin/main
```

### 📌 Scénario 2 : "Je veux basculer sur main et récupérer mes commits"

**Situation :** Vous voulez que `main` contienne tout ce qui est dans `AVANCEMENT`.

```bash
# 1. Aller sur main
git checkout main

# 2. Récupérer les dernières modifications de main (origin)
git pull origin main

# 3. Fusionner votre branche AVANCEMENT dans main
git merge AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS

# 4. Pousser main mise à jour
git push origin main

# 5. Retourner sur votre branche de travail
git checkout AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS
```

### 📌 Scénario 3 : "Laurelle et moi avons modifié le même fichier"

**Situation :** Conflit détecté lors du merge.

```bash
# 1. Tenter le merge
git merge laurelle/main
# → CONFLICT détecté

# 2. Ouvrir VS Code et résoudre manuellement
# (Voir section 5)

# 3. Marquer comme résolu
git add <fichiers-résolus>

# 4. Finaliser
git commit

# 5. Pousser
git push
```

### 📌 Scénario 4 : "J'ai fait une erreur, je veux annuler"

#### Annuler le dernier commit (pas encore pushé)

```bash
# Garder les modifications mais annuler le commit
git reset --soft HEAD~1

# Annuler le commit ET les modifications
git reset --hard HEAD~1
```

#### Annuler un merge en cours

```bash
git merge --abort
```

#### Revenir à un état antérieur (déjà pushé)

```bash
# Créer un nouveau commit qui annule les changements
git revert <commit-hash>
```

---

## 8. AIDE-MÉMOIRE

### ✅ Commandes essentielles quotidiennes

```bash
# Sauvegarder votre travail
git add .
git commit -m "Description claire"
git push

# Récupérer le travail de Laurelle
git fetch laurelle
git merge laurelle/main
git push

# Vérifier l'état
git status
git log --oneline -5
```

### 📋 Checklist avant de quitter le travail

- [ ] `git status` → Rien à commiter (working tree clean)
- [ ] `git push` → Tout est envoyé sur GitHub
- [ ] `git fetch laurelle` → Vérifier si Laurelle a fait des changements
- [ ] Si oui : `git merge laurelle/main` puis `git push`

### 🆘 En cas de problème

```bash
# Voir où vous en êtes
git status
git log --oneline --graph --all -10

# Annuler un merge en cours
git merge --abort

# Revenir à l'état du dernier push
git reset --hard origin/AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS

# Demander de l'aide
git status  # Copier le résultat et demander à Copilot
```

---

## 🎓 GLOSSAIRE

| Terme | Définition |
|-------|------------|
| **Branch (Branche)** | Ligne de développement indépendante |
| **Remote** | Dépôt distant (sur GitHub) |
| **origin** | Nom par défaut du remote principal (votre dépôt) |
| **HEAD** | Pointeur vers votre position actuelle |
| **fetch** | Télécharger sans modifier votre code |
| **pull** | Télécharger + fusionner automatiquement |
| **push** | Envoyer vos commits vers GitHub |
| **merge** | Fusionner deux branches |
| **commit** | Snapshot (photo) de votre code à un instant T |
| **conflict** | Git ne peut pas fusionner automatiquement |
| **staging area** | Zone temporaire avant commit (git add) |

---

## 🔗 LIENS UTILES

- **GitHub de gendraM :** https://github.com/gendraM/-NEWcompteplanvitalroot
- **GitHub de Laurelle :** https://github.com/laurellebaylemankassa-create/-NEWcompteplanvitalroot
- **Documentation Git officielle :** https://git-scm.com/doc

---

## 📝 NOTES IMPORTANTES

### ⚠️ À NE JAMAIS FAIRE

❌ `git push --force` (sauf si vous savez vraiment ce que vous faites)  
❌ Modifier l'historique d'une branche partagée avec `rebase`  
❌ Commit des fichiers sensibles (mots de passe, clés API)  
❌ Travailler directement sur `main` sans branche

### ✅ BONNES PRATIQUES

✅ Commit + push au moins 1x par jour  
✅ Messages de commit clairs : `docs: Ajout guide`, `fix: Correction bug`  
✅ Fetch régulièrement pour voir les changements de Laurelle  
✅ Communiquer avant de modifier les mêmes fichiers  
✅ Faire des branches pour les grosses fonctionnalités

---

**Dernière mise à jour :** 3 décembre 2025  
**Auteur :** GitHub Copilot pour gendraM

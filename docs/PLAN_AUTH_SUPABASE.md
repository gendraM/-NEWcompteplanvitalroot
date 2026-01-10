# 🔐 PLAN D'IMPLÉMENTATION — AUTHENTIFICATION SUPABASE

**Date de création :** 10 janvier 2026  
**Branche :** `feature/authentification-supabase`  
**Objectif :** Sécuriser l'application avec authentification Supabase et isolation des données par utilisateur

**⚠️  AUCUNE modification de code ne sera produite tant que l'utilisateur n'a pas validé explicitement ce plan.**

---

## Titre de la tâche  
**Implémentation complète de l'authentification Supabase avec migration sécurisée des données existantes**

---

## **Description précise de la modification attendue**

### Contexte actuel
- L'application fonctionne **sans authentification**
- Tous les utilisateurs accèdent aux **mêmes données** (pas de user_id)
- Les tables Supabase n'ont **pas de Row Level Security (RLS)**
- Un utilisateur existant a déjà des données (profil, poids, jeûnes, etc.)

### Objectif final
1. **Authentification utilisateur** : login/signup avec Supabase Auth
2. **Isolation des données** : chaque utilisateur voit uniquement SES données
3. **Migration sécurisée** : les données existantes sont associées au premier utilisateur
4. **Protection RLS** : sécurité au niveau base de données
5. **Aucune perte de données** : préservation totale de l'existant

### Résultat attendu
- Nouvel utilisateur → crée un compte → voit une app vide
- Utilisateur existant → crée un compte → retrouve toutes ses données
- Isolation totale entre utilisateurs
- Sécurité garantie par RLS

---

## **Fichiers concernés**

### Nouveaux fichiers à créer
- `/contexts/AuthContext.js` - Gestion session utilisateur
- `/pages/login.js` - Page de connexion
- `/pages/signup.js` - Page d'inscription
- `/components/ProtectedRoute.js` - Protection des routes
- `/scripts/migrate-user-id.sql` - Ajout colonnes user_id
- `/scripts/migrate-existing-data.js` - Association données existantes
- `/scripts/setup-rls.sql` - Politiques Row Level Security
- `/docs/ANOMALIE_ROLLBACK_AUTH.md` - Traçabilité anomalies

### Fichiers à modifier
- `/pages/_app.js` - Wrapper AuthProvider
- `/pages/profil.js` - Filtrage par user_id
- `/pages/jeune.js` - Filtrage par user_id
- `/pages/preparation-jeune.js` - Filtrage par user_id
- `/pages/suivi-poids.js` - Filtrage par user_id (si existe)
- `/pages/index.js` - Redirection si non authentifié
- Tous les composants accédant à Supabase (~20-30 fichiers)

### Tables Supabase concernées (ajout user_id)
- `profil`
- `historique_poids`
- `jeune`
- `jeune_jour`
- `jeune_analyse`
- `preparations_jeune`
- `reprises_alimentaires`
- `reprises_jours_valides`
- `reprises_repas_consommes`
- `defis`
- `defis_personnalises`
- `journal_defis`
- `journal_spirituel_*` (6 tables)
- `feedbacks`
- `bilans_jeune`
- `seances_reelles`
- `extras`
- `fast_food_history`
- `plan_alimentaire`
- `repas_planifies`
- `repas_reels`
- Et toutes les autres tables publiques (~40 tables)

---

## **Étape 1 — Audit des risques préalable**

### 🔴 Risques critiques identifiés

#### 1. **Perte de données existantes**
- **Risque** : Migration incorrecte → données non associées au user_id
- **Impact** : Utilisateur perd son historique
- **Mitigation** : 
  - Backup complet avant toute modification
  - Script de migration testé localement d'abord
  - Rollback automatique si erreur

#### 2. **Coupure de service**
- **Risque** : Activation RLS trop tôt → blocage accès données
- **Impact** : App inutilisable
- **Mitigation** : 
  - RLS activée en DERNIER (après tous les filtres)
  - Phase de test sans RLS
  - Activation progressive table par table

#### 3. **Conflit hooks React**
- **Risque** : AuthContext mal placé → hooks appelés hors composant
- **Impact** : Runtime errors
- **Mitigation** : 
  - AuthContext en wrapper principal dans _app.js
  - useAuth() appelé uniquement dans composants fonctionnels
  - Tests de rendu SSR/CSR

#### 4. **Régression fonctionnelle**
- **Risque** : Modification des requêtes → perte de fonctionnalités
- **Impact** : Bugs sur pages existantes
- **Mitigation** : 
  - Ajout du filtre user_id SANS modifier la logique existante
  - Tests page par page après modification
  - Checklist de régression (voir Étape 4)

#### 5. **Problème SSR Next.js**
- **Risque** : Accès localStorage côté serveur → crash
- **Impact** : Page ne charge pas
- **Mitigation** : 
  - Vérification typeof window !== 'undefined'
  - Gestion session Supabase adaptée SSR
  - Tests avec npm run build + npm start

#### 6. **User_id NULL dans anciennes données**
- **Risque** : Données créées avant migration restent NULL
- **Impact** : Invisibles après activation RLS
- **Mitigation** : 
  - Script de vérification post-migration
  - Alerte si user_id NULL détecté
  - Procédure de correction documentée

#### 7. **Double authentification**
- **Risque** : Utilisateur crée 2 comptes par erreur
- **Impact** : Confusion, données fragmentées
- **Mitigation** : 
  - Message clair : "première connexion = création compte"
  - Email unique imposé par Supabase
  - Documentation utilisateur

---

## **Étape 2 — Sous-checklist à valider systématiquement**

### Pour chaque fichier modifié

#### Imports et dépendances
- [ ] `import { supabase } from '../lib/supabaseClient'` présent
- [ ] `import { useAuth } from '../contexts/AuthContext'` ajouté si nécessaire
- [ ] `import { useState, useEffect } from 'react'` vérifié
- [ ] Pas de double import

#### Hooks React (règles strictes)
- [ ] Tous les hooks déclarés **EN HAUT** du composant fonctionnel
- [ ] **JAMAIS** dans if, boucle, map, fonction imbriquée
- [ ] `const { user } = useAuth()` appelé avant tout useEffect
- [ ] Variables utilisées dans dépendances useEffect déclarées AVANT

#### Requêtes Supabase
- [ ] Ajout `.eq('user_id', user.id)` sur toutes les requêtes SELECT
- [ ] Ajout `user_id: user.id` dans tous les INSERT
- [ ] Gestion cas où `user` est null (chargement initial)
- [ ] Pas de régression sur filtres existants (date, type, etc.)

#### Gestion d'erreur
- [ ] Try/catch sur opérations async critiques
- [ ] Messages d'erreur utilisateur clairs
- [ ] Log console.error pour debug
- [ ] Rollback automatique si erreur SQL

#### Tests à réaliser
- [ ] Page charge sans erreur console
- [ ] Données affichées correctement
- [ ] Création/modification/suppression fonctionne
- [ ] Pas de données d'autres utilisateurs visibles

---

## **Étape 3 — Checklist stricte sécurité & qualité**

### Avant toute modification de code

- [ ] ✅ **Lecture complète du code concerné** (dépendances, hooks, variables, fonctions)
- [ ] ✅ **Backup Supabase créé** (export SQL complet)
- [ ] ✅ **Branche Git créée** (`feature/authentification-supabase`)
- [ ] ✅ **Consultation fichier anomalies** (si existe)
- [ ] ✅ **Tests locaux possibles** (environnement dev configuré)

### Règles hooks React (conformité stricte)

- [ ] ✅ Tous les hooks (useState, useEffect, useAuth) déclarés **uniquement en haut** du composant fonctionnel
- [ ] ✅ **Aucune variable d'état ou de hook utilisée avant sa déclaration**, y compris dans les dépendances d'autres hooks
- [ ] ✅ Séparation stricte : 
  1. Imports
  2. Déclaration composant
  3. Hooks (useState, useEffect, useAuth...)
  4. Variables calculées
  5. Handlers/fonctions
  6. Rendu JSX
- [ ] ✅ Pas de doublons ni de déclarations superflues
- [ ] ✅ Pas d'appel de hook dans if, boucle, map, fonction imbriquée

### Sécurité données

- [ ] ✅ Chaque requête Supabase filtre par user_id (sauf tables publiques référentielles)
- [ ] ✅ Vérification user !== null avant accès données
- [ ] ✅ Gestion état de chargement (loading) pendant auth
- [ ] ✅ Redirection vers login si non authentifié
- [ ] ✅ Protection routes sensibles avec ProtectedRoute

### Préservation de l'existant

- [ ] ✅ **Aucune suppression destructrice** de code fonctionnel
- [ ] ✅ Ajout du filtre user_id SANS modifier la logique métier
- [ ] ✅ Tests de régression sur toutes les fonctionnalités
- [ ] ✅ Pas de modification de structure de données (sauf ajout user_id)

### Qualité code

- [ ] ✅ Code lisible et commenté (sections clés)
- [ ] ✅ Gestion d'erreur systématique
- [ ] ✅ Messages utilisateur clairs (loading, erreur, succès)
- [ ] ✅ Console.log de debug retirés (sauf essentiels)
- [ ] ✅ Pas de warning ESLint critique

### Tests et validation

- [ ] ✅ Test compilation : `npm run build` sans erreur
- [ ] ✅ Test rendu SSR : page charge en production
- [ ] ✅ Test navigation : toutes les routes accessibles
- [ ] ✅ Test CRUD : création, lecture, modification, suppression
- [ ] ✅ Test multi-utilisateur : isolation données vérifiée
- [ ] ✅ Test cas limites : user null, session expirée, erreur réseau

### Documentation et traçabilité

- [ ] ✅ Mise à jour avancement à chaque étape
- [ ] ✅ Anomalie → rapport immédiat dans fichier dédié
- [ ] ✅ Rollback documenté si nécessaire
- [ ] ✅ Rapport AVANT/APRÈS généré
- [ ] ✅ Validation utilisateur obtenue

---

## **Étape 4 — Contrôles conformité à réaliser**

### 1. Consultation anomalies passées

**Action :** Vérifier si un fichier `docs/ANOMALIE_ROLLBACK.md` ou similaire existe

**Résultat :** 
- [ ] Fichier consulté
- [ ] Anomalies similaires identifiées : _____
- [ ] Checklist de prévention créée : _____

**Si aucun fichier :** Créer `docs/ANOMALIE_ROLLBACK_AUTH.md` pour traçabilité

### 2. Audit sécurité Supabase

- [ ] Vérifier que les clés Supabase sont dans `.env.local` (pas de commit)
- [ ] Confirmer que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est bien la clé anonyme
- [ ] S'assurer que les tables n'ont PAS de RLS activée AVANT la migration
- [ ] Documenter l'état actuel des politiques RLS (normalement aucune)

### 3. Tests de sauvegarde/restauration

- [ ] **Backup SQL complet** : Export depuis Supabase Dashboard
- [ ] Test de restauration sur projet Supabase de test (si possible)
- [ ] Vérification intégrité : nombre de lignes, structure, données sensibles

### 4. Checklist de régression (fonctionnalités à préserver)

#### Page profil.js
- [ ] Affichage dernier profil enregistré
- [ ] Modification profil existant
- [ ] Calcul besoin calorique
- [ ] Calcul routeur poids
- [ ] Progression vers objectif
- [ ] Boutons navigation (jeûne, préparation)

#### Page jeune.js
- [ ] Création nouveau jeûne
- [ ] Suivi jour par jour
- [ ] Historique jeûnes passés
- [ ] Validation jeûne
- [ ] Reprise alimentaire

#### Page preparation-jeune.js
- [ ] Checklist critères
- [ ] Validation critères
- [ ] Progression affichée
- [ ] Navigation entre périodes
- [ ] Sauvegarde état

#### Autres fonctionnalités critiques
- [ ] Historique poids (graphique, saisie)
- [ ] Défis personnalisés
- [ ] Journal spirituel (tous les onglets)
- [ ] Feedbacks
- [ ] Bilans
- [ ] Navigation générale

### 5. Tests multi-device et accessibilité

- [ ] Test mobile (responsive)
- [ ] Test desktop
- [ ] Test tablette
- [ ] Contraste et lisibilité
- [ ] Navigation clavier (formulaires login/signup)

### 6. Performance

- [ ] Temps de chargement initial (< 3s)
- [ ] Temps de requête Supabase (< 500ms)
- [ ] Pas de re-render infini (useEffect mal configuré)
- [ ] Optimisation images si modifiées

---

## **Étape 5 — Mise à jour de l'avancement**

### Statut actuel
- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé

### Avancement détaillé (à MAJ à chaque étape)

**Date** | **Étape** | **Progression** | **Commentaire**
---------|-----------|-----------------|----------------
10/01/2026 | Plan créé | 0% | Plan d'implémentation initial
___ | ___ | ___% | ___

### Progression par phase

1. **Infrastructure auth (contexte, pages)** : 0%
2. **Migration BDD (user_id)** : 0%
3. **Association données existantes** : 0%
4. **Filtrage pages (profil, jeune...)** : 0%
5. **Activation RLS** : 0%
6. **Tests finaux** : 0%

**Progression globale : 0%**

---

## **Étape 6 — Point de vigilance**

### Analyse fichier anomalies rollback

**Fichier consulté :** `docs/ANOMALIE_ROLLBACK.md` (à créer si inexistant)

**Anomalies passées similaires :**
- _Aucune référence trouvée (première implémentation auth)_

**Erreurs potentielles identifiées :**

1. **Hook appelé conditionnellement**
   - Symptôme : `useAuth()` dans un if
   - Solution : Toujours appeler en haut du composant, gérer null dans le rendu

2. **Variable utilisée avant déclaration dans dépendances useEffect**
   - Symptôme : `[user]` dans dépendances alors que `user` déclaré après
   - Solution : Déclarer `const { user } = useAuth()` AVANT le useEffect

3. **Accès localStorage côté serveur (SSR)**
   - Symptôme : `localStorage is not defined`
   - Solution : `if (typeof window !== 'undefined') { ... }`

4. **RLS activée avant filtres user_id**
   - Symptôme : Aucune donnée visible après activation RLS
   - Solution : Activer RLS en DERNIER, après tous les filtres

5. **Session Supabase non persistée**
   - Symptôme : Utilisateur déconnecté au rechargement
   - Solution : `supabase.auth.onAuthStateChange()` dans AuthContext

6. **Double requête au montage (useEffect sans dépendances)**
   - Symptôme : 2 appels API identiques
   - Solution : Dépendances correctes ou tableau vide `[]`

### Checklist de prévention spécifique

- [ ] Relecture manuelle de TOUS les hooks avant utilisation
- [ ] Vérification ordre déclaration vs utilisation (ligne par ligne)
- [ ] Test SSR : `npm run build && npm start`
- [ ] Test sans internet : gestion erreur réseau
- [ ] Test session expirée : comportement app
- [ ] Vérification user_id NULL : requête SQL avant activation RLS

---

## **Étape 7 — Proposition de rollback**

### Plan de rollback par phase

#### Phase 1 : Infrastructure auth (AuthContext, pages)
**Si erreur détectée :**
- Rollback Git : `git reset --hard HEAD~1`
- Suppression fichiers créés : AuthContext.js, login.js, signup.js
- Retour à l'état sans auth
- **Aucune donnée perdue** (pas encore de migration BDD)

**Trigger rollback :**
- Erreur compilation non résolue en 30 min
- Crash app au démarrage
- Problème SSR bloquant

#### Phase 2 : Migration BDD (ajout user_id)
**Si erreur détectée :**
- Restauration backup SQL Supabase
- Suppression colonnes user_id : `ALTER TABLE profil DROP COLUMN user_id;` (répéter pour chaque table)
- Rollback Git fichiers scripts
- **Données préservées** (colonnes ajoutées étaient nullables)

**Trigger rollback :**
- Erreur SQL irrésolue
- Corruption de données détectée
- Perte de lignes (count avant ≠ count après)

#### Phase 3 : Association données existantes
**Si erreur détectée :**
- **CRITIQUE** : Backup restauré immédiatement
- Vérification manuelle user_id assignés
- Script de correction si partiellement migré
- Rollback Git + restauration BDD

**Trigger rollback :**
- Données associées au mauvais user_id
- user_id restent NULL après script
- Perte de relation (ex: profil sans historique_poids)

#### Phase 4 : Filtrage pages
**Si erreur détectée :**
- Rollback fichier par fichier (git checkout pages/profil.js)
- Retour version sans filtre user_id
- **Données BDD intactes**
- App fonctionnelle sans isolation temporairement

**Trigger rollback :**
- Régression fonctionnelle (feature ne marche plus)
- Erreur runtime non résolue
- Perte de données affichées (filtre trop restrictif)

#### Phase 5 : Activation RLS
**Si erreur détectée :**
- **Désactivation RLS immédiate** : `ALTER TABLE profil DISABLE ROW LEVEL SECURITY;`
- Suppression politiques : `DROP POLICY IF EXISTS ...`
- Retour filtrage applicatif seulement
- **Aucune perte de données**

**Trigger rollback :**
- Données inaccessibles avec RLS activée
- Conflit politiques (accès refusé légitime)
- Performance dégradée (>5s requêtes)

### Documentation rollback

**Fichier :** `docs/ANOMALIE_ROLLBACK_AUTH.md`

**Format d'entrée :**
```
---
Date: [JJ/MM/AAAA HH:MM]
Phase: [1-5]
Anomalie: [Description]
Impact: [Critique/Majeur/Mineur]
Action: [Rollback effectué]
Fichiers concernés: [Liste]
État après rollback: [Fonctionnel/Dégradé]
Leçon: [Ce qu'on a appris]
---
```

**IMPORTANT :** Toujours ajouter À LA FIN du fichier, JAMAIS supprimer d'entrées

---

## **Étape 8 — Rapport Markdown Copilot**

### Rapport AVANT modification

#### Structure actuelle de l'application

**Authentification :**
- ❌ Aucun système d'authentification
- ❌ Pas de gestion de session
- ❌ Tous les utilisateurs accèdent aux mêmes données

**Fichiers existants :**
- `pages/_app.js` : Wrapper Next.js basique
- `pages/profil.js` : Gestion profil SANS filtre user
- `pages/jeune.js` : Gestion jeûnes SANS filtre user
- `lib/supabaseClient.js` : Client Supabase initialisé
- Aucun fichier d'auth

**Structure BDD Supabase :**
- ~40 tables publiques
- ❌ Aucune colonne `user_id`
- ❌ RLS non activée (Row Level Security)
- ✅ Données existantes intactes (utilisateur actuel)

**Requêtes type actuelle :**
```javascript
// Récupération profil (TOUS les profils accessibles)
const { data } = await supabase
  .from('profil')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(1)
// ⚠️ Aucun filtre user_id
```

**Hooks React :**
- ✅ Généralement bien placés (en haut des composants)
- ⚠️ Quelques useEffect à vérifier (dépendances)
- ❌ Pas de hook d'authentification

**Problèmes identifiés :**
1. Sécurité nulle : n'importe qui peut voir/modifier toutes les données
2. Pas d'isolation utilisateur
3. Impossible de déployer en production
4. Données partagées entre tous

---

### Rapport APRÈS modification (prévisionnel)

#### Structure finale de l'application

**Authentification :**
- ✅ AuthContext gérant la session Supabase
- ✅ Pages login.js et signup.js
- ✅ Hook `useAuth()` disponible partout
- ✅ Protection routes avec ProtectedRoute
- ✅ Gestion session persistante (localStorage + cookie)

**Nouveaux fichiers créés :**
```
contexts/
  AuthContext.js           (gestion session globale)

pages/
  login.js                 (connexion utilisateur)
  signup.js                (inscription)

components/
  ProtectedRoute.js        (HOC protection routes)

scripts/
  migrate-user-id.sql      (ajout colonnes user_id)
  migrate-existing-data.js (association données existantes)
  setup-rls.sql            (politiques sécurité)

docs/
  ANOMALIE_ROLLBACK_AUTH.md (traçabilité)
```

**Fichiers modifiés :**
```
pages/_app.js              (wrapper AuthProvider)
pages/profil.js            (+ filtre user_id)
pages/jeune.js             (+ filtre user_id)
pages/preparation-jeune.js (+ filtre user_id)
[... tous les autres]
```

**Structure BDD Supabase :**
- ✅ Colonne `user_id UUID` dans toutes les tables
- ✅ Contrainte FOREIGN KEY vers auth.users
- ✅ Index sur user_id (performance)
- ✅ Données existantes associées au premier utilisateur
- ✅ RLS activée avec politiques strictes

**Requêtes type après modification :**
```javascript
// Récupération profil (UNIQUEMENT l'utilisateur connecté)
const { user } = useAuth()
const { data } = await supabase
  .from('profil')
  .select('*')
  .eq('user_id', user.id)  // ← FILTRE AJOUTÉ
  .order('created_at', { ascending: false })
  .limit(1)
// ✅ Isolation garantie
```

**Hooks React :**
```javascript
// Ordre strict dans chaque composant
function MonComposant() {
  // 1. Hooks d'abord
  const { user, loading } = useAuth()
  const [data, setData] = useState(null)
  
  // 2. useEffect après
  useEffect(() => {
    if (user) {
      fetchData(user.id)
    }
  }, [user])
  
  // 3. Handlers ensuite
  const handleSubmit = () => { ... }
  
  // 4. Rendu en dernier
  if (loading) return <div>Chargement...</div>
  if (!user) return <Redirect to="/login" />
  return <div>...</div>
}
```

**Sécurité finale :**
1. ✅ Authentification obligatoire
2. ✅ Isolation complète par utilisateur
3. ✅ Protection RLS au niveau BDD
4. ✅ Filtre applicatif redondant (double sécurité)
5. ✅ Sessions sécurisées Supabase
6. ✅ Déployable en production

**Migration utilisateur existant :**
- ✅ Données préservées à 100%
- ✅ Associées au premier compte créé
- ✅ Historique complet intact
- ✅ Aucune perte fonctionnelle

**Nouveaux utilisateurs :**
- ✅ App vide (leur profil)
- ✅ Données isolées dès la création
- ✅ Aucune visibilité sur autres utilisateurs

---

## **Étape 9 — Validation explicite de l'utilisateur**

### Questions de validation

Avant de coder, confirme :

1. **Le plan global te convient ?**
   - [ ] Oui, on peut procéder
   - [ ] Non, j'ai des questions/modifications

2. **L'ordre des phases est bon ?**
   1. Infrastructure auth
   2. Migration BDD
   3. Association tes données
   4. Filtrage pages
   5. Activation RLS
   - [ ] Oui, cet ordre est logique
   - [ ] Non, je préfère un autre ordre

3. **Tu es d'accord pour créer un compte Supabase ?**
   - [ ] Oui, je créerai mon compte à la phase 3
   - [ ] Non, je veux tester autrement

4. **Le plan de rollback te rassure ?**
   - [ ] Oui, je comprends comment revenir en arrière
   - [ ] Non, j'ai besoin de précisions

5. **Temporalité :**
   - [ ] On fait tout d'un coup (2-3h)
   - [ ] On avance phase par phase avec validation entre chaque
   - [ ] Autre : _____

### Validation finale

**Date de validation :** _____________________

**Signature (commentaire) :** _____________________

**Modifications demandées avant de commencer :**
- _____________________

---

## 📊 Résumé exécutif

### Ce qui sera fait
✅ Authentification Supabase complète  
✅ Migration sécurisée de tes données  
✅ Isolation utilisateurs  
✅ Protection RLS  
✅ 0% perte de données  

### Ce qui NE sera PAS fait
❌ Modification de la logique métier  
❌ Changement d'UI (sauf pages login/signup)  
❌ Suppression de fonctionnalités  
❌ Modification structure données (sauf user_id)  

### Durée estimée
- Phase 1 (Infrastructure) : 45 min
- Phase 2 (Migration BDD) : 30 min
- Phase 3 (Association données) : 30 min
- Phase 4 (Filtrage pages) : 2h (20-30 fichiers)
- Phase 5 (RLS) : 45 min
- Tests finaux : 1h

**Total : ~5h30** (réparties comme tu veux)

### Prochaine action
Attente de ta validation pour commencer la Phase 1 🚀

---

**⚠️ Rappel : Aucune ligne de code ne sera écrite avant ta validation explicite de ce plan.**

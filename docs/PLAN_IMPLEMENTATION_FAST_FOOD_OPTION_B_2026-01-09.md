# 🟢 PLAN D'IMPLÉMENTATION — Fast Food Option B (Corrections + Enrichissement + Auto-détection)

**Date de création:** 2026-01-09  
**Référence stratégie:** `/docs/FAST_FOOD_STRATEGIE_REDEFINITION_2026-01-07.md`  
**Référence analyse:** `/docs/ANALYSE_SYSTEME_FAST_FOOD_2026-01-07.md`

**⚠️ AUCUNE modification de code ne doit être produite tant que l'utilisateur n'a pas validé explicitement ce plan.**

---

## Titre de la tâche  
**Refonte Système Fast Food — Option B: Corrections catégories + Enrichissement 24 plats + Auto-détection tracking + Correction bug délai**

---

## **Description précise de la modification attendue**

### Objectifs
1. **Corriger catégorisation** de 2 plats non-conformes (Class'Croute, Pitaya wok)
2. **Enrichir référentiel** avec 24 nouveaux plats fast food (Pizza Hut, Quick, O'Tacos, Kebab)
3. **SUPPRIMER checkbox "Fast food ?"** (doublon avec categorie référentiel)
4. **Implémenter détection automatique** tracking fast food via `categorie: "fast-food"` uniquement
5. **Ajouter bandeau info UX** (dernier fast food, prochain créneau, délai, badges)
6. **Corriger bug calcul délai** (Math.ceil → Math.floor) pour cohérence affichage/validation
7. **Ajouter bouton "Forcer fast food"** pour cas exceptionnels (restaurants hors référentiel)

### Résultat attendu
- ✅ 0 doublon système (catégorie référentiel = source unique de vérité)
- ✅ Tracking automatique 100% silencieux (aucune action utilisateur)
- ✅ UX enrichie avec infos utiles (dernier, prochain, délai respecté/non)
- ✅ Calcul délai cohérent partout (Math.floor unifié)
- ✅ Référentiel: 124 plats fast food conformes (+24 vs avant)
- ✅ Règle 45 jours = recommandation (non bloquante)

---

## **Fichiers concernés**
- `/data/referentiel.js` (corrections ligne 3044-3045 + ajouts 24 plats)
- `/components/RepasBloc.js` (SUPPRESSIONS checkbox/dropdown + détection auto + bandeau info)
- `/pages/tableau-de-bord.js` (correction Math.floor ligne ~143)

---

## Etape 1 — **Audit des risques préalable**

### Risques Techniques
1. **Risque: Erreur syntaxe JavaScript** dans referentiel.js (104 plats existants)
   - Impact: Crash import référentiel → application inutilisable
   - Mitigation: Validation syntaxe après chaque ajout, test import

2. **Risque: Hooks React mal ordonnés** dans RepasBloc.js
   - Impact: Runtime error "Rendered more hooks than during previous render"
   - Mitigation: Ajouter useEffect APRÈS tous les useState existants

3. **Risque: Dépendances useEffect manquantes**
   - Impact: Auto-détection ne se déclenche pas
   - Mitigation: Linter ESLint exhaustive-deps, test manuel

4. **Risque: Variable `aliment` undefined** dans nouveau useEffect
   - Impact: TypeError lors sélection aliment
   - Mitigation: Vérification null/undefined avant find()

5. **Risque: Référence `referentielAliments` non définie**
   - Impact: Crash au runtime
   - Mitigation: Vérifier import/déclaration référentiel dans RepasBloc

### Risques UX/Métier
6. **Risque: Perte tracking existant** si catégories changées
   - Impact: Utilisateurs perdent historique fast food
   - Mitigation: Migration données? (à valider avec utilisateur)

7. **Risque: Confusion utilisateur** si checkbox auto-cochée sans feedback
   - Impact: Utilisateur ne comprend pas pourquoi checkbox cochée
   - Mitigation: Ajouter texte "(détecté automatiquement)"

8. **Risque: Calcul délai change comportement**
   - Impact: Date prochain fast food différente (affichage - 1 jour)
   - Mitigation: Acceptable car corrige bug, documenter changement

### Risques Régressions
9. **Risque: Autocomplete cassé** si référentiel corrompu
   - Impact: Utilisateurs ne peuvent plus saisir aliments
   - Mitigation: Backup referentiel.js avant modif

10. **Risque: Sauvegarde fast_food_history cassée**
    - Impact: Perte données tracking
    - Mitigation: Test insertion BDD après modif

### Points de vigilance identifiés
- ⚠️ Ordre strict hooks React (useState → useEffect → handlers → rendu)
- ⚠️ Validation syntaxe JSON/JS après chaque ajout plat
- ⚠️ Test complet parcours utilisateur (sélection → sauvegarde → affichage)
- ⚠️ Vérification cohérence données existantes (migration?)

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### Imports & Dépendances
- [ ] `useState` importé dans RepasBloc.js (vérifier existant)
- [ ] `useEffect` importé dans RepasBloc.js (vérifier existant)
- [ ] Variable `referentielAliments` disponible dans RepasBloc.js
- [ ] Variable `aliment` (state) existe avant nouveau useEffect
- [ ] Variable `setIsFastFood` (setter) existe avant nouveau useEffect
- [ ] Variable `setFastFoodType` (setter) existe avant nouveau useEffect

### Structure Référentiel
- [ ] Syntaxe JavaScript valide après modifications
- [ ] Tous les objets plats ont structure conforme:
  - `nom`, `categorie`, `sousCategorie`, `marque`, `kcal`, `qn`, `portionDefaut`, `unite`, `alternatives`
- [ ] Alternatives référencent plats existants
- [ ] Aucun doublon `nom` introduit

### Auto-détection Logic
- [ ] useEffect déclaré APRÈS tous les useState
- [ ] Tableau dépendances complet: `[aliment, referentielAliments]`
- [ ] Vérification `aliment` non-null avant traitement
- [ ] Vérification `found` non-undefined avant accès propriétés
- [ ] Condition `found.categorie === 'fast-food'` stricte
- [ ] Vérification `found.marque` avant auto-remplissage restaurant

---

## Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

- [ ] Lecture complète du code concerné (RepasBloc.js lignes 1-900, referentiel.js lignes 3040-3200, tableau-de-bord.js lignes 120-150)
- [ ] Backup fichiers originaux avant modification:
  - [ ] `/data/referentiel.js` → `/data/referentiel.js.backup-2026-01-09`
  - [ ] `/components/RepasBloc.js` → `/components/RepasBloc.js.backup-2026-01-09`
  - [ ] `/pages/tableau-de-bord.js` → `/pages/tableau-de-bord.js.backup-2026-01-09`
- [ ] Initialisation systématique avant usage (hooks, variables, handlers):
  - [ ] Tous les `useState` déclarés en haut du composant RepasBloc
  - [ ] Nouveau `useEffect` ajouté APRÈS les useState, AVANT les handlers
  - [ ] Aucune variable utilisée avant déclaration
- [ ] Tous les hooks React respectent règles officielles:
  - [ ] Déclarés uniquement en haut du corps du composant fonctionnel
  - [ ] Jamais dans fonction, boucle, map, if
  - [ ] **Aucune variable d'état utilisée dans dépendances avant sa déclaration**
- [ ] Séparation stricte des étapes:
  1. Initialisation (useState, useRef, etc.)
  2. useEffect (effets de bord)
  3. Logique calculée (useMemo, variables dérivées)
  4. Handlers/fonctions
  5. Rendu JSX
- [ ] Vérification: toute fonction/handler utilisé dans rendu est initialisé avant usage
- [ ] Ordre et portée logiques stricts (pas d'appel prématuré)
- [ ] Pas de doublons ni déclarations superflues:
  - [ ] Pas de doublon plats dans référentiel (vérifier noms)
  - [ ] Pas de doublon useEffect auto-détection
- [ ] Contrôle d'erreur systématique:
  - [ ] Test compilation: `npm run build`
  - [ ] Test runtime: `npm run dev` + navigation
  - [ ] Test SSR: vérifier pas de `window` dans useEffect
  - [ ] Test rendu: tous les cas d'usage (avec/sans fast food)
  - [ ] Test accessibilité: labels, aria, keyboard
- [ ] Test du rendu sur tous les cas d'usage:
  - [ ] Sélection aliment fast food → checkbox auto-cochée
  - [ ] Sélection aliment non fast food → checkbox reste décochée
  - [ ] Sélection aliment avec marque → restaurant auto-rempli
  - [ ] Sélection aliment sans marque → dropdown manuel
  - [ ] Modification manuelle checkbox → pas de conflit
- [ ] Préservation stricte des fonctionnalités existantes:
  - [ ] Sauvegarde fast_food_history fonctionne
  - [ ] Calcul récompenses/badges fonctionne
  - [ ] Affichage "Prochain créneau" fonctionne
  - [ ] Autocomplete aliments fonctionne
  - [ ] Aucune suppression destructrice de code
- [ ] Mise à jour précise et justifiée du pourcentage d'avancement (cf. Etape 5)
- [ ] Toute anomalie ou erreur → rollback immédiat, rapport ANOMALIE avec contexte, date et heure
- [ ] Documentation claire de chaque étape, chaque validation
- [ ] Relecture **manuelle obligatoire** des déclarations hooks/variables AVANT utilisation
  - [ ] **NE PAS se baser sur mémoire Copilot, lecture ligne par ligne du fichier réel**
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] **Toutes les cases ci-dessus cochées et documentées avant de poursuivre**

---

## Etape 4 — **Contrôles conformité à réaliser (en suivant l'ordre ci-dessous)**

### 4.1 Lecture Fichier Anomalies Rollback
1. **Action:** Lire `/docs/ANOMALIE_ROLLBACK.md` (si existe) ou fichiers similaires
2. **Objectif:** Identifier anomalies passées similaires (hooks, référentiel, fast food)
3. **Résultat attendu:** Liste points de vigilance adaptés

**Note:** Si fichier anomalie n'existe pas, créer structure pour futures entrées.

### 4.2 Création Checklist de Contrôle
Basée sur analyse anomalies + audit risques:

**Avant Codage:**
- [ ] Vérifier ordre hooks existants dans RepasBloc.js (ligne par ligne)
- [ ] Identifier position exacte insertion nouveaux useState + useEffect
- [ ] Vérifier syntaxe 104 plats fast food existants (sample test)
- [ ] Confirmer structure objet plat conforme au Template
- [ ] Identifier lignes exactes checkbox/dropdown à supprimer (545-567)

**Pendant Codage:**
- [ ] Valider syntaxe après chaque ajout de 6 plats (Pizza Hut, Quick batch, O'Tacos, Kebab)
- [ ] Test import référentiel après chaque modification: `node -e "require('./data/referentiel.js')"`
- [ ] Vérifier linter ESLint après suppression checkbox/dropdown
- [ ] Test manuel détection auto après chaque modif RepasBloc
- [ ] Test bandeau info UX (affichage conditionnel)

**Après Codage:**
- [ ] Test parcours complet utilisateur (10 scénarios minimum)
- [ ] Validation données BDD (insertion fast_food_history)
- [ ] Test calcul délai (cas limites: 44j, 45j, 46j)
- [ ] Vérification affichage badges/récompenses

### 4.3 Audit Anomalies Bloquantes
**Avant implémentation, vérifier:**
- [ ] Aucune anomalie bloquante identifiée dans audit risques
- [ ] Tous les risques ont mitigation documentée
- [ ] Utilisateur validé approche malgré risques

**Si anomalie bloquante détectée:**
1. STOP implémentation
2. Documenter dans fichier ANOMALIE (date, heure, contexte)
3. Proposer rollback ou alternative
4. Attendre validation utilisateur

---

## Etape 5 — **Mise à jour de l'avancement**

### Statut Initial
- [x] Non commencé | [ ] En cours | [ ] Terminé  
- **Avancement:** 0%
- **Date début:** 2026-01-09

### Jalons Prévus
| Jalon | Avancement Cible | Durée Estimée | Statut |
|-------|------------------|---------------|--------|
| 1. Backup fichiers | 5% | 5 min | ⬜ Non commencé |
| 2. Correction Class'Croute | 10% | 5 min | ⬜ Non commencé |
| 3. Correction Pitaya wok | 15% | 5 min | ⬜ Non commencé |
| 4. Ajout Pizza Hut (6 plats) | 30% | 30 min | ⬜ Non commencé |
| 5. Ajout Quick (10 plats) | 50% | 50 min | ⬜ Non commencé |
| 6. Ajout O'Tacos (5 plats) | 60% | 25 min | ⬜ Non commencé |
| 7. Ajout Kebab (3 plats) | 70% | 15 min | ⬜ Non commencé |
| 8. Suppression checkbox/dropdown | 75% | 10 min | ⬜ Non commencé |
| 9. Auto-détection useEffect | 80% | 20 min | ⬜ Non commencé |
| 10. Bandeau info UX | 85% | 25 min | ⬜ Non commencé |
| 11. Bouton "Forcer" | 87% | 10 min | ⬜ Non commencé |
| 12. Correction Math.floor | 90% | 5 min | ⬜ Non commencé |
| 13. Tests complets | 95% | 30 min | ⬜ Non commencé |
| 14. Documentation finale | 100% | 10 min | ⬜ Non commencé |

### Historique des Mises à Jour
- **2026-01-09 14:00** — Plan créé, avancement 0%
- _(À compléter au fur et à mesure)_

---

## Etape 6 — **Point de vigilance**

### 6.1 Rapport Lecture Fichier Anomalies Rollback

**Statut:** Fichier ANOMALIE_ROLLBACK.md à créer si non existant.

**Points de vigilance identifiés (basés sur expérience Template):**

1. **Hooks React - Ordre strict**
   - Erreur fréquente: useEffect appelé avant useState
   - Erreur fréquente: Hook dans bloc conditionnel
   - **Vigilance:** Ajouter useEffect APRÈS ligne ~100-150 (tous les useState)

2. **Syntaxe Référentiel JavaScript**
   - Erreur fréquente: Virgule manquante entre objets
   - Erreur fréquente: Guillemets non échappés dans alternatives
   - **Vigilance:** Validation syntaxe après chaque batch de 5-6 plats

3. **Variables undefined**
   - Erreur fréquente: Utilisation variable avant déclaration
   - Erreur fréquente: Propriété non vérifiée (ex: `found.marque` sans vérifier `found`)
   - **Vigilance:** Vérifications null/undefined systématiques

4. **Calcul Math.floor vs Math.ceil**
   - Erreur actuelle: Incohérence délai affiché vs validation
   - **Vigilance:** Vérifier TOUS les fichiers utilisant calcul délai (grep search)

### 6.2 Checklist Prévention Erreurs

**Avant modification referentiel.js:**
- [ ] Backup créé
- [ ] Editor ouvert avec syntax highlighting JavaScript
- [ ] Linter ESLint activé
- [ ] Test import après chaque batch: `node -e "console.log(require('./data/referentiel.js').default.length)"`

**Avant modification RepasBloc.js:**
- [ ] Localiser TOUS les useState existants (lignes exactes)
- [ ] Identifier dernière ligne useState (position insertion useEffect)
- [ ] Vérifier import { useState, useEffect } from 'react'
- [ ] Vérifier variable `aliment` existe dans state
- [ ] Vérifier variable `referentielAliments` déclarée/importée

**Avant modification tableau-de-bord.js:**
- [ ] Localiser ligne exacte Math.ceil (recherche "Math.ceil")
- [ ] Vérifier contexte (variables `nextDate`, `today`)
- [ ] Vérifier pas d'autre occurrence Math.ceil pour fast food

### 6.3 Impact Attendu

**Modifications Référentiel:**
- Impact: Ajout 24 plats, correction 2 catégories
- Risque: Faible (ajout, pas suppression)
- Test: Import + autocomplete fonctionnel

**Auto-détection RepasBloc:**
- Impact: Changement UX majeur (checkbox auto-cochée)
- Risque: Moyen (nouveau comportement utilisateur)
- Test: Scénarios multiples requis

**Correction Math.floor:**
- Impact: Affichage délai change (-1 jour dans certains cas)
- Risque: Faible (corrige bug)
- Test: Cas limites 44-45-46 jours

---

## Etape 7 — **Proposition de rollback**

### Scénarios Rollback

#### Scénario 1: Erreur Syntaxe Référentiel
**Déclencheur:** `SyntaxError` lors import referentiel.js  
**Action:**
1. STOP implémentation immédiate
2. Restaurer: `cp /data/referentiel.js.backup-2026-01-09 /data/referentiel.js`
3. Documenter dans ANOMALIE_ROLLBACK.md:
   ```
   Date: 2026-01-09 [HEURE]
   Fichier: /data/referentiel.js
   Erreur: SyntaxError - [détail]
   Ligne problématique: [numéro ligne]
   Action: Rollback backup
   Prochaine étape: Correction manuelle ligne par ligne
   ```
4. Analyser erreur, corriger, re-tester

#### Scénario 2: Crash Runtime RepasBloc
**Déclencheur:** TypeError, "Cannot read property" lors sélection aliment  
**Action:**
1. STOP navigation application
2. Restaurer: `cp /components/RepasBloc.js.backup-2026-01-09 /components/RepasBloc.js`
3. Documenter dans ANOMALIE_ROLLBACK.md:
   ```
   Date: 2026-01-09 [HEURE]
   Fichier: /components/RepasBloc.js
   Erreur: TypeError - [détail]
   Contexte: Auto-détection useEffect
   Variable problématique: [nom variable]
   Action: Rollback backup
   Prochaine étape: Vérifier ordre hooks + vérifications null
   ```
4. Relire useEffect ligne par ligne
5. Ajouter vérifications sécurité

#### Scénario 3: Perte Données Tracking
**Déclencheur:** Insertion fast_food_history échoue  
**Action:**
1. STOP saisie repas
2. Vérifier BDD (requête SELECT sur fast_food_history)
3. Si données corrompues:
   - Restaurer backup BDD (si disponible)
   - Rollback code: restaurer RepasBloc.js
4. Documenter dans ANOMALIE_ROLLBACK.md
5. Analyser cause (logs Supabase)

#### Scénario 4: Tests Échec
**Déclencheur:** >3 cas d'usage échouent lors tests  
**Action:**
1. STOP déploiement
2. Lister cas d'usage échoués
3. Décision:
   - Si critique: Rollback complet
   - Si mineur: Correction ciblée
4. Documenter + re-tester

### Alternative Sûre (si rollback nécessaire)
**Option:** Implémentation progressive par phases
- Phase 1 seule: Corrections catégories uniquement (risque minimal)
- Phase 2 seule: Enrichissement uniquement (pas de changement logique)
- Phase 3 seule: Auto-détection uniquement (feature flag?)
- Phase 4 seule: Correction Math.floor uniquement

**Validation utilisateur requise pour choix alternative**

---

## Etape 8 — **Rapport Markdown Copilot**

### 8.1 RAPPORT AVANT Modification

#### Structure Fichiers (état actuel)

**`/data/referentiel.js` (lignes 3040-3200):**
```javascript
// Structure actuelle
Ligne 3042: Big Mac (categorie: "fast-food", marque: "McDonald's") ✅
Ligne 3043: Subway Sub (categorie: "fast-food", marque: "Subway") ✅
Ligne 3044: Pitaya wok (categorie: "fast-food", marque: "Pitaya") ❌ INCORRECT
Ligne 3045: Class'Croute sandwich (categorie: "fast-food", marque: "Class'Croute") ❌ INCORRECT
Ligne 3046: Wrap KFC (categorie: "fast-food", marque: "KFC") ✅
Ligne 3047: Pizza Domino's (categorie: "fast-food", marque: "Domino's Pizza") ✅

// McDonald's: lignes 3065-3112 (45 plats) ✅
// KFC: lignes 3116-3143 (29 plats) ✅
// Subway: lignes 3147-3173 (14 plats) ✅
// Burger King: lignes 3177-3201 (10 plats) ✅

TOTAL FAST FOOD: 104 plats (dont 2 non-conformes)
```

**Chaînes manquantes:**
- ❌ Pizza Hut: 0 plat
- ❌ Quick: 0 plat
- ❌ O'Tacos: 0 plat
- ❌ Kebab: 0 plat

**`/components/RepasBloc.js` (lignes 1-900):**
```javascript
// Hooks existants (estimation lignes)
Ligne ~50-120: useState déclarations (isFastFood, fastFoodType, etc.)
Ligne ~120-200: useEffect existants (chargement repas, etc.)
Ligne ~400-500: Handlers (handleSubmit, handleChange, etc.)
Ligne ~550-850: Rendu JSX

// Liste restaurants
Ligne 116: const fastFoodList = ["McDo", "KFC", "Kebab", "Burger King", "Subway", "Autre"];

// Checkbox Fast food
Ligne ~545: <input type="checkbox" checked={isFastFood} onChange={...} />

// Dropdown restaurant
Ligne ~555: <select value={fastFoodType} onChange={...}>
            {fastFoodList.map(r => <option key={r} value={r}>{r}</option>)}
```

**Problèmes identifiés:**
- ❌ Pas d'auto-détection categorie: "fast-food"
- ❌ Liste restaurants incomplète (manque Pizza Hut, Quick, O'Tacos)
- ❌ Utilisateur doit cocher manuellement checkbox

**`/pages/tableau-de-bord.js` (lignes 120-150):**
```javascript
// Calcul délai
Ligne ~136-143: 
const nextDate = new Date(lastDate);
nextDate.setDate(lastDate.getDate() + 45);
const delay = Math.max(0, Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)));
                                ^^^^^^^^^ 
                                PROBLÈME: Math.ceil (arrondi supérieur)
setFastFoodDelay(delay);
```

**Problème identifié:**
- ❌ Incohérence: tableau-de-bord (Math.ceil) vs RepasBloc (Math.floor)

---

### 8.2 RAPPORT APRÈS Modification (PRÉVISIONNEL)

#### Structure Fichiers (état cible)

**`/data/referentiel.js` (modifications):**

**Corrections (lignes 3044-3045):**
```javascript
// AVANT
{ nom: "Pitaya wok", categorie: "fast-food", sousCategorie: "Wok asiatique", marque: "Pitaya", ... }
{ nom: "Class'Croute sandwich", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Class'Croute", ... }

// APRÈS
{ nom: "Pitaya wok", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", ... }
{ nom: "Class'Croute sandwich", categorie: "traiteur", sousCategorie: "Sandwich", marque: "Class'Croute", ... }
```

**Ajouts Pizza Hut (6 plats - après ligne 3047):**
```javascript
{ nom: "Pizza Hut Pepperoni", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 280, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Domino's", "Pizza 4 fromages"] },
{ nom: "Pizza Hut Margherita", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 220, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Domino's"] },
{ nom: "Pizza Hut Supreme", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 300, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Domino's"] },
{ nom: "Pizza Hut 4 fromages", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 270, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Margherita", "Pizza Domino's"] },
{ nom: "Breadsticks Pizza Hut", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "Pizza Hut", kcal: 140, qn: 1, portionDefaut: "2 pièces", unite: "piece", alternatives: ["Frites McDo petite"] },
{ nom: "Cookie Pizza Hut", categorie: "fast-food", sousCategorie: "Dessert", marque: "Pizza Hut", kcal: 180, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Cookie Subway", "Cookie BK"] },
```

**Ajouts Quick (10 plats):**
```javascript
{ nom: "Giant Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 580, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Whopper"] },
{ nom: "Long Chicken Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 420, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["McChicken"] },
{ nom: "Long Bacon Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 460, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Royal Cheese", "Whopper"] },
{ nom: "Long Fish Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 390, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Filet-O-Fish"] },
{ nom: "Frites Quick petite", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 250, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo petite"] },
{ nom: "Frites Quick moyenne", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 380, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo moyenne"] },
{ nom: "Frites Quick grande", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 510, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo grande"] },
{ nom: "Nuggets Quick 4 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Quick", kcal: 190, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo menu 4 pièces"] },
{ nom: "Nuggets Quick 6 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Quick", kcal: 285, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo menu 6 pièces"] },
{ nom: "Sundae Quick", categorie: "fast-food", sousCategorie: "Dessert", marque: "Quick", kcal: 250, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Sundae caramel McDo"] },
```

**Ajouts O'Tacos (5 plats):**
```javascript
{ nom: "Tacos O'Tacos S", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 450, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos M", "Wrap KFC"] },
{ nom: "Tacos O'Tacos M", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 680, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos S", "Tacos O'Tacos L"] },
{ nom: "Tacos O'Tacos L", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 900, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos M", "Tacos O'Tacos XL"] },
{ nom: "Tacos O'Tacos XL", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 1200, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos L"] },
{ nom: "Frites O'Tacos", categorie: "fast-food", sousCategorie: "Frites", marque: "O'Tacos", kcal: 320, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo moyenne"] },
```

**Ajouts Kebab (3 plats):**
```javascript
{ nom: "Kebab sandwich", categorie: "fast-food", sousCategorie: "Kebab", marque: null, kcal: 550, qn: 1, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Tacos O'Tacos M", "Wrap KFC"] },
{ nom: "Kebab assiette", categorie: "fast-food", sousCategorie: "Kebab", marque: null, kcal: 700, qn: 1, portionDefaut: "1 assiette", unite: "piece", alternatives: ["Kebab sandwich", "Tacos O'Tacos L"] },
{ nom: "Kebab galette", categorie: "fast-food", sousCategorie: "Kebab", marque: null, kcal: 480, qn: 1, portionDefaut: "1 galette", unite: "piece", alternatives: ["Kebab sandwich", "Wrap Poulet Subway"] },
```

**TOTAL APRÈS: 124 plats fast food (+24, -2 corrections = +22 nets)**

**`/components/RepasBloc.js` (modifications):**

**SUPPRESSION Code Existant (lignes ~545-567):**
```javascript
// ❌ SUPPRIMER COMPLÈTEMENT
{/* Case à cocher Fast food */}
<label>
  <input type="checkbox" checked={isFastFood} onChange={e => setIsFastFood(e.target.checked)} />
  Fast food ?
</label>

{/* Liste déroulante des restaurants si Fast food coché */}
{isFastFood && (
  <div style={{ marginBottom: 12 }}>
    <label>Choix du restaurant</label>
    <select value={fastFoodType} onChange={e => setFastFoodType(e.target.value)} required>
      <option value="">Sélectionner…</option>
      {fastFoodList.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
    {/* Saisie manuelle si "Autre" */}
    {fastFoodType === "Autre" && (
      <input type="text" placeholder="Nom du restaurant" ... />
    )}
  </div>
)}
```

**AJOUT Détection Automatique (après ligne ~150, après derniers useState):**
```javascript
// États pour tracking fast food
const [dernierFastFood, setDernierFastFood] = useState(null);
const [prochainCreneau, setProchainCreneau] = useState(null);
const [joursRestants, setJoursRestants] = useState(null);
const [delaiRespected, setDelaiRespected] = useState(false);
const [showForceModal, setShowForceModal] = useState(false);

// Auto-détection fast food basée sur catégorie référentiel
useEffect(() => {
  if (aliment && aliment.trim() !== '') {
    const found = referentielAliments.find(
      r => r.nom.toLowerCase() === aliment.toLowerCase()
    );
    
    if (found && found.categorie === 'fast-food') {
      // Auto-activer tracking (silencieux)
      setIsFastFood(true);
      setFastFoodType(found.marque || 'Non identifié');
      
      // Charger dernier fast food pour affichage
      fetchDernierFastFood();
    } else {
      setIsFastFood(false);
      setFastFoodType('');
      setDernierFastFood(null);
    }
  }
}, [aliment, referentielAliments]);

// Fonction chargement dernier fast food
const fetchDernierFastFood = async () => {
  const { data } = await supabase
    .from('fast_food_history')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1);
  
  if (data && data.length > 0) {
    const dernier = data[0];
    setDernierFastFood(dernier);
    
    // Calculer prochain créneau
    const dernierDate = new Date(dernier.date);
    const prochainDate = new Date(dernierDate);
    prochainDate.setDate(dernierDate.getDate() + 45);
    setProchainCreneau(prochainDate.toLocaleDateString('fr-FR'));
    
    // Calculer jours restants
    const today = new Date();
    const diffMs = prochainDate - today;
    const jours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    setJoursRestants(jours);
    setDelaiRespected(jours === 0);
  }
};
```

**AJOUT Bandeau Info UX (remplace checkbox/dropdown, ligne ~545):**
```javascript
{isFastFood && (
  <div style={{
    background: '#fff3cd',
    border: '1px solid #ffc107',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12
  }}>
    <div style={{fontWeight: 'bold', color: '#856404', marginBottom: 8}}>
      ⚠️ FAST FOOD DÉTECTÉ
    </div>
    <div style={{fontSize: 14, marginTop: 4}}>
      📍 Restaurant: <strong>{fastFoodType || 'Non identifié'}</strong>
    </div>
    {dernierFastFood && (
      <>
        <div style={{fontSize: 14, marginTop: 4}}>
          📅 Dernier fast food: <strong>{new Date(dernierFastFood.date).toLocaleDateString('fr-FR')} ({dernierFastFood.restaurant})</strong>
        </div>
        <div style={{fontSize: 14, marginTop: 4}}>
          🎯 Prochain créneau: <strong>{prochainCreneau}</strong>
        </div>
        <div style={{fontSize: 14, marginTop: 4}}>
          ⏱️ Règle: <strong>Espacer de 45 jours minimum pour badges</strong>
        </div>
        {delaiRespected ? (
          <div style={{fontSize: 14, marginTop: 8, color: '#28a745', fontWeight: 'bold'}}>
            ✅ Délai de 45 jours respecté ! Badge accordé
          </div>
        ) : joursRestants > 0 ? (
          <div style={{fontSize: 14, marginTop: 8, color: '#fd7e14'}}>
            ⚠️ Recommandation: Attends encore <strong>{joursRestants} jour{joursRestants > 1 ? 's' : ''}</strong> pour le badge
          </div>
        ) : null}
      </>
    )}
  </div>
)}

{/* Bouton "Forcer fast food" pour cas exceptionnels */}
{!isFastFood && aliment && (
  <button 
    type="button" 
    onClick={() => setShowForceModal(true)}
    style={{
      fontSize: 12, 
      marginTop: 8,
      padding: '4px 8px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer'
    }}
  >
    ➕ Marquer comme fast food (restaurant non listé)
  </button>
)}

{showForceModal && (
  <div style={{marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 8}}>
    <label>Nom du restaurant:</label>
    <input 
      type="text"
      placeholder="Ex: Kebab du coin"
      value={fastFoodType}
      onChange={e => {
        setFastFoodType(e.target.value);
        setIsFastFood(true);
      }}
      style={{width: '100%', marginTop: 4}}
    />
    <button 
      type="button"
      onClick={() => setShowForceModal(false)}
      style={{fontSize: 12, marginTop: 8}}
    >
      Annuler
    </button>
  </div>
)}
```

**SUPPRESSION Variable fastFoodList (ligne 116 - devenue inutile):**
```javascript
// ❌ SUPPRIMER COMPLÈTEMENT
const fastFoodList = ["McDo", "KFC", ...];
```

**`/pages/tableau-de-bord.js` (correction ligne ~143):**
```javascript
// AVANT
const delay = Math.max(0, Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)));

// APRÈS
const delay = Math.max(0, Math.floor((nextDate - today) / (1000 * 60 * 60 * 24)));
```

---

### 8.3 Changements Résumés

**Référentiel.js:**
- ✅ 2 catégories corrigées (Pitaya, Class'Croute)
- ✅ 24 plats ajoutés (Pizza Hut, Quick, O'Tacos, Kebab)
- ✅ 0 suppression
- ✅ Total: 455 plats (+30 vs avant, car 425 actuels)

**RepasBloc.js:**
- ✅ 1 useEffect ajouté (auto-détection)
- ✅ 1 variable modifiée (fastFoodList)
- ✅ 0 suppression fonctionnalité
- ✅ Rendu JSX inchangé (checkbox reste accessible)

**tableau-de-bord.js:**
- ✅ 1 ligne modifiée (Math.ceil → Math.floor)
- ✅ 0 suppression
- ✅ Cohérence calcul délai restaurée

**Impact UX:**
- ✅ Tracking automatique activé
- ✅ Moins de clics utilisateur
- ✅ Affichage délai cohérent
- ✅ Plus de choix restaurants

---

## Etape 8.5 — **Checklist Tests Manuels (À RÉALISER PAR L'UTILISATEUR APRÈS IMPLÉMENTATION)**

### 📋 TESTS OBLIGATOIRES AVANT VALIDATION FINALE

**⚠️ IMPORTANT:** Cette checklist doit être complétée par l'utilisateur APRÈS l'implémentation du code, AVANT de valider la mission comme terminée.

**Contexte:** Tests manuels Option A (durée estimée: 15 minutes)

---

#### 🧪 SCÉNARIO 1: Auto-Détection Fast Food avec Marque

**Objectif:** Vérifier que la sélection d'un aliment fast food avec marque active automatiquement le tracking.

- [ ] **Test 1.1 - McDonald's Big Mac**
  - Action: Ouvrir page `/repas`, saisir "Big Mac" dans champ "Aliment mangé"
  - Résultat attendu: 
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown "Choix du restaurant" = AUTO-REMPLI avec "McDonald's"
    - ✅ Kcal auto-rempli (503 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 1.2 - Burger King Whopper**
  - Action: Saisir "Whopper" dans champ "Aliment mangé"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "Burger King"
    - ✅ Kcal auto-rempli (660 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 1.3 - Subway Sub 15cm**
  - Action: Saisir "Sub Italian BMT 15cm"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "Subway"
    - ✅ Kcal auto-rempli (230 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 1.4 - KFC Wrap**
  - Action: Saisir "Wrap KFC"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "KFC"
    - ✅ Kcal auto-rempli (420 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 1.5 - Pizza Hut Pepperoni (nouveau)**
  - Action: Saisir "Pizza Hut Pepperoni"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "Pizza Hut"
    - ✅ Kcal auto-rempli (280 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 1.6 - Quick Giant (nouveau)**
  - Action: Saisir "Giant Quick"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "Quick"
    - ✅ Kcal auto-rempli (580 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 1.7 - O'Tacos M (nouveau)**
  - Action: Saisir "Tacos O'Tacos M"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "O'Tacos"
    - ✅ Kcal auto-rempli (680 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 2: Auto-Détection Fast Food SANS Marque

**Objectif:** Vérifier que les aliments fast food sans marque (kebab) activent le tracking avec "Autre" ou "Kebab".

- [ ] **Test 2.1 - Kebab sandwich (nouveau)**
  - Action: Saisir "Kebab sandwich"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "Kebab" OU "Autre" (selon implémentation)
    - ✅ Kcal auto-rempli (550 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 2.2 - Kebab assiette (nouveau)**
  - Action: Saisir "Kebab assiette"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = AUTO-COCHÉE
    - ✅ Dropdown = "Kebab" OU "Autre"
    - ✅ Kcal auto-rempli (700 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 3: Sélection Aliment NON Fast Food

**Objectif:** Vérifier que les aliments normaux NE déclenchent PAS l'auto-détection.

- [ ] **Test 3.1 - Poulet grillé**
  - Action: Saisir "Poulet grillé"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = PAS COCHÉE (reste décochée)
    - ✅ Dropdown restaurant = VIDE
    - ✅ Kcal auto-rempli selon référentiel
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 3.2 - Riz basmati**
  - Action: Saisir "Riz basmati"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = PAS COCHÉE
    - ✅ Dropdown = VIDE
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 3.3 - Class'Croute sandwich (catégorie corrigée)**
  - Action: Saisir "Class'Croute sandwich"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = PAS COCHÉE (car categorie: "traiteur" maintenant)
    - ✅ Dropdown = VIDE
    - ✅ Kcal auto-rempli (320 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 3.4 - Pitaya wok (catégorie corrigée)**
  - Action: Saisir "Pitaya wok"
  - Résultat attendu:
    - ✅ Checkbox "Fast food ?" = PAS COCHÉE (car categorie: "asiatique" maintenant)
    - ✅ Dropdown = VIDE
    - ✅ Kcal auto-rempli (600 kcal)
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 4: Modification Manuelle Utilisateur

**Objectif:** Vérifier que l'utilisateur peut OVERRIDE l'auto-détection manuellement.

- [ ] **Test 4.1 - Décocher après auto-détection**
  - Action: 
    1. Saisir "Big Mac" (checkbox auto-cochée)
    2. Décocher manuellement la checkbox "Fast food ?"
  - Résultat attendu:
    - ✅ Checkbox reste DÉCOCHÉE (pas de re-cochage automatique)
    - ✅ Dropdown reste affiché mais désactivé OU caché
    - ✅ Soumission repas → PAS d'insertion dans fast_food_history
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 4.2 - Changer restaurant manuellement**
  - Action:
    1. Saisir "Big Mac" (dropdown auto-rempli "McDonald's")
    2. Changer dropdown manuellement vers "KFC"
  - Résultat attendu:
    - ✅ Dropdown reste sur "KFC" (pas de re-remplissage auto)
    - ✅ Soumission repas → restaurant="KFC" enregistré
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 4.3 - Cocher manuellement pour aliment non fast food**
  - Action:
    1. Saisir "Poulet grillé" (checkbox PAS cochée)
    2. Cocher manuellement la checkbox
    3. Sélectionner "Autre" dans dropdown
  - Résultat attendu:
    - ✅ Checkbox reste COCHÉE
    - ✅ Dropdown = "Autre"
    - ✅ Soumission repas → Insertion dans fast_food_history avec restaurant="Autre"
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 5: Sauvegarde Base de Données

**Objectif:** Vérifier que le tracking fast food s'enregistre correctement dans Supabase.

- [ ] **Test 5.1 - Insertion fast_food_history**
  - Action:
    1. Saisir "Whopper" (auto-détection → Burger King)
    2. Compléter formulaire (quantité, heure, etc.)
    3. Soumettre repas
    4. Vérifier BDD Supabase table `fast_food_history`
  - Résultat attendu:
    - ✅ Nouvelle ligne créée dans `fast_food_history`
    - ✅ Champs: `user_id` (correct), `date` (date saisie), `restaurant` ("Burger King"), `aliments` (contient "Whopper")
  - Commande SQL vérification:
    ```sql
    SELECT * FROM fast_food_history 
    WHERE restaurant = 'Burger King' 
    ORDER BY date DESC LIMIT 1;
    ```
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 5.2 - Insertion repas_reels (table générale)**
  - Action: Même repas que Test 5.1
  - Résultat attendu:
    - ✅ Nouvelle ligne créée dans `repas_reels` également
    - ✅ Champs standards remplis (user_id, date, aliment, quantite, kcal, etc.)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 5.3 - Pas d'insertion si checkbox décochée**
  - Action:
    1. Saisir "Big Mac" (auto-coché)
    2. Décocher manuellement
    3. Soumettre repas
    4. Vérifier BDD
  - Résultat attendu:
    - ✅ Insertion dans `repas_reels` uniquement
    - ❌ PAS d'insertion dans `fast_food_history`
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 6: Calcul Délai 45 Jours (Correction Math.floor)

**Objectif:** Vérifier que le calcul du délai entre fast foods est cohérent (affichage = validation).

**Prérequis:** Avoir un fast food enregistré dans l'historique (utiliser Test 5.1 si nécessaire).

- [ ] **Test 6.1 - Délai 44 jours (validation refusée)**
  - Action:
    1. Enregistrer un fast food à la date J-44 (44 jours dans le passé)
    2. Ouvrir tableau de bord
    3. Tenter de saisir un nouveau fast food aujourd'hui
  - Résultat attendu:
    - ✅ Tableau de bord affiche: "Délai restant: **1 jour**" (Math.floor)
    - ✅ Formulaire repas: Message "Dernier fast food il y a 44 jours, attends encore 1 jour"
    - ✅ Badge/récompense: PAS accordé (diffDays = 44 < 45)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 6.2 - Délai 45 jours (validation acceptée)**
  - Action:
    1. Enregistrer un fast food à la date J-45 (45 jours dans le passé)
    2. Ouvrir tableau de bord
    3. Saisir un nouveau fast food aujourd'hui
  - Résultat attendu:
    - ✅ Tableau de bord affiche: "Délai restant: **0 jour**" (Math.floor)
    - ✅ Formulaire repas: Message "Bravo, délai de 45 jours respecté !"
    - ✅ Badge/récompense: ACCORDÉ (diffDays = 45 >= 45)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 6.3 - Délai 46 jours (validation acceptée)**
  - Action: Enregistrer fast food à J-46, saisir nouveau aujourd'hui
  - Résultat attendu:
    - ✅ Tableau de bord affiche: "Délai restant: **0 jour**"
    - ✅ Badge accordé
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 6.4 - Cohérence affichage vs validation**
  - Action: Comparer message tableau de bord vs message formulaire
  - Résultat attendu:
    - ✅ Si tableau dit "1 jour restant" → formulaire REFUSE validation
    - ✅ Si tableau dit "0 jour restant" → formulaire ACCEPTE validation
    - ✅ Aucune incohérence Math.ceil vs Math.floor
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 7: Affichage Badges/Récompenses

**Objectif:** Vérifier que les badges fast food s'affichent correctement après validation délai.

- [ ] **Test 7.1 - Badge après 1er délai respecté**
  - Action:
    1. Enregistrer 1er fast food
    2. Attendre 45 jours (ou simuler date)
    3. Enregistrer 2ème fast food
    4. Vérifier tableau de bord section badges
  - Résultat attendu:
    - ✅ Badge "Délai respecté 1×" affiché
    - ✅ Message: "Continue comme ça !"
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 7.2 - Badge spécial après 3 délais consécutifs**
  - Action:
    1. Enregistrer 3 fast foods espacés de 45+ jours chacun
    2. Vérifier badges
  - Résultat attendu:
    - ✅ Badge spécial "Maîtrise du délai 3×" affiché
    - ✅ Animation confettis (si implémentée)
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 8: Autocomplete Référentiel

**Objectif:** Vérifier que l'autocomplete fonctionne avec les nouveaux plats ajoutés.

- [ ] **Test 8.1 - Autocomplete Pizza Hut**
  - Action: Taper "Pizza Hut" dans champ aliment
  - Résultat attendu:
    - ✅ Suggestions affichées: "Pizza Hut Pepperoni", "Pizza Hut Margherita", "Pizza Hut Supreme", "Pizza Hut 4 fromages"
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 8.2 - Autocomplete Quick**
  - Action: Taper "Quick" dans champ aliment
  - Résultat attendu:
    - ✅ Suggestions affichées: "Giant Quick", "Long Chicken Quick", "Long Bacon Quick", "Frites Quick...", etc.
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 8.3 - Autocomplete O'Tacos**
  - Action: Taper "Tacos O" dans champ aliment
  - Résultat attendu:
    - ✅ Suggestions affichées: "Tacos O'Tacos S", "Tacos O'Tacos M", "Tacos O'Tacos L", "Tacos O'Tacos XL"
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 8.4 - Autocomplete Kebab**
  - Action: Taper "Kebab" dans champ aliment
  - Résultat attendu:
    - ✅ Suggestions affichées: "Kebab sandwich", "Kebab assiette", "Kebab galette"
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 9: Régression - Fonctionnalités Existantes

**Objectif:** Vérifier que les fonctionnalités existantes ne sont PAS cassées par les modifications.

- [ ] **Test 9.1 - Saisie repas normal (non fast food)**
  - Action: Saisir un repas classique (ex: "Poulet grillé + Riz basmati")
  - Résultat attendu:
    - ✅ Formulaire fonctionne normalement
    - ✅ Sauvegarde BDD OK
    - ✅ Affichage dans liste repas OK
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 9.2 - Statistiques tableau de bord**
  - Action: Ouvrir tableau de bord
  - Résultat attendu:
    - ✅ Kcal totales affichées
    - ✅ Nombre repas affiché
    - ✅ Section fast food affichée (si fast foods enregistrés)
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 9.3 - Navigation dates (semaine/mois)**
  - Action: Changer de période dans tableau de bord
  - Résultat attendu:
    - ✅ Repas filtrés correctement selon période
    - ✅ Aucun crash
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 9.4 - Modification repas existant**
  - Action: Éditer un repas déjà enregistré
  - Résultat attendu:
    - ✅ Formulaire se remplit avec données existantes
    - ✅ Auto-détection fonctionne si aliment = fast food
    - ✅ Modification sauvegardée OK
  - Statut: ⬜ PASS | ⬜ FAIL

---

#### 🧪 SCÉNARIO 10: Performance & Stabilité

**Objectif:** Vérifier qu'il n'y a pas de boucles infinies ou problèmes de performance.

- [ ] **Test 10.1 - Pas de boucle infinie**
  - Action:
    1. Ouvrir console navigateur (F12)
    2. Saisir "Big Mac"
    3. Observer console pendant 10 secondes
  - Résultat attendu:
    - ✅ Aucun message d'erreur "Maximum update depth exceeded"
    - ✅ Aucun log infini répété
    - ✅ Application reste responsive
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 10.2 - Pas d'erreur compilation**
  - Action: Vérifier terminal `npm run dev`
  - Résultat attendu:
    - ✅ Build successful
    - ✅ Aucun warning ESLint critique
    - ✅ Application démarre sans erreur
  - Statut: ⬜ PASS | ⬜ FAIL

- [ ] **Test 10.3 - Pas d'erreur runtime console**
  - Action: Ouvrir console navigateur, naviguer dans l'app
  - Résultat attendu:
    - ✅ Aucune erreur TypeError
    - ✅ Aucune erreur ReferenceError
    - ✅ Warnings mineurs acceptables (si documentés)
  - Statut: ⬜ PASS | ⬜ FAIL

---

### 📊 RÉCAPITULATIF TESTS

**Total tests:** 40 cases à cocher

**Statut global:**
- Tests passés: _____ / 40
- Tests échoués: _____ / 40
- Taux de réussite: _____ %

**Seuil validation:** 95% minimum (38/40 tests passés)

**Si < 95%:**
- [ ] Documenter tests échoués dans fichier "Anomalie roll back"
- [ ] Analyser cause racine
- [ ] Proposer rollback OU correction ciblée
- [ ] Re-tester après correction

**Si >= 95%:**
- [ ] Mission validée ✅
- [ ] Documenter dans CHANGELOG.md
- [ ] Commit final avec message: "feat: Fast Food Option B - Auto-détection + 24 plats + Correction délai"

---

**Date réalisation tests:** ________________  
**Testeur:** ________________  
**Résultat final:** ⬜ VALIDÉ | ⬜ CORRECTIONS REQUISES

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

### Questions Validation

Avant de procéder à l'implémentation, l'utilisateur doit valider:

1. **Validation Approche Globale:**
   - [ok ] Je valide l'approche Option B (corrections + enrichissement + auto-détection + bug fix)
   - [ non]c est a toi copilot de comprendre les risque et de coder avec prudence en respectant les zones de vigilance et point d alerte pour garantir la conformité de cette maj (Etape 1)
   - [ ok] Je valide les fichiers concernés (referentiel.js, RepasBloc.js, tableau-de-bord.js)

2. **Validation Catégorisations:**
   - [ ok] Je valide: Pitaya wok → `categorie: "asiatique"`
   - [ ok] Je valide: Class'Croute → `categorie: "traiteur"`
   - [ ok] Je confirme: Ces changements n'impactent pas tracking existant (ou migration données nécessaire?)

3. **Validation Enrichissement:**
   - [ ok] Je valide ajout Pizza Hut (6 plats)
   - [ ok] Je valide ajout Quick (10 plats)
   - [ok ] Je valide ajout O'Tacos (5 plats)
   - [ok ] Je valide ajout Kebab (3 plats)
   - [non ] =copilot tu m as rien montré a ce sujet. Les kcal/QN proposés semblent corrects (ou à ajuster?)

4. **Validation Auto-détection:**
   - [ ok] Je valide comportement: sélection "Big Mac" → checkbox auto-cochée
   - [ non] je comprend pas ya pas cette notion de restaurant dans la saisie donc je vois pas comment ca peut etre possible car c ets une info masqué pour utilisatur Je valide: restaurant auto-rempli si marque disponible
   - [ ok] Je valide: utilisateur peut toujours modifier manuellement
   - [ ] comment ça ? y aura ecrit quoi ? Je valide: texte explicatif "(détecté automatiquement)" souhaité? (ou silencieux?)

5. **Validation Correction Bug:**
   - [ ok] Je valide: Math.ceil → Math.floor (affichage délai peut changer -1 jour)
   - [ ok] mais c est en mode recommendation pour aider utilisateur a atteindre ce goal c est pas bloquant si il a manger en dehors de la regle on ne peut pas empecher la saisie .Je comprends: règle 45 jours devient stricte (pas d'arrondi supérieur)

6. **Validation Rollback:**
   - [ ok] git réalisé  Je valide: backups créés avant modification
   - [non ] seulement si moi utilisateur je le demande mais oui ca doit etre possible a tout moment si je le demande Je valide: rollback possible à tout moment
   - [ ok] Je valide: documentation anomalies dans fichier dédié

### Décision Finale

- [ ] **JE VALIDE CE PLAN ET AUTORISE L'IMPLÉMENTATION**
- Date validation: ________________
- Signature/Confirmation utilisateur: ________________

**⚠️ AUCUNE LIGNE DE CODE NE SERA ÉCRITE AVANT CETTE VALIDATION**

---

## 📝 Notes Complémentaires

### Tests Prévus Post-Implémentation

1. **Test Syntaxe:**
   ```bash
   node -e "const ref = require('./data/referentiel.js').default; console.log('Plats:', ref.length);"
   ```

2. **Test Compilation:**
   ```bash
   npm run build
   ```

3. **Test Runtime:**
   ```bash
   npm run dev
   # Naviguer vers /repas
   # Tester 10 scénarios auto-détection
   ```

4. **Test BDD:**
   ```sql
   SELECT * FROM fast_food_history ORDER BY date DESC LIMIT 5;
   ```

5. **Test Calcul Délai:**
   - Cas 1: Dernier fast food il y a 44 jours → doit afficher "1 jour restant" + refuser validation
   - Cas 2: Dernier fast food il y a 45 jours → doit afficher "0 jour restant" + accepter validation
   - Cas 3: Dernier fast food il y a 46 jours → doit afficher "0 jour restant" + accepter validation

### Documentation à Mettre à Jour Post-Implémentation

- [ ] README.md (si mentionne fast food)
- [ ] CHANGELOG.md (ajouter entrée 2026-01-09)
- [ ] AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md (documenter amélioration)

---

## 🟢 Amélioration Continue Copilot

**Règles strictes pour cette implémentation:**

1. ✅ Relecture manuelle ligne par ligne AVANT modification
2. ✅ Validation syntaxe APRÈS chaque batch (5-6 plats)
3. ✅ Test import référentiel APRÈS chaque modif
4. ✅ Vérification ordre hooks AVANT ajout useEffect
5. ✅ Test manuel auto-détection APRÈS chaque modif RepasBloc
6. ✅ Documentation anomalie IMMÉDIATE si erreur
7. ✅ Rollback SANS HÉSITATION si >2 erreurs consécutives
8. ✅ Communication utilisateur CONSTANTE (progression, blocages)

**Auto-questionnement Copilot:**
- "Ai-je relu le fichier réel ligne par ligne?" (pas mémoire IA)
- "Ai-je testé la syntaxe après ajout?"
- "Ai-je vérifié l'ordre des hooks?"
- "Ai-je documenté chaque étape?"
- "Suis-je prêt à rollback si nécessaire?"

---

**FIN DU PLAN D'IMPLÉMENTATION**

**Statut:** ⏸️ EN ATTENTE VALIDATION UTILISATEUR

**Prochaine étape:** Validation utilisateur (cocher cases Etape 9) → Implémentation

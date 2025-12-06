# 📋 PLAN DE CORRECTION - Harmonisation SaisieDefiAlimentaire.js

**Date** : 06/12/2025  
**Objectif** : Corriger les écarts fonctionnels et violations qualité entre RepasBloc.js et SaisieDefiAlimentaire.js  
**Priorité** : CRITIQUE (violations process + UX dégradée en mode reprise)

---

## 🎯 OBJECTIF MÉTIER

Aligner le formulaire de reprise alimentaire (SaisieDefiAlimentaire.js) sur les standards du formulaire classique (RepasBloc.js) pour garantir :
- **Guidance nutritionnelle optimale** après jeûne (QN visible)
- **Réduction charge cognitive** (calcul auto kcal)
- **Suivi santé renforcé** (signaux satiété)
- **Conformité code** (ordre hooks React)

---

## 🔍 ANALYSE DES RISQUES

### Risques identifiés

| ID | Risque | Probabilité | Impact | Mitigation |
|----|--------|-------------|--------|------------|
| R1 | **Régression validation reprise** | Moyenne | Critique | Tests manuels avant/après sur validation phase |
| R2 | **Conflit hooks React (ordre)** | Haute | Bloquant | Réorganisation stricte selon checklist |
| R3 | **Perte données formulaire** | Faible | Critique | Backup localStorage avant tests |
| R4 | **Crash référentiel undefined** | Moyenne | Bloquant | Try/catch + vérification null |
| R5 | **Console.log exposition données** | Haute | Sécurité | Suppression complète logs debug |
| R6 | **Surcharge UX trop de champs** | Moyenne | UX | Implémentation progressive, validation utilisateur |

### Retour d'expérience (fichier Anomalie roll back)

✅ **Leçons apprises appliquées** :
1. Architecture localStorage-only → Aucune modification auth
2. Test validation utilisateur obligatoire → Tests demandés explicitement
3. Ordre hooks React strict → useState en premier toujours
4. Pas de Supabase sans validation → Uniquement localStorage pour reprise

---

## 📦 PÉRIMÈTRE FONCTIONNEL

### ✅ Corrections CRITIQUES (à faire)

#### 1. **Réorganisation ordre des hooks React**
- **Fichier** : `components/SaisieDefiAlimentaire.js`
- **Problème** : console.log (ligne 9) et useDefis() (ligne 11) AVANT useState (ligne 37)
- **Solution** : 
  ```javascript
  // ✅ ORDRE CORRECT
  1. Tous les useState (lignes 37-48)
  2. Tous les useEffect
  3. Variables calculées
  4. Handlers
  5. Console.log (à supprimer)
  ```
- **Impact** : Conformité React, prévention bugs SSR

#### 2. **Autocomplete avec score QN nutritionnel**
- **Fichier** : `components/SaisieDefiAlimentaire.js`
- **Problème** : Datalist HTML simple sans guidance nutritionnelle
- **Solution** : Porter le dropdown custom de RepasBloc (lignes 603-650)
  ```javascript
  // Dropdown avec :
  - Score QN coloré (vert ≥4, orange ≥3, rouge <3)
  - Portion recommandée affichée
  - Hover interactif
  - Position absolue z-index 1000
  ```
- **Impact** : Guidance cruciale en reprise après jeûne

#### 3. **Calcul automatique des kcal**
- **Fichier** : `components/SaisieDefiAlimentaire.js`
- **Problème** : Calcul manuel uniquement
- **Solution** : useEffect depuis RepasBloc (lignes 273-285)
  ```javascript
  useEffect(() => {
    const found = referentielAliments.find(...)
    if (found && quantite) {
      setKcal((quantiteNum * found.kcalParUnite).toFixed(0))
    }
  }, [aliment, quantite])
  ```
- **Impact** : Réduction charge cognitive, moins d'erreurs

#### 4. **Suppression console.log production**
- **Fichier** : `components/SaisieDefiAlimentaire.js`
- **Problème** : Lignes 9, 187 exposent données sensibles
- **Solution** : Suppression complète ou commentaire `// DEBUG:`
- **Impact** : Sécurité, performance

### 🟡 Améliorations RECOMMANDÉES (après validation)

#### 5. **Signaux de satiété**
- **Fichier** : `components/SaisieDefiAlimentaire.js`
- **Ajout** : Liste multi-select depuis RepasBloc (ligne 48)
- **Impact** : Suivi digestif post-jeûne

#### 6. **Unité dynamique dans label**
- **Fichier** : `components/SaisieDefiAlimentaire.js`
- **Ajout** : Affichage unité selon référentiel (ligne 690 RepasBloc)
- **Impact** : Clarté UX

#### 7. **Baromètre ressenti avec icônes**
- **Fichier** : `components/SaisieDefiAlimentaire.js`
- **Ajout** : 8 états prédéfinis colorés (ligne 42 RepasBloc)
- **Impact** : Meilleure analyse patterns

### 🔴 Hors périmètre

- ❌ Mode Fast Food (non applicable en reprise)
- ❌ Logique extras (déjà géré par validation reprise)
- ❌ Repas planifié (pas de planning en reprise)

---

## 🛠️ PLAN D'IMPLÉMENTATION

### Phase 1 : Corrections CRITIQUES (30 min)

**Étape 1.1 - Réorganisation hooks (5 min)**
```javascript
// Déplacer lignes dans cet ordre :
1. useState (lignes 37-48) → monter en ligne 9
2. useDefis() (ligne 11) → déplacer après useState
3. Supprimer console.log ligne 9
4. Variables calculées (useMemo lignes 16-32)
5. useEffect (lignes 54-76)
```

**Étape 1.2 - Autocomplete QN (15 min)**
```javascript
// Copier de RepasBloc.js lignes 603-650
1. État suggestionsFiltrees + afficherSuggestions
2. useEffect filtrage aliments
3. Remplacer datalist par dropdown custom
4. Styling avec QN coloré
```

**Étape 1.3 - Calcul auto kcal (5 min)**
```javascript
// Copier de RepasBloc.js lignes 273-285
useEffect(() => {
  const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase())
  if (found && quantite) {
    const quantiteNum = parseFloat(quantite)
    if (found.kcalParUnite) {
      setKcal((quantiteNum * found.kcalParUnite).toFixed(0))
    }
  }
}, [aliment, quantite])
```

**Étape 1.4 - Nettoyage console.log (5 min)**
```javascript
// Supprimer :
- Ligne 9 : console.log('[SaisieDefiAlimentaire] Props reçues:', ...)
- Ligne 187 : console.log('[DEBUG SaisieDefiAlimentaire] Insertion repas_reels:', ...)
- Ligne 188 : setMessage('[DEBUG] Données envoyées à Supabase: ' + ...)
```

### Phase 2 : Améliorations RECOMMANDÉES (20 min) - APRÈS VALIDATION PHASE 1

**Étape 2.1 - Signaux satiété (10 min)**
```javascript
// Ajouter après champ ressenti
const signauxSatieteList = [...] // depuis RepasBloc ligne 48
État : detailsSignaux
Rendu : liste checkboxes
```

**Étape 2.2 - Unité dynamique (5 min)**
```javascript
// Modifier label quantité
<label>
  Quantité
  {found && found.unite && ` (${uniteLabels[found.unite]})`}
</label>
```

**Étape 2.3 - Baromètre ressenti (5 min)**
```javascript
// Remplacer input texte par sélecteur visuel
const etatsAlimentaires = [...] // depuis RepasBloc ligne 42
Rendu : grid avec icônes + couleurs
```

### Phase 3 : Tests et validation (15 min)

**Tests manuels obligatoires** :
1. ✅ Saisir aliment → autocomplete affiche QN
2. ✅ Sélectionner aliment → catégorie + kcal auto-remplis
3. ✅ Modifier quantité → kcal recalculés automatiquement
4. ✅ Valider repas Phase 1 autorisé → succès
5. ✅ Valider repas Phase 3 non autorisé → warning pédagogique
6. ✅ Féculent après 19h Phase 4 → warning horaires
7. ✅ Console navigateur → aucun log visible
8. ✅ Aucune régression validation reprise

**Validation get_errors** :
```bash
# Vérifier aucune erreur TypeScript/ESLint
```

---

## 📊 CHECKLIST QUALITÉ

### Avant modification

- [ ] Backup localStorage `test_modeRepriseActif` + `test_programmeRepriseValide`
- [ ] Lecture complète `docs/Anomalie roll back`
- [ ] Lecture complète `Régle strict copilot .md`
- [ ] Validation architecture localStorage-only

### Pendant modification

#### Checklist React (règles strictes)
- [ ] ✅ Tous les useState déclarés en premier
- [ ] ✅ Tous les useEffect après useState
- [ ] ✅ Aucun hook avant déclaration
- [ ] ✅ Aucune déclaration en double
- [ ] ✅ Handlers après hooks
- [ ] ✅ Rendu JSX en dernier

#### Checklist fonctionnelle
- [ ] ✅ referentielAliments.find() avec try/catch
- [ ] ✅ Vérification null avant .portionDefaut
- [ ] ✅ Validation reprise préservée (phase, horaires, quantité)
- [ ] ✅ Logique défi conditionnelle (if (defi) {...})
- [ ] ✅ Aucune suppression code existant

#### Checklist sécurité
- [ ] ✅ Aucun console.log en production
- [ ] ✅ Aucune donnée sensible exposée
- [ ] ✅ Aucun appel Supabase auth (localStorage only)

### Après modification

- [ ] ✅ get_errors retourne 0 erreur
- [ ] ✅ Tests manuels 8/8 passés
- [ ] ✅ Validation utilisateur explicite (tests réels)
- [ ] ✅ Documentation anomalie si régression
- [ ] ✅ Suggestion push/pull

---

## 🔄 AMÉLIORATION CONTINUE

### Questions obligatoires

**1. Pourquoi cette modification est-elle nécessaire ?**
→ Écart fonctionnel majeur entre formulaire classique et reprise. Utilisateur en phase sensible (post-jeûne) perd guidance nutritionnelle (QN) et charge cognitive accrue (calcul kcal manuel).

**2. Quels sont les impacts sur le code existant ?**
→ **Positifs** : Meilleure UX, moins d'erreurs saisie, guidance renforcée  
→ **Négatifs** : +100 lignes code, +2 états React, complexité accrue  
→ **Mitigation** : Tests exhaustifs, validation utilisateur

**3. Existe-t-il une alternative plus simple ?**
→ **Alternative 1** : Ne corriger que l'ordre hooks (5 min) → NON, ne résout pas UX  
→ **Alternative 2** : Ajouter seulement calcul kcal → PARTIEL, QN manque toujours  
→ **Décision** : Correction complète phase 1 minimale (autocomplete + kcal + hooks)

**4. Les tests couvrent-ils tous les cas ?**
→ ✅ Validation reprise préservée (3 tests)  
→ ✅ Calcul kcal (1 test)  
→ ✅ Autocomplete QN (1 test)  
→ ✅ Console propre (1 test)  
→ ⚠️ Manque : Tests signaux satiété (Phase 2)

**5. La documentation est-elle à jour ?**
→ ⚠️ À FAIRE : Ajouter entrée dans `docs/Anomalie roll back` si régression  
→ ⚠️ À FAIRE : Mettre à jour ce plan avec résultats tests

---

## 📝 PLAN DE ROLLBACK

### Déclencheurs de rollback

1. ❌ Erreur compilation bloquante
2. ❌ Validation reprise cassée (test 4-6)
3. ❌ Perte données utilisateur
4. ❌ Crash runtime référentiel
5. ❌ Régression autre fonctionnalité

### Procédure de rollback

```bash
# 1. Annuler dernier commit
git reset --hard HEAD~1

# 2. Restaurer version précédente
git checkout HEAD -- components/SaisieDefiAlimentaire.js

# 3. Vérifier état
npm run build

# 4. Documenter dans Anomalie roll back
```

### Fichier de sauvegarde

**Avant modification** : Créer `components/SaisieDefiAlimentaire.js.backup-2025-12-06`

---

## ✅ VALIDATION UTILISATEUR REQUISE

### Avant code (ce document)

- [ ] **Plan lu et compris**
- [ ] **Risques acceptés**
- [ ] **Périmètre validé** (Phase 1 seulement ou Phase 1+2 ?)
- [ ] **Backup localStorage confirmé**

### Après code (tests)

- [ ] **Tests manuels 8/8 réussis**
- [ ] **Aucune régression constatée**
- [ ] **UX améliorée confirmée**
- [ ] **Prêt pour commit**

---

## 📌 NOTES

### Décisions prises

1. **Ordre des hooks** : useState en ligne 9, useDefis après (conformité React)
2. **Autocomplete** : Dropdown custom (pas datalist) pour afficher QN
3. **Calcul kcal** : useEffect identique RepasBloc (kcalParUnite prioritaire)
4. **Console.log** : Suppression totale (pas de commentaire)

### Dépendances

- ✅ `data/referentiel.js` : Structure inchangée
- ✅ `data/alimentsRepriseJeune.js` : Utilisé pour validation phase
- ✅ `lib/supabaseClient.js` : Déjà importé (repas_reels)
- ✅ React hooks : useState, useEffect, useMemo

### Temps estimé

- **Phase 1 (CRITIQUE)** : 30 min
- **Phase 2 (RECOMMANDÉ)** : 20 min
- **Tests** : 15 min
- **TOTAL** : 65 min (1h05)

---

## 🎯 SUCCÈS = ?

### Critères de succès

1. ✅ 0 erreur compilation (get_errors)
2. ✅ 8/8 tests manuels passés
3. ✅ Validation utilisateur explicite
4. ✅ Checklist qualité 100% cochée
5. ✅ Aucune entrée Anomalie roll back

### Livrables

1. ✅ `components/SaisieDefiAlimentaire.js` corrigé
2. ✅ `components/SaisieDefiAlimentaire.js.backup-2025-12-06` créé
3. ✅ Tests manuels documentés (capture ou texte)
4. ✅ Ce plan à jour avec résultats

---

**🚀 PRÊT POUR VALIDATION UTILISATEUR**

**Question** : Valides-tu ce plan pour Phase 1 (CRITIQUE - 30 min) uniquement, ou Phase 1+2 (COMPLET - 50 min) ?

Coche ta décision :
- [ ] ✅ **Phase 1 SEULEMENT** (ordre hooks + autocomplete QN + calcul kcal + nettoyage logs)
- [ ] ✅ **Phase 1 + Phase 2** (+ signaux satiété + unité dynamique + baromètre ressenti)
- [ ] ❌ **Plan à revoir** (précise quoi modifier)

---

**Signature validation** : _________________________  
**Date/Heure** : _________________________

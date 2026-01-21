# 🧪 PROTOCOLE DE TESTS MANUELS - Fast Food Option B
**Date:** 2026-01-09  
**Testeur:** À compléter  
**Version:** Option B Conforme (après rollback + corrections)

---

## ✅ PRÉREQUIS AVANT TESTS

- [ ] Serveur local démarré (`npm run dev`)
- [ ] Base de données accessible
- [ ] Utilisateur test connecté (avec historique fast food existant si possible)
- [ ] Console DevTools ouverte (surveiller erreurs)
- [ ] Référentiel.js contient 24 nouveaux plats (vérifier via console log)

---

## 🧪 TEST #1: Auto-détection Pizza Hut (nouveau plat)

**Objectif:** Vérifier que nouveau plat Pizza Hut détecte automatiquement fast food

**Actions:**
1. Aller sur page `/suivi`
2. Sélectionner date du jour
3. Cliquer "Ajouter repas"
4. Dans champ "Aliment mangé", taper "Pizza Hut Pepperoni"
5. Observer comportement

**Résultats attendus:**
- ✅ Autocomplete propose "Pizza Hut Pepperoni"
- ✅ Après sélection: AUCUNE checkbox "Fast food ?" visible
- ✅ Console log: `isFastFood = true` (si console.log ajouté)
- ✅ Section "Aliments consommés (Fast food)" apparaît
- ✅ Kcal auto-rempli: 280 kcal

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Raison: _______________________

**Anomalies détectées:**
_______________________________________

---

## 🧪 TEST #2: Non-détection Class'Croute (correction catégorie)

**Objectif:** Vérifier que Class'Croute N'EST PLUS détecté comme fast food

**Actions:**
1. Page `/suivi`
2. Dans champ "Aliment mangé", taper "Class'Croute sandwich"
3. Observer comportement

**Résultats attendus:**
- ✅ Autocomplete propose "Class'Croute sandwich"
- ✅ Après sélection: `isFastFood = false`
- ✅ AUCUNE section "Aliments consommés (Fast food)" visible
- ✅ Catégorie affichée: "traiteur" (si affiché quelque part)

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Raison: _______________________

**Anomalies détectées:**
_______________________________________

---

## 🧪 TEST #3: Non-détection Pitaya wok (correction catégorie)

**Objectif:** Vérifier que Pitaya wok N'EST PLUS détecté comme fast food

**Actions:**
1. Dans champ "Aliment mangé", taper "Pitaya wok"
2. Observer comportement

**Résultats attendus:**
- ✅ `isFastFood = false`
- ✅ AUCUNE section fast food visible
- ✅ Catégorie: "asiatique"

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Raison: _______________________

---

## 🧪 TEST #4: Auto-détection Quick (nouveau plat)

**Objectif:** Vérifier que Quick Giant détecte automatiquement

**Actions:**
1. Taper "Quick Giant"
2. Observer comportement

**Résultats attendus:**
- ✅ `isFastFood = true`
- ✅ Section fast food visible
- ✅ Kcal auto-rempli: 600 kcal
- ✅ Restaurant = "Quick"

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Raison: _______________________

---

## 🧪 TEST #5: Auto-détection O'Tacos (nouveau plat)

**Objectif:** Vérifier O'Tacos M détecte automatiquement

**Actions:**
1. Taper "O'Tacos M"
2. Observer comportement

**Résultats attendus:**
- ✅ `isFastFood = true`
- ✅ Kcal: 680 kcal
- ✅ Restaurant = "O'Tacos"

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Raison: _______________________

---

## 🧪 TEST #6: Sauvegarde BDD fast food

**Objectif:** Vérifier insertion dans `fast_food_history`

**Actions:**
1. Saisir "Pizza Hut Pepperoni" + quantité + soumettre formulaire
2. Vérifier BDD (table `fast_food_history`)

**Résultats attendus:**
- ✅ Nouvelle ligne insérée
- ✅ Champs: `user_id`, `date`, `restaurant` = "Pizza Hut", `aliments` = JSON

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Raison: _______________________

---

## 🧪 TEST #7: Calcul délai Math.floor (tableau-de-bord)

**Objectif:** Vérifier cohérence calcul délai

**Actions:**
1. Aller sur `/tableau-de-bord`
2. Vérifier affichage "Prochain fast food: X jours"
3. Comparer avec calcul manuel (dernierFastFood.date + 45 jours - aujourd'hui)

**Résultats attendus:**
- ✅ Délai = Math.floor((prochainDate - today) / 86400000)
- ✅ Cohérent avec RepasBloc.js

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Raison: _______________________

---

## 🧪 TEST #8: Console errors/warnings

**Objectif:** Vérifier absence erreurs runtime

**Actions:**
1. Effectuer tests #1 à #7
2. Surveiller console DevTools

**Résultats attendus:**
- ✅ AUCUNE erreur `ReferenceError`
- ✅ AUCUNE erreur `TypeError`
- ✅ AUCUN warning hooks React
- ✅ AUCUNE boucle infinie

**Résultat test:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Erreurs détectées: _______________________

---

## 📊 RÉSUMÉ TESTS

**Tests réussis:** __ / 8  
**Tests échoués:** __ / 8  
**Bloquants:** [ ] OUI [ ] NON

**Décision:**
- [ ] ✅ PRODUCTION READY - Tous tests PASS
- [ ] ⚠️ CORRECTIONS MINEURES - Tests majoritairement PASS (>75%)
- [ ] ❌ ROLLBACK REQUIS - Tests majoritairement FAIL (<75%)

**Testeur:** _______________  
**Date/Heure:** _______________

---

## 📝 ANOMALIES DÉTECTÉES

Si anomalies, documenter dans `/docs/Anomalie roll back`:

**Template anomalie:**
```
═══════════════════════════════════════════════════════════════
🔴 ANOMALIE #X : [TITRE]
═══════════════════════════════════════════════════════════════
Date/Heure : [DATE] [HEURE]
Fichiers concernés : [FICHIERS]
Sévérité : 🔴 CRITIQUE / 🟠 MAJEURE / 🟡 MINEURE

SYMPTÔMES :
[Description précise]

CAUSE RACINE :
[Analyse technique]

SOLUTION PROPOSÉE :
[Rollback ou correction]
```

---

## ✅ VALIDATION FINALE

**Checklist conformité Template:**
- [ ] Ordre hooks respecté (useState → useEffect → handlers)
- [ ] Imports présents (`supabase` via dynamic import)
- [ ] Dependency arrays complètes
- [ ] Fonctions définies avant usage
- [ ] AUCUNE erreur ESLint
- [ ] Tests manuels >75% PASS
- [ ] Anomalies documentées (si existantes)

**Signature validation:** _______________

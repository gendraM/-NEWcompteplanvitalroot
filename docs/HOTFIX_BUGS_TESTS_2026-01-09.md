# 🔴 HOTFIX - 3 Bugs Critiques Détectés en Tests
**Date:** 2026-01-09  
**Tests utilisateur:** Big Mac (OK) + Subway (KO) + Historique (KO)  
**Statut:** ✅ CORRIGÉ

---

## 🧪 TESTS UTILISATEUR EFFECTUÉS

### ✅ Test #1 - Big Mac (PASS)
- **Action:** Saisie "Big Mac"
- **Résultat:** Auto-détection fast food ✅
- **Marque affichée:** McDonald's ✅

### ❌ Test #2 - Subway (FAIL)
- **Action:** Saisie "Sub Poulet Teriyaki"
- **Attendu:** Auto-détection fast food
- **Obtenu:** Affiché "sandwich" seulement
- **Cause:** `categorie: "sandwich"` au lieu de `"fast-food"`

### ❌ Test #3 - Historique (FAIL)
- **Action:** Saisie fast food avec historique existant
- **Attendu:** Message "X jours depuis dernier"
- **Obtenu:** "Première entrée fast food"
- **Cause:** Conflit logique 2 sources historique (BDD vs semaine courante)

---

## 🔍 BUGS IDENTIFIÉS

### BUG #1 - Subway categorie incorrecte
**Lignes:** referentiel.js 34-36  
**Avant:**
```javascript
{ nom: "Sub Poulet Teriyaki", categorie: "sandwich", ... }
{ nom: "Sub Steak & Cheese", categorie: "sandwich", ... }
{ nom: "Sub Végétarien", categorie: "sandwich", ... }
```
**Impact:** Auto-détection ne fonctionne PAS pour Subway

---

### BUG #2 - Conflit logique historique
**Lignes:** RepasBloc.js 128-142  
**Problème:** 2 sources différentes pour historique fast food
1. `repasSemaine` (semaine courante uniquement) → useEffect ligne 128
2. `fast_food_history` BDD (historique complet) → fetchDernierFastFood ligne 241

**Conséquence:** 
- Si fast food précédent >7 jours, `repasSemaine` est vide
- useEffect calcule `fastFoodReward = true` (première entrée)
- fetchDernierFastFood retourne historique réel depuis BDD
- **Conflit:** 2 valeurs différentes pour `fastFoodReward`

---

### BUG #3 - Récompense non calculée dans fetchDernierFastFood
**Lignes:** RepasBloc.js 269-276  
**Problème:** `fetchDernierFastFood` charge l'historique BDD mais NE calcule PAS `fastFoodReward`

**Code manquant:**
```javascript
// Calculer délai depuis dernier fast food
const currentDate = new Date(date);
const diffDays = Math.floor((currentDate - dernierDate) / (1000 * 60 * 60 * 24));
setFastFoodReward(diffDays >= 45);
```

---

## ✅ CORRECTIONS APPLIQUÉES

### Correction #1 - Subway → fast-food
**Fichier:** data/referentiel.js  
**Lignes modifiées:** 34, 35, 36

```diff
- { nom: "Sub Poulet Teriyaki", categorie: "sandwich", ...
+ { nom: "Sub Poulet Teriyaki", categorie: "fast-food", ...

- { nom: "Sub Steak & Cheese", categorie: "sandwich", ...
+ { nom: "Sub Steak & Cheese", categorie: "fast-food", ...

- { nom: "Sub Végétarien", categorie: "sandwich", ...
+ { nom: "Sub Végétarien", categorie: "fast-food", ...
```

**Impact:** Subway maintenant détecté automatiquement comme fast food ✅

---

### Correction #2 - Unification logique historique
**Fichier:** components/RepasBloc.js  
**Lignes modifiées:** 128-142 (useEffect simplifié)

**AVANT (calcul doublon):**
```javascript
useEffect(() => {
  if (!isFastFood) return;
  const fastFoodRepas = repasSemaine.filter(...);
  setFastFoodHistory(fastFoodRepas);
  
  // ❌ CALCUL BASÉ SUR SEMAINE COURANTE (incomplet)
  if (fastFoodRepas.length > 0) {
    const lastFastFood = fastFoodRepas[fastFoodRepas.length - 1];
    const diffDays = Math.floor(...);
    setFastFoodReward(diffDays >= 45);
  } else {
    setFastFoodReward(true); // Erreur si historique >7 jours
  }
}, [isFastFood, repasSemaine, date]);
```

**APRÈS (source unique BDD):**
```javascript
useEffect(() => {
  if (!isFastFood) return;
  // Filtrer l'historique local pour affichage uniquement (semaine courante)
  const fastFoodRepas = repasSemaine.filter(r => r.isFastFood || r.fastFoodType);
  setFastFoodHistory(fastFoodRepas);
  
  // ✅ La récompense est calculée dans fetchDernierFastFood via BDD (historique complet)
  // On ne recalcule PAS ici pour éviter les conflits
}, [isFastFood, repasSemaine]);
```

**Bénéfice:** Historique complet BDD = source unique de vérité ✅

---

### Correction #3 - Calcul récompense dans fetchDernierFastFood
**Fichier:** components/RepasBloc.js  
**Lignes ajoutées:** 277-285

**AVANT:**
```javascript
if (data && data.length > 0) {
  const dernier = data[0];
  setDernierFastFood(dernier);
  // Calculs prochainCreneau, joursRestants...
  // ❌ MANQUE: calcul fastFoodReward
}
```

**APRÈS:**
```javascript
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
  
  // ✅ AJOUT: Calculer récompense basée sur délai réel BDD
  const currentDate = new Date(date);
  const diffDays = Math.floor((currentDate - dernierDate) / (1000 * 60 * 60 * 24));
  setFastFoodReward(diffDays >= 45);
} else {
  // ✅ AJOUT: Aucun historique BDD → premier fast food → récompense automatique
  setFastFoodReward(true);
}
```

---

## 📊 IMPACT CORRECTIONS

| Bug | Avant | Après |
|-----|-------|-------|
| Subway détecté | ❌ "sandwich" | ✅ "fast-food" |
| Message historique | ❌ "Première entrée" (faux) | ✅ "X jours depuis dernier" (vrai) |
| Source historique | ⚠️ 2 sources (conflit) | ✅ BDD seule (cohérent) |
| Calcul récompense | ⚠️ Doublon + incomplet | ✅ BDD uniquement (complet) |

---

## 🎯 VALIDATION POST-HOTFIX

### À retester:
1. ✅ Saisie "Sub Poulet Teriyaki" → doit afficher fast food
2. ✅ Saisie fast food avec historique >7 jours → message correct
3. ✅ Saisie fast food avec historique <45 jours → PAS de récompense
4. ✅ Saisie fast food avec historique >45 jours → récompense affichée

### ESLint:
- ✅ 0 erreur après corrections

---

## 📝 LEÇONS APPRISES

### Erreur détection tardive:
- ❌ Tests unitaires PAS effectués AVANT commit initial
- ❌ Validation catégories référentiel PAS systématique
- ❌ Conflits logiques (2 sources historique) non anticipés

### Bonnes pratiques appliquées:
- ✅ Tests utilisateur AVANT production
- ✅ Hotfix immédiat suite retours tests
- ✅ Unification source vérité (BDD seule)
- ✅ Documentation bugs + corrections

### Amélioration continue:
> **Question Template:** "Ai-je vérifié la cohérence des catégories dans le référentiel ?"  
> **Réponse future:** OUI, grep systématique AVANT commit

---

## ✅ STATUT FINAL

**Corrections:** 3/3 appliquées ✅  
**ESLint:** 0 erreur ✅  
**Tests manuels:** À effectuer (protocole mis à jour) ⏸️  
**Production Ready:** ⏸️ APRÈS validation tests

**Auteur:** GitHub Copilot (Claude Sonnet 4.5)  
**Durée hotfix:** 15 minutes  
**Commit:** À faire avec corrections intégrées

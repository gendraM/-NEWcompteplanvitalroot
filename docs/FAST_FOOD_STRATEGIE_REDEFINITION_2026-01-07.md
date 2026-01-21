# 🎯 STRATÉGIE FAST FOOD - Redéfinition & Plan d'Action

**Date:** 2026-01-07  
**Décision Utilisateur:** Redéfinir strictement la catégorie "fast-food"  
**Impact:** Correction 104 plats + Enrichissement chaînes manquantes

---

## 📋 DÉFINITION STRICTE FAST FOOD

### ✅ Critères Obligatoires

Un plat est considéré **fast food** si:
1. ✅ **Chaîne internationale standardisée** (McDonald's, KFC, Burger King, etc.)
2. ✅ **Service ultra-rapide** (< 5 min)
3. ✅ **Prix bas/accessible**
4. ✅ **Standardisation mondiale** (même recette partout)
5. ✅ **Système fast food classique** (commande comptoir, menus numérotés, etc.)

### ✅ FAST FOOD VALIDÉ (chaînes indiscutables)

**Burgers:**
- ✅ McDonald's
- ✅ KFC
- ✅ Burger King
- ✅ Quick (France)
- ✅ Five Guys
- ✅ Buffalo Grill

**Sandwichs:**
- ✅ Subway

**Pizzas:**
- ✅ Domino's Pizza
- ✅ Pizza Hut
- ✅ Speed Rabbit Pizza (France)

**Kebabs/Tacos:**
- ✅ O'Tacos
- ✅ Greek House (chaîne kebab)
- ✅ Kebab générique (si chaîne locale)

**Poulet:**
- ✅ KFC (déjà listé)
- ✅ Chicken Spot

**Poisson:**
- ✅ Nordsee (fast food poisson)

### ❌ PAS FAST FOOD (à recatégoriser)

**Raison: Restaurant/Traiteur de qualité supérieure**
- ❌ **Class'Croute** → `categorie: "traiteur"` ou `"sandwicherie-qualite"`
- ❌ **Pitaya** → `categorie: "asiatique"` (déjà correct dans certains plats)
- ❌ **Starbucks** → `categorie: "cafe"` ou `"boisson"`
- ❌ **Bamboo Sushi** → `categorie: "asiatique"` ou `"restaurant-japonais"`

**Raison: Restaurant buffet**
- ❌ **Royal Buffet Tours** → `categorie: "restaurant-buffet"` ou `"asiatique"`
- ❌ **Buffets chinois à volonté** → `categorie: "restaurant-buffet"`

---

## 🔍 AUDIT RÉFÉRENTIEL ACTUEL

### Plats Marqués `categorie: "fast-food"` (104 plats)

#### ✅ CONFORMES (garder categorie: "fast-food")

**McDonald's** (45 plats):
- Burgers: Big Mac, McChicken, Royal Deluxe, Royal Cheese, Double Cheese, Filet-O-Fish, McWrap Poulet, Hamburger McDo, Cheeseburger McDo
- Frites: Petite, Moyenne, Grande (3 plats)
- Nuggets: 1 pièce, 4, 6, 9, 20 pièces (5 plats)
- Desserts: McFlurry Oreo, McFlurry M&M's, Sundae caramel, Sundae chocolat, Donuts (5 plats)
- Boissons: Coca, Sprite, Fanta (3 tailles chacun = 9 plats), Milkshake vanille/chocolat (3 tailles chacun = 6 plats)

**KFC** (29 plats):
- Poulet: Original 1 pièce, Hot Wings (3 formats), Tenders (3 formats), Bucket 10 pièces (7 plats)
- Burgers: Colonel Original, Zinger, Kentucky Burger (3 plats)
- Frites: Petite, Moyenne, Grande (3 plats)
- Accompagnements: Coleslaw, Purée, Maïs (3 plats)
- Desserts: Sundae, Cookie, Brownie, Glaces vanille/chocolat (5 plats)

**Subway** (14 plats):
- Subs 15cm: Italian BMT, Thon, Jambon, Poulet Teriyaki, Veggie Delite, Steak & Cheese (6 plats)
- Subs 30cm: Italian BMT, Thon, Jambon, Poulet Teriyaki, Veggie Delite, Steak & Cheese (6 plats)
- Wraps: Poulet, Thon, Veggie (3 plats)
- Salades: Poulet, Thon, Veggie (3 plats)
- Accompagnement: Chips Lay's (1 plat)

**Burger King** (10 plats):
- Burgers: Whopper, Whopper Jr, Double Whopper, Chicken Royale, Steakhouse, Crispy Chicken, Fish King (7 plats)
- Frites: Petite, Moyenne, Grande (3 plats)
- Onion Rings: Petite, Grande (2 plats)
- Nuggets: 1 pièce, 6, 9, 20 pièces (4 plats)
- Desserts: Sundae caramel, Sundae chocolat, Cookie, Brownie, Glace vanille (5 plats)

**Domino's Pizza** (1 plat):
- Pizza Domino's (1 part - 250 kcal)

**TOTAL CONFORMES: 99 plats** ✅

#### ❌ NON-CONFORMES (à recatégoriser)

**Class'Croute** (1 plat - ligne 3045):
```javascript
{ nom: "Class'Croute sandwich", categorie: "fast-food", ... }
```
→ **Action:** Passer en `categorie: "traiteur"` ou `"sandwicherie"`

**Pitaya** (1 plat - ligne 3044):
```javascript
{ nom: "Pitaya wok", categorie: "fast-food", ... }
```
→ **Action:** Passer en `categorie: "asiatique"` (cohérent avec autres plats Pitaya ligne 25-31)

**Wrap KFC** (1 plat - ligne 3046):
```javascript
{ nom: "Wrap KFC", categorie: "fast-food", ... }
```
→ **Action:** ✅ GARDER (KFC = fast food validé)

**Subway Sub** (1 plat générique - ligne 3043):
```javascript
{ nom: "Subway Sub", categorie: "fast-food", ... }
```
→ **Action:** ✅ GARDER ou SUPPRIMER (doublon avec 12 subs détaillés)

**TOTAL NON-CONFORMES: 2 plats à corriger (Class'Croute, Pitaya wok)**

---

## 📊 CHAÎNES FAST FOOD MANQUANTES

### À Ajouter (priorité HAUTE)

#### **Pizza Hut** (concurrent Domino's)
```javascript
// Pizzas (par part)
{ nom: "Pizza Hut Pepperoni", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 280, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Domino's", "Pizza 4 fromages"] }
{ nom: "Pizza Hut Margherita", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 220, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Domino's", "Pizza Margherita"] }
{ nom: "Pizza Hut Supreme", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 300, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Domino's", "Pizza complète"] }
{ nom: "Pizza Hut 4 fromages", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 270, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Margherita", "Pizza Domino's"] }

// Accompagnements
{ nom: "Breadsticks Pizza Hut", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "Pizza Hut", kcal: 140, qn: 1, portionDefaut: "2 pièces", unite: "piece", alternatives: ["Frites McDo petite", "Onion Rings BK"] }

// Desserts
{ nom: "Cookie Pizza Hut", categorie: "fast-food", sousCategorie: "Dessert", marque: "Pizza Hut", kcal: 180, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Cookie Subway", "Cookie BK"] }
```
**Total Pizza Hut: 6 plats**

#### **Quick** (chaîne française burgers)
```javascript
// Burgers
{ nom: "Giant Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 580, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Whopper"] }
{ nom: "Long Chicken Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 420, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["McChicken", "Chicken Royale BK"] }
{ nom: "Long Bacon Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 460, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Royal Cheese", "Whopper"] }
{ nom: "Long Fish Quick", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 390, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Filet-O-Fish", "Fish King"] }

// Frites
{ nom: "Frites Quick petite", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 250, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo petite", "Frites BK petite"] }
{ nom: "Frites Quick moyenne", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 380, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo moyenne", "Frites BK moyenne"] }
{ nom: "Frites Quick grande", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 510, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo grande", "Frites BK grande"] }

// Nuggets
{ nom: "Nuggets Quick 4 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Quick", kcal: 190, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo menu 4 pièces", "Nuggets BK menu 6 pièces"] }
{ nom: "Nuggets Quick 6 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Quick", kcal: 285, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo menu 6 pièces", "Nuggets BK menu 6 pièces"] }

// Desserts
{ nom: "Sundae Quick", categorie: "fast-food", sousCategorie: "Dessert", marque: "Quick", kcal: 250, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Sundae caramel McDo", "Sundae BK caramel"] }
```
**Total Quick: 10 plats**

#### **O'Tacos** (tacos français)
```javascript
// Tacos
{ nom: "Tacos O'Tacos S", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 450, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos M", "Wrap KFC"] }
{ nom: "Tacos O'Tacos M", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 680, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos S", "Tacos O'Tacos L"] }
{ nom: "Tacos O'Tacos L", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 900, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos M", "Tacos O'Tacos XL"] }
{ nom: "Tacos O'Tacos XL", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 1200, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["Tacos O'Tacos L", "Wrap KFC"] }

// Frites
{ nom: "Frites O'Tacos", categorie: "fast-food", sousCategorie: "Frites", marque: "O'Tacos", kcal: 320, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo moyenne", "Frites BK moyenne"] }
```
**Total O'Tacos: 5 plats**

#### **Kebab Générique** (très consommé en France)
```javascript
// Kebabs
{ nom: "Kebab sandwich", categorie: "fast-food", sousCategorie: "Kebab", marque: null, kcal: 550, qn: 1, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Tacos O'Tacos M", "Wrap KFC"] }
{ nom: "Kebab assiette", categorie: "fast-food", sousCategorie: "Kebab", marque: null, kcal: 700, qn: 1, portionDefaut: "1 assiette", unite: "piece", alternatives: ["Kebab sandwich", "Tacos O'Tacos L"] }
{ nom: "Kebab galette", categorie: "fast-food", sousCategorie: "Kebab", marque: null, kcal: 480, qn: 1, portionDefaut: "1 galette", unite: "piece", alternatives: ["Kebab sandwich", "Wrap Poulet Subway"] }
```
**Total Kebab: 3 plats**

#### **Speed Rabbit Pizza** (chaîne française)
```javascript
// Pizzas (par part)
{ nom: "Speed Rabbit Pepperoni", categorie: "fast-food", sousCategorie: "Pizza", marque: "Speed Rabbit Pizza", kcal: 270, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Pepperoni", "Pizza Domino's"] }
{ nom: "Speed Rabbit Royale", categorie: "fast-food", sousCategorie: "Pizza", marque: "Speed Rabbit Pizza", kcal: 290, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Supreme", "Pizza Domino's"] }
{ nom: "Speed Rabbit 4 fromages", categorie: "fast-food", sousCategorie: "Pizza", marque: "Speed Rabbit Pizza", kcal: 260, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut 4 fromages", "Pizza Domino's"] }
```
**Total Speed Rabbit: 3 plats**

#### **Five Guys** (burgers premium mais fast food)
```javascript
// Burgers
{ nom: "Hamburger Five Guys", categorie: "fast-food", sousCategorie: "Burger", marque: "Five Guys", kcal: 700, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Cheeseburger Five Guys", "Whopper"] }
{ nom: "Cheeseburger Five Guys", categorie: "fast-food", sousCategorie: "Burger", marque: "Five Guys", kcal: 840, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Hamburger Five Guys", "Double Whopper"] }
{ nom: "Little Hamburger Five Guys", categorie: "fast-food", sousCategorie: "Burger", marque: "Five Guys", kcal: 480, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Hamburger Five Guys", "Big Mac"] }

// Frites
{ nom: "Frites Five Guys", categorie: "fast-food", sousCategorie: "Frites", marque: "Five Guys", kcal: 530, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo grande", "Frites BK grande"] }

// Hot-dog
{ nom: "Hot Dog Five Guys", categorie: "fast-food", sousCategorie: "Hot-dog", marque: "Five Guys", kcal: 520, qn: 1, portionDefaut: "1 hot-dog", unite: "piece", alternatives: ["Hamburger Five Guys", "Kebab sandwich"] }
```
**Total Five Guys: 5 plats**

### 📊 Récapitulatif Enrichissement

| Chaîne | Plats à Ajouter | Priorité |
|--------|----------------|----------|
| Pizza Hut | 6 | 🔴 HAUTE |
| Quick | 10 | 🔴 HAUTE |
| O'Tacos | 5 | 🔴 HAUTE |
| Kebab | 3 | 🔴 HAUTE |
| Speed Rabbit | 3 | 🟡 MOYENNE |
| Five Guys | 5 | 🟡 MOYENNE |
| **TOTAL** | **32 plats** | |

---

## 🛠️ PLAN D'ACTION

### PHASE 1 - Corrections (30 min)

#### Étape 1.1: Corriger Class'Croute (1 plat)
```javascript
// AVANT
{ nom: "Class'Croute sandwich", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Class'Croute", kcal: 320, qn: 1, ... }

// APRÈS
{ nom: "Class'Croute sandwich", categorie: "traiteur", sousCategorie: "Sandwich", marque: "Class'Croute", kcal: 320, qn: 2, ... }
```

#### Étape 1.2: Corriger Pitaya wok (1 plat)
```javascript
// AVANT
{ nom: "Pitaya wok", categorie: "fast-food", sousCategorie: "Wok asiatique", marque: "Pitaya", kcal: 600, qn: 2, ... }

// APRÈS
{ nom: "Pitaya wok", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 600, qn: 2, ... }
```

#### Étape 1.3: Décision Subway Sub générique
```javascript
// Option A: SUPPRIMER (doublon avec 12 subs détaillés)
// Option B: GARDER comme entrée générique fallback
```
→ **Recommandation:** SUPPRIMER (redondant)

**Résultat Phase 1:**
- ✅ 2 plats corrigés (Class'Croute, Pitaya)
- ✅ 1 plat supprimé (Subway Sub générique)
- ✅ Référentiel: 100 plats fast food conformes

### PHASE 2 - Enrichissement Priorité HAUTE (2h)

**Ajouter:**
- ✅ Pizza Hut (6 plats)
- ✅ Quick (10 plats)
- ✅ O'Tacos (5 plats)
- ✅ Kebab (3 plats)

**Résultat Phase 2:**
- ✅ +24 plats fast food
- ✅ Référentiel: 124 plats fast food

### PHASE 3 - Enrichissement Priorité MOYENNE (1h)

**Ajouter:**
- ✅ Speed Rabbit (3 plats)
- ✅ Five Guys (5 plats)

**Résultat Phase 3:**
- ✅ +8 plats fast food
- ✅ Référentiel: 132 plats fast food

### PHASE 4 - Auto-Détection Tracking (30 min)

**Modifier RepasBloc.js:**
```javascript
// Auto-cocher checkbox "Fast food ?" si categorie: "fast-food"
useEffect(() => {
  if (aliment) {
    const found = referentielAliments.find(r => 
      r.nom.toLowerCase() === aliment.toLowerCase()
    );
    if (found && found.categorie === 'fast-food') {
      setIsFastFood(true);
      if (found.marque && fastFoodList.includes(found.marque)) {
        setFastFoodType(found.marque);
      } else if (found.marque) {
        setFastFoodType('Autre');
      }
    }
  }
}, [aliment]);
```

### PHASE 5 - Mise à Jour Liste Restaurants (10 min)

**Modifier fastFoodList dans RepasBloc.js:**
```javascript
// AVANT
const fastFoodList = ["McDo", "KFC", "Kebab", "Burger King", "Subway", "Autre"];

// APRÈS
const fastFoodList = [
  "McDonald's",
  "KFC",
  "Burger King",
  "Subway",
  "Quick",
  "Pizza Hut",
  "Domino's Pizza",
  "Speed Rabbit Pizza",
  "O'Tacos",
  "Five Guys",
  "Kebab",
  "Autre"
];
```

### PHASE 6 - Supprimer menus_restaurants_selection.json (5 min)

**Raison:** Obsolète, référentiel.js est source unique
- ❌ Supprimer `/data/menus_restaurants_selection.json`
- ✅ Référentiel.js contient toutes les données

### PHASE 7 - Corriger Bug Math.floor (5 min)

**tableau-de-bord.js ligne 143:**
```javascript
// AVANT
const delay = Math.max(0, Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)));

// APRÈS
const delay = Math.max(0, Math.floor((nextDate - today) / (1000 * 60 * 60 * 24)));
```

---

## 📊 RÉSUMÉ FINAL

### Avant Corrections
```
Référentiel total: 425 plats
Fast food: 104 plats (dont 2 non-conformes)
```

### Après Corrections + Enrichissement
```
Référentiel total: 455 plats
Fast food: 132 plats (100% conformes)
Enrichissement: +30 plats (+28.8%)
```

### Impact Tracking
```
AVANT:
- User tape "Big Mac" → checkbox manuelle requise
- Oubli fréquent → perte tracking/badges

APRÈS:
- User tape "Big Mac" → checkbox auto-cochée + restaurant="McDonald's"
- Tracking garanti sur tous les plats fast food
- Plus de doublon système
```

### Délais Implémentation
```
Phase 1 (corrections):        30 min
Phase 2 (enrichissement):     2h
Phase 3 (enrichissement):     1h
Phase 4 (auto-détection):     30 min
Phase 5 (liste restaurants):  10 min
Phase 6 (suppression JSON):   5 min
Phase 7 (bug Math.floor):     5 min

TOTAL: 4h20 (session unique)
```

---

## ✅ VALIDATION UTILISATEUR REQUISE

### Questions Stratégiques

**Q1: Chaînes à prioriser?**
- ⬜ Pizza Hut (très répandu)
- ⬜ Quick (chaîne française)
- ⬜ O'Tacos (tacos français populaire)
- ⬜ Kebab générique (très consommé France)
- ⬜ Five Guys (premium mais fast food)
- ⬜ Speed Rabbit (pizza française)

**Q2: Catégories pour non-fast-food?**
- Class'Croute → `categorie: "traiteur"` ou `"sandwicherie"`?
- Buffets chinois → `categorie: "restaurant-buffet"` ou garder `"asiatique"`?

**Q3: Supprimer Subway Sub générique?**
- Option A: Supprimer (doublon avec 12 subs détaillés)
- Option B: Garder comme fallback

**Q4: Ordre d'implémentation?**
- Option A: Tout en 1 fois (4h20)
- Option B: Phase 1+7 urgent (35 min) puis Phases 2-6 plus tard
- Option C: Phase 1+2+4+7 (3h15) = corrections + enrichissement prioritaire + tracking

---

**Prêt à implémenter dès validation utilisateur** ✅

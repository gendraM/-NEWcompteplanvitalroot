# 🚨 ANOMALIES QN - RÉFÉRENTIEL ALIMENTAIRE

**Date d'analyse :** 2026-01-07  
**Fichier analysé :** `/data/referentiel.js`  
**Statut :** ⏳ En cours d'analyse

---

## 📖 RAPPEL ÉCHELLE QN

**Échelle 1-5 (Qualité Nutritionnelle) :**
- **QN 5** : Naturel/non transformé (fruits frais, légumes crus, poisson cru, eau)
- **QN 4** : Peu transformé (oléagineux, fruits secs, fromages artisanaux, pain complet)
- **QN 3** : Transformé modéré (pain blanc, yaourts, plats cuisinés maison)
- **QN 2** : Transformé (pâtes blanches, riz blanc, plats cuisinés industriels simples)
- **QN 1** : Ultra-transformé (fast-food, confiseries, sodas, plats préparés complexes)

**Principe :** "Moins l'aliment est transformé, plus sa qualité nutritionnelle est haute"

---

## 🔍 ANOMALIES IDENTIFIÉES

### ❌ CRITIQUE #1 : Desserts QN 4 (devraient être QN 1)

**Problème :** Desserts industriels notés comme "peu transformés"

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Cookie Subway | 37 | 4 | 1 | Cookie industriel ultra-transformé |
| Frappuccino Caramel | 42 | 4 | 1 | Boisson ultra-sucrée + crème + sirop |
| Muffin myrtille Starbucks | 43 | 4 | 1 | Pâtisserie industrielle |
| Cookie chocolat Starbucks | 44 | 4 | 1 | Cookie industriel |
| Cheesecake Starbucks | 45 | 4 | 1 | Dessert industriel complexe |
| Brownie Class'Croute | 51 | 4 | 1 | Brownie industriel |

**Impact :** 6 produits avec **+3 points de surévaluation**

---

### ❌ IMPORTANTE #2 : Wok légumes QN 1 (devrait être QN 2-3)

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Wok légumes Pitaya | 29 | 1 | 3 | Base légumes, sauce simple, peu transformé |

**Logique :** Des légumes sautés ne peuvent pas être ultra-transformés (QN 1)

---

### ❌ IMPORTANTE #3 : Sushis/Makis QN 1 (devraient être QN 2-3)

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Sushi saumon Bamboo | 54 | 1 | 3 | Riz + poisson cru = peu transformé |
| Maki avocat Bamboo | 55 | 1 | 3 | Riz + légume frais |
| California crevette Bamboo | 56 | 1 | 3 | Riz + crevette + avocat |
| Sushi saumon (buffet) | 69 | 1 | 3 | Riz + poisson cru |
| Sashimi thon | 70 | 1 | 4 | Poisson cru pur = très peu transformé |
| Maki concombre | 71 | 1 | 3 | Riz + légume |
| Tempura crevette | 72 | 1 | 2 | Friture (transformé) mais ingrédients simples |

**Logique :** Poisson cru + riz vinaigré = transformation minimale, pas ultra-transformé

---

### ❌ IMPORTANTE #4 : Kimchi QN 1 (devrait être QN 3-4)

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Kimchi | 79 | 1 | 4 | Fermentation naturelle, aliment traditionnel |

**Logique :** Légumes fermentés = transformation naturelle, non industrielle

---

### ❌ IMPORTANTE #5 : Salade César QN 1 (devrait être QN 2-3)

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Salade César Class'Croute | 48 | 1 | 2 | Base salade, sauce industrielle, poulet |

**Logique :** Même industrielle, une salade ne peut pas être QN 1

---

### 🟡 DÉBATTABLE #6 : Sub Steak & Cheese QN 3 (devrait être QN 1-2)

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Sub Steak & Cheese Subway | 35 | 3 | 2 | Pain industriel + viande transformée + fromage fondu |

**Cohérence :** Sub Poulet Teriyaki (QN 2) et Sub Végétarien (QN 2) déjà à QN 2

---

### 🟡 DÉBATTABLE #7 : Yakitori poulet QN 1 (devrait être QN 2)

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Yakitori poulet | 16 | 1 | 2 | Poulet grillé + sauce (transformé simple) |
| Yakitori légumes | 19 | 1 | 2 | Légumes grillés + sauce |
| Yakitori crevette | 20 | 1 | 2 | Crevette grillée + sauce |
| Yakitori poulet (buffet) | 73 | 1 | 2 | Idem ligne 16 |

**Cohérence :** Yakitori bœuf (ligne 17) = QN 2 déjà

---

### 🟡 DÉBATTABLE #8 : Cappuccino QN 1 (devrait être QN 2-3)

| Aliment | Ligne | QN Actuel | QN Correct | Justification |
|---------|-------|-----------|------------|---------------|
| Cappuccino Starbucks | 41 | 1 | 2 | Café + lait (transformation simple) |

**Logique :** Café + lait ≠ ultra-transformé. Frappuccino (QN 1) est correct.

---

### ℹ️ VALIDATION NÉCESSAIRE #9 : Fromages industriels QN 1

| Aliment | Ligne | QN Actuel | QN Proposé | Justification |
|---------|-------|-----------|------------|---------------|
| Kiri | 90 | 1 | 1 ou 2 ? | Fromage industriel fondu |
| Babybel | 91 | 1 | 1 ou 2 ? | Fromage industriel |
| Vache qui rit | 92 | 1 | 1 ou 2 ? | Fromage industriel fondu |
| Apéricube | 93 | 1 | 1 ou 2 ? | Fromage industriel fondu |

**Question :** Fromage industriel = QN 1 (ultra-transformé) ou QN 2 (transformation laitière classique) ?

---

## 📊 STATISTIQUES (ANALYSE PARTIELLE)

**Zone analysée :** Lignes 1-100 (confiseries, asiatique, chaînes, buffets)

- ✅ **Produits analysés :** ~100
- 🔴 **Anomalies critiques :** 6 (desserts QN 4 → QN 1)
- 🟠 **Anomalies importantes :** 13 (sushis, kimchi, salades)
- 🟡 **Débattables :** 6 (yakitori, cappuccino, sub)
- **Total anomalies :** ~25 produits

**Impact majeur :** Surévaluations de +3 points sur desserts industriels

---

## 🔄 ANALYSE EN COURS

**Prochaines sections à analyser :**
- [ ] Lignes 100-500 : Féculents, légumineuses
- [ ] Lignes 500-1000 : Protéines, légumes
- [ ] Lignes 1000-1500 : Fruits, oléagineux
- [ ] Lignes 1500-2000 : Produits laitiers
- [ ] Lignes 2000-2500 : Extras, snacks
- [ ] Lignes 2500-3000 : Boissons
- [ ] Lignes 3000-3200 : Fast-food (McDo, KFC, Subway, BK)

---

## ✅ CORRECTIONS À APPLIQUER (après analyse complète)

**Méthodologie :**
1. Terminer analyse complète du fichier
2. Consolider toutes les anomalies
3. Créer liste de corrections validées
4. Appliquer via `multi_replace_string_in_file` en une seule opération

**Statut :** ⏳ En attente de fin d'analyse

---

**Dernière mise à jour :** 2026-01-07 - Analyse lignes 1-100 terminée

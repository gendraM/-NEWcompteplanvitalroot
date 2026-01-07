# 🔧 AMÉLIORATIONS CONTINUES - DÉVELOPPEMENT APP

**Objectif :** Backlog des améliorations identifiées à implémenter progressivement  
**Statut :** Document de suivi  
**Mise à jour :** 2026-01-07

---

## 📋 TABLE DES MATIÈRES

1. [Référentiel Alimentaire](#référentiel-alimentaire)
2. [Interface Utilisateur](#interface-utilisateur)
3. [Moteur Calorique](#moteur-calorique)
4. [Système d'Alertes](#système-dalertes)

---

## 🍔 RÉFÉRENTIEL ALIMENTAIRE

### 1. Standardisation `portionDefaut` Fast-Food

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire  

#### Contexte
Les produits fast-food ajoutés utilisent actuellement des descriptions génériques dans `portionDefaut` (ex: "1 burger", "1 portion"). Pour cohérence avec le reste du référentiel et meilleure information utilisateur, ces valeurs doivent inclure **taille + poids précis**.

#### Produits concernés

##### TYPE 1 : Burgers/Sandwiches (descriptions vagues)
**Actuellement :** `portionDefaut: "1 burger"` ou `"1 sandwich"`  
**Objectif :** Ajouter poids approximatif

**Liste :**
- McDonald's : Big Mac, McChicken, Royal Deluxe, Royal Cheese, Double Cheese, Filet-O-Fish, McWrap Poulet, Hamburger McDo, Cheeseburger McDo
- KFC : Colonel Original, Zinger, Kentucky Burger, Wrap KFC
- Burger King : Whopper, Whopper Jr, Double Whopper, Chicken Royale, Steakhouse, Crispy Chicken, Fish King
- Subway : Tous les subs 15cm et 30cm, wraps

**Poids moyens réels :**
- Big Mac : ~215g
- McChicken : ~185g
- Whopper : ~290g
- Sub Subway 15cm : ~220g
- Sub Subway 30cm : ~440g

**Exemple de transformation :**
```javascript
// AVANT
{ nom: "Big Mac", portionDefaut: "1 burger", kcal: 503 }

// APRÈS
{ nom: "Big Mac", portionDefaut: "1 burger (215g)", kcal: 503 }
```

##### TYPE 2 : Frites/Onion Rings (sans poids)
**Actuellement :** `portionDefaut: "1 portion"`  
**Objectif :** Ajouter taille + grammes précis

**Liste :**
- Frites McDo : petite, moyenne, grande
- Frites KFC : petite, moyenne, grande
- Frites BK : petite, moyenne, grande
- Onion Rings BK : petite, grande

**Poids moyens réels :**
- Petite : ~80g
- Moyenne : ~115g
- Grande : ~150g

**Exemple de transformation :**
```javascript
// AVANT
{ nom: "Frites McDo petite", portionDefaut: "1 portion", kcal: 230 }

// APRÈS
{ nom: "Frites McDo petite", portionDefaut: "1 petite portion (80g)", kcal: 230 }
```

##### TYPE 3 : Nuggets/Poulet (OK - comptage individuel)
**État :** ✅ Déjà clair, pas de modification nécessaire  
`portionDefaut: "1 pièce"` ou `"1 menu"` est suffisamment explicite

##### TYPE 4 : Desserts

**Desserts en pot :**
- Actuellement : `portionDefaut: "1 pot"`
- Objectif : Ajouter contenance (ex: "1 pot (120ml)")

**Liste :**
- McFlurry Oreo, M&M's
- Sundae caramel/chocolat McDo
- Sundae KFC
- Glace vanille/chocolat KFC
- Sundae BK caramel/chocolat
- Glace vanille BK

**Exemple :**
```javascript
// AVANT
{ nom: "McFlurry Oreo", portionDefaut: "1 pot", kcal: 340 }

// APRÈS
{ nom: "McFlurry Oreo", portionDefaut: "1 pot (150ml)", kcal: 340 }
```

**Desserts pièce :**
- Actuellement : `portionDefaut: "1 pièce"`
- Objectif : Ajouter poids (ex: "1 pièce (45g)")

**Liste :**
- Donuts McDo
- Cookie KFC, Subway, BK
- Brownie KFC, BK

**Exemple :**
```javascript
// AVANT
{ nom: "Cookie Subway", portionDefaut: "1 pièce", kcal: 210 }

// APRÈS
{ nom: "Cookie Subway", portionDefaut: "1 pièce (45g)", kcal: 210 }
```

##### TYPE 5 : Boissons
**État :** ✅ Déjà OK  
Format actuel déjà optimal : `"1 gobelet petit (25cl)"`, `"1 gobelet moyen (40cl)"`, etc.

#### Implémentation recommandée

1. **Recherche poids officiels :**
   - Consulter sites officiels McDo, KFC, BK, Subway
   - Vérifier informations nutritionnelles publiées
   - Utiliser moyennes si variations régionales

2. **Mise à jour fichier :**
   - Modifier `/data/referentiel.js`
   - Mettre à jour section `correctifsAliments`
   - ~85 produits concernés

3. **Format standardisé :**
   ```javascript
   portionDefaut: "1 [type] [taille] ([poids/volume])"
   
   Exemples :
   - "1 burger (215g)"
   - "1 petite portion (80g)"
   - "1 pot (150ml)"
   - "1 pièce (45g)"
   ```

4. **Test cohérence :**
   - Vérifier affichage dans RepasBloc.js
   - S'assurer que format reste lisible
   - Tester autocomplete avec nouvelles valeurs

#### Bénéfices attendus

✅ **Clarté utilisateur** : Sait exactement quelle quantité il consomme  
✅ **Cohérence référentiel** : Même niveau de précision que féculents (2 CS) ou bouillons (200ml)  
✅ **Meilleure estimation** : Facilite comparaison entre produits  
✅ **Professionnalisme** : Données précises = confiance app

#### Estimation effort
- **Temps :** ~2-3h (recherche poids + modifications + tests)
- **Complexité :** 🟢 Faible
- **Risque :** 🟢 Minimal (modification données uniquement)

---

## 🎨 INTERFACE UTILISATEUR

### 2. Système d'Alertes Contextuelles Fast-Food

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire  
**Documentation liée :** [COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE.md](./COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE.md)

#### Contexte
Actuellement, aucun avertissement n'indique aux utilisateurs que les produits fast-food sont **incompatibles avec objectif perte de poids** ou **doivent être consommés occasionnellement**.

Voir documentation complète dans fichier dédié.

#### Actions à mener

**Phase 1 : Enrichissement données**
- ✅ Ajout 85 produits fast-food (FAIT 2026-01-07)
- ⏳ Calculer `equivalentCAS` pour chaque produit
- ⏳ Définir `compatibilitePerte` (occasionnel/déconseillé/incompatible)
- ⏳ Définir `frequenceMax` par objectif

**Phase 2 : Messages contextuels**
```javascript
messageContextuel: {
  perte: "⚠️ Cette portion consomme 92% de ton budget féculents quotidien...",
  maintien: "⚠️ Cette portion représente 37% de ton budget féculents...",
  surplus: "✓ Compatible avec ton objectif. Attention à l'équilibre..."
}
```

**Phase 3 : Interface RepasBloc.js**
- Badge visuel (🟢🟠🔴) selon compatibilité
- Affichage message à la sélection
- Suggestions alternatives intelligentes
- Compteur impact sur budget quotidien

**Phase 4 : Système tracking**
- Compteur hebdomadaire fast-food
- Alerte si dépassement fréquence recommandée
- Stats tendances dans tableau de bord

---

## 🧮 MOTEUR CALORIQUE

### 3. Calcul Automatique Équivalent CAS

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire

#### Objectif
Pour chaque aliment du référentiel, calculer automatiquement l'équivalent en **Cuillères À Soupe de féculents** (1 CAS ≈ 25 kcal).

#### Formule
```javascript
equivalentCAS = Math.round((kcal / 25) * 10) / 10;

Exemples :
- Frites McDo petite (230 kcal) → 9.2 CAS
- Big Mac (503 kcal) → 20.1 CAS
- Riz blanc (180 kcal) → 7.2 CAS
```

#### Utilisation
Permettra affichage type :
> "⚠️ Ce Big Mac équivaut à **20 CAS de féculents**, soit 2× ton budget quotidien en perte"

#### Implémentation
1. Ajouter champ `equivalentCAS` au référentiel
2. Script de calcul automatique pour tous les aliments
3. Affichage conditionnel dans interface
4. Utilisation dans système d'alertes

---

## 📊 SYSTÈME D'ALERTES

### 4. Alertes Tendances Hebdomadaires

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire

#### Concept
Analyse cumul hebdomadaire et alerte si comportements à risque détectés.

#### Types d'alertes

**Alerte fast-food :**
```
Si objectif = perte ET fastFoodWeekCount > 1 :
  "Tu as consommé du fast-food 3× cette semaine. 
   Pour ton objectif perte, max 1×/semaine recommandé."
```

**Alerte budget CAS :**
```
Si cumul_7j_CAS > (budgetJournalier × 7) × 1.2 :
  "Tu dépasses ton budget féculents de 20% cette semaine.
   Réduire de 2 CAS par repas cette semaine ?"
```

**Alerte surplus calorique :**
```
Si cumul_7j > +1500 kcal :
  "Tendance surplus détectée (+1500 kcal cette semaine).
   Ajuster repas suivants ? Suggestions : ..."
```

#### Déclencheurs
- Calcul quotidien à minuit
- Notification push si alerte
- Badge dans tableau de bord
- Suggestions d'ajustements automatiques

---

## 🔄 PROCHAINES ÉTAPES

### Ordre d'implémentation recommandé

1. **Court terme (1-2 semaines)**
   - ✅ Documentation compréhension moteur calorique (FAIT)
   - ⏳ Calcul équivalent CAS pour référentiel
   - ⏳ Standardisation portionDefaut fast-food

2. **Moyen terme (1 mois)**
   - ⏳ Système badges visuels compatibilité
   - ⏳ Messages contextuels selon objectif
   - ⏳ Interface alertes RepasBloc.js

3. **Long terme (2-3 mois)**
   - ⏳ Tracking hebdomadaire fast-food
   - ⏳ Alertes tendances automatiques
   - ⏳ Système suggestions intelligentes

---

## 📝 NOTES DE SUIVI

### 2026-01-07
- ✅ Identification erreur conceptuelle portionDefaut
- ✅ Documentation COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE.md
- ✅ Création backlog améliorations continues (ce fichier)
- ⏳ Décision : Reporter standardisation portionDefaut à plus tard

---

**Dernière mise à jour :** 2026-01-07  
**Prochaine revue :** À définir selon priorités projet

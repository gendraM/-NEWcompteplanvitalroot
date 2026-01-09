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

### 1. Enrichissement Référentiel +70% (300 plats)

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire (Plan progressif validé - Option A)

#### Contexte
Le référentiel actuel compte **425 plats**. Objectif: atteindre **723 plats** (+70%) pour couvrir une sélection plus large de repas consommés par les utilisateurs.

#### Calcul
- Référentiel actuel: 425 plats
- Objectif +70%: 723 plats total
- **À ajouter: ~300 nouveaux plats**

#### Lacunes identifiées (couverture géographique actuelle)
- 🇹🇭 **Thaïlande:** 2 plats (Pad Thaï, Curry vert) → Lacune majeure
- 🇨🇲 **Cameroun:** 0 plat → Lacune totale
- 🇬🇧 **Angleterre:** 0 plat → Lacune totale
- 🇨🇳 **Chine:** 12 plats → Couverture moyenne
- 🇯🇵 **Japon:** 12 plats → Couverture moyenne
- 🇰🇷 **Corée:** 27 plats → Bonne couverture (ajout récent)
- 🇨🇩/🇸🇳 **Congo/Sénégal:** 18 plats africains → Couverture correcte
- 🇺🇸 **États-Unis:** 4 plats (burgers) → Lacune majeure

#### Lacunes produits français
- **Viandes boucherie:** 0 plat dédié
- **Fromages:** 4 fromages industriels uniquement → Lacune majeure
- **Charcuterie:** 5 produits seulement → Lacune importante
- **Poissons:** Non analysé
- **Produits grande surface:** Couverture partielle

#### Approche retenue: Plan Progressif (Option A)

**Phase 1 - Prioritaire (50 plats)**
- 🇹🇭 Cuisine thaïlandaise: 15 plats (Tom Yum, Som Tam, Larb, Massaman, etc.)
- 🇨🇲 Cuisine camerounaise: 10 plats (Ndolé, Poulet DG, Koki, Eru, etc.)
- 🇫🇷 Viandes boucherie: 15 plats (Bavette, Entrecôte, Côte de porc, Gigot, etc.)
- 🇫🇷 Fromages: 10 plats (Camembert, Brie, Roquefort, Comté, Chèvre, etc.)

**Phase 2 - Secondaire (100 plats)**
- 🇬🇧 Cuisine anglaise: 15 plats (Fish & Chips, Cottage Pie, Roast Beef, etc.)
- 🇫🇷 Charcuterie: 20 plats (Pâté, Rillettes, Rosette, Coppa, etc.)
- 🇺🇸 Street food américain: 20 plats (Bagels, Donuts variés, Pancakes, etc.)
- 🇨🇳 Cuisine chinoise: 20 plats (Baozi, Jiaozi, Peking Duck, etc.)
- 🇯🇵 Cuisine japonaise: 15 plats (Ramen, Udon, Tonkatsu, Okonomiyaki, etc.)
- 🇹🇭 Complétion thaï: 10 plats

**Phase 3 - Complétion (150 plats)**
- 🇫🇷 Produits grande surface: 40 plats (plats préparés, conserves, etc.)
- 🇫🇷 Poissonnerie: 20 plats (Saumon, Thon, Dorade, Cabillaud, etc.)
- Expansion cuisines existantes: 40 plats
- Street food international: 30 plats
- Desserts/Pâtisseries: 20 plats

#### Typologie aliments à ajouter
1. **Street food internationale**
   - Tacos mexicains, Falafel, Döner kebab, Poutine, Arepas
   
2. **Restaurants (plats faits maison)**
   - Plats traditionnels français, brasserie, bistronomie
   
3. **Grande surface France**
   - Plats préparés, surgelés, conserves
   - Produits frais (boucherie, fromagerie, charcuterie)

4. **Diversité internationale**
   - Couverture équilibrée 9 pays demandés
   - Refléter habitudes alimentaires réelles

#### Contraintes qualité
- ✅ Aucun doublon accepté (vérification grep systématique)
- ✅ QN validé par comparaison plats similaires
- ✅ Kcal réalistes (sources nutritionnelles fiables)
- ✅ Portions standardisées (format cohérent)
- ✅ Alternatives existantes uniquement
- ✅ Process Template.md respecté à 100%

#### Estimation effort total
- **Phase 1:** ~8-10h (recherche + validation + implémentation 50 plats)
- **Phase 2:** ~15-20h (100 plats)
- **Phase 3:** ~25-30h (150 plats)
- **Total:** ~50-60h de travail

#### Prochaines actions (quand démarrage)
1. Création plan détaillé Phase 1 (Template.md)
2. Recherche données nutritionnelles fiables
3. Validation QN/kcal/portions utilisateur
4. Implémentation par batches sécurisés (10-15 plats/batch)
5. Tests autocomplete après chaque batch

---

### 2. Standardisation `portionDefaut` Fast-Food

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

### 2. Affichage Score QN lors Sélection Aliment

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire

#### Contexte
Tous les aliments du référentiel ont un score QN (1-5) mais celui-ci **n'est pas visible** dans l'interface lors de la sélection d'un aliment.

#### Problème
- ✅ Score QN présent dans `referentiel.js` (ex: `qn: 2`, `qn: 4`)
- ❌ Pas affiché dans autocomplete RepasBloc.js
- ❌ Pas affiché après sélection aliment
- ❌ Utilisateur ne peut pas voir qualité nutritionnelle

#### Solution proposée
Afficher score QN visuellement avec code couleur :
- **QN 5** : 🟢 Vert foncé "Naturel"
- **QN 4** : 🟢 Vert clair "Peu transformé"
- **QN 3** : 🟡 Jaune "Transformé modéré"
- **QN 2** : 🟠 Orange "Transformé"
- **QN 1** : 🔴 Rouge "Ultra-transformé"

#### Emplacement affichage
1. **Dans autocomplete** : Badge à côté du nom
   ```
   Tteokbokki 🟠 QN2
   Banchan légumes verts 🟢 QN4
   ```

2. **Après sélection** : Badge dans ligne aliment sélectionné
   ```
   Repas du midi
   ├─ Tteokbokki (150g) | 280 kcal | 🟠 QN2
   └─ Banchan légumes verts (100g) | 40 kcal | 🟢 QN4
   ```

#### Composants à modifier
- `/components/RepasBloc.js` (autocomplete + affichage)
- `/components/SaisieRepriseJeune.js` (si utilisé)
- Possiblement ajout composant `<QNBadge qn={2} />`

#### Bénéfices
✅ Visibilité qualité nutritionnelle  
✅ Aide choix alimentaires éclairés  
✅ Cohérent avec système QN déjà en place  
✅ Valorise aliments naturels (QN 4-5)

---

### 3. Système d'Alertes Contextuelles Fast-Food

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

## � ANOMALIES NON-CRITIQUES (Backlog Corrections)

### 5. Alternatives Cassées (3 plats)

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Basse (non bloquant)  
**Statut :** ⏳ À faire

#### Problème
3 plats référencent des alternatives qui n'existent pas dans le référentiel :

1. **Merguez** → alternative `"Kefta"` (INEXISTANT)
2. **Miyeok** → alternative `"Wakame"` (INEXISTANT)
3. **Korean Corn Dog** → alternative `"Hot Dog"` (INEXISTANT)

#### Impact
- ❌ Liens de navigation cassés dans autocomplete
- ❌ Suggestions alternatives incomplètes
- ✅ Pas bloquant : aliment principal fonctionne normalement

#### Solutions possibles

**Option A : Ajouter les aliments manquants**
```javascript
{ nom: "Kefta", categorie: "viande", sousCategorie: "Viandes hachées", ... }
{ nom: "Wakame", categorie: "algue", sousCategorie: "Algues", ... }
{ nom: "Hot Dog", categorie: "fast-food", sousCategorie: "McDo", ... }
```

**Option B : Remplacer par alternatives existantes**
```javascript
// Merguez
alternatives: ["Saucisse", "Chipolata"] // au lieu de "Kefta"

// Miyeok
alternatives: ["Banchan légumes verts", "Algues nori"] // au lieu de "Wakame"

// Korean Corn Dog
alternatives: ["Sotteok-Sotteok", "Saucisse"] // au lieu de "Hot Dog"
```

#### Décision à prendre
Valider avec utilisateur quelle option préférée avant correction.

---

## 🔄 PROCHAINES ÉTAPES

### Ordre d'implémentation recommandé

1. **Court terme (1-2 semaines)**
   - ✅ Documentation compréhension moteur calorique (FAIT)
   - ⏳ Affichage score QN dans UI (RepasBloc)
   - ⏳ Correction 3 alternatives cassées
   - ⏳ Calcul équivalent CAS pour référentiel
   - ⏳ Standardisation portionDefaut fast-food

2. **Moyen terme (1 mois)**
   - ⏳ Système badges visuels compatibilité
   - ⏳ Messages contextuels selon objectif
   - ⏳ Interface alertes RepasBloc.js
   - ⏳ **Enrichissement référentiel Phase 1 (50 plats prioritaires)**

3. **Long terme (2-3 mois)**
   - ⏳ Tracking hebdomadaire fast-food
   - ⏳ Alertes tendances automatiques
   - ⏳ Système suggestions intelligentes
   - ⏳ **Enrichissement référentiel Phase 2 (100 plats)**

4. **Très long terme (3-6 mois)**
   - ⏳ **Enrichissement référentiel Phase 3 (150 plats) → Objectif +70% atteint**

---

## 📝 NOTES DE SUIVI

### 2026-01-07
- ✅ Identification erreur conceptuelle portionDefaut
- ✅ Documentation COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE.md
- ✅ Création backlog améliorations continues (ce fichier)
- ⏳ Décision : Reporter standardisation portionDefaut à plus tard
- ✅ Ajout 39 plats coréens/africains/chinois au référentiel
- ✅ Identification anomalie : Score QN non visible dans UI
- ✅ Identification anomalie : 3 alternatives cassées (non-critique)
- ⏳ Corrections reportées à session future (pas bloquant utilisation)
- ✅ Analyse enrichissement référentiel +70% (300 plats)
- ✅ **Décision utilisateur: Plan progressif Option A validé (3 phases)**
- ⏳ Implémentation reportée à sessions futures
- 🎯 Objectif final: 425 → 723 plats (couverture 9 pays + produits français)

---

**Dernière mise à jour :** 2026-01-07  
**Prochaine revue :** À définir selon priorités projet

A ajouter permettre a l utilisateur quand il saisit aliment si non exiqstant dans le referentiel de l ajouter dans le meme style que existant pour enrichissement interne du referentiel, aussi permetre la compoqition d assiette complete/ repas complet avec ajout multiple de plusieurs aliment qui apres analyse pourront aussi etre propose dans planification des repas
# 🔍 ANALYSE SYSTÈME FAST FOOD - Anomalies & Doublons Détectés

**Date:** 2026-01-07  
**Analyste:** Copilot (demande utilisateur)  
**Statut:** ⚠️ ANOMALIES CRITIQUES IDENTIFIÉES

---

## 📋 TABLE DES MATIÈRES

1. [Compréhension Système Actuel](#1-compréhension-système-actuel)
2. [ANOMALIE #1 - Délai Fast Food](#2-anomalie-1---délai-fast-food)
3. [ANOMALIE #2 - Doublon Catégorie vs Checkbox](#3-anomalie-2---doublon-catégorie-vs-checkbox)
4. [Architecture Technique](#4-architecture-technique)
5. [Propositions de Correction](#5-propositions-de-correction)

---

## 1️⃣ COMPRÉHENSION SYSTÈME ACTUEL

### Vue d'ensemble

Le système fast food comporte **DEUX mécanismes distincts mais interconnectés:**

#### **Mécanisme A: Checkbox "Fast food ?" + Dropdown Restaurant**
- **Fichiers:** `RepasBloc.js`, `repas.js`
- **Table Supabase:** `fast_food_history`
- **Objectif:** Tracking spécifique fast food avec règle délai 45 jours
- **Fonctionnalités:**
  - Enregistrement dans table dédiée `fast_food_history`
  - Calcul délai entre consommations (règle 45 jours)
  - Système récompenses/badges (`getFastFoodRewards()`)
  - Affichage "Prochain créneau disponible" dans tableau de bord

#### **Mécanisme B: Catégorie "fast-food" dans Référentiel**
- **Fichier:** `data/referentiel.js`
- **Produits:** 104 plats avec `categorie: "fast-food"`
  - McDonald's (45 produits)
  - KFC (29 produits)
  - Subway (14 produits)
  - Burger King (10 produits)
  - Autres (6 produits: Big Mac, Subway Sub, Pitaya wok, etc.)
- **Objectif:** Autocomplete + calcul calorique automatique
- **Pas de tracking dédié:** Simplement des aliments dans le référentiel

### Fichiers Impliqués

```
SYSTÈME FAST FOOD (7 fichiers principaux):
├── /components/RepasBloc.js (ligne 120-600)
│   ├── Checkbox "Fast food ?"
│   ├── Dropdown restaurant (fastFoodList)
│   ├── Calcul délai 45 jours
│   └── Affichage récompense
│
├── /pages/repas.js (ligne 1-80)
│   ├── Formulaire édition repas
│   ├── Checkbox isFastFood
│   └── Insert fast_food_history
│
├── /pages/tableau-de-bord.js (ligne 60-680)
│   ├── État fastFoodHistory
│   ├── État nextFastFoodDate
│   ├── État fastFoodDelay
│   ├── Affichage "Prochain créneau" (ligne 639-643)
│   └── Section badges fast food (ligne 973-980)
│
├── /pages/historique-fast-food.js
│   └── Liste complète historique
│
├── /lib/fastFoodRewards.js
│   ├── Calcul récompenses
│   ├── Badges délai respecté
│   └── Badge spécial (3× 45 jours consécutifs)
│
├── /data/menus_restaurants_selection.json
│   ├── Liste restaurants (Pitaya, Subway, Starbucks, etc.)
│   └── Plats par restaurant (pas utilisé actuellement?)
│
└── /data/referentiel.js
    └── 104 plats categorie: "fast-food"
```

---

## 2️⃣ ANOMALIE #1 - DÉLAI FAST FOOD

### ❌ Problème Identifié

**Roadmap dit:** "la date du prochain créneau fast food n'est affichée que sur la vue mensuelle"

**Réalité Code:**

#### Tableau de Bord (`tableau-de-bord.js` lignes 639-643):
```javascript
{nextFastFoodDate && (
  <div style={{color:'#e65100', marginTop:8}}>
    Prochain créneau disponible : <b>{nextFastFoodDate.toLocaleDateString('fr-FR')}</b><br/>
    Délai restant : <b>{fastFoodDelay} jour{fastFoodDelay>1?'s':''}</b>
  </div>
)}
```

✅ **Affiché sur toutes les périodes** (semaine, mois, année)

#### RepasBloc (`RepasBloc.js` lignes 467-501):
```javascript
const lastDate = new Date(lastFastFood.date);
const nextDate = new Date(lastDate);
nextDate.setDate(lastDate.getDate() + 45);
const diffDays = Math.max(0, Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)));

astuce = <><br /><span style={{ fontWeight: 500 }}>
  Suggestion : planifie le prochain fast food dans {diffDays} jours.
</span></>;
```

✅ **Affiché dans RepasBloc également**

### 🔍 Analyse de l'Anomalie

**CONCLUSION:** L'anomalie mentionnée dans `roadmap_suggestions_fastfood_assiduite.md` est **OBSOLÈTE**.

Le code actuel affiche déjà la date du prochain créneau:
- ✅ Vue tableau de bord (toutes périodes)
- ✅ RepasBloc (lors saisie repas)

**TOUTEFOIS, ANOMALIE RÉELLE DÉTECTÉE:**

#### Calcul du Délai Incohérent Entre Fichiers

**Tableau de Bord (`tableau-de-bord.js` ligne 136-143):**
```javascript
// Calcul délai: dernier fast food + 45 jours
const nextDate = new Date(lastDate);
nextDate.setDate(lastDate.getDate() + 45);
const delay = Math.max(0, Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)));
setFastFoodDelay(delay);
```

**RepasBloc (`RepasBloc.js` ligne 130-135):**
```javascript
// Vérification si délai respecté (45 jours)
const lastDate = new Date(lastFastFood.date);
const currentDate = new Date(date);
const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
setFastFoodReward(diffDays >= 45);
```

**Lib Rewards (`fastFoodRewards.js` ligne 18-27):**
```javascript
// Boucle historique pour compter délais respectés
const diff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
if (diff >= 45) {
  nbDelaisRespectes++;
  successStreak++;
}
```

### 🚨 ANOMALIE CRITIQUE #1

**Problème:** Calcul délai **Math.ceil vs Math.floor** incohérent

- `tableau-de-bord.js`: utilise `Math.ceil` (arrondi supérieur)
- `RepasBloc.js`: utilise `Math.floor` (arrondi inférieur)  
- `fastFoodRewards.js`: utilise `Math.floor` (arrondi inférieur)

**Impact:**
- Affichage "Délai restant: 1 jour" mais validation refuse le fast food
- Utilisateur confus: système dit "demain OK" mais formulaire refuse

**Exemple Concret:**
```
Dernier fast food: 2025-12-01
Date actuelle: 2026-01-14 (44.5 jours écoulés)

Tableau de bord: Math.ceil(0.5) = 1 jour restant → "Prochain créneau demain"
RepasBloc: Math.floor(44.5) = 44 < 45 → ❌ Récompense refusée
```

---

## 3️⃣ ANOMALIE #2 - DOUBLON CATÉGORIE VS CHECKBOX

### ❌ Problème Identifié

**Utilisateur demande:** "est-ce un doublon? comment ça fonctionne?"

### Vue d'ensemble des Deux Systèmes

#### **SYSTÈME 1: Checkbox "Fast food ?" (Tracking Dédié)**

**Interface (RepasBloc.js ligne 545-567):**
```javascript
{/* Case à cocher Fast food */}
<label>
  <input type="checkbox" checked={isFastFood} onChange={e => setIsFastFood(e.target.checked)} />
  Fast food ?
</label>

{/* Liste déroulante des restaurants si Fast food coché */}
{isFastFood && (
  <div>
    <label>Choix du restaurant</label>
    <select value={fastFoodType} onChange={e => setFastFoodType(e.target.value)}>
      <option value="">Sélectionner…</option>
      {fastFoodList.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  </div>
)}
```

**Données Enregistrées:**
- Table: `fast_food_history`
- Champs: `user_id`, `date`, `restaurant`, `aliments[]`
- Objectif: **Tracking règle 45 jours + récompenses**

**Liste Restaurants (`fastFoodList`):**
```javascript
// Source probable: menus_restaurants_selection.json
[
  "Pitaya",
  "Subway", 
  "Starbucks",
  "Class'Croute",
  "Bamboo Sushi",
  "Royal Buffet Tours",
  "McDonald's",
  "KFC",
  "Burger King",
  "Autre"
]
```

#### **SYSTÈME 2: Catégorie "fast-food" (Référentiel)**

**Exemples de Plats:**
```javascript
{ nom: "Big Mac", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 503, qn: 1 }
{ nom: "Wrap KFC", categorie: "fast-food", sousCategorie: "Wrap", marque: "KFC", kcal: 420, qn: 1 }
{ nom: "Sub Subway", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 350, qn: 1 }
```

**Objectif:**
- Autocomplete dans champ "Aliment mangé"
- Calcul automatique kcal
- Pas de tracking délai (juste des aliments normaux)

### 🚨 ANOMALIE CRITIQUE #2

**Problème:** **DOUBLON FONCTIONNEL** avec confusion UX

#### **Scénario 1: Utilisateur Sélectionne "Wrap KFC" du Référentiel**

1. User tape "Wrap KFC" dans champ "Aliment mangé"
2. Autocomplete propose "Wrap KFC" (vient du référentiel `categorie: "fast-food"`)
3. User sélectionne → kcal rempli automatiquement (420 kcal)
4. **MAIS:** Checkbox "Fast food ?" reste **NON cochée**
5. **RÉSULTAT:** 
   - ✅ Repas enregistré dans `repas_reels` avec aliment="Wrap KFC"
   - ❌ PAS enregistré dans `fast_food_history`
   - ❌ PAS de tracking délai 45 jours
   - ❌ PAS de badge/récompense

#### **Scénario 2: Utilisateur Coche "Fast food ?" Manuellement**

1. User coche "Fast food ?"
2. Dropdown "Choix du restaurant" apparaît
3. User sélectionne "KFC"
4. User tape manuellement "Wrap KFC" dans champ "Aliment mangé"
5. **RÉSULTAT:**
   - ✅ Repas enregistré dans `repas_reels`
   - ✅ Enregistré dans `fast_food_history` (restaurant: "KFC")
   - ✅ Tracking délai 45 jours activé
   - ✅ Badges activés

### 🤔 Confusion Utilisateur

**Question:** Pourquoi dois-je cocher "Fast food ?" si j'ai déjà sélectionné "Wrap KFC" du référentiel qui a `categorie: "fast-food"`?

**Réponse Actuelle:** Les deux systèmes sont **indépendants**
- Référentiel = base de données aliments (autocomplete + kcal)
- Checkbox = activation tracking spécial fast food

**Problème UX:** 
- ❌ Pas intuitif: user pense que sélectionner aliment fast-food active automatiquement tracking
- ❌ Risque oubli: user oublie de cocher la checkbox → perd badges/récompenses
- ❌ Double saisie: user doit sélectionner restaurant PUIS aliment (redondance)

### 📊 Données Réelles Actuelles

**Référentiel `fast-food` (104 plats):**
```
McDonald's:
  - Big Mac, McChicken, Royal Deluxe, Royal Cheese, Double Cheese, Filet-O-Fish
  - McWrap Poulet, Hamburger McDo, Cheeseburger McDo
  - Frites (petite, moyenne, grande)
  - Nuggets (1 pièce, menu 4, 6, 9, 20 pièces)
  - Desserts (McFlurry Oreo/M&M's, Sundae, Donuts)
  - Boissons (Coca, Sprite, Fanta, Milkshake en 3 tailles chacun)
  
KFC:
  - Burgers (Colonel Original, Zinger, Kentucky Burger)
  - Poulet (Original 1 pièce, Hot Wings, Tenders en plusieurs formats)
  - Bucket 10 pièces
  - Frites (petite, moyenne, grande)
  - Accompagnements (Coleslaw, Purée, Maïs)
  - Desserts (Sundae, Cookie, Brownie, Glaces)
  
Subway:
  - Subs 15cm (6 variétés)
  - Subs 30cm (6 variétés)
  - Wraps (3 variétés)
  - Salades (3 variétés)
  - Chips Lay's
  
Burger King:
  - Burgers (Whopper, Whopper Jr, Double Whopper, Chicken Royale, Steakhouse, Crispy Chicken, Fish King)
  - Frites (petite, moyenne, grande)
  - Onion Rings
  - Desserts
```

**Menu Restaurants (`menus_restaurants_selection.json`):**
```json
{
  "Pitaya": ["Pad Thaï poulet", "Bo Bun bœuf", "Nasi Goreng", ...],
  "Subway": ["Sub Poulet Teriyaki", "Cookie Subway", ...],
  "Starbucks": ["Cappuccino", "Frappuccino Caramel", ...],
  "Class'Croute": ["Salade César", "Wrap poulet curry", ...],
  "Bamboo Sushi": [...]
}
```

**❌ INCOHÉRENCE:** 
- `menus_restaurants_selection.json` existe mais **PAS UTILISÉ**
- Dropdown restaurants utilise probablement liste hardcodée
- Aliments fast food viennent du référentiel général, pas du JSON

---

## 4️⃣ ARCHITECTURE TECHNIQUE

### Schéma Actuel

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE REPASBLOC                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────┬─────────────────┐
                              │             │                 │
                     ┌────────▼────────┐   │    ┌───────────▼─────────┐
                     │ Champ "Aliment" │   │    │ Checkbox "Fast food"│
                     │    (autocomplete)│   │    │  + Dropdown resto   │
                     └────────┬────────┘   │    └───────────┬─────────┘
                              │             │                │
                     ┌────────▼────────┐   │    ┌───────────▼─────────┐
                     │  Référentiel    │   │    │  fastFoodList       │
                     │ 425 plats       │   │    │  (10 restaurants)   │
                     │ dont 104        │   │    └───────────┬─────────┘
                     │ "fast-food"     │   │                │
                     └────────┬────────┘   │                │
                              │             │                │
                     ┌────────▼────────┐   │    ┌───────────▼─────────┐
                     │  repas_reels    │   │    │ fast_food_history   │
                     │  (table générale)│   │    │ (table dédiée)      │
                     └─────────────────┘   │    └───────────┬─────────┘
                                            │                │
                                            │    ┌───────────▼─────────┐
                                            │    │ Calcul Délai 45j    │
                                            │    │ Récompenses/Badges  │
                                            │    │ Affichage Tableau   │
                                            │    └─────────────────────┘
                                            │
                     ┌──────────────────────▼────────────────┐
                     │  menus_restaurants_selection.json     │
                     │  (NON UTILISÉ ACTUELLEMENT)           │
                     └───────────────────────────────────────┘
```

### Flux Données

#### **Flux A: Sélection Aliment Fast Food du Référentiel**
```
1. User tape "Big Mac" dans champ aliment
2. Autocomplete affiche "Big Mac" (categorie: "fast-food")
3. User sélectionne → kcal auto-rempli (503 kcal)
4. Checkbox "Fast food ?" = NON cochée
5. Submit → Insert dans repas_reels UNIQUEMENT
6. ❌ PAS de tracking fast food
```

#### **Flux B: Checkbox Fast Food Cochée**
```
1. User coche "Fast food ?"
2. Dropdown restaurant apparaît
3. User sélectionne "McDonald's"
4. User tape "Big Mac" dans aliment
5. Submit → Insert dans:
   - repas_reels (table générale)
   - fast_food_history (table tracking)
6. ✅ Tracking délai 45 jours activé
```

### Variables d'État Clés

**RepasBloc.js:**
```javascript
const [isFastFood, setIsFastFood] = useState(false);           // Checkbox état
const [fastFoodType, setFastFoodType] = useState('');          // Restaurant sélectionné
const [fastFoodHistory, setFastFoodHistory] = useState([]);    // Historique pour calcul
const [fastFoodReward, setFastFoodReward] = useState(false);   // Récompense si délai OK
const [fastFoodAliments, setFastFoodAliments] = useState([]); // Liste aliments fast food
```

**tableau-de-bord.js:**
```javascript
const [fastFoodHistory, setFastFoodHistory] = useState([]);    // Table fast_food_history
const [fastFoodCount, setFastFoodCount] = useState(0);         // Nombre fast food période
const [nextFastFoodDate, setNextFastFoodDate] = useState(null);// Prochain créneau
const [fastFoodDelay, setFastFoodDelay] = useState(0);         // Jours restants
const [badgesFastFood, setBadgesFastFood] = useState([]);      // Badges débloqués
```

---

## 5️⃣ PROPOSITIONS DE CORRECTION

### 🎯 Objectifs

1. ✅ Résoudre incohérence calcul délai (Math.ceil vs Math.floor)
2. ✅ Éliminer doublon fonctionnel (auto-détection fast food)
3. ✅ Simplifier UX (moins de clics utilisateur)
4. ✅ Utiliser `menus_restaurants_selection.json` ou le supprimer
5. ✅ Garantir tracking cohérent

### 📋 PROPOSITION A - Auto-Détection via Catégorie (Recommandé)

#### Principe
Si user sélectionne aliment avec `categorie: "fast-food"` → **activer automatiquement tracking**

#### Modifications

**1. RepasBloc.js - Auto-cocher checkbox:**
```javascript
// Ajouter useEffect pour auto-détection
useEffect(() => {
  if (aliment) {
    const found = referentielAliments.find(r => r.nom.toLowerCase() === aliment.toLowerCase());
    if (found && found.categorie === 'fast-food') {
      setIsFastFood(true);
      // Auto-remplir restaurant si marque disponible
      if (found.marque && fastFoodList.includes(found.marque)) {
        setFastFoodType(found.marque);
      }
    }
  }
}, [aliment]);
```

**2. Interface - Rendre checkbox lecture seule si auto-détecté:**
```javascript
<label>
  <input 
    type="checkbox" 
    checked={isFastFood} 
    onChange={e => !isAutoDetected && setIsFastFood(e.target.checked)}
    disabled={isAutoDetected}
  />
  Fast food ?
  {isAutoDetected && <span style={{color:'#e65100'}}> (détecté automatiquement)</span>}
</label>
```

**3. Dropdown restaurant - Masquer si auto-rempli:**
```javascript
{isFastFood && !fastFoodType && (
  <div>
    <label>Choix du restaurant</label>
    <select value={fastFoodType} onChange={e => setFastFoodType(e.target.value)}>
      {/* ... */}
    </select>
  </div>
)}
```

#### Avantages
- ✅ Moins de clics user (auto-détection)
- ✅ Pas d'oubli tracking (automatique)
- ✅ Utilise info déjà présente (categorie + marque)
- ✅ Garde possibilité saisie manuelle (checkbox toujours là)

#### Inconvénients
- ⚠️ Tous les aliments fast-food référentiel = fast food (peut-être voulu?)
- ⚠️ User ne peut pas "opt-out" si veut juste aliment sans tracking

### 📋 PROPOSITION B - Fusion Référentiel + menus_restaurants_selection.json

#### Principe
Utiliser `menus_restaurants_selection.json` comme source unique pour dropdown + plats

#### Modifications

**1. Supprimer 104 plats `fast-food` du référentiel général**
- Garder uniquement dans menus_restaurants_selection.json
- Référentiel = aliments "normaux" + ingrédients de base

**2. Dropdown restaurant charge plats dynamiquement:**
```javascript
const [restaurantMenus, setRestaurantMenus] = useState({});

useEffect(() => {
  // Charger menus_restaurants_selection.json
  fetch('/data/menus_restaurants_selection.json')
    .then(r => r.json())
    .then(data => setRestaurantMenus(data));
}, []);

// Quand restaurant sélectionné, afficher ses plats
{isFastFood && fastFoodType && (
  <div>
    <label>Plat {fastFoodType}</label>
    <select value={selectedPlat} onChange={handlePlatChange}>
      {restaurantMenus[fastFoodType]?.plats.map(p => (
        <option key={p.nom} value={p.nom}>{p.nom} ({p.kcal} kcal)</option>
      ))}
    </select>
  </div>
)}
```

#### Avantages
- ✅ Séparation claire: fast food = système dédié
- ✅ Utilise JSON existant (pas de doublon)
- ✅ Kcal automatique via JSON
- ✅ Extensible (ajouter restaurants dans JSON)

#### Inconvénients
- ❌ Perte autocomplete fast food dans champ général
- ❌ User doit cocher checkbox AVANT chercher aliment
- ❌ Moins flexible (limité aux plats du JSON)

### 📋 PROPOSITION C - Correction Minimale (Math.floor Unifié)

#### Principe
Corriger uniquement le bug Math.ceil vs Math.floor

#### Modifications

**1. Uniformiser calcul délai sur Math.floor partout:**

**tableau-de-bord.js ligne 143:**
```javascript
// AVANT
const delay = Math.max(0, Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)));

// APRÈS
const delay = Math.max(0, Math.floor((nextDate - today) / (1000 * 60 * 60 * 24)));
```

**2. Ajouter message explicatif:**
```javascript
{nextFastFoodDate && (
  <div style={{color:'#e65100', marginTop:8}}>
    Prochain créneau disponible : <b>{nextFastFoodDate.toLocaleDateString('fr-FR')}</b><br/>
    Délai restant : <b>{fastFoodDelay} jour{fastFoodDelay>1?'s':''}</b>
    {fastFoodDelay === 0 && <span> (disponible aujourd'hui !)</span>}
  </div>
)}
```

#### Avantages
- ✅ Correction rapide (2 lignes)
- ✅ Pas de refonte architecture
- ✅ Résout bug principal

#### Inconvénients
- ❌ Ne résout pas le doublon catégorie/checkbox
- ❌ UX reste sous-optimale

### 📋 PROPOSITION D - Hybride (Recommandé Final)

**Combinaison A + C:**

1. **Corriger Math.floor** (Proposition C)
2. **Auto-détection fast food** (Proposition A)
3. **Garder dropdown manuel** pour plats hors référentiel
4. **Utiliser menus_restaurants_selection.json** pour enrichir autocomplete

#### Implémentation

**Phase 1: Correction Bug Délai (urgent)**
- Uniformiser Math.floor dans les 3 fichiers
- Test: vérifier délai affiché = délai validé

**Phase 2: Auto-Détection (amélioration UX)**
- Auto-cocher checkbox si categorie: "fast-food"
- Auto-remplir restaurant si marque disponible
- Garder possibilité override manuel

**Phase 3: Enrichissement (optionnel)**
- Charger menus_restaurants_selection.json
- Ajouter plats JSON à autocomplete
- Compléter référentiel avec plats manquants du JSON

#### Avantages
- ✅ Résout les 2 anomalies
- ✅ Améliore UX sans casser existant
- ✅ Garde flexibilité
- ✅ Progressif (peut s'arrêter après Phase 1 si besoin)

---

## 🎯 RECOMMANDATION FINALE

### Priorité HAUTE (à faire maintenant)
✅ **Corriger Math.floor** (Proposition C - Phase 1)

**Fichiers à modifier:**
1. `/pages/tableau-de-bord.js` ligne 143
2. Vérifier `/components/RepasBloc.js` ligne 133 (déjà Math.floor)
3. Vérifier `/lib/fastFoodRewards.js` ligne 20 (déjà Math.floor)

**Temps:** 10 minutes  
**Risque:** Minimal  
**Impact:** Résout confusion utilisateur

### Priorité MOYENNE (à planifier)
⏳ **Auto-Détection Fast Food** (Proposition A)

**Fichiers à modifier:**
1. `/components/RepasBloc.js` - Ajouter useEffect auto-détection
2. Tests UI pour vérifier comportement

**Temps:** 1-2h  
**Risque:** Moyen (changement comportement)  
**Impact:** Améliore UX significativement

### Priorité BASSE (amélioration continue)
📋 **Fusion menus_restaurants_selection.json** (Proposition B - optionnel)

**Décision à prendre:**
- Garder doublon référentiel + JSON?
- Ou fusion complète?

**Temps:** 3-4h  
**Risque:** Élevé (refonte architecture)  
**Impact:** Meilleure maintenabilité long terme

---

## 📊 RÉSUMÉ EXÉCUTIF

### Anomalies Identifiées

| # | Anomalie | Gravité | Impact Utilisateur | Fichiers Impactés |
|---|----------|---------|-------------------|-------------------|
| 1 | Math.ceil vs Math.floor | 🔴 CRITIQUE | Confusion délai affiché ≠ validation | tableau-de-bord.js, RepasBloc.js, fastFoodRewards.js |
| 2 | Doublon catégorie/checkbox | 🟠 MAJEUR | Oubli tracking, double saisie | RepasBloc.js, referentiel.js |
| 3 | JSON non utilisé | 🟡 MINEUR | Fichier mort, confusion maintenance | menus_restaurants_selection.json |

### Actions Recommandées

```
PHASE 1 - URGENT (10 min):
└── Uniformiser Math.floor dans tableau-de-bord.js

PHASE 2 - COURT TERME (1-2h):
└── Auto-détection fast food via categorie

PHASE 3 - LONG TERME (backlog):
└── Décision stratégique: garder ou fusionner JSON
```

---

**Fin de l'analyse**  
**Questions/Validation utilisateur requise avant implémentation**

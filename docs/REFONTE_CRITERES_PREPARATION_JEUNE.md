# 🔄 REFONTE CRITÈRES DE PRÉPARATION AU JEÛNE

**Date création** : 7 décembre 2025  
**Objectif** : Ajouter guidances pédagogiques (POURQUOI/COMMENT) aux 9 critères officiels de la fiche métier  
**Statut** : ⏳ EN COURS

---

## ⚠️ **RÈGLE ABSOLUE**

**CRITÈRE = FICHE MÉTIER (INTOUCHABLE)**
- Titre officiel : JAMAIS modifié
- Description officielle : JAMAIS modifiée  
- Jalon : JAMAIS modifié

**GUIDANCE = AIDE À L'UTILISATEUR (AJOUTÉE)**
- POURQUOI : Explication pédagogique courte
- COMMENT : Actions concrètes avec repères visuels
- SUIVI : Tracker quotidien simple (Oui/Non par jour)

**VALIDATION DU CRITÈRE** :
- Minimum 5/7 jours validés dans le suivi quotidien
- Stockage localStorage uniquement (pas d'authentification)

---

## 📋 **PRIORISATION DES REFORMULATIONS**

### 🔴 **URGENT** (critères flous/dangereux)
1. ✅ **Critère 6** : "2 jours de jeûne plein"
2. ✅ **Critère 4** : "Produits transformés"
3. ✅ **Critère 1** : "Respect quantités"

### 🟠 **IMPORTANT** (amélioration UX significative)
4. ⏳ **Critère 9** : "Plage 45 min"
5. ⏳ **Critère 3** : "Action après repas"
6. ⏳ **Critère 7** : "2L eau"

### 🟢 **AMÉLIORATION MINEURE** (déjà clairs)
7. ⏳ **Critère 2** : "Féculents le soir"
8. ⏳ **Critère 5** : "Sucreries"
9. ⏳ **Critère 8** : "Pas repas 19h"

---

## 📝 **CRITÈRES REFORMULÉS**

### 🔴 **CRITÈRE 6 : 2 jours de jeûne plein (J-12)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "2 jours de jeûne plein (préparation métabolique)"
Description : "Effectuer 2 jours de jeûne complet pour préparer le métabolisme à la phase de jeûne prolongé"
Jalon : J-12
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 6 : 2 jours de jeûne plein (J-12)         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Effectuer 2 jours de jeûne complet pour préparer     │
│ le métabolisme à la phase de jeûne prolongé.         │
│                                                        │
│ Progression : 1/2 jeûnes complétés                    │
│ [████████░░░░░░░░░░░░] 50%                            │
│                                                        │
│ [▼ En savoir plus] [Valider - grisé]                 │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 6 : 2 jours de jeûne plein (J-12)         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Effectuer 2 jours de jeûne complet pour préparer     │
│ le métabolisme à la phase de jeûne prolongé.         │
│                                                        │
│ Progression : 1/2 jeûnes complétés [████████░░░░] 50%│
│                                                        │
│ [▲ Replier]                                           │
│                                                        │
│ ┌───── 🎯 CHOISIR DURÉE DES JEÛNES ────────────────┐  │
│ │ ○ Option A : 2 jeûnes de 24h (critère officiel)│  │
│ │ ○ Option B : 2 jeûnes de 16h (alternative)     │  │
│ │ ● Option C : Durée personnalisée [CHOISI]      │  │
│ │                                                  │  │
│ │ Configuration personnalisée :                   │  │
│ │ • Nombre de jeûnes : [2] ▼ (1 à 4)             │  │
│ │ • Durée par jeûne : [18] heures ▼ (12h à 48h)  │  │
│ │                                                  │  │
│ │ 💡 Recommandations :                            │  │
│ │    Débutant : 14-16h                            │  │
│ │    Intermédiaire : 18-20h                       │  │
│ │    Avancé : 24h+                                │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────┐  │
│ │ Avant un jeûne long, ton corps doit apprendre  │  │
│ │ à puiser dans ses réserves. Le jeûne           │  │
│ │ intermittent prépare ton métabolisme sans      │  │
│ │ danger. Tu habitues progressivement ton corps  │  │
│ │ à fonctionner sans apport alimentaire.         │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────┐  │
│ │ 1. Choisis des jours NON CONSÉCUTIFS          │  │
│ │ 2. Note l'heure du dernier repas               │  │
│ │ 3. Calcule l'heure du premier repas suivant    │  │
│ │ 4. Pendant le jeûne : eau, tisanes, thé/café   │  │
│ │    sans sucre uniquement                        │  │
│ │ 5. Si vertiges/malaise : ARRÊTE et mange       │  │
│ │ 6. Évite les journées intenses (sport, stress) │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI DES JEÛNES ────────────────────┐  │
│ │                                                  │  │
│ │ Jeûne 1/2 : ✅ Complété le 15/01/2025          │  │
│ │ └─ 18:00 → 12:00 (lendemain) = 18h             │  │
│ │ └─ Hydratation OK, ressenti : Acceptable       │  │
│ │                                                  │  │
│ │ Jeûne 2/2 : ⏳ En attente                       │  │
│ │ └─ Date : [Sélectionner]                       │  │
│ │ └─ Horaires : [__:__] → [__:__]                │  │
│ │ └─ Durée cible : 18h                            │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── ⚠️ CONTRE-INDICATIONS ──────────────────┐  │
│ │ • Diabète, hypoglycémie, troubles alim.       │  │
│ │ • Grossesse, allaitement                       │  │
│ │ • En cas de doute : consulte un médecin       │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere6": {
    "optionChoisie": "C",  // "A", "B", ou "C"
    "config": {
      "nombreJeunes": 2,
      "dureeHeures": 18
    },
    "suiviJeunes": [
      {
        "numero": 1,
        "date": "2025-01-15",
        "dernierRepas": "18:00",
        "premierRepas": "12:00",
        "dureeEffective": 18,
        "hydratation": true,
        "ressenti": "acceptable",
        "complete": true
      },
      {
        "numero": 2,
        "date": null,
        "complete": false
      }
    ],
    "valide": false
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere6(data) {
  const { config, suiviJeunes } = data;
  const jeunesCompletes = suiviJeunes.filter(j => j.complete);
  
  // Tous les jeûnes requis complétés avec durée suffisante
  return jeunesCompletes.length >= config.nombreJeunes &&
         jeunesCompletes.every(j => j.dureeEffective >= config.dureeHeures);
}
```

**Statut** : ✅ VALIDÉ

---

### 🔴 **CRITÈRE 4 : Supprimer produits ultra-transformés (J-14)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Supprimer les produits ultra-transformés"
Description : "Éliminer tous les aliments industriels ultra-transformés de ton alimentation"
Jalon : J-14
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 4 : Supprimer produits ultra-transformés  │
│                                            (J-14)      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Éliminer tous les aliments industriels               │
│ ultra-transformés de ton alimentation.                │
│                                                        │
│ Cette semaine : 5/7 jours réussis                     │
│ [████████████░░░░░] 71%                               │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                 │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 4 : Supprimer produits ultra-transformés  │
│                                            (J-14)      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Éliminer tous les aliments industriels               │
│ ultra-transformés de ton alimentation.                │
│                                                        │
│ Cette semaine : 5/7 jours réussis [████████████░░] 71%│
│                                                        │
│ [▲ Replier]                                           │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────┐  │
│ │ Les produits ultra-transformés (>5 ingrédients,│  │
│ │ additifs E-xxx) surchargent ton système        │  │
│ │ digestif et perturbent ta préparation           │  │
│ │ métabolique. Ton corps doit être "propre"      │  │
│ │ avant le jeûne pour faciliter l'autophagie.    │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────┐  │
│ │                                                  │  │
│ │ 📏 RÈGLE DES 5 INGRÉDIENTS :                    │  │
│ │ 1. Lis l'étiquette avant d'acheter              │  │
│ │ 2. Si + de 5 ingrédients → ultra-transformé    │  │
│ │ 3. Évite si tu vois :                           │  │
│ │    • E-xxx (additifs chimiques)                 │  │
│ │    • Sirop de glucose/fructose                  │  │
│ │    • Huile de palme hydrogénée                  │  │
│ │    • Mots incompréhensibles                     │  │
│ │                                                  │  │
│ │ 🔄 REMPLACEMENTS SIMPLES :                      │  │
│ │ ❌ Gâteaux industriels → ✅ Fruits, dattes      │  │
│ │ ❌ Plats préparés → ✅ Cuisine maison           │  │
│ │ ❌ Céréales sucrées → ✅ Flocons d'avoine       │  │
│ │ ❌ Sauces industrielles → ✅ Huile + citron     │  │
│ │ ❌ Pain de mie → ✅ Pain boulangerie            │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────┐  │
│ │                                                  │  │
│ │ Lun 13/01 : ✅ 0 produit ultra-transformé       │  │
│ │ Mar 14/01 : ✅ 0 produit ultra-transformé       │  │
│ │ Mer 15/01 : ❌ 1 plat préparé midi             │  │
│ │ Jeu 16/01 : ✅ 0 produit ultra-transformé       │  │
│ │ Ven 17/01 : ✅ 0 produit ultra-transformé       │  │
│ │ Sam 18/01 : ❌ Gâteaux apéro                   │  │
│ │ Dim 19/01 : ✅ 0 produit ultra-transformé       │  │
│ │                                                  │  │
│ │ Question quotidienne :                          │  │
│ │ "Aujourd'hui, j'ai évité tous les produits     │  │
│ │  à plus de 5 ingrédients"                       │  │
│ │                                                  │  │
│ │ ○ Oui (5/7)  ○ Non (2/7)                        │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere4": {
    "suiviQuotidien": [
      { "date": "2025-01-13", "respecte": true },
      { "date": "2025-01-14", "respecte": true },
      { "date": "2025-01-15", "respecte": false },
      { "date": "2025-01-16", "respecte": true },
      { "date": "2025-01-17", "respecte": true },
      { "date": "2025-01-18", "respecte": false },
      { "date": "2025-01-19", "respecte": true }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere4(data) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

### 🔴 **CRITÈRE 1 : Respecter les quantités (J-30)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Respecter strictement les quantités recommandées"
Description : "Suivre les portions recommandées pour chaque type d'aliment"
Jalon : J-30
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 1 : Respecter les quantités (J-30)        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Suivre les portions recommandées pour chaque type    │
│ d'aliment.                                            │
│                                                        │
│ Cette semaine : 6/7 jours réussis                     │
│ [█████████████████░] 86%                              │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                 │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 1 : Respecter les quantités (J-30)        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Suivre les portions recommandées pour chaque type    │
│ d'aliment.                                            │
│                                                        │
│ Cette semaine : 6/7 jours réussis [██████████████] 86%│
│                                                        │
│ [▲ Replier]                                           │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────┐  │
│ │ Avant un jeûne, ton estomac doit s'habituer à  │  │
│ │ des portions normales (pas de sur-alimentation).│  │
│ │ Les repères visuels simples te permettent de   │  │
│ │ doser sans balance ni stress.                   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────┐  │
│ │                                                  │  │
│ │ 📏 REPÈRES VISUELS :                            │  │
│ │                                                  │  │
│ │ 🥩 PROTÉINES (viande, poisson, œufs)           │  │
│ │    • 1 poing = 150g                             │  │
│ │    • Épaisseur d'un téléphone                   │  │
│ │                                                  │  │
│ │ 🍚 FÉCULENTS (riz, pâtes, pain)                 │  │
│ │    • 1 poing = 150g cuit                        │  │
│ │    • 3 cuillères à soupe bombées                │  │
│ │                                                  │  │
│ │ 🥦 LÉGUMES                                       │  │
│ │    • 2 poings = 300g                            │  │
│ │    • Ce qui tient dans tes 2 mains             │  │
│ │                                                  │  │
│ │ 🫒 MATIÈRES GRASSES (huile, beurre)            │  │
│ │    • 1 cuillère à soupe = 10g                   │  │
│ │    • Taille d'un pouce                          │  │
│ │                                                  │  │
│ │ 🧀 FROMAGE                                       │  │
│ │    • 2 cuillères à café = 30g                   │  │
│ │    • Épaisseur de 2 doigts                      │  │
│ │                                                  │  │
│ │ 💡 ASTUCE COUVERTS :                            │  │
│ │ • 1 fourchette pâtes = 30g (3 = portion)       │  │
│ │ • 1 c.à.s bombée riz = 20g (3 = portion)       │  │
│ │ • 1 c.à.c = 5g (sucre, beurre)                 │  │
│ │                                                  │  │
│ │ 🍽️ EXEMPLE REPAS :                              │  │
│ │ 🥩 1 poing poulet (150g)                        │  │
│ │ 🍚 3 c.à.s riz (90g)                            │  │
│ │ 🥦 2 poings brocolis (300g)                     │  │
│ │ 🫒 1 c.à.s huile d'olive (10g)                  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────┐  │
│ │                                                  │  │
│ │ Lun 20/01 : ✅ Portions OK (poing)              │  │
│ │ Mar 21/01 : ✅ Portions OK (c.à.s)              │  │
│ │ Mer 22/01 : ✅ Portions OK (fourchette)         │  │
│ │ Jeu 23/01 : ❌ Trop de féculents soir           │  │
│ │ Ven 24/01 : ✅ Portions OK (poing + c.à.s)      │  │
│ │ Sam 25/01 : ✅ Portions OK (repères visuels)    │  │
│ │ Dim 26/01 : ✅ Portions OK (mixte)              │  │
│ │                                                  │  │
│ │ Question quotidienne :                          │  │
│ │ "Aujourd'hui, j'ai utilisé les repères visuels │  │
│ │  pour mes 3 repas"                              │  │
│ │                                                  │  │
│ │ ○ Oui (6/7)  ○ Non (1/7)                        │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere1": {
    "suiviQuotidien": [
      { "date": "2025-01-20", "respecte": true, "methode": "poing" },
      { "date": "2025-01-21", "respecte": true, "methode": "cuillere_soupe" },
      { "date": "2025-01-22", "respecte": true, "methode": "fourchette" },
      { "date": "2025-01-23", "respecte": false, "methode": null },
      { "date": "2025-01-24", "respecte": true, "methode": "mixte" },
      { "date": "2025-01-25", "respecte": true, "methode": "visuel" },
      { "date": "2025-01-26", "respecte": true, "methode": "fourchette_poing" }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere1(data) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

### 🟠 **CRITÈRE 9 : Respecter plages horaires repas (J-7)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Respecter une plage horaire fixe pour chaque repas"
Description : "Manger à heures régulières pour préparer ton rythme circadien"
Jalon : J-7
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 9 : Respecter plages horaires repas (J-7) │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Manger à heures régulières pour préparer ton rythme  │
│ circadien.                                            │
│                                                        │
│ Cette semaine : 6/7 jours réussis                     │
│ [█████████████████░] 86%                              │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                 │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 9 : Respecter plages horaires repas (J-7) │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Manger à heures régulières pour préparer ton rythme  │
│ circadien.                                            │
│                                                        │
│ Cette semaine : 6/7 jours réussis [██████████████] 86%│
│                                                        │
│ [▲ Replier]                                           │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────┐  │
│ │ Ton corps fonctionne avec une horloge interne  │  │
│ │ (rythme circadien). Manger à heures fixes       │  │
│ │ prépare ton métabolisme à anticiper la digestion│  │
│ │ et améliore l'assimilation. Pendant le jeûne,  │  │
│ │ ton corps saura exactement quand "s'éteindre". │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────┐  │
│ │                                                  │  │
│ │ CONSEIL : Définis 3 créneaux fixes dans ta     │  │
│ │ journée (ex: 8h-9h, 12h-13h, 19h-20h) et mange │  │
│ │ UNIQUEMENT pendant ces plages.                  │  │
│ │                                                  │  │
│ │ 📅 Mes créneaux choisis :                       │  │
│ │ • Petit-déjeuner : [8h-9h] ▼                    │  │
│ │ • Déjeuner : [12h-13h] ▼                        │  │
│ │ • Dîner : [19h-20h] ▼                           │  │
│ │                                                  │  │
│ │ ✅ BONNES PRATIQUES :                           │  │
│ │ • Mange assis, sans écran (TV, téléphone)      │  │
│ │ • Mâche bien, pose ta fourchette entre chaque  │  │
│ │   bouchée                                        │  │
│ │ • Écoute tes signaux de satiété                │  │
│ │                                                  │  │
│ │ ❌ ÉVITE :                                       │  │
│ │ • Tout grignotage en dehors des 3 plages       │  │
│ │ • Manger debout, en marchant, devant écran     │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────┐  │
│ │                                                  │  │
│ │ Lun 27/01 : ✅ 3 repas dans les créneaux       │  │
│ │ Mar 28/01 : ✅ 3 repas dans les créneaux       │  │
│ │ Mer 29/01 : ✅ 3 repas dans les créneaux       │  │
│ │ Jeu 30/01 : ❌ Grignotage 16h (échec)          │  │
│ │ Ven 31/01 : ✅ 3 repas dans les créneaux       │  │
│ │ Sam 01/02 : ✅ 3 repas dans les créneaux       │  │
│ │ Dim 02/02 : ✅ 3 repas dans les créneaux       │  │
│ │                                                  │  │
│ │ Question quotidienne :                          │  │
│ │ "Aujourd'hui, j'ai mangé UNIQUEMENT pendant    │  │
│ │  mes 3 créneaux fixes"                          │  │
│ │                                                  │  │
│ │ ○ Oui (6/7)  ○ Non (1/7)                        │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere9": {
    "creneauxChoisis": {
      "petitDejeuner": { "debut": "08:00", "fin": "09:00" },
      "dejeuner": { "debut": "12:00", "fin": "13:00" },
      "diner": { "debut": "19:00", "fin": "20:00" }
    },
    "suiviQuotidien": [
      { "date": "2025-01-27", "respecte": true },
      { "date": "2025-01-28", "respecte": true },
      { "date": "2025-01-29", "respecte": true },
      { "date": "2025-01-30", "respecte": false, "details": "Grignotage 16h" },
      { "date": "2025-01-31", "respecte": true },
      { "date": "2025-02-01", "respecte": true },
      { "date": "2025-02-02", "respecte": true }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere9(data) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

### 🟠 **CRITÈRE 3 : Action après repas (J-17)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Action post-repas immédiate"
Description : "Favoriser la digestion et éviter la léthargie"
Jalon : J-17
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 3 : Action après repas (J-17)             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Favoriser la digestion et éviter la léthargie après  │
│ chaque repas.                                         │
│                                                        │
│ Cette semaine : 6/7 jours réussis                     │
│ [█████████████████░] 86%                              │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                 │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 3 : Action après repas (J-17)             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Favoriser la digestion et éviter la léthargie après  │
│ chaque repas.                                         │
│                                                        │
│ Cette semaine : 6/7 jours réussis [██████████████] 86%│
│                                                        │
│ [▲ Replier]                                           │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────┐  │
│ │ Après un repas, ton corps concentre beaucoup   │  │
│ │ d'énergie sur la digestion. Si tu restes       │  │
│ │ immobile (assis ou allongé), la digestion      │  │
│ │ devient lente et difficile. Une activité légère│  │
│ │ juste après manger aide ton intestin à mieux   │  │
│ │ fonctionner et évite les sensations de lourdeur│  │
│ │ Pendant le jeûne, ton corps aura déjà cette    │  │
│ │ bonne habitude.                                 │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────┐  │
│ │                                                  │  │
│ │ BASE RECOMMANDÉE (par jalon) :                  │  │
│ │ • J-17 à J-14 : 10 min de marche après repas   │  │
│ │ • J-12 à J-7 : 15 min de marche après repas    │  │
│ │ • J-7 à J-0 : 20 min de marche après repas     │  │
│ │                                                  │  │
│ │ OU PERSONNALISE TON ENGAGEMENT :                │  │
│ │ ┌──────────────────────────────────────────┐  │  │
│ │ │ Action choisie : [Marche ▼]              │  │  │
│ │ │ Durée : [15] minutes                     │  │  │
│ │ │ Délai après repas : [10] minutes max     │  │  │
│ │ │                                          │  │  │
│ │ │ Exemples d'actions possibles :          │  │  │
│ │ │ • Marche (intérieur ou extérieur)       │  │  │
│ │ │ • Vaisselle / Rangement                  │  │  │
│ │ │ • Étirements doux                        │  │  │
│ │ │ • Jardinage léger                        │  │  │
│ │ └──────────────────────────────────────────┘  │  │
│ │                                                  │  │
│ │ 💡 ASTUCE :                                      │  │
│ │ Programme une alarme "Action post-repas" 5 min │  │
│ │ après la fin de chaque repas                    │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────┐  │
│ │                                                  │  │
│ │ Lun 13/01 : ✅ Marche 15 min (3 repas OK)      │  │
│ │ Mar 14/01 : ✅ Vaisselle (3 repas OK)          │  │
│ │ Mer 15/01 : ✅ Marche 15 min (3 repas OK)      │  │
│ │ Jeu 16/01 : ❌ Oublié après dîner               │  │
│ │ Ven 17/01 : ✅ Marche 15 min (3 repas OK)      │  │
│ │ Sam 18/01 : ✅ Jardinage léger (3 repas OK)    │  │
│ │ Dim 19/01 : ✅ Étirements doux (3 repas OK)    │  │
│ │                                                  │  │
│ │ Question quotidienne (adaptée) :                │  │
│ │ "Aujourd'hui, j'ai fait [marche 15 min]        │  │
│ │  après chaque repas"                            │  │
│ │                                                  │  │
│ │ ○ Oui (6/7)  ○ Non (1/7)                        │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere3": {
    "engagement": {
      "action": "marche",  // ou "menage", "etirements", "jardinage", "autre"
      "dureeMinutes": 15,
      "delaiMax": 10  // minutes après fin du repas
    },
    "suiviQuotidien": [
      { "date": "2025-01-13", "respecte": true, "details": "3 repas OK" },
      { "date": "2025-01-14", "respecte": true, "details": "3 repas OK" },
      { "date": "2025-01-15", "respecte": true, "details": "3 repas OK" },
      { "date": "2025-01-16", "respecte": false, "details": "Oublié dîner" },
      { "date": "2025-01-17", "respecte": true, "details": "3 repas OK" },
      { "date": "2025-01-18", "respecte": true, "details": "3 repas OK" },
      { "date": "2025-01-19", "respecte": true, "details": "3 repas OK" }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere3(data) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

### 🟠 **CRITÈRE 7 : Hydratation 2L/jour (J-7)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Hydratation optimale (2L/jour)"
Description : "Préparer tes reins et ton foie à la détoxification"
Jalon : J-7
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 7 : Hydratation 2L/jour (J-7)             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Préparer tes reins et ton foie à la détoxification.  │
│                                                        │
│ Cette semaine : 5/7 jours réussis                     │
│ [████████████░░░░░] 71%                               │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                 │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 7 : Hydratation 2L/jour (J-7)             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Préparer tes reins et ton foie à la détoxification.  │
│                                                        │
│ Cette semaine : 5/7 jours réussis [████████████░░] 71%│
│                                                        │
│ [▲ Replier]                                           │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────┐  │
│ │ L'eau permet à tes reins d'évacuer les déchets │  │
│ │ que ton corps produit naturellement. Pendant un │  │
│ │ jeûne, ton organisme va puiser dans ses réserves│  │
│ │ (graisse, protéines) et cela crée beaucoup de  │  │
│ │ déchets métaboliques à éliminer. Si tes reins  │  │
│ │ et ton foie ne sont pas habitués à une bonne    │  │
│ │ hydratation avant le jeûne, ils seront débordés │  │
│ │ pendant. Boire 2 litres par jour les prépare    │  │
│ │ progressivement à cette mission d'élimination   │  │
│ │ intensive.                                       │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────┐  │
│ │                                                  │  │
│ │ RÉPARTIR SUR 4 MOMENTS CLÉS :                   │  │
│ │                                                  │  │
│ │ 🕐 Au réveil (8h) :                             │  │
│ │    1 grande bouteille OU 2 grands verres        │  │
│ │    → Réveille tes reins et active l'élimination│  │
│ │                                                  │  │
│ │ 🕐 Avant/pendant déjeuner (12h) :               │  │
│ │    1 grande bouteille OU 2 grands verres        │  │
│ │    → Aide la digestion                          │  │
│ │                                                  │  │
│ │ 🕐 Milieu d'après-midi (16h) :                  │  │
│ │    1 grande bouteille OU 2 grands verres        │  │
│ │    → Évite la déshydratation                    │  │
│ │                                                  │  │
│ │ 🕐 Avant/pendant dîner (19h) :                  │  │
│ │    1 grande bouteille OU 2 grands verres        │  │
│ │    → Dernière hydratation de la journée         │  │
│ │                                                  │  │
│ │ REPÈRES SIMPLES :                               │  │
│ │ • 1 grande bouteille = 500ml (Évian, Vittel)   │  │
│ │ • 1 grand verre = 250ml (verre à eau)          │  │
│ │ • OBJECTIF : 4 bouteilles OU 8 grands verres   │  │
│ │                                                  │  │
│ │ ✅ CE QUI COMPTE :                              │  │
│ │ • Eau plate ou gazeuse                          │  │
│ │ • Tisanes (camomille, menthe, verveine)        │  │
│ │ • Thé vert ou noir SANS sucre                   │  │
│ │ • Infusions de fruits SANS sucre                │  │
│ │                                                  │  │
│ │ ❌ CE QUI NE COMPTE PAS :                        │  │
│ │ • Café (diurétique = perte d'eau)              │  │
│ │ • Sodas/Jus industriels (sucre = déshydratation│  │
│ │ • Alcool (déshydrate fortement)                 │  │
│ │                                                  │  │
│ │ 💡 ASTUCE :                                      │  │
│ │ Prépare 4 bouteilles d'eau le matin et pose-les│  │
│ │ à des endroits stratégiques (bureau, cuisine,   │  │
│ │ sac). Progression visuelle : 4 pleines le matin │  │
│ │ → 4 vides le soir = objectif atteint !         │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────┐  │
│ │                                                  │  │
│ │ Lun 27/01 : ✅ 2L atteints (4 bouteilles)      │  │
│ │ Mar 28/01 : ✅ 2,5L atteints (5 bouteilles)    │  │
│ │ Mer 29/01 : ❌ 1,5L seulement (3 bouteilles)   │  │
│ │ Jeu 30/01 : ✅ 2L atteints (4 bouteilles)      │  │
│ │ Ven 31/01 : ❌ 1L seulement (2 bouteilles)     │  │
│ │ Sam 01/02 : ✅ 2L atteints (4 bouteilles)      │  │
│ │ Dim 02/02 : ✅ 2L atteints (4 bouteilles)      │  │
│ │                                                  │  │
│ │ Question quotidienne :                          │  │
│ │ "Aujourd'hui, j'ai bu au minimum 2 litres      │  │
│ │  d'eau/tisanes/thé sans sucre (= 4 bouteilles  │  │
│ │  ou 8 grands verres)"                           │  │
│ │                                                  │  │
│ │ ○ Oui (5/7)  ○ Non (2/7)                        │  │
│ │                                                  │  │
│ │ 📝 Note : Critère automatisable via page suivi │  │
│ │ (à traiter plus tard)                           │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere7": {
    "suiviQuotidien": [
      { "date": "2025-01-27", "respecte": true, "quantiteMl": 2000, "details": "4 bouteilles" },
      { "date": "2025-01-28", "respecte": true, "quantiteMl": 2500, "details": "5 bouteilles" },
      { "date": "2025-01-29", "respecte": false, "quantiteMl": 1500, "details": "3 bouteilles" },
      { "date": "2025-01-30", "respecte": true, "quantiteMl": 2000, "details": "4 bouteilles" },
      { "date": "2025-01-31", "respecte": false, "quantiteMl": 1000, "details": "2 bouteilles" },
      { "date": "2025-02-01", "respecte": true, "quantiteMl": 2000, "details": "4 bouteilles" },
      { "date": "2025-02-02", "respecte": true, "quantiteMl": 2000, "details": "4 bouteilles" }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere7(data) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

### 🟢 **CRITÈRE 2 : Féculents le soir (J-17)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Limiter les féculents le soir"
Description : "Reposer le pancréas pendant la nuit"
Jalon : J-17
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 2 : Féculents le soir (J-17)               │
│ ══════════════════════════════════════════════════════ │
│ Reposer le pancréas pendant la nuit.                  │
│                                                        │
│ Cette semaine : 6/7 jours réussis                     │
│ [████████████████░] 86%                               │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                  │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 2 : Féculents le soir (J-17)               │
│ ══════════════════════════════════════════════════════ │
│ Reposer le pancréas pendant la nuit.                  │
│                                                        │
│ Cette semaine : 6/7 jours réussis [██████████████] 86%│
│                                                        │
│ [▲ Replier]                                            │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────────┐  │
│ │ Les féculents (pain, pâtes, riz, pommes de terre│  │
│ │ sont riches en glucides complexes qui se        │  │
│ │ transforment en glucose. Le soir, ton corps a   │  │
│ │ moins besoin d'énergie car tu vas dormir. Si tu │  │
│ │ manges beaucoup de féculents tard, ton pancréas │  │
│ │ doit produire de l'insuline pour gérer ce       │  │
│ │ surplus de glucose, mais comme tu ne bouges pas,│  │
│ │ le glucose est stocké en graisse. Limiter les   │  │
│ │ féculents le soir habitue ton pancréas à        │  │
│ │ travailler moins intensément la nuit, ce qui le │  │
│ │ prépare au repos complet pendant le jeûne.      │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────────┐  │
│ │                                                  │  │
│ │ REPAS DU SOIR SANS FÉCULENT :                   │  │
│ │ Remplace par des légumes + protéines            │  │
│ │                                                  │  │
│ │ ✅ EXEMPLES VALIDÉS :                           │  │
│ │ • Poisson + légumes vapeur + salade             │  │
│ │ • Poulet + ratatouille + brocolis               │  │
│ │ • Omelette + courgettes + tomates               │  │
│ │ • Viande + haricots verts + carottes            │  │
│ │                                                  │  │
│ │ ❌ À ÉVITER LE SOIR :                           │  │
│ │ • Pâtes, riz, pain, pommes de terre             │  │
│ │ • Quinoa, boulgour, semoule                     │  │
│ │ • Pizza, sandwich, burger                       │  │
│ │                                                  │  │
│ │ ⚠️ SI VRAIMENT NÉCESSAIRE (faim intense) :      │  │
│ │ • Maximum 3 cuillères à soupe de féculent       │  │
│ │   complet (riz brun, quinoa)                    │  │
│ │ • Accompagné de beaucoup de légumes             │  │
│ │   (2/3 de l'assiette = légumes)                 │  │
│ │                                                  │  │
│ │ 💡 ASTUCE :                                      │  │
│ │ Privilégie les féculents au déjeuner (midi),    │  │
│ │ moment où ton corps en a vraiment besoin pour   │  │
│ │ l'énergie de l'après-midi                       │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────────┐  │
│ │                                                  │  │
│ │ Lun 13/01 : ✅ Poisson + légumes                │  │
│ │ Mar 14/01 : ✅ Poulet + ratatouille             │  │
│ │ Mer 15/01 : ✅ Omelette + courgettes            │  │
│ │ Jeu 16/01 : ❌ Pâtes carbonara (écart)          │  │
│ │ Ven 17/01 : ✅ Viande + haricots verts          │  │
│ │ Sam 18/01 : ✅ Poisson + salade composée        │  │
│ │ Dim 19/01 : ✅ Poulet + légumes vapeur          │  │
│ │                                                  │  │
│ │ Question quotidienne :                          │  │
│ │ "Ce soir, j'ai mangé un repas sans féculent     │  │
│ │  (ou maximum 3 c.à.s si nécessaire)"            │  │
│ │                                                  │  │
│ │ ○ Oui (6/7)  ○ Non (1/7)                        │  │
│ │                                                  │  │
│ │ 📝 Note : Critère automatisable via page saisie │  │
│ │ (à traiter plus tard)                           │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere2": {
    "suiviQuotidien": [
      { "date": "2025-01-13", "respecte": true, "details": "Poisson + légumes" },
      { "date": "2025-01-14", "respecte": true, "details": "Poulet + ratatouille" },
      { "date": "2025-01-15", "respecte": true, "details": "Omelette + courgettes" },
      { "date": "2025-01-16", "respecte": false, "details": "Pâtes carbonara" },
      { "date": "2025-01-17", "respecte": true, "details": "Viande + haricots verts" },
      { "date": "2025-01-18", "respecte": true, "details": "Poisson + salade" },
      { "date": "2025-01-19", "respecte": true, "details": "Poulet + légumes vapeur" }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere2(data) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

### 🟢 **CRITÈRE 5 : Sucreries (J-14)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Supprimer les sucreries"
Description : "Préparer le pancréas à fonctionner sans pics de glycémie"
Jalon : J-14
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 5 : Sucreries (J-14)                       │
│ ══════════════════════════════════════════════════════ │
│ Préparer le pancréas à fonctionner sans pics de       │
│ glycémie.                                              │
│                                                        │
│ Cette semaine : 5/7 jours réussis                     │
│ [█████████████░░░] 71%                                │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                  │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 5 : Sucreries (J-14)                       │
│ ══════════════════════════════════════════════════════ │
│ Préparer le pancréas à fonctionner sans pics de       │
│ glycémie.                                              │
│                                                        │
│ Cette semaine : 5/7 jours réussis [█████████████░] 71%│
│                                                        │
│ [▲ Replier]                                            │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────────┐  │
│ │ Les sucreries (bonbons, chocolat, gâteaux,      │  │
│ │ glaces) provoquent des pics de glycémie violents│  │
│ │ : ton taux de sucre dans le sang monte très     │  │
│ │ vite, puis redescend brutalement. Cela fatigue  │  │
│ │ énormément ton pancréas qui doit produire       │  │
│ │ beaucoup d'insuline d'un coup. Pendant le jeûne,│  │
│ │ ton pancréas va se reposer complètement. Si tu  │  │
│ │ ne l'habitues pas avant à fonctionner sans ces  │  │
│ │ pics de sucre, la transition sera difficile et  │  │
│ │ tu risques des malaises (hypoglycémie).         │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────────┐  │
│ │                                                  │  │
│ │ SUPPRIMER PROGRESSIVEMENT :                     │  │
│ │                                                  │  │
│ │ 📅 J-14 à J-12 (3 jours) :                      │  │
│ │    Maximum 1 sucrerie par jour                  │  │
│ │    → Uniquement après le déjeuner (12h-14h)     │  │
│ │    → Jamais à jeun ou le soir                   │  │
│ │                                                  │  │
│ │ 📅 J-12 à J-7 (5 jours) :                       │  │
│ │    Maximum 1 sucrerie tous les 2 jours         │  │
│ │    → Toujours après un repas complet            │  │
│ │                                                  │  │
│ │ 📅 J-7 à J-0 (7 jours) :                        │  │
│ │    ZÉRO sucrerie                                │  │
│ │    → Transition finale avant le jeûne           │  │
│ │                                                  │  │
│ │ ✅ ALTERNATIVES NATURELLES :                    │  │
│ │ • 1 fruit frais entier (pomme, poire, orange)   │  │
│ │ • 2 dattes maximum par jour                     │  │
│ │ • 2 carrés de chocolat noir 70% minimum         │  │
│ │ • Compote sans sucre ajouté                     │  │
│ │                                                  │  │
│ │ ❌ À ÉVITER COMPLÈTEMENT :                      │  │
│ │ • Gâteaux industriels (très transformés)        │  │
│ │ • Bonbons, dragées, chewing-gums sucrés         │  │
│ │ • Glaces (pics de sucre + froid)                │  │
│ │ • Sodas et jus de fruits industriels            │  │
│ │ • Pâtes à tartiner sucrées                      │  │
│ │                                                  │  │
│ │ 💡 ASTUCE :                                      │  │
│ │ Si envie de sucré intense : bois un grand verre │  │
│ │ d'eau puis attends 10 minutes. L'envie diminue  │  │
│ │ souvent naturellement (confusion soif/faim)     │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────────┐  │
│ │                                                  │  │
│ │ Lun 20/01 (J-14) : ✅ 1 carré chocolat noir     │  │
│ │ Mar 21/01 (J-13) : ✅ Aucune sucrerie           │  │
│ │ Mer 22/01 (J-12) : ✅ 2 dattes                  │  │
│ │ Jeu 23/01 (J-11) : ❌ Gâteau goûter (écart)     │  │
│ │ Ven 24/01 (J-10) : ✅ Aucune sucrerie           │  │
│ │ Sam 25/01 (J-9) : ❌ Glace dessert (écart)      │  │
│ │ Dim 26/01 (J-8) : ✅ 1 pomme                    │  │
│ │                                                  │  │
│ │ Question quotidienne (adaptée au jalon) :       │  │
│ │ "Aujourd'hui, j'ai respecté mon objectif        │  │
│ │  sucreries selon ma phase"                      │  │
│ │                                                  │  │
│ │ ○ Oui (5/7)  ○ Non (2/7)                        │  │
│ │                                                  │  │
│ │ 📝 Note : Critère automatisable via page saisie │  │
│ │ (à traiter plus tard)                           │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere5": {
    "suiviQuotidien": [
      { "date": "2025-01-20", "respecte": true, "details": "1 carré chocolat noir", "jalon": "J-14" },
      { "date": "2025-01-21", "respecte": true, "details": "Aucune sucrerie", "jalon": "J-13" },
      { "date": "2025-01-22", "respecte": true, "details": "2 dattes", "jalon": "J-12" },
      { "date": "2025-01-23", "respecte": false, "details": "Gâteau goûter", "jalon": "J-11" },
      { "date": "2025-01-24", "respecte": true, "details": "Aucune sucrerie", "jalon": "J-10" },
      { "date": "2025-01-25", "respecte": false, "details": "Glace dessert", "jalon": "J-9" },
      { "date": "2025-01-26", "respecte": true, "details": "1 pomme", "jalon": "J-8" }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere5(data, jourActuel) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

### 🟢 **CRITÈRE 8 : Repas avant 19h (J-7)**

#### 📋 **CRITÈRE OFFICIEL (INTOUCHABLE)**
```
Titre : "Dernier repas avant 19h"
Description : "Permettre une digestion complète avant le sommeil"
Jalon : J-7
```

#### 🎨 **AFFICHAGE DANS PhaseCard.js**

**Vue compacte (par défaut - TOUJOURS VISIBLE)** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 8 : Repas avant 19h (J-7)                  │
│ ══════════════════════════════════════════════════════ │
│ Permettre une digestion complète avant le sommeil.    │
│                                                        │
│ Cette semaine : 6/7 jours réussis                     │
│ [████████████████░] 86%                               │
│                                                        │
│ [▼ En savoir plus] [Valider - actif]                  │
└────────────────────────────────────────────────────────┘
```

**Vue détaillée (après clic "En savoir plus")** :
```
┌────────────────────────────────────────────────────────┐
│ 📋 Critère 8 : Repas avant 19h (J-7)                  │
│ ══════════════════════════════════════════════════════ │
│ Permettre une digestion complète avant le sommeil.    │
│                                                        │
│ Cette semaine : 6/7 jours réussis [██████████████] 86%│
│                                                        │
│ [▲ Replier]                                            │
│                                                        │
│ ┌───── 🧭 POURQUOI ? ──────────────────────────────┐  │
│ │ Ton système digestif a besoin de 3-4 heures pour│  │
│ │ digérer un repas complet. Si tu manges après    │  │
│ │ 19h et que tu te couches vers 22h-23h, ton corps│  │
│ │ digère encore pendant ton sommeil. Cela perturbe│  │
│ │ la qualité de ton sommeil (sommeil moins        │  │
│ │ réparateur) et fatigue ton foie qui devrait se  │  │
│ │ concentrer sur la détoxification nocturne.      │  │
│ │ Manger avant 19h permet une digestion complète  │  │
│ │ avant le coucher et prépare ton corps au rythme │  │
│ │ du jeûne où les horaires sont très importants.  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 🛠️ COMMENT FAIRE ? ─────────────────────────┐  │
│ │                                                  │  │
│ │ 🎯 OBJECTIF STRICT :                            │  │
│ │ Dernier repas terminé avant 19h00               │  │
│ │                                                  │  │
│ │ ✅ HORAIRES IDÉAUX :                            │  │
│ │ • Dîner entre 18h00 et 18h45                    │  │
│ │ • Dernière bouchée avalée avant 19h00 max       │  │
│ │                                                  │  │
│ │ 📋 ORGANISATION PRATIQUE :                      │  │
│ │ • Prépare ton repas à l'avance si tu rentres    │  │
│ │   tard du travail                               │  │
│ │ • Batch cooking le week-end pour la semaine     │  │
│ │   (tupperware prêts au frigo)                   │  │
│ │ • Privilégie des repas simples et rapides :     │  │
│ │   - Salade composée (légumes + protéine)        │  │
│ │   - Omelette + légumes vapeur                   │  │
│ │   - Soupe + blanc de poulet                     │  │
│ │   - Poisson + crudités                          │  │
│ │                                                  │  │
│ │ ⚠️ SI VRAIMENT IMPOSSIBLE UN SOIR :             │  │
│ │ • Opte pour un repas ultra-léger :              │  │
│ │   - Soupe de légumes + 1 fruit                  │  │
│ │   - Salade verte + 1 œuf dur                    │  │
│ │ • ⚠️ Ce jour ne comptera pas dans la validation │  │
│ │                                                  │  │
│ │ 💡 ASTUCE :                                      │  │
│ │ Mets une alarme à 18h15 intitulée "Préparer     │  │
│ │ dîner MAINTENANT" pour ne pas oublier           │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌───── 📊 SUIVI QUOTIDIEN ─────────────────────────┐  │
│ │                                                  │  │
│ │ Lun 27/01 : ✅ Dîner terminé à 18h30            │  │
│ │ Mar 28/01 : ✅ Dîner terminé à 18h45            │  │
│ │ Mer 29/01 : ✅ Dîner terminé à 18h15            │  │
│ │ Jeu 30/01 : ❌ Dîner terminé à 20h00 (écart)    │  │
│ │ Ven 31/01 : ✅ Dîner terminé à 18h40            │  │
│ │ Sam 01/02 : ✅ Dîner terminé à 18h20            │  │
│ │ Dim 02/02 : ✅ Dîner terminé à 18h50            │  │
│ │                                                  │  │
│ │ Question quotidienne :                          │  │
│ │ "Ce soir, j'ai terminé mon dernier repas avant  │  │
│ │  19h00 (dernière bouchée avalée)"               │  │
│ │                                                  │  │
│ │ ○ Oui (6/7)  ○ Non (1/7)                        │  │
│ │                                                  │  │
│ │ 📝 Note : Critère automatisable via page saisie │  │
│ │ (à traiter plus tard)                           │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [▲ Replier] [✅ Valider le critère]                  │
└────────────────────────────────────────────────────────┘
```

#### 📦 **STRUCTURE LOCALSTORAGE**

```javascript
{
  "critere8": {
    "suiviQuotidien": [
      { "date": "2025-01-27", "respecte": true, "heureFinRepas": "18:30" },
      { "date": "2025-01-28", "respecte": true, "heureFinRepas": "18:45" },
      { "date": "2025-01-29", "respecte": true, "heureFinRepas": "18:15" },
      { "date": "2025-01-30", "respecte": false, "heureFinRepas": "20:00" },
      { "date": "2025-01-31", "respecte": true, "heureFinRepas": "18:40" },
      { "date": "2025-02-01", "respecte": true, "heureFinRepas": "18:20" },
      { "date": "2025-02-02", "respecte": true, "heureFinRepas": "18:50" }
    ],
    "valide": true
  }
}
```

#### 🔧 **LOGIQUE DE VALIDATION**

```javascript
function peutValiderCritere8(data) {
  const joursReussis = data.suiviQuotidien.filter(j => j.respecte).length;
  return joursReussis >= 5;  // Minimum 5/7 jours
}
```

**Statut** : ✅ VALIDÉ

---

## 📊 **SUIVI GLOBAL**

| Critère | Phase | Priorité | Statut |
|---------|-------|----------|--------|
| 6. Jeûne plein | 2 | 🔴 URGENT | ✅ Validé |
| 4. Produits transformés | 2 | 🔴 URGENT | ✅ Validé |
| 1. Respect quantités | 1 | 🔴 URGENT | ✅ Validé |
| 9. Plage 45 min | 3 | 🟠 IMPORTANT | ✅ Validé |
| 3. Action après repas | 2 | 🟠 IMPORTANT | ✅ Validé |
| 7. 2L eau | 3 | 🟠 IMPORTANT | ✅ Validé |
| 2. Féculents soir | 2 | 🟢 MINEUR | ✅ Validé |
| 5. Sucreries | 2 | 🟢 MINEUR | ✅ Validé |
| 8. Pas repas 19h | 3 | 🟢 MINEUR | ✅ Validé |

---

## 🔄 **HISTORIQUE**

### 7 décembre 2025
- Création du fichier
- Reformulation complète des 9 critères avec guidances POURQUOI/COMMENT/SUIVI
- Suppression notion "sous-objectifs" (confusion avec critères officiels)
- Structure finale : CRITÈRE (officiel) + GUIDANCE (POURQUOI/COMMENT) + SUIVI (simple)
- Ajout notes "automatisable via page saisie" pour Critères 2, 5, 7, 8
- ✅ TOUS LES CRITÈRES VALIDÉS (9/9)

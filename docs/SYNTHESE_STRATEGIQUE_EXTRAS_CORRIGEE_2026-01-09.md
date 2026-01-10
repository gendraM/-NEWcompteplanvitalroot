# 🎯 SYNTHÈSE STRATÉGIQUE EXTRAS - VISION COMPLÈTE CORRIGÉE

**Date** : 9 janvier 2026  
**Auteur** : GitHub Copilot  
**Statut** : ✅ LECTURE COMPLÈTE (Stratégie + Code + Docs)

---

## ⚠️ ALERTE CRITIQUE : ÉCART STRATÉGIE ↔ CODE

### 🔥 DÉCOUVERTE MAJEURE

**Le CODE actuel NE respecte PAS la STRATÉGIE métier définie !**

| Règle Métier (Stratégie_extra.md) | Implémentation Actuelle | Écart |
|-----------------------------------|------------------------|-------|
| **Règle 1** : 8 fast-foods/an MAX | Fast-foods comptés comme "extras" génériques | ❌ CRITIQUE |
| **Règle 2** : 36 extras sucrés/an MAX (3/mois) | Pas de distinction fast-food ≠ sucré | ❌ CRITIQUE |
| **Règle 3** : MAX 1 extra sucré/semaine | Quota global 1 extra/semaine (tous types) | ❌ PARTIEL |
| **Tracking** : Annuel + Mensuel + Hebdo | Hebdomadaire uniquement | ❌ INCOMPLET |
| **Vision** : 45 jours entre fast-foods | Système séparé (checkbox) non intégré | ⚠️ CONFUS |

---

## 📚 SOURCES ANALYSÉES

### ✅ Documents Stratégiques Lus

1. **Stratégie_extra.md** (NOUVEAU - règle métier)
2. FAST_FOOD_STRATEGIE_REDEFINITION_2026-01-07.md
3. ANALYSE_SYSTEME_FAST_FOOD_2026-01-07.md
4. roadmap_suggestions_fastfood_assiduite.md
5. PLAN_TRACKING_FAST_FOOD_SANS_MIGRATION_2026-01-09.md
6. RAPPORT_CONFORMITE_FAST_FOOD_V2_2026-01-09.md

### ✅ Code Analysé

1. `/data/referentiel.js` (69 extras + 104 fast-foods)
2. `/lib/validationSemaine.js` (calculerExtrasSemaine)
3. `/components/RepasBloc.js` (checkbox estExtra, extrasRestants)
4. `/pages/suivi.js` (quota hebdo, paliers)
5. `/pages/tableau-de-bord.js` (évolution extras)
6. `/components/ModalFeedbackValidation.js`
7. `/components/DrawerValidation.js`

### ✅ Base de Données

- Table `repas_reels` (colonnes: categorie, est_extra, tag, extras)
- Table `semaines_validees` (colonnes: extras_count, extras_details, message_feedback)
- Table `extras` (legacy, non utilisée)
- Table `fast_food_history` (tracking séparé fast-foods)

---

## 🎯 STRATÉGIE MÉTIER OFFICIELLE

### 📋 Règles Définies (Stratégie_extra.md)

```
┌──────────────────────────────────────────────────────┐
│ RÈGLE 1 : FAST-FOODS                                │
├──────────────────────────────────────────────────────┤
│ 📍 MAX 8 FAST-FOODS / AN                            │
│ ≈ 1 tous les 45 jours                               │
│ → Poids toujours en baisse si compensé              │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ RÈGLE 2 : EXTRAS SUCRÉS                             │
├──────────────────────────────────────────────────────┤
│ 📍 MAX 36 EXTRAS SUCRÉS / AN (hors fast-foods)      │
│ = 3 extras / mois                                   │
│ = Moins de 1 / semaine                              │
│                                                      │
│ Types autorisés :                                   │
│ • Glaces                                            │
│ • Pâtisseries (boulangerie OU maison)              │
│ • Bonbons                                           │
│ • Popcorn                                           │
│ • Goûter partagé fait maison                       │
│ • Cinéma (pop-corn, etc.)                          │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ RÈGLE 3 : LIMITE HEBDOMADAIRE                       │
├──────────────────────────────────────────────────────┤
│ 📍 JAMAIS PLUS DE 1 EXTRA SUCRÉ / SEMAINE          │
│                                                      │
│ Raison si dépassement :                             │
│ • Stockage des sucres                               │
│ • Augmentation faim jours suivants                  │
│ • Perte de contrôle                                 │
└──────────────────────────────────────────────────────┘
```

### 🧮 Calcul Annuel

| Période | Fast-foods | Extras sucrés | Total extras |
|---------|-----------|---------------|-------------|
| **Année** | 8 max | 36 max | 44 max |
| **Mois** | 0-1 | 3 max | 3-4 max |
| **Semaine** | 0-1 (rare) | 1 max | 1 max |

**Quota annuel** : 44 extras MAX (8 fast-foods + 36 sucrés)

---

## ⚙️ IMPLÉMENTATION ACTUELLE

### 🔍 Ce Qui Existe (Code)

#### 1. Système Générique "Extras" (Hebdo)

**Quota** : 1 extra/semaine (tous types confondus)  
**Paliers** :
- Débutant : 5 extras/semaine
- Intermédiaire : 3 extras/semaine  
- Avancé : 2 extras/semaine
- Expert : **1 extra/semaine** (objectif final)

**Fichiers** :
- `suivi.js` ligne 825 : `const currentPalier = 1;`
- `lib/validationSemaine.js` : `calculerExtrasSemaine()`
- `tableau-de-bord.js` : Graphique évolution extras

**Tracking** :
- Table `semaines_validees.extras_count`
- Validation dimanche soir
- Feedback personnalisé

#### 2. Système Séparé "Fast-Foods" (45 jours)

**Règle** : 45 jours minimum entre 2 fast-foods  
**Mécanisme** : Checkbox "Fast food ?" + Dropdown restaurant

**Fichiers** :
- `RepasBloc.js` ligne 120-600 : Checkbox + calcul délai
- `tableau-de-bord.js` ligne 639-643 : "Prochain créneau disponible"
- Table `fast_food_history` (tracking dédié)
- `lib/fastFoodRewards.js` : Badges 45 jours

**Problème** : Système SÉPARÉ du tracking extras génériques

#### 3. Référentiel Aliments

**69 extras** dans `referentiel.js` :
- Catégorie `"extra"` : Glaces, pâtisseries, bonbons, etc.
- **MAIS** : Tous traités de manière identique (pas de distinction)

**104 fast-foods** :
- Catégorie `"fast-food"` : McDo, KFC, Subway, etc.
- **Redéfinition stricte** (doc FAST_FOOD_STRATEGIE_REDEFINITION_2026-01-07.md)

---

## 🚨 ANOMALIES CRITIQUES DÉTECTÉES

### A1 : Confusion Fast-foods ↔ Extras

**Problème** :
- Fast-foods ont catégorie `"fast-food"` MAIS sont comptés comme "extras" dans validation hebdo
- Code `calculerExtrasSemaine()` compte : `repas.categorie === 'fast-food' || repas.est_extra`
- **Résultat** : 1 McDo = 1 extra dans quota hebdo ❌

**Impact** :
```
Utilisateur mange:
- 1 McDo (fast-food)
- 1 glace (extra sucré)

Système dit: "2/1 extras cette semaine" ❌

Stratégie dit: "1 fast-food OK (tous les 45j) + 1 extra sucré OK (<1/semaine)" ✅
```

### A2 : Pas de Distinction Sucré vs Salé

**Problème** :
- Code ne distingue PAS :
  - Extras sucrés (glaces, pâtisseries)
  - Extras salés (chips, cacahuètes)
  - Fast-foods (McDo, Subway)

**Impact** :
```
Référentiel dit:
- Chips = categorie: "extra"
- Glace = categorie: "extra"

Stratégie dit:
- Chips = snack (pas dans quota 36 extras sucrés/an) ⚠️
- Glace = extra sucré (compte dans quota 36/an) ✅
```

### A3 : Pas de Tracking Annuel

**Problème** :
- Code track uniquement par SEMAINE
- Pas de compteur annuel (8 fast-foods/an, 36 extras/an)

**Impact** :
- Utilisateur peut consommer 52 extras/an (1/semaine × 52) au lieu de 36 MAX ❌

### A4 : Incohérence calculerExtrasSemaine()

**Bug déjà identifié** (ANALYSE_COMPLETE_EXTRAS_2026-01-09.md) :
```javascript
// ❌ CODE ACTUEL
const extras = repasDesSemaine.filter(repas => {
  return repas.categorie === 'fast-food' || 
         (repas.tag && repas.tag.toLowerCase().includes('fast-food'));
  // MANQUE: || repas.est_extra === true
});

// ✅ CORRECTION
const extras = repasDesSemaine.filter(repas => {
  return repas.categorie === 'fast-food' || 
         (repas.tag && repas.tag.toLowerCase().includes('fast-food')) ||
         repas.est_extra === true;
});
```

### A5 : Gâteaux Maison Non Différenciés

**Demande utilisateur** (ANALYSE_COMPLETE) :
- Gâteaux maison ≠ gâteaux industriels
- Actuellement : TOUS = `categorie: "extra"` (même poids)

**Stratégie_extra.md** dit :
- "Goûter partagé fait maison" = autorisé dans quota 36/an
- **MAIS** pas de distinction industriel vs maison dans code

### A6 : Délai Fast-Food Incohérent

**Détecté dans ANALYSE_SYSTEME_FAST_FOOD_2026-01-07.md** :
- `tableau-de-bord.js` : `Math.ceil` (arrondi supérieur)
- `RepasBloc.js` : `Math.floor` (arrondi inférieur)
- **Impact** : "1 jour restant" affiché mais validation refuse

---

## 🎯 ARCHITECTURE CIBLE (Pour Conformité)

### 📊 Nouvelle Catégorisation Proposée

```javascript
// Proposition structure extras
const TYPES_EXTRAS = {
  FAST_FOOD: {
    id: 'fast-food',
    nom: 'Fast-food',
    quota_annuel: 8,
    quota_mensuel: 1,
    delai_minimum: 45, // jours
    exemples: ['McDo', 'KFC', 'Subway', 'Burger King']
  },
  
  EXTRA_SUCRE: {
    id: 'extra-sucre',
    nom: 'Extra sucré',
    quota_annuel: 36,
    quota_mensuel: 3,
    quota_hebdo: 1,
    exemples: [
      'Glaces',
      'Pâtisseries boulangerie',
      'Gâteaux maison', // ✅ NOUVEAU
      'Bonbons',
      'Popcorn',
      'Goûter partagé'
    ]
  },
  
  SNACK_SALE: { // ✅ NOUVEAU TYPE (hors quota?)
    id: 'snack-sale',
    nom: 'Snack salé',
    quota_annuel: null, // À définir
    exemples: ['Chips', 'Cacahuètes', 'Biscuits apéro']
  }
};
```

### 🗄️ Modification Tables

```sql
-- Table repas_reels
ALTER TABLE repas_reels
  ADD COLUMN type_extra TEXT CHECK (type_extra IN ('fast-food', 'extra-sucre', 'snack-sale', null)),
  ADD COLUMN fait_maison BOOLEAN DEFAULT false;

-- Table extras_annuels (NOUVEAU)
CREATE TABLE extras_annuels (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  annee INTEGER NOT NULL,
  fast_food_count INTEGER DEFAULT 0,
  extra_sucre_count INTEGER DEFAULT 0,
  snack_sale_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, annee)
);

-- Table extras_mensuels (NOUVEAU)
CREATE TABLE extras_mensuels (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  annee INTEGER NOT NULL,
  mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
  fast_food_count INTEGER DEFAULT 0,
  extra_sucre_count INTEGER DEFAULT 0,
  snack_sale_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, annee, mois)
);
```

### 📐 Nouvelles Fonctions Calcul

```javascript
// lib/validationExtras.js (NOUVEAU)

/**
 * Calcule les extras par type pour une période
 */
export function calculerExtrasParType(dateDebut, dateFin, repasReels) {
  const repas = repasReels.filter(r => {
    const d = new Date(r.date);
    return d >= dateDebut && d <= dateFin;
  });
  
  return {
    fast_food: repas.filter(r => r.type_extra === 'fast-food').length,
    extra_sucre: repas.filter(r => r.type_extra === 'extra-sucre').length,
    snack_sale: repas.filter(r => r.type_extra === 'snack-sale').length
  };
}

/**
 * Vérifie si quota annuel respecté
 */
export function verifierQuotaAnnuel(userId, annee) {
  const stats = await supabase
    .from('extras_annuels')
    .select('*')
    .eq('user_id', userId)
    .eq('annee', annee)
    .single();
  
  return {
    fast_food: {
      actuel: stats.fast_food_count,
      quota: 8,
      restant: 8 - stats.fast_food_count,
      respecte: stats.fast_food_count <= 8
    },
    extra_sucre: {
      actuel: stats.extra_sucre_count,
      quota: 36,
      restant: 36 - stats.extra_sucre_count,
      respecte: stats.extra_sucre_count <= 36
    }
  };
}

/**
 * Vérifie si quota mensuel respecté
 */
export function verifierQuotaMensuel(userId, annee, mois) {
  const stats = await supabase
    .from('extras_mensuels')
    .select('*')
    .eq('user_id', userId)
    .eq('annee', annee)
    .eq('mois', mois)
    .single();
  
  return {
    fast_food: {
      actuel: stats.fast_food_count,
      quota: 1,
      respecte: stats.fast_food_count <= 1
    },
    extra_sucre: {
      actuel: stats.extra_sucre_count,
      quota: 3,
      respecte: stats.extra_sucre_count <= 3
    }
  };
}

/**
 * Message feedback adapté par type
 */
export function genererMessageFeedbackParType(stats) {
  const messages = [];
  
  // Fast-foods
  if (stats.fast_food.respecte) {
    messages.push(`🎉 Fast-foods : ${stats.fast_food.actuel}/${stats.fast_food.quota} ce mois`);
  } else {
    messages.push(`🚨 Fast-foods dépassés : ${stats.fast_food.actuel}/${stats.fast_food.quota}`);
  }
  
  // Extras sucrés
  if (stats.extra_sucre.respecte) {
    messages.push(`✅ Extras sucrés : ${stats.extra_sucre.actuel}/${stats.extra_sucre.quota} ce mois`);
  } else {
    messages.push(`⚠️ Extras sucrés : ${stats.extra_sucre.actuel}/${stats.extra_sucre.quota} (limite dépassée)`);
  }
  
  return messages.join('\n');
}
```

---

## 🚀 PLAN D'ACTION CONFORMITÉ

### Phase 1 : Corrections Critiques (2-3 jours)

**P0 - Bugs Bloquants** :
- [ ] Corriger `calculerExtrasSemaine()` : ajouter `|| repas.est_extra === true`
- [ ] Harmoniser `Math.ceil` vs `Math.floor` dans délai fast-food
- [ ] Définir source vérité : `categorie` vs `est_extra` vs `type_extra`

**P1 - Données** :
- [ ] Migration : Ajouter colonne `type_extra` ('fast-food', 'extra-sucre', 'snack-sale')
- [ ] Migration : Ajouter colonne `fait_maison` (BOOLEAN)
- [ ] Créer tables `extras_annuels` et `extras_mensuels`

### Phase 2 : Séparation Fast-foods ↔ Extras (5-7 jours)

**Objectif** : Tracking distinct conformément à la stratégie

- [ ] Créer `lib/validationExtras.js` (fonctions calcul par type)
- [ ] Modifier `RepasBloc.js` :
  - Radio buttons : "Fast-food" / "Extra sucré" / "Snack salé"
  - Checkbox "Fait maison ?" (si extra sucré)
- [ ] Modifier `suivi.js` :
  - Afficher compteur fast-foods séparé
  - Afficher compteur extras sucrés séparé
- [ ] Modifier `tableau-de-bord.js` :
  - Section "Fast-foods" : X/8 cette année, prochain dans Y jours
  - Section "Extras sucrés" : X/36 cette année, X/3 ce mois

### Phase 3 : Tracking Annuel (5-7 jours)

**Objectif** : Quotas annuels et mensuels

- [ ] Dashboard annuel :
  - Graphique 8 fast-foods/an (barres)
  - Graphique 36 extras sucrés/an (ligne)
  - Projection fin année
- [ ] Alertes :
  - ⚠️ "6/8 fast-foods consommés (75% quota annuel)"
  - 🚨 "Quota mensuel extras sucrés atteint (3/3)"
- [ ] Mise à jour auto tables annuelles/mensuelles à chaque saisie

### Phase 4 : Gâteaux Maison (3-5 jours)

**Objectif** : Différencier industriel vs maison

- [ ] Ajouter sous-catégorie `"pâtisserie-maison"` dans référentiel
- [ ] Checkbox "Fait maison ?" lors saisie
- [ ] Règle : Gâteau maison = 50% impact calorique (optionnel)
- [ ] Comptage séparé dans stats

### Phase 5 : UX & Feedback (5-7 jours)

**Objectif** : Messages adaptés par type

- [ ] Refonte `genererMessageFeedback()` :
  - Messages fast-foods vs extras sucrés
  - Encouragements différenciés
- [ ] Modal validation :
  - Section fast-foods séparée
  - Section extras sucrés séparée
- [ ] Drawer validation :
  - Onglets "Fast-foods" / "Extras sucrés" / "Snacks"
  - Historique filtrable

### Phase 6 : Analytics Avancés (Optionnel)

- [ ] Corrélation fast-foods ↔ poids
- [ ] Identification patterns (fast-foods week-end, extras soir)
- [ ] Prédictions IA : "Tu vas probablement craquer ce vendredi soir"

---

## 📊 TABLEAU RÉCAPITULATIF

### État Actuel vs Stratégie

| Aspect | Stratégie Métier | Code Actuel | Conforme? |
|--------|-----------------|-------------|-----------|
| **Fast-foods** | 8/an (45j min) | Comptés comme extras génériques | ❌ |
| **Extras sucrés** | 36/an, 3/mois, <1/semaine | Pas de distinction | ❌ |
| **Snacks salés** | Non défini | Comptés comme extras | ⚠️ |
| **Gâteaux maison** | Autorisés (quota 36) | Pas de distinction | ❌ |
| **Tracking annuel** | Requis (8 + 36) | Absent | ❌ |
| **Tracking mensuel** | Requis (3 extras/mois) | Absent | ❌ |
| **Tracking hebdo** | <1 extra/semaine | 1 extra/semaine | ✅ Partiel |
| **Délai fast-food** | 45 jours minimum | 45 jours (système séparé) | ✅ OK |
| **Feedback** | Par type | Global | ❌ |

**Score conformité** : 2/9 = **22% ❌**

---

## ✅ CONCLUSION

### Constats

1. **Stratégie métier claire** dans `Stratégie_extra.md` :
   - 8 fast-foods/an
   - 36 extras sucrés/an
   - <1 extra sucré/semaine

2. **Code actuel NON conforme** :
   - Tracking global "extras" sans distinction
   - Pas de quotas annuels/mensuels
   - Fast-foods mélangés avec extras sucrés

3. **Système fast-food séparé** existe mais non intégré :
   - Checkbox + délai 45 jours fonctionnel
   - Table `fast_food_history` dédiée
   - Mais comptés aussi comme "extras" dans validation hebdo

### Recommandations Prioritaires

**🔴 URGENT (Sprint 1 - 1 semaine)** :
1. Corriger bugs `calculerExtrasSemaine()` et délai `Math.ceil/floor`
2. Ajouter colonne `type_extra` (fast-food / extra-sucre / snack-sale)
3. Créer tables tracking annuel/mensuel

**🟠 IMPORTANT (Sprint 2-3 - 2 semaines)** :
4. Séparation compteurs fast-foods ↔ extras sucrés
5. Dashboard annuel + mensuel
6. Distinction gâteaux maison vs industriels

**🟡 AMÉLIORATION (Sprint 4+)** :
7. Analytics avancés
8. Prédictions IA
9. Gamification par type

### Effort Estimé

**Total** : 4-5 semaines (avec tests)

---

**Document créé le** : 9 janvier 2026  
**Auteur** : GitHub Copilot  
**Statut** : ✅ ANALYSE COMPLÈTE (Stratégie + Code + Docs)  
**Action Requise** : Validation utilisateur + Priorisation phases

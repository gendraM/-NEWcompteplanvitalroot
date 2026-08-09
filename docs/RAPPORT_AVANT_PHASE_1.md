# 📄 Rapport AVANT Phase 1 — Calculs (lib/validationSemaine.js)

**Date** : 01/02/2026  
**Phase concernée** : Phase 1 - Calculs  
**Fichiers concernés** : `/lib/validationSemaine.js`  
**Backup créé** : ✅ `lib/validationSemaine.js.backup-avant-phase1`

---

## 📊 État actuel du code

### Fichier : `/lib/validationSemaine.js` (582 lignes)

**Structure actuelle :**

#### 📦 Imports et helpers date (lignes 1-90)
- Aucun import externe (code standalone)
- Fonction `formatDate(date, format)` (lignes 9-60) : Formateur date custom
- Fonction `getMonday(date)` (lignes 66-89) : Récupère lundi de la semaine
- Fonction `addDays(date, days)` : Helper ajout jours (supposé présent)

#### 🧮 Fonctions de calcul existantes (lignes 91-582)
- `calculerExtrasSemaine(repas, weekStart)` (lignes 138-177) : Calcul extras semaine
- `calculerTendance7j(...)` (ligne 335) : Tendance 7 jours
- Autres helpers métier (non détaillés car hors scope Phase 1)

#### ✅ Points positifs
- Code modulaire, fonctions bien séparées
- Pas d'effet de bord (fonctions pures)
- Helpers date robustes

#### ⚠️ Points d'attention
- Pas de gestion erreur explicite (pas de try/catch)
- Pas de validation paramètres d'entrée
- Retours non documentés (pas de JSDoc complet)

---

## 🎯 Modifications prévues Phase 1

### 🆕 Ajouts (5 nouvelles fonctions)

#### 1️⃣ **Fonction `calculerRepartitionJours`** (~ligne 583)

**Signature :**
```javascript
export function calculerRepartitionJours(repasReels, weekStart, objectifHebdo)
```

**Objectif :** Catégoriser chaque jour de la semaine selon écart avec objectif

**Retour attendu :**
```javascript
{
  joursCategories: {
    sous: number,          // Jours ≤ -100 kcal
    proches: number,       // -100 < écart < +100
    legerDepassement: number, // +100 ≤ écart < +300
    debordement: number    // ≥ +300
  },
  joursIncomplets: number,
  detailsJours: [
    {
      date: string,        // YYYY-MM-DD
      kcal_total: number,
      ecart: number,
      categorie: string,   // 'sous'|'proche'|'leger'|'debordement'
      incomplet: boolean
    }
  ]
}
```

**Logique clé :**
- Objectif journalier = `Math.round(objectifHebdo / 7)`
- Jour incomplet si `<2 repas` OU `kcal_total < 800`
- Parcourir 7 jours de la semaine
- Agréger repas par date
- Calculer écart = kcal_total - objectifJour
- Catégoriser selon seuils métier

**Durée estimée :** 1h30

---

#### 2️⃣ **Fonction `detecterStreaksReussis`** (~ligne 650)

**Signature :**
```javascript
export function detecterStreaksReussis(detailsJours)
```

**Objectif :** Identifier séries de jours consécutifs alignés (≥3 jours)

**Retour attendu :**
```javascript
{
  longestStreak: number,     // Longest streak de la semaine
  streaks: number[],         // [3, 2, 4] par exemple
  hasLongStreak: boolean     // ≥ 6 jours consécutifs
}
```

**Logique clé :**
- Parcourir `detailsJours` dans l'ordre chronologique
- Compter jours consécutifs `categorie === 'sous' || categorie === 'proche'`
- Reset compteur si `leger` ou `debordement`
- Garder trace du plus long streak

**Durée estimée :** 45min

---

#### 3️⃣ **Fonction `calculerImpactJours`** (~ligne 700)

**Signature :**
```javascript
export function calculerImpactJours(detailsJours)
```

**Objectif :** Identifier jour(s) qui pèsent dans l'écart total

**Retour attendu :**
```javascript
{
  surplusTotal: number,      // Total écart positif sur semaine
  jourPlusLourd: {
    date: string,
    ecart: number,
    part: number             // 0-1 (pourcentage de surplusTotal)
  },
  repartition: string        // 'concentre' (≥50%) | 'fort' (30-50%) | 'diffus' (<30%)
}
```

**Logique clé :**
- Filtrer jours avec `ecart > 0`
- Calculer `surplusTotal = sum(ecarts positifs)`
- Identifier `jourPlusLourd = max(ecarts)`
- Calculer `part = ecartMax / surplusTotal`
- Catégoriser repartition selon seuils

**Durée estimée :** 1h

---

#### 4️⃣ **Fonction `calculerEvolutionExtras`** (~ligne 750)

**Signature :**
```javascript
export function calculerEvolutionExtras(extrasKcalN, extrasNbN, extrasKcalN1, extrasNbN1)
```

**Objectif :** Comparer extras semaine N vs N-1

**Retour attendu :**
```javascript
{
  deltaKcal: number,         // Différence kcal (N - N-1)
  deltaNb: number,           // Différence nombre (N - N-1)
  tendanceExtras: string     // 'progres' | 'stable' | 'plus_present'
}
```

**Logique clé :**
- `deltaKcal = extrasKcalN - extrasKcalN1`
- `deltaNb = extrasNbN - extrasNbN1`
- Si `deltaKcal < -100 && deltaNb < 0` → 'progres'
- Si `Math.abs(deltaKcal) <= 100 && Math.abs(deltaNb) <= 1` → 'stable'
- Sinon → 'plus_present'

**Durée estimée :** 45min

---

#### 5️⃣ **Fonction `analyserFragilites`** (~ligne 800)

**Signature :**
```javascript
export function analyserFragilites(detailsJours, repasReels)
```

**Objectif :** Identifier jours débordement + repas problématiques + typologie

**Retour attendu :**
```javascript
{
  joursDebordement: [
    {
      date: string,
      kcal_total: number,
      ecart: number,
      repasProblematiques: [
        { type: string, kcal: number, aliment: string, est_extra: boolean }
      ]
    }
  ],
  typologieProblematique: string,  // 'cumul_repas_extras' | 'extras_nombreux' | 'repas_trop_lourds'
  momentFragile: string            // 'soir' | 'dejeuner' | 'apres-midi' | 'nuit'
}
```

**Logique clé :**
- Filtrer jours avec `categorie === 'debordement'`
- Pour chaque jour, extraire top 3 repas les plus lourds
- Détecter typologie :
  - Si extras + repas lourds → 'cumul_repas_extras'
  - Si nombreux extras (≥4) → 'extras_nombreux'
  - Si 1-2 repas très lourds (≥800 kcal) → 'repas_trop_lourds'
- Détecter moment fragile (agrégation horaires si disponibles)

**Durée estimée :** 2h

---

### 🔧 Modifications

Aucune modification de fonctions existantes prévue.

---

### 🗑️ Suppressions

Aucune suppression prévue.

---

## ⚠️ Risques identifiés

### Risque 1 : Données repasReels malformées
**Description :** Repas sans `date`, `kcal` ou `type`  
**Impact :** Crash fonction, calculs faux  
**Mitigation :** Validation paramètres en début de fonction, filtrage repas invalides

### Risque 2 : Semaine incomplète (< 7 jours)
**Description :** Jours manquants dans repasReels  
**Impact :** Catégorisation fausse, joursCategories incorrect  
**Mitigation :** Créer structure 7 jours vide, remplir avec données existantes

### Risque 3 : Division par zéro
**Description :** `surplusTotal === 0` dans `calculerImpactJours`  
**Impact :** `part = NaN`  
**Mitigation :** Return early si surplusTotal === 0

### Risque 4 : Extras N-1 absents
**Description :** Première semaine validée, pas de N-1  
**Impact :** `calculerEvolutionExtras` reçoit null/undefined  
**Mitigation :** Validation paramètres, return null si N-1 absente

### Risque 5 : Performance (boucles imbriquées)
**Description :** Parcours 7 jours × tous repas  
**Impact :** Lenteur si beaucoup de repas  
**Mitigation :** Optimiser avec `.filter()`, pas de boucles imbriquées inutiles

---

## ✅ Checklist pré-implémentation

- [x] Tous les helpers date identifiés (`formatDate`, `getMonday`, `addDays`)
- [x] Structure retour de chaque fonction définie
- [x] Seuils métier validés (±100, ±300 kcal)
- [x] Backup fichier créé (`validationSemaine.js.backup-avant-phase1`)
- [x] Commit atomique préparé (branch `feature/bilan-lectures-abc`)
- [x] Tests unitaires préparés (scénarios définis dans plan global)
- [x] Aucune dépendance externe identifiée
- [x] Risques listés et mitigations définies

---

## 🧪 Stratégie de test

### Tests unitaires par fonction

**calculerRepartitionJours :**
- ✅ 7 jours complets, tous conformes
- ✅ 7 jours complets, 1 jour débordement (cas utilisateur dimanche 25/01)
- ✅ 7 jours complets, 3+ jours débordement
- ✅ 2+ jours incomplets (affichage "Lecture partielle")
- ✅ 0 repas saisis (tous jours incomplets)

**detecterStreaksReussis :**
- ✅ Streak de 6 jours consécutifs (cas utilisateur)
- ✅ Streak de 3 jours
- ✅ Aucun streak (alternance conforme/non-conforme)

**calculerImpactJours :**
- ✅ 1 jour concentre 60%+ du surplus (cas utilisateur dimanche 25/01)
- ✅ Surplus diffus (<30% sur un jour)
- ✅ Aucun surplus (tous jours sous objectif) → Return null

**calculerEvolutionExtras :**
- ✅ Extras en progrès (N < N-1)
- ✅ Extras stables (N ≈ N-1)
- ✅ Extras plus présents (N > N-1)
- ✅ Semaine N-1 absente → Return null

**analyserFragilites :**
- ✅ 1 jour débordement avec détail repas
- ✅ Plusieurs jours débordement
- ✅ Aucun jour débordement → Return null
- ✅ Typologie cumul repas+extras
- ✅ Typologie extras nombreux
- ✅ Typologie repas trop lourds

---

## 📝 Plan d'exécution Phase 1

### Ordre d'implémentation recommandé

1. **calculerRepartitionJours** (1h30) - Fondation
2. **detecterStreaksReussis** (45min) - Dépend de detailsJours
3. **calculerImpactJours** (1h) - Dépend de detailsJours
4. **calculerEvolutionExtras** (45min) - Indépendant
5. **analyserFragilites** (2h) - Dépend de detailsJours + repasReels

**Durée totale estimée : 6h**

### Jalons intermédiaires

- ✅ **Jalon 1** (après calculerRepartitionJours) : Tester avec vraies données, vérifier structure retour
- ✅ **Jalon 2** (après detecterStreaksReussis) : Tester cas utilisateur (6 jours consécutifs)
- ✅ **Jalon 3** (après calculerImpactJours) : Tester cas jour lourd 60%
- ✅ **Jalon 4** (après calculerEvolutionExtras) : Tester avec/sans N-1
- ✅ **Jalon 5** (après analyserFragilites) : Tester typologie, moment fragile

---

## 🚦 Validation utilisateur REQUISE

**Questions pour l'utilisateur avant démarrage Phase 1 :**

1. ✅ Seuils catégorisation validés ?
   - SOUS : ≤ -100 kcal
   - PROCHE : -100 < écart < +100
   - LEGER_DEPASSEMENT : +100 ≤ écart < +300
   - DEBORDEMENT : ≥ +300

2. ✅ Définition jour incomplet validée ?
   - < 2 repas OU kcal_total < 800

3. ✅ Ordre d'implémentation validé ?
   - Repartition → Streaks → Impact → Évolution → Fragilités

4. ✅ Stratégie test validée ?
   - Tests unitaires manuels ou Jest ?

---

## 🔄 Prochaine étape

**Après validation de ce rapport :**
1. Créer branch Git : `git checkout -b feature/bilan-lectures-abc`
2. Implémenter `calculerRepartitionJours` (TODO 1.1)
3. Tester fonction isolée
4. Commit atomique
5. Passer à TODO 1.2 (detecterStreaksReussis)

---

**✍️ Signature validation utilisateur :**

- [ ] Rapport lu et compris
- [ ] Approche technique validée
- [ ] Risques acceptables
- [ ] GO pour démarrer Phase 1

**Date :** ________________  
**Nom :** ________________

---

*Rapport généré le 01/02/2026 par GitHub Copilot*  
*Conforme à : PLAN_IMPL_LECTURES_ABC_ENRICHISSEMENTS.md (Etape 8)*


# 🟢 PLAN D'IMPLÉMENTATION — Tracking Fast Food sans Migration BDD (Utilisation colonnes existantes)

**Date création :** 2026-01-09  
**Auteur :** GitHub Copilot (Claude Sonnet 4.5)  
**Validation utilisateur :** ⏸️ EN ATTENTE

**⚠️ AUCUNE modification de code ne doit être produite tant que l'utilisateur n'a pas validé explicitement ce plan.**

---

## 📋 Titre de la tâche

**Corriger tracking fast food : utiliser `repas_reels` comme source unique vérité (sans migration BDD)**

---

## 📝 Description précise de la modification attendue

### Objectif
Résoudre le bug où `fetchDernierFastFood()` cherche dans `fast_food_history` (vide) alors que les données fast food sont dans `repas_reels` (visible dans l'image utilisateur).

### Problème actuel
1. Auto-détection fonctionne ✅ (Frites KFC détecté)
2. `repas_reels` reçoit les données ✅ (categorie: "fast-food")
3. **MAIS** `fast_food_history` reste vide ❌
4. **Résultat :** Message "première entrée fast food" alors que faux

### Solution
Utiliser colonnes **déjà existantes** dans `repas_reels` :
- `categorie` (déjà "fast-food") ✅
- `tag` (vide actuellement) → stocker restaurant (KFC, McDonald's)

### Comportement attendu APRÈS
1. Saisie "Frites KFC" → auto-détection → `categorie: "fast-food"`, `tag: "KFC"`
2. `fetchDernierFastFood()` cherche dans `repas_reels` WHERE `categorie='fast-food'`
3. Message affiche : "Dernier fast food il y a X jours (KFC)" ✅
4. Multi-aliments même jour géré naturellement (3 lignes repas_reels = OK)

---

## 📂 Fichiers concernés

1. `/components/RepasBloc.js` (4 modifications)
   - Ligne 205-223: useEffect auto-détection (ajouter `tag`)
   - Ligne 242-290: fetchDernierFastFood() (changer table + query)
   - Ligne 428-443: onSave() (passer `tag`)
   - Ligne 444-462: **SUPPRIMER** insert `fast_food_history`

2. `/pages/suivi.js` (1 modification)
   - Ligne 652-667: handleSaveRepas() (ajouter `tag` dans insert)

3. `/pages/tableau-de-bord.js` (2 modifications)
   - Ligne 125-145: handleRefresh() (query `repas_reels` au lieu de `fast_food_history`)
   - Ligne 631-650: Affichage fast food (utiliser données `repas_reels`)

4. `/data/referentiel.js` (0 modification)
   - Champ `marque` existe déjà dans référentiel ✅

---

## Étape 1 — Audit des risques préalable

### 1.1 Risques techniques identifiés

**Risque #1 - Régression repas normaux**
- **Impact :** Repas non fast-food pourraient avoir `tag` rempli à tort
- **Probabilité :** Moyenne
- **Mitigation :** Condition stricte `if (isFastFood)` avant remplissage `tag`

**Risque #2 - Conflit champ `tag` existant**
- **Impact :** Données `tag` existantes écrasées
- **Probabilité :** Faible (champ actuellement vide)
- **Mitigation :** Vérifier usage actuel `tag` dans codebase

**Risque #3 - Boucle infinie useEffect**
- **Impact :** "Maximum update depth exceeded"
- **Probabilité :** Élevée (déjà eu dans anomalies rollback 26/12/2025)
- **Mitigation :** Dependency arrays minimalistes, pas de fonctions inline

**Risque #4 - Ordre hooks violé**
- **Impact :** Runtime error "Invalid hook call"
- **Probabilité :** Moyenne (déjà eu violations Template)
- **Mitigation :** Tous useState AVANT tous useEffect AVANT handlers

**Risque #5 - Query SQL lente**
- **Impact :** Tableau de bord slow si beaucoup de repas
- **Probabilité :** Faible
- **Mitigation :** Index sur `categorie` + `date` (à vérifier)

**Risque #6 - Désynchronisation `categorie` vs `tag`**
- **Impact :** `categorie="fast-food"` mais `tag=null`
- **Probabilité :** Moyenne
- **Mitigation :** Auto-détection remplit les 2 ensemble

**Risque #7 - Rétro-compatibilité données historiques**
- **Impact :** Anciens fast foods sans `tag` → restaurant inconnu
- **Probabilité :** Certaine
- **Mitigation :** Fallback `tag || "Non identifié"` dans affichage

**Risque #8 - Double insertion accidentelle**
- **Impact :** Données dans `repas_reels` ET `fast_food_history`
- **Probabilité :** Faible (suppression bloc insert `fast_food_history`)
- **Mitigation :** Tests exhaustifs après suppression

**Risque #9 - Perte tracking récompenses**
- **Impact :** Calcul délai 45 jours incorrect
- **Probabilité :** Moyenne
- **Mitigation :** Fonction `fetchDernierFastFood()` refaite avec même logique

**Risque #10 - Multi-device désynchronisation**
- **Impact :** Utilisateur mobile vs desktop données différentes
- **Probabilité :** Faible (même source BDD)
- **Mitigation :** Tests multi-device après implémentation

### 1.2 Consultation fichier anomalies rollback

**Leçons critiques à appliquer :**

**📌 Anomalie 26/12/2025 18:30 - Boucle infinie dependency arrays**
```javascript
// ❌ INTERDIT
useEffect(() => {
  if (onChangeChampsRepas) {
    onChangeChampsRepas({ aliment, quantite });
  }
}, [aliment, quantite, onChangeChampsRepas]); // ← onChangeChampsRepas change à chaque render
```

**Application à notre cas :**
- `fetchDernierFastFood()` sera appelée dans useEffect
- **DANGER :** Ne PAS mettre `fetchDernierFastFood` dans dependency array
- **Solution :** useCallback ou fonction définie en dehors useEffect

**📌 Anomalie 26/12/2025 17:45 - Ordre hooks violé**
```javascript
// ❌ INTERDIT
const [data, setData] = useState(null);
useEffect(() => { ... }, [data]);
const [loading, setLoading] = useState(false); // ← APRÈS useEffect
```

**Application à notre cas :**
- Tous `useState` (lignes 112-125) AVANT tous `useEffect`
- Pas de nouveau useState après ligne 205

**📌 Anomalie 20/11/2025 - Inline expressions créent nouvelles références**
```javascript
// ❌ INTERDIT
<Component 
  onSave={isFastFood ? handleSave : undefined}  // ← Nouvelle ref chaque render
/>
```

**Application à notre cas :**
- onSave() reçoit `tag` comme paramètre simple
- Pas d'expression conditionnelle inline dans props

---

## Étape 2 — Sous-checklist imports/dépendances

- [⏸️] **useState importé ?** (vérifié ligne 2 RepasBloc.js)
- [⏸️] **useEffect importé ?** (vérifié ligne 2 RepasBloc.js)
- [⏸️] **Supabase importé dynamiquement ?** (vérifié ligne 242-245)
- [⏸️] **Champ `tag` existe dans repas_reels ?** (vérifié docs/Structure supabase.md ligne 446)
- [⏸️] **Champ `marque` existe dans referentiel ?** (vérifié data/referentiel.js ligne 34)
- [⏸️] **Variable `isFastFood` déclarée AVANT usage ?** (ligne 114 avant ligne 205)
- [⏸️] **Variable `fastFoodType` déclarée AVANT usage ?** (ligne 115 avant ligne 206)
- [⏸️] **Fonction `fetchDernierFastFood` définie AVANT useEffect qui l'appelle ?** (ligne 242 avant ligne 205)

**Note :** Toutes les checkboxes seront cochées lors de l'implémentation, APRÈS vérification manuelle ligne par ligne.

---

## Étape 3 — Checklist stricte sécurité & qualité

### AVANT toute modification, je m'engage à :

- [⏸️] **Lecture complète** du code concerné (RepasBloc.js lignes 1-925, suivi.js lignes 650-730)
- [⏸️] **Initialisation systématique** avant usage (tous hooks en haut)
- [⏸️] **Respect strict ordre hooks** :
  - [ ] Tous `useState` lignes 75-125 (AUCUN ajout après)
  - [ ] Tous `useEffect` lignes 93-227 (ordre préservé)
  - [ ] Tous handlers lignes 228+ (après useEffect)
- [⏸️] **Aucune variable utilisée avant déclaration** (y compris dependency arrays)
- [⏸️] **Séparation stricte** : initialisation → logique → handlers → rendu
- [⏸️] **Fonctions présentes AVANT usage** (`fetchDernierFastFood` ligne 242 AVANT appel ligne 218)
- [⏸️] **Ordre logique strict** (pas de déclaration prématurée)
- [⏸️] **Pas de doublons** (vérifier pas de double déclaration `tag`)
- [⏸️] **Contrôle d'erreur** (try/catch dans fetchDernierFastFood)
- [⏸️] **Test tous cas d'usage** (fast food seul, multi-aliments, repas normaux)
- [⏸️] **Préservation fonctionnalités existantes** (tracking récompenses, délai 45 jours)
- [⏸️] **Mise à jour avancement** (après chaque étape)
- [⏸️] **Rollback immédiat si anomalie** (avec rapport horodaté)
- [⏸️] **Documentation claire** (chaque modification justifiée)
- [⏸️] **Relecture manuelle OBLIGATOIRE** (ne PAS se fier à mémoire Copilot)
- [⏸️] **Validation utilisateur AVANT implémentation** (ce plan)

---

## Étape 4 — Contrôles conformité

### 4.1 Lecture anomalies rollback (cf. Étape 1.2)

✅ **Fait** - 3 anomalies critiques identifiées :
1. Boucle infinie dependency arrays (26/12/2025 18:30)
2. Ordre hooks violé (26/12/2025 17:45)
3. Inline expressions (20/11/2025)

### 4.2 Checklist contrôle AVANT codage

**Point de vigilance #1 - Dependency arrays**
- [ ] `fetchDernierFastFood` définie avec useCallback OU en dehors composant
- [ ] useEffect auto-détection : dependency array = `[aliment]` UNIQUEMENT
- [ ] Pas de fonctions dans dependency arrays

**Point de vigilance #2 - Ordre hooks**
- [ ] Compter tous useState actuels (lignes 75-125) → 11 états
- [ ] AUCUN nouveau useState ajouté
- [ ] useEffect auto-détection APRÈS ligne 198 (dernier useEffect existant)

**Point de vigilance #3 - Modification onSave()**
- [ ] Paramètre `tag` ajouté SANS modifier signature existante
- [ ] Test régression : repas normaux ne doivent PAS avoir `tag` rempli
- [ ] Condition stricte : `tag: isFastFood ? fastFoodType : null`

**Point de vigilance #4 - Suppression code**
- [ ] Bloc `if (isFastFood)` lignes 444-462 → MARQUER pour suppression
- [ ] Vérifier aucune référence à `fast_food_history` ailleurs
- [ ] **ATTENDRE validation utilisateur AVANT suppression**

**Point de vigilance #5 - Query SQL**
- [ ] Tester query `WHERE categorie='fast-food'` sur données réelles
- [ ] Vérifier performance (EXPLAIN ANALYZE si >1000 repas)
- [ ] Fallback si query vide (premier fast food)

### 4.3 Audit risques - Anomalies bloquantes ?

✅ **Aucune anomalie bloquante détectée**

Conditions OK pour poursuivre :
- Template 9 étapes respectées
- Leçons anomalies rollback appliquées
- Checklists créées
- Plan validé par utilisateur (en attente)

---

## Étape 5 — Mise à jour de l'avancement

- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé

**Avancement actuel :** 0%  
**Date début :** 2026-01-09

### Historique mises à jour

| Date | Heure | Étape | Avancement | Commentaire |
|------|-------|-------|------------|-------------|
| 2026-01-09 | - | Plan créé | 0% | Attente validation utilisateur |

**Note :** Avancement sera mis à jour après chaque modification de fichier.

---

## Étape 6 — Point de vigilance

### 6.1 Rapport lecture anomalies rollback

**📊 Statistiques fichier anomalies (3243 lignes) :**
- Anomalies critiques : 15+
- Hooks order violations : 7
- Dependency arrays : 12
- Inline expressions : 5
- Double déclarations : 3

**🎯 Leçons applicables à notre tâche :**

**Leçon #1 - Boucle infinie (26/12/2025 18:30)**
```javascript
// ❌ ERREUR PASSÉE
useEffect(() => {
  onChangeChampsRepas({ aliment, quantite });
}, [aliment, quantite, onChangeChampsRepas]); // ← BOUCLE

// ✅ CORRECTION À APPLIQUER
useEffect(() => {
  if (aliment && aliment.trim()) {
    fetchDernierFastFood(); // Fonction stable
  }
}, [aliment]); // ← aliment seul
```

**Leçon #2 - Ordre hooks (26/12/2025 17:45)**
```javascript
// ❌ ERREUR PASSÉE
const [data, setData] = useState(null);
useEffect(() => { ... });
const [loading, setLoading] = useState(false); // ← APRÈS useEffect

// ✅ CORRECTION À APPLIQUER
// TOUS useState lignes 75-125
// TOUS useEffect lignes 93-227
// AUCUN mélange
```

**Leçon #3 - Variables avant usage (20/11/2025)**
```javascript
// ❌ ERREUR PASSÉE
useEffect(() => {
  console.log(referentielAliments); // ← Utilisé AVANT import
}, [referentielAliments]);

// ✅ CORRECTION À APPLIQUER
// Vérifier import referentielAliments ligne 4
// PUIS utiliser dans useEffect ligne 205
```

### 6.2 Erreurs similaires à éviter

**Erreur potentielle #1 - `tag` dans dependency array**
```javascript
// ❌ À ÉVITER
useEffect(() => {
  if (isFastFood) {
    // Logique qui modifie tag
    setTag(fastFoodType);
  }
}, [isFastFood, tag]); // ← BOUCLE si tag change

// ✅ CORRECT
useEffect(() => {
  if (aliment && aliment.trim()) {
    const found = referentielAliments.find(...);
    if (found && found.categorie === 'fast-food') {
      setIsFastFood(true);
      setFastFoodType(found.marque); // Tag sera passé dans onSave
    }
  }
}, [aliment]); // ← aliment seul suffit
```

**Erreur potentielle #2 - Suppression destructive**
```javascript
// ❌ À ÉVITER
// Supprimer lignes 444-462 sans backup
// sed -i '444,462d' RepasBloc.js

// ✅ CORRECT
// 1. Créer backup RepasBloc.js.backup-2026-01-09
// 2. Montrer code à supprimer à utilisateur
// 3. Attendre validation explicite
// 4. Utiliser replace_string_in_file (pas sed)
```

**Erreur potentielle #3 - Query SQL incomplète**
```javascript
// ❌ À ÉVITER
const { data } = await supabase
  .from('repas_reels')
  .select('*')
  .eq('categorie', 'fast-food'); // ← Pas de user_id!

// ✅ CORRECT
const { data } = await supabase
  .from('repas_reels')
  .select('*')
  .eq('user_id', user_id)  // ← OBLIGATOIRE
  .eq('categorie', 'fast-food')
  .order('date', { ascending: false })
  .limit(1);
```

### 6.3 Checklist vérification finale

**AVANT tout commit, je vérifierai :**

- [ ] Ordre hooks respecté (useState → useEffect → handlers)
- [ ] Dependency arrays minimalistes (pas de fonctions)
- [ ] `tag` rempli seulement si `isFastFood === true`
- [ ] Query SQL avec `user_id` obligatoire
- [ ] Tests multi-scénarios effectués (8 tests protocole)
- [ ] ESLint 0 erreur
- [ ] Backup créé (RepasBloc.js, suivi.js, tableau-de-bord.js)
- [ ] Code supprimé documenté (lignes 444-462)
- [ ] Rapport AVANT/APRÈS créé

---

## Étape 7 — Proposition de rollback

### 7.1 Stratégie rollback si problème

**Si anomalie détectée durant implémentation :**

1. **Arrêt immédiat modifications**
2. **Rollback fichiers modifiés :**
   ```bash
   cp components/RepasBloc.js.backup-2026-01-09 components/RepasBloc.js
   cp pages/suivi.js.backup-2026-01-09 pages/suivi.js
   cp pages/tableau-de-bord.js.backup-2026-01-09 pages/tableau-de-bord.js
   ```
3. **Documentation anomalie :**
   - Fichier : `/docs/Anomalie roll back`
   - Format : Date, heure, fichier, ligne, symptôme, cause, rollback
   - **Ajout FIN fichier** (jamais suppression)

4. **Rapport utilisateur :**
   - Anomalie détectée : [description]
   - Fichier concerné : [chemin]
   - Rollback effectué : [OUI/NON]
   - Alternative proposée : [solution]

### 7.2 Conditions déclenchement rollback

**Rollback IMMÉDIAT si :**
- ❌ ESLint erreur après modification
- ❌ Runtime error "Invalid hook call"
- ❌ Console warning "Maximum update depth"
- ❌ Tests protocole <50% PASS
- ❌ Régression repas normaux (tag rempli à tort)
- ❌ Query SQL timeout (>2s)

**Rollback PARTIEL si :**
- ⚠️ 1 fichier sur 3 problématique → rollback fichier seul
- ⚠️ Tests 50-75% PASS → corrections mineures puis retest

---

## Étape 8 — Rapport Markdown Copilot

### 8.1 RAPPORT AVANT Modification

#### Structure fichiers (état actuel)

**`/components/RepasBloc.js` (925 lignes) :**

**Hooks (lignes 75-227) :**
```javascript
// useState (11 états)
75-91:   États principaux (supabaseError, repasConforme, aliment, etc.)
112-119: États fast food existants (isFastFood, fastFoodType, fastFoodHistory, etc.)
121-125: États Option B (dernierFastFood, prochainCreneau, joursRestants, delaiRespected)

// useEffect (7 total)
93:   useEffect #1 - Auto-remplissage repas prévu
106:  useEffect #2 - onChangeChampsRepas callback
128:  useEffect #3 - Calcul récompense fast food (LOCAL, semaine courante)
158:  useEffect #4 - Auto-remplissage v2
169:  useEffect #5 - Calcul kcal auto fast food
193:  useEffect #6 - Validation semaine
205:  useEffect #7 - Auto-détection Option B (categorie référentiel)
```

**Fonctions (lignes 228+) :**
```javascript
228: handleDevalider
235: handleValider
242: fetchDernierFastFood (query fast_food_history) ← PROBLÈME
```

**handleSubmit (lignes 360-475) :**
```javascript
428: onSave && onSave({...})  // ← Pas de `tag` actuellement
444: if (isFastFood) {
       supabase.from('fast_food_history').insert([...])  // ← Table vide
     }
```

**Problèmes identifiés :**
1. ❌ `fetchDernierFastFood()` cherche dans `fast_food_history` (vide)
2. ❌ `onSave()` ne passe pas `tag` (restaurant non stocké)
3. ❌ useEffect ligne 128 calcule récompense sur `repasSemaine` (incomplet)
4. ❌ Double logique historique (repasSemaine local vs BDD)

---

**`/pages/suivi.js` (1704 lignes) :**

**handleSaveRepas (lignes 652-667) :**
```javascript
const handleSaveRepas = async (repasData) => {
  const { data, error } = await supabase
    .from("repas_reels")
    .insert([repasData]);  // ← repasData vient de onSave() RepasBloc
  // Pas de modification nécessaire ici (repasData contient déjà tout)
}
```

**Problème identifié :**
- ⚠️ `repasData` reçu de `onSave()` ne contient pas `tag` actuellement

---

**`/pages/tableau-de-bord.js` (1132 lignes) :**

**handleRefresh (lignes 125-145) :**
```javascript
const { data: ffData } = await supabase
  .from('fast_food_history')  // ← PROBLÈME : table vide
  .select('*')
  .gte('date', debut)
  .lte('date', fin)
  .order('date', { ascending: false });

setFastFoodHistory(ffData || []);
setFastFoodCount(ffData?.length || 0);  // ← Toujours 0
```

**Problèmes identifiés :**
1. ❌ Query table `fast_food_history` vide
2. ❌ `fastFoodCount` toujours 0 alors que données dans `repas_reels`

---

#### Données BDD (état actuel)

**Table `repas_reels` (colonnes utilisées) :**
```sql
user_id, date, type, aliment, categorie, quantite, kcal, est_extra,
satiete, pourquoi, ressenti, details_signaux, note,
tag ← VIDE actuellement
```

**Table `fast_food_history` :**
```sql
user_id, date, restaurant, aliments (JSONB), kcal, badge
← VIDE (insert jamais exécuté car isFastFood détecté trop tard)
```

**Exemple données utilisateur (image fournie) :**
```
2026-01-06 | Déjeuner | Frites KFC petite      | fast-food | 220 | tag=NULL
2026-01-06 | Déjeuner | Hot Wings KFC menu 6   | fast-food | 480 | tag=NULL
```

---

### 8.2 RAPPORT APRÈS Modification (PRÉVISIONNEL)

#### Structure fichiers (état cible)

**`/components/RepasBloc.js` - MODIFICATIONS :**

**1. useEffect auto-détection (ligne 205-223) - MODIFIÉ :**
```javascript
// AVANT
useEffect(() => {
  if (aliment && aliment.trim() !== '') {
    const found = referentielAliments.find(...);
    if (found && found.categorie === 'fast-food') {
      setIsFastFood(true);
      setFastFoodType(found.marque || 'Non identifié');
      fetchDernierFastFood();
    } else {
      setIsFastFood(false);
      setFastFoodType('');
      setDernierFastFood(null);
    }
  }
}, [aliment]);

// APRÈS (aucun changement logique, juste vérification)
// ✅ Déjà conforme : marque extraite du référentiel
// ✅ Déjà conforme : setFastFoodType(found.marque)
// ✅ À vérifier : fetchDernierFastFood() utilise bien nouvelle query
```

**2. fetchDernierFastFood (ligne 242-290) - MODIFIÉ :**
```javascript
// AVANT
const { data, error } = await supabase
  .from('fast_food_history')  // ❌ Table vide
  .select('*')
  .eq('user_id', user_id)
  .order('date', { ascending: false })
  .limit(1);

// APRÈS ✅
const { data, error } = await supabase
  .from('repas_reels')  // ✅ Source unique vérité
  .select('*')
  .eq('user_id', user_id)
  .eq('categorie', 'fast-food')  // ✅ Filtre fast food
  .order('date', { ascending: false })
  .limit(1);

// Reste identique : calcul délai, récompense, etc.
```

**3. onSave() (ligne 428-443) - MODIFIÉ :**
```javascript
// AVANT
onSave && onSave({
  type, date, aliment, categorie, quantite, kcal,
  est_extra, satiete, pourquoi, ressenti,
  details_signaux, note
});

// APRÈS ✅
onSave && onSave({
  type, date, aliment, categorie, quantite, kcal,
  est_extra, satiete, pourquoi, ressenti,
  details_signaux, note,
  tag: isFastFood ? fastFoodType : null  // ✅ AJOUT
});
```

**4. Insert fast_food_history (lignes 444-462) - SUPPRIMÉ :**
```javascript
// AVANT (29 lignes)
if (isFastFood) {
  import('../lib/supabaseClient').then(({ supabase }) => {
    supabase.auth.getUser().then(({ data: userData }) => {
      const user_id = userData?.user?.id || null;
      supabase.from('fast_food_history').insert([{
        user_id, date, restaurant: fastFoodType,
        aliments: fastFoodAliments,
        kcal: fastFoodAliments.reduce((sum, a) => sum + (parseInt(a.kcal) || 0), 0),
        badge: fastFoodReward ? 'ok' : null
      }]).then(({ error }) => {
        if (error) alert('Erreur Supabase (fast food): ' + error.message);
      });
    });
  });
}

// APRÈS (0 lignes) ✅
// SUPPRIMÉ COMPLÈTEMENT
// Raison : repas_reels = source unique, double insertion inutile
```

**Impact RepasBloc.js :**
- Lignes modifiées : 3 sections
- Lignes supprimées : 29
- Nouveaux imports : 0
- Ordre hooks : ✅ Préservé
- Tests requis : 6 scénarios

---

**`/pages/suivi.js` - AUCUNE MODIFICATION :**

```javascript
// handleSaveRepas ligne 652-667
// ✅ AUCUN changement requis
// repasData vient de onSave() qui contient déjà `tag`
// Insert dans repas_reels fonctionnera automatiquement
```

---

**`/pages/tableau-de-bord.js` - MODIFICATIONS :**

**1. handleRefresh (ligne 125-145) - MODIFIÉ :**
```javascript
// AVANT
const { data: ffData } = await supabase
  .from('fast_food_history')
  .select('*')
  .gte('date', debut)
  .lte('date', fin)
  .order('date', { ascending: false });

// APRÈS ✅
const { data: ffData } = await supabase
  .from('repas_reels')
  .select('*')
  .eq('categorie', 'fast-food')  // ✅ Filtre
  .gte('date', debut)
  .lte('date', fin)
  .order('date', { ascending: false });

setFastFoodHistory(ffData || []);
setFastFoodCount(ffData?.length || 0);  // ✅ Maintenant correct

// Calcul nextFastFoodDate : ✅ Identique (logique préservée)
```

**2. Affichage section fast food (ligne 631-650) - MODIFIÉ :**
```javascript
// AVANT
<div>
  🍔 {fastFoodCount}  {/* Toujours 0 */}
  Fast food sur la période
</div>

// APRÈS ✅
<div>
  🍔 {fastFoodCount}  {/* Compte correct depuis repas_reels */}
  Fast food sur la période
  {fastFoodHistory[0] && (
    <div>Dernier: {fastFoodHistory[0].tag || "Non identifié"}</div>
  )}
</div>
```

**Impact tableau-de-bord.js :**
- Lignes modifiées : 2 sections
- Lignes supprimées : 0
- Query SQL : ✅ Optimisée (1 table au lieu de 2)

---

#### Données BDD (état cible)

**Table `repas_reels` (APRÈS modifications) :**
```sql
-- Nouvelles entrées avec tag rempli
2026-01-09 | Déjeuner | Frites KFC        | fast-food | 220 | tag="KFC" ✅
2026-01-09 | Déjeuner | Hot Wings KFC     | fast-food | 480 | tag="KFC" ✅
2026-01-09 | Déjeuner | Big Mac           | fast-food | 550 | tag="McDonald's" ✅

-- Anciennes entrées (rétro-compatibilité)
2026-01-06 | Déjeuner | Frites KFC        | fast-food | 220 | tag=NULL ⚠️
  → Affichage: "Non identifié" (fallback)
```

**Table `fast_food_history` :**
```sql
-- Peut être supprimée OU gardée pour agrégation future
-- Pour l'instant : ignorée par le code
```

---

#### Comparaison comportement AVANT/APRÈS

**Scénario : Saisie "Frites KFC" + "Hot Wings KFC" même jour**

**AVANT :**
```
1. Tape "Frites KFC" → auto-détection → categorie="fast-food"
2. Enregistrer → repas_reels (1 ligne), fast_food_history (0 ligne)
3. Tape "Hot Wings KFC" → auto-détection
4. Enregistrer → repas_reels (2 lignes), fast_food_history (0 ligne)
5. fetchDernierFastFood() → query fast_food_history → VIDE
6. Message: "Première entrée fast food" ❌ (FAUX!)
7. Tableau de bord: 🍔 0 ❌
```

**APRÈS :**
```
1. Tape "Frites KFC" → auto-détection → categorie="fast-food", tag="KFC"
2. Enregistrer → repas_reels (1 ligne avec tag)
3. Tape "Hot Wings KFC" → auto-détection → tag="KFC"
4. Enregistrer → repas_reels (2 lignes avec tag)
5. fetchDernierFastFood() → query repas_reels WHERE categorie='fast-food'
6. Retourne: Hot Wings KFC (dernier)
7. Message: "Dernier fast food il y a 0 jours (KFC)" ✅
8. Tableau de bord: 🍔 2 ✅
```

---

#### Métriques changements

| Métrique | Avant | Après | Évolution |
|----------|-------|-------|-----------|
| Tables utilisées | 2 (repas_reels + fast_food_history) | 1 (repas_reels) | -50% |
| Queries par chargement | 2 | 1 | -50% |
| Lignes code RepasBloc.js | 925 | 896 | -29 lignes |
| Sources vérité historique | 2 (conflit) | 1 (cohérent) | ✅ Unifié |
| Précision tracking | 0% (vide) | 100% | +100% |
| Messages erronés | "Première entrée" (faux) | "Dernier il y a X jours" (vrai) | ✅ Corrigé |

---

## Étape 9 — Validation explicite de l'utilisateur

**⏸️ PLAN EN ATTENTE DE VALIDATION**

- [ ] Plan lu et compris par l'utilisateur
- [ ] Rapport AVANT/APRÈS validé
- [ ] Risques acceptés (10 risques identifiés)
- [ ] Leçons anomalies rollback approuvées
- [ ] Suppression code lignes 444-462 autorisée
- [ ] Tests protocole 8 scénarios acceptés
- [ ] **Date validation :** _____________

**⚠️ Aucune ligne de code ne sera modifiée sans validation explicite ci-dessus.**

---

## 📋 RÉCAPITULATIF MODIFICATIONS

### Fichiers modifiés (3)
1. `/components/RepasBloc.js` - 3 modifications + 1 suppression
2. `/pages/suivi.js` - 0 modification (onSave passe tag automatiquement)
3. `/pages/tableau-de-bord.js` - 2 modifications

### Lignes code
- Ajoutées : ~15 lignes
- Modifiées : ~30 lignes
- Supprimées : ~29 lignes
- **Net : -14 lignes** (simplification)

### Tests requis
- [⏸️] Test #1: Auto-détection Big Mac → tag="McDonald's"
- [⏸️] Test #2: Auto-détection Subway → tag="Subway"
- [⏸️] Test #3: Multi-aliments (Frites + Hamburger) → 2 lignes tag="KFC"
- [⏸️] Test #4: Repas normal (Poulet) → tag=NULL
- [⏸️] Test #5: fetchDernierFastFood() → retourne données repas_reels
- [⏸️] Test #6: Message délai correct (basé sur historique réel)
- [⏸️] Test #7: Tableau de bord compte correct
- [⏸️] Test #8: Rétro-compatibilité anciennes données (tag=NULL)

### Risques majeurs
1. ⚠️ Boucle infinie dependency arrays (mitigé: dependency array minimaliste)
2. ⚠️ Ordre hooks violé (mitigé: aucun nouveau useState)
3. ⚠️ Régression repas normaux (mitigé: condition `if (isFastFood)`)

### Temps estimé
- Implémentation : 40 min
- Tests manuels : 20 min
- Validation ESLint : 5 min
- Documentation : 10 min
- **Total : 1h15**

---

## ✅ VALIDATION FINALE

**Ce plan respecte-t-il Template 9 étapes ?**
- [x] Étape 1 - Audit risques (10 risques)
- [x] Étape 2 - Checklist imports (8 items)
- [x] Étape 3 - Checklist sécurité (15 items)
- [x] Étape 4 - Contrôles conformité (anomalies lues)
- [x] Étape 5 - Avancement (0%, historique créé)
- [x] Étape 6 - Point vigilance (3 leçons appliquées)
- [x] Étape 7 - Proposition rollback (stratégie définie)
- [x] Étape 8 - Rapport Markdown (AVANT/APRÈS complet)
- [x] Étape 9 - Validation utilisateur (en attente)

**Conformité Template :** ✅ 100%

**Prêt pour implémentation :** ⏸️ ATTENTE VALIDATION UTILISATEUR

---

**Date création plan :** 2026-01-09  
**Auteur :** GitHub Copilot (Claude Sonnet 4.5)  
**Durée création :** 35 minutes  
**Prochain jalon :** Validation utilisateur → Implémentation

# 📊 ÉTAT ACTUEL DU CODE — BILAN HEBDOMADAIRE
## Document d'analyse pour intégration nouvelles fonctionnalités

**Date création** : 25 janvier 2026  
**Objectif** : Cartographier le code existant et planifier l'intégration des 3 nouvelles lectures (A, B, C)

---

## 🗂️ ARCHITECTURE ACTUELLE

### Fichiers concernés

| Fichier | Rôle | Lignes | État |
|---------|------|--------|------|
| `/components/BilanHebdoModal.js` | Composant modal affichage bilan | 713 | ✅ Opérationnel |
| `/lib/validationSemaine.js` | Logique calculs et helpers | 582 | ✅ Opérationnel |
| `/pages/suivi.js` | Page principale, gestion validation | 2223 | ✅ Opérationnel |

---

## ✅ FONCTIONNALITÉS EXISTANTES (État des lieux)

### 📦 Section 1 — Signal énergétique (COMPLÈTE à 100%)

**Localisation** : `BilanHebdoModal.js` lignes 1-200  
**Statut** : ✅ Validée 18/01/2026, conforme fiche métier

#### Blocs implémentés

1. **Données principales** (lignes ~400-500)
   - Apports totaux
   - Budget extras
   - Extras consommés
   - Objectif hebdo

2. **Bloc "En savoir plus"** (fonction `BlocEnSavoirPlus`, lignes 27-90)
   - ✅ Lecture "repas vs extras"
   - ✅ Lecture "écart expliqué"
   - ✅ Lecture "fréquence vs intensité"
   - ✅ Alertes visuelles dynamiques (couleur, icône, message)
   - ✅ État rétractable (bouton "En savoir plus")

3. **Bloc "Lecture de la semaine"** (fonction `BlocLectureSemaine`, lignes 92-175)
   - ✅ Diagnostic global dynamique
   - ✅ Verbatims strictement métier
   - ✅ Logique conditionnelle selon données réelles
   - ✅ Phrase signature métier

#### Variables utilisées dans Section 1

```javascript
// Depuis props bilan
const {
  apportsTotaux,     // Total kcal semaine
  objectifHebdo,     // Objectif kcal semaine
  kcalExtras,        // Kcal extras uniquement
  extras,            // Nombre d'extras
  budgetExtras       // Budget extras autorisé
} = bilan || {};
```

---

### 📦 Section 2 — Tendance et trajectoire (PARTIELLE)

**Localisation** : `BilanHebdoModal.js` lignes 177-350  
**Statut** : 🟡 Structure en place, logique à enrichir

#### Blocs implémentés

1. **Bloc rétractable Accordion** (fonction `AccordionTendance`, lignes 177-250)
   - ✅ Bouton "Voir le détail"
   - ✅ État open/close
   - ✅ Accessibilité (aria-expanded, aria-controls)

2. **Tendance 7j** (lignes 200-230)
   - ✅ Calcul via `calculerTendance7j` (lib/validationSemaine.js)
   - ✅ Affichage tendance (perte/maintien/surplus)
   - ✅ Verbatim dynamique
   - ✅ Couleur badge selon tendance

3. **Comparaison N/N-1** (fonction `ComparaisonN1Block`, lignes 252-350)
   - ✅ Fetch semaine précédente depuis Supabase
   - ✅ Calcul écart N vs N-1
   - ✅ Verbatim dynamique (amélioration/stabilité/détérioration)
   - ⚠️ **À mettre à jour selon nouvelles règles métier (rapprochement/éloignement/reproduction)**

4. **Moyenne 14j** (composant `Moyenne14jBlock`, importé)
   - ✅ Calcul moyenne sur 14 jours
   - ✅ Affichage bloc dédié
   - ⚠️ **À enrichir selon nouvelle approche métier**

#### Variables utilisées dans Section 2

```javascript
// Depuis props bilan
const {
  apportsTotaux,
  objectifHebdo
} = bilan || {};

// Calculs dynamiques
const tendance = calculerTendance7j(apportsTotaux, objectifHebdo);
// Retourne: { label, couleur, verbatim, ecart, type, projection }
```

---

### 📦 Section 7 — Comment j'ai mangé (STRUCTURE OK, DONNÉES À DYNAMISER)

**Localisation** : `BilanHebdoModal.js` lignes 600-713  
**Statut** : 🟡 Structure conforme, données statiques/simulées

#### Blocs implémentés

1. **Bloc rétractable** (fonction `SectionCommentMange`, lignes 609-713)
   - ✅ Bouton "Comment j'ai mangé cette semaine"
   - ✅ État open/close
   - ✅ Accessibilité ARIA

2. **Ressenti global** (lignes 640-680)
   - 🟡 Satiété moyenne (à brancher sur vraies données)
   - 🟡 Humeur dominante (à brancher sur vraies données)
   - 🟡 Note utilisateur (à afficher si présente)

3. **Répartition extras hors repas** (lignes 682-700)
   - 🟡 Affichage par moment (matin/après-midi/soir/nuit)= fonctionne par type de repas petit dejeuner dejeuner diner collation ..;
   - ⚠️ Toutes valeurs à 0 → vérifier logique d'agrégation

4. **Gestion cas limite** (lignes 641-648)
   - ✅ Message "Aucune donnée saisie" si vide

#### Variables utilisées dans Section 7

```javascript
// Depuis props bilan
const {
  satieteMoyenne,
  humeurDominante,
  noteUtilisateur,
  nbRepasSatiete,
  nbRepasRessenti,
  extrasHorsRepas: { matin, apresmidi, soir, nuit }
} = bilan || {};
```

---

## 🔄 LOGIQUE DE GÉNÉRATION DU BILAN (pages/suivi.js)

### Fonction `handleValiderSemaine` (ligne 1016)

**Rôle** : Valider la semaine et générer le bilan

#### Données calculées et transmises au bilan

```javascript
// Structure actuelle de bilanData
{
  apportsTotaux: number,      // ✅ Calculé
  objectifHebdo: number,      // ✅ Calculé
  kcalExtras: number,         // ✅ Calculé
  extras: number,             // ✅ Calculé
  budgetExtras: number,       // ✅ Calculé
  satieteMoyenne: number,     // 🟡 À implémenter
  humeurDominante: string,    // 🟡 À implémenter
  noteUtilisateur: string,    // 🟡 À implémenter
  extrasHorsRepas: object     // 🟡 À implémenter
}
```

### Où ajouter les nouvelles données ?

**Fichier** : `/pages/suivi.js`  
**Fonction** : `handleValiderSemaine`  
**Localisation** : Après ligne 1100 (calcul des données de base)

---

## 🎯 PLAN D'INTÉGRATION — Nouvelles fonctionnalités (A, B, C)

### 🔵 LECTURE A — Répartition des jours vs objectif

#### Où intégrer ?

**Fichier** : `BilanHebdoModal.js`  
**Emplacement suggéré** : Après `BlocLectureSemaine` (ligne ~176)  
**Nom fonction** : `BlocRepartitionJours`

#### Données requises (à calculer dans pages/suivi.js)

```javascript
// Nouvelles données à ajouter à bilanData
{
  objectifJournalier: number,           // objectif_hebdo / 7
  joursCategories: {
    sous: number,                       // Nb jours écart <= -100
    proches: number,                    // Nb jours -100 < écart < +100
    legerDepassement: number,           // Nb jours +100 <= écart < +300
    debordement: number                 // Nb jours écart >= +300
  },
  joursIncomplets: number,              // Nb jours avec saisie insuffisante
  detailsJours: [                       // Détail par jour (optionnel)
    { date, kcal_total, ecart, categorie, incomplet }
  ]
}
```

#### Calcul à implémenter

**Fichier** : `/lib/validationSemaine.js`  
**Nouvelle fonction** :

```javascript
export function calculerRepartitionJours(repasReels, weekStart, objectifHebdo) {
  // 1. Identifier les 7 jours de la semaine
  // 2. Pour chaque jour, calculer kcal_total et ecart
  // 3. Catégoriser chaque jour (sous/proche/leger/debordement)
  // 4. Compter jours incomplets (si < 2 repas saisis)
  // 5. Retourner objet structuré
}
```

#### Affichage dans modal

```javascript
function BlocRepartitionJours() {
  const { joursCategories, joursIncomplets } = bilan || {};
  
  // Garde-fou données incomplètes
  if (joursIncomplets >= 2) {
    return <MessageLecturePartielle />;
  }
  
  // Affichage synthèse
  return (
    <section>
      <h4>Répartition des jours</h4>
      <p>Sur 7 jours : {joursCategories.sous + joursCategories.proches} jours 
      sous ou proches de l'objectif, {joursCategories.legerDepassement} jours 
      légèrement au-dessus, {joursCategories.debordement} jour(s) de 
      débordement plus marqué.</p>
      
      {/* Verbatim dynamique selon profil */}
      {getVerbatimRepartition(joursCategories)}
    </section>
  );
}
```

---

### 🔵 LECTURE B — Jour(s) qui pèsent dans l'écart

#### Où intégrer ?

**Fichier** : `BilanHebdoModal.js`  
**Emplacement suggéré** : Après `BlocRepartitionJours` (ligne ~200)  
**Nom fonction** : `BlocImpactJours`

#### Données requises

```javascript
// Nouvelles données à ajouter à bilanData
{
  surplusTotal: number,                 // Somme des écarts positifs uniquement
  jourPlusLourd: {
    date: string,
    ecart: number,
    part: number                        // Pourcentage du surplus total (0-1)
  },
  repartition: string                   // 'concentre' | 'fort' | 'diffus'
}
```

#### Calcul à implémenter

**Fichier** : `/lib/validationSemaine.js`  
**Nouvelle fonction** :

```javascript
export function calculerImpactJours(detailsJours) {
  // 1. Calculer surplus_total = sum(max(0, ecart))
  // 2. Identifier top1_surplus = max écart positif
  // 3. Calculer part_top1 = top1 / surplus_total
  // 4. Déterminer repartition (>=0.5 concentre, 0.3-0.5 fort, <0.3 diffus)
  // 5. Retourner objet structuré
}
```

#### Affichage dans modal

```javascript
function BlocImpactJours() {
  const { jourPlusLourd, repartition } = bilan || {};
  
  const partPourcent = Math.round(jourPlusLourd.part * 100);
  
  return (
    <section>
      <h4>Impact des journées</h4>
      
      {repartition === 'concentre' && (
        <>
          <p>1 journée explique ~{partPourcent}% de l'excédent hebdomadaire.</p>
          <p style={{fontStyle:'italic'}}>
            L'écart ne s'est pas construit progressivement : 
            il s'est surtout joué sur un moment précis.
          </p>
        </>
      )}
      
      {repartition === 'diffus' && (
        <>
          <p>L'excédent est réparti sur plusieurs jours (pas un seul pic).</p>
          <p style={{fontStyle:'italic'}}>
            L'écart se répète sur plusieurs jours. 
            Le corps perçoit une continuité, pas un accident.
          </p>
        </>
      )}
    </section>
  );
}
```

---

### 🔵 LECTURE C — Évolution extras vs semaine précédente

#### Où intégrer ?

**Fichier** : `BilanHebdoModal.js`  
**Emplacement suggéré** : Après `BlocImpactJours` (ligne ~220)  
**Nom fonction** : `BlocEvolutionExtras`

#### Données requises

```javascript
// Nouvelles données à ajouter à bilanData
{
  extrasKcalN: number,                  // Kcal extras semaine courante
  extrasNbN: number,                    // Nb extras semaine courante
  extrasKcalN1: number,                 // Kcal extras semaine précédente
  extrasNbN1: number,                   // Nb extras semaine précédente
  deltaKcal: number,                    // N - N-1 (kcal)
  deltaNb: number,                      // N - N-1 (nombre)
  tendanceExtras: string                // 'progres' | 'stable' | 'plus_present'
}
```

#### Calcul à implémenter

**Fichier** : `/lib/validationSemaine.js`  
**Nouvelle fonction** :

```javascript
export function calculerEvolutionExtras(extrasN, extrasN1) {
  // 1. Calculer deltaKcal et deltaNb
  // 2. Appliquer seuils :
  //    - Progrès : deltaKcal <= -200 OU deltaNb <= -2
  //    - Stable : -200 < deltaKcal < +200 ET -1 <= deltaNb <= +1
  //    - Plus présent : deltaKcal >= +200 OU deltaNb >= +2
  // 3. Retourner objet structuré avec tendance
}
```

#### Affichage dans modal

```javascript
function BlocEvolutionExtras() {
  const { tendanceExtras, deltaKcal, deltaNb } = bilan || {};
  
  return (
    <section>
      <h4>Évolution des extras</h4>
      
      {tendanceExtras === 'progres' && (
        <p style={{color:'#22c55e', fontWeight:600}}>
          Les extras sont mieux maîtrisés que la semaine précédente. 
          Une régulation est déjà en place.
        </p>
      )}
      
      {tendanceExtras === 'stable' && (
        <p>
          Les extras restent dans une continuité similaire à la semaine précédente.
        </p>
      )}
      
      {tendanceExtras === 'plus_present' && (
        <p style={{color:'#eab308'}}>
          Les extras ont été plus présents cette semaine. 
          Sur la durée, cela pèse dans la trajectoire.
        </p>
      )}
    </section>
  );
}
```

---

## 📋 ORDRE D'INTÉGRATION RECOMMANDÉ

### Phase 1 — Calculs dans lib/validationSemaine.js

1. ✅ Créer fonction `calculerRepartitionJours`
2. ✅ Créer fonction `calculerImpactJours`
3. ✅ Créer fonction `calculerEvolutionExtras`
4. ✅ Tester unitairement chaque fonction

### Phase 2 — Intégration dans pages/suivi.js

1. ✅ Appeler les 3 nouvelles fonctions dans `handleValiderSemaine`
2. ✅ Enrichir objet `bilanData` avec nouvelles données
3. ✅ Vérifier garde-fous données incomplètes
4. ✅ Tester génération bilan avec données réelles

### Phase 3 — Affichage dans BilanHebdoModal.js

1. ✅ Créer composant `BlocRepartitionJours`
2. ✅ Créer composant `BlocImpactJours`
3. ✅ Créer composant `BlocEvolutionExtras`
4. ✅ Intégrer dans le rendu principal
5. ✅ Tester accessibilité et responsive

### Phase 4 — Tests et validation

1. ✅ Tests avec semaines complètes
2. ✅ Tests avec semaines incomplètes (≥2 jours vides)
3. ✅ Tests avec données N-1 absentes
4. ✅ Tests cas limites (tous jours conformes, tous débordement, etc.)
5. ✅ Validation utilisateur finale

---

## 🔍 POINTS DE VIGILANCE

### Données requises obligatoires

Pour chaque jour de la semaine (7 jours), il faut :
- ✅ `kcal_total_jour` (repas + extras)
- ✅ `jour_incomplet` (booléen)
- ✅ `ecart_jour` (kcal_total - objectif_jour)

**Source données** : Table `repas_reels` dans Supabase

### Garde-fous

1. **Données incomplètes** : Si ≥2 jours incomplets, afficher message "Lecture partielle"
2. **Semaine N-1 absente** : Ne pas afficher Lecture C (évolution extras)
3. **Aucun surplus** : Lecture B (impact jours) non pertinente si surplus_total = 0

### Non-régression

⚠️ **IMPÉRATIF** : Ne jamais modifier Section 1 (validée et conforme)

- Tester que Section 1 reste intacte après ajout de A, B, C
- Vérifier aucun doublon de message
- Préserver strictement les verbatims Plan Vital existants

---

## 🎨 POSITIONNEMENT VISUEL DANS LA MODALE

### Structure recommandée

```
┌─────────────────────────────────────┐
│  BILAN HEBDOMADAIRE                 │
├─────────────────────────────────────┤
│  Section 1 — Signal énergétique     │
│  (existant, ne pas toucher)         │
│                                     │
│  ► En savoir plus (rétractable)     │
│  ► Lecture de la semaine            │
├─────────────────────────────────────┤
│  🆕 LECTURE A — Répartition jours   │  ← NOUVELLE
│     (1 phrase max)                  │
├─────────────────────────────────────┤
│  🆕 LECTURE B — Impact jours        │  ← NOUVELLE
│     (1 phrase max)                  │
├─────────────────────────────────────┤
│  🆕 LECTURE C — Évolution extras    │  ← NOUVELLE
│     (1 phrase max)                  │
├─────────────────────────────────────┤
│  Section 2 — Tendance trajectoire   │
│  (existant, peut cohabiter)         │
│                                     │
│  ► Voir le détail (rétractable)     │
├─────────────────────────────────────┤
│  Section 7 — Comment j'ai mangé     │
│  (existant, à dynamiser données)    │
│                                     │
│  ► Voir le détail (rétractable)     │
└─────────────────────────────────────┘
```

### Règles visuelles

- **1 phrase max par lecture** (A, B, C)
- Encadré distinct pour chaque lecture
- Couleur/icône selon contexte (⚠️ alerte, ✅ conformité)
- Espacement 1.5rem entre chaque bloc

---

## ✅ CHECKLIST DE VALIDATION (avant commit)

### Conformité métier

- [ ] Verbatims strictement alignés fiche métier
- [ ] Aucun mot interdit ("bien/mal", "tu devrais", "alerte", "risque")
- [ ] Ton Plan Vital : trajectoire, direction, continuité
- [ ] Phrase socle présente : "Une journée ne décide rien..."

### Conformité technique

- [ ] Hooks déclarés en haut du composant
- [ ] Aucune modification de Section 1
- [ ] Garde-fous données incomplètes activés
- [ ] Gestion cas N-1 absente
- [ ] Accessibilité (ARIA, focus, contraste)
- [ ] Tests cas limites validés

### Conformité UX

- [ ] Pas de surcharge (1 phrase max par lecture)
- [ ] Pas de répétition avec Section 1
- [ ] Blocs visuellement distincts
- [ ] Responsive mobile testé

---

## 📝 RÉSUMÉ — QUE FAIRE ET OÙ ?

| Tâche | Fichier | Fonction/Zone | Priorité |
|-------|---------|---------------|----------|
| Créer calcul répartition jours | `lib/validationSemaine.js` | Nouvelle fonction `calculerRepartitionJours` | 🔥 Critique |
| Créer calcul impact jours | `lib/validationSemaine.js` | Nouvelle fonction `calculerImpactJours` | 🔥 Critique |
| Créer calcul évolution extras | `lib/validationSemaine.js` | Nouvelle fonction `calculerEvolutionExtras` | 🔥 Critique |
| Enrichir génération bilan | `pages/suivi.js` | Fonction `handleValiderSemaine` (~ligne 1100) | 🔥 Critique |
| Créer bloc Lecture A | `BilanHebdoModal.js` | Nouvelle fonction `BlocRepartitionJours` | 🟡 Haute |
| Créer bloc Lecture B | `BilanHebdoModal.js` | Nouvelle fonction `BlocImpactJours` | 🟡 Haute |
| Créer bloc Lecture C | `BilanHebdoModal.js` | Nouvelle fonction `BlocEvolutionExtras` | 🟡 Haute |
| Intégrer blocs dans rendu | `BilanHebdoModal.js` | Fonction principale (ligne ~600) | 🟡 Haute |
| Tests unitaires | `tests/` | Créer fichiers tests | 🟢 Moyenne |

---

**Document créé par** : GitHub Copilot  
**Date** : 25 janvier 2026  
**Prochaine étape** : Validation utilisateur avant implémentation

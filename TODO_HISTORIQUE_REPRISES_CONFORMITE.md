# TODO - Historique Reprises : Conformité & Implémentation

## 🎯 Objectif Global
Transformer le système d'historique reprises d'un simple **affichage de données** vers un système **intelligent d'apprentissage et de propositions** qui guide le jeune dans sa reprise alimentaire.

**Norme de conformité:** Les 4 cas d'usage du SYNTHESE_HISTORIQUE_REPRISES.md doivent être couverts à 100%.

---

## 📊 État actuel vs Attendu

### Cas d'Usage #1: Propositions intelligentes quotidiennes
**Attendu:** 
```
Jour 5 Phase 2 → App regarde historique et propose:
"✨ Jour 5 Phase 2 : Tu réussis bien avec Yaourt (3 fois). Continues !"
```

**Actuellement:** ❌ Pas de propositions intelligentes
**Écart:** Aucune logique de comparaison jour/phase vs historique
**Priorité:** 🔴 HAUTE (impact UX direct)

---

### Cas d'Usage #2: Débloquer les jours critiques
**Attendu:**
```
Jour 8 Phase 3 (stagnation récurrente)
→ App détecte: "Stagnation 2/3 reprises"
→ Propose: "Essaie Saumon (ça a marché avant jour 8)"
```

**Actuellement:** ❌ Pas de détection de blocages
**Écart:** Pas d'analyse de patterns jour/phase problématiques
**Priorité:** 🔴 HAUTE (engagement utilisateur critique)

---

### Cas d'Usage #3: Dashboard analytique
**Attendu:**
```
Après 3 reprises:
- "Phase 5 atteinte 100% (3/3 reprises)"
- "Jour 8 Phase 3 : Problématique (stagnation 2x sur 3)"
- "🏆 Aliment meilleur : Yaourt +0.35kg avg vs Fromage +0.1kg"
- "📈 Poids moyen : 78kg → 73kg (progression +5kg/reprise)"
```

**Actuellement:** ❌ Affichage par-reprise seulement
**Écart:** Pas d'agrégation cross-reprises, pas de stats
**Priorité:** 🟡 MOYENNE (feature avancée, mais importante)

---

### Cas d'Usage #4: Optimiser future reprise
**Attendu:**
```
"Ces 3 reprises montrent que Phase 1 + Yaourt c'est ton combo gagnant"
→ Suggestions pour prochaine reprise
```

**Actuellement:** ❌ Pas de recommandations futures
**Écart:** Pas d'apprentissage appliqué à la saisie suivante
**Priorité:** 🟡 MOYENNE (amélioration progressive)

---

## 🔧 Écarts de Données Identifiés

### Écart #1: Structure archivée incomplète
**Fichier:** `pages/reprise-alimentaire-apres-jeune.js` (lignes 552-600)

**Actuellement archivé:**
```javascript
{
  id, dateDebut, dateFin, duree, joursValides,
  repasConsommes: [...],
  bilan: { taux_conformite, taux_validation, phases, totaux }
}
```

**Manquant pour la conformité:**
- ❌ `phaseMaxAtteinte` → CRITIQUE pour savoir progression max
- ❌ `poidsParJourParPhase` → CRITIQUE pour trends
- ❌ `alimentsConsommes` (par phase) → CRITIQUE pour patterns
- ❌ `notes` optionnelles → Nice-to-have (contexte)

**Action requise:** Enrichir structure archivage lors de snapshot Phase 5

---

### Écart #2: Données manquantes dans modal
**Fichier:** `components/HistoriqueReprisesModal.js` (inexistant ou incomplet)

**Manquant:**
- ❌ Extraction `poidsParJourParPhase` depuis archive
- ❌ Extraction `alimentsConsommes` par phase
- ❌ Calcul progressions/trends
- ❌ Identification patterns

**Action requise:** Ajouter extraction & calcul de données analytiques

---

## 📝 PLAN DE CONFORMITÉ (Priorisé)

### PHASE 1: Enrichir les données archivées (PRIORITÉ 🔴 HAUTE)
**Objectif:** Assurer que les snapshots contiennent toutes les données nécessaires aux analyses

#### Tâche 1.1: Ajouter `phaseMaxAtteinte` à l'archivage
- **Fichier:** `pages/reprise-alimentaire-apres-jeune.js`
- **Localisation:** Fonction archivage (lignes 552-600)
- **Action:** Lors snapshot, sauvegarder `Math.max(...phases complétées)` ou dernier jour atteint
- **Vérification:** `historiqueReprises[0].phaseMaxAtteinte === 5` après Phase 5 complétée
- **Statut:** [ ] À faire

#### Tâche 1.2: Ajouter `poidsParJourParPhase` à l'archivage
- **Fichier:** `pages/reprise-alimentaire-apres-jeune.js`
- **Localisation:** Fonction archivage
- **Action:** Extraire de `poids` (state) → créer structure:
  ```javascript
  poidsParJourParPhase: {
    "Phase 1": [78.0, 77.8, 77.5],
    "Phase 2": [77.5, 77.3, 77.2],
    ...
  }
  ```
- **Source:** `poids` state qui est updaté chaque jour
- **Vérification:** `historiqueReprises[0].poidsParJourParPhase["Phase 1"].length === 3`
- **Statut:** [ ] À faire

#### Tâche 1.3: Ajouter `alimentsConsommes` par phase à l'archivage
- **Fichier:** `pages/reprise-alimentaire-apres-jeune.js`
- **Localisation:** Fonction archivage
- **Action:** Extraire de `repasConsommes` → grouper par phase:
  ```javascript
  alimentsConsommes: {
    "Phase 1": ["Pomme", "Poulet vapeur", "Riz"],
    "Phase 2": ["+ Yaourt", "+ Fromage"],
    ...
  }
  ```
- **Source:** `repasConsommes` state (array of {jour, phase, aliments})
- **Vérification:** Tous aliments uniques groupés par phase
- **Statut:** [ ] À faire

#### Tâche 1.4: Ajouter `notes` optionnelles à l'archivage
- **Fichier:** `pages/reprise-alimentaire-apres-jeune.js`
- **Localisation:** Phase 5 completion form / UI
- **Action:** Ajouter textarea pour notes contextuelles, sauvegarder dans archive
- **Exemple:** "Bonne reprise, moins de stress cette fois", "Jour 8 toujours difficile"
- **Vérification:** `historiqueReprises[0].notes` peut être vide ou avoir texte
- **Statut:** [ ] À faire

---

### PHASE 2: Créer module d'apprentissage (PRIORITÉ 🔴 HAUTE)
**Objectif:** Implémenter logique d'analyse patterns pour propositions intelligentes

#### Tâche 2.1: Créer fichier `lib/analyzeHistorique.js`
- **Contenu:** 4 fonctions principales d'analyse
- **Statut:** [ ] À faire

**Fonction 2.1a: `analyzerHistorique(historiqueReprises, jourActuel, phaseActuelle)`**
- **Entrée:** Toutes les reprises archivées + jour/phase actuel
- **Sortie:** 
  ```javascript
  {
    propositionsAliements: [...],
    alertesJoursCritiques: [...],
    statsGlobales: {...},
    recommandations: [...]
  }
  ```
- **Logique:** Orchestrateur principal, appelle les 3 autres fonctions
- **Test:** Doit fonctionner avec 1, 2, 3+ reprises dans historique
- **Statut:** [ ] À faire

**Fonction 2.1b: `trouverAlimentsGagnants(historiqueReprises, jour, phase)`**
- **Entrée:** Historique + jour/phase recherchés
- **Sortie:** 
  ```javascript
  [
    { aliment: "Yaourt", succes: 3, echecs: 0, deltaPoids: +0.35 },
    { aliment: "Fromage", succes: 2, echecs: 1, deltaPoids: +0.10 },
    ...
  ]
  ```
- **Logique:** 
  - Cherche aliments consommés ce jour/phase dans historique
  - Compte succès (poids up) vs échecs (poids down/stable)
  - Calcule delta poids moyen
  - Trie par succès décroissant
- **Vérification:** Yaourt doit être #1 si consommé 3x avec succes
- **Statut:** [ ] À faire

**Fonction 2.1c: `detecterJoursCritiques(historiqueReprises)`**
- **Entrée:** Historique reprises
- **Sortie:**
  ```javascript
  [
    { jour: 8, phase: "Phase 3", stagnations: 2, totalReprises: 3, alerte: "STAGNATION" },
    ...
  ]
  ```
- **Logique:**
  - Calcule poids moyen par jour/phase across reprises
  - Identifie jours où poids < moyenne + seuil = "stagnation"
  - Count stagnations par jour/phase
  - Flag si > 50% reprises ont stagnation ce jour
- **Vérification:** Jour 8 Phase 3 doit être détecté si 2/3 reprises stagnent
- **Statut:** [ ] À faire

**Fonction 2.1d: `calculerStatsGlobales(historiqueReprises)`**
- **Entrée:** Toutes reprises
- **Sortie:**
  ```javascript
  {
    phases: {
      "Phase 1": { tauxReussite: 100, compteur: "3/3" },
      "Phase 2": { tauxReussite: 66, compteur: "2/3" },
      ...
    },
    alimentMeilleur: { aliment: "Yaourt", deltaPoids: +0.35 },
    poidsMoyen: { debut: 78, fin: 73, progression: +5 },
    reprisesMoyenne: { poids: -2.3, phases: 4.2 },
    trends: [...]
  }
  ```
- **Logique:** Agrège toutes données reprises en statistiques globales
- **Vérification:** Doit donner stats valides avec 1+ reprises
- **Statut:** [ ] À faire

#### Tâche 2.2: Intégrer `analyzerHistorique` à `suivi.js`
- **Fichier:** `pages/suivi.js`
- **Localisation:** Component render jour/phase
- **Action:** 
  - Importer `analyzerHistorique`
  - Appeler à chaque changement jour/phase
  - Sauvegarder résultat dans state `currentAnalysis`
  - Passer à component qui affiche propositions
- **Statut:** [ ] À faire

#### Tâche 2.3: Créer component `PropositionsIntelligentes.js`
- **Fichier:** `components/PropositionsIntelligentes.js`
- **Affichage:** 
  - Bandeau avec propositions aliments si trouvés
  - Alerte jour critique si détecté
  - Recommandation combo si identified
- **Styling:** Icon ✨ pour propositions, ⚠️ pour alertes
- **Statut:** [ ] À faire

---

### PHASE 3: Enrichir le modal historique (PRIORITÉ 🟡 MOYENNE)
**Objectif:** Ajouter vue dashboard et insights au modal existant

#### Tâche 3.1: Ajouter onglet "Dashboard" au modal
- **Fichier:** `components/HistoriqueReprisesModal.js`
- **Affichage:** 
  - Stats globales (phases atteintes, aliment meilleur, poids moyen)
  - Graphique trends (si possible Chart.js)
  - Alertes jours critiques
- **Statut:** [ ] À faire

#### Tâche 3.2: Améliorer onglet "Détails" avec insights
- **Fichier:** `components/HistoriqueReprisesModal.js`
- **Affichage par reprise:**
  - Aliments consommés groupés par phase
  - Poids par jour par phase (mini chart)
  - Jours critiques rencontrés dans CETTE reprise
  - Notes utilisateur si présentes
- **Statut:** [ ] À faire

#### Tâche 3.3: Ajouter recommandations pour prochaine reprise
- **Fichier:** `components/HistoriqueReprisesModal.js` ou nouveau component
- **Affichage:** "Basé sur vos 3 reprises: Essayez ce combo..."
- **Statut:** [ ] À faire

---

### PHASE 4: Validation & Tests (PRIORITÉ 🟡 MOYENNE)
**Objectif:** Assurer conformité complète

#### Tâche 4.1: Tester avec 3+ reprises archivées
- **Action:** Créer/utiliser données test
- **Vérifier:**
  - [ ] Propositions aliments générées correctement
  - [ ] Jours critiques détectés
  - [ ] Stats globales exactes
  - [ ] Dashboard affichage correct
- **Statut:** [ ] À faire

#### Tâche 4.2: Validation UX/UI
- **Action:** Test avec utilisateur réel ou simulation
- **Vérifier:**
  - [ ] Propositions utiles et pertinentes
  - [ ] Alertes compréhensibles
  - [ ] Dashboard lisible
  - [ ] Pas de lags/performance issues
- **Statut:** [ ] À faire

#### Tâche 4.3: Vérifier build & no errors
- **Action:** `npm run build`
- **Vérifier:** Aucun error/warning
- **Statut:** [ ] À faire

---

## 📌 Dépendances entre Tâches

```
Phase 1 (données) → Phase 2 (logique) → Phase 3 (UI) → Phase 4 (tests)
   ↓                  ↓                   ↓
1.1-1.4         2.1a-2.1d            3.1-3.3
(archivage)     (analyzerHistorique)  (modal/components)
```

**Chaîne d'exécution recommandée:**
1. Tâches 1.1-1.4 (enrichir archivage) — bloqueur pour tout
2. Tâches 2.1a-2.1d (créer analyzerHistorique) — logique centrale
3. Tâche 2.2-2.3 (intégrer propositions) — affichage utilisateur
4. Tâches 3.1-3.3 (enrichir modal) — feature avancée
5. Tâches 4.1-4.3 (tests) — validation finale

---

## ✅ Définition de "Conforme"

Le système est **conforme** quand:

- [ ] **CAS #1:** Jour 5 Phase 2 → App propose aliments réussis ce jour
- [ ] **CAS #2:** Jour 8 Phase 3 → App détecte stagnation & propose déblocages
- [ ] **CAS #3:** Modal affiche stats globales (phases, aliments, poids)
- [ ] **CAS #4:** Recommandations générées pour prochaine reprise
- [ ] **DONNÉES:** Archives contiennent poidsParJourParPhase + alimentsConsommes
- [ ] **LOGIQUE:** analyzerHistorique fonctionne avec 1+ reprises
- [ ] **BUILD:** `npm run build` passe sans errors
- [ ] **UX:** Propositions affichées et claires pour utilisateur

---

## 📞 Notes Importantes

### Règle de Modification Stricte
⚠️ **AUCUNE modification de code sans PLAN validé préalablement**

Avant de toucher à n'importe quel fichier:
1. Créer/valider le PLAN_IMPL_XXXX.md
2. Soumettre plan pour approbation
3. PUIS faire les modifications

### Fichiers Autorisés à Modifier
- `pages/reprise-alimentaire-apres-jeune.js` (archivage enrichi)
- `pages/suivi.js` (intégration propositions)
- `components/HistoriqueReprisesModal.js` (enrichissement modal)
- `lib/analyzeHistorique.js` (créer nouveau)
- `components/PropositionsIntelligentes.js` (créer nouveau)

### Fichiers NON à modifier (pour l'instant)
- `pages/jeûne.js`
- `components/Feedback.js`
- Toute autre logique métier existante

---

## 🎯 Récapitulatif Conformité

| CAS USAGE | STATUT | BLOCKERS | ETA |
|-----------|--------|----------|-----|
| #1 Propositions quotidiennes | ❌ Pas implémenté | Phase 2 & 3 nécessaires | Post Phase 2 |
| #2 Débloquer jours critiques | ❌ Pas implémenté | Phase 2 & 3 nécessaires | Post Phase 2 |
| #3 Dashboard analytique | ❌ Pas implémenté | Phase 1, 2, 3 nécessaires | Post Phase 3 |
| #4 Optimiser future reprise | ❌ Pas implémenté | Phase 2, 3 nécessaires | Post Phase 3 |
| **GLOBAL CONFORMITÉ** | **0/4** | **Tout Phase 1-4** | **Post Phase 4** |

**Prochaine action:** Créer PLAN_IMPL_PHASE1_ENRICHISSEMENT_DONNEES.md avec détails de codage, puis soumettre pour validation avant modifications.

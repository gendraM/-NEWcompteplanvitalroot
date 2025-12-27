# 🟠 PLAN D'IMPLÉMENTATION PHASE 4 — RÉVISÉ (Conforme Source & Fiche Métier)

**Date création:** 27 Décembre 2025  
**Status:** ⏳ PRÊT POUR VALIDATION  
**Audit:** Conformité source + fiche métier + retour d'expérience Phase 1-2

---

## **RÉSUMÉ AUDIT CONFORMITÉ**

### ✅ Écarts identifiés & corrigés

| Aspect | Plan initial | Source réelle | Correction |
|--------|-------------|--------------|-----------|
| **Couleur Phase 4** | Orange #FF9800 | À auditer NotificationsPhase4.js | Vérifier gradients = Phase 2 ou orange ? |
| **Aliments Phase 4** | 12 féculents OK | Confirmé alimentsRepriseJeune.js L551-729 | ✅ Exactement 12 ✓ |
| **Horaires Phase 4** | "8h flocons, 11h fruit, 13h MIDI, 16h légumineuses, 19h protéines" | À vérifier NotificationsPhase4.js | Lire horairesPhase4 réels ligne X |
| **Aliments avec recettes** | 8 types | À limiter à ce qui existe réellement | Auditer RecettesPhase4Modal.js pour types vrais |
| **Pattern modale** | Copié Phase 2 OK | Phase 2 confirma parfait | ✅ Pattern identique Phase 1-2-3 ✓ |
| **Notifications bloc** | Ajouté après Phase 3 | Phase 1-2 modèle suivi | ✅ Même structure notifications ✓ |

### 📝 Fiche métier Phase 4 (Source OFFICIELLE alimentsRepriseJeune.js L551)

```
🍠 PHASE 4 - FÉCULENTS DOUX (~20% durée reprise — voir formule reprise = jeûne × 2)
Objectif : Réintroduction progressive glucides, sortie cétose
Durée : 20% de (jeûne × 2)  →  Exemple : jeûne 10j = reprise 20j = Phase 4 = 4 jours
```

**12 Aliments RÉELS :**
1. Patate douce (tubercule) — 90 kcal, 80g
2. Riz complet (riz) — 110 kcal, 1.5 CS
3. Quinoa (graine) — 100 kcal, 1.5 CS
4. Flocons d'avoine (céréale) — 70 kcal, 2 CS
5. Sarrasin (graine) — 95 kcal, 1.5 CS
6. Lentilles corail (légumineuse) — 80 kcal, 2 CS
7. Pain complet au levain (pain) — 60 kcal, 1 tranche fine
8. Banane mûre (fruit frais) — 90 kcal, 1/2 unité
9. Pois chiches cuits (légumineuse) — 90 kcal, 2 CS
10. Pomme de terre vapeur (tubercule) — 70 kcal, 80g
11. Courge spaghetti (légume) — 30 kcal, 150g — **ALTERNATIVE féculents (favoriseCetose:true)**
12. Millet (céréale) — 100 kcal, 1.5 CS

**Aliments avec `favoriseCetose:true`** → Affichables en Phase 3-4  
**Aliments avec `favoriseCetose:false`** → Féculents purs (sortie cétose)

---

## **Titre de la tâche**
Intégrer Phase 4 (Féculents doux) conformément à la fiche métier source + pattern validé Phase 1-2

---

## **Description précise**

### 🎯 Objectif
Ajouter Phase 4 avec :
- ✅ NotificationsPhase4 dans page (après Phase 3)
- ✅ RecettesPhase4Modal liée à boutons recettes
- ✅ Modale aliments Phase 4 avec 12 féculents (sans rien ajouter/enlever)
- ✅ Boutons recettes SEULEMENT pour aliments ayant des recettes dans RecettesPhase4Modal.js
- ✅ Notifications bloc Phase 4 avec horaires RÉELS du composant

### 📋 **Trois modifications à faire**

#### **Modification 1 : Audit NotificationsPhase4.js**
- **Quoi** : Lire les horaires réels et couleurs du composant
- **Où** : `/components/NotificationsPhase4.js` (208 lignes)
- **Contrôles** :
  - [ ] Horaires actuels = `horairesPhase4` lignes X-Y ?
  - [ ] Gradient couleurs = orange ou autre ?
  - [ ] Emojis = 🟠, 🔵, etc. ?
  - [ ] État logique = phase 4 bien détecté ?
- **Action** : Corriger couleurs/emojis si déviation (comme Phase 3)
- **Résultat attendu** : Notification affichée correctement avec horaires Phase 4

#### **Modification 2 : Audit RecettesPhase4Modal.js**
- **Quoi** : Déterminer types recettes réels disponibles
- **Où** : `/components/RecettesPhase4Modal.js`
- **Contrôles** :
  - [ ] Quels types dans `recettes = { ... }` ? (chercher les clés)
  - [ ] Récettes pour féculents ? (riz, quinoa, flocons, etc.)
  - [ ] Recettes pour fruits ? (banane)
  - [ ] Recettes pour légumineuses ? (lentilles, pois chiches)
- **Résultat attendu** : Liste des types recettes Phase 4 pour adapter le code

#### **Modification 3 : Intégrer Phase 4 dans page**
- **Quoi** : Ajouter imports + state + JSX + modale aliments
- **Où** : `/pages/reprise-alimentaire-apres-jeune.js`

**3.1 — Ajouter imports (ligne 6-10)**
```javascript
import NotificationsPhase4 from '../components/NotificationsPhase4';
import RecettesPhase4Modal from '../components/RecettesPhase4Modal';
```

**3.2 — Vérifier state modalRecettesPhase4 (ligne ~225)**
```javascript
const [modalRecettesPhase4, setModalRecettesPhase4] = useState({ isOpen: false, type: 'default' });
```

**3.3 — Ajouter JSX NotificationsPhase4 (ligne ~1900, après Phase 3)**
```javascript
<NotificationsPhase4 
  jourNum={jourNum}
  onRecettesClick={(type) => setModalRecettesPhase4({ isOpen: true, type })}
/>
```

**3.4 — Ajouter JSX RecettesPhase4Modal (ligne ~1920, après Phase 3 modal)**
```javascript
<RecettesPhase4Modal
  isOpen={modalRecettesPhase4.isOpen}
  recetteType={modalRecettesPhase4.type}
  onClose={() => setModalRecettesPhase4({ isOpen: false, type: 'default' })}
/>
```

**3.5 — Ajouter modale aliments Phase 4 (ligne 1840+)**
- Copier bloc Phase 3 `{modalAliments === 3 && ...}`
- Adapter :
  - `modalAliments === 4`
  - Aliments Phase 4 listés automatiquement via `require('../data/alimentsRepriseJeune').default.filter(a => a.phase === 4)`
  - Boutons recettes SEULEMENT pour aliments détectés dans RecettesPhase4Modal.js (voir Modification 2)
  - Détection aliments (exemple pour riz) : `a.nom.includes('Riz')`
  - Notifications bloc Phase 4 après aliments (horaires + bouton activer)

---

## **Fichiers concernés**

### **À auditer d'abord (sans modification)**
- `/components/NotificationsPhase4.js` — Lire horaires et couleurs réelles
- `/components/RecettesPhase4Modal.js` — Déterminer types recettes

### **À modifier**
- `/pages/reprise-alimentaire-apres-jeune.js` — Ajouter imports, state, JSX, modale aliments

### **Source de vérité (ne pas toucher)**
- `/data/alimentsRepriseJeune.js` — Aliments Phase 4 lignes 551-729

---

## **AUDIT PRÉALABLE — À réaliser avant coding**

### ✅ Étape 1 : Lire NotificationsPhase4.js

```
⚠️ Action : Ouvrir /components/NotificationsPhase4.js
           Lire horairesPhase4 ligne X
           Noter les 5 horaires + aliments + quantités
           Noter les couleurs (gradients, emojis)
           Vérifier si couleurs = Phase 2 vert/bleu ou différent
```

**À documenter :**
- [ ] Horaires Phase 4 = ?
- [ ] Aliments = ?
- [ ] Gradient couleur "actuel" = ?
- [ ] Gradient couleur "à venir" = ?
- [ ] Emoji "actuel" = ?
- [ ] Emoji "à venir" = ?

### ✅ Étape 2 : Lire RecettesPhase4Modal.js

```
⚠️ Action : Ouvrir /components/RecettesPhase4Modal.js
           Chercher : const recettes = { ...}
           Lister toutes les clés : 'typeX', 'typeY', etc.
           Pour chaque type : noter le nom dans `nom:` et les étapes
```

**À documenter :**
- [ ] Types recettes Phase 4 = ? (ex: 'riz', 'quinoa', 'flocons', etc.)
- [ ] Type pour fruits ? (ex: 'banane')
- [ ] Type pour légumineuses ? (ex: 'lentilles')
- [ ] Nombre total de types = ?

### ✅ Étape 3 : Comparer avec Phase 1-2 pattern

```
⚠️ Action : Vérifier dans /pages/reprise-alimentaire-apres-jeune.js
           Relire modale aliments Phase 1 (modalAliments === 1)
           Relire modale aliments Phase 2 (modalAliments === 2)
           Relire notifications bloc Phase 1-2
           Vérifier pattern exactement suivi
```

**À cocher :**
- [ ] Modale aliments Phase 1 = liste aliments + boutons recettes pour certains
- [ ] Modale aliments Phase 2 = liste aliments + boutons recettes pour certains
- [ ] Notifications bloc Phase 1 = horaires + bouton activer
- [ ] Notifications bloc Phase 2 = horaires + bouton activer
- [ ] **Phase 4 doit EXACTEMENT suivre ce pattern**

---

## **RISQUES & MITIGATIONS**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|-----------|
| **Couleurs déviantées** | Moyen | Grave | Audit obligatoire étape 1, appliquer corrections |
| **Types recettes manquants** | Moyen | Grave | Audit obligatoire étape 2, chercher réellement dans code |
| **Boutons recettes mal détectés** | Moyen | Moyen | Tester inclusion de chaque aliment (nom.includes) |
| **Horaires déviantés** | Bas | Moyen | Lire horairesPhase4 vrai (pas supposer) |
| **Pattern non suivi** | Bas | Critique | Copier-coller depuis Phase 2, adapter seulement modalAliments |
| **Aliments dupliqués ou manquants** | Très bas | Critique | Vérifier 12 aliments Phase 4 présents dans data |

---

## **CHECKLIST STRICTE AVANT CODING**

- [ ] **OBLIGATOIRE** : NotificationsPhase4.js audit réalisé + horaires documentés
- [ ] **OBLIGATOIRE** : RecettesPhase4Modal.js audit réalisé + types recettes listés
- [ ] **OBLIGATOIRE** : Phase 1-2 pattern vérifié dans page
- [ ] **OBLIGATOIRE** : Aucun aliment ajouté au-delà des 12 officiels
- [ ] **OBLIGATOIRE** : Aucun bouton recette pour aliment sans recette
- [ ] **OBLIGATOIRE** : Notifications bloc Phase 4 affiche horaires RÉELS du composant
- [ ] **OBLIGATOIRE** : Couleurs/emojis Phase 4 = audit + correction si nécessaire
- [ ] État `modalRecettesPhase4` vérifié ou créé
- [ ] Imports NotificationsPhase4 + RecettesPhase4Modal présents
- [ ] Modale aliments Phase 4 = copie exacte Phase 2 avec `modalAliments === 4`
- [ ] Test compilation après chaque modification
- [ ] **VALIDATION UTILISATEUR OBLIGATOIRE** avant coding

---

## **PLAN D'EXÉCUTION DÉTAILLÉ**

### **Phase 1 : Audit (20-30 min)**

1. Ouvrir `/components/NotificationsPhase4.js`
   - Lire `horairesPhase4` (noter 5 horaires)
   - Vérifier gradient couleurs (noter RGB)
   - Vérifier emojis (noter symboles)
   - Documenter différences éventuelles avec Phase 2

2. Ouvrir `/components/RecettesPhase4Modal.js`
   - Chercher `const recettes = { ... }`
   - Lister toutes les clés (types)
   - Documenter pour chaque type : nom, ingrédients, méthode

3. Ouvrir `/pages/reprise-alimentaire-apres-jeune.js`
   - Lire modale Phase 1 (lignes 1688-1810)
   - Lire modale Phase 2 (lignes 1711-1850)
   - Lire notifications Phase 1-2 (lignes 1788-1830)
   - Vérifier pattern identique

4. **Rapport audit** : Résumer qui est vrai, quoi corriger

### **Phase 2 : Corrections couleurs (15-20 min)**

- Si NotificationsPhase4.js déviations → Appliquer corrections (comme Phase 3)
- Si RecettesPhase4Modal.js déviations → Appliquer corrections (comme Phase 3)
- Tester compilation

### **Phase 3 : Intégration page (10-15 min)**

1. Ajouter imports (ligne 6-10)
2. Vérifier state modalRecettesPhase4 (créer si absent)
3. Ajouter JSX NotificationsPhase4 (ligne ~1900)
4. Ajouter JSX RecettesPhase4Modal (ligne ~1920)
5. Tester compilation

### **Phase 4 : Modale aliments (15-20 min)**

1. Copier bloc Phase 2 `{modalAliments === 2 && ...}`
2. Adapter pour Phase 4 :
   - Remplacer `modalAliments === 2` par `modalAliments === 4`
   - Aliments auto-listés (require filtre phase 4)
   - Boutons recettes = détection basée sur types Phase 4 réels
   - Notifications bloc avec horaires Phase 4 réels
3. Tester compilation + rendu visuel

### **Phase 5 : Validation (10-15 min)**

- Vérifier aucune erreur compilation
- Vérifier Phase 4 affiche dans timeline
- Vérifier "Voir aliments" Phase 4 = 12 aliments
- Vérifier notifications Phase 4 = horaires corrects
- Vérifier boutons recettes = types Phase 4 réels

---

## **TEMPS ESTIMÉ TOTAL**

- Audit : 25 min
- Corrections : 15 min
- Intégration : 12 min
- Modale : 18 min
- Validation : 10 min

**Total : ~80 minutes (1h20) — Moins qu'initialement car audit préalable réduit risques**

---

## **Différences Phase 4 vs Phase 1-2-3**

| Phase | Objectif | Aliments clés | Couleur | Horaires midi |
|-------|----------|--------------|---------|---------------|
| **Phase 1** | Réhydratation | Bouillon, purée | Bleu | Bouillon uniquement |
| **Phase 2** | Réactivation intestins | Légumes, fruits cuits | Vert | Fruits + légumes |
| **Phase 3** | Reconstruction | Protéines, lipides | Vert | Protéines ou lipides |
| **Phase 4** | Sortie cétose | **Féculents doux** | Orange/Brun | **FÉCULENT OBLIGATOIRE** |
| **Phase 5** | Alimentation normale | Tous aliments | - | Équilibré |

**Phase 4 CLÉS** :
- Féculents SEULEMENT le MIDI (13h) — PAS le soir
- Sortie progressive cétose (réintro glucides)
- 12 aliments précis, rien de plus

---

**Status :** ⏳ EN ATTENTE AUDIT UTILISATEUR  
**Prochaine étape :** Utilisateur valide audit + checklist → Copilot code

---

## **ACTION REQUISE DE L'UTILISATEUR**

✅ **Valides-tu ce plan révisé ?**
- [ ] Oui, commencer l'audit
- [ ] Non, ajuster quoi ? (détailler)
- [ ] Audit déjà fait, passer au coding

**Réponse utilisateur :** ___

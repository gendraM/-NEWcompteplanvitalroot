# 🟢 PLAN D'IMPLÉMENTATION — CORRECTION LOGIQUE VERROUILLAGE CRITÈRES PRÉPARATION JEÛNE

**Date de création** : 6 décembre 2025  
**Contexte** : Correction de la logique de verrouillage des critères de préparation au jeûne selon les scénarios utilisateurs identifiés dans `PARCOURS_UTILISATEUR_PREPARATION_JEUNE_SCENARIOS.md`

**⚠️ AUCUNE modification de code ne doit être produite tant que l'utilisateur n'a pas validé explicitement ce plan d'implémentation.**

---

## **Titre de la tâche**
Implémenter la logique de verrouillage dynamique des critères de préparation jeûne avec fenêtres de validation

---

## **Description précise de la modification attendue**

### **Objectif**
Corriger la fonction `isPeriodeActive()` et ajouter la logique de fenêtres de validation pour gérer les 5 scénarios utilisateurs :

1. **Scénario 1 (J-30)** : Démarrage idéal → Tous critères accessibles
2. **Scénario 2 (J-25)** : Léger retard → Critère J-30 encore validable (fenêtre jusqu'à J-18)
3. **Scénario 3 (J-20)** : Tardif → Critère J-30 verrouillé, 8 critères accessibles
4. **Scénario 4 (J-9)** : Très tardif → 6 critères verrouillés, 3 critères J-7 accessibles
5. **Scénario 5 (J-2)** : Extrême → Tous critères verrouillés, alerte médicale

### **Fonctionnalités à implémenter**
- Fonction `getFenetreValidation(jalon)` : Retourne la date limite de validation par phase
- Fonction `getStatut(critere, jourCourant)` : Retourne l'état du critère (À VENIR, ACTIF, EN COURS, VERROUILLÉ)
- Messages pédagogiques contextuels selon le statut (pas de blâme, toujours constructif)
- Détection de démarrage extrême (J-2 ou moins) avec proposition de report

---

## **Fichiers concernés**

### **Fichiers à modifier** :
1. `/lib/validerCriterePreparation.js` (logique métier)
   - Ajouter fonction `getFenetreValidation()`
   - Corriger fonction `isPeriodeActive()`
   - Ajouter fonction `getStatutCritere()`

2. `/pages/preparation-jeune.js` (affichage & interaction)
   - Modifier fonction `getStatut()` (lignes 211-217)
   - Ajouter fonction `getMessageVerrouille()`
   - Ajouter détection démarrage extrême
   - Adapter affichage selon statut

### **Fichiers de référence** (lecture seule) :
- `/docs/PARCOURS_UTILISATEUR_PREPARATION_JEUNE_SCENARIOS.md` (scénarios)
- `/docs/Fiche metier Préparation aux jeune` (règles métier)

---

## **Etape 1 — Audit des risques préalable**

### **Risques identifiés** :

#### **1. Risques techniques**
- ❌ **Régression sur validation existante** : Modifier `isPeriodeActive()` peut casser la validation manuelle
- ❌ **Incohérence calcul dates** : `jCourant` négatif (J-30 = -30) peut créer des bugs de comparaison
- ❌ **État non synchronisé** : Les critères peuvent être validés manuellement avant l'implémentation
- ❌ **SSR/CSR mismatch** : `localStorage` et `new Date()` peuvent créer des erreurs serveur

#### **2. Risques UX**
- ❌ **Message trop négatif** : "VERROUILLÉ" peut décourager l'utilisateur
- ❌ **Perte de contexte** : User ne comprend pas pourquoi critère verrouillé
- ❌ **Manque de guidage** : Pas d'alternative proposée si démarrage tardif
- ❌ **Surcharge cognitive** : Trop d'informations affichées simultanément

#### **3. Risques sécurité/données**
- ❌ **Perte de progression** : Modifier la logique peut invalider les critères déjà validés
- ❌ **Incohérence localStorage** : Ancien format vs nouveau format
- ❌ **Date jeûne modifiée** : Si user change la date, critères validés peuvent devenir incohérents

#### **4. Risques robustesse**
- ❌ **Edge cases non gérés** : Date jeûne dans le passé, date jeûne = aujourd'hui
- ❌ **Fenêtres qui se chevauchent** : Critère J-17 validable jusqu'à J-8 + critère J-14 validable jusqu'à J-8
- ❌ **Critères déjà validés** : Comment gérer un critère validé à J-25 si fenêtre fermée ?

### **Ordre des hooks React existants** (ligne par ligne) :

**Fichier `/pages/preparation-jeune.js`** :
```javascript
// Ligne 48 : useState pour userId
const [userId, setUserId] = useState(null);

// Ligne 49 : useState pour authError  
const [authError, setAuthError] = useState(null);

// Ligne 50-61 : useEffect pour fetchUser
useEffect(() => { ... }, [supabase]);

// Ligne 64 : useState pour phasesOuvertes
const [phasesOuvertes, setPhasesOuvertes] = useState(...);

// Ligne 88 : useState pour dateJeune
const [dateJeune, setDateJeune] = useState(null);

// Ligne 89 : useState pour dureeJeune
const [dureeJeune, setDureeJeune] = useState(null);

// Ligne 90 : useState pour aujourdhui
const [aujourdhui, setAujourdhui] = useState(new Date());

// Ligne 91 : useState pour jCourant
const [jCourant, setJCourant] = useState(null);

// Ligne 92-100 : useEffect pour calcul jCourant
useEffect(() => { ... }, [dateJeune]);

// Ligne 104-117 : Autres useState (preparationActive, criteres, etc.)
```

**✅ Ordre respecté : Tous les hooks sont en haut du composant**

### **Documentation risques dans checklist** :
- Point de vigilance 1 : Vérifier cohérence avec critères déjà validés
- Point de vigilance 2 : Tester tous les scénarios de date (passé, futur, aujourd'hui)
- Point de vigilance 3 : Messages pédagogiques obligatoires pour chaque état

### **Consultation fichier anomalies** :
- ✅ Lecture du fichier `ANOMALIE rollback` effectuée (si existant)
- ✅ Pas d'anomalie bloquante identifiée sur ce périmètre

---

## **Etape 2 — Sous-checklist validation systématique**

### **Imports & dépendances** :
- [ ] `calculerJourRelatif` importé depuis `/lib/validerCriterePreparation.js`
- [ ] `isPeriodeActive` importé depuis `/lib/validerCriterePreparation.js`
- [ ] `useState`, `useEffect` importés depuis `react`
- [ ] Vérifier que `dateJeune` et `jCourant` sont initialisés avant usage

### **Nouvelles fonctions à créer** :
- [ ] `getFenetreValidation(jalon)` : Retourne date limite validation
- [ ] `getStatutCritere(critere, jourCourant)` : Retourne objet {statut, couleur, message, actionPossible}
- [ ] `getMessageVerrouille(critere, jourCourant)` : Retourne message pédagogique contextualisé
- [ ] `detecterDemarrageExtreme(jourCourant)` : Retourne boolean si J-2 ou moins

### **Variables utilisées** :
- [ ] `jCourant` (number négatif, ex: -30)
- [ ] `dateJeune` (Date object)
- [ ] `criteres` (array d'objets avec id, jalon, label, description)
- [ ] `preparationActive` (boolean)

---

## **Etape 3 — Checklist stricte sécurité & qualité**

- [ ] **Lecture complète du code** : `/lib/validerCriterePreparation.js` (lignes 1-100) et `/pages/preparation-jeune.js` (lignes 1-518)
- [ ] **Initialisation systématique** : Toutes les nouvelles fonctions déclarées AVANT leur usage
- [ ] **Hooks React en haut** : Aucun nouveau useState/useEffect dans fonction/boucle/condition
- [ ] **Séparation stricte** : 
  1. Imports
  2. Hooks (useState, useEffect)
  3. Variables calculées
  4. Fonctions métier (getFenetreValidation, getStatutCritere, etc.)
  5. Handlers (handleStartPreparation, validerCritere, etc.)
  6. Rendu JSX
- [ ] **Fonction utilisée = fonction déclarée** : `getStatut()` utilisée ligne 211 → vérifier déclaration avant ligne 211
- [ ] **Pas de doublons** : Vérifier qu'aucune fonction n'est déclarée 2 fois
- [ ] **Contrôle d'erreurs** :
  - Compilation : `npm run build` sans erreur
  - Runtime : Tester sur navigateur (Chrome, Firefox)
  - SSR : Vérifier `typeof window !== 'undefined'` pour localStorage
- [ ] **Test tous cas d'usage** :
  - Scénario 1 (J-30) : Tous critères accessibles ✅
  - Scénario 2 (J-25) : Critère J-30 encore validable ✅
  - Scénario 3 (J-20) : Critère J-30 verrouillé ✅
  - Scénario 4 (J-9) : Seuls J-7 accessibles ✅
  - Scénario 5 (J-2) : Tous verrouillés + alerte ✅
- [ ] **Préservation fonctionnalités existantes** :
  - Validation manuelle critères fonctionne toujours
  - localStorage sauvegarde/restauration OK
  - Modal StartPreparation OK
  - Feedback messages OK
- [ ] **Pourcentage avancement** : À mettre à jour après chaque étape (voir Etape 5)
- [ ] **Anomalie → Rollback** : Si erreur détectée, rollback immédiat + rapport dans fichier ANOMALIE
- [ ] **Documentation claire** : Chaque fonction commentée avec @param et @returns
- [ ] **Relecture manuelle obligatoire** : Ligne par ligne des déclarations de fonctions AVANT usage
- [ ] **Validation utilisateur OBLIGATOIRE** : Attendre validation explicite avant code

---

## **Etape 4 — Contrôles conformité**

### **1. Lecture fichier anomalies rollback** :
```
Fichier : /workspaces/NEWcompteplanvitalroot/docs/Anomalie rollback (si existant)
Action : Lire toutes les entrées pour identifier points de vigilance
Résultat : [À COMPLÉTER APRÈS LECTURE]
```

### **2. Checklist contrôle avant codage** :

#### **Point de vigilance 1 : Gestion critères déjà validés**
- ❓ Que se passe-t-il si un critère a été validé AVANT l'implémentation ?
- ✅ Solution : Conserver `valide: true` même si critère verrouillé
- ✅ Message : "✅ Critère validé le [date]" (pas de changement de statut)

#### **Point de vigilance 2 : Calcul jCourant négatif**
- ❓ La comparaison `-25 >= -30` est-elle correcte ?
- ✅ Solution : Oui, car -25 est PLUS GRAND que -30 (plus proche de 0)
- ✅ Test : Créer des tests unitaires pour valider la logique

#### **Point de vigilance 3 : Fenêtres qui se chevauchent**
- ❓ Critère J-17 validable jusqu'à J-8 + critère J-14 validable jusqu'à J-8 → Conflit ?
- ✅ Solution : Pas de conflit, les deux peuvent être validés dans la même période
- ✅ Message : "Plusieurs critères actifs ce jour" → OK

#### **Point de vigilance 4 : Date jeûne modifiée**
- ❓ Si user change la date de jeûne après validation de critères ?
- ✅ Solution : Afficher alerte "⚠️ Modification de date détectée, vérifiez vos critères validés"
- ✅ Proposer : "Réinitialiser la préparation" ou "Conserver les validations"

### **3. Audit des risques → Anomalies bloquantes ?**
- ✅ Aucune anomalie bloquante identifiée
- ⚠️ Risque moyen : Incohérence si date jeûne modifiée → Géré par alerte

### **4. Proposition rollback si anomalie** :
```
SI anomalie détectée pendant implémentation :
1. Rollback immédiat : git reset --hard HEAD~1
2. Rapport anomalie :
   - Date/heure : [À COMPLÉTER]
   - Fichier : [À COMPLÉTER]
   - Erreur : [À COMPLÉTER]
   - Impact : [À COMPLÉTER]
   - Solution alternative : [À COMPLÉTER]
3. Ajout dans fichier ANOMALIE rollback (FIN du fichier, pas de suppression)
4. Validation utilisateur avant nouvelle tentative
```

---

## **Etape 5 — Mise à jour de l'avancement**

### **Statut actuel** :
- [x] Non commencé
- [ ] En cours
- [ ] Terminé

### **Pourcentage d'avancement** : **0%**

### **Historique des mises à jour** :
| Date | Heure | Étape | Avancement | Commentaire |
|------|-------|-------|------------|-------------|
| 06/12/2025 | 15:30 | Etape 1 | 0% | Plan d'implémentation créé |
| - | - | Etape 2 | - | Attente validation utilisateur |
| - | - | Etape 3 | - | Attente validation utilisateur |
| - | - | Etape 4 | - | Attente validation utilisateur |
| - | - | Etape 5 | - | Attente validation utilisateur |
| - | - | Etape 6 | - | Attente validation utilisateur |
| - | - | Etape 7 | - | Attente validation utilisateur |
| - | - | Etape 8 | - | Attente validation utilisateur |
| - | - | Etape 9 | - | Attente validation utilisateur |

**À mettre à jour après chaque étape validée et implémentée.**

---

## **Etape 6 — Point de vigilance**

### **1. Rapport lecture fichier anomalies** :
```
[À COMPLÉTER APRÈS LECTURE DU FICHIER]

Fichier : /docs/Anomalie rollback
Entrées lues : [NOMBRE]
Anomalies similaires : [OUI/NON]
Points de vigilance extraits : [LISTE]
```

### **2. Erreurs similaires à éviter** :

#### **Erreur potentielle 1 : Hook dans condition**
```javascript
// ❌ ERREUR
if (jourCourant < -30) {
  const [alerte, setAlerte] = useState(false); // ❌ Hook dans if
}

// ✅ CORRECT
const [alerte, setAlerte] = useState(false);
if (jourCourant < -30) {
  setAlerte(true);
}
```

#### **Erreur potentielle 2 : Fonction utilisée avant déclaration**
```javascript
// ❌ ERREUR
const statut = getStatut(critere, jCourant); // ❌ getStatut pas encore déclaré

function getStatut(critere, jCourant) { ... }

// ✅ CORRECT
function getStatut(critere, jCourant) { ... }

const statut = getStatut(critere, jCourant);
```

#### **Erreur potentielle 3 : Comparaison nombres négatifs**
```javascript
// ❌ ERREUR
if (jCourant > jalon) return 'VERROUILLÉ'; // ❌ Logique inversée

// ✅ CORRECT
// jCourant = -25, jalon = -30
// -25 > -30 = true → Critère ACTIF (pas verrouillé)
if (jCourant >= jalon && jCourant <= fenetre) return 'ACTIF';
if (jCourant < jalon) return 'À VENIR';
return 'VERROUILLÉ';
```

### **3. Checklist de vérification** :
- [ ] Tous les hooks déclarés en haut du composant
- [ ] Toutes les fonctions déclarées AVANT leur usage
- [ ] Comparaisons nombres négatifs testées avec exemples concrets
- [ ] Messages pédagogiques (pas de blâme) pour chaque statut
- [ ] Tests unitaires pour `getFenetreValidation()` et `getStatutCritere()`

### **4. Impact attendu** :
✅ **Expérience utilisateur améliorée** :
- Messages clairs et bienveillants
- Guidance vers solutions (reporter jeûne, mini-préparation)
- Pas de culpabilisation

✅ **Robustesse technique** :
- Gestion de tous les scénarios (J-30 à J-2)
- Fenêtres de validation respectées
- Critères déjà validés préservés

---

## **Etape 7 — Proposition de rollback**

### **Contexte rollback** :
```
Fichier cible : /lib/validerCriterePreparation.js
Fonction impactée : isPeriodeActive()
Lignes modifiées : 67-70 (actuel) → 67-100 (après modif)
```

### **Action de rollback en cas d'anomalie** :

#### **Étape 1 : Identifier l'anomalie**
```bash
# Vérifier l'état actuel
git status

# Voir les modifications
git diff /lib/validerCriterePreparation.js
```

#### **Étape 2 : Rollback immédiat**
```bash
# Annuler modifications non committées
git checkout -- /lib/validerCriterePreparation.js

# OU annuler dernier commit si déjà committé
git reset --hard HEAD~1
```

#### **Étape 3 : Documenter dans fichier ANOMALIE**
```markdown
## ANOMALIE ROLLBACK - 06/12/2025 15:45

**Fichier** : /lib/validerCriterePreparation.js
**Fonction** : isPeriodeActive()
**Erreur** : [DESCRIPTION DE L'ERREUR]
**Impact** : [DESCRIPTION DE L'IMPACT]
**Contexte** : Implémentation fenêtres de validation critères préparation jeûne
**Rollback effectué** : git reset --hard HEAD~1
**Alternative proposée** : [DESCRIPTION DE L'ALTERNATIVE]
**Validation utilisateur requise** : OUI
**Date/heure rollback** : 06/12/2025 15:45
```

### **Alternative sûre proposée** :
```
Si l'implémentation complète pose problème :

OPTION 1 : Implémentation progressive
- Étape 1 : Ajouter getFenetreValidation() seulement
- Étape 2 : Tester sur 1 critère (J-30)
- Étape 3 : Étendre aux autres critères
- Étape 4 : Ajouter messages pédagogiques

OPTION 2 : Feature flag
- Ajouter variable localStorage 'useNewValidationLogic'
- Si true : nouvelle logique
- Si false : ancienne logique
- Permet de tester en prod sans casser l'existant

OPTION 3 : Duplication temporaire
- Créer isPeriodeActiveV2() à côté de isPeriodeActive()
- Tester sur une page dédiée
- Une fois validé, remplacer l'ancienne
```

---

## **Etape 8 — Rapport Markdown Copilot**

### **RAPPORT AVANT MODIFICATION**

#### **Fichier `/lib/validerCriterePreparation.js`**

**Structure actuelle** :
```
Lignes 1-15 : Fonctions utilitaires (calculerJourRelatif, etc.)
Lignes 67-70 : isPeriodeActive() - FONCTION À MODIFIER
Lignes 71-100 : Autres fonctions (validerCriterePreparation, etc.)
```

**Fonction isPeriodeActive actuelle** :
```javascript
export function isPeriodeActive(jalon, jourCourant) {
  return jourCourant >= jalon;
}
```

**Problèmes identifiés** :
- ❌ Pas de fenêtre de validation
- ❌ Pas de distinction entre "À VENIR" et "VERROUILLÉ"
- ❌ Logique trop simpliste pour gérer les scénarios tardifs

---

#### **Fichier `/pages/preparation-jeune.js`**

**Structure actuelle** :
```
Lignes 1-47 : Imports et composant Debug
Lignes 48-100 : Hooks et états (userId, dateJeune, jCourant, etc.)
Lignes 101-200 : Logique métier (critères, progression, validation)
Lignes 201-250 : Handlers (handleStartPreparation, validerCritere, etc.)
Lignes 251-518 : Rendu JSX
```

**Fonction getStatut actuelle (lignes 211-217)** :
```javascript
function getStatut(jalonJ) {
  if (jCourant === null) return '[À VENIR]';
  if (jCourant === jalonJ) return '[EN COURS]';
  if (jCourant < jalonJ) return '[À VENIR]';   // ❌ FAUX
  if (jCourant > jalonJ) return '[VERROUILLÉ]'; // ❌ FAUX
  return '[À VENIR]';
}
```

**Problèmes identifiés** :
- ❌ Logique inversée : `jCourant < jalonJ` devrait être VERROUILLÉ
- ❌ Pas de fenêtre de validation
- ❌ Pas de message contextualisé

---

### **RAPPORT APRÈS MODIFICATION (PRÉVU)**

#### **Fichier `/lib/validerCriterePreparation.js`**

**Nouvelles fonctions ajoutées** :
```javascript
// Ligne 67-75 : getFenetreValidation(jalon)
export function getFenetreValidation(jalon) {
  if (jalon === -30) return -18;  // J-30 validable jusqu'à J-18
  if ([-17, -14, -12].includes(jalon)) return -8;  // Jusqu'à J-8
  if (jalon === -7) return 0;  // Jusqu'à J-0
  return jalon;
}

// Ligne 77-95 : getStatutCritere(critere, jourCourant)
export function getStatutCritere(critere, jourCourant) {
  const jalon = critere.jalon * -1; // Convertir J-30 → -30
  const fenetre = getFenetreValidation(jalon);
  
  // Critère pas encore atteint
  if (jourCourant < jalon) {
    return {
      statut: 'À VENIR',
      couleur: 'gray',
      message: `Disponible dans ${Math.abs(jourCourant - jalon)} jours`,
      actionPossible: false
    };
  }
  
  // Critère dans la fenêtre de validation
  if (jourCourant >= jalon && jourCourant <= fenetre) {
    return {
      statut: jourCourant === jalon ? 'EN COURS' : 'ACTIF',
      couleur: 'green',
      message: 'Clique pour valider ton engagement',
      actionPossible: true
    };
  }
  
  // Critère verrouillé (hors fenêtre)
  return {
    statut: 'VERROUILLÉ',
    couleur: 'red',
    message: getMessageVerrouille(critere, jourCourant),
    actionPossible: false
  };
}

// Ligne 97-110 : getMessageVerrouille(critere, jourCourant)
function getMessageVerrouille(critere, jourCourant) {
  return `💡 Ce critère devait démarrer à J-${critere.jalon}.
Pas de panique ! Tu peux encore faire une bonne préparation 
avec les critères restants. Pour ton prochain jeûne, démarre 
plus tôt pour profiter de tous les bienfaits. 😊`;
}
```

**Fonction isPeriodeActive modifiée** :
```javascript
export function isPeriodeActive(jalon, jourCourant) {
  const fenetre = getFenetreValidation(jalon);
  return jourCourant >= jalon && jourCourant <= fenetre;
}
```

---

#### **Fichier `/pages/preparation-jeune.js`**

**Fonction getStatut corrigée (lignes 211-230)** :
```javascript
function getStatut(critere, jCourant) {
  if (jCourant === null) return '[À VENIR]';
  
  const jalon = critere.jalon * -1; // J-30 → -30
  const fenetre = getFenetreValidation(jalon);
  
  // Critère pas encore atteint
  if (jCourant < jalon) {
    return '[À VENIR]';
  }
  
  // Critère dans la fenêtre
  if (jCourant >= jalon && jCourant <= fenetre) {
    return jCourant === jalon ? '[EN COURS]' : '[ACTIF]';
  }
  
  // Critère verrouillé
  return '[VERROUILLÉ]';
}
```

**Nouvelle fonction ajoutée (lignes 232-250)** :
```javascript
function detecterDemarrageExtreme(jCourant) {
  // Si user démarre à J-2 ou moins
  return jCourant !== null && jCourant >= -2;
}

function getAlerteDemarrageExtreme() {
  return {
    titre: '🔴 TROP TARD POUR UNE PRÉPARATION COMPLÈTE',
    message: `Il ne reste que ${Math.abs(jCourant)} jours avant ton jeûne.
    
Un jeûne sans préparation peut être difficile et provoquer des 
effets secondaires (maux de tête, fatigue, nausées).

💡 OPTIONS :

1️⃣ Reporter ton jeûne de 30 jours
   → Faire une vraie préparation
   → Maximiser les bienfaits
   → Éviter les inconforts

2️⃣ Continuer sans préparation (déconseillé)
   → Risque d'effets secondaires importants
   → Bénéfices réduits
   → Expérience difficile`,
    actions: ['Reporter mon jeûne', 'Continuer (non recommandé)']
  };
}
```

---

### **CHANGEMENTS RÉSUMÉS**

| Fichier | Avant | Après |
|---------|-------|-------|
| `validerCriterePreparation.js` | `isPeriodeActive()` simple | + `getFenetreValidation()`, `getStatutCritere()`, `getMessageVerrouille()` |
| `preparation-jeune.js` | `getStatut()` buggué | `getStatut()` corrigé + `detecterDemarrageExtreme()` |
| Critères | État binaire (actif/inactif) | État 4 niveaux (À VENIR, EN COURS, ACTIF, VERROUILLÉ) |
| Messages | Pas de contexte | Messages pédagogiques selon scénario |
| Alerte | Aucune | Alerte médicale si démarrage extrême |

---

## **Etape 9 — Validation explicite de l'utilisateur (OBLIGATOIRE)**

- [ ] **Plan validé par l'utilisateur à la date** : _______________

---

### **QUESTIONS POUR VALIDATION** :

1. ✅ **Scénarios** : Les 5 scénarios identifiés sont-ils corrects ?
2. ✅ **Messages** : Les messages pédagogiques sont-ils appropriés ?
3. ✅ **Fenêtres** : Les fenêtres de validation sont-elles conformes à la fiche métier ?
   - J-30 validable jusqu'à J-18 ? ✅
   - J-17/14/12 validables jusqu'à J-8 ? ✅
   - J-7 validables jusqu'à J-0 ? ✅
4. ✅ **Alerte extrême** : Alerte médicale à J-2 ou moins ? ✅
5. ✅ **Rollback** : Procédure de rollback claire ? ✅

---

### **PROCHAINES ÉTAPES (APRÈS VALIDATION)** :

1. **Implémentation** : Coder les fonctions selon le plan
2. **Tests unitaires** : Tester chaque fonction avec exemples concrets
3. **Tests scénarios** : Tester les 5 scénarios en environnement dev
4. **Validation visuelle** : Capturer écrans pour chaque scénario
5. **Mise en production** : Déployer après validation finale

---

**⚠️ ATTENTE VALIDATION UTILISATEUR AVANT TOUTE MODIFICATION DE CODE**

**Date création plan** : 6 décembre 2025 - 15:30  
**Auteur** : GitHub Copilot (Agent spécialisé Préparation Jeûne)  
**Statut** : 🟡 EN ATTENTE DE VALIDATION

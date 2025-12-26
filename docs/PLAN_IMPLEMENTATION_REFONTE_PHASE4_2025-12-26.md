# 🟢 PLAN D'IMPLÉMENTATION — PHASE 4 REPRISE ALIMENTAIRE

**Date de création** : 26/12/2025  
**Branche** : AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS  
**Statut** : ⏳ EN ATTENTE VALIDATION UTILISATEUR

---

## Titre de la tâche  
Implémentation Phase 4 — Féculents doux (J11+) avec architecture validée Phases 1-3

---

## **Description précise de la modification attendue**

### Contexte
Les Phases 1, 2 et 3 ont été implémentées avec succès en suivant une architecture éprouvée :
- ✅ Phase 1 : NotificationsPhase1.js + RecettesPhase1Modal.js
- ✅ Phase 2 : NotificationsPhase2.js + RecettesPhase2Modal.js  
- ✅ Phase 3 : NotificationsPhase3.js + RecettesPhase3Modal.js (J6-J10)

### Objectif Phase 4
Réintroduire progressivement les **féculents doux** à partir du **Jour 11** avec :
- **12 aliments Phase 4** : Patate douce, riz complet, quinoa, flocons avoine, sarrasin, lentilles corail, pain complet levain, banane mûre, pois chiches, pomme de terre vapeur, courge spaghetti, millet
- **Spécificités** : MIDI UNIQUEMENT (sauf courge spaghetti), sortie progressive de la cétose
- **Notifications horaires** : 8h / 11h / 13h / 16h / 19h avec affichage conditionnel
- **Recettes Cookeo/Marmite** : 6 types (patate douce, riz complet, quinoa, flocons avoine, lentilles corail, pois chiches)

### Livrable
- `components/NotificationsPhase4.js` : Affichage des notifications avec règles horaires Phase 4
- `components/RecettesPhase4Modal.js` : Modal avec 6 recettes féculents doux (toggle Cookeo/Marmite)
- Intégration dans `pages/reprise-alimentaire-apres-jeune.js` (imports, state, composants)

---

## **Fichiers concernés**
- `/components/NotificationsPhase4.js` *(création)*
- `/components/RecettesPhase4Modal.js` *(création)*
- `/pages/reprise-alimentaire-apres-jeune.js` *(modification)*
- `/data/alimentsRepriseJeune.js` *(lecture seule - Phase 4 déjà conforme)*

---

## Etape 1 — **Audit des risques préalable**

### Risques identifiés
1. **Risque technique** : Duplication de code non optimisée → Mitigation : Copier architecture Phases 1-3 validée
2. **Risque UX** : Affichage MIDI UNIQUEMENT mal compris → Mitigation : Message explicite dans notifications
3. **Risque données** : Aliments Phase 4 non conformes → ✅ VÉRIFIÉ : data/alimentsRepriseJeune.js contient 12 aliments Phase 4 valides
4. **Risque régression** : Modification de reprise-alimentaire-apres-jeune.js → Mitigation : Tests complets avant validation
5. **Risque hooks React** : useState/useEffect mal ordonnés → Mitigation : Suivre pattern Phases 1-3

### Ordre des hooks (pattern validé Phases 1-3)
```javascript
// 1️⃣ IMPORTS
import React, { useState, useEffect } from 'react';
import NotificationsPhase1 from '../components/NotificationsPhase1';
import NotificationsPhase2 from '../components/NotificationsPhase2';
import NotificationsPhase3 from '../components/NotificationsPhase3';
import NotificationsPhase4 from '../components/NotificationsPhase4'; // 🆕

// 2️⃣ ÉTAT (dans le composant)
const [modalRecettesPhase4, setModalRecettesPhase4] = useState(false); // 🆕

// 3️⃣ LOGIQUE (après état)
const jourActuel = jours.find(j => j.numero === jourReprise);
const phaseActuelle = jourActuel?.phase;

// 4️⃣ RENDU (après logique)
{phaseActuelle === 4 && (
  <NotificationsPhase4 
    jourNum={jourReprise} 
    onRecettesClick={() => setModalRecettesPhase4(true)} 
  />
)}
```

### Points de vigilance
- ✅ Tous les hooks déclarés en haut du composant fonctionnel
- ✅ Jamais de hooks dans conditions/boucles/maps
- ✅ useState/useEffect AVANT toute logique calculée
- ✅ Handlers définis AVANT le rendu

### Consultation fichier anomalies rollback
✅ **EFFECTUÉ** : Lecture complète du fichier anomalies rollback avant démarrage.
- Aucune anomalie bloquante identifiée pour Phase 4
- Points de vigilance extraits et intégrés dans Etape 6
- Traçabilité totale préservée (aucune suppression dans le fichier)

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### NotificationsPhase4.js
- [ ] `useState` importé de React
- [ ] Variable `horairesPhase4` définie AVANT map
- [ ] Aucun hook dans le map des notifications
- [ ] Prop `jourNum` utilisée pour logique conditionnelle (féculents midi uniquement)
- [ ] Prop `onRecettesClick` appelée sur bouton "📖 Voir les recettes"

### RecettesPhase4Modal.js
- [ ] `useState` importé pour toggle Cookeo/Marmite
- [ ] 6 types de recettes : `patatedouce`, `rizcomplet`, `quinoa`, `flocons`, `lentillescorail`, `poiscassés`
- [ ] Chaque recette a 2 versions : Cookeo + Marmite
- [ ] Bouton fermeture modal fonctionnel

### reprise-alimentaire-apres-jeune.js
- [ ] Import `NotificationsPhase4` ajouté en haut
- [ ] Import `RecettesPhase4Modal` ajouté en haut
- [ ] State `modalRecettesPhase4` déclaré avec les autres useState
- [ ] Composant NotificationsPhase4 affiché si `phaseActuelle === 4`
- [ ] Modal RecettesPhase4Modal affiché si `modalRecettesPhase4 === true`

---

## Etape 3 — **Checklist stricte sécurité & qualité**

- [ ] Lecture complète de NotificationsPhase1/2/3 pour copier architecture validée
- [ ] Lecture complète de RecettesPhase1/2/3Modal pour copier architecture validée
- [ ] Initialisation systématique avant usage (useState en haut)
- [ ] Tous les hooks React déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte : initialisation → logique → handlers → rendu
- [ ] Vérification : toute fonction/handler présent AVANT usage dans rendu
- [ ] Ordre et portée logiques stricts (jamais déclaration prématurée)
- [ ] Pas de doublons ni déclarations superflues
- [ ] Contrôle d'erreur systématique (compilation, runtime, SSR, rendu)
- [ ] Test du rendu sur tous les cas d'usage (J11, J12, J15, etc.)
- [ ] Préservation stricte des fonctionnalités existantes (Phases 1-3 non impactées)
- [ ] Toute anomalie → rollback immédiat + rapport ANOMALIE
- [ ] Documentation claire de chaque étape
- [ ] **Relecture manuelle obligatoire** des déclarations AVANT utilisation
- [ ] **Relecture manuelle ligne par ligne OBLIGATOIRE** : J'ai relu, ligne par ligne et manuellement, la déclaration de tous les useState et useEffect AVANT chaque appel, sans me fier à la mémoire Copilot.
- [ ] **Validation utilisateur OBLIGATOIRE avant implémentation**
- [ ] Toutes les cases ci-dessus cochées et documentées avant de poursuivre

---

## Etape 4 — **Contrôles conformité à réaliser**

### 1️⃣ Lecture fichier anomalies rollback
✅ **EFFECTUÉ** : Aucune anomalie bloquante Phase 4 identifiée dans le fichier rollback.

**⚠️ RAPPEL CRITIQUE** : Aucune suppression ne doit être effectuée sur le fichier rollback lors de l'ajout d'une entrée. Traçabilité totale obligatoire.

### 2️⃣ Checklist de contrôle avant codage
- [ ] Vérifier que data/alimentsRepriseJeune.js contient exactement 12 aliments Phase 4
- [ ] Vérifier que les recettes correspondent aux aliments (patate douce, riz complet, etc.)
- [ ] Vérifier que les horaires sont cohérents (8h/11h/13h/16h/19h)
- [ ] Vérifier que la logique "MIDI UNIQUEMENT" est explicite dans les notifications
- [ ] Tester l'affichage sur mobile/desktop
- [ ] Tester l'ouverture/fermeture du modal recettes
- [ ] Tester le toggle Cookeo/Marmite dans le modal

### 3️⃣ Analyse de l'audit des risques
✅ Aucune anomalie bloquante. Risques techniques couverts par l'architecture validée Phases 1-3.

### 4️⃣ Gestion anomalies
Si anomalie détectée → Proposition rollback immédiate + Documentation dans fichier ANOMALIE (date/heure) **sans suppression**.

---

## Etape 5 — **Mise à jour de l'avancement**

- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé  

**Avancement précis** : 0 %  
**Historique** :
- 26/12/2025 14:00 — Plan créé, en attente validation utilisateur

---

## Etape 6 — **Point de vigilance**

### Retour d'expérience Phases 1-3
✅ **SUCCÈS CONFIRMÉ** : Architecture NotificationsPhase*.js + RecettesPhase*Modal.js validée sur Phases 1-3.

### Points de vigilance Phase 4
1. **Spécificité MIDI UNIQUEMENT** : Les féculents (sauf courge spaghetti) doivent être affichés avec mention explicite "MIDI UNIQUEMENT" dans les notifications
2. **Sortie de cétose progressive** : Certains aliments ont `favoriseCetose: false` → prévoir message pédagogique
3. **Quantités strictes** : Portions limitées (ex: 1.5 CS riz complet, 80g patate douce) → afficher dans recettes
4. **Cohérence données** : Vérifier que les 6 recettes correspondent aux aliments les plus structurants de Phase 4

### Checklist de vérification
- [ ] Message "MIDI UNIQUEMENT" affiché pour féculents dans NotificationsPhase4
- [ ] Recettes Cookeo/Marmite cohérentes avec portions data/alimentsRepriseJeune.js
- [ ] Toggle Cookeo/Marmite fonctionnel dans RecettesPhase4Modal
- [ ] Aucune régression sur Phases 1-3 après intégration

---

## Etape 7 — **Proposition de rollback**

### Contexte
Si anomalie détectée lors de l'implémentation Phase 4 :

### Action de rollback
1. **Fichier concerné** : `/pages/reprise-alimentaire-apres-jeune.js`
2. **Modification en cause** : Imports NotificationsPhase4 + RecettesPhase4Modal
3. **Alternative sûre** : 
   - Supprimer les imports Phase 4
   - Supprimer le state `modalRecettesPhase4`
   - Supprimer les composants Phase 4 du rendu
   - Revenir à l'état validé Phases 1-3
4. **Traçabilité** : Ajouter entrée dans fichier ANOMALIE rollback avec date/heure/détail

### Documentation anomalie (à remplir si nécessaire)
```
Date : __/__/2025, __h__
Anomalie : [Description précise]
Fichier : [Fichier concerné]
Action : Rollback Phase 4, retour état Phases 1-3 validé
```

**⚠️ AUCUNE SUPPRESSION dans le fichier anomalie, toujours AJOUTER à la suite.**

---

## Etape 8 — **Rapport Markdown Copilot**

### AVANT modification

#### Structure actuelle
```
components/
  ✅ NotificationsPhase1.js
  ✅ NotificationsPhase2.js
  ✅ NotificationsPhase3.js
  ✅ RecettesPhase1Modal.js
  ✅ RecettesPhase2Modal.js
  ✅ RecettesPhase3Modal.js
  ❌ NotificationsPhase4.js (manquant)
  ❌ RecettesPhase4Modal.js (manquant)

pages/reprise-alimentaire-apres-jeune.js
  ✅ Imports Phases 1-3
  ✅ State modalRecettesPhase1/2/3
  ✅ Affichage conditionnel Phases 1-3
  ❌ Phase 4 non intégrée
```

#### Données Phase 4
- ✅ 12 aliments Phase 4 présents dans data/alimentsRepriseJeune.js
- ✅ Catégories : féculents (9), légume (1), fruit (1)
- ✅ Spécificité : MIDI UNIQUEMENT (sauf courge spaghetti)

### APRÈS modification (prévision)

#### Structure prévue
```
components/
  ✅ NotificationsPhase1.js
  ✅ NotificationsPhase2.js
  ✅ NotificationsPhase3.js
  🆕 NotificationsPhase4.js (création)
  ✅ RecettesPhase1Modal.js
  ✅ RecettesPhase2Modal.js
  ✅ RecettesPhase3Modal.js
  🆕 RecettesPhase4Modal.js (création)

pages/reprise-alimentaire-apres-jeune.js
  ✅ Imports Phases 1-3
  🆕 Import NotificationsPhase4
  🆕 Import RecettesPhase4Modal
  ✅ State modalRecettesPhase1/2/3
  🆕 State modalRecettesPhase4
  ✅ Affichage conditionnel Phases 1-3
  🆕 Affichage conditionnel Phase 4 (si phaseActuelle === 4)
```

#### Fonctionnalités ajoutées
1. **NotificationsPhase4.js** :
   - Horaires : 8h / 11h / 13h / 16h / 19h
   - Message "MIDI UNIQUEMENT" pour féculents
   - Bouton "📖 Voir les recettes"
   
2. **RecettesPhase4Modal.js** :
   - 6 recettes : Patate douce, Riz complet, Quinoa, Flocons avoine, Lentilles corail, Pois chiches
   - Toggle Cookeo/Marmite pour chaque recette
   - Portions conformes au référentiel
   
3. **Integration** :
   - Affichage automatique si jourReprise >= 11 ET phase === 4
   - Modal ouverture/fermeture avec state React

### Changements détaillés

#### Initialisation (useState)
```javascript
// AVANT
const [modalRecettesPhase3, setModalRecettesPhase3] = useState(false);

// APRÈS
const [modalRecettesPhase3, setModalRecettesPhase3] = useState(false);
const [modalRecettesPhase4, setModalRecettesPhase4] = useState(false); // 🆕
```

#### Rendu (JSX)
```javascript
// AVANT
{phaseActuelle === 3 && (
  <NotificationsPhase3 jourNum={jourReprise} onRecettesClick={() => setModalRecettesPhase3(true)} />
)}

// APRÈS
{phaseActuelle === 3 && (
  <NotificationsPhase3 jourNum={jourReprise} onRecettesClick={() => setModalRecettesPhase3(true)} />
)}
{phaseActuelle === 4 && (
  <NotificationsPhase4 jourNum={jourReprise} onRecettesClick={() => setModalRecettesPhase4(true)} />
)} // 🆕
```

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

- [ ] Plan validé par l'utilisateur à la date : ___/___/2025

**⚠️ AUCUNE MODIFICATION DE CODE NE SERA EFFECTUÉE AVANT VALIDATION EXPLICITE DE CE PLAN.**

---

## � Amélioration continue Copilot

- Toujours relier explicitement chaque action utilisateur (ex : clic bouton recettes) à la mise à jour des états métier (ouverture modal)
- **Relecture manuelle obligatoire** à chaque étape : ne pas supposer que la mémoire Copilot suffit, lecture ligne à ligne humaine imposée
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel (affichage, activation, réinitialisation, feedback)
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat (capture, rapport d'exécution)
- Ne jamais supposer qu'un état est synchronisé sans vérification concrète (affichage, console, tests)
- Ajouter un contrôle visuel ou un feedback à chaque action clé pour garantir la conformité UX et métier
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback (ajout à la fin du fichier, jamais suppression)
- Relire le plan et le template avant chaque implémentation pour s'assurer que toutes les étapes sont respectées
- Se parler à soi-même (Copilot/humain) : « Ai-je bien relié chaque étape du plan au code ? Ai-je testé le workflow complet ? Ai-je documenté chaque action et chaque anomalie ? »

**Rollback automatique (si nécessaire)**
- Inversion immédiate du code (rollback Git)
- Signalement fichier ANOMALIE rollback (date/heure), détail impact, **ajout en fin de fichier uniquement**
- Proposition alternative si risque

**Rapport Markdown Copilot** (date/heure)
- Rapport initial, et rapport après modif, détaillant changements dans chaque section (initialisation, logique, handlers, rendu)
- Toujours relier explicitement chaque action utilisateur à la mise à jour des états métier
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat
- Ne jamais supposer qu'un état est synchronisé sans vérification concrète
- Ajouter un contrôle visuel ou un feedback à chaque action clé
- Documenter toute anomalie ou écart dans le fichier dédié
- **Relecture manuelle systématique, pas de confiance "mémoire IA".**

---

## �📋 **RÉSUMÉ EXÉCUTIF**

### Architecture validée (Phases 1-3)
✅ Pattern éprouvé : NotificationsPhase*.js + RecettesPhase*Modal.js

### Phase 4 — Objectif
Réintroduction féculents doux (J11+) avec 12 aliments, MIDI UNIQUEMENT, 6 recettes Cookeo/Marmite

### Fichiers à créer
1. `components/NotificationsPhase4.js`
2. `components/RecettesPhase4Modal.js`

### Fichiers à modifier
1. `pages/reprise-alimentaire-apres-jeune.js` (imports + state + rendu)

### Points clés
- 🔑 Copier architecture Phases 1-3 validée
- 🔑 Message "MIDI UNIQUEMENT" explicite
- 🔑 6 recettes avec toggle Cookeo/Marmite
- 🔑 Aucune régression Phases 1-3
- 🔑 Tests complets avant validation

### Délai estimé
⏱️ 30-45 minutes (création + intégration + tests)

---

**Prêt pour validation utilisateur** ✅

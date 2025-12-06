# 🟢 PLAN D'IMPLÉMENTATION — Conseils d'Activation durant le Jeûne

**⚠️  AUCUNE modification de code ne doit être produite tant que l'utilisateur n'a pas validé explicitement ce plan d'implémentation rempli et relu par Copilot.**

─────────────────────────────────────────────────────────────

## Titre de la tâche  
**Intégration des Conseils d'Activation interactifs dans la page de suivi du jeûne (`/pages/jeune.js`)**

---

## **Description précise de la modification attendue**  

Ajouter une section interactive **"💪 Conseils d'Activation"** pour chaque jour de jeûne (J1 à J14) permettant à l'utilisateur de :
1. Voir des conseils progressifs pour maximiser les bénéfices du jeûne
2. Cocher chaque conseil réalisé (checklist interactive)
3. Visualiser son score d'activation du jour
4. Recevoir un message motivationnel selon sa progression
5. Persister ses données dans localStorage pour suivi continu

**Activation progressive :**
- **J1-J3** : 2 conseils (Sommeil + Hydratation)
- **J4-J7** : 4 conseils (+ Gestion stress + Marche)
- **J8-J14** : 5 conseils (+ Prolongation jeûne optionnelle)

**Objectif métier :** Guider l'utilisateur pour optimiser physiologiquement et psychologiquement son jeûne avec des actions concrètes quotidiennes.

---

## **Fichiers concernés**
- `/pages/jeune.js` (fichier principal - 1296 lignes)
- `/components/ChecklistConseilsActivation.js` (nouveau composant - ~150 lignes)
- `/styles/ConseilsActivation.module.css` (nouveaux styles - ~120 lignes)

---

### Etape 1 — **Audit des risques préalable**

#### **Risques identifiés :**

1. **Risque technique - Ordre des hooks React**
   - ⚠️ Ajout de 2 nouveaux hooks `useState` et 2 nouveaux `useEffect`
   - **Point critique :** Respecter l'ordre strict des hooks (déclaration en haut du composant, jamais dans conditions/boucles)
   - **Mitigation :** Ajouter les nouveaux hooks juste après les hooks existants, avant toute logique calculée

2. **Risque UX - Perte de données utilisateur**
   - ⚠️ Si localStorage échoue ou est corrompu, l'utilisateur perd sa progression
   - **Mitigation :** Validation JSON systématique avec try/catch, valeur par défaut `{}`

3. **Risque robustesse - Hydration error SSR**
   - ⚠️ Next.js génère du code côté serveur, localStorage n'existe pas en SSR
   - **Mitigation :** Guard `isClient` déjà présent dans jeune.js, réutilisation du pattern existant

4. **Risque régression - Modification de JEUNE_DAYS_CONTENT**
   - ⚠️ Ajout d'une nouvelle propriété `conseilsActivation` dans l'objet statique
   - **Impact :** Risque de casser l'affichage existant si structure mal ajoutée
   - **Mitigation :** Ajout progressif (J1, test, puis J2-14), propriété optionnelle (avec `?.`)

5. **Risque performance - Re-render excessif**
   - ⚠️ Chaque toggle de checkbox peut déclencher re-render complet si mal géré
   - **Mitigation :** Mémoïsation avec `useMemo` pour calcul de score, éviter recalcul inutile

6. **Risque accessibilité - Navigation clavier**
   - ⚠️ Checklist doit être accessible au clavier et lecteurs d'écran
   - **Mitigation :** Utiliser `<label>` avec `htmlFor`, aria-labels explicites

7. **Risque sécurité - XSS via texte conseils**
   - ⚠️ Texte des conseils est statique (pas de risque), mais si évolution future avec conseils dynamiques
   - **Mitigation :** Données en dur dans le code, pas d'input utilisateur dans cette version

#### **Ordre actuel des hooks dans jeune.js (lignes 345-430) :**
```javascript
// HOOKS D'ÉTAT (INITIALISATION)
const [dureeJeune, setDureeJeune] = useState(5);
const [jourEnCours, setJourEnCours] = useState(1);
const [joursValides, setJoursValides] = useState([]);
const [poidsInitial, setPoidsInitial] = useState(0);
const [messagePerso, setMessagePerso] = useState("");
const [showMessagePerso, setShowMessagePerso] = useState(false);
const [outils, setOutils] = useState({});
const [outilInput, setOutilInput] = useState("");
const [showInfo, setShowInfo] = useState(false);
const [dateDebutJeune, setDateDebutJeune] = useState(null);
const [programmeReprise, setProgrammeReprise] = useState(null);
const [alerteJ3, setAlerteJ3] = useState(null);
const [loadingProgramme, setLoadingProgramme] = useState(false);
const [isClient, setIsClient] = useState(false);
const [planRepriseValide, setPlanRepriseValide] = useState(null);
const [planValideCoherent, setPlanValideCoherent] = useState(false);
const [showValidationModal, setShowValidationModal] = useState(false);
const [repasRecentsSupabase, setRepasRecentsSupabase] = useState([]);
const [poidsDepart, setPoidsDepart] = useState(null);
const [dernierRepasSupabase, setDernierRepasSupabase] = useState(null);
const [loadingDonneesJeune, setLoadingDonneesJeune] = useState(true);
const [donneesManquantes, setDonneesManquantes] = useState({ poids: false, repas: false });
```

**🆕 NOUVEAUX HOOKS À AJOUTER (après les hooks existants) :**
```javascript
const [conseilsActivation, setConseilsActivation] = useState({});
```

**🆕 NOUVEAUX EFFETS À AJOUTER (après les useEffect existants) :**
```javascript
// Chargement au montage
useEffect(() => {
  if (isClient) {
    const conseils = loadState('conseilsActivationJeune', {});
    setConseilsActivation(conseils);
  }
}, [isClient]);

// Sauvegarde automatique
useEffect(() => {
  if (isClient && Object.keys(conseilsActivation).length > 0) {
    saveState('conseilsActivationJeune', conseilsActivation);
  }
}, [conseilsActivation, isClient]);
```

#### **Points de vigilance à intégrer dans la checklist du contrôle qualité :**
1. Vérifier que les 2 nouveaux hooks sont déclarés APRÈS les hooks existants, AVANT toute logique calculée
2. Vérifier que les 2 nouveaux useEffect sont déclarés APRÈS tous les useState, AVANT les handlers
3. Vérifier que `loadState` et `saveState` sont bien utilisés (fonctions déjà présentes lignes 292-304)
4. Vérifier que `isClient` est bien vérifié avant accès localStorage
5. Tester affichage avec localStorage vide, localStorage corrompu, localStorage avec données valides

---

### Etape 2 — **Sous-checklist à valider systématiquement**

#### **Imports & dépendances :**
- [x] `useState` importé ? → **OUI** (déjà présent ligne 1)
- [x] `useEffect` importé ? → **OUI** (déjà présent ligne 1)
- [x] `loadState` disponible ? → **OUI** (fonction définie lignes 292-301)
- [x] `saveState` disponible ? → **OUI** (fonction définie lignes 302-304)
- [ ] `ChecklistConseilsActivation` importé ? → **NON** (à créer et importer)
- [ ] Styles CSS importés ? → **NON** (à créer et importer)

#### **Variables & fonctions :**
- [x] `jourEnCours` disponible ? → **OUI** (état existant)
- [x] `isClient` disponible ? → **OUI** (état existant)
- [ ] `toggleConseil` défini ? → **NON** (handler à créer)
- [ ] `JEUNE_DAYS_CONTENT` modifié ? → **NON** (à modifier avec nouvelle propriété)

#### **Données statiques :**
- [ ] Propriété `conseilsActivation` ajoutée à JEUNE_DAYS_CONTENT[1-14] ? → **NON** (à ajouter)
- [ ] Structure validée pour les 14 jours ? → **NON** (à valider)

---

### Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

#### **✅ Lecture & compréhension :**
- [x] Lecture complète du fichier jeune.js (1296 lignes) effectuée
- [x] Compréhension de la structure JEUNE_DAYS_CONTENT (lignes 7-228)
- [x] Compréhension du flow initialisation → logique → handlers → rendu
- [x] Identification de tous les hooks existants (23 hooks useState + 11 useEffect)
- [x] Identification de la position d'insertion des nouveaux hooks (après ligne 370)

#### **✅ Ordre & portée :**
- [ ] Tous les nouveaux hooks React déclarés en haut du composant (après hooks existants, avant logique)
- [ ] Aucun hook dans fonction, boucle, map, if
- [ ] Séparation stricte : initialisation → logique calculée → handlers → rendu
- [ ] Toute fonction utilisée dans le rendu présente et initialisée AVANT usage
- [ ] Ordre logique respecté (pas d'appel prématuré)

#### **✅ Sécurité & robustesse :**
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d'erreur systématique (try/catch sur localStorage)
- [ ] Guard SSR avec `isClient` avant accès localStorage
- [ ] Validation JSON pour données chargées depuis localStorage
- [ ] Gestion des cas limites (localStorage vide, corrompu, désactivé)

#### **✅ Non-régression :**
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Aucune suppression destructrice
- [ ] Aucune modification de la logique existante de validation des jours
- [ ] Aucun impact sur le calcul de progression
- [ ] Aucun impact sur le programme de reprise
- [ ] Test sur tous les cas d'usage (J1, J4, J8, J14, navigation avant/arrière)

#### **✅ Accessibilité & UX :**
- [ ] Navigation clavier fonctionnelle (checkboxes, boutons)
- [ ] Labels explicites pour lecteurs d'écran
- [ ] Feedback visuel sur actions (checkbox cochée, score mis à jour)
- [ ] Responsive mobile testé
- [ ] Contraste couleurs suffisant (WCAG AA minimum)

#### **✅ Documentation & traçabilité :**
- [ ] Mise à jour du pourcentage d'avancement à chaque étape
- [ ] Rapport Markdown avant/après généré
- [ ] Validation utilisateur OBLIGATOIRE avant implémentation
- [ ] Toute anomalie → rollback immédiat + rapport dans fichier ANOMALIE

#### **✅ Relecture manuelle :**
- [ ] Relecture **manuelle obligatoire** ligne par ligne de tous les nouveaux hooks AVANT usage
- [ ] Vérification manuelle de l'ordre des hooks (pas de confiance mémoire IA)
- [ ] Vérification manuelle de la structure JEUNE_DAYS_CONTENT modifiée
- [ ] Vérification manuelle du rendu JSX avec nouvelle section

---

### Etape 4 — **Contrôles conformité à réaliser (en suivant l'ordre ci-dessous)**

#### **1. Lecture des anomalies rollback :**
- [x] Fichier `docs/Anomalie roll back` consulté
- [x] **Anomalie identifiée (20/11/2025) :** Double déclaration de useEffect causant re-render infini
- [x] **Anomalie identifiée (21/11/2025) :** useState appelé dans bloc conditionnel causant erreur SSR
- [x] **Leçon apprise :** Toujours déclarer hooks en haut du composant, jamais conditionnellement

#### **2. Checklist de contrôle (suite aux anomalies) :**
- [ ] Vérifier qu'aucun hook n'est appelé dans un if/boucle/map
- [ ] Vérifier qu'aucun hook n'est dupliqué
- [ ] Vérifier que chaque useEffect a ses dépendances correctes
- [ ] Vérifier que chaque useEffect ne crée pas de boucle infinie
- [ ] Tester avec React StrictMode activé (détecte effets mal gérés)

#### **3. Audit des risques (reprise de l'Etape 1) :**
- [x] Risque ordre hooks → Mitigation : Ajout après hooks existants
- [x] Risque SSR → Mitigation : Guard `isClient` utilisé
- [x] Risque perte données → Mitigation : Try/catch + valeur par défaut
- [x] Risque régression → Mitigation : Propriété optionnelle avec `?.`
- [x] Risque performance → Mitigation : useMemo pour calcul score
- [x] Risque accessibilité → Mitigation : Labels + aria

#### **4. Tests de conformité (à réaliser APRÈS implémentation) :**
1. **Test sauvegarde/restauration :**
   - Cocher 2 conseils J1 → recharger page → vérifier que les 2 conseils restent cochés
   - Cocher 4 conseils J4 → naviguer J5 → revenir J4 → vérifier que les 4 conseils restent cochés
   - Vider localStorage → recharger → vérifier que l'affichage fonctionne (état initial)

2. **Test accessibilité :**
   - Navigation TAB → vérifier que chaque checkbox est accessible
   - Lecteur d'écran → vérifier que labels sont lus correctement
   - Contraste → vérifier ratio WCAG AA (4.5:1 minimum)

3. **Test non-régression :**
   - Valider un jour → vérifier que validation fonctionne toujours
   - Ajouter un outil → vérifier que fonctionnalité fonctionne
   - Générer programme reprise → vérifier que génération fonctionne
   - Naviguer jour suivant/précédent → vérifier que navigation fonctionne

4. **Test performance :**
   - Mesurer temps de rendu initial (< 100ms attendu)
   - Mesurer temps de toggle checkbox (< 50ms attendu)
   - Vérifier nombre de re-render (max 1 par toggle)
   - Vérifier taille bundle (+5KB max attendu)

5. **Test multi-device :**
   - Desktop Chrome → affichage correct
   - Mobile Safari → affichage correct + touch fonctionnel
   - Tablette → affichage correct
   - Small screen (320px) → pas de débordement horizontal

6. **Test cas limites :**
   - localStorage désactivé → affichage fonctionne (pas de crash)
   - localStorage corrompu (JSON invalide) → affichage fonctionne (valeur par défaut)
   - Jour 1 avec 0 conseil coché → message motivationnel affiché
   - Jour 8 avec 5 conseils cochés → message félicitation affiché

#### **5. Proposition de rollback si anomalie détectée :**
- **Si erreur SSR détectée :** Rollback vers version avant ajout des hooks, documenter dans ANOMALIE avec date/heure
- **Si perte de données localStorage :** Rollback vers version stable, ajouter validation JSON plus stricte
- **Si régression validation jours :** Rollback immédiat, analyser conflit avec logique existante

---

### Etape 5 — **Mise à jour de l'avancement**

- [x] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : **0%** (Plan en attente de validation)

**Historique des mises à jour :**
- **06/12/2025 14:30** — Plan d'implémentation créé (0%)
- _À venir après validation :_
  - Phase 1 : Modification JEUNE_DAYS_CONTENT (30%)
  - Phase 2 : Création composant ChecklistConseilsActivation (60%)
  - Phase 3 : Intégration dans jeune.js (80%)
  - Phase 4 : Tests et validation (100%)

---

### Etape 6 — **Point de vigilance**

#### **1. Rapport lecture fichier anomalies rollback :**

**Anomalies pertinentes identifiées :**

**Anomalie #1 (20/11/2025 - 15h23) :**
- **Erreur :** Double déclaration de `useEffect` avec même dépendance causant re-render infini
- **Contexte :** Fichier `preparation-jeune.js`, ajout de useEffect pour sync state
- **Impact :** Application freeze, CPU 100%
- **Résolution :** Rollback, fusion des 2 useEffect en un seul
- **Leçon :** Toujours vérifier qu'un useEffect similaire n'existe pas déjà

**Anomalie #2 (21/11/2025 - 09h47) :**
- **Erreur :** useState appelé dans bloc conditionnel `if (isClient)`
- **Contexte :** Fichier `jeune.js`, tentative de guard SSR sur hook
- **Impact :** Erreur React "Rendered more hooks than during the previous render"
- **Résolution :** Rollback, useState déclaré en haut, condition dans useEffect uniquement
- **Leçon :** JAMAIS de hook dans if/boucle/map, toujours en haut du composant

**Anomalie #3 (22/11/2025 - 11h12) :**
- **Erreur :** Variable utilisée avant sa déclaration dans le rendu
- **Contexte :** Fichier `preparation-jeune.js`, variable `debugInfo` utilisée avant initialisation
- **Impact :** Runtime error "debugInfo is not defined"
- **Résolution :** Déplacer déclaration avant usage
- **Leçon :** Respecter ordre strict : initialisation → logique → handlers → rendu

#### **2. Erreurs similaires à éviter pour cette modification :**

1. **❌ NE PAS faire :**
   ```javascript
   if (isClient) {
     const [conseilsActivation, setConseilsActivation] = useState({}); // ❌ ERREUR
   }
   ```
   **✅ À faire :**
   ```javascript
   const [conseilsActivation, setConseilsActivation] = useState({}); // ✅ En haut du composant
   ```

2. **❌ NE PAS faire :**
   ```javascript
   // Deux useEffect similaires
   useEffect(() => {
     saveState('conseilsActivationJeune', conseilsActivation);
   }, [conseilsActivation]);
   
   useEffect(() => {
     saveState('conseilsActivationJeune', conseilsActivation); // ❌ DOUBLON
   }, [conseilsActivation]);
   ```
   **✅ À faire :**
   ```javascript
   // Un seul useEffect avec guard
   useEffect(() => {
     if (isClient && Object.keys(conseilsActivation).length > 0) {
       saveState('conseilsActivationJeune', conseilsActivation);
     }
   }, [conseilsActivation, isClient]);
   ```

3. **❌ NE PAS faire :**
   ```javascript
   // Utiliser toggleConseil avant de le définir
   return <button onClick={toggleConseil}>...</button>
   
   const toggleConseil = () => { /* ... */ }; // ❌ Défini après usage
   ```
   **✅ À faire :**
   ```javascript
   // Définir toggleConseil avant le rendu
   const toggleConseil = (conseilId) => { /* ... */ };
   
   return <button onClick={() => toggleConseil(1)}>...</button>
   ```

#### **3. Checklist de vérification spécifique (impact attendu) :**

- [ ] **Hook useState `conseilsActivation`** déclaré en haut, après les hooks existants (ligne ~371)
- [ ] **useEffect chargement** déclaré après tous les useState, avec guard `isClient`
- [ ] **useEffect sauvegarde** déclaré après le useEffect de chargement, avec guard `isClient` ET check `length > 0`
- [ ] **Handler `toggleConseil`** défini avant le rendu JSX (section handlers lignes 534-612)
- [ ] **Aucun hook** dans map/if/boucle
- [ ] **Aucun doublon** de useEffect avec mêmes dépendances
- [ ] **Import ChecklistConseilsActivation** en haut du fichier avec autres imports
- [ ] **Propriété `conseilsActivation`** ajoutée à JEUNE_DAYS_CONTENT avec opérateur optionnel `?.` dans le rendu

**Impact attendu :**
- ✅ Aucune régression sur fonctionnalités existantes
- ✅ Nouvelle section visible sous le contenu du jour
- ✅ Checkboxes fonctionnelles avec persistance
- ✅ Score affiché et mis à jour en temps réel
- ✅ Messages motivationnels selon progression
- ✅ Données sauvegardées dans localStorage
- ✅ Compatible SSR (Next.js)
- ✅ +5KB bundle size (négligeable)

---

### Etape 7 — **Proposition de rollback**

#### **Scénarios de rollback identifiés :**

**Scénario 1 : Erreur SSR hydration**
- **Symptôme :** Warning "Text content did not match" ou "Hydration failed"
- **Cause probable :** Accès localStorage avant guard `isClient`
- **Action rollback :** 
  1. Git revert du commit contenant la modification
  2. Documenter dans `docs/Anomalie roll back` avec date/heure exacte
  3. Analyser le code pour identifier où `isClient` n'a pas été vérifié
  4. Proposition alternative : Ajouter guards supplémentaires + test SSR systématique

**Scénario 2 : Perte de validation des jours**
- **Symptôme :** Bouton "Valider ce jour" ne fonctionne plus
- **Cause probable :** Conflit entre nouveau state `conseilsActivation` et logique existante `joursValides`
- **Action rollback :**
  1. Git revert immédiat
  2. Documenter anomalie avec screenshot/logs
  3. Analyser les handlers `validerJour` et `toggleConseil` pour identifier conflit
  4. Proposition alternative : Isoler complètement les 2 logiques (pas de dépendance croisée)

**Scénario 3 : Performance dégradée (re-render infini)**
- **Symptôme :** Page freeze, CPU 100%, console avec milliers de logs
- **Cause probable :** useEffect avec dépendances mal gérées créant boucle
- **Action rollback :**
  1. Force quit build dev
  2. Git revert
  3. Documenter avec profiler React screenshot
  4. Analyser dépendances des useEffect ajoutés
  5. Proposition alternative : Mémoïsation avec useMemo + dépendances strictes

**Scénario 4 : Crash localStorage corrompu**
- **Symptôme :** Page blanche, error "JSON.parse" dans console
- **Cause probable :** Pas de try/catch sur `loadState`
- **Action rollback :**
  1. Git revert
  2. Documenter erreur complète
  3. Ajouter validation JSON stricte avec try/catch
  4. Proposition alternative : Fonction `loadStateSecure` avec validation schema

**Format de documentation dans ANOMALIE rollback :**
```
─────────────────────────────────────────────────────────────
ANOMALIE #[AUTO_INCREMENT]
Date : 06/12/2025
Heure : [HH:MM]
Fichier : /pages/jeune.js
Modification : Ajout Conseils d'Activation

Symptôme : [Description précise]
Cause : [Analyse détaillée]
Impact : [Sévérité + conséquences]
Action : Rollback vers commit [HASH]
Alternative proposée : [Solution de contournement]
Validation : [Tests ajoutés pour éviter récurrence]
─────────────────────────────────────────────────────────────
```

**⚠️ IMPORTANT : Aucune suppression dans le fichier ANOMALIE, toujours ajouter à la fin.**

---

### Etape 8 — **Rapport Markdown Copilot**

## 📊 RAPPORT AVANT MODIFICATION

### **Structure actuelle de jeune.js :**

**Lignes 1-6 : Imports**
```javascript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
```

**Lignes 7-228 : Données statiques JEUNE_DAYS_CONTENT**
- Objet avec clés 1-14 (jours de jeûne)
- Chaque jour contient : `titre`, `corps` (array), `message`
- Structure actuelle :
  ```javascript
  1: {
    titre: "Jour 1 – Sortir du pilotage automatique",
    corps: ["🧠 Esprit : ...", "🧬 Corps : ...", ...],
    message: "..."
  }
  ```

**Lignes 229-304 : Fonctions utilitaires**
- `analyseComportementale()`
- `pertePoidsEstimee()`
- `loadState()` (lecture localStorage)
- `saveState()` (écriture localStorage)

**Lignes 306-344 : Composant Jeune - Début**
- Déclaration `export default function Jeune()`
- Router init : `const router = useRouter();`

**Lignes 345-370 : Hooks d'état (23 hooks useState)**
```javascript
const [dureeJeune, setDureeJeune] = useState(5);
const [jourEnCours, setJourEnCours] = useState(1);
const [joursValides, setJoursValides] = useState([]);
// ... 20 autres hooks
```

**Lignes 371-533 : Effets (11 useEffect)**
- Chargement localStorage au montage client
- Calcul jour en cours depuis date
- Sauvegarde auto dans localStorage
- Chargement données Supabase
- Détection J-3 pour reprise

**Lignes 534-612 : Handlers**
- `validerJour()`
- `ajouterOutil()`
- `genererProgrammeRepriseManuel()`
- `resetJeune()`

**Lignes 613-1296 : Rendu JSX**
- Guard SSR (loader si `!isClient`)
- Affichage titre jour, contenu, message
- Section outils
- Section reprise alimentaire
- Section programme reprise

### **Problèmes/Manques identifiés :**
- ❌ Pas de conseils d'activation interactifs
- ❌ Pas de tracking des bonnes pratiques quotidiennes
- ❌ Pas de feedback motivationnel sur actions concrètes
- ❌ Utilisateur ne sait pas comment optimiser son jeûne au-delà du contenu textuel

---

## 📊 RAPPORT APRÈS MODIFICATION (Prévu)

### **Modifications dans jeune.js :**

**Lignes 1-6 : Imports (AJOUT)**
```javascript
import { useState, useEffect, useMemo } from 'react'; // +useMemo
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import ChecklistConseilsActivation from '../components/ChecklistConseilsActivation'; // +NOUVEAU
import styles from '../styles/ConseilsActivation.module.css'; // +NOUVEAU
```

**Lignes 7-228 : JEUNE_DAYS_CONTENT (MODIFICATION)**
- Ajout propriété `conseilsActivation` pour chaque jour (1-14)
- Structure enrichie :
  ```javascript
  1: {
    titre: "Jour 1 – Sortir du pilotage automatique",
    corps: ["🧠 Esprit : ...", ...],
    message: "...",
    conseilsActivation: { // +NOUVEAU
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { 
          id: 1,
          conseil: "Bien dormir 2 à 3 nuits de suite",
          benefice: "↘ cortisol, ↗ déstockage",
          actif: true
        },
        { 
          id: 2,
          conseil: "Boire 2 à 3 L d'eau pure par jour",
          benefice: "↘ rétention, ↘ inflammation",
          actif: true
        }
      ]
    }
  }
  ```
- J1-J3 : 2 conseils
- J4-J7 : 4 conseils
- J8-J14 : 5 conseils

**Lignes 345-371 : Hooks d'état (AJOUT)**
```javascript
// ... 23 hooks existants
const [conseilsActivation, setConseilsActivation] = useState({}); // +NOUVEAU
```

**Lignes 371-533 : Effets (AJOUT)**
```javascript
// ... 11 useEffect existants

// +NOUVEAU - Chargement au montage
useEffect(() => {
  if (isClient) {
    const conseils = loadState('conseilsActivationJeune', {});
    setConseilsActivation(conseils);
  }
}, [isClient]);

// +NOUVEAU - Sauvegarde automatique
useEffect(() => {
  if (isClient && Object.keys(conseilsActivation).length > 0) {
    saveState('conseilsActivationJeune', conseilsActivation);
  }
}, [conseilsActivation, isClient]);
```

**Lignes 534-612 : Handlers (AJOUT)**
```javascript
// ... handlers existants

// +NOUVEAU - Toggle conseil
const toggleConseil = (conseilId) => {
  setConseilsActivation(prev => {
    const jourData = prev[jourEnCours] || {};
    return {
      ...prev,
      [jourEnCours]: {
        ...jourData,
        [conseilId]: !jourData[conseilId]
      }
    };
  });
};

// +NOUVEAU - Calcul score (avec useMemo pour optimisation)
const scoreActivation = useMemo(() => {
  if (!contenuJour.conseilsActivation) return null;
  const etatConseils = conseilsActivation[jourEnCours] || {};
  const nbFaits = contenuJour.conseilsActivation.items.filter(c => etatConseils[c.id]).length;
  return { nbFaits, total: contenuJour.conseilsActivation.items.length };
}, [conseilsActivation, jourEnCours, contenuJour]);
```

**Lignes 900+ : Rendu JSX (AJOUT)**
```jsx
{/* ... contenu existant du jour ... */}

{/* +NOUVEAU - Section Conseils d'Activation */}
{contenuJour.conseilsActivation && (
  <ChecklistConseilsActivation
    conseils={contenuJour.conseilsActivation.items}
    etatConseils={conseilsActivation[jourEnCours] || {}}
    score={scoreActivation}
    onToggle={toggleConseil}
  />
)}

{/* ... reste du rendu existant ... */}
```

### **Nouveau composant ChecklistConseilsActivation.js (~150 lignes) :**
```javascript
export default function ChecklistConseilsActivation({ conseils, etatConseils, score, onToggle }) {
  const getMessageScore = (score, total) => {
    const pourcentage = (score / total) * 100;
    if (pourcentage === 100) return "🔥 Activation maximale ! Ton corps te remercie.";
    if (pourcentage >= 75) return "💪 Très bien ! Continue comme ça.";
    if (pourcentage >= 50) return "👍 Bon début ! Chaque conseil compte.";
    return "🌱 Chaque petit geste compte. Commence doucement.";
  };

  return (
    <div className={styles.conseilsActivation}>
      <h3>💪 Conseils d'activation (booste les bénéfices)</h3>
      {score && (
        <p className={styles.score}>
          Score du jour : <strong>{score.nbFaits}/{score.total}</strong> conseils activés
        </p>
      )}
      
      <ul className={styles.checklist}>
        {conseils.map(conseil => (
          <li key={conseil.id} className={etatConseils[conseil.id] ? styles.fait : ''}>
            <input 
              type="checkbox" 
              id={`conseil-${conseil.id}`}
              checked={!!etatConseils[conseil.id]}
              onChange={() => onToggle(conseil.id)}
              aria-label={conseil.conseil}
            />
            <label htmlFor={`conseil-${conseil.id}`}>
              <span className={styles.conseil}>{conseil.conseil}</span>
              <span className={styles.benefice}>{conseil.benefice}</span>
            </label>
          </li>
        ))}
      </ul>
      
      {score && score.nbFaits === score.total && (
        <div className={styles.messageFelicitations}>
          {getMessageScore(score.nbFaits, score.total)}
        </div>
      )}
    </div>
  );
}
```

### **Nouveau fichier styles/ConseilsActivation.module.css (~120 lignes)**
- Gradient violet (inspiré du design existant)
- Animation pulse pour message félicitation
- Responsive mobile
- États hover/focus pour accessibilité

### **Bénéfices apportés :**
- ✅ Conseils d'activation progressifs (2 → 4 → 5 selon jour)
- ✅ Interaction utilisateur (checklist cliquable)
- ✅ Feedback temps réel (score + message motivationnel)
- ✅ Persistance données (localStorage)
- ✅ Optimisation performance (useMemo)
- ✅ Accessibilité complète (labels, aria, keyboard)
- ✅ Aucune régression sur code existant

### **Impact bundle :**
- jeune.js : +~100 lignes (+8%)
- ChecklistConseilsActivation.js : +150 lignes (nouveau)
- ConseilsActivation.module.css : +120 lignes (nouveau)
- **Total : +370 lignes, +~5KB gzipped**

### **Pas de suppression/modification destructrice :**
- ✅ Aucun code existant supprimé
- ✅ Aucune logique existante modifiée
- ✅ Ajout uniquement de nouvelles fonctionnalités
- ✅ Propriété `conseilsActivation` optionnelle (pas d'erreur si absente)

---

### Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

**🔴 BLOQUANT : Copilot ne peut PAS procéder à l'implémentation tant que cette case n'est pas cochée par l'utilisateur.**

- [ ] Plan validé par l'utilisateur à la date : ___________

**Instructions pour validation :**
1. Lire l'intégralité du plan ci-dessus
2. Vérifier que les modifications correspondent à votre demande initiale
3. Vérifier que les risques identifiés sont acceptable
4. Vérifier que les points de vigilance sont clairs
5. Cocher la case ci-dessus et indiquer la date
6. Confirmer à Copilot : "Plan validé, tu peux procéder à l'implémentation"

**Une fois validé, Copilot procédera dans cet ordre :**
1. **Phase 1 (30%)** : Modification JEUNE_DAYS_CONTENT (ajout propriété conseilsActivation pour 14 jours)
2. **Phase 2 (60%)** : Création composant ChecklistConseilsActivation.js + styles CSS
3. **Phase 3 (80%)** : Intégration dans jeune.js (hooks, handlers, rendu)
4. **Phase 4 (100%)** : Tests, validation, rapport final

**Chaque phase sera documentée avec avancement mis à jour en temps réel.**

---

## 📋 RÉSUMÉ EXÉCUTIF

### **Ce qui sera fait :**
- ✅ Ajout de conseils d'activation progressifs dans chaque jour de jeûne
- ✅ Checklist interactive pour tracker les bonnes pratiques
- ✅ Score et messages motivationnels selon progression
- ✅ Persistance dans localStorage pour suivi continu
- ✅ Composant réutilisable et accessible

### **Ce qui NE sera PAS fait :**
- ❌ Aucune modification de la logique existante de validation des jours
- ❌ Aucune modification du programme de reprise
- ❌ Aucune modification des outils existants
- ❌ Aucune suppression de code

### **Risques principaux et mitigation :**
1. Ordre des hooks → Ajout après hooks existants uniquement
2. SSR hydration → Guard `isClient` systématique
3. Performance → useMemo pour calcul score
4. Régression → Propriété optionnelle avec `?.`

### **Estimation effort :**
- **Temps développement :** 4-6 heures
- **Lignes code ajoutées :** ~370 lignes
- **Impact bundle :** +5KB (négligeable)
- **Tests :** 2 heures

### **Prêt pour implémentation ?**
- [ ] NON - En attente de validation utilisateur
- [ ] OUI - Validation reçue, implémentation en cours

---

**⚠️ FIN DU PLAN — Attente validation utilisateur pour procéder au code**

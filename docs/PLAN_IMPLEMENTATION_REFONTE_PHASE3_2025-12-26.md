# 🟢 PLAN D'IMPLÉMENTATION — PHASE 3 REPRISE ALIMENTAIRE

**Date de création** : 26/12/2025  
**Branche** : AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS  
**Statut** : ⏳ EN ATTENTE VALIDATION UTILISATEUR

---

## Titre de la tâche  
**Implémentation Phase 3 — Protéines & Lipides (J8-J10) avec architecture validée Phases 1-2**

---

## **Description précise de la modification attendue**

### Contexte
Les Phases 1 et 2 ont été **implémentées avec succès** en suivant une architecture éprouvée :
- ✅ **Phase 1** (J1-J4) : NotificationsPhase1.js + RecettesPhase1Modal.js — Liquides
- ✅ **Phase 2** (J5-J7) : NotificationsPhase2.js + RecettesPhase2Modal.js — Fibres douces

**Phase 3 est actuellement un "trou" dans l'interface** :
- ✅ Les données aliments Phase 3 existent (12 aliments : œufs, avocat, huiles, fromage blanc, etc.)
- ✅ La logique métier assigne automatiquement `phase: 3` aux jours J8-J10
- ❌ **MAIS** l'UI n'affiche rien (fichiers NotificationsPhase3.js et RecettesPhase3Modal.js sont vides)
- ❌ Les utilisateurs voient un espace vide à J8-J10 (régression UX majeure)

### Objectif Phase 3
Implémenter les notifications et recettes pour la **Reconstruction tissulaire & Protéines** à partir du **Jour 8 à Jour 10** avec :

- **12 aliments Phase 3** : Œuf (mollet, poché), Avocat mûr, Huile d'olive vierge, Huile de coco, Fromage blanc 0%, Yaourt nature 0%, Beurre clarifié, Ghee, Amande entière, Noix macadamia, Graine de courge, Crevettes (quantités strictes)
- **Objectif nutrition** : Reconstruction tissulaire musculaire/énergétique, maintien cétose si souhaité
- **Horaires recommandés** : 8h (Huile) / 11h (Protéine) / 13h (Repas équilibré) / 16h (Gras) / 19h (Protéine + Huile)
- **Progression J8→J9→J10** : Augmentation progressive des portions et variété aliments
- **Recettes Cookeo/Marmite** : Œufs mollet/poché, préparation huiles, conservation aliments délicats

### Livrable
1. `components/NotificationsPhase3.js` : Affichage notifications horaires Phase 3 (8h/11h/13h/16h/19h)
2. `components/RecettesPhase3Modal.js` : Modal avec recettes protéines & lipides (toggle Cookeo/Marmite)
3. Intégration dans `pages/reprise-alimentaire-apres-jeune.js` (imports, state, composants)

### Impact
- **Utilité critique** : Fermer le "trou" J8-J10 et afficher des notifications cohérentes
- **Aucune régression** : Phases 1-2 restent inchangées, Phase 4-5 non impactées
- **Délai** : 2-3h implémentation + 1h tests
- **Risque** : **TRÈS FAIBLE** (architecture éprouvée Phases 1-2)

---

## **Fichiers concernés**
- `/components/NotificationsPhase3.js` *(création - fichier actuellement vide)*
- `/components/RecettesPhase3Modal.js` *(création - fichier actuellement vide)*
- `/pages/reprise-alimentaire-apres-jeune.js` *(modification - imports + state + rendu)*
- `/data/alimentsRepriseJeune.js` *(lecture seule - 12 aliments Phase 3 déjà conformes)*

---

## Etape 1 — **Audit des risques préalable**

### Risques identifiés

#### 🔴 Risques techniques
1. **Fichiers Phase 3 vides** → Pas de risque de perte (il n'y a rien à perdre)
2. **Architecture Phases 1-2 éprouvée** → Copie simple = risque très faible
3. **Hooks React mal ordonnés** → Mitigation : Suivre exactement l'ordre Phases 1-2
4. **Intégration JSX** → Copier exactement le pattern de Phase 2

#### 🟡 Risques UX
1. **Changement affichage J8-J10** : Les utilisateurs actuellement en Phase 3 verront des notifications (amélioration, pas régression)
2. **Clarté horaires** : Certification que les 5 horaires sont affichés correctement
3. **Accessibilité mobile** : Vérification rendu responsive sur petit écran

#### 🟢 Risques fonctionnels (TRÈS FAIBLES)
1. **Données aliments** : ✅ **12 aliments Phase 3 confirmés** dans data/alimentsRepriseJeune.js
2. **Hooks React** : ✅ Pattern validé Phases 1-2 (useState en haut, jamais dans conditions)
3. **Migration localStorage** : N/A (pas d'aliments existants à migrer en Phase 3)
4. **Régression Phases 1-2** : Très faible (seuls ajouts, aucune suppression)
5. **Compatibilité génération programme** : ✅ Phase 3 assignée automatiquement J8-J10 par genererProgrammeReprise.js

### Points de vigilance identifiés
1. ✅ Vérifier ordre strict hooks React dans NotificationsPhase3.js (useState AVANT map)
2. ✅ Vérifier ordre strict hooks React dans RecettesPhase3Modal.js (useState pour toggle)
3. ✅ Tester affichage J8, J9, J10 spécifiquement
4. ✅ Vérifier aucune import manquante (useState, useEffect)
5. ✅ Validation que les 12 aliments Phase 3 s'affichent correctement

### Consultation fichier anomalies rollback
✅ **EFFECTUÉ** : Lecture complète du fichier anomalies rollback avant démarrage.
- Aucune anomalie bloquante identifiée pour Phase 3
- Points de vigilance retour d'expérience Phases 1-2 extraits et intégrés dans Etape 6
- Traçabilité totale préservée (aucune suppression dans le fichier)

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### NotificationsPhase3.js
- [ ] `useState` importé de React
- [ ] Variable `horairesPhase3` définie AVANT le map
- [ ] Aucun hook React dans le map des horaires
- [ ] Props correctes : `phase`, `jourNum`, `isActive`, `onRecettesClick`
- [ ] Bouton "📖 Voir recettes" appelle `onRecettesClick` correctement
- [ ] Affichage horaires : 8h / 11h / 13h / 16h / 19h (5 horaires)
- [ ] Aliments cohérents : œufs, avocat, huiles (correspond aux données Phase 3)

### RecettesPhase3Modal.js
- [ ] `useState` importé pour toggle Cookeo/Marmite
- [ ] Minimum 3-4 recettes : Œuf mollet, Œuf poché, Huile d'olive, Avocat
- [ ] Chaque recette : 2 versions Cookeo + Marmite
- [ ] Modal ouverture/fermeture avec état React correctement
- [ ] Bouton "Fermer" fonctionne
- [ ] Props correctes : `isOpen`, `recetteType`, `onClose`

### reprise-alimentaire-apres-jeune.js
- [ ] Import `NotificationsPhase3` ajouté en haut (ligne ~5-6)
- [ ] Import `RecettesPhase3Modal` ajouté en haut (ligne ~5-6)
- [ ] State `modalRecettesPhase3` déclaré parmi les autres useState (ligne ~210-214)
- [ ] Composant NotificationsPhase3 affiché si `phaseActuelle === 3` (ligne ~1800-1810)
- [ ] Modal RecettesPhase3Modal affiché (ligne ~1830-1835)
- [ ] Callback `onRecettesClick` correct (appelle `setModalRecettesPhase3`)

---

## Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

- [ ] Lecture **complète et manuelle** de NotificationsPhase1.js et NotificationsPhase2.js pour identifier l'architecture exacte
- [ ] Lecture **complète et manuelle** de RecettesPhase1Modal.js et RecettesPhase2Modal.js pour identifier l'architecture exacte
- [ ] Lecture complète du code Phase 3 actuel dans reprise-alimentaire-apres-jeune.js (contexte intégration)
- [ ] Lecture complète de la documentation Phase 3 officielle (data/alimentsRepriseJeune.js lignes 379-550)
- [ ] Initialisation systématique : tous nouveaux hooks déclarés en haut des composants AVANT leur usage
- [ ] ⚠️ **Tous les hooks React (useState, useEffect)** déclarés **uniquement en haut du corps des composants fonctionnels**
- [ ] ⚠️ **JAMAIS** de hooks dans une fonction, une boucle, un map, un if, un switch, ou une condition (respect strict des règles officielles React)
- [ ] Séparation stricte : **initialisation → logique métier → handlers → rendu** (pour nouveaux composants)
- [ ] Vérification : toutes fonctions/handlers utilisés dans rendu sont présents et initialisés AVANT leur usage dans JSX
- [ ] Ordre logique strict : pas de déclaration/usage prématuré des aliments, horaires, ou variables
- [ ] Pas de doublons ni de déclarations superflues dans les nouveaux fichiers
- [ ] Contrôle d'erreur systématique : **compilation, runtime, SSR, rendu**
- [ ] Test du rendu sur **tous les cas d'usage** Phase 3 (J8, J9, J10 spécifiquement)
- [ ] Préservation **stricte** des fonctionnalités existantes : Phases 1-2 non impactées, Phase 4-5 non impactées
- [ ] Migration données : N/A pour Phase 3 (c'est un ajout, pas une modification)
- [ ] Documentation claire de chaque modification et validation automatisée
- [ ] **Relecture MANUELLE OBLIGATOIRE** de tous nouveaux hooks/variables AVANT chaque utilisation dans le code
- [ ] ✅ **J'ai relu, ligne par ligne et manuellement**, la déclaration de tous les useState et useEffect AVANT chaque appel, sans me fier à la mémoire Copilot.
- [ ] Validation utilisateur OBLIGATOIRE avant implémentation
- [ ] **TOUTES les cases ci-dessus cochées et documentées** avant de poursuivre

---

## Etape 4 — **Contrôles conformité à réaliser (en suivant l'ordre ci-dessous)**

### 1️⃣ Lecture fichier anomalies rollback
✅ **EFFECTUÉ** : Aucune anomalie bloquante Phase 3 identifiée dans le fichier rollback.

**⚠️ RAPPEL CRITIQUE** : Aucune suppression ne doit être effectuée sur le fichier rollback lors de l'ajout d'une entrée. Traçabilité totale obligatoire.

### 2️⃣ Checklist de contrôle avant codage
- [ ] Vérifier que data/alimentsRepriseJeune.js contient **exactement 12 aliments Phase 3**
- [ ] Vérifier que les aliments correspondent à : œufs, avocat, huiles, fromage blanc, yaourt, beurre, amandes, noix, graines, crustacés
- [ ] Vérifier que les horaires Phase 3 sont cohérents avec Phases 1-2 pattern (8h/11h/13h/16h/19h)
- [ ] Vérifier que data/alimentsRepriseJeune.js a les 12 aliments marqués `phase: 3`
- [ ] Analyser les portions recommandées pour chaque aliment (1 œuf, 1/4 avocat, 0.5 CS huile, etc.)
- [ ] Lister les 3-4 recettes prioritaires à implémenter d'abord

### 3️⃣ Analyse de l'audit des risques
✅ Aucune anomalie bloquante. Risques techniques couverts par l'architecture validée Phases 1-2.

**Architecture complètement éprouvée** : Phase 2 a déjà démontré que ce pattern fonctionne parfaitement.

### 4️⃣ Tests de conformité à réaliser
- [ ] **Sauvegarde/restauration données** : N/A (ajout pur, pas de modification)
- [ ] **Accessibilité** : NotificationsPhase3 lisible mobile/desktop
- [ ] **Non-régression Phases 1-2** : Créer jour J1 (Phase 1), J5 (Phase 2), J8 (Phase 3) et vérifier chacun affiche correctement
- [ ] **Performance** : Pas de ralentissement avec nouveaux composants
- [ ] **Multi-device responsive** : Tester sur mobile (320px), tablet, desktop
- [ ] **Compatibilité localStorage** : Utilisateurs Phase 3 chargent correctement du cache
- [ ] **Robustesse cas limites** : J8 première journée Phase 3, J10 dernière journée Phase 3

### 5️⃣ Gestion anomalies
Si anomalie détectée lors du codage → Proposition rollback immédiate + Documentation dans fichier ANOMALIE (date/heure) **sans suppression du fichier**.

---

## Etape 5 — **Mise à jour de l'avancement**

- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé  

**Avancement précis** : 0 %  

**Historique des mises à jour** :
- 26/12/2025 19:35 — Plan créé, audit git Phase 3 effectué, en attente validation utilisateur
- En attente : Validation utilisateur pour débuter codage

---

## Etape 6 — **Point de vigilance**

### Retour d'expérience Phases 1-2 (SUCCÈS CONFIRMÉ)
✅ **Architecture NotificationsPhase*.js + RecettesPhase*Modal.js validée et éprouvée**

Phases 1-2 ont démontré que ce pattern fonctionne à 100% :
- ✅ Hooks React ordonnés correctement (useState en haut)
- ✅ Horaires affichés sans erreur (5 moments/jour)
- ✅ Modals ouverture/fermeture sans bug
- ✅ Toggle Cookeo/Marmite fonctionnel
- ✅ Récupération aliments depuis data/alimentsRepriseJeune.js sans erreur
- ✅ Aucune régression sur autres phases

### Points de vigilance Phase 3

#### ⚠️ 1️⃣ Spécificité proteines & lipides
Phase 3 est la **phase de transition vers alimentation solide normale** :
- Reprise aliments délicats (œufs fragiles, avocat qui s'oxyde)
- Quantités très limitées (1 œuf, 1/4 avocat, 0.5 CS huile)
- Progression J8→J9→J10 : augmentation douce portions
- **Vigilance** : Afficher les portions exactes dans notifications ET recettes

#### ⚠️ 2️⃣ Cohérence horaires avec données
data/alimentsRepriseJeune.js contient les 12 aliments avec `conseil` spécifique :
- Ex: "Bien cuit, mâcher lentement" (œufs)
- Ex: "Bien mûr, écrasé, petit à petit" (avocat)
- **Vigilance** : Intégrer ces conseils dans les notifications/recettes

#### ⚠️ 3️⃣ Pas de hook React dans les maps/conditions
Phases 1-2 ont bien montré que les hooks doivent TOUJOURS être en haut :
```javascript
// ✅ CORRECT (Phases 1-2)
const NotificationsPhase1 = ({ phase, jourNum }) => {
  const [state, setState] = useState(); // HAUT
  return <div>{horaires.map(...)}</div>; // Map APRÈS
};

// ❌ INCORRECT (éviter)
const NotificationsPhase3 = ({ phase, jourNum }) => {
  return horaires.map(() => {
    const [state, setState] = useState(); // ❌ JAMAIS dans map!
  });
};
```
- **Vigilance** : Respecter strictement ce pattern, pas d'exception

#### ⚠️ 4️⃣ Props et état corrects
Phase 3 doit recevoir les mêmes props que Phases 1-2 :
```javascript
<NotificationsPhase3 
  phase={...}        // Numéro de phase (3)
  jourNum={...}      // Jour de reprise (8, 9 ou 10)
  isActive={...}     // Boolean affichage
  onRecettesClick={...} // Callback ouverture modal
/>
```
- **Vigilance** : Vérifier que toutes les props sont bien passées

#### ⚠️ 5️⃣ État du modal cohérent
RecettesPhase3Modal.js doit suivre le pattern Phase 1-2 :
```javascript
const [recettesPhase3, setRecettesPhase3] = useState({ isOpen: false, type: 'oeufs' });
```
- **Vigilance** : État initial `isOpen: false` et `type` par défaut

### Checklist de vérification créée
- [ ] Hooks uniquement en début de NotificationsPhase3.js (avant map horaires)
- [ ] Hooks uniquement en début de RecettesPhase3Modal.js (avant rendu)  
- [ ] Pas de double déclaration useState/useEffect (vérifier unicité)
- [ ] Aliments Phase 3 affichés sans erreur (12 aliments)
- [ ] Horaires affichés correctement (5 horaires : 8h/11h/13h/16h/19h)
- [ ] Conseils nutritionnels visibles (textes `conseil` depuis data)
- [ ] Modal recettes s'ouvre et se ferme sans bug
- [ ] Toggle Cookeo/Marmite fonctionnel
- [ ] Aucune régression Phase 1 (J1-J4 inchangées)
- [ ] Aucune régression Phase 2 (J5-J7 inchangées)
- [ ] Progression J8→J9→J10 logique et claire

### Impact attendu
- **Phase 3** : Passage de 0% à 100% conformité (actuellement "trou")
- **Autres phases** : Aucun impact (ajout pur)
- **UX** : Amélioration majeure (utilisateurs voient notifications J8-J10 au lieu d'espace vide)
- **Risque résiduel** : **TRÈS FAIBLE** (architecture éprouvée)

---

## Etape 7 — **Proposition de rollback**

### Contexte
Si anomalie détectée lors de l'implémentation Phase 3 :

### Action de rollback
1. **Fichier concerné** : `/pages/reprise-alimentaire-apres-jeune.js`
2. **Modification en cause** : Imports NotificationsPhase3 + RecettesPhase3Modal (si bug détecté)
3. **Alternative sûre** : 
   - Supprimer les imports Phase 3 ajoutés
   - Supprimer le state `modalRecettesPhase3` ajouté
   - Supprimer les composants Phase 3 du rendu JSX
   - Revenir à l'état validé Phases 1-2 (sans Phase 3)
4. **Traçabilité** : Ajouter entrée dans fichier ANOMALIE rollback avec date/heure/détail exact

### Documentation anomalie (à remplir si nécessaire)
```
Date : __/__/2025, __h__
Anomalie : [Description précise du bug]
Fichier : [Fichier concerné - NotificationsPhase3.js ou RecettesPhase3Modal.js ou reprise-alimentaire-apres-jeune.js]
Cause : [Analyse de la cause]
Action : Rollback Phase 3, retour état Phases 1-2 validé
Détail : [Contexte complet pour traçabilité]
```

**⚠️ AUCUNE SUPPRESSION dans le fichier anomalie, toujours AJOUTER à la suite.**

---

## Etape 8 — **Rapport Markdown Copilot**

### AVANT modification

#### Structure actuelle
```
components/
  ✅ NotificationsPhase1.js    (186 lignes, fonctionnel)
  ✅ NotificationsPhase2.js    (186 lignes, fonctionnel)
  ❌ NotificationsPhase3.js    (0 lignes, VIDE)
  ✅ RecettesPhase1Modal.js    (375 lignes, fonctionnel)
  ✅ RecettesPhase2Modal.js    (375 lignes, fonctionnel)
  ❌ RecettesPhase3Modal.js    (0 lignes, VIDE)

pages/reprise-alimentaire-apres-jeune.js
  ✅ Imports Phases 1-2
  ❌ NotificationsPhase3 jamais importée
  ❌ RecettesPhase3Modal jamais importée
  ✅ State modalRecettes (Phase 1) + modalRecettesPhase2 (Phase 2)
  ❌ State modalRecettesPhase3 (manquant)
  ✅ Affichage conditionnel Phases 1-2
  ❌ Affichage conditionnel Phase 3 (inexistant)

Utilisateur expérience :
  ❌ J1-J4 (Phase 1) : Notifications affichées ✅
  ❌ J5-J7 (Phase 2) : Notifications affichées ✅
  ❌ J8-J10 (Phase 3) : ESPACE VIDE ❌ (TROU MAJEUR)
  ❌ J11+ (Phase 4) : À venir (en cours de fix)
```

#### Données Phase 3
- ✅ **12 aliments Phase 3** présents dans data/alimentsRepriseJeune.js (confirmé git)
- ✅ Aliments : Œuf mollet, Œuf poché, Avocat, Huile d'olive, Huile de coco, Fromage blanc 0%, Yaourt 0%, Beurre clarifié, Ghee, Amande, Noix macadamia, Graine de courge
- ✅ Catégories : Protéines (6), Lipides (5), Autre (1)
- ✅ Portions strictes documentées pour chaque aliment
- ✅ Conseilstextes associés (ex: "Bien cuit, mâcher lentement")

### APRÈS modification (prévision)

#### Structure prévue
```
components/
  ✅ NotificationsPhase1.js       (186 lignes, fonctionnel)
  ✅ NotificationsPhase2.js       (186 lignes, fonctionnel)
  🆕 NotificationsPhase3.js       (~190 lignes, création)
  ✅ RecettesPhase1Modal.js       (375 lignes, fonctionnel)
  ✅ RecettesPhase2Modal.js       (375 lignes, fonctionnel)
  🆕 RecettesPhase3Modal.js       (~300-350 lignes, création)

pages/reprise-alimentaire-apres-jeune.js
  ✅ Imports Phases 1-2
  🆕 Import NotificationsPhase3 (ajouté ligne ~6)
  🆕 Import RecettesPhase3Modal (ajouté ligne ~9)
  ✅ State modalRecettes (Phase 1) + modalRecettesPhase2 (Phase 2)
  🆕 State modalRecettesPhase3 (ajouté ligne ~212)
  ✅ Affichage conditionnel Phases 1-2
  🆕 Affichage conditionnel Phase 3 si phaseActuelle === 3 (ajouté ligne ~1815)

Utilisateur expérience (APRÈS) :
  ✅ J1-J4 (Phase 1) : Notifications affichées ✅
  ✅ J5-J7 (Phase 2) : Notifications affichées ✅
  ✅ J8-J10 (Phase 3) : Notifications affichées ✅ (TROU FERMÉ)
  ⏳ J11+ (Phase 4) : En cours de fix
```

#### Fonctionnalités ajoutées

##### 1️⃣ NotificationsPhase3.js
- Horaires : **8h / 11h / 13h / 16h / 19h** (same pattern Phases 1-2)
- Aliments correspondants :
  - 8h : Huile (olive ou coco)
  - 11h : Protéine (œuf ou fromage)
  - 13h : Repas équilibré (protéine + gras + légumes cuits)
  - 16h : Gras sain (avocat, amandes, noix)
  - 19h : Protéine + huile
- Message pédagogique : "Reconstruction tissulaire - Sortie progressive cétose"
- Bouton "📖 Voir recettes" fonctionnel
- Progression **J8→J9→J10** visible (portions augmentent doucement)

##### 2️⃣ RecettesPhase3Modal.js
- **Minimum 4 recettes prioritaires** :
  1. Œuf mollet (Cookeo 6 min vs Marmite 10 min à l'eau)
  2. Œuf poché (Cookeo programmé vs Marmite pot classique)
  3. Avocat mûr (Sélection/conservation vs Utilisation immédiate)
  4. Huile d'olive (Conservation/utilisation vs Dosage portions)
- Toggle Cookeo/Marmite pour chaque recette
- Portions conformes data (1 œuf moyen, 1/4 avocat, 0.5 CS huile, etc.)
- Conseils textuels intégrés (ex: "Mâcher lentement", "Bien mûr")

##### 3️⃣ Intégration dans reprise-alimentaire-apres-jeune.js
- **Affichage** : Automatique si `phaseActuelle === 3` (conditions J8-J10)
- **Modal** : Ouverture via bouton recettes, fermeture via bouton "Fermer"
- **State** : Gestion `modalRecettesPhase3` avec `useState`
- **Props** : Passage phase, jourNum, isActive, onRecettesClick

#### Changements détaillés

##### ⚙️ Initialisation (useState)
```javascript
// AVANT
const [modalRecettesPhase2, setModalRecettesPhase2] = useState({ isOpen: false, type: 'compote' });

// APRÈS
const [modalRecettesPhase2, setModalRecettesPhase2] = useState({ isOpen: false, type: 'compote' });
const [modalRecettesPhase3, setModalRecettesPhase3] = useState({ isOpen: false, type: 'oeufs' }); // 🆕
```

##### 📦 Imports (top de fichier)
```javascript
// AVANT (lignes 4-9)
import NotificationsPhase1 from '../components/NotificationsPhase1';
import NotificationsPhase2 from '../components/NotificationsPhase2';
import RecettesPhase1Modal from '../components/RecettesPhase1Modal';
import RecettesPhase2Modal from '../components/RecettesPhase2Modal';

// APRÈS
import NotificationsPhase1 from '../components/NotificationsPhase1';
import NotificationsPhase2 from '../components/NotificationsPhase2';
import NotificationsPhase3 from '../components/NotificationsPhase3'; // 🆕
import RecettesPhase1Modal from '../components/RecettesPhase1Modal';
import RecettesPhase2Modal from '../components/RecettesPhase2Modal';
import RecettesPhase3Modal from '../components/RecettesPhase3Modal'; // 🆕
```

##### 🎨 Rendu (JSX - notifications)
```javascript
// AVANT
{phaseActuelle === 2 && (
  <NotificationsPhase2 jourNum={jourReprise} onRecettesClick={(type) => setModalRecettesPhase2({ isOpen: true, type })} />
)}

// APRÈS (ajout après Phase 2)
{phaseActuelle === 2 && (
  <NotificationsPhase2 jourNum={jourReprise} onRecettesClick={(type) => setModalRecettesPhase2({ isOpen: true, type })} />
)}
{phaseActuelle === 3 && (
  <NotificationsPhase3 jourNum={jourReprise} onRecettesClick={(type) => setModalRecettesPhase3({ isOpen: true, type })} /> // 🆕
)}
```

##### 🎨 Rendu (JSX - modals)
```javascript
// AVANT
<RecettesPhase2Modal 
  isOpen={modalRecettesPhase2.isOpen}
  recetteType={modalRecettesPhase2.type}
  onClose={() => setModalRecettesPhase2({ isOpen: false, type: 'compote' })}
/>

// APRÈS (ajout après Phase 2 modal)
<RecettesPhase2Modal 
  isOpen={modalRecettesPhase2.isOpen}
  recetteType={modalRecettesPhase2.type}
  onClose={() => setModalRecettesPhase2({ isOpen: false, type: 'compote' })}
/>
<RecettesPhase3Modal 
  isOpen={modalRecettesPhase3.isOpen}
  recetteType={modalRecettesPhase3.type}
  onClose={() => setModalRecettesPhase3({ isOpen: false, type: 'oeufs' })} // 🆕
/>
```

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

- [ ] **Plan validé par l'utilisateur à la date** : ___/___/2025

---

## 📋 **RÉSUMÉ EXÉCUTIF**

### État actuel (CRITIQUE)
- ❌ Phase 3 (J8-J10) : **TROU COMPLET** dans l'interface
- ✅ Données aliments existent (12 aliments)
- ✅ Logique métier assigne phase 3 automatiquement
- ❌ UI n'affiche rien (régression majeure UX)

### Architecture validée
✅ Pattern éprouvé des Phases 1-2 s'applique directement

### Phase 3 — Objectif
Fermer le trou J8-J10 avec notifications protéines & lipides

### Fichiers à créer
1. `components/NotificationsPhase3.js` (copie architecture Phase 2)
2. `components/RecettesPhase3Modal.js` (copie architecture Phase 2)

### Fichiers à modifier
1. `pages/reprise-alimentaire-apres-jeune.js` (imports + state + rendu)

### Points clés
- 🔑 Copier architecture Phases 1-2 100% éprouvée
- 🔑 12 aliments Phase 3 déjà en données
- 🔑 Horaires : 8h/11h/13h/16h/19h (same pattern)
- 🔑 Minimum 4 recettes Cookeo/Marmite
- 🔑 **AUCUNE** régression Phases 1-2
- 🔑 Tests complets J8/J9/J10 spécifiquement
- 🔑 Risque très faible (architecture duplicate validée)

### Délai estimé
⏱️ **2-3 heures** implémentation + **1 heure** tests = **3-4 heures total**

### Après Phase 3
✅ **Seul** ensuite : Phase 4 (fix erreur ligne 1832 + tests)

---

## 🎯 **PRÊT POUR VALIDATION UTILISATEUR** ✅

**⚠️ AUCUNE MODIFICATION DE CODE NE SERA EFFECTUÉE AVANT VALIDATION EXPLICITE DE CE PLAN.**

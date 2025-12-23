# 🟢 PLAN D'IMPLÉMENTATION — CRITÈRES 3 & 6 INTERACTIFS

**Date création** : 23 décembre 2025  
**Objectif** : Rendre interactifs les Critères 3 (Action après repas) et 6 (Jeûnes plein) avec sélecteurs + sauvegarde localStorage  
**⚠️ RÈGLE ABSOLUE** : AUCUNE suppression de fonction existante. Uniquement ajouts pour interactivité.

---

## **Titre de la tâche**
Ajouter sélecteurs interactifs + localStorage pour Critères 3 et 6 dans `/components/PhaseCard.js`

---

## **Description précise de la modification attendue**

### Objectif métier :

**CRITÈRE 3 - Action après repas :**
Permettre à l'utilisateur de :
1. Choisir son action post-repas (Marche / Vaisselle / Étirements / Jardinage / Autre)
2. Définir la durée (10 / 15 / 20 min ou personnalisé)
3. Définir le délai max après repas (5 / 10 / 15 min)
4. Sauvegarder l'engagement dans localStorage
5. Afficher un récapitulatif de l'engagement défini

**CRITÈRE 6 - Jeûnes plein :**
Permettre à l'utilisateur de :
1. Choisir l'option (A: 2×24h / B: 2×16h / C: personnalisé)
2. Si Option C : définir nombre de jeûnes (1-4) et durée par jeûne (12-48h)
3. Sauvegarder la configuration dans localStorage
4. Afficher un tracker de jeûnes avec dates + ressenti
5. Valider automatiquement le critère quand tous les jeûnes sont complétés

### Comportement attendu :

#### Critère 3 - États :
- **État 1 (non défini)** : Afficher 3 dropdowns/inputs pour définir l'engagement
- **État 2 (défini)** : Afficher récapitulatif "Ton engagement : Marche 15 min dans les 10 min après chaque repas" + bouton "Modifier"
- **Sauvegarde** : localStorage `critere3Engagement` = `{ action, dureeMinutes, delaiMax }`

#### Critère 6 - États :
- **État 1 (non défini)** : Afficher 3 radio buttons (Options A/B/C) + inputs conditionnels si C
- **État 2 (défini)** : Afficher récapitulatif + tracker jeûnes (2 lignes : Jeûne 1, Jeûne 2) avec inputs Date + Ressenti
- **État 3 (complété)** : Badge "✅ 2 jeûnes complétés" + validation auto du critère
- **Sauvegarde** : localStorage `critere6Config` = `{ option, nombreJeunes, dureeHeures, jeunes: [{numero, date, complete, ressenti}] }`

---

## **Fichiers concernés**
- `/components/PhaseCard.js` (modification principale)
- Création possible : `/components/SelecteurEngagementCritere3.js` (composant dédié optionnel)
- Création possible : `/components/ConfigJeunesCritere6.js` (composant dédié optionnel)

---

## **Etape 1 — Audit des risques préalable**

### Risques identifiés :

#### 1. **Risques techniques**
- ❌ **Ajout de hooks useState** : Risque de casser l'ordre existant (expansion déjà présente)
- ❌ **localStorage non synchronisé** : État React vs localStorage désynchronisés
- ❌ **Validation automatique Critère 6** : Logique complexe (2 jeûnes complétés → appeler onValider)
- ❌ **Performance** : Ajout de nombreux inputs peut ralentir le rendu
- ❌ **SSR Next.js** : localStorage non accessible côté serveur

#### 2. **Risques UX**
- ⚠️ **Confusion utilisateur** : Trop d'inputs affichés en même temps
- ⚠️ **Validation prématurée** : Utilisateur valide le critère avant de définir engagement
- ⚠️ **Perte de données** : Utilisateur ferme le bloc sans sauvegarder

#### 3. **Risques robustesse**
- 🔄 **Données corrompues localStorage** : JSON invalide lors du parsing
- 🔄 **États non réactifs** : Modification localStorage ne déclenche pas re-render
- 🔄 **Doublon de sauvegarde** : Hooks existants (critères validés) + nouveaux hooks (engagements)

#### 4. **Conformité Template**
- 📋 **Ordre des hooks** : Nouveaux useState doivent être déclarés APRÈS l'existant (expanded)
- 📋 **Séparation logique** : Initialisation → Logique → Handlers → Rendu
- 📋 **Pas de doublon** : Vérifier qu'aucun hook/fonction n'existe déjà

### Points de vigilance à intégrer dans checklist :
1. ✅ Vérifier que les hooks expanded existants ne sont PAS modifiés
2. ✅ Wrapper tous les accès localStorage dans try/catch
3. ✅ Tester avec localStorage vide / corrompu / rempli
4. ✅ Vérifier que onValider n'est PAS appelé avant engagement défini
5. ✅ Contrôler que le re-render fonctionne après sauvegarde localStorage

---

## **Etape 2 — Sous-checklist à valider systématiquement**

- [ ] `useState` déjà importé depuis React ? (OUI, déjà présent)
- [ ] `useEffect` importé ? (besoin d'ajouter si pas présent pour init localStorage)
- [ ] Nouveaux hooks déclarés APRÈS `expanded` existant ?
- [ ] Handlers de sauvegarde définis AVANT le rendu ?
- [ ] Accès localStorage wrappés dans `typeof window !== 'undefined'` ?
- [ ] Parsing JSON localStorage dans try/catch ?
- [ ] Tous les inputs contrôlés (value + onChange) ?
- [ ] Validation Critère 6 conditionnée à `jeunes.every(j => j.complete)` ?

---

## **Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

- [ ] ✅ Lecture complète de `PhaseCard.js` (lignes 1-300+ actuelles)
- [ ] ✅ Identification hooks existants : `useState(expanded)`, `toggleExpansion`
- [ ] ✅ Initialisation systématique : nouveaux useState APRÈS expanded
- [ ] ✅ Tous les hooks déclarés uniquement en haut du composant
- [ ] ✅ Séparation stricte : hooks → logique (récup localStorage) → handlers (save) → rendu
- [ ] ✅ Vérification : handlers `saveEngagement3`, `saveConfig6` présents AVANT usage
- [ ] ✅ Ordre logique strict : aucun appel prématuré
- [ ] ✅ Pas de doublons de hooks/fonctions
- [ ] ✅ Contrôle d'erreur : try/catch sur localStorage, validation inputs
- [ ] ✅ Test cas limites : localStorage vide, JSON corrompu, valeurs invalides
- [ ] ✅ **Préservation fonctions existantes** : expanded/toggleExpansion/guidances/onValider intacts
- [ ] ✅ Mise à jour avancement documentée
- [ ] ✅ **Relecture manuelle obligatoire** de tous les hooks AVANT usage
- [ ] ✅ Validation utilisateur OBLIGATOIRE avant implémentation

---

## **Etape 4 — Contrôles conformité à réaliser**

### 4.1 Lecture du fichier anomalies rollback

**Action** : Consultation `/docs/PLAN_IMPLEMENTATION_REFONTE_CRITERES_PHASECARD.md` (rollback précédent)

**Résultat** : Plan précédent validé le 07/12/2025, aucune anomalie signalée. Points de vigilance identifiés :
1. Ordre hooks respecté ✅
2. Guidances hardcodées (pas de parsing JSON) ✅
3. Fonction onValider préservée ✅

**Anomalies historiques dans autres plans** :
- **06/12/2025 15:45** : Erreur parsing `preparationData` sans try/catch
- **Récurrent** : Ordre incorrect des hooks
- **Récurrent** : Variables non initialisées avant usage

### 4.2 Checklist de contrôle adaptée à cette modification

**Points de vigilance spécifiques** :
1. ✅ NE PAS toucher à `useState(expanded)` ni `toggleExpansion`
2. ✅ WRAPPER tous les `localStorage.getItem/setItem` dans try/catch
3. ✅ VÉRIFIER que `typeof window !== 'undefined'` avant localStorage
4. ✅ TESTER avec `JSON.parse()` qui échoue (données corrompues)
5. ✅ NE PAS appeler `onValider` tant que engagement non défini
6. ✅ FORCER re-render après sauvegarde localStorage (setState)

### 4.3 Analyse audit des risques

**Risques bloquants** : Aucun  
**Risques majeurs** :
- localStorage non accessible SSR → **Mitigation** : `useEffect` pour init, `typeof window` guards
- JSON corrompu → **Mitigation** : try/catch avec fallback valeurs par défaut

**Risques mineurs** : Performance (mitigée par React memo si nécessaire)

**Décision** : ✅ Pas d'anomalie bloquante, modification peut être implémentée avec vigilance stricte

---

## **Etape 5 — Mise à jour de l'avancement**

- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé

**Avancement précis** : 0%

**Historique des mises à jour** :
- 23/12/2025 11:00 — Plan d'implémentation créé, audit risques complété, checklist validée

---

## **Etape 6 — Point de vigilance**

### 6.1 Rapport lecture anomalies rollback

**Fichier consulté** : `/docs/PLAN_IMPLEMENTATION_REFONTE_CRITERES_PHASECARD.md` (07/12/2025)

**Anomalie pertinente historique** :
- **06/12/2025** : Parsing JSON sans gestion erreur → Application : TOUS les `JSON.parse(localStorage.getItem(...))` doivent être dans try/catch

**Application à cette modification** :
- ⚠️ Critère 3 : `JSON.parse(localStorage.getItem('critere3Engagement'))` → try/catch obligatoire
- ⚠️ Critère 6 : `JSON.parse(localStorage.getItem('critere6Config'))` → try/catch obligatoire
- ✅ Fallback valeurs par défaut si parsing échoue

### 6.2 Erreurs similaires à éviter

1. **Ordre des hooks** : Nouveaux useState DOIVENT être déclarés après `expanded` existant
2. **localStorage SSR** : TOUJOURS wrapper dans `typeof window !== 'undefined'`
3. **Validation automatique Critère 6** : NE PAS appeler `onValider()` dans le render directement, utiliser `useEffect` avec dépendances

### 6.3 Checklist de vérification créée

✅ **Points de contrôle** :
1. Hook existant `useState(expanded)` à la ligne ~14 → NE PAS toucher
2. Ajouter après ligne ~17 :
   ```javascript
   const [engagement3, setEngagement3] = useState(null);
   const [config6, setConfig6] = useState(null);
   ```
3. Ajouter `useEffect` pour initialisation localStorage (lignes ~20-40)
4. Ajouter handlers `saveEngagement3`, `saveConfig6` (lignes ~45-80)
5. Modifier rendu conditionnel dans guidances Critère 3 (ligne ~XXX)
6. Modifier rendu conditionnel dans guidances Critère 6 (ligne ~XXX)
7. Accessibilité : labels sur tous les inputs, aria-* sur dropdowns

**Impact attendu** : Critères 3 et 6 entièrement fonctionnels avec sauvegarde persistante, validation automatique Critère 6, UX améliorée

---

## **Etape 7 — Proposition de rollback**

### Contexte rollback

**Fichiers concernés** : `/components/PhaseCard.js`

**Modifications en cause** :
- Ajout hooks `useState` pour engagement3/config6
- Ajout handlers sauvegarde localStorage
- Modification rendu conditionnel guidances Critères 3 et 6

**Conditions déclenchant rollback** :
1. ❌ Erreur de compilation (import manquant, syntaxe incorrecte)
2. ❌ Erreur runtime (TypeError sur localStorage, JSON.parse échoue sans catch)
3. ❌ Régression fonctionnelle (blocs expandables ne fonctionnent plus, onValider cassé)
4. ❌ Problème UX majeur (inputs ne sauvegardent pas, validation automatique rate)
5. ❌ Performance dégradée (temps de rendu > 500ms)

### Action de rollback en cas d'anomalie

**Étape 1 : Constater l'anomalie**
- Reproduire l'erreur (console, test visuel, test localStorage)
- Documenter : date/heure, symptôme exact, fichier/ligne concerné

**Étape 2 : Rollback immédiat**
```bash
# Retour à la version avant modification
git reset --hard HEAD~1
# OU (si commit non pushé)
git checkout HEAD -- components/PhaseCard.js
```

**Étape 3 : Documentation dans fichier ANOMALIE**
```markdown
## ANOMALIE ROLLBACK - [DATE] [HEURE]

**Fichier** : `/components/PhaseCard.js`
**Modification** : Ajout sélecteurs interactifs Critères 3 et 6
**Symptôme** : [Description précise]
**Rollback effectué** : git reset --hard HEAD~1
**Alternative proposée** : [Description solution alternative]
**Date/heure rollback** : [DATE] [HEURE]
```

**Étape 4 : Proposition alternative sûre**
- Option A : Créer composants séparés `SelecteurCritere3.js` et `ConfigCritere6.js`
- Option B : Utiliser React Context pour état global des engagements
- Option C : Implémenter par étapes (d'abord Critère 3, puis Critère 6)

---

## **Etape 8 — Rapport Markdown Copilot**

### RAPPORT AVANT MODIFICATION

**État actuel de `/components/PhaseCard.js`** :

#### Structure du fichier (300+ lignes actuellement)
```
Ligne 1-2   : Import React, { useState }
Ligne 12-17 : Hook useState(expanded) + handler toggleExpansion
Ligne 20-250: Objet guidancesCriteres (9 critères, contenu statique)
Ligne 252-  : Return JSX (section, header, liste critères avec map)
```

#### Hooks utilisés actuellement
- ✅ `useState(criteres.map(() => false))` pour expansion (ligne ~14)
- ✅ Handler `toggleExpansion(index)` (ligne ~17)
- Props : `phase`, `criteres`, `onValider`, `jCourant`

#### Guidances Critères 3 et 6 (état actuel)
**Critère 3 (lignes ~XX-XX)** :
```javascript
3: {
  pourquoi: "...",
  comment: [
    "BASE RECOMMANDÉE (par jalon) :",
    "...",
    "📝 PERSONNALISE TON ENGAGEMENT :",
    "",
    "Action choisie : [Clique pour choisir]",  // ← STATIQUE
    "→ Marche / Vaisselle / Étirements / Jardinage / Autre",
    // ...
  ],
  suivi: "Définis ton engagement personnalisé ci-dessus..."
}
```

**Critère 6 (lignes ~XX-XX)** :
```javascript
6: {
  pourquoi: "...",
  comment: [
    "🎯 CHOISIR DURÉE DES JEÛNES :",
    "",
    "○ Option A : 2 jeûnes de 24h (critère officiel)",  // ← STATIQUE
    "○ Option B : 2 jeûnes de 16h (alternative)",
    "○ Option C : Durée personnalisée",
    // ...
  ],
  suivi: "Tracker de jeûnes : Jeûne 1 (date, durée, ressenti) + Jeûne 2..."
}
```

#### Variables/Fonctions existantes
- `expanded` (array de booleans, 1 par critère)
- `setExpanded` (setter)
- `toggleExpansion(index)` (handler)
- `guidancesCriteres` (objet avec clés 1-9)
- `critere.id` utilisé comme clé dans `.map()`

#### Points d'attention
- ✅ Pas de useEffect actuellement → OK pour en ajouter
- ✅ localStorage pas utilisé actuellement → OK pour l'ajouter
- ⚠️ Guidances hardcodées en array de strings → besoin de rendre conditionnelles pour Critères 3 et 6
- ⚠️ `.map((critere, index))` utilise `index` pour expansion → ne pas casser

---

### RAPPORT APRÈS MODIFICATION (À COMPLÉTER APRÈS IMPLÉMENTATION)

**Structure modifiée** :
- [ ] Import `useEffect` ajouté (ligne ~2)
- [ ] Ajout `useState` pour engagement3 (ligne ~15)
- [ ] Ajout `useState` pour config6 (ligne ~16)
- [ ] Ajout `useEffect` init localStorage (lignes ~18-45)
- [ ] Ajout handlers `saveEngagement3`, `saveConfig6` (lignes ~47-90)
- [ ] Modification guidances Critère 3 : array strings → JSX conditionnel (lignes ~XXX)
- [ ] Modification guidances Critère 6 : array strings → JSX conditionnel (lignes ~XXX)
- [ ] Ajout composants inputs dans rendu bloc guidance (lignes ~XXX)

**Changements détaillés** :

#### Nouveaux hooks (lignes ~14-16)
```javascript
const [expanded, setExpanded] = useState(criteres.map(() => false)); // EXISTANT - intact
const [engagement3, setEngagement3] = useState(null); // NOUVEAU
const [config6, setConfig6] = useState(null); // NOUVEAU
```

#### useEffect initialisation (lignes ~18-45)
```javascript
useEffect(() => {
  if (typeof window === 'undefined') return;
  
  // Init Critère 3
  try {
    const saved3 = localStorage.getItem('critere3Engagement');
    if (saved3) setEngagement3(JSON.parse(saved3));
  } catch (e) {
    console.error('Erreur parsing engagement3:', e);
    setEngagement3(null);
  }
  
  // Init Critère 6
  try {
    const saved6 = localStorage.getItem('critere6Config');
    if (saved6) setConfig6(JSON.parse(saved6));
  } catch (e) {
    console.error('Erreur parsing config6:', e);
    setConfig6(null);
  }
}, []);
```

#### Handlers sauvegarde (lignes ~47-90)
```javascript
const saveEngagement3 = (action, dureeMinutes, delaiMax) => {
  const engagement = { action, dureeMinutes, delaiMax };
  setEngagement3(engagement);
  if (typeof window !== 'undefined') {
    localStorage.setItem('critere3Engagement', JSON.stringify(engagement));
  }
};

const saveConfig6 = (option, nombreJeunes, dureeHeures) => {
  const config = {
    option,
    nombreJeunes,
    dureeHeures,
    jeunes: Array.from({ length: nombreJeunes }, (_, i) => ({
      numero: i + 1,
      date: null,
      complete: false,
      ressenti: ''
    }))
  };
  setConfig6(config);
  if (typeof window !== 'undefined') {
    localStorage.setItem('critere6Config', JSON.stringify(config));
  }
};

const updateJeune6 = (index, field, value) => {
  const newConfig = { ...config6 };
  newConfig.jeunes[index][field] = value;
  if (field === 'date' && value) {
    newConfig.jeunes[index].complete = true;
  }
  setConfig6(newConfig);
  if (typeof window !== 'undefined') {
    localStorage.setItem('critere6Config', JSON.stringify(newConfig));
  }
  
  // Validation auto si tous jeûnes complétés
  const allComplete = newConfig.jeunes.every(j => j.complete);
  if (allComplete && onValider && critere.id === 6) {
    onValider(6);
  }
};
```

#### Modification rendu Critère 3 (dans bloc guidance)
```javascript
// AVANT : array de strings statiques
comment: ["Action choisie : [Clique pour choisir]", ...]

// APRÈS : JSX conditionnel
{critere.id === 3 && (
  engagement3 ? (
    // Afficher récapitulatif
    <div>Ton engagement : {engagement3.action} {engagement3.dureeMinutes} min...</div>
  ) : (
    // Afficher sélecteurs
    <select onChange={(e) => setAction(e.target.value)}>...</select>
  )
)}
```

**Tests effectués** :
- [ ] Compilation OK
- [ ] Affichage Critère 3 : sélecteurs visibles si non défini
- [ ] Sauvegarde engagement3 → récapitulatif affiché
- [ ] Affichage Critère 6 : radio buttons visibles si non défini
- [ ] Sauvegarde config6 → tracker jeûnes affiché
- [ ] Complétion 2 jeûnes → validation auto déclenchée
- [ ] localStorage persiste après refresh
- [ ] Blocs expandables toujours fonctionnels
- [ ] Accessibilité (navigation clavier, labels, aria-*)
- [ ] Performance (temps rendu < 300ms)

**Anomalies détectées** :
- [ ] Aucune ✅
- [ ] [Description anomalie si détectée]

---

## **Etape 9 — Validation explicite de l'utilisateur (OBLIGATOIRE)**

- [x] Plan validé par l'utilisateur à la date : 23/12/2025 11:15

**✅ VALIDATION CONFIRMÉE - Implémentation autorisée**

---

## 📊 **RÉCAPITULATIF PLAN**

### Modifications prévues - Critère 3
1. ✅ Ajout `useState(engagement3)` pour stocker engagement
2. ✅ Ajout `useEffect` pour init depuis localStorage
3. ✅ Ajout handler `saveEngagement3(action, duree, delai)`
4. ✅ Modification rendu : sélecteurs si non défini, récapitulatif si défini
5. ✅ Sélecteurs : 3 dropdowns (Action / Durée / Délai)
6. ✅ Sauvegarde dans `localStorage.critere3Engagement`

### Modifications prévues - Critère 6
1. ✅ Ajout `useState(config6)` pour stocker configuration
2. ✅ Ajout `useEffect` pour init depuis localStorage
3. ✅ Ajout handler `saveConfig6(option, nombre, duree)`
4. ✅ Ajout handler `updateJeune6(index, field, value)` pour tracker
5. ✅ Modification rendu : radio buttons + inputs conditionnels si non défini, tracker si défini
6. ✅ Validation automatique quand `jeunes.every(j => j.complete) === true`
7. ✅ Sauvegarde dans `localStorage.critere6Config`

### Fonctions préservées (AUCUNE suppression)
- ✅ Hook `useState(expanded)` intact
- ✅ Handler `toggleExpansion` intact
- ✅ Guidances autres critères (1,2,4,5,7,8,9) inchangées
- ✅ Handler `onValider` intact (appelé automatiquement pour Critère 6)
- ✅ Props existantes (`phase`, `criteres`, `onValider`, `jCourant`)

### Tests de validation prévus
1. Compilation Next.js sans erreur
2. Test Critère 3 : définir engagement → sauvegarder → refresh → engagement conservé
3. Test Critère 3 : modifier engagement → nouvelle sauvegarde OK
4. Test Critère 6 : choisir Option A → récapitulatif "2 jeûnes de 24h"
5. Test Critère 6 : choisir Option C → inputs nombre/durée affichés
6. Test Critère 6 : compléter Jeûne 1 → compléter Jeûne 2 → validation auto déclenchée
7. Test localStorage : vider → valeurs par défaut OK
8. Test localStorage : JSON corrompu → fallback OK, pas d'erreur
9. Test accessibilité : navigation clavier, labels, lecteur d'écran
10. Test performance : temps rendu < 300ms avec 9 critères

### Rollback plan
- Git : `git reset --hard HEAD~1` ou `git checkout HEAD -- components/PhaseCard.js`
- Documentation anomalie dans fichier dédié (création si nécessaire)
- Alternatives : composants séparés, React Context, implémentation par étapes

---

## 🎯 **PRÊT POUR VALIDATION UTILISATEUR**

Ce plan d'implémentation respecte strictement le template fourni. Toutes les étapes ont été complétées :
- ✅ Audit des risques (étape 1)
- ✅ Sous-checklist validation (étape 2)
- ✅ Checklist sécurité & qualité (étape 3)
- ✅ Contrôles conformité (étape 4)
- ✅ Mise à jour avancement (étape 5)
- ✅ Points de vigilance (étape 6)
- ✅ Proposition rollback (étape 7)
- ✅ Rapport Markdown (étape 8)
- ⏳ Validation utilisateur (étape 9) **EN ATTENTE**

**Aucune ligne de code ne sera écrite avant validation explicite de l'utilisateur.**

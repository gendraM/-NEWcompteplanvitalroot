# 🟢 PLAN D'IMPLÉMENTATION — REFONTE CRITÈRES PHASECARD

**Date création** : 7 décembre 2025  
**Objectif** : Ajouter bloc "En savoir plus" expandable dans PhaseCard.js pour afficher guidances POURQUOI/COMMENT/SUIVI des 9 critères selon document REFONTE_CRITERES_PREPARATION_JEUNE.md  
**⚠️ RÈGLE ABSOLUE** : AUCUNE suppression de fonction existante validée qui fonctionne. Uniquement ajouts et mises à jour pour correspondre à la refonte.

---

## **Titre de la tâche**
Enrichir `/components/PhaseCard.js` pour intégrer blocs expandables "En savoir plus" avec guidances pédagogiques (POURQUOI/COMMENT/SUIVI)

---

## **Description précise de la modification attendue**

### Objectif métier :
Permettre à l'utilisateur de cliquer sur "En savoir plus" sous chaque critère pour voir :
- 🧭 **POURQUOI** : Explication pédagogique claire du critère
- 🛠️ **COMMENT FAIRE** : Actions concrètes avec repères visuels
- 📊 **SUIVI QUOTIDIEN** : Exemple de tracker quotidien (Oui/Non par jour)

### Comportement attendu :
1. **Vue compacte par défaut** : Affichage actuel conservé (titre, conseil, statut, bouton Valider)
2. **Clic "En savoir plus"** : Expansion du bloc avec 3 sections (POURQUOI/COMMENT/SUIVI)
3. **Clic "Replier"** : Retour à la vue compacte
4. **État indépendant** : Chaque critère peut être ouvert/fermé individuellement
5. **Préservation totale** : Toutes les fonctions existantes (validation, calcul statut, couleurs badges) restent inchangées

### Source de données :
- Document `/docs/REFONTE_CRITERES_PREPARATION_JEUNE.md` (9 critères complets avec structures POURQUOI/COMMENT/SUIVI)
- Mapping ID critère → contenu guidance à intégrer dans le composant

---

## **Fichiers concernés**
- `/components/PhaseCard.js` (modification principale)
- `/docs/REFONTE_CRITERES_PREPARATION_JEUNE.md` (référence pour contenu guidance)
- Éventuellement : création d'un fichier `/data/guidancesCriteres.js` pour externaliser le contenu

---

## **Etape 1 — Audit des risques préalable**

### Risques identifiés :

#### 1. **Risques techniques**
- ❌ **Régression sur calcul statut dynamique** : Modification accidentelle de la logique `jCourant`, `jalon`, `fenetre`, `statut`, `couleurStatut`
- ❌ **Perte de fonction validation** : Suppression ou modification accidentelle du handler `onValider`
- ❌ **Erreur React Hooks** : Ajout de `useState` dans mauvais ordre ou dans boucle/condition
- ❌ **Performance** : Contenu guidance trop volumineux ralentit le rendu si non optimisé

#### 2. **Risques UX**
- ⚠️ **Confusion utilisateur** : Bloc expandable pas assez visible ou mal placé
- ⚠️ **Lisibilité** : Texte trop dense dans les blocs POURQUOI/COMMENT/SUIVI
- ⚠️ **Accessibilité** : Pas de `aria-expanded`, `aria-controls` pour lecteurs d'écran

#### 3. **Risques robustesse**
- 🔄 **État non synchronisé** : État d'expansion (ouvert/fermé) perdu lors du rendu
- 🔄 **Mapping ID incorrect** : Critère ID ne correspond pas au bon contenu guidance
- 🔄 **Contenu manquant** : Guidance non définie pour certains critères

#### 4. **Conformité Template**
- 📋 **Ordre des hooks** : `useState` pour expansion doit être déclaré en haut du composant
- 📋 **Séparation logique** : Initialisation → Logique → Handlers → Rendu
- 📋 **Pas de doublon** : Vérifier qu'aucun hook ou fonction n'est déclaré deux fois

### Points de vigilance à intégrer dans checklist :
1. ✅ Vérifier que TOUTES les fonctions existantes (validation, calcul statut) restent présentes
2. ✅ Tester le clic "En savoir plus" sur chaque critère (9 au total)
3. ✅ Vérifier accessibilité (navigation clavier, lecteurs d'écran)
4. ✅ Contrôler performance (temps de rendu avec 9 critères + guidances)
5. ✅ Vérifier mapping ID critère → guidance (aucun décalage)

---

## **Etape 2 — Sous-checklist à valider systématiquement**

- [ ] `useState` importé depuis React ?
- [ ] `useState` pour état d'expansion déclaré en haut du composant (pas dans boucle/map/if) ?
- [ ] Toutes les props existantes (`phase`, `criteres`, `onValider`, `jCourant`) toujours présentes ?
- [ ] Handler `onValider` toujours fonctionnel après modification ?
- [ ] Logique de calcul `statut`/`couleurStatut`/`actionPossible` inchangée ?
- [ ] Mapping des guidances vérifié pour chaque ID critère (1 à 9) ?
- [ ] Accessibilité : `aria-expanded`, `aria-controls`, `role="button"` ajoutés ?
- [ ] Test visuel : vue compacte → clic "En savoir plus" → vue détaillée → clic "Replier" → vue compacte ?

---

## **Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

- [ ] ✅ Lecture complète du code existant de `PhaseCard.js` (136 lignes)
- [ ] ✅ Lecture complète du document `REFONTE_CRITERES_PREPARATION_JEUNE.md` (1000+ lignes, 9 critères)
- [ ] ✅ Initialisation systématique avant usage : `useState` pour expansion en haut du composant
- [ ] ✅ Tous les hooks React déclarés uniquement en haut du corps du composant fonctionnel
- [ ] ✅ Séparation stricte : initialisation (hooks) → logique (mapping guidance) → handlers (toggle) → rendu
- [ ] ✅ Vérification : handler `toggleExpansion` présent et initialisé AVANT usage dans rendu
- [ ] ✅ Ordre et portée logiques stricts : aucun appel prématuré
- [ ] ✅ Pas de doublons ni de déclarations superflues
- [ ] ✅ Contrôle d'erreur systématique : compilation, runtime, rendu, accessibilité
- [ ] ✅ Test du rendu sur tous les cas : 9 critères, tous statuts (À VENIR, EN COURS, ACTIF, VERROUILLÉ, VALIDÉ)
- [ ] ✅ **Préservation stricte des fonctionnalités existantes** : AUCUNE suppression destructrice
- [ ] ✅ Mise à jour précise et justifiée du pourcentage d'avancement
- [ ] ✅ **Relecture manuelle obligatoire** des déclarations de tous les hooks/variables AVANT chaque utilisation
- [ ] ✅ Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] ✅ Toutes les cases ci-dessus cochées et documentées avant de poursuivre

---

## **Etape 4 — Contrôles conformité à réaliser**

### 4.1 Lecture du fichier anomalies rollback

**Action** : Recherche fichier `Anomalie rollback` ou équivalent dans `/docs`

**Résultat** : Aucun fichier `Anomalie rollback` trouvé dans le workspace. Références trouvées dans :
- `/docs/Template.md` (instructions génériques)
- `/docs/PLAN_IMPLEMENTATION_VERROUILLAGE_CRITERES_PREPARATION.md` (plan précédent avec rollback 06/12/2025)

**Anomalies identifiées dans plans précédents** :
1. **06/12/2025 15:45** : Erreur sur lecture `preparationData` dans `preparation-jeune.js` → Rollback effectué
2. **Récurrent** : Ordre incorrect des hooks (useState dans boucle, useEffect mal placé)
3. **Récurrent** : Double déclaration de useEffect
4. **Récurrent** : Variables non initialisées avant usage

### 4.2 Checklist de contrôle adaptée à cette modification

**Points de vigilance spécifiques** :
1. ✅ Ne PAS modifier l'ordre des hooks existants dans `PhaseCard.js` (aucun hook actuellement, ajout de `useState` OK)
2. ✅ Ne PAS toucher à la logique de calcul `statut`/`couleurStatut`/`actionPossible` (lignes 46-66)
3. ✅ Ne PAS modifier le handler `onValider` ni son appel (ligne 121)
4. ✅ Vérifier que le mapping guidance ne casse pas le rendu si ID manquant
5. ✅ Tester avec `jCourant = null` (cas où date jeûne non définie)

### 4.3 Analyse audit des risques

**Risques bloquants** : Aucun  
**Risques majeurs** : Régression sur fonction validation (probabilité faible si tests complets)  
**Risques mineurs** : Performance si guidances trop volumineuses (mitigation : lazy loading si besoin)

**Décision** : ✅ Pas d'anomalie bloquante, modification peut être implémentée avec vigilance stricte sur checklist

---

## **Etape 5 — Mise à jour de l'avancement**

- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé

**Avancement précis** : 0%

**Historique des mises à jour** :
- 07/12/2025 17:00 — Plan d'implémentation créé, audit des risques complété, checklist validée

---

## **Etape 6 — Point de vigilance**

### 6.1 Rapport lecture anomalies rollback

**Fichier consulté** : `/docs/PLAN_IMPLEMENTATION_VERROUILLAGE_CRITERES_PREPARATION.md` (rollback 06/12/2025)

**Anomalie pertinente** :
- **06/12/2025 15:45** : Erreur lecture `preparationData` dans `preparation-jeune.js`
- **Cause** : Parsing JSON sans gestion d'erreur
- **Leçon** : Toujours wrapper `JSON.parse()` dans try/catch

**Application à cette modification** :
- ⚠️ Si guidances stockées dans fichier JSON externe → ajouter try/catch
- ✅ Dans notre cas : guidances hardcodées dans objet JS → pas de risque parsing

### 6.2 Erreurs similaires à éviter

1. **Ordre des hooks** : useState doit être en haut du composant, pas dans le `.map()` des critères
2. **État non synchronisé** : État d'expansion doit être un tableau `[false, false, ...]` (1 par critère)
3. **Mapping ID** : Vérifier correspondance stricte ID critère (1-9) ↔ index guidance

### 6.3 Checklist de vérification créée

✅ **Points de contrôle** :
1. useState déclaré en haut de PhaseCard (ligne ~14)
2. Initialisation : `const [expanded, setExpanded] = useState(criteres.map(() => false))`
3. Handler toggle : `const toggleExpansion = (index) => { setExpanded(prev => prev.map((v, i) => i === index ? !v : v)) }`
4. Dans le `.map(critere, index)` : utiliser `expanded[index]` pour conditionner affichage
5. Bouton "En savoir plus" : `onClick={() => toggleExpansion(index)}`
6. Accessibilité : `aria-expanded={expanded[index]}`, `aria-controls={`guidance-${critere.id}`}`

**Impact attendu** : Ajout fonctionnel sans régression, amélioration UX significative (guidances pédagogiques visibles)

---

## **Etape 7 — Proposition de rollback**

### Contexte rollback

**Fichier concerné** : `/components/PhaseCard.js`

**Modification en cause** : Ajout de `useState` pour état d'expansion + blocs conditionnels guidances

**Conditions déclenchant rollback** :
1. ❌ Erreur de compilation (import manquant, syntaxe incorrecte)
2. ❌ Erreur runtime (TypeError sur `expanded[index]`, mapping undefined)
3. ❌ Régression fonctionnelle (bouton "Valider" ne fonctionne plus)
4. ❌ Problème UX majeur (blocs ne s'ouvrent/ferment pas, contenu illisible)

### Action de rollback en cas d'anomalie

**Étape 1 : Constater l'anomalie**
- Reproduire l'erreur (console, test visuel)
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
**Modification** : Ajout bloc expandable guidances
**Symptôme** : [Description précise]
**Rollback effectué** : git reset --hard HEAD~1
**Alternative proposée** : [Description solution alternative]
**Date/heure rollback** : [DATE] [HEURE]
```

**Étape 4 : Proposition alternative sûre**
- Option A : Externaliser guidances dans composant séparé `<GuidanceCritere />`
- Option B : Créer page dédiée `/criteres/[id]` avec guidances détaillées
- Option C : Afficher guidances dans modal au lieu de bloc inline

---

## **Etape 8 — Rapport Markdown Copilot**

### RAPPORT AVANT MODIFICATION

**État actuel de `/components/PhaseCard.js`** :

#### Structure du fichier (136 lignes)
```
Ligne 1-2   : Import React
Ligne 4-10  : JSDoc commentaire (props documentation)
Ligne 11    : Export fonction PhaseCard
Ligne 12    : Début du return (JSX)
Ligne 13-30 : Section header (titre phase, explication, période)
Ligne 31-136: Liste des critères avec map()
```

#### Hooks utilisés
- ❌ **Aucun hook** actuellement (composant purement fonctionnel stateless)
- Props : `phase`, `criteres`, `onValider`, `jCourant`

#### Logique métier
**Calcul du statut (lignes 46-66)** :
```javascript
const jalon = critere.jalon * -1;
let statut = 'À VENIR';
let couleurStatut = '#A0AEC0';
let actionPossible = false;

if (jCourant !== null && jCourant !== undefined) {
  if (jCourant < jalon) {
    statut = 'À VENIR';
  } else {
    const fenetre = 
      jalon === -30 ? -18 : 
      [-17, -14, -12].includes(jalon) ? -8 : 
      jalon === -7 ? 0 : jalon;
    
    if (jCourant >= jalon && jCourant <= fenetre) {
      statut = jCourant === jalon ? 'EN COURS' : 'ACTIF';
      couleurStatut = '#43D9A3';
      actionPossible = true;
    } else {
      statut = 'VERROUILLÉ';
      couleurStatut = '#FF6B6B';
    }
  }
}
```

**Affichage conditionnel (lignes 100-131)** :
- Si `critere.valide` → Badge "✅ Validé le [date]"
- Sinon si `statut === 'VERROUILLÉ'` → Message "🔒 Ce critère devait démarrer..."
- Sinon si `onValider && actionPossible` → Bouton "Valider ce critère"

#### Variables utilisées
- `phase` (prop) : objet `{ nom, explication, periode }`
- `criteres` (prop) : array d'objets `{ id, titre, conseil, jalon, valide, dateValidation }`
- `onValider` (prop) : fonction callback pour validation
- `jCourant` (prop) : nombre (ex: -25, -17, -10)
- `critere` (scope map) : élément courant du tableau criteres
- `jalon`, `statut`, `couleurStatut`, `actionPossible` : variables calculées

#### Fonctions appelées
- ❌ Aucune fonction externe appelée
- `.map()` sur `criteres` (ligne 33)
- `new Date(critere.dateValidation).toLocaleDateString('fr-FR')` (ligne 101)

#### Points d'attention
- ✅ Pas de hook existant → ajout de useState OK
- ✅ Logique statut isolée → modification risque faible si non touchée
- ⚠️ `.map(critere)` sans `index` → besoin d'ajouter `index` pour gérer expansion

---

### RAPPORT APRÈS MODIFICATION (À COMPLÉTER APRÈS IMPLÉMENTATION)

**Structure modifiée** :
- [ ] Import useState ajouté (ligne ~2)
- [ ] Ajout useState expansion (ligne ~12)
- [ ] Ajout handler toggleExpansion (ligne ~14)
- [ ] Ajout objet guidancesCriteres (ligne ~20-500)
- [ ] Modification `.map((critere, index))` (ligne ~33)
- [ ] Ajout bloc conditionnel guidances (ligne ~110-200)
- [ ] Ajout bouton "En savoir plus" / "Replier" (ligne ~115)

**Changements détaillés** :
- Initialisation : `const [expanded, setExpanded] = useState(criteres.map(() => false))`
- Handler : `const toggleExpansion = (index) => { ... }`
- Guidances : objet avec clés 1-9 (ID critères) contenant `{ pourquoi, comment, suivi }`
- Rendu conditionnel : `{expanded[index] && (<div>...</div>)}`

**Tests effectués** :
- [ ] Compilation OK
- [ ] Affichage vue compacte OK
- [ ] Clic "En savoir plus" → expansion OK
- [ ] Clic "Replier" → réduction OK
- [ ] Bouton "Valider" toujours fonctionnel
- [ ] Statuts dynamiques toujours corrects
- [ ] Accessibilité (navigation clavier, aria-*)
- [ ] Performance (temps rendu < 100ms)

**Anomalies détectées** :
- [ ] Aucune ✅
- [ ] [Description anomalie si détectée]

---

## **Etape 9 — Validation explicite de l'utilisateur (OBLIGATOIRE)**

- [x] Plan validé par l'utilisateur à la date : 07/12/2025 17:15

**✅ VALIDATION CONFIRMÉE - Implémentation autorisée**

---

## 📊 **RÉCAPITULATIF PLAN**

### Modifications prévues
1. ✅ Ajout `useState` pour état d'expansion (1 par critère)
2. ✅ Ajout handler `toggleExpansion`
3. ✅ Création objet `guidancesCriteres` avec contenu POURQUOI/COMMENT/SUIVI (9 critères)
4. ✅ Modification `.map()` pour inclure `index`
5. ✅ Ajout bouton "En savoir plus" / "Replier"
6. ✅ Ajout bloc conditionnel avec guidances
7. ✅ Ajout attributs accessibilité (`aria-expanded`, `aria-controls`)

### Fonctions préservées (AUCUNE suppression)
- ✅ Calcul statut dynamique (lignes 46-66)
- ✅ Affichage conditionnel selon statut (lignes 100-131)
- ✅ Handler `onValider` (ligne 121)
- ✅ Props existantes (`phase`, `criteres`, `onValider`, `jCourant`)

### Tests de validation prévus
1. Compilation Next.js sans erreur
2. Test visuel : 9 critères affichés correctement
3. Test interaction : clic sur chaque "En savoir plus" → guidances visibles
4. Test interaction : clic "Replier" → retour vue compacte
5. Test fonctionnel : bouton "Valider" toujours opérationnel
6. Test accessibilité : navigation clavier + lecteur d'écran
7. Test performance : temps rendu page < 500ms
8. Test tous statuts : À VENIR, EN COURS, ACTIF, VERROUILLÉ, VALIDÉ

### Rollback plan
- Git : `git reset --hard HEAD~1` ou `git checkout HEAD -- components/PhaseCard.js`
- Documentation anomalie dans fichier dédié (création si nécessaire)
- Alternatives : composant séparé, modal, page dédiée

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

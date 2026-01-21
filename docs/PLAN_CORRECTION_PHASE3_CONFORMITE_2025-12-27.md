# 🟢 PLAN D'IMPLÉMENTATION — CORRECTION PHASE 3 CONFORMITÉ AU RÉFÉRENTIEL

**Date créée : 27 décembre 2025**  
**Date validation : 27 décembre 2025 ✅**  
**Statut : PRÊT POUR IMPLÉMENTATION IMMÉDIATE**

⚠️ **AUCUNE modification de code ne sera produite tant que ce plan n'est pas validé explicitement par l'utilisateur.**

---

## **Titre de la tâche**
Corriger Phase 3 : Supprimer les recettes non-autorisées et implémenter UNIQUEMENT les 4 recettes officielles du référentiel

---

## **Description précise de la modification attendue**

### Problème identifié
J'ai créé `RecettesPhase3Modal.js` avec **5 types de recettes non-autorisées** :
- ❌ Œufs (recette Cookeo/Marmite)
- ❌ Avocat
- ❌ Huiles (olive, coco, beurre clarifié)
- ❌ Fromage blanc / Yaourt
- ❌ Poisson (saumon, sardines, thon)

### Référentiel officiel (document "Phase de reprise alimentaire après jeûne.md")
Phase 3 doit contenir **UNIQUEMENT 4 recettes Cookeo/Marmite** :

1. **Soupe de lentilles corail** (protéine végétale)
   - Ingrédients : 80g lentilles corail, carotte, courgette, 600ml eau, laurier
   - Cookeo : 10 min sous pression
   - Marmite : 20 min à feu moyen

2. **Légumes vapeur** (carotte, courgette, haricots verts)
   - Ingrédients : Mélange frais ou congelé, eau
   - Cookeo : 8 min vapeur
   - Marmite : 15-20 min vapeur

3. **Riz basmati hyper-digestible**
   - Ingrédients : 1 verre riz + 1,5 verre eau (Cookeo) / 2 verres eau (Marmite)
   - Cookeo : 6 min sous pression
   - Marmite : 12 min couvercle fermé

4. **Bouillon de poulet dégraissé** (seule protéine animale autorisée)
   - Ingrédients : Cuisses/carcasse poulet, carotte, céleri, oignon, 3L eau, laurier
   - Cookeo : 30 min sous pression + filtrage + dégraissage
   - Marmite : 1h30 feu doux + filtrage + dégraissage

### Modifications à effectuer

**SUPPRESSION :**
- ❌ Supprimer type de recette : `oeufs`
- ❌ Supprimer type de recette : `avocat`
- ❌ Supprimer type de recette : `huiles`
- ❌ Supprimer type de recette : `fromageblancyaourt`
- ❌ Supprimer type de recette : `poisson`

**AJOUT :**
- ✅ Ajouter type de recette : `lentilles` (soupe de lentilles corail)
- ✅ Ajouter type de recette : `legumes` (légumes vapeur)
- ✅ Ajouter type de recette : `riz` (riz basmati)
- ✅ Ajouter type de recette : `bouillon` (bouillon de poulet)

**MISE À JOUR EN PAGE :**
- Ligne 1755-1787 : Adapter détection des aliments Phase 3
- Changer de : "Œuf", "Avocat", "Huile", "Fromage blanc", "Yaourt", "Poisson", "Saumon", "Sardine", "Thon"
- Changer vers : "Lentilles corail", "Légumes", "Carotte", "Courgette", "Haricots", "Riz", "Bouillon"

---

## **Fichiers concernés**

1. `/components/RecettesPhase3Modal.js` — ❌ Complètement à refondre
2. `/pages/reprise-alimentaire-apres-jeune.js` — ✏️ À adapter (détection aliments Phase 3)
3. `/components/NotificationsPhase3.js` — ⚠️ À vérifier (contient mentions d'aliments non-autorisés)
4. `/data/alimentsRepriseJeune.js` — ⚠️ À vérifier (phase 3 liste 12 aliments vs 4 recettes officielles)

---

## **Audit des risques préalable**

### Risques techniques
1. **Régression sur Phase 3** : Suppression de code peut casser l'affichage modale si pas de fallback
2. **État React désynchronisé** : Si `setModalRecettesPhase3` reçoit type inexistant → erreur rendu
3. **Doublon/conflit détection** : Aliments "Lentilles" présents dans alimentsRepriseJeune.js Phase 3 ?
4. **Hook mal placé** : Vérifier que useState/useEffect sont en haut du composant (règles React)

### Risques métier
1. **Incohérence données** : alimentsRepriseJeune.js déclare 12 aliments Phase 3, mais recettes n'en couvrent que 4
2. **Portée aliments** : Certains aliments (Œufs, Avocat, Poisson, Yaourt, Fromage) ne peuvent PAS avoir de recettes Cookeo/Marmite en Phase 3
3. **Conflit avec NotificationsPhase3.js** : Si notifications affichent "Œuf" ou "Avocat" à 16h, c'est contradictoire avec recettes supprimées

### Risques UX
1. **Bouton recettes disparaît** : Si utilisateur clique sur aliment sans recette → erreur silencieuse
2. **État modal coincé** : Pas de fallback si recetteType invalide

### Points de vigilance détectés
- ⚠️ Hook useState/useEffect déclarés en haut du composant ? OUI (vérifier syntaxe)
- ⚠️ Toutes les clés d'objet `recettes` utilisées réellement dans le code ? NON — suppression requise
- ⚠️ Pas de code mort ou de références à types supprimés ? À vérifier après modification

---

## **Sous-checklist à valider systématiquement**

### Import/Dépendances
- [ ] `useState` importé en haut du fichier ?
- [ ] Pas de hook déclaré dans boucle/condition/fonction ?
- [ ] Pas d'appel à `setMethodPreferee` en dehors du corps du composant ?

### Structure RecettesPhase3Modal.js
- [ ] Objet `recettes` contient UNIQUEMENT 4 clés : `lentilles`, `legumes`, `riz`, `bouillon`
- [ ] Chaque clé a properties : `nom`, `duree`, `ingredients`, `cookeo` (objet etapes), `marmite` (objet etapes)
- [ ] Pas de clés orphelines ou non-utilisées
- [ ] `recetteActuelle` affecté correctement : `recettes[recetteType] || recettes.lentilles`

### Détection aliments page
- [ ] Condition `modalAliments === 3` cherche UNIQUEMENT aliments Phase 3 officiels
- [ ] Aliments détectés : "Lentilles corail", "Légumes", "Carotte", "Courgette", "Haricots", "Riz", "Bouillon"
- [ ] Pas de mention de "Œuf", "Avocat", "Huile", "Fromage", "Yaourt", "Poisson"
- [ ] Chaque aliment mappe vers le type de recette correct
  - "Lentilles corail" → `recetteType = 'lentilles'`
  - "Carotte"/"Courgette"/"Haricots" → `recetteType = 'legumes'`
  - "Riz" → `recetteType = 'riz'`
  - "Bouillon" → `recetteType = 'bouillon'`

### NotificationsPhase3.js
- [ ] Horaires Phase 3 affichent UNIQUEMENT aliments autorisés
- [ ] PAS de mention "Avocat", "Huile", "Fromage", "Yaourt", "Poisson"
- [ ] Messages cohérents avec recettes disponibles

---

## **Checklist stricte sécurité & qualité**

- [ ] Lecture complète du `RecettesPhase3Modal.js` actuel (identifie types à supprimer)
- [ ] Lecture complète de `/pages/reprise-alimentaire-apres-jeune.js` lignes 1755-1787
- [ ] Lecture complète de `/components/NotificationsPhase3.js` (vérif aliments mentionnés)
- [ ] Tous les hooks React déclarés EN HAUT du corps du composant, jamais dans boucle/if/fonction
- [ ] Pas de `useState` appelé après du rendu ou après des conditions
- [ ] Pas de `useEffect` avec dépendances manquantes ou incohérentes
- [ ] Initialisation stricte : `recetteActuelle = recettes[recetteType] || recettes.lentilles`
- [ ] Pas de référence à types supprimés dans le code de rendu (ex : `recettes.avocat` ❌)
- [ ] Vérification : chaque type de recette dans `recettes` est effectivement utilisable
- [ ] Zéro suppression de code sans documentation dans le plan
- [ ] Test du rendu sur tous les 4 types de recettes (lentilles, legumes, riz, bouillon)
- [ ] Vérification compilation complète (aucune erreur TypeScript/JSX)
- [ ] Test sur navigateur : modal s'ouvre/ferme sans erreur
- [ ] Test : clic bouton recette affiche le bon type
- [ ] Rapport AVANT/APRÈS généré et validé

---

## **Contrôles conformité à réaliser**

### 1. Vérification référentiel
- [ ] Document "Phase de reprise alimentaire après jeûne.md" lu ligne par ligne
- [ ] 4 recettes UNIQUEMENT identifiées et documentées
- [ ] Ingrédients et étapes Cookeo/Marmite de chaque recette extraits exactement

### 2. Audit détection aliments
- [ ] Tous les aliments Phase 3 dans `alimentsRepriseJeune.js` identifiés (12 aliments déclarés `phase: 3`)
- [ ] Vérification : lesquels ont recettes officielles ? → UNIQUEMENT 4
- [ ] Vérification : lesquels n'ont PAS de recette ? → Ne PAS ajouter bouton recette pour eux

### 3. Test compilation
- [ ] `npm run build` passe sans erreur
- [ ] Pas de warning ESLint sur hooks React
- [ ] Pas d'erreur TypeScript

### 4. Test fonctionnel
- [ ] Page `/reprise-alimentaire-apres-jeune` affiche Phase 3
- [ ] Clic "Voir aliments" Phase 3 → modale liste les aliments
- [ ] Clic bouton recette → modale recette s'ouvre avec BON type
- [ ] Toggle Cookeo/Marmite fonctionne
- [ ] Fermeture modale fonctionne

### 5. Vérification non-régression
- [ ] Phase 1 recettes inchangées
- [ ] Phase 2 recettes inchangées
- [ ] Phase 4 recettes inchangées
- [ ] NotificationsPhase1 inchangées
- [ ] NotificationsPhase2 inchangées

---

## **Étape 1 — Audit des risques détaillé**

### Risque critique #1 : Type de recette inexistant
**Impact** : Si utilisateur clique bouton recette Phase 3 pour "Œuf", cherche type 'oeufs', ne le trouve pas dans objet recettes → `recetteActuelle = undefined` → erreur rendu

**Mitigation** : 
- Avant suppression : vérifier qu'AUCUN aliment Phase 3 n'a recette Cookeo/Marmite autre que les 4 officielles
- Après suppression : fallback à 'lentilles' pour toute recetteType invalide

### Risque critique #2 : Hook useState mal déclaré
**Impact** : Si hook déclaré dans une condition ou boucle → erreur React "Rules of Hooks violated"

**Mitigation** :
- Relire ligne 1-20 du fichier RecettesPhase3Modal.js
- Vérifier `useState` EN HAUT du body, jamais après

### Risque critique #3 : Doublon dans alimentsRepriseJeune.js
**Impact** : Si alimentsRepriseJeune.js Phase 3 contient "Lentilles corail" mais aussi "Lentilles vertes" → détection peut matcher mauvais aliment

**Mitigation** :
- Vérifier exact nom aliment : "Lentilles corail" vs variantes
- Adapter condition détection précisément

### Risque métier #4 : Incohérence Notifications vs Recettes
**Impact** : Si NotificationsPhase3 affiche "Avocat 16h" mais recette avocat supprimée → utilisateur clique bouton recette → erreur

**Mitigation** :
- Audit complet NotificationsPhase3.js
- SI notifications mentionnent "Avocat/Huile/Poisson/Fromage/Yaourt" → PROBLÈME BLOQUANT
- À résoudre AVANT suppression recettes

---

## **Étape 2 — Audit NotificationsPhase3.js (CRITIQUE)**

**Question clé** : Qu'affiche NotificationsPhase3.js aux horaires 8h, 11h, 13h, 16h, 19h ?

```
8h : "Huile vierge" ❌ (pas de recette Cookeo/Marmite en Phase 3)
11h : "Protéine délicate" (Œuf) → détail ?
13h : "Poisson blanc vapeur" ❌ ou "Saumon" ❌ ou "Sardines" ❌ (pas de recette officielle)
16h : "Gras sain" (Avocat) ❌ ou "Purée d'amandes" ❌
19h : "Protéine + Huile" (Yaourt 0% + Huile) ❌ ou "Fromage blanc + Huile" ❌
```

### **DÉCISION BLOQUANTE REQUISE** :
Si NotificationsPhase3.js affiche aliments sans recettes officielles → **CONFLIT MAJEUR**

Options :
1. ✅ Modifier NotificationsPhase3.js pour afficher UNIQUEMENT aliments avec recettes (Lentilles, Légumes, Riz, Bouillon)
2. ❌ Garder NotificationsPhase3.js inchangé → recettes supprimées → UX cassée (bouton recette ne fonctionne plus)

**CETTE DÉCISION DOIT ÊTRE PRISE AVANT DE CODER.**

---

## **Étape 3 — Solution APPROUVÉE**

### ✅ **Solution HYBRIDE VALIDÉE** (comme Phase 1-2-4)

**RecettesPhase3Modal.js** : 4 recettes officielles UNIQUEMENT
- ✅ `lentilles` — Soupe de lentilles corail
- ✅ `legumes` — Légumes vapeur
- ✅ `riz` — Riz basmati hyper-digestible
- ✅ `bouillon` — Bouillon de poulet dégraissé

**alimentsRepriseJeune.js** : Garde 12 aliments Phase 3
- ✅ Œuf mollet, Œuf poché, Avocat, Huile d'olive, Huile de coco
- ✅ Yaourt nature 0%, Saumon vapeur, Sardines nature, Beurre clarifié
- ✅ Purée d'amandes, Fromage blanc 0%, Thon au naturel

**Page modale aliments** : 12 aliments affichés
- ✅ 4 aliments ont bouton "🥘 Recette Phase 3" (Lentilles, Légumes, Riz, Bouillon)
- ✅ 8 aliments Sans bouton recette (Œuf, Avocat, Huile, Yaourt, Poisson, Fromage, Beurre, Purée) — normal, se mangent directement

**NotificationsPhase3.js** : Inchangé
- ✅ Continue afficher Yaourt, Avocat, Huile, Poisson, Fromage aux horaires
- ✅ Pas besoin de recette Cookeo pour ces aliments

**Avantage** : Conforme, simple, cohérent avec Phase 1-2-4  
**Impact UX** : Excellent — utilisateurs voient tous aliments, recettes uniquement pour ceux qui en ont besoin

---

## **Étape 4 — Point de vigilance AVANT validation**

### 🚨 BLOCAGE IDENTIFIÉ
**Le document "Detail des phases" (old) vs "alimentsRepriseJeune.js" (new) ont des définitions DIFFÉRENTES de Phase 3** :

| Aspect | Document officiel | alimentsRepriseJeune.js |
|--------|-------------------|------------------------|
| Jours | J6-J10 | J8-J10 |
| Type | Solides légers + protéines végétales | Protéines & Lipides (12 aliments) |
| Recettes | 4 officielles (lentilles, légumes, riz, bouillon) | 12 aliments (mais seulement pour interface) |
| Avocat | ❌ Pas mentionné | ✅ Présent |
| Poisson | ❌ "Interdits" | ✅ Saumon, Sardines, Thon |
| Produits laitiers | ❌ "Interdits" | ✅ Yaourt 0%, Fromage blanc |
| Huiles | Uniquement huile d'olive crue | ✅ Olive, Coco, Beurre clarifié |

**QUELLE VERSION EST LA VÉRITÉ MÉTIER ?**

**Réponse de l'utilisateur** : "Phase de reprise alimentaire après jeûne .md" (le nouveau document fourni)
- ✅ Phase 3 : Jours 8-10 (pas 6-10)
- ✅ Phase 3 : 4 recettes Cookeo/Marmite UNIQUEMENT
- ❌ Pas d'Avocat, Poisson, Fromage, Yaourt, Huiles en recettes

---

## **Étape 5 — Plan de correction VALIDÉ PAR L'UTILISATEUR**

### ✅ **RÉPONSES UTILISATEUR AUX QUESTIONS BLOQUANTES**

| Question | Réponse | Décision |
|----------|---------|----------|
| NotificationsPhase3.js affiche aliments sans recettes ? | ✅ OUI — c'est normal, pas besoin de recette Cookeo pour manger yaourt | NotificationsPhase3.js INCHANGÉ |
| Refondre NotificationsPhase3.js ? | ❌ NON | Laisser afficher tous aliments (12 + notifications) |
| Garder 12 aliments Phase 3 ? | ✅ OUI | alimentsRepriseJeune.js INCHANGÉ |
| Ajouter recettes officielles seulement ? | ✅ OUI | RecettesPhase3Modal.js avec 4 recettes UNIQUEMENT |

---

### **ARCHITECTURE FINALE (comme Phase 1-2-4)**

**Modale "Voir aliments" Phase 3** : Affiche 12 aliments
```
✅ Œuf mollet (SANS bouton recette)
✅ Œuf poché (SANS bouton recette)
✅ Avocat (SANS bouton recette)
✅ Huile d'olive vierge (SANS bouton recette)
✅ Huile de coco (SANS bouton recette)
✅ Yaourt nature 0% (SANS bouton recette)
✅ Saumon vapeur (SANS bouton recette)
✅ Sardines nature (SANS bouton recette)
✅ Beurre clarifié (ghee) (SANS bouton recette)
✅ Purée d'amandes (SANS bouton recette)
✅ Fromage blanc 0% (SANS bouton recette)
✅ Thon au naturel (SANS bouton recette)

+ 4 aliments avec BOUTON RECETTE :
✅ Lentilles corail 🥘 Recette Phase 3
✅ Légumes vapeur 🥘 Recette Phase 3 (Carotte, Courgette, Haricots)
✅ Riz basmati 🥘 Recette Phase 3
✅ Bouillon de poulet 🥘 Recette Phase 3
```

---

### **Étape A : Supprimer RecettesPhase3Modal.js actuel**
**Fichier** : `/components/RecettesPhase3Modal.js`  
**Action** : ❌ Supprimer complètement

**Raison** : Contient 5 types de recettes non-autorisées (oeufs, avocat, huiles, fromageblancyaourt, poisson)

---

### **Étape B : Créer RecettesPhase3Modal.js conforme**
**Fichier** : `/components/RecettesPhase3Modal.js` (nouveau)  
**Recettes** : 4 types UNIQUEMENT
1. `lentilles` — Soupe de lentilles corail (Cookeo 10 min + Marmite 20 min)
2. `legumes` — Légumes vapeur (Cookeo 8 min + Marmite 15-20 min)
3. `riz` — Riz basmati hyper-digestible (Cookeo 6 min + Marmite 12 min)
4. `bouillon` — Bouillon de poulet dégraissé (Cookeo 30 min + Marmite 1h30)

**Architecture** : Identique Phase 1-2-4 (useState, toggle Cookeo/Marmite, instructions avec cercles verts, conseil box bleu)

---

### **Étape C : Adapter détection bouton recette en page**
**Fichier** : `/pages/reprise-alimentaire-apres-jeune.js`  
**Lignes** : 1755-1787  
**Stratégie** : SEULEMENT 4 aliments ont bouton "🥘 Recette Phase 3"

**Avant (FAUX — toutes les recettes non-autorisées)** :
```javascript
{modalAliments === 3 && (a.nom.includes('Œuf') || a.nom.includes('Avocat') || a.nom.includes('Huile') || a.nom.includes('Fromage blanc') || a.nom.includes('Yaourt') || a.nom.includes('Poisson') || a.nom.includes('Saumon') || a.nom.includes('Sardine') || a.nom.includes('Thon') || a.nom.includes('Beurre clarifié') || a.nom.includes('Purée d\'amandes')) && (
  <button ...>🥘 Recette Phase 3</button>
)}
```

**Après (CORRECT — uniquement 4 recettes officielles)** :
```javascript
{modalAliments === 3 && (a.nom.includes('Lentilles corail') || a.nom.includes('Carotte') || a.nom.includes('Courgette') || a.nom.includes('Haricots') || a.nom.includes('Riz basmati') || a.nom.includes('Bouillon')) && (
  <button ...>🥘 Recette Phase 3</button>
)}
```

**Mapping recettes correct** :
```javascript
let recetteType = 'lentilles'; // défaut
if (a.nom.includes('Carotte') || a.nom.includes('Courgette') || a.nom.includes('Haricots')) recetteType = 'legumes';
else if (a.nom.includes('Riz basmati')) recetteType = 'riz';
else if (a.nom.includes('Bouillon')) recetteType = 'bouillon';
```

---

### **Étape D : Vérifier NotificationsPhase3.js**
**Fichier** : `/components/NotificationsPhase3.js`  
**Action** : ✅ **INCHANGÉ** — Utilisateur confirme qu'afficher Yaourt, Avocat, Huile, Poisson, Fromage SANS recette Cookeo est NORMAL et CORRECT

**Raison** : Pas besoin de recette pour manger un yaourt nature ou un avocat — ils se mangent directement

---

### **Étape E : Vérifier alimentsRepriseJeune.js**
**Fichier** : `/data/alimentsRepriseJeune.js`  
**Lignes Phase 3** : 378-550  
**Action** : ✅ **INCHANGÉ** — Garder les 12 aliments Phase 3

**Raison** : Les 12 aliments restent valides, seules les recettes Cookeo/Marmite officielles sont exposées aux utilisateurs

---

## **Étape 6 — Rapport AVANT modification**

### État actuel RecettesPhase3Modal.js
```
✅ 5 types de recettes déclarées : oeufs, avocat, huiles, fromageblancyaourt, poisson
✅ Chaque recette a : nom, duree, ingredients, cookeo (etapes), marmite (etapes)
✅ useState(methodPreferee) déclaré en haut
✅ const recettes = { ... }
✅ const recetteActuelle = recettes[recetteType] || recettes.oeufs
❌ PROBLÈME : Types ne correspondent pas aux 4 recettes officielles
```

### État attendu APRÈS modification
```
✅ 4 types de recettes déclarées : lentilles, legumes, riz, bouillon
✅ Chaque recette a : nom, duree, ingredients, cookeo (etapes), marmite (etapes)
✅ useState(methodPreferee) déclaré en haut
✅ const recettes = { ... }
✅ const recetteActuelle = recettes[recetteType] || recettes.lentilles
✅ CONFORME : Uniquement recettes officielles du document
```

### État détection aliments AVANT
```
❌ Cherche : Œuf, Avocat, Huile, Fromage blanc, Yaourt, Poisson, Saumon, Sardine, Thon
```

### État détection aliments APRÈS
```
✅ Cherche : Lentilles corail, Carotte, Courgette, Haricots verts, Riz basmati, Bouillon de poulet
```

---

## **Étape 7 — Préparation tests**

### Test 1 : Compilation
```bash
npm run build
# Attendu : ✅ Build réussie, aucun erreur
```

### Test 2 : Ouverture modale
- Accéder Phase 3 → Clic "Voir aliments"
- Clic bouton recette sur "Lentilles corail"
- **Attendu** : Modale recette s'ouvre, affiche "Soupe de lentilles corail Phase 3"

### Test 3 : Toutes les recettes
- Test clic recette pour : Lentilles, Légumes, Riz, Bouillon
- **Attendu** : Chaque ouvre modal avec contenu correct

### Test 4 : Toggle Cookeo/Marmite
- Ouvre modal recette "Lentilles"
- Clique bouton Marmite
- **Attendu** : Affiche instructions Marmite (20 min à feu moyen)

### Test 5 : Non-régression
- Vérifie Phase 1, 2, 4 toujours fonctionnelles
- **Attendu** : Aucun changement

---

## **Étape 8 — Mise à jour avancement**

- [x] Non commencé
- [ ] En cours
- [ ] Plan créé (EN ATTENTE VALIDATION)

**Avancement global** : 10 % (plan validé, implémentation en cours)

**Historique** :
- 2025-12-27 10:00 — Plan création
- 2025-12-27 10:15 — Validation utilisateur complète (3 questions répondues)
- 2025-12-27 10:20 — Plan mis à jour avec décisions approuvées

---

## **Étape 9 — Validation explicite de l'utilisateur (✅ COMPLÉTÉE)**

### ✅ **VALIDATION UTILISATEUR REÇUE — 27 décembre 2025**

**Question #1** : NotificationsPhase3.js affiche aliments sans recettes ?  
✅ **Réponse** : Oui, c'est normal — pas besoin de recette Cookeo pour manger yaourt/avocat

**Question #2** : Refondre NotificationsPhase3.js ?  
✅ **Réponse** : Non, laisser inchangé

**Question #3** : Supprimer 12 aliments ou garder avec 4 recettes seulement ?  
✅ **Réponse** : Garder 12 aliments, ajouter 4 recettes officielles (comme Phase 1-2-4)

---

**✅ PLAN VALIDÉ — PRÊT POUR IMPLÉMENTATION**


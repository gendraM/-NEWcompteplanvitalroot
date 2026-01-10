# 🟢 PLAN D'IMPLÉMENTATION — ROUTEUR POIDS + BUDGET CALORIQUE EXTRAS

**⚠️ AUCUNE modification de code ne doit être produite tant que l'utilisateur n'a pas validé explicitement ce plan d'implémentation rempli et relu par Copilot.**

**Date création** : 9 janvier 2026  
**Auteur** : GitHub Copilot  
**Documents sources** :
- `ANALYSE_FAISABILITE_ROUTEUR_POIDS_EXTRAS_2026-01-09.md`
- `SCENARIO_MARIE_MODE_AVANCE_2026-01-09.md`
- `Maj gestion des extra et routeur poids`

---

## Titre de la tâche  
**Implémentation du système Routeur Poids + Budget Calorique Extras en Mode Dual**

---

## **Description précise de la modification attendue**

Créer un nouveau système de gestion des extras basé sur un **budget calorique dynamique** piloté par le **routeur poids**, tout en **conservant** le système actuel (mode simplifié).

### Objectifs fonctionnels :

1. **Architecture en couches** : Le système existant (paliers, quota extras) RESTE ACTIF pour tous. On AJOUTE des couches de profondeur :
   - **Socle existant** (conservé à 100%) : 1 extra/semaine, paliers 5→3→2→1, validation dimanche
   - **Couche 1 - Routeur Poids** (nouveau) : Calculs BMR/TDEE, budget personnalisé
   - **Couche 2 - Granularité** (nouveau) : Types extras (mini/normal/2x/3x), équivalences kcal
   - **Couche 3 - Planification** (nouveau) : Extras réservés pour événements
   - **Couche 4 - Tendances** (nouveau) : Fenêtres 3j/7j/14j, classification énergétique
   - **Couche 5 - Rituel** (nouveau) : Messages fin de semaine personnalisés

2. **Routeur Poids** : Utilise données table `profil` existante (âge, taille, poids_de_depart) + **AJOUT 2 colonnes** (sexe, niveau_activite)
   - ✅ **Existant** : age, taille, poids_de_depart, besoin_calorique
   - ⚠️ **À AJOUTER** : sexe (M/F), niveau_activite (sédentaire/modéré/actif/intense)
   - Calcul automatique BMR (Mifflin-St Jeor) à partir profil complet
   - Calcul TDEE (BMR × coefficient activité : 1.2/1.5/1.7/2.0)
   - Détermination budget extras hebdo dynamique (300-1000 kcal selon objectif)

3. **Budget Calorique Extras** :
   - Unités visuelles : mini-extra (90 kcal), extra (220 kcal), 2-extras (350 kcal), 3-extras (800 kcal)
   - Budget libre vs réservé (extras planifiés)
   - Alertes si budget insuffisant

4. **Extras Planifiés** :
   - Réservation temporaire pour événements
   - Contexte (mariage, cinéma, etc.)
   - Limite 1-2 actifs

5. **Tendances Énergétiques** :
   - Fenêtres 3j, 7j, 14j
   - Classification : perte / léger déficit / maintien / léger surplus / surplus
   - Messages actionnables (pas info brute)

6. **Rituel de Fermeture** :
   - 3 étapes : Nommer fin / Rendre futur visible / Transformer en gain
   - Projection précise (7j, 30j)
   - Recommandations personnalisées

### Comportement UX :

- **Socle toujours actif** : Le système de paliers/extras reste fonctionnel pour TOUS les utilisateurs
- **Enrichissement progressif** : Les nouvelles couches s'ajoutent automatiquement (routeur poids, granularité, etc.)
- **Pas de choix binaire** : L'utilisateur ne "choisit" pas, il bénéficie naturellement des enrichissements
- **Rétrocompatibilité totale** : Utilisateurs existants voient 0 changement visible sauf enrichissements optionnels
- **Aucune suppression** : Le code existant (validation, paliers, quota) reste 100% intact

---

## **Fichiers concernés**

### Nouveaux fichiers à créer :

**Tables BDD** :
- Migration : `/supabase/migrations/YYYYMMDDHHMMSS_create_routeur_poids.sql`
- Migration : `/supabase/migrations/YYYYMMDDHHMMSS_create_tendances_energetiques.sql`
- Migration : `/supabase/migrations/YYYYMMDDHHMMSS_create_extras_budget.sql`
- Migration : `/supabase/migrations/YYYYMMDDHHMMSS_create_extras_historique.sql`

**Helpers** :
- `/lib/routeurPoids.js` (calculs BMR, TDEE, budget)
- `/lib/extrasAvances.js` (conversions, rituels, vérifications)
- `/lib/tendancesEnergetiques.js` (fenêtres temporelles, classification)

**Composants** :
- `/components/RouteurPoidsConfig.js` (configuration profil - enrichissement)
- `/components/BudgetExtrasCard.js` (affichage budget kcal - enrichissement)
- `/components/ModalRituelFermeture.js` (rituel 3 étapes - enrichissement)
- `/components/ExtrasPlanifiesList.js` (liste extras réservés - enrichissement)
- `/components/AlerteBudgetInsuffisant.js` (alerte lors planification - enrichissement)
- `/components/SelecteurTypeExtra.js` (mini/normal/2x/3x - enrichissement)

**Pages** :
- `/pages/parametres/routeur-poids.js` (nouvelle page config profil)

### Fichiers existants à modifier :

- `/pages/suivi.js` : Ajout affichage budget kcal (enrichissement, aucune modification logique existante)
- `/components/RepasBloc.js` : Ajout sélecteur type extra (mini/normal/2x/3x - enrichissement)
- `/components/DrawerValidation.js` : Ajout onglets par type extras (mode avancé)
- `/components/ModalFeedbackValidation.js` : Messages différenciés selon mode
- `/lib/validationSemaine.js` : ⚠️ **CORRECTION BUG** calculerExtrasSemaine() (manque est_extra)
- `/pages/tableau-de-bord.js` : Ajout graphiques annuels extras (mode avancé)

---

## Etape 1 — **Audit des risques préalable**

### Risques Techniques :

1. **Risque : Conflit avec système existant**
   - Impact : Régression fonctionnalités paliers/validation existants
   - Probabilité : Faible
   - Mitigation : Architecture en couches, aucune modification destructive du code de base

2. **Risque : Bug calculerExtrasSemaine() non corrigé**
   - Impact : Extras manuels (est_extra: true) non comptés
   - Probabilité : Haute (bug existant confirmé)
   - Mitigation : Correction prioritaire avant toute autre modif

3. **Risque : Migration BDD destructive**
   - Impact : Perte données utilisateurs
   - Probabilité : Faible
   - Mitigation : Migrations ADD COLUMN uniquement (pas DROP)

4. **Risque : Hooks React mal ordonnés**
   - Impact : Runtime error, composants non fonctionnels
   - Probabilité : Moyenne
   - Mitigation : Checklist stricte ordre hooks (useState/useEffect en haut)

5. **Risque : SSR Next.js**
   - Impact : Erreur hydratation, composants cassés
   - Probabilité : Moyenne
   - Mitigation : Vérifier tous useEffect, pas de window/localStorage direct

### Risques UX :

6. **Risque : Confusion utilisateur (nouvelles informations)**
   - Impact : Surcharge cognitive, incompréhension budget kcal
   - Probabilité : Moyenne
   - Mitigation : Introduction progressive, info-bulles ⓘ, messages explicatifs

7. **Risque : Surcharge cognitive (mode avancé)**
   - Impact : Abandon fonctionnalité
   - Probabilité : Moyenne
   - Mitigation : Interface progressive, bouton "En savoir plus ⓘ" pour détails

8. **Risque : Budget négatif mal compris**
   - Impact : Démotivation, sentiment d'échec
   - Probabilité : Haute
   - Mitigation : Messages rassurants "Pas de panique, échelle de temps"

### Risques Sécurité :

9. **Risque : SQL injection**
   - Impact : Compromission BDD
   - Probabilité : Faible
   - Mitigation : Utiliser requêtes préparées Supabase (jamais concaténation)

10. **Risque : Données sensibles exposées**
    - Impact : Violation vie privée (poids, objectifs)
    - Probabilité : Faible
    - Mitigation : RLS Supabase activé, auth.users() dans policies

### Risques Métier :

11. **Risque : Formules BMR/TDEE imprécises**
    - Impact : Budget extras inadapté, perte confiance
    - Probabilité : Moyenne
    - Mitigation : Formule Mifflin-St Jeor validée scientifiquement + disclaimer

12. **Risque : Projection perte trop optimiste**
    - Impact : Déception utilisateur, abandon
    - Probabilité : Haute
    - Mitigation : Message "tendance probabiliste, pas promesse" + eau/glycogène

### Points de vigilance intégrés :

- ✅ Tous les hooks déclarés EN HAUT du composant
- ✅ Aucune variable utilisée avant déclaration (y compris dépendances useEffect)
- ✅ Séparation stricte : initialisation → logique → handlers → rendu
- ✅ Contrôle d'erreur systématique (try/catch, fallbacks)
- ✅ Tests multi-device (responsive)
- ✅ Accessibilité (ARIA, keyboard navigation)

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### Imports & Dépendances :

- [ ] Vérifier import useState, useEffect dans tous nouveaux composants
- [ ] Vérifier import calculerBMR, calculerTDEE dans composants config
- [ ] Vérifier import convertirExtraEnKcal dans RepasBloc.js modifié
- [ ] Vérifier import genererRituelFermeture dans ModalRituelFermeture
- [ ] Vérifier import Supabase client dans tous fichiers BDD
- [ ] Vérifier import classNames (ou cx) pour styles conditionnels

### Variables d'état :

- [ ] Tous useState déclarés AVANT toute utilisation
- [ ] Aucun useState dans if, loop, map, ou fonction
- [ ] Tous useState initialisés avec valeur par défaut (pas undefined)
- [ ] Variables utilisées dans useEffect déclarées AVANT le useEffect

### Fonctions & Handlers :

- [ ] Tous handlers déclarés AVANT utilisation dans JSX
- [ ] Aucune fonction déclarée dans le rendu (memoization si nécessaire)
- [ ] Tous callbacks dans useEffect retournent cleanup si nécessaire
- [ ] Fonctions async/await gérées avec try/catch

---

## Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

### Lecture & Compréhension :

- [ ] Lecture complète de `/lib/validationSemaine.js` (fonction calculerExtrasSemaine)
- [ ] Lecture complète de `/pages/suivi.js` (logique quota actuel)
- [ ] Lecture complète de `/components/RepasBloc.js` (checkbox est_extra)
- [ ] Lecture complète de Template.md (règles implémentation)
- [ ] Lecture complète du fichier ANOMALIE rollback (historique bugs)

### Ordre & Initialisation :

- [ ] **CRITIQUE** : Tous hooks (useState, useEffect, etc.) déclarés EN HAUT du composant fonctionnel
- [ ] **CRITIQUE** : Aucune variable d'état utilisée avant sa déclaration, y compris dans dépendances useEffect
- [ ] **CRITIQUE** : Séparation stricte : initialisation → logique calculée → handlers → rendu
- [ ] Aucun doublon de déclaration (useState, useEffect)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)

### Validation Logique :

- [ ] Vérifier : toute fonction/handler utilisé dans rendu est présent et initialisé
- [ ] Vérifier : aucun appel de hook dans fonction, boucle, if, map
- [ ] Vérifier : ordre des hooks cohérent (même ordre à chaque rendu)
- [ ] Vérifier : cleanup useEffect si nécessaire (listeners, timers, subscriptions)

### Tests & Contrôles :

- [ ] Test compilation : npm run build SANS erreur
- [ ] Test runtime : aucune erreur console navigateur
- [ ] Test SSR : pages rendu côté serveur sans crash
- [ ] Test accessibilité : navigation clavier, screen reader
- [ ] Test multi-device : mobile, tablette, desktop
- [ ] Test cas limites : budget 0, budget négatif, aucun extra, 10 extras planifiés

### Préservation Existant :

- [ ] **CRITIQUE** : Aucune suppression destructrice de code existant
- [ ] **CRITIQUE** : Mode simplifié fonctionne EXACTEMENT comme avant
- [ ] Aucune modification de schéma BDD destructive (pas de DROP COLUMN)
- [ ] Aucune modification de comportement par défaut (mode simple = défaut)

### Documentation :

- [ ] Mise à jour précise du pourcentage d'avancement
- [ ] Documentation de chaque étape (commits, commentaires)
- [ ] Rapport Markdown avant/après modification
- [ ] En cas d'anomalie : rollback + rapport ANOMALIE rollback (ajout fin fichier)

### Validation Utilisateur :

- [ ] **OBLIGATOIRE** : Validation utilisateur AVANT toute implémentation
- [ ] **OBLIGATOIRE** : Toutes cases ci-dessus cochées avant de poursuivre

---

## Etape 4 — **Contrôles conformité à réaliser (en suivant l'ordre ci-dessous)**

### 1. Lecture fichier ANOMALIE rollback

**Action** : Lire `/docs/ANOMALIE_rollback.md` (si existe) pour identifier points de vigilance

**Points à rechercher** :
- Erreurs hooks React (useState/useEffect mal placés)
- Bugs calculs (BMR/TDEE, calories)
- Problèmes SSR Next.js
- Conflits mode simple/avancé
- Pertes de données migrations

**Checklist de contrôle à créer** (après lecture) :
- [ ] Vérifier ordre hooks dans TOUS nouveaux composants
- [ ] Tester calculs BMR/TDEE avec données réelles
- [ ] Vérifier SSR sur toutes pages modifiées
- [ ] Tester bascule mode simple ↔ avancé (données préservées)
- [ ] Backup BDD avant migrations

### 2. Analyse audit risques

**Anomalies bloquantes identifiées** :
- ⚠️ **BUG EXISTANT** : calculerExtrasSemaine() ne compte pas est_extra
  - **Blocage** : OUI
  - **Action** : Corriger AVANT toute autre modif
  - **Priorité** : P0 (bloquant)

**Anomalies non bloquantes** :
- Formules BMR/TDEE : Ajout disclaimer "estimation"
- Projection perte : Message "tendance, pas promesse"
- Surcharge cognitive : Bouton "En savoir plus ⓘ"

### 3. Création checklist Point de vigilance

Voir Etape 6 ci-dessous

### 4. Proposition rollback si anomalie

**Plan de rollback** :
- Rollback Git vers commit précédent migration
- Restore BDD depuis backup (si migrations appliquées)
- Documentation dans ANOMALIE rollback (date, heure, contexte)
- **IMPORTANT** : Ajout FIN de fichier, JAMAIS suppression

---

## Etape 5 — **Mise à jour de l'avancement**

### Statut :

- [ ] Non commencé
- [x] En cours
- [ ] Terminé

### Avancement précis :

**Pourcentage réel** : 15 %

**Historique des mises à jour** :

| Date | Avancement | Étape complétée | Remarques |
|------|-----------|----------------|-----------|
| 2026-01-09 | 0% | Plan créé | Validation utilisateur requise |
| 2026-01-10 | 5% | Phase 0 démarrée | Validation utilisateur obtenue |
| 2026-01-10 | 15% | Phase 0 complétée | Migration SQL + helpers + formulaires |

**Prochaines étapes** :
1. Validation utilisateur du plan
2. Phase 0 : Préparation infrastructure (tables BDD, helpers)
3. Phase 1 : Routeur poids (config profil)

---

## Etape 6 — **Point de vigilance**

### Rapport lecture fichier ANOMALIE rollback

**État** : Fichier ANOMALIE rollback à lire avant implémentation

**Checklist de vérification créée** :

#### Vigilance Hooks React :

1. **Déclaration hooks EN HAUT uniquement**
   - [ ] RouteurPoidsConfig.js : Tous useState en haut
   - [ ] BudgetExtrasCard.js : Aucun hook conditionnel
   - [ ] ModalRituelFermeture.js : useEffect après useState

2. **Dépendances useEffect**
   - [ ] Toutes variables dans deps[] déclarées AVANT useEffect
   - [ ] Pas de variables undefined dans deps[]
   - [ ] Cleanup retourné si listeners/timers

#### Vigilance Calculs :

3. **Formules BMR/TDEE**
   - [ ] Tester avec profils variés (H/F, âges extrêmes)
   - [ ] Vérifier division par zéro impossible
   - [ ] Arrondir résultats (Math.round)

4. **Budget extras**
   - [ ] Vérifier budget_libre = budget_total - consomme - reserve
   - [ ] Alertes si budget < 0
   - [ ] Bloquer si budget insuffisant pour planification

#### Vigilance UX :

5. **Messages utilisateur**
   - [ ] Pas de jargon technique ("BMR", "TDEE" expliqués)
   - [ ] Toujours contexte + action (pas info brute)
   - [ ] Ton rassurant si budget dépassé

6. **Affichage budget**
   - [ ] Budget réservé GRISÉ visuellement
   - [ ] Budget négatif en ROUGE avec icône ⚠️
   - [ ] Projection toujours qualifiée "environ", "tendance"

#### Vigilance BDD :

7. **Migrations**
   - [ ] UNIQUEMENT ADD COLUMN (pas DROP)
   - [ ] Valeurs par défaut définies (DEFAULT 'simple')
   - [ ] Index créés (performance requêtes)
   - [ ] RLS policies activées (sécurité)

8. **Requêtes Supabase**
   - [ ] JAMAIS concaténation SQL (injection)
   - [ ] Toujours .eq(), .select(), .insert() (API Supabase)
   - [ ] auth.users() dans policies (isolation user)

### Impact attendu

**Positif** :
- Système plus réaliste (biscuit ≠ pizza)
- Planification événements (moins frustration)
- Messages actionnables (pas info brute)
- Personnalisation (routeur poids)

**Négatif potentiel** :
- Complexité accrue (mitigé par mode dual)
- Courbe apprentissage (mitigé par tutoriel)
- Maintenance 2 modes (mitigé par code modulaire)

---

## Etape 7 — **Proposition de rollback**

### Déclencheurs de rollback :

1. **Erreur compilation bloquante**
   - Action : git reset --hard HEAD~1
   - Rapport : ANOMALIE rollback (erreur exacte, fichier, ligne)

2. **Erreur runtime critique**
   - Action : Rollback commit fautif
   - Rapport : ANOMALIE rollback (stack trace, contexte)

3. **Migration BDD échouée**
   - Action : Restore backup BDD
   - Rapport : ANOMALIE rollback (migration SQL, erreur Postgres)

4. **Perte fonctionnalité mode simplifié**
   - Action : Rollback code + restore BDD
   - Rapport : ANOMALIE rollback (fonctionnalité perdue, impact utilisateurs)

### Format rapport ANOMALIE rollback :

```markdown
## ANOMALIE [DATE] [HEURE]

**Contexte** : [Phase en cours, fichier modifié]
**Erreur** : [Description précise erreur]
**Impact** : [Fonctionnalité cassée, utilisateurs affectés]
**Rollback** : [Action effectuée - commit, BDD restore]
**Alternative** : [Solution proposée si risque identifié]
**Statut** : [En cours / Résolu / Bloquant]

---
```

**⚠️ IMPORTANT** : Ajout FIN de fichier UNIQUEMENT (jamais suppression)

---

## Etape 8 — **Rapport Markdown Copilot**

### Rapport AVANT modification

#### Structure actuelle :

**Tables BDD existantes** :
- `repas_reels` : Contient `est_extra` (BOOLEAN), `categorie`, `tag`
- `semaines_validees` : Contient `extras_count`, `extras_details` (JSONB)
- `fast_food_history` : Tracking fast-foods séparé (45 jours)

**Fichiers clés** :
- `/lib/validationSemaine.js` : calculerExtrasSemaine() (BUG ligne 146)
- `/pages/suivi.js` : Quota fixe `currentPalier = 1`
- `/components/RepasBloc.js` : Checkbox "Cet aliment est-il un extra ?"

**Hooks React** :
- Ordre correct dans composants existants
- Pas de hooks conditionnels détectés

**Fonctionnalités** :
- Mode unique : 1 extra/semaine
- Paliers : 5 → 3 → 2 → 1
- Fast-food séparé (non intégré extras)
- Validation dimanche

#### Bugs identifiés :

1. **calculerExtrasSemaine() incomplet** :
```javascript
// ACTUEL (LIGNE 146)
const extras = repasDesSemaine.filter(repas => {
  return repas.categorie === 'fast-food' || 
         (repas.tag && repas.tag.toLowerCase().includes('fast-food'));
  // ❌ MANQUE : || repas.est_extra === true
});
```

2. **Fast-food compté comme extra** :
- Fast-food a `categorie: 'fast-food'` → compté dans extras
- Devrait être séparé (2 systèmes différents selon stratégie)

### Rapport APRÈS modification (prévisionnel)

#### Nouvelles tables BDD :

```sql
-- routeur_poids : BMR, TDEE, budget_extras_hebdo
-- tendances_energetiques : cumuls 3j/7j/14j, classification
-- extras_budget : budget_hebdo, consomme, reserve, libre_reel
-- extras_historique : détail consommations par type
-- users : ADD COLUMN mode_extras ('simple' | 'avance')
```

#### Nouveaux fichiers :

```javascript
// /lib/routeurPoids.js
export function calculerBMR(sexe, age, taille_cm, poids_kg)
export function calculerTDEE(bmr, niveau_activite)
export function calculerBudgetExtras(objectif, tdee)

// /lib/extrasAvances.js
export function convertirExtraEnKcal(type_extra)
export function genererRituelFermeture(budget_restant, date)

// /components/RouteurPoidsConfig.js
// /components/BudgetExtrasCard.js
// /components/ModalRituelFermeture.js
```

#### Modifications fichiers existants :

```javascript
// /lib/validationSemaine.js (LIGNE 146)
const extras = repasDesSemaine.filter(repas => {
  return repas.categorie === 'fast-food' || 
         (repas.tag && repas.tag.toLowerCase().includes('fast-food')) ||
         repas.est_extra === true; // ✅ AJOUTÉ
});

// /pages/suivi.js
// Logique existante (paliers, quota) RESTE INCHANGÉE
// Ajout UNIQUEMENT affichage budget kcal à côté du quota existant
// Exemple : "1 extra/semaine (≈ 220 kcal) | Budget libre : 180 kcal"
```

#### Ordre hooks React (nouveaux composants) :

```javascript
// RouteurPoidsConfig.js
export default function RouteurPoidsConfig({ userId, onSave }) {
  // 1. INITIALISATION (en haut)
  const [profil, setProfil] = useState({ sexe: 'F', age: 30, ... });
  const [calculs, setCalculs] = useState(null);
  
  // 2. EFFETS
  useEffect(() => {
    const bmr = calculerBMR(...profil);
    const tdee = calculerTDEE(bmr, profil.niveau_activite);
    setCalculs({ bmr, tdee, ... });
  }, [profil]);
  
  // 3. HANDLERS
  const handleSave = () => { ... };
  
  // 4. RENDU
  return (<div>...</div>);
}
```

#### Changements comportement :

**Système de base (AUCUN changement)** :
- Quota : 1 extra/semaine (paliers 5→3→2→1)
- Validation : Dimanche (logique inchangée)
- Interface : Checkbox "extra" conservée

**Enrichissements ajoutés (nouveaux)** :
- **Budget kcal** : Affiché à côté du quota (ex: "1/1 extra = 220 kcal consommés")
- **Types extras** : Sélecteur mini/normal/2x/3x (optionnel, fallback sur "normal" si non renseigné)
- **Extras planifiés** : Liste séparée "Réservés pour événements" (n'impacte pas quota actuel)
- **Tendances** : Graphiques 3j/7j/14j (complément d'info)
- **Rituel** : Messages dimanche soir personnalisés (remplacement messages génériques)

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

### Plan validé par l'utilisateur :

- [x] Plan lu et compris
- [x] Architecture validée (architecture en couches)
- [x] Risques acceptés
- [x] Priorisation phases validée
- [x] Date validation : 10 janvier 2026

### Questions pour validation :

1. **Architecture** : Confirmes-tu que le système de paliers/extras actuel RESTE et qu'on AJOUTE des couches par-dessus ?
2. **Priorité** : Quelle phase commencer en premier ?
   - [ ] Phase 0 : Infrastructure (tables BDD)
   - [ ] Phase 1 : Routeur poids
   - [ ] Phase 2 : Types extras + granularité
   - [ ] Autre : _______________
3. **Timeline** : 10-12 semaines acceptables ?
4. **Risques** : Acceptes-tu les risques identifiés ?

---

## 📋 PHASES D'IMPLÉMENTATION DÉTAILLÉES

### Phase 0 : Préparation (1 semaine)

**Objectif** : Infrastructure BDD + Helpers

**Tâches** :
1. Créer migration `create_routeur_poids.sql`
2. Créer migration `create_tendances_energetiques.sql`
3. Créer migration `create_extras_budget.sql`
4. Créer migration `create_extras_historique.sql`
5. Créer migration `add_mode_extras_users.sql`
6. Créer `/lib/routeurPoids.js`
7. Créer `/lib/extrasAvances.js`
8. Créer `/lib/tendancesEnergetiques.js`
9. Tests unitaires helpers (Jest)

**Livrable** : Infrastructure prête, aucun impact utilisateur

**Avancement** : 0% → 15%

---

### Phase 1 : Routeur Poids (1 semaine)

**Objectif** : Configuration profil utilisateur

**Tâches** :
1. Créer `/components/RouteurPoidsConfig.js`
2. Créer `/pages/parametres/routeur-poids.js`
3. API route `/api/routeur-poids/save`
4. Tests calculs BMR/TDEE (données variées)
5. Documentation formules

**Livrable** : Utilisateurs peuvent configurer profil

**Avancement** : 15% → 30%

---

### Phase 2 : Types Extras + Granularité (1 semaine)

**Objectif** : Sélecteur types extras (mini/normal/2x/3x)

**Tâches** :
1. Créer `/components/SelecteurTypeExtra.js`
2. Modifier `/components/RepasBloc.js` (ajout sélecteur à côté checkbox extra)
3. Fonction `/lib/extrasAvances.js::convertirExtraEnKcal()`
4. Affichage équivalence kcal en temps réel
5. Tests fallback (si type non renseigné → "normal" = 220 kcal)

**Livrable** : Granularité extras fonctionnelle

**Avancement** : 30% → 45%

---

### Phase 3 : Budget Calorique (2 semaines)

**Objectif** : Gestion budget kcal

**Tâches** :
1. Créer `/components/BudgetExtrasCard.js`
2. Modifier `/components/RepasBloc.js` (sélecteur type extra)
3. API routes budget extras (calcul, update)
4. Dashboard affichage budget
5. Tests cas limites (budget 0, négatif)

**Livrable** : Budget kcal fonctionnel

**Avancement** : 45% → 65%

---

### Phase 4 : Fenêtres Temporelles (1 semaine)

**Objectif** : Tendances 3j/7j/14j

**Tâches** :
1. Job automatique calcul cumuls (cron/webhook)
2. Classification tendances
3. Dashboard graphiques tendances
4. Signaux automatiques (alertes)
5. Tests fenêtres glissantes

**Livrable** : Suivi tendances + signaux

**Avancement** : 65% → 75%

---

### Phase 5 : Extras Planifiés (2 semaines)

**Objectif** : Planification événements

**Tâches** :
1. Créer `/components/ModalPlanifierExtra.js`
2. Créer `/components/ExtrasPlanifiesList.js`
3. Créer `/components/AlerteBudgetInsuffisant.js`
4. Gestion JSONB extras_planifies
5. Validation date + plafond kcal
6. Limite 1-2 actifs
7. Déclenchement auto à la date
8. Tests planification/annulation

**Livrable** : Planification fonctionnelle

**Avancement** : 75% → 90%

---

### Phase 6 : Rituel Fermeture (1 semaine)

**Objectif** : Messages fin de semaine

**Tâches** :
1. Créer `/components/ModalRituelFermeture.js`
2. Déclenchement automatique dimanche 21h
3. 3 étapes (fin/futur/gain)
4. Messages projection
5. Recommandations personnalisées
6. Analytics taux d'arrêt volontaire

**Livrable** : Rituel ancré

**Avancement** : 90% → 100%

---

## 🔍 DEUXIÈME LECTURE : CONFORMITÉ AVEC TEMPLATE

### Vérification écarts Template vs Plan

**Checklist de conformité** :

- [x] Titre de la tâche présent
- [x] Description précise modification
- [x] Fichiers concernés listés (nouveaux + existants)
- [x] Etape 1 : Audit risques (12 risques identifiés)
- [x] Etape 2 : Sous-checklist (imports, useState, handlers)
- [x] Etape 3 : Checklist stricte sécurité (hooks, ordre, tests)
- [x] Etape 4 : Contrôles conformité (lecture ANOMALIE rollback)
- [x] Etape 5 : Mise à jour avancement (0%, historique)
- [x] Etape 6 : Point de vigilance (8 points détaillés)
- [x] Etape 7 : Proposition rollback (4 déclencheurs)
- [x] Etape 8 : Rapport Markdown (avant/après)
- [x] Etape 9 : Validation utilisateur (obligatoire)

### Écarts identifiés :

**Aucun écart majeur détecté**

### Conformité règles strictes :

- [x] Aucune suppression massive (sed interdit)
- [x] Toute suppression doit être explicitement autorisée
- [x] Fichier Template.md jamais modifié
- [x] Ajout fin de fichier ANOMALIE rollback (pas suppression)
- [x] Relecture manuelle obligatoire (pas confiance mémoire IA)

---

## ⚠️ RAPPEL IMPORTANT

**⚠️ Copilot NE PEUT PAS générer de code avant validation explicite de ce plan par l'utilisateur.**

**⚠️ L'utilisateur doit confirmer :**
1. Lecture complète du plan
2. Acceptation de l'architecture (mode dual)
3. Validation des risques identifiés
4. Choix de la phase à commencer
5. Timeline acceptée

**⚠️ Toute modification de code sans validation = VIOLATION du template**

---

## 📝 PROCHAINES ÉTAPES

**Attente utilisateur** :

1. **Lire** ce plan d'implémentation
2. **Valider** ou demander modifications
3. **Choisir** phase de démarrage
4. **Confirmer** explicitement : "Plan validé, commencer Phase X"

**Après validation** :

1. Cocher case Etape 9
2. Indiquer date validation
3. Mettre à jour avancement
4. Commencer Phase sélectionnée

---

**Document créé le** : 9 janvier 2026  
**Statut** : ⏸️ EN ATTENTE VALIDATION UTILISATEUR  
**Prochaine action** : Validation explicite requise

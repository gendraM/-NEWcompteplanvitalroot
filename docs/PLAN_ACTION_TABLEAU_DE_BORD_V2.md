# Tableau de bord V2 — Plan d'action de mise en conformité

## Objectif

Transformer le tableau de bord actuel en une expérience à deux niveaux :
1. une vue principale synthétique et motivante ;
2. une vue Détails & analyses conservant la profondeur des données.

Le chantier doit rester compatible avec les fonctionnalités existantes et avec leur intégration future dans `main-consolidation`.

---

## Phase 0 — Sécurisation du chantier

- Travailler exclusivement sur `tableau-de-bord-v2`.
- Conserver `main` intacte.
- Référencer le SHA de chaque étape.
- Ne supprimer aucune fonctionnalité existante pendant la refonte : les éléments retirés de la vue principale doivent d'abord avoir une destination fonctionnelle dans la couche détaillée ou leur module.
- Toute décision destructive ou conflit métier sensible doit être soumis à validation.

**Critère de sortie :** périmètre documenté et branche isolée.

---

## Phase 1 — Cartographie des données et règles canoniques

Pour chaque domaine, identifier :
- source réelle ;
- table / stockage ;
- fonction métier canonique ;
- période pertinente ;
- règle de calcul ;
- dépendances ;
- comportement si données insuffisantes ;
- branche actuellement la plus avancée.

Domaines :
- poids ;
- Extras ;
- repas réels ;
- planification ;
- faim / satiété ;
- humeur / bien-être ;
- Défis ;
- Idéaux ;
- Align-Life ;
- jeûne / reprise ;
- Fast-food ;
- badges ;
- semaines validées / régularité.

**Livrable :** matrice « indicateur → source → règle → état → destination dashboard ».

**Critère de sortie :** aucun indicateur V2 n'est construit sur une source ambiguë.

---

## Phase 2 — Couche de synthèse métier

Créer une couche dédiée entre les données et l'interface afin d'éviter que `pages/tableau-de-bord.js` réimplémente toutes les règles.

Sorties attendues :
- `highlights`
- `pointsAppui`
- `pointsObservation`
- `progression`
- `extrasStatus`
- `activeChallenge`
- `activeIdeal`
- `dataAvailability`

Principes :
- déterministe et testable ;
- pas de causalité inventée ;
- pas de sanction en cas d'absence de données ;
- priorité aux données récentes et pertinentes ;
- règles de priorité pour éviter 10 highlights simultanés.

**Critère de sortie :** la vue peut être alimentée par un modèle de données cohérent sans calculs métier dispersés dans les composants.

---

## Phase 3 — Construction de la Couche 1

Mettre en place la nouvelle hiérarchie :

### A. Mon chemin maintenant
Synthèse contextualisée, courte, basée uniquement sur des données fiables.

### B. Indicateurs prioritaires
Maximum trois visibles simultanément. Ils doivent être utiles au moment du parcours et non choisis uniquement parce qu'une donnée existe.

### C. Highlights
1 à 2 faits significatifs maximum.

### D. Ce qui m'aide / À observer
Restitution équilibrée des forces et fragilités.

### E. Mon évolution
Un seul composant principal avec vues :
- Poids
- Extras
- Repas
- Bien-être

### F. En ce moment
- défi actif ;
- Idéal/cap actif ;
- éventuellement autre phase active réellement prioritaire.

### G. Accès « Détails & analyses »

**Critère de sortie :** compréhension du parcours sans scroll analytique massif et sans duplication des données.

---

## Phase 4 — Construction de la Couche 2 « Détails & analyses »

Créer une navigation analytique structurée.

Chaque domaine doit répondre à :
1. Où j'en suis ?
2. Comment cela évolue ?
3. Qu'est-ce qui est notable ?
4. Quel historique est disponible ?
5. Où aller pour agir ?

Sections :
- Poids ;
- Extras ;
- Repas & faim/satiété ;
- Bien-être ;
- Défis ;
- Idéaux ;
- Jeûne / reprise ;
- Badges ;
- Fast-food ;
- Validation & régularité.

Les anciens éléments détaillés du dashboard sont déplacés ici progressivement, pas supprimés.

**Critère de sortie :** profondeur au moins équivalente à l'existant, mais mieux organisée.

---

## Phase 5 — Mise en conformité avec les chantiers métier

Intégrer les versions stabilisées des fonctionnalités sans dupliquer leur logique :
1. Extras ;
2. Défis V2 ;
3. Idéaux ;
4. Align-Life ;
5. Planification / Suivi ;
6. Jeûne / reprise ;
7. autres mécanismes transversaux.

Pour chaque intégration :
- comparer branche métier et `main-consolidation` ;
- identifier la source canonique ;
- raccorder le dashboard ;
- tester la non-régression ;
- documenter le SHA.

**Attention :** une branche métier encore en cours ne doit pas être copiée arbitrairement dans le dashboard. Prévoir une interface compatible puis raccorder la version stabilisée.

---

## Phase 6 — États limites et qualité UX

Tester au minimum :
- nouvel utilisateur ;
- 1 à 2 jours de données ;
- semaine complète ;
- plusieurs mois ;
- longue interruption ;
- retour après interruption ;
- zéro Extra ;
- dépassement des repères Extras ;
- changement de palier ;
- aucun défi actif ;
- défi actif ;
- Idéal actif/inactif ;
- poids absent ;
- humeur absente ;
- données partielles.

Vérifier :
- aucune absence de saisie transformée en échec ;
- aucun message culpabilisant ;
- aucune fausse précision ;
- aucune répétition inutile ;
- dates et périodes en français ;
- lisibilité mobile prioritaire.

---

## Phase 7 — Tests techniques et fonctionnels

- Tests unitaires de la couche de synthèse.
- Tests des priorités de highlights.
- Tests des données insuffisantes.
- Tests des changements de période.
- Tests de navigation Couche 1 → Couche 2 → module.
- Vérification RLS / isolation utilisateur pour les données concernées.
- Test responsive mobile.
- Déploiement Vercel de la branche.
- Recette visuelle et métier avec scénarios réalistes.

**Critère de sortie :** aucune régression connue sur les fonctions déplacées.

---

## Phase 8 — Préparation à l'intégration

- Audit final du diff avec `main-consolidation`.
- Inventaire des fonctionnalités conservées/déplacées/ajoutées.
- Vérification des dépendances aux branches métier.
- Documentation des tests.
- Création d'une PR en brouillon vers `main-consolidation`.
- Aucun merge sans validation explicite.

---

## Ordre de réalisation recommandé

**Lot 1 — Fiabilité**  
Cartographie + sources canoniques + couche de synthèse.

**Lot 2 — Expérience principale**  
Couche 1 complète.

**Lot 3 — Profondeur**  
Détails & analyses + migration des visualisations existantes.

**Lot 4 — Intelligence du parcours**  
Highlights, points d'appui, points à observer, routines et contextualisation.

**Lot 5 — Convergence des chantiers**  
Raccordement des modules stabilisés.

**Lot 6 — Recette & intégration**  
Cas limites, tests Vercel, audit de non-régression, draft PR.

---

## Définition de « terminé »

Le chantier est prêt à être proposé à `main-consolidation` lorsque :
- la page principale est lisible rapidement ;
- la profondeur actuelle est conservée dans la deuxième couche ou les modules ;
- chaque indicateur a une source canonique identifiée ;
- les règles métier ne sont pas dupliquées ;
- les données manquantes sont traitées correctement ;
- les textes restent non punitifs ;
- les cas de retour après interruption fonctionnent ;
- le mobile est validé ;
- les tests passent ;
- le diff et les éventuels risques sont documentés ;
- une PR de brouillon est prête, sans merge.

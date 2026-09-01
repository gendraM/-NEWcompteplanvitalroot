# État des lieux — Module Idéaux

**Date : 1er septembre 2026**  
**Branche : `Ideo`**  
**Statut : audit uniquement — aucun code applicatif modifié**

---

## 1. Objet du document

Ce document consolide l’état des lieux fonctionnel et technique du module **Idéaux** de Mon Plan Vital.

L’analyse croise :
- le document métier `docs/ancrage` ;
- les anciens états de conformité et TODO liés aux Idéaux ;
- `lib/generateAnchoringPlan.js` ;
- `pages/ideaux.js` ;
- `pages/plan-action.js` ;
- les éléments Supabase et Auth liés à `ideaux` ;
- les écarts entre le comportement attendu et l’implémentation actuelle.

L’objectif est de disposer d’une base de travail fiable avant toute nouvelle implémentation.

---

## 2. Vision métier officielle du module Idéaux

Le module Idéaux n’est pas une simple page de saisie d’objectif.

La logique cible est une **chaîne d’ancrage** :

**Idéal émotionnel → objectif concret → routine → actions réelles → adaptation → progression vers l’idéal.**

L’idéal représente le **pourquoi vibrant** : ce que l’utilisateur veut retrouver, ressentir, vivre ou devenir.

Il doit donc combiner :
- une intention émotionnelle ;
- une donnée mesurable ;
- une date cible ;
- éventuellement une image motivante représentant la destination.

Exemple conceptuel :
- Idéal : retrouver la sensation de liberté vécue en courant ;
- Objectif concret : courir 3 fois par semaine pendant 15 minutes ;
- Routine : lundi / mercredi / samedi ;
- Actions : séances réellement exécutées ;
- Adaptation : ajuster le prochain palier selon les résultats réels.

Le point clé est la distinction entre **l’idéal** et **l’objectif intermédiaire**. L’idéal est la destination ; les objectifs et routines sont les moyens pour y arriver.

---

## 3. Comportement fonctionnel attendu

### 3.1 Création de l’idéal

L’utilisateur définit :
- un titre ;
- une description émotionnelle ;
- un indicateur concret ;
- une date cible ;
- une image motivante facultative.

### 3.2 Transformation en objectif concret

L’application transforme l’idéal en un premier objectif réaliste, mesurable et adapté à la durée disponible.

Exemple :
- fréquence ;
- durée ;
- intensité ;
- période ;
- jours de réalisation.

### 3.3 Découpage en paliers

La trajectoire vers l’idéal est découpée en paliers réalisables.

Le système doit tenir compte :
- de la date de début ;
- de la date cible ;
- du niveau initial ;
- de la durée d’un palier ;
- des performances réelles du palier précédent.

### 3.4 Génération adaptative des paliers suivants

Le prochain palier ne doit pas être une simple copie du précédent.

Il doit être généré à partir du réel :
- séances faites ;
- séances non faites ;
- séances bonus ;
- durée réelle ;
- distance réelle ;
- vitesse réelle ;
- difficulté rencontrée ;
- énergie / contexte si disponible ;
- temps restant avant la date cible.

Le principe cible est donc :

**Palier 1 → observation du réel → adaptation → Palier 2 → observation → adaptation → etc.**

### 3.5 Continuité comportementale

Une action manquée ne doit pas casser la chaîne.

L’application doit pouvoir :
- proposer une alternative ;
- déplacer une séance ;
- réduire temporairement l’effort ;
- proposer une mini-victoire ;
- valoriser le mouvement plutôt que la perfection.

### 3.6 Image motivante

L’image associée à l’idéal représente le pourquoi.

Comportement attendu :
- très floue au départ ;
- défloutage progressif selon la progression réelle ;
- progression plus rapide si l’utilisateur avance mieux que prévu ;
- refloutage possible si la trajectoire régresse ;
- netteté complète réservée à l’atteinte finale.

---

## 4. Fonctionnement actuel de l’application

### 4.1 Création de l’idéal

`pages/ideaux.js` permet déjà de saisir :
- titre ;
- description émotionnelle ;
- indicateur principal ;
- date cible ;
- date de début ;
- image.

Les données sont enregistrées dans Supabase.

**État : fonctionnel.**

### 4.2 Génération automatique du plan

`generateAnchoringPlan()` reçoit notamment :
- titre ;
- indicateur ;
- date cible ;
- fréquence ;
- durée ;
- intensité ;
- jours proposés ;
- date de début.

Le moteur calcule le nombre de semaines disponibles puis génère une structure :

**objectif → mois → semaines → actions.**

Les actions sont positionnées sur de vraies dates selon les jours choisis.

**État : fonctionnel techniquement.**

### 4.3 Validation du Palier 1

L’utilisateur peut personnaliser le plan puis le valider.

Lors de la validation :
- les paramètres sont figés ;
- `plan_valide` est enregistré ;
- la date de validation est enregistrée ;
- `plan_params_valides` est sauvegardé ;
- les séances du palier sont créées dans `seances_reelles`.

**État : fonctionnel.**

### 4.4 Suivi réel des séances

`plan-action.js` permet de suivre :
- fait / non fait ;
- durée réelle ;
- distance ;
- vitesse.

Les informations sont persistées dans `seances_reelles`.

**État : fonctionnel.**

### 4.5 Séances bonus

L’application permet d’ajouter des séances bonus et de les sauvegarder.

**État : présent mais incomplet fonctionnellement.**

### 4.6 Navigation vers le plan détaillé

La navigation vers `/plan-action?id=...` existe désormais.

**État : fonctionnel.**

---

## 5. Écart majeur n°1 — le moteur n’est pas encore adaptatif

C’est l’écart principal entre la vision métier et l’implémentation actuelle.

`generateAnchoringPlan.js` sait découper une période et générer des séances.

Il ne sait pas encore analyser le palier réellement exécuté afin de construire le suivant.

Le générateur conserve essentiellement :
- la même fréquence ;
- la même durée ;
- la même intensité ;
- les mêmes jours proposés.

Il ne prend pas encore en compte :
- le taux de réalisation réel ;
- les échecs ;
- les bonus ;
- l’évolution de la vitesse ;
- l’évolution de la durée ;
- le niveau de difficulté ;
- l’avance ou le retard par rapport à la trajectoire.

### Conséquence

Aujourd’hui, l’application sait principalement :

**planifier → afficher → enregistrer.**

La cible est :

**planifier → observer → comprendre → adapter → replanifier.**

---

## 6. Écart majeur n°2 — le moteur est encore très orienté course à pied

Le générateur se présente comme générique, mais plusieurs valeurs sont codées autour de la course :
- titre généré avec « Courir » ;
- `action_type: 'course'` ;
- intensité par défaut `7,6 km/h` ;
- fréquence 3 ;
- durée 15 minutes ;
- jours lundi / mercredi / samedi ;
- moment par défaut `matin`.

### Conséquence

Le module Idéaux n’est pas encore réellement universel.

Il fonctionne surtout comme un prototype d’ancrage appliqué au cas de la course à pied.

Avant d’étendre le module à d’autres idéaux, il faudra séparer :
- la logique générique d’un idéal ;
- les paramètres propres à un domaine d’action.

---

## 7. Écart majeur n°3 — défloutage de l’image partiellement implémenté mais incohérent

Le code de `plan-action.js` contient désormais une logique de calcul du blur.

Cependant, cette logique semble rechercher les séances via une propriété de type :

`ideal.seances_reelles`

alors que les séances sont chargées séparément depuis la table `seances_reelles` puis stockées dans l’état React `reel`.

Aucun mécanisme explicite n’a été identifié indiquant que la requête sur `ideaux` hydrate automatiquement `ideal.seances_reelles`.

### Risque

Le nombre de paliers validés peut rester à zéro ou être mal calculé, ce qui empêcherait le défloutage de refléter la progression réelle.

### Statut

**Code présent, comportement à considérer comme non fiabilisé tant qu’un test fonctionnel complet n’a pas confirmé la cohérence des données utilisées.**

---

## 8. Écart majeur n°4 — durée du palier incohérente entre les pages

`ideaux.js` utilise une durée dynamique :

`planParams.palierDuree || 4`

Mais `plan-action.js` contient plusieurs occurrences de :

`const nbSemaines = 4`

### Conséquence

Un palier configuré à 2, 6 ou un autre nombre de semaines pourrait être correctement représenté dans une partie de l’application mais traité comme un palier de 4 semaines dans une autre.

Cette incohérence doit être supprimée avant de développer les paliers adaptatifs.

---

## 9. Écart majeur n°5 — sémantique des séances bonus incomplète

La vision métier distingue au moins deux types de bonus :

### Bonus supplémentaire

L’utilisateur fait plus que prévu.

Effets possibles :
- augmente le niveau de réalisation ;
- peut accélérer légèrement la progression ;
- peut influencer positivement le palier suivant.

### Bonus de remplacement

L’utilisateur remplace une séance planifiée par une autre.

Effets possibles :
- ne doit pas être compté comme une séance supplémentaire ;
- doit remplacer une séance prévue dans les statistiques ;
- doit conserver la continuité du plan.

### État actuel

Les séances bonus existent, mais cette distinction métier n’est pas encore totalement portée par le calcul de progression et les statistiques.

---

## 10. Écart majeur n°6 — adaptation comportementale absente

La vision officielle prévoit trois règles fortes :

1. valoriser le mouvement plutôt que la perfection ;
2. toujours proposer un plan B réaliste ;
3. toujours relier l’action au rêve.

Le système devrait pouvoir réagir à des situations comme :
- deux séances manquées ;
- baisse d’énergie ;
- semaine totalement réussie ;
- séance remplacée ;
- progression supérieure au plan ;
- changement d’emploi du temps.

### État actuel

L’application enregistre les comportements mais ne les interprète quasiment pas encore.

Elle fait actuellement davantage du **tracking** que du **coaching adaptatif**.

---

## 11. Écart architectural — modèle de données simplifié par rapport à la vision initiale

La vision métier prévoyait :

**Ideaux → Objectifs → Routines → Actions → Alternatives.**

L’implémentation réelle repose surtout sur :
- `ideaux` ;
- `plan_data` JSON ;
- `plan_params_valides` ;
- `seances_reelles`.

Ce choix est acceptable pour un MVP et évite une architecture inutilement complexe.

Cependant, il peut devenir limitant lorsque le système devra :
- historiser plusieurs versions d’un objectif ;
- remplacer une routine indépendamment du reste ;
- analyser des comportements sur plusieurs paliers ;
- gérer plusieurs alternatives ;
- conserver les décisions adaptatives prises par le moteur.

### Décision à ne pas prendre trop tôt

Il n’est pas recommandé de créer immédiatement cinq nouvelles tables simplement pour coller au document historique.

Il faudra réévaluer le modèle au moment de construire le moteur adaptatif.

---

## 12. Sujet Auth / user_id à auditer

Le modèle métier prévoit `user_id` sur `ideaux` et les scripts de migration ajoutent cette colonne.

Une documentation historique signalait également que certaines lignes `ideaux` avaient été retrouvées avec `user_id = NULL` lors d’une migration.

Dans le code client audité :
- `fetchIdeaux()` récupère les lignes de `ideaux` sans filtre utilisateur explicite ;
- la création d’un idéal ne renseigne pas explicitement `user_id` dans l’objet d’insertion observé ;
- `plan-action.js` récupère l’idéal par son `id`.

Cela ne permet pas de conclure à une fuite de données, car les RLS Supabase peuvent assurer l’isolation côté base.

### Conclusion

Avant de considérer le module comme pleinement multi-utilisateur, il faut auditer :
- les policies RLS de `ideaux` ;
- les policies RLS de `seances_reelles` ;
- l’association automatique ou explicite du `user_id` ;
- le rattachement des anciennes lignes au compte utilisateur.

---

## 13. Ancienne documentation partiellement obsolète

Le document `docs/conformité Ideaux` contient des constats historiquement utiles, mais plusieurs ont depuis évolué.

Exemples :
- navigation vers `plan-action` corrigée ;
- bouton de validation présent ;
- séances chargées depuis Supabase ;
- séances bonus présentes ;
- tentative de défloutage désormais présente.

### Règle de travail

Ne pas reprendre les anciennes TODO telles quelles.

Toujours vérifier le code actuel avant de considérer un élément comme manquant.

---

## 14. État des lieux consolidé

| Domaine | État réel |
|---|---|
| Création d’un idéal | 🟢 Fonctionnel |
| Description émotionnelle | 🟢 Fonctionnel |
| Indicateur mesurable | 🟢 Fonctionnel |
| Date cible | 🟢 Fonctionnel |
| Upload image motivante | 🟢 Fonctionnel |
| Génération d’un plan | 🟢 Fonctionnelle techniquement |
| Personnalisation initiale | 🟢 Présente |
| Validation Palier 1 | 🟢 Fonctionnelle |
| Création séances Supabase | 🟢 Fonctionnelle |
| Suivi fait / non fait | 🟢 Fonctionnel |
| Durée / distance / vitesse réelles | 🟢 Présentes |
| Séances bonus | 🟡 Présentes mais incomplètes |
| Navigation vers plan détaillé | 🟢 Fonctionnelle |
| Défloutage image | 🟠 Code présent mais logique non fiabilisée |
| Progression multi-paliers | 🟠 Structure partielle |
| Génération Palier 2 depuis le réel | 🔴 Absente |
| Adaptation au retard | 🔴 Absente |
| Adaptation à l’avance | 🔴 Absente |
| Plans B / alternatives | 🔴 Absents |
| Analyse énergie / contexte | 🔴 Absente |
| Messages comportementaux personnalisés | 🔴 Absents |
| Objectifs génériques hors course | 🔴 Non réellement généralisés |
| Type bonus remplacement / supplémentaire | 🟠 Incomplet |
| Statistiques comportementales | 🟠 Incomplètes |
| Lien avec autres modules de l’app | 🔴 Très faible |
| Isolation explicite `user_id` côté module | 🟠 À auditer avec RLS/Auth |

---

## 15. Définition du vrai périmètre futur Idéaux

Le cœur du module doit rester simple à exprimer :

**JE RÊVE → JE TRANSFORME LE RÊVE EN TRAJECTOIRE → JE VIS LA TRAJECTOIRE → L’APP OBSERVE → ELLE ADAPTE → JE VOIS MON IDÉAL SE RAPPROCHER.**

Aujourd’hui, l’application couvre surtout :

**JE RÊVE → L’APP GÉNÈRE → JE COCHE.**

Les fondations sont donc bien présentes.

La différence entre l’existant et la vision cible réside principalement dans le **moteur adaptatif**, qui doit transformer les données réelles de l’utilisateur en décisions de progression pertinentes.

---

## 16. Conclusion d’audit

Le module Idéaux dispose déjà d’un socle exploitable :
- création de l’idéal ;
- génération du plan ;
- validation ;
- séances réelles ;
- persistance Supabase ;
- navigation ;
- premières briques de progression.

La priorité future ne doit donc pas être de reconstruire ces fondations.

Le chantier central est de fiabiliser puis construire la couche intelligente :
- cohérence des paliers ;
- progression réelle ;
- bonus correctement interprétés ;
- génération adaptative du palier suivant ;
- alternatives ;
- lien comportement ↔ idéal ;
- généralisation au-delà de la course ;
- cohérence Auth/RLS.

Ce document constitue désormais la **base de référence d’état des lieux du module Idéaux** avant toute nouvelle implémentation.

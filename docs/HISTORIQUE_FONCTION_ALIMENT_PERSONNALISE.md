# Historique de la réflexion sur l'ajout d'aliment personnalisé et la gestion avancée des repas

---

## Fil rouge complet — Historique enrichi de la fonctionnalité « Ajout d’aliment personnalisé »

### 0. Brainstorming initial & genèse
- **Objectif utilisateur** : Permettre à chacun d’ajouter un aliment absent du référentiel, de façon guidée, rapide, et réutilisable, tout en gardant la traçabilité et la qualité des données.
- **Problématique** : Les référentiels globaux ne couvrent pas tous les usages, d’où la nécessité d’un référentiel utilisateur, fusionné à l’autocomplete, mais privé par défaut.
- **Premières idées** :
	- Détection automatique d’absence dans l’autocomplete
	- Proposition d’ajout rapide (bouton/lien)
	- Formulaire guidé (nom, catégorie, portion, kcal, QN…)
	- Stockage dans foods_user, visible uniquement par l’utilisateur
	- Pipeline communautaire (modération, enrichissement global) envisagé pour le futur

### 1. Structuration technique et planification
- **Modèles de données** :
	- foods_global (officiel, partagé)
	- foods_user (personnel, privé)
	- food_aliases (synonymes, optionnel)
	- meal_templates (repas types)
- **Séparation stricte** entre global/user, privacy garantie
- **Fusion dynamique** dans tous les composants de saisie
- **Validation** : anti-doublon, cohérence QN/kcal, conversion portions
- **Extensibilité** : modération, suggestions communautaires, templates repas

### 2. Documentation, plan d’action et validation
- **Documentation** :
	- Cahier technique, plan d’enrichissement, historique des choix
	- Plan d’implémentation détaillé (phases, priorités, TODO)
- **Validation** :
	- Plan validé étape par étape avant chaque modification
	- Rollback systématique possible (sauvegardes, backups, git)

### 3. Implémentation progressive (extraits du fil d’échange)
- **Phase 1** : Enrichissement du référentiel global (de 11 à 187 aliments, ajout QN, portionDefaut, unité, kcalParUnite)
- **Phase 2** : Correction du doublon local, import du référentiel unique, calcul automatique des kcal, autocomplete intelligent, UX améliorée
- **Phase 3** : (optionnel) Conscience alimentaire, bienfaits, affichage enrichi
- **Phase 4** : (optionnel) Ajout d’aliments personnalisés (foods_user), formulaire guidé, fusion suggestions, modération future
- **Phase 5** : (à faire) Statistiques détaillées, migration BDD, adaptation RepasBloc.js, affichage réel dans le tableau de bord

#### Extraits de décisions et échanges clés :
- « Si on part sur référentiel, faudra tout recoder ? » → Non, enrichissement et correction ciblée, pas de refonte
- « Fusionner référentiel + aliments custom dans suggestions »
- « Formulaire complet ajout aliment, validation temps réel, suggestions QN selon catégorie »
- « Détection autocomplete vide, affichage bouton “Ajouter aliment”, modal formulaire »
- « Hook useUserReferentiel(user_id) pour fusionner global + custom »
- « Pipeline communautaire : modération, mapping user/global, suggestions »

### 4. Debug, tests, corrections et retours utilisateur
- **Problème rencontré** : Formulaire d’ajout personnalisé non affiché (erreur de logique de rendu conditionnel)
- **Corrections** : Ajout du bloc de rendu conditionnel, handler manquant, debug output pour traçabilité
- **Tests** : Plusieurs cycles de test utilisateur, validation du workflow complet (saisie, ajout, réutilisation)
- **Feedback** : Correction immédiate des bugs, explications détaillées, audit trail maintenu

### 5. Documentation et synthèse des choix
- **Docs clés** :
	- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md : objectifs, backlog, estimation effort, composants à créer, bénéfices
	- CONVERSATION_COPILOT_PREPARATION_IMPLEMENTATION_REFERENTIEL.md : analyse complète, différences plan/repas réel, étapes techniques, TODO, validation
	- PLAN_ENRICHISSEMENT_REFERENTIEL_723.md : plan d’enrichissement massif, checklist, rollback
- **Synthèse** :
	- Historique complet, aucune perte de données, toutes les décisions, corrections, et validations sont tracées ici
	- Ce document est la référence unique pour toute évolution future de la fonctionnalité « ajout d’aliment personnalisé »

### 6. Exemples de flux utilisateur (UX)
1. L’utilisateur saisit un aliment absent → message “Aliment non trouvé. Voulez-vous l’ajouter ?”
2. Clique “Ajouter cet aliment” → formulaire guidé (nom, catégorie, portion, kcal, QN…)
3. Validation → aliment ajouté à foods_user, disponible dans l’autocomplete
4. Réutilisation immédiate possible, modération future envisagée

### 7. Points de vigilance et extension future
- **Privacy** : foods_user strictement privé, jamais fusionné dans global sans modération
- **Conversion portions** : gestion fine des unités, suggestion à l’utilisateur
- **Validation temps réel** : dans le formulaire, feedback immédiat
- **Extensibilité** : pipeline communautaire, templates repas, suggestions IA

---

**Ce fil rouge a été enrichi à partir de l’intégralité de notre échange, sans aucune perte de données, pour garantir la traçabilité, la qualité, et l’auditabilité de la fonctionnalité.**


## 1. Contexte initial

## 2. Prérequis techniques et modèles de données

### a) Modèles de données (JS ou Supabase)
- **foods_global** (aliments officiels)
	- id, nom, categorie, sousCategorie, portionDefaut, unite, kcal, qn, alternatives, marque, etc.
- **foods_user** (aliments utilisateur)
	- id, user_id, nom, categorie, sousCategorie, portionDefaut, unite, kcal, qn, alternatives, marque, date_ajout, statut
- **food_aliases** (optionnel)
	- id, food_id, alias, type (global/user)
- **meal_templates** (repas types)
	- id, user_id, nom, tags, date_ajout
- **meal_template_items**
	- id, template_id, food_id, quantite, unite

### b) Points d'attention
- Séparation stricte entre global et user (privacy, accès, fusion des listes en autocomplete)
- Conversion des portions (g, CS, pièce...) et gestion des cas ambigus
- Validation des données (doublons, valeurs aberrantes, cohérence QN, kcal, etc.)
- Extensibilité pour la modération et l'enrichissement communautaire

## 3. Flux UX détaillé

### a) Ajout d'aliment personnalisé
1. L'utilisateur saisit un aliment dans l'autocomplete
2. Si aucun résultat global/user :
	 - Affichage : "Aliment non trouvé. Voulez-vous l'ajouter ?"
	 - Bouton : "Ajouter cet aliment"
3. Formulaire guidé :
	 - Nom (pré-rempli)
	 - Catégorie (sélecteur)
	 - Sous-catégorie (dynamique)
	 - Unité (g, CS, pièce...)
	 - Quantité de référence
	 - Kcal (pour 100g ou portion)
	 - QN (assistant ou suggestion)
	 - PortionDefaut (auto ou manuel)
	 - Marque/alternatives (optionnel)
4. Validation et enregistrement dans foods_user
5. L'aliment devient disponible dans l'autocomplete pour l'utilisateur

### b) Création de repas composés (templates)
1. L'utilisateur ajoute plusieurs aliments à un repas
2. Peut enregistrer ce repas comme "template" (nom, tags)
3. Peut réutiliser, dupliquer, modifier ce template
4. Les repas composés sont proposés dans la planification

### c) Pipeline communautaire (plus tard)
1. L'utilisateur peut proposer un aliment perso pour le global
2. Passage en table food_submissions pour modération
3. Si validé, ajout au global et mapping user/global

## 4. Points de vigilance pour le développement
- Prévoir la fusion des listes (global + user) dans tous les composants de saisie
- Gérer la privacy (foods_user privé, foods_global public)
- Prévoir la logique de conversion des portions et la suggestion à l'utilisateur
- Prévoir la validation temps réel dans le formulaire d'ajout
- Préparer l'architecture pour l'extension future (modération, suggestions communautaires)

---

## 2. Brainstorming et structuration
### a) Séparation des référentiels
- **foods_global** : référentiel officiel, stable, partagé par tous.
- **foods_user** : référentiel personnel, visible uniquement par l'utilisateur, pour ses ajouts et variantes.
- **food_aliases** (optionnel) : gestion des synonymes et variantes d'aliments.
- **food_submissions** (plus tard) : pipeline de modération pour proposer un aliment utilisateur au global.

### b) Flux UX proposé
- Détection automatique d'absence dans l'autocomplete.
- Proposition d'ajout rapide (bouton/lien).
- Formulaire guidé (nom, catégorie, portion, kcal, QN, etc.).
- Stockage dans foods_user, visible uniquement par l'utilisateur.
- Possibilité d'envoyer à la modération (plus tard).

### c) Catégorisation des repas
- **Nom du plat/repas** : ex. "Poulet basquaise", "Salade César" (catégorie culinaire).
- **Tag d'usage** : ex. "petit-déj", "collation", "rapide" (moment ou contexte).
- **Catégorie d'aliment** : féculent, protéine, légume, extra, etc. (pour chaque aliment).

### d) Gestion des portions et conversions
- Prise en charge des cas "kcal pour 100g" ou "kcal par portion".
- Conversion automatique ou guidée (ex : "1 CS = ? g").
- Stockage du coefficient de conversion dans foods_user si besoin.

### e) Repas composés (templates)
- **meal_templates** : structure pour enregistrer des repas types (multi-aliments).
- **meal_template_items** : chaque ligne = un aliment (global ou user), quantité, unité.
- Réutilisation, duplication, modification rapide.
- Distinction claire entre "nom du plat/repas" et "tag d'usage".

### f) Pipeline communautaire (plus tard)
- **food_submissions** : modération, validation, fusion propre dans le global.
- Mapping entre aliments user et global pour suggestions et migration.

## 3. Prochaines étapes techniques
- Définir les modèles JS/Supabase pour foods_user, meal_templates, etc.
- Créer le flux UX dans RepasBloc.js : détection + ajout aliment personnalisé.
- Préparer la structure pour meal_templates et meal_template_items.
- Prévoir la logique de conversion et de suggestion de portion.

## 4. Points de vigilance
- Bien distinguer "catégorie repas" (nom du plat/recette) et "tag d'usage" (moment, contexte).
- Ne jamais fusionner automatiquement le référentiel utilisateur dans le global sans modération.
- Prévoir la gestion fine de la privacy (foods_user privé, foods_global public).

---

**Document généré le 11/01/2026 pour garder trace de la réflexion et des choix structurants sur l'évolution de la saisie et du suivi des repas dans l'application.**

# Passation — Recettes intelligentes ↔ Planning ↔ Suivi

> Document vivant du chantier `recettes-intelligentes-planning-suivi`.
> Il doit être mis à jour au fur et à mesure de l’audit, des décisions produit et des développements.

## 1. Branche et périmètre

- Branche de travail : `recettes-intelligentes-planning-suivi`
- Branche de départ : `plan-alimentaire-intelligent-chatgpt`
- Ne pas travailler directement sur `main`.
- Périmètre : recettes intelligentes, qualité nutritionnelle, repas composés, préparation immédiate, planning, suivi réel, historique/satiété, valeurs sûres et raccord futur avec OBSERVE / ALIGN / ADAPT / GROW.

## 2. Objectif produit validé

Construire une continuité unique plutôt qu’une fonctionnalité Recettes isolée :

`Choisir / générer une recette → préparer maintenant OU planifier → enregistrer ce qui a réellement été mangé → observer satiété/ressenti → enrichir l’historique → identifier ce qui fonctionne pour cet utilisateur → réutiliser cette connaissance dans les futures propositions.`

Règle structurante : **la recette est un modèle ; le repas consommé est une occurrence réelle**. Modifier les quantités consommées ne doit donc pas modifier le modèle enregistré.

## 3. Inventaire vérifié

### `lib/repasComposes.js`

Socle métier déjà très proche de ce dont les recettes intelligentes ont besoin.

Fonctions présentes et vérifiées :

- `normaliserComposantRepas`
- `validerCompositionRepas`
- `calculerResumeRepasCompose`
- `ajusterCompositionRepas`
- `construirePayloadRepasCompose`
- `normaliserRepasCompose`
- `construireOccurrencesPlanifiees`
- `construireOccurrencesReelles`
- `listerRepasComposes`
- `creerRepasCompose`
- `modifierRepasCompose`
- `supprimerRepasCompose`

Constats :

- Un repas composé exige actuellement au moins 2 aliments.
- Chaque composant possède déjà nom, catégorie, quantité, unité, kcal et éventuellement QN.
- Le résumé calcule les kcal totales et un QN moyen pondéré par les kcal.
- Les quantités d’une occurrence peuvent être ajustées avec recalcul proportionnel des kcal.
- Les modèles sont persistés dans `repas_complets`.
- Un modèle peut être converti en lignes de `repas_planifies`.
- Un modèle peut être converti en lignes de repas réel partageant un même `occurrence_repas_id`.
- L’occurrence réelle peut porter heure, satiété, ressenti, note et tag.

**Décision d’architecture provisoire :** ne pas créer un deuxième moteur de composition pour les recettes. Étendre/réutiliser ce socle lorsque cela est possible.

### `components/GestionRepasComposes.js`

Fonctionnalités vérifiées :

- construit un modèle à partir des aliments déjà présents dans un repas du planning ;
- sauvegarde le modèle dans `repas_complets` ;
- liste les modèles personnels ;
- planifie un modèle dans `repas_planifies` ;
- modification ;
- duplication ;
- suppression sans supprimer les occurrences déjà planifiées.

Point UX important : l’interface actuelle est une interface fonctionnelle de gestion de modèles, pas encore une expérience grand public de découverte de recettes.

### `components/SaisieRepasCompose.js`

Fonctionnalités vérifiées :

- sélection d’un modèle `repas_complets` ;
- ajustement des quantités au moment de la consommation ;
- recalcul des kcal de l’occurrence ;
- saisie heure, satiété, ressenti et note ;
- création de toutes les lignes réelles en une action ;
- passage de ces occurrences au mécanisme `onSave` du suivi.

Ce composant confirme techniquement la séparation **modèle / occurrence** recherchée pour les recettes.

### `components/RecettesPhase1Modal.js`, `RecettesPhase2Modal.js`, `RecettesPhase3Modal.js`

Audit commencé et structure confirmée : recettes spécialisées de reprise alimentaire après jeûne, codées directement dans les composants avec ingrédients et variantes de préparation Cookeo/Marmite.

**Décision :** ne pas utiliser ces composants comme bibliothèque générale de recettes intelligentes. Les conserver dans leur parcours spécialisé. Ils pourront éventuellement servir de référence UX pour l’affichage des ingrédients et des étapes.

## 4. Architecture cible actuellement retenue

### A. Un modèle de recette réutilisable

La future recette doit pouvoir porter au minimum :

- nom ;
- composition structurée compatible avec le moteur de repas composé ;
- quantités et unités ;
- kcal calculables via les moteurs existants ;
- temps de préparation ;
- difficulté ;
- instructions ;
- tags/contexte utiles ;
- origine éventuelle : personnelle, catalogue, générée par IA.

Les champs exacts et la nécessité d’une évolution Supabase restent à déterminer après audit complet.

### B. Deux actions principales

**Préparer maintenant** : partir du modèle, permettre l’ajustement des quantités réellement consommées, puis créer une occurrence dans le suivi sans double saisie.

**Ajouter à mon planning** : transformer le modèle en repas planifié en réutilisant le moteur existant, afin de conserver les fonctionnalités de déplacement du planning, liste de courses et comparaison prévu/réel.

### C. Boucle d’apprentissage

La recette ne doit pas être déclarée arbitrairement « bonne pour l’utilisateur ». L’application doit apprendre à partir des occurrences réelles : satiété, ressenti et autres données réellement disponibles dans le suivi.

Les futures « valeurs sûres » devront être fondées sur des répétitions et signaux observés, pas sur une simple classification théorique de la recette.

## 5. Qualité nutritionnelle — règle de conception

Ne pas confondre :

1. **composition nutritionnelle objective** du repas ;
2. **expérience personnelle observée** chez l’utilisateur.

Le chantier devra vérifier les moteurs QN déjà présents avant de créer une nouvelle notation. Une éventuelle règle nutritionnelle nouvelle devra être documentée et fondée sur un référentiel fiable ; ne pas inventer un score punitif de type « mauvais repas ».

## 6. Éléments à auditer avant développement

- `lib/repasReperes.js` : logique actuelle de détection des repas qui fonctionnent bien pour l’utilisateur.
- `lib/repasPersistence.js` : contrat réel de persistance dans `repas_reels`.
- `lib/planificationRepas.js` et `PlanificateurRepas` : intégration exacte au planning et contraintes de déplacement.
- moteur de liste de courses : capacité à agréger une recette/composition.
- référentiel aliments + moteur calories/QN : source de vérité à réutiliser.
- `pages/suivi.js` : point d’entrée réel des occurrences et mécanismes post-enregistrement.
- structure Supabase de `repas_complets`, `repas_planifies`, `repas_reels` et éventuelles tables déjà liées aux recettes.
- recettes Phase 4/5 : vérifier uniquement les dépendances et éventuelles briques génériques réutilisables.

## 7. Règles anti-régression

- Ne pas toucher à `main`.
- Ne pas casser le parcours existant des repas composés.
- Ne pas dupliquer un moteur déjà existant.
- Ne pas modifier rétroactivement un modèle lorsqu’une occurrence réelle est ajustée.
- Ne pas supprimer l’historique.
- Toute évolution doit rester compatible avec les repas mono-aliment et multi-aliments déjà gérés par le suivi.
- Commits ciblés et vérifiables.

## 8. Journal du chantier

### 17/09/2026 — Initialisation

- Branche dédiée `recettes-intelligentes-planning-suivi` créée depuis `plan-alimentaire-intelligent-chatgpt`.
- Audit des composants Recettes Phase 1 à 3 commencé.
- Audit complet de `lib/repasComposes.js`, `GestionRepasComposes.js` et `SaisieRepasCompose.js`.
- Conclusion initiale : le moteur `repas_complets` / repas composé constitue un candidat solide pour servir de socle aux recettes, avec extension plutôt que duplication.
- Aucun développement fonctionnel de recette intelligente réalisé à ce stade : phase d’audit et d’architecture uniquement.

---

**À maintenir :** chaque constat technique confirmé, décision métier, migration, fichier modifié, test ajouté et commit du chantier devra être ajouté ici.
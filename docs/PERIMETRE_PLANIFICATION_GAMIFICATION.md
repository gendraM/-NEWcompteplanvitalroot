# Chantier — Planification des repas × Gamification

## Statut

Branche de travail : `planification-gamification-chatgpt`

Branche socle : `plan-alimentaire-intelligent-chatgpt`

Commit de départ : `a1db5f70e7eb850bc3aebd84eb4bf1ac0b65c262`

`main` ne doit pas être modifiée dans ce chantier.

## Objectif

Mettre en conformité l’expérience de planification des repas avec la vision produit de Mon Plan Vital : le planning ne doit pas seulement enregistrer des aliments. Il doit devenir un point d’apprentissage, d’anticipation et de gamification, sans devenir une application dans l’application et sans rendre l’expérience punitive.

La boucle cible est :

`Je planifie → je compose → je comprends → j’expérimente → l’application observe → elle propose éventuellement une action ou un défi → ce qui est appris améliore les prochaines planifications.`

Le travail doit réutiliser au maximum les moteurs existants : `PlanificateurRepas`, référentiel alimentaire utilisateur, repas composés, repas réels, repas repères, alignement plan/réel et moteur Défis V2.

## Périmètre fonctionnel

### 1. Combo recette / Compose ton assiette

Faire de la composition actuelle du repas une vraie brique pédagogique visible du planning.

L’analyse doit pouvoir reconnaître les dimensions utiles d’une assiette à partir des données réellement disponibles dans le référentiel, notamment :

- protéine ;
- légume ;
- féculent ;
- matière grasse ;
- mode de cuisson lorsque cette information peut être renseignée de façon fiable.

Il ne faut pas créer un second formulaire de repas. La brique enrichit l’assiette déjà construite dans `PlanificateurRepas`.

L’absence d’une famille alimentaire ne signifie pas automatiquement « mauvais repas ». Le moteur restitue ce qu’il observe et propose éventuellement une piste pertinente.

### 2. Capsules nutrition / cuisson contextualisées

Après ou pendant la composition, afficher seulement les capsules utiles au contexte réel de l’assiette.

Une capsule doit être courte, compréhensible, non culpabilisante et actionnable. Elle ne doit pas répéter mécaniquement la même information à chaque repas.

Le système devra distinguer au minimum : information pédagogique, suggestion facultative et opportunité comportementale pouvant devenir un défi.

### 3. Pont « Transformer cette astuce en défi »

Créer un contrat entre une capsule ou une observation du planning et le moteur de défis.

Une capsule ne doit jamais démarrer directement un défi.

Elle produit une opportunité de défi. Le moteur Défis conserve ses règles, notamment la règle métier « un seul défi actif à la fois », ses modèles de progression et ses validations automatiques, déclaratives ou mixtes.

### 4. Défis visibles dans le planning

Le planning doit pouvoir exposer le défi actif lorsqu’il est pertinent pour l’organisation des repas et permettre d’accéder aux défis disponibles sans dupliquer la page Défis.

Exemples : un défi sur la cuisson peut apparaître lors de la planification d’un dîner ; un défi sur l’extra programmé peut être visible lors de l’organisation de la semaine.

Le planning n’est pas propriétaire du moteur de défis : il en affiche uniquement le contexte utile.

### 5. Mécanismes AVANT / PENDANT / APRÈS

Raccorder progressivement les comportements alimentaires à la gamification.

AVANT : envie alimentaire, anticipation d’un extra, hésitation, programmation volontaire.

PENDANT : satiété, rythme, portion, perte partielle de contrôle ou autre observation réellement saisissable.

APRÈS : extra spontané, écart entre intention et réalité, rebond et recentrage sans punition.

Absence de donnée ne signifie jamais échec.

### 6. Module « Je revisite une envie »

Permettre d’enregistrer une envie sans la transformer en consommation réelle.

Une envie pourra ensuite être : consommée ; abandonnée naturellement ; remplacée ; reportée ; programmée à une date ultérieure.

Une envie non consommée ne doit jamais créer une fausse ligne dans `repas_reels` ou dans les extras réellement consommés.

La valorisation doit porter sur la prise de conscience et le choix, pas sur une logique morale « résister = bien / manger = mal ».

### 7. Micro-circuits contextuels

Créer de petites séquences d’accompagnement déclenchées par des difficultés observées et suffisamment fiables.

Un micro-circuit peut par exemple combiner : observation → capsule → petite action → observation suivante → bilan court.

Il ne remplace pas un défi long et ne doit pas contourner la règle d’un seul défi actif. Son rôle est l’accompagnement contextuel court.

## Architecture cible

`PlanificateurRepas`
→ moteur d’analyse de composition
→ restitution pédagogique
→ capsule contextualisée
→ éventuelle opportunité de défi
→ moteur Défis V2
→ suivi réel
→ observations AVANT / PENDANT / APRÈS
→ micro-circuit ou bilan
→ apprentissage réutilisable dans le planning.

Les moteurs d’analyse doivent autant que possible être des fonctions métier pures et testables, séparées de l’interface React et des écritures Supabase.

## Plan d’action

### Lot 1A — Audit du référentiel et moteur de composition

1. Inventorier les catégories et métadonnées réellement disponibles dans le référentiel utilisé par le planning.
2. Définir la correspondance fiable entre les données existantes et les dimensions protéine / légume / féculent / matière grasse.
3. Vérifier comment intégrer la cuisson sans inventer une donnée qui n’existe pas.
4. Créer un moteur pur d’analyse de composition.
5. Ajouter les tests unitaires correspondants.

Aucune modification de Supabase n’est autorisée dans ce sous-lot sans nécessité démontrée.

### Lot 1B — Intégration « Compose ton assiette »

1. Intégrer le résultat du moteur dans `PlanificateurRepas`.
2. UI mobile-first et compacte.
3. Mise à jour instantanée quand un aliment est ajouté, retiré ou modifié.
4. Aucun blocage de l’enregistrement pour une assiette jugée incomplète.
5. Vérifier repas repères, repas enregistrés et suggestions.

### Lot 1C — Cuisson

1. Auditer les informations de cuisson déjà présentes dans l’application et le référentiel.
2. Réutiliser une donnée existante si possible.
3. Si une nouvelle donnée est indispensable, définir son contrat avant toute migration.
4. Raccorder la cuisson à l’analyse pédagogique.

### Lot 1D — Capsules contextualisées

1. Définir les types de capsules.
2. Définir les règles de déclenchement.
3. Empêcher les répétitions inutiles.
4. Distinguer information, suggestion et opportunité comportementale.
5. Tester les principaux cas de composition.

### Lot 1E — Contrat capsule → opportunité de défi

1. Définir une structure d’opportunité indépendante de l’UI.
2. Faire correspondre les opportunités aux défis existants lorsqu’un lien métier réel existe.
3. Ne jamais créer ou démarrer automatiquement un défi.
4. Respecter la règle d’un seul défi actif.
5. Préparer le raccord à `defis-v2` sans fusion globale de branche.

### Lot 2 — Défis dans le planning

1. Récupérer le défi actif de manière fiable.
2. Afficher uniquement les informations pertinentes dans `/plan`.
3. Contextualiser certaines étapes du défi au jour ou au repas planifié.
4. Donner accès aux défis disponibles sans dupliquer l’espace Défis.

### Lot 3 — « Je revisite une envie »

1. Définir le modèle métier d’une envie distincte d’une consommation.
2. Définir les états : ouverte, consommée, abandonnée, remplacée, reportée, programmée.
3. Définir la persistance Supabase avec `user_id` obligatoire si une nouvelle table est nécessaire.
4. Créer l’entrée utilisateur AVANT consommation.
5. Permettre la programmation ultérieure dans le planning.
6. Garantir qu’une envie seule n’alimente jamais `repas_reels` ni le budget d’extras consommés.

### Lot 4 — AVANT / PENDANT / APRÈS

1. Cartographier les données existantes utilisables comme preuves ou observations.
2. Ajouter uniquement les saisies réellement nécessaires.
3. Raccorder les observations au moteur de gamification.
4. Conserver la règle : absence de donnée ≠ échec.
5. Éviter les sollicitations quotidiennes répétitives.

### Lot 5 — Micro-circuits contextuels

1. Définir le contrat d’un micro-circuit.
2. Définir des déclencheurs suffisamment robustes.
3. Construire quelques circuits prioritaires avant d’élargir le catalogue.
4. Raccorder capsules, actions et observations.
5. Produire un bilan non punitif et une éventuelle suggestion pour le prochain planning.

## Hors périmètre immédiat

Ce chantier ne doit pas :

- refondre entièrement le moteur Défis V2 ;
- supprimer ou réécrire l’historique utilisateur ;
- modifier `main` directement ;
- refaire le planificateur de zéro ;
- créer une deuxième logique de repas parallèle à `repas_planifies` / `repas_reels` ;
- casser la persistance multi-aliments ou les repas composés ;
- réintroduire une conformité alimentaire binaire et punitive ;
- considérer une absence de saisie comme un échec ;
- démarrer automatiquement un défi depuis une capsule ;
- fusionner en bloc `defis-v2` dans cette branche.

Le défi de réduction progressive des quantités et l’introduction progressive du sport / activateurs / accélérateurs restent des sujets à auditer ultérieurement. Ils ne doivent pas être oubliés, mais ils ne font pas partie du raccord initial décrit ici.

## Règles de développement

- Commits petits et ciblés.
- Tests avant et après chaque modification métier importante.
- Mobile prioritaire.
- Réutiliser l’existant avant de créer une nouvelle table ou un nouveau composant.
- Toute modification Supabase doit être justifiée et compatible avec `user_id` et les règles de sécurité existantes.
- Ne pas supprimer l’historique.
- Ne pas toucher à `main`.
- Avant tout raccord avec une branche développée en parallèle, comparer les deux états et intégrer seulement les éléments nécessaires.
- Documenter les décisions métier importantes dans ce fichier ou dans une passation dédiée.

## Critère de réussite global

Le chantier est réussi lorsque l’utilisateur peut organiser un repas dans son planning, comprendre simplement la composition de son assiette, recevoir une information réellement contextualisée, éventuellement transformer cette piste en travail comportemental, retrouver son défi dans le contexte où il est utile et faire remonter ses apprentissages réels vers ses prochaines planifications — sans culpabilisation, sans duplication fonctionnelle et sans perte de données.

# Chantier Recettes intelligentes — audit et passation

## Branche et périmètre

Branche de travail : `recettes-intelligentes-planning-suivi`

Branche source au démarrage : `plan-alimentaire-intelligent-chatgpt`.

Périmètre strict : recettes intelligentes, repas composés, action « préparer maintenant », raccord au planning existant, suivi réel, historique d’occurrences, satiété/ressenti, valeurs sûres personnelles et alimentation des moteurs OBSERVE / ALIGN sans recréer un moteur parallèle.

## Frontière avec le chantier parallèle planification × gamification

Branche parallèle auditée : `planification-gamification-chatgpt`.

Les deux branches partent du même socle : `plan-alimentaire-intelligent-chatgpt`, commit de départ commun `a1db5f70e7eb850bc3aebd84eb4bf1ac0b65c262` au moment de leur création.

La branche `planification-gamification-chatgpt` est propriétaire des sujets suivants :

- « Compose ton assiette » dans le planning ;
- moteur d’analyse de composition protéine / légume / féculent / matière grasse ;
- cuisson lorsqu’elle peut être renseignée de façon fiable ;
- capsules nutrition / cuisson contextualisées ;
- contrat capsule → opportunité de défi ;
- exposition contextuelle des défis dans le planning ;
- mécanismes AVANT / PENDANT / APRÈS liés à la gamification ;
- « Je revisite une envie » ;
- micro-circuits contextuels.

La présente branche est propriétaire des sujets suivants :

- modèle et expérience des recettes intelligentes ;
- bibliothèque / découverte / réutilisation des recettes ;
- transformation d’une recette modèle en repas composé utilisable ;
- action « préparer maintenant » ;
- action « ajouter au planning » en réutilisant le planificateur existant ;
- lien stable recette modèle → occurrences réellement consommées ;
- historique d’utilisation d’une recette ;
- exploitation des données personnelles réellement disponibles (satiété / ressenti / alignement) ;
- construction de « valeurs sûres » personnelles sur preuves suffisantes ;
- restitution de ces apprentissages aux moteurs OBSERVE / ALIGN sans les dupliquer.

### Zone de chevauchement à protéger

Les deux branches touchent potentiellement `PlanificateurRepas`, le référentiel alimentaire et les contrats planifié/réel. Elles ne doivent donc pas développer deux moteurs concurrents.

Le moteur de qualité/composition nutritionnelle du planning appartient à `planification-gamification-chatgpt`. Cette branche recettes pourra le consommer après consolidation ciblée lorsque son contrat sera stabilisé. Aucun second moteur de composition nutritionnelle ne doit être créé ici.

Avant toute modification partagée du planificateur, comparer les deux branches et intégrer uniquement le contrat ou les éléments nécessaires. Ne pas fusionner aveuglément l’ensemble d’un chantier dans l’autre.

## Règles de chantier

- Ne jamais travailler directement sur `main`.
- Réutiliser les moteurs existants avant de créer une nouvelle brique.
- Distinguer une recette modèle d’une occurrence réellement consommée.
- Ne pas dupliquer le planning, le suivi, le calcul calorique, le moteur de composition nutritionnelle ou les moteurs comportementaux existants.
- Conserver une approche non punitive : expérience personnelle distincte d’un jugement nutritionnel.
- Documenter ici chaque découverte confirmée, écart, décision métier et raccord technique.
- Avancer par petits lots ciblés afin de limiter les régressions et faciliter les futures consolidations.

## État confirmé au démarrage

### Persistance des repas

La branche source possède `lib/repasPersistence.js` et le raccord dans `pages/suivi.js`. Le parcours accepte les repas mono ou multi-lignes et conserve `occurrence_repas_id`.

`pages/suivi.js` est documenté comme orchestrateur des écritures actives vers `repas_reels` dans le chantier de persistance.

### Repas composés

Une assiette enregistrée peut servir de modèle. Lors de sa réutilisation, les quantités peuvent être ajustées sans modifier le modèle stocké. Les calories des occurrences réelles sont recalculées à partir des quantités ajustées.

### Occurrences réelles

Les lignes partageant un `occurrence_repas_id` peuvent être reconstruites comme une seule occurrence de repas. Cette base est essentielle pour relier ultérieurement une recette modèle à ses consommations réelles.

### Alignement planifié / réel

`lib/alignementRepas.js` contient un moteur de classification documenté : repas aligné, ajusté, spontané ou libre. Les quantités et calories ne doivent pas transformer seules l’alignement en jugement binaire.

### Repas répétés / futurs « valeurs sûres »

`lib/repasReperes.js` constitue déjà un socle de détection de repas répétés : fenêtre de 15 jours, occurrences composées, seuil de répétition et signaux positifs pouvant inclure alignement, satiété ou ressenti favorable. Extras et fast-foods sont exclus. Le vocabulaire UX « repas repère » devra être réévalué dans ce chantier ; la notion produit envisagée est « valeur sûre ».

### Planning

Le planning existant possède une vue semaine, une vue 15 jours et un aperçu mois. Le déplacement des assiettes composées est documenté comme groupé afin de ne pas séparer leurs aliments. Le drag-and-drop historique doit être préservé.

## Hypothèses à vérifier — ne pas considérer comme acquises

- Structure exacte des composants `RecettesPhase1Modal` à `RecettesPhase5Modal` et leur statut réel dans l’UX actuelle.
- Modèle de données exact utilisé aujourd’hui pour les recettes.
- Étendue réelle du référentiel nutritionnel utile aux recettes.
- Signification, source et couverture du champ / indicateur QN ; son exploitation appartient au chantier planification-gamification si elle concerne l’analyse de composition.
- Tables Supabase réellement nécessaires au futur modèle recette → occurrences.
- Raccord actuel entre planning et liste de courses.
- Données de satiété et ressentis disponibles par occurrence et leur niveau de fiabilité historique.
- Interfaces existantes permettant d’alimenter OBSERVE / ALIGN / ADAPT / GROW.
- Possibilité de reconnaître une même recette à travers plusieurs consommations sans rapprochement approximatif.

## Architecture cible à confirmer après audit

`RECETTE MODÈLE`
→ ingrédients + quantités de référence + préparation + temps + difficulté + métadonnées réellement disponibles
→ `Préparer maintenant` ou `Ajouter au planning`
→ réutilisation des moteurs repas/planning existants
→ `OCCURRENCE RÉELLE`
→ quantités réellement consommées + calories + satiété/ressenti + contexte réellement disponible
→ historique de la recette
→ valeurs sûres personnelles / observations
→ OBSERVE → ALIGN → ADAPT → GROW.

Principe central : les caractéristiques objectives d’une recette et l’expérience personnelle doivent rester deux axes distincts. Une recette ne devient pas adaptée à une personne uniquement à cause de sa composition, et une expérience favorable ne doit pas être transformée en vérité nutritionnelle générale.

## Audit en cours

Prochaines vérifications propres à cette branche :

1. composants et flux Recettes Phase 1 à 5 ;
2. `repasComposes` / `SaisieRepasCompose` / `GestionRepasComposes` ;
3. modèle recette et capacité à conserver une identité stable ;
4. satiété / ressentis et rattachement aux occurrences ;
5. raccord recette → planning et liste de courses sans modifier le moteur pédagogique parallèle ;
6. contrats utilisables par OBSERVE / ALIGN ;
7. schéma Supabase concerné ;
8. écarts entre les documents de conception et le comportement réel.

## Journal

### 2026-09-17 — Initialisation

Création de la branche dédiée depuis `plan-alimentaire-intelligent-chatgpt` et création de ce document de référence. Aucun changement fonctionnel réalisé à ce stade.

### 2026-09-17 — Coordination avec `planification-gamification-chatgpt`

Audit du fichier `docs/PERIMETRE_PLANIFICATION_GAMIFICATION.md` de la branche parallèle. Chevauchement confirmé autour du planificateur, du référentiel alimentaire et des contrats planifié/réel. Répartition de responsabilité documentée ci-dessus : la qualité/composition nutritionnelle, les capsules et le pont gamification restent dans le chantier planification-gamification ; cette branche se concentre sur le cycle recette modèle → utilisation → occurrence réelle → historique → apprentissage personnel. Aucun changement fonctionnel réalisé lors de cette coordination.

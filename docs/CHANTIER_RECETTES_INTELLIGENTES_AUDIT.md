# Chantier Recettes intelligentes — audit et passation

## Branche et périmètre

Branche de travail : `recettes-intelligentes-planning-suivi`

Branche source au démarrage : `plan-alimentaire-intelligent-chatgpt`.

Périmètre strict : recettes intelligentes, qualité nutritionnelle, repas composés, action « préparer maintenant », planification, suivi réel, historique d’occurrences, satiété/ressenti, valeurs sûres personnelles et alimentation des moteurs OBSERVE / ALIGN sans recréer un moteur parallèle.

## Règles de chantier

- Ne jamais travailler directement sur `main`.
- Réutiliser les moteurs existants avant de créer une nouvelle brique.
- Distinguer une recette modèle d’une occurrence réellement consommée.
- Ne pas dupliquer le planning, le suivi, le calcul calorique ou les moteurs comportementaux existants.
- Conserver une approche non punitive : qualité nutritionnelle informative, expérience personnelle distincte du jugement nutritionnel.
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
- Étendue réelle du référentiel nutritionnel : calories seules ou macros/fibres/autres nutriments disponibles et fiables.
- Signification, source et couverture du champ / indicateur QN.
- Tables Supabase réellement nécessaires au futur modèle recette → occurrences.
- Raccord actuel entre planning et liste de courses.
- Données de satiété et ressentis disponibles par occurrence et leur niveau de fiabilité historique.
- Interfaces existantes permettant d’alimenter OBSERVE / ALIGN / ADAPT / GROW.
- Possibilité de reconnaître une même recette à travers plusieurs consommations sans rapprochement approximatif.

## Architecture cible à confirmer après audit

`RECETTE MODÈLE`
→ ingrédients + quantités de référence + préparation + temps + difficulté + métadonnées nutritionnelles réellement disponibles
→ `Préparer maintenant` ou `Ajouter au planning`
→ réutilisation des moteurs repas/planning existants
→ `OCCURRENCE RÉELLE`
→ quantités réellement consommées + calories + satiété/ressenti + contexte réellement disponible
→ historique de la recette
→ valeurs sûres personnelles / observations
→ OBSERVE → ALIGN → ADAPT → GROW.

Principe central : la qualité nutritionnelle objective et l’expérience personnelle doivent rester deux axes distincts. Une recette ne devient pas « bonne » nutritionnellement parce que l’utilisateur l’a bien vécue, et un repas nutritionnellement intéressant ne doit pas être présenté comme efficace pour cet utilisateur sans données personnelles suffisantes.

## Audit en cours

Prochaines vérifications :

1. composants et flux Recettes Phase 1 à 5 ;
2. `repasComposes` / `SaisieRepasCompose` / `GestionRepasComposes` ;
3. moteur quantités-calories et référentiel alimentaire ;
4. QN et qualité nutritionnelle ;
5. satiété / ressentis et rattachement aux occurrences ;
6. planning / liste de courses ;
7. contrats utilisables par OBSERVE / ALIGN ;
8. schéma Supabase concerné ;
9. écarts entre les documents de conception et le comportement réel.

## Journal

### 2026-09-17 — Initialisation

Création de la branche dédiée depuis `plan-alimentaire-intelligent-chatgpt` et création de ce document de référence. Aucun changement fonctionnel réalisé à ce stade.

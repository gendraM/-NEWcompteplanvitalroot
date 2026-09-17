# Chantier Recettes intelligentes — audit et passation

## Branche et périmètre

Branche de travail : `recettes-intelligentes-planning-suivi`

Branche source au démarrage : `plan-alimentaire-intelligent-chatgpt`.

Périmètre strict : recettes intelligentes, repas composés, action « préparer maintenant », raccord au planning existant, suivi réel, historique d’occurrences, satiété/ressenti, valeurs sûres personnelles et alimentation des moteurs OBSERVE / ALIGN sans recréer un moteur parallèle.

## Frontière avec le chantier parallèle planification × gamification

Branche parallèle auditée : `planification-gamification-chatgpt`.

Les deux branches partent du même socle : `plan-alimentaire-intelligent-chatgpt`, commit de départ commun `a1db5f70e7eb850bc3aebd84eb4bf1ac0b65c262` au moment de leur création.

La branche `planification-gamification-chatgpt` est propriétaire de « Compose ton assiette », du moteur d’analyse protéine/légume/féculent/matière grasse, de la cuisson fiable, des capsules nutrition/cuisson, du pont capsule→défi, des défis contextuels dans le planning, des mécanismes AVANT/PENDANT/APRÈS, de « Je revisite une envie » et des micro-circuits contextuels.

La présente branche est propriétaire du modèle et de l’expérience des recettes intelligentes, de leur bibliothèque/découverte/réutilisation, de la transformation recette→repas composé, des actions « préparer maintenant » et « ajouter au planning », du lien stable recette→occurrences consommées, de l’historique, de l’exploitation de la satiété/du ressenti/de l’alignement, des « valeurs sûres » personnelles et de la restitution vers OBSERVE/ALIGN.

### Zone de chevauchement à protéger

Les deux branches touchent potentiellement `PlanificateurRepas`, le référentiel alimentaire et les contrats planifié/réel. Elles ne doivent pas développer deux moteurs concurrents. Le moteur de qualité/composition nutritionnelle appartient à `planification-gamification-chatgpt`. Cette branche recettes devra le consommer après consolidation ciblée lorsque son contrat sera stabilisé. Aucun second moteur de composition nutritionnelle ne doit être créé ici.

## Règles de chantier

- Ne jamais travailler directement sur `main`.
- Réutiliser les moteurs existants avant de créer une nouvelle brique.
- Distinguer une recette modèle d’une occurrence réellement consommée.
- Ne pas dupliquer planning, suivi, calcul calorique, liste de courses, composition nutritionnelle ou moteurs comportementaux.
- Conserver une approche non punitive : expérience personnelle distincte d’un jugement nutritionnel.
- Documenter chaque découverte confirmée, écart et décision métier.
- Avancer par petits lots ciblés.

## État confirmé au démarrage

### Persistance des repas

`lib/repasPersistence.js` est volontairement générique : il normalise un objet repas ou un tableau de lignes, conserve les propriétés existantes et garantit un `user_id` lorsqu’il est fourni. Il ne porte pas lui-même de modèle métier « recette ». Cela signifie qu’un futur identifiant de recette peut traverser ce normaliseur s’il est accepté par la table cible, mais la persistance réelle doit être validée au niveau du schéma et de l’orchestrateur `pages/suivi.js`.

### Socle quantités / calories

`lib/socleQuantitesCalories.js` fournit déjà le socle à réutiliser : normalisation des unités, conversions masse/volume, extraction des quantités, calcul calorique depuis différentes formes du référentiel, arrondis d’achat, formatage et agrégation. Une recette intelligente ne doit pas développer son propre calculateur calorique.

### Repas composés

Une assiette enregistrée peut servir de modèle. Lors de sa réutilisation, les quantités peuvent être ajustées sans modifier le modèle stocké. Les calories des occurrences réelles sont recalculées à partir des quantités ajustées. Le contrat actuel des lignes composées est suffisamment proche du futur ingrédient de recette pour être réutilisé : identité/nominatif de l’aliment, catégorie, quantité, unité, kcal et métadonnées disponibles.

### Occurrences réelles

Les lignes partageant un `occurrence_repas_id` peuvent être reconstruites comme une seule occurrence de repas. Cette base est essentielle pour relier ultérieurement une recette modèle à ses consommations réelles. En revanche, `occurrence_repas_id` identifie une consommation précise : il ne remplace pas l’identité stable de la recette modèle.

### Alignement planifié / réel

`lib/alignementRepas.js` contient un moteur de classification documenté : repas aligné, ajusté, spontané ou libre. Les quantités et calories ne doivent pas transformer seules l’alignement en jugement binaire.

### Repas répétés / futurs « valeurs sûres »

`lib/repasReperes.js` constitue déjà un socle exploitable : fenêtre de 15 jours, minimum actuel de 3 occurrences et 2 résultats positifs, reconstruction par occurrence, comparaison de composition indépendamment de l’ordre, exclusion des extras/fast-foods et signaux issus de l’alignement, de la satiété ou du ressenti. Le vocabulaire UX « repas repère » devra être réévalué ; la notion produit envisagée est « valeur sûre ».

Important : le moteur reconnaît actuellement une composition par les noms normalisés des aliments. Pour l’historique d’une recette précise, cette reconnaissance approximative ne doit pas remplacer un identifiant stable de recette.

### Planning et liste de courses

Le planning existant possède une vue semaine, une vue 15 jours et un aperçu mois. Le déplacement des assiettes composées est documenté comme groupé afin de ne pas séparer leurs aliments. Le drag-and-drop historique doit être préservé.

`lib/listeCoursesGenerale.js` construit déjà les achats depuis `repas_planifies`, récupère aliment, catégorie, préparation, quantité/unité, agrège les besoins et conserve les traces des lignes/dates sources. Conséquence : une recette transformée correctement en lignes du planning doit alimenter la liste de courses existante. Il ne faut pas créer une seconde liste de courses propre aux recettes.

### Recettes historiques Phase 1 à 5

L’audit des premiers composants confirme une architecture de contenu spécialisé pour la reprise alimentaire après jeûne : catalogues JavaScript locaux, ingrédients et étapes principalement textuels, variantes de cuisson et conseils. Ces composants ne constituent pas un modèle générique persistant de recette intelligente et ne doivent pas devenir le nouveau moteur central. Ils peuvent éventuellement être adaptés plus tard comme source de contenu spécialisé, sans mélanger le parcours de reprise alimentaire et la bibliothèque générale.

### Supabase — état documentaire disponible

Les documents de structure présents dans le dépôt confirment l’existence de `repas_complets`, avec au moins `id`, `user_id`, `nom` et `composition` JSONB, ainsi que des tables `repas_planifies`, `repas_reels` et `referentiel_aliments`. Les scripts historiques confirment également l’ajout de `user_id` sur `repas_complets`.

Cette documentation n’est pas suffisante pour décider immédiatement d’une migration : elle peut être historique. Avant tout SQL, il faut vérifier le schéma Supabase réellement actif et les colonnes réellement utilisées aujourd’hui.

## Décision d’architecture provisoire après audit du socle

Ne pas créer immédiatement une table `recettes`.

Le socle existant est déjà capable de porter :

`recette/modèle` → composition structurée → quantités/calories existantes → planning → liste de courses → occurrence réelle → satiété/ressenti/alignement.

Le manque fonctionnel principal identifié n’est donc pas un nouveau calculateur ou un nouveau planning, mais une **identité stable de recette modèle** qui survive aux usages successifs.

Le futur contrat doit distinguer au minimum :

- `recette_id` : identité stable du modèle de recette ;
- `occurrence_repas_id` : identité d’une consommation réelle ;
- `repas_planifie`/identifiant de ligne planifiée : occurrence prévue ;
- quantités de référence du modèle ;
- quantités réellement consommées, sans réécrire le modèle.

Le choix entre enrichir `repas_complets` ou créer une table `recettes` reste ouvert jusqu’à vérification du schéma actif et des besoins spécifiques non représentables (instructions, temps, difficulté, image, origine, statut sauvegardé, etc.). Une nouvelle table ne sera justifiée que par un besoin démontré.

## Hypothèses restant à vérifier

- Schéma Supabase actif de `repas_complets`, `repas_planifies` et `repas_reels`, et non seulement les exports historiques du dépôt.
- Colonnes réellement acceptées par `repas_reels` pour transporter un futur `recette_id`.
- Orchestration exacte de `pages/suivi.js` au moment de l’insert.
- Structure complète de Phase 4 et Phase 5 et éventuelles exceptions au modèle de contenu spécialisé observé.
- Couverture réelle du référentiel nutritionnel utile aux recettes.
- Signification/source/couverture de QN ; son exploitation nutritionnelle appartient au chantier planification-gamification.
- Données de satiété et ressentis disponibles par occurrence et fiabilité historique.
- Interfaces utilisables par OBSERVE / ALIGN / ADAPT / GROW.
- Métadonnées réellement nécessaires à une recette (instructions, durée, difficulté, image, origine, favoris, etc.).

## Architecture cible

`RECETTE MODÈLE`
→ identité stable + ingrédients structurés + quantités de référence + préparation + métadonnées utiles
→ `Préparer maintenant` ou `Ajouter au planning`
→ moteurs repas/planning existants
→ liste de courses existante si planifiée
→ `OCCURRENCE RÉELLE`
→ quantités réellement consommées + calories + satiété/ressenti + contexte disponible
→ historique rattaché par identité stable
→ valeurs sûres personnelles / observations
→ OBSERVE → ALIGN → ADAPT → GROW.

Principe central : les caractéristiques objectives d’une recette et l’expérience personnelle restent deux axes distincts.

## Prochaine étape d’audit

1. Vérifier `pages/suivi.js` : payload exact écrit dans `repas_reels` et traitement des propriétés supplémentaires.
2. Vérifier les appels Supabase actifs autour de `repas_complets` et `repas_planifies`.
3. Vérifier le schéma Supabase actif si l’accès projet le permet ; ne pas appliquer de migration pendant l’audit.
4. Déterminer si `repas_complets` peut devenir le support du modèle recette sans casser son usage actuel.
5. Formaliser ensuite le contrat `recette_id` et écrire les tests du premier lot avant toute intégration UI.

## Journal

### 2026-09-17 — Initialisation

Création de la branche dédiée depuis `plan-alimentaire-intelligent-chatgpt` et création de ce document de référence. Aucun changement fonctionnel réalisé.

### 2026-09-17 — Coordination avec `planification-gamification-chatgpt`

Chevauchement confirmé autour du planificateur, du référentiel alimentaire et des contrats planifié/réel. Répartition de responsabilité documentée : la qualité/composition nutritionnelle, les capsules et le pont gamification restent dans le chantier planification-gamification ; cette branche se concentre sur le cycle recette modèle → utilisation → occurrence réelle → historique → apprentissage personnel.

### 2026-09-17 — Audit du socle recettes/persistance

Vérification de `repasPersistence`, du socle quantités/calories, de la liste de courses générale, du moteur de repas répétés et de la documentation Supabase disponible dans le dépôt. Décision : ne pas créer de table `recettes` ni de moteur parallèle tant que le schéma actif n’a pas démontré ce besoin. Le besoin architectural prioritaire est un lien stable recette modèle → planification → occurrences réelles. Aucun code fonctionnel modifié lors de cette étape.

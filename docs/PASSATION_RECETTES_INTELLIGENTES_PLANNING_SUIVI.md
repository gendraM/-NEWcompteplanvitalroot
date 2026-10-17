# Passation — Recettes intelligentes ↔ Planning ↔ Suivi

> Document vivant du chantier `recettes-intelligentes-planning-suivi`.

## 1. Branche et périmètre

- Branche : `recettes-intelligentes-planning-suivi`
- Départ : `plan-alimentaire-intelligent-chatgpt`
- Ne jamais travailler directement sur `main`.
- Périmètre : recettes intelligentes, repas composés, préparation immédiate, planning, suivi réel, historique/satiété, valeurs sûres et raccord futur avec OBSERVE / ALIGN / ADAPT / GROW.
- La qualité/composition nutritionnelle pédagogique, les capsules et le pont gamification appartiennent au chantier parallèle `planification-gamification-chatgpt`.

## 2. Objectif produit

Construire une continuité unique :

`Choisir / générer une recette → préparer maintenant OU planifier → enregistrer ce qui a réellement été mangé → observer satiété/ressenti → enrichir l’historique → identifier ce qui fonctionne pour cet utilisateur → réutiliser cette connaissance.`

Règle structurante : **la recette est un modèle ; le repas consommé est une occurrence réelle**. Modifier les quantités consommées ne modifie jamais le modèle.

## 3. Socles existants vérifiés

### Repas composés

`lib/repasComposes.js` fournit déjà normalisation/validation de composition, résumé kcal/QN, ajustement des quantités, création des modèles `repas_complets`, construction des lignes planifiées et construction des occurrences réelles partageant `occurrence_repas_id`.

Décision : aucune duplication de ce moteur pour les recettes.

### Persistance réelle

`lib/repasPersistence.js` conserve les propriétés des payloads puis ajoute/complète `user_id`. `pages/suivi.js` insère ensuite ces payloads dans `repas_reels`. Un futur `recette_id` peut donc traverser le code de persistance à condition d’exister dans le schéma Supabase.

### Planning et liste de courses

`lib/planificationRepas.js` et les contrats des repas composés savent déjà transformer une composition en lignes de `repas_planifies`. `lib/listeCoursesGenerale.js` travaille à partir de ces lignes planifiées et agrège aliment/catégorie/préparation/quantité/unité. Une recette correctement planifiée alimente donc la liste de courses existante sans moteur parallèle.

### Quantités et calories

`lib/socleQuantitesCalories.js` est la source de vérité à réutiliser pour unités, conversions, quantités, calories et agrégation d’achat. Aucun calculateur calorique propre aux recettes.

### Valeurs sûres

`lib/repasReperes.js` constitue le socle actuel : fenêtre 15 jours, minimum 3 occurrences comparables et 2 positives, signaux alignement/satiété/ressenti, exclusion extras/fast-foods. Il compare actuellement les compositions par aliments normalisés ; une recette devra être reconnue prioritairement par son identité stable et non par rapprochement de nom/composition.

### Recettes Phase 1 à 5

Les composants historiques sont des contenus spécialisés de reprise alimentaire après jeûne, essentiellement codés localement avec ingrédients/étapes/conseils. Ils restent dans leur parcours spécialisé et ne deviennent pas le moteur général de recettes.

## 4. Schéma Supabase actif vérifié le 18/09/2026

Projet vérifié en lecture : `Becomingtherealme` (`rvpysxqnomslngxjinge`).

État réel au moment de l’audit :

- `repas_complets` : `id`, `user_id`, `nom`, `composition`, `quantite_par_assiette`, `created_at` ;
- `repas_planifies` : aucune identité de recette/modèle ;
- `repas_reels` : `occurrence_repas_id uuid default gen_random_uuid()` présent, aucun `recette_id` ;
- `referentiel_aliments` existe mais reste un référentiel distinct.

Volumes observés : 8 modèles `repas_complets`, 153 lignes `repas_planifies`, 1496 lignes `repas_reels`. Parmi les lignes réelles, 1398 ont encore `occurrence_repas_id IS NULL`, ce qui correspond à de l’historique antérieur au nouveau contrat d’occurrence.

Règle de migration : **ne jamais fabriquer rétroactivement des identités de recette ou d’occurrence pour cet historique**.

## 5. Décision d’architecture : entité `recettes`

Après vérification du schéma actif, `repas_complets` reste le modèle léger d’assiette/repas personnel réutilisable. Il ne doit pas absorber toutes les responsabilités d’une recette riche.

Une entité `recettes` distincte est retenue pour porter l’identité durable et les métadonnées propres à une recette : nom, composition structurée compatible avec le moteur de repas composé, instructions, portions, temps de préparation, difficulté, origine, image éventuelle et tags.

Deux identités doivent rester distinctes :

- `recette_id` = identité stable du modèle ;
- `occurrence_repas_id` = identité d’une consommation réelle.

`recette_id` doit être nullable dans `repas_planifies` et `repas_reels`. Ainsi les repas historiques, spontanés ou non issus d’une recette continuent à fonctionner sans changement.

## 6. Migration préparée sur GitHub — NON appliquée à Supabase

Fichier : `supabase/migrations/20260918_recettes_identite_modele.sql`

Commit de création : `7c9f2e41d907558690a15bc72679b8716318e33a`.

La migration est additive et prépare :

- table `public.recettes` avec UUID stable ;
- `user_id` propriétaire ;
- `nom` ;
- `composition jsonb` ;
- `instructions jsonb` ;
- `portions` ;
- `temps_preparation_minutes` ;
- `difficulte` ;
- `origine` (`personnelle`, `catalogue`, `ia`, `reprise_jeune`) ;
- `image_url` ;
- `tags jsonb` ;
- timestamps ;
- `repas_planifies.recette_id` nullable ;
- `repas_reels.recette_id` nullable ;
- index sur les liens ;
- RLS propriétaire sur `recettes`.

Important : ce fichier est **préparé mais pas exécuté** sur la base active. Il doit être relu/testé avant application. Aucune donnée Supabase n’a été modifiée pendant cet audit.

## 7. Parcours cible

`RECETTE MODÈLE (recette_id)`
→ composition structurée + instructions/métadonnées
→ `Préparer maintenant` OU `Ajouter au planning`
→ si planification : lignes `repas_planifies` portant le même `recette_id`
→ liste de courses existante
→ consommation réelle
→ lignes `repas_reels` portant `recette_id` + un même `occurrence_repas_id`
→ quantités réellement consommées + kcal + satiété/ressenti
→ historique de cette recette
→ valeurs sûres personnelles / OBSERVE / ALIGN.

## 8. Qualité nutritionnelle

Toujours distinguer composition nutritionnelle objective et expérience personnelle observée. Ne pas créer ici un score concurrent au chantier `planification-gamification-chatgpt` et ne pas transformer un ressenti favorable en vérité nutritionnelle générale.

## 9. Règles anti-régression

- Pas de modification de `main`.
- Pas de suppression/réécriture de l’historique.
- `recette_id` reste facultatif.
- `occurrence_repas_id` reste le regroupement d’une consommation réelle.
- Pas de duplication planning/calories/liste de courses/composition nutritionnelle.
- Les quantités consommées ne réécrivent pas la recette.
- Compatibilité maintenue avec repas mono-aliment, multi-aliments et repas sans recette.
- Commits petits et ciblés.

## 10. Prochain lot

Avant toute UI de bibliothèque :

1. relire/tester la migration préparée ;
2. créer un module métier pur `lib/recettes.js` avec validation/normalisation et construction des payloads planifié/réel en réutilisant `repasComposes` ;
3. ajouter des tests unitaires du contrat d’identité ;
4. vérifier qu’une recette planifiée transmet le même `recette_id` à toutes ses lignes ;
5. vérifier que « préparer maintenant » transmet le même `recette_id` et le même `occurrence_repas_id` à toutes les lignes réelles ;
6. vérifier qu’un repas classique sans recette reste inchangé ;
7. seulement ensuite décider de l’application de la migration Supabase et du raccord UI.

## 11. Journal

### 17/09/2026 — Initialisation
Branche dédiée et audit des briques existantes. Aucun développement fonctionnel.

### 18/09/2026 — Audit du schéma actif
Lecture directe du projet Supabase actif. Confirmation de l’absence de `recette_id`, de la présence de `occurrence_repas_id` sur `repas_reels` et de la nécessité de préserver l’historique nullable.

### 18/09/2026 — Migration préparée
Création sur la branche uniquement de `20260918_recettes_identite_modele.sql`. Aucune exécution sur Supabase. Architecture `recettes` + liens nullable documentée.

---

**À maintenir :** chaque constat confirmé, décision métier, migration, fichier modifié, test et commit du chantier doit être ajouté ici.

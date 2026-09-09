# Défis V2 — moteur de validation

## Objectif

Construire une autorité unique capable d'évaluer la progression d'un défi actif sans créer un deuxième système de progression.

Le moteur doit supporter trois modes :

- `automatic` : les données déjà saisies dans Mon Plan Vital suffisent pour établir la preuve ;
- `declarative` : seul l'utilisateur peut confirmer ce qu'il a réellement fait ou ressenti ;
- `mixed` : l'application possède des indices mais demande une confirmation lorsque la preuve n'est pas suffisante.

## État des lieux avant implémentation

### Autorités de progression existantes

Deux chemins existent actuellement :

1. `lib/defisUtils.js::validerEtapeDefi(defi)` incrémente directement `defis.progress`, plafonne à la durée et termine le défi lorsque le maximum est atteint. Ce chemin n'enregistre cependant pas de preuve métier idempotente.
2. `lib/journalDefisUtils.js::validerEtapeDefi(defiId, jour, engagements)` appelle la RPC PostgreSQL `valider_journal_defi_atomique`. Ce chemin associe journal + validation + progression dans une transaction et protège le couple utilisateur/défi/jour contre une double validation.

Conséquence : le nouveau moteur ne doit pas ajouter un troisième incrément direct. Toute validation automatique, déclarative ou mixte doit finir par passer par une autorité de progression idempotente et traçable.

### Données déjà exploitables

- `repas_reels` : repas saisis, satiété, humeur, respect du plan, extras et informations alimentaires ;
- `extras` : extra, kcal, contexte, humeur ;
- `journal_defis` : preuve déclarative quotidienne existante ;
- `defis` : défi actif, progression, durée, unité et statut ;
- `semaines_validees` : synthèse utile pour les défis hebdomadaires ;
- `historique_poids` : contexte, mais ne doit pas servir seul à valider un comportement.

## Contrat cible d'une évaluation

Une évaluation doit produire une décision explicite et ne jamais confondre absence de données et échec :

- `validated` : preuve suffisante, l'étape peut progresser ;
- `needs_confirmation` : indices disponibles mais confirmation utilisateur nécessaire ;
- `insufficient_data` : impossible de conclure ; aucune progression et aucune pénalité ;
- `not_validated` : l'utilisateur a déclaré que l'objectif n'a pas été tenu, ou une règle métier explicitement observable n'est pas satisfaite ;
- `already_validated` : preuve déjà consommée ; aucune double progression.

Chaque preuve devra être identifiable afin qu'un même repas, jour ou événement ne puisse jamais incrémenter deux fois la même étape.

## Classification initiale des 10 défis

| Défi | Mode cible | Preuve / source envisagée | Décision actuelle |
|---|---|---|---|
| 🍎 Pas de dessert par automatisme | mixed | contenu du déjeuner + notion de vraie envie/occasion spéciale | la présence/absence de dessert est observable, l'exception est subjective |
| 🧠 Je suis plus fort·e que mes excuses | declarative | journal / confirmation utilisateur | l'intention de compenser n'est pas déductible de façon fiable |
| 🧀 1 portion ça suffit | mixed | quantités/portions du repas + confirmation si ambigu | les quantités seules ne prouvent pas toujours l'automatisme |
| 💡 J’écoute mon ventre | mixed | `repas_reels.satiete` + confirmation si information absente/ambiguë | pilote comportemental |
| 🚫 Le faux allié | mixed | extras + aliments proches temporellement + confirmation | la notion de compensation reste subjective |
| 🌡️ Chaud devant… mais doux ! | mixed | type de dîner + mode de cuisson si disponible, sinon confirmation | données de cuisson actuellement insuffisantes pour du 100 % automatique |
| 🔄 Je brise la chaîne | mixed | séquence d'aliments/extras + confirmation | l'intention et la pause ne sont pas entièrement observables |
| 🔥 1 vraie faim = 1 vrai repas | declarative/mixed | faim/ressenti/contexte + confirmation | faim réelle vs émotionnelle nécessite le ressenti utilisateur |
| ✨ Je me programme du plaisir | mixed | extra planifié + extra réel + confirmation si lien non démontrable | validation hebdomadaire |
| 💧 1 cru par jour | automatic à terme | aliments réellement saisis + catégorie/qualité permettant d'identifier cru et non sucré | pilote automatique, sous réserve d'une preuve alimentaire fiable |

Cette classification est volontairement prudente : le moteur ne doit jamais inventer une preuve à partir d'un champ qui ne permet pas réellement de conclure.

## Pilotes

### Pilote A — 💧 1 cru par jour

But : démontrer la chaîne automatique.

Avant d'incrémenter, vérifier que les données alimentaires actuelles permettent réellement d'identifier :

1. un aliment consommé ;
2. cru ;
3. non sucré ;
4. rattaché au bon jour ;
5. preuve non déjà consommée pour ce défi et ce jour.

Si le caractère `cru` n'est pas fiable dans les données actuelles, le moteur doit retourner `needs_confirmation` plutôt que valider par approximation.

### Pilote B — 💡 J’écoute mon ventre

But : démontrer la chaîne mixte.

- si une information de satiété exploitable constitue une preuve suffisante selon la règle métier validée, le moteur peut valider ;
- si la donnée est absente ou ambiguë, demander une confirmation courte ;
- une réponse négative ne doit pas être transformée en punition ; elle ne fait simplement pas progresser l'étape.

## Architecture cible

`défi actif` → `définition du validateur` → `collecte des preuves` → `évaluation pure` → `décision` → si nécessaire `confirmation utilisateur` → `autorité unique de progression` → `journal/preuve` → `feedback` → `refresh contexte`.

Le validateur décide. L'autorité de progression écrit. L'interface affiche et, uniquement lorsque nécessaire, demande une confirmation.

## Règles non négociables

- jamais de progression sans défi actif appartenant à l'utilisateur authentifié ;
- jamais de double progression pour la même preuve ;
- jamais considérer une donnée manquante comme un échec ;
- jamais inférer un état psychologique non déclaré ;
- pas de régression du journal personnalisé existant ;
- la durée/unité du défi reste l'autorité du nombre d'étapes attendu ;
- terminer un défi uniquement lorsque la progression validée atteint son maximum ;
- conserver un feedback bienveillant en cas de non-validation.

## Plan d'implémentation

1. Créer le contrat commun des validateurs et le registre `challenge → validation_mode`.
2. Créer le service de collecte de preuves strictement `user_id`.
3. Créer l'évaluateur pur sans écriture Supabase.
4. Définir une preuve idempotente commune avant tout raccordement à la progression.
5. Implémenter le pilote mixte `💡 J’écoute mon ventre` à partir de la satiété réelle + confirmation de secours.
6. Auditer les champs alimentaires nécessaires à `💧 1 cru par jour`, puis implémenter l'automatique uniquement si la preuve est fiable ; sinon conserver un fallback mixte.
7. Raccorder les décisions validées à l'autorité unique de progression, sans incrément parallèle.
8. Généraliser progressivement aux huit autres défis selon leur mode.
9. Ajouter ensuite les tests techniques et la validation utilisateur du parcours complet.

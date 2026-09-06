# Passation sous-lot 2.3 — persistance repas mono / multi

## Statut

Sous-lot 2.3 **raccordé et validé techniquement** sur la branche `plan-alimentaire-intelligent-chatgpt`.

Le raccord fonctionnel minimal a été publié dans le commit `8372c91` : `handleSaveRepas` accepte désormais l'objet historique mono-aliment ou un tableau de lignes grâce à `normaliserRepasPourPersistance`.

Ce sous-lot ne change volontairement pas l'expérience utilisateur : il sécurise le contrat de persistance avant le raccord ultérieur de « Mon repas en cours ».

## Éléments ajoutés

- `lib/repasPersistence.js` : normaliseur pur acceptant soit l'objet historique mono-aliment, soit un tableau de lignes.
- Chaque ligne reçoit `user_id` depuis sa valeur existante ou depuis l'utilisateur de session fourni au normaliseur.
- Les propriétés métier existantes, dont `occurrence_repas_id`, restent inchangées.
- Le tableau vide et les entrées invalides sont refusés explicitement.
- `tests/repasPersistence.test.js` couvre le contrat mono-ligne, le multi-lignes, la conservation d'un `user_id` explicite et les entrées invalides.

## Raccord réalisé dans `pages/suivi.js`

Import ajouté :

```js
import { normaliserRepasPourPersistance } from '../lib/repasPersistence';
```

Dans `handleSaveRepas`, le payload est désormais normalisé avant l'insertion :

```js
const repasPayloads = normaliserRepasPourPersistance(repasData, user?.id || null);

const { data, error } = await supabase
  .from('repas_reels')
  .insert(repasPayloads);
```

Aucun changement UX n'a été introduit. `RepasBloc`, `SaisieRepasCompose` et le schéma Supabase restent intacts.

## Validation obtenue

1. ancien appel mono-aliment toujours accepté ;
2. tableau multi-aliments accepté ;
3. `user_id` appliqué ligne par ligne ;
4. `occurrence_repas_id` conservé ;
5. erreur Supabase suivie d'un retour immédiat, sans succès mensonger ;
6. tests ciblés : 9/9 réussis ;
7. suite Jest complète : 162/162 réussis ;
8. build Next.js réussi, notamment pour la page `/suivi`.

## Suite du chantier

Définir le point d'extension minimal permettant à `RepasBloc` d'alimenter progressivement « Mon repas en cours », avant tout changement d'interface ou de comportement utilisateur.

---

## Complément — étape 9B : alignement automatique du repas

L'étape 9B prolonge le socle mono/multi sans modifier son contrat de persistance.

### Comportement retenu

- Les lignes réellement consommées sont reconstruites par `occurrence_repas_id` avant comparaison.
- La comparaison porte sur le même jour et le même type de repas.
- Le nom normalisé de l'aliment est prioritaire ; une substitution de même catégorie conserve l'intention du plan.
- Un repas est **aligné** lorsque toute la structure planifiée est retrouvée. Un aliment réel supplémentaire ne détruit pas cet alignement.
- Un repas est **ajusté** lorsqu'une partie seulement de la structure planifiée est retrouvée.
- Un repas est **spontané** lorsqu'aucun aliment ni aucune catégorie du plan n'est retrouvé.
- Un repas saisi sans planning est un **repas libre**.
- Tant qu'aucun repas n'est saisi, aucun statut n'est affiché.
- Les quantités et les calories restent suivies par leurs indicateurs dédiés et ne transforment pas, à elles seules, l'alignement en jugement binaire.

### Raccord technique

- `lib/alignementRepas.js` contient le moteur pur de classification et la reconstruction des occurrences.
- `pages/suivi.js` applique la comparaison avant l'insertion. Le booléen historique `repas_planifie_respecte` est positionné automatiquement uniquement pour un repas aligné.
- Les lignes retournées par l'insertion Supabase alimentent immédiatement l'état du suivi, sans attendre un rechargement manuel.
- Le dernier repas saisi pour le jour et le type sélectionnés affiche automatiquement l'un des quatre libellés non punitifs.
- Le schéma Supabase reste inchangé. `RepasBloc` transmet uniquement son callback `onSave` existant à `SaisieRepasCompose`.

### Validation technique

- Tests ciblés du parcours repas : **54/54 réussis**.
- Suite Jest complète : **184/184 réussis**, répartis dans 22 suites.
- Build Next.js : réussi, 36 pages générées.
- Les avertissements locaux du cache Webpack restent non bloquants ; la compilation est réussie.

## Correctif issu du test utilisateur — repas composé réutilisé

Le test authentifié du 2 septembre 2026 a révélé une limite du premier raccord 9B : le bouton « Enregistrer tout le repas » de `SaisieRepasCompose` insérait encore directement les occurrences dans `repas_reels`. Ce chemin contournait donc la comparaison automatique de `handleSaveRepas` et son rafraîchissement de `repasSemaine`.

Le correctif ciblé supprime cette insertion parallèle :

- `RepasBloc` transmet son callback `onSave` à `SaisieRepasCompose` ;
- `SaisieRepasCompose` attend `onSave(occurrences)` avant d'afficher le succès et de réinitialiser sa sélection ;
- `pages/suivi.js` demeure l'unique orchestrateur de cette écriture et applique l'alignement à l'occurrence complète ;
- le comportement mono-aliment et le schéma Supabase restent inchangés.

Validation locale du correctif : tests ciblés **24/24**, suite Jest **185/185** dans 22 suites et build Next.js réussi avec 36 pages générées. Une validation fonctionnelle authentifiée reste nécessaire après déploiement.

## Finition du parcours — quantités ajustables à la réutilisation

Une assiette enregistrée reste un modèle de référence. Lors de sa réutilisation dans le suivi, chaque quantité peut désormais être ajustée avant l'enregistrement :

- l'unité du composant reste fixe afin de ne pas inventer de conversion ;
- les calories sont recalculées proportionnellement à la quantité de référence et arrondies à l'unité ;
- le total ajusté est affiché avant validation ;
- une quantité vide, nulle ou négative bloque l'enregistrement ;
- la composition stockée dans `repas_complets` n'est jamais modifiée ;
- seules les occurrences créées dans `repas_reels` portent les quantités et calories ajustées ;
- l'enregistrement continue de passer par `handleSaveRepas`, donc l'alignement et le rafraîchissement des scores restent actifs.

Validation locale : tests ciblés **36/36**, suite Jest **188/188** dans 22 suites et build Next.js réussi avec 36 pages générées. Le contrôle fonctionnel authentifié sur mobile du 2 septembre 2026 confirme que l'ajustement des quantités fonctionne.

## Étape 12 — audit des rafraîchissements

L'inspection de la branche après le raccord de `SaisieRepasCompose` confirme que `pages/suivi.js` est l'unique orchestrateur actif des écritures dans `repas_reels`. Tous les parcours actifs passent par `handleSaveRepas`, puis ajoutent les lignes retournées par Supabase à `repasSemaine`. Les autres occurrences de `repas_reels` sont des lectures ; les insertions restantes concernent d'autres tables ou des fichiers de sauvegarde. Aucun changement de code n'était donc nécessaire pour clôturer l'étape 12.

## Étape 13 — scores reconstruits par occurrence

Les anciens scores journalier et hebdomadaire comptaient chaque ligne de `repas_reels`. Une assiette de trois aliments pouvait donc peser trois fois dans le score.

Le calcul utilise désormais `calculerScoreAlignementParOccurrence` dans `lib/alignementRepas.js` :

- les lignes partageant un `occurrence_repas_id` forment une seule occurrence ;
- une occurrence confirmée ou automatiquement reconnue comme alignée compte une fois ;
- un extra ou un fast-food reste non aligné, sauf confirmation historique déjà enregistrée ;
- un repas sans planning reste libre et n'est pas transformé en repas aligné ;
- chaque ancienne ligne sans identifiant reste une occurrence indépendante, sans regroupement rétroactif inventé ;
- le calcul des calories demeure une somme des lignes et la régularité demeure calculée par type de repas.

Validation locale : tests ciblés **26/26**, suite Jest **193/193** dans 22 suites avec `TZ=Europe/Paris` et build Next.js réussi avec 36 pages générées. Une exécution brute en UTC révèle un ancien test de formatage de date dépendant du fuseau (`validation-semaine.test.js`) ; il est extérieur à cette étape et n'a pas été modifié.

## Étape 14 — socle de détection des repas repères

Le moteur pur `lib/repasReperes.js` prépare les futures suggestions intelligentes sans encore modifier `/plan` :

- fenêtre inclusive des quinze derniers jours ;
- reconstruction exclusivement par `occurrence_repas_id`, sans regroupement inventé de l'historique ;
- occurrences composées d'au moins deux aliments ;
- composition comparable indépendamment de l'ordre des aliments, sans imposer les mêmes quantités ;
- seuil de trois occurrences comparables et d'au moins deux occurrences présentant un signal positif ;
- signaux admis : repas aligné, satiété respectée ou ressenti favorable explicitement reconnu ;
- exclusion des extras et fast-foods ;
- restitution de la composition de l'occurrence positive la plus récente, en conservant uniquement les quantités, calories, catégories et QN réellement connus ;
- absence de candidat lorsque les preuves sont insuffisantes.

Le moteur ne modifie ni Supabase, ni `pages/plan.js`, ni le comportement actuel des suggestions. Le raccord visuel et l'action « Ajouter cette assiette à mon planning » constituent le sous-lot suivant.

Validation locale : tests ciblés du moteur et du regroupement **22/22**, suite Jest complète **202/202** dans 23 suites avec `TZ=Europe/Paris`, build Next.js réussi avec 36 pages générées et `git diff --check` sans erreur.

## Pause ergonomique — planification semaine / quinze jours

Le retour mobile a montré que la grande grille mensuelle n'était pas adaptée à une planification concrète et qu'un jour vide ne recevait pas le glisser-déposer : son conteneur sans contenu ni hauteur s'effondrait, puis `react-beautiful-dnd` retournait une destination nulle. L'ancien traitement déplaçait aussi une seule ligne, au risque de séparer les aliments d'une assiette composée.

La correction reste indépendante du moteur d'alignement et ne modifie pas le schéma Supabase :

- vue principale à la semaine, du lundi au dimanche ;
- vue secondaire sur quinze jours glissants ;
- mois conservé comme aperçu compact, sans tableau large à défilement horizontal ;
- chaque jour vide garde une zone de dépôt d'une hauteur explicite ;
- sélection directe d'un jour avant d'utiliser le planificateur existant ;
- bouton « Déplacer » avec choix de date, utilisable sur mobile ;
- glisser-déposer conservé sur ordinateur ;
- déplacement commun de toutes les lignes d'une assiette composée ;
- anciennes lignes et repas simples toujours traités séparément ;
- contrôle du propriétaire par `user_id` et vérification du nombre de lignes réellement retournées par Supabase ;
- suppression historique conservée aliment par aliment ;
- retrait du score fictif « repas respectés » qui n'était alimenté par aucune donnée réelle.

Le regroupement d'une assiette planifiée ne repose pas sur une approximation rétroactive : seules les lignes marquées `combo_valide = true` qui partagent exactement la date, le type et le `created_at` sont déplacées ensemble. L'audit en lecture seule de la table `repas_planifies` a confirmé que les insertions composées existantes partagent bien ces valeurs. Les lignes anciennes ou simples restent autonomes.

Validation locale : tests ciblés **31/31**, suite Jest complète **218/218** dans 25 suites avec `TZ=Europe/Paris`, build Next.js réussi avec 36 pages générées et `git diff --check` sans erreur. Une validation fonctionnelle authentifiée sur mobile reste requise après déploiement de branche.

### Correctif de préservation de l'expérience historique

Le premier affichage responsive remplaçait la vue hebdomadaire globale par sept grandes sections détaillées et limitait le glisser-déposer à une poignée masquée sur mobile. Cette interprétation constituait une régression par rapport au calendrier existant.

Le correctif conserve désormais les acquis des deux versions :

- toute la carte du repas redevient la zone de prise du glisser-déposer sur ordinateur et mobile ;
- le bouton de déplacement avec choix explicite de la date reste disponible ;
- la semaine présente ses sept jours simultanément en colonnes compactes sur ordinateur ;
- sur mobile, les sept jours deviennent des lignes compactes qui conservent les repas, aliments, quantités et calories ;
- un seul jour peut être développé pour afficher les actions de suppression, de déplacement et de planification ;
- les autres jours restent compacts afin de préserver la vision hebdomadaire ;
- les vues quinze jours et mois restent inchangées ;
- le déplacement d'une assiette composée reste groupé.

Validation locale du correctif : tests ciblés **33/33**, suite Jest complète **220/220** dans 25 suites avec `TZ=Europe/Paris`, build Next.js réussi avec 36 pages générées et `git diff --check` sans erreur. Une validation fonctionnelle authentifiée sur mobile reste requise après déploiement de branche.

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

Validation locale : tests ciblés **36/36**, suite Jest **188/188** dans 22 suites et build Next.js réussi avec 36 pages générées. Le contrôle fonctionnel authentifié sur mobile reste à effectuer après déploiement.

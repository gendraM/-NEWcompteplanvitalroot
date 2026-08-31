# État des lieux — évolution — Plan alimentaire intelligent

## Statut

Audit technique terminé. **Lot 1 de fondation et sous-lot 2.1 du moteur repas en cours validés techniquement** sur la branche `plan-alimentaire-intelligent-chatgpt`.

Branche de référence initiale vérifiée : `plan-alimentaire-intelligent-chatgpt` au commit `8e70aa3` avant création de ce document.

Cet état des lieux constitue la source de vérité du chantier suivant : faire évoluer la saisie réelle des repas afin de reconnaître fiablement une occurrence de repas complète, sans supprimer le détail alimentaire ni casser les comportements existants.

### Avancement Lot 1 — 31/08/2026

- Migration `20260826_lot1_occurrence_bilans_rls.sql` déjà versionnée au commit `585d867`.
- `repas_reels.occurrence_repas_id UUID` ajouté en base, nullable pour ne pas réécrire artificiellement l'historique.
- Unicité de `semaines_validees` corrigée en `user_id + weekStart`.
- RLS propriétaire activé sur `repas_reels`, `repas_planifies`, `repas_complets` et `semaines_validees`.
- Anciennes lignes `user_id IS NULL` du jeu de test réattribuées au compte de test actif directement sur la base live ; aucun UUID utilisateur n'est codé dans une migration.
- Complément Lot 1 : le `DEFAULT gen_random_uuid()` de `repas_reels.occurrence_repas_id` est appliqué et vérifié sur la base Supabase live : toute nouvelle saisie simple sans ID explicite reçoit automatiquement un identifiant d'occurrence.
- Les repas composés génèrent explicitement un UUID par consommation et recopient ce même UUID sur toutes les lignes alimentaires de l'assiette.
- Deux consommations du même modèle de repas composé conservent le même `tag` de modèle mais reçoivent deux `occurrence_repas_id` différents.
- Aucun regroupement rétroactif des anciennes lignes n'est effectué.
- `RepasBloc` et ses règles métier (portions, extras, fast-food, satiété, planification) ne sont pas réécrits dans ce complément : le DEFAULT base protège les chemins de saisie simple existants.
- Tests unitaires ajoutés pour le format UUID v4, l'unicité, le partage de l'ID dans une assiette et la distinction entre deux consommations.
- Le build Next.js du commit `098263b` a été vérifié sur Vercel : compilation réussie et génération statique 36/36 ; les quatre checks Vercel associés sont au vert.
- Le workflow GitHub Actions `Tests plan alimentaire` a exécuté réellement `npm test -- --runInBand` sur le commit `0a9d404` : **18 suites sur 18 réussies et 153 tests sur 153 réussis**. `tests/repasComposes.test.js` est PASS, y compris les tests spécifiques à `occurrence_repas_id`.
- Le Lot 1 est donc validé sur ses trois contrôles techniques : **base Supabase live, build Next.js/Vercel et tests Jest automatisés**.

### Avancement sous-lot 2.1 — 31/08/2026

- Le moteur de regroupement du repas en cours est externalisé dans `lib/repasEnCours.js` au lieu d'être ajouté directement dans `RepasBloc`.
- `construirePayloadRepasEnCours` refuse un repas vide, accepte un ou plusieurs aliments déjà préparés, génère ou réutilise un seul `occurrence_repas_id` et applique ce même identifiant à toutes les lignes de l'occurrence.
- Le contexte global du repas peut être partagé entre les lignes tout en conservant les données propres à chaque aliment.
- `RepasBloc.js` n'a pas été modifié dans ce sous-lot : il est désormais traité comme un **composant sensible à protéger** compte tenu des nombreuses règles métier qu'il concentre.
- Le moteur n'est pas encore raccordé à l'interface : le comportement utilisateur actuel reste donc inchangé à ce stade.
- Commit fonctionnel initial : `020b3a9` (`Externaliser le moteur repas en cours`). Les deux commits suivants `4874f9a` et `4b9b1b5` ont uniquement corrigé l'exécution/syntaxe du nouveau fichier de test, sans modifier le moteur ni `RepasBloc`.
- GitHub Actions sur `4b9b1b5280260117bfa5e45e42066465b8469d73` : **19/19 suites PASS et 158/158 tests PASS**. Les 5 tests de `tests/repasEnCours.test.js` sont PASS et les 153 tests historiques restent PASS.
- Vercel sur le même commit : déploiement `dpl_Gc7m5GKEVag7njXwKfKXU7Rx3vQQ` en état **READY** ; build Next.js terminé avec succès en 22 s et déploiement complété.
- Le sous-lot 2.1 est donc **validé techniquement** sur tests automatisés et build. Il ne constitue pas encore la fonctionnalité multi-aliments visible : le prochain sous-lot doit déterminer le raccordement le moins risqué.

---

## 1. Constat principal

Les briques nécessaires existent déjà, mais le système ne sait pas encore reconnaître fiablement un repas complet qui « réussit bien » à l'utilisatrice.

### Ce qui existe déjà

- Planification depuis le référentiel alimentaire.
- Création d'une assiette avec plusieurs aliments.
- Enregistrement et réutilisation d'un repas composé.
- Catégorie, quantité, calories et parfois QN connus.
- Saisie réelle de la satiété, du ressenti, des notes et du respect des règles.
- Bilan hebdomadaire avec calories, extras, satiété et ressenti.
- Emplacement de suggestions directement dans le planificateur.

### Écarts importants

| Sujet | Fonctionnement actuel | Fonctionnement attendu |
|---|---|---|
| Suggestions | Aliments isolés ayant satisfait + `satiete = oui` | Assiettes complètes ayant produit plusieurs résultats positifs |
| Répétition | Aucun minimum | Au moins 3 occurrences comparables sur 15 jours |
| Regroupement | Plusieurs lignes séparées | Une occurrence commune représentant le repas complet |
| Bilan | Compte parfois chaque aliment comme un repas | Analyse chaque assiette une seule fois |
| QN | Pas conservé dans le repas réel | Utilisé seulement lorsqu'il est réellement connu |
| `a_reprendre` | Colonne existante, mais aucune ligne active | Validation explicite d'une proposition personnelle |
| Favoris | Colonne existante, mais inutilisée | Distincts des go-to meals détectés |
| S-1 | Résumé général | Synthèse utilisable pour préparer la semaine suivante |

---

## 2. Problème structurel confirmé

Historiquement, un repas composé créait plusieurs lignes dans `repas_reels` sans identifiant unique partagé par l'occurrence.

Le tag actuel indique seulement le modèle utilisé. Si le même modèle est consommé plusieurs fois, il ne suffit pas pour distinguer proprement chaque consommation.

Données observées pendant l'audit :

- 1 398 lignes de repas réels ;
- seulement 9 ont une heure ;
- aucun repas composé n'avait encore été enregistré avec le nouveau tag ;
- `a_reprendre` et `favori` n'étaient actifs sur aucune ligne.

Les anciennes données ne doivent donc pas être artificiellement transformées en repas complets fiables. La reconnaissance sûre commence avec les nouvelles saisies correctement regroupées grâce à la fondation Lot 1 et au moteur du sous-lot 2.1 une fois celui-ci raccordé.

---

## 3. Distinction fondamentale des niveaux

Le système doit distinguer trois notions différentes.

| Niveau | Signification |
|---|---|
| Occurrence de repas | Aliments réellement consommés ensemble |
| Repas composé enregistré | Assiette volontairement nommée et sauvegardée pour être réutilisée |
| Go-to meal | Assiette complète régulièrement associée à de bons résultats |

Le regroupement en occurrence doit être automatique. L'enregistrement comme modèle reste facultatif. La qualification en go-to meal est une détection ultérieure fondée sur l'historique.

### Exemple

Déjeuner : poulet + haricots verts + patate douce.

Supabase doit conserver trois lignes alimentaires afin de conserver les quantités, catégories et calories de chaque aliment. En revanche, ces trois lignes doivent partager un même `occurrence_repas_id`.

Le bilan doit alors comprendre :

| Calcul | Méthode |
|---|---|
| Nombre d'aliments | 3 lignes |
| Calories du déjeuner | Somme des 3 lignes |
| Catégories présentes | Catégories des 3 aliments |
| Nombre de repas | 1 occurrence / assiette |
| Satiété du repas | Comptée une seule fois |
| Ressenti du repas | Compté une seule fois |

Aucune information alimentaire n'est supprimée.

---

## 4. Fonctionnement actuel de `RepasBloc`

Dans le suivi normal :

1. L'utilisatrice choisit le type de repas.
2. `RepasBloc` s'ouvre.
3. Elle saisit un aliment.
4. Cet aliment est enregistré comme une ligne dans `repas_reels`.
5. Pour ajouter un deuxième aliment, elle recommence la saisie.

`RepasBloc` gère déjà de nombreux comportements qui doivent impérativement être préservés :

- recherche dans le référentiel général et personnel ;
- catégorie automatique ;
- calcul automatique des calories ;
- validation des portions ;
- conformité avec le repas planifié ;
- extras et budget associé ;
- reconnaissance du fast-food et délai de 45 jours ;
- heure du repas ;
- satiété ;
- raison du dépassement de satiété ;
- ressenti alimentaire ;
- signaux ressentis ;
- note personnelle ;
- règles de préparation au jeûne ;
- messages de réussite ou d'erreur Supabase.

Les modes reprise alimentaire et défi alimentaire utilisent leurs propres formulaires et sont hors périmètre de ce chantier.

### Règle d'architecture retenue après le sous-lot 2.1

`RepasBloc` est un composant sensible. La logique nouvelle de regroupement multi-aliments ne doit pas être enfouie dans ce fichier tant qu'un point de raccordement plus sûr n'a pas été audité.

Le moteur `lib/repasEnCours.js` constitue désormais la couche métier externe : il reçoit des aliments déjà préparés/validés et construit l'occurrence commune. Le prochain sous-lot doit vérifier si un contrat étroit, un callback ou un orchestrateur/enveloppe peut relier ce moteur au parcours existant. Une modification minimale de `RepasBloc` ne sera envisagée que si aucun point d'extension fiable n'existe ; elle ne doit jamais être supposée avant l'audit.

---

## 5. Trois chemins d'enregistrement actuellement présents

| Situation | Comportement actuel |
|---|---|
| Aliment normal | `RepasBloc` transmet une ligne à `suivi.js`, qui l'insère dans `repas_reels` |
| Aliment conforme au planning | `RepasBloc` insère directement la ligne dans Supabase |
| Repas composé déjà enregistré | `SaisieRepasCompose` insère directement plusieurs lignes dans Supabase |

Il existe donc déjà trois chemins d'enregistrement différents. Les réécrire brutalement risquerait de casser les extras, le suivi du jeûne, la conformité au plan ou les ressentis.

---

## 6. Anomalies préexistantes découvertes

### 6.1 Le plan composé est mal relu dans le suivi

Le plan peut contenir plusieurs aliments pour un même déjeuner, mais `suivi.js` ne conserve actuellement qu'un aliment par type de repas : chaque nouvelle ligne écrase la précédente.

Exemple : une assiette planifiée contenant poulet, riz et brocolis peut apparaître dans le suivi uniquement comme « brocolis ».

Cette lecture doit être corrigée avant de comparer une assiette réelle avec une assiette planifiée.

### 6.2 Le repas composé réutilisé contourne une partie de `RepasBloc`

Le bloc « Utiliser un repas composé » enregistre directement les aliments dans Supabase. Il ne passe donc pas complètement par :

- la validation des portions ;
- les extras ;
- la conformité au plan ;
- les signaux détaillés ;
- le rafraîchissement normal du suivi.

À terme, il doit charger les aliments dans le repas en cours puis utiliser le même parcours final fiable que la saisie normale, sans contourner les règles métier existantes.

### 6.3 Identifiant d'occurrence — fondation Lot 1 en place

Le tag existant identifie le modèle de repas composé, mais pas chaque consommation.

La fondation Lot 1 ajoute `occurrence_repas_id`. Les nouvelles lignes simples reçoivent un UUID par défaut en base et les lignes d'une même consommation composée reçoivent explicitement le même UUID. Le sous-lot 2.1 ajoute le moteur externe capable de construire ce même regroupement pour le futur repas en cours. Son raccordement à l'interface reste à réaliser.

### 6.4 Rafraîchissement incomplet du suivi

Après certaines insertions, le message de réussite apparaît mais les calories et les repas de la journée ne sont pas nécessairement rechargés immédiatement.

### 6.5 Absence de protection automatisée complète de `RepasBloc`

Les calculs des repas composés, de la planification et désormais du moteur `repasEnCours` disposent de tests, mais le parcours complet de `RepasBloc` n'a pas encore de test de non-régression suffisant. Cette faiblesse justifie de privilégier un raccordement externe et minimal.

---

## 7. Anomalies Supabase — statut Lot 1

Les deux anomalies identifiées pendant l'audit ont été corrigées sur la base live et versionnées dans la migration Lot 1 :

1. l'unicité des bilans est maintenant définie par `user_id + weekStart` ;
2. les tables `repas_reels`, `repas_planifies`, `repas_complets` et `semaines_validees` sont protégées par des politiques RLS propriétaire pour le rôle `authenticated`.

Le complément `DEFAULT gen_random_uuid()` de `repas_reels.occurrence_repas_id` est également actif et vérifié sur la base live.

Les alertes de sécurité Supabase concernant d'autres tables/fonctions du projet restent hors périmètre de ce chantier et ne doivent pas être modifiées silencieusement.

---

## 8. Évolution UX retenue pour `RepasBloc`

Il ne faut pas remplacer `RepasBloc` par une copie du planificateur.

La **cible UX** reste de conserver le bloc actuel et de permettre la construction progressive de plusieurs aliments avant l'enregistrement final. En revanche, la **stratégie technique** est désormais de porter le regroupement dans `lib/repasEnCours.js` et de rechercher un raccordement externe/orchestré avant toute modification du composant sensible.

L'utilisatrice conserve les champs actuels et doit à terme disposer de deux actions :

- `+ Ajouter un autre aliment`
- `Enregistrer ce repas`

### Cas d'un aliment unique

L'utilisatrice saisit par exemple une glace et clique directement sur « Enregistrer ce repas ».

Résultat attendu :

- comportement presque identique à aujourd'hui ;
- une ligne alimentaire enregistrée ;
- un `occurrence_repas_id` propre à ce repas ;
- aucune demande de nom d'assiette ;
- aucun modèle composé créé automatiquement.

### Cas de plusieurs aliments

L'utilisatrice saisit « Haricots verts » puis clique sur `+ Ajouter un autre aliment`.

L'aliment rejoint un encart « Mon repas en cours ». Elle ajoute ensuite poulet et patate douce puis clique sur « Enregistrer ce repas ».

Résultat attendu :

- trois lignes alimentaires ;
- un même `occurrence_repas_id` ;
- une seule opération logique d'enregistrement ;
- une seule satiété globale ;
- un seul ressenti global ;
- une seule note générale ;
- un seul repas dans les statistiques.

À partir de deux aliments seulement, l'option facultative suivante apparaît :

> Enregistrer aussi cette assiette pour la réutiliser

Le nom de l'assiette n'est demandé que si cette option est cochée. Un nom peut être proposé automatiquement puis modifié.

### Plusieurs aliments ne signifient pas automatiquement « bon repas »

Exemple : glace + biscuit.

Ils peuvent appartenir à la même occurrence parce qu'ils ont été consommés ensemble. Cela ne signifie pas automatiquement que l'application les considère comme :

- une assiette équilibrée ;
- un go-to meal ;
- un repas recommandé.

---

## 9. Comportements à préserver obligatoirement

La future implémentation doit garantir que :

- un repas d'un seul aliment reste enregistrable simplement ;
- tous les aliments viennent du même référentiel actuel ;
- les quantités et calories restent calculées comme aujourd'hui ;
- les portions continuent d'être évaluées aliment par aliment ;
- la satiété, le ressenti et la note restent associés au repas complet ;
- un extra ou un fast-food continue d'être détecté ;
- le plan préremplit toujours la saisie ;
- un modèle déjà enregistré peut toujours être chargé, modifié, dupliqué ou supprimé ;
- la reprise alimentaire et les défis restent totalement séparés ;
- aucune ancienne ligne n'est supprimée ou regroupée arbitrairement.

---

## 10. Cible du moteur intelligent

Une fois les occurrences de repas fiables, le système pourra reconstruire les repas complets avant tout calcul.

Le moteur S-1 devra produire une synthèse exploitable pour préparer la semaine suivante avec notamment :

- catégories ;
- calories ;
- QN lorsqu'il est réellement connu ;
- satiété ;
- ressenti ;
- extras ;
- régularité.

Un candidat go-to meal ne doit pas être détecté sur un aliment isolé ni après une seule occurrence. La règle retenue pendant l'audit est d'attendre au moins trois occurrences comparables sur quinze jours et plusieurs résultats positifs.

Les suggestions dans `/plan` devront présenter :

- la raison de la suggestion ;
- la composition complète ;
- les catégories ;
- les portions et calories ;
- une action permettant d'ajouter toute l'assiette au planning.

Les points de vigilance récurrents peuvent également être remontés, sans jamais présenter une simple corrélation comme une certitude causale.

---

## 11. Plan d'action consolidé

1. **Fondation réalisée et validée Lot 1** — ajouter `occurrence_repas_id`, garantir un UUID aux nouvelles saisies simples et un UUID partagé aux repas composés.
2. **Réalisé et validé Lot 1** — corriger l'unicité des bilans en `user_id + semaine`.
3. **Réalisé et validé Lot 1** — cloisonner `repas_reels`, `repas_planifies`, `repas_complets` et `semaines_validees` par propriétaire.
4. **Sous-lot 2.1 réalisé et validé** — externaliser le moteur de construction du repas en cours dans `lib/repasEnCours.js`, sans modifier `RepasBloc`.
5. **Sous-lot 2.2 — prochaine étape** — auditer le point de raccordement le moins risqué entre `RepasBloc`, `suivi.js`, `SaisieRepasCompose` et le moteur `repasEnCours` ; privilégier un contrat étroit/callback ou un orchestrateur/enveloppe et documenter la stratégie de non-régression avant modification fonctionnelle.
6. Raccorder ensuite la saisie multi-aliments progressive et la persistance commune uniquement après validation du point 5.
7. Corriger la lecture des repas planifiés composés dans le suivi.
8. Faire charger un repas composé réutilisé dans le repas en cours au lieu de contourner les règles métier du parcours normal.
9. Créer un moteur commun qui reconstruit les repas complets avant tout calcul.
10. Corriger le bilan afin de compter les occurrences de repas plutôt que les lignes alimentaires lorsqu'une métrique porte sur le repas.
11. Produire la synthèse S-1.
12. Détecter les candidats go-to meals après plusieurs occurrences comparables et positives.
13. Présenter les suggestions intelligentes dans `/plan`.
14. Ajouter les points de vigilance récurrents sans transformer une corrélation en causalité.
15. Effectuer les tests, le build et mettre à jour la passation à chaque lot.

---

## 12. Tests indispensables avant validation du lot fonctionnel de raccordement

- repas avec un seul aliment ;
- repas avec plusieurs aliments ;
- aliment extra au sein d'un repas ;
- fast-food ;
- repas conforme à un plan d'un aliment ;
- repas conforme à un plan composé ;
- repas enregistré comme modèle ;
- modèle existant chargé dans la saisie ;
- échec Supabase sans perte de la saisie ;
- rafraîchissement des calories et du suivi ;
- vérification des modes reprise alimentaire et défi alimentaire ;
- tests automatisés complets ;
- build Next.js.

### Tests spécifiques de fondation Lot 1

- UUID v4 généré pour une occurrence ;
- toutes les lignes d'un repas composé partagent le même `occurrence_repas_id` ;
- deux consommations du même modèle reçoivent deux IDs différents ;
- un `occurrenceRepasId` fourni par le futur repas en cours est conservé sur toutes les lignes ;
- le `tag` de modèle composé reste distinct de l'identifiant d'occurrence.

**État de validation Lot 1 : VALIDÉ.**

- Supabase live : `DEFAULT gen_random_uuid()` vérifié.
- Next.js/Vercel : build validé, compilation réussie et 36/36 pages générées.
- GitHub Actions/Jest sur `0a9d404` : **18/18 suites PASS, 153/153 tests PASS**.
- `tests/repasComposes.test.js` : PASS avec les contrôles spécifiques d'occurrence.

### Tests spécifiques sous-lot 2.1

- repas mono-aliment avec occurrence ;
- plusieurs aliments partageant la même occurrence ;
- partage du contexte global sans perte des données propres à chaque aliment ;
- génération d'une occurrence lorsque le moteur n'en reçoit pas ;
- refus d'un repas vide.

**État de validation sous-lot 2.1 : VALIDÉ TECHNIQUEMENT.**

- GitHub Actions/Jest sur `4b9b1b5` : **19/19 suites PASS, 158/158 tests PASS**.
- `tests/repasEnCours.test.js` : **5/5 PASS**.
- Vercel `dpl_Gc7m5GKEVag7njXwKfKXU7Rx3vQQ` : **READY**, build Next.js terminé avec succès en 22 s.
- `RepasBloc.js` non modifié ; aucune nouvelle UX multi-aliments n'est encore déclarée fonctionnelle.

Les tests fonctionnels complets de `RepasBloc` restent volontairement rattachés au futur raccordement, puisque `RepasBloc` n'a pas été réécrit dans le sous-lot 2.1.

---

## 13. Règle de reprise du chantier

Le Lot 1 et le sous-lot 2.1 étant validés techniquement, le prochain sous-lot est :

**2.2 — auditer et définir le point de raccordement/orchestrateur le moins risqué pour connecter le moteur `repasEnCours` au parcours existant, sans commencer par modifier directement `RepasBloc`.**

L'objectif UX multi-aliments reste inchangé, mais aucune modification de `RepasBloc` ne doit être engagée avant d'avoir vérifié ses points d'extension et les trois chemins d'enregistrement existants.

Avant chaque commit fonctionnel, documentaire ou correctif : rappeler explicitement le dépôt et la branche, présenter le périmètre du commit et attendre l'autorisation de l'utilisatrice. Ne jamais pousser sur `main` sans autorisation explicite distincte.

Les modifications doivent être testées avant validation. Aucun regroupement rétroactif approximatif des anciennes données ne doit être effectué.

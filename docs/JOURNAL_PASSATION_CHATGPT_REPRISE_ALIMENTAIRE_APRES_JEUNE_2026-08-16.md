# Journal de passation — Reprise alimentaire après jeûne

**Date :** 16 août 2026

**Branche :** `finalisation-reprise-jeune-alimentaire-chatgpt`

**Branche d'origine :** `finalisation-jeune-chatgpt`
**Objectif :** finaliser la reprise alimentaire après jeûne sans casser le chaînage préparation → jeûne → reprise → consolidation.

---

## 1. Règles de travail impératives

- Aucun commit ne doit être créé sans l'autorisation explicite de la propriétaire du projet.
- Aucun push ne doit être réalisé sans son autorisation explicite.
- L'unique exception historique concernait la création initiale d'une branche distante ; elle ne vaut pas autorisation générale de commit.
- Ne pas supprimer ni réécrire les commits existants.
- Une demande d'audit ou d'examen n'autorise aucune modification du code.
- Avant toute modification, vérifier la branche active et l'état Git.
- Préserver le chaînage déjà livré depuis `finalisation-jeune-chatgpt`.

---

## 2. Contexte de la branche

La branche de reprise a été créée à partir de `finalisation-jeune-chatgpt`. Elle contient donc le chaînage du parcours central déjà réalisé :

```text
préparation
    ↓
jeûne
    ↓
reprise alimentaire
    ↓
consolidation
```

Le même `parcours_jeune.id` doit être conservé pendant tout le cycle. La reprise est reliée au parcours par `reprises_alimentaires.parcours_id`.

La cristallisation et les portes de constance sont hors du périmètre interne de cette branche. La transition vers la consolidation doit seulement rester fonctionnelle.

Le document de référence détaillé du chantier est :

`docs/ETAT_DES_LIEUX_REPRISE_APRES_JEUNE_2026-08-16.md`

---

## 3. Décisions métier actées

### 3.1 Reprise non bloquante

La reprise sert à guider, observer et mesurer. Elle ne sert pas à sanctionner.

- aucun nombre minimal de repas n'est imposé ;
- une journée vide n'empêche pas la suite ;
- un repas hors recommandation reste enregistrable ;
- une absence de donnée n'est pas une non-conformité ;
- les écarts alimentent le bilan ;
- une journée passée peut être complétée après coup.

### 3.2 Durée et adaptation

- durée de référence de la reprise : `durée réelle du jeûne × 2` ;
- les cinq phases sont conservées quelle que soit la durée du jeûne ;
- la durée de chaque phase, les quantités et la vitesse de progression peuvent être adaptées ;
- le vécu peut justifier de ralentir ou prolonger une phase, mais pas de supprimer arbitrairement une phase.

### 3.3 Répartition des phases

| Phase | Définition retenue |
|---|---|
| Phase 1 | Liquides |
| Phase 2 | Semi-liquides, fibres douces et premières huiles |
| Phase 3 | Solides légers, protéines végétales et lipides doux |
| Phase 4 | Protéines animales légères et crudités douces |
| Phase 5 | Retour progressif à une alimentation complète et contrôlée |

La phase 4 ne doit pas être supprimée ni réduite à « Féculents doux ». La phase 5 reste distincte et organise la stabilisation vers une alimentation complète.

---

## 4. Travaux déjà réalisés sur cette branche

### 4.1 Reconstitution de l'état des lieux

Le fichier suivant a été créé et complété :

`docs/ETAT_DES_LIEUX_REPRISE_APRES_JEUNE_2026-08-16.md`

Il décrit le métier, le code réel, les données Supabase et locales, les écarts et l'ordre des lots.

### 4.2 Lot B — Compatibilité Supabase phase 5 — TERMINÉ

La contrainte de `reprises_jours_valides.phase` a été mise à jour et vérifiée dans Supabase. Elle accepte :

- `phase1` ;
- `phase2` ;
- `phase3` ;
- `phase4` ;
- `phase5`.

Aucune donnée n'a été supprimée ou transformée. Un test fonctionnel complet doit encore confirmer l'insertion et le rechargement d'un programme réel comportant une phase 5.

### 4.3 Lot C — Suivi quotidien non bloquant — IMPLÉMENTÉ

Modifications réalisées :

- correction de la navigation entre les journées ;
- transmission de la date sélectionnée à `SaisieRepriseJeune` ;
- séparation de `date_repas`, `heure_repas` et `created_at` ;
- ajout de `saisie_retroactive` ;
- conservation de l'heure choisie ;
- remplacement du faux minimum de deux repas par un compteur factuel ;
- exclusion des journées sans repas des calculs de conformité ;
- ajout au bilan du nombre de journées réellement renseignées ;
- maintien de la clôture non bloquante.

Le build distant a réussi sur le commit contenant le lot C. Le lot reste à confirmer par des tests fonctionnels réels, notamment la saisie au jour 5 d'un repas rattaché au jour 3.

---

## 5. Architecture alimentaire découverte

### 5.1 Référentiel général

`data/referentiel.js` contient le catalogue alimentaire utilisé dans l'ensemble de l'application :

- nom ;
- catégorie ;
- calories ;
- portion habituelle ;
- unité ;
- qualité nutritionnelle ;
- autres métadonnées générales.

Il n'a pas vocation à porter directement toutes les règles temporaires de la reprise.

### 5.2 Règles spécifiques de reprise

`data/alimentsRepriseJeune.js` contient actuellement des aliments avec :

- une phase ;
- une portion de reprise ;
- un conseil ;
- une catégorie ;
- des informations liées à la cétose ou aux conditions de réintroduction.

Ces données doivent devenir la couche de règles de reprise reliée au référentiel général, sans créer deux catalogues concurrents.

### 5.3 Parcours utilisateur retenu

L'utilisatrice saisit toujours ses repas depuis la page `Suivi`.

- hors reprise : `RepasBloc` est utilisé ;
- pendant une reprise active : `SaisieRepriseJeune` remplace la saisie normale ;
- la page de reprise sert à consulter le programme, les phases, les recommandations, la progression et le bilan.

Il n'y a donc pas deux saisies parallèles.

---

## 6. Anomalie principale confirmée

Le programme, le bandeau et les fenêtres « Voir les aliments » utilisent les données spécifiques de reprise. En revanche, `SaisieRepriseJeune.js` recherche l'aliment uniquement dans `data/referentiel.js`.

Le référentiel général ne possédant pas de champ `phase`, le formulaire exécute actuellement cette logique :

```text
phase absente
    ↓
aliment considéré comme autorisé
```

Le contrôle de phase affiché par le formulaire n'est donc pas réellement raccordé au programme de reprise.

Conséquences :

- un aliment général sans règle de reprise peut être déclaré autorisé ;
- les recommandations visibles et l'évaluation du repas peuvent se contredire ;
- la correction des listes des phases 3 à 5 serait insuffisante si la saisie continue d'ignorer ces listes.

---

## 7. Cible fonctionnelle validée

Pour chaque aliment saisi :

1. le référentiel général fournit l'identité, les calories, la catégorie et la qualité nutritionnelle ;
2. la couche de reprise fournit la phase d'introduction, la portion de reprise et les restrictions ;
3. l'application compare la règle à la phase et au jour sélectionnés ;
4. elle produit l'un des statuts suivants :
   - autorisé ;
   - prévu dans une phase suivante ;
   - non référencé pour la reprise ;
   - non recommandé pendant la reprise ;
5. le repas est conservé même en cas d'écart ;
6. l'observation est transmise au suivi et au bilan.

La phase d'un aliment représente sa première phase d'introduction. Un aliment introduit en phase 3 reste normalement disponible en phases 4 et 5, sauf restriction explicite.

Dans la saisie, les aliments disponibles doivent être proposés en priorité. La recherche dans le catalogue général reste possible pour consigner fidèlement un aliment réellement consommé hors recommandation.

---

## 8. Prochain chantier — Lot D

### D1 — Raccordement des données

- recenser les aliments et règles de reprise ;
- établir leur correspondance avec le référentiel général ;
- identifier les absences, doublons et différences de nom ;
- choisir une liaison stable et non ambiguë ;
- ne modifier aucun contenu métier tant que la correspondance n'est pas fiable.

### D2 — Moteur commun de règles

- centraliser la recherche de la règle de reprise ;
- retourner le statut de l'aliment ;
- gérer la phase minimale, la portion et les restrictions de jour ou d'horaire ;
- faire de cette logique la source commune des écrans.

### D3 — Contenus des phases 3 à 5

- corriger la phase d'introduction des aliments ;
- aligner portions, recettes, conseils, messages et notifications ;
- ne pas déplacer les aliments du catalogue général : seules leurs règles de reprise sont concernées.

### D4 — Saisie `Suivi`

- conserver `SaisieRepriseJeune` pendant la reprise ;
- proposer les aliments déjà disponibles ;
- appliquer le moteur commun ;
- enregistrer les écarts sans blocage ;
- conserver le résultat détaillé de l'évaluation.

### D5 — Harmonisation des écrans

- plan avant validation ;
- bandeau de `Suivi` ;
- journée de reprise ;
- fenêtre « Voir les aliments » ;
- liste de courses ;
- recettes et notifications ;
- bilan final.

Tous doivent distinguer les aliments nouvellement introduits dans la phase des aliments déjà disponibles depuis une phase précédente.

---

## 9. Travaux ultérieurs

### Lot E — Synchronisation Supabase des repas

Synchroniser les repas, dates réelles, dates de saisie, heures, quantités, calories, notes, ressentis et résultats des critères, avec fallback local et prévention des doublons.

### Lots F et G — Progression, historique et bilan

- séparer temps écoulé, couverture de saisie et conformité observée ;
- distinguer non renseigné et écart ;
- synchroniser l'historique ;
- comparer uniquement des données réellement comparables.

### Lot H — Tests de bout en bout

- plusieurs durées de jeûne ;
- cinq phases enregistrées et rechargées ;
- saisies conformes et hors recommandation ;
- saisies rétrospectives ;
- journées vides ;
- mobile et ordinateur ;
- changement d'appareil ;
- clôture et passage à la consolidation ;
- tests automatisés et build complet.

---

## 10. Fichiers centraux du chantier

- `docs/ETAT_DES_LIEUX_REPRISE_APRES_JEUNE_2026-08-16.md`
- `data/referentiel.js`
- `data/alimentsRepriseJeune.js`
- `lib/genererProgrammeReprise.js`
- `components/SaisieRepriseJeune.js`
- `pages/suivi.js`
- `pages/validation-plan-reprise.js`
- `pages/reprise-alimentaire-apres-jeune.js`
- `lib/parcoursJeuneAPI.js`

---

## 11. Point d'arrêt exact

Au moment de cette passation :

- le chaînage du parcours est présent sur la branche ;
- le lot B est terminé dans Supabase ;
- le lot C est implémenté et le build associé est réussi ;
- les décisions principales sur les cinq phases sont actées ;
- le défaut de raccordement entre le catalogue général et les règles de reprise est confirmé ;
- aucun développement du lot D n'a encore été réalisé ;
- aucun changement interne de la cristallisation n'est prévu ;
- aucun commit ni push ne doit être effectué sans autorisation explicite.

La prochaine action exacte est le lot D1 : produire la correspondance fiable entre les aliments du référentiel général et les règles de reprise, puis soumettre les anomalies de correspondance avant d'implémenter le moteur commun.

---

## 12. Journal complémentaire — Raccordement de la liste de courses

### État Git vérifié

Le 20 août 2026, la branche locale a été réalignée sur la branche distante
`finalisation-reprise-jeune-alimentaire-chatgpt`. Le document
`ETAT_DES_LIEUX_LISTE_COURSES_REPRISE_ALIMENTAIRE.md` est bien présent sur
GitHub au commit `c6825f7`.

Après la suppression automatique de l'ancien espace de travail temporaire, les
développements locaux D1 à E décrits dans les échanges postérieurs au point
d'arrêt ci-dessus n'ont pas été retrouvés dans l'historique Git de la branche.
Les modifications de schéma déjà appliquées directement dans Supabase peuvent
toujours exister dans la base distante, mais le code local non commité n'est
pas récupérable depuis GitHub. Les lots D1 à E ne doivent donc pas être
considérés comme livrés dans le code de cette branche tant qu'ils n'ont pas été
reconstitués, vérifiés puis publiés.

### Correction locale réalisée — étape 1

- ajout de `lib/listeCoursesReprise.js`, source commune de normalisation et de
  regroupement de la liste ;
- format canonique : tableau JSON d'articles contenant le nom, la quantité, la
  catégorie, la phase et la priorité ;
- compatibilité de lecture avec l'ancien objet groupé par catégorie ;
- `pages/validation-plan-reprise.js` affiche désormais le tableau réellement
  généré au lieu de le rejeter ;
- si la copie locale manque, cet écran récupère la dernière proposition de
  l'utilisatrice dans `reprises_alimentaires` et recrée la copie locale ;
- `pages/reprise-alimentaire-apres-jeune.js` ne recalcule plus une seconde
  liste J+1/J+2 : il affiche exactement `programme.liste_courses` ;
- les deux écrans annoncent donc la même période de sept jours et présentent
  les mêmes quantités enregistrées ;
- quatre tests unitaires couvrent le format courant, l'ancien format, le
  regroupement et les données invalides.

### Limite volontaire

Cette étape supprime les deux sources de vérité, mais ne prétend pas encore que
les aliments autorisés sont des repas choisis. Le générateur historique
continue à produire une liste indicative à partir des aliments possibles. La
séparation entre achats indispensables et alternatives, puis le calcul à
partir de repas réellement retenus, restent des décisions métier à réaliser
dans les étapes suivantes.

### Vérifications

- 4 tests ciblés réussis ;
- compilation Next.js réussie ;
- 37 pages statiques générées ;
- aucune modification du référentiel alimentaire général ;
- ce raccordement et la présente mise à jour de passation sont publiés
  ensemble sur la branche `finalisation-reprise-jeune-alimentaire-chatgpt`.

---

## 13. Reconstruction contrôlée des lots D1 à E — 20 août 2026

La mention précédente indiquant que D1 à E n'étaient pas présents dans Git
était un constat historique exact, pas l'affirmation que les travaux n'avaient
jamais existé. Ils avaient été réalisés localement après le dernier commit,
mais aucun objet Git, reflog ou branche distante ne contenait ces changements.
Ils ont donc été reconstruits à partir des décisions métier consignées, du code
encore publié et du diagnostic réel de Supabase.

### D1 — Cartographie du référentiel

- le référentiel général reste inchangé ;
- les aliments spécifiques à la reprise conservent leur propre règle ;
- aucune équivalence arbitraire n'est créée pour compote maison, pomme cuite,
  yaourts spécifiques, kiwi, pain au levain et chocolat 85 % ;
- seul le saumon frais possède la liaison générale fiable, avec vapeur ou
  papillote comme condition de reprise.

### D2 et D3 — Règles et phases

- règles centralisées dans `lib/repriseJeuneMetier.js` ;
- QN minimum 4 pour les phases 1 et 2, puis 3 pour les phases 3 à 5 ;
- 80 règles, 77 noms uniques ;
- phase 3 réalignée sur solides légers, protéines végétales et œufs en fin de
  phase ;
- phase 4 enrichie avec poulet, dinde, poisson blanc et petites crudités à
  partir du deuxième jour ;
- saumon, sardines, thon et produits laitiers déplacés en phase 5 ;
- notifications et recette de phase 5 réalignées sur ces introductions.

### D4 et D5 — Saisie et écrans

- questions de préparation et de texture seulement lorsqu'elles influencent
  l'évaluation ;
- choix « Je ne sais pas » et conservation du repas même en cas d'écart ;
- distinction entre nouveaux aliments et aliments encore disponibles depuis
  les phases précédentes ;
- anciens programmes harmonisés à leur chargement dans le suivi et le plan.

### E — Synchronisation Supabase

Le diagnostic transmis par la propriétaire confirme que la migration distante
avait survécu : table des repas à 19 colonnes, index unique
`(user_id, client_id)`, phases `phase1` à `phase5` et politiques RLS limitées au
propriétaire. Le code reconstruit :

- sauvegarde d'abord chaque repas localement ;
- utilise un UUID client stable et un upsert anti-doublon ;
- résout la journée Supabase puis convertit les moments vers
  `matin`, `midi`, `soir` ou `collation` ;
- conserve QN, préparation, texture, ressenti et évaluation JSON ;
- réessaie les synchronisations en attente au chargement et au retour en ligne ;
- convertit désormais les phases avant insertion et n'ignore plus silencieusement
  un échec de création des journées.

La migration distante est aussi représentée dans le dépôt par
`supabase/migrations/20260820000001_sync_repas_reprise_details.sql` afin que le
schéma appliqué ne dépende plus uniquement de l'historique de la conversation.

### Contrôles de reconstruction

- 16 tests ciblés réussis sur 16 ;
- suite globale : 38 tests réussis ; une suite historique ne se charge pas car
  `validation-semaine.test.js` utilise `require()` sur un module ES exporté,
  problème de configuration Jest antérieur et sans rapport avec D1 à E ;
- `git diff --check` sans erreur ;
- build Next.js réussi ;
- 37 pages statiques générées ;
- aucune modification du référentiel général ;
- aucun commit ni push effectué à ce stade.

### Checklist obligatoire de sauvegarde pour les prochaines modifications

Après chaque lot de modifications :

1. contrôler `git status` et la liste exacte des fichiers modifiés ;
2. exécuter les tests pertinents, `git diff --check` et le build si applicable ;
3. présenter le résultat et demander explicitement : « Veux-tu que je commit et
   push ces modifications ? » ;
4. ne commit ni ne push sans réponse affirmative ;
5. après autorisation, vérifier le commit local, pousser la branche puis vérifier
   le SHA et les fichiers réellement présents sur la branche distante ;
6. ne jamais annoncer un lot comme sauvegardé ou livré avant cette vérification
   distante.

---

## 14. Décision métier validée — Liste de courses personnalisée

La liste de courses de reprise couvre les sept premiers jours, ou toute la
reprise lorsqu'elle dure moins de sept jours. Elle ne doit plus transformer
tous les aliments autorisés en achats obligatoires.

Le parcours validé distingue :

- les achats indispensables pour démarrer, présélectionnés par l'application ;
- les groupes d'alternatives compatibles avec les phases réellement présentes
  pendant la période ;
- les préférences choisies par l'utilisatrice avant validation du programme.

La sélection reste volontairement plus légère qu'une planification complète de
menus. Les aliments autorisés servent de garde-fou métier, tandis que seuls les
indispensables et les alternatives retenues alimentent la liste définitive.

La liste validée doit contenir la période couverte, les quantités estimées, la
phase d'introduction et les indications de préparation utiles. Elle est ensuite
sauvegardée avec le programme et réutilisée sans recalcul parallèle sur les
écrans de validation et de suivi.

Les usages pratiques (acheté, déjà disponible, substitution après validation,
impression ou partage) restent réservés à l'étape suivante.

### Implémentation locale

- configuration des indispensables et alternatives par phase dans
  `lib/listeCoursesReprise.js` ;
- affichage uniquement des groupes correspondant aux phases présentes dans la
  période réellement couverte ;
- respect des introductions différées, notamment textures de phase 1 et
  crudités de phase 4 à partir du deuxième jour ;
- sélection multiple possible, avec au moins une option obligatoire par groupe
  visible ;
- aperçu immédiat de la liste, des quantités estimées et des préparations ;
- conservation locale des choix avant validation ;
- enregistrement de la liste définitive et des choix dans
  `reprises_alimentaires.liste_courses` et `options` lors de la validation ;
- préservation des journées détaillées dans la copie locale après la réponse
  Supabase ;
- réutilisation de la liste enregistrée dans le suivi, sans second calcul.

### Contrôles de cette étape

- 20 tests ciblés réussis sur 20 ;
- compatibilité avec l'ancien format de liste conservée ;
- `git diff --check` sans erreur ;
- build Next.js réussi ;
- 37 pages statiques générées ;
- aucun commit ni push effectué à ce stade.

---

## 15. Lot 3 — Quantités cohérentes de la liste de courses

Le calcul des quantités est désormais explicite et traçable. Pour chaque
article sélectionné, la liste conserve :

- la portion prévue pour une utilisation ;
- le nombre d'utilisations estimées pendant la période couverte ;
- la quantité numérique totale et son unité ;
- la quantité d'achat affichée à l'utilisatrice.

Lorsqu'une utilisatrice sélectionne plusieurs alternatives d'un même groupe,
les jours éligibles sont répartis entre ces choix. Les introductions différées
continuent d'être respectées : une crudité de phase 4 n'est donc comptée qu'à
partir du deuxième jour de cette phase. Les articles identiques peuvent être
agrégés uniquement lorsque leur préparation et leur unité sont identiques ; une
carotte destinée au jus ne doit pas être confondue avec une carotte destinée à
être râpée.

L'affichage utilise des unités d'achat lisibles : unités entières pour les
fruits et légumes achetés à la pièce, grammes ou millilitres pour les petites
quantités, puis kilogrammes ou litres à partir de 1 000 g/ml. Les quantités
fixes comme une bouteille ou une boîte restent inchangées.

L'aperçu de validation montre également le nombre d'utilisations et la portion
correspondante. Ces métadonnées sont conservées dans le JSONB `liste_courses`
du programme : la quantité sauvegardée et celle réutilisée dans les autres
écrans restent donc identiques, sans recalcul parallèle.

### Contrôles du lot 3

- 16 tests ciblés réussis sur 16 ;
- calcul vérifié sur les portions, les utilisations, les introductions
  différées et les conversions en unités d'achat ;
- `git diff --check` sans erreur ;
- build Next.js réussi ;
- 37 pages statiques générées.

### Prochaine étape validée dans le plan d'action

Le lot 4 portera sur l'utilisation pratique de la liste sauvegardée : états
« acheté » et « déjà disponible », modification ou substitution après
validation, puis définition du besoin d'impression ou de partage. Ces états ne
devront pas provoquer un recalcul concurrent de la liste métier enregistrée.

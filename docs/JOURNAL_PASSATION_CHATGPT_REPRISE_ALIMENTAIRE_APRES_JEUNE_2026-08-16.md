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

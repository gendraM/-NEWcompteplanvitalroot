# PLAN D'ACTION AUTOMATISATION PHASE 2 PREPA JEUNE

Date: 08/08/2026
Scope: Preparation jeune - Phase 2 (complements d'automatisation)
Statut: A executer

## Objectif global

Completer l'automatisation de la phase 2 de preparation jeune sans casser les acquis de la phase 1:
- garder le modele metier canonique deja aligne
- augmenter l'auto-detection des criteres encore partiels
- conserver une UX claire: ce qui est "prepa" ne s'affiche que si la prepa est active

## Regle produit a verrouiller

Regle retenue:
- tout affichage et toute logique "prepa jeune" dans la page suivi doivent etre conditionnes a `preparationActive === true`
- si la prepa jeune n'est pas active, les blocs prepa ne s'affichent pas dans suivi
- la saisie repas standard reste disponible (elle n'est pas supprimee), mais sans les aides/criteres prepa

## Perimetre phase 2

Criteres cibles:
- Critere 3: elimination produits transformes/sucreries
- Critere 4: suivi des 2 jours de jeune plein
- Critere 5: transition alimentaire pre-jeune
- Critere 6: automatisation assistee (validation guidee, pas 100% automatique)

Dependances:
- source de verite metier dans `lib/preparationJeuneMetier.js`
- moteur de validation dans `lib/validerCriterePreparation.js`
- instrumentation de saisie dans `pages/suivi.js` et `components/RepasBloc.js`
- restitution dans `pages/preparation-jeune.js` et `components/PhaseCard.js`

## Etapes d'implementation

### Etape 1 - Verrouillage d'activation prepa dans suivi

Objectif:
- garantir un gate unique `preparationActive` pour l'UI et les effets prepa

Actions:
1. Centraliser la lecture de `preparationActive` dans `pages/suivi.js`.
2. Conditionner la banniere critere du jour et les pastilles prepa a ce gate.
3. Bloquer l'auto-validation prepa si le gate est inactif.
4. Conserver la saisie repas standard hors mode prepa.

Definition de fini:
- aucun composant prepa visible dans suivi quand prepa inactive
- aucun calcul prepa lance en tache de fond quand prepa inactive

### Etape 2 - Automatisation critere 3

Objectif:
- detecter de maniere fiable les aliments transformes/sucres

Actions:
1. Definir un referentiel minimal de mots-cles/categories en dur (version 1) dans le moteur de validation.
2. Prioriser les champs structurels (`categorie`, tags) sur la simple recherche textuelle.
3. Ajouter un statut journalier: conforme / ambigu / non conforme.
4. Exposer les cas ambigus dans l'UI avec message d'aide.

Definition de fini:
- statut critere 3 calcule sur 7 jours
- traces de diagnostic exploitables dans la page preparation

### Etape 3 - Automatisation critere 4

Objectif:
- suivre les "jours de jeune plein" sans faux positifs

Actions:
1. Definir la regle metier explicite d'un jour de jeune plein (absence de repas solides, exceptions, horodatage).
2. Ajouter une fonction dediee dans le moteur.
3. Produire un compteur progressif sur la fenetre active.
4. Afficher le detail des jours valides/non valides.

Definition de fini:
- compteur fiable "x/2 jours de jeune plein"
- details jour par jour disponibles pour debug utilisateur

### Etape 4 - Automatisation critere 5

Objectif:
- verifier la transition pre-jeune a partir des repas reels

Actions:
1. Mapper les categories autorisees/interdites de la transition.
2. Evaluer chaque jour de la fenetre selon ce mapping.
3. Ajouter une tolerance "donnees insuffisantes" pour eviter les validations incorrectes.

Definition de fini:
- statut critere 5 visible avec niveau de confiance
- aucune validation automatique en cas de donnees insuffisantes

### Etape 5 - Critere 6 en mode assiste

Objectif:
- proposer une validation assistee et tracable

Actions:
1. Introduire un flux assiste (checklist + confirmation utilisateur).
2. Pre-remplir les suggestions a partir des repas saisis et categories (ex: "Jeune").
3. Persister la justification de validation manuelle/assistee.

Definition de fini:
- critere 6 validable avec preuve de decision
- historique clair de qui a valide et pourquoi

### Etape 6 - Restitution et coherence cross-pages

Objectif:
- avoir une lecture identique dans suivi et preparation

Actions:
1. Uniformiser les statuts calcules (meme enum et memes labels).
2. Afficher les diagnostics des 4 criteres sur la carte phase active.
3. Eviter les contradictions entre banniere suivi et dashboard preparation.

Definition de fini:
- meme resultat visible des deux cotes pour une meme date

### Etape 7 - Tests et securisation

Objectif:
- prevenir les regressions

Actions:
1. Ajouter tests unitaires des nouvelles regles dans `tests/validerCriterePreparation.auto.test.js`.
2. Ajouter tests de gate d'affichage prepa dans `pages/suivi.js` (ou tests d'integration utilitaire selon stack).
3. Verifier build + scenario manuel: prepa active/inactive.

Definition de fini:
- tests cibles au vert
- comportement confirme en manuel sur au moins 2 scenarios (actif/inactif)

## Guardrails techniques

- Ne jamais valider automatiquement un critere si les donnees sont partielles ou ambigues.
- Toujours preferer un statut "a confirmer" plutot qu'un faux "valide".
- Journaliser les raisons de non-validation pour aider le support/debug.

## Rollback plan

1. Feature flag local pour desactiver l'automatisation phase 2.
2. Conservation du chemin manuel actuel comme filet de securite.
3. Reversion ciblee des fonctions d'auto-validation sans toucher la saisie repas.

## Ordre de priorite d'execution

1. Gate prepa dans suivi (bloquant UX)
2. Critere 3
3. Critere 4
4. Critere 5
5. Critere 6 assiste
6. Harmonisation UI
7. Tests + validation finale

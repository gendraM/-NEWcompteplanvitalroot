# PLAN D'ACTION — MISE EN CONFORMITE PREPA JEUNE

Date: 29/06/2026
Scope: Cycle preparation jeune uniquement
Statut: Valide par l'utilisateur

## Objectif global

Mettre le cycle preparation jeune en conformite avec:
- les ambitions UX du cycle preparation jeune
- les plans d'implementation lies a la prepa jeune
- l'etat reel du code deja en place

Le principe retenu est:
- conserver les briques deja fonctionnelles
- supprimer les divergences de modele
- unifier le parcours preparation -> jeune -> reprise
- completer les briques encore inachevees

## Plan d'action global

### Phase 1 — Unifier la source de verite metier prepa jeune

Objectif:
Faire de la logique prepa jeune un modele unique partage par toute l'application.

Probleme vise:
- [pages/preparation-jeune.js](pages/preparation-jeune.js) porte aujourd'hui le modele le plus riche
- [lib/preparationJeuneMetier.js](lib/preparationJeuneMetier.js) porte encore un ancien modele plus simple
- [components/StartPreparationModal.js](components/StartPreparationModal.js) s'appuie encore sur ce modele ancien

Resultat attendu:
- memes phases partout
- memes 9 criteres partout
- memes jalons partout
- memes labels partout
- meme logique de progression partout

Travaux prevus:
1. Refaire [lib/preparationJeuneMetier.js](lib/preparationJeuneMetier.js) pour y mettre le modele de reference complet.
2. Sortir dupliquations et definitions locales de [pages/preparation-jeune.js](pages/preparation-jeune.js) quand elles doivent devenir partagees.
3. Brancher [components/StartPreparationModal.js](components/StartPreparationModal.js) sur le modele aligne.
4. Verifier [pages/start-preparation.js](pages/start-preparation.js) pour conserver un demarrage coherent avec le meme modele.
5. Ajouter des tests de non-regression sur les phases, criteres et jalons.

Critere de sortie:
- un seul modele metier alimente la preparation jeune
- aucun ecran ne raconte une autre version des phases ou criteres

### Phase 2 — Unifier le parcours preparation -> jeune -> reprise

Objectif:
Transformer les trois etapes en un seul parcours utilisateur lisible.

Travaux prevus:
1. Definir un statut global de parcours.
2. Clarifier la transition de fin de preparation vers le jeune.
3. Clarifier la transition de fin de jeune vers la reprise.
4. Propager le contexte du parcours d'un module a l'autre.

Critere de sortie:
- l'utilisateur ressent un seul cycle et non trois modules isoles

### Phase 3 — Completer l'historique avance preparation jeune

Objectif:
Rendre l'historique exploitable comme outil d'apprentissage.

Travaux prevus:
1. Finaliser [components/DetailPreparationJeune.js](components/DetailPreparationJeune.js).
2. Implementer [lib/statistiquesPreparationsJeune.js](lib/statistiquesPreparationsJeune.js).
3. Implementer [lib/comparePreparationsJeune.js](lib/comparePreparationsJeune.js).
4. Implementer [lib/notesPreparationJeune.js](lib/notesPreparationJeune.js).

Critere de sortie:
- l'utilisateur peut relire, comprendre et comparer ses anciennes preparations

### Phase 4 — Fermer les ecarts UX et scenarios produit

Objectif:
Mettre l'experience en conformite avec les plans les plus complets.

Travaux prevus:
1. Gerer les demarrages tardifs avec guidance reelle.
2. Homogeneiser les messages et statuts.
3. Completer le bilan final de preparation.
4. Finaliser les derniers ecarts UX entre suivi, preparation et historique.

Critere de sortie:
- l'utilisateur comprend ou il en est, quoi faire, et ce qui vient ensuite

## Ordre de priorite retenu

1. Phase 1 — Modele metier unique
2. Phase 2 — Parcours unifie
3. Phase 3 — Historique avance
4. Phase 4 — Scenarios tardifs et finitions UX

## Demarrage retenu

Le chantier commence par la phase 1.

### Cadrage operationnel de la phase 1

Fichiers cibles:
- [lib/preparationJeuneMetier.js](lib/preparationJeuneMetier.js)
- [pages/preparation-jeune.js](pages/preparation-jeune.js)
- [components/StartPreparationModal.js](components/StartPreparationModal.js)
- [pages/start-preparation.js](pages/start-preparation.js)
- [tests/validerCriterePreparation.auto.test.js](tests/validerCriterePreparation.auto.test.js)

Actions concretes:
1. Relever le modele de reference dans [pages/preparation-jeune.js](pages/preparation-jeune.js): 3 phases, 9 criteres, jalons, labels, descriptions, conseils.
2. Recrire [lib/preparationJeuneMetier.js](lib/preparationJeuneMetier.js) pour qu'il expose ce modele unique.
3. Faire consommer ce modele a [components/StartPreparationModal.js](components/StartPreparationModal.js) a la place des definitions anciennes implicites.
4. Remplacer les dependances locales de [pages/preparation-jeune.js](pages/preparation-jeune.js) par le modele partage quand cela n'introduit pas de regression.
5. Ajouter des tests sur la structure des phases et criteres pour verrouiller l'alignement.
6. Verifier compilation et tests cibles.

Definition de fini phase 1:
- la modale, la page preparation et le modele partage utilisent la meme structure
- il n'y a plus de decalage J-14/J-7 contre J-30/J-17/J-14/J-12/J-7
- les 9 criteres deviennent la reference commune

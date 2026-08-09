# PLAN D'ACTION — BILAN PREPA JEUNE ADAPTATIF

Date: 08/08/2026
Scope: Bilan final de la préparation jeune
Statut: En cours

## Objectif global

Rendre le bilan final de la préparation jeune plus juste, plus lisible et plus utile pour l'utilisateur.

Le bilan doit:
- comparer l'état alimentaire avant la préparation et à la fin de la préparation
- rester limité à 3 éléments visibles maximum
- adapter la phrase finale selon le résultat réel
- éviter les doublons et les listes trop longues

## Règles produit retenues

1. Le bilan ne doit pas servir à valider la préparation.
2. Le bilan doit servir à expliquer l'évolution entre le point de départ et la fin de la préparation.
3. Le bilan final doit afficher au maximum:
   - 1 point fort
   - 2 axes d'amélioration
   - 1 priorité concrète
4. La phrase de clôture doit être adaptée au résultat:
   - félicitations si tout est respecté
   - encouragement sinon
5. Le bilan doit garder un ton simple, concret et actionnable.

## Cas à couvrir

### Cas 1 — Préparation démarrée tard

Attendu:
- analyser les 7 jours avant activation comme baseline
- comparer baseline vs fin de préparation
- mettre en avant la progression réelle
- proposer 3 éléments maximum liés aux besoins prioritaires

### Cas 2 — Préparation démarrée tard avec progression visible

Attendu:
- montrer l'amélioration entre baseline et fin de préparation
- valoriser un progrès réel
- conserver 2 axes d'amélioration maximum

### Cas 3 — Préparation complète puis jeûne en cours

Attendu:
- comparer l'état de départ et l'état en fin de préparation
- montrer la stabilité ou l'amélioration avant le passage au jeûne
- conclure avec un message de transition vers le jeûne

## Étapes d'implémentation

### Étape 1 — Structurer les données de bilan

Objectif:
- séparer baseline avant prépa et période de préparation active

Travaux:
1. Identifier la date d'activation de la préparation.
2. Isoler les repas avant activation pour la baseline.
3. Isoler les repas après activation pour la période de préparation.
4. Conserver les repas de la préparation comme seule base de comparaison des critères.

### Étape 2 — Générer un bilan court et lisible

Objectif:
- limiter le bilan à 3 éléments utiles

Travaux:
1. Construire une synthèse avant / après.
2. Garder 1 point fort maximum.
3. Garder 2 axes d'amélioration maximum.
4. Ajouter 1 priorité concrète.

### Étape 3 — Adapter la phrase finale

Objectif:
- conclure selon le résultat réel

Travaux:
1. Si tous les critères attendus sont respectés, afficher une phrase de félicitations.
2. Sinon, afficher une phrase d'encouragement.
3. Garder le message de passage au jeûne à la fin.

### Étape 4 — Sécuriser la cohérence métier

Objectif:
- éviter les faux messages et les ambiguïtés

Travaux:
1. Vérifier que le bilan ne valide rien à partir du baseline.
2. Vérifier que la comparaison avant / après reste compréhensible.
3. Vérifier que le parcours prépa active reste distinct du bilan final.

## Critères de sortie

- le bilan final est court et lisible
- le bilan compare clairement avant prépa et fin de prépa
- le contenu affiché est adapté à la réalité utilisateur
- la phrase finale change selon le résultat réel

## Priorité d'exécution

1. Structurer les données de bilan
2. Générer la synthèse courte
3. Adapter la phrase finale
4. Vérifier la cohérence UX

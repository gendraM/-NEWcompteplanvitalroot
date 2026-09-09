# Défis V2 — moteur intelligent

## Objectif

Faire passer les défis d'un catalogue manuel à une intervention contextuelle : l'application observe les faits déjà produits par Mon Plan Vital, détecte un signal utile, puis choisit au maximum une proposition de défi compréhensible et non punitive.

## Principe d'architecture

Données Mon Plan Vital → faits récents → détection de signaux → filtre de sollicitation → choix d'un défi disponible et éligible → proposition à l'utilisateur → acceptation/refus → activation par le flux Défis existant.

Le moteur ne doit jamais démarrer un défi tout seul.

## Sources réelles identifiées

- `repas_reels` : date, satiété, humeur associée, respect du plan, extras et autres faits repas.
- `extras` : date, kcal, contexte, humeur.
- `semaines_validees` : budget extras, extras, satiété moyenne, humeur dominante, jours saisis et synthèses hebdomadaires.
- `historique_poids` : mesures datées pour une future détection prudente de stagnation.
- `defis` : défis disponibles et défi actif de l'utilisateur.
- `stats_comportementales` existe mais n'est pas encore alimentée : elle ne doit donc pas être considérée comme source fiable du moteur à ce stade.

## Première couche livrée

`lib/defisMoteurIntelligent.js` reste une couche de décision pure, sans écriture en base ni activation automatique.

Signaux initiaux :

- satiété difficile → `💡 J’écoute mon ventre`
- extras répétés / budget dépassé → `✨ Je me programme du plaisir`
- bonne régularité → `💧 1 cru par jour`
- dynamique hebdomadaire positive → petit défi progressif
- stagnation sur plusieurs mesures → défi comportemental, sans message centré sur le poids

## Règles de sollicitation validées

La mémoire de sollicitation est persistée dans `defis_solicitations`.

Lorsqu'un utilisateur répond `Pas maintenant` :

1. le défi refusé est exclu pendant 7 jours ;
2. aucune autre proposition intelligente n'est affichée pendant les 2 jours qui suivent ce refus ;
3. après ces 2 jours, le moteur peut recommencer à analyser les données et proposer un autre défi pertinent ;
4. la fin du délai de 2 jours n'oblige jamais le moteur à proposer un défi : sans signal pertinent, aucune proposition n'est affichée ;
5. à la fin des 7 jours, le défi refusé redevient seulement éligible à l'analyse ;
6. il n'est donc pas automatiquement reproposé au septième jour : il doit encore correspondre à un signal réellement détecté ;
7. s'il est de nouveau pertinent mais qu'un autre défi possède un signal plus prioritaire, le défi le plus pertinent est proposé ;
8. un défi encore dans son délai de 7 jours est retiré des candidats avant l'arbitrage, ce qui permet au moteur de sélectionner le meilleur candidat suivant une fois la latence globale de 2 jours terminée.

Les deux délais ont donc des fonctions distinctes :

- **2 jours = protection contre la sur-sollicitation globale après un refus** ;
- **7 jours = délai minimum avant que le défi précisément refusé puisse redevenir candidat**.

## Garde-fous

- aucune proposition si un défi est déjà actif ;
- aucune activation automatique ;
- humeur fragile = pas de sollicitation ;
- une raison explicable accompagne chaque proposition ;
- les signaux reposent sur plusieurs observations lorsque possible ;
- absence de données = absence de diagnostic, pas interprétation négative ;
- le moteur choisit uniquement parmi les défis réellement disponibles et éligibles pour l'utilisateur ;
- expiration d'un délai ne vaut jamais pertinence ; les données doivent toujours justifier la proposition.

## État d'implémentation

- collecteur de contexte utilisateur strictement `user_id` : réalisé ;
- détection des premiers signaux : réalisée ;
- carte de proposition Accepter / Pas maintenant : réalisée ;
- raccordement de l'acceptation au flux d'activation existant : réalisé ;
- mémoire persistante des réponses : réalisée ;
- cooldown de 7 jours par défi refusé : réalisé ;
- latence globale de 2 jours après `Pas maintenant` : réalisée ;
- sélection d'un candidat alternatif après la latence, en excluant les défis encore en cooldown : réalisée.

## Étapes suivantes

1. Fiabiliser progressivement les sources d'humeur et les règles de priorité lorsque davantage de données réelles seront disponibles.
2. Ajouter des tests unitaires du moteur et des règles de sollicitation.
3. Ajouter ensuite les validateurs automatic / declarative / mixed sans modifier les principes du moteur de proposition.

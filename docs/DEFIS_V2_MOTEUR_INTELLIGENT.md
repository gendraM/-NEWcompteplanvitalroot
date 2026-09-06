# Défis V2 — moteur intelligent

## Objectif

Faire passer les défis d'un catalogue manuel à une intervention contextuelle : l'application observe les faits déjà produits par Mon Plan Vital, détecte un signal utile, puis choisit au maximum une proposition de défi compréhensible et non punitive.

## Principe d'architecture

Données Mon Plan Vital → faits récents → détection de signaux → filtre de sollicitation → choix d'un défi disponible → proposition à l'utilisateur → acceptation/refus → activation par le flux Défis existant.

Le moteur ne doit jamais démarrer un défi tout seul.

## Sources réelles identifiées

- `repas_reels` : date, satiété, humeur associée, respect du plan, extras et autres faits repas.
- `extras` : date, kcal, contexte, humeur.
- `semaines_validees` : budget extras, extras, satiété moyenne, humeur dominante, jours saisis et synthèses hebdomadaires.
- `historique_poids` : mesures datées pour une future détection prudente de stagnation.
- `defis` : défis disponibles et défi actif de l'utilisateur.
- `stats_comportementales` existe mais n'est pas encore alimentée : elle ne doit donc pas être considérée comme source fiable du moteur à ce stade.

## Première couche livrée

`lib/defisMoteurIntelligent.js` est volontairement une couche pure, sans écriture en base ni changement d'UI.

Signaux initiaux :

- satiété difficile → `💡 J’écoute mon ventre`
- extras répétés / budget dépassé → `✨ Je me programme du plaisir`
- bonne régularité → `💧 1 cru par jour`
- dynamique hebdomadaire positive → petit défi progressif
- stagnation sur plusieurs mesures → défi comportemental, sans message centré sur le poids

## Garde-fous

- aucune proposition si un défi est déjà actif ;
- aucune activation automatique ;
- humeur fragile = pas de sollicitation ;
- une raison explicable accompagne chaque proposition ;
- les signaux reposent sur plusieurs observations lorsque possible ;
- absence de données = absence de diagnostic, pas interprétation négative ;
- le moteur choisit uniquement parmi les défis réellement disponibles pour l'utilisateur.

## Étapes suivantes

1. Créer le collecteur de contexte utilisateur, strictement `user_id`.
2. Brancher les données réelles sur `detecterSignauxDefis`.
3. Exposer une seule proposition dans l'interface avec Accepter / Pas maintenant.
4. Raccorder Accepter au flux d'activation existant en conservant la règle d'un seul défi actif.
5. Ajouter une mémoire de sollicitation/refus pour éviter de reproposer trop souvent.
6. Ajouter ensuite les validateurs automatic / declarative / mixed sans modifier le moteur de proposition.

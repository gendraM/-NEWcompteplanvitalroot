# Idéaux — règles métier validées

## Trajectoire et adaptation

Principe validé : **adapter la difficulté, jamais abandonner la direction**.

- L’objectif final, son indicateur et sa date cible constituent le cap.
- Le Palier 1 proposé puis validé par l’utilisateur devient la référence de départ.
- La durée du palier n’est pas implicitement de 4 semaines : la référence est `plan_params_valides.palierDuree`.
- Les réalisations réelles du palier servent à construire la suite ; le moteur ne doit pas simplement recopier le plan théorique.
- L’adaptation ne doit pas maintenir indéfiniment l’utilisateur dans sa zone de confort.
- Quand un rythme est suffisamment installé, le palier suivant doit proposer une progression mesurable.
- Pour limiter la surcharge, la progression doit privilégier une dimension à la fois (durée, fréquence, intensité ou difficulté selon l’objectif).
- Si la trajectoire réelle ne permet plus raisonnablement d’atteindre la cible à la date prévue, l’application doit rendre l’écart visible sans culpabiliser et proposer un arbitrage : progression raisonnable ou révision de la date cible.
- La constance et le retour après difficulté comptent davantage qu’un streak parfait.

## Chaîne fonctionnelle cible

Idéal → objectif → proposition Palier 1 → validation → paramètres figés → séances prévues → réalisations réelles → bilan du palier → génération du palier suivant à partir du cap et de la réalité.

## Source de vérité des réalisations

Pour la compatibilité avec OBSERVE / Align-Life, une séance accomplie est prouvée par `seances_reelles.fait === true`. Le champ `statut` peut rester présent pour compatibilité UI/historique, mais ne doit pas devenir une seconde vérité divergente.

## Palier échu et reprise après interruption

- Un palier arrivé à sa date de fin n'est jamais prolongé ou régénéré silencieusement.
- Son plan, ses paramètres figés et son bilan réel sont conservés dans l'historique.
- La reprise commence par un bilan court : objectif toujours souhaité, cause de l'interruption, niveau actuel et rythme réaliste.
- Si la date cible est passée, l'utilisateur choisit explicitement une nouvelle date ; l'application ne la décale pas seule.
- Le palier suivant commence à la date de reprise et adapte au plus une dimension de difficulté.
- Aucune nouvelle séance n'est créée avant la validation explicite de la proposition.
- Si l'utilisateur ne souhaite pas reprendre maintenant, l'Idéal est mis en pause sans supprimer sa direction ni son historique.

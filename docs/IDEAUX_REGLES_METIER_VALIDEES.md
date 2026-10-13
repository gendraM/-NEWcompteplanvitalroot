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


## Choix de la dimension du palier suivant

### Cap final, sous-objectifs et feedback

- Le titre de l’Idéal porte le cap final ; l’indicateur saisi peut représenter un sous-objectif utile et ne doit pas être écrasé.
- Chaque bilan compare la régularité et, lorsqu’elles existent, la durée, la vitesse et la distance réellement réalisées avec le palier précédent.
- Une projection est indicative : elle montre ce que le rythme prudent actuel permettrait à la date cible, sans promettre un résultat.
- Si la projection est insuffisante, l’utilisateur choisit soit de conserver la date comme étape intermédiaire, soit de rallonger le plan. La direction finale reste conservée.
- Le feedback de semaine reste factuel : prévu, réalisé, écarts mesurés et prochaine action concrète.
- Une performance supérieure est reconnue sans devenir une nouvelle exigence sur une seule occurrence.
- Même en cas de surperformance, une semaine incomplète rappelle d’abord la prochaine séance prévue ; régularité et progression doivent avancer ensemble.
- Une semaine tenue n’est pas présentée comme un aboutissement : elle doit être confirmée avant toute augmentation prudente du palier suivant.

- Une performance isolée supérieure au repère est valorisée mais ne devient pas automatiquement une nouvelle exigence.
- Une dimension ne devient candidate à la progression que lorsqu'un signal répété existe sur plusieurs réalisations.
- Si plusieurs dimensions progressent simultanément, l'indicateur principal lié au cap est prioritaire.
- Le moteur ne fait progresser qu'une seule dimension à la fois ; les autres repères restent stables.
- La nouvelle cible reste prudente : elle n'absorbe pas automatiquement toute la surperformance constatée.
- Si aucun signal suffisamment solide n'existe, le palier suivant consolide les repères plutôt que d'augmenter artificiellement la difficulté.
- La même règle s'applique aux Idéaux sportifs et non sportifs ; le sens de progression appartient à chaque indicateur (augmenter, diminuer ou viser une cible).

## Défloutage de l'image motivante

- Le défloutage représente une progression réellement vécue, jamais le simple passage du temps.
- Chaque palier archivé contribue selon son bilan réel ; un palier partiel conserve donc la part effectivement accomplie.
- Le palier courant contribue selon `progression_palier`, calculée uniquement à partir des séances prévues ayant `fait === true`.
- Les séances bonus ne gonflent pas le défloutage du cap principal.
- Le nombre total de paliers restant est estimé depuis la date de début et la durée validées du palier courant jusqu'à la date cible.
- Lorsque l'Idéal est marqué `atteint`, l'image devient entièrement nette.

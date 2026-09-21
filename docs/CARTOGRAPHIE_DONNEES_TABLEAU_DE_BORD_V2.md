# Tableau de bord V2 — Cartographie des données et règles canoniques

> Phase 1 — état de travail au 21/09/2026.
> Branche : `tableau-de-bord-v2`.
> Objectif : empêcher le nouveau tableau de bord de recréer des règles métier divergentes.

## Légende
- **CANONIQUE** : moteur métier identifiable et réutilisable.
- **SOURCE OK / CALCUL À CENTRALISER** : données fiables, mais le dashboard calcule encore lui-même l'indicateur.
- **EN CONVERGENCE** : une branche métier plus avancée doit être intégrée/stabilisée avant raccord définitif.
- **TRANSITOIRE** : source actuelle à ne pas pérenniser.
- **À AUDITER** : source ou règle pas encore suffisamment établie.

## Matrice

| Domaine | Source / règle identifiée | État | Usage V2 |
|---|---|---|---|
| Poids | Supabase `historique_poids`; dashboard lit date + poids | SOURCE OK / CALCUL À CENTRALISER | Départ → tendance → aujourd'hui → objectif ; historique en couche 2. La moyenne ne sera plus le KPI principal. |
| Extras — événements | `repas_reels.est_extra`; `validationSemaine.js` détecte `est_extra === true` | CANONIQUE | Détails de période sans réinventer la détection. |
| Extras — progression | `semaines_validees` + `lib/extrasProgression.js` : paliers 5→3→2→1, 4/8/12 semaines, adaptation après 3 semaines consécutives dépassées, fréquence + budget kcal | CANONIQUE / branche Extras | Couche 1 : palier et prochaine étape. Couche 2 : historique, transitions, adaptations. |
| Extras — badges | Supabase `badges` + `lib/extrasBadges.js` | CANONIQUE / branche Extras | Highlight ponctuel en couche 1 ; historique en couche 2. |
| Validation / régularité | `semaines_validees` + helpers de validation | SOURCE OK / À ALIGNER avec restauration des trous de suivi | Couche 2 ; couche 1 seulement si action réellement nécessaire. Absence ≠ échec. |
| Repas réels | Supabase `repas_reels` | SOURCE OK | Base Repas, faim/satiété, Extras, Fast-food et alignement. |
| Faim / satiété | champs repas ; dashboard actuel réduit le signal à `raison_manger === "J'avais faim"`; le chantier point d'ajustement exploite des signaux plus riches | CALCUL DASHBOARD À REMPLACER | Séparer faim, satiété et ressenti. Observation seulement si données suffisantes. |
| Planifié vs réel | repas planifiés + repas réels ; `alignementRepas.js` et helpers de planification | CANONIQUE / branche Plan alimentaire | Routine/point d'appui en couche 1 si robuste ; analyse en couche 2. |
| Point d'ajustement | `pointAjustementAlimentaire.js` : fenêtre 15 jours, minimums d'occurrences/répétitions, affichage jeudi→samedi | CANONIQUE / branche Plan alimentaire | Peut nourrir « À observer » uniquement lorsque le moteur conclut qu'un signal est prêt. |
| Humeur / bien-être | Supabase `humeur_checkin`; comptage local actuel | SOURCE OK / CALCUL À CENTRALISER | Tendance si échantillon suffisant ; détail en couche 2 ; aucune causalité inventée. |
| Défis | Supabase `defis`; branche `defis-v2` : statuts et un seul défi actif | EN CONVERGENCE | Couche 1 : défi actif unique ; couche 2 : historique. Le dashboard ne fait jamais progresser un défi. |
| Idéaux | Supabase `ideaux` + `seances_reelles`; `chargerIdeauxAvecProgression`, `ideauxPalier`, `ideauxBilanPalier`, `ideauxCycle` | CANONIQUE / branche Idéaux | Remplacer le calcul local du dashboard ; cap actif + palier courant, détails en couche 2. |
| Align-Life | chantier dédié OBSERVE → ALIGN → ADAPT → GROW | À AUDITER / EN CONVERGENCE | Ne pas inventer de calcul provisoire ; réserver le contrat de données. |
| Jeûne / préparation | dashboard encore basé sur `localStorage`; modules dédiés disposent de persistance | TRANSITOIRE | Identifier la source persistante avant raccord V2. |
| Reprise après jeûne | chantier Reprise + `repriseJeuneMetier.js` | EN CONVERGENCE | Couche 1 si phase active/prioritaire ; historique en couche 2. |
| Fast-food | `repas_reels` + `fastFoodRewards.js` (délai 45 jours, séries, badges) | CANONIQUE historique, UX à revoir | Couche 2 par défaut ; couche 1 uniquement si événement notable. |
| Badges globaux | Supabase `badges`, plusieurs producteurs métier | SOURCE OK / PRODUCTEURS MULTIPLES | Dernier accomplissement pertinent en couche 1 ; collection en couche 2. |
| Routines | signaux issus de plusieurs modules | À CONSTRUIRE dans la synthèse | Règles explicites/testables : Stable / En construction / À observer. |

## Constats techniques prioritaires

1. **Le dashboard actuel effectue trop de calculs métier.** La V2 doit s'appuyer sur les moteurs des modules et une couche de synthèse testable.
2. **Filtrage utilisateur.** Les nouvelles lectures doivent obtenir l'utilisateur authentifié et filtrer explicitement par `user_id` lorsque la table le permet, en complément de la RLS.
3. **Extras.** Le moteur de progression Extras doit devenir la source du dashboard ; aucun statut parallèle.
4. **Idéaux.** Le calcul historique du dashboard est dépassé par `ideaux-finalisation`; la V2 devra consommer la progression du palier courant.
5. **Faim / satiété.** Le taux actuel « J'avais faim » ne représente pas à lui seul la satiété.
6. **Jeûne.** Le localStorage reste un héritage transitoire, pas une source de vérité V2.
7. **Corrélations.** Aucune relation humeur/alimentation ou autre causalité ne sera formulée sans règle explicite et données suffisantes.

## Contrat cible de la couche de synthèse

La future couche exposera conceptuellement :
- `dataAvailability`
- `weightStatus`
- `extrasStatus`
- `mealSignals`
- `wellbeingStatus`
- `activeChallenge`
- `activeIdeal`
- `activeJourneyPhase`
- `highlights`
- `pointsAppui`
- `pointsObservation`

## Règles de disponibilité

1. Aucune donnée → état neutre, jamais score nul implicite.
2. Données insuffisantes → « pas encore assez de recul ».
3. Données partielles → afficher uniquement ce qui est fiable.
4. Longue interruption → distinguer historique et période actuelle ; ne pas prolonger artificiellement une série.
5. Un highlight repose sur un fait mesurable ; pas de compliment aléatoire.
6. Les modules métier restent propriétaires de leurs règles.

## Prochaine étape

Construire la couche de synthèse V2 avec des fonctions pures et testables, en commençant par **disponibilité des données, poids et Extras**, puis raccorder Défis et Idéaux lorsque leurs versions stabilisées sont présentes dans la branche de consolidation.

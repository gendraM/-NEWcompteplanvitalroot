# Align-Life — Plan d'action & journal de passation

**Branche : `Align-Life`**  
**Statut : P0-P4.5 validés ; P5 Incarnation/ALIGN implémenté ; P5.1 OBSERVE déterministe implémenté ; P5.2 tendance longitudinale Idéaux implémentée ; P5.3 Idéaux × poids cadré ; validations Vercel à faire ; GROW comportemental non commencé.**

## Principes verrouillés
- Nom visible : **My Way** ; Boussole = concept interne.
- Mon Pourquoi reste dans `profil.pourquoi` et n'est pas dupliqué.
- My Way évolue sans formulaire obligatoire.
- **Ne jamais exposer toutes les dimensions My Way d'un coup au premier accès.**
- Parcours : graine → ouverture → « je sais déjà / je découvre en avançant » → dévoilement progressif.
- **Incarnation ≠ questionnaire obligatoire : elle peut être exprimée volontairement ou révélée plus tard par le réel.**
- **Direction → Incarnation est un chemin direct ; l'aspiration n'est pas un prérequis.**
- **ALIGN montre à la fois ce qui est déjà vécu et ce qui reste à construire ; il ne fabrique pas un problème.**
- **OBSERVE établit des faits neutres et traçables ; il ne déduit ni identité, ni intention, ni transformation.**
- **OBSERVE n'a pas vocation à raconter les données de l'application. Il doit faire émerger ce que l'utilisateur ne peut pas facilement voir lui-même dans ces données.**
- **Les faits P1 sont des briques internes. Un insight visible doit apporter une valeur supplémentaire : évolution temporelle, croisement transversal, contradiction utile, lien avec un objectif ou une direction My Way, ou information susceptible de changer la compréhension ou la décision. Sinon : `NO_INTERVENTION`.**
- **Un croisement transversal constate des évolutions coexistantes ; il ne transforme jamais une corrélation temporelle en causalité.**
- **Une variation de poids n'est pas automatiquement qualifiée de progrès ou de régression par OBSERVE.**
- **`NO_INTERVENTION` est valide quand les données sont absentes, insuffisantes, non fiables ou n'apportent rien de plus.**
- **Les sources OBSERVE sont toujours requêtées avec le `user_id` authentifié, même si une ancienne policy RLS est permissive.**
- **L'IA P5 reçoit uniquement des faits OBSERVE déjà déterminés ; elle ne produit pas elle-même les faits.**
- Aspiration → Idéal uniquement sur choix explicite.
- GROW n'apparaît que lorsqu'il existe réellement une preuve à afficher.
- LIVE réutilise les moteurs existants ; fait ≠ répétition ≠ tendance ≠ transformation.
- Journal spirituel reste Jeûne-only.
- **L'IA P4.5 est un miroir sémantique : elle propose/formule, l'utilisateur garde ses mots, modifie ou valide.**
- **Toute idée d'une reformulation P4.5 doit être traçable au texte utilisateur ; le contexte Pourquoi ne doit pas enrichir la direction.**
- Aucun remplacement silencieux du texte utilisateur par l'IA.
- Aucun commit sans accord explicite ; le journal accompagne chaque changement.

## Plan actif
### P0-P4
TERMINÉS et validés.

### P4.5 — Reformulation IA de la direction
**TERMINÉ et validé par test utilisateur le 6 septembre 2026.**
- direction uniquement ;
- endpoint serveur authentifié ; clé OpenAI serveur ;
- clarification sans invention ;
- proposition modifiable ;
- validation explicite ;
- parcours manuel conservé si IA indisponible.

### P5 — Incarnation / premier ALIGN
**Implémenté ; validation Vercel à faire.**
- l'incarnation est accessible directement depuis une direction validée ;
- elle ne dépend plus de l'existence d'une aspiration ;
- l'utilisateur peut ignorer cette étape et continuer son parcours ;
- endpoint IA distinct de P4.5 ;
- propositions = pistes, jamais constats ;
- validation explicite avant persistance ;
- aucune nouvelle table ni migration Supabase.

### P5.1 — OBSERVE → ALIGN
**Implémenté ; validation Vercel à faire.**
- nouveau moteur pur `lib/myWayObserve.js` ;
- nouveau endpoint authentifié `GET /api/my-way/observe` ;
- sources initiales : `repas_reels`, `historique_poids`, `ideaux`, `seances_reelles` ;
- filtrage explicite `user_id` sur toutes les lectures ;
- repas : regroupement par `occurrence_repas_id`, avec fallback date/type/heure, afin de ne pas compter chaque aliment comme un repas ;
- minimum de 4 repas sur 28 jours avant émission d'un fait alimentation ;
- poids : fait émis uniquement avec au moins 2 mesures user-scopées ; les anciennes lignes sans `user_id` sont ignorées ;
- Idéaux : seules les séances arrivées jusqu'à aujourd'hui sont comptées et `fait === true` est la seule preuve de réalisation ;
- chaque fait contient famille, niveau P1, sources et métriques ;
- `NO_INTERVENTION` si aucun fait suffisamment fiable ;
- les requêtes de source échouent indépendamment : une source indisponible ne fabrique aucun fait et ne bloque pas les autres ;
- l'endpoint P5 incarnation accepte désormais jusqu'à 4 faits OBSERVE neutralisés et rappelle au modèle qu'ils ne prouvent ni identité ni transformation ;
- aucun texte libre intime, ressenti ou diagnostic n'est envoyé par ce raccord ;
- tests unitaires déterministes ajoutés pour repas/extras, seuil insuffisant, poids et séances Idéaux.

**Point sécurité découvert pendant l'implémentation :** la base live a bien RLS activé sur les 4 tables, mais `historique_poids`, `ideaux` et `seances_reelles` possèdent encore des policies permissives historiques. P5.1 ne s'appuie donc pas sur ces policies : il impose `.eq('user_id', userId)` dans chaque requête. Une ancienne ligne `historique_poids` sans `user_id` existe et est volontairement exclue d'OBSERVE.

**Orientation corrigée après P5.1 :** les faits P1 ne doivent pas être affichés mécaniquement dans My Way. Ils restent des briques internes. L'ancienne suite prévoyant un affichage séparé des faits OBSERVE est abandonnée. L'affichage utilisateur ne sera envisagé que pour des insights apportant une valeur supplémentaire réelle ; sinon OBSERVE reste silencieux.

### P5.2 — Tendance longitudinale Idéaux : reprise après interruption
**Implémenté ; aucune UI ni intégration automatique à My Way.**
- détecteur pur `buildIdeauxRecoveryTrends` dans `lib/myWayObserve.js` ;
- un Idéal analysé à la fois sur une fenêtre de 56 jours : 28 jours précédents vs 28 jours récents ;
- seules les séances arrivées à échéance sont retenues ; les séances futures sont exclues ;
- seule la condition stricte `fait === true` constitue une réalisation ; `statut === 'fait'` n'est jamais utilisé comme preuve ;
- un épisode = une ou plusieurs séances prévues non réalisées suivies d'une séance réellement réalisée ;
- mesure = moyenne des séances non réalisées avant reprise ;
- minimum 2 épisodes dans chaque période ;
- changement retenu seulement si variation absolue >= 0,5 séance ET variation relative >= 25 % ;
- directions neutres : `faster` ou `slower` ; niveau de preuve P3 ;
- aucun vocabulaire identitaire ou psychologique ;
- le détecteur n'est pas intégré à `collectMyWayObservations` en P5.2 afin de préserver la distinction P1/P3 et d'éviter de transformer automatiquement une tendance en message utilisateur final.

### P5.3 — Cadrage transversal Idéaux × poids
**Cadrage produit/technique verrouillé ; implémentation du détecteur à venir.**
- premier croisement transversal retenu : évolution d'un Idéal × évolution du poids ;
- finalité : révéler une coexistence temporelle difficile à voir directement, jamais expliquer une évolution par l'autre ;
- analyse Idéal par Idéal ; seules les séances arrivées à échéance sont éligibles et seule `fait === true` prouve une réalisation ;
- la composante Idéal doit être longitudinale : comparer une période précédente et une période récente plutôt que répéter un taux brut déjà visible ;
- la composante poids doit reposer sur plusieurs mesures user-scopées et sur des périodes comparables ;
- un candidat n'est émis que si les deux phénomènes disposent d'assez de données et présentent une évolution suffisamment significative ;
- absence ou insuffisance de pesées, insuffisance de séances, périodes non comparables, variations négligeables ou simple répétition d'une statistique visible => `NO_INTERVENTION` ;
- vocabulaire autorisé : coexistence factuelle (« tandis que », « sur la même période », « parallèlement ») ;
- vocabulaire causal interdit : « grâce à », « parce que », « a permis », « entraîne », « provoque » ;
- une baisse ou une hausse de poids reste une variation factuelle : OBSERVE ne la qualifie automatiquement ni de progrès, ni de réussite, ni de régression ;
- le futur détecteur doit conserver les sources, métriques, périodes, Idéal concerné et niveau de preuve pour auditabilité ;
- aucune UI, aucun appel OpenAI, aucun raccord automatique à My Way à ce stade.

### P6+
- La vie que je veux créer / aspirations.
- Raccordement sélectif aspiration → Idéaux sur choix utilisateur.
- LIVE réutilise l'existant.
- Extension OBSERVE/DETECT aux autres familles fiables.
- DECIDE/ALIGN/ADAPT avec `NO_INTERVENTION` valide.
- GROW avec hiérarchie de preuves fait → répétition → tendance → transfert → autonomie.

---
# Journal chronologique
## LOG 001 — Gouvernance
Commit `d531ee315d9491c468b6865fc7d8f98e31a97b62`.
## LOG 002 — UX et naming
Commit `eda00ff29b60969876eba0ce60caa23e5036bbdc`.
## LOG 003 — Audit P2
Commit `3ac4cf50c6e82b31cf1aed76b457951cd895481a`.
## LOG 004 — Fondation P2.5/P3
Commit `9bdb761401fe9537a46e6a1b21537ede03321acc`.
## LOG 005 — P4 initial
Commit `4fc25cb903e3d629fb187cbb725fd27e939c00a0`.
## LOG 006 — Correction UX P4 progressive
Commit `4283c9a1166955caa442b00ec19c85835a724fa8`. Validation utilisateur : OUI.
## LOG 007 — P4.5 Reformulation IA My Way
Commits `bc087f12d250c281a1aa82ee0170d9fb2e25bef5`, `f64f3e9aea230e4fc92c4fab2b2ba2f35c5d5ef7`, `8c34b54f963aec677c85e9c15943ebb83ecad5d9`, journal `530f4bda872464bfd7f304ed609a4e6311271532`.
**Validation utilisateur finale : OUI — 6 septembre 2026 : « C'est bon, ça fonctionne, j'ai fait les tests, c'est OK. »**

## LOG 008 — P5 Incarnation / ALIGN
**Date : 6 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `530f4bda872464bfd7f304ed609a4e6311271532`.**  
**Accord utilisateur pour commit : OUI — « ok tu peux commit ».**  
**Implémentation :** endpoint IA P5 séparé ; propositions d'incarnations ; mini-positionnement de réalité actuelle ; validation explicite ; Direction → Incarnation direct ; Aspiration indépendante.  
**Migration Supabase : AUCUNE.**  
**Tests :** validation Vercel utilisateur à faire.

## LOG 009 — P5.1 OBSERVE → ALIGN
**Date : 9 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `9c960057d30bfb524929b1aa90aa6e5122a58db3`.**  
**Accord utilisateur pour commit : OUI — « tu peux commit P5.1 ».**  
**Audit préalable :** inventaire élargi de la donnée existante puis vérification live des colonnes/RLS/policies pour les sources retenues.  
**Décision :** construire un socle OBSERVE transversal, déterministe et réutilisable plutôt qu'un détecteur spécifique à une phrase My Way.  
**Sources P5.1 :** repas/extras, poids user-scopé, Idéaux/séances.  
**Sécurité :** filtrage explicite `user_id` partout ; aucune utilisation des anciennes lignes non rattachées ; aucune confiance accordée aux policies permissives historiques.  
**Sémantique :** uniquement faits P1 ; aucun « bravo », jugement, conseil, identité ou transformation déduite.  
**IA :** reçoit les faits uniquement comme contexte facultatif et ne peut les transformer en vérité psychologique.  
**Migration Supabase : AUCUNE.**  
**Tests automatisés :** fichiers de tests ajoutés ; exécution CI/Vercel à vérifier après commit.  
**Suite corrigée :** ne pas afficher mécaniquement les faits OBSERVE dans My Way. Les P1 sont des briques internes ; seuls des insights apportant une valeur supplémentaire réelle pourront devenir visibles. Sinon `NO_INTERVENTION`.

## LOG 010 — P5.2 Tendance longitudinale Idéaux / reprise après interruption
**Date : 10 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `53a5bce7ab22b2eb9c71ef5ddb0f81789f5f0b29`.**  
**Accord utilisateur pour commit : OUI — « tu peux commit P5.2 ».**  
**Objectif :** premier détecteur longitudinal OBSERVE à valeur ajoutée, mesurant factuellement l'évolution du nombre moyen de séances non réalisées avant reprise, sans inférence psychologique.  
**Fichiers modifiés :** `lib/myWayObserve.js`, `tests/myWayObserve.test.js`, `docs/ALIGN_LIFE_PLAN_ACTION_ET_JOURNAL.md`.  
**Tests ajoutés :** reprise plus rapide ; minimum de 2 épisodes par période ; seuils absolu/relatif ; exclusion du futur ; preuve stricte `fait === true` ; incohérence `statut='fait'`/`fait=false` ; reprise plus lente ; absence de vocabulaire psychologique/identitaire.  
**Tests réellement exécutés au moment de la création du commit : NON — le connecteur GitHub utilisé ici permet l'écriture et l'inspection du dépôt mais n'exécute pas localement Jest. Les statuts CI éventuels doivent être vérifiés après commit.**  
**Migration Supabase : AUCUNE.**  
**UI : AUCUNE.**  
**IA : AUCUNE.**  
**Intégration collecteur :** volontairement différée ; P5.2 ajoute le détecteur P3 sans remplacer ni exposer silencieusement les faits P1 existants.

## LOG 011 — P5.3 Cadrage Idéaux × poids
**Date : 10 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `ac7bb50828a5f9c21f8965ede01a4fda0d4ced7d`.**  
**Accord utilisateur pour commit : OUI — « ok tu peux commit p.5 ».**  
**Objectif :** verrouiller le contrat produit/technique du premier insight transversal avant d'écrire le détecteur afin d'éviter toute causalité ou interprétation abusive.  
**Décision :** Idéaux × poids est le premier croisement retenu ; il doit comparer des évolutions temporelles suffisamment documentées et n'émettre qu'une coexistence factuelle.  
**Code métier : NON modifié dans ce commit de cadrage.**  
**Tests :** aucun test ajouté car aucun comportement exécutable n'est modifié.  
**Migration Supabase : AUCUNE.**  
**UI : AUCUNE.**  
**IA : AUCUNE.**
# Chantier — Planification des repas × Gamification

## Statut

Branche de travail : `planification-gamification-chatgpt`

Branche socle : `plan-alimentaire-intelligent-chatgpt`

Commit de départ : `a1db5f70e7eb850bc3aebd84eb4bf1ac0b65c262`

`main` ne doit pas être modifiée dans ce chantier.

## Objectif

Mettre en conformité l’expérience de planification des repas avec la vision produit de Mon Plan Vital : le planning ne doit pas seulement enregistrer des aliments. Il doit devenir un point d’apprentissage, d’anticipation et de gamification, sans devenir une application dans l’application et sans rendre l’expérience punitive.

La boucle cible est :

`Je planifie → je compose → je comprends → j’expérimente → l’application observe → elle propose éventuellement une action ou un défi → ce qui est appris améliore les prochaines planifications.`

Le travail doit réutiliser au maximum les moteurs existants : `PlanificateurRepas`, référentiel alimentaire utilisateur, repas composés, repas réels, repas repères, alignement plan/réel et moteur Défis V2.

## Périmètre fonctionnel

### 1. Combo recette / Compose ton assiette

Faire de la composition actuelle du repas une vraie brique pédagogique visible du planning.

L’analyse doit pouvoir reconnaître les dimensions utiles d’une assiette à partir des données réellement disponibles dans le référentiel, notamment :

- protéine ;
- légume ;
- féculent ;
- matière grasse ;
- mode de cuisson lorsque cette information peut être renseignée de façon fiable.

Il ne faut pas créer un second formulaire de repas. La brique enrichit l’assiette déjà construite dans `PlanificateurRepas`.

L’absence d’une famille alimentaire ne signifie pas automatiquement « mauvais repas ». Le moteur restitue ce qu’il observe et propose éventuellement une piste pertinente.

### 2. Capsules nutrition / cuisson contextualisées

Après ou pendant la composition, afficher seulement les capsules utiles au contexte réel de l’assiette.

Une capsule doit être courte, compréhensible, non culpabilisante et actionnable. Elle ne doit pas répéter mécaniquement la même information à chaque repas.

Le système devra distinguer au minimum : information pédagogique, suggestion facultative et opportunité comportementale pouvant devenir un défi.

### 3. Pont « Transformer cette astuce en défi »

Créer un contrat entre une capsule ou une observation du planning et le moteur de défis.

Une capsule ne doit jamais démarrer directement un défi.

Elle produit une opportunité de défi. Le moteur Défis conserve ses règles, notamment la règle métier « un seul défi actif à la fois », ses modèles de progression et ses validations automatiques, déclaratives ou mixtes.

### 4. Défis visibles dans le planning

Le planning doit pouvoir exposer le défi actif lorsqu’il est pertinent pour l’organisation des repas et permettre d’accéder aux défis disponibles sans dupliquer la page Défis.

Exemples : un défi sur la cuisson peut apparaître lors de la planification d’un dîner ; un défi sur l’extra programmé peut être visible lors de l’organisation de la semaine.

Le planning n’est pas propriétaire du moteur de défis : il en affiche uniquement le contexte utile.

### 5. Mécanismes AVANT / PENDANT / APRÈS

Raccorder progressivement les comportements alimentaires à la gamification.

AVANT : envie alimentaire, anticipation d’un extra, hésitation, programmation volontaire.

PENDANT : satiété, rythme, portion, perte partielle de contrôle ou autre observation réellement saisissable.

APRÈS : extra spontané, écart entre intention et réalité, rebond et recentrage sans punition.

Absence de donnée ne signifie jamais échec.

### 6. Module « Je revisite une envie »

Permettre d’enregistrer une envie sans la transformer en consommation réelle.

Une envie pourra ensuite être : consommée ; abandonnée naturellement ; remplacée ; reportée ; programmée à une date ultérieure.

Une envie non consommée ne doit jamais créer une fausse ligne dans `repas_reels` ou dans les extras réellement consommés.

La valorisation doit porter sur la prise de conscience et le choix, pas sur une logique morale « résister = bien / manger = mal ».

### 7. Micro-circuits contextuels

Créer de petites séquences d’accompagnement déclenchées par des difficultés observées et suffisamment fiables.

Un micro-circuit peut par exemple combiner : observation → capsule → petite action → observation suivante → bilan court.

Il ne remplace pas un défi long et ne doit pas contourner la règle d’un seul défi actif. Son rôle est l’accompagnement contextuel court.

## Architecture cible

`PlanificateurRepas`
→ moteur d’analyse de composition
→ restitution pédagogique
→ capsule contextualisée
→ éventuelle opportunité de défi
→ moteur Défis V2
→ suivi réel
→ observations AVANT / PENDANT / APRÈS
→ micro-circuit ou bilan
→ apprentissage réutilisable dans le planning.

Les moteurs d’analyse doivent autant que possible être des fonctions métier pures et testables, séparées de l’interface React et des écritures Supabase.

## Plan d’action

### Lot 1A — Audit du référentiel et moteur de composition

1. Inventorier les catégories et métadonnées réellement disponibles dans le référentiel utilisé par le planning.
2. Définir la correspondance fiable entre les données existantes et les dimensions protéine / légume / féculent / matière grasse.
3. Vérifier comment intégrer la cuisson sans inventer une donnée qui n’existe pas.
4. Créer un moteur pur d’analyse de composition.
5. Ajouter les tests unitaires correspondants.

Aucune modification de Supabase n’est autorisée dans ce sous-lot sans nécessité démontrée.

### Lot 1B — Intégration « Compose ton assiette »

1. Intégrer le résultat du moteur dans `PlanificateurRepas`.
2. UI mobile-first et compacte.
3. Mise à jour instantanée quand un aliment est ajouté, retiré ou modifié.
4. Aucun blocage de l’enregistrement pour une assiette jugée incomplète.
5. Vérifier repas repères, repas enregistrés et suggestions.

### Lot 1C — Cuisson

1. Auditer les informations de cuisson déjà présentes dans l’application et le référentiel.
2. Réutiliser une donnée existante si possible.
3. Si une nouvelle donnée est indispensable, définir son contrat avant toute migration.
4. Raccorder la cuisson à l’analyse pédagogique.

### Lot 1D — Capsules contextualisées

1. Définir les types de capsules.
2. Définir les règles de déclenchement.
3. Empêcher les répétitions inutiles.
4. Distinguer information, suggestion et opportunité comportementale.
5. Tester les principaux cas de composition.

### Lot 1E — Contrat capsule → opportunité de défi

1. Définir une structure d’opportunité indépendante de l’UI.
2. Faire correspondre les opportunités aux défis existants lorsqu’un lien métier réel existe.
3. Ne jamais créer ou démarrer automatiquement un défi.
4. Respecter la règle d’un seul défi actif.
5. Préparer le raccord à `defis-v2` sans fusion globale de branche.

### Lot 2 — Défis dans le planning

1. Récupérer le défi actif de manière fiable.
2. Afficher uniquement les informations pertinentes dans `/plan`.
3. Contextualiser certaines étapes du défi au jour ou au repas planifié.
4. Donner accès aux défis disponibles sans dupliquer l’espace Défis.

### Lot 3 — « Je revisite une envie »

1. Définir le modèle métier d’une envie distincte d’une consommation.
2. Définir les états : ouverte, consommée, abandonnée, remplacée, reportée, programmée.
3. Définir la persistance Supabase avec `user_id` obligatoire si une nouvelle table est nécessaire.
4. Créer l’entrée utilisateur AVANT consommation.
5. Permettre la programmation ultérieure dans le planning.
6. Garantir qu’une envie seule n’alimente jamais `repas_reels` ni le budget d’extras consommés.

### Lot 4 — AVANT / PENDANT / APRÈS

1. Cartographier les données existantes utilisables comme preuves ou observations.
2. Ajouter uniquement les saisies réellement nécessaires.
3. Raccorder les observations au moteur de gamification.
4. Conserver la règle : absence de donnée ≠ échec.
5. Éviter les sollicitations quotidiennes répétitives.

### Lot 5 — Micro-circuits contextuels

1. Définir le contrat d’un micro-circuit.
2. Définir des déclencheurs suffisamment robustes.
3. Construire quelques circuits prioritaires avant d’élargir le catalogue.
4. Raccorder capsules, actions et observations.
5. Produire un bilan non punitif et une éventuelle suggestion pour le prochain planning.

## Hors périmètre immédiat

Ce chantier ne doit pas :

- refondre entièrement le moteur Défis V2 ;
- supprimer ou réécrire l’historique utilisateur ;
- modifier `main` directement ;
- refaire le planificateur de zéro ;
- créer une deuxième logique de repas parallèle à `repas_planifies` / `repas_reels` ;
- casser la persistance multi-aliments ou les repas composés ;
- réintroduire une conformité alimentaire binaire et punitive ;
- considérer une absence de saisie comme un échec ;
- démarrer automatiquement un défi depuis une capsule ;
- fusionner en bloc `defis-v2` dans cette branche.

Le défi de réduction progressive des quantités et l’introduction progressive du sport / activateurs / accélérateurs restent des sujets à auditer ultérieurement. Ils ne doivent pas être oubliés, mais ils ne font pas partie du raccord initial décrit ici.

## Règles de développement

- Commits petits et ciblés.
- Tests avant et après chaque modification métier importante.
- Mobile prioritaire.
- Réutiliser l’existant avant de créer une nouvelle table ou un nouveau composant.
- Toute modification Supabase doit être justifiée et compatible avec `user_id` et les règles de sécurité existantes.
- Ne pas supprimer l’historique.
- Ne pas toucher à `main`.
- Avant tout raccord avec une branche développée en parallèle, comparer les deux états et intégrer seulement les éléments nécessaires.
- Documenter les décisions métier importantes dans ce fichier ou dans une passation dédiée.

## Critère de réussite global

Le chantier est réussi lorsque l’utilisateur peut organiser un repas dans son planning, comprendre simplement la composition de son assiette, recevoir une information réellement contextualisée, éventuellement transformer cette piste en travail comportemental, retrouver son défi dans le contexte où il est utile et faire remonter ses apprentissages réels vers ses prochaines planifications — sans culpabilisation, sans duplication fonctionnelle et sans perte de données.

## Reprise technique du 13 octobre 2026

### État audité et décisions de reprise

- Branche métier au début de la reprise : `cd6c51148dbe7bf1dec8966ec9615c6b19cada81`.
- Preview avant combinaison : `9d311645c17604b8e1b2cb6786f2f497eb072fac`, arbre `1d7d13f4cb69e2b26f762a91e5af26224628b3f2`.
- Consolidation consultée en lecture seule : `23f27e3b59f0ea6a3e3f987a1c433602a0fba6bb`.
- L'utilisatrice a autorisé une combinaison préservant les acquis de la Preview, au lieu de remplacer son arbre par celui de la branche métier. Aucun changement de `main` ou `main-consolidation`, aucune fusion de PR, aucune migration appliquée.
- Ancien déploiement `dpl_DSn3gswCM2RbfAVcNJZfSvPXKGwf` : réponse Vercel 404 lors de la reprise ; aucune preuve de disponibilité actuelle.
- Projet Vercel identifié : `ne-wcompteplanvitalroot` (`prj_o7fFbCapbRJkxCpMETXtt42cBTcp`), équipe `team_sZ2c6qQ6kigXmb88BNH2yrQs`. Les autres déploiements READY consultés concernent d'autres branches.

### Travaux conservés et corrections

- Moteur des quatre dimensions, distinction présent/absent/inconnu, profils additifs et propagation dans les repas composés présents.
- Intégration de `CompositionAssiettePedagogique` limitée à un import et un rendu dans le planificateur ; aucun remplacement du planificateur.
- Trois tests existants échouaient : `null` était converti en texte dans la clé de profil. Correction de normalisation pour retrouver les deux enrichissements déjà validés.
- Correction de la priorité d'un profil fruit explicite sur une catégorie historique appartenant aux quatre dimensions ; aucune nouvelle règle de qualification.
- Fusion du référentiel : enrichissement limité au global ; les aliments personnels homonymes et leurs profils explicites restent inchangés.
- Régression couverte sur le profil fruit et sur un aliment personnel homonyme.
- Le point d'ajustement provient des commits `fbf1237` et `8b207f7` et existe aussi sur `plan-alimentaire-intelligent-chatgpt`. Il est conservé, sans être déclaré validé en production.
- La combinaison avec la Preview rencontre un unique conflit de contenu dans `pages/suivi.js`, entre les états React des trous de suivi et celui du point d'ajustement. Les deux groupes sont conservés. Le diff de ce fichier par rapport à l'ancienne Preview ne contient que des ajouts.

### Vérifications exécutées

- Combinaison initiale sans correction : Jest avec `TZ=Europe/Paris`, 297/300 tests réussis, 36/37 suites ; les trois échecs concernent la clé de profil avec marque nulle.
- Build de cette combinaison initiale : Next.js 15.5.7, compilation et génération de 36 pages réussies.
- Branche métier corrigée : Jest avec `TZ=Europe/Paris`, 273/273 tests, 31/31 suites réussis ; `git diff --check` réussi.
- Auth et RLS du point d'ajustement auditées dans le code : `getUser(accessToken)`, filtre propriétaire sur les lectures/fermetures, insertion sous `user.id`, unicité utilisateur/semaine, politique propriétaire avec `USING` et `WITH CHECK`, privilèges UPDATE limités dans le fichier de migration. L'audit du catalogue live est détaillé ci-dessous ; aucune écriture en base effectuée.
- Aucun test utilisateur authentifié ni contrôle visuel mobile déclaré réussi à ce stade.

### Dépendances et arbitrages restants

- Cuisson : moteur capable de lire une option `modeCuisson`, mais option non alimentée par le planificateur et interface provisoire « bientôt disponible ». Contrat de saisie/référentiel/persistance à valider avant ajout.
- Capsules : vision validée ; catalogue, contenu exact, déclencheurs et règles d'anti-répétition non définis. Ne pas les implémenter avant arbitrage.
- Défis V2 audité sur `df1ea4c` : `demarrerDefi(id)` appelle la RPC `demarrer_defi`, contexte chargé par utilisateur, un seul défi en cours vérifié dans l'interface. Durée, occurrences et preuves restent la responsabilité de ce moteur. La branche n'est pas intégrée globalement ; PR existante #9 vers consolidation non fusionnée.
- Recettes audité sur `0ec384a` : changements notamment dans `pages/suivi.js`, `SaisieRepasCompose` et identité des modèles ; aucune réimplémentation ni intégration globale dans cette reprise.
- Envies et AVANT/PENDANT/APRÈS : modèle métier général documenté, persistance et nouvelles saisies non validées. Une envie seule ne crée jamais une consommation.
- Micro-circuits : nouveaux déclencheurs et preuves à définir avec l'utilisatrice.
- Point d'ajustement : documentation historique annonce une apparition dans `/plan`, code actuel et tests imposent une carte dans `/suivi` après une sauvegarde. Ne pas déplacer la carte sans arbitrage. Vérification authentifiée et configuration serveur IA restent nécessaires.
- Aucun cockpit WBS ajouté ou modifié. Aucune PR Planification existante retrouvée ; préparation de consolidation après validation du jalon.

### Protocole utilisateur prévu pour la Preview

1. Ouvrir le lien Preview exact et se connecter avec un compte de test autorisé.
2. Dans `/plan`, ouvrir le planificateur, ajouter une protéine, un légume, un féculent puis une matière grasse ; vérifier les repères et leur actualisation au retrait d'un aliment.
3. Vérifier poêlée de légumes et ratatouille ; un plat préparé sans profil doit rester « Pas encore repéré », sans jugement négatif.
4. Charger un repas composé enregistré, modifier ponctuellement une quantité et vérifier la composition et les calories, sans altérer le modèle initial.
5. À largeur mobile, vérifier recherche, ajout, défilement, sauvegarde et lisibilité des repères.
6. Dans `/suivi`, vérifier les parcours mono/multi, les Extras et le questionnaire de trou de suivi ; ne pas créer de consommation fictive pour tester une envie.
7. Tester le point d'ajustement séparément, uniquement si sa table et sa configuration IA sont vérifiées. Ne pas confondre absence de carte et validation du moteur.

Les liens et commits de livraison sont à consigner après vérification du déploiement exact.

### Jalon Preview livré le 13 octobre 2026

- Correctif métier publié : `d08cf187e52f81a736b75a8f9c72b4bcb60ba467`.
- Combinaison Preview publiée : `ffa78afc96c449bce8e6a5beff970dc37e82fc63`, parents `9d311645c17604b8e1b2cb6786f2f497eb072fac` et `d08cf187e52f81a736b75a8f9c72b4bcb60ba467`. Mise à jour normale, sans force push.
- [Preview /plan](https://ne-wcompteplanvitalroot-9puzvwbgh-gendrams-projects.vercel.app/plan).
- Déploiement `dpl_8yUUKbgsqLGHLspnVYifvXJtXuCH` : READY, cible Preview, commit et branche confirmés via Vercel. Journaux : « Build Completed in /vercel/output [45s] » puis « Deployment completed ».
- Combinaison finale : 37/37 suites, 302/302 tests réussis avec `TZ=Europe/Paris`, build local réussi (36 pages), `git diff --check` réussi. Les fichiers des moteurs trous de suivi, leurs migrations, leur carte, le bilan hebdomadaire, le référentiel et les moteurs de badges/progression Extras sont identiques à l'ancienne Preview.
- Build distinct de la branche métier corrigée : réussi avec 36 pages générées ; ses 31 suites et 273 tests sont vérifiés séparément de la combinaison Preview.
- Navigateur Chromium sur le build local correspondant à la Preview : `/plan` HTTP 200 ; à 390 et 1280 pixels, ajout de saumon, poêlée de légumes, riz complet et avocat, quatre rôles repérés ; retrait de la poêlée actualisé ; ratatouille reconnue ; aucune erreur JavaScript ; bloc pédagogique contenu dans la largeur du viewport. Avocat testé avec quantité explicitement saisie à 1 portion. Aucune sauvegarde en base lors de ces vérifications.
- Captures locales : `/tmp/plan-vital-browser/plan-390-composition.png` et `/tmp/plan-vital-browser/plan-1280-composition.png`. Le contrôle distant automatisé a rencontré l'authentification Vercel (302 vers `/sso-api`) malgré le mécanisme de partage de l'outil. La protection n'a pas été désactivée. Les contrôles locaux ne constituent pas une preuve de fonctionnement authentifié distant.
- Validation utilisateur encore attendue : accès Vercel avec le compte autorisé, connexion à l'application, sauvegarde/relecture, repas composés et parcours Suivi/Extras selon le protocole ci-dessus.

### Écart Supabase constaté, sans modification

Le projet correspondant à l'URL configurée dans le dépôt est `rvpysxqnomslngxjinge`. Les seules requêtes exécutées sont des lectures du catalogue et de l'historique des migrations, sans lecture des repas personnels ni modification.

La table `points_ajustement_alimentaires` existe, sa RLS est activée et sa politique propriétaire possède bien `USING` et `WITH CHECK` sur `auth.uid() = user_id`. Cependant, les privilèges live sont plus larges que le fichier du dépôt : `anon` et `authenticated` possèdent des droits de table incluant UPDATE, DELETE et TRUNCATE ; authenticated peut modifier toutes les colonnes, dont `carte`, plutôt que les seuls champs de fermeture/affichage. RLS et privilèges SQL sont deux niveaux distincts ; aucun accès inter-utilisateur n'a été testé ni déclaré possible.

Avant consolidation du point d'ajustement : auditer l'origine de ces droits et faire valider une restriction par migration additive dédiée, sans modifier la migration historique ni réinitialiser la table. Aucune correction de droits appliquée dans cette reprise. La disponibilité réelle de l'IA et le parcours authentifié restent non vérifiés.

### Préparation de la PR de consolidation

Titre proposé : `Planification : composition pédagogique et profils alimentaires fiables`.

Source obligatoire : `planification-gamification-chatgpt` ; cible : `main-consolidation`. Aucun départ depuis la Preview, aucune PR créée ni fusionnée avant validation du jalon.

Le diff de PR calculé depuis l'ancêtre commun de consolidation contient 33 fichiers au jalon `d08cf18`. Il comprend aussi les travaux antérieurs de valeurs sûres et de point d'ajustement : ne pas présenter cette branche comme un lot exclusivement composition. Le renommage ASCII de `analyseRepasSynthétique.js` et son import corrigé sont conservés.

Simulation locale d'intégration avec la consolidation `23f27e3` : un seul conflit de contenu, dans les états React de `pages/suivi.js`, identique à celui résolu pour la Preview. Les deux groupes doivent être conservés. Les fonctionnalités Ideaux et les autres différences de consolidation ne doivent jamais être remplacées par un arbre complet de la branche métier. Le diff direct entre deux HEAD divergents ne décrit pas à lui seul les changements d'une PR.

La description finale de PR devra préciser le périmètre validé (composition seule ou branche entière avec point d'ajustement), les preuves ci-dessus et les limites authentifiées. Cet arbitrage, les droits live et la contradiction `/plan` versus `/suivi` pour le point d'ajustement restent à résoudre avant intégration.

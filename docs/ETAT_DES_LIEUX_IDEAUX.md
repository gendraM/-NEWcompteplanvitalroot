# État des lieux — Idéaux dans l’architecture globale de Mon Plan Vital

**Date : 1er septembre 2026**  
**Branche : `Ideo`**  
**Statut : audit et cadrage uniquement — aucun code applicatif modifié**

---

## 1. Objet du document

Ce document consolide l’état des lieux fonctionnel et technique du module **Idéaux**, puis le replace dans l’architecture globale de **Mon Plan Vital**.

L’objectif n’est plus seulement de savoir ce qui manque à Idéaux isolément. Il faut déterminer :
- ce que Mon Plan Vital sait déjà faire ;
- ce qui est réellement actif ;
- ce qui est partiel ou hérité ;
- ce qui est prévu mais non implémenté ;
- ce qui est encore conceptuel ;
- la place exacte d’Idéaux dans l’écosystème ;
- la place possible d’un futur socle mental de type **Create → Align → Live** sans créer une application dans l’application.

L’analyse croise notamment :
- `docs/ancrage` ;
- `docs/Synthese_Histoire_Projet.md` ;
- `docs/Fiche_descriptive_suivi.md` ;
- `docs/AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md` ;
- les documents Défis, extras, jeûne, reprise et cristallisation ;
- `pages/ideaux.js` ;
- `pages/plan-action.js` ;
- `lib/generateAnchoringPlan.js` ;
- le code actuel des principaux parcours ;
- les branches métier récentes et historiques ;
- les éléments Auth / Supabase disponibles.

Règle de lecture : **un ancien TODO n’est jamais considéré comme vérité actuelle sans vérification du code récent**.

---

# PARTIE I — ÉTAT DES LIEUX IDÉAUX

## 2. Vision métier officielle du module Idéaux

Le module Idéaux n’est pas une simple page de saisie d’objectif.

Sa logique cible est une **chaîne d’ancrage** :

**Idéal émotionnel → objectif concret → routine → actions réelles → adaptation → progression vers l’idéal.**

L’idéal représente le **pourquoi vibrant** : ce que l’utilisateur veut retrouver, ressentir, vivre ou devenir.

Il combine :
- une intention émotionnelle ;
- une donnée mesurable ;
- une date cible ;
- éventuellement une image motivante représentant la destination.

Le point essentiel est la distinction entre :
- **l’idéal**, qui représente la destination / l’expérience recherchée ;
- **l’objectif intermédiaire**, qui représente un moyen concret pour y parvenir.

---

## 3. Comportement fonctionnel attendu

L’utilisateur définit son idéal, puis l’application doit pouvoir :
1. le transformer en un premier objectif réaliste ;
2. construire un palier atteignable ;
3. observer les actions réellement réalisées ;
4. interpréter les écarts entre prévu et réel ;
5. générer le palier suivant à partir de cette réalité ;
6. proposer une adaptation plutôt que casser la trajectoire en cas de difficulté ;
7. rendre visible le rapprochement vers l’idéal.

Le principe cible est :

**Palier 1 → observation du réel → adaptation → Palier 2 → observation → adaptation → etc.**

Une action manquée ne doit pas casser la chaîne. Le système cible doit pouvoir proposer un plan B, déplacer ou alléger une action, valoriser une mini-victoire et reconnecter l’action au sens de l’idéal.

L’image motivante doit progressivement se dévoiler avec la progression réelle.

---

## 4. Fonctionnement actuel vérifié

### 4.1 Création de l’idéal

`pages/ideaux.js` permet déjà de saisir :
- titre ;
- description émotionnelle ;
- indicateur principal ;
- date cible ;
- date de début ;
- image.

**État : fonctionnel.**

### 4.2 Génération du plan

`generateAnchoringPlan()` génère actuellement une structure de type :

**objectif → mois → semaines → actions.**

Les actions sont positionnées sur de vraies dates.

**État : fonctionnel techniquement.**

### 4.3 Validation du Palier 1

Le premier palier peut être personnalisé puis validé. Les paramètres sont figés et des séances sont créées dans `seances_reelles`.

**État : fonctionnel.**

### 4.4 Suivi réel

`plan-action.js` permet de suivre :
- fait / non fait ;
- durée réelle ;
- distance ;
- vitesse.

**État : fonctionnel.**

### 4.5 Bonus

Les séances bonus existent.

**État : présent mais incomplet dans leur interprétation métier.**

### 4.6 Navigation

La navigation vers le plan détaillé existe.

**État : fonctionnel.**

---

## 5. Écarts Idéaux principaux

### 5.1 Moteur non adaptatif

Le moteur sait aujourd’hui essentiellement :

**planifier → afficher → enregistrer.**

La cible est :

**planifier → observer → comprendre → adapter → replanifier.**

Le prochain palier n’est pas encore réellement généré à partir des résultats du palier précédent.

### 5.2 Orientation encore très « course à pied »

Le générateur conserve plusieurs hypothèses liées à la course : « Courir », `course`, vitesse en km/h, durée/fréquence/jours par défaut, moment `matin`.

Idéaux n’est donc pas encore techniquement générique, même si son concept métier peut l’être.

### 5.3 Défloutage non fiabilisé

Une logique de blur existe mais la source de données utilisée dans `plan-action.js` est incohérente avec la manière dont `seances_reelles` est réellement chargée.

**Statut : code présent, comportement non considéré fiable tant qu’un test runtime n’a pas confirmé son fonctionnement.**

### 5.4 Durée du palier incohérente

`ideaux.js` accepte une durée de palier dynamique alors que `plan-action.js` contient encore plusieurs hypothèses fixes à 4 semaines.

### 5.5 Bonus : remplacement vs supplémentaire

La distinction métier existe mais n’est pas encore correctement propagée dans la progression et les statistiques.

### 5.6 Adaptation comportementale absente

Idéaux enregistre ce que l’utilisateur fait mais n’interprète presque pas encore : difficulté, retard, avance, baisse d’énergie, changement d’emploi du temps, reprise après interruption, etc.

### 5.7 Modèle de données

L’implémentation actuelle repose surtout sur :
- `ideaux` ;
- `plan_data` JSON ;
- `plan_params_valides` ;
- `seances_reelles`.

Il n’est pas recommandé de créer immédiatement toutes les tables conceptuelles historiques (`Objectifs`, `Routines`, `Actions`, `Alternatives`) uniquement pour reproduire un ancien schéma. Le besoin devra être réévalué lorsque le moteur adaptatif exigera un historique plus fin.

### 5.8 Auth / `user_id`

Le code Idéaux ne rend pas encore l’isolation utilisateur explicite partout côté client. Cela ne permet pas de conclure à un problème de sécurité car les RLS peuvent assurer l’isolation côté base.

À auditer avant validation multi-utilisateur complète :
- RLS `ideaux` ;
- RLS `seances_reelles` ;
- alimentation de `user_id` ;
- rattachement des données historiques.

---

## 6. Tableau consolidé Idéaux

| Domaine | État réel |
|---|---|
| Création d’un idéal | 🟢 Fonctionnel |
| Description émotionnelle | 🟢 Fonctionnelle |
| Indicateur mesurable | 🟢 Fonctionnel |
| Date cible | 🟢 Fonctionnelle |
| Image motivante | 🟢 Upload fonctionnel |
| Génération plan initial | 🟢 Fonctionnelle techniquement |
| Validation Palier 1 | 🟢 Fonctionnelle |
| Séances Supabase | 🟢 Fonctionnelles |
| Suivi fait / non fait | 🟢 Fonctionnel |
| Durée / distance / vitesse | 🟢 Présentes |
| Bonus | 🟡 Présents mais incomplets |
| Défloutage | 🟠 Présent mais non fiabilisé |
| Multi-paliers | 🟠 Structure partielle |
| Palier suivant depuis le réel | 🔴 Absent |
| Adaptation retard / avance | 🔴 Absente |
| Plan B / alternatives | 🔴 Absents |
| Analyse contexte / énergie | 🔴 Absente |
| Coaching comportemental Idéaux | 🔴 Absent |
| Généricité hors course | 🔴 Insuffisante |
| Lien avec autres moteurs de l’app | 🔴 Faible |
| Isolation utilisateur explicite | 🟠 À auditer avec Auth/RLS |

---

# PARTIE II — PRISE DE HAUTEUR SUR MON PLAN VITAL

## 7. Vision globale historique confirmée

Mon Plan Vital a été conçu comme un **compagnon du quotidien**, et non comme un simple outil calorique.

Les principes historiques récurrents sont :
- bienveillance ;
- personnalisation ;
- autonomisation ;
- auto-observation ;
- adaptation aux rythmes et besoins réels ;
- modules indépendants mais interconnectés ;
- progression plutôt que sanction ;
- retour au « Mon Pourquoi » ;
- statistiques comme lecture de progression, non comme outil de contrôle.

Cette vision est cohérente avec l’idée d’un futur socle mental, mais ne signifie pas que ce socle est déjà implémenté.

---

## 8. Architecture fonctionnelle actuelle observée

L’application peut être lue selon trois niveaux.

### Niveau A — Direction

Aujourd’hui cette couche contient principalement :
- poids objectif ;
- délai ;
- `Mon Pourquoi` ;
- Idéaux.

Elle donne une direction mais reste encore peu structurée sur l’identité, la vision de vie et l’incarnation quotidienne.

### Niveau B — Moteurs de transformation

On retrouve notamment :
- plan alimentaire ;
- suivi alimentaire ;
- Défis ;
- Idéaux ;
- préparation au jeûne ;
- jeûne ;
- reprise ;
- cristallisation.

### Niveau C — Réalité observée

L’app dispose déjà de nombreux signaux :
- repas réellement consommés ;
- extras ;
- satiété ;
- raisons de manger ;
- ressentis ;
- poids ;
- séances/actions réalisées ;
- résultats de défis ;
- progression de certains cycles.

Le système sait donc déjà assez bien faire :

**RÉALITÉ → ANALYSE / MOTEUR.**

La boucle beaucoup moins développée est :

**DIRECTION → ACTION → RÉALITÉ → APPRENTISSAGE → TRANSFORMATION DE LA PERSONNE.**

---

## 9. `/suivi.js` : centre vivant de la réalité quotidienne

La documentation métier présente `/suivi.js` comme le **centre vivant de l’application**.

Il ne sert pas uniquement à enregistrer des aliments. Sa logique cible relie déjà :
- prévu vs réel ;
- calories ;
- extras ;
- satiété ;
- « pourquoi j’ai mangé ? » ;
- ressenti ;
- tendances ;
- bilans ;
- déclencheurs comportementaux ;
- futurs recentrages ;
- certains liens avec les Défis et les cycles.

Conclusion : **le futur socle mental ne doit pas créer un deuxième moteur d’observation comportementale**. Il doit exploiter ce moteur existant.

---

## 10. Rôle exact des Défis

Les Défis sont à considérer comme un **moteur d’action / d’expérimentation comportementale**.

Ils répondent à un besoin de mobilisation : l’utilisateur est suffisamment disponible pour travailler activement une difficulté, une habitude ou une progression.

Ils ne doivent donc pas devenir :
- la boussole globale ;
- le socle mental ;
- le système de recentrage profond.

Chaîne fonctionnelle visée :

**besoin/opportunité détecté → défi adapté → expérimentation réelle → observation du résultat.**

---

## 11. Rôle exact des Capsules / Portes

Les Capsules / Portes montrées dans la sauvegarde utilisateur sont **un projet conceptuel, non une fonctionnalité active actuelle**.

Elles prolongent cependant une idée historique déjà documentée dans le suivi et la gestion des extras : intervenir lorsqu’une dérive répétée apparaît.

Leur rôle est différent de celui des Défis :
- Défi : l’utilisateur est encore mobilisable ;
- Capsule / Porte : l’utilisateur dérive, se ferme, s’anesthésie ou n’a plus envie de choisir / réfléchir ;
- action attendue : une micro-interruption, un mouvement minimal, un recentrage immédiat.

Les Portes ne représentent donc pas des qualités identitaires comme Constance, Courage ou Patience.

Elles représentent des **voies de recentrage** selon un état de dérive et une inspiration précise.

---

## 12. Le Journal spirituel : périmètre verrouillé

Le Journal spirituel est **contextuel au cycle Jeûne**.

Il ne constitue pas un module mental permanent de Mon Plan Vital.

Son code le rattache explicitement :
- au jour du jeûne ;
- au jeûne actif ;
- aux archives d’un jeûne terminé ;
- au retour vers `/jeune`.

Il doit donc rester classé dans :

**Préparation → Jeûne → restauration spirituelle du jeûne → Reprise → Cristallisation.**

Cette expérience donne néanmoins une leçon d’architecture importante : **une capacité importante peut être contextuelle et n’apparaître que lorsque le parcours utilisateur le justifie.**

---

## 13. Mon Pourquoi : boussole existante, mais encore limitée

`Mon Pourquoi` est historiquement conçu comme une **boussole, jamais comme un objectif**.

Il peut être rappelé dans certains contextes pour reconnecter l’utilisateur au sens.

C’est une graine importante du futur socle mental.

Mais, dans son état actuel, il ne structure pas encore pleinement :
- qui je choisis de devenir ;
- quelle vie je veux construire ;
- comment cette personne pense / choisit / agit ;
- ce que j’incarne aujourd’hui ;
- ce que mes actions réelles disent de mon évolution.

Le futur travail ne doit donc pas automatiquement créer un concurrent de `Mon Pourquoi`. Il faudra d’abord examiner comment **faire évoluer la notion de boussole existante**.

---

## 14. Place corrigée d’Idéaux dans l’ensemble

Après l’audit global, Idéaux ne doit plus être vu comme « tout le système Create ».

Sa fonction naturelle est plutôt :

**transformer certaines aspirations suffisamment concrètes en trajectoires progressives et adaptatives.**

Exemple de hiérarchie possible :

**Direction / identité souhaitée**  
→ **Idéal concret qui matérialise cette direction**  
→ **objectif intermédiaire**  
→ **palier**  
→ **action**  
→ **réel observé**  
→ **adaptation**.

Idéaux est donc un **pont entre une aspiration et son incarnation concrète**, pas le conteneur de toute la vie de l’utilisateur.

---

# PARTIE III — CONSTAT SUR LE SOCLE MENTAL MANQUANT

## 15. Le trou architectural principal

Mon Plan Vital possède déjà beaucoup de boucles courtes :
- je mange → j’observe ;
- je dépasse → j’analyse ;
- je rencontre une difficulté → Défi ;
- je poursuis un Idéal → actions ;
- j’entre dans un cycle Jeûne → parcours spécialisé ;
- je dérive → futur recentrage possible.

Ce qui manque davantage est une **boucle longue de transformation personnelle** :

**DIRECTION INTÉRIEURE**  
↓  
Qui est-ce que je choisis de devenir ?

**INCARNATION**  
↓  
Comment cette personne commencerait-elle à vivre aujourd’hui ?

**VIE RÉELLE**  
↓  
Alimentation · comportements · Idéaux · Défis · habitudes · cycles

**OBSERVATION**  
↓  
Qu’est-ce qui s’est réellement passé ?

**RÉALIGNEMENT / ADAPTATION**  
↓  
Je poursuis, j’adapte, je passe éventuellement par un Défi ou une Capsule

**TRANSFORMATION**  
↓  
Qu’est-ce qui change réellement dans ma manière d’être et de vivre ?

Puis la nouvelle réalité intérieure nourrit à nouveau la direction.

---

## 16. Hypothèse de travail : Create → Align → Live comme modèle transversal

À ce stade, **Create–Align–Live ne doit pas être considéré comme un module utilisateur déjà décidé**.

L’hypothèse la plus cohérente est qu’il puisse devenir un **modèle mental transversal** :

### CREATE
Définir ou enrichir la direction : qui je veux devenir, ce que je veux créer, ce qui compte vraiment.

### ALIGN
Confronter progressivement cette direction à la réalité vécue, sans jugement.

### LIVE
Commencer à incarner cette direction maintenant, via les moteurs déjà existants.

Puis compléter la boucle par :

### OBSERVE
Observer le réel.

### ADAPT
Adapter la trajectoire et l’accompagnement.

### GROW
Rendre visible ce qui se transforme réellement chez l’utilisateur.

Formule de travail :

**CREATE → ALIGN → LIVE → OBSERVE → ADAPT → GROW → CREATE…**

Cette formule reste une hypothèse de cadrage, pas encore une spécification fonctionnelle validée.

---

## 17. Principe central à préserver

Le futur socle ne doit pas devenir :
- un onglet `Create` ;
- un onglet `Align` ;
- un onglet `Live` ;
- un module Mindset indépendant ;
- un module Spiritualité permanent ;
- un module Vision concurrent de `Mon Pourquoi` ;
- un nouvel outil de gestion universelle de la vie.

Cela créerait une application dans l’application et dupliquerait les moteurs déjà présents.

L’orientation privilégiée est :

**un socle transversal commun + des capacités visibles seulement quand elles apportent de la valeur.**

---

## 18. Architecture conceptuelle provisoire

### SOCLE TRANSVERSAL
**Create → Align → Live → Observe → Adapt → Grow**

### CAPACITÉS PERMANENTES EXISTANTES
- Profil / Pourquoi ;
- suivi ;
- plan alimentaire ;
- poids / routeur ;
- Idéaux ;
- bilans / tableaux de bord.

### MOTEURS CONTEXTUELS
- Défis ;
- futures Capsules / Portes de recentrage.

### CYCLES TEMPORAIRES
- Préparation Jeûne ;
- Jeûne ;
- Journal spirituel pendant le cycle ;
- Reprise ;
- Cristallisation.

Le socle doit **donner du sens aux composants existants**, et non devenir un composant supplémentaire qui cherche à tout faire.

---

## 19. Une expérience utilisateur visible sera probablement nécessaire

Un socle entièrement invisible ne suffit pas : l’application doit disposer d’une représentation minimale de la direction personnelle de l’utilisateur pour pouvoir réellement parler d’alignement.

Une piste à étudier est une **boussole progressive**, construite au fil du temps et non via un long questionnaire initial.

Exemple conceptuel :

> « La personne que je choisis de devenir… »

Puis, progressivement, l’application pourrait relier certaines actions réelles à cette direction.

Exemple : si la direction est « ne plus m’abandonner après une mauvaise semaine » et que l’utilisateur revient malgré une période difficile, l’app pourrait reconnaître ce retour comme une **preuve d’identité en construction**, plutôt que comme un simple point ou badge.

Cette piste doit être étudiée avant toute implémentation ; elle n’est pas encore validée fonctionnellement.

---

# PARTIE IV — CLASSIFICATION GLOBALE

## 20. Classification ACTIF / PARTIEL / HÉRITÉ / PRÉVU / CONCEPTUEL

| Élément | Classification | Commentaire |
|---|---|---|
| Profil / objectif poids / Pourquoi | ACTIF | Direction actuelle de base |
| Suivi alimentaire | ACTIF | Centre vivant de la réalité quotidienne |
| Plan alimentaire | ACTIF | Organisation et anticipation |
| Référentiel alimentaire | ACTIF + amélioration continue | Évolue en continu |
| Poids / routeur | ACTIF | Trajectoire calorique / pondérale |
| Bilans hebdo / mensuels | ACTIF / PARTIEL selon écrans | Moteurs réels plus avancés que certaines pages legacy |
| Défis | ACTIF / en évolution | Moteur comportemental spécialisé |
| Idéaux | ACTIF mais PARTIEL | Fondations présentes, adaptation absente |
| Préparation Jeûne | ACTIF / avancé | Parcours spécialisé |
| Jeûne | ACTIF / avancé | Cycle spécialisé |
| Journal spirituel | ACTIF uniquement dans le cycle Jeûne | Pas un socle global |
| Reprise après jeûne | ACTIF / avancé | Transition spécialisée |
| Cristallisation | ACTIF / PARTIEL | Consolidation 45 jours, plusieurs logiques encore locales/legacy |
| `/checkin.js` | HÉRITÉ / minimal | Ne représente pas seul la vraie capacité humeur globale |
| `/pause.js` | HÉRITÉ / minimal | Page statique à ne pas confondre avec un moteur mature |
| `/extras.js` | HÉRITÉ / placeholder | Les vraies logiques extras vivent surtout ailleurs |
| `/statistiques.js` | HÉRITÉ / placeholder partiel | Contient encore des données fictives |
| Capsules / Portes | CONCEPTUEL / PRÉVU | Non actives actuellement |
| Socle Create–Align–Live | CONCEPTUEL | Architecture à définir, non implémentée |

---

# PARTIE V — RÈGLES D’ARCHITECTURE ET D’AMÉLIORATION CONTINUE

## 21. Règles issues de `AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md`

Toute évolution liée à ce chantier doit respecter les principes déjà utilisés dans le projet :
- avancer progressivement ;
- préserver le comportement existant ;
- ne pas déclarer un ancien TODO toujours valable sans vérifier le code ;
- ne pas perdre de données lors d’une évolution de structure ;
- prévoir mapping / migration lorsqu’une donnée change de forme ;
- travailler par lots sûrs ;
- contrôler les régressions ;
- privilégier l’essentiel puis approfondir ;
- ne pas reconstruire une fonctionnalité existante sous un nouveau nom ;
- utiliser le runtime et le retour utilisateur comme source de validation finale.

Règle spécifique pour le futur socle : **la cohérence globale doit être conçue en amont, mais son implémentation doit être livrée progressivement.**

---

## 22. Conséquence sur le chantier Idéaux

L’ancien plan de travail Idéaux doit être réordonné.

### Avant
La logique pouvait être :
1. stabiliser Idéaux ;
2. le généraliser ;
3. le rendre adaptatif ;
4. ajouter des connexions avec le reste de l’app.

### Après audit global
Il faut d’abord :
1. conserver la stabilisation technique nécessaire ;
2. **définir la frontière produit entre Direction / Pourquoi / futur socle / Idéaux** ;
3. rendre Idéaux générique seulement dans la mesure utile à Mon Plan Vital ;
4. construire son moteur adaptatif à partir du réel ;
5. connecter progressivement les signaux utiles déjà existants ;
6. ne créer de nouvelles structures de données que lorsque la boucle adaptative les exige réellement.

Idéaux ne doit donc pas porter à lui seul :
- Create–Align–Live ;
- Défis ;
- Capsules / Portes ;
- développement personnel général ;
- planification globale de vie.

---

## 23. Décisions provisoires de cadrage

1. **Le Journal spirituel reste dans le cycle Jeûne.**
2. **Les Capsules / Portes sont un projet futur de recentrage, pas un socle permanent.**
3. **Les Défis sont un moteur comportemental de mobilisation.**
4. **Idéaux transforme une aspiration concrète en trajectoire.**
5. **Mon Pourquoi est une boussole existante à étudier avant d’ajouter une nouvelle notion concurrente.**
6. **Le futur socle mental doit relier les moteurs existants plutôt que les remplacer.**
7. **Create–Align–Live est pour l’instant un modèle transversal de travail, pas un menu ou un module validé.**
8. **La transformation personnelle doit être rendue visible à partir des preuves du réel, pas uniquement par des récompenses.**
9. **La conception globale doit précéder l’implémentation, mais le développement restera progressif.**
10. **Aucun code Idéaux ne doit être modifié pour ce nouveau socle tant que la frontière fonctionnelle n’est pas spécifiée.**

---

## 24. Question architecturale à résoudre avant développement

Le prochain travail de conception doit déterminer précisément :
- quelles informations constituent la **boussole** ;
- comment elle se construit et évolue ;
- ce qui relève de `Mon Pourquoi` ;
- ce qui relève d’Idéaux ;
- ce qui reste purement transversal ;
- quand un Défi intervient ;
- quand une Capsule / Porte intervient ;
- quels signaux de `/suivi.js`, poids, bilans et autres moteurs doivent alimenter l’alignement ;
- comment transformer une réussite réelle en « preuve de transformation » sans gamification artificielle ;
- ce que l’utilisateur voit réellement et ce qui reste moteur interne.

---

## 25. Conclusion consolidée

Mon Plan Vital possède déjà une grande partie des **composants de transformation** : observation alimentaire, trajectoire pondérale, planification, Défis, Idéaux, cycles de jeûne, reprise et cristallisation.

Le problème n’est donc pas qu’il manque une multitude de nouveaux modules.

Le constat actuel est plutôt :

> **Mon Plan Vital possède déjà beaucoup des organes nécessaires à la transformation, mais il lui manque encore un système de sens suffisamment structuré pour les faire travailler consciemment vers une même direction personnelle.**

Le futur socle ne doit pas devenir une seconde application. Il doit permettre à l’utilisateur de :

**choisir une direction → commencer à la vivre → observer sa vraie vie → s’adapter → constater ce qui change en lui.**

Dans cette architecture, Idéaux conserve un rôle précis et important :

> **transformer certaines aspirations en trajectoires concrètes, progressives et adaptatives.**

La prochaine étape n’est donc pas d’ajouter immédiatement des fonctionnalités à Idéaux. Elle est de formaliser la **boussole et les frontières fonctionnelles du socle mental transversal**, puis d’en déduire les connexions nécessaires avec les moteurs existants.

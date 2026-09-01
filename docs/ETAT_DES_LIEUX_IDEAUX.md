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

`pages/ideaux.js` permet déjà de saisir : titre, description émotionnelle, indicateur principal, date cible, date de début et image.

**État : fonctionnel.**

### 4.2 Génération du plan

`generateAnchoringPlan()` génère actuellement une structure de type :

**objectif → mois → semaines → actions.**

**État : fonctionnel techniquement.**

### 4.3 Validation du Palier 1

Le premier palier peut être personnalisé puis validé. Les paramètres sont figés et des séances sont créées dans `seances_reelles`.

**État : fonctionnel.**

### 4.4 Suivi réel

`plan-action.js` permet de suivre fait / non fait, durée réelle, distance et vitesse.

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

### 5.2 Orientation encore très « course à pied »

Le générateur conserve plusieurs hypothèses liées à la course : « Courir », `course`, vitesse en km/h, durée/fréquence/jours par défaut, moment `matin`.

### 5.3 Défloutage non fiabilisé

Une logique de blur existe mais la source de données utilisée dans `plan-action.js` est incohérente avec la manière dont `seances_reelles` est réellement chargée.

**Statut : code présent, comportement non considéré fiable tant qu’un test runtime n’a pas confirmé son fonctionnement.**

### 5.4 Durée du palier incohérente

`ideaux.js` accepte une durée de palier dynamique alors que `plan-action.js` contient encore plusieurs hypothèses fixes à 4 semaines.

### 5.5 Bonus : remplacement vs supplémentaire

La distinction métier existe mais n’est pas encore correctement propagée dans la progression et les statistiques.

### 5.6 Adaptation comportementale absente

Idéaux enregistre ce que l’utilisateur fait mais n’interprète presque pas encore difficulté, retard, avance, baisse d’énergie, changement d’emploi du temps ou reprise après interruption.

### 5.7 Modèle de données

L’implémentation actuelle repose surtout sur `ideaux`, `plan_data`, `plan_params_valides` et `seances_reelles`.

Il n’est pas recommandé de créer immédiatement toutes les tables conceptuelles historiques uniquement pour reproduire un ancien schéma. Le besoin devra être réévalué lorsque le moteur adaptatif exigera un historique plus fin.

### 5.8 Auth / `user_id`

À auditer avant validation multi-utilisateur complète : RLS `ideaux`, RLS `seances_reelles`, alimentation de `user_id` et rattachement des données historiques.

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

Les principes historiques récurrents sont : bienveillance, personnalisation, autonomisation, auto-observation, adaptation au réel, modules indépendants mais interconnectés, progression plutôt que sanction, retour au « Mon Pourquoi » et statistiques au service de la progression.

---

## 8. Architecture fonctionnelle actuelle observée

### Niveau A — Direction
Poids objectif, délai, `Mon Pourquoi`, Idéaux.

### Niveau B — Moteurs de transformation
Plan alimentaire, suivi, Défis, Idéaux, préparation au jeûne, jeûne, reprise, cristallisation.

### Niveau C — Réalité observée
Repas réels, extras, satiété, raisons de manger, ressentis, poids, actions/séances, résultats de défis et progression des cycles.

Le système sait déjà faire beaucoup de :

**RÉALITÉ → ANALYSE / MOTEUR.**

La boucle moins développée est :

**DIRECTION → ACTION → RÉALITÉ → APPRENTISSAGE → TRANSFORMATION DE LA PERSONNE.**

---

## 9. `/suivi.js` : centre vivant de la réalité quotidienne

Le suivi est le principal point de convergence du réel. Il ne faut pas créer un deuxième moteur d’observation comportementale pour le futur socle mental : celui-ci devra exploiter les données et analyses existantes.

---

## 10. Rôle exact des Défis

Les Défis sont un **moteur d’action / d’expérimentation comportementale** :

**besoin/opportunité → défi adapté → expérimentation réelle → observation du résultat.**

Ils ne sont ni la boussole globale ni le système de recentrage profond.

---

## 11. Rôle exact des Capsules / Portes

Les Capsules / Portes sont **un projet conceptuel non actif actuellement**.

Leur rôle est différent des Défis :
- Défi : utilisateur encore mobilisable ;
- Capsule / Porte : dérive, fermeture, anesthésie, fatigue de choisir ou réfléchir ;
- réponse : une micro-interruption et un mouvement minimal de recentrage.

Les Portes sont des **voies de recentrage**, pas des qualités identitaires.

---

## 12. Le Journal spirituel : périmètre verrouillé

Le Journal spirituel est **contextuel au cycle Jeûne** et ne constitue pas un module mental permanent.

Il reste classé dans :

**Préparation → Jeûne → restauration spirituelle du jeûne → Reprise → Cristallisation.**

Leçon architecturale : une capacité forte peut rester contextuelle et n’apparaître que lorsque le parcours la justifie.

---

## 13. Mon Pourquoi : boussole existante, mais encore limitée

`Mon Pourquoi` est historiquement une **boussole, jamais un objectif**.

Il constitue une graine du futur socle mental, mais ne structure pas encore pleinement l’identité souhaitée, la vie à construire, la manière de l’incarner aujourd’hui et les preuves réelles de transformation.

Le futur travail doit donc d’abord étudier comment **enrichir la boussole existante** plutôt que créer automatiquement une notion concurrente.

---

## 14. Place corrigée d’Idéaux dans l’ensemble

Idéaux ne doit pas être vu comme « tout le système Create ».

Sa fonction naturelle est :

**transformer certaines aspirations suffisamment concrètes en trajectoires progressives et adaptatives.**

Hiérarchie de travail :

**Direction / identité souhaitée → Idéal concret → objectif intermédiaire → palier → action → réel observé → adaptation.**

---

# PARTIE III — SOCLE MENTAL ET BOUCLE DE TRANSFORMATION

## 15. Fonction centrale du socle

Question de référence :

> **Est-ce que la manière dont je vis aujourd’hui construit réellement la personne et la vie que je veux devenir ?**

Le socle est différent :
- du poids objectif ;
- d’un Idéal ;
- d’un Défi ;
- d’un programme ;
- du seul `Mon Pourquoi`.

Il doit transformer une direction intérieure en manière de vivre le présent, puis permettre au réel de nourrir la transformation.

---

## 16. Les cinq éléments proposés pour la boussole

### A. CE QUI COMPTE

La raison profonde. Cette dimension reprend et peut approfondir `Mon Pourquoi`.

Elle donne du **sens** et ne constitue pas un objectif à atteindre.

### B. QUI JE CHOISIS DE DEVENIR

Dimension identitaire aujourd’hui insuffisamment structurée dans l’application.

Exemple : « devenir quelqu’un qui prend soin de soi sans s’abandonner dès qu’elle fait une erreur » plutôt que « perdre 15 kg ».

### C. LA VIE QUE JE VEUX CRÉER

Projection concrète de la vie désirée : énergie, liberté physique, rapport à l’alimentation, expériences que l’utilisateur veut pouvoir vivre.

C’est une composante naturelle de **CREATE**.

### D. COMMENT CETTE PERSONNE VIT

Quelques principes d’incarnation, et non une nouvelle liste de tâches.

Exemples conceptuels :
- elle écoute sa satiété ;
- elle revient après une mauvaise journée au lieu d’attendre lundi ;
- elle agit imparfaitement plutôt que de tout abandonner ;
- elle prend soin de son corps au lieu de le punir.

C’est une composante naturelle de **ALIGN**.

### E. CE QUE JE PEUX INCARNER MAINTENANT

C’est **LIVE**.

Cette couche **ne doit pas créer son propre gestionnaire de tâches**. Elle doit utiliser les outils déjà présents : suivi, plan alimentaire, Idéaux, Défis, habitudes et cycles pertinents.

---

## 17. Create / Align / Live : fonctions, pas trois écrans

### CREATE — Ma direction

Peut mobiliser :
- `Mon Pourquoi` ;
- personne que je veux devenir ;
- vie que je veux construire ;
- aspirations importantes.

### ALIGN — Ma boussole confrontée au réel

L’application met progressivement en relation la direction et les comportements observés, sans jugement.

Elle réutilise les données déjà collectées plutôt que demander à l’utilisateur de tout ressaisir.

### LIVE — L’incarnation

La direction se vit à travers les outils existants : alimentation, Idéaux, actions, habitudes, programmes, Défis et cycles spécialisés.

**Décision de cadrage : Create / Align / Live ne doivent pas devenir trois onglets ou trois nouveaux systèmes autonomes.**

---

## 18. OBSERVE — regarder le réel plutôt que l’intention

Mon Plan Vital possède déjà une grande quantité de signaux permettant d’observer le comportement réel.

Le futur socle peut donner un sens supplémentaire à ces données en les transformant, lorsque c’est pertinent, en **preuves d’alignement ou d’évolution**.

Exemple : une amélioration du respect de la satiété ne raconte pas seulement une meilleure conformité alimentaire ; elle peut montrer que l’utilisateur apprend réellement à écouter son corps.

---

## 19. ADAPT — distribuer l’intervention au bon moteur

ADAPT ne doit pas être un module supplémentaire.

Le moteur à solliciter dépend de la situation :

### Situation normale
Tout va bien → aucune intervention nécessaire.

### Difficulté ciblée + utilisateur mobilisable
→ **Défi**.

### Dérive profonde / fermeture / perte d’élan
→ future **Capsule / Porte**.

### Trajectoire d’un Idéal devenue irréaliste
→ moteur adaptatif **Idéaux**.

### Écart alimentaire progressif
→ moteurs **suivi / plan alimentaire / routeur / bilan** selon le besoin.

Principe : **le socle oriente ; le moteur spécialisé agit.**

---

## 20. GROW — rendre visible la transformation humaine

GROW apparaît comme une brique aujourd’hui insuffisamment représentée dans Mon Plan Vital.

L’application mesure déjà de nombreux résultats : poids, calories, QN, extras, séances, jours validés, défis, etc.

GROW doit répondre à une question différente :

> **Qu’est-ce que ma vie réelle montre que je suis désormais capable de faire ou de devenir ?**

Exemple conceptuel :
- auparavant : un extra entraînait plusieurs jours d’abandon ;
- aujourd’hui : retour au plan dès le repas suivant.

La transformation intéressante devient alors :

**temps de retour à l’alignement : plusieurs jours → un repas.**

Cette évolution peut être reconnue comme une transformation réelle sans être réduite à une récompense ou à un badge.

---

## 21. Pas de score global d’alignement de la personne

À ce stade, il est déconseillé de produire un score de type :

**Alignement : 72 %**.

Un tel score risquerait de recréer une norme, une logique de contrôle et une culpabilisation incompatibles avec la philosophie historique de Mon Plan Vital.

Le socle doit privilégier :
- évolutions ;
- preuves ;
- tendances ;
- retours ;
- reprises ;
- comportements nouveaux.

**On mesure des phénomènes utiles ; on ne note pas la personne.**

---

## 22. Exemple complet avec Idéaux

### Direction
« Je veux devenir quelqu’un qui retrouve sa liberté physique. »

### Aspiration concrète
« Je veux pouvoir refaire ma course de 6 km. »

### Idéaux
Transformation en objectif, paliers et séances.

### LIVE
L’utilisateur court réellement.

### OBSERVE
Durée, distance, vitesse, régularité et difficultés sont observées.

### ADAPT
Idéaux génère le prochain palier à partir du réel.

### GROW
L’app peut rendre visible que ce qui était difficile auparavant devient maintenant possible.

Dans ce contexte, le défloutage de l’image peut représenter non seulement un pourcentage de progression, mais le fait que **le futur imaginé devient progressivement une réalité vécue**.

---

## 23. Cycle fonctionnel de référence

Le modèle de travail devient :

**CREATE** — Je définis la direction.  
↓  
**ALIGN** — Je comprends comment cette direction se traduit dans ma manière de vivre.  
↓  
**LIVE** — Je la vis aujourd’hui au travers des outils existants.  
↓  
**OBSERVE** — Mon Plan Vital regarde ma réalité, pas seulement mon intention.  
↓  
**ADAPT** — Le bon moteur intervient seulement si nécessaire.  
↓  
**GROW** — L’application rend visible ce qui est réellement en train de changer.  
↓  
**CREATE / approfondissement** — La direction peut être enrichie par la nouvelle réalité vécue.

Formule synthétique :

**CREATE → ALIGN → LIVE → OBSERVE → ADAPT → GROW → CREATE…**

---

# PARTIE IV — CLASSIFICATION GLOBALE

## 24. Classification ACTIF / PARTIEL / HÉRITÉ / PRÉVU / CONCEPTUEL

| Élément | Classification | Commentaire |
|---|---|---|
| Profil / objectif poids / Pourquoi | ACTIF | Direction actuelle de base |
| Suivi alimentaire | ACTIF | Centre vivant de la réalité quotidienne |
| Plan alimentaire | ACTIF | Organisation et anticipation |
| Référentiel alimentaire | ACTIF + amélioration continue | Évolue en continu |
| Poids / routeur | ACTIF | Trajectoire calorique / pondérale |
| Bilans hebdo / mensuels | ACTIF / PARTIEL selon écrans | Moteurs plus avancés que certaines pages legacy |
| Défis | ACTIF / en évolution | Moteur comportemental spécialisé |
| Idéaux | ACTIF mais PARTIEL | Fondations présentes, adaptation absente |
| Préparation Jeûne | ACTIF / avancé | Parcours spécialisé |
| Jeûne | ACTIF / avancé | Cycle spécialisé |
| Journal spirituel | ACTIF uniquement dans le cycle Jeûne | Pas un socle global |
| Reprise après jeûne | ACTIF / avancé | Transition spécialisée |
| Cristallisation | ACTIF / PARTIEL | Consolidation 45 jours |
| `/checkin.js` | HÉRITÉ / minimal | Ne représente pas seul la capacité humeur globale |
| `/pause.js` | HÉRITÉ / minimal | Page statique |
| `/extras.js` | HÉRITÉ / placeholder | Les vraies logiques extras vivent surtout ailleurs |
| `/statistiques.js` | HÉRITÉ / placeholder partiel | Contient encore des données fictives |
| Capsules / Portes | CONCEPTUEL / PRÉVU | Non actives actuellement |
| Boussole enrichie | CONCEPTUEL | À concevoir progressivement |
| Create–Align–Live–Observe–Adapt–Grow | CONCEPTUEL | Modèle transversal, pas un module validé |

---

# PARTIE V — RÈGLES D’ARCHITECTURE ET D’AMÉLIORATION CONTINUE

## 25. Règles issues de `AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md`

Toute évolution liée à ce chantier doit :
- avancer progressivement ;
- préserver le comportement existant ;
- vérifier le code récent avant de reprendre un ancien TODO ;
- préserver les données ;
- prévoir mapping / migration lors d’un changement de structure ;
- travailler par lots sûrs ;
- contrôler les régressions ;
- privilégier l’essentiel puis approfondir ;
- ne pas reconstruire une fonctionnalité existante sous un nouveau nom ;
- utiliser le runtime et le retour utilisateur comme validation finale.

Règle spécifique : **la cohérence globale doit être conçue en amont, mais l’implémentation doit être livrée progressivement.**

---

## 26. Conséquence sur le chantier Idéaux

Il faut :
1. conserver la stabilisation technique nécessaire ;
2. définir la frontière Direction / Pourquoi / boussole / Idéaux ;
3. rendre Idéaux générique uniquement dans la mesure utile ;
4. construire son moteur adaptatif à partir du réel ;
5. connecter progressivement les signaux utiles existants ;
6. ne créer de nouvelles structures de données que lorsqu’elles deviennent réellement nécessaires.

Idéaux ne doit pas porter à lui seul Create–Align–Live, Défis, Capsules / Portes, développement personnel général ou planification globale de vie.

---

## 27. Décisions provisoires de cadrage

1. **Le Journal spirituel reste dans le cycle Jeûne.**
2. **Les Capsules / Portes restent un futur mécanisme de recentrage.**
3. **Les Défis restent un moteur comportemental de mobilisation.**
4. **Idéaux transforme une aspiration concrète en trajectoire.**
5. **Mon Pourquoi constitue le premier noyau à étudier pour la boussole.**
6. **Le futur socle relie les moteurs existants plutôt qu’il ne les remplace.**
7. **Create–Align–Live–Observe–Adapt–Grow est un modèle transversal de travail, pas un menu.**
8. **La transformation personnelle doit être rendue visible à partir de preuves du réel.**
9. **Il n’y aura pas de score global notant l’alignement de la personne.**
10. **La boussole doit rester progressive et légère.**
11. **LIVE réutilise les outils existants et ne crée pas un nouveau gestionnaire de tâches.**
12. **ADAPT distribue l’intervention au moteur spécialisé pertinent.**
13. **Aucun code Idéaux ne doit être modifié pour ce socle avant validation de son parcours fonctionnel.**

---

## 28. Prochaine étape de conception

Le prochain chantier est désormais le **parcours utilisateur réel de la boussole**.

Il faut déterminer :
- quand elle apparaît pour la première fois ;
- ce que l’utilisateur renseigne au départ ;
- ce qui est volontairement reporté ;
- comment `Mon Pourquoi` est repris sans être dupliqué ;
- comment la dimension « personne que je choisis de devenir » est introduite ;
- comment la « vie que je veux créer » reste compatible avec le périmètre Mon Plan Vital ;
- comment les principes d’incarnation sont proposés sans devenir des tâches ;
- comment la boussole s’enrichit avec le temps ;
- quand elle réapparaît naturellement ;
- quand elle doit au contraire rester silencieuse ;
- comment les preuves GROW sont produites à partir du réel ;
- comment éviter les notifications et messages répétitifs ou culpabilisants.

Cette étape doit être validée fonctionnellement avant toute conception technique de tables, API ou écrans.

---

## 29. Conclusion consolidée

Mon Plan Vital possède déjà une grande partie des **organes de transformation**. Le manque principal n’est pas une multiplication de nouveaux modules, mais un système de sens permettant de relier direction personnelle, réalité vécue, adaptation et transformation.

Le futur socle doit permettre :

**choisir une direction → commencer à la vivre → observer sa vraie vie → mobiliser le bon moteur si nécessaire → constater ce qui change réellement → approfondir sa direction.**

Dans cette architecture, Idéaux conserve un rôle précis :

> **transformer certaines aspirations en trajectoires concrètes, progressives et adaptatives.**

La prochaine étape est la conception du **parcours progressif de la boussole**, sans modification du code applicatif tant que ce parcours n’est pas validé.

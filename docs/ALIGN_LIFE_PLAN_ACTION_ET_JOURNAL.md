# Align-Life — Plan d'action & journal de passation

**Date d'initialisation : 1er septembre 2026**  
**Branche de travail : `Align-Life`**  
**Branche source : `plan-alimentaire-intelligent-chatgpt`**  
**HEAD de création de la branche : `0f9be4e3c2b5278d4c1fadc4fcc63110a3a9d36e`**  
**Statut : P0 gouvernance validé ; P1 expérience utilisateur validée ; P2 audit technique = prochaine priorité**

---

# 1. RÈGLES DE GOUVERNANCE DU CHANTIER

Ces règles sont obligatoires pour tout travail effectué dans le périmètre Align-Life.

1. **Aucun commit sans accord explicite préalable de l'utilisateur.**
2. **Aucun commit hors de la branche `Align-Life` pour ce périmètre.**
3. Avant toute modification applicative : audit ciblé des fichiers et comportements réellement concernés sur le HEAD courant de `Align-Life`.
4. Aucun comportement existant ne doit être cassé pour introduire la nouvelle vision.
5. Toute modification autorisée doit mettre à jour **ce fichier de suivi dans le même commit** que le changement concerné.
6. Après chaque changement : documenter les tests techniques et fonctionnels réellement effectués, les résultats, anomalies et risques résiduels.
7. Ne jamais documenter comme « fait » ce qui n'a pas été réellement implémenté ou vérifié.
8. Tout changement Supabase, migration, RLS, API ou données doit être explicitement consigné.
9. En cas d'échec, de rollback ou d'anomalie, l'événement doit être enregistré dans ce journal, au même titre qu'un succès.
10. Ce fichier est la **source de reprise opérationnelle du chantier** : toute personne reprenant le projet doit pouvoir comprendre le dernier état fiable, le dernier commit, les décisions, les tests et la prochaine étape.

---

# 2. OBJECTIF PRODUIT ALIGN-LIFE

Construire un socle transversal qui permet à Mon Plan Vital de relier :

**direction personnelle → aspirations → actions réelles → observation → adaptation → transformation visible.**

Le socle ne doit pas créer une nouvelle application dans l'application. Il doit orchestrer et donner du sens aux capacités existantes : Mon Pourquoi, Suivi, Plan, Extras, Défis, Idéaux, poids et cycles.

Boucle cible :

**CREATE → ALIGN → LIVE → OBSERVE → ADAPT → GROW → enrichissement de la Boussole.**

## Nomenclature verrouillée

- **Nom utilisateur de l'expérience : `My Way`**.
- **Concept produit/fonctionnel interne : Boussole**.
- **Notion de cap :** peut être utilisée à l'intérieur de My Way pour parler de direction, mais n'est pas le nom principal de l'expérience.
- **Architecture interne :** CREATE → ALIGN → LIVE → OBSERVE → ADAPT → GROW.
- **Branche de développement :** `Align-Life`.
- **Sous-titre de travail :** « My Way — Ce qui compte pour moi et ce que je construis. » ; formulation révisable ultérieurement sans remettre en cause le naming validé `My Way`.

Principes verrouillés :

- Mon Pourquoi reste la graine initiale de la Boussole / My Way ;
- une seule direction identitaire globale et évolutive ;
- exprimer quand je sais / découvrir quand je ne sais pas ;
- aucune obligation de compléter My Way ;
- aspiration ≠ objectif ≠ Idéal ;
- l'utilisateur choisit si une aspiration devient un projet concret ;
- Idéaux transforme une aspiration concrète en trajectoire ;
- LIVE réutilise les moteurs existants ;
- GROW part de faits vérifiés ;
- fait ≠ tendance ≠ transformation ;
- `NO_INTERVENTION` est un état fonctionnel ;
- l'IA formule ou clarifie, elle ne décide pas qui est l'utilisateur ;
- l'utilisateur valide toute formulation touchant à son identité ou sa vision ;
- le Journal spirituel reste contextuel au Jeûne ;
- GROW peut traverser Préparation → Jeûne → Reprise → Cristallisation → fonctionnement normal ;
- l'autonomisation est une dimension importante du succès produit.

---

# 3. PLAN D'ACTION PRIORISÉ

## P0 — Gouvernance et sécurité du chantier

**État : TERMINÉ.**

Objectifs atteints :
- branche `Align-Life` dédiée ;
- règles de commit consignées ;
- journal de passation opérationnel ;
- interdiction de modification applicative avant audit et validation du parcours respectée.

Critère de sortie atteint : ce fichier est présent sur `Align-Life` et devient obligatoire dans chaque futur commit autorisé.

---

## P1 — Figer l'expérience utilisateur cible Align-Life / My Way

**État : TERMINÉ — parcours fonctionnel + implantation UX cible + naming validés.**

### P1A — Parcours fonctionnel validé

Parcours cible :

**Mon Pourquoi → My Way progressive → aspiration éventuelle → Idéaux si choix de concrétisation → LIVE dans les outils existants → OBSERVE → GROW → éventuel ADAPT → My Way enrichie.**

Règles fonctionnelles validées :
- Mon Pourquoi reste la graine d'entrée ;
- si l'utilisateur sait ce qu'il veut exprimer, il peut l'écrire directement ;
- s'il ne sait pas, l'application ne l'interroge pas en boucle et il peut continuer à vivre son parcours ;
- les éléments de My Way sont évolutifs et non obligatoires ;
- une aspiration peut rester une aspiration ;
- seule une décision explicite de l'utilisateur permet de la transmettre à Idéaux ;
- `NO_INTERVENTION` / droit au silence sont conservés ;
- GROW montre des faits/tendances/transformations observables sans attribuer automatiquement une identité à l'utilisateur.

### P1B — Implantation UX cible validée

Décisions :
- **`My Way` est le nom visible utilisateur.**
- `Boussole` reste un terme interne et ne doit pas être présenté par défaut comme le nom d'un nouvel onglet utilisateur.
- ne pas créer par défaut un nouvel onglet principal `My Way` dans la navigation ; l'audit technique P2 doit confirmer le raccord le moins intrusif ;
- le **Profil** reste le point de naissance naturel via l'objectif + Mon Pourquoi ;
- toute l'expérience My Way ne doit pas être enfermée dans le Profil ;
- le **Tableau de bord** est la cible privilégiée pour une entrée légère et volontaire vers My Way ;
- **GROW doit aussi apparaître contextuellement** là où le fait significatif se produit réellement : Suivi, Idéaux, Défi, Cristallisation, etc. ;
- My Way sert à retrouver le sens et les éléments validés, pas à créer un nouveau tableau de tâches ;
- Idéaux reste le moteur de concrétisation d'une aspiration et n'est pas remplacé par My Way.

Contenus candidats de l'espace My Way, sans obligation de complétion :
- pourquoi j'ai commencé ;
- ce qui compte pour moi / ce que je veux vivre davantage ;
- qui je choisis de devenir, uniquement si je l'ai exprimé ou validé ;
- mes aspirations ;
- ce que mon parcours m'a déjà montré via GROW.

**Critère de sortie atteint : l'expérience cible est suffisamment figée pour permettre l'audit technique P2 sans recommencer la conception fonctionnelle.**

---

## P2 — Audit technique ciblé sur le HEAD réel de `Align-Life`

**État : PROCHAINE PRIORITÉ — aucun code applicatif à modifier pendant l'audit.**

Auditer uniquement les zones qui doivent réellement se raccorder :

- `pages/profil.js` / Mon Pourquoi ;
- `components/FormulaireProfil.js` ;
- `pages/tableau-de-bord.js` ;
- `pages/ideaux.js` ;
- `pages/plan-action.js` ;
- `lib/generateAnchoringPlan.js` ;
- `pages/suivi.js` ;
- flux Extras ;
- Défis ;
- dashboard/navigation ;
- Auth / `user_id` ;
- tables/RLS Supabase nécessaires ;
- Préparation Jeûne ;
- Jeûne ;
- Reprise ;
- Cristallisation.

Livrable attendu : matrice

**capacité → fichier actuel → données disponibles → modification nécessaire → dépendances → risque de régression → test requis.**

Objectif : raccorder au réel existant, pas recréer ce qui fonctionne déjà.

---

## P3 — Fondation de données de la Boussole / My Way

**État : À FAIRE après audit.**

Conserver le minimum nécessaire pour :
- Mon Pourquoi existant ;
- expressions libres ;
- éléments validés ;
- direction personnelle éventuellement exprimée ;
- aspirations ;
- principes d'incarnation éventuellement validés ;
- provenance : utilisateur / proposition GROW / proposition IA ;
- statut : brut / proposé / validé / refusé / archivé.

Contraintes :
- isolation utilisateur explicite ;
- stratégie de migration avant toute transformation des données existantes ;
- ne pas créer des tables conceptuelles inutiles avant besoin réel.

---

## P4 — My Way V1 sans dépendance forte à l'IA

**État : À FAIRE.**

Fonctions minimales :
- consulter ;
- ajouter ;
- modifier ;
- archiver/supprimer selon règle retenue ;
- dire « je ne sais pas / pas maintenant » ;
- continuer le parcours normalement.

La fonctionnalité doit rester utilisable si le service IA est indisponible.

---

## P5 — IA V1 : « reformuler sans inventer »

**État : À FAIRE.**

Flux cible :

texte utilisateur → route serveur → contexte minimal → proposition structurée → affichage → **Ça me ressemble / Je modifie / Je garde mes mots / Je refuse** → seule la formulation validée est persistée comme référence.

Avant implémentation : recalculer les coûts API actuels et documenter :
- 1 personne en test ;
- 20 utilisateurs actifs/mois ;
- fréquence d'appels ;
- volume moyen ;
- coût moyen/utilisateur ;
- modèle cible et fallback éventuel.

---

## P6 — Raccord My Way → Idéaux

**État : À FAIRE.**

Règle : une aspiration ne devient jamais automatiquement un Idéal.

Exemple :

**My Way** : retrouver ma liberté physique  
→ **aspiration** : recommencer à courir  
→ choix utilisateur : **En faire quelque chose de concret**  
→ **Idéaux prend le relais.**

À définir : UX de passage, données transmises, possibilité de revenir/refuser, conservation du sens initial.

---

## P7 — Finalisation fonctionnelle d'Idéaux

**État : À FAIRE après raccord P6.**

Cible :

**aspiration concrète → objectif → Palier 1 → actions → observation réelle → adaptation → palier suivant → progression vers l'idéal.**

Points connus à réévaluer sur le code actuel avant changement :
- généricité hors course ;
- vrais multi-paliers ;
- adaptation retard / avance ;
- reprise après interruption ;
- Plan B / alternatives ;
- bonus ;
- fiabilisation du défloutage ;
- durée de palier ;
- isolation utilisateur ;
- raccord GROW.

Aucune correction ne sera faite sur la seule base d'un ancien état des lieux : chaque point devra être revérifié sur `Align-Life`.

---

## P8 — OBSERVE / moteur événementiel V1

**État : À FAIRE.**

Premiers signaux candidats :
- retour après extra ;
- retour après interruption ;
- progression Idéaux ;
- comportement maintenu après Défi si prouvable ;
- événements pertinents de Cristallisation.

Pipeline :

**LIVE → OBSERVE → DETECT → DECIDE**

avec `NO_INTERVENTION` lorsque la preuve, l'utilité ou le contexte ne justifie pas de message.

---

## P9 — GROW V1

**État : À FAIRE.**

Hiérarchie de preuve retenue :
- P0 donnée brute ;
- P1 fait établi ;
- P2 répétition ;
- P3 tendance ;
- P4 transfert ;
- P5 autonomie.

Le langage de GROW ne peut jamais dépasser la force de la preuve.

Candidat MVP prioritaire : **retour après écart / interruption**.

---

## P10 — GROW + Idéaux

**État : À FAIRE.**

Objectif : distinguer célébration de résultat et mise en sens de la progression.

Exemple factuel :

> « Il y a deux mois, 12 minutes étaient difficiles. Aujourd'hui tu en fais 28. »

Puis, uniquement si un élément validé dans My Way le permet :

> « Tu avais associé cela au fait de retrouver ta liberté physique. Cette liberté commence à prendre une forme concrète. »

---

## P11 — Raccord aux cycles

**État : À FAIRE.**

Préparation → Jeûne → Reprise → Cristallisation restent des expériences contextuelles distinctes.

Règles :
- GROW peut traverser les phases ;
- Journal spirituel reste Jeûne-only ;
- aucune analyse automatique du contenu spirituel dans le socle global ;
- un éventuel transfert de prise de conscience doit être volontaire ;
- Cristallisation est un terrain privilégié pour distinguer comportement accompagné, consolidation, transfert et autonomie.

---

## P12 — ADAPT et orchestration avancée

**État : À FAIRE en dernier.**

Routage cible selon le besoin :
- besoin alimentaire → Plan / Suivi ;
- trajectoire Idéaux inadéquate → Idéaux adapte ;
- utilisateur mobilisable → Défi ;
- future dérive profonde / fermeture → Capsule/Porte si ce chantier est un jour validé ;
- rien de pertinent → `NO_INTERVENTION`.

ADAPT n'est pas un nouvel écran ni un module autonome.

---

# 4. FORMAT OBLIGATOIRE DU JOURNAL DE CHANGEMENTS

Pour chaque futur changement autorisé, ajouter une entrée contenant au minimum :

- **Date / heure** ;
- **Branche** ;
- **HEAD avant changement** ;
- **Objectif du changement** ;
- **Accord utilisateur reçu** ;
- **Fichiers inspectés** ;
- **Fichiers modifiés** ;
- **Supabase / API / migration concernée ou non** ;
- **Comportement avant** ;
- **Comportement attendu après** ;
- **Tests réalisés** ;
- **Résultats des tests** ;
- **Régressions / anomalies / limites** ;
- **Décisions prises** ;
- **Commit SHA** ;
- **HEAD après commit** ;
- **Prochaine étape autorisée / non autorisée**.

Note technique : le SHA d'un commit ne peut pas être connu avant sa création. Le SHA du commit courant doit donc être vérifié immédiatement après création et reporté dans le récapitulatif externe ; il sera également consolidé dans ce journal au prochain commit autorisé, sans créer un commit documentaire artificiel uniquement pour auto-référencer son propre SHA.

---

# 5. JOURNAL CHRONOLOGIQUE

## LOG 001 — Initialisation de la gouvernance Align-Life

**Date : 1er septembre 2026**  
**Branche : `Align-Life`**  
**HEAD avant changement : `0f9be4e3c2b5278d4c1fadc4fcc63110a3a9d36e`**  
**Objectif :** créer le plan d'action priorisé et la source unique de passation du chantier Align-Life.  
**Accord utilisateur : OUI — « ok go » après présentation explicite du contenu et de la règle de commit.**  
**Fichiers inspectés :** documentation de cadrage Boussole/GROW déjà présente sur la branche source avant création de `Align-Life`.  
**Fichier modifié/créé :** `docs/ALIGN_LIFE_PLAN_ACTION_ET_JOURNAL.md`.  
**Supabase / API / migration :** non concerné.  
**Code applicatif :** aucun changement.  
**Comportement utilisateur :** aucun changement.  
**Tests :** vérification de la création du fichier et du commit sur `Align-Life` uniquement.  
**Résultat :** succès.  
**Commit SHA / HEAD après :** `d531ee315d9491c468b6865fc7d8f98e31a97b62`.  
**Prochaine étape :** P1 — figer l'expérience utilisateur cible Align-Life avant toute modification applicative.

---

## LOG 002 — Validation du parcours UX et du naming My Way

**Date : 1er septembre 2026**  
**Branche : `Align-Life`**  
**HEAD avant changement : `d531ee315d9491c468b6865fc7d8f98e31a97b62`**  
**Objectif :** figer dans la source de passation les décisions P1 déjà validées en conversation : expérience utilisateur cible, implantation UX de principe et naming `My Way`.  
**Accord utilisateur : OUI — « go » après explication explicite que l'autorisation concernait uniquement la mise à jour documentaire du journal, et non des modifications applicatives.**  
**Fichiers inspectés pendant l'audit UX ciblé :** `components/Navigation.js`, `pages/profil.js`, `pages/tableau-de-bord.js`, `pages/suivi.js`, `pages/ideaux.js`, `docs/ALIGN_LIFE_PLAN_ACTION_ET_JOURNAL.md`.  
**Fichier modifié :** `docs/ALIGN_LIFE_PLAN_ACTION_ET_JOURNAL.md` uniquement.  
**Supabase / API / migration :** non concerné. Aucun changement de schéma, donnée, RLS ou API.  
**Comportement avant :** My Way/Boussole n'est pas implémenté ; la documentation P1 restait marquée « à faire ».  
**Comportement attendu après :** aucun changement visible dans l'application ; la documentation devient la référence de passation pour le naming et l'UX cible validés.  
**Tests réalisés avant commit :** vérification du HEAD `Align-Life`, lecture du journal existant, contrôle ciblé des fichiers UX concernés.  
**Résultats :** les décisions sont compatibles avec l'architecture visible actuelle : navigation courte, Mon Pourquoi dans Profil, dashboard agrégateur, Suivi comme centre vivant, Idéaux comme moteur de concrétisation.  
**Régressions / anomalies / limites :** aucune régression applicative possible sur ce commit documentaire ; P2 n'est pas encore réalisé ; My Way n'est pas encore implémenté ; le sous-titre est une formulation de travail.  
**Décisions prises :** nom utilisateur `My Way` ; Boussole = concept interne ; pas de nouvel onglet principal par défaut ; graine via Mon Pourquoi/Profil ; entrée vivante privilégiée depuis le Tableau de bord ; GROW contextuel ; aspiration → Idéaux uniquement sur choix explicite ; droit au silence / `NO_INTERVENTION` conservé.  
**Commit SHA :** à vérifier immédiatement après création de ce commit, puis à consolider au prochain commit autorisé.  
**HEAD après commit :** à vérifier immédiatement après création de ce commit.  
**Prochaine étape :** P2 — audit technique ciblé en lecture seule. **Aucune modification applicative n'est autorisée par ce commit.**

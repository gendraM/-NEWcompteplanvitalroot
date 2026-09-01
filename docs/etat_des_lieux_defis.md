# Etat des lieux defis

Date initiale : 2026-07-26
Mise a jour : 2026-09-01
Branche documentee : `defis-N`
Comparaison complementaire : branche actuelle `AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS`
Perimetre : pages, composants, utilitaires, donnees, migrations, integrations transversales, documentation et vision produit lies aux defis.

> REGLE DE TRACABILITE
> Cette mise a jour ne remplace pas les constats historiques du 26/07/2026. Ils sont conserves ci-dessous et completes par les constats issus de l'audit du 01/09/2026. Un point historique peut avoir ete partiellement depasse par des evolutions ulterieures : il doit alors etre relu avec la section "Mise a jour 01/09/2026" correspondante.

---

## 1) Ce que represente "un defi" dans ce projet

Un defi est une action comportementale ciblee, suivie dans le temps, avec :
- un objectif (nom + description),
- une duree ou un nombre d'occurrences (jours, repas, tentatives...),
- une progression,
- un statut,
- une validation,
- potentiellement un journal,
- un feedback/recompense a l'achevement.

### Familles actuellement identifiees

1. **Defis de referentiel** : 10 mini-defis fixes via `lib/defisReferentiel.js`.
2. **Defis personnalises** : crees par l'utilisateur et pouvant utiliser un journal dedie.
3. **Defis/parcours specialises** : certaines phases de l'application (reprise, cristallisation, jeune, pleine conscience...) utilisent egalement la notion de defi. Ils doivent etre inventories et classes avant toute fusion de modeles.

### Positionnement produit a conserver

Le defi n'est pas equivalent a :
- un Ideal,
- une routine,
- un programme,
- une capsule de recentrage.

Ces objets peuvent interagir, mais leurs fonctions sont distinctes :
- **Ideal** : direction durable / identitaire.
- **Routine/action recurrente** : comportement a ancrer dans la duree.
- **Programme** : parcours structure dans une phase donnee.
- **Defi** : experience volontaire, courte et ciblee permettant de travailler un comportement ou une difficulte precise.
- **Recentrage / anti-derive** : intervention immediate et bienveillante face a une derive ; elle peut conduire a la proposition d'un defi mais ne doit pas etre automatiquement transformee en defi.

---

## 2) Comportement attendu d'apres les specifications

Les documents historiques decrivent les attentes suivantes :
- 10 mini-defis integres conformement au cahier des charges (`docs/defis.md`).
- proposition de defis adaptes lorsque l'utilisateur est dans une dynamique compatible ;
- possibilite d'accepter ou refuser une proposition ;
- acces volontaire a "Mes defis" ;
- creation de defis personnels ;
- progression persistante et visible ;
- debut et fin clairs ;
- feedback de reussite : badge, message, score et/ou animation ;
- prise en compte du contexte utilisateur (humeur, comportement, regularite, extras, stagnation...) pour adapter les suggestions ;
- validation quotidienne ou par occurrence selon le type de defi ;
- journal pour certains defis personnalises ;
- experience transversale : un defi commence dans un espace doit pouvoir etre retrouve et suivi dans les espaces pertinents de l'application.

La documentation historique contient egalement une vision de **defis intelligents** : exploitation des donnees de l'application pour detecter des patterns, identifier une difficulte/opportunite et proposer un defi adapte au bon moment.

Cette vision doit etre conservee comme cible, mais avec une regle supplementaire : **un pattern detecte ne doit pas produire automatiquement un defi**. Le moteur doit d'abord determiner l'intervention la plus adaptee (feedback, recentrage, action, adaptation de programme, defi, etc.).

---

## 3) Comportement constate dans le code

### 3.1 Page defis principale

`pages/defis.js` :
- chargement des defis depuis Supabase (`defis`) ;
- initialisation des defis du referentiel lorsque necessaire ;
- synchronisation partielle des noms avec le referentiel ;
- onglets disponibles / en cours / termines / creer ;
- creation et suppression de defis personnalises ;
- demarrage d'un defi ;
- progression et achevement ;
- redirection vers le journal pour certains defis personnalises.

Constat historique toujours pertinent :
- un defi de referentiel est initialise avec `progress = 1` au demarrage ;
- un defi personnalise peut demarrer a `progress = 0`.

### 3.2 Referentiel existant

`lib/defisReferentiel.js` contient les 10 mini-defis historiques, principalement comportementaux et alimentaires : dessert automatique, excuses, portions, satiete, compensation, digestion, chaine sucre/gras, faim reelle, plaisir planifie, cru quotidien.

Le referentiel constitue un socle utile, mais il ne couvre pas a lui seul toute la vision actuelle de Mon Plan Vital. Les futures familles de defis devront pouvoir couvrir, lorsque pertinent, alimentation, mouvement, comportement, mindset/developpement personnel, routines et dimensions propres aux programmes, sans transformer tous les modules en defis.

### 3.3 Journal de defi

Le parcours existe via notamment :
- `pages/journal-defi/[id].js`,
- `components/JournalDefiPersonnalise.js`,
- `lib/journalDefisUtils.js`,
- table `journal_defis`.

Il gere des engagements, notes, score/validation et progression.

### 3.4 Contexte global

`components/DefisContext.js` :
- charge les defis ;
- expose `defis`, `defisEnCours`, `loading`, `error`, `refreshDefis` ;
- considere actuellement comme en cours les lignes avec `status === 'en cours'`.

`pages/_app.js` monte `DefisProvider` au niveau global : le socle necessaire a une experience transversale existe donc reellement.

### 3.5 Affichage transversal

Des integrations existent deja dans plusieurs zones, notamment :
- `pages/repas.js`,
- `pages/suivi.js`,
- `components/DefisEnCoursBanner.js`,
- `components/BandeauDefiActif.js`,
- `components/SaisieRepas.js`,
- `components/SaisieDefiAlimentaire.js`,
- `components/SaisieDefisDynamiques.js`.

La transversalite n'est donc plus seulement un projet documentaire : elle est **partiellement implementee**.

### 3.6 Validations specialisees

`components/SaisieDefisDynamiques.js` contient plusieurs interfaces specifiques a certains defis (excuses, faux allie, briser la chaine, vraie faim, plaisir planifie, etc.).

Cela montre une evolution au-dela d'un simple bouton generique `+1`.

Cependant, une partie des validations demande encore manuellement des informations que l'application pourrait parfois deja connaitre. Il faut distinguer :
- **validation automatique/evenementielle** lorsque l'application possede une preuve exploitable ;
- **validation declarative** lorsque seul l'utilisateur peut connaitre la realite (faim emotionnelle, intention, ressenti, etc.).

---

## 4) Constats historiques du 26/07/2026 - CONSERVES

### Ecart historique critique A - Journal personnalise : incompatibilite de contrat de donnees

Constat historique :
- `chargerJournalDefi` retournait `{ data, error? }` alors que le composant consommait le retour comme un objet direct ;
- le composant utilisait `eng.valide` alors que les utilitaires calculaient avec `eng.tenu`.

Impact identifie : restauration incoherente, score potentiellement nul et progression non fiable.

**Statut au 01/09/2026 : a reverifier par test fonctionnel avant cloture. Ne pas supprimer ce log tant qu'un test de non-regression n'a pas prouve la correction.**

### Ecart historique critique B - Reponse utilitaire vs UI non alignee

Constat historique :
- UI attendant `progressionIncrementee` / `newProgress` ;
- utilitaire retournant `success` / `etapeValidee`.

**Statut au 01/09/2026 : a reverifier par test fonctionnel avant cloture.**

### Ecart historique majeur C - Machine d'etat non uniforme

Constat :
- coexistence de `en attente`, `disponible`, `en cours`, `termine` ;
- `pages/defis.js` determine en partie l'etat via `progress` ;
- `DefisContext` utilise `status === 'en cours'`.

**Statut au 01/09/2026 : confirme comme probleme architectural toujours pertinent.**

### Ecart historique majeur D - Progression heterogene au demarrage

Constat : referentiel a 1 au demarrage vs personnalise a 0.

**Statut au 01/09/2026 : confirme. Une decision produit explicite est necessaire.**

### Ecart historique majeur E - Faux bandeau actif en dur

`pages/defis.js` contient encore un `BandeauDefiActif` alimente par une donnee de demonstration de type `Defi test`, progression 2/5.

**Statut au 01/09/2026 : confirme.**

### Ecart historique moyen F - Dette `SaisieDefisDynamiques`

Le fichier concentre de nombreuses logiques specialisees et historiques. Une partie a une vraie valeur fonctionnelle, mais l'ensemble doit etre audite/nettoye avant extension.

**Statut au 01/09/2026 : dette confirmee, mais ne pas supprimer en bloc : plusieurs composants specialises sont aujourd'hui utiles.**

### Ecart historique moyen G - Tracabilite BDD

Le constat de juillet indiquait l'absence de migrations versionnees pour plusieurs tables dans `defis-N`.

**Mise a jour 01/09/2026 : ce constat est partiellement depasse au niveau global du projet. Une migration d'authentification ajoute notamment `user_id` a `defis`, `defis_personnalises`, `journal_defis`, `defis_cristallisation`, `journal_defi_cristallisation` et cree des index. Le probleme actuel n'est donc plus seulement l'absence de schema versionne : c'est aussi l'alignement du code Defis avec cette architecture multi-utilisateur.**

---

## 5) Nouveaux constats de l'audit du 01/09/2026

### Ecart critique H - Architecture Defis encore marquee par le mono-utilisateur

Constat :
- `lib/initDefisUser.js` contient encore des commentaires et requetes correspondant a une application sans authentification / sans `user_id` ;
- plusieurs requetes Defis/Journal/Badges visibles ne filtrent pas explicitement par utilisateur ;
- la base a pourtant evolue vers des tables possedant un `user_id`.

Impact :
- incoherence entre couche applicative et schema actuel ;
- dependance potentielle aux politiques RLS pour garantir l'isolation ;
- difficulte a raisonner proprement sur la propriete des donnees.

Important : **ce constat ne permet pas a lui seul d'affirmer une fuite inter-utilisateurs**. Les politiques RLS doivent etre auditees avant toute conclusion securitaire. Le besoin certain est d'aligner explicitement le moteur Defis avec le modele utilisateur actuel.

### Ecart critique I - Deux moteurs de progression / deux sources de logique metier

Constat :
- `lib/defisUtils.js` possede une fonction `validerEtapeDefi` faisant une progression simple et gerant notamment le badge ;
- `lib/journalDefisUtils.js` possede une autre fonction `validerEtapeDefi`, fondee sur un score d'engagement puis une progression ;
- les deux chemins ne portent pas exactement les memes effets metier.

Impact :
- risque de divergence de progression ;
- comportement de fin/recompense dependant du point d'entree ;
- maintenance et tests plus complexes.

Cible : **une seule autorite metier de progression**, avec des strategies de validation differentes mais un meme service de transition d'etat/recompense.

### Ecart majeur J - Deux definitions de "defi en cours"

Constat :
- `DefisContext` : `status === 'en cours'` ;
- page principale : logique fortement basee sur `progress > 0 && progress < duree`.

Impact : un meme defi peut etre classe differemment selon l'ecran.

Cible : machine d'etat unique + invariants clairs entre `status`, `progress`, `duree`.

### Ecart majeur K - Regle du nombre de defis actifs non tranchee

Documentation historique : un seul defi actif a la fois.

Code/concepts plus recents : `defisEnCours` est une collection et certains parcours specialises parlent de plusieurs defis actifs, notamment en cristallisation.

Ce point ne doit pas etre traite comme un bug sans decision produit. Il faut distinguer :
- defi principal/focal de l'utilisateur ;
- criteres ou mini-defis propres a une phase/programme ;
- eventuels defis secondaires.

### Ecart majeur L - Transversalite seulement partielle

Le contexte global et plusieurs composants existent, mais l'experience n'est pas encore uniformement reliee a toutes les zones pertinentes.

Cible historique confirmee :
- commencer un defi dans "Mes defis" ;
- le retrouver partout ou son contexte est pertinent ;
- pouvoir valider automatiquement ou declarativement depuis l'action reelle ;
- rafraichir immediatement progression/feedback ;
- terminer/recompenser sans incoherence entre ecrans.

### Ecart majeur M - Validation automatique insuffisante

Plusieurs defis demandent encore une saisie specifique alors que certaines preuves peuvent etre derivees de donnees deja saisies dans Mon Plan Vital.

Cible : architecture evenementielle permettant aux modules (repas, extras, routines, programmes...) d'emettre des faits exploitables par le moteur de defis.

Exemples de distinction :
- aliment/portion/extra enregistre : potentiellement verifiable automatiquement ;
- "j'ai verifie si j'avais vraiment faim" : declaratif ;
- intention/plaisir/ressenti : declaratif ou semi-assiste.

### Ecart majeur N - Moteur intelligent de recommandation non abouti

La documentation historique decrit deja une analyse de patterns et des suggestions personnalisees. Le cahier technique prevoit egalement l'adaptation aux signaux comme humeur, regularite, extras ou stagnation.

Le code actuel ne constitue pas encore un moteur general capable de :
1. detecter un besoin/opportunite ;
2. qualifier le contexte ;
3. choisir le bon type d'intervention ;
4. proposer un defi adapte si le defi est la bonne reponse ;
5. apprendre du resultat.

Le futur moteur ne doit donc pas etre "pattern = defi", mais :

`donnees -> pattern/contexte -> decision d'intervention -> eventuelle proposition de defi`.

### Ecart moyen O - Feedback/bandeau encore trop generique

`BandeauDefiActif` affiche essentiellement nom, progression, message motivationnel fixe et acces au journal.

Cible : feedback contextualise selon type de defi, progression, action realisee et contexte utilisateur, sans devenir intrusif.

### Ecart moyen P - Taxonomie des defis insuffisante

Les 10 defis actuels sont principalement alimentaires/comportementaux, alors que la notion de defi apparait aussi dans d'autres parcours.

Avant d'etendre le catalogue, definir une taxonomie claire :
- famille/domaine ;
- source (catalogue, utilisateur, recommandation, programme, anti-derive...) ;
- mode de validation (automatique, declaratif, hybride) ;
- unite de progression ;
- duree ;
- contexte d'activation ;
- recompense ;
- compatibilite avec defi focal / defis de programme.

---

## 6) Architecture cible recommandee

Ne pas fusionner les modules metier. Les rendre interoperables.

### Flux cible

`Donnees Mon Plan Vital`
-> `evenements/faits utilisateur`
-> `detection de patterns / opportunites`
-> `orchestrateur d'intervention`
-> `proposition de defi si pertinente`
-> `acceptation/refus utilisateur`
-> `instance de defi active`
-> `validation automatique / declarative / hybride`
-> `service unique de progression`
-> `feedback + journal + recompense`
-> `resultat reutilisable par l'intelligence globale`.

### Separation conceptuelle recommandee

A terme, distinguer au minimum :
- **definition de defi** : catalogue/referentiel ;
- **instance utilisateur** : defi accepte/cree, dates, etat, progression ;
- **regles de validation** : comment une etape est prouvee ;
- **journal/evenements** : preuves, notes, historique ;
- **source du defi** : manuel, recommandation, programme, anti-derive, etc. ;
- **recompense/resultat**.

Cette cible est une recommandation architecturale ; elle ne signifie pas qu'une migration massive doit etre faite immediatement.

---

## 7) Relation avec les autres modules

### Alimentation / repas / extras
- source majeure de faits et patterns ;
- peut permettre des validations automatiques ;
- peut declencher une suggestion, mais ne doit pas imposer un defi.

### Humeur / etat utilisateur
- doit moduler le timing, le ton et l'opportunite d'une proposition ;
- un etat fragile doit pouvoir diminuer les sollicitations challengeantes.

### Poids / trajectoire
- peut contribuer a la detection d'une stagnation ou d'un besoin d'ajustement ;
- ne doit pas etre utilise seul pour generer un defi.

### Ideaux
- domaine distinct ;
- peut fournir une direction ou du sens a certaines actions ;
- les fichiers Ideaux ne doivent pas devenir le moteur technique des Defis.

### Routines / actions
- peuvent etre la suite d'un apprentissage reussi pendant un defi ;
- ne sont pas le meme objet qu'un defi.

### Anti-derive / recentrage
- intervention immediate et bienveillante ;
- peut ouvrir ensuite vers un defi volontaire lorsque l'utilisateur est pret.

### Programmes / jeune / reprise / cristallisation
- peuvent proposer des defis ou criteres specifiques a leur phase ;
- necessitent une taxonomie explicite pour eviter de melanger "defi principal" et "criteres de programme".

---

## 8) Priorisation actualisee

### P0 - Integrite fonctionnelle et donnees

1. Rejouer les tests des ecarts historiques A/B du journal et confirmer leur statut reel.
2. Auditer RLS + ownership `user_id` pour `defis`, `journal_defis`, `badges` et tables specialisees.
3. Aligner toutes les lectures/ecritures Defis sur l'architecture utilisateur actuelle.
4. Definir une machine d'etat unique et ses invariants.
5. Unifier le service de progression/achevement/recompense.

### P1 - Coherence produit

6. Decider la semantique du demarrage (`progress = 0` ou premiere etape validee = 1).
7. Decider la regle defi focal / plusieurs defis et distinguer les defis de programme.
8. Remplacer toute donnee de demonstration (`Defi test`) par les vraies donnees ou masquer le composant.
9. Nettoyer progressivement `SaisieDefisDynamiques` sans supprimer les validations specialisees utiles.

### P2 - Experience transversale

10. Cartographier toutes les pages capables d'afficher/faire progresser un defi.
11. Connecter les faits deja connus par l'application aux validateurs automatiques.
12. Conserver une validation declarative pour les faits internes non observables.
13. Uniformiser feedback, progression et journal entre les ecrans.

### P3 - Intelligence

14. Construire la couche de detection de patterns a partir des donnees fiables existantes.
15. Construire un orchestrateur qui choisit l'intervention appropriee.
16. Ajouter la recommandation de defi avec acceptation/refus et timing adapte.
17. Reinjecter le resultat du defi dans la comprehension globale du parcours.

### P4 - Extension produit

18. Etendre le catalogue seulement apres stabilisation du moteur.
19. Ajouter les nouvelles familles de defis selon une taxonomie commune.
20. Renforcer gamification et recompenses sans rendre l'experience culpabilisante ou artificielle.

---

## 9) Matrice de maturite au 01/09/2026

| Capacite | Etat |
|---|---|
| 10 defis de referentiel | OK |
| Page Mes defis | OK |
| Disponibles / en cours / termines | OK mais logique d'etat a unifier |
| Defis personnalises | OK / a retester sur journal |
| Persistance Supabase | OK, alignement user_id a consolider |
| Contexte global React | OK |
| Journal | Present, contrats/progression a consolider |
| Validations specialisees | Partielles mais reelles |
| Presence repas/suivi | Partielle |
| Bandeau actif | Partiel + donnee de test restante |
| Source unique progression/statut | NON |
| Validation automatique depuis donnees app | Partielle / insuffisante |
| Adaptation a l'humeur/contexte | Non generalisee |
| Detection automatique du besoin | NON |
| Recommandation intelligente generalisee | NON |
| Regle unique sur nombre de defis actifs | NON - decision produit requise |
| Architecture explicitement user-scoped | A consolider |
| Resultat du defi reutilise par intelligence globale | NON |

---

## 10) Preuves / fichiers de reference

### Socle Defis
- `lib/defisReferentiel.js`
- `lib/initDefisUser.js`
- `lib/defisUtils.js`
- `lib/journalDefisUtils.js`
- `pages/defis.js`
- `pages/journal-defi/[id].js`
- `components/DefisContext.js`
- `components/DefisEnCoursBanner.js`
- `components/BandeauDefiActif.js`
- `components/JournalDefiPersonnalise.js`
- `components/SaisieDefisDynamiques.js`
- `components/SaisieDefiAlimentaire.js`

### Integrations
- `pages/_app.js`
- `pages/repas.js`
- `pages/suivi.js`
- `components/SaisieRepas.js`
- `components/RepasBloc.js`

### Documentation
- `docs/Cahier_des_charges.md`
- `docs/Cahier_technique.md`
- `docs/Synthese_Histoire_Projet.md`
- `docs/defis.md`
- `docs/Conformité defis`
- `docs/PLAN_IMPL_SUIVI_VALIDATION_DEFIS.md`
- `docs/PLAN_IMPL_Journal_Defis_Personnalises.md`
- `docs/SYSTEME_DEFIS_INTELLIGENTS_ET_EXPLOITATION_BDD.md`
- `docs/Plan_contre_laderive.md`
- `docs/TODO_CRISTALLISATION_PRIORITE.md`
- `docs/TODO_PARCOURS_JEUNE_PRIORITE.md`

### Donnees / migrations
- `scripts/01-add-user-id-columns.sql`
- migrations et politiques RLS a auditer avant implementation.

---

## 11) Conclusion operationnelle actualisee

Le module Defis n'est pas a reconstruire de zero. Il possede deja un socle fonctionnel important : referentiel, page dediee, defis personnalises, progression, persistance, contexte global, journal, validations specialisees et premieres integrations transversales.

Le probleme principal est desormais double :

1. **consolider le moteur existant** : contrats du journal, ownership utilisateur, machine d'etat, progression unique, recompenses et suppression des donnees de test ;
2. **achever la vision produit** : transformer le module isole en capacite transversale de Mon Plan Vital, capable d'utiliser les faits reels de l'application et, a terme, de proposer un defi lorsque celui-ci constitue la bonne intervention.

Les logs historiques restent conserves pour assurer la tracabilite. Aucun ecart ne doit etre marque "resolu" sans verification technique ou test fonctionnel correspondant.

### Ordre recommande avant implementation

**Sprint 0 : verification / securite / source de verite**
-> **Sprint 1 : consolidation moteur Defis**
-> **Sprint 2 : transversalite et evenements**
-> **Sprint 3 : validateurs automatiques/hybrides**
-> **Sprint 4 : detection/recommandation intelligente**
-> **Sprint 5 : extension du catalogue et gamification**.

# Plan d'action Defis — priorites et attendus

Date : 2026-09-01
Branche : `defis-N`
Document lie : `docs/etat_des_lieux_defis.md`

## Objectif

Ce document transforme l'etat des lieux consolide du module Defis en ordre d'execution concret. Il ne remplace aucun log historique : `docs/etat_des_lieux_defis.md` reste la source de tracabilite des constats et ecarts.

Principe directeur : **ne pas ajouter d'intelligence ou de nouveaux defis sur un moteur dont la progression, l'ownership utilisateur et les etats ne sont pas encore fiabilises.**

---

## Ordre global

1. Sprint 0 — Verification technique et securite des constats P0
2. Sprint 1 — Consolidation du coeur du moteur Defis
3. Sprint 2 — Regles produit, taxonomie et transversalite
4. Sprint 3 — Validation automatique / declarative / hybride
5. Sprint 4 — Detection et recommandation intelligente
6. Sprint 5 — Extension du catalogue, feedback et gamification

Chaque sprint possede des criteres de sortie. Le sprint suivant ne doit pas etre considere comme stabilise tant que les criteres critiques du precedent ne sont pas verifies.

---

# SPRINT 0 — Verification avant correction

Priorite : **P0 / immediate**

## But

Transformer les constats de l'etat des lieux en diagnostic executable avant de modifier le comportement existant.

## Travaux

### 0.1 Journal personnalise
Verifier par lecture + test :
- contrat reel de `chargerJournalDefi` ;
- consommation de `{ data, error }` ;
- usage de `eng.valide` vs `eng.tenu` ;
- retour reel de `validerEtapeDefi` ;
- attente UI `progressionIncrementee` / `newProgress` ;
- restauration d'un jour deja saisi ;
- validation du seuil >= 2/3 ;
- prevention d'une double validation ;
- incrementation reelle de la progression.

### 0.2 Ownership / authentification
Auditer :
- `defis` ;
- `defis_personnalises` ;
- `journal_defis` ;
- `badges` ;
- `defis_cristallisation` ;
- `journal_defi_cristallisation` ;
- colonnes `user_id` ;
- politiques RLS ;
- lectures/ecritures applicatives ;
- initialisation des 10 defis.

Ne pas conclure a une fuite de donnees sans preuve RLS. L'objectif est de savoir exactement ce qui est garanti par la BDD et ce qui doit etre explicite dans le code.

### 0.3 Machine d'etat / progression
Cartographier toutes les valeurs et regles :
- `en attente` ;
- `disponible` ;
- `en cours` ;
- `termine` ;
- `progress = 0` ;
- `progress = 1` au demarrage ;
- filtres de `pages/defis.js` ;
- calcul de `defisEnCours` dans `DefisContext`.

### 0.4 Deux moteurs de progression
Comparer les effets metier de :
- `lib/defisUtils.js` ;
- `lib/journalDefisUtils.js`.

Identifier : progression, fin, badge, journal, rafraichissement UI, erreurs et idempotence.

### 0.5 Donnees de test / code historique
Confirmer :
- bandeau `Defi test` ;
- code mort reel vs composants specialises encore utilises ;
- references non definies ;
- integrations actives repas/suivi.

## Livrable Sprint 0

Mise a jour de `docs/etat_des_lieux_defis.md` avec, pour chaque ecart :
- `CONFIRME` ;
- `DEJA CORRIGE` ;
- `PARTIEL` ;
- `NON REPRODUIT` ;
- preuve/fichier/test associe.

## Critere de sortie

Aucune correction P0 n'est lancee sur une hypothese non verifiee. La liste exacte des modifications du Sprint 1 est connue.

---

# SPRINT 1 — Consolidation du coeur du moteur Defis

Priorite : **P0**

## But

Obtenir un moteur fiable avant toute extension fonctionnelle.

## Travaux

1. Definir une machine d'etat unique.
2. Definir une semantique unique de progression.
3. Creer une seule autorite metier pour :
   - valider une etape ;
   - incrementer ;
   - terminer ;
   - attribuer la recompense ;
   - empecher la double validation.
4. Faire converger `defisUtils` et `journalDefisUtils` vers cette autorite sans supprimer les strategies de validation necessaires.
5. Corriger les contrats Journal/UI confirmes au Sprint 0.
6. Aligner toutes les donnees Defis sur le compte utilisateur et les garanties RLS retenues.
7. Remplacer/supprimer le faux `Defi test` dans l'interface.
8. Garantir un rafraichissement coherent du contexte global apres mutation.

## Attendu utilisateur apres correction

Scenario de reference :

`Je choisis un defi -> je le demarre -> il est actif -> je realise une etape -> une seule progression est enregistree -> tous les ecrans affichent la meme valeur -> derniere etape -> defi termine -> recompense une seule fois -> historique conserve.`

La deconnexion/reconnexion ne doit pas faire perdre l'etat du defi du compte.

## Critere de sortie

- aucune divergence connue entre `status` et progression ;
- une seule logique de transition d'etat ;
- journal fonctionnel ;
- double validation bloquee ;
- recompense non dupliquee ;
- donnees rattachees au bon utilisateur ;
- plus de donnee de demonstration presentee comme defi reel.

---

# SPRINT 2 — Regles produit, taxonomie et transversalite

Priorite : **P1 / P2**

## But

Faire du defi une capacite transversale sans fusionner les autres modules de Mon Plan Vital.

## Decision produit cible a formaliser

Recommandation :
- **1 defi principal/focal volontaire actif** ;
- possibilite de micro-defis/criteres lies a un programme ;
- ces criteres de programme ne doivent pas etre confondus avec le defi principal.

Cette recommandation doit etre validee avant implementation definitive.

## Taxonomie minimale

Chaque definition/instance doit pouvoir porter :
- domaine ;
- source ;
- duree ;
- unite ;
- mode de validation ;
- contexte d'activation ;
- programme eventuel ;
- recompense ;
- compatibilite avec un defi focal.

`validation_mode` cible :
- `automatic` ;
- `declarative` ;
- `mixed`.

## Transversalite

Cartographier et connecter uniquement les zones pertinentes :
- Mes defis ;
- tableau de bord/accueil ;
- repas ;
- suivi ;
- extras ;
- routines ;
- programmes ;
- autres pages uniquement lorsqu'elles peuvent afficher ou produire une information utile au defi.

## Critere de sortie

Un defi commence dans `Mes defis` est retrouve avec la meme progression dans toutes les zones pertinentes, sans bandeau artificiel sur les pages sans rapport.

---

# SPRINT 3 — Validation automatique, declarative et hybride

Priorite : **P2**

## But

Eviter de redemander a l'utilisateur une information que Mon Plan Vital connait deja.

## Architecture cible

Les modules emettent des faits/evenements exploitables, par exemple :
- `MEAL_LOGGED` ;
- `EXTRA_LOGGED` ;
- `MOOD_RECORDED` ;
- `WEIGHT_RECORDED` ;
- `ROUTINE_COMPLETED` ;
- `PROGRAM_STEP_COMPLETED`.

Le moteur Defis ne doit pas obliger chaque page a connaitre toute la logique interne de chaque defi.

## Pilotes recommandes

### Pilote A — `💧 1 cru par jour`
Mode cible : automatique lorsque les donnees repas permettent de prouver la condition.

### Pilote B — `💡 J'ecoute mon ventre`
Mode cible : declaratif, car l'application ne peut pas connaitre seule le ressenti de satiete.

Ces deux pilotes servent de patrons techniques avant migration des autres defis.

## Critere de sortie

- une preuve observable peut valider automatiquement sans double saisie ;
- une information subjective reste confirmee par l'utilisateur ;
- les deux chemins utilisent le meme service de progression du Sprint 1.

---

# SPRINT 4 — Detection et recommandation intelligente

Priorite : **P3**

## But

Realiser la vision historique des defis intelligents sans transformer chaque anomalie en challenge.

## Pipeline cible

`Donnees -> Pattern -> Contexte -> Decision d'intervention -> Proposition de defi eventuelle`

Interventions possibles :
- aucune ;
- feedback ;
- recentrage ;
- action simple ;
- adaptation d'un programme ;
- proposition de defi.

## Regles essentielles

- pas de defi impose automatiquement ;
- acceptation/refus utilisateur ;
- prise en compte de l'humeur et de la dynamique ;
- limiter les sollicitations en contexte fragile ;
- eviter les propositions repetitives ;
- commencer par des regles deterministes explicables avant d'utiliser une IA generative pour inventer des defis.

## Critere de sortie

L'application est capable de detecter un pattern fiable, de decider qu'un defi est l'intervention appropriee, puis de proposer un defi existant adapte avec possibilite de refuser ou reporter.

---

# SPRINT 5 — Extension du catalogue et gamification

Priorite : **P4**

## But

Etendre le produit seulement une fois le moteur stable.

## Axes

- alimentation ;
- comportement ;
- mouvement ;
- mindset / developpement personnel ;
- gestion des automatismes ;
- autres familles justifiees par les parcours Mon Plan Vital.

## Recompense cible

Le badge peut rester, mais la recompense doit aussi rendre visible une preuve de progression personnelle.

Exemple de principe :
`Defi termine -> ce que tu as concretement reussi -> capacite que tu as exercee -> encouragement pour la suite.`

Le resultat du defi pourra ensuite enrichir la comprehension globale du parcours utilisateur.

## Critere de sortie

Le catalogue peut grandir sans creer un nouveau moteur ou un composant specifique complet pour chaque nouveau defi.

---

# Definition de l'etat final attendu

A terme :

`Mon Plan Vital observe les faits reels -> comprend certains patterns -> choisit l'intervention appropriee -> propose un defi uniquement lorsqu'il est pertinent -> l'utilisateur accepte/refuse -> le defi accompagne les ecrans concernes -> les preuves observables sont validees automatiquement -> les ressentis restent declaratifs -> une progression unique est visible partout -> la fin et la recompense sont coherentes -> le resultat enrichit la suite du parcours.`

## Regle de developpement

**Ne pas commencer par l'IA ni par l'ajout massif de nouveaux defis.**

Le prochain chantier executable est **Sprint 0 — verification technique**, puis seulement les corrections confirmees du Sprint 1.

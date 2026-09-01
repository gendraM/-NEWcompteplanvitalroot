# Sprint 0 — Verification technique Defis

Date : 2026-09-01
Branche : `defis-N`
Projet : Mon Plan Vital

Ce document fige les constats verifies avant toute correction du Sprint 1. Il complete `docs/etat_des_lieux_defis.md` et `docs/PLAN_ACTION_DEFIS_2026-09-01.md` sans supprimer les logs historiques.

## Resultats verifies

| Point | Statut | Preuve / constat |
|---|---|---|
| A — contrat `chargerJournalDefi` | CONFIRME | `chargerJournalDefi()` retourne `{ data, error? }` tandis que `JournalDefiPersonnalise` consomme le retour comme le journal direct. |
| A — `valide` vs `tenu` | CONFIRME | Le composant coche `eng.valide`; les fonctions de score lisent `eng.tenu`. |
| B — contrat retour validation | CONFIRME | L'UI attend `progressionIncrementee` et `newProgress`; `journalDefisUtils.validerEtapeDefi()` retourne `success` et `etapeValidee`. |
| C/J — machine d'etat | CONFIRME | `pages/defis.js` classe par `progress`; `DefisContext` classe par `status === 'en cours'`. |
| D — progression au demarrage | CONFIRME | Defi classique : `progress=1`; defi personnalise/alimentaire : `progress=0`. |
| E — donnees de demonstration | CONFIRME ET PLUS LARGE | `Defi test` est present dans `/defis`, `/repas` et `/suivi`. |
| F — dette `SaisieDefisDynamiques` | CONFIRME | Plusieurs validateurs sont utiles, mais le fichier contient encore des references historiques fragiles, dont `setQuantite` sans etat local correspondant visible dans les composants concernes. |
| H — ownership utilisateur | CONFIRME | Le code `defis-N` contient encore des hypotheses mono-utilisateur. Les tables Defis principales possedent `user_id`, mais les politiques RLS actuelles sont permissives (`ALL`, condition `true`). |
| H — table `badges` | CONFIRME | `badges` ne possede pas actuellement de colonne `user_id` dans la BDD verifiee. |
| I — deux moteurs de progression | CONFIRME | `defisUtils.js` et `journalDefisUtils.js` incrementent tous deux la progression avec des effets metier differents. |
| Double validation journal | CONFIRME PAR LECTURE | Aucun verrou d'idempotence ne protege une meme journee deja validee avant une nouvelle incrementation. |
| Etat BDD reel | CONFIRME | La BDD contient un defi `status='en cours'` avec `progress=0`, preuve concrete que les deux definitions d'etat divergent. |
| `user_id` sur donnees Defis existantes | PARTIELLEMENT SAIN | Les 11 lignes `defis` presentes sont rattachees a un `user_id`, mais cela ne remplace pas une RLS restrictive. |
| `journal_defis` actuel | AUCUNE DONNEE A TESTER | La table etait vide lors de la verification; les anomalies du journal sont donc confirmees par le code mais pas rejouees sur un historique existant. |
| Jour du journal | CONFIRME FRAGILE | `/journal-defi/[id].js` calcule `jourActuel` depuis `created_at`, qui n'est pas necessairement la vraie date de demarrage. |

## Decision de passage au Sprint 1

Les anomalies P0 necessaires sont suffisamment confirmees pour commencer les corrections. L'ordre retenu est :

1. ownership / securite utilisateur ;
2. machine d'etat et semantique de progression ;
3. service unique de progression ;
4. contrat et idempotence du journal ;
5. recompense unique ;
6. suppression des donnees `Defi test` ;
7. nettoyage cible des validateurs specialises ;
8. synchronisation du contexte global et tests de non-regression.

## Scenario de sortie Sprint 1

`Choisir un defi -> demarrer a 0 -> le defi devient actif -> valider une preuve -> progression 1 -> meme valeur partout -> impossible de compter deux fois la meme preuve -> derniere etape -> statut termine -> recompense une seule fois -> etat conserve apres reconnexion.`

Aucune extension IA/catalogue ne doit commencer avant validation de ce scenario.

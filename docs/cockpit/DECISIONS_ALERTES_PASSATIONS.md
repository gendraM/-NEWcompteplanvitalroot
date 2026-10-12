# Cockpit — Décisions, alertes et passations

Date : 2026-10-12. Aucun déclencheur automatique installé.

## Décisions et autorisations

| ID | Sujet | État | Décision / condition |
|---|---|---|---|
| DEC-001 | Principe reprise | VALIDÉ PAR UTILISATRICE LE 12/10/2026 | Reprendre les chantiers en l’état sans demander à l’utilisatrice de clôturer manuellement toutes les conversations. |
| DEC-002 | Préservation code | RÈGLE EXISTANTE MAINTENUE | Ne pas toucher main ; aucun merge, suppression, remplacement, conflit destructif ou perte fonctionnelle sans autorisation explicite. |
| DEC-003 | Affectations historiques | CADRAGE TECHNIQUE | Les anciens chats ne sont pas des agents actifs interrogeables. Leur propriétaire est historique ; leur disponibilité reste non confirmée. |
| DEC-004 | Publication centrale | AUTORISÉE LE 12/10/2026 | Publication documentaire uniquement sur `cockpit-wbs-phase2`, depuis le SHA initial de `main-consolidation`. Aucun merge, aucune modification du code applicatif. |
| DEC-005 | Sécurité données | EN ATTENTE D’ARBITRAGE POUR CORRECTION | Ne pas corriger RLS, secrets, protection branches sans audit d’impact et permission. |
| DEC-006 | Ordre produit final | PROPOSITION | L’ordre P0/P1/P2 établi est une proposition technique de risque et dépendances, pas une priorisation produit gravée dans le marbre. |

## Alertes de démarrage

| ID | Niveau | Description | Action |
|---|---|---|---|
| ALERT-SEC-01 | P0 | Présence de secret plausible dans historique public Git; NE PAS afficher de valeurs | Audit discret, déterminer rotation/assainissement, demande GO avant modification |
| ALERT-SEC-02 | P0 | Table propriétaire accessible via rôle anon alors que RLS désactivée | Analyse d’impact, plan rollback, GO explicite avant toute DDL |
| ALERT-INT-01 | P0 | PR conflictuelle, suppression, réécriture de données, ou contrat métier incompatible | STOP ciblé et rapport de conflit, aucune résolution destructive sans autorisation |
| ALERT-INT-02 | P1 | Nouvel échec de test/build ou test obsolète sur branche en attente | Identifier job/SHA/test et proposer correction ciblée, ne pas supprimer de données |
| ALERT-INT-03 | P1 | Déploiement READY absent ou SHA Vercel différent du HEAD cible | Rapport branch/SHA cible, attendre READY correct avant QA |
| ALERT-WBS-01 | P1 | Commit/PR sans propriétaire, critères READY, rapport ou dépendance | Mettre en quarantaine administrative la livraison jusqu’à clarification |
| ALERT-WBS-02 | P1 | Deux agents prétendent écrire simultanément les mêmes fichiers/branche | STOP les écritures concurrentes ; identifier propriétaire canonique |
| ALERT-UX-01 | P1 | PR prête au merge sans test utilisateur requis ou avec preuve de build seule | Marquer À TESTER et demander preuve correspondante |

## Matrice de reprise des conversations

| Domaine | Conversation propriétaire historique | Mission du cockpit |
|---|---|---|
| Gouvernance du cockpit | Présente conversation — Cockpit Mon Plan Vital (pilote de conception, non exécutant permanent) | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Sécurité et droits d’accès | Non attribué — supervision sécurité / intégration | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Intégration et non-régression | MAIN CONSO/Chat ; Archives/Gestion consolidation vers Main/Work | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Authentification, profil et poids | Chantiers Supabase/Auth historiques — conversation active inconnue | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Suivi alimentaire et repas | État des lieux persistance repas/Work ; chantier Plan alimentaire intelligent | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Plan alimentaire, planification et recettes | Conversations Planification / lot 2.3 ; planification-gamification | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Référentiel, QN et calories | Chantier Référentiel alimentaire — titre exact/activité non certifiés | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Extras et constance | Suite/Extras/Work | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Fast-food | Audit gestion fast food | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Idéaux et paliers | Work/ chantier IDÉAUX | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| My Way et Align-Life | Validation P5.4 Align-Life (strictement distinct d’Idéaux) | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Défis V2 | Conversation spécialisée Défis V2 — identification exacte non vérifiée | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Tableau de bord V2 | Chantier tableau de bord V2 — conversation exacte non vérifiée | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Interruptions et reconstitution | État des lieux persistance repas/Work ; gestion des périodes | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Préparation et jeûne | Conversations Jeûne / Préparation — propriétaires historiques multiples | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Reprise alimentaire | Conversations Reprise alimentaire — propriétaires historiques multiples | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Cristallisation | Conversations Cristallisation — historique partiel | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |
| Bilans hebdomadaires et mensuels | Chantiers Bilan hebdo / Bilan mensuel — propriétaire actuel inconnu | Identifier la dernière passation datée puis affecter une tâche traçable ; état d’activité **non confirmé** |

## Fiche obligatoire de passation agent

```text
ID WBS :
Périmètre métier et règle validée :
Propriétaire confirmé :
Branche isolée / destination interdite :
HEAD vérifié avant intervention :
Fichiers autorisés / exclus :
Dépendances et autres conversations susceptibles de toucher ces fichiers :
Autorisation explicite disponible :
Audit des risques et plan de non-régression :
Action exécutée / fichiers modifiés :
SHA final et lien PR (draft si autorisée) :
Tests exécutés + résultat + logs :
Déploiement Vercel et SHA exact (READY ou non) :
Validation de comportement réellement faite :
Écart / incident / rollback éventuel :
Prochaine action et responsable :
Décision demandée à la responsable produit :
```

## Ordre de reprise conseillé, sans effectuer de merge

1. **Sécurité sans mutation** : classifier `.env.local` et droits anonymes/RLS, déterminer exposition et plan corrigé ; demander accord avant toute intervention.
2. **Base de traçabilité** : publier cockpit dans une branche dédiée si autorisé ; désigner futur emplacement canonique.
3. **Référentiel et CI** : examiner 616/674 et rétablir les contrôles avant des intégrations alimentaires ; aucune suppression.
4. **Retrouver les acquis** : dédoublonner Idéaux #12/#13, puis Extras #10, périodes #8, Défis #9 (travaux potentiellement parallélisables en audits sans écriture).
5. **Brancher les modules divergents** : Plan alimentaire, Align-Life, Fast-food, dashboard après stabilisation des contrats et validations.
6. **Roadmap future** : GROW, coûts courses, dynamique cristallisation, nouvelles gamifications seulement lorsque les dépendances sont franchies.

## Décision utile demandée en fin de phase 2

Publication documentaire autorisée et réalisée sur la branche dédiée `cockpit-wbs-phase2`. Aucune PR, aucun merge et aucune modification applicative effectués.

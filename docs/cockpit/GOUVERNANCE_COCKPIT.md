# Cockpit Mon Plan Vital — Gouvernance et protocole des agents

**Version :** 2026-10-12 · **Statut :** documentation publiée sur branche dédiée ; autorisations techniques A/B/C toujours distinctes et limitées.

## Finalité

Réduire au minimum les sollicitations de la responsable produit pour les tâches déjà décidées : diagnostics, comparaisons Git, tests, compilation, vérification Vercel, rédaction des bilans et préparation de PR.

Cela **n’autorise pas à son insu** les actes irréversibles ou sensibles.

## Source de vérité

- `REGISTRE_COCKPIT_MPV.json` : état normalisé, preuve, branche, PR, dépendances, responsables et critères READY.
- `WBS_MAITRE_MON_PLAN_VITAL.md` : lecture humaine du portefeuille.
- `DECISIONS_ALERTES_PASSATIONS.md` : arbitrages, blocages, protocole de handoff.
- Les faits live restent GitHub/Vercel/Supabase : le registre est une photographie mise à jour depuis ces sources.
- Chaque action doit lier la source métier de référence. Un vieux TODO n'est jamais une preuve d’absence de code.

## États et leurs sens

`À QUALIFIER` (état supplémentaire du cockpit) : état réel non encore prouvé, **ne pas interpréter comme absence de code**.
`CONCEPTION` : intention ou contrat encore à définir.
`À PRODUIRE` : périmètre suffisamment spécifié et aucune preuve d’exécution complète.
`EN COURS` : exécution explicitement engagée et attestée par activité datée, **jamais présumée grâce à une ancienne conversation**.
`À TESTER` : code/activité présents, une vérification requise.
`READY` : intégration et preuves techniques + comportementales conformes.
`LIVE` : effectivement exposé à l’utilisateur final en production correspondante.
`OBSERVATION` : retours du réel collectés.
`STABILISÉ` : corrections importantes issues du réel et contrôle de non-régression terminés.

Les trois dimensions restent distinctes : **développement / intégration / QA**, chacune avec ses preuves et SHAs.

## Delegation A/B/C

**A — Autonomie lecture seule** : comparer des branches, détecter conflits, documenter écarts, proposer correctifs, auditer logs et tests, mettre à jour un rapport **hors code** dans un espace autorisé.

**B — Exécution cadrée et autorisée** : développement déjà spécifié et audit de risque validé, modifications uniquement sur la branche de travail allouée, commits avec SHA contrôlé, tests puis PR draft. Les anciennes règles 'aucun commit sans accord explicite' restent en vigueur tant qu'une politique d'autorisation répétée n'a pas été décidée ; le niveau B n’est donc pas, à lui seul, une permission de coder.

**C — Décision réservée** : nouvelle règle métier, dérogation au cahier, secrets, migration, RLS, changements de protection branches, suppression de code ou données, fusion, mise en production, changement de canon ou conflit entre deux spécifications validées. Attendre un GO spécifique.

## Règles de base impératives

1. `main` n’est jamais modifiée automatiquement.
2. `main-consolidation` n’est jamais réécrite ou fusionnée sans autorisation expresse.
3. Aucune perte fonctionnelle ni sur la branche source ni dans la consolidation ; évaluer les deux côtés avant toute résolution.
4. Aucune suppression ou remplacement arbitraire ; demander l’accord en présentant lignes/impact/alternatives.
5. Reprendre HEAD réel, vérifier SHA/conditions avant **chaque** modification autorisée.
6. Ne pas créer de nouveau développement sans vérifier s'il existe déjà en conso ou dans une autre branche.
7. L'agent de développement n'est pas seul certificateur de son travail : tests/revue indépendants avant READY.
8. Vercel READY doit correspondre au **SHA exact** attendu ; preuve de comportement requise séparément.
9. Une tâche de sécurité identifiée ne donne pas l'autorisation de lire/afficher des secrets ou de modifier des données privées.
10. En cas de double propriétaire ou conflit entre conversations, arrêt **des seules écritures concernées** jusqu'à désignation claire.

## Attribution et protocole de prise en charge

1. Le cockpit choisit une action WBS en tenant compte du risque et des dépendances.
2. Il identifie une branche et un périmètre de fichiers **exclusifs** ; pas de chevauchement avec une conversation spécialisée active.
3. La fiche de mission comporte ID, source métier, acceptation, HEAD, risque, tests, autonomie, interdictions et format de compte-rendu.
4. Le travail technique est confié à Work/Codex (ou conversation explicitement désignée), sans présumer qu’une conversation historique peut être démarrée à distance.
5. Le compte rendu publié dans l’espace partagé contient : ID, fichiers touchés, SHA source/fin, tests exacts, statut build, URL Vercel, PR, incidents, migrations, validations requises.
6. Le cockpit actualise le WBS à partir des preuves et sollicite l'utilisatrice seulement sur le niveau C ou risque non réconciliable.
7. Une nouvelle conversation commence par lire la dernière version du registre et le chantier assigné.

## Contrôle qualité de passage

| Passage | Preuve requise |
|---|---|
| CONCEPTION → À PRODUIRE | Accord explicite si contrat métier nouveau; critères READY testables |
| À PRODUIRE → EN COURS | Agent assigné, branche exclusive et autorisation de code/commit si concerné |
| EN COURS → À TESTER | Commit SHA, liste fichiers, audit risque, tests locaux et PR draft si autorisée |
| À TESTER → READY | CI verte correspondant au SHA, Vercel READY, contrôle des données et test fonctionnel approprié |
| READY → LIVE | Mise en production explicitement autorisée et SHA production vérifié |
| LIVE → OBSERVATION | Retours datés et taux d'erreurs collectés |
| OBSERVATION → STABILISÉ | Régressions corrigées, comportement stable, analyse des retours |

## Règles d'alertes

- **P0** : action prioritaire de contrôle ou d'isolation; signal critique concernant confidentialité, intégrité ou déploiement; aucune correction destructive sans feu vert.
- **P1** : échec CI, PR bloquée, conflit entre propriétaires, décalage SHA, régression possible, expiration d’un critère prêt.
- **P2** : amélioration UX, documentation, évolution métier non urgente.
- Les alertes doivent être fondées sur un événement daté, non sur un silence d'une conversation.
- À partir du statut **STOP** : interdiction d'écriture dans le périmètre concerné, rapport des options, demande de décision.

## Limitations de capacité actuelles

- Ce chat n’est pas un orchestrateur serveur continu et ne peut pas écrire aux anciennes conversations ni vérifier leur état en arrière-plan.
- Les automatisations ChatGPT peuvent lancer des contrôles **planifiés** et Work/Codex peuvent réaliser les tâches compatibles, après configuration et autorisation.
- La coordination inter-agents exige un registre partagé (GitHub issues/docs, puis éventuellement un pipeline d'orchestration); ces fichiers locaux sont une première version, pas encore l'installation de cette infrastructure.

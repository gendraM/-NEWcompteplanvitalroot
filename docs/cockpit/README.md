# Mon Plan Vital — Cockpit de pilotage (Phase 2)

**Référence :** 12 octobre 2026. **Branche documentaire :** `cockpit-wbs-phase2`, créée au départ du commit `23f27e3b59f0ea6a3e3f987a1c433602a0fba6bb` de `main-consolidation`.

Ce dossier est la **source de référence documentaire partagée** pour la reprise méthodologique et les passations. Il ne signifie ni que les agents sont actifs, ni que les automatisations sont installées.

1. `WBS_MAITRE_MON_PLAN_VITAL.md` — vision du portefeuille, domaines et actions.
2. `REGISTRE_COCKPIT_MPV.json` — fiches structurées des 53 actions, branches, PR, dépendances, états et critères READY.
3. `GOUVERNANCE_COCKPIT.md` — statuts, délégation A/B/C, validations, non-régression et protection de la production.
4. `DECISIONS_ALERTES_PASSATIONS.md` — décisions, alertes, règles de transfert et modèles de rapports d'agents.

**Utilisation :** commencer par rechercher l'ID de l'action dans le WBS/JSON, vérifier les SHAs réels de GitHub et les preuves Vercel/Supabase, lire les dépendances, puis agir uniquement selon le niveau d'autonomie **effectivement autorisé**.

**Ne pas confondre :** la branche GitHub conserve ces documents; elle ne lance pas automatiquement les anciennes conversations ni Codex/Work. Aucun merge de `main` ou `main-consolidation` n'est autorisé par cette publication.

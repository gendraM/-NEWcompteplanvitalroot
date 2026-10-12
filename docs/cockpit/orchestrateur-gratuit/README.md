# Cockpit Mon Plan Vital — Amorçage gratuit (sans API d'IA)

**Statut actuel : PRÉPARÉ, NON ACTIVÉ EN GITHUB ACTIONS.** Ce dossier vit sur `cockpit-wbs-phase2` ; aucune tâche GitHub Actions planifiée ne démarre à partir de cette branche, car les workflows `schedule` requièrent la branche par défaut.

## Ce qui fonctionne dès maintenant
- WBS + suivi GitHub Issues #14–#17 publiés.
- Une tâche ChatGPT `Cockpit Mon Plan Vital` surveille quotidiennement les progrès (lecture seule), sous réserve des droits et de sa première exécution réelle.
- Zéro clé OpenAI API, zéro recharge et aucune facturation de modèles autorisée.
- Aucune écriture dans `main`, `main-consolidation`, Supabase ou Vercel.

## Installer le contrôleur GitHub automatique (option à 0 € dans le quota)

**Une action de création du dépôt privé par la propriétaire est nécessaire.** Le connecteur GitHub utilisé ici ne permet pas de créer un nouveau dépôt. Ne créez pas de dépôt public : bien que le code de ce contrôleur soit sans secret, nous préférons un lieu distinct et privé pour les futures configurations.

1. Créer un dépôt privé GitHub, p. ex. `gendraM/mpv-cockpit-runner`, initialisé avec un README. Ne pas modifier les branches du dépôt applicatif.
2. Copier `scripts/cockpit-watch.mjs` à la racine du nouveau dépôt sous `scripts/cockpit-watch.mjs`.
3. Copier `workflows/cockpit-watch.yml` sous `.github/workflows/cockpit-watch.yml` du **nouveau dépôt**, sur sa branche par défaut.
4. Le contrôleur se déclenchera chaque jour et peut aussi être lancé manuellement depuis GitHub Actions.
5. Vérifier l'onglet Actions et télécharger le rapport `cockpit-report.json` produit par l'exécution. Le contrôleur lit uniquement le dépôt public Mon Plan Vital via GitHub REST ; aucune permission d'écriture dans le dépôt applicatif n'est fournie.
6. Désactiver le workflow du dépôt privé pour stopper l'exécution à tout moment.

## Coûts / sécurité
- GitHub Free fournit un quota de minutes sur dépôt privé (2 000 minutes/mois, quota commun à tous les dépôts privés du compte), sous réserve des limites et paramètres de facturation. Ce workflow utilise `ubuntu-latest`, un seul job, maximum 5 min, une fois par jour, et une rétention de rapport de 3 jours. **Il n'emploie aucun modèle IA.**
- Ne PAS ajouter `OPENAI_API_KEY` au repo ou à ce workflow. L'agent de codage autonome utilisant Codex Action nécessite une API payante et reste volontairement **désactivé**.
- Vérifier les paramètres GitHub Billing/Actions et mettre un budget strict **0 $ de dépassement** (si disponible). S'il existe déjà un moyen de paiement, ne pas supposer que le dépassement sera automatiquement bloqué.
- Le `GITHUB_TOKEN` de ce workflow appartient au nouveau dépôt ; on ne lui donne que `contents: read`, et on n'utilise jamais de PAT donnant accès en écriture à Mon Plan Vital.
- Aucune écriture en GitHub Issues : le JSON et le résumé GitHub Actions constituent les preuves. Le déclenchement des agents Codex/Work n'est pas activé.

## Validation de reprise
Consulter le rapport pour `main`, `main-consolidation`, `cockpit-wbs-phase2`, les Issues #14–#17, les PR ouvertes et les échecs récents d'Actions. Les décisions métier **non écrites** doivent encore être recherchées par un agent (Work ou ChatGPT accessible), et ne sont jamais présumées commitées.

## Ce qui reste à faire
- Activer cette surveillance GitHub Actions via un dépôt privé.
- Construire un flux de décision/triage automatisé réellement partagé avec le WBS (sans doublons).
- Évaluer un exécuteur IA à coût nul s'il en existe un réellement utilisable et autorisé par le fournisseur ; sans clé API, Codex Action ne fonctionnera pas tout seul.
- Soumettre un protocole d'exécution de niveau B, d'autorisation et de budget avant tout code généré automatiquement.

**Documentation GitHub officielle** : https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax et https://docs.github.com/en/billing/concepts/product-billing/github-actions .

# 📋 ÉTAT DES LIEUX — Cycle "Préparation Jeûne" / "Jeûne" / "Reprise"

**Document de passation généré le 08/08/2026**
**Branche courante analysée :** `PREPA-JEUNE` (à jour avec `origin/PREPA-JEUNE`)
**But :** recréer le contexte perdu et permettre une reprise immédiate du développement.

> Ce document a été reconstruit par analyse du code réel, des diffs Git non commités, des ~150 fichiers `docs/*` liés au jeûne, et des historiques d'anomalies. Il fait foi tant qu'un nouveau document de passation ne le remplace pas.

---

## 1. Résumé exécutif

Le projet est une application de suivi alimentaire/spirituel avec un "cycle jeûne" en 4 grandes étapes :

```
PRÉPARATION (30j) → JEÛNE (X jours) → REPRISE ALIMENTAIRE → CRISTALLISATION (post-reprise)
```

Contrairement à l'audit `docs/audit prepap jeune a jour fevrier` (Feb 2026) encore présent dans le repo, **plusieurs points qu'il jugeait "NON FONCTIONNELS" ont depuis été corrigés**. Le document le plus à jour et le plus fiable sur la stratégie est :
📄 **[docs/PLAN_ACTION_MISE_EN_CONFORMITE_PREPA_JEUNE_2026-06-29.md](docs/PLAN_ACTION_MISE_EN_CONFORMITE_PREPA_JEUNE_2026-06-29.md)** (validé par l'utilisateur, daté du 29/06/2026), qui découpe le travail restant en 4 phases. **Nous sommes en plein milieu de la Phase 1** de ce plan (voir section 3).

---

## 2. Bilan de santé — fonctionnalité par fonctionnalité

### ✅ Fonctionnel et vérifié dans le code actuel

| Fonctionnalité | Preuve dans le code |
|---|---|
| **Synchronisation cloud Supabase de la préparation** | [pages/preparation-jeune.js](pages/preparation-jeune.js) appelle bien `savePreparationJeuneSupabase` (sauvegarde à chaque validation de critère + à l'archivage) et `getPreparationJeuneSync` (comparaison cloud/local via `updatedAt`). *L'audit de février disait le contraire : ce point a été résolu depuis.* |
| **Archivage final de la préparation** | Deux chemins d'archivage existent dans `preparation-jeune.js` : bouton "Démarrer mon jeûne" (archive automatiquement + insère une ligne dans la table `jeune`) et un bouton "Archiver" dédié qui réinitialise le workflow. Utilise `ajouterPreparationHistorique` + `savePreparationJeuneSupabase`. *Là aussi, contrairement à l'audit de février, c'est implémenté.* |
| **Gestion de la corbeille (historique)** | `lib/preparationsJeune.js` : `supprimerPreparationHistorique`, `restaurerPreparationJeune`, `supprimerPreparationJeuneDefinitivement` — logique complète, clé `preparationsJeuneSupprimees`. |
| **Page Historique (`/historique-preparations-jeune`)** | Affiche `HistoriquePreparationsModal` avec onglets Historique/Corbeille, redirection via `useRouter`. **Mais lit uniquement le localStorage** (`getHistoriquePreparationsJeune()`), pas la version cloud — voir gap ci-dessous. |
| **Critères interactifs 3 & 6** | Dropdowns / radio buttons + tracker de jeûnes courts, validation auto quand complété. |
| **Validation automatique de critères depuis `/suivi.js`** | Détection auto des critères 1, 2, 7, 8, 9 (portions, féculents, hydratation, horaires) — couverte par [tests/validerCriterePreparation.auto.test.js](tests/validerCriterePreparation.auto.test.js) (6 tests, tous ✅). |
| **Intégration Supabase poids/repas dans `/jeune.js`** | `getPoidsDepart()` et `getRepasRecents()` interrogent réellement Supabase (fallback `72.4` uniquement si aucune donnée) — le point P0.2/P0.3 du vieux `TODO_PARCOURS_JEUNE_PRIORITE.md` est en réalité déjà traité. |
| **Auth Supabase (infra)** | D'après `docs/AUDIT_MIGRATION_AUTH_SUPABASE_2026-02-14.md` : infrastructure auth 100%, migration BDD 100%, RLS activée 100%. |

### ⚠️ Incomplet / stub / partiel

| Fonctionnalité | Constat |
|---|---|
| **Historique avancé (statistiques, comparaison, notes perso)** | `lib/statistiquesPreparationsJeune.js`, `lib/comparePreparationsJeune.js`, `lib/notesPreparationJeune.js` sont **des fichiers vides ne contenant qu'un commentaire** `// À compléter selon le plan d'implémentation validé`. `components/DetailPreparationJeune.js` est un **stub** (`<div>{/* À implémenter */}</div>`). C'est exactement la **Phase 3** du plan de conformité de juin, non commencée. |
| **Historique consultable uniquement en local** | `/historique-preparations-jeune.js` ne relit jamais `getHistoriquePreparationsJeuneSupabase(userId)` — donc si un utilisateur change d'appareil, il ne verra pas ses anciennes préparations bien qu'elles soient sauvegardées côté cloud. |
| **Reprise alimentaire après jeûne** | `pages/reprise-alimentaire-apres-jeune.js` importe `supabase` mais ne l'utilise quasiment pas ; commentaire explicite dans le code : `// Sauvegarde locale (pattern simple, à adapter pour Supabase si besoin)`. Fonctionnement encore majoritairement localStorage. |
| **Modèle métier dupliqué (Phase 1 du plan juin, en cours)** | `lib/preparationJeuneMetier.js` porte un ancien modèle plus simple que celui réellement utilisé dans `pages/preparation-jeune.js` ; `components/StartPreparationModal.js` s'appuie encore sur l'ancien modèle. Risque de divergence de dates/critères entre écrans. |
| **Vision long-terme (Consolidation 45j, Portes de Constance, jeûnes récurrents)** | Décrite en détail dans `docs/TODO_PARCOURS_JEUNE_PRIORITE.md` (priorités P2/P3) mais **rien n'est implémenté** (`/consolidation-45-jours.js` n'existe pas). Ce document date d'avant la création de `preparation-jeune.js` : une partie de son "P0/P1" est obsolète (déjà fait), à ne garder que pour la partie P2/P3. |
| **Tests projet** | `npx jest` → 1 suite cassée : `tests/validation-semaine.test.js` (erreur de parsing `export` — le fichier `lib/validationSemaine.js` est en ESM alors que le test le charge via `require`). Sans lien direct avec la prépa jeûne (concerne le bilan hebdo), mais à corriger si on relance la CI. |

### ❌ Non trouvé / jamais implémenté

- Page `/consolidation-45-jours.js` (P2 du plan long terme).
- "Portes de Constance" (P2.2).
- Mode "jeûne récurrent" + contrôle de fréquence jeûnes longs (P3).
- Composant `<TransitionPhase />` unifié entre les 3-4 étapes du cycle (mentionné en Phase 2 du plan de conformité de juin, jamais créé).

---

## 3. 🎯 Reprise de contexte — ce sur quoi vous travailliez juste avant la pause

**Preuve directe : `git status` montre 3 fichiers modifiés mais NON commités** (donc le tout dernier état de travail, jamais sauvegardé) :

```
 M components/PhaseCard.js
 M lib/validerCriterePreparation.js
 M pages/preparation-jeune.js
?? docs/PLAN_ACTION_MISE_EN_CONFORMITE_PREPA_JEUNE_2026-06-29.md
?? tests/validerCriterePreparation.auto.test.js  (déjà présent, tests passent)
```

Ceci correspond précisément au **point bloquant identifié par l'audit de février** ("Validation phase 3 : le bouton ne met pas à jour l'état React") et au lancement de la **Phase 1 du plan de conformité du 29/06/2026** ("Unifier la source de vérité métier prépa jeûne"). Concrètement, le travail en cours consiste à :

1. **`lib/validerCriterePreparation.js`** :
   - Ajout d'un champ `typeValidation: 'manuel'` lors d'une validation manuelle.
   - **Correction d'un bug** dans `validerCritereAuto` : avant, l'auto-validation ne respectait un critère déjà validé que s'il était marqué `typeValidation === 'manuel'` (donc elle pouvait ré-écraser un critère déjà auto-validé). Correction : ne plus jamais écraser un critère `validé`, peu importe son type.

2. **`pages/preparation-jeune.js`** :
   - Ajout d'une nouvelle section UI **"Validation auto en direct"** (visible uniquement si `preparationActive`), qui affiche en temps réel les 5 critères auto-détectables (Portions, Féculents le soir, Hydratation, Pas après 19h, Repas ≤ 45 min) avec un badge `x/seuil`, un statut ✅/⏳, et un bloc **"Prochain meilleur geste"** calculé dynamiquement (le critère le plus proche d'être validé).
   - **Correction du bug central** : `criteresPhase` est maintenant recalculé à partir de l'état React `criteres` (via `criteresParId`) à chaque rendu de phase, au lieu de passer directement `phase.criteres` (liste statique). Résultat : `PhaseCard` reçoit désormais `valide`, `dateValidation`, `typeValidation` à jour → **le clic sur "Valider ce critère" met enfin à jour visuellement l'UI**.
   - Ajout d'un résumé par phase (`resumePhase`, ex: "3/4 validés") transmis à `PhaseCard` via une nouvelle prop `phase.resume`.

3. **`components/PhaseCard.js`** :
   - Le titre de la phase (`<h2>`) affiche maintenant un badge à droite avec `phase.resume` (ex. "3/4 validés") — changement purement visuel pour accompagner le point précédent.

**Statut de ce travail : fonctionnellement terminé mais NON commité ni testé dans le navigateur.** Les tests unitaires (`tests/validerCriterePreparation.auto.test.js`) passent (6/6), mais aucune preuve de test manuel dans le navigateur n'a été trouvée (pas d'entrée récente dans `docs/Anomalie roll back` confirmant une validation UI).

### 👉 Tâche immédiate à reprendre en premier

1. Relancer le serveur dev (`npm run dev`) et **tester manuellement dans le navigateur** la page `/preparation-jeune` : vérifier que cliquer sur "Valider ce critère" met bien à jour le badge de la phase et le statut du critère (c'était le bug initial signalé).
2. Vérifier que le nouveau bloc "Validation auto en direct" ne casse rien visuellement (responsive, absence de `preparationActive` → section masquée correctement).
3. Si OK : **commiter** ces 3 fichiers (actuellement en attente), avec un message du type `fix(preparation-jeune): sync état React critères + validation auto en direct`.
4. Poursuivre la Phase 1 du plan de conformité : réconcilier `lib/preparationJeuneMetier.js` (ancien modèle) et `components/StartPreparationModal.js` avec le modèle réel de `pages/preparation-jeune.js` (3 phases, 9 critères, jalons J-30/J-17/J-14/J-12/J-7).

---

## 4. 🗺️ Roadmap structurée (à faire plus tard)

### Court terme — finir la Phase 1 du plan de conformité (en cours)
- [ ] Valider manuellement en navigateur le fix de synchronisation React (voir §3).
- [ ] Commiter le travail en cours.
- [ ] Réécrire `lib/preparationJeuneMetier.js` pour qu'il expose le modèle de référence complet (3 phases, 9 critères, jalons, conseils) au lieu de l'ancien modèle simplifié.
- [ ] Brancher `components/StartPreparationModal.js` sur ce modèle unique.
- [ ] Vérifier `pages/start-preparation.js` (cohérence de démarrage).
- [ ] Ajouter des tests de non-régression sur la structure phases/critères/jalons.

### Moyen terme — Phase 2 du plan de conformité : parcours unifié
- [ ] Définir un statut global de parcours (préparation → jeûne → reprise).
- [ ] Clarifier/fiabiliser la transition fin-préparation → début-jeûne (actuellement fonctionnelle mais ad-hoc, pas de composant `<TransitionPhase />` réutilisable).
- [ ] Clarifier la transition fin-jeûne → reprise (actuellement `reprise-alimentaire-apres-jeune.js` peu connecté au reste).
- [ ] Propager le contexte (durée, dates, historique) d'un module à l'autre au lieu de tout relire depuis localStorage à chaque page.

### Moyen terme — Phase 3 du plan de conformité : historique avancé
- [ ] Implémenter réellement `lib/statistiquesPreparationsJeune.js` (nombre total, moyenne critères validés, taux de réussite, évolution).
- [ ] Implémenter `lib/comparePreparationsJeune.js` (comparaison auto avec la préparation précédente).
- [ ] Implémenter `lib/notesPreparationJeune.js` (notes personnelles modifiables après coup, sync Supabase/localStorage).
- [ ] Finaliser `components/DetailPreparationJeune.js` (actuellement un stub vide).
- [ ] Faire lire l'historique cloud (`getHistoriquePreparationsJeuneSupabase`) dans `/historique-preparations-jeune.js`, pas seulement le localStorage (gap multi-device identifié).
  - Référence complémentaire : `docs/PLAN_IMPLEMENTATION_HISTORIQUE_PREPARATIONS_JEUNE_27DEC2025.md` et `docs/PLAN_IMPLEMENTATION_HISTORIQUE_PREPARATIONS_JEUNE_CONFORME_TEMPLATE.md`.

### Moyen terme — Phase 4 du plan de conformité : finitions UX
- [ ] Gérer les démarrages tardifs de préparation avec guidance réelle.
- [ ] Homogénéiser messages/statuts entre suivi, préparation et historique.
- [ ] Compléter le bilan final de préparation (actuellement basique : critères validés/non validés + conseils génériques par mot-clé).

### Long terme — vision globale (`docs/TODO_PARCOURS_JEUNE_PRIORITE.md`, à re-valider car partiellement obsolète)
- [ ] Connecter `pages/reprise-alimentaire-apres-jeune.js` à Supabase (actuellement quasi 100% localStorage).
- [ ] Page `/consolidation-45-jours.js` (planning hebdomadaire 7 semaines, jeûnes intermittents progressifs, défis comportementaux).
- [ ] "Portes de Constance" (3 critères symboliques calculés depuis l'historique réel Supabase) sur `tableau-de-bord.js`.
- [ ] Mode "jeûne récurrent" + règle métier : jeûnes ≥10 jours limités à 1×/trimestre.
- [ ] Page `/historique-jeunes.js` avec statistiques comparatives (graphique poids, fréquence, taux de réussite).
- [ ] Table Supabase `parcours_jeune` unifiée (le plan P0 d'origine la proposait comme modèle générique ; à réévaluer vu que `preparations_jeune` et `jeune` existent déjà séparément — risque de redondance à trancher avant de coder).

### Dette technique transverse
- [ ] Corriger `tests/validation-semaine.test.js` (échec de parsing ESM/CommonJS, non bloquant pour le jeûne mais casse `npx jest` global).
- [ ] Vérifier les fichiers `.backup` qui traînent (`pages/jeune.js.backup`, `pages/historique-extras.js.backup`, `pages/suivi.js.backup-avant-abc`, `components/BilanHebdoModal.js.backup*`, `components/RepasBloc.js.backup*`) — à nettoyer ou clarifier s'ils servent encore de filet de sécurité.
- [ ] Fichier vide `docs/Suivi de registre/Suivi de registre` — dossier probablement créé par erreur, à vérifier/supprimer si inutile.

---

## 5. ⚠️ Points de vigilance récurrents (issus de `docs/Anomalie roll back`)

Ce fichier (3385 lignes) journalise les incidents passés. Motifs qui reviennent le plus souvent et à surveiller en priorité sur ce périmètre :

- **Ordre d'initialisation des variables/hooks** : plusieurs `ReferenceError` passés (`kcalSemaine`, `handleStartPreparation`, `setValidationError`) causés par l'utilisation d'une variable/handler avant sa déclaration, ou une déclaration de state hors du composant React. → Toujours relire l'ordre hooks → logique → handlers → rendu avant de valider une étape.
- **Imports dupliqués/mal placés** : anomalie critique du 10/01/2026 sur `pages/jeune.js` (import imbriqué dupliqué non détecté, build cassé `import/export cannot be used outside module code`).
- **Migration Supabase multi-utilisateur** : anomalie du 10/01/2026 rappelant de toujours vérifier l'usage cohérent de `user_id` dans **tous** les accès Supabase (lecture/écriture) avant de valider une correction partielle.
- **Règle du projet** : ne jamais valider une étape "conforme" sans relecture ligne à ligne de la structure du fichier modifié, et toujours tester dans le navigateur (pas seulement `get_errors`) avant validation utilisateur.

---

## 6. Infos pratiques pour reprendre tout de suite

- **Repo** : `laurellebaylemankassa-create/NEWcompteplanvitalroot`, branche `PREPA-JEUNE` (à jour avec origin, aucun commit en attente de push).
- **Changements non commités actuellement** : `components/PhaseCard.js`, `lib/validerCriterePreparation.js`, `pages/preparation-jeune.js` (voir §3), + fichier `docs/PLAN_ACTION_MISE_EN_CONFORMITE_PREPA_JEUNE_2026-06-29.md` non suivi par Git (à ajouter/commiter aussi).
- **Lancer l'app** : `npm run dev` (Next.js 15).
- **Lancer les tests** : `npx jest` (1 suite cassée sur 3, sans lien direct avec le jeûne — voir §2).
- **Fichiers clés du domaine "préparation jeûne"** :
  - Page : [pages/preparation-jeune.js](pages/preparation-jeune.js)
  - Page historique : [pages/historique-preparations-jeune.js](pages/historique-preparations-jeune.js)
  - Logique critères : [lib/validerCriterePreparation.js](lib/validerCriterePreparation.js)
  - Logique modèle métier (à unifier) : [lib/preparationJeuneMetier.js](lib/preparationJeuneMetier.js)
  - Sync Supabase + CRUD historique : [lib/preparationsJeune.js](lib/preparationsJeune.js)
  - Composants : [components/PhaseCard.js](components/PhaseCard.js), [components/CartePreparationJeune.js](components/CartePreparationJeune.js), [components/DetailPreparationJeune.js](components/DetailPreparationJeune.js) (stub), [components/HistoriquePreparationsModal.js](components/HistoriquePreparationsModal.js)
  - Cycle jeûne : [pages/jeune.js](pages/jeune.js)
  - Reprise : [pages/reprise-alimentaire-apres-jeune.js](pages/reprise-alimentaire-apres-jeune.js)
- **Document de référence stratégique à suivre en priorité** : [docs/PLAN_ACTION_MISE_EN_CONFORMITE_PREPA_JEUNE_2026-06-29.md](docs/PLAN_ACTION_MISE_EN_CONFORMITE_PREPA_JEUNE_2026-06-29.md).

---

*Document généré automatiquement par analyse du code et des docs existants. Aucune information n'a été inventée : chaque affirmation ci-dessus est reliée à un fichier ou une commande vérifiable.*

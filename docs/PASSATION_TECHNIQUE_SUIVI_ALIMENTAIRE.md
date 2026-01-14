# Passation technique - Audit et restauration du suivi alimentaire

## 1. Historique des actions réalisées

- **Début de la mission** : Correction des anomalies sur le suivi alimentaire (budget extras, feedback validation, palier, affichage des périodes).
- **Modifications apportées** :
  - Refactorisation du composant BudgetExtrasCard.js (calcul dynamique, debug visuel, mode localStorage, synchronisation Supabase).
  - Ajout de debug et de gestion de la période dans l'affichage des extras.
  - Tentatives de rollback suite à des bugs structurels (JSX dans async, fragments non fermés, code mort).
  - Audit des commits et des fichiers backup pour identifier une version stable.
- **Analyse des bugs** :
  - Application devenue instable suite à des modifications non validées étape par étape.
  - Rollback incomplet, structure React corrompue.
  - Perte de l’état stable, multiplication des bugs.

## 2. Ce qui est en cours

- **Audit complet des commits** sur BudgetExtrasCard.js et SaisieRepas.js pour identifier les apports utiles et les sources de bugs.
- **Validation croisée** des versions stables (commits 774ab60 pour SaisieRepas.js, a49eea8 et 6b5fb67 pour BudgetExtrasCard.js).
- **Synthèse des évolutions à conserver** :
  - Affichage dynamique de la période (semaine, aujourd’hui) dans SaisieRepas.js (commit 774ab60).
  - Gestion du budget extras, affichage détaillé, mode localStorage dans BudgetExtrasCard.js (a49eea8).
- **Préparation d’un plan de restauration/fusion** pour garantir la stabilité et la préservation de toutes les fonctionnalités utiles.

## 3. Prochaines étapes à suivre

1. **Restaurer SaisieRepas.js** à partir du commit 774ab60 (logique d’affichage des périodes stable et à jour).
2. **Restaurer BudgetExtrasCard.js** à partir du commit a49eea8, en corrigeant la structure React si besoin.
3. **Fusionner les évolutions utiles** des autres commits (défis, feedback, etc.) sans écraser la logique stable des périodes et du budget.
4. **Valider la compilation et le rendu visuel** après chaque étape.
5. **Documenter chaque modification** et garder une trace claire des choix techniques.
6. **Vérifier que toutes les fonctionnalités utiles sont conservées** (affichage des repas, calculs, feedback, gestion des défis).

## 4. Points d’attention pour la reprise

- **Ne pas réintroduire les bugs structurels** (JSX dans async, fragments non fermés, code mort).
- **Valider chaque étape** avant de passer à la suivante.
- **Utiliser les commits de référence** pour restaurer la stabilité.
- **Documenter chaque choix et chaque fusion** pour assurer la traçabilité.


## 6. Fiche métier - Comportement attendu

- **Comportement attendu de l’application** :
  - L’utilisateur doit pouvoir saisir ses repas et extras chaque jour, avec un affichage clair de la période sélectionnée (aujourd’hui, semaine, mois).
  - Le budget extras doit être calculé dynamiquement selon la semaine et le profil utilisateur, avec une synchronisation en base.
  - Après validation d’une semaine, un feedback visuel doit être affiché pour informer l’utilisateur du bilan (succès, conseils, encouragements).
  - Les défis et paliers doivent être gérés et affichés selon la progression.
  - L’UX doit rester fluide, avec des messages d’erreur et de succès explicites.





## 11. Clarification métier — Bilan hebdomadaire global

- **Périmètre du bilan hebdo lors de la validation de la semaine** :
  - Le feedback hebdomadaire ne se limite pas aux extras : il porte sur l’ensemble des indicateurs clés de la semaine.
  - Lors de la validation, l’utilisateur reçoit un bilan complet sur :
    - Nombre de repas saisis
    - Respect des recommandations alimentaires (équilibre, variété, catégories)
    - Progression sur les paliers et défis
    - Évolution du poids (si renseigné)
    - Extras consommés (nombre, type, impact)
    - Respect du budget global (calories, extras, etc.)
    - Conseils personnalisés selon l’ensemble des données de la semaine
    - Récompenses ou badges obtenus

- **Relation avec la page Statistiques/Tableau de bord** :
  - Le feedback hebdo est immédiat et détaillé, centré sur la semaine en cours ou validée.
  - La page statistiques/tableau de bord offre une vue synthétique et historique sur l’ensemble des semaines/mois, avec tous les indicateurs agrégés.
  - Les deux sont complémentaires : le bilan hebdo motive et guide, les statistiques permettent de suivre la progression sur le long terme.

- **Synthèse** :
  - Toute validation de semaine doit afficher un bilan global, pas seulement les extras.
  - Les conseils, verbatims et feedbacks doivent s’appuyer sur l’ensemble des indicateurs pour être pertinents et personnalisés.


- **Origine de l’idée** :
  - La phase "validation de la semaine" est née du besoin métier de donner du sens à la clôture hebdomadaire, d’encourager l’utilisateur et de lui permettre de suivre sa progression.
  - Tu as insisté sur l’importance d’un feedback riche, immédiat et consultable, pour motiver et guider l’utilisateur.

- **Échanges et structuration** :
  - Nous avons défini ensemble le scénario métier : validation le dimanche soir, modal bilan, feedback personnalisé, consultation rétroactive.
  - Plusieurs retours ont permis d’affiner le contenu du bilan : progression extras/quota, liste détaillée, message personnalisé, évolution vs semaine précédente.
  - La possibilité de valider rétroactivement plusieurs semaines a été ajoutée pour répondre aux oublis et faciliter la régularité.
  - La structuration technique a été validée : modal réutilisable, drawer rétroactif, persistance BDD, badge notification.

- **Verbatims définis pour le bilan** :
  - "Bravo, vous avez respecté votre budget extras !"
  - "Attention, vous avez dépassé le budget, essayez de limiter les extras la semaine prochaine."
  - "Incroyable ! Aucun extra cette semaine, continuez ainsi !"
  - "Vous avez progressé par rapport à la semaine précédente."
  - "Pensez à consulter vos conseils personnalisés pour améliorer votre équilibre."

- **Ce qui a été construit** :
  - La modal de feedback détaillé après validation.
  - La sauvegarde complète des données de bilan en BDD.
  - La consultation rétroactive du feedback via badge ou historique.
  - Le drawer de validation multi-semaines.
  - Les verbatims et conseils personnalisés intégrés dans l’UI.

- **Ce qu’il reste à faire** :
  - Finaliser les tests d’ergonomie et de persistance.
  - Améliorer la personnalisation des messages selon le profil et la progression.
  - Optimiser la gestion des validations rétroactives (batch, notifications).
  - Documenter chaque scénario métier et chaque verbatim pour la reprise.

- **Synthèse** :
  - La phase "validation de la semaine" et le bilan hebdo sont structurés autour du feedback utilisateur, de la motivation et de la traçabilité.
  - Les verbatims et scénarios métier sont définis et intégrés, la logique technique est alignée.
  - Le périmètre restant est identifié pour une reprise efficace et une amélioration continue.


- **Origine de l’idée** :
  - L’idée de la page statistiques et du tableau de bord est née de nos échanges pour répondre au besoin métier de suivi global, motivation et visualisation des progrès sur plusieurs semaines/mois.
  - Tu as exprimé le besoin d’un outil visuel permettant à l’utilisateur de voir ses réussites, ses points d’amélioration, et d’être encouragé par des badges et des conseils personnalisés.

- **Échanges et décisions** :
  - Plusieurs retours ont été faits sur l’importance d’avoir des indicateurs clairs (nombre de repas, extras, respect du budget, progression des paliers).
  - Nous avons discuté de l’intérêt d’un historique consultable, de filtres par période, et de la nécessité d’un affichage graphique (courbes, histogrammes, badges).
  - Tu as insisté sur la cohérence visuelle (charte graphique, badges, conseils) et sur la rapidité d’accès aux données.
  - J’ai proposé l’utilisation de composants graphiques (Chart.js, recharts) et la synchronisation avec la BDD pour garantir la fiabilité des données.

- **Ce qui a été construit** :
  - La structure du tableau de bord avec affichage des indicateurs clés (repas, extras, budget, paliers, badges).
  - Les premiers composants graphiques pour les courbes et histogrammes.
  - L’historique des semaines validées et le feedback associé.
  - Les filtres par période (semaine, mois, année) sont en place.
  - Les badges visuels et les conseils personnalisés ont été intégrés dans l’UI.

- **Ce qu’il reste à faire** :
  - Finaliser l’optimisation pour l’affichage rapide avec beaucoup de données (pagination, lazy loading).
  - Améliorer la responsivité sur mobile/tablette.
  - Ajouter des notifications/alertes en cas de régression ou d’objectif atteint.
  - Tester et valider l’ergonomie avec des utilisateurs réels.
  - Documenter chaque composant et chaque logique métier pour faciliter la reprise.

- **Synthèse** :
  - Le concept est le fruit d’une co-construction entre tes besoins métier et mes propositions techniques.
  - La logique métier (suivi, motivation, feedback, historique) et la logique technique (composants graphiques, BDD, optimisation) sont alignées.
  - Le périmètre restant est clairement identifié pour une reprise efficace.


- **Objectif métier** :
  - Permettre à l’utilisateur de visualiser l’évolution de ses habitudes alimentaires, extras, paliers et défis sur plusieurs semaines/mois.
  - Offrir une vue synthétique et graphique (tableaux, courbes, badges) pour suivre la progression, les réussites et les points d’amélioration.

- **Comportement attendu** :
  - Accès via le menu principal ou le tableau de bord.
  - Affichage des indicateurs clés :
    - Nombre de repas saisis par semaine/mois
    - Nombre d’extras consommés
    - Respect du budget extras (✅/❌)
    - Progression des paliers et défis
    - Récompenses/badges obtenus
    - Évolution du poids (si renseigné)
  - Filtres par période (semaine, mois, année)
  - Graphiques dynamiques (barres, courbes, camembert)
  - Section "Historique" pour consulter les semaines validées et les feedbacks associés
  - Notifications ou alertes en cas de régression ou d’objectif atteint

- **Visuel attendu** :
  - Tableau récapitulatif par semaine/mois
  - Graphique d’évolution (ex : courbe du nombre d’extras, histogramme des repas)
  - Badges visuels pour les réussites (ex : "3 semaines consécutives sans dépassement d’extras")
  - Encarts conseils personnalisés selon les statistiques

- **Points techniques** :
  - Utilisation de composants graphiques (Chart.js, recharts, etc.)
  - Synchronisation avec la BDD pour les données historiques
  - Optimisation pour affichage rapide même avec beaucoup de données
  - Responsive design pour desktop/mobile


- **Visuel pour le bilan de la semaine validée** :
  - Un encart ou une modal s’affiche après validation, avec :
    - Un message de félicitations ou d’encouragement.
    - Le récapitulatif du nombre de repas, extras consommés, et le respect du budget.
    - Des conseils personnalisés selon la progression (ex : "Bravo, vous avez respecté votre budget extras !", "Attention, vous avez dépassé le budget, essayez de limiter les extras la semaine prochaine.").
    - Un bouton pour passer à la semaine suivante ou consulter le détail.
  - Exemple de structure visuelle :

    ```
    ┌─────────────────────────────────────────────┐
    │ 🎉 Semaine validée !                        │
    │---------------------------------------------│
    │ Repas saisis : 8                            │
    │ Extras consommés : 2653 kcal                │
    │ Budget respecté : ✅ Oui / ❌ Non            │
    │---------------------------------------------│
    │ Conseils personnalisés                      │
    │ [Bouton] Semaine suivante / Détail          │
    └─────────────────────────────────────────────┘
    ```

  - Le visuel doit être cohérent avec la charte graphique (bleu/violet, icônes, badges, etc.)


- Branche courante : AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS
- Derniers commits de référence :
  - SaisieRepas.js : 774ab60 (affichage période stable)
  - BudgetExtrasCard.js : a49eea8 (gestion extras détaillée)
- Problèmes rencontrés : latence, instabilité, bugs structurels.
- Reprise possible : suivre le plan ci-dessus, valider chaque étape, fusionner les évolutions utiles.

---

**Fin de passation. Pour toute reprise, se référer à ce fichier et à l’historique des commits identifiés.**

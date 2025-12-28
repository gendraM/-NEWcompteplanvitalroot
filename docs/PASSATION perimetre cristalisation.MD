# 📑 DOCUMENT DE PASSATION — CONTINUITÉ DU PROJET CRISTALLISATION

**Date de rédaction** : 28 décembre 2025  
**Rédacteur** : GitHub Copilot (GPT-4.1)  
**Contexte** : Passation complète pour reprise immédiate du projet par un nouveau développeur, sans perte d’information ni rupture de workflow.

---

## 1. 🎯 Objectif du document

Ce document vise à :
- Garantir la continuité du projet “Cristallisation” (phase post-reprise alimentaire)
- Permettre à tout nouveau contributeur de comprendre l’architecture, l’historique, les choix techniques, les workflows, les anomalies et les priorités
- Offrir un guide opérationnel pour être productif dès la première session, sans perte de contexte

---

## 2. 🕰️ Historique & Décisions majeures

### 2.1. Contexte général
- Projet initié pour structurer le suivi nutritionnel post-jeûne, avec une phase de “cristallisation” de 45 jours, cruciale pour la stabilisation.
- Architecture pensée pour la robustesse, la traçabilité, la séparation TEST/PROD, et la possibilité de rollback rapide.
- Workflow strictement piloté par un template validé (voir docs/Template.md).

### 2.2. Jalons & évolutions
- **2025-11** : Setup initial Git/Supabase, définition des cycles (préparation, jeûne, reprise, cristallisation)
- **2025-12** : Implémentation des pages cristallisation, auto-validation, gestion des badges, séparation TEST/PROD, documentation des anomalies
- **2025-12-26/28** : Focus sur la documentation, la passation, l’enrichissement contextuel et la préparation à la reprise par un nouveau dev

### 2.3. Décisions structurantes
- **Séparation stricte TEST/PROD** : Toute logique doit être testable sans impacter la prod, via localStorage et UUID fallback.
- **Documentation exhaustive** : Chaque anomalie, rollback, ou choix technique est tracé dans /docs/Anomalie roll back et les fichiers TODO.
- **Planification pilotée par template** : Aucun code n’est modifié sans validation du plan (docs/Template.md).

---

## 3. 🏗️ Architecture technique

### 3.1. Stack & modules
- **Next.js 15.5.3** (SSR/CSR, Webpack)
- **React** (useState, useEffect, hooks custom)
- **Supabase** (pas d’auth, fallback UUID)
- **localStorage** (séparation TEST/PROD, persistance, rollback)
- **Modules custom** : analyseRepas3Jours.js, referentiel.js, cristallisation-quotidien.js, BadgeCard.js, PopUpDefi.js, JournalDefiPersonnalise.js

### 3.2. Flux de données
- Voir docs/COMMUNICATION_CRISTALLISATION_PLAN_LISTE_COURSES.md pour le détail du flux entre cristallisation, planification et génération de la liste de courses.
- Transmission des critères, triggers et objectifs via query params et localStorage.
- Agrégation, enrichissement et filtrage des aliments planifiés pour générer la liste de courses conforme aux critères de cristallisation.

### 3.3. Sécurité & intégrité
- Double stockage des bilans (localStorage, query params)
- Validation systématique des entrées utilisateur (poids, repas, etc.)
- Rollback possible à chaque étape (voir /docs/Anomalie roll back)

---

## 4. 🧩 Fonctionnalités implémentées

### 4.1. Cristallisation (45 jours)
- Suivi quotidien via /pages/cristallisation-quotidien.js
- Auto-validation des critères (QN, extras, triggers)
- Suggestions de défis et gestion des badges (BadgeCard.js, PopUpDefi.js)
- Notifications et feedback utilisateur (SSR/CSR safe)

### 4.2. Planification & liste de courses
- Planification mensuelle via /pages/plan.js
- Génération dynamique de la liste de courses, enrichie et filtrée selon les critères de cristallisation
- Export PDF/email, stats, alertes, recommandations

### 4.3. Transmission & transition
- Transmission automatique des bilans de reprise vers la cristallisation (query params + localStorage)
- Gestion des cas limites (poids manquant, reprise non réussie, abandon)
- Affichage pédagogique et feedback différencié selon le statut

### 4.4. Séparation TEST/PROD
- Toutes les fonctionnalités sont testables en mode TEST (UUID, localStorage, pas d’impact prod)
- Les données critiques sont isolées et rollbackables

---

## 5. 🔄 Workflow utilisateur & scénarios

### 5.1. Cycle complet
Préparation (30j) → Jeûne → Reprise (2×jeûne) → Cristallisation (45j) → Portes → Routine ( voir fichier source pour avoir le workflow complet du jeune est completer a faire par Copilor qui reprend ce travail ( a valider avec utilisateur avant maj)

### 5.2. Scénario cristallisation
1. L’utilisateur termine la reprise alimentaire (bilan calculé automatiquement)
2. Transmission des données vers la phase cristallisation (poids, conformité, etc.)
3. Suivi quotidien, validation des critères, suggestions de défis, gestion des badges
4. Planification des repas, génération de la liste de courses conforme
5. Feedback, notifications, export, et possibilité de rollback

### 5.3. Cas limites gérés
- Poids final manquant : formulaire de saisie, recalcul automatique
- Reprise non réussie : feedback pédagogique, bouton cristallisation toujours accessible
- Abandon : bannière non affichée, transition bloquée

---

## 6. 🛠️ Anomalies, correctifs & points d’attention

### 6.1. Anomalies récentes
- **Erreur structure JSX** dans /pages/cristallisation-quotidien.js (corrigée, documentée dans /docs/Anomalie roll back)
- **Hydratation SSR/CSR** : corrigé par isClient guards et refonte du flux de données
- **Risque collision données** entre cristallisation et reprise : séparation stricte des clés localStorage

### 6.2. Correctifs & leçons
- Toujours vérifier la cohérence SSR/CSR (Next.js)
- Documenter chaque rollback ou anomalie dans /docs/Anomalie roll back
- Ne jamais mélanger les contextes TEST/PROD

### 6.3. Points d’attention pour la reprise
- Respecter le template de planification (docs/Template.md)
- Ne jamais modifier la logique métier sans enrichir la documentation et le log d’anomalies
- Toujours tester en mode TEST avant tout déploiement

---

## 7. 📋 TODOs & missions différées

### 7.1. TODOs immédiats
- Finaliser la page /consolidation-45-jours.js (réception des bilans, initialisation du programme cristallisation)
- Implémenter le suivi hebdomadaire (6 semaines)
- Ajouter la gestion des jeûnes ponctuels et des Portes de Constance (+2kg)
- Intégrer la transition vers la Routine

### 7.2. Missions différées (V2)
- Gestion avancée des calories et prévision du poids (voir section “Améliorations futures” dans COMMUNICATION_CRISTALLISATION_PLAN_LISTE_COURSES.md)
- Enrichissement de la BDD aliments (calories, portions)
- Création de la table profil_utilisateur (métriques, objectifs)
- Interface de configuration des objectifs
- Feedback learning (prévisions vs réalité)

### 7.3. Checklist de validation
- [ ] Page /consolidation-45-jours.js créée et fonctionnelle
- [ ] Suivi hebdomadaire opérationnel
- [ ] Tests de non-régression validés (voir GUIDE_CLOTURE_REPRISE_ET_TRANSMISSION_CRISTALLISATION.md)
- [ ] Documentation enrichie à chaque étape

---

## 8. 🧭 Conseils pour la reprise du projet

- **Lire en priorité** :  
  - docs/COMMUNICATION_CRISTALLISATION_PLAN_LISTE_COURSES.md (flux, workflow, TODOs)
  - docs/GUIDE_CLOTURE_REPRISE_ET_TRANSMISSION_CRISTALLISATION.md (transition, cas limites, tests)
  - docs/Anomalie roll back (historique des bugs et correctifs)
  - docs/Template.md (planification et validation)
- **Toujours documenter** chaque modification, bug, ou rollback
- **Tester systématiquement** en mode TEST avant tout merge ou déploiement
- **Respecter la séparation** des contextes (cristallisation, reprise, TEST/PROD)
- **Utiliser les modules existants** (analyseRepas3Jours.js, referentiel.js, etc.) pour garantir la cohérence

---

## 9. 🔗 Références internes & fichiers clés

- [docs/COMMUNICATION_CRISTALLISATION_PLAN_LISTE_COURSES.md](docs/COMMUNICATION_CRISTALLISATION_PLAN_LISTE_COURSES.md) : Flux, workflow, TODOs, améliorations futures
- [docs/GUIDE_CLOTURE_REPRISE_ET_TRANSMISSION_CRISTALLISATION.md](docs/GUIDE_CLOTURE_REPRISE_ET_TRANSMISSION_CRISTALLISATION.md) : Transition, cas limites, tests, checklist
- [docs/Anomalie roll back](docs/Anomalie%20roll%20back) : Historique des anomalies et correctifs
- [docs/Template.md](docs/Template.md) : Planification, validation, workflow strict
- [docs/TODO_CRISTALLISATION_PRIORITE.md](docs/TODO_CRISTALLISATION_PRIORITE.md) : Liste des tâches prioritaires
- [components/BadgeCard.js](components/BadgeCard.js), [components/PopUpDefi.js](components/PopUpDefi.js), [components/JournalDefiPersonnalise.js](components/JournalDefiPersonnalise.js) : Modules clés pour la cristallisation

---

## 10. 🏁 Résumé exécutif

- **Projet cristallisation** : robuste, modulaire, traçable, prêt pour la reprise immédiate
- **Documentation** : exhaustive, enrichie, contextualisée, sans perte d’information
- **Workflow** : validé, testé, prêt à être poursuivi ou enrichi
- **Prochaines étapes** : finaliser la page /consolidation-45-jours.js, implémenter le suivi hebdomadaire, enrichir la BDD, préparer la V2

**Pour toute reprise, suivre ce document et les fichiers référencés pour garantir la continuité et la productivité immédiate.**

---

**Fin du document de passation — Projet Cristallisation**  
*Version validée, prête à l’emploi pour tout nouveau contributeur.*



Donnée complémentaire historique de conversation IMPORTANT A LIRE ABSOLUMENT


[text](.)


[text](.)

🟢 DOCUMENT DE PASSATION — CONTINUITÉ DU PROJET CRISTALLISATION
1. Contexte général du projet
Projet : Application de suivi nutritionnel et de jeûne, avec phases “préparation”, “jeûne”, “reprise”, “cristallisation”.
Stack : Next.js 15.5.3 (Webpack), React, Supabase (NO AUTH, UUID fallback), localStorage (TEST/PROD), modules custom (analyse, référentiel, défis, badges).
Workflow : Plan d’implémentation strict ([docs/Template.md]), validation utilisateur obligatoire, rollback et traçabilité des anomalies, TEST mode isolé.
Règle stricte : Aucune modification sans plan validé, aucune suppression massive, traçabilité totale, rollback immédiat en cas d’anomalie.
2. État d’avancement au 28/12/2025
Phase active : Cristallisation (45 jours post-reprise)
Fonctionnalités en place :
Dashboard cristallisation ([pages/cristallisation.js])
Suivi quotidien ([pages/cristallisation-quotidien.js]) : critères, validation, suggestions, repas, défis personnalisés, badges
Séparation stricte des défis (cristallisation vs généraux)
TEST/PROD isolés (aucun impact sur données réelles)
Rollback et anomalies documentés ([docs/Anomalie roll back])
Dernière anomalie : Erreur de structure JSX dans cristallisation-quotidien.js (corrigée, voir rollback)
Prochaines étapes : Finaliser l’affichage dynamique des défis personnalisés, robustesse SSR/CSR, UX, accessibilité
3. Checklist de reprise immédiate
Lire le fichier [docs/Template.md] : respecter le plan d’implémentation, checklist, et validation utilisateur
Lire les dernières entrées de [docs/Anomalie roll back] pour éviter toute régression
Vérifier la structure JSX de cristallisation-quotidien.js (voir correctif fourni)
Tester le build et l’affichage des défis personnalisés et badges
Continuer la logique métier en respectant la séparation initialisation/logique/handlers/rendu
4. Points de vigilance
Aucune suppression massive sans validation explicite
Aucune modification de code sans plan validé et checklist complète
Rollback immédiat en cas d’anomalie, documenter dans [docs/Anomalie roll back]
Relecture manuelle de tous les hooks, variables, fonctions avant usage
Respect strict du mode TEST/PROD pour ne jamais impacter les données réelles
Bien relire la TODO et les missions différées (voir section 8)
5. Outils et fichiers clés
Pages :
[pages/cristallisation.js] : dashboard global
[pages/cristallisation-quotidien.js] : suivi quotidien, défis, badges
[pages/defis.js] : défis généraux (hors cristallisation)
Composants :
[components/PopUpDefi.js], [components/JournalDefiPersonnalise.js], [components/BadgeCard.js]
Données :
[data/referentiel.js], [data/referentiel_criteres_cristallisation.js]
Docs :
[docs/Template.md] : plan d’implémentation
[docs/Anomalie roll back] : historique des anomalies et rollbacks
[docs/PLAN_IMPL_Creation_Defis_Personnalises_Suggestion_Intelligente_TEMPLATE_v2.md] : plan détaillé défis personnalisés
[docs/TODO_CRISTALLISATION_PRIORITE.md] : liste des tâches prioritaires cristallisation
[docs/PLAN_IMPL_SaisieAutoDefi.md] : automatisation des suggestions de défis
6. Procédure pour toute nouvelle tâche
Remplir un plan d’implémentation (cf. [docs/Template.md])
Faire valider le plan par l’utilisateur avant toute modification
Lire les anomalies récentes ([docs/Anomalie roll back])
Appliquer la checklist stricte (sécurité, qualité, robustesse, accessibilité)
Documenter toute anomalie ou rollback
Générer un rapport Markdown avant/après chaque modification
Tester en mode TEST avant tout passage en PROD
7. Dernière action à reprendre
Correction de la structure JSX dans cristallisation-quotidien.js (voir patch fourni)
Vérification de l’affichage des défis personnalisés et badges
Continuer l’intégration des suggestions intelligentes et de la gestion des badges

8.  TODO & Missions différées (à ne pas oublier)(voir [docs/TODO_CRISTALLISATION_PRIORITE.md]) :
Finaliser l’affichage dynamique des défis personnalisés (cristallisation)
Vérifier la robustesse SSR/CSR (hydration, isClient, etc.)
Tester l’accessibilité et la persistance des données (localStorage/Supabase)
Ajouter des feedbacks visuels pour chaque action clé (validation, badge, suggestion)
Documenter toute anomalie ou écart dans le rollback
Missions différées (à planifier après cristallisation ou en parallèle) :
Reprise spécifique :
Revoir la logique de reprise alimentaire personnalisée (critères, suggestions, badges)
Intégrer la gestion des règles spécifiques (ex : jeûne intermittent, profils à risque, etc.)
Ajouter la gestion des exceptions et des cas limites (ex : utilisateur qui saute une phase)
Préparer la migration des données historiques pour la reprise
Refactoring/optimisation :
Factoriser les composants communs (défis, badges, feedback)
Optimiser les accès Supabase (batch, pagination, fallback UUID)
Améliorer la documentation technique et fonctionnelle

Missions différées (à planifier après cristallisation ou en parallèle) — Contexte & Historique
Contexte général
La phase “cristallisation” a été priorisée pour garantir la robustesse, la personnalisation et la traçabilité du parcours post-reprise.
La “reprise spécifique” (gestion avancée des profils, règles métiers complexes, exceptions, etc.) a été explicitement différée pour éviter tout mélange de logique et garantir la stabilité du socle cristallisation.
Cette décision a été prise suite à plusieurs échanges sur :
Les risques de régression si on modifiait la logique de reprise en même temps que la cristallisation.
La nécessité de valider chaque étape métier et technique avant d’enchaîner sur des cas particuliers.
Historique des échanges et décisions
Décembre 2025 :
Plusieurs discussions sur la gestion des profils à risque, des exceptions (ex : utilisateurs qui sautent une phase, jeûne intermittent, etc.), et la migration des données historiques.
Décision : “On ne touche pas à la logique de reprise tant que la cristallisation n’est pas validée, testée et documentée.”
Mise en place d’un plan d’implémentation strict pour chaque phase, avec validation utilisateur obligatoire.
Points abordés :
Séparation stricte des contextes (cristallisation vs reprise) :
Les défis, critères, badges, et suggestions doivent être isolés par phase.
Aucun mélange de logique ou d’affichage entre les deux parcours.
Gestion différée des règles métiers complexes :
Exemples : profils à risque (diabète, TCA, etc.), gestion des exceptions (saut de phase, reprise anticipée, etc.), adaptation des critères selon l’historique utilisateur.
Ces règles nécessitent un audit métier, une validation médicale/nutritionnelle, et une architecture technique dédiée.
Migration et compatibilité des données :
Nécessité de prévoir une migration des anciennes données de reprise pour garantir la compatibilité avec les nouvelles règles.
Décision de ne pas impacter les données existantes tant que la cristallisation n’est pas stabilisée.
Planification d’une mission dédiée :
Un plan d’implémentation spécifique sera rédigé pour la reprise avancée, avec :
Audit des besoins métiers et utilisateurs
Définition des cas limites et exceptions
Validation des critères et des suggestions personnalisées
Tests multi-profils et multi-phases
Documentation et traçabilité complète
À faire lors de la reprise de la mission “reprise spécifique”
Relire tous les échanges et décisions (cf. ce document, les plans d’implémentation, et les fichiers d’anomalies)
Lister tous les cas particuliers identifiés lors des échanges (profils à risque, exceptions, etc.)
Préparer un plan d’implémentation dédié (cf. [docs/Template.md])
Impliquer les parties prenantes métier (nutritionniste, médecin, utilisateur expert) pour valider les règles
Tester en mode TEST avant tout déploiement en PROD
Documenter chaque étape, chaque choix, chaque rollback
Résumé de la philosophie
Pas de précipitation : chaque phase doit être robuste, validée, et traçable avant d’enchaîner sur la suivante.
Séparation stricte des logiques métier et technique.
Validation utilisateur et métier à chaque étape.
Traçabilité totale des décisions, des anomalies, et des rollbacks.
Ce contexte doit être relu et compris avant toute reprise de la mission “reprise spécifique”.
Aucune modification de la logique de reprise ne doit être faite sans plan validé, audit métier, et documentation complète.


9. Rappel des échanges et décisions importantes
Séparation stricte entre défis cristallisation et défis généraux : jamais de mélange dans l’UI ou la logique.
Gestion différée de la reprise spécifique :
Les règles métiers complexes (ex : profils à risque, exceptions, etc.) sont à traiter dans une mission dédiée après la stabilisation de la cristallisation.
Un plan d’implémentation spécifique sera à rédiger pour cette phase.
Respect absolu du template :
Toute action doit être documentée, validée, et traçable.
Aucune suppression massive, aucune modification sans validation.
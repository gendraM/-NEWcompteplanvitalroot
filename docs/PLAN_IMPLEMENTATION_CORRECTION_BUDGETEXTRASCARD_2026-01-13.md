# 🟢 PLAN D’IMPLÉMENTATION — CORRECTION STRUCTURELLE BUDGETEXTRASCARD

## Titre de la tâche
Correction structurelle du composant BudgetExtrasCard.js pour restaurer la logique stable, corriger les erreurs async/await, et garantir la compilation et la stabilité.

---

## Description précise de la modification attendue
- Supprimer tous les blocs async/await hors fonction dans BudgetExtrasCard.js.
- S’assurer que toute la logique asynchrone est dans une fonction async (chargerBudgetExtras).
- Restaurer la structure stable du composant (hooks en haut, logique calculée, handlers, rendu).
- Valider la compilation et le rendu visuel après correction.
- Documenter chaque étape et garantir la traçabilité.

---

## Précision sur la version stable et les ajouts à conserver

- Version stable à restaurer : **commit a49eea8** pour BudgetExtrasCard.js (gestion extras détaillée, structure React saine).
- Ajouts à conserver :
  - Calcul dynamique du budget via le routeur poids
  - Mode localStorage si pas d’utilisateur
  - Synchronisation Supabase (extras_budget)
  - Affichage détaillé du budget (libre, réservé, consommé)
  - Messages d’alerte si profil incomplet ou budget négatif
- Ajouts à écarter : uniquement les erreurs et anomalies structurelles (await hors async, duplications, fragments non fermés, code mort)

La correction doit donc repartir du code du commit a49eea8, intégrer tous les ajouts utiles, et supprimer uniquement les erreurs et anomalies identifiées.

---

## Fichiers concernés
- /components/BudgetExtrasCard.js
- /docs/PASSATION_TECHNIQUE_SUIVI_ALIMENTAIRE.md (pour traçabilité)
- /docs/ANOMALIE_rollback.md (si besoin)

---

### Etape 1 — Audit des risques préalable
1. Risque technique : Erreur de compilation (await hors async), runtime bloquant.
2. Risque UX : Perte d’affichage du budget extras, confusion utilisateur.
3. Risque robustesse : Synchronisation incomplète entre repas et budget.
4. Risque régression : Perte de granularité ou de gestion avancée du budget.
5. Risque accessibilité : Affichage d’erreur non géré.
6. Vérification stricte de l’ordre des hooks React (useState, useEffect) : tous en haut du composant.
7. Lecture du fichier ANOMALIE_rollback avant toute modification.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé et déclaré en haut
- [ ] useEffect importé et déclaré en haut
- [ ] Toutes les fonctions async sont dans une fonction async
- [ ] Aucune instruction await hors fonction async
- [ ] Toutes les variables utilisées AVANT leur usage
- [ ] Contrôle d’erreur systématique

---

### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du composant BudgetExtrasCard.js
- [ ] Initialisation systématique des hooks et variables
- [ ] Séparation stricte initialisation → logique → handlers → rendu
- [ ] Tous les hooks React en haut du composant
- [ ] Aucune variable d’état ou hook utilisée avant déclaration
- [ ] Contrôle d’erreur (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Documentation claire de chaque étape
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées du fichier ANOMALIE_rollback
2. Créer une checklist de contrôle adaptée
3. Vérifier qu’aucune anomalie bloquante n’est présente
4. Proposer un rollback immédiat en cas de bug

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis : 0 %
- Historique des mises à jour : à compléter à chaque étape

---

### Etape 6 — Point de vigilance
- Vérifier la suppression des duplications async hors fonction
- Contrôler la synchronisation entre budget consommé et repas réels
- S’assurer que le calcul du budget libre vs réservé est correct
- Tester l’affichage des alertes et messages d’erreur

---

### Etape 7 — Proposition de rollback
- Rollback immédiat en cas d’erreur de compilation ou de perte de fonctionnalité
- Ajout d’une entrée dans ANOMALIE_rollback avec date, heure, contexte

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- await hors fonction async, erreurs de compilation
- duplications de blocs async
- structure React corrompue

#### APRÈS
- await uniquement dans fonction async
- structure restaurée, hooks en haut
- compilation et rendu visuel validés
- traçabilité assurée

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

Ce plan respecte le template et s’inspire des actions du fichier de passation. Merci de valider ou d’ajuster avant toute correction du code.
# 🟢 PLAN D’IMPLÉMENTATION COPILOT — À VALIDER AVANT MODIF CODE

## Titre de la tâche
Automatiser la validation des critères de préparation jeune selon la saisie des repas et des actions, avec affichage dynamique des phases et verrouillage des critères non accessibles.

---

## Description précise de la modification attendue
- Permettre la validation automatique des critères de préparation jeune (quantité, féculents, heure, hydratation, action post-repas, durée du repas, etc.) selon la saisie dans le formulaire de repas.
- Afficher dynamiquement les phases et les critères selon la date et le jalon métier, avec cadenas/verrouillage pour les critères non accessibles.
- Préserver la logique métier d’origine : calcul des phases, progression réelle, affichage des cadenas, synchronisation avec la date de début de jeûne.

---

## Fichiers concernés
- /pages/preparation-jeune.js
- /components/RepasBloc.js
- /pages/suivi.js

---

### Etape 1 — Audit des risques préalable
- Risque de régression sur la logique métier (jalons, progression, verrouillage).
- Risque de perte de synchronisation entre la date, la progression et l’affichage des critères.
- Risque d’erreur SSR/React si hooks mal placés.
- Risque d’écrasement ou de suppression de fonctionnalités existantes.
- Risque UX : affichage non dynamique ou perte du feedback utilisateur.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié
- [ ] useState et useEffect importés et déclarés en haut du composant
- [ ] Toutes les variables présentes AVANT leur usage

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React sont déclarés uniquement en haut du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation ➔ logique ➔ handler ➔ rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
- Test de sauvegarde/restauration, accessibilité, non-régression, cohérence UI, test multi-device
- Vérification du calcul dynamique des phases et du verrouillage des critères
- Lecture des entrées d’anomalies rollback
- Création d’une checklist de contrôle à appliquer avant codage
- Proposition de rollback immédiat en cas d’anomalie

---

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Progression : 0 %
- Historique : 03/12/2025, démarrage

---

### Etape 6 — Point de vigilance
- Problème potentiel : suppression ou écrasement de la logique métier d’origine
- Vérifier que le calcul des phases et l’affichage des cadenas sont toujours présents
- Contrôle strict de la synchronisation date/jalon/progression
- Anomalie rollback : toute perte de fonctionnalité ➔ retour immédiat à l’état stable

---

### Etape 7 — Proposition de rollback
- Rollback déclenché si perte de calcul dynamique des phases, affichage des cadenas, ou progression réelle
- Ajout d’une entrée dans le fichier ANOMALIE rollback avec date, heure, détail

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Calcul dynamique des phases et affichage des cadenas fonctionnels
- Progression réelle et synchronisation date/jalon OK

#### APRÈS
- Validation automatique des critères selon la saisie
- Affichage dynamique et verrouillage des critères selon la date et le jalon
- Logique métier d’origine préservée

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

**Aucune modification de code ne sera faite sans validation explicite de ce plan.**

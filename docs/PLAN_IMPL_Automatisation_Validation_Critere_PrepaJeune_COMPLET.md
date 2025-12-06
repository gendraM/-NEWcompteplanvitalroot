# 🟢 PLAN D’IMPLÉMENTATION — AUTOMATISATION VALIDATION CRITÈRES PRÉPARATION JEÛNE

## Titre de la tâche
Automatisation stricte de la validation des critères de préparation jeune selon la saisie, avec affichage dynamique, bannière contextuelle, verrouillage des critères, et synchronisation métier/UX.

---

## Description précise de la modification attendue
- Permettre la validation automatique des critères de préparation jeune (quantité, féculents, heure, hydratation, action post-repas, durée du repas, etc.) selon la saisie dans le formulaire de repas, en respectant la logique métier (jalons, date, progression).
- Afficher dynamiquement les phases et les critères selon la date et le jalon métier, avec cadenas/verrouillage pour les critères non accessibles (comme pour les défis alimentaires).
- Afficher une bannière contextuelle sur la page de suivi lorsque la préparation jeune est active, indiquant la phase, le critère du jour, et l’état de progression.
- Synchroniser la progression, la validation et l’affichage entre la page de préparation, la page de suivi, et le localStorage/Supabase.
- Préserver la logique métier d’origine : calcul des phases, progression réelle, affichage des cadenas, synchronisation avec la date de début de jeûne, UX claire et robuste.

---

## Fichiers concernés
- /pages/preparation-jeune.js
- /components/RepasBloc.js
- /pages/suivi.js
- /components/BannierePreparation.js (à créer ou enrichir)
- /lib/preparationJeuneMetier.js

---

### Etape 1 — Audit des risques préalable
1. Risque de régression sur la logique métier (jalons, progression, verrouillage, synchronisation).
2. Risque de perte de synchronisation entre la date, la progression et l’affichage des critères.
3. Risque d’erreur SSR/React si hooks mal placés.
4. Risque d’écrasement ou de suppression de fonctionnalités existantes (calcul dynamique, cadenas, etc.).
5. Risque UX : affichage non dynamique, perte du feedback utilisateur, confusion sur la progression.
6. Risque de conflit avec la logique des défis alimentaires (comportement à harmoniser).
7. Risque de perte de données ou de non-prise en compte des cas limites (multi-device, reset, rollback).

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié
- [ ] useState et useEffect importés et déclarés en haut du composant
- [ ] Toutes les variables présentes AVANT leur usage
- [ ] Vérification de la logique d’affichage dynamique (jalon, date, progression)
- [ ] Vérification de la logique de verrouillage/cadenas (critère non accessible)
- [ ] Vérification de la synchronisation localStorage/Supabase

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
- [ ] Préservation stricte des fonctionnalités existantes (calcul dynamique, cadenas, progression réelle)
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Test de sauvegarde/restauration, accessibilité, non-régression, cohérence UI, test multi-device
2. Vérification du calcul dynamique des phases et du verrouillage des critères (cadenas)
3. Vérification de l’affichage de la bannière contextuelle sur la page de suivi (phase, critère du jour, progression)
4. Lecture des entrées d’anomalies rollback
5. Création d’une checklist de contrôle à appliquer avant codage
6. Proposition de rollback immédiat en cas d’anomalie

---

### Etape 5 — Description détaillée de la saisie et de la validation automatique
- La saisie des repas dans `/components/RepasBloc.js` inclura des champs spécifiques (durée du repas, action post-repas, hydratation, etc.) qui ne s’affichent que si la préparation jeune est active et que le critère est débloqué (jalon atteint).
- À chaque enregistrement de repas, la logique métier (`/lib/preparationJeuneMetier.js`) analysera la saisie et validera automatiquement le critère correspondant si les conditions sont remplies (ex : durée ≤ 45 min ➔ critère validé, action post-repas renseignée ➔ critère validé, etc.).
- Les critères non accessibles (jalon non atteint) seront affichés avec un cadenas et non éditables, comme pour les défis alimentaires.
- La progression et la validation seront synchronisées entre `/pages/preparation-jeune.js` et `/pages/suivi.js` via localStorage/Supabase.
- La bannière contextuelle (`/components/BannierePreparation.js`) affichera la phase en cours, le critère du jour, l’état de progression, et un message personnalisé.
- Toute action de validation, de reset ou de modification sera tracée et testée pour garantir la robustesse et la conformité métier.

---

### Etape 6 — Point de vigilance
- Problème potentiel : suppression ou écrasement de la logique métier d’origine (calcul des phases, cadenas, progression réelle)
- Vérifier que le calcul des phases et l’affichage des cadenas sont toujours présents
- Contrôle strict de la synchronisation date/jalon/progression
- Anomalie rollback : toute perte de fonctionnalité ➔ retour immédiat à l’état stable
- Harmonisation avec la logique des défis alimentaires (UX, feedback, verrouillage)

---

### Etape 7 — Proposition de rollback
- Rollback déclenché si perte de calcul dynamique des phases, affichage des cadenas, ou progression réelle
- Ajout d’une entrée dans le fichier ANOMALIE rollback avec date, heure, détail

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Calcul dynamique des phases et affichage des cadenas fonctionnels
- Progression réelle et synchronisation date/jalon OK
- Bannière contextuelle affichée selon la phase

#### APRÈS
- Validation automatique des critères selon la saisie
- Affichage dynamique et verrouillage des critères selon la date et le jalon
- Bannière contextuelle enrichie et synchronisée
- Logique métier d’origine préservée

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

**Aucune modification de code ne sera faite sans validation explicite de ce plan.**

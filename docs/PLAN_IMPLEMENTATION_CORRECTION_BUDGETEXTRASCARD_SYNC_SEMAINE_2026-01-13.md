# Correction — Synchronisation Budget Extras avec la Semaine de Référence Sélectionnée

## Titre de la tâche
Corriger la synchronisation du composant BudgetExtrasCard pour qu’il affiche et calcule le budget extras strictement sur la semaine correspondant à la date sélectionnée par l’utilisateur, et afficher explicitement la période de référence sur la carte budget.

---

## Description précise de la modification attendue
- Le composant BudgetExtrasCard doit utiliser la prop `selectedDate` (si fournie) pour calculer la semaine de référence (lundi-dimanche) pour tous ses calculs et affichages : budget, extras consommés, messages, badges, etc.
- La période de la semaine de référence (ex : « Semaine du 05/01/2026 au 11/01/2026 ») doit être affichée en haut de la carte budget, comme sur l’encart jaune.
- Tous les extras listés et le calcul du budget doivent être strictement filtrés sur cette semaine.
- Si aucune date n’est sélectionnée, fallback sur la date du jour.
- Garantir la cohérence visuelle et fonctionnelle sur toute la carte (messages, badges, etc.).

---

## Fichiers concernés
- /components/BudgetExtrasCard.js
- /pages/suivi.js (propagation de selectedDate déjà présente)

---

### Etape 1 — Audit des risques préalable
1. Risque de régression sur le filtrage des extras (mauvaise semaine affichée).
2. Risque UX : confusion si la période affichée n’est pas claire ou ne correspond pas à la sélection utilisateur.
3. Risque technique : oubli d’utiliser la prop selectedDate dans tous les calculs (budget, extras, messages).
4. Risque de hooks React mal placés (ordre, dépendances, initialisation).
5. Risque de perte de robustesse si fallback mal géré.
6. Risque de conflit avec d’autres composants utilisant la même logique de période.
7. Vérification stricte de la déclaration des hooks en haut du composant.
8. Consulter le fichier d’anomalies rollback avant toute modification.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] selectedDate bien reçu en prop et utilisée partout où nécessaire ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Tous les hooks déclarés en haut du composant.

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation ➔ logique ➔ handlers ➔ rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Documentation claire de chaque étape
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback.
2. Créer une checklist de contrôle à appliquer avant le codage.
3. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. Si anomalie/bug identifié, proposition immédiate de rollback à confirmer avec l’utilisateur.

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — Point de vigilance
1. Vérifier que tous les calculs et affichages utilisent bien la semaine de référence (selectedDate).
2. S’assurer que la période affichée est toujours cohérente avec la sélection utilisateur.
3. Contrôler la robustesse du fallback (date du jour si selectedDate absent).
4. Vérifier la synchronisation des extras consommés et du budget sur la bonne semaine.
5. Relire tous les hooks et dépendances pour éviter toute anomalie de déclaration ou d’ordre.

---

### Etape 7 — Proposition de rollback
- Si anomalie détectée, retour immédiat à la version précédente, ajout d’une entrée dans le fichier rollback, et rapport à l’utilisateur.

---

### Etape 8 — Rapport Markdown Copilot
- Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.).
- Ce rapport doit permettre une validation éclairée, claire et synthétique.

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

**Aucune modification de code ne sera produite tant que ce plan n’aura pas été validé explicitement.**

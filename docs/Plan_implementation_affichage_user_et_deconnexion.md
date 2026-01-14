# 🟢 PLAN D’IMPLÉMENTATION — Correction affichage utilisateur et gestion déconnexion

## Titre de la tâche
Corriger l’affichage du nom/prénom/email de l’utilisateur connecté et la gestion du bouton de déconnexion dans la barre de navigation.

---

## Description précise de la modification attendue
- Afficher dynamiquement le nom ou prénom (ou email en fallback) de l’utilisateur connecté dans la barre de navigation.
- Après déconnexion, afficher une confirmation visuelle et changer le bouton en « Se connecter ».
- Garantir la réinitialisation de l’état utilisateur dans l’UI après déconnexion.
- Gérer tous les cas d’usage (nouvel utilisateur, absence de metadata, session expirée, etc.).

---

## Fichiers concernés
- `/components/Navigation.js`
- `/contexts/AuthContext.js`

---

### Etape 1 — Audit des risques préalable
1. Risque technique : mauvaise gestion du fallback (user_metadata absent, email non disponible).
2. Risque UX : absence de feedback après déconnexion, confusion sur l’état de connexion.
3. Risque sécurité : session non réinitialisée, affichage d’informations sensibles.
4. Risque robustesse : hooks mal placés, variables d’état utilisées avant déclaration.
5. Risque régression : perte de la fonctionnalité existante, bugs sur la navigation.
6. Risque accessibilité : absence de message ou feedback visuel.
7. Vérification stricte de l’ordre des hooks et de la déclaration des variables d’état.
8. Lecture du fichier anomalies rollback pour anticiper les erreurs similaires.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] user, loading, session bien gérés dans le contexte et le composant
- [ ] Fallbacks testés pour tous les cas d’usage

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation, logique, handlers, rendu
- [ ] Vérification de la présence et de l’initialisation de toutes les fonctions utilisées dans le rendu
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Documentation claire de chaque étape et validation utilisateur
- [ ] Relecture manuelle obligatoire des hooks et variables
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées du fichier anomalies rollback pour identifier les points de vigilance.
2. Créer une checklist de contrôle adaptée à la correction.
3. Vérifier qu’aucune variable d’état ou de hook n’est utilisée avant sa déclaration.
4. Proposer un rollback immédiat en cas d’anomalie détectée.

---

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 13/01/2026, démarrage

---

### Etape 6 — Point de vigilance
- Risque de fallback non fonctionnel (user_metadata absent)
- Risque de session non réinitialisée après déconnexion
- Risque d’absence de feedback visuel
- Risque de hooks mal placés
- Risque de régression sur la navigation
- Checklist de vérification à appliquer avant codage

---

### Etape 7 — Proposition de rollback
- Si une anomalie ou bug est détecté, retour à l’état du code avant la modification, ajout d’une entrée dans le fichier anomalies rollback avec date et heure.

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Pas d’affichage du nom/prénom/email utilisateur
- Bouton « Se déconnecter » statique, pas de feedback
- Session non réinitialisée visuellement

#### APRÈS (attendu)
- Affichage dynamique du nom/prénom/email utilisateur
- Bouton change en « Se connecter » après déconnexion
- Feedback visuel ou message de confirmation
- Session réinitialisée dans l’UI

---

### Etape 9 — Validation explicite de l’utilisateur
- [ ] Plan validé par l’utilisateur à la date : ___

---

# ⚠️ AUCUNE MODIFICATION DE CODE AVANT VALIDATION EXPLICITE DU PLAN PAR L’UTILISATEUR

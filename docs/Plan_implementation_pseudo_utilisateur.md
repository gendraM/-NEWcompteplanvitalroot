# 🟢 PLAN D’IMPLÉMENTATION — Affichage et gestion du pseudo utilisateur

## Titre de la tâche
Afficher uniquement le pseudo choisi par l’utilisateur dans la barre de navigation, demander le pseudo à l’inscription ou après connexion si absent.

---

## Description précise de la modification attendue
- Afficher le pseudo de l’utilisateur connecté dans la barre de navigation (pas le nom, prénom ou email).
- Demander le pseudo à l’inscription (champ obligatoire ou fortement incitatif).
- Si le pseudo n’a pas été renseigné à l’inscription, afficher une notification ou un prompt après connexion pour inviter l’utilisateur à le saisir.
- Mettre à jour le profil utilisateur avec le pseudo saisi.
- Gérer tous les cas d’usage (inscription, migration, absence de pseudo, modification du pseudo).

---

## Fichiers concernés
- `/components/Navigation.js`
- `/pages/signup.js`
- `/contexts/AuthContext.js`
- `/components/ModalPseudo.js` (nouveau composant pour la saisie du pseudo si besoin)

---

### Etape 1 — Audit des risques préalable
1. Risque technique : absence de pseudo dans user_metadata, migration d’anciens comptes.
2. Risque UX : utilisateur bloqué ou frustré si pseudo obligatoire non renseigné.
3. Risque sécurité : modification du profil, validation du pseudo côté serveur.
4. Risque robustesse : hooks mal placés, variables d’état utilisées avant déclaration.
5. Risque régression : perte de la fonctionnalité existante, bugs sur la navigation ou l’inscription.
6. Risque accessibilité : notification ou prompt non visible ou non accessible.
7. Vérification stricte de l’ordre des hooks et de la déclaration des variables d’état.
8. Lecture du fichier anomalies rollback pour anticiper les erreurs similaires.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] user, loading, session bien gérés dans le contexte et le composant
- [ ] Fallbacks testés pour tous les cas d’usage
- [ ] Champ pseudo bien présent à l’inscription
- [ ] Notification ou prompt fonctionnel après connexion si pseudo absent

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
- Risque de pseudo absent ou non mis à jour
- Risque de session non réinitialisée après modification du pseudo
- Risque d’absence de feedback visuel
- Risque de hooks mal placés
- Risque de régression sur la navigation ou l’inscription
- Checklist de vérification à appliquer avant codage

---

### Etape 7 — Proposition de rollback
- Si une anomalie ou bug est détecté, retour à l’état du code avant la modification, ajout d’une entrée dans le fichier anomalies rollback avec date et heure.

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Pas d’affichage du pseudo utilisateur
- Pas de champ pseudo à l’inscription
- Pas de notification ou prompt après connexion si pseudo absent

#### APRÈS (attendu)
- Affichage dynamique du pseudo utilisateur dans la barre de navigation
- Champ pseudo présent et fonctionnel à l’inscription
- Notification ou prompt après connexion si pseudo absent
- Mise à jour du profil utilisateur avec le pseudo

---

### Etape 9 — Validation explicite de l’utilisateur
- [ ] Plan validé par l’utilisateur à la date : ___

---

# ⚠️ AUCUNE MODIFICATION DE CODE AVANT VALIDATION EXPLICITE DU PLAN PAR L’UTILISATEUR

# 🟢 PLAN D’IMPLÉMENTATION — Correction synchronisation user/session + debug

## Titre de la tâche
Corriger la synchronisation du contexte utilisateur/session après modification du pseudo et déconnexion, et ajouter un debug visuel pour confirmer le diagnostic et l’efficacité des corrections.

---

## Description précise de la modification attendue
- Garantir la mise à jour immédiate du contexte utilisateur (user) et de la session après modification du pseudo ou déconnexion.
- Afficher dynamiquement le pseudo et l’état de connexion/déconnexion dans la barre de navigation.
- Ajouter un composant/debug visuel (ex : panneau d’état) affichant en temps réel le user, session, pseudo, et l’état de connexion pour confirmer le diagnostic et la correction.
- Tester le workflow complet (inscription, connexion, modification du pseudo, déconnexion) pour chaque cas d’usage.

---

## Fichiers concernés
- `/components/Navigation.js`
- `/contexts/AuthContext.js`
- `/components/PseudoForm.js`
- `/components/UserDebugPanel.js` (nouveau composant debug)

---

### Etape 1 — Audit des risques préalable
1. Risque technique : contexte React non synchronisé avec Supabase après updateUser ou signOut.
2. Risque UX : affichage incohérent, absence de feedback, confusion sur l’état de connexion.
3. Risque sécurité : session non réinitialisée, affichage d’informations sensibles.
4. Risque robustesse : hooks mal placés, variables d’état utilisées avant déclaration.
5. Risque régression : perte de la fonctionnalité existante, bugs sur la navigation ou l’inscription.
6. Risque accessibilité : debug visuel non accessible ou trop intrusif.
7. Vérification stricte de l’ordre des hooks et de la déclaration des variables d’état.
8. Lecture du fichier anomalies rollback pour anticiper les erreurs similaires.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] user, loading, session bien gérés dans le contexte et le composant
- [ ] Fallbacks testés pour tous les cas d’usage
- [ ] Synchronisation du contexte après updateUser et signOut
- [ ] Debug visuel fonctionnel et accessible

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
- Risque de contexte non synchronisé après updateUser/signOut
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
- Contexte user/session non synchronisé après modification
- Affichage du pseudo et du bouton de déconnexion incohérent
- Pas de debug visuel pour confirmer le diagnostic

#### APRÈS (attendu)
- Contexte user/session synchronisé en temps réel
- Affichage dynamique du pseudo et du bouton de déconnexion
- Debug visuel affichant user, session, pseudo, état de connexion

---

### Etape 9 — Validation explicite de l’utilisateur
- [ ] Plan validé par l’utilisateur à la date : ___

---

# ⚠️ AUCUNE MODIFICATION DE CODE AVANT VALIDATION EXPLICITE DU PLAN PAR L’UTILISATEUR

# 🟢 PLAN D’IMPLÉMENTATION — MIGRATION AUTHENTIFICATION SUPABASE & AFFICHAGE PSEUDO (CONFORME TEMPLATE)

## Titre de la tâche
Migration Authentification Supabase et Affichage Pseudo Utilisateur — Centralisation, Synchronisation, Debug Panel

---

## Description précise de la modification attendue
- Centraliser la gestion du pseudo utilisateur dans le contexte React (AuthContext).
- Garantir la synchronisation du pseudo après chaque action critique (inscription, modification, déconnexion).
- Afficher le pseudo dans la navigation à partir du contexte, jamais via localStorage ou window.
- Ajouter un panneau de debug pour visualiser l’état du user/session/pseudo en temps réel.
- Forcer le re-fetch du user/session après toute modification du pseudo.
- Documenter chaque étape et chaque test dans le fichier rollback.

---

## Fichiers concernés
- /contexts/AuthContext.js
- /components/Navigation.js
- /components/UserDebugPanel.js
- /components/PseudoForm.js
- /pages/signup.js
- /docs/Anomalie roll back

---

### Etape 1 — Audit des risques préalable
1. Risques techniques : Boucle infinie, référence instable, hydration mismatch, perte de synchronisation pseudo/session.
2. Risques UX : Pseudo non affiché, bouton logout non réactif, confusion utilisateur.
3. Risques robustesse : Perte du pseudo après modification, affichage incohérent après reload.
4. Risques sécurité : Fuite d’information via localStorage, mauvaise isolation multi-utilisateur.
5. Vérification stricte de l’ordre des hooks dans chaque composant (useState, useEffect, etc.).
6. Lecture du fichier Anomalie roll back pour identifier les erreurs similaires (boucle infinie, state bloqué, hydration mismatch, etc.).
7. Points de vigilance : Ne jamais utiliser localStorage/window dans le render initial, stabiliser toutes les références passées en prop, synchroniser le contexte après chaque action critique.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] useCallback importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Toutes les fonctions/handlers initialisés avant usage ?
- [ ] Aucun accès à localStorage/window dans le render initial

---

### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks
- [ ] Séparation stricte des étapes : initialisation, logique, handlers, rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée
- [ ] Relecture manuelle obligatoire des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] J’ai relu, ligne par ligne et **manuellement**, la déclaration de tous les useState et useEffect AVANT chaque appel.

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées du fichier Anomalie roll back pour anticiper les risques (boucle infinie, state bloqué, hydration mismatch, etc.).
2. Créer une checklist de contrôle à appliquer avant codage (voir point de vigilance).
3. S’assurer qu’il n’y a aucune anomalie bloquante avant d’implémenter.
4. Si anomalie détectée, proposer rollback et documenter dans Anomalie roll back.

---

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 13/01/2026, plan rédigé

---

### Etape 6 — Point de vigilance
- Boucle infinie due à référence instable (onChangeChampsRepas, expressions inline)
- Hydration mismatch (localStorage/window dans le render initial)
- State bloqué ou incohérent (selectedDate, pseudo, session)
- Synchronisation du contexte après modification pseudo/session
- Checklist : stabiliser toutes les références, centraliser le pseudo, synchroniser le contexte, tester tous les workflows critiques

---

### Etape 7 — Proposition de rollback
- Si une anomalie ou bug est détecté lors de l’implémentation, retour à l’état initial du code avant modification, ajout d’une entrée dans Anomalie roll back avec date/heure et contexte.

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Pseudo parfois non affiché, session non synchronisée, bugs de boucle infinie et hydration mismatch
#### APRÈS
- Pseudo affiché à partir du contexte, session synchronisée après chaque action critique, debug panel en place, plus de boucle infinie ni de hydration mismatch

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

# 🟢 Amélioration continue Copilot
- Toujours relier explicitement chaque action utilisateur à la mise à jour des états métier.
- Relecture manuelle obligatoire à chaque étape.
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel.
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat.
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète.
- Ajouter un contrôle visuel ou un feedback à chaque action clé.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback.
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.
- Se parler à soi-même (Copilot/humain) : « Ai-je bien relié chaque étape du plan au code ? Ai-je testé le workflow complet ? Ai-je documenté chaque action et chaque anomalie ? »

# FIN DU PLAN (CONFORMITÉ 100%)

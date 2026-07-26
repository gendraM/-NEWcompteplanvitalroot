# 🟢 PLAN D’IMPLÉMENTATION — INCLUSION SÉCURISÉE DE NAVIGATION SUR TOUTES LES PAGES (CONFORME TEMPLATE)

## Titre de la tâche
Inclure le composant Navigation dans le layout global pour garantir son affichage sur toutes les pages, en respectant l’ordre des hooks et le template strict.

---

## Description précise de la modification attendue
- Corriger l’inclusion de Navigation dans _app.js pour qu’il soit monté sur toutes les pages.
- S’assurer que tous les hooks (useAuth, useState, useEffect, etc.) sont déclarés en haut du composant Navigation, avant toute utilisation de leurs variables.
- Garantir l’affichage du pseudo, de la modale pseudo et du debug panel sur toutes les pages.
- Documenter chaque étape et chaque test dans le fichier rollback.

---

## Fichiers concernés
- /pages/_app.js
- /components/Navigation.js
- /docs/Anomalie roll back

---

### Etape 1 — Audit des risques préalable
1. Risque technique : ReferenceError si un hook est utilisé avant déclaration.
2. Risque UX : Absence d’affichage du pseudo ou de la modale pseudo.
3. Risque robustesse : Navigation non monté sur certaines pages.
4. Risque de régression sur le layout global.
5. Lecture du fichier Anomalie roll back pour identifier les erreurs similaires.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] useAuth importé et appelé AVANT tout useEffect ou usage de user/loading ?
- [ ] Toutes les variables présentes AVANT leur usage ?

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Tous les hooks déclarés en haut du composant Navigation.
- [ ] Aucune variable d’état ou de hook utilisée avant sa déclaration.
- [ ] Navigation inclus dans _app.js AVANT le composant principal.
- [ ] Test du rendu sur toutes les pages.
- [ ] Garantir l'unicité des variables globales et de bloc dans tout le fichier (éviter les conflits et redéfinitions).
- [ ] Vérification de la présence de toute déclaration en double, surtout en fin de fichier ou lors d’ajouts massifs.
- [ ] Audit complet du fichier, pas seulement du tableau principal, pour détecter les conflits de nommage.
- [ ] Ajout systématique d’une étape “vérification des déclarations de variables et exports” dans le contrôle qualité.
- [ ] Utilisation d’outils de linting et d’analyse statique pour détecter les redéfinitions et conflits.
- [ ] Documentation de chaque correction d’anomalie, même hors du scope direct de l’enrichissement.
- [ ] Documentation claire de chaque étape et validation utilisateur obligatoire.

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d’anomalies rollback pour anticiper les risques.
2. Créer une checklist de contrôle à appliquer avant codage.
3. S’assurer qu’il n’y a aucune anomalie bloquante avant d’implémenter.
4. Si anomalie détectée, proposer rollback et documenter dans Anomalie roll back.

---

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 13/01/2026, plan rédigé

---

### Etape 6 — Point de vigilance
- ReferenceError si ordre des hooks non respecté.
- Navigation non monté sur toutes les pages.
- Checklist : hooks en haut, Navigation dans _app.js, test sur toutes les pages.

---

### Etape 7 — Proposition de rollback
- Si une anomalie ou bug est détecté lors de l’implémentation, retour à l’état initial du code avant modification, ajout d’une entrée dans Anomalie roll back avec date/heure et contexte.

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- ReferenceError: Cannot access 'user' before initialization, Navigation non monté partout.
#### APRÈS
- Navigation monté sur toutes les pages, plus d’erreur d’ordre des hooks, pseudo et modale pseudo affichés correctement.

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

# 🟢 Amélioration continue Copilot
- Relecture manuelle obligatoire à chaque étape.
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel.
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat.
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète.
- Ajouter un contrôle visuel ou un feedback à chaque action clé.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback.
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.

# FIN DU PLAN (CONFORMITÉ 100%)

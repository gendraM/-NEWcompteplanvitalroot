# PLAN D’IMPLÉMENTATION — PHASE 1 : Ajout d’aliment personnalisé lors de la saisie

## Titre de la tâche
Ajout d’aliment personnalisé lors de la saisie et intégration dans l’autocomplete (RepasBloc.js, SaisieRepas.js, etc.)

---

## Description précise de la modification attendue
Permettre à l’utilisateur, lors de la saisie d’un repas, d’ajouter un aliment qui n’existe pas dans le référentiel global, via un formulaire guidé, avec validation et enrichissement du référentiel utilisateur. L’aliment devient disponible immédiatement dans l’autocomplete pour l’utilisateur. Garantir la qualité et la cohérence des données saisies (nom, catégorie, portion, kcal, QN, etc.) et guider l’utilisateur pour limiter les erreurs.

---

## Fichiers concernés
- /components/RepasBloc.js
- /components/SaisieRepas.js
- /components/FormAjoutAliment.js (nouveau)
- /lib/useUserReferentiel.js (nouveau)
- /data/foods_user.js (mock ou accès Supabase)
- /styles/FormAjoutAliment.module.css (nouveau)

---

### Etape 1 — Audit des risques préalable
1. Risques techniques :
   - Régression sur l’autocomplete (fusion global/user)
   - Problème de validation des données (doublons, incohérences QN, portions)
   - Problème d’UX si le parcours d’ajout est trop complexe
   - Sécurité : injection de données non filtrées
   - Conflit de hooks React (ordre, initialisation)
2. Vérification stricte de l’ordre des hooks dans RepasBloc.js et SaisieRepas.js
3. Points de vigilance :
   - Validation temps réel sur chaque champ
   - Séparation stricte des référentiels (global/user)
   - Feedback utilisateur clair à chaque étape
   - Respect du flow initialisation ➔ logique ➔ handler ➔ rendu
4. Consulter le fichier d’anomalies rollback avant toute modification

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] useCallback/imports nécessaires ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Les nouveaux composants sont bien importés et utilisés

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation ➔ logique ➔ handlers ➔ rendu
- [ ] Vérification de la présence de tous les handlers/fonctions utilisés dans le rendu
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Documentation claire de chaque étape
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d’anomalies rollback
2. Créer une checklist de contrôle adaptée
3. S’assurer qu’il n’y a aucune anomalie bloquante avant d’implémenter
4. Proposer un rollback immédiat en cas de bug détecté

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — Point de vigilance
1. Rapport lié à la lecture des anomalies rollback
2. Liste des erreurs similaires potentielles (ordre des hooks, fusion référentiels, validation QN, etc.)
3. Checklist de vérification/point de vigilance à appliquer

---

### Etape 7 — Proposition de rollback
- Décrire l’action de rollback, le contexte, l’alternative sûre
- Ajouter l’entrée dans le fichier ANOMALIE rollback

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- L’utilisateur ne peut pas ajouter d’aliment personnalisé
- L’autocomplete ne propose que le référentiel global
- Pas de formulaire guidé ni de validation avancée

#### APRÈS
- L’utilisateur peut ajouter un aliment personnalisé via un formulaire guidé
- L’aliment est disponible immédiatement dans l’autocomplete (fusion global/user)
- Validation et guidage sur chaque champ (nom, catégorie, portion, QN…)
- Séparation stricte des référentiels, feedback utilisateur à chaque étape

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

# Rappel :
- NE PAS MODIFIER ce plan sans validation explicite
- NE PAS PRODUIRE DE CODE tant que ce plan n’est pas validé
- Relire le template et ce plan avant toute implémentation

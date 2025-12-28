# PLAN D’IMPLÉMENTATION — Historique des préparations au jeûne

## Titre de la tâche
Créer une page dédiée à l’historique des préparations au jeûne, avec statistiques, comparaison automatique, et notes personnelles modifiables.

---

## Description précise de la modification attendue
- Ajouter une page `/historique-preparations-jeune` listant toutes les préparations terminées.
- Afficher pour chaque préparation : dates, taux de réussite, nombre de critères validés, message perso, axes d’amélioration, conseils, etc.
- Statistiques globales : nombre total, moyenne de critères validés, taux de réussite, graphique d’évolution, critères les plus/moins validés.
- Comparaison automatique avec la préparation précédente (progression, régression).
- Détail d’une préparation : modal/page avec tous les critères, conseils, axes, message perso, et zone de notes personnelles modifiables après coup.
- Sauvegarde des notes personnelles (Supabase si connecté, localStorage sinon).

---

## Fichiers concernés
- `/pages/historique-preparations-jeune.js`
- `/components/CartePreparationJeune.js`
- `/components/DetailPreparationJeune.js`
- `/lib/preparationsJeune.js` (gestion des données)
- `/lib/statistiquesPreparationsJeune.js` (calculs statistiques)
- `/lib/comparePreparationsJeune.js` (comparaison)
- `/lib/notesPreparationJeune.js` (notes perso)

---

### Etape 1 — Audit des risques préalable
1. Risque technique : mauvaise gestion des hooks, SSR, ou accès localStorage côté serveur.
2. Risque UX : surcharge visuelle, trop d’informations, navigation complexe.
3. Risque sécurité : fuite de notes perso si non protégées côté serveur.
4. Risque régression : perte de données existantes lors de la migration.
5. Risque robustesse : non synchronisation entre localStorage et Supabase.
6. Risque accessibilité : navigation modale non accessible clavier.
7. Vérification stricte de l’ordre des hooks React (useState, useEffect, etc.)
8. Lecture du fichier `docs/Anomalie roll back` avant toute modif.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Fonctions utilitaires importées et testées

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React sont déclarés uniquement en haut du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation ➔ logique ➔ handlers ➔ rendu
- [ ] Vérification de la présence de toutes les fonctions/handlers utilisés dans le rendu
- [ ] Ordre et portée logiques stricts
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie
- [ ] Documentation claire de chaque étape
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d'anomalies dans `docs/Anomalie roll back` pour anticiper les risques.
2. Créer une checklist de contrôle adaptée à la mission.
3. Vérifier qu’aucune anomalie bloquante n’est présente avant d’implémenter.
4. Proposer un rollback immédiat en cas de bug, documenter dans le fichier d’anomalie.

---

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis : 0 %
- Historique des mises à jour : 27/12/2025, plan rédigé

---

### Etape 6 — Point de vigilance
- Problème potentiel : hook dans une boucle ou condition
- Risque SSR : accès localStorage côté serveur
- Risque UX : surcharge visuelle
- Risque robustesse : synchronisation notes perso
- Anomalie rollback 22/11/2025 : double déclaration de useEffect ➔ contrôle obligatoire
- Checklist : lecture manuelle de tous les hooks, test accessibilité modale, test multi-device

---

### Etape 7 — Proposition de rollback
- Rollback si bug SSR, bug notes perso, ou perte de données
- Ajout d’une entrée dans `docs/Anomalie roll back` avec date/heure et contexte

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Pas de page historique des préparations
- Pas de statistiques ni de comparaison automatique
- Pas de notes perso modifiables

#### APRÈS
- Page `/historique-preparations-jeune` créée
- Statistiques globales et graphiques ajoutés
- Comparaison automatique avec la préparation précédente
- Détail complet d’une préparation + notes perso modifiables

---

### Etape 9 — Validation explicite de l’utilisateur
- [ ] Plan validé par l’utilisateur à la date : ___

---

**Rappel : Copilot NE PEUT PAS générer de code avant validation explicite du plan, et doit se conformer à cette checklist/détail à CHAQUE tâche.**

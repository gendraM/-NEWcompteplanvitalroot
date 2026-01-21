# PLAN D’IMPLÉMENTATION — Historique des préparations au jeûne (version conforme template)

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
- Ajout d’un bouton “Voir mon historique de préparations” en haut de la page `/preparation-jeune.js` (juste après le header).

---

## Fichiers concernés
- `/pages/historique-preparations-jeune.js`
- `/components/CartePreparationJeune.js`
- `/components/DetailPreparationJeune.js`
- `/lib/preparationsJeune.js`
- `/lib/statistiquesPreparationsJeune.js`
- `/lib/comparePreparationsJeune.js`
- `/lib/notesPreparationJeune.js`
- `/pages/preparation-jeune.js` (ajout du bouton d’accès à l’historique)

---

### Etape 1 — Audit des risques préalable
1. Risque technique : mauvaise gestion des hooks, SSR, ou accès localStorage côté serveur.
2. Risque UX : surcharge visuelle, trop d’informations, navigation complexe.
3. Risque sécurité : fuite de notes perso si non protégées côté serveur.
4. Risque régression : perte de données existantes lors de la migration.
5. Risque robustesse : non synchronisation entre localStorage et Supabase.
6. Risque accessibilité : navigation modale non accessible clavier.
7. Vérification stricte de l’ordre des hooks React (useState, useEffect, etc.) — tous les hooks doivent être déclarés uniquement en haut du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc.
8. Lecture du fichier `docs/Anomalie roll back` avant toute modification.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Fonctions utilitaires importées et testées

---

### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc.
- [ ] Séparation stricte des étapes : d’abord initialisation (useState, useEffect…), puis logique calculée, puis handlers/fonctions, puis rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Relecture manuelle obligatoire des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation. NE PAS se baser sur la mémoire du modèle Copilot.
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

---

### Etape 4 — Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)
1. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback afin d’identifier les points de vigilance pour anticiper le risque d’erreur similaire lors du codage de cette modification.
2. Suite à cette analyse, créer une checklist de contrôle à appliquer avant le codage pour s'assurer d'un codage conforme, à ajouter dans la section Point de vigilance.
3. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. Si à ce stade une anomalie/bug est identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée (pour revenir à l’état où il n’y avait pas de bug) à confirmer avec l’utilisateur (ou revenir à l’état initial du code avant modification), documenter automatiquement dans le fichier Anomalie rollback avec date et heure.

---

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 28/12/2025, plan enrichi et conforme

---

### Etape 6 — Point de vigilance
1. Rapport lié à la lecture des entrées du fichier anomalies rollback adapté à la mise à jour actuelle (cf. Etape 4).
2. Lister les erreurs similaires que la modification pourrait générer, suite au retour d’expérience documenté dans le fichier, afin de les éviter.
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu.

---

### Etape 7 — Proposition de rollback
- Pour tout risque ou anomalie détecté : décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
- Ajouter cette donnée dans le fichier ANOMALIE rollback : date, heure, détail complet pour traçabilité.
- Aucune suppression dans le fichier, toujours ajouter à la suite.

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Pas de page historique des préparations
- Pas de statistiques ni de comparaison automatique
- Pas de notes perso modifiables
- Pas de bouton d’accès à l’historique

#### APRÈS
- Page `/historique-preparations-jeune` créée
- Statistiques globales et graphiques ajoutés
- Comparaison automatique avec la préparation précédente
- Détail complet d’une préparation + notes perso modifiables
- Bouton d’accès à l’historique ajouté en haut de la page préparation jeune

---

### Etape 9 — Validation explicite de l’utilisateur
- [ ] Plan validé par l’utilisateur à la date : ___

---

Ce plan est strictement conforme à la template et prêt pour analyse/validation.
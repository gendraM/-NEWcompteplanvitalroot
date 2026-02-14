# 🟢 PLAN D’IMPLÉMENTATION COPILOT — Correction des anomalies Suivi Alimentaire

## Titre de la tâche
Correction des 3 anomalies critiques du suivi alimentaire :
1. Affichage et synchronisation du budget extras avec la bonne période
2. Feedback utilisateur après validation de la semaine
3. Calcul dynamique et cohérent du palier extras

---

## Description précise de la modification attendue
- **1. Budget extras** : Afficher la période (dates de la semaine) dans l’encart budget extras, et garantir que le calcul des extras et du budget est bien synchronisé avec la semaine courante (lundi-dimanche selon la date sélectionnée).
- **2. Feedback validation** : Afficher systématiquement un feedback (modal ou message) après validation de la semaine, même si la semaine a déjà été validée ou en cas d’erreur.
- **3. Palier extras** : Corriger la logique métier pour que le palier extras soit calculé dynamiquement selon la progression réelle, la régularité de saisie et le respect des quotas, et ne soit jamais fixé à 1 de façon arbitraire.

---

## Fichiers concernés
- `/pages/suivi.js`
- `/components/BudgetExtrasCard.js`
- `/lib/routeurPoids.js`
- `/lib/validationSemaine.js`
- `/components/ModalFeedbackValidation.js`
- `/docs/AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md` (pour traçabilité)

---

### Etape 1 — Audit des risques préalable
1. Risque de calcul erroné de la période (affichage ou logique) ➔ incohérence UX, confusion utilisateur
2. Risque d’absence de feedback ➔ frustration, perte de confiance, non-validation du parcours
3. Risque de palier incorrect ➔ progression bloquée, perte de motivation, non-respect des règles métier
4. Risque technique : hooks React mal placés, dépendances non respectées, SSR/rendu cassé
5. Risque de régression sur la logique existante (extras, feedback, palier)
6. Risque de perte de données ou d’historique (rollback à prévoir)
7. Risque d’accessibilité (feedback non visible, période non lisible)

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?

---

### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc. (respect des règles officielles des hooks)
   - [ ] **Aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks (ex : tableau de dépendances de useEffect).**
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
- [ ] Relecture **manuelle obligatoire** des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation. NE PAS se baser sur la mémoire du modèle Copilot.
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
- [ ] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — Point de vigilance
1. Rapport lié à la lecture des entrées du fichier anomalies rollback adapté à la mise à jour actuelle (cf. Etape 4).
2. Lister les erreurs similaires que la modification pourrait générer, suite au retour d’expérience documenté dans le fichier, afin de les éviter.
   - **Vérifier qu’aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks (ex : tableau de dépendances de useEffect).**
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu.

---

### Etape 7 — Proposition de rollback
- Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
- Ajouter cette donnée dans le fichier ANOMALIE rollback : date, heure, détail complet pour traçabilité.
- **Aucune suppression dans le fichier, toujours ajouter à la suite.**

---

### Etape 8 — Rapport Markdown Copilot
1. Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.).
2. Ce rapport doit permettre une validation éclairée, claire et synthétique.
3. À valider par l’utilisateur avant code.

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

## 🟢 Amélioration continue Copilot
- Toujours relier explicitement chaque action utilisateur (ex : validation de la modale) à la mise à jour des états métier (activation, initialisation des critères, affichage dynamique).
- **Relecture manuelle obligatoire** à chaque étape : ne pas supposer que la mémoire Copilot suffit, lecture ligne à ligne humaine imposée.
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel (affichage, activation, réinitialisation, feedback).
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat (capture, rapport d’exécution).
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète (affichage, console, tests).
- Ajouter un contrôle visuel ou un feedback à chaque action clé pour garantir la conformité UX et métier.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback (ajout à la fin du fichier, jamais suppression).
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.
- Se parler à soi-même (Copilot/humain) : « Ai-je bien relié chaque étape du plan au code ? Ai-je testé le workflow complet ? Ai-je documenté chaque action et chaque anomalie ? »

---

# ⚠️ Copilot NE PEUT PAS générer de code avant validation explicite du plan, et doit se conformer à cette checklist/détail à CHAQUE tâche.

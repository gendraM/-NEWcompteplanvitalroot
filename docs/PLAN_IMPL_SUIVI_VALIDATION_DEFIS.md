# 🟢 PLAN D’IMPLÉMENTATION — SUIVI & VALIDATION DES DÉFIS CRISTALLISATION

## Titre de la tâche
Implémenter le suivi de progression et la validation quotidienne des défis de cristallisation (tracking, badge terminé, désactivation validation si déjà validé)

---

## Description précise de la modification attendue
Permettre à l’utilisateur de suivre la progression de chaque défi généré (cristallisation), de valider chaque défi une fois par jour, d’afficher un badge “Terminé” si le défi est validé pour la journée, et de désactiver le bouton de validation si déjà validé. Le suivi doit être persistant (localStorage) et robuste (aucune perte de progression, UX claire, aucune régression sur la génération ou l’affichage des défis).

---

## Fichiers concernés
- /pages/cristallisation.js
- /lib/defisCristallisationGenerator.js
- /components/DefiCard.js (à créer ou enrichir)

---

### Etape 1 — Audit des risques préalable
1. Risque de perte de progression utilisateur (localStorage mal géré, clé écrasée, format non rétrocompatible)
2. Risque UX : confusion si validation non visible ou non persistée
3. Risque technique : hooks React mal placés, non-respect des règles officielles (déclaration en haut du composant)
4. Risque de régression sur la génération dynamique des défis
5. Risque de conflit avec l’existant (affichage, debug, reset)
6. Risque accessibilité : bouton non accessible, feedback visuel absent
7. Risque de double validation ou de validation multiple par jour
8. Risque de non-robustesse sur la gestion des dates (validation quotidienne)
9. Risque de non-synchronisation entre l’état React et le localStorage
10. Risque de perte de fonctionnalité existante (génération, debug, reset)

Points de vigilance à intégrer dans la checklist :
- Vérifier la robustesse du stockage local (clé, format, rétrocompatibilité)
- Vérifier la synchronisation état React <-> localStorage
- Vérifier la gestion des dates (validation quotidienne)
- Vérifier l’accessibilité et le feedback visuel
- Vérifier la non-régression sur la génération/affichage des défis
- Vérifier la non-perte de données/progression
- Vérifier la conformité des hooks React (déclaration en haut)
- Consulter le fichier d’anomalies rollback avant toute modification

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Synchronisation état React <-> localStorage vérifiée
- [ ] Gestion des dates (validation quotidienne) vérifiée
- [ ] Feedback visuel (badge, bouton désactivé) présent
- [ ] Accessibilité des boutons et feedbacks

---

### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc.
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
4. _Si à ce stade une anomalie/bug est identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée (pour revenir à l’état où il n’y avait pas de bug) à confirmer avec l’utilisateur (ou revenir à l’état initial du code avant modification), documenter automatiquement dans le fichier Anomalie rollback avec date et heure._

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
_Pour tout risque ou anomalie détecté :_
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

## 📝 TODO pour finaliser le plan précédent
- [ ] Relire et compléter le plan d’implémentation précédent pour le suivi des défis (vérifier chaque étape, checklist, conformité template)
- [ ] Ajouter les points manquants (audit, checklist, rollback, rapport, validation)
- [ ] Demander validation utilisateur avant toute implémentation

---

**Rappel : AUCUNE modification de code ne doit être produite tant que l’utilisateur n’a pas validé explicitement ce plan d’implémentation rempli et relu par Copilot.**

---

**Comparaison template/plan : à faire AVANT toute implémentation, relire chaque étape du template et pointer tout écart à l’utilisateur pour validation.**

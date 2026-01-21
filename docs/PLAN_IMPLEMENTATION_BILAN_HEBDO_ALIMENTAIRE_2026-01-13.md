# PLAN D’IMPLÉMENTATION — Bilan Hebdomadaire Alimentaire (Validation Semaine)

## Titre de la tâche
Ajouter un bilan hebdomadaire motivant et pédagogique, généré uniquement lors de la validation de la semaine (dimanche soir), archivé et consultable, avec axes d’analyse et bouton “En savoir plus”.

---

## Description précise de la modification attendue
- À la validation de la semaine (action explicite, dimanche soir après le dîner), afficher une modale bilan avec :
  - Titre, période, verbatim motivationnel
  - Nombre d’extras consommés sur la semaine, % du budget hebdo
  - Axes d’analyse : calories, progression, points forts, axes d’amélioration
  - Mot doux de fin
  - Bouton “En savoir plus” (ouvre le détail mensuel, courbe, historique)
- Archiver le bilan pour consultation ultérieure (uniquement si la semaine a été validée)
- Détail “En savoir plus” : tendance sur le mois, % objectif mensuel, courbe, historique

---

## Fichiers concernés
- /pages/suivi.js (logique de validation semaine, affichage modale)
- /components/BilanHebdoModal.js (nouveau composant)
- /components/BilanMensuelDetail.js (nouveau composant ou extension)
- /lib/analyticsAlimentaire.js (helpers calculs tendance, historique)
- /lib/storageBilan.js (helpers archivage/lecture bilans)

---

### Etape 1 — Audit des risques préalable
1. Risque UX : surcharge cognitive, démotivation si bilan mal formulé
2. Risque technique : hooks React mal placés, gestion d’état incorrecte
3. Risque de régression sur la validation semaine ou l’archivage
4. Risque de perte de données (bilans non archivés)
5. Risque accessibilité (modale, navigation clavier)
6. Risque de conflit avec logique existante (validation, feedback)
7. Consulter le fichier d’anomalies rollback avant toute modification

---

# Rapport lecture fichier ANOMALIE_rollback (13/01/2026)

Aucun fichier ANOMALIE_rollback.md trouvé dans /docs/. 
- Si ce fichier existe ailleurs ou doit être créé, merci de l’indiquer.
- Aucun historique d’anomalie bloquante détecté à ce stade.

---

# Checklist de vérification/point de vigilance adaptée à la modification

1. Vérifier que tous les hooks React (useState, useEffect, etc.) sont déclarés en haut du composant, jamais dans une fonction, boucle, map, if, etc.
2. S’assurer qu’aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks (ex : tableau de dépendances de useEffect).
3. Contrôler la robustesse de l’archivage des bilans (aucune perte de données possible).
4. Vérifier la navigation modale et l’accessibilité (focus, clavier, screen reader).
5. S’assurer qu’aucune suppression destructrice n’est faite sur le code existant (aucune perte de comportement).
6. Tester tous les cas limites (aucun extra, budget négatif, semaine non validée, etc.).
7. Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback (ajout à la fin du fichier, jamais suppression).

---

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Tous les hooks déclarés en haut du composant
- [ ] Fonctions de calcul et helpers importés
- [ ] Props et handlers bien typés et documentés
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (pages/suivi.js, BudgetExtrasCard, etc.)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Séparation stricte initialisation → logique → handlers → rendu
- [ ] Contrôle d’erreur systématique (try/catch, fallback)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Aucune suppression destructrice, aucune perte de comportement existant
- [ ] Documentation claire de chaque étape
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d’anomalies rollback
2. Créer une checklist de contrôle à appliquer avant le codage
3. Ajouter l’analyse de l’audit des risques et s’assurer qu’il n’y a aucune anomalie bloquante
4. Si anomalie/bug identifié, proposition immédiate de rollback à confirmer avec l’utilisateur

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — Point de vigilance
1. Vérifier que le bilan n’est généré qu’à la validation explicite de la semaine
2. S’assurer que l’archivage fonctionne et que le bilan est consultable uniquement pour les semaines validées
3. Contrôler la robustesse de la navigation modale et de l’accessibilité
4. Relire tous les hooks et dépendances pour éviter toute anomalie de déclaration ou d’ordre
5. Intégrer le rapport de lecture du fichier anomalies rollback et la checklist de vérification adaptée

---

### Etape 7 — Proposition de rollback
- Si anomalie détectée, retour immédiat à la version précédente, ajout d’une entrée dans le fichier rollback, et rapport à l’utilisateur

---

### Etape 8 — Rapport Markdown Copilot
- Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.)
- Ce rapport doit permettre une validation éclairée, claire et synthétique

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

**Aucune modification de code ne sera produite tant que ce plan n’aura pas été validé explicitement.**

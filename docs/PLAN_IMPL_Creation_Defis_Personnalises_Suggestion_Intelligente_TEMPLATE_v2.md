# PLAN D’IMPLÉMENTATION — Défis personnalisés avec suggestion intelligente et gestion des badges

## Titre de la tâche
Intégrer les défis personnalisés avec suggestion intelligente (IA) et gestion des badges dans le système de cristallisation

---

## **Description précise de la modification attendue**
- Permettre à l’utilisateur de créer, recevoir et valider des défis personnalisés, avec suggestions intelligentes (IA) adaptées à son profil et à son historique.
- Ajouter un système de badges pour récompenser la réussite de certains défis ou paliers.
- Assurer l’intégration fluide avec le suivi quotidien de la cristallisation, sans perturber la reprise alimentaire.
- Respecter l’isolation test/dev (TEST_*) et la séparation stricte des phases (cristallisation vs reprise).

---

## **Fichiers concernés**
- `/pages/cristallisation-quotidien.js`
- `/components/BadgeCard.js`
- `/components/PopUpDefi.js`
- `/components/JournalDefiPersonnalise.js`
- `/lib/analyseRepas3Jours.js`
- `/data/referentiel.js`

---

### Etape 1 — **Audit des risques préalable**
1. Risque technique : complexité de l’IA, surcharge du composant, conflits d’état React, gestion des hooks.
2. Risque UX : suggestions inadaptées, surcharge d’interface, mauvaise visibilité des badges.
3. Risque sécurité : injection de données, mauvaise gestion des clés locales (TEST_ vs prod).
4. Risque régression : perturbation du suivi existant, conflits avec la logique de validation automatique.
5. Risque robustesse : gestion des cas limites (aucun défi, défi déjà validé, badge non attribué).
6. Risque accessibilité : affichage des popups, navigation clavier, feedback visuel.
7. Vérification stricte de l’ordre des hooks (useState, useEffect, etc.) en haut du composant.
8. Lecture du fichier d’anomalies rollback avant toute modification.

---

### Etape 2 — **Sous-checklist à valider systématiquement**
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Fonctions IA/suggestion importées ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Composants BadgeCard, PopUpDefi, JournalDefiPersonnalise importés ?

---

### Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React déclarés uniquement en haut du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation, logique, handlers, rendu
- [ ] Vérification de la présence et initialisation de chaque fonction/handler utilisé dans le rendu
- [ ] Ordre et portée logiques stricts
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

---

### Etape 4 — **Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)**
1. Lire toutes les entrées d’anomalies dans le fichier rollback pour anticiper les risques.
2. Créer une checklist de contrôle à appliquer avant le codage (points de vigilance).
3. Ajouter l’analyse de l’audit des risques et s’assurer qu’il n’y a aucune anomalie bloquante.
4. Si anomalie/bug identifié, proposer un rollback immédiat, documenter dans le fichier Anomalie rollback avec date et heure.

---

### Etape 5 — **Mise à jour de l’avancement**
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — **Point de vigilance**
1. Rapport lié à la lecture des entrées du fichier anomalies rollback.
2. Création d’une checklist de contrôle issue de la lecture du fichier d’anomalies rollback, à appliquer avant le codage (conformité stricte au template).
---
**Checklist de contrôle — Points de vigilance critiques**

1. Gestion de la date du jour dans /pages/suivi.js
	- Vérifier que la date affichée par défaut est toujours la date du jour, sauf deep-link explicitement validé.
	- Ne jamais écraser la date du jour par un paramètre URL sans confirmation utilisateur.
	- Contrôler toute modification de selectedDate pour éviter la régression du workflow « saisie rapide repas du jour ».

2. Gestion des props et hooks dans RepasBloc.js
	- Ne jamais passer une expression inline comme prop à un composant si elle est utilisée dans un useEffect avec dependency array.
	- S’assurer que les handlers (ex : onChangeChampsRepas) sont stables et mémorisés (useCallback ou déclaration hors render).
	- Vérifier que les useEffect ne déclenchent pas de boucle infinie via des props/fonctions recalculées à chaque render.

3. Respect strict du flow React
	- Tous les hooks (useState, useEffect…) doivent être déclarés en haut du composant, jamais dans une condition, boucle, ou expression inline.
	- Contrôler la stabilité des références passées en props pour éviter les re-render et boucles.

4. Régression et robustesse
	- Tester systématiquement le workflow utilisateur : saisie repas du jour, navigation, validation des défis, attribution des badges.
	- Vérifier l’absence de crash, freeze, ou comportement bloquant après chaque modification.

5. Documentation et rollback
	- Documenter toute anomalie ou modification dans le fichier rollback, sans jamais supprimer d’entrées.
	- Proposer un rollback immédiat en cas de bug critique, avec date, heure et contexte.
3. Lister les erreurs similaires potentielles.
4. Créer la checklist de vérification/point de vigilance, informer l’utilisateur, indiquer l’impact attendu.

---

### Etape 7 — **Proposition de rollback**
- Décrire l’action de rollback, son contexte, l’alternative sûre proposée.
- Ajouter cette donnée dans le fichier ANOMALIE rollback : date, heure, détail complet.

---

### Etape 8 — **Rapport Markdown Copilot**
1. Générer un rapport structuré AVANT et APRÈS toute modification.
2. Ce rapport doit permettre une validation claire et synthétique.
3. À valider par l’utilisateur avant code.

---

### Etape 9 — **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

**⚠️ Copilot NE PEUT PAS générer de code avant validation explicite du plan, et doit se conformer à cette checklist/détail à CHAQUE tâche.**

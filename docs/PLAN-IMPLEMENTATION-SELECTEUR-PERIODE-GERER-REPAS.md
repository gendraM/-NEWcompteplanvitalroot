# 🟢 PLAN D’IMPLÉMENTATION COPILOT — AJOUT SÉLECTEUR DE PÉRIODE DANS “GÉRER MES REPAS”

## Titre de la tâche
Ajouter un sélecteur de période à la page “Gérer mes repas” pour valider visuellement les kcal consommés

---

## **Description précise de la modification attendue**
Permettre à l’utilisateur de choisir la période (jour, semaine, plage personnalisée) sur la page “Gérer mes repas”.
L’affichage des repas et du total kcal doit s’adapter à la période sélectionnée, afin de faciliter la vérification de la cohérence des apports caloriques.

---

## **Fichiers concernés**
- `/pages/gerer-mes-repas.js` (ou équivalent)
- `/components/RepasBloc.js` (si affichage des repas)
- `/components/PeriodSelector.js` (nouveau composant à créer si besoin)

---

### Etape 1 — **Audit des risques préalable**
1. Risque technique : régression sur le filtrage des repas, mauvaise gestion des dates, bug sur le calcul des totaux.
2. Risque UX : incompréhension du sélecteur, mauvaise ergonomie, confusion sur la période affichée.
3. Risque robustesse : oubli de prise en compte de la période dans le calcul des totaux.
4. Risque accessibilité : sélecteur non accessible clavier/lecteur d’écran.
5. Risque de conflit : interaction avec d’autres filtres ou états existants.
6. Risque de perte de données : si la sélection de période réinitialise des entrées non sauvegardées.
7. Vérification stricte de l’ordre des hooks React (useState, useEffect, etc.) : tous déclarés en haut du composant, jamais dans une fonction, boucle, map, if, etc.
8. Lecture du fichier anomalies rollback avant toute modification.

---

### Etape 2 — **Sous-checklist à valider systématiquement**
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Fonctions de filtrage et de calcul importées/déclarées ?

---

### Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React déclarés uniquement en haut du composant
- [ ] Séparation stricte des étapes : initialisation ➔ logique ➔ handlers ➔ rendu
- [ ] Vérification de la présence de toutes les fonctions/handlers utilisés dans le rendu
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

---

### Etape 4 — **Contrôles conformité à réaliser**
1. Lire toutes les entrées d’anomalies rollback pour anticiper les risques.
2. Créer une checklist de contrôle adaptée à la mission.
3. S’assurer qu’aucune anomalie bloquante n’est présente avant d’implémenter.
4. En cas d’anomalie, proposer un rollback immédiat, documenter dans le fichier rollback.

---

### Etape 5 — **Mise à jour de l’avancement**
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 18/01/2026, plan initial rédigé

---

### Etape 6 — **Point de vigilance**
- Vérifier la gestion des dates (fuseau, format, bornes inclusives/exclusives)
- S’assurer que le sélecteur n’introduit pas de régression sur l’existant
- Contrôler l’accessibilité du sélecteur
- Vérifier la cohérence des totaux kcal affichés
- S’assurer que la sélection de période ne réinitialise pas d’entrées non sauvegardées
- Contrôler la synchronisation entre le sélecteur et l’affichage des repas

---

### Etape 7 — **Proposition de rollback**
- En cas de bug critique (filtrage, calcul, affichage), retour à la version précédente du composant concerné, documentation immédiate dans le fichier rollback (date, heure, contexte).

---

### Etape 8 — **Rapport Markdown Copilot**
- Générer un rapport structuré AVANT et APRÈS modification (structure, hooks, logique, rendu)
- Permettre une validation claire et synthétique
- À valider par l’utilisateur avant code

---

### Etape 9 — **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

# Double lecture template vs plan d’implémentation

- Toutes les sections du template sont présentes et respectées.
- Aucun écart majeur détecté entre le plan et le template.
- Checklist, audit des risques, rollback, rapport Markdown, validation utilisateur : OK.
- Prêt pour validation utilisateur avant toute modification de code.

---

Merci de valider ce plan ou d’indiquer les ajustements souhaités avant toute implémentation.
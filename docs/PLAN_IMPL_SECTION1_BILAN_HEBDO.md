# Structure visuelle attendue pour la Section 1 (modale bilan hebdo)

## Structure de base à respecter (avant ajout des champs métier)

- Titre principal en haut de la modale : **Bilan hebdomadaire**
- Carte/encadré visuel pour la section 1 (fond clair, arrondi, padding, ombre légère)
- Sous-titre dans la carte : **Résumé des données principales**
- Liste des champs métier à afficher dans la carte, un par un, avec :
	- Label explicite (ex : "Apports totaux (kcal)")
	- Valeur bien visible, couleur différenciée si besoin
	- Espacement/marge entre chaque ligne

## Exemple de rendu visuel attendu (wireframe simplifié)

--------------------------------------
|  Bilan hebdomadaire                |
|  --------------------------------  |
|  | Résumé des données principales | |
|  |  Apports totaux (kcal) :  ...  | |
|  |  Budget extras (%) :       ...  | |
|  |  Extras consommés :        ...  | |
|  |  Répartition extras :      ...  | |
|  --------------------------------  |
--------------------------------------

Chaque champ métier doit être ajouté/corrigé dans cette carte, un par un, en respectant la validation utilisateur à chaque étape.


# 🟢 PLAN D’IMPLÉMENTATION — Bilan Hebdomadaire Alimentaire (Section 1)

## Titre de la tâche
Implémenter l’affichage progressif et testable de la section 1 du bilan hebdomadaire alimentaire, en suivant une approche étape par étape.

---

## Description précise de la modification attendue
- Afficher les données principales du bilan (kcal, budget extras, extras, répartition) dans une carte dédiée.
- Ajouter les calculs complémentaires (objectif hebdo, écart, tendance) et les afficher.
- Distinguer les extras planifiés/impulsifs via le champ repas conforme.
- Générer un message motivationnel et une mini-action pour la semaine suivante.
- Tester chaque étape indépendamment et valider l’affichage au fil de l’eau.

---

## Fichiers concernés
- /pages/suivi.js
- /components/BilanHebdoModal.js
- /components/BudgetExtrasCard.js
- /lib/validationSemaine.js

---

### Etape 1 — Audit des risques préalable
1. Risque UX : surcharge, mauvaise lisibilité, démotivation si message mal formulé
2. Risque technique : hooks React mal placés, gestion d’état incorrecte
3. Risque de régression sur la validation semaine
4. Risque de perte de données (extras, bilan)
5. Risque accessibilité (modale, navigation clavier)
6. Risque de conflit avec logique existante
7. Consulter le fichier d’anomalies rollback avant toute modification

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Fonctions de calcul et helpers importés
- [ ] Props et handlers bien typés et documentés

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné
- [ ] Initialisation systématique avant usage
- [ ] Hooks déclarés en haut du composant
- [ ] Séparation stricte initialisation → logique → handlers → rendu
- [ ] Contrôle d’erreur systématique
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
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
4. Relire tous les hooks et dépendances pour éviter toute anomalie
5. Intégrer le rapport de lecture du fichier anomalies rollback et la checklist de vérification adaptée

---

### Etape 7 — Proposition de rollback
- Si anomalie détectée, retour immédiat à la version précédente, ajout d’une entrée dans le fichier rollback, et rapport à l’utilisateur

---

### Etape 8 — Rapport Markdown Copilot
- Générer un rapport structuré AVANT et APRÈS toute modification
- Ce rapport doit permettre une validation éclairée, claire et synthétique

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

## 🟢 Plan d’action étape par étape (Section 1)

1. Afficher les données principales (kcal, budget extras, extras, répartition)
2. Ajouter les calculs complémentaires (objectif hebdo, écart, tendance)
3. Distinguer extras planifiés/impulsifs via repas conforme
4. Générer le message motivationnel et la mini-action
5. Tester chaque étape indépendamment
6. Recueillir le feedback utilisateur et ajuster au fil de l’eau

---

**Ce plan respecte le template Copilot et la méthodologie stricte de validation.**

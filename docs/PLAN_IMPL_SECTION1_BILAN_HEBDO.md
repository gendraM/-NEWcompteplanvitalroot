---

## Section spéciale — Mise en conformité métier (janvier 2026)

### Analyse comparative fiche métier vs rendu actuel

**Conforme** :
- Titre, sous-texte, structure visuelle, principaux indicateurs (kcal, extras, budget, pourcentage).
- Labels explicites, couleurs différenciées, ton neutre, accessibilité de base.

**Écarts à traiter pour conformité totale** :
1. Ajouter l’écart hebdomadaire (kcal consommé – objectif).
2. Afficher la phrase de lecture automatique selon l’écart (déficit/maintien/surplus).
3. Afficher la répartition des extras par type (mini/normal/2x/majeur) si possible.
4. Afficher la répartition planifié/impulsif (ou "non disponible").
5. Ajouter la lecture automatique sur la répartition des plaisirs (bien répartis/concentrés).
6. Afficher les moments forts et fragilités (si données disponibles).
7. Ajouter la phrase de synthèse et le message motivationnel dynamique.
8. (Optionnel) Ajouter le bouton "Comprendre en détail".

Chaque point sera traité un par un, avec validation utilisateur à chaque étape.
# 🔔 Proposition d’alerte visuelle et dynamique “Lecture de la semaine” (mise en conformité métier)

## 1. Alerte visuelle pour attirer le regard

- Toute situation hors cadre (dépassement objectif, extras hors budget, écart significatif) doit déclencher une alerte visuelle claire :
	- Couleur d’arrière-plan ou de bordure spécifique (ex : rouge/orange pour alerte, vert pour conformité)
	- Icône d’alerte (ex : ⚠️, ✅)
	- Texte mis en valeur (gras, couleur, encadré)
- L’alerte doit être pédagogique, non culpabilisante, et toujours contextualisée par rapport à la donnée réelle de la semaine.
- En cas de conformité (objectif respecté, extras dans le budget), une valorisation visuelle positive est affichée (ex : ✅, couleur verte, message de félicitations).

## 2. Dynamique “Lecture de la semaine”

- Le bloc “Lecture de la semaine” s’affiche toujours, mais son contenu s’adapte strictement à la situation réelle :
	- Si l’écart hebdomadaire est significatif : 
		> Cette semaine, la trajectoire globale s’éloigne de l’objectif hebdomadaire.
	- Si l’écart est faible ou nul : 
		> Cette semaine reste proche de l’objectif, la trajectoire est conforme.
	- Si l’écart est expliqué principalement par les extras : 
		> L’écart constaté ne s’explique pas par les repas hors extras, qui restent proches du cadre prévu, mais par le poids cumulé des extras sur la semaine.
	- Si les repas hors extras sont eux-mêmes excessifs : 
		> La responsabilité de l’écart est partagée entre les repas et les extras, nécessitant une vigilance globale.
	- Si le nombre d’extras et leur charge calorique dépassent nettement le budget : 
		> Le nombre d’extras consommés, combiné à leur charge calorique totale, place cette semaine hors zone d’équilibre par rapport au budget fixé.
	- Si une cause unique est identifiée (ex : extras) : 
		> 👉 Le constat est clair : ce ne sont pas les repas qui déséquilibrent la semaine, mais la manière dont les extras se sont exprimés.
	- Si plusieurs causes coexistent : 
		> 👉 Plusieurs facteurs expliquent l’écart cette semaine : repas et extras contribuent tous deux à la situation observée.
- Chaque phrase est choisie dynamiquement selon les règles de gestion de la fiche métier, sans jamais afficher de contenu générique ou statique.
- L’alerte visuelle accompagne le texte pour renforcer la lisibilité et l’attention.

---

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

1. Afficher les données principales (kcal, budget extras, extras) dans une carte dédiée
2. Ajouter la sous-section "Lecture des extras de la semaine" (titre, sous-titre, chiffres clés, verbatim croisé)

---

## 🔵 Enrichissement métier — Bloc "En savoir plus" (conformité dynamique et visuelle)

### Règles générales
- Tous les sous-blocs et messages sont strictement dynamiques : ils s’affichent ou non selon la réalité des données de la semaine.
- Les valeurs (kcal, extras, budget, etc.) sont injectées dynamiquement.
- Les verbatims sont ceux validés métier, sans ajout ni modification.
- Chaque sous-bloc peut afficher une alerte visuelle (couleur, icône, encadré) si un point de vigilance est détecté.
- Un message d’encouragement ou de vigilance est mis en avant selon la situation réelle.

### Structure dynamique attendue

#### Lecture “repas vs extras”
- Sans extras, ta semaine est à **[X] kcal**.
- Avec extras, elle monte à **[Y] kcal**.
- → Ça signifie que la différence se joue majoritairement sur les extras, pas sur les repas.
- **Alerte visuelle** : si l’écart entre les deux est significatif, encadré ou icône ⚠️ ; si faible, pas d’alerte.

#### Lecture “écart expliqué”
- Objectif : **[X] kcal**
- Réalisé : **[Y] kcal**
- → **+[Z] kcal** : c’est le signal principal de la semaine.
- **Alerte visuelle** : si l’écart est un dépassement important, fond orange/rouge + icône ⚠️ ; si conforme ou déficit, fond vert/✅.
- **Message dynamique** : si conforme, afficher un message d’encouragement (ex : "Bravo, tu es dans le cadre !").

#### Lecture “fréquence vs intensité”
- Extras : **[N]**
- Poids calorique extras : **[X] kcal**
- Budget extras : **[Y] kcal**
- → Cette semaine, les extras sont à la fois présents (fréquence) et très lourds (intensité).
- **Alerte visuelle** : si extras > budget ou très lourds, encadré orange/rouge + icône ⚠️ ; si extras modérés, fond neutre ou vert.

### Points de vigilance et valorisation
- Si un point de fragilité est détecté (ex : extras très élevés, écart majeur), un message de vigilance explicite est affiché, mis en avant visuellement.
- Si la situation est conforme, un message positif et une valorisation visuelle sont affichés (fond vert, icône ✅, message d’encouragement).

---
3. Ajouter les calculs complémentaires (objectif hebdo, écart, tendance)
4. Distinguer extras planifiés/impulsifs via repas conforme (ou "non disponible")
5. Générer le message motivationnel et la mini-action pour la semaine suivante
6. Ajouter les blocs d’analyse textuelle métier dynamiques, strictement conformes à la fiche métier :
	- Bloc "En savoir plus" (lecture croisée repas vs extras, écart expliqué, fréquence vs intensité)
	- Bloc "Lecture de la semaine" (diagnostic global, verbatims dynamiques)
	- Blocs approfondis (répartition de l’écart, fréquence vs charge, lecture de trajectoire) si les règles métier sont remplies
	- Tous ces blocs s’affichent ou non selon les règles de gestion et la réalité des données de la semaine de l’utilisateur (affichage dynamique, non figé)
7. Tester chaque étape indépendamment
8. Recueillir le feedback utilisateur et ajuster au fil de l’eau

---

**Ce plan respecte le template Copilot et la méthodologie stricte de validation.**

# 🥣 PLAN IMPLEMENTATION CÉRÉALES

## 1. Objet
Mettre en place un plan d’implémentation clair, progressif et vérifiable pour enrichir la catégorie céréales dans le référentiel alimentaire, en réutilisant la méthode éprouvée sur charcuterie, gâteaux, viennoiserie et poisson.

## 2. Contexte constaté (audit 2026-07-26)
- La catégorie `céréales` existe mais ne contient actuellement qu’une entrée structurelle.
- Un placeholder est présent : `Exemple céréales`.
- Des céréales de petit-déjeuner existent déjà dans d’autres familles (notamment `féculent`) avec des marques.
- Risque identifié : doublons et confusion entre catégorie cible `céréales` et ancien classement `féculent`.
- Règle validée : la catégorie céréales doit privilégier les références nommées avec **marque explicite**.

## 3. Retours d’expérience à réutiliser (cas catégories précédentes)
1. Placeholder visible = dette immédiate
- Un placeholder donne une fausse impression de catégorie existante.
- Action à reproduire : supprimer le placeholder dès que la catégorie est prête.

2. Doublons inter-catégories = risque d’attribution erronée
- Les céréales sont souvent déjà présentes sous des libellés historiques.
- Action à reproduire : audit anti-doublon strict + arbitrage avant ajout/recatégorisation.

3. Cohérence kcal / portion / QN indispensable
- Une céréale doit avoir une portion lisible (30g, 40g, etc.) et un QN cohérent avec son niveau de transformation.
- Action à reproduire : aligner `portionDefaut`, `kcal`, `kcalParUnite` et `qn`.

4. Implémentation par batchs = plus sûre
- Ajouter trop d’items en une fois augmente le risque d’erreur de mapping et d’alternatives cassées.
- Action à reproduire : lot prioritaire réduit puis extension.

## 4. Objectifs d’implémentation
1. Construire une catégorie céréales exploitable et cohérente.
2. Supprimer l’effet placeholder côté saisie utilisateur.
3. Garantir une autocomplétion claire avec des libellés marque + type.
4. Harmoniser les champs nutritionnels (`portionDefaut`, `kcal`, `kcalParUnite`, `qn`) selon une logique stable.
5. Réduire les collisions avec les anciennes entrées en `féculent`.

## 5. Périmètre
### Inclus
- Référentiel alimentaire (entrées céréales)
- Normalisation catégorie + sous-catégories céréales
- Règles anti-doublon et conventions de nommage
- Contrôles qualité des champs nutritionnels et portions
- Validation autocomplétion ciblée

### Exclu
- Refonte globale de toutes les catégories
- Migration massive de toutes les entrées `féculent`
- Refonte du moteur calorique global
- Refondre les règles QN globales du produit

## 6. Références de pilotage
- PLAN_ENRICHISSEMENT_REFERENTIEL_723.md
- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md
- plan implementation charcuterie.md
- plan implementation gâteaux.md
- plan implementation poisson.md

## 7. Cible fonctionnelle de la catégorie céréales
### 7.1 Règle validée (marque obligatoire)
- Une entrée céréales doit inclure la marque quand elle existe en grande distribution.
- Éviter les libellés vagues de type “céréales chocolat” sans marque.
- Format recommandé : `Nom produit (Marque)` ou `Nom produit` + `marque` renseignée.

### 7.2 Types de céréales les plus répandus (France / Europe / Afrique)
- Céréales de maïs (flakes)
- Céréales de blé complet
- Céréales chocolatées
- Céréales fourrées
- Céréales soufflées miel/riz
- Muesli / granola
- Flocons d’avoine

### 7.3 Sous-catégories recommandées
- Céréales de maïs
- Céréales chocolatées
- Céréales fourrées
- Céréales soufflées
- Céréales complètes
- Muesli / granola
- Flocons d’avoine

## 8. Règles de données (qualité)
Chaque entrée céréales doit contenir au minimum :
- nom
- categorie
- sousCategorie
- marque
- kcal
- kcalParUnite (ou cohérence explicite avec unité)
- qn
- portionDefaut
- unite
- alternatives
- typeOrigine quand pertinent

Contraintes :
- 0 placeholder dans la catégorie
- 0 doublon strict de nom après arbitrage
- `marque` obligatoire pour les références de grande distribution
- `portionDefaut` lisible utilisateur (30g, 40g, bol standard)
- `kcal` cohérent avec la portion affichée
- `qn` cohérent avec le niveau de transformation
- alternatives existantes dans le référentiel

## 9. Stratégie d’implémentation (phases)
## Phase A — Audit & Cartographie
1. Inventorier les entrées actuelles de `céréales` et les céréales classées ailleurs.
2. Identifier placeholder, champs incomplets, écarts kcal/portion/QN.
3. Lister les candidats déjà existants (`Miel Pops`, `Trésor`, `Corn Flakes`, etc.) et décider :
   - recatégoriser,
   - dupliquer en version céréales,
   - ou conserver hors périmètre.
4. Produire un tableau "Prévu vs Réel".

Livrables Phase A :
- Tableau Prévu vs Réel céréales
- Liste des anomalies (placeholder, manquants, incohérences, doublons)

## Phase B — Normalisation structure & règles
1. Valider la taxonomie cible (`céréales` + sous-catégories).
2. Définir conventions de nommage marque + type.
3. Définir règle d’arbitrage anti-doublon avec `féculent`.

Livrables Phase B :
- Dictionnaire de mapping validé
- Convention de nommage validée
- Règle d’arbitrage documentée

## Phase C — Complétion & Nettoyage
1. Supprimer `Exemple céréales` quand le lot minimal est prêt.
2. Ajouter les références manquantes du lot prioritaire (si non existantes).
3. Recatégoriser uniquement les entrées clairement validées comme céréales petit-déjeuner.
4. Aligner `portionDefaut`, `kcal`, `kcalParUnite`, `qn` sur les règles.

Livrables Phase C :
- Catégorie céréales propre, sans placeholder
- Jeu d’entrées prioritaire complet et cohérent

## Phase D — Validation autocomplétion & non-régression
1. Tester les recherches :
   - "miel", "riz souff", "crunch", "corn", "choc", "tresor", "muesli", "avoine"
2. Vérifier :
   - pertinence des suggestions,
   - présence marque + portion,
   - absence de placeholder,
   - absence de collisions bloquantes avec `féculent`.
3. Lancer build complet.

Livrables Phase D :
- Procès-verbal de tests autocomplete céréales
- Validation build

## 10. Critères d’acceptation
- 0 placeholder visible pour céréales
- Lot minimal implémenté et valide
- 100% des champs obligatoires renseignés
- 0 doublon bloquant après arbitrage
- Autocomplétion conforme sur les cas de test
- Build réussi

## 11. Risques et mitigations
- Risque : doublons avec anciens libellés déjà présents en `féculent`.
  - Mitigation : audit anti-doublon + mapping avant exécution.

- Risque : libellés trop génériques sans marque.
  - Mitigation : règle marque obligatoire + contrôle manuel.

- Risque : incohérences nutritionnelles entre produits proches.
  - Mitigation : harmonisation portions (30-40g) et revue comparative.

## 12. Estimation
- Audit & cartographie : 0.5 j
- Normalisation : 0.5 j
- Complétion & nettoyage : 0.5 à 1 j
- Validation autocomplete + build : 0.5 j

Total estimé : 2 à 2.5 jours selon volume final.

## 13. Plan d’exécution opérationnel (ordre conseillé)
1. Audit de la catégorie céréales actuelle
2. Validation taxonomie + arbitrages avec `féculent`
3. Implémentation lot prioritaire marque
4. Nettoyage placeholder et doublons
5. Tests autocomplete
6. Build + documentation finale des décisions

## 14. Résultat attendu
Une catégorie `céréales` réellement enrichie, lisible côté utilisateur (marque + type), cohérente côté nutrition (portion/kcal/QN), sans placeholder, et prête pour les batches d’extension ultérieurs.

## 15. Batch A proposé (prioritaire, à ajouter si non existant)
### Entrées explicitement demandées
- Miel Pops (Kellogg’s)
- Céréales riz soufflé (marque à valider à l’audit)
- Crunch (Nestlé)

### Noyau complémentaire recommandé
- Corn Flakes (Kellogg’s)
- Special K Original (Kellogg’s)
- Trésor Chocolat Noisette (Kellogg’s)
- Chocapic (Nestlé)
- Fitness Nature (Nestlé)
- Weetabix Original (Weetabix)
- All-Bran (Kellogg’s)

## 16. Batchs suivants (après validation Batch A)
### Batch B — Céréales complètes et muesli
- Flocons d’avoine (Quaker)
- Flocons d’avoine (Bjorg)
- Muesli Fruits (Bjorg)
- Muesli Chocolat (Jordans)
- Granola Avoine Miel (Quaker)
- Granola Chocolat (Kellogg’s)

### Batch C — Couverture régionale élargie Europe/Afrique
- Weetabix Chocolate (Weetabix)
- Golden Morn (Nestlé)
- Milo Cereal (Nestlé)
- Oat Crisp (Alpen)
- Muesli Noix et Graines (Jordans)
- Granola Fruits Rouges (Bjorg)

## 17. État de validation des étapes
- Plan créé, aucune implémentation de données exécutée dans ce document.
- Étapes à valider avec utilisateur avant modification de `data/referentiel.js`.

## 18. Phase A réalisée — Audit & Cartographie (2026-07-26) ✅

### 18.1 État réel détecté
- Catégorie `céréales` actuelle : 1 placeholder uniquement (`Exemple céréales`).
- Entrées céréales déjà présentes mais classées en `féculent` (sous-catégorie `Céréales petit-déjeuner`) :
  - Corn Flakes (Kellogg’s)
  - Special K (Kellogg’s)
  - Weetabix (Weetabix)
  - Granola (Jordans)
  - Trésor (Kellogg’s)
  - Miel Pops (Kellogg’s)
  - Fitness (Nestlé)
  - Lion Céréales (Nestlé)
  - Country Crisp (Jordans)
- Entrées proches hors catégorie :
  - Flocons d'avoine (catégorie `féculent`)
  - Céréales muesli (catégorie `féculent`)
  - Céréales sucrées (Chocapic, Frosties) (catégorie `extra`, libellé générique)

### 18.2 Constats clés
- Le besoin principal n’est pas d’ajouter massivement, mais d’harmoniser le classement vers `céréales` sans casser les usages.
- `Miel Pops` existe déjà : ne pas créer de doublon.
- `Crunch` n’a pas d’entrée explicite détectée : candidat ajout.
- `Céréales riz soufflé` n’a pas d’entrée explicite détectée : candidat ajout avec marque.

## 19. Batch A final prêt à exécuter (sans doublons)

### 19.1 Bloc recatégorisation contrôlée (existants)
Objectif : déplacer vers `categorie: "céréales"` les entrées déjà présentes en `féculent` et clairement céréales petit-déjeuner.

- Corn Flakes (Kellogg’s)
- Special K (Kellogg’s)
- Weetabix (Weetabix)
- Trésor (Kellogg’s)
- Miel Pops (Kellogg’s)
- Fitness (Nestlé)
- Lion Céréales (Nestlé)
- Country Crisp (Jordans)
- Granola (Jordans)

### 19.2 Bloc ajouts manquants (nouveaux)
Objectif : ajouter les références demandées/stratégiques absentes, avec marque obligatoire.

- Crunch (Nestlé)
- Riz soufflé nature (marque à valider lors de l’implémentation)
- Chocapic (Nestlé)
- All-Bran (Kellogg’s)

### 19.3 Règles d’exécution Batch A
- Supprimer `Exemple céréales` uniquement quand les entrées réelles sont en place.
- Conserver `portionDefaut` cohérent (30g à 40g selon produit).
- Vérifier les alternatives pour qu’elles pointent vers des entrées existantes après recatégorisation.
- Exécuter build complet en fin de batch.

### 19.4 Volume Batch A
- Recatégorisations : 9
- Nouveaux ajouts : 4
- Total opérations : 13

## 20. Exécution pas à pas (réalisée) ✅

### Étape 1 — Audit & Cartographie (Phase A) ✅
- Catégorie `céréales` confirmée avec placeholder unique avant implémentation.
- 9 entrées céréales pertinentes identifiées en `féculent` (`Céréales petit-déjeuner`).
- 4 entrées manquantes confirmées pour Batch A (`Crunch`, `Riz soufflé nature`, `Chocapic`, `All-Bran`).

### Étape 2 — Normalisation structure & règles (Phase B) ✅
- Règle marque maintenue sur toutes les entrées du batch.
- Taxonomie appliquée via sous-catégories : maïs, complètes, fourrées, soufflées, chocolatées, muesli/granola.
- Arbitrage anti-doublon respecté : aucune création en double des entrées déjà existantes.

### Étape 3 — Complétion & Nettoyage (Phase C) ✅
- Recatégorisations effectuées : 9.
- Nouveaux ajouts effectués : 4.
- Placeholder `Exemple céréales` supprimé.

### Étape 4 — Validation autocomplétion & non-régression (Phase D) ✅
- Build complet exécuté avec succès après implémentation.
- Contrôle catégorie `céréales` : 13 entrées.
- Contrôle placeholder : 0.
- Contrôle ajouts clés :
  - `Crunch` : 1 occurrence
  - `Riz soufflé nature` : 1 occurrence
  - `Chocapic` : 1 occurrence
  - `All-Bran` : 1 occurrence

## 21. État final après exécution
- Catégorie `céréales` opérationnelle et sans placeholder.
- Batch A exécuté à 100% selon le plan validé.
- Structure compatible avec une extension future (Batch B et C) sans recatégorisation massive.

## 22. Batch B — Exécution pas à pas (2026-07-26) ✅

### Étape 1 — Préparation et anti-doublon ✅
- Vérification des entrées Batch B ciblées avant insertion.
- Aucune entrée exacte détectée pour :
  - Flocons d’avoine (Quaker)
  - Flocons d’avoine (Bjorg)
  - Muesli Fruits
  - Muesli Chocolat
  - Granola Avoine Miel
  - Granola Chocolat

### Étape 2 — Implémentation Batch B ✅
- 6 nouvelles entrées ajoutées dans la catégorie `céréales`.
- Marques renseignées sur 100% des entrées du batch.
- Sous-catégories harmonisées (`Flocons d’avoine`, `Muesli / granola`).

### Étape 3 — Validation technique ✅
- Build complet exécuté avec succès après ajout.
- Contrôle Batch B : 6 entrées détectées.
- Total catégorie `céréales` après Batch B : 19 entrées.

## 23. État global de la catégorie céréales
- Placeholder supprimé et catégorie désormais exploitable.
- Batch A : ✅ terminé.
- Batch B : ✅ terminé.
- Batch C : ⏳ à planifier/exécuter selon priorité couverture Europe/Afrique.

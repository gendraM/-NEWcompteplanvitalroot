# 🍰 PLAN IMPLEMENTATION PÂTISSERIE

## 1. Objet
Mettre en place un plan d’implémentation clair, progressif et vérifiable pour enrichir la catégorie pâtisserie dans le référentiel alimentaire, en appliquant la même méthodologie que les catégories déjà traitées.

## 2. Contexte constaté (audit 2026-07-26)
- La catégorie `pâtisserie` existe mais contient encore une entrée structurelle.
- Un placeholder est présent : `Exemple pâtisserie`.
- Une base d’entrées métier est déjà en place (ex: Tartelette aux fruits, Paris-Brest, Opéra, Saint-Honoré).
- Risque identifié : couverture partielle et granularité insuffisante pour les pâtisseries courantes.

## 3. Retours d’expérience à réutiliser (catégories précédentes)
1. Placeholder visible = dette immédiate
- Le placeholder doit disparaître quand le lot réel est prêt.

2. Doublons inter-catégories
- Éviter les collisions avec `gâteaux`, `viennoiserie`, `dessert`, `snack`.

3. Cohérence kcal / portion / QN
- Toutes les entrées doivent rester lisibles utilisateur et cohérentes nutritionnellement.

4. Batchs progressifs
- Privilégier un lot prioritaire limité puis extension.

## 4. Objectifs d’implémentation
1. Rendre la catégorie `pâtisserie` pleinement exploitable.
2. Supprimer le placeholder sans régression.
3. Harmoniser les champs nutritionnels (`portionDefaut`, `kcal`, `kcalParUnite`, `qn`).
4. Améliorer l’autocomplete avec des entrées nettes et non ambiguës.

## 5. Périmètre
### Inclus
- Entrées de la catégorie `pâtisserie` dans le référentiel
- Normalisation nommage / sous-catégories
- Contrôles anti-doublon
- Validation build

### Exclu
- Refonte globale de toutes les catégories
- Recatégorisation massive hors cas validés
- Refonte moteur calorique

## 6. Références de pilotage
- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md
- plan implementation gâteaux.md
- plan implementation viennoiserie.md
- plan implementation céréales.md

## 7. Cible fonctionnelle de la catégorie pâtisserie
### 7.1 Lot minimal recommandé (base)
- Mille-feuille
- Éclair chocolat
- Éclair café
- Religieuse chocolat
- Tarte citron meringuée
- Tarte aux fraises
- Flan pâtissier
- Chou à la crème

### 7.2 Sous-catégories recommandées
- Pâtisseries feuilletées
- Pâtisseries à choux
- Tartes sucrées
- Entremets / gâteaux de vitrine
- Flans et crèmes pâtissières

### 7.3 Règle de fond métier
- `pâtisserie` couvre les produits de vitrine/boulangerie-pâtisserie consommés en part ou pièce.
- Les cakes/moelleux orientés “goûter maison” restent en `gâteaux`.
- Les produits de type croissant/pain au chocolat restent en `viennoiserie`.

## 8. Règles de données (qualité)
Chaque entrée pâtisserie doit contenir au minimum :
- nom
- categorie
- sousCategorie
- kcal
- qn
- portionDefaut
- unite
- alternatives
- typeOrigine quand pertinent

Contraintes :
- 0 placeholder dans la catégorie
- 0 doublon strict de nom après arbitrage
- `portionDefaut` lisible (part/pièce + grammage)
- `kcal` cohérent avec la portion
- alternatives existantes dans le référentiel

## 9. Stratégie d’implémentation (phases)
## Phase A — Audit & Cartographie
1. Inventorier les entrées actuelles `pâtisserie`.
2. Identifier placeholder, trous de couverture, incohérences.
3. Vérifier les collisions avec `gâteaux` et `viennoiserie`.
4. Produire un tableau Prévu vs Réel.

Livrables Phase A :
- Tableau Prévu vs Réel pâtisserie
- Liste d’anomalies

## Phase B — Normalisation structure & règles
1. Valider taxonomie (`pâtisserie` + sous-catégories).
2. Fixer conventions de nommage.
3. Définir règle d’arbitrage inter-catégories.

Livrables Phase B :
- Mapping validé
- Convention validée

## Phase C — Complétion & Nettoyage
1. Ajouter le lot minimal prioritaire.
2. Supprimer `Exemple pâtisserie` quand le lot est stable.
3. Aligner les champs nutritionnels et alternatives.

Livrables Phase C :
- Catégorie pâtisserie propre, sans placeholder
- Lot prioritaire complet

## Phase D — Validation autocomplétion & non-régression
1. Tester les recherches : `eclair`, `mille`, `flan`, `tarte`, `religieuse`, `chou`.
2. Vérifier suggestions, portions, QN, absence placeholder.
3. Lancer build complet.

Livrables Phase D :
- PV tests autocomplete
- Build validé

## 10. Critères d’acceptation
- 0 placeholder visible pour pâtisserie
- Lot minimal implémenté et valide
- 100% champs obligatoires renseignés
- 0 doublon bloquant
- Build réussi

## 11. Risques et mitigations
- Risque : confusion avec `gâteaux`/`viennoiserie`
  - Mitigation : matrice d’arbitrage claire.
- Risque : portions hétérogènes
  - Mitigation : standard part/pièce + grammage.

## 12. Estimation
- Audit & cartographie : 0.5 j
- Normalisation : 0.5 j
- Complétion & nettoyage : 0.5 à 1 j
- Validation autocomplete + build : 0.5 j

Total estimé : 2 à 2.5 jours.

## 13. Plan d’exécution opérationnel
1. Audit catégorie actuelle
2. Validation taxonomie + arbitrages
3. Implémentation lot prioritaire
4. Nettoyage placeholder/doublons
5. Tests autocomplete
6. Build + documentation finale

## 14. Résultat attendu
Une catégorie `pâtisserie` complète, cohérente et exploitable, sans placeholder, avec une autocomplétion claire et une base stable pour extensions futures.

## 15. Décision de lot recommandée
- **À faire maintenant :** validation du plan.
- **À faire ensuite :** implémentation par batch dans `data/referentiel.js`.

## 16. Exécution pas à pas (réalisée) ✅

### Étape 1 — Audit & Cartographie (Phase A) ✅
- Placeholder confirmé au départ : `Exemple pâtisserie`.
- Entrées existantes détectées dans `pâtisserie` : base vitrine déjà amorcée.
- Entrées proches détectées en `extra` sous `Pâtisseries` (candidats à harmonisation).

### Étape 2 — Normalisation structure & règles (Phase B) ✅
- Arbitrage validé : basculer les pâtisseries de vitrine évidentes vers `pâtisserie`.
- Clarification de nommage pour éviter collision stricte : `Paris-Brest (industriel)`.
- Sous-catégories harmonisées :
  - `Pâtisseries à choux`
  - `Pâtisseries feuilletées`
  - `Tartes sucrées`
  - `Entremets / gâteaux de vitrine`
  - `Flans et crèmes pâtissières`

### Étape 3 — Complétion & Nettoyage (Phase C) ✅
- Placeholder `Exemple pâtisserie` supprimé.
- Recatégorisations/harmonisations effectuées sur les entrées pâtisserie évidentes déjà présentes.
- Ajouts du lot minimal manquant effectués :
  - `Éclair café`
  - `Tarte citron meringuée`
  - `Tarte aux fraises`
  - `Flan pâtissier`
  - `Chou à la crème`

### Étape 4 — Validation autocomplétion & non-régression (Phase D) ✅
- Build complet exécuté avec succès après implémentation.
- Contrôles post-batch :
  - `PATISSERIE_COUNT=18`
  - `PLACEHOLDER_PATISSERIE=0`
  - `Éclair café=1`
  - `Flan pâtissier=1`
  - `Chou à la crème=1`
  - Doublons stricts dans `pâtisserie` : 0

## 17. État final après exécution
- Catégorie `pâtisserie` désormais exploitable et sans placeholder.
- Lot prioritaire intégré et cohérent avec la méthode appliquée aux autres catégories.
- Build validé, pas de régression détectée.

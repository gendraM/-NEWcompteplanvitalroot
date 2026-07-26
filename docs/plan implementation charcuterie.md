# 🥓 PLAN IMPLEMENTATION CHARCUTERIE

## 1. Objet
Mettre en place un plan d’implémentation clair, progressif et vérifiable pour enrichir la catégorie charcuterie dans le référentiel alimentaire, en réutilisant la méthode éprouvée sur gâteaux et viennoiserie.

## 2. Contexte constaté (audit 2026-07-26)
- La catégorie `charcuterie` existe mais ne contient actuellement qu’une entrée structurelle.
- Un placeholder est présent : `Exemple charcuterie`.
- Couverture actuelle réelle : 0 entrée métier exploitable, 1 placeholder.
- La charcuterie doit être définie comme un produit **pris seul** et consommé tel quel (tranche, portion, pièce, sachet), pas comme un ingrédient intégré à un burger, un sandwich ou un plat déjà traité ailleurs.
- Les produits comme `burger bacon`, `sandwich jambon`, `pizza au chorizo` ou équivalents restent gérés par leurs catégories respectives (`fast-food`, `sandwich`, `plat préparé`, etc.).
- Des produits proches peuvent exister hors catégorie, mais ils ne relèvent pas du scope charcuterie si la charcuterie n’est qu’un composant du plat.

## 3. Retours d’expérience à réutiliser (cas gâteaux / viennoiserie)
1. Placeholder visible = dette immédiate
- Un placeholder donne une fausse impression de catégorie existante.
- Action à reproduire : supprimer le placeholder dès que la catégorie est prête ou l’exclure de l’autocomplete.

2. Doublons inter-catégories = risque d’attribution erronée
- Un même aliment peut apparaître dans plusieurs familles proches (ex: burger/bacon/charcuterie).
- Action à reproduire : audit anti-doublon strict + règle d’arbitrage avant toute recatégorisation.

3. Cohérence kcal / portion / QN indispensable
- Une charcuterie en tranche, en portion ou en grammes doit avoir une portion lisible et cohérente.
- Action à reproduire : aligner `portionDefaut`, `kcal` et `kcalParUnite` dès la création.

4. Implémentation par batchs = plus sûre
- Ajouter trop d’items d’un coup augmente les erreurs de classification et de saisie.
- Action à reproduire : lot prioritaire réduit, validation autocomplete, puis batch secondaire.

## 4. Objectifs d’implémentation
1. Construire une catégorie charcuterie exploitable et cohérente.
2. Supprimer l’effet placeholder côté saisie utilisateur.
3. Garantir une autocomplétion claire, sans collision avec fast-food / viandes / snack.
4. Harmoniser les champs nutritionnels (`portionDefaut`, `kcal`, `kcalParUnite`, `qn`) selon une logique stable.
5. Préparer les ajouts futurs sans régression.

## 5. Périmètre
### Inclus
- Référentiel alimentaire (entrées charcuterie)
- Normalisation catégorie + sous-catégories charcuterie
- Règles anti-doublon et conventions de nommage
- Contrôles qualité des champs nutritionnels et portions
- Validation autocomplétion ciblée

### Exclu
- Refonte globale de toutes les catégories
- Reclassification massive d’aliments appartenant clairement à `fast-food`, `viandes` ou `snack`
- Refonte du moteur calorique global

## 6. Références de pilotage
- PLAN_ENRICHISSEMENT_REFERENTIEL_723.md
- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md
- plan implementation gâteaux.md (méthodologie de référence)
- plan implementation viennoiserie.md (méthodologie de référence)
- MISE EN CONFORMIT2 KCAL (méthode d’alignement kcal/portion)

## 7. Cible fonctionnelle de la catégorie charcuterie
### 7.1 Lot minimal recommandé (base)
- Jambon blanc
- Jambon de dinde
- Jambon cru
- Jambon sec
- Blanc de dinde
- Saucisson sec
- Rosette
- Coppa
- Chorizo
- Pâté de campagne
- Rillettes de porc
- Mortadelle
- Bacon seul
- Terrine de campagne

### 7.2 Sous-catégories recommandées
- Charcuterie cuite
- Charcuterie sèche
- Charcuterie fumée
- Pâté / terrine
- Charcuterie tranchée
- Charcuterie volaille

## 8. Règles de données (qualité)
Chaque entrée charcuterie doit contenir au minimum :
- nom
- categorie
- sousCategorie
- kcal
- kcalParUnite (ou cohérence explicite avec unité)
- qn
- portionDefaut
- unite
- alternatives
- typeOrigine quand pertinent

Contraintes :
- 0 placeholder dans la catégorie
- 0 doublon strict de nom entre catégories concurrentes (ou arbitrage documenté)
- `portionDefaut` lisible utilisateur (par tranche, part, ou grammes)
- `kcal` cohérent avec la portion affichée
- `qn` cohérent avec le niveau de transformation alimentaire
- alternatives existantes dans le référentiel

## 9. Stratégie d’implémentation (phases)
## Phase A — Audit & Cartographie
1. Inventorier les entrées actuelles de `charcuterie`.
2. Identifier placeholder, champs incomplets, écarts kcal/portion/QN.
3. Lister les candidats hors catégorie (viandes, fast-food, snack) et décider :
   - recatégoriser,
   - dupliquer en version charcuterie,
   - ou conserver hors périmètre.
4. Produire un tableau "Prévu vs Réel".

Livrables Phase A :
- Tableau Prévu vs Réel charcuterie
- Liste des anomalies (placeholder, manquants, incohérences, doublons)

## Phase B — Normalisation structure & règles
1. Valider la taxonomie cible (`charcuterie` + sous-catégories).
2. Définir conventions de nommage (classique / fait maison / industriel / marque).
3. Définir règle d’arbitrage anti-doublon inter-catégories.

Livrables Phase B :
- Dictionnaire de mapping validé
- Convention de nommage validée
- Règle d’arbitrage documentée

## Phase C — Complétion & Nettoyage
1. Supprimer `Exemple charcuterie` quand le lot minimal est prêt.
2. Ajouter le lot minimal prioritaire.
3. Recatégoriser uniquement les entrées clairement validées comme charcuterie.
4. Aligner `portionDefaut`, `kcal`, `kcalParUnite`, `qn` sur les règles.

Livrables Phase C :
- Catégorie charcuterie propre, sans placeholder
- Jeu d’entrées prioritaire complet et cohérent

## Phase D — Validation autocomplétion & non-régression
1. Tester les recherches :
   - "jamb", "sauc", "roset", "coppa", "pat", "ril", "bacon", "choriz"
2. Vérifier :
   - pertinence des suggestions,
   - absence de placeholder,
   - affichage portion + QN,
   - absence de collisions bloquantes avec `viandes`, `snack`, `fast-food`.
3. Lancer build complet.

Livrables Phase D :
- Procès-verbal de tests autocomplete charcuterie
- Validation build

## 10. Critères d’acceptation
- 0 placeholder visible pour charcuterie
- Lot minimal implémenté et valide
- 100% des champs obligatoires renseignés
- 0 doublon bloquant après arbitrage
- Autocomplétion conforme sur les cas de test
- Build réussi

## 11. Risques et mitigations
- Risque : confusion entre catégories proches (`charcuterie`, `viandes`, `fast-food`, `snack`).
  - Mitigation : règles d’arbitrage explicites + sous-catégories claires.

- Risque : incohérences kcal causées par portions hétérogènes.
  - Mitigation : règle portion standard + revue comparative avant/après.

- Risque : doublons nom exact avec produits d’enseigne.
  - Mitigation : suffixes explicites (ex: "fait maison", "industriel", nom de marque) et contrôle anti-doublon.

## 12. Estimation
- Audit & cartographie : 0.5 j
- Normalisation : 0.5 j
- Complétion & nettoyage : 0.5 à 1 j
- Validation autocomplete + build : 0.5 j

Total estimé : 2 à 2.5 jours selon volume final.

## 13. Plan d’exécution opérationnel (ordre conseillé)
1. Audit de la catégorie charcuterie actuelle
2. Validation taxonomie + arbitrages inter-catégories
3. Implémentation lot minimal prioritaire
4. Nettoyage placeholder et doublons
5. Tests autocomplete
6. Build + documentation finale des écarts et décisions

## 14. Résultat attendu
Une catégorie `charcuterie` réellement enrichie, cohérente côté nutrition (portion/kcal/QN), sans placeholder, fiable en autocomplétion, et prête pour les batches d’extension ultérieurs.

## 15. Décision de lot recommandée
- **À faire maintenant :** création/validation du plan (ce document).
- **À faire plus tard (batch d’implémentation) :** ajouts/modifications dans `data/referentiel.js` après validation métier des portions/kcal/QN.

## 16. Clarification périmètre (retour utilisateur)
### Principe directeur
L’harmonisation de la catégorie `charcuterie` ne doit **pas** entraîner un déplacement massif des aliments `viandes`, `snack`, `fast-food` ou autres catégories vers `charcuterie`.

### Matrice de décision (obligatoire)
1. **Entrée charcuterie consommée seule**
- Cible : `charcuterie`
- Exemple : jambon blanc, rillettes, rosette, pâté, coppa.

2. **Entrée charcuterie intégrée à un plat, sandwich ou fast-food**
- Cible : conserver la catégorie existante (`snack`, `fast-food`, `viandes`, `sandwich`, `plat préparé`) sauf validation explicite contraire.
- Exemples : bacon d’un burger, jambon d’un sandwich, chorizo dans une pizza.

3. **Entrée ambiguë déjà en place**
- Cible : ne pas recatégoriser automatiquement.
- Action : décision au cas par cas en revue de mapping.

4. **Entrée manifestement charcutière mais rangée ailleurs par erreur, et consommée seule**
- Cible : candidate à recatégorisation vers `charcuterie`, après validation.

### Règles de sécurité de migration
- Interdiction de recatégorisation en masse.
- Toute recatégorisation doit être listée avant exécution dans un tableau de mapping “avant → après”.
- Si doute, conserver la catégorie actuelle et créer une version charcuterie explicite seulement si nécessaire.

### Impact attendu
- Préservation de la logique métier des catégories existantes.
- Autocomplétion plus claire sans effets de bord sur les autres familles d’aliments.
- Harmonisation progressive et contrôlée, batch par batch.

### Règle métier complémentaire
- Si l’aliment n’est charcuterie **que parce qu’il entre dans la composition d’un autre plat**, il sort du scope charcuterie.
- Si l’aliment est présenté et consommé comme une charcuterie autonome, il entre dans le scope charcuterie.

## 17. État de validation des étapes
- Aucune étape validée existante n’a été supprimée.
- Cette mise à jour ajoute uniquement des règles de cadrage et de gouvernance pour la phase d’implémentation future.

## 18. Exécution pas à pas (réalisée)

### Étape 1 — Audit & Cartographie (Phase A) ✅
- Inventaire réalisé sur la catégorie `charcuterie`.
- Constat initial : un seul placeholder `Exemple charcuterie`.
- Constat métier validé : la charcuterie doit rester limitée aux produits consommés seuls, pas aux ingrédients intégrés à un burger, un sandwich ou un plat déjà géré ailleurs.

### Étape 2 — Normalisation structure & règles (Phase B) ✅
- Taxonomie validée selon la règle métier utilisateur: produit autonome uniquement.
- Les produits de type ingrédient dans `fast-food`, `sandwich`, `plat préparé`, `viandes` ne sont pas déplacés automatiquement.
- Convention de nommage retenue: libellés explicites, sans vocabulaire vague.

### Étape 3 — Complétion & Nettoyage (Phase C) ✅
- Placeholder `Exemple charcuterie` supprimé.
- Lot minimal ajouté:
  - Jambon blanc (sans couenne)
  - Jambon cru
  - Jambon sec
  - Blanc de dinde
  - Saucisson sec
  - Rosette
  - Coppa
  - Pâté de campagne
  - Rillettes de porc
  - Mortadelle
  - Bacon tranché
  - Terrine de campagne
- Recatégorisation ciblée validée:
  - `Jambon blanc (sans couenne)` passé en `charcuterie`
  - `Chorizo` passé en `charcuterie`

### Étape 4 — Validation autocomplétion & non-régression (Phase D) ✅
- Contrôle placeholders: 0 placeholder restant dans `charcuterie`.
- Contrôle doublons: 0 doublon bloquant.
- Build complet exécuté: OK.

## 19. État final après exécution
- Catégorie `charcuterie` portée à 12 entrées exploitables.
- 0 placeholder.
- Aucun déplacement massif hors scope.
- Cohérence renforcée avec la règle: charcuterie seule = oui, charcuterie intégrée à un autre produit = non.

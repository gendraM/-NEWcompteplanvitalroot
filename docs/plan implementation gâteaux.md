# 🍰 PLAN IMPLEMENTATION GÂTEAUX

## 1. Objet
Mettre en place un plan d’implémentation clair, progressif et vérifiable pour enrichir la catégorie gâteaux dans le référentiel alimentaire, en s’appuyant sur les retours d’expérience de la catégorie viennoiserie.

## 2. Contexte constaté (audit 2026-07-26)
- La catégorie `gâteaux` existe mais reste partiellement incomplète.
- Un placeholder est encore présent : `Exemple gâteau`.
- Couverture actuelle limitée (5 entrées dont 1 placeholder) :
  - Exemple gâteau
  - Fondant au chocolat
  - Gâteau au yaourt
  - Madeleine
  - Quatre-quarts
- Des produits proches sont classés hors catégorie (`snack`, `dessert`, `fast-food`, `extra`) :
  - Gâteau au chocolat (fait maison) (extra)
  - Cheesecake (dessert)
  - Brownie (snack)
  - Muffin myrtille (snack)
  - Donuts/Cookies d’enseignes (fast-food/snack)

## 3. Retours d’expérience à réutiliser (cas viennoiserie)
1. Placeholder visible = dette immédiate
- Le placeholder dégrade l’autocomplétion et donne une impression de catégorie "factice".
- Action reproduite : supprimer le placeholder et/ou l’exclure de l’autocomplete.

2. Doublons inter-catégories = risque d’attribution erronée
- Même nom présent dans plusieurs catégories peut faire ressortir une catégorie non voulue.
- Action reproduite : audit anti-doublon strict + règle de priorité de catégorie.

3. Cohérence kcal / portion / QN indispensable
- Les écarts de portion (pièce vs grammes) peuvent créer des valeurs kcal incohérentes.
- Action reproduite : définir une règle explicite de portion standard puis aligner `kcal` et `kcalParUnite`.

4. Implémentation par batchs = plus sûre
- Ajouter trop d’entrées d’un coup augmente les erreurs.
- Action reproduite : lot prioritaire réduit, vérification build/autocomplete, puis lot secondaire.

## 4. Objectifs d’implémentation
1. Construire une catégorie gâteaux complète, exploitable et cohérente.
2. Supprimer l’effet placeholder côté saisie utilisateur.
3. Garantir une autocomplétion claire (sans faux positifs ni collisions de catégories).
4. Harmoniser les champs nutritionnels (`portionDefaut`, `kcal`, `kcalParUnite`, `qn`) selon une logique stable.
5. Préparer les ajouts futurs (FR + international) sans régression.

## 5. Périmètre
### Inclus
- Référentiel alimentaire (entrées gâteaux)
- Normalisation catégorie + sous-catégories gâteaux
- Règles anti-doublon et conventions de nommage
- Contrôles qualité des champs nutritionnels et portions
- Validation autocomplétion ciblée

### Exclu
- Refonte globale de toutes les catégories
- Reclassification complète des desserts d’enseignes fast-food
- Refonte du moteur calorique global

## 6. Références de pilotage
- PLAN_ENRICHISSEMENT_REFERENTIEL_723.md
- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md
- plan implementation viennoiserie.md (méthodologie de référence)
- MISE EN CONFORMIT2 KCAL (méthode d’alignement kcal/portion)

## 7. Cible fonctionnelle de la catégorie gâteaux
### 7.1 Lot minimal recommandé (base)
- Gâteau au chocolat
- Fondant au chocolat
- Gâteau au yaourt
- Quatre-quarts
- Madeleines
- Cake marbré
- Cake citron
- Moelleux au chocolat
- Brownie (version générique, hors enseigne)
- Cheesecake (version générique)

### 7.2 Sous-catégories recommandées
- Gâteaux maison classiques
- Gâteaux au chocolat
- Cakes tranchés
- Gâteaux individuels
- Gâteaux crémeux/froids

## 8. Règles de données (qualité)
Chaque entrée gâteaux doit contenir au minimum :
- nom
- categorie
- sousCategorie
- kcal
- kcalParUnite (ou cohérence explicite avec unité)
- qn
- portionDefaut
- unite
- alternatives

Contraintes :
- 0 placeholder dans la catégorie
- 0 doublon strict de nom entre catégories concurrentes (ou arbitrage documenté)
- `portionDefaut` lisible utilisateur (par pièce ou part avec grammage)
- `kcal` cohérent avec la portion affichée
- `qn` cohérent avec transformation alimentaire (souvent 1-2 pour gâteaux industriels/sucrés)
- alternatives existantes dans le référentiel

## 9. Stratégie d’implémentation (phases)
## Phase A — Audit & Cartographie
1. Inventorier les entrées actuelles de `gâteaux`.
2. Identifier placeholder, champs incomplets, écarts kcal/portion/QN.
3. Lister les candidats hors catégorie (extra/snack/dessert/fast-food) et décider :
   - recatégoriser,
   - dupliquer version générique,
   - ou conserver hors périmètre.
4. Produire un tableau "Prévu vs Réel".

Livrables Phase A :
- Tableau Prévu vs Réel gâteaux
- Liste des anomalies (placeholder, manquants, incohérences, doublons)

## Phase B — Normalisation structure & règles
1. Valider la taxonomie cible (`gâteaux` + sous-catégories).
2. Définir conventions de nommage (accents, singulier/pluriel, variantes "fait maison" vs marque).
3. Définir règle d’arbitrage anti-doublon inter-catégories.

Livrables Phase B :
- Dictionnaire de mapping validé
- Convention de nommage validée
- Règle d’arbitrage documentée

## Phase C — Complétion & Nettoyage
1. Supprimer `Exemple gâteau`.
2. Ajouter le lot minimal prioritaire.
3. Recatégoriser les entrées clairement mal classées (si validé).
4. Aligner `portionDefaut`, `kcal`, `kcalParUnite`, `qn` sur les règles.

Livrables Phase C :
- Catégorie gâteaux propre, sans placeholder
- Jeu d’entrées prioritaire complet et cohérent

## Phase D — Validation autocomplétion & non-régression
1. Tester les recherches :
   - "gate", "choco", "fond", "yaourt", "brown", "cheese"
2. Vérifier :
   - pertinence des suggestions,
   - absence de placeholder,
   - affichage portion + QN,
   - absence de collisions bloquantes avec `snack`, `dessert`, `fast-food`.
3. Lancer build complet.

Livrables Phase D :
- Procès-verbal de tests autocomplete gâteaux
- Validation build

## 10. Critères d’acceptation
- 0 placeholder visible pour gâteaux
- Lot minimal implémenté et valide
- 100% des champs obligatoires renseignés
- 0 doublon bloquant après arbitrage
- Autocomplétion conforme sur les cas de test
- Build réussi

## 11. Risques et mitigations
- Risque : confusion entre catégories proches (`gâteaux`, `pâtisserie`, `dessert`, `snack`).
  - Mitigation : règles d’arbitrage explicites + sous-catégories claires.

- Risque : incohérences kcal causées par portions hétérogènes.
  - Mitigation : règle portion standard + revue comparative avant/après.

- Risque : doublons nom exact avec produits d’enseigne.
  - Mitigation : suffixes explicites (ex: "(fait maison)", "enseigne") et contrôle anti-doublon.

## 12. Estimation
- Audit & cartographie : 0.5 j
- Normalisation : 0.5 j
- Complétion & nettoyage : 0.5 à 1 j
- Validation autocomplete + build : 0.5 j

Total estimé : 2 à 2.5 jours selon volume final.

## 13. Plan d’exécution opérationnel (ordre conseillé)
1. Audit de la catégorie gâteaux actuelle
2. Validation taxonomie + arbitrages inter-catégories
3. Implémentation lot minimal prioritaire
4. Nettoyage placeholder et doublons
5. Tests autocomplete
6. Build + documentation finale des écarts et décisions

## 14. Résultat attendu
Une catégorie `gâteaux` réellement enrichie, cohérente côté nutrition (portion/kcal/QN), sans placeholder, fiable en autocomplétion, et prête pour les batches d’extension ultérieurs.

## 15. Décision de lot recommandée
- **À faire maintenant :** création/validation du plan (ce document).
- **À faire plus tard (batch d’implémentation) :** ajouts/modifications dans `data/referentiel.js` après validation métier des portions/kcal/QN.

## 16. Clarification périmètre (retour utilisateur) ✅

### Principe directeur
L’harmonisation de la catégorie `gâteaux` ne doit **pas** entraîner un déplacement massif des aliments `snack`, `dessert`, `fast-food` ou autres catégories vers `gâteaux`.

### Matrice de décision (obligatoire)
1. **Entrée générique ou maison de type gâteau**
- Cible : `gâteaux`
- Exemple : gâteau au yaourt, fondant, cake marbré, moelleux.

2. **Entrée marque/enseigne (restaurant, fast-food, coffee shop)**
- Cible : conserver la catégorie existante (`snack`, `dessert`, `fast-food`) sauf validation explicite contraire.
- Exemples : brownie KFC, donuts McDo, muffin Starbucks.

3. **Entrée ambiguë déjà en place**
- Cible : ne pas recatégoriser automatiquement.
- Action : décision au cas par cas en revue de mapping.

4. **Entrée manifestement mal classée mais libellée “gâteau (fait maison)”**
- Cible : candidate à recatégorisation vers `gâteaux`, après validation.

### Règles de sécurité de migration
- Interdiction de recatégorisation en masse.
- Toute recatégorisation doit être listée avant exécution dans un tableau de mapping “avant → après”.
- Si doute, conserver la catégorie actuelle et créer une variante générique dans `gâteaux`.

### Impact attendu
- Préservation de la logique métier des catégories existantes.
- Autocomplétion plus claire sans effets de bord sur les autres familles d’aliments.
- Harmonisation progressive et contrôlée, batch par batch.

## 17. État de validation des étapes
- Aucune étape validée existante n’a été supprimée.
- Cette mise à jour ajoute uniquement des règles de cadrage et de gouvernance pour la phase d’implémentation future.

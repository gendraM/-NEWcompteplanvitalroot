# 🥐 PLAN IMPLEMENTATION VIENNOISERIE

## 1. Objet
Mettre en place un plan d’implémentation clair, progressif et vérifiable pour enrichir la catégorie viennoiserie dans le référentiel alimentaire, en cohérence avec la stratégie du projet.

## 2. Contexte constaté
- Le plan de référence prévoit une montée en couverture des catégories alimentaires avec enrichissement progressif.
- La cartographie actuelle montre une anomalie de structure pour viennoiserie : une entrée placeholder existe sans contenu métier réel complet.
- Cette situation peut créer un effet "catégorie préparée mais non réellement enrichie" côté autocomplétion.

## 3. Objectifs d’implémentation
1. Construire une catégorie viennoiserie complète, exploitable et cohérente.
2. Supprimer l’effet placeholder dans la saisie utilisateur.
3. Garantir une autocomplétion utile (résultats réels, clairs, non ambigus).
4. Établir une base maintenable pour les enrichissements futurs.

## 4. Périmètre
### Inclus
- Référentiel alimentaire (entrées viennoiserie)
- Définition et normalisation des sous-catégories viennoiserie
- Règles anti-doublon et conventions de nommage
- Contrôles qualité des champs (kcal, qn, portionDefaut, unite, alternatives, typeOrigine)
- Validation autocomplétion ciblée sur viennoiserie

### Exclu
- Refactor global de toutes les catégories alimentaires
- Changements non liés à la famille viennoiserie
- Refonte du moteur nutritionnel global

## 5. Références de pilotage
- PLAN_ENRICHISSEMENT_REFERENTIEL_723.md
- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md
- plan implementation fromage.md (méthodologie de référence)

## 6. Cible fonctionnelle de la catégorie viennoiserie
## 6.1 Lot minimal recommandé (base de démarrage)
- Croissant
- Pain au chocolat
- Pain aux raisins
- Chausson aux pommes
- Brioche nature
- Brioche au sucre
- Brioche feuilletée
- Palmier
- Torsade chocolat
- Suisse (brioche crème/pépites)

## 6.2 Sous-catégories recommandées
- Viennoiserie feuilletée
- Viennoiserie briochée
- Viennoiserie fourrée
- Viennoiserie sucrée classique

## 7. Règles de données (qualité)
Chaque entrée viennoiserie doit contenir au minimum :
- nom
- categorie
- sousCategorie
- kcal
- qn
- portionDefaut
- unite
- alternatives
- typeOrigine (quand applicable)

Contraintes :
- Aucun doublon strict de nom à catégorie équivalente
- Formats portions lisibles et standardisés (ex: 1 pièce, 60g, 80g)
- Alternatives existantes dans le référentiel
- Valeurs kcal réalistes et homogènes entre produits proches
- QN cohérent avec la logique nutritionnelle du projet

## 8. Stratégie d’implémentation (phases)
## Phase A — Audit & Cartographie
1. Inventorier les entrées existantes de la catégorie viennoiserie.
2. Identifier les placeholders et entrées incomplètes.
3. Mesurer l’écart entre attendu métier et existant réel.
4. Produire un tableau "Prévu vs Réel".

Livrable Phase A :
- Tableau "Prévu vs Réel" viennoiserie
- Liste des anomalies (manquants, placeholders, champs incomplets, doublons)

## Phase B — Normalisation de structure
1. Valider la taxonomie cible (categorie + sousCategorie).
2. Définir les conventions de nommage (accents, variantes, libellés).
3. Préparer le mapping de migration si entrées existantes hétérogènes.

Livrable Phase B :
- Dictionnaire de mapping validé
- Convention de structure validée

## Phase C — Complétion & Nettoyage
1. Ajouter les entrées manquantes du lot minimal.
2. Remplacer ou supprimer les placeholders viennoiserie.
3. Compléter tous les champs obligatoires.
4. Vérifier la cohérence des alternatives.

Livrable Phase C :
- Lot viennoiserie propre, complet et exploitable

## Phase D — Validation autocomplétion
1. Tester les recherches :
   - "cro", "pain choco", "rai", "chaus", "brio", "palm"
2. Vérifier :
   - résultats pertinents
   - absence d’entrées placeholder
   - cohérence tri et limite de suggestions
3. Vérifier les cas proches (orthographe simplifiée, accents, variantes).

Livrable Phase D :
- Procès-verbal de tests autocomplétion viennoiserie

## 9. Critères d’acceptation
- 0 placeholder visible dans la catégorie viennoiserie
- Lot minimal implémenté et valide
- 100% des champs obligatoires renseignés
- 0 doublon bloquant dans la catégorie
- Résultats autocomplétion conformes sur les cas de test

## 10. Risques et mitigations
- Risque : doublons de variantes commerciales.
  - Mitigation : règle anti-doublon stricte + normalisation nom.
- Risque : kcal incohérentes entre produits similaires.
  - Mitigation : contrôle comparatif par sous-catégorie.
- Risque : autocomplétion bruitée (alias/variantes trop proches).
  - Mitigation : conventions de nommage + alternatives structurées.

## 11. Estimation
- Audit & cartographie : 0.5 j
- Normalisation : 0.5 j
- Complétion & nettoyage : 0.5 à 1 j
- Validation autocomplétion : 0.5 j

Total estimé : 2 à 2.5 jours selon le volume réel à enrichir.

## 12. Plan d’exécution opérationnel (ordre conseillé)
1. Audit de la catégorie viennoiserie actuelle.
2. Validation taxonomie + mapping.
3. Implémentation des entrées manquantes.
4. Nettoyage placeholders.
5. Tests d’autocomplétion.
6. Documentation finale des écarts et décisions.

## 13. Résultat attendu
Une catégorie viennoiserie réellement enrichie, sans effet "structure vide", cohérente côté données, et fiable pour l’autocomplétion.
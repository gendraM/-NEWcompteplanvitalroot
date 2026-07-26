# 🐟 PLAN IMPLEMENTATION POISSON

## 1. Objet
Mettre en place un plan d’implémentation clair, progressif et vérifiable pour enrichir la catégorie poisson dans le référentiel alimentaire, en réutilisant la méthode éprouvée sur charcuterie, gâteaux et viennoiserie.

## 2. Contexte constaté (audit 2026-07-26)
- La catégorie `poisson` existe mais ne contient actuellement qu’une entrée structurelle.
- Un placeholder est présent : `Exemple poisson`.
- Couverture actuelle réelle : 0 entrée métier exploitable, 1 placeholder.
- La catégorie poisson doit regrouper les produits de la mer consommés comme aliments autonomes : filet, pavé, portion, boîte, pièce, tranche ou préparation clairement identifiée comme poisson.
- Les produits où le poisson n’est qu’un composant d’un autre plat restent gérés par leurs catégories respectives (`fast-food`, `plat préparé`, `asiatique`, `africain`, etc.).
- Les entrées déjà présentes ailleurs dans le référentiel ne doivent pas être déplacées automatiquement si elles appartiennent à un autre usage métier.
- Le mode de cuisson n’entre pas dans ce plan et sera traité plus tard dans un lot séparé.

## 3. Retours d’expérience à réutiliser (cas charcuterie / viennoiserie)
1. Placeholder visible = dette immédiate
- Un placeholder donne une fausse impression de catégorie existante.
- Action à reproduire : supprimer le placeholder dès que la catégorie est prête ou l’exclure de l’autocomplete.

2. Doublons inter-catégories = risque d’attribution erronée
- Un même aliment peut apparaître dans plusieurs familles proches ou dans des plats déjà traités ailleurs.
- Action à reproduire : audit anti-doublon strict + règle d’arbitrage avant toute recatégorisation.

3. Cohérence kcal / portion / QN indispensable
- Un poisson en filet, en portion ou en boîte doit avoir une portion lisible et cohérente.
- Action à reproduire : aligner `portionDefaut`, `kcal` et `kcalParUnite` dès la création.

4. Implémentation par batchs = plus sûre
- Ajouter trop d’items d’un coup augmente les erreurs de classification et de saisie.
- Action à reproduire : lot prioritaire réduit, validation autocomplete, puis batch secondaire.

## 4. Objectifs d’implémentation
1. Construire une catégorie poisson exploitable et cohérente.
2. Supprimer l’effet placeholder côté saisie utilisateur.
3. Garantir une autocomplétion claire, sans collision avec `fast-food`, `plat préparé`, `asiatique` ou `africain`.
4. Harmoniser les champs nutritionnels (`portionDefaut`, `kcal`, `kcalParUnite`, `qn`) selon une logique stable.
5. Préparer les ajouts futurs sans régression.

## 5. Périmètre
### Inclus
- Référentiel alimentaire (entrées poisson)
- Normalisation catégorie + sous-catégories poisson
- Règles anti-doublon et conventions de nommage
- Contrôles qualité des champs nutritionnels et portions
- Validation autocomplétion ciblée

### Exclu
- Refonte globale de toutes les catégories
- Reclassification massive d’aliments appartenant clairement à `fast-food`, `plat préparé`, `asiatique` ou `africain`
- Refonte du moteur calorique global
- Gestion du mode de cuisson

## 6. Références de pilotage
- PLAN_ENRICHISSEMENT_REFERENTIEL_723.md
- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md
- plan implementation charcuterie.md (méthodologie de référence)
- plan implementation gâteaux.md (méthodologie de référence)
- plan implementation viennoiserie.md (méthodologie de référence)

## 7. Cible fonctionnelle de la catégorie poisson
### 7.1 Lot minimal recommandé (base)
- Poisson blanc
- Cabillaud
- Saumon
- Thon
- Sardines
- Maquereau
- Truite
- Colin
- Merlu
- Dorade
- Bar
- Hareng
- Anchois
- Thon en boîte

### 7.2 Sous-catégories recommandées
- Poisson blanc
- Poisson gras
- Poisson en boîte
- Poisson fumé
- Poisson frais
- Poisson pané maison
- Filets / pavés

### 7.3 Règle validée de fond sur le QN poisson
- Daurade fraîche nature -> QN 5
- Merlu frais nature -> QN 5
- Poisson juste grillé / cuit simple sans sauce -> QN 5 ou 4 selon le niveau de préparation
- Poisson pané / frit -> QN 1 à 2
- Poisson fumé / conserve / préparation plus transformée -> QN 2 à 4 selon le cas

### 7.4 Règle de fond métier
- Le poisson est traité comme un aliment autonome quand il est consommé seul, en filet, pavé, boîte, tranche ou portion clairement identifiée.
- Si le poisson n’est qu’un composant d’un autre produit déjà traité ailleurs, il reste dans la catégorie de ce produit.
- La catégorie poisson doit donc éviter les recatégorisations automatiques de plats composés, fast-food ou préparations déjà gérées par une autre famille.

## 8. Règles de données (qualité)
Chaque entrée poisson doit contenir au minimum :
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
- 0 doublon strict de nom entre catégories concurrentes sans arbitrage documenté
- `portionDefaut` lisible utilisateur (par filet, pavé, boîte, tranche ou grammes)
- `kcal` cohérent avec la portion affichée
- `qn` cohérent avec le niveau de transformation alimentaire
- alternatives existantes dans le référentiel

## 9. Stratégie d’implémentation (phases)
## Phase A — Audit & Cartographie
1. Inventorier les entrées actuelles de `poisson`.
2. Identifier placeholder, champs incomplets, écarts kcal/portion/QN.
3. Lister les candidats hors catégorie (plats préparés, fast-food, catégories de protéines déjà existantes, plats composés) et décider :
   - recatégoriser,
   - dupliquer en version poisson,
   - ou conserver hors périmètre.
4. Produire un tableau "Prévu vs Réel".

Livrables Phase A :
- Tableau Prévu vs Réel poisson
- Liste des anomalies (placeholder, manquants, incohérences, doublons)

## Phase B — Normalisation structure & règles
1. Valider la taxonomie cible (`poisson` + sous-catégories).
2. Définir conventions de nommage (naturel / frais / boîte / fumé / marque).
3. Définir règle d’arbitrage anti-doublon inter-catégories.

Livrables Phase B :
- Dictionnaire de mapping validé
- Convention de nommage validée
- Règle d’arbitrage documentée

## Phase C — Complétion & Nettoyage
1. Supprimer `Exemple poisson` quand le lot minimal est prêt.
2. Ajouter le lot minimal prioritaire.
3. Recatégoriser uniquement les entrées clairement validées comme poisson.
4. Aligner `portionDefaut`, `kcal`, `kcalParUnite`, `qn` sur les règles.

Livrables Phase C :
- Catégorie poisson propre, sans placeholder
- Jeu d’entrées prioritaire complet et cohérent

## Phase D — Validation autocomplétion & non-régression
1. Tester les recherches :
   - "pois", "saum", "thon", "cab", "sard", "maqu", "dor", "mer", "trui"
2. Vérifier :
   - pertinence des suggestions,
   - absence de placeholder,
   - affichage portion + QN,
   - absence de collisions bloquantes avec `fast-food`, `plat préparé`, `asiatique`, `africain`.
3. Lancer build complet.

Livrables Phase D :
- Procès-verbal de tests autocomplete poisson
- Validation build

## 10. Critères d’acceptation
- 0 placeholder visible pour poisson
- Lot minimal implémenté et valide
- 100% des champs obligatoires renseignés
- 0 doublon bloquant après arbitrage
- Autocomplétion conforme sur les cas de test
- Build réussi

## 11. Risques et mitigations
- Risque : confusion entre catégories proches (`poisson`, `fast-food`, `plat préparé`, `asiatique`, `africain`).
  - Mitigation : règles d’arbitrage explicites + sous-catégories claires.

- Risque : incohérences kcal causées par portions hétérogènes.
  - Mitigation : règle portion standard + revue comparative avant/après.

- Risque : doublons nom exact avec produits d’enseigne ou produits déjà présents ailleurs.
  - Mitigation : suffixes explicites si nécessaire et contrôle anti-doublon.

## 12. Estimation
- Audit & cartographie : 0.5 j
- Normalisation : 0.5 j
- Complétion & nettoyage : 0.5 à 1 j
- Validation autocomplete + build : 0.5 j

Total estimé : 2 à 2.5 jours selon volume final.

## 13. Plan d’exécution opérationnel (ordre conseillé)
1. Audit de la catégorie poisson actuelle
2. Validation taxonomie + arbitrages inter-catégories
3. Implémentation lot minimal prioritaire
4. Nettoyage placeholder et doublons
5. Tests autocomplete
6. Build + documentation finale des écarts et décisions

## 14. Résultat attendu
Une catégorie `poisson` réellement enrichie, cohérente côté nutrition (portion/kcal/QN), sans placeholder, fiable en autocomplétion, et prête pour les batches d’extension ultérieurs.

## 15. Décision de lot recommandée
- **À faire maintenant :** création/validation du plan (ce document).
- **À faire plus tard (batch d’implémentation) :** ajouts/modifications dans `data/referentiel.js` après validation métier des portions/kcal/QN.

## 16. Clarification périmètre
### Principe directeur
L’harmonisation de la catégorie `poisson` ne doit **pas** entraîner un déplacement massif des aliments `fast-food`, `plat préparé`, `asiatique`, `africain` ou autres catégories vers `poisson`.

### Matrice de décision (obligatoire)
1. **Entrée poisson consommée seule**
- Cible : `poisson`
- Exemple : filet de cabillaud, pavé de saumon, thon en boîte, sardines, maquereau.

2. **Entrée poisson intégrée à un plat, sandwich ou fast-food**
- Cible : conserver la catégorie existante (`fast-food`, `plat préparé`, `asiatique`, `africain`, etc.) sauf validation explicite contraire.
- Exemples : fish burger, sandwich thon, sushi, plat préparé au poisson déjà classé ailleurs.

3. **Entrée ambiguë déjà en place**
- Cible : ne pas recatégoriser automatiquement.
- Action : décision au cas par cas en revue de mapping.

4. **Entrée manifestement poisson mais rangée ailleurs par erreur, et consommée seule**
- Cible : candidate à recatégorisation vers `poisson`, après validation.

### Règles de sécurité de migration
- Interdiction de recatégorisation en masse.
- Toute recatégorisation doit être listée avant exécution dans un tableau de mapping “avant → après”.
- Si doute, conserver la catégorie actuelle et créer une version poisson explicite seulement si nécessaire.

### Impact attendu
- Préservation de la logique métier des catégories existantes.
- Autocomplétion plus claire sans effets de bord sur les autres familles d’aliments.
- Harmonisation progressive et contrôlée, batch par batch.

### Règle métier complémentaire
- Si l’aliment n’est poisson **que parce qu’il entre dans la composition d’un autre plat**, il sort du scope poisson.
- Si l’aliment est présenté et consommé comme un poisson autonome, il entre dans le scope poisson.

## 17. État d’avancement au 2026-07-26
- Le premier lot poisson est implémenté dans `data/referentiel.js`.
- Le placeholder `Exemple poisson` a été supprimé.
- Les entrées ajoutées utilisent des libellés explicites pour éviter les doublons exacts déjà présents ailleurs dans le référentiel.
- Le build a été validé après ajout.
- La règle QN validée et la règle de fond métier sont conservées dans ce plan.
- Le mode de cuisson reste hors périmètre pour ce lot.

## 17. État de validation des étapes
- Aucune étape validée existante n’a été supprimée.
- Cette mise à jour ajoute uniquement des règles de cadrage et de gouvernance pour la phase d’implémentation future.

## 18. Exécution pas à pas (réalisée)

### Étape 1 — Audit & Cartographie (Phase A) ✅
- Inventaire réalisé sur la catégorie `poisson`.
- Constat initial : un seul placeholder `Exemple poisson`.
- Constat métier validé : la catégorie poisson doit rester limitée aux produits consommés seuls, pas aux ingrédients intégrés à un burger, un sandwich ou un plat déjà géré ailleurs.

### Étape 2 — Normalisation structure & règles (Phase B) ✅
- Taxonomie validée selon la règle métier utilisateur: produit autonome uniquement.
- Les produits de type ingrédient dans `fast-food`, `plat préparé`, `asiatique`, `africain` ne sont pas déplacés automatiquement.
- Convention de nommage retenue: libellés explicites, sans vocabulaire vague.

### Étape 3 — Complétion & Nettoyage (Phase C) ✅
- Placeholder `Exemple poisson` supprimé.
- Lot minimal ajouté :
  - Poisson blanc
  - Cabillaud
  - Saumon
  - Thon
  - Sardines
  - Maquereau
  - Truite
  - Colin
  - Merlu
  - Dorade
  - Bar
  - Hareng
  - Anchois
  - Thon en boîte
- Recatégorisation ciblée validée uniquement pour les doublons manifestement autonomes, après arbitrage.

### Étape 4 — Validation autocomplétion & non-régression (Phase D) ✅
- Contrôle placeholders: 0 placeholder restant dans `poisson`.
- Contrôle doublons: 0 doublon bloquant.
- Build complet exécuté: OK.

## 19. État final après exécution
- Catégorie `poisson` portée à 14 entrées exploitables.
- 0 placeholder.
- Aucun déplacement massif hors scope.
- Cohérence renforcée avec la règle: poisson seul = oui, poisson intégré à un autre produit = non.

## 20. Batch A — Extension continentale (2026-07-26) ✅

### Ajouts Afrique (6)
- Tilapia (filet)
- Sardinelle
- Chinchard
- Capitaine
- Mérou
- Silure

### Ajouts Europe (6)
- Merlan (filet)
- Lieu noir (filet)
- Lieu jaune (filet)
- Sole (filet)
- Lotte (filet)
- Rouget (filet)

### Contrôles
- Build validé après ajout.
- Contrôle anti-doublon nominal : 1 occurrence par nouvelle entrée.
- Total catégorie `poisson` après Batch A : 26 entrées.

### Clarification crustacés / fruits de mer
- Dans la taxonomie actuelle, les crustacés et fruits de mer sont déjà présents dans `categorie: "protéine"` et `sousCategorie: "Fruits de mer"`.
- Exemples déjà présents : `Crevettes (cuites)`, `Moules (cuites)`, `Crabe / Surimi`.
- Décision Batch A : conserver ces entrées dans leur famille actuelle pour éviter une recatégorisation massive hors périmètre.

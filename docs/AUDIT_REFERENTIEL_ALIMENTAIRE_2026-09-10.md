# AUDIT RÉFÉRENTIEL ALIMENTAIRE — 2026-09-10

## 1. Objet

Établir l’état réel du référentiel alimentaire à partir de la branche `referentiel-alimentaire`, elle-même recalée sur le HEAD de `plan-alimentaire-intelligent-chatgpt`, avant tout nouvel enrichissement.

Objectifs :
- ne pas repartir du vieux jalon « 425 → 723 » comme s’il décrivait encore l’état courant ;
- distinguer les lots déjà exécutés des lots réellement manquants ;
- comprendre les dépendances fonctionnelles du référentiel ;
- formaliser une méthode d’ajout compatible avec l’existant ;
- préparer un plan d’action sans modifier les données alimentaires tant que ce plan n’est pas validé explicitement.

Aucune entrée alimentaire n’est ajoutée ou supprimée dans cet audit.

---

## 2. Base Git vérifiée

- Repo : `gendraM/-NEWcompteplanvitalroot`
- Branche source fonctionnelle : `plan-alimentaire-intelligent-chatgpt`
- HEAD source constaté au démarrage de l’audit : `4fb7eb42c4a44cf9693072a6a4a5472d502fedcc`
- Branche de travail : `referentiel-alimentaire`
- La branche `referentiel-alimentaire` a été recalée sur ce HEAD avant l’audit.
- `main` n’est pas utilisé pour ce chantier.
- La branche par défaut / branche `AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS` n’est pas utilisée comme base de ce chantier.

---

## 3. Conclusion principale sur l’ancien objectif 425 → 723

Le document `PLAN_ENRICHISSEMENT_REFERENTIEL_723.md` est un plan historique daté du 2026-01-07.

Il indique :
- ancien état : 425 plats ;
- cible théorique : 723 plats ;
- environ 300 ajouts envisagés.

Cet état n’est plus utilisable comme photographie actuelle, car plusieurs lots ont ensuite été réellement implémentés et documentés.

Le référentiel actuel contient en outre plusieurs couches :
1. `referentielAliments` ;
2. `correctifsAliments` ;
3. fusion de `correctifsAliments` dans `referentielAliments` avec contrôle anti-doublon à l’exécution.

Conséquence : un simple comptage brut des objets présents dans le fichier source ne suffit pas pour établir le nombre final d’entrées runtime, puisque certains objets de `correctifsAliments` sont volontairement ignorés par la boucle de fusion lorsqu’un doublon exact nom/catégorie/marque existe déjà.

L’objectif 723 doit donc être considéré comme une cible historique de couverture, pas comme une soustraction automatique « 723 - nombre actuel ».

---

## 4. Lots spécialisés confirmés comme exécutés

### Charcuterie
État final documenté :
- 12 entrées exploitables ;
- 0 placeholder ;
- pas de déplacement massif hors scope ;
- build validé.

Règle métier conservée : charcuterie autonome = catégorie `charcuterie`; charcuterie seulement intégrée dans un burger/sandwich/pizza = catégorie du plat.

### Céréales
État documenté après Batch A :
- 13 entrées en catégorie `céréales` ;
- 9 recatégorisations contrôlées ;
- 4 nouveaux ajouts ;
- 0 placeholder ;
- build validé.

### Poisson
État final après extension continentale :
- premier lot : 14 entrées ;
- Batch A Afrique + Europe : +12 ;
- total catégorie `poisson` documenté : 26 entrées ;
- 0 placeholder ;
- build validé.

Les crustacés/fruits de mer existants sont volontairement conservés dans `protéine / Fruits de mer` afin d’éviter une recatégorisation massive.

### Gâteaux
État final documenté :
- 10 entrées exploitables ;
- 0 placeholder ;
- distinction maison / industriel / enseigne préservée ;
- pas de recatégorisation massive ;
- build validé.

### Pâtisserie
État final documenté :
- 18 entrées ;
- 0 placeholder ;
- doublons stricts dans la catégorie : 0 au moment du contrôle ;
- build validé.

### Viennoiserie
Lot minimal exécuté et catégorie opérationnelle.
La documentation d’amélioration continue signale ensuite une couverture observée de 13 entrées, supérieure au noyau minimal initial.

### Fromage
Lot d’enrichissement exécuté : fromages AOP / classiques / industriels ajoutés et catégorie `fromage` conservée séparément de `laitier`.
Le placeholder fromage a été supprimé et l’autocomplete a été renforcé contre les entrées `Exemple ...`.

---

## 5. Vérification du reste du plan historique

### Phase 1 historique

#### Thaïlande — encore réellement incomplète
Présent confirmé :
- `Pad Thaï`.

Absence confirmée dans le fichier actuel lors de l’audit :
- `Tom Yum`.

Le lot historique prévoyait également Som Tam, Larb/Laab, Massaman, Khao Pad, Khao Soi, Yam, Kai Med Ma Muang, Moo Satay, Gai Yang, Nam Tok, Pla Rad Prik, etc.

Conclusion : **lot Thaïlande à reprendre par audit anti-doublon détaillé, puis compléter**.

#### Cameroun — lacune toujours confirmée
Absence confirmée lors de l’audit :
- `Ndolé`.

Le lot historique prévoyait notamment : Poulet DG, Koki, Eru, Kondré, Achu, Sanga, Mbongo Tchobi, Kati Kati, Taro sauce jaune.

Conclusion : **lot Cameroun toujours prioritaire**.

#### Viandes de boucherie — lacune toujours confirmée
Absence confirmée lors de l’audit :
- `Bavette`.

Le plan historique prévoyait également Entrecôte, Côte de porc, Gigot d’agneau, Rumsteck, Onglet, Tournedos, Faux-filet, Côtelette d’agneau, Jarret de veau, etc.

Conclusion : **lot boucherie toujours prioritaire**, avec séparation stricte entre morceau de viande autonome et plat cuisiné.

#### Fromages
Lot déjà exécuté : **ne pas le considérer comme restant Phase 1**.

### Phase 2 historique

#### Cuisine anglaise
Absence confirmée lors de l’audit :
- `Fish & Chips`.

Conclusion : couverture britannique encore faible / à auditer avant batch.

#### Charcuterie
Lot spécialisé déjà exécuté : **ne pas recréer un lot de 20 à l’aveugle**. Toute extension future doit partir des 12 entrées actuelles et viser uniquement les manquants utiles.

#### Chine / Japon
Des entrées asiatiques existent déjà en volume, mais des candidats historiques tels que `Baozi` et `Ramen` n’ont pas été retrouvés lors de la vérification ciblée.

Conclusion : ces familles doivent être traitées comme **partiellement couvertes**, pas comme absentes.

#### Street food / restauration rapide
La couverture est déjà beaucoup plus importante que celle décrite dans le plan 425 → 723 : McDonald’s, Quick, O’Tacos, Kebab, Pizza Hut, Subway, Burger King et autres références sont présentes.

Conclusion : ne pas lancer un lot générique « +20 street-food US » sans inventaire actuel préalable.

### Phase 3 historique

- Poissonnerie : lot principal + extension déjà réalisés (26 poissons documentés).
- Gâteaux : lot dédié réalisé.
- Pâtisserie : lot dédié réalisé.
- Produits grande surface : couverture déjà significative mais hétérogène ; audit par sous-famille nécessaire.
- Expansion cuisines existantes / street food internationale : partiellement réalisée, à mesurer par couverture et usage plutôt que par quota brut.

---

## 6. Architecture fonctionnelle actuelle du référentiel

Le référentiel n’est pas une simple liste d’affichage.

### `components/RepasBloc.js`
Il utilise le référentiel pour :
- autocomplete ;
- remplissage automatique de catégorie ;
- détection fast-food ;
- calcul kcal ;
- contrôle de portion ;
- construction des composants d’un repas ;
- récupération du QN.

### `lib/useUserReferentiel.js`
Le référentiel global est fusionné avec :
- aliments approuvés publics depuis Supabase ;
- aliments personnalisés de l’utilisateur.

La fusion actuelle concatène global + custom ; elle ne déduplique pas global/custom.

### `lib/socleQuantitesCalories.js`
Le moteur calorique sait notamment exploiter :
- `kcal` ;
- `kcalPour100g` / variantes ;
- `quantite` ;
- `portionDefaut` ;
- `unite` ;
- `kcalParUnite`.

Il tente de rattacher la quantité saisie à la portion de référence avant de calculer.

### Conséquence
Un nouvel aliment mal structuré peut créer :
- mauvais calcul calorique ;
- mauvais remplissage de catégorie ;
- collision autocomplete ;
- ambiguïté avec un aliment custom ;
- erreur d’analyse de portion ;
- mauvaise détection fast-food ;
- QN erroné dans les repas composés / analyses.

---

## 7. Dette / anomalies structurelles constatées — à NE PAS corriger sans plan dédié

### A. Schéma hétérogène
Les objets n’ont pas tous le même niveau de richesse.

On observe notamment :
- anciens objets avec `kcalParUnite`, `mesureRecommandee`, `portionMax`, `typeRepas`, `moment` ;
- nouveaux lots plus compacts avec `nom`, `categorie`, `sousCategorie`, `marque`, `kcal`, `qn`, `portionDefaut`, `unite`, `alternatives`, `typeOrigine`.

Ce n’est pas automatiquement un bug, car le moteur calorique possède plusieurs stratégies de fallback. Mais toute nouvelle entrée doit être vérifiée contre ce moteur.

### B. `typeOrigine` réel plus large que l’ancien plan
Le vieux plan présentait surtout :
- `maison` ;
- `restaurant` ;
- `industriel`.

Le code actuel contient également des valeurs réelles telles que :
- `boulangerie` ;
- `naturel`.

Donc l’ancien enum ne doit pas être appliqué aveuglément aux futurs ajouts.

### C. Doublons source dans `correctifsAliments`
Des blocs Pizza Hut et Quick sont répétés dans le tableau source.

La fusion runtime comporte néanmoins un garde-fou : une entrée n’est poussée que si le triplet nom/catégorie/marque n’existe pas déjà.

Décision de cet audit :
- **ne rien supprimer** ;
- documenter cette dette ;
- ne pas reproduire ce modèle dans les futurs batchs.

### D. Noms identiques avec marques différentes
Exemples observés : plusieurs `Yaourt nature` / `Yaourt vanille` avec marques différentes.

Or plusieurs consommateurs du référentiel utilisent encore une recherche par `nom` exact avec `.find()`.

Risque : le premier résultat portant ce nom gagne, même si plusieurs marques existent.

Règle future : les nouveaux produits de marque doivent avoir un libellé utilisateur non ambigu ou une stratégie de distinction explicitement validée.

### E. Deux niveaux de référentiel
Le référentiel utilisateur Supabase est fusionné avec le global sans déduplication globale/custom.

Risque : un aliment ajouté demain au référentiel global peut déjà exister comme aliment personnalisé d’un utilisateur.

Ce risque doit être accepté / traité dans une évolution séparée ; ne pas modifier `useUserReferentiel.js` dans le lot d’enrichissement alimentaire sans validation dédiée.

### F. Anciennes données QN à ne pas recopier aveuglément
La doctrine QN confirmée par la documentation :
- QN élevé = aliment peu transformé / naturel ;
- QN faible = aliment transformé / ultra-transformé.

Un audit QN de janvier 2026 a déjà corrigé 28 anomalies. Les nouveaux lots doivent réutiliser cette doctrine et comparer les candidats à des références similaires déjà validées.

---

## 8. Contrat de création d’une nouvelle entrée

Avant chaque ajout, vérifier obligatoirement :

1. **Identité**
   - nom utilisateur clair ;
   - pas de doublon strict ;
   - pas de quasi-doublon non justifié ;
   - marque dans le nom ou champ `marque` lorsque nécessaire pour lever l’ambiguïté.

2. **Taxonomie**
   - `categorie` existante ou décision explicite ;
   - `sousCategorie` cohérente ;
   - pas de recatégorisation massive d’entrées historiques.

3. **Calories**
   - valeur issue d’une source nutritionnelle fiable ;
   - cohérence entre `kcal`, `portionDefaut`, `unite` ;
   - `kcalParUnite` si nécessaire pour lever toute ambiguïté de calcul ;
   - simulation avec `calculerCaloriesAliment()` avant validation du batch.

4. **QN**
   - respecter la doctrine « 1 transformé / 5 naturel » ;
   - comparer à des aliments proches déjà validés ;
   - documenter les cas débattables.

5. **Portion**
   - portion réellement compréhensible par l’utilisateur ;
   - unité compatible avec le moteur ;
   - si grammes/ml : préciser clairement la référence ;
   - si pièce/part/bol/etc. : référence calorique correspondant réellement à cette unité.

6. **Alternatives**
   - alternatives déjà existantes au moment du commit ;
   - alternatives pertinentes fonctionnellement ;
   - pas de référence vers un nom inexistant ou ambigu.

7. **Origine**
   - `typeOrigine` cohérent avec les valeurs réellement utilisées dans le code ;
   - ne pas forcer l’ancien enum historique si le cas relève déjà de `naturel` ou `boulangerie`.

8. **Compatibilité fonctionnelle**
   - autocomplete ;
   - catégorie automatique ;
   - calories ;
   - portion ;
   - fast-food si concerné ;
   - repas composé ;
   - référentiel custom fusionné ;
   - absence de régression build/runtime.

---

## 9. Méthodologie d’enrichissement validable

### Étape 0 — Aucun ajout avant validation utilisateur
Respect de `Template.md`.

### Étape 1 — Audit du batch candidat
Pour chaque lot :
- recherche exacte de chaque nom dans tout `data/referentiel.js` ;
- recherche des synonymes / variantes ;
- recherche dans alternatives ;
- recherche inter-catégorie ;
- classification : `présent`, `présent variante`, `manquant`, `ambigu`, `hors scope`.

### Étape 2 — Fiche de données avant code
Tableau proposé à l’utilisateur :
- nom ;
- catégorie ;
- sous-catégorie ;
- origine ;
- portion ;
- kcal ;
- QN ;
- alternatives ;
- source nutritionnelle ;
- justification.

### Étape 3 — Validation explicite
Aucun changement de `data/referentiel.js` avant validation du tableau / plan.

### Étape 4 — Implémentation petit batch
Taille recommandée : 10 à 15 entrées maximum.

Règles :
- ajout chirurgical ;
- aucune suppression historique ;
- aucune recatégorisation massive ;
- aucun nettoyage opportuniste hors scope.

### Étape 5 — Contrôles techniques
- syntaxe / lint si disponible ;
- build ;
- recherche des doublons du batch ;
- tests autocomplete ciblés ;
- tests `calculerCaloriesAliment` sur portion par défaut + quantité alternative ;
- contrôle QN ;
- contrôle alternatives ;
- contrôle catégorisation ;
- test RepasBloc / repas composé pour un échantillon représentatif.

### Étape 6 — Documentation append-only
Ajouter les résultats sans supprimer l’historique :
- contenu ajouté ;
- avant / après ;
- tests ;
- anomalies ;
- décisions ;
- commit.

---

## 10. Plan d’action proposé à partir de l’état réel

### LOT 0 — Préflight qualité du référentiel (sans nettoyage destructif)
Priorité : **obligatoire avant nouveaux aliments**.

Objectif : produire un contrôle reproductible du référentiel courant :
- nombre runtime réel d’entrées après fusion anti-doublon ;
- doublons stricts / quasi-doublons ;
- champs absents ;
- alternatives orphelines ;
- répartition catégories/sous-catégories ;
- distribution QN ;
- portions non calculables avec le moteur actuel.

Important : ce lot doit d’abord être présenté comme plan technique séparé avant création d’un éventuel script d’audit permanent.

### LOT 1 — Cuisine camerounaise
Priorité : **très haute**.

Pourquoi : lacune historique toujours confirmée.

Cible initiale historique à revalider individuellement :
- Ndolé
- Poulet DG
- Koki
- Eru
- Kondré
- Achu
- Sanga
- Mbongo Tchobi
- Kati Kati
- Taro sauce jaune

### LOT 2 — Cuisine thaïlandaise
Priorité : **très haute**.

Pourquoi : couverture toujours faible ; `Pad Thaï` présent mais `Tom Yum` absent.

Cible : reprendre la liste historique, supprimer de la proposition tout ce qui existe réellement sous nom/variante et ne créer que les manquants.

### LOT 3 — Viandes de boucherie
Priorité : **très haute**.

Pourquoi : morceaux autonomes encore insuffisamment représentés.

Règle : morceau de viande autonome ≠ plat cuisiné.

Candidats : Bavette, Entrecôte, Rumsteck, Onglet, Faux-filet, Tournedos, Côte de porc, Côtelette d’agneau, Gigot, Jarret de veau, etc., après anti-doublon.

### LOT 4 — Cuisine britannique
Priorité : **haute**.

Pourquoi : lacune du plan historique toujours visible (`Fish & Chips` absent).

### LOT 5 — Chine / Japon — complétion ciblée
Priorité : **moyenne à haute**.

Pourquoi : couverture existante mais incomplète. Ne pas créer un lot massif sans inventaire.

Exemples à auditer : Baozi, Jiaozi, canard laqué, ramen, udon, tonkatsu, okonomiyaki.

### LOT 6 — Grande surface / aliments du quotidien
Priorité : **moyenne**.

Objectif : mesurer les véritables trous d’usage avant d’ajouter des marques. Privilégier les aliments réellement recherchés par un utilisateur français plutôt qu’un objectif numérique artificiel.

### LOT 7 — Extensions des catégories déjà traitées
Priorité : **après les lacunes majeures**.

Catégories : fromage, charcuterie, poisson, céréales, gâteaux, pâtisserie, viennoiserie.

Règle : aucun quota automatique. Ajouter uniquement les aliments à forte valeur d’usage manquants.

---

## 11. Risques à intégrer au plan d’implémentation futur

- collision de noms exacts avec `.find()` ;
- doublon source mais pas runtime ;
- kcal interprétées comme portion alors que la donnée est pour 100g ;
- unité non cohérente avec `portionDefaut` ;
- alternative orpheline ;
- QN hérité d’un ancien mauvais exemple ;
- `typeOrigine` incompatible avec les conventions réelles ;
- recatégorisation détruisant un comportement existant ;
- ajout global créant un doublon avec des aliments user custom ;
- mauvais tag fast-food / origine ;
- régression dans la saisie multi-aliments / repas composé ;
- modification opportuniste d’un autre moteur alors que le scope est uniquement référentiel.

---

## 12. Décision de cet audit

### Ce qui peut être fait en sécurité
- enrichir le référentiel par petits lots ;
- rechercher et documenter les manquants ;
- enrichir les cuisines et familles réellement sous-couvertes ;
- réutiliser la méthode éprouvée des lots 2026 ;
- faire des contrôles automatisés avant/après chaque batch.

### Ce qui ne doit pas être fait sans chantier séparé
- nettoyer massivement `data/referentiel.js` ;
- supprimer les blocs dupliqués historiques ;
- uniformiser toutes les anciennes entrées ;
- recatégoriser massivement ;
- modifier le moteur calorique ;
- modifier la fusion Supabase custom/global ;
- refaire le QN global ;
- viser mécaniquement 723 pour atteindre un chiffre.

### État
Audit fonctionnel et méthodologique : **terminé**.

Prochaine validation utilisateur attendue : validation du plan d’action / ordre des lots avant toute modification des données alimentaires.

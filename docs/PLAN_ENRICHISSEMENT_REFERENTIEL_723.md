# 🗓️ Plan d’implémentation enrichissement référentiel alimentaire (copie)

Ce fichier est une copie du plan d’implémentation complet pour l’enrichissement du référentiel alimentaire, issu de AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md.

---

## 🍔 RÉFÉRENTIEL ALIMENTAIRE

### 1. Enrichissement Référentiel +70% (300 plats)

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire (Plan progressif validé - Option A)

#### Contexte
Le référentiel actuel compte **425 plats**. Objectif: atteindre **723 plats** (+70%) pour couvrir une sélection plus large de repas consommés par les utilisateurs.

#### Calcul
- Référentiel actuel: 425 plats
- Objectif +70%: 723 plats total
- **À ajouter: ~300 nouveaux plats**

#### Lacunes identifiées (couverture géographique actuelle)
- 🇹🇭 Thaïlande: 2 plats (Pad Thaï, Curry vert) → Lacune majeure
- 🇨🇲 Cameroun: 0 plat → Lacune totale
- 🇬🇧 Angleterre: 0 plat → Lacune totale
- 🇨🇳 Chine: 12 plats → Couverture moyenne
- 🇯🇵 Japon: 12 plats → Couverture moyenne
- 🇰🇷 Corée: 27 plats → Bonne couverture (ajout récent)
- 🇨🇩/🇸🇳 Congo/Sénégal: 18 plats africains → Couverture correcte
- 🇺🇸 États-Unis: 4 plats (burgers) → Lacune majeure

#### Lacunes produits français
- Viandes boucherie: 0 plat dédié
- Fromages: 4 fromages industriels uniquement → Lacune majeure
- Charcuterie: 5 produits seulement → Lacune importante
- Poissons: Non analysé
- Produits grande surface: Couverture partielle

#### Approche retenue: Plan Progressif (Option A)

**Phase 1 - Prioritaire (50 plats)**
- 🇹🇭 Cuisine thaïlandaise: 15 plats (Tom Yum, Som Tam, Larb, Massaman, etc.)
- 🇨🇲 Cuisine camerounaise: 10 plats (Ndolé, Poulet DG, Koki, Eru, etc.)
- 🇫🇷 Viandes boucherie: 15 plats (Bavette, Entrecôte, Côte de porc, Gigot, etc.)
- 🇫🇷 Fromages (liste exhaustive à enrichir) :
  
  1. Camembert (AOP, Président, portion 30g, boîte 250g)
  2. Brie (AOP, Président, portion 30g, bloc 200g)
  3. Roquefort (AOP, Société, portion 30g, boîte 150g)
  4. Comté (AOP, Entremont, portion 30g, bloc 200g, râpé 70g)
  5. Chèvre frais (Soignon, portion 30g, bûche 180g)
  6. Emmental (Entremont, râpé 70g, bloc 200g, tranches 100g)
  7. Saint-Nectaire (AOP, portion 30g, bloc 200g)
  8. Reblochon (AOP, portion 30g, boîte 450g)
  9. Cantal (AOP, portion 30g, bloc 200g)
  10. Bleu d’Auvergne (AOP, portion 30g, boîte 150g)
  11. La Vache qui rit (industriel, portion 17g, boîte 140g)
  12. Babybel (industriel, portion 20g, filet 120g)
  13. Kiri (industriel, portion 18g, boîte 108g)
  14. Boursin (industriel, portion 16g, boîte 150g)
  15. Tartare (industriel, portion 16g, boîte 150g)
  
  Catégories couvertes : pâte molle, pâte pressée, pâte persillée, frais, fondu, chèvre, brebis, vache  
  Formats : portion individuelle, bloc, râpé, tranches, mini, spécialité à tartiner

**Phase 2 - Secondaire (100 plats)**
- 🇬🇧 Cuisine anglaise: 15 plats (Fish & Chips, Cottage Pie, Roast Beef, etc.)
- 🇫🇷 Charcuterie: 20 plats (Pâté, Rillettes, Rosette, Coppa, etc.)
- 🇺🇸 Street food américain: 20 plats (Bagels, Donuts variés, Pancakes, etc.)
- 🇨🇳 Cuisine chinoise: 20 plats (Baozi, Jiaozi, Peking Duck, etc.)
- 🇯🇵 Cuisine japonaise: 15 plats (Ramen, Udon, Tonkatsu, Okonomiyaki, etc.)
- 🇹🇭 Complétion thaï: 10 plats


**Phase 3 - Complétion (150 plats)**
- 🇫🇷 Produits grande surface: 40 plats (plats préparés, conserves, etc.)
- 🇫🇷 Poissonnerie: 20 plats (Saumon, Thon, Dorade, Cabillaud, etc.)
- Expansion cuisines existantes: 40 plats
- Street food international: 30 plats
- Desserts/Pâtisseries: 10 plats
- Gâteaux (catégorie dédiée, 10 plats) :
  - Cakes (cake aux fruits, cake marbré, cake citron…)
  - Tartes (tarte aux pommes, tarte citron, tarte poire-chocolat…)
  - Biscuits (sablés, madeleines, cookies, palets…)
  - Entremets (millefeuille, opéra, bavarois…)
  - Spécialités régionales (kouglof, cannelé, far breton, clafoutis…)
  (La répartition exacte sera affinée lors de la phase correspondante)

#### Typologie aliments à ajouter
1. Street food internationale (Tacos mexicains, Falafel, Döner kebab, Poutine, Arepas)
2. Restaurants (plats faits maison, brasserie, bistronomie)
3. Grande surface France (plats préparés, surgelés, conserves, produits frais)
4. Diversité internationale (couverture équilibrée 9 pays, habitudes alimentaires réelles)

#### Contraintes qualité
- Chaque plat ajouté doit comporter un champ typeOrigine (valeurs possibles : "maison", "restaurant", "industriel"). Ce champ permet de différencier l’origine du plat pour l’utilisateur, le filtrage, les statistiques et l’adaptation du score QN ou des valeurs nutritionnelles. L’UI pourra afficher un emoji correspondant (🏠, 🍽️, 🏭) selon la valeur de typeOrigine.
- Aucun doublon accepté (vérification stricte : nom, variantes, alternatives, sous-catégories – toute entrée déjà présente sous une forme ou une autre est exclue de l’ajout. Recherche systématique dans tout le référentiel avant chaque batch.)
- QN validé par comparaison plats similaires
- Kcal réalistes (sources nutritionnelles fiables)
- Portions standardisées (format cohérent)
- Alternatives existantes uniquement
- Process Template.md respecté à 100%

#### Estimation effort total
- Phase 1: ~8-10h (recherche + validation + implémentation 50 plats)
- Phase 2: ~15-20h (100 plats)
- Phase 3: ~25-30h (150 plats)
- Total: ~50-60h de travail

#### Prochaines actions (quand démarrage)
1. Création plan détaillé Phase 1 (Template.md)
2. Recherche données nutritionnelles fiables
3. Validation QN/kcal/portions utilisateur
4. Implémentation par batches sécurisés (10-15 plats/batch)
5. Tests autocomplete après chaque batch

## 🧀 Ajout batch fromages (Phase 1)

Tous les fromages listés ont été ajoutés dans le référentiel alimentaire, avec validation des données nutritionnelles, QN, portions et alternatives :

- Camembert (AOP, Président)
- Brie (AOP, Président)
- Roquefort (AOP, Société)
- Comté (AOP, Entremont)
- Chèvre frais (Soignon)
- Emmental (Entremont)
- Saint-Nectaire (AOP)
- Reblochon (AOP)
- Cantal (AOP)
- Bleu d’Auvergne (AOP)
- Boursin
- Tartare

Données nutritionnelles : sources Ciqual, Open Food Facts, marques officielles
Validation QN, portions, alternatives : conforme au plan
Aucune anomalie ni doublon détecté
Autocomplete et cohérence : validés

---

(Copie fidèle du plan, prêt à être enrichi selon la logique à venir)

---

## 📌 Phase à prévoir – Complétion des manquants phase 1

Suite à la vérification du référentiel :

- **Cuisine thaïlandaise** : seuls Pad Thaï et Curry vert sont présents. À ajouter pour respecter le plan :
  - Tom Yum
  - Som Tam
  - Larb
  - Massaman
  - Khao Pad
  - Khao Soi
  - Laab
  - Yam
  - Kai Med Ma Muang
  - Moo Satay
  - Gai Yang
  - Nam Tok
  - Pla Rad Prik
  - Autres plats typiques selon plan

- **Cuisine camerounaise** : aucun plat du plan (Ndolé, Poulet DG, Koki, Eru, etc.) n’est présent. À ajouter :
  - Ndolé
  - Poulet DG
  - Koki
  - Eru
  - Kondré
  - Achu
  - Sanga
  - Mbongo Tchobi
  - Kati kati
  - Taro sauce jaune

- **Viandes boucherie françaises** : seuls quelques plats classiques sont présents (escalope de poulet à la crème, steak haché purée, blanquette de veau, etc.). À ajouter pour respecter le plan :
  - Bavette
  - Entrecôte
  - Côte de porc
  - Gigot d’agneau
  - Rumsteck
  - Onglet
  - Tournedos
  - Faux-filet
  - Côtelette d’agneau
  - Jarret de veau
  - Pot-au-feu
  - Navarin d’agneau
  - Sauté de veau
  - Brochette de bœuf
  - Carpaccio de bœuf
  - Tartare de bœuf

Ces ajouts sont nécessaires pour valider la complétion de la phase 1 conformément au plan initial.
# 🗓️ Plan d’implémentation enrichissement référentiel alimentaire (copie)

Ce fichier est une copie du plan d’implémentation complet pour l’enrichissement du référentiel alimentaire, issu de AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md.

---

## 🍔 RÉFÉRENTIEL ALIMENTAIRE

### 1. Enrichissement Référentiel +70% (300 plats)

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire (Plan progressif validé - Option A)

#### Contexte
Le référentiel actuel compte **425 plats**. Objectif: atteindre **723 plats** (+70%) pour couvrir une sélection plus large de repas consommés par les utilisateurs.

#### Calcul
- Référentiel actuel: 425 plats
- Objectif +70%: 723 plats total
- **À ajouter: ~300 nouveaux plats**

#### Lacunes identifiées (couverture géographique actuelle)
- 🇹🇭 Thaïlande: 2 plats (Pad Thaï, Curry vert) → Lacune majeure
- 🇨🇲 Cameroun: 0 plat → Lacune totale
- 🇬🇧 Angleterre: 0 plat → Lacune totale
- 🇨🇳 Chine: 12 plats → Couverture moyenne
- 🇯🇵 Japon: 12 plats → Couverture moyenne
- 🇰🇷 Corée: 27 plats → Bonne couverture (ajout récent)
- 🇨🇩/🇸🇳 Congo/Sénégal: 18 plats africains → Couverture correcte
- 🇺🇸 États-Unis: 4 plats (burgers) → Lacune majeure

#### Lacunes produits français
- Viandes boucherie: 0 plat dédié
- Fromages: 4 fromages industriels uniquement → Lacune majeure
- Charcuterie: 5 produits seulement → Lacune importante
- Poissons: Non analysé
- Produits grande surface: Couverture partielle

#### Approche retenue: Plan Progressif (Option A)

**Phase 1 - Prioritaire (50 plats)**
- 🇹🇭 Cuisine thaïlandaise: 15 plats (Tom Yum, Som Tam, Larb, Massaman, etc.)
- 🇨🇲 Cuisine camerounaise: 10 plats (Ndolé, Poulet DG, Koki, Eru, etc.)
- 🇫🇷 Viandes boucherie: 15 plats (Bavette, Entrecôte, Côte de porc, Gigot, etc.)
- 🇫🇷 Fromages (liste exhaustive à enrichir) :
  
  1. Camembert (AOP, Président, portion 30g, boîte 250g)
  2. Brie (AOP, Président, portion 30g, bloc 200g)
  3. Roquefort (AOP, Société, portion 30g, boîte 150g)
  4. Comté (AOP, Entremont, portion 30g, bloc 200g, râpé 70g)
  5. Chèvre frais (Soignon, portion 30g, bûche 180g)
  6. Emmental (Entremont, râpé 70g, bloc 200g, tranches 100g)
  7. Saint-Nectaire (AOP, portion 30g, bloc 200g)
  8. Reblochon (AOP, portion 30g, boîte 450g)
  9. Cantal (AOP, portion 30g, bloc 200g)
  10. Bleu d’Auvergne (AOP, portion 30g, boîte 150g)
  11. La Vache qui rit (industriel, portion 17g, boîte 140g)
  12. Babybel (industriel, portion 20g, filet 120g)
  13. Kiri (industriel, portion 18g, boîte 108g)
  14. Boursin (industriel, portion 16g, boîte 150g)
  15. Tartare (industriel, portion 16g, boîte 150g)
  
  Catégories couvertes : pâte molle, pâte pressée, pâte persillée, frais, fondu, chèvre, brebis, vache  
  Formats : portion individuelle, bloc, râpé, tranches, mini, spécialité à tartiner

**Phase 2 - Secondaire (100 plats)**
- 🇬🇧 Cuisine anglaise: 15 plats (Fish & Chips, Cottage Pie, Roast Beef, etc.)
- 🇫🇷 Charcuterie: 20 plats (Pâté, Rillettes, Rosette, Coppa, etc.)
- 🇺🇸 Street food américain: 20 plats (Bagels, Donuts variés, Pancakes, etc.)
- 🇨🇳 Cuisine chinoise: 20 plats (Baozi, Jiaozi, Peking Duck, etc.)
- 🇯🇵 Cuisine japonaise: 15 plats (Ramen, Udon, Tonkatsu, Okonomiyaki, etc.)
- 🇹🇭 Complétion thaï: 10 plats

**Phase 3 - Complétion (150 plats)**
- 🇫🇷 Produits grande surface: 40 plats (plats préparés, conserves, etc.)
- 🇫🇷 Poissonnerie: 20 plats (Saumon, Thon, Dorade, Cabillaud, etc.)
- Expansion cuisines existantes: 40 plats
- Street food international: 30 plats
- Desserts/Pâtisseries: 20 plats

#### Typologie aliments à ajouter
1. Street food internationale (Tacos mexicains, Falafel, Döner kebab, Poutine, Arepas)
2. Restaurants (plats faits maison, brasserie, bistronomie)
3. Grande surface France (plats préparés, surgelés, conserves, produits frais)
4. Diversité internationale (couverture équilibrée 9 pays, habitudes alimentaires réelles)

#### Contraintes qualité
- Aucun doublon accepté (vérification grep systématique)
- QN validé par comparaison plats similaires
- Kcal réalistes (sources nutritionnelles fiables)
- Portions standardisées (format cohérent)
- Alternatives existantes uniquement
- Process Template.md respecté à 100%

#### Estimation effort total
- Phase 1: ~8-10h (recherche + validation + implémentation 50 plats)
- Phase 2: ~15-20h (100 plats)
- Phase 3: ~25-30h (150 plats)
- Total: ~50-60h de travail

#### Prochaines actions (quand démarrage)
1. Création plan détaillé Phase 1 (Template.md)
2. Recherche données nutritionnelles fiables
3. Validation QN/kcal/portions utilisateur
4. Implémentation par batches sécurisés (10-15 plats/batch)
5. Tests autocomplete après chaque batch

## 🧀 Ajout batch fromages (Phase 1)

Tous les fromages listés ont été ajoutés dans le référentiel alimentaire, avec validation des données nutritionnelles, QN, portions et alternatives :

- Camembert (AOP, Président)
- Brie (AOP, Président)
- Roquefort (AOP, Société)
- Comté (AOP, Entremont)
- Chèvre frais (Soignon)
- Emmental (Entremont)
- Saint-Nectaire (AOP)
- Reblochon (AOP)
- Cantal (AOP)
- Bleu d’Auvergne (AOP)
- Boursin
- Tartare

Données nutritionnelles : sources Ciqual, Open Food Facts, marques officielles
Validation QN, portions, alternatives : conforme au plan
Aucune anomalie ni doublon détecté
Autocomplete et cohérence : validés

---

(Copie fidèle du plan, prêt à être enrichi selon la logique à venir)

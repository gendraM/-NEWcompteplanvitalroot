# Matrice de décision — profil alimentaire du référentiel

> Branche : `planification-gamification-chatgpt`
> Source analysée : `data/referentiel.js`
> Périmètre : référentiel de base uniquement, hors aliments utilisateur.

## Résultat

Les 640 aliments sont répartis en quatre états de traitement :

| État | Aliments | Part | Décision |
|---|---:|---:|---|
| Déterminable sûrement | 154 | 24,1 % | le moteur peut utiliser un mapping explicite de catégorie |
| Composite | 290 | 45,3 % | ne pas attribuer un rôle unique ; exploiter une composition structurée lorsqu'elle existe |
| À enrichir explicitement | 51 | 8,0 % | enrichissement ciblé via `profilAlimentaire` |
| Inconnu / non pertinent pour la composition | 145 | 22,7 % | ne pas forcer un rôle ; d'autres moteurs peuvent traiter ces aliments |

Les pourcentages sont arrondis.

## 1. Déterminable sûrement — 154

- féculent : 31
- poisson : 26
- protéine : 24
- légume : 21
- céréales : 19
- charcuterie : 12
- gras_vegetal : 11
- légumineuse : 10

Ces catégories peuvent alimenter le profil sans déduction depuis le nom.

Attention : `légumineuse` est actuellement considérée comme protéine + féculent. Cette règle doit rester explicite et testée.

## 2. Composite — 290

- fast-food : 153
- asiatique : 77
- africain : 18
- plat principal : 16
- plat préparé : 14
- sandwich : 4
- tarte : 3
- salade : 2
- entrée : 2
- traiteur : 1

Une catégorie culinaire/commerciale ne décrit pas la composition nutritionnelle du plat. Exemple : `asiatique` peut désigner un yakitori poulet, légumes, crevette ou fromage.

Décision : **pas de mapping catégorie → rôle** pour ces familles. Lorsqu'une recette/composition structurée est disponible, les rôles du repas devront être reconstruits à partir des composants. Sinon : inconnu.

Cette règle protège également la frontière avec le chantier `recettes-intelligentes-planning-suivi` : le présent chantier consomme une composition structurée lorsqu'elle existe, mais ne crée pas un second moteur de recettes.

## 3. À enrichir explicitement — 51

- laitier : 19
- fromage : 19
- sauce : 10
- accompagnement : 3

Ces familles demandent une décision aliment par aliment ou par sous-catégorie fiable.

Exemple : on ne doit pas déclarer automatiquement tout `laitier` comme protéine ni toute `sauce` comme matière grasse.

Ce lot est le meilleur candidat pour un premier enrichissement ciblé de `profilAlimentaire`.

## 4. Inconnu / non pertinent pour « Compose ton assiette » — 145

- extra : 49
- pâtisserie : 18
- fruit : 18
- viennoiserie : 13
- confiserie : 12
- boisson : 11
- gâteaux : 10
- snack : 10
- fruit transformé : 3
- dessert : 1

« Non pertinent » ne signifie ni mauvais ni inutile.

Exemples :
- `fruit` doit pouvoir être identifié comme fruit dans le futur `profilAlimentaire`, mais il n'appartient pas aux quatre dimensions historiques du premier moteur d'assiette ;
- les extras/plaisirs ont aussi vocation à être compris par Extras et AVANT/PENDANT/APRÈS ;
- une pâtisserie ne doit pas être artificiellement transformée en féculent ou matière grasse parce qu'elle en contient.

## Conséquence importante

Le chiffre initial de 24,1 % ne doit **pas** devenir un objectif artificiel de « 100 % de couverture ».

Une bonne couverture signifie : **100 % des aliments ont un comportement déterministe et sûr** :
- rôle connu lorsqu'on dispose de l'information ;
- composition utilisée lorsqu'elle existe ;
- inconnu assumé lorsque l'information manque ;
- jamais de fausse déduction.

## Contrat fonctionnel cible

```js
profilAlimentaire: {
  rolesRepas: [],
  nature: 'simple' | 'composite' | 'inconnue',
  origine: 'vegetale' | 'animale' | 'mixte' | 'inconnue',
  caracteristiques: []
}
```

Les champs historiques restent inchangés.

## Prochain lot recommandé

1. Corriger le moteur pour distinguer réellement `INCONNU` de `ABSENT`.
2. Corriger la normalisation du rôle `matiere_grasse`.
3. Faire évoluer le moteur pour lire `profilAlimentaire.rolesRepas` tout en conservant temporairement `rolesAssiette` pour compatibilité.
4. Ajouter `fruit` au vocabulaire du profil sans nécessairement en faire une cinquième obligation visuelle dans « Compose ton assiette ».
5. Tester la matrice par catégories.
6. Enrichir ensuite uniquement les 51 aliments/cas ambigus prioritaires, après revue détaillée.

Aucune modification massive du référentiel n'est autorisée avant cette étape.


## Revue détaillée des 51 cas ambigus

La revue ligne par ligne montre que le lot ne doit pas être enrichi uniformément.

### Accompagnements — 3

- `Poêlée de légumes` : candidat fiable à `rolesRepas: ['legume']`, nature composite.
- `Ratatouille rapide` : candidat fiable à `rolesRepas: ['legume']`, nature composite.
- `Gratin de courgettes express` : **ne pas réduire automatiquement à légume** sans connaître sa composition réelle ; garder composite/inconnu à ce stade.

=> **2 enrichissements sûrs**, 1 à laisser composite.

### Sauces — 10

Aucune des 10 sauces ne doit recevoir automatiquement un rôle d'assiette à partir de son nom, de ses kcal ou de sa sous-catégorie.

Une sauce tomate peut contenir des légumes sans constituer pour autant la composante « légumes » du repas ; un pesto ou une sauce blanche peut apporter des lipides sans que le référentiel actuel permette de quantifier ou qualifier proprement ce rôle.

=> **0 enrichissement automatique**. Garder `nature: 'composite'` lorsque ce profil sera matérialisé et laisser les rôles inconnus tant que la recette/composition n'est pas structurée.

### Laitiers — 19 entrées, avec doublons de noms

Le groupe mélange :
- yaourts classiques ;
- skyr / fromage blanc / petit-suisse ;
- desserts lactés ;
- alternatives végétales soja/amande ;
- boissons lactées/aromatisées.

La seule catégorie `laitier` ne permet donc pas un rôle uniforme. En particulier, « végétal » ne signifie pas automatiquement « source de protéines » : soja et amande ne doivent pas être traités identiquement.

=> **pas de mapping global `laitier → proteine`**.

Les futurs enrichissements doivent reposer sur une caractéristique fiable du produit ou une donnée nutritionnelle sourcée, pas sur le nom. `origine` peut être renseignée lorsqu'elle est explicitement portée par une donnée structurée fiable, mais n'est pas nécessaire à « Compose ton assiette ».

### Fromages — 19

Le fromage apporte plusieurs nutriments et sa portion/usages varient. Le classer systématiquement comme « protéine » ou « matière grasse » transformerait une propriété nutritionnelle en règle de composition que Mon Plan Vital n'a pas définie.

=> **0 mapping automatique pour le moteur actuel**. Conserver la catégorie historique et reporter un éventuel rôle à une règle produit/nutritionnelle explicitement validée.

### Bilan de la revue

Sur les 51 cas initialement candidats à enrichissement :
- **2** peuvent recevoir immédiatement un rôle qualitatif sûr dans le contexte du moteur actuel (poêlée de légumes, ratatouille) ;
- **49** ne justifient pas un rôle automatique avec les seules données actuellement présentes.

Cela confirme que le bon objectif n'est pas de remplir artificiellement `profilAlimentaire`, mais de rendre explicite ce que le système sait réellement.

## Décision d'implémentation

Ne pas lancer un enrichissement massif des 51 entrées.

Le prochain changement de données pourra être limité aux deux accompagnements clairement identifiables, **à condition de choisir auparavant la stratégie de stockage du nouveau profil** (inline dans le référentiel ou couche d'enrichissement séparée). Cette décision doit aussi tenir compte du référentiel partagé avec le chantier Recettes.

Pour les autres cas, le moteur `INCONNU` nouvellement introduit est le comportement attendu.

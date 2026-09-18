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

# Audit du référentiel de base — composition & gamification

> Branche : `planification-gamification-chatgpt`
> Périmètre : uniquement `data/referentiel.js`. Les aliments personnalisés utilisateur sont exclus de cet audit.

## 1. Pourquoi cet audit

Le moteur « Compose ton assiette » ne doit pas déduire un rôle nutritionnel à partir du nom d'un aliment. Il doit s'appuyer sur une donnée structurée et explicite.

Ce socle doit permettre deux usages différents :
- **composition qualitative** : reconnaître qu'un aliment joue un rôle de protéine, légume, féculent ou matière grasse ;
- **futurs objectifs quantitatifs** : mesurer réellement protéines/lipides/glucides/fibres uniquement si des valeurs nutritionnelles quantitatives fiables existent.

Ces deux niveaux ne doivent pas être confondus. Un aliment reconnu comme « source de protéine » ne permet pas à lui seul de calculer les grammes de protéines consommés.

## 2. État mesuré du référentiel

Extraction du référentiel de base actuel :
- **640 aliments** analysés ;
- **32 catégories** distinctes ;
- **154 aliments (24,1 %) seulement** appartiennent actuellement à une catégorie directement interprétée par `analyseCompositionAssiette.js` ;
- **486 aliments (75,9 %)** appartiennent à une catégorie que le moteur ne peut pas traduire directement en protéine/légume/féculent/matière grasse.

Catégories directement interprétables actuellement :

| Catégorie source | Nombre | Rôle actuel |
|---|---:|---|
| féculent | 31 | féculent |
| poisson | 26 | protéine |
| protéine | 24 | protéine |
| légume | 21 | légume |
| céréales | 19 | féculent |
| charcuterie | 12 | protéine |
| gras_vegetal | 11 | matière grasse |
| légumineuse | 10 | protéine + féculent |

Total : **154**.

## 3. Principales zones non interprétables

Les plus gros volumes sont :
- fast-food : 153 ;
- asiatique : 77 ;
- extra : 49 ;
- laitier : 19 ;
- fromage : 19 ;
- pâtisserie : 18 ;
- africain : 18 ;
- fruit : 18 ;
- plat principal : 16 ;
- plat préparé : 14 ;
- viennoiserie : 13 ;
- confiserie : 12 ;
- boisson : 11 ;
- gâteaux : 10 ;
- snack : 10 ;
- sauce : 10.

Les autres catégories non interprétées sont : sandwich (4), tarte (3), accompagnement (3), fruit transformé (3), salade (2), entrée (2), dessert (1), traiteur (1).

Ce n'est pas forcément une anomalie : plusieurs de ces catégories décrivent une **famille culinaire ou commerciale** et non un rôle dans l'assiette.

Exemples :
- `Yakitori poulet` est classé `asiatique` : impossible de le reconnaître comme protéine via la catégorie seule ;
- un `plat préparé` peut porter plusieurs rôles simultanément ;
- `laitier` ou `fromage` ne doit pas être converti automatiquement en protéine ;
- `fast-food` peut représenter une composition complète et ne doit pas être transformé en rôle unique.

## 4. Contrat cible recommandé

Ne pas remplacer `categorie` ni `sousCategorie`. Elles ont déjà des usages historiques.

Ajouter progressivement une propriété additive :

```js
rolesAssiette: ['proteine']
rolesAssiette: ['proteine', 'feculent']
rolesAssiette: ['legume']
rolesAssiette: ['matiere_grasse']
```

Règles :
1. `categorie` reste la classification historique/source.
2. `rolesAssiette` décrit uniquement la contribution fonctionnelle à la composition.
3. Plusieurs rôles sont possibles.
4. L'absence de rôle signifie « non déterminé », jamais « mauvais aliment ».
5. Les aliments simples dont la catégorie est déjà univoque n'ont pas besoin d'être enrichis immédiatement.
6. Les catégories culinaires/composites doivent être traitées aliment par aliment ou via leur composition réelle, jamais par un mapping global hasardeux.

## 5. Données quantitatives : niveau distinct

Pour permettre plus tard des objectifs réellement quantitatifs, il faudrait un contrat séparé et sourcé, par exemple :

```js
nutrition100g: {
  proteines_g: ...,
  glucides_g: ...,
  lipides_g: ...,
  fibres_g: ...
}
```

Ce schéma **n'est pas encore validé** et ne doit pas être rempli avec des estimations arbitraires.

Un défi qualitatif comme « intégrer une source de protéines à X repas » peut s'appuyer sur `rolesAssiette`.

Un objectif comme « augmenter de X g les protéines » exige au contraire des valeurs nutritionnelles quantitatives fiables + les quantités réellement consommées.

## 6. Ordre d'enrichissement

### Priorité A — aliments simples ambigus
Auditer les catégories `laitier`, `fromage` et autres aliments simples dont le rôle ne peut pas être déduit proprement de la catégorie.

### Priorité B — catégories culinaires/composites
`asiatique`, `africain`, `plat principal`, `plat préparé`, `sandwich`, `salade`, `tarte`, etc.

Pour celles-ci, préférer une composition structurée existante lorsqu'elle existe. Ne pas prétendre qu'un plat entier est une seule dimension.

### Priorité C — extras et familles plaisir
`fast-food`, `extra`, `pâtisserie`, `viennoiserie`, `confiserie`, `gâteaux`, `snack`, etc.

Ne pas utiliser leur absence de `rolesAssiette` comme signal négatif. Leur traitement comportemental relève aussi du moteur Extras/AVANT-PENDANT-APRÈS.

## 7. Conséquence sur le plan du chantier

Avant les capsules et les défis basés sur la composition :
1. corriger la sémantique `INCONNU` / `ABSENT` du moteur ;
2. corriger la normalisation des rôles explicites, notamment `matiere_grasse` ;
3. produire la matrice d'enrichissement des catégories/aliments prioritaires ;
4. enrichir par petits lots vérifiables ;
5. ajouter des tests de couverture du référentiel ;
6. seulement ensuite utiliser ces signaux pour les capsules et opportunités de défi.

## 8. Garde-fous gamification

Le moteur ne doit pas produire des défis formulés comme « moins de matières grasses » à partir du seul rôle `matiere_grasse` : ce rôle indique une présence, pas une quantité ni une qualité globale.

Les premières mécaniques fiables pourront porter sur des **occurrences observables**, par exemple présence/expérimentation/variation d'une composante, à condition de rester non punitives.

Les objectifs quantitatifs nécessiteront une couche nutritionnelle dédiée et fiable.

## 9. Critère de sortie de l'audit

Le référentiel est prêt pour la composition/gamification lorsque :
- les catégories simples importantes sont interprétables sans inférence sur le nom ;
- les aliments ambigus ont un rôle explicite ou restent explicitement inconnus ;
- les plats composites ne sont pas réduits artificiellement à une seule catégorie nutritionnelle ;
- la couverture est mesurée automatiquement ;
- aucune donnée inconnue n'est interprétée comme une absence ;
- les tests empêchent une régression de couverture.

# État des lieux — Liste de courses de la reprise alimentaire

## Périmètre vérifié

Branche distante examinée : `finalisation-reprise-jeune-alimentaire-chatgpt`.

Cet état des lieux porte uniquement sur la liste de courses liée à la reprise alimentaire après jeûne. Il ne faut pas la confondre avec un éventuel système de liste de courses général ou lié à la cristallisation.

## Résultat synthétique

La liste de courses existe techniquement, mais son fonctionnement n'est pas cohérent de bout en bout :

- une liste sur 7 jours est générée et enregistrée dans Supabase ;
- cette liste enregistrée n'est normalement pas affichée sur la page de validation à cause d'une incompatibilité de format ;
- une deuxième liste, limitée à J+1 et J+2, est recalculée côté écran à partir des aliments autorisés ;
- aucune liste ne correspond à un véritable menu choisi ou à des repas planifiés ;
- les quantités de la liste 7 jours sont des forfaits fixes par catégorie, et non le résultat des portions recommandées de l'utilisateur ;
- la liste J+1/J+2 affiche une seule portion par aliment, sans calculer le besoin cumulé sur deux jours ;
- il n'existe pas de gestion des stocks, de cases à cocher, de remplacement, de préférences ou d'achat déjà réalisé.

Conclusion : la fonctionnalité est présente, mais elle doit être considérée comme une aide indicative incomplète, pas comme une liste de courses fiable et personnalisée.

## Fonctionnement attendu

Une liste de courses utile pour la reprise devrait :

1. être dérivée des aliments réellement proposés ou retenus pour les jours concernés, pas de tous les aliments simplement autorisés ;
2. annoncer clairement la période couverte ;
3. additionner les quantités nécessaires à partir des portions recommandées et du nombre réel d'utilisations ;
4. respecter les phases de reprise et leurs règles ;
5. présenter la même donnée avant validation et pendant la reprise ;
6. être sauvegardée et rechargeable ;
7. rester compréhensible : quantités, unités, catégories et priorité d'achat cohérentes.

## Fonctionnement réellement présent dans le code

### 1. Génération

`lib/genererProgrammeReprise.js` construit chaque jour avec une collection `aliments_autorises`. Il appelle ensuite `genererListeCourses(joursDetailles.slice(0, 7))`.

La fonction :

- parcourt tous les aliments autorisés des sept premiers jours ;
- déduplique sur le nom exact de l'aliment ;
- augmente une fréquence chaque fois que l'aliment réapparaît un autre jour ;
- conserve comme phase la première phase où l'aliment a été rencontré ;
- attribue une quantité forfaitaire selon la catégorie.

Barème actuellement codé :

| Catégorie | Quantité attribuée |
|---|---:|
| liquide | 1 L, ou 2 L si fréquence au moins égale à 5 |
| légume | 300 g, ou 500 g si fréquence au moins égale à 3 |
| protéine | 150 g, ou 300 g si fréquence au moins égale à 3 |
| lipide | 1 unité |
| féculent | 500 g |
| fruit | 3–4 unités |
| autre | À prévoir |

Ces quantités ne sont pas calculées à partir de la portion recommandée, des calories cibles, du profil utilisateur ou d'un nombre de repas planifiés.

### 2. Enregistrement

`lib/jeuneUtils.js` enregistre directement le tableau produit dans `reprises_alimentaires.liste_courses`, champ JSONB. Les jours et leurs aliments autorisés sont enregistrés séparément dans `reprises_jours_valides`.

La liste sauvegardée est donc rattachée au programme de reprise. Elle n'a pas de table dédiée, pas d'état « acheté » et pas d'historique de modification.

### 3. Écran de validation du plan

`pages/validation-plan-reprise.js` charge le programme uniquement depuis `localStorage.programmeReprise`.

L'écran annonce une « Liste de courses (7 premiers jours) », mais sa fonction `getListeCourses()` refuse les tableaux et ne conserve qu'un ancien format objet groupé. Or le générateur actuel retourne un tableau.

Conséquence : avec un programme généré par le code actuel, la liste 7 jours n'est normalement pas affichée sur cet écran.

### 4. Écran de suivi de la reprise

`pages/reprise-alimentaire-apres-jeune.js` ne réutilise pas `programme.liste_courses`. Il reconstruit une autre liste depuis `jours_detailles.slice(0, 2)`.

Cette liste :

- couvre J+1 et J+2 ;
- déduplique les aliments sur leur nom en minuscules ;
- affiche le nom et la portion du premier exemplaire rencontré ;
- n'additionne pas les portions si un aliment apparaît les deux jours ;
- n'affiche ni catégorie, ni quantité totale, ni priorité.

## Expérience utilisateur actuelle

| Moment | Ce que l'utilisateur est censé voir | Ce qui se produit réellement |
|---|---|---|
| Programme généré | Une liste pour préparer les premiers jours | La liste 7 jours est calculée et sauvegardée en arrière-plan |
| Validation du programme | Liste groupée sur 7 jours | Bloc probablement absent à cause du format tableau non accepté |
| Arrivée sur le suivi | Liste pour J+1 et J+2 | Nouvelle liste recalculée, distincte de celle sauvegardée |
| Préparation des achats | Quantités nécessaires | Portions unitaires ou forfaits génériques, sans total fiable |
| Retour ultérieur | Même liste conservée | La liste 7 jours reste en base, mais l'écran recalcule la liste 2 jours |

## Divergences et risques

### Anomalies fonctionnelles

1. **Incompatibilité de format sur la page de validation** — le producteur retourne un tableau, le consommateur attend un objet groupé.
2. **Deux sources de vérité** — liste sauvegardée sur 7 jours et liste recalculée sur 2 jours.
3. **Chargement local uniquement à la validation** — absence de rechargement Supabase sur cette page si la copie locale manque.
4. **Quantités non cumulées sur J+1/J+2** — une portion est affichée même si l'aliment apparaît plusieurs fois.

### Incohérences métier

1. **Autorisé ne veut pas dire planifié** — la liste contient tous les aliments possibles, comme si l'utilisateur devait tout acheter.
2. **Quantités déconnectées des portions** — les forfaits 300 g, 500 g, 1 L, etc. ne découlent pas du moteur de portions de l'application.
3. **Fréquence artificielle** — la réapparition d'un aliment dans la liste des possibilités quotidiennes est traitée comme une consommation prévue.
4. **Périodes contradictoires** — 7 jours avant validation, 2 jours pendant le suivi.
5. **Pas d'adaptation utilisateur** — allergies, exclusions, préférences, disponibilité locale et substitutions ne sont pas prises en compte.

### Améliorations UX

1. Afficher une seule liste cohérente, avec sa période exacte.
2. Distinguer « indispensable pour démarrer » et « options possibles ».
3. Permettre de cocher un achat, masquer un aliment déjà disponible et remplacer une proposition.
4. Expliquer que la quantité est estimée et sur quelle base elle est calculée.
5. Regrouper par rayon/catégorie sans employer une terminologie technique.

## Proposition de correction par étapes

### Étape 1 — Raccorder l'existant sans changer le métier

- définir un format unique pour `liste_courses` ;
- faire lire ce format par les deux écrans ;
- supprimer le recalcul parallèle J+1/J+2 ou en faire une vue filtrée de la liste enregistrée ;
- prévoir un rechargement Supabase si le stockage local est absent.

Résultat attendu : la même liste est sauvegardée, affichée et rechargée partout.

### Étape 2 — Clarifier le périmètre d'achat

- décider si la liste représente les 2 premiers jours, les 7 premiers jours, ou une période glissante ;
- séparer les achats essentiels des alternatives autorisées ;
- ne pas transformer automatiquement tout le référentiel autorisé en achats obligatoires.

Résultat attendu : l'utilisateur comprend ce qu'il doit réellement prévoir.

### Étape 3 — Rendre les quantités cohérentes

- partir des repas ou choix réellement retenus ;
- reprendre les portions recommandées déjà calculées par l'application ;
- multiplier et additionner ces portions selon le nombre d'utilisations ;
- appliquer des arrondis d'achat explicites seulement à la fin.

Résultat attendu : les quantités reflètent le programme alimentaire personnalisé, sans modifier le moteur général des portions.

### Étape 4 — Ajouter les usages pratiques

- cases à cocher ;
- aliment déjà disponible ;
- substitution cohérente avec la phase ;
- conservation de l'état dans Supabase ;
- vue imprimable ou partageable si utile.

## Décisions à arbitrer avant implémentation

1. La liste doit-elle être fondée sur des repas réellement planifiés, ou rester une liste minimale de provisions possibles ?
2. La période de référence doit-elle être J+1/J+2, sept jours, ou glissante selon la phase ?
3. Faut-il enregistrer l'état des achats dans une structure dédiée ou enrichir le JSONB du programme ?
4. Quand plusieurs aliments sont des alternatives, faut-il demander un choix à l'utilisateur avant de calculer les quantités ?

## Priorité recommandée

Commencer par l'étape 1. Elle corrige l'anomalie visible et supprime les deux sources de vérité sans toucher au référentiel alimentaire général ni au calcul général des portions. Les étapes 2 et 3 nécessitent ensuite une décision métier explicite.

## Limite de cet état des lieux

Le constat ci-dessus repose sur le dernier état actuellement disponible sur la branche GitHub. Des changements locaux non commités réalisés après ce point ne peuvent pas être considérés comme présents dans la branche distante.

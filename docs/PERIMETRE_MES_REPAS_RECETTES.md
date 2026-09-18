# Périmètre fonctionnel — Mes repas & recettes

> Document de référence du chantier `recettes-intelligentes-planning-suivi`.
> Ce document fixe le périmètre produit, les acquis à réutiliser, les limites du chantier et le plan d'action. En cas de doute ou de dérive technique, revenir à ce document avant de développer.

## 1. Finalité du chantier

Le chantier ne consiste pas à créer un catalogue de recettes isolé ni un deuxième moteur alimentaire.

La finalité est de réduire la charge mentale de l'utilisateur lorsqu'il doit décider quoi manger, puis de rendre son choix immédiatement exploitable dans les briques déjà existantes de Mon Plan Vital.

La continuité cible est :

```
Besoin concret / "Qu'est-ce que je mange ?"
        ↓
Mes repas & recettes
        ↓
quelques choix pertinents
        ↓
Préparer maintenant OU Ajouter à mon planning
        ↓
repas composé / moteurs existants
        ↓
Suivi réel
        ↓
quantités réellement mangées + calories + satiété + ressentis
        ↓
historique / valeurs sûres / observations
        ↓
OBSERVE → ALIGN → ADAPT → GROW
```

La recette ou le repas proposé n'est jamais un nouveau système de développement personnel : il produit et exploite de la donnée pour les moteurs existants.

## 2. Expérience utilisateur attendue

### 2.1 Entrée principale : « Qu'est-ce que je mange ? »

L'utilisateur doit pouvoir arriver avec une intention très concrète et accéder immédiatement à des entrées comme :

- Prêt en moins de 10 min
- Moins de 30 min
- Mes valeurs sûres
- Déjà prévu cette semaine
- Bien vécu les dernières fois

Le but n'est pas de montrer 30 ou 300 recettes. Le système doit progressivement être capable de proposer quelques solutions pertinentes en fonction des données réellement disponibles.

Exemple :

```
⚡ Je veux manger rapidement

5 min — assemblage
Rouleaux jambon / fromage frais / crudités
Déjà mangé 4 fois · bonne satiété 3/4

12 min — chaud
Crevettes ail-courgettes
Une de tes valeurs sûres

18 min — chaud
Champignons farcis chèvre/poulet
Pas encore testé
```

Les facteurs utilisables progressivement sont : temps disponible, moment du repas, préférences, aliments disponibles lorsqu'ils sont renseignés, planning actuel, valeurs sûres, historique réel et satiété observée.

## 3. Fiche repas / recette

Exemple cible :

```
Crevettes à l'ail & courgettes
12 min · très facile
```

La fiche peut porter des ingrédients et quantités structurés, une préparation, un temps, une difficulté et les informations nécessaires à l'expérience.

Les calories ne doivent pas être stockées arbitrairement comme une vérité figée si elles peuvent être recalculées à partir des aliments et quantités avec le moteur alimentaire existant.

Les actions principales doivent rester simples :

- Préparer maintenant
- Ajouter à mon planning
- Modifier

Une éventuelle proposition générée par IA peut également proposer « Enregistrer dans mes recettes », mais elle ne doit pas entrer automatiquement dans la bibliothèque personnelle.

## 4. « Préparer maintenant »

Cette action doit supprimer quasiment toute ressaisie.

À partir du repas/recette choisi, l'application réutilise la mécanique du repas composé pour préparer les ingrédients et quantités.

Au moment de la consommation :

```
Prévu :
Crevettes 150 g
Courgettes 300 g
Huile 10 g

C'est bien ce que j'ai mangé ✓
Modifier
```

Si l'utilisateur confirme, les aliments, quantités et calories sont envoyés vers Suivi via la logique de persistance existante.

S'il modifie une quantité, le suivi conserve la quantité réellement consommée sans modifier automatiquement le modèle de départ.

Parcours interdit :

```
recette
→ recopier dans planning
→ rechercher à nouveau les aliments
→ recopier dans Suivi
→ recalculer les calories
```

Cette double/triple saisie annulerait le bénéfice du chantier.

## 5. « Ajouter à mon planning »

Le chantier ne crée pas un planning spécial recettes.

Le repas choisi est transformé dans le contrat déjà accepté par le planning existant.

Exemple :

```
Quand ?
Jeudi — dîner

Ajouter au planning
```

Il doit ensuite se comporter comme un repas planifié normal : déplacement via les mécanismes existants, participation à la liste de courses et confrontation ultérieure avec ce qui a réellement été consommé.

## 6. Après consommation : le repas apprend de l'expérience utilisateur

Le différenciateur recherché n'est pas « cette recette est saine » ou « cette recette est rassasiante ».

Mon Plan Vital doit restituer les observations réellement enregistrées.

Exemple :

```
Crevettes à l'ail & courgettes

Préparé 6 fois
Temps réel moyen : 14 min

12 septembre — satiété : bonne
2 septembre — satiété : bonne
19 août — faim revenue rapidement

Ce que tu as observé
Sur 6 repas enregistrés, tu as indiqué une satiété satisfaisante 5 fois.
```

Formulation attendue : « chez toi, cette recette/ce repas a été associé à une bonne satiété 5 fois sur 6 ».

Formulation à éviter : « cette recette est rassasiante ».

Le système restitue une expérience personnelle ; il ne transforme pas une corrélation observée en vérité nutritionnelle générale.

## 7. Mes valeurs sûres

Une valeur sûre n'est pas nécessairement un repas déclaré « healthy » par l'application.

C'est un repas ou une recette dont les données répétées montrent qu'il fonctionne bien dans la vie réelle de cet utilisateur selon les signaux disponibles.

Exemple :

```
⭐ Une de tes valeurs sûres
Crevettes ail-courgettes
12–15 min
Mangé 8 fois
Bonne satiété 7/8
Facile à préparer les soirs où tu manques de temps.
```

Le moteur existant `repasReperes` constitue déjà une base importante pour cette logique. Il doit être réutilisé et éventuellement étendu, pas remplacé par un second moteur.

## 8. Propositions IA

L'IA sert à réduire la charge mentale, pas à remplir automatiquement une bibliothèque.

Exemple :

> Donne-moi quelque chose avec courgettes, poulet et champignons en moins de 20 minutes.

La proposition doit autant que possible utiliser le référentiel alimentaire et les moteurs de quantités/calories existants.

Actions possibles :

- Préparer maintenant
- Planifier
- Enregistrer dans mes recettes

Une proposition IA reste temporaire tant que l'utilisateur ne choisit pas explicitement de la conserver.

Une modification réellement consommée est enregistrée dans Suivi sans écraser automatiquement le modèle proposé/enregistré.

## 9. Raccord OBSERVE / ALIGN / ADAPT / GROW

Aucun système de points « recette saine » n'est créé dans ce chantier.

La donnée produite peut alimenter les moteurs existants.

### OBSERVE

Restituer des faits soutenus par les données disponibles.

Exemple : « Les soirs où tu utilises un repas préparable en moins de 15 minutes, tu renseignes moins souvent un extra avant le dîner », uniquement si les données permettent réellement ce constat.

### ALIGN

Permettre à l'utilisateur de reconnaître qu'une stratégie observée correspond ou non à la manière dont il souhaite vivre.

### ADAPT

Transformer éventuellement l'observation en action concrète via les moteurs prévus à cet effet.

Exemple : prévoir deux repas rapides dans le planning de la semaine.

### GROW

Observer dans le temps si cette stratégie devient une habitude stable.

Le module Mes repas & recettes nourrit ce cycle ; il ne le réimplémente pas.

## 10. Briques existantes déjà identifiées à réutiliser

L'audit a déjà confirmé plusieurs briques qui font gagner du temps :

- `lib/repasComposes.js` : composition, ajustement des quantités, conversion vers planning et occurrences réelles ;
- `components/GestionRepasComposes.js` : gestion/réutilisation de modèles de repas ;
- `components/SaisieRepasCompose.js` : consommation d'un modèle avec quantités ajustables, satiété, ressenti et note ;
- `lib/repasPersistence.js` + `pages/suivi.js` : persistance centrale des repas réels ;
- `lib/planificationRepas.js` : contrat du planning ;
- `lib/socleQuantitesCalories.js` : quantités, unités, conversions et calories ;
- `lib/listeCoursesGenerale.js` : liste de courses issue des repas planifiés ;
- `lib/repasReperes.js` : première base des valeurs sûres personnelles ;
- `repas_complets`, `repas_planifies`, `repas_reels` et `occurrence_repas_id` : structures déjà présentes dans Supabase.

Conséquence : chaque nouvelle brique proposée doit d'abord démontrer qu'elle comble un manque réel et qu'elle ne duplique pas l'un de ces mécanismes.

## 11. Frontière avec le chantier Planification / Gamification

Le chantier parallèle `planification-gamification-chatgpt` travaille notamment sur la composition pédagogique de l'assiette, les capsules nutrition/cuisson, leur contextualisation et le pont vers les défis.

Le présent chantier ne doit pas recréer ces moteurs.

Lorsque ces éléments sont nécessaires dans « Mes repas & recettes », ils doivent être consommés/raccordés après consolidation ciblée entre branches.

## 12. Ce qui n'est PAS validé

Les éléments suivants ne doivent pas être développés simplement parce qu'ils paraissent techniquement pratiques :

- un deuxième moteur de repas composé ;
- un deuxième moteur de calories ;
- un deuxième planning ;
- une deuxième liste de courses ;
- un deuxième moteur de valeurs sûres ;
- un nouveau système de points nutritionnels ;
- une nouvelle mécanique OBSERVE/ALIGN propre aux recettes ;
- une grosse bibliothèque IA remplie automatiquement ;
- une nouvelle table Supabase ou une nouvelle identité technique sans avoir démontré qu'elle est la plus petite extension nécessaire.

La migration `supabase/migrations/20260918_recettes_identite_modele.sql`, préparée pendant l'audit, **n'est pas une décision produit validée et ne doit pas être appliquée à Supabase en l'état**. Elle reste une hypothèse technique à réévaluer après conception du contrat minimal.

## 13. Principe directeur pour les décisions techniques

Avant chaque développement, répondre à ces questions :

1. Quelle expérience utilisateur validée ce changement rend-il possible ?
2. Une brique actuelle sait-elle déjà faire tout ou partie du travail ?
3. Peut-on la raccorder ou l'étendre sans créer une deuxième source de vérité ?
4. Quelle est la plus petite donnée ou fonction réellement manquante ?
5. Le changement préserve-t-il les parcours existants et l'historique ?
6. Appartient-il bien au périmètre « Mes repas & recettes » ?

Si la réponse à la première ou à la sixième question n'est pas claire, ne pas développer.

## 14. Plan d'action

### Étape 1 — Cartographier le parcours UX cible sur les briques existantes

Pour chaque entrée (« moins de 10 min », « valeurs sûres », « déjà prévu », etc.), déterminer quelles données existantes permettent déjà de produire le résultat et ce qui manque réellement.

Livrable : matrice UX → données → moteur existant → manque.

### Étape 2 — Définir l'objet fonctionnel minimal « repas/recette »

Ne pas commencer par une table.

Déterminer le contrat nécessaire pour afficher une fiche et transmettre le même choix à « Préparer maintenant » et « Planifier ».

Identifier ce qui peut être dérivé du repas composé et ce qui est réellement spécifique : préparation, durée, difficulté, tags, etc.

### Étape 3 — Concevoir « Préparer maintenant »

Réutiliser le repas composé et le point central de sauvegarde de Suivi.

Objectif de test UX : depuis une proposition, atteindre la confirmation du repas réel sans nouvelle recherche manuelle des aliments.

### Étape 4 — Concevoir « Ajouter à mon planning »

Transformer le même objet dans le contrat du planning existant.

Vérifier déplacement, liste de courses et futur passage prévu → réel.

### Étape 5 — Historique et valeurs sûres

Déterminer la plus petite manière fiable de reconnaître les répétitions d'un même repas/recette.

Réutiliser `repasReperes` et les occurrences existantes. Ne décider d'une nouvelle identité persistante qu'après avoir démontré le besoin exact.

### Étape 6 — Expérience « Qu'est-ce que je mange ? »

Construire progressivement le moteur de sélection à partir des sources disponibles.

Commencer par des règles déterministes et explicables lorsque possible : durée, repas déjà connus, valeurs sûres, planning.

L'IA intervient là où elle apporte réellement de la valeur, notamment pour générer une nouvelle proposition sous contraintes.

### Étape 7 — Raccord OBSERVE / ALIGN

Exposer seulement des observations supportées par les données et transmettre les informations utiles aux moteurs existants.

### Étape 8 — Implémentation par petits lots

Une fois les contrats validés :

- petits commits ciblés ;
- tests des fonctions pures ;
- pas de modification de `main` ;
- vérification de la branche parallèle avant modification d'un fichier partagé ;
- migration Supabase uniquement si un manque persistant est démontré et après validation.

## 15. Critère de réussite

Le chantier est réussi lorsque l'utilisateur peut partir d'une intention simple comme :

> « Je ne sais pas quoi manger » ou « Je veux quelque chose de rapide »

obtenir quelques propositions utiles, choisir l'une d'elles, la préparer maintenant ou la planifier, enregistrer ensuite ce qui a réellement été consommé sans ressaisie inutile, puis bénéficier progressivement de son propre historique pour recevoir des propositions plus pertinentes.

La réussite ne se mesure pas au nombre de nouvelles tables, composants ou fonctionnalités créés, mais à la continuité de cette expérience avec les moteurs déjà présents dans Mon Plan Vital.

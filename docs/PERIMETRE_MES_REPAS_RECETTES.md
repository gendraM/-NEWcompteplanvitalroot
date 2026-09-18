# Périmètre fonctionnel — Mes repas & recettes

> Document de référence du chantier `recettes-intelligentes-planning-suivi`.
> En cas de doute, revenir à ce document avant de développer.

## 1. Finalité

Le chantier réduit la charge mentale au moment de choisir quoi manger et raccorde ce choix aux moteurs déjà présents.

```
"Qu'est-ce que je mange ?"
→ Mes repas & recettes
→ quelques choix pertinents
→ Préparer maintenant OU Ajouter à mon planning
→ repas composé / moteurs existants
→ Suivi réel
→ satiété + ressentis + historique
→ valeurs sûres / OBSERVE
→ ALIGN → ADAPT → GROW
```

La recette ou proposition n'est ni un deuxième moteur alimentaire ni un nouveau système de développement personnel.

## 2. Expérience cible figée

Entrées principales :
- Prêt en moins de 10 min
- Moins de 30 min
- Mes valeurs sûres
- Déjà prévu cette semaine
- Bien vécu les dernières fois

Une fiche peut afficher nom, ingrédients/quantités structurés, préparation, temps et difficulté. Les calories doivent utiliser le moteur alimentaire existant.

Actions principales : **Préparer maintenant · Ajouter à mon planning · Modifier**.

Une proposition IA reste temporaire tant que l'utilisateur ne choisit pas explicitement de l'enregistrer.

### Préparer maintenant

Le choix est transformé en repas composé. L'utilisateur confirme ce qu'il a réellement mangé ou ajuste les quantités. Les lignes réelles sont ensuite envoyées à Suivi par la persistance existante. Aucune nouvelle recherche manuelle des aliments et aucun recalcul parallèle.

### Ajouter à mon planning

Le même choix est transformé dans le contrat du planning existant. Il doit ensuite bénéficier du planning, des déplacements et de la liste de courses déjà présents.

### Après consommation

Restituer les observations personnelles, par exemple : « chez toi, ce repas a été associé à une satiété satisfaisante 5 fois sur 6 », et non « ce repas est rassasiant ».

## 3. Valeurs sûres

Une valeur sûre est fondée sur l'expérience réelle répétée de l'utilisateur, pas sur une étiquette « healthy ».

Le moteur `repasReperes` existe déjà et doit être réutilisé/étendu, pas remplacé.

## 4. OBSERVE / ALIGN / ADAPT / GROW

Mes repas & recettes produit et exploite de la donnée réelle. Il ne crée aucun système de points nutritionnels ni un deuxième moteur de développement personnel.

OBSERVE restitue des faits soutenus par les données ; ALIGN permet leur mise en perspective ; ADAPT peut transformer une stratégie observée en action ; GROW observe sa stabilisation dans le temps.

## 5. Briques existantes à réutiliser

- `lib/repasComposes.js` : composition, ajustement, planning et occurrences réelles.
- `components/GestionRepasComposes.js` : modèles réutilisables.
- `components/SaisieRepasCompose.js` : consommation d'un modèle, ajustement, satiété, ressenti, note.
- `lib/repasPersistence.js` + `pages/suivi.js` : persistance réelle.
- `lib/planificationRepas.js` : contrat planning.
- `lib/socleQuantitesCalories.js` : quantités/calories.
- `lib/listeCoursesGenerale.js` : courses à partir du planning.
- `lib/repasReperes.js` : valeurs sûres.
- Supabase : `repas_complets`, `repas_planifies`, `repas_reels`, `occurrence_repas_id`.

La branche parallèle `planification-gamification-chatgpt` possède la composition pédagogique, les capsules nutrition/cuisson et le pont vers les défis. Ne pas les recréer ici.

## 6. Ce qui n'est pas validé

Ne pas créer sans démonstration du besoin : deuxième moteur repas/calories/planning/courses/valeurs sûres, score nutritionnel concurrent, mécanique OBSERVE/ALIGN propre aux recettes, bibliothèque IA automatique, nouvelle table ou identité Supabase.

La migration `supabase/migrations/20260918_recettes_identite_modele.sql` est une hypothèse technique **non validée et non appliquée**.

## 7. Principe de décision

Avant chaque développement :
1. Quelle expérience validée ce changement rend-il possible ?
2. Une brique actuelle sait-elle déjà faire le travail ?
3. Peut-on la raccorder/étendre ?
4. Quel est le minimum réellement manquant ?
5. L'historique et les parcours existants restent-ils compatibles ?
6. Sommes-nous toujours dans « Mes repas & recettes » ?

## 8. Étape 1 — Matrice UX → existant → manque réel (audit du 18/09/2026)

| Entrée / besoin UX | Données nécessaires | Ce qui existe déjà | Manque réel constaté | Décision minimale |
|---|---|---|---|---|
| **Mes valeurs sûres** | occurrences répétées + satiété/ressenti/alignement + composition | `repasReperes` groupe les occurrences, exige 3 occurrences et 2 résultats positifs, exploite satiété/ressenti/alignement et restitue une composition réutilisable | La fenêtre actuelle est limitée à 15 jours et le mécanisme exclut l'historique sans `occurrence_repas_id` ; pas encore de durée réelle de préparation | **Ne pas recréer.** Réutiliser `repasReperes`; l'extension éventuelle sera décidée lors du lot historique |
| **Bien vécu les dernières fois** | occurrences réelles + satiété/ressenti + composition | `repas_reels`, regroupement par occurrence et signaux de `repasReperes` existent | Il manque surtout une fonction de restitution orientée « dernières expériences » ; aucune nouvelle table n'est nécessaire pour une V1 | Construire plus tard un sélecteur/présentateur pur à partir des occurrences existantes |
| **Déjà prévu cette semaine** | `repas_planifies` + regroupement date/type/composition | Planning et lignes `repas_planifies` existent ; la liste de courses les consomme déjà | Il faut définir la présentation d'un repas planifié comme proposition réutilisable ; pas de nouveau stockage nécessaire pour l'entrée V1 | Lire le planning existant et transformer les compositions pertinentes en cartes de choix |
| **Prêt en moins de 10 min** | durée de préparation fiable + composition exploitable | Les repas composés ont nom/composition/kcal, mais **aucune durée n'est portée par leur contrat actuel** | **Durée de préparation structurée manquante** pour les repas enregistrés génériques | Ne pas créer une table. Définir à l'étape 2 le plus petit enrichissement/contrat permettant de porter une durée |
| **Moins de 30 min** | même besoin que ci-dessus | même socle | même manque : durée structurée | même décision |
| **Préparer maintenant** | modèle/composition + quantités modifiables + calories + sauvegarde réelle | `SaisieRepasCompose` fait déjà presque tout : sélection modèle, quantités ajustables, recalcul kcal, satiété/ressenti/note, `construireOccurrencesReelles`, puis `onSave` vers le suivi | Le composant impose aujourd'hui de **re-sélectionner** un modèle dans une liste. Il manque le raccord direct « carte choisie → modèle déjà sélectionné → confirmer/modifier » | **Premier gain UX majeur sans nouveau moteur** : rendre la saisie de repas composé préchargeable depuis un choix externe |
| **Ajouter à mon planning** | composition + date + type | `PlanificateurRepas` charge déjà un modèle de `repas_complets`, permet ajustement et enregistre dans `repas_planifies`; `repasComposes` sait aussi construire les occurrences planifiées | Le choix externe « Mes repas & recettes » n'arrive pas encore directement préchargé dans le planificateur | Ajouter plus tard un contrat d'entrée/préchargement, pas un deuxième planificateur |
| **Liste de courses** | lignes planifiées + quantités/unités | `listeCoursesGenerale` transforme déjà les lignes `repas_planifies`, agrège les quantités et gère les incomplets | Aucun manque spécifique recette si le repas passe correctement par `repas_planifies` | **Aucun développement recette spécifique** |
| **Calories** | aliment + quantité + unité + référence | moteurs existants de planification et `socleQuantitesCalories`; repas composé conserve les kcal calculées et recalcule proportionnellement les quantités réelles | Aucun nouveau moteur nécessaire | Réutilisation stricte |
| **Je veux manger rapidement** | filtres de durée + valeurs sûres + historique + planning + éventuellement contraintes | valeurs sûres, planning, repas enregistrés et suivi existent séparément | Il manque un **orchestrateur de sélection** qui rassemble ces sources ; la durée structurée est également manquante | Après étape 2, créer un moteur de sélection pur qui renvoie peu de propositions, sans persistance propre |
| **Proposition IA sous contraintes** | contraintes utilisateur + référentiel + contrat de repas exploitable | référentiel/calories/repas composé existent | Il manque le contrat de sortie commun entre proposition IA, repas enregistré et carte « Mes repas & recettes » | Ne pas coder l'IA avant d'avoir figé ce contrat minimal |

### Conclusion de l'étape 1

L'audit confirme que le principal travail n'est **pas** de créer une nouvelle architecture de recettes.

Trois manques fonctionnels ressortent :

1. **un contrat commun de choix « repas/recette »**, capable de transporter une composition existante et quelques métadonnées d'expérience ;
2. **la durée de préparation**, absente du contrat générique actuel mais indispensable aux entrées « <10 min » et « <30 min » ;
3. **le raccord direct d'un choix vers les moteurs existants**, surtout « Préparer maintenant » sans re-sélection et « Ajouter au planning » sans reconstruction.

Le moteur de valeurs sûres, les calories, le planning, les occurrences réelles et la liste de courses sont déjà présents. Ils ne doivent pas être reconstruits.

**Conséquence : la création d'une table `recettes` n'est toujours pas justifiée par cette étape.**

## 9. Étape 2 — prochaine action

Définir maintenant **l'objet fonctionnel minimal de choix** sans toucher à Supabase.

Ce contrat doit permettre à une même proposition de fonctionner qu'elle provienne :
- d'un repas composé enregistré ;
- d'une valeur sûre ;
- d'un repas déjà planifié ;
- plus tard, d'une proposition IA.

Il doit contenir uniquement ce qui est nécessaire pour :
- afficher une carte/fiche ;
- connaître la composition ;
- afficher une durée lorsqu'elle est connue ;
- déclencher « Préparer maintenant » ;
- déclencher « Ajouter à mon planning ».

À ce stade, ce contrat doit être un objet/fonction métier en mémoire et testable. **Aucune migration Supabase ne doit être appliquée pour l'étape 2.**

## 10. Plan d'action restant

1. **Étape 2 :** formaliser le contrat minimal « choix repas ».
2. **Étape 3 :** brancher ce contrat sur « Préparer maintenant » en préchargeant le flux de repas composé.
3. **Étape 4 :** brancher le même contrat sur le planificateur existant.
4. **Étape 5 :** restitution historique et évolution des valeurs sûres uniquement si nécessaire.
5. **Étape 6 :** moteur « Qu'est-ce que je mange ? » avec quelques propositions déterministes.
6. **Étape 7 :** proposition IA sous contraintes, sans pollution automatique de la bibliothèque.
7. **Étape 8 :** raccord des observations aux moteurs OBSERVE/ALIGN existants.

## 11. Critère de réussite

Depuis « Je ne sais pas quoi manger » ou « Je veux quelque chose de rapide », l'utilisateur obtient quelques choix utiles, peut préparer ou planifier immédiatement, puis enregistrer ce qu'il a réellement consommé sans ressaisie inutile. Son historique améliore progressivement les choix futurs.

La réussite se mesure à cette continuité, pas au nombre de nouvelles tables ou composants.

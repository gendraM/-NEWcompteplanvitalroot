# État des lieux et plan d’action — Liste de courses générale et planification

**Date :** 24 août 2026  
**Branche de travail :** liste-courses-generale-plan-chatgpt  
**Branche source :** finalisation-reprise-jeune-alimentaire-chatgpt  
**Statut :** lots 0 à 5B et corrections fonctionnelles publiés ; lot 6 prochaine étape

## 1. Objet du chantier

Construire la liste de courses générale à partir des repas réellement planifiés dans pages/plan.js, sans dupliquer le moteur déjà validé pour la reprise alimentaire.

Le chantier doit également intégrer deux fonctionnalités indissociables de cette liste :

1. le budget calorique prévisionnel du plan ;
2. les repas composés nommés, sauvegardés et réutilisables.

La liste de courses constitue la traduction pratique du plan alimentaire. Le budget calorique constitue sa lecture nutritionnelle prévisionnelle.

## 2. Décisions fonctionnelles validées

### 2.1 Budget calorique

Le budget visé n’est pas un budget financier.

Il doit répondre à la question suivante :

> Si l’utilisateur suit les repas qu’il a planifiés, quels seront ses apports caloriques quotidiens et hebdomadaires, et quelles courses doit-il acheter pour réaliser ce plan ?

Après planification, l’application doit calculer :

- les calories de chaque aliment ;
- les calories de chaque repas ;
- le total prévu pour chaque journée ;
- le total prévu sur la période ;
- la moyenne quotidienne prévue ;
- l’objectif calorique quotidien issu du profil et du routeur poids ;
- l’écart prévisionnel entre le plan et cet objectif.

Ces informations doivent accompagner la liste de courses générée. Elles ne décrivent pas les consommations réelles et ne doivent pas être confondues avec le budget calorique réservé aux extras.

### 2.2 Repas composé

Un repas composé n’est pas seulement plusieurs saisies séparées au même moment.

Le fonctionnement attendu est le suivant :

1. L’utilisateur ajoute plusieurs aliments dans un même repas.
2. Chaque composant conserve son aliment, sa catégorie, sa quantité, son unité, ses calories et les informations nutritionnelles utiles.
3. L’application propose d’enregistrer cet ensemble comme repas composé.
4. L’utilisateur lui donne un nom, par exemple « Poulet et légumes ».
5. Ce repas peut ensuite être sélectionné en une seule action dans la saisie réelle ou dans la planification.
6. Ses calories totales sont recalculées à partir de ses composants.
7. Il peut être réutilisé, dupliqué ou modifié.
8. Lors de la génération des courses, le repas composé est décomposé en ingrédients.
9. Seuls les ingrédients sont additionnés dans la liste : le nom du repas n’est jamais un article à acheter.

Il faudra distinguer la modification d’une occurrence planifiée de la modification du modèle réutilisable.

## 3. Sources auditées

L’audit a comparé le code réellement exécuté, les structures Supabase et notamment les documents suivants :

- docs/AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md ;
- docs/COMMUNICATION_CRISTALLISATION_PLAN_LISTE_COURSES.md ;
- docs/TODO_CRISTALLISATION_PRIORITE.md ;
- docs/PASSATION perimetre cristalisation.MD ;
- docs/Repas composé reflexion.md ;
- docs/logique repas.md ;
- docs/COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE lien routeur poids.md ;
- docs/HISTORIQUE_FONCTION_ALIMENT_PERSONNALISE.md ;
- docs/Cahier_technique.md ;
- docs/Cahier_des_charges.md ;
- docs/Fiche_descriptive_suivi.md ;
- docs/VISION_GLOBALE_PRIORITES.md ;
- docs/PLAN_IMPL_ADAPTATIONS_REPRISE_ET_CRISTALLISATION.md ;
- docs/ARCHITECTURE_CRITERES_DYNAMIQUES_CRISTALLISATION.md ;
- docs/SYSTEME_DEFIS_INTELLIGENTS_ET_EXPLOITATION_BDD.md.

Les fichiers techniques contrôlés comprennent notamment :

- pages/plan.js ;
- pages/suivi.js ;
- components/RepasBloc.js ;
- lib/listeCoursesReprise.js ;
- lib/routeurPoids.js ;
- lib/useUserReferentiel.js ;
- lib/cristallisationAPI.js ;
- data/referentiel.js.

## 4. Ce qui existe réellement

### 4.1 Planification

pages/plan.js permet actuellement :

- d’afficher un planning mensuel ;
- d’ajouter un aliment à une date et un type de repas ;
- de déplacer un élément par glisser-déposer ;
- d’importer et d’exporter le planning ;
- d’enregistrer les lignes dans repas_planifies.

En revanche, l’interface actuelle n’enregistre que la date, le type, l’aliment et la catégorie. Elle n’utilise pas encore les quantités ni les calories disponibles dans la table.

Elle utilise le référentiel général statique et non le référentiel fusionné général + aliments personnalisés.

### 4.2 Calcul calorique

Le socle calorique existe déjà :

- lib/routeurPoids.js calcule le BMR, le TDEE et l’apport_calorique_cible ;
- pages/suivi.js charge l’objectif calorique personnalisé ;
- components/RepasBloc.js calcule les calories depuis l’aliment et la quantité ;
- le référentiel contient des portions et des valeurs caloriques ;
- les aliments personnalisés sont fusionnés avec le référentiel général par useUserReferentiel.

Ce moteur est actuellement utilisé pour les repas consommés, pas pour les repas planifiés.

### 4.3 Liste de courses de reprise

lib/listeCoursesReprise.js contient déjà des fonctions validées pour :

- construire une quantité d’achat ;
- additionner les utilisations ;
- arrondir les quantités ;
- convertir g en kg et ml en L ;
- regrouper les articles lorsque leur nom, leur préparation et leur unité sont compatibles ;
- conserver un identifiant stable ;
- gérer les états à acheter, acheté et déjà disponible ;
- gérer certaines substitutions.

Ces fonctions communes doivent être réutilisées ou extraites proprement. Les règles propres aux phases de reprise doivent rester séparées.

### 4.4 Aliments personnalisés

La fonction d’ajout d’aliments personnalisés existe déjà :

- FormAjoutAliment ;
- useUserReferentiel ;
- table referentiel_user_custom ;
- fusion du référentiel général et des aliments de l’utilisateur dans RepasBloc.

Le chantier ne doit pas recréer cette fonction. Il doit raccorder plan.js au même référentiel fusionné.

### 4.5 Structures Supabase déjà présentes

Le contrôle direct du projet Becomingtherealme confirme notamment :

#### repas_planifies

La table possède déjà :

- user_id ;
- date ;
- type ;
- aliment ;
- categorie ;
- quantite ;
- kcal ;
- combo_valide.

Les colonnes quantite et kcal existent donc déjà, mais plan.js ne les renseigne pas.

#### repas_complets

La table existe et contient :

- user_id ;
- nom ;
- composition en JSONB ;
- quantite_par_assiette en JSONB ;
- created_at.

Elle est actuellement vide et n’est pas raccordée à l’interface.

#### combos_enregistres

Cette table existe aussi, mais correspond à la logique des combos comportementaux. Elle ne doit pas être utilisée comme doublon de repas_complets.

#### listes_courses_generees

La table existe avec :

- la période ;
- le nombre de jours ;
- la liste en JSONB ;
- des champs de contexte de cristallisation ;
- des champs historiques d’export.

Elle est actuellement utilisée par l’API de cristallisation, mais aucun générateur n’est raccordé à plan.js.

### 4.6 Cristallisation

lib/cristallisationAPI.js possède des fonctions d’enregistrement et de récupération des listes.

Cependant :

- pages/plan.js ne reçoit pas encore le contexte de cristallisation ;
- la liste intelligente n’est pas générée ;
- la page de cristallisation indique encore que cette fonction arrivera prochainement.

## 5. Écarts et contradictions documentaires

Certains documents anciens présentent comme implémentés :

- la génération dynamique depuis plan.js ;
- l’export PDF et e-mail ;
- les statistiques prévisionnelles ;
- les alertes et recommandations de cristallisation.

Le code actuel confirme que ces éléments ne sont pas livrés.

D’autres exemples historiques utilisent des champs ou conventions incompatibles avec le code actuel :

- exemples de quantité non utilisés par plan.js ;
- champ calories au lieu de kcal ;
- alternatives_meilleures au lieu de alternatives ;
- utilisateur de test codé en dur ;
- arrondis forfaitaires moins précis que le moteur de reprise validé ;
- seulement cinq catégories fixes, alors que le référentiel en possède davantage.

Les documents concernés devront être corrigés lors de la livraison.

## 6. Expérience utilisateur cible

### 6.1 Planifier

L’utilisateur :

1. choisit une date et un moment ;
2. ajoute un ou plusieurs aliments ;
3. voit la portion proposée, l’unité et les calories ;
4. peut ajuster la quantité ;
5. voit le total calorique du repas ;
6. enregistre le repas dans le planning.

### 6.2 Créer un repas composé

Lorsque plusieurs aliments sont associés au même repas, l’application propose :

> Enregistrer cette composition comme repas réutilisable ?

L’utilisateur peut :

- donner un nom au repas ;
- vérifier les composants et quantités ;
- enregistrer le modèle ;
- l’utiliser plus tard en une seule sélection.

### 6.3 Réutiliser

Dans la planification ou la saisie réelle, l’utilisateur peut sélectionner :

- un aliment individuel ;
- un aliment personnalisé ;
- un repas composé enregistré.

Lorsqu’un repas composé est sélectionné, tous ses composants sont ajoutés et son total calorique est affiché.

### 6.4 Générer la liste de courses

L’utilisateur choisit une période contenant des repas planifiés.

L’application :

1. récupère les repas de la période ;
2. décompose les repas composés ;
3. additionne les composants identiques ;
4. respecte les unités et les préparations ;
5. produit les quantités d’achat ;
6. regroupe les articles par catégories ;
7. permet de suivre leur état.

### 6.5 Lire le budget calorique prévu

Avec la liste, l’utilisateur voit :

- les repas prévus par jour ;
- les calories de chaque repas ;
- le total de chaque journée ;
- le total de la semaine ou de la période ;
- la moyenne journalière ;
- l’objectif calorique quotidien ;
- l’écart prévisionnel.

## 7. Règles fonctionnelles importantes

- Ne jamais inventer une conversion de quantité.
- Si une portion ne peut pas être convertie en g, ml ou unité, conserver son unité réelle.
- Ne jamais compter le nom d’un repas composé comme un article.
- Ne pas compter deux fois les composants d’un repas composé.
- Conserver une photographie des composants utilisés lors de la planification afin qu’une modification ultérieure du modèle ne réécrive pas silencieusement l’ancien planning.
- Permettre de modifier une occurrence sans modifier le modèle.
- Demander une confirmation avant de remplacer le modèle enregistré.
- Les anciens repas sans quantité ni kcal doivent rester affichables.
- Une information calorique manquante doit être signalée comme incomplète, pas remplacée par une valeur inventée.
- Les listes doivent être isolées par utilisateur.
- Les règles de reprise et celles de cristallisation restent des couches contextuelles, pas le cœur du moteur général.

## 8. Périmètre retenu

Le chantier comprend :

- le référentiel fusionné dans plan.js ;
- les quantités et calories dans la planification ;
- le calcul calorique par repas, jour et période ;
- la comparaison avec l’objectif calorique du profil ;
- la création et la réutilisation des repas composés ;
- l’utilisation de repas composés dans la planification et la saisie réelle ;
- la décomposition des repas composés pour les courses ;
- le moteur général de regroupement et de quantités ;
- l’interface pratique de la liste ;
- la persistance et le rechargement ;
- les tests, le build et la documentation.

Le chantier ne comprend pas, sauf décision ultérieure :

- un budget financier en euros ;
- la prévision de poids ;
- les recommandations avancées de cristallisation ;
- la génération automatique de menus ;
- la modération communautaire des aliments ;
- l’envoi par e-mail et l’export PDF.

## 9. Plan d’action

### Lot 0 — Point de départ et non-régression

- Vérifier le commit de départ de la branche.
- Recenser les tests existants du planning, du moteur calorique, des aliments personnalisés et des courses de reprise.
- Ajouter des tests de caractérisation avant extraction des fonctions communes.
- Garantir que la reprise alimentaire reste inchangée.

**Résultat attendu :** une base mesurable avant toute modification.

### Lot 1 — Socle commun de quantités et calories

- Isoler les fonctions génériques du moteur de reprise.
- Conserver séparément les règles propres aux phases.
- Centraliser le calcul calorique depuis une quantité et les données du référentiel.
- Gérer les formats par unité, par portion et par 100 g.
- Définir explicitement le comportement des données incomplètes.
- Ajouter les tests unitaires.

**Résultat attendu :** un seul socle fiable utilisable par la reprise, le planning et les futures listes.

### Lot 2 — Enrichissement de plan.js

- Remplacer le référentiel statique par le référentiel fusionné.
- Ajouter la quantité, l’unité et les kcal à la saisie.
- Préremplir les valeurs connues.
- Permettre leur correction.
- Enregistrer quantite et kcal dans repas_planifies.
- Charger les anciens repas sans casser l’affichage.
- Afficher le total de chaque repas et de chaque journée.

**Résultat attendu :** un planning suffisamment précis pour produire des courses et une projection calorique.

### Lot 3 — Repas composés réutilisables

- Définir le format canonique de composition.
- Raccorder la table repas_complets existante.
- Proposer l’enregistrement après une saisie multi-aliments.
- Permettre de nommer, consulter, modifier, dupliquer et supprimer un modèle.
- Intégrer les repas composés à la planification.
- Intégrer les repas composés à la saisie réelle.
- Enregistrer une photographie des composants dans chaque occurrence.
- Calculer le total calorique du repas.
- Tester les modifications d’occurrence et de modèle.

**Résultat attendu :** ajouter un repas complet en une seule action sans perdre le détail de ses aliments.

### Lot 4 — Générateur général de liste de courses

- Ajouter la sélection de période.
- Récupérer les repas planifiés concernés.
- Décomposer les repas composés.
- Normaliser les aliments individuels et personnalisés.
- Agréger les quantités compatibles.
- Regrouper dynamiquement toutes les catégories.
- Gérer les informations incomplètes sans inventer de données.
- Réutiliser les conversions et arrondis validés.
- Ajouter les tests de non-double-comptage.

**Résultat attendu :** une liste fidèle aux repas réellement planifiés.

### Lot 5 — Budget calorique prévisionnel du plan

- Calculer les kcal de chaque repas.
- Produire les totaux journaliers.
- Produire le total de la période.
- Produire la moyenne quotidienne.
- Charger l’objectif calorique depuis le routeur poids.
- Afficher l’écart prévisionnel.
- Distinguer les journées complètes des journées partiellement planifiées.
- Ne pas présenter une période incomplète comme une projection certaine.

**Résultat attendu :** savoir ce que représente nutritionnellement le plan si l’utilisateur le suit.

### Lot 6 — Utilisation pratique de la liste

- Afficher les articles par catégorie.
- Réutiliser les états à acheter, acheté et déjà disponible.
- Conserver des identifiants stables.
- Permettre les ajustements autorisés sans perdre les états.
- Afficher simultanément le résumé du plan et le budget calorique.
- Assurer l’utilisation mobile et ordinateur.

**Résultat attendu :** une liste réellement utilisable pendant les courses.

### Lot 7 — Persistance Supabase

- Vérifier la compatibilité de listes_courses_generees avec le contexte général.
- Décider s’il faut rendre parcours_id facultatif dans le flux général ou ajouter un champ de contexte.
- Enregistrer la période, les articles, leurs états et le résumé calorique.
- Recharger l’historique.
- Empêcher les doublons.
- Garantir le cloisonnement par user_id.
- Préparer une migration uniquement si la structure actuelle est insuffisante.
- Vérifier la migration et les politiques avant validation.

**Résultat attendu :** retrouver une liste sur plusieurs appareils sans créer une deuxième source de vérité.

### Lot 8 — Préparation de la cristallisation

- Prévoir une entrée contextuelle depuis la cristallisation.
- Permettre au moteur général de recevoir ultérieurement QN, critères actifs et aliments déclencheurs.
- Ne pas implémenter dans ce lot les recommandations avancées ni la prévision de poids.

**Résultat attendu :** éviter une impasse technique sans élargir artificiellement la livraison.

### Lot 9 — Validation finale et documentation

- Tests unitaires du calcul des calories.
- Tests des portions et unités.
- Tests des repas composés.
- Tests de décomposition pour les courses.
- Tests des aliments personnalisés.
- Tests des anciens repas incomplets.
- Tests de persistance et d’isolation utilisateur.
- Tests de non-régression de la reprise.
- Build complet.
- Test fonctionnel manuel du parcours.
- Mise à jour des documents historiques et de la passation.

**Résultat attendu :** aucune fonctionnalité déclarée livrée sans preuve par les tests, le build et le parcours utilisateur.

## 10. Point de sécurité à traiter explicitement

L’audit Supabase a identifié :

- des politiques très larges sur plusieurs tables liées au chantier ;
- referentiel_user_custom avec RLS désactivée ;
- certaines autres tables du projet également sans RLS.

Aucune correction n’est appliquée dans ce commit de cadrage.

Avant de livrer la persistance des repas composés et des listes, il faudra valider explicitement le périmètre de sécurisation. Une politique doit limiter chaque utilisateur à ses propres lignes via user_id sans bloquer les usages existants.

## 11. Règles de suivi Git

Pour éviter toute perte de travail :

- chaque lot doit se terminer par tests ciblés et état Git ;
- la passation doit être mise à jour avant la proposition de commit ;
- aucun lot ne doit être déclaré livré tant qu’il n’est pas commité et poussé ;
- après chaque lot modifié, demander l’autorisation avant commit et push, sauf autorisation explicite déjà donnée pour ce lot ;
- vérifier la présence distante du commit après chaque push ;
- ne jamais inclure des fichiers étrangers au lot dans un commit.

## 12. Journal d’exécution — Lot 0

### 12.1 Point de départ vérifié

- branche : liste-courses-generale-plan-chatgpt ;
- commit de départ : 1ef3073, « Documenter le chantier liste de courses générale » ;
- arbre de travail propre avant le début du lot ;
- aucune modification fonctionnelle de pages/plan.js, du moteur de reprise ou de Supabase dans ce lot.

### 12.2 Inventaire de la couverture au démarrage

- planning général : aucune suite dédiée à pages/plan.js ;
- moteur calorique : aucune suite dédiée à lib/routeurPoids.js ;
- aliments personnalisés : le raccordement existe dans useUserReferentiel et RepasBloc, mais aucune suite unitaire dédiée au hook ;
- liste de courses de reprise : 16 tests existants avant ce lot ;
- règles métier de reprise : 6 tests existants ;
- synchronisation des repas de reprise : 6 tests existants ;
- préparation au jeûne et mode test : déjà couverts par les suites existantes.

Le planning et le hook de référentiel seront testés au moment de leur extraction vers des fonctions pures dans les lots 1 et 2. Aucun faux test fondé uniquement sur le texte source de la page n’a été ajouté.

### 12.3 Tests de caractérisation ajoutés

- création de tests du routeur poids : BMR, TDEE, plafonds du budget extras, objectif calorique quotidien et refus des données invalides ;
- verrouillage de la distinction entre apport_calorique_cible et budgetExtras ;
- ajout de cas d’agrégation de courses couvrant les préparations compatibles, les préparations distinctes et les unités incompatibles ;
- conversion de l’ancien script validation-semaine en véritable suite Jest avec assertions ;
- stabilisation de ses données de test selon la règle actuelle est_extra et selon les dates locales.

### 12.4 Résultats locaux

- tests ciblés routeur poids et liste de reprise : 24 réussis sur 24 ;
- suite complète : 65 tests réussis sur 65, 9 suites réussies sur 9 ;
- build Next.js : réussi, 36 pages générées ;
- reprise alimentaire : aucun fichier fonctionnel modifié ;
- Supabase : aucune lecture ou écriture nécessaire pour ce lot ;
- commit et push : en attente d’autorisation explicite.

### 12.5 Prochaine étape après validation Git

Lot 1 : extraire le socle commun de quantités et de calories, en conservant toutes les règles propres à la reprise dans leur module actuel et en maintenant les tests du lot 0 au vert.

## 13. Journal d’exécution — Lot 1

### 13.1 Socle commun créé

Le nouveau module lib/socleQuantitesCalories.js centralise désormais :

- la normalisation des unités ;
- les conversions explicites g/kg et ml/cl/L ;
- les équivalences de comptage pièce/unité ;
- la lecture des portions numériques, fractionnaires et descriptives ;
- le calcul depuis kcalParUnite ;
- le calcul depuis une quantité calorique de référence ;
- le calcul depuis la portion par défaut ;
- la prise en charge explicite des valeurs pour 100 g ;
- les arrondis et le formatage des quantités d’achat ;
- la clé de compatibilité et l’agrégation des articles.

Une conversion non démontrable retourne un résultat de statut incomplet avec kcal à null. Le moteur ne remplace jamais une donnée absente par une estimation arbitraire.

### 13.2 Raccordements effectués

- lib/listeCoursesReprise.js conserve toutes ses règles de phases, aliments, portions et préparations, mais utilise maintenant le socle commun pour arrondir, formater et agréger ;
- components/RepasBloc.js utilise maintenant le calcul calorique commun lors de la sélection d’un aliment, de la modification d’une quantité et de l’ajout d’un aliment personnalisé ;
- pages/plan.js n’est pas encore modifié : son enrichissement appartient au lot 2.

### 13.3 Compatibilité du référentiel

Un contrôle exhaustif a exécuté le nouveau calcul sur la portion par défaut des 616 aliments du référentiel général :

- 616 aliments calculables sur 616 ;
- 0 portion par défaut incomplète ;
- 0 écart entre les kcal calculées et les kcal de référence ;
- prise en charge vérifiée des formats g, kg, ml, cl, L, CS, unité, pièce, part, portion et conditionnements textuels ;
- les aliments personnalisés disposant de quantite, kcal et kcalParUnite restent compatibles.

### 13.4 Vérifications locales

- tests ciblés du socle et de la reprise : 30 réussis sur 30 ;
- suite complète : 78 tests réussis sur 78, 10 suites réussies sur 10 ;
- build Next.js : réussi, 36 pages générées ;
- le build a été exécuté dans une copie temporaire hors du dossier synchronisé, car le service de synchronisation recréait le cache ignoré .next/export pendant son nettoyage ;
- aucune modification du référentiel général ;
- aucune modification Supabase ;
- commit et push du lot 1 : effectués sur la branche, commit 1a856cc.

### 13.5 Prochaine étape après validation Git

Lot 2 : enrichir pages/plan.js avec le référentiel fusionné, la quantité, l’unité, les kcal enregistrées et les totaux par repas et par journée, tout en maintenant l’affichage des anciens repas incomplets.

## 14. Journal d’exécution — Lot 2

### 14.1 Planification enrichie

pages/plan.js utilise désormais le référentiel fusionné général + aliments personnalisés. Lorsqu’un aliment connu est sélectionné :

- sa catégorie est reprise ;
- sa portion par défaut est proposée ;
- la quantité et l’unité restent modifiables ;
- les calories sont calculées avec le socle commun du lot 1 ;
- l’utilisateur peut corriger explicitement les calories avant l’enregistrement.

Le repas est enregistré dans les colonnes existantes de repas_planifies :

- quantite contient la valeur et l’unité sous une forme explicite, par exemple 150 g ;
- kcal contient la valeur entière prévue ;
- aucune migration ni nouvelle colonne Supabase n’est nécessaire pour ce lot.

Les modèles CSV et Excel comprennent maintenant les colonnes Quantité, Unité et Kcal. Les anciens fichiers restent importables ; les calories sont recalculées lorsque la quantité et l’aliment suffisent à un calcul démontrable.

### 14.2 Compatibilité des anciens repas

Le nouveau module lib/planificationRepas.js distingue explicitement :

- les lignes complètes, disposant d’une quantité et de calories enregistrées ou calculables ;
- les lignes historiques sans quantité ou sans valeur calorique ;
- les données impossibles à relier au référentiel sans estimation arbitraire.

Une ancienne ligne incomplète reste affichée avec « Quantité non renseignée » et/ou « Calories non renseignées ». Aucune quantité ni calorie n’est inventée et aucune ancienne ligne n’est modifiée automatiquement dans la base.

### 14.3 Totaux affichés

Dans chaque journée du calendrier :

- chaque aliment affiche sa quantité et ses calories ;
- les aliments partageant le même moment de repas sont additionnés ;
- le total calorique de chaque moment est affiché ;
- le total calorique journalier est affiché ;
- la mention « partiel » apparaît dès qu’une ligne de la journée ne possède pas de calories exploitables.

Ce lot prépare la projection calorique sans anticiper le lot 5 : il ne charge pas encore l’objectif calorique du profil et ne calcule pas encore la moyenne ni l’écart de la période.

### 14.4 Vérifications locales

- nouvelle suite tests/planificationRepas.test.js : 6 tests ;
- quantité/unité sérialisées dans le champ texte existant ;
- calcul et correction explicite des kcal ;
- anciens repas incomplets conservés sans valeur inventée ;
- récupération des calories lorsque l’ancienne quantité suffit ;
- totaux par repas et par journée avec statut complet ou partiel ;
- suite complète : 84 tests réussis sur 84, 11 suites réussies sur 11 ;
- build Next.js : réussi, 36 pages générées ;
- référentiel général inchangé ;
- Supabase : aucune migration et aucune modification de schéma ;
- commit et push du lot 2 : effectués sur la branche, commit 7447331.

### 14.5 Prochaine étape après validation Git

Lot 3 : raccorder les repas composés réutilisables à la table repas_complets existante, sans confondre le modèle sauvegardé avec une occurrence planifiée.

## 15. Journal d’exécution — Lot 3

### 15.1 Structure Supabase contrôlée

Le contrôle direct du projet `Becomingtherealme` a confirmé que la table `repas_complets` existe déjà avec les champs nécessaires :

- `id` ;
- `user_id` ;
- `nom` ;
- `composition` en JSONB ;
- `quantite_par_assiette` en JSONB ;
- `created_at`.

Aucune nouvelle table et aucune migration n’ont été créées. La table `repas_planifies` accepte déjà les occurrences détaillées du modèle. La table `repas_reels` accepte déjà les composants consommés et leur tag commun.

Le module `lib/repasComposes.js` applique systématiquement le `user_id` connecté lors de la lecture, de la création, de la modification et de la suppression des modèles.

### 15.2 Format canonique du modèle

Chaque modèle enregistre dans `composition` un tableau de composants contenant :

- identifiant stable du composant ;
- nom de l’aliment ;
- catégorie ;
- quantité ;
- unité ;
- calories ;
- QN lorsqu’il est disponible.

`quantite_par_assiette` conserve une version du format, les portions, le total calorique et le QN moyen pondéré par les calories.

Un modèle est refusé s’il comporte moins de deux aliments ou si un composant ne possède pas les informations indispensables. Aucune quantité ou calorie n’est inventée.

### 15.3 Création et gestion depuis le planning

La page `pages/plan.js` contient désormais un espace « Mes repas composés » raccordé au repas et à la date déjà sélectionnés dans le formulaire existant.

L’utilisateur peut :

- enregistrer comme modèle les aliments déjà placés au même moment et à la même date ;
- donner un nom au modèle ;
- consulter ses composants, ses calories totales et son QN moyen ;
- planifier tout le modèle sur une date et un moment en une seule action ;
- modifier le nom, les composants, quantités, unités et calories du modèle ;
- dupliquer le modèle ;
- supprimer le modèle après confirmation.

La suppression d’un modèle n’efface jamais les occurrences déjà planifiées.

### 15.4 Photographie des occurrences planifiées

Lorsqu’un modèle est planifié, chaque ingrédient devient une ligne distincte dans `repas_planifies` avec sa quantité et ses calories au moment de l’action.

Ce choix assure simultanément que :

- le nom du repas composé ne devient jamais un article de courses ;
- le futur générateur de courses retrouve directement chaque ingrédient ;
- modifier le modèle plus tard ne réécrit pas silencieusement le planning passé ;
- les totaux déjà livrés au lot 2 continuent à fonctionner sans deuxième moteur.

Les nouvelles opérations de la page `plan.js` renseignent et filtrent aussi explicitement `user_id`.

### 15.5 Réutilisation dans la saisie réelle

`components/RepasBloc.js` propose le nouveau composant `SaisieRepasCompose` lorsqu’au moins un modèle appartient à l’utilisateur connecté.

L’utilisateur choisit un modèle puis peut renseigner une heure, la satiété, un ressenti et une note. Une seule validation crée les lignes détaillées dans `repas_reels`. Toutes les lignes partagent un tag de repas composé, ce qui permet aux analyses existantes de les reconnaître comme un seul repas tout en conservant le détail nutritionnel.

La saisie classique aliment par aliment reste disponible et n’a pas été remplacée.

### 15.6 Séparation avec les combos comportementaux

La table `combos_enregistres` n’est ni lue ni modifiée. Elle conserve sa fonction comportementale historique. Les repas alimentaires réutilisables utilisent exclusivement `repas_complets`.

### 15.7 Point de sécurité constaté, non modifié

Les politiques RLS actuelles de `repas_complets` et `repas_planifies` sont plus permissives que le cloisonnement attendu : leurs politiques globales autorisent actuellement toutes les opérations. Le code du lot 3 filtre explicitement par `user_id`, mais ce filtre applicatif ne remplace pas une politique RLS restrictive.

Conformément au périmètre validé, aucune politique Supabase n’a été modifiée dans ce lot. La sécurisation devra faire l’objet d’une autorisation explicite avant la livraison de persistance du lot 7. Le contrôle Supabase a aussi signalé d’autres tables sans RLS, hors du périmètre de ce lot, notamment `parcours_jeune`, `bilans_jeune` et `referentiel_user_custom`.

### 15.8 Vérifications locales

- nouvelle suite `tests/repasComposes.test.js` : 6 tests ;
- validation d’une composition et refus des modèles incomplets ;
- total calorique et QN moyen pondéré ;
- compatibilité du format JSONB avec la table existante ;
- compatibilité d’affichage des anciens modèles vides ou incomplets ;
- photographie indépendante des occurrences planifiées ;
- création des occurrences consommées avec un tag commun ;
- tests ciblés lot 2 + lot 3 : 12 réussis sur 12 ;
- suite complète : 91 tests réussis sur 91, 12 suites réussies sur 12 ;
- build Next.js : réussi, 36 pages générées ;
- `git diff --check` : sans erreur ;
- Supabase : aucune migration, aucune modification de schéma et aucune donnée de test créée ;
- commit et push du lot 3 : effectués sur la branche `liste-courses-generale-plan-chatgpt`, commit `eac84ede4c478ba8a153a02c0e5fc46151a92d6d`.

### 15.9 Étape suivante engagée

Lot 4 : générer la liste de courses générale depuis une période de repas réellement planifiés, en additionnant les ingrédients et en préservant les unités incompatibles sans double comptage.

## 16. Journal d’exécution — Lot 4

### 16.1 Périmètre effectivement livré

La page `pages/plan.js` intègre désormais un générateur général de liste de courses. L’utilisateur choisit une date de début et une date de fin ; la période proposée par défaut correspond à la semaine civile courante, du lundi au dimanche.

Le générateur interroge uniquement les lignes de `repas_planifies` appartenant à l’utilisateur connecté et comprises dans la période choisie. Il ne modifie pas la liste de courses propre à la reprise alimentaire.

Cette première version du lot 4 produit un aperçu calculé à partir du planning. Elle n’enregistre pas encore une liste indépendante et ne gère pas encore les états « acheté » ou « déjà disponible », réservés aux lots 6 et 7.

### 16.2 Structure Supabase vérifiée

La structure réelle de `repas_planifies` a été contrôlée dans le projet Supabase `Becomingtherealme`. Les colonnes nécessaires existent déjà : identifiant, utilisateur, date, moment, aliment, catégorie, quantité, calories et indicateur de combo.

Aucune table, migration ou donnée de test n’a été créée. La lecture applique explicitement les filtres `user_id`, date minimale et date maximale, puis trie les lignes par date.

Le point de sécurité déjà signalé au lot 3 reste inchangé : certaines politiques RLS de `repas_planifies` sont plus permissives que le cloisonnement attendu. Ce lot ne les modifie pas sans autorisation spécifique.

### 16.3 Calcul des articles

Le nouveau module `lib/listeCoursesGenerale.js` :

- valide la période demandée ;
- écarte les lignes hors période ;
- neutralise un éventuel doublon possédant le même identifiant Supabase ;
- rattache les aliments connus au nom canonique du référentiel fusionné ;
- analyse les quantités textuelles enregistrées dans le planning ;
- additionne les quantités compatibles avec le socle commun du lot 1 ;
- convertit les unités compatibles, notamment grammes/kilogrammes et millilitres/litres ;
- applique l’arrondi d’achat uniquement après l’addition ;
- conserve séparément les unités qui ne peuvent pas être additionnées sans hypothèse ;
- signale les anciennes lignes incomplètes au lieu d’inventer une quantité.

Les catégories restent dynamiques : le moteur conserve la catégorie issue du planning ou du référentiel et l’interface groupe les articles à partir des catégories réellement présentes.

### 16.4 Repas composés sans double comptage

Le générateur ne lit pas les modèles de `repas_complets`. Lorsqu’un repas composé a été planifié, le lot 3 a déjà créé une photographie de chacun de ses ingrédients dans `repas_planifies`.

La liste additionne donc ces lignes d’ingrédients comme les autres aliments. Le nom du modèle ne devient pas un article de courses et le contenu n’est pas compté une seconde fois.

### 16.5 Expérience utilisateur actuelle

Dans l’espace de planification, l’utilisateur :

1. choisit la période à couvrir ;
2. lance « Générer ma liste » ;
3. voit les achats regroupés par catégorie ;
4. voit les quantités totales arrondies pour l’achat ;
5. est averti lorsqu’une ancienne saisie ne contient pas assez d’informations pour calculer une quantité fiable.

Un message précise que le calcul repose sur les repas réellement planifiés et qu’aucune quantité manquante n’est estimée automatiquement.

### 16.6 Fichiers du lot 4

- `lib/listeCoursesGenerale.js` : moteur de période, normalisation et agrégation ;
- `components/ListeCoursesGeneralePlan.js` : sélection de période, lecture Supabase et affichage ;
- `pages/plan.js` : intégration dans la page existante ;
- `tests/listeCoursesGenerale.test.js` : couverture automatisée du moteur ;
- présent document : journal d’exécution et point de passation.

### 16.7 Vérifications réalisées

- nouvelle suite `tests/listeCoursesGenerale.test.js` : 8 tests réussis ;
- tests ciblés lots 1, 3 et 4 : 29 réussis sur 29 ;
- suite complète : 99 tests réussis sur 99, 13 suites réussies sur 13 ;
- build Next.js : réussi, 36 pages générées ;
- aucune migration Supabase et aucune donnée de test créée ;
- commit et push du lot 4 : effectués sur la branche `liste-courses-generale-plan-chatgpt`, commit `b027f6be813ab481664f3905df13da5ce6fbd713`.

### 16.8 Prochaine étape après validation Git

Lot 5 : afficher le budget calorique prévisionnel du plan, avec les calories par jour, le total et la moyenne de la période, puis l’écart par rapport à l’objectif calorique disponible lorsque celui-ci est connu.

## 17. Journal d’exécution — Lot 5A

### 17.1 Périmètre volontairement séparé de la restitution

Le lot 5 a été scindé en deux étapes afin de ne pas figer prématurément une interface longue ou peu lisible :

- lot 5A : structure fiable des données et des calculs ;
- lot 5B : choix des vues, densité d’affichage, code couleur et comportement mobile.

Le lot 5A n’ajoute donc pas encore de tableau, de couleur, de recette ni de téléchargement à l’écran. Il prépare une seule structure réutilisable pour les futures vues « Synthèse », « Repas », « Détails » et « Courses ».

### 17.2 Source de l’objectif calorique

L’audit du code a confirmé la coexistence de deux anciens calculs. La référence déjà utilisée par le suivi et présentée dans le routeur poids est `calculerProfilComplet(...).apport_calorique_cible`.

Le nouveau moteur réutilise exclusivement cette fonction. Il ne recalcule pas une cible concurrente à partir de `besoin_objectif` et ne remplace jamais un profil incomplet par une valeur arbitraire de 1 800 ou 1 900 kcal.

Le type d’objectif est déduit de la comparaison entre `poids_de_depart` et le poids `objectif`, puis transmis au routeur existant : perte, maintien ou prise.

### 17.3 Contrôle Supabase du profil

La table `profil` contient bien `user_id`, ainsi que les données nécessaires au routeur poids. Le chargeur du lot 5A :

- sélectionne explicitement le profil de l’utilisateur connecté avec `user_id` ;
- prend le profil le plus récent selon `created_at` ;
- ne retourne aucune cible si l’utilisateur n’est pas connecté ou si son profil est incomplet.

Le contrôle a aussi confirmé que les politiques actuelles de `profil` sont globalement permissives et que `user_id` reste nullable. Aucune politique, colonne ou donnée n’a été modifiée dans ce lot. Cette dette de sécurité doit être traitée séparément avec autorisation explicite.

### 17.4 Structure canonique produite

Le nouveau module `lib/budgetCaloriquePlan.js` produit, pour toute période valide :

- la liste inclusive de tous les jours, y compris ceux sans repas ;
- les repas regroupés par moment dans l’ordre petit-déjeuner, déjeuner, dîner, collation ;
- les ingrédients réellement présents dans `repas_planifies` ;
- pour chaque ingrédient : nom, catégorie, quantité, calories connues et origine éventuelle d’un repas composé ;
- les calories connues par repas et par journée ;
- le nombre d’éléments connus et le nombre total ;
- un statut de journée `vide`, `incomplet` ou `complet` ;
- le total et les deux moyennes de la période : sur tous les jours et sur les seuls jours renseignés ;
- l’objectif quotidien et l’objectif de la période lorsqu’ils sont disponibles.

Les lignes répétées avec le même identifiant Supabase sont neutralisées.

### 17.5 Règles de fiabilité

Le moteur additionne les calories connues mais n’invente jamais celles qui manquent. Un écart par rapport à l’objectif n’est calculé que si :

- la journée contient au moins un élément planifié ;
- toutes ses calories sont connues ;
- un objectif calorique personnalisé est disponible.

De même, l’écart global de la période reste absent tant qu’un jour est vide ou incomplet. Le total partiel reste disponible sous le nom explicite `total_kcal_connues` afin qu’une future interface ne le présente pas comme un total complet.

### 17.6 Repas composés et recettes

Les ingrédients photographiés par le lot 3 restent regroupables dans le même moment de repas et ne sont pas recomptés. Le moteur conserve l’indicateur `combo_valide`, mais n’invente pas le nom du modèle composé puisque l’occurrence planifiée ne contient actuellement pas cette référence.

Le lot 5A ne génère aucune recette. Une future vue « Recettes associées » ne pourra afficher que les recettes possédant une liaison réelle avec un repas planifié.

### 17.7 Vérifications réalisées

- nouvelle suite `tests/budgetCaloriquePlan.test.js` : 9 tests réussis ;
- période invalide ou inversée ;
- source commune du routeur poids ;
- filtre du profil par `user_id` ;
- regroupement par jour, moment et ingrédient ;
- journées vides, incomplètes et complètes ;
- absence de calorie ou d’écart inventé ;
- moyennes distinctes sur la période et sur les jours renseignés ;
- anti-doublon Supabase ;
- repas composés conservés sous forme d’ingrédients ;
- tests ciblés : 30 réussis sur 30 ;
- suite complète : 108 tests réussis sur 108, 14 suites réussies sur 14 ;
- build Next.js : réussi, 36 pages générées ;
- aucune migration Supabase et aucune donnée de test créée ;
- commit et push du lot 5A : `d321d633a5600cb81c4c8a06896786c46c8c376a`.

### 17.8 Étape réalisée après validation Git

Lot 5B : définir puis implémenter les vues de restitution à partir de cette structure unique, notamment les niveaux « Synthèse », « Repas », « Détails » et « Courses », avant d’ouvrir le chantier de téléchargement des formats choisis.

## 18. Journal d’exécution — Lot 5B

### 18.1 Parcours retenu

Le lot 5B conserve un seul bloc dans `pages/plan.js`, un seul choix de période et un seul bouton d’analyse. Il ne crée ni deuxième calendrier ni générateur concurrent.

Après avoir choisi la période, l’utilisateur obtient quatre niveaux de lecture dans le même espace :

- `Synthèse` : calories connues, moyenne des jours renseignés, objectif calorique quotidien et écart prévisionnel lorsque celui-ci est fiable ;
- `Repas` : journées repliables, moments de repas, aliments prévus et calories du repas ;
- `Détails` : quantités et calories de chaque ingrédient, avec signalement des informations manquantes et des composants issus d’un repas enregistré ;
- `Courses` : liste agrégée par catégorie selon le moteur du lot 4.

### 18.2 Source de données unique

Une seule lecture de `repas_planifies`, filtrée par `user_id` et par la période choisie, alimente simultanément :

- le moteur du budget calorique du lot 5A ;
- le moteur de liste de courses du lot 4 ;
- les vues repas et détails.

Le dernier profil appartenant à l’utilisateur est chargé en parallèle afin d’éviter une attente séquentielle inutile. Aucune table, politique Supabase ou donnée n’a été modifiée.

### 18.3 Lisibilité et fiabilité

Les journées sont repliables afin de limiter la longueur de la page sur mobile et ordinateur. Les journées sans repas restent visibles pour que l’utilisateur identifie immédiatement les trous du planning.

L’interface distingue explicitement :

- un total complet d’un total seulement partiel ;
- une journée vide, incomplète ou complète ;
- les calories connues des calories manquantes ;
- le plan prévisionnel des repas réellement consommés.

L’écart à l’objectif n’est pas affiché comme fiable lorsque la période est incomplète. Aucune recette ni aucun nom de repas composé n’est inventé.

### 18.4 Limites conservées volontairement

Le téléchargement, l’impression, le partage, les états pratiques d’achat et la persistance d’une liste générale restent hors du lot 5B. Ils relèvent des lots suivants et ne doivent pas être simulés par une donnée locale concurrente.

### 18.5 Vérifications réalisées

- copie Git complète recréée depuis le commit du lot 5A avant toute modification ;
- tests ciblés budget calorique et liste de courses : 17 réussis sur 17 ;
- suite complète : 108 tests réussis sur 108, 14 suites réussies sur 14 ;
- build Next.js : réussi, 36 pages générées ;
- page `/plan` compilée avec succès ;
- `git diff --check` sans erreur avant mise à jour de la passation ;
- aucune migration Supabase et aucune donnée de test créée ;
- commit et push du lot 5B : effectués sur la branche `liste-courses-generale-plan-chatgpt`, commit `8a2d798c9028eee16c34b34c7beaf08458c1dd22`.

### 18.6 Prochaine étape après validation Git

Lot 6 : rendre la liste utilisable pendant les courses avec des identifiants stables et les états `à acheter`, `acheté` et `déjà disponible`, puis définir le comportement de conservation lors d’une régénération.

## 19. Correction fonctionnelle après test utilisateur — planification et repas composés

### 19.1 Régression constatée

Le test utilisateur du 24 août 2026 a montré que l’interface livrée par les lots 2 et 3 ne respectait pas le parcours métier décrit au chapitre 2.2 :

- le bloc « Ajoute un repas planifié » appelait « repas » l’insertion d’une seule ligne d’aliment ;
- le champ avec `datalist` acceptait une valeur libre sans garantir sa liaison à une fiche du référentiel ;
- la recherche exacte ne rapprochait pas `oeuf` de la fiche canonique `Œuf`, laissant quantité, unité et calories vides ;
- l’unité et les calories restaient présentées comme des champs manuels alors qu’elles devaient découler du référentiel ;
- le repas composé était créé dans un second bloc après des insertions séparées dans le planning ;
- les erreurs de lecture de `repas_planifies` étaient ignorées et le rechargement n’était pas attendu, ce qui pouvait laisser le calendrier vide sans explication après une tentative d’enregistrement.

Cette séparation était contraire à l’attendu historique : construire une assiette multi-aliments dans une même saisie, puis décider éventuellement de la conserver comme modèle réutilisable.

### 19.2 Parcours corrigé

La page utilise désormais un seul espace « Planifier mon repas » :

1. l’utilisateur choisit une fois la date et le moment ;
2. il recherche une fiche du référentiel général ou de son référentiel personnel ;
3. la recherche neutralise accents, casse et ligatures, notamment `oeuf` / `Œuf` ;
4. la portion et l’unité de référence sont chargées automatiquement ;
5. les calories sont calculées automatiquement et recalculées si la quantité change ;
6. « Ajouter à mon repas » place l’aliment dans une assiette temporaire sans encore écrire une ligne isolée ;
7. l’utilisateur peut ajouter, modifier ou retirer plusieurs composants et consulter le total calorique ;
8. « Enregistrer dans mon planning » écrit toutes les lignes de l’assiette dans `repas_planifies` en une seule action ;
9. à partir de deux aliments, l’utilisateur peut aussi nommer et sauvegarder cette composition dans `repas_complets` ;
10. un modèle existant peut être chargé dans la même assiette, ajusté, planifié et mis à jour.

Un aliment absent n’est jamais enregistré comme texte libre. L’interface permet d’ouvrir le formulaire personnel existant, puis rafraîchit le référentiel fusionné.

### 19.3 Garantie d’enregistrement et d’affichage

L’insertion Supabase demande désormais le retour des lignes créées. Après confirmation :

- les lignes sont immédiatement intégrées au planning local affiché ;
- la lecture mensuelle Supabase est relancée et attendue ;
- l’assiette n’est vidée qu’après réussite de l’insertion ;
- l’erreur Supabase réelle reste affichée en cas d’échec ;
- si l’écriture est confirmée mais que le rechargement échoue, l’interface distingue explicitement ces deux résultats.

Le planning et la liste de courses conservent une ligne par ingrédient. `combo_valide` vaut `true` lorsque l’assiette contient plusieurs aliments et `false` pour un aliment seul. Aucun schéma Supabase, moteur de courses ou moteur de budget calorique n’est dupliqué.

### 19.4 Fichiers concernés

- `components/PlanificateurRepas.js` : nouvelle saisie unifiée et gestion intégrée des modèles ;
- `pages/plan.js` : suppression des deux blocs concurrents, rafraîchissement contrôlé et affichage immédiat ;
- `lib/planificationRepas.js` : recherche canonique, construction de l’assiette et insertion Supabase ;
- `tests/planificationRepas.test.js` : recherche `oeuf`, calcul, mono-aliment, multi-aliments et écriture simulée ;
- `tests/planificateurRepasInterface.test.js` : garde-fous sur le parcours rendu ;
- présent document : correction du statut Git du lot 5B et journal de la régression.

### 19.5 Vérifications

- aucune migration Supabase et aucune donnée distante créée pendant la correction ;
- 117 tests réussis sur 117, répartis dans 15 suites ;
- build Next.js de production réussi, avec 36 pages générées ;
- route locale de production `/plan` vérifiée en HTTP 200 ;
- le rendu contient « Planifier mon repas » et « Enregistrer dans mon planning » ;
- les anciens intitulés « Ajoute un repas planifié » et « Mes repas composés » ne sont plus rendus ;
- `git diff --check` sans erreur ;
- correction publiée sur la branche `liste-courses-generale-plan-chatgpt`, commit distant `a7ecda6899955f720ae750fe469a8441d30d95c6`.

## 20. Correction des suggestions après test utilisateur

### 20.1 Anomalie constatée

Dans l’espace « Planifier mon repas », les boutons de la section « Suggestions » ne donnaient aucun résultat visible sur mobile. Le clic copiait seulement le nom de l’aliment dans le champ de recherche situé plus haut dans la page. Il n’ajoutait pas l’aliment à l’assiette en cours.

### 20.2 Comportement corrigé

Un clic sur une suggestion :

- retrouve la fiche canonique dans le référentiel fusionné ;
- récupère sa portion, son unité, sa catégorie et ses calories ;
- ajoute immédiatement l’aliment à « Mon repas » ;
- confirme visuellement l’ajout ;
- refuse un doublon déjà présent dans l’assiette ;
- signale explicitement une ancienne suggestion qui n’existerait plus dans le référentiel.

Le contrôle a également révélé que le parseur commun ne reconnaissait pas correctement certains comptages contenant une ligature, notamment `1 œuf`. La lecture des portions reconnaît désormais toute lettre Unicode sans introduire de règle spécifique artificielle pour l’œuf.

### 20.3 Vérifications et publication

- 14 tests ciblés réussis sur 14 ;
- ajout de tests pour une suggestion valide, absente et déjà présente ;
- build Next.js réussi, 36 pages générées ;
- `git diff --check` sans erreur ;
- quatre fichiers publiés ;
- commit distant : `520c4360ababd252d44a3ed567706b0265b68a87`.

## 21. État des lieux différé — planification intelligente et go-to meals

### 21.1 Trois notions à ne pas confondre

| Notion | Définition retenue |
|---|---|
| Repas composé | Assiette nommée, sauvegardée et réutilisable en une action. |
| Combo équilibré | Assiette évaluée selon ses catégories, portions, fréquences et règles comportementales. |
| Go-to meal personnel | Composition qui semble régulièrement bien fonctionner pour l’utilisateur au regard de ses données réelles. |

Le booléen actuel `combo_valide` indique seulement qu’une occurrence planifiée contient plusieurs aliments. Il ne prouve ni son équilibre ni son effet favorable pour l’utilisateur.

### 21.2 Attendus historiques retrouvés

Les fichiers `docs/logique repas.md`, `docs/Fiche_descriptive_suivi.md`, `docs/FUSION_BILAN_HEBDO_ALIMENTAIRE.md` et `docs/SYSTEME_DEFIS_INTELLIGENTS_ET_EXPLOITATION_BDD.md` prévoyaient déjà :

- la reconnaissance des repas fréquemment saisis ;
- le préremplissage intelligent après répétition ;
- l’analyse des catégories, portions, fréquences et horaires ;
- la comparaison entre planification et consommation réelle ;
- l’exploitation de la satiété, du ressenti et des déclencheurs comportementaux ;
- la détection de compositions associées à moins d’extras, une meilleure satiété et un ressenti positif ;
- la proposition dans la planification d’une « assiette qui te réussit bien » ;
- des conseils destinés au prochain repas, limités et non culpabilisants ;
- l’identification de moments de fragilité, sans transformer une association statistique en lien de causalité.

### 21.3 Fondations réellement disponibles

Le code ou la structure historique contient déjà :

- les catégories, quantités et calories des aliments ;
- la date, le moment et l’heure des repas réels ;
- la satiété, le ressenti, les notes et certains motifs ;
- les indicateurs `a_reprendre`, `favori`, `regle_respectee` et `repas_planifie_respecte` dans la structure documentée de `repas_reels` ;
- des calculs mensuels sur les catégories, dépassements, horaires, satiété et humeur ;
- une suggestion rudimentaire dans `/plan`, fondée sur des aliments isolés ayant `satiete = oui` et `ressenti = satisfait`.

Cette suggestion actuelle ne reconstitue pas l’assiette complète et ne constitue donc pas encore un go-to meal.

### 21.4 Écart technique principal

Les aliments d’un repas réel sont enregistrés en lignes séparées sans identifiant d’occurrence d’assiette explicitement exploité par le code actuel. Les regrouper seulement par date, type et heure serait fragile. Une détection fiable des compositions récurrentes nécessitera un identifiant commun de repas réel avant de produire des recommandations.

### 21.5 Expérience cible à instruire

La planification intelligente devra pouvoir proposer, sans imposer :

1. un repas personnel régulièrement associé à une satiété respectée et un ressenti favorable ;
2. un ajustement fondé sur le bilan réel de S-1, par exemple une catégorie peu représentée ;
3. un point de vigilance lorsque plusieurs occurrences comparables sont associées à des portions dépassées, un horaire défavorable ou un ressenti difficile ;
4. une alternative issue du référentiel ou des repas déjà appréciés par l’utilisateur.

Les messages devront parler d’observations dans l’historique, jamais diagnostiquer une carence ni affirmer qu’un aliment a causé un comportement.

### 21.6 Position dans le plan d’action

Ce chantier est enregistré maintenant mais sera implémenté après le lot 9 du périmètre actuel. Il touche la saisie réelle, le modèle de données, les bilans et la recommandation comportementale ; l’insérer avant le lot 6 mélangerait ce moteur transversal avec la finalisation pratique de la liste de courses.

L’ordre retenu est donc :

1. lot 6 — utilisation pratique pendant les courses ;
2. lot 7 — persistance Supabase ;
3. lot 8 — préparation du contexte de cristallisation ;
4. lot 9 — validation finale et documentation ;
5. chantier suivant — regroupement fiable des repas réels, bilan S-1, combos équilibrés et go-to meals personnels.

## 22. Journal d’exécution — Lot 6 : utilisation pratique pendant les courses

### 22.1 Expérience intégrée à `/plan`

Le lot 6 ne crée ni nouvelle route ni deuxième liste. La vue `Courses` du bloc existant devient l'aperçu de la liste calculée depuis `repas_planifies`.

L'aperçu affiche :

- la période réellement analysée ;
- le nombre de produits et de catégories ;
- le nombre de lignes alimentaires planifiées ;
- le budget estimé de toute la liste lorsqu'il est renseigné ;
- l'accès au planificateur existant pour modifier les repas ;
- l'action `Commencer mes courses`.

Cette dernière action ouvre un mode plein écran dans la page courante. Le retour ferme ce mode et retrouve les quatre vues du plan sans recréer le générateur.

### 22.2 États pratiques des articles

Chaque article dispose désormais de trois états explicites :

- `À acheter` ;
- `Dans mon panier` ;
- `Déjà chez moi`.

Le mode courses propose un filtre pour chacun de ces états, deux actions distinctes sur chaque article et une progression globale. Les changements restent réversibles. Une barre mobile récapitule ce qui reste à acheter, ce qui est dans le panier et ce qui était déjà disponible.

### 22.3 Conservation lors d'un recalcul

Le moteur réutilise l'identifiant stable construit à partir du nom canonique, de la catégorie, de la préparation et de l'unité. Lorsque l'utilisateur demande `Mettre à jour mon plan et mes courses` :

- la nouvelle quantité issue du plan remplace l'ancienne ;
- un article identique conserve son état ;
- un nouvel article démarre dans `À acheter` ;
- un article retiré du plan disparaît de la liste recalculée.

Cette conservation est limitée à l'état React de la page actuelle. La persistance après rechargement et la récupération multi-appareils appartiennent au lot 7.

### 22.4 Montants globaux facultatifs du panier

Le prix n'est jamais requis pour utiliser la liste.

- un seul budget estimé peut être renseigné dans l'aperçu pour toute la liste ;
- un seul total réellement payé à la caisse peut être renseigné dans le mode courses ;
- les champs vides restent `null` et ne sont jamais convertis artificiellement en zéro ;
- l'écart correspond à la différence entre ces deux montants globaux ;
- aucun prix n'est demandé par aliment dans le lot 6.

Le prix détaillé par produit, le magasin, le type de commerce, l'origine et l'analyse historique coût–qualité restent volontairement différés et documentés dans `AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md`.

### 22.5 Fichiers du lot 6

- `components/ListeCoursesGeneralePlan.js` : aperçu, mode courses, filtres, actions, progression et prix facultatifs ;
- `lib/listeCoursesGenerale.js` : initialisation, modification, conservation et synthèse du suivi pratique ;
- `pages/plan.js` : point de retour vers le véritable planificateur ;
- `tests/listeCoursesGenerale.test.js` : tests métier du suivi pratique ;
- `tests/listeCoursesGeneraleInterface.test.js` : garde-fous sur l'expérience affichée ;
- présent document : passation du lot 6.

### 22.6 Vérifications réalisées

- 17 tests ciblés réussis sur 17 ;
- suite complète : 128 tests réussis sur 128, 16 suites réussies sur 16 ;
- build Next.js de production réussi, 36 pages générées ;
- route `/plan` compilée ;
- `git diff --check` sans erreur avant finalisation ;
- aucune migration Supabase ni donnée distante créée ;
- implémentation non commitée et non poussée à ce point d'arrêt.

### 22.7 Prochaine étape après validation Git

Lot 7 : définir puis implémenter la persistance Supabase de la liste générale, de ses états et de ses prix facultatifs afin de permettre la reprise après rechargement et sur plusieurs appareils, sans dupliquer `repas_planifies` ni le moteur de génération.

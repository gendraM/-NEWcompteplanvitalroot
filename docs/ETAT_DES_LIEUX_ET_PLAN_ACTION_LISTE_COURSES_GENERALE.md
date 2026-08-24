# État des lieux et plan d’action — Liste de courses générale et planification

**Date :** 24 août 2026  
**Branche de travail :** liste-courses-generale-plan-chatgpt  
**Branche source :** finalisation-reprise-jeune-alimentaire-chatgpt  
**Statut :** lots 0 à 2 poussés ; lot 3 implémenté localement, testé et en attente de validation Git

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
- commit et push du lot 3 : en attente d’autorisation explicite.

### 15.9 Prochaine étape après validation Git

Lot 4 : générer la liste de courses générale depuis une période de repas réellement planifiés, en additionnant les ingrédients et en préservant les unités incompatibles sans double comptage.

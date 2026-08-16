# État des lieux — Reprise alimentaire après jeûne

**Date : 16 août 2026**  
**Branche : `finalisation-reprise-jeune-alimentaire-chatgpt`**  
**Statut : audit reconstitué et vérifié sur le code de la branche**

## 1. Objet du document

Ce document compare :

- le comportement métier attendu après la fin du jeûne ;
- les cinq phases prévues pour la reprise alimentaire ;
- l'expérience réellement proposée par le code actuel ;
- les données enregistrées dans Supabase et celles qui restent locales ;
- les écarts fonctionnels et techniques restant à traiter ;
- le plan d'action de mise en conformité.

La cristallisation, les portes de constance et leur fonctionnement interne sont hors périmètre. Leur démarrage après la reprise doit seulement rester intact.

## 2. Décision métier structurante

La reprise alimentaire est un outil d'observation, d'accompagnement et de mesure. Ce n'est pas un système de sanction.

En conséquence :

- aucun nombre minimal de repas ne doit être imposé ;
- un repas non conforme doit pouvoir être enregistré ;
- une journée vide ou partiellement renseignée ne doit pas empêcher la suite du parcours ;
- l'utilisatrice doit pouvoir compléter une journée passée ;
- les écarts servent à enrichir le bilan, pas à bloquer l'utilisatrice ;
- une absence de donnée doit être distinguée d'un écart alimentaire ;
- les bilans de plusieurs reprises devront, à terme, pouvoir être comparés pour montrer les améliorations, les stabilités et les difficultés persistantes.

Les anciens documents qui demandaient de bloquer la validation d'une journée en cas d'écart ou de repas manquant ne constituent donc plus la règle métier retenue.

## 3. Comportement normalement attendu

### 3.1 Fin du jeûne et création de la reprise

À la fin du jeûne :

1. le bilan du jeûne est produit ;
2. les informations utiles sont transmises à la reprise : utilisateur, parcours global, durée réelle, dates, poids disponibles, bilan et difficultés ;
3. le programme de reprise est généré automatiquement ;
4. la reprise commence le lendemain de la fin du jeûne ;
5. sa durée est calculée selon la règle : `durée du jeûne × 2` ;
6. le programme est réparti entre cinq phases ;
7. l'utilisatrice consulte un aperçu, les premiers jours et la liste de courses ;
8. elle valide le programme avant de commencer.

Exemples :

| Jeûne | Reprise |
|---:|---:|
| 3 jours | 6 jours |
| 5 jours | 10 jours |
| 7 jours | 14 jours |
| 10 jours | 20 jours |

### 3.2 Les cinq phases de référence

Les phases restent identiques quelle que soit la durée du jeûne. Seules leur durée, les quantités et la vitesse de progression s'adaptent.

| Phase | Part cible | Définition métier de référence |
|---|---:|---|
| Phase 1 | 10 % | Liquides |
| Phase 2 | 15 % | Semi-liquides et premières huiles |
| Phase 3 | 25 % | Solides légers et protéines végétales |
| Phase 4 | 20 % | Protéines animales légères et crudités douces |
| Phase 5 | 30 % | Alimentation normale contrôlée |

#### Phase 1 — Liquides

Objectif : réactiver doucement le système digestif et réhydrater sans surcharge.

Contenu attendu : eau, bouillons filtrés, jus très dilués, préparations liquides et, au jour prévu, purées très lisses.

#### Phase 2 — Semi-liquides et premières huiles

Objectif : réintroduire progressivement les fibres douces et de petites quantités de matières grasses.

Contenu attendu : soupes, purées, légumes très cuits, compotes, textures semi-liquides et premières huiles.

#### Phase 3 — Solides légers et protéines végétales

Objectif : retrouver des textures plus consistantes et soutenir la reconstruction du corps.

Contenu attendu : légumes cuits, légumineuses digestes, protéines végétales, lipides contrôlés et petites portions solides.

#### Phase 4 — Protéines animales légères et crudités douces

Objectif : réintroduire progressivement une alimentation plus complète.

Contenu attendu selon la fiche métier principale : œufs, poisson blanc, poulet ou dinde, féculents doux, petites crudités digestes et matières grasses contrôlées.

**Contradiction documentaire à arbitrer :** le générateur actuel nomme cette phase « Féculents doux » et ses messages la présentent principalement comme la réintroduction des glucides. La fiche métier détaillée la définit plus largement comme la réintroduction des protéines animales légères et des crudités douces. Aucun changement de contenu ne doit être fait avant arbitrage explicite.

#### Phase 5 — Alimentation normale contrôlée

Objectif : retrouver progressivement une alimentation diversifiée et stable sans retour brutal aux habitudes antérieures.

Contenu attendu : davantage de familles d'aliments, repas plus complets, portions encore observées et réintroduction progressive des aliments complexes.

### 3.3 Expérience quotidienne attendue

Chaque jour, l'utilisatrice doit pouvoir :

1. consulter la phase, les aliments recommandés, les portions, les horaires indicatifs et le conseil du jour ;
2. enregistrer librement zéro, un ou plusieurs repas ;
3. recevoir une observation sur la phase, l'horaire, la quantité et la qualité nutritionnelle ;
4. conserver le repas même lorsqu'un ou plusieurs critères ne correspondent pas aux recommandations ;
5. indiquer ses notes et ressentis ;
6. passer à la suite sans être bloquée par une journée vide ou un écart ;
7. revenir sur une journée passée pour la compléter.

Pour une saisie rétrospective, les données suivantes doivent être distinguées :

- le jour de reprise concerné ;
- la date réelle du repas ;
- la date et l'heure de saisie ;
- l'indication que la saisie a été faite après coup.

### 3.4 Fin de la reprise attendue

À la fin de la période prévue :

1. un bilan est produit à partir des données disponibles ;
2. il distingue les jours renseignés, partiels et non renseignés ;
3. il analyse les repas observés, leur conformité, les difficultés, les aliments problématiques et le poids si disponible ;
4. l'absence de saisie ne devient pas une non-conformité ;
5. la reprise passe au statut `termine` ;
6. le parcours central passe à la consolidation ;
7. la cristallisation peut ensuite démarrer, sans modification de son fonctionnement interne dans ce chantier.

À terme, le bilan doit devenir comparable aux bilans des reprises précédentes, uniquement sur des indicateurs disposant de données comparables.

## 4. Expérience réellement proposée par le code actuel

### 4.1 Génération et démarrage

Le code actuel :

- applique bien la formule `jeûne × 2` ;
- place le début de la reprise au lendemain de la fin du jeûne ;
- calcule la date de fin ;
- répartit le programme en cinq phases avec un minimum d'un jour par phase lorsque la durée le permet ;
- génère les journées, leurs dates, leurs aliments autorisés et leurs messages ;
- génère une liste de courses à partir des sept premiers jours ;
- enregistre le programme et ses journées dans Supabase ;
- relie la reprise au parcours de jeûne par `parcours_id` ;
- permet de valider le programme puis de le passer en cours.

### 4.2 Consultation quotidienne

L'utilisatrice peut actuellement voir :

- le programme et ses cinq phases ;
- le jour sélectionné et sa date ;
- la phase correspondante ;
- le message contextuel ;
- les aliments autorisés ;
- les repas déjà enregistrés localement ;
- les critères calculés ;
- la progression et le bouton de validation de journée.

Les dates futures sont bloquées, mais les journées passées restent consultables.

### 4.3 Saisie d'un repas

Le composant `SaisieRepriseJeune.js` permet de renseigner :

- le type de repas ;
- une date affichée dans le formulaire ;
- une heure ;
- l'aliment et sa catégorie ;
- la quantité ;
- les calories ;
- une note ;
- un ressenti.

Il évalue quatre dimensions :

- phase ;
- horaire ;
- quantité ;
- qualité nutritionnelle.

Un repas comportant un écart n'est pas refusé : il est conservé avec un message « enregistré avec réserves ». Cette orientation correspond à la décision métier non bloquante.

### 4.4 Validation et clôture

La page permet de valider une journée dès lors que sa date n'est pas future. Le texte de l'interface parle encore de deux repas minimum, mais le bouton n'applique pas cette condition.

Lorsque le dernier jour est validé, la page :

- calcule un bilan à partir des données locales ;
- archive localement la reprise ;
- passe `reprises_alimentaires` à `termine` dans Supabase ;
- appelle `terminerPhaseReprise` ;
- transmet le bilan dans la progression du parcours ;
- fait passer le parcours central à la consolidation.

La transition existante vers la consolidation/cristallisation est donc conservée.

## 5. Cartographie réelle des données

### 5.1 Données synchronisées avec Supabase

Sont effectivement enregistrés ou mis à jour dans Supabase :

- le programme dans `reprises_alimentaires` ;
- sa liaison au parcours global ;
- les dates et durées de la reprise ;
- les phases et la liste de courses ;
- les journées dans `reprises_jours_valides` ;
- les aliments autorisés et messages de chaque journée ;
- la validation des journées lorsqu'elle passe par l'API dédiée ;
- le statut final de la reprise ;
- la transition du parcours vers la consolidation ;
- le bilan transmis dans la progression du parcours lors de la clôture.

### 5.2 Données encore exclusivement locales ou incomplètement synchronisées

Restent principalement dans le `localStorage` :

- les repas réellement consommés (`reprises_repas_consommes`) ;
- le détail des quatre critères par repas ;
- les calories, notes et ressentis ;
- l'historique consolidé des reprises (`historiqueReprises`) ;
- certaines difficultés déclarées ;
- les données et outils du mode test ;
- certains paramètres de notification.

Conséquence : sur un autre appareil, l'utilisatrice peut retrouver le programme principal et les journées stockées en base, mais pas l'intégralité de ses repas et observations détaillées.

## 6. Écarts confirmés

### 6.1 Saisie rétrospective imparfaite

Le formulaire possède un état `date`, mais le payload sauvegardé remplace cette valeur par la date du jour calculée avec `new Date()`. Ainsi, au jour 5, un repas ajouté pour le jour 3 peut porter :

- `jour_reprise = 3` ;
- mais `date = date du jour 5`.

La date de saisie et la date du repas ne sont pas séparées. L'heure choisie n'est pas non plus incluse explicitement dans le payload sauvegardé.

### 6.2 Repas non synchronisés avec Supabase

Les repas détaillés sont ajoutés uniquement à `reprises_repas_consommes` dans le `localStorage`. Le suivi n'est donc pas réellement multi-appareils.

### 6.3 Message des deux repas contradictoire

L'interface annonce qu'il faut au moins deux repas pour valider une journée, mais le bouton ne l'impose pas. La règle métier retenue étant non bloquante, le texte doit devenir descriptif, par exemple « 1 repas renseigné aujourd'hui », sans promesse de blocage.

### 6.4 Restrictions propres à un jour non contrôlées

Le contrôle compare essentiellement la phase minimale de l'aliment à la phase courante. Il ne contrôle pas toujours une restriction plus fine à l'intérieur d'une phase, par exemple une purée autorisée à partir du deuxième jour seulement.

Le repas doit rester enregistrable, mais l'observation retournée doit être exacte pour le jour concerné.

### 6.5 Navigation par pastilles incohérente

Le calcul d'index des boutons de jours soustrait un décalage lié au nombre de jours affichés. Selon la fenêtre affichée, cela peut sélectionner un mauvais index, voire un index négatif.

### 6.6 Progression fondée en partie sur le calendrier

Une phase ou une journée peut apparaître comme avancée parce que sa date est passée, même si aucune information n'a été saisie. L'interface doit distinguer :

- position temporelle dans le programme ;
- niveau de renseignement ;
- validation ou clôture déclarée.

### 6.7 Clôture déclenchée par le dernier jour

La clôture est déclenchée lorsque le numéro du jour validé correspond à la durée totale. Les journées précédentes peuvent être vides ou non validées.

Dans la logique métier retenue, cela ne doit pas bloquer la clôture. En revanche, le bilan doit refléter honnêtement la couverture des données et ne pas transformer les jours absents en échec.

### 6.8 Bilan actuel biaisé par les absences de saisie

Le taux de validation utilise le nombre de jours validés rapporté à la durée totale et le taux de conformité utilise les repas locaux. Une reprise peu renseignée peut donc recevoir un faible taux sans distinguer manque de données et réel écart.

### 6.9 Contradiction sur la phase 4

La fiche métier principale et le générateur actuel ne donnent pas le même périmètre à la phase 4. Cette contradiction doit être arbitrée avant toute harmonisation des aliments, recettes, conseils et notifications.

### 6.10 Recettes et notifications partiellement intégrées

Plusieurs composants ou contenus existent, mais tous les boutons, mappings ou notifications ne sont pas reliés de manière cohérente à la page principale. Les notifications affichées dans l'application ne sont pas toutes de véritables notifications système.

## 7. Exemple utilisateur cible pour le lot C

Une utilisatrice est au jour 5. Elle n'a rien renseigné au jour 3.

Comportement attendu :

1. elle ouvre le jour 3 ;
2. elle saisit le repas réellement consommé ce jour-là ;
3. le repas est rattaché au jour 3 et à sa date réelle ;
4. la date de saisie au jour 5 est conservée séparément ;
5. le repas porte l'indication `saisie_retroactive` ;
6. les indicateurs du jour 3 sont recalculés ;
7. elle revient au jour 5 sans blocage.

Le bilan doit alors distinguer un jour 3 renseigné après coup d'un jour jamais renseigné.

## 8. Plan d'action de mise en conformité

### Lot A — Arbitrages métier

À décider avant modification des contenus :

- définition officielle de la phase 4 ;
- vocabulaire de l'interface : recommandations, observations, écarts et couverture ;
- définition exacte des indicateurs comparables entre deux reprises ;
- traitement des saisies rétrospectives dans les statistiques.

### Lot B — Compatibilité Supabase de la phase 5 — TERMINÉ

Objectif : autoriser `phase5` dans la contrainte de `reprises_jours_valides.phase`.

**Validation du 16 août 2026 :** la migration a été exécutée dans Supabase et la contrainte vérifiée. Elle accepte désormais :

- `phase1` ;
- `phase2` ;
- `phase3` ;
- `phase4` ;
- `phase5`.

La modification n'a supprimé ni transformé aucune donnée. Un test fonctionnel ultérieur devra confirmer qu'un programme réel insère et recharge effectivement ses jours de phase 5.

### Lot C — Fiabiliser le suivi quotidien non bloquant — IMPLÉMENTÉ

Objectifs :

1. corriger la navigation entre les journées ;
2. permettre explicitement l'accès aux journées passées ;
3. utiliser la date de la journée sélectionnée comme date du repas par défaut ;
4. conserver séparément `date_repas` et `created_at` ;
5. conserver l'heure choisie ;
6. ajouter l'indicateur de saisie rétrospective ;
7. remplacer le message des deux repas minimum par un compteur descriptif ;
8. afficher uniquement le nombre factuel de repas enregistrés pour chaque journée ;
9. maintenir l'absence de blocage pour continuer ou clôturer.

Critères de réussite :

- un repas saisi au jour 5 pour le jour 3 est analysé comme un repas du jour 3 ;
- sa création au jour 5 reste traçable ;
- une journée vide ne vaut pas non-conformité ;
- aucun repas ni écart ne bloque le parcours ;
- les indicateurs sont recalculés après une saisie rétrospective.

**Implémentation réalisée :**

- navigation par journées corrigée ;
- date sélectionnée transmise à la saisie du repas ;
- date du repas, heure du repas et date de création conservées séparément ;
- saisie après coup identifiée techniquement sans ajouter de statut visible inutile ;
- message des deux repas minimum remplacé par le nombre factuel de repas enregistrés ;
- journées sans repas exclues de l'évaluation de conformité ;
- bilan complété avec le nombre de journées comportant des repas et un message précisant que les journées sans information ne sont pas des écarts.

La synchronisation Supabase des repas reste volontairement réservée au lot E.

### Lot D — Harmoniser les règles et contenus des cinq phases

Après arbitrage du lot A :

- aligner référentiel, générateur, messages, horaires, portions et conseils ;
- contrôler les recommandations propres à un jour précis ;
- conserver les repas hors recommandation en produisant une observation pédagogique ;
- relier correctement toutes les recettes et notifications utiles.

### Lot E — Synchroniser les repas et observations

Objectifs :

- stocker en base les repas de reprise et leur rattachement au programme et à la journée ;
- synchroniser date du repas, heure, date de saisie, quantité, calories, note, ressenti et résultats des critères ;
- recharger les données sur un autre appareil ;
- conserver un fallback local sans créer de doublons.

### Lot F — Revoir progression et historique

Objectifs :

- séparer progression temporelle et couverture de saisie ;
- synchroniser l'historique des reprises ;
- éviter les doubles archivages ;
- rendre une reprise passée consultable sur plusieurs appareils.

### Lot G — Bilan et comparaison dans le temps

Objectifs :

- calculer la couverture des données ;
- exclure les données absentes des calculs qui exigent une observation ;
- distinguer « non renseigné » de « recommandation non suivie » ;
- produire les indicateurs de repas, tolérance, difficultés, aliments et poids ;
- préparer la comparaison avec les bilans antérieurs ;
- ne présenter une évolution que si les deux périodes contiennent des données comparables.

Exemple futur : « Par rapport à ta précédente reprise, davantage de journées ont été renseignées, les aliments ont été réintroduits plus progressivement et moins d'inconforts digestifs ont été signalés. »

### Lot H — Tests de bout en bout

Scénarios à vérifier :

- génération après un jeûne de plusieurs durées ;
- insertion et rechargement des cinq phases ;
- saisie conforme et saisie avec écarts ;
- zéro, un ou plusieurs repas dans une journée ;
- journée passée complétée après coup ;
- navigation correcte sur mobile et ordinateur ;
- reconnexion sur un autre appareil ;
- bilan avec journées non renseignées ;
- clôture et passage vers la consolidation ;
- absence de doublons après reconnexion ou resynchronisation ;
- tests automatisés et build complet.

## 9. Ordre recommandé à partir du point d'arrêt

1. Lot B : terminé et vérifié dans Supabase.
2. Lot C : implémenté, à confirmer lors du test fonctionnel complet.
3. Lot A : arbitrage de la phase 4 avant toute modification de contenu.
4. Lot D : alignement des cinq phases.
5. Lot E : synchronisation multi-appareils des repas.
6. Lots F et G : historique, progression, bilan et comparaison.
7. Lot H : validation complète du parcours réel.

## 10. Point d'arrêt reconstitué

Au 16 août 2026 :

- la branche dédiée existe sur GitHub ;
- le chaînage issu de `finalisation-jeune-chatgpt` est présent ;
- le lot B est validé dans Supabase ;
- la logique métier non bloquante est actée ;
- la saisie rétrospective attendue est définie ;
- le lot C est implémenté dans le code et reste à confirmer en test fonctionnel ;
- aucune modification du fonctionnement interne de la cristallisation n'est prévue dans ce chantier.

La prochaine action est la vérification technique du lot C, puis l'arbitrage métier du lot A avant toute modification du contenu des phases.

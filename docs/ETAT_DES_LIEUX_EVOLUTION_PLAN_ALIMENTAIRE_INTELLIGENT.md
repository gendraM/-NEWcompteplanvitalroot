# État des lieux — évolution — Plan alimentaire intelligent

## Statut

Le socle technique et fonctionnel mono/multi est terminé. **Lot 1, sous-lots 2.1 à 2.4, alignement par occurrence, scores, ergonomie du planning et raccord des repas repères sont validés** sur la branche `plan-alimentaire-intelligent-chatgpt`. Le test authentifié mobile du repas repère a été validé le 9 septembre 2026.

Cet état des lieux constitue la source de vérité du chantier : faire évoluer la saisie réelle des repas afin de reconnaître fiablement une occurrence de repas complète, sans supprimer le détail alimentaire ni casser les comportements existants.

### Avancement Lot 1 — 31/08/2026

- `repas_reels.occurrence_repas_id UUID` ajouté en base, nullable pour ne pas réécrire artificiellement l'historique.
- Unicité de `semaines_validees` corrigée en `user_id + weekStart`.
- RLS propriétaire activé sur `repas_reels`, `repas_planifies`, `repas_complets` et `semaines_validees`.
- `DEFAULT gen_random_uuid()` actif pour les nouvelles saisies simples.
- Les repas composés génèrent explicitement un UUID par consommation et le partagent entre toutes les lignes de l'assiette.
- Aucun regroupement rétroactif des anciennes lignes.
- GitHub Actions : **18/18 suites, 153/153 tests** sur `0a9d404`.
- Build Next.js/Vercel validé.

### Avancement sous-lot 2.1 — 31/08/2026

- Moteur de regroupement externalisé dans `lib/repasEnCours.js`.
- `construirePayloadRepasEnCours` refuse un repas vide, accepte un ou plusieurs aliments, génère ou réutilise un `occurrence_repas_id` unique et le partage entre les lignes.
- `RepasBloc.js` n'a pas été modifié et est traité comme **composant sensible à protéger**.
- Commit fonctionnel : `020b3a9`. Correctifs de tests : `4874f9a`, puis `4b9b1b5`.
- GitHub Actions sur `4b9b1b5280260117bfa5e45e42066465b8469d73` : **19/19 suites, 158/158 tests**.
- `tests/repasEnCours.test.js` : **5/5 PASS**.
- Vercel `dpl_Gc7m5GKEVag7njXwKfKXU7Rx3vQQ` : **READY**, build Next.js réussi en 22 s.
- Le moteur n'est pas encore raccordé à l'interface ; aucune UX multi-aliments n'est déclarée fonctionnelle à ce stade.

### Audit sous-lot 2.2 — 31/08/2026

L'audit a été réalisé sans modification fonctionnelle de `RepasBloc`, `suivi.js` ou `SaisieRepasCompose`.

#### Trois chemins d'écriture confirmés

1. **Saisie normale** : `RepasBloc` prépare une ligne puis appelle `onSave`; `suivi.js` reçoit cette ligne dans `handleSaveRepas` et l'insère dans `repas_reels`.
2. **Repas déclaré conforme au planning** : `RepasBloc` contourne `onSave` et effectue lui-même une insertion directe dans `repas_reels`.
3. **Repas composé réutilisé** : `SaisieRepasCompose` construit plusieurs lignes puis les insère directement dans `repas_reels`.

Cette fragmentation est le principal risque du raccordement : ajouter une quatrième persistance indépendante créerait davantage de divergence entre les règles métier.

#### Point de raccordement recommandé

`suivi.js` est retenu comme **orchestrateur recommandé de la persistance du repas en cours**. Son `handleSaveRepas` constitue déjà le point de sortie du parcours normal et peut évoluer progressivement pour accepter soit une ligne unique, soit un tableau de lignes partageant la même occurrence.

Architecture cible :

`RepasBloc` → contrat étroit de sortie → orchestration `suivi.js` → `lib/repasEnCours.js` → insertion commune `repas_reels`.

Le rôle de chaque couche doit rester limité :

- `RepasBloc` : saisie et règles métier existantes (référentiel, catégorie, calories, portion, extra, fast-food, plan, satiété, ressenti, signaux, note) ;
- `lib/repasEnCours.js` : regroupement pur des aliments sous une occurrence commune ;
- `suivi.js` : orchestration et persistance commune ;
- Supabase : stockage des lignes détaillées avec `occurrence_repas_id` commun.

#### Protection de `RepasBloc`

Le sous-lot 2.2 confirme qu'il ne faut pas intégrer un gros état multi-aliments directement dans `RepasBloc` ni dupliquer ses règles dans un nouveau composant.

Une modification minimale de `RepasBloc` pourra devenir nécessaire pour exposer un contrat/callback permettant d'ajouter un aliment validé au repas en cours. Elle ne devra être faite qu'après préparation de tests de non-régression ciblés et devra rester limitée à ce point d'extension.

#### Risques préexistants à ne pas mélanger au premier raccordement

- `SaisieRepasCompose` contourne encore les validations de `RepasBloc` et possède sa propre insertion Supabase.
- La lecture des repas planifiés dans `suivi.js` utilise actuellement une seule valeur par type de repas : plusieurs lignes du même type s'écrasent, ce qui empêche de représenter correctement un plan composé.
- Le chemin « conforme au planning » de `RepasBloc` insère directement dans Supabase et réinitialise ses champs indépendamment du résultat final de l'insertion.
- Le rafraîchissement du suivi après insertion n'est pas uniformisé.

Ces anomalies doivent être traitées progressivement après sécurisation du chemin commun ; elles ne doivent pas être corrigées silencieusement dans le premier raccordement.

---

## 1. Modèle fonctionnel cible

Le système distingue trois niveaux :

| Niveau | Signification |
|---|---|
| Occurrence de repas | Aliments réellement consommés ensemble |
| Repas composé enregistré | Assiette volontairement nommée et sauvegardée pour être réutilisée |
| Go-to meal | Assiette complète régulièrement associée à de bons résultats |

Le regroupement en occurrence est automatique. L'enregistrement comme modèle reste facultatif. La qualification en go-to meal intervient ultérieurement à partir de l'historique.

Exemple : poulet + haricots verts + patate douce = trois lignes alimentaires conservant leurs quantités, catégories et calories, mais un seul `occurrence_repas_id`. Le repas compte comme une occurrence pour la satiété, le ressenti et les statistiques portant sur le nombre de repas.

---

## 2. Comportements existants à préserver

`RepasBloc` concentre actuellement :

- recherche dans le référentiel général et personnel ;
- catégorie automatique ;
- calcul des calories ;
- validation des portions ;
- conformité au repas planifié ;
- extras et budget ;
- fast-food et délai de 45 jours ;
- heure ;
- satiété et raison du dépassement ;
- ressenti et signaux ;
- note ;
- règles de préparation au jeûne ;
- messages liés à la persistance.

Les modes reprise alimentaire et défi alimentaire restent hors du périmètre du raccordement multi-aliments.

---

## 3. UX cible du repas en cours

L'interface doit à terme conserver la saisie actuelle et proposer :

- `+ Ajouter un autre aliment` ;
- `Enregistrer ce repas`.

### Un aliment

- parcours aussi simple qu'aujourd'hui ;
- une ligne ;
- un identifiant d'occurrence ;
- aucun nom d'assiette demandé ;
- aucun modèle composé créé automatiquement.

### Plusieurs aliments

- chaque aliment validé rejoint « Mon repas en cours » ;
- les lignes partagent un `occurrence_repas_id` ;
- une seule finalisation logique ;
- satiété, ressenti et note associés au repas complet ;
- le repas compte une seule fois dans les statistiques portant sur les occurrences.

À partir de deux aliments, une option facultative pourra permettre d'enregistrer aussi l'assiette comme modèle réutilisable. Plusieurs aliments dans une occurrence ne signifient pas automatiquement repas équilibré, go-to meal ou recommandation.

---

## 4. Anomalies préexistantes confirmées

### 4.1 Plan composé mal relu

`suivi.js` construit actuellement le plan avec une seule entrée par type. Si plusieurs aliments sont planifiés pour le même déjeuner, la dernière ligne remplace les précédentes. Cette lecture devra être corrigée avant la comparaison fiable d'une occurrence réelle avec un plan composé.

### 4.2 Repas composé réutilisé hors chemin normal

`SaisieRepasCompose` insère directement plusieurs lignes dans Supabase. Il ne bénéficie donc pas automatiquement de toutes les validations et du rafraîchissement du parcours normal. À terme, un repas composé réutilisé devra alimenter le même repas en cours et emprunter la même finalisation commune.

### 4.3 Persistance conforme au planning séparée

Le chemin `repasConforme` de `RepasBloc` possède sa propre insertion Supabase. Sa convergence vers l'orchestrateur commun est souhaitable, mais ne doit pas être faite dans le premier changement sans tests spécifiques.

### 4.4 Rafraîchissement incomplet

Les calories et la liste des repas ne sont pas uniformément rechargées après tous les chemins d'insertion.

---

## 5. Règles de données

- Ne jamais supprimer le détail alimentaire.
- Ne jamais regrouper arbitrairement les anciennes lignes.
- Une occurrence nouvelle doit avoir un `occurrence_repas_id` fiable.
- Les aliments consommés ensemble partagent cet ID.
- Le `tag` d'un modèle composé reste distinct de l'identifiant d'occurrence.
- QN n'est utilisé que lorsqu'il est réellement connu.
- `favori` reste distinct d'un go-to meal détecté.
- `a_reprendre` doit correspondre à une validation explicite d'une proposition personnelle.

---

## 6. Cible du moteur intelligent

Une fois les occurrences fiables, les calculs devront reconstruire les repas complets avant analyse.

La synthèse S-1 devra pouvoir exploiter catégories, calories, QN connu, satiété, ressenti, extras et régularité.

Un candidat go-to meal ne doit pas être détecté sur un aliment isolé ou une occurrence unique. Règle retenue : au moins trois occurrences comparables sur quinze jours et plusieurs résultats positifs.

Les suggestions dans `/plan` devront présenter la raison de la suggestion, la composition complète, les catégories, portions/calories et une action pour ajouter l'assiette complète au planning.

---

## 7. Plan d'action consolidé

1. **Lot 1 — VALIDÉ** : occurrence UUID, unicité hebdomadaire et RLS propriétaire.
2. **Sous-lot 2.1 — VALIDÉ TECHNIQUEMENT** : moteur `lib/repasEnCours.js` externe à `RepasBloc`.
3. **Sous-lot 2.2 — AUDIT TERMINÉ** : `suivi.js` retenu comme orchestrateur recommandé ; trois chemins d'écriture et risques documentés.
4. **Sous-lot 2.3 — VALIDÉ TECHNIQUEMENT** : le contrat de persistance de `suivi.js` accepte une ligne ou plusieurs lignes sans modifier l'UX ni `RepasBloc` ; raccord publié dans le commit `8372c91`.
5. **Tests du sous-lot 2.3 — VALIDÉS** : tests ciblés mono/multi 9/9, suite Jest 162/162 et build Next.js réussis.
6. **Sous-lot 2.4 — VALIDÉ ET CLÔTURÉ** : `RepasBloc` alimente « Mon repas en cours » par un callback étroit ; le parcours mono historique reste disponible ; le test utilisateur authentifié du 1er septembre 2026 est concluant.
7. **Finalisation multi-aliments — VALIDÉE** : `suivi.js` utilise le moteur `repasEnCours`, une occurrence commune et le handler de persistance du Lot 2.3 ; l'assiette nommée reste facultative et sa réutilisation a été vérifiée.
8. **VALIDÉ** : faire converger le chemin « conforme au planning » vers la persistance commune, publié dans `6557d81`.
9. **ÉTAPE 9A VALIDÉE** : conserver et afficher toutes les lignes d'un repas planifié composé, publié dans `0267735`.
10. **ÉTAPE 9B — SOCLE VALIDÉ TECHNIQUEMENT** : reconstruire la dernière occurrence réelle et afficher automatiquement « Repas aligné », « Repas ajusté », « Repas spontané » ou « Repas libre », sans modifier le schéma Supabase. Le test utilisateur du 2 septembre 2026 a toutefois révélé que `SaisieRepasCompose` contournait encore ce socle.
11. **RACCORDEMENT DE `SaisieRepasCompose` VALIDÉ FONCTIONNELLEMENT** : les occurrences d'un repas composé réutilisé passent désormais par le même `handleSaveRepas` que les saisies mono/multi. L'insertion directe isolée a été supprimée ; l'alignement et les scores reçoivent immédiatement les lignes retournées par Supabase. La quantité de chaque composant peut être ajustée ponctuellement avec recalcul des calories, sans modifier l'assiette enregistrée. Le test mobile authentifié du 2 septembre 2026 est concluant.
12. **AUDIT DE RAFRAÎCHISSEMENT TERMINÉ** : tous les chemins actifs d'enregistrement dans `repas_reels` convergent vers `handleSaveRepas`, qui injecte les lignes retournées par Supabase dans `repasSemaine`. Aucun raccord supplémentaire n'était nécessaire ; les autres références recensées sont des lectures, des écritures dans d'autres tables ou des sauvegardes historiques.
13. **RECONSTRUCTION AVANT SCORES VALIDÉE TECHNIQUEMENT** : les scores d'alignement journalier et hebdomadaire sont désormais calculés par occurrence. Une assiette composée pèse une seule fois dans le numérateur et le dénominateur, tandis que les anciennes lignes sans `occurrence_repas_id` restent des occurrences indépendantes. La somme calorique ligne par ligne et la régularité par type de repas restent inchangées.
14. **SOCLE DE DÉTECTION DES REPAS REPÈRES IMPLÉMENTÉ** : `lib/repasReperes.js` analyse les quinze derniers jours, reconstruit uniquement les occurrences identifiées et composées, rapproche les compositions indépendamment de l'ordre des aliments, exige au moins trois occurrences dont deux avec un signal positif, et exclut les extras/fast-foods. Le moteur restitue la composition réelle la plus récente avec ses quantités/calories connues et n'invente aucune suggestion lorsque les preuves sont insuffisantes. Aucun raccord à `/plan` n'est inclus dans ce sous-lot.
15. **PAUSE ERGONOMIQUE DU PLAN VALIDÉE TECHNIQUEMENT** : `/plan` s'ouvre désormais sur la semaine, propose un horizon glissant de quinze jours et conserve le mois comme aperçu compact. Chaque journée, même vide, est une destination de déplacement. Une action explicite est disponible sur mobile et une assiette composée est déplacée en bloc à partir de ses lignes Supabase fiables (`combo_valide`, date, type et `created_at`). Aucun schéma ni comportement de saisie n'est modifié.
16. **RACCORDEMENT DES REPAS REPÈRES VALIDÉ FONCTIONNELLEMENT** : les candidats qualifiés sont proposés dans `/plan` avec leur raison factuelle et leur composition complète. L'utilisateur choisit volontairement de les planifier, puis peut encore modifier la date, le moment et les quantités. Tests **228/228**, build réussi et test mobile authentifié concluant le 9 septembre 2026.
17. **VALIDATION ET PASSATION DU SOCLE TERMINÉES** : les tests, le build et la passation ont été réalisés à chaque sous-lot. Les évolutions suivantes constituent une nouvelle séquence du Plan alimentaire intelligent et ne rouvrent pas le contrat de persistance du lot 2.3.

### Principe de sécurité du sous-lot 2.3

Le premier raccordement ne doit **pas** changer l'expérience utilisateur. Il doit uniquement rendre la persistance capable de recevoir un tableau de lignes en plus de l'objet historique. Ainsi, l'ancien appel mono-aliment reste compatible pendant que l'infrastructure multi-aliments est préparée.

---

## 8. Tests indispensables avant validation fonctionnelle

- ancien appel mono-aliment toujours accepté ;
- tableau multi-aliments accepté ;
- même `occurrence_repas_id` conservé sur les lignes d'une occurrence ;
- `user_id` appliqué à chaque ligne ;
- erreur Supabase gérée sans succès mensonger ;
- repas vide refusé par le moteur ;
- extra et fast-food non altérés ;
- repas conforme au plan simple ;
- plan composé ;
- modèle composé ;
- reprise alimentaire et défi alimentaire sans régression ;
- rafraîchissement du suivi ;
- suite Jest complète ;
- build Next.js/Vercel.

### État des validations déjà obtenues

- Lot 1 : Supabase live vérifié ; GitHub Actions **153/153** ; build Next.js/Vercel validé.
- Sous-lot 2.1 : GitHub Actions **158/158** ; `repasEnCours` **5/5** ; Vercel **READY**.
- Sous-lot 2.2 : **audit documentaire uniquement**, donc aucun nouveau comportement n'est déclaré testé ou fonctionnel.
- Sous-lot 2.3 : raccord `handleSaveRepas` publié dans `8372c91` ; tests ciblés **9/9** ; suite Jest **162/162** ; build Next.js réussi. Aucun changement UX n'est déclaré.
- Sous-lot 2.4 : tests ciblés repas en cours/persistance/interface **16/16** ; suite Jest **169/169** ; build Next.js, clic navigateur sur `Petit-déjeuner` et test fonctionnel authentifié validés. Le correctif d’ouverture de `RepasBloc` est publié dans `feee3b6`.
- Validation utilisateur : une occurrence de deux aliments est comptabilisée dans les statistiques et l’assiette nommée apparaît parmi les repas composés réutilisables. L’affichage détaillé en deux lignes dans « Gérer mes repas » est conforme au stockage actuel ; son regroupement visuel futur est consigné dans `AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md`.
- Étape 9A : toutes les lignes d'un repas planifié composé sont conservées dans le suivi ; tests complets **173/173** et build Next.js réussis ; publication dans `0267735`.
- Étape 9B : moteur d'alignement par occurrence, quatre lectures non punitives et retour immédiat après insertion ; le test utilisateur authentifié a révélé que le bouton « Enregistrer tout le repas » utilisait encore une insertion directe et ne déclenchait donc ni l'alignement ni l'actualisation des scores.
- Raccord de `SaisieRepasCompose` : toutes les lignes sont désormais transmises au handler commun ; tests ciblés **24/24**, suite Jest **185/185** et build Next.js réussi. Validation fonctionnelle authentifiée encore requise après déploiement.
- Quantités à la réutilisation : chaque composant est ajustable à unité inchangée, le total calorique est recalculé et le modèle d'origine reste intact ; tests ciblés **36/36**, suite Jest **188/188** et build Next.js réussi. Validation fonctionnelle mobile authentifiée obtenue le 2 septembre 2026.
- Étape 13 : calcul pur par occurrence raccordé aux scores journalier et hebdomadaire ; tests ciblés **26/26**, suite Jest **193/193** dans le fuseau fonctionnel `Europe/Paris` et build Next.js réussi avec 36 pages générées. L'exécution brute en UTC expose par ailleurs un ancien test de formatage de date dépendant du fuseau, sans rapport avec ce sous-lot et sans modification associée.
- Pause ergonomique du planning : horizons semaine / quinze jours / mois, jours vides déplaçables et déplacement atomique des assiettes composées ; tests ciblés **31/31**, suite Jest **218/218** dans 25 suites avec `TZ=Europe/Paris`, `git diff --check` sans erreur et build Next.js réussi avec 36 pages générées. Le score fictif « repas respectés » et la pression « x jours sur tout le mois » ont été retirés de `/plan` ; l'alignement réel reste calculé dans le suivi.
- Étape 15 : raccord des repas repères publié dans `1aaec59` ; tests ciblés **42/42**, suite Jest **228/228**, build réussi et test fonctionnel authentifié sur mobile validé le 9 septembre 2026.

---

## 9. Règle de reprise du chantier

Le sous-lot 2.3 et le raccord des repas repères sont clôturés. La reprise doit maintenant suivre la feuille de route restante ci-dessous, sans réintroduire un second planificateur, un second générateur de courses ou un regroupement approximatif des anciennes données.

Avant toute modification, vérifier la version courante des fichiers concernés. Avant chaque commit fonctionnel, documentaire ou correctif : rappeler explicitement le dépôt et la branche, présenter le périmètre et attendre l'autorisation de l'utilisatrice. Ne jamais pousser sur `main` sans autorisation explicite distincte.

Les modifications doivent être testées avant validation. Aucun regroupement rétroactif approximatif des anciennes données ne doit être effectué.

---

## 10. Feuille de route restante — Plan alimentaire intelligent et courses

### Étape 16 — Point d'ajustement utile à la planification

- Construire une lecture factuelle des trois premiers jours complets de la semaine en cours, du lundi au mercredi, à partir des repas réellement consommés.
- Exploiter seulement les informations connues : catégories, calories, QN présent, satiété, ressenti, horaires, extras et notes réellement saisies.
- Utiliser l'historique récent uniquement pour confirmer qu'un élément est répété ; le point d'ajustement ne doit pas présenter une occurrence isolée comme une tendance.
- Rendre ce point disponible dans `/plan` à la première ouverture comprise entre le jeudi et le samedi. Il n'est généré qu'une fois par semaine, ne se rouvre pas à chaque visite et disparaît au profit du bilan existant le dimanche.
- Présenter dans une même carte, lorsque les données le permettent : ce qui fonctionne, ce qui mérite l'attention et ce qui peut être ajusté pour les jours restants.
- Ne rien afficher si les données sont insuffisantes et ne jamais bloquer la planification.
- Le bilan du dimanche conserve son rôle de clôture de la semaine ; le point du jeudi au samedi sert uniquement à ajuster la semaine encore en cours.

#### Contrat d'utilisation de l'IA

- L'application calcule les faits structurés ; l'IA n'a pas à recalculer les scores ni à inventer des données.
- L'IA est utile lorsqu'elle rapproche le sens de notes formulées avec des mots différents, hiérarchise les constats fiables et les restitue naturellement.
- L'IA restitue ce que la personne a écrit et l'aide à l'observer ; elle ne décide pas à sa place de ce qui est vrai.
- Les faits mesurés sont formulés directement. Une association reste présentée comme une association et jamais comme une causalité.
- Aucune interprétation psychologique, médicale ou morale n'est autorisée.

### Étape 17 — Ajustements facultatifs et explicables

- Transformer les constats fiables du point d'ajustement en un petit nombre de propositions concrètes pour les jours restants ou les prochains jours planifiés.
- Écarter les repas qui fonctionnent déjà, localiser le véritable point de difficulté et éviter de demander de tout améliorer.
- Expliquer chaque suggestion par un fait observé, sans score inventé.
- Formuler les constats directement, mais présenter l'action comme un conseil et jamais comme une injonction.
- Transformer la prise de conscience en une expérimentation limitée et mesurable, puis prévoir une comparaison lors du point suivant.
- Permettre à l'utilisateur d'accepter, d'ignorer ou de modifier la proposition avant tout enregistrement.
- Ne jamais modifier automatiquement un planning déjà rempli.
- L'IA ne peut pas inventer librement un conseil alimentaire : elle sélectionne, ou non, une action dans une liste fermée construite à partir des fonctions réellement disponibles dans Mon Plan Vital.
- Réutiliser le planificateur et la liste de courses existants : une suggestion acceptée modifie le plan, puis la liste est recalculée par son moteur actuel.

### Étape 18 — Vigilances répétées, non punitives

- Rechercher uniquement des associations répétées entre composition, portion, horaire, ressenti difficile, extras ou éléments explicitement présents dans les notes.
- Exiger plusieurs occurrences comparables avant d'afficher un signal ; le seuil exact devra être validé avant l'implémentation.
- Rapprocher plusieurs formulations écrites lorsqu'elles décrivent réellement une même situation, tout en conservant les faits qui justifient ce rapprochement.
- Intégrer la vigilance dans la carte du point d'ajustement au lieu de créer une alerte ou une notification séparée.
- Ne pas afficher cette partie lorsqu'aucune vigilance fiable n'est disponible.
- Présenter ces observations comme des pistes à examiner, jamais comme une cause certaine ni comme une interdiction.

### Vocabulaire visible validé

L'expression visible `Mes valeurs sûres` remplace `repas repères` ou `go-to meals` dans l'expérience utilisateur. Les anciens termes peuvent rester dans l'historique documentaire et, provisoirement, dans les noms techniques internes afin d'éviter une refonte sans valeur fonctionnelle.

### Étape 19 — Regroupement visuel dans « Gérer mes repas »

- Afficher une seule carte par `occurrence_repas_id`, avec aliments et total calorique.
- Conserver les lignes détaillées en base et le comportement historique des lignes sans occurrence.
- Décider explicitement, avant implémentation, si modifier ou supprimer agit sur un aliment ou sur l'assiette complète.

### Étape 20 — Coût réel de la liste de courses

- Définir d'abord une source de prix fiable, datée et séparée du référentiel nutritionnel.
- Calculer ensuite automatiquement une estimation ; ne jamais demander à l'utilisateur d'inventer cette estimation.
- Conserver le total réellement payé de façon facultative et construire son historique.
- Reporter magasin, type de commerce, origine et qualité à un sous-lot ultérieur tant que les données ne sont pas comparables.

### Ordre de réalisation

Chaque étape constitue un sous-lot séparé : audit du code courant, définition des règles, proposition de l'expérience utilisateur, autorisation, implémentation minimale, tests ciblés, suite complète, build, test fonctionnel puis passation. Aucun sous-lot ne doit modifier silencieusement `RepasBloc`, `SaisieRepasCompose`, le schéma Supabase ou les comportements historiques validés.

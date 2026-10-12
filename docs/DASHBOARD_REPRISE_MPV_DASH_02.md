# MPV-DASH-02 — reprise restaurative et raccords fiables

Date : 12 octobre 2026. Suivi : [issue #19](https://github.com/gendraM/-NEWcompteplanvitalroot/issues/19).
Branche exclusive : `codex/dashboard-v2-finalisation`. Destination : PR **draft** vers `main-consolidation`, sans fusion.

Cette livraison couvre les corrections cadrées et la restauration de la synthèse.
**Elle ne termine pas le tableau de bord entier.** La Couche 2 structurée, les priorités des KPI/highlights et l'isolation de la page globale restent bloquées par les arbitrages/dependances ci-dessous.

## Sources et point de départ

- Base réelle : `main-consolidation` **23f27e3b59f0ea6a3e3f987a1c433602a0fba6bb**.
- Ancienne V2 en lecture seule : **bf9f5f4df68a8209818dc6e4aa39402f0ee3fd68**.
- Cockpit lu sur `cockpit-wbs-phase2`, **0602bb4faa6e003006c0481d979801e2614bff22** : WBS maître, registre JSON, décisions/passations et gouvernance.
- Descriptions et tous les commentaires de [#16](https://github.com/gendraM/-NEWcompteplanvitalroot/issues/16), [#18](https://github.com/gendraM/-NEWcompteplanvitalroot/issues/18) et #19 consultés. PR métier #6/#7/#8/#9/#10/#12/#13 consultées ; discussions #8/#9/#10/#12/#13 relues.
- Documents V2 : [audit UX](https://github.com/gendraM/-NEWcompteplanvitalroot/blob/bf9f5f4df68a8209818dc6e4aa39402f0ee3fd68/docs/AUDIT_TABLEAU_DE_BORD_V2.md), [plan](https://github.com/gendraM/-NEWcompteplanvitalroot/blob/bf9f5f4df68a8209818dc6e4aa39402f0ee3fd68/docs/PLAN_ACTION_TABLEAU_DE_BORD_V2.md), [cartographie](https://github.com/gendraM/-NEWcompteplanvitalroot/blob/bf9f5f4df68a8209818dc6e4aa39402f0ee3fd68/docs/CARTOGRAPHIE_DONNEES_TABLEAU_DE_BORD_V2.md).
- Aucun `AGENTS.md` dans l'arbre consolidé. La branche existante `dash-v2-reprise-couche1`, au SHA de la base, est préservée ; aucune PR de reprise trouvée avant création de la branche dédiée.
- Le mandat actuel autorise code/tests/commits/push/PR draft ; il remplace la restriction d'écriture historique de #19 pour ce périmètre. Aucune modification de base, de secrets, de production ou des branches spécialisées.

## Changements effectivement livrés

| Domaine | Raccord / comportement | Limite |
|---|---|---|
| Identité dashboard | `chargerDonneesDashboard` obtient `auth.getUser`, bloque sans identité ou si elle diffère de celle attendue ; filtre toutes ses tables par `user_id` | Complément de la RLS, aucune preuve de sa configuration réelle |
| Concurrence | Une réponse obsolète ne remplace pas la période/le compte courant ; garde sur les retours de validation rétroactive | Validation persistante non exécutée en production |
| Poids | Profil authentifié : départ du parcours et objectif ; première/dernière observation et variation de période séparées | Aucune mesure globale actuelle inventée hors période |
| Repas | Regroupement canonique par `occurrence_repas_id`, avec repli historique du helper consolidé | Sans identifiant d'occurrence, aucune fusion arbitraire par date/type |
| Faim/satiété | Valeurs formulaires `oui`, `non`, `pas de faim` ; négations de faim reconnues ; signaux inconnus/contradictoires exclus du dénominateur | `pas de faim` ne devient pas un dépassement de satiété |
| Alignement | Score canonique par occurrence pour les confirmations existantes | Pas de plan reconstitué ni de causalité inventée |
| Extras | Réutilisation de `extrasProgression`, historique utilisateur indépendant du filtre visuel | Les règles de fenêtres/paliers restent celles du propriétaire |
| Graphiques | Données fraîchement chargées, dates locales ; absence d'observation = `null`, zéro seulement sur données observées | Pas d'interpolation de valeurs absentes |
| Idéaux | `chargerIdeauxAvecProgression(client,userId)` ; palier canonique dans le détail ; seul statut `en cours` sélectionné actif | Pas de reprise automatique, aucun changement du moteur |
| Défis | Nom/état du défi actif, anomalie de plusieurs actifs signalée | Aucun pourcentage `progress/duree` ; moteur V2 absent |
| Fast-food | Historique de période séparé du dernier événement global ; helper canonique 21/30/45/personnalisé | Champ profil absent ou source en erreur : rythme indisponible |
| Interruptions | `calculerCouvertureSemaine` sépare observé/reconstitué/absent ; aucune reconstruction de repas | Couverture masquée si repas ou périodes indisponibles |
| Navigation/rendu | `Link` conservé ; synthèse, ancre détails, raccourcis, graphiques, historique des notes, badges, Idéaux, préparation et drawer conservés | Organisation analytique finale encore en attente |

La page consolidée n'a pas été remplacée par l'ancienne page V2. Le remplacement des lectures et du calcul sommaire Idéaux est ciblé ; les blocs détaillés et actions existants restent accessibles.

`lib/fastFoodRhythm.js` est porté **à l'identique**, sans fusion de branche, depuis `fast-food-mise-en-conformite` **fa2a615f687fabb16b788820831af9d4fb1b671f**. Aucune migration n'est ajoutée/appliquée. Le champ `profil.fast_food_interval_days` n'est pas documenté par les migrations consolidées : sa présence n'est pas certifiée. Le moteur historique `fastFoodRewards` reste inchangé (45 jours) et n'est pas utilisé pour simuler des récompenses personnalisées.

Les synchronisations Extras déjà présentes à l'ouverture sont conservées dans la page, séparées de l'adaptateur de lecture. Leurs erreurs n'effacent plus les autres données. Elles et la validation rétroactive restent des fonctions pouvant écrire à l'exécution authentifiée : **aucun test réel n'a été lancé contre une base**. Les scénarios navigateur utilisent des semaines vides, interceptent tous les appels externes et interdisent les mutations.

## Arbitrages en attente — ne pas implémenter sans réponse

1. **Couche 2** : les documents fixent dix domaines et cinq questions par domaine, pas la navigation exacte ni tous les indicateurs. Proposition soumise : sections repliables reprenant les graphiques/historiques existants et les liens vers les modules. Alternative : onglets ; ou attendre une spécification détaillée.
2. **KPI/highlights** : #16 distingue explicitement code historique et validation produit. Les seuils 3 observations/70 %/0,5 kg et scores de priorité ne sont pas validés. Proposition soumise : synthèse descriptive, sans nouveaux seuils, conservant les repères canoniques. Les règles historiques de `construireLectureParcours` sont conservées comme source de reprise mais **ne sont pas affichées dans l'interface**. Ni sélection dynamique finale ni nouveau classement ne sont annoncés terminés.
3. **Lectures globales héritées** : le navigateur a confirmé que `_app.js` lit le profil sans `user_id` et `DefisContext.js` lit les défis sans filtre ; la navigation affiche encore son ratio historique. Autorisation de filtres d'identité ciblés demandée avant d'intervenir sur ces fichiers partagés. Ils restent inchangés dans ce lot. L'isolation validée ci-dessous porte sur l'adaptateur dashboard, **pas sur la page complète ni la RLS**.

## Dépendances métier

- Défis V2 : [PR #9](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/9), branche observée **df1ea4c9fcc5dc863fc46d641714816f478b5a67** ; registre DURATION/OCCURRENCES, moteur durée, RPC et migrations absents de la consolidation. Pas de reprise partielle du moteur ni d'exécution de RPC.
- Idéaux : code enrichi déjà consolidé réutilisé. PR #12/#13 divergentes : aucun merge ni transplantation du delta ; conformité du cycle métier global non certifiée par ce lot.
- Fast-food : délai configurable et cohérence avec RepasBloc restent dépendants du chantier propriétaire ; lecture seulement si le champ existe. Pas de création de colonne ni de fallback masquant son absence.
- Align-Life et jeûne/reprise : aucun raccord persistant nouveau. La bannière locale historique de préparation est préservée, sans être présentée comme source de vérité V2.
- Revue indépendante/recette produit et RLS réelle restent nécessaires avant READY.

## Vérifications exécutées

État initial, avant modifications :

- `npm ci --cache /tmp/mpv-npm-cache --no-audit --no-fund` : réussi, aucun changement de dépendances/lockfile.
- `npm test -- --runInBand` : **39 suites réussies, 1 en échec ; 310 tests réussis, 1 en échec**.
- `npm run build` : réussi, Next.js 15.5.7, 36 routes statiques.

État livré :

- Suite complète : **43 suites réussies, 1 en échec ; 360 tests réussis, 1 en échec**.
- **50 tests propres au dashboard**, dans quatre suites : synthèse, lectures, délais Fast-food et restitution des erreurs/liens ; tous réussis.
- L'unique échec existe avant et après : `tests/socleQuantitesCalories.test.js:183`, **688 entrées attendues / 746 observées**. Le vieux relevé 616/674 ne représente pas le fichier actuel. Test/référentiel non modifiés dans ce chantier.
- Build optimisé final : réussi, avec URL/clé **synthétiques locales** pour le navigateur ; aucun secret changé.
- Chromium/Playwright : mobile 390×844, bureau 1440×1000, aucune donnée, source en erreur, déconnecté ; semaine → mois → année, ancre détails et présence des liens consolidés. Zéro erreur JavaScript, aucun débordement horizontal, aucune écriture tentée dans les cinq scénarios.
- Deux utilisateurs synthétiques isolés dans le test de l'adaptateur, y compris séances Idéaux, profil, humeurs, badges et défis ; aucun accès à une base réelle.
- `git diff --check` : réussi.

Le navigateur a détecté une erreur introduite dans deux conversions de date des graphiques mois/année ; elle a été corrigée avant livraison et le parcours relancé. Les preuves finales sont dans `docs/dashboard-evidence/`. Les captures sont synthétiques et montrent également la limite héritée de la navigation Défis.

Limites : pas de recette avec comptes réels, pas d'inspection RLS, pas de validation persistante du drawer ni de synchronisation réelle des badges, pas de certification de tous les modules. Vérification des liens = destinations présentes ; elle ne certifie pas les pages des autres chantiers.

Le workflow GitHub existant `tests-plan-alimentaire.yml` cible uniquement `plan-alimentaire-intelligent-chatgpt`, pas cette branche/base. Le statut CI et la preview au SHA final sont rapportés dans la PR et #19 après push. Aucune configuration CI/production ou facturation n'est modifiée.

## Reproduire le navigateur sans connexion réelle

Installer Playwright dans un répertoire temporaire (pas dans les dépendances du dépôt), puis construire/démarrer localement avec valeurs synthétiques :

```sh
npm install --prefix /tmp/mpv-browser --cache /tmp/mpv-npm-cache --no-audit --no-fund playwright
NEXT_PUBLIC_SUPABASE_URL=https://dashboard-fixture.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=synthetic-test-key npm run build
NEXT_PUBLIC_SUPABASE_URL=https://dashboard-fixture.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=synthetic-test-key node node_modules/next/dist/bin/next start --hostname 127.0.0.1
```

Dans un second terminal :

```sh
MPV_PLAYWRIGHT_PATH=/tmp/mpv-browser/node_modules/playwright node scripts/verify-dashboard-browser.cjs
```

Chromium système utilisé : `/usr/bin/chromium` (surcharge : `MPV_CHROMIUM_PATH`). Tous les appels hors localhost sont interceptés ou bloqués ; aucune session réelle requise. Les artefacts temporaires sont écrits dans `/tmp/mpv-browser-evidence`.

## Parcours court de recette utilisateur

En environnement de test, avec données synthétiques :

1. Ouvrir `/tableau-de-bord` en mobile ; comparer poids de départ, première mesure et objectif.
2. Passer semaine → mois → année ; vérifier les repas par occurrence et les trous de suivi, puis le repère Fast-food global sur une période sans événement.
3. Ouvrir « Détails & analyses » et les liens Suivi/Poids/Idéaux/Défis ; confirmer que les blocs historiques restent accessibles.
4. Refaire sans données et avec source indisponible ; aucun succès/échec ne doit être inventé.

## Passation précise

Reprendre cette branche et la PR draft, puis les trois arbitrages ci-dessus. Ne pas repartir de V2 ni fusionner les branches métier. Après réponse, implémenter les seules parties validées, rejouer les quatre suites dashboard, le build et le navigateur ; vérifier le nouveau SHA CI/preview dans #19. Aucun READY global ni finalisation complète ne peut être annoncé avant ces étapes.

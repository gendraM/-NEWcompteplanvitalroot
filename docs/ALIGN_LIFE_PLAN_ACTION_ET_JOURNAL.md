# Align-Life — Plan d'action & journal de passation

**Date d'initialisation : 1er septembre 2026**  
**Branche de travail : `Align-Life`**  
**Branche source : `plan-alimentaire-intelligent-chatgpt`**  
**HEAD de création : `0f9be4e3c2b5278d4c1fadc4fcc63110a3a9d36e`**  
**Statut : P0 terminé ; P1 terminé ; P2 terminé ; P2.5 = prochaine priorité ; P3+ non commencés.**

---

# 1. RÈGLES DE GOUVERNANCE

1. Aucun commit sans accord explicite préalable de l'utilisateur.
2. Aucun commit hors de `Align-Life` pour ce périmètre.
3. Avant toute modification applicative : audit ciblé du HEAD courant.
4. Ne pas casser un comportement existant pour introduire Align-Life / My Way.
5. Chaque modification autorisée met à jour ce journal dans le même commit.
6. Documenter les tests réellement effectués, résultats, anomalies et risques résiduels.
7. Ne jamais présenter comme fait ce qui n'a pas été implémenté ou vérifié.
8. Tout changement Supabase, migration, RLS, API ou données doit être explicitement consigné.
9. Échecs, rollbacks et anomalies sont journalisés comme les succès.
10. Ce fichier est la source de reprise opérationnelle du chantier.

---

# 2. OBJECTIF PRODUIT

Relier progressivement :

**direction personnelle → aspirations → actions réelles → observation → adaptation → transformation visible.**

Le socle orchestre les capacités existantes au lieu de créer une application dans l'application.

Boucle interne : **CREATE → ALIGN → LIVE → OBSERVE → ADAPT → GROW**.

## Nomenclature verrouillée

- **Nom visible utilisateur : `My Way`.**
- **Concept produit interne : Boussole.**
- La notion de cap peut être utilisée dans les textes de My Way, mais n'est pas son nom principal.
- Architecture interne : CREATE → ALIGN → LIVE → OBSERVE → ADAPT → GROW.
- Branche : `Align-Life`.
- Sous-titre de travail : « My Way — Ce qui compte pour moi et ce que je construis. »

## Principes verrouillés

- Mon Pourquoi = graine initiale de My Way ;
- une seule direction identitaire globale et évolutive ;
- exprimer quand je sais / découvrir quand je ne sais pas ;
- aucune obligation de compléter My Way ;
- aspiration ≠ objectif ≠ Idéal ;
- aspiration → Idéal uniquement sur choix explicite ;
- LIVE réutilise les moteurs existants ;
- GROW part de faits vérifiés ;
- fait ≠ tendance ≠ transformation ;
- `NO_INTERVENTION` est un état fonctionnel ;
- l'IA formule/clarifie mais ne décide pas de l'identité ;
- toute formulation identitaire ou de vision appartient à l'utilisateur et doit être validée par lui ;
- Journal spirituel = Jeûne-only ;
- GROW peut traverser Préparation → Jeûne → Reprise → Cristallisation → fonctionnement normal ;
- autonomisation = dimension importante du succès ;
- on mesure des phénomènes utiles, on ne note pas la personne.

---

# 3. PLAN D'ACTION PRIORISÉ

## P0 — Gouvernance et sécurité du chantier

**État : TERMINÉ.**

Branche dédiée, règles de commit et journal de passation établis.

## P1 — Expérience utilisateur cible My Way

**État : TERMINÉ.**

Parcours validé :

**Mon Pourquoi → My Way progressive → aspiration éventuelle → Idéaux sur choix explicite → LIVE → OBSERVE → GROW → éventuel ADAPT → My Way enrichie.**

Implantation UX cible :
- Profil = naissance via objectif + Mon Pourquoi ;
- My Way n'est pas enfermée dans Profil ;
- Tableau de bord = entrée légère privilégiée ;
- pas de nouvel onglet principal My Way par défaut ;
- GROW apparaît aussi contextuellement là où le fait significatif se produit ;
- My Way n'est pas un gestionnaire de tâches ;
- Idéaux reste le moteur de concrétisation d'une aspiration.

Contenus candidats : pourquoi j'ai commencé ; ce qui compte ; direction identitaire si exprimée/validée ; aspirations ; éléments GROW validés.

## P2 — Audit technique ciblé du HEAD réel

**État : TERMINÉ EN LECTURE SEULE le 2 septembre 2026.**

**HEAD audité : `eda00ff29b60969876eba0ce60caa23e5036bbdc`.**

### Conclusion générale

L'architecture My Way est compatible avec l'application actuelle. Il n'est pas nécessaire de reconstruire Profil, Dashboard, Suivi, Idéaux, Défis ou les cycles. Le raccord doit réutiliser leurs responsabilités existantes.

Le principal risque découvert est l'hétérogénéité de l'isolation utilisateur dans plusieurs tables historiques. Les nouvelles données My Way ne doivent pas reproduire cette dette.

### Matrice de raccordement

| Capacité | Existant réel | Décision de raccord | Risque / préalable |
|---|---|---|---|
| Mon Pourquoi | `profil.pourquoi` existe et est utilisé | réutiliser comme graine ; ne pas dupliquer | sécuriser le chemin Profil avant My Way |
| Entrée My Way | Dashboard déjà agrégateur | carte/entrée légère ultérieure | faible |
| My Way | pas de stockage dédié | créer seulement les données nouvelles nécessaires | P2.5 puis P3 |
| Aspiration → Idéaux | `ideaux` existe | transfert uniquement après choix explicite | Idéaux actuellement très orienté course + isolation |
| LIVE / Suivi | `suivi.js` centralise déjà le vécu alimentaire et les cycles | réutiliser ses événements | bon socle |
| Extras / retour | `repas_reels.est_extra` + chronologie | candidat prioritaire OBSERVE/GROW | faible sur isolation actuelle de `repas_reels` |
| Défis | moteur existant | preuve d'accompagnement ; chercher ensuite transfert hors défi | isolation historique à traiter avant raccord |
| Progression Idéaux | `seances_reelles` prévu/réel + métriques | excellent terrain GROW | sécurisation avant raccord |
| Cristallisation | progression + tracking comportemental | futur terrain GROW | sécurisation avant raccord |
| Journal spirituel | stockage séparé | aucune alimentation automatique de GROW/My Way | conforme au principe Jeûne-only |

### Constats techniques vérifiés

#### Profil / Mon Pourquoi
- table réelle : `profil` ;
- colonne `pourquoi` existante et non nullable ;
- `user_id` existe ;
- le code historique charge notamment le dernier profil sans filtre propriétaire explicite dans le chemin audité ;
- RLS est activée mais les policies observées sur `profil` autorisent actuellement largement l'accès (`true`) au lieu d'imposer `auth.uid() = user_id`.

**Décision :** ne créer aucune copie `my_way_pourquoi`. My Way lira la graine existante après sécurisation ciblée.

#### Suivi / repas réels
- `handleSaveRepas` récupère l'utilisateur Supabase ;
- `normaliserRepasPourPersistance` renseigne `user_id` ;
- `repas_reels` possède des policies propriétaire SELECT/INSERT/UPDATE/DELETE basées sur `auth.uid() = user_id` ;
- audit de comptage : 1 400 lignes `repas_reels`, 1 400 avec `user_id` au moment de l'audit.

**Décision :** ne pas recréer le moteur LIVE. Les repas/extras constituent un socle fiable pour de futurs événements OBSERVE.

#### Idéaux
- table `ideaux` avec `user_id`, titre, description émotionnelle, indicateur, date cible, plan JSON et états de validation ;
- générateur et écran actuels contiennent des valeurs/structures fortement orientées course : fréquence, durée, vitesse `7,6 km/h`, jours lundi/mercredi/samedi, `action_type: course` ;
- `seances_reelles` contient notamment prévu/réel, fait, bonus, statut et `user_id` ;
- policies actuelles de `ideaux` et `seances_reelles` sont permissives (`true`).

**Décision :** My Way pourra transmettre une aspiration à Idéaux, mais la généralisation fonctionnelle et la sécurisation d'Idéaux restent nécessaires dans P6/P7.

#### Défis
- table `defis` possède `user_id` ;
- le contexte et la page audités chargent actuellement les défis sans filtre utilisateur explicite ;
- policy RLS actuelle observée : permissive (`true`).

**Décision :** ne pas utiliser les Défis comme preuve autonome de transformation. Le futur GROW cherchera notamment le transfert d'un comportement hors du cadre du Défi.

#### Cycles
- Préparation/Reprise utilisent déjà plusieurs raccords `user_id` ;
- `reprises_alimentaires` possède des policies propriétaire correctes ;
- `parcours_cristallisation` a RLS activée mais policy permissive actuelle ;
- `parcours_jeune` possède `user_id` de type `text`, contient 25 lignes dont 22 avec `user_id` lors de l'audit, et **RLS est actuellement désactivée** ;
- l'advisor sécurité Supabase remonte explicitement `parcours_jeune` comme table publique sans RLS ;
- Journal spirituel utilise des requêtes liées à `user_id` et reste hors alimentation automatique de My Way/GROW.

**Décision :** ne pas lancer maintenant une migration transversale de tous les cycles. Sécuriser chaque chemin au moment de son raccord, sauf vulnérabilité indépendante devant faire l'objet d'un chantier sécurité séparé.

### Critère de sortie P2

Atteint : le raccord My Way au réel est suffisamment cartographié pour définir un garde-fou de données ciblé avant la fondation P3.

## P2.5 — Garde-fou données My Way

**État : PROCHAINE PRIORITÉ — À CONCEVOIR/VALIDER AVANT TOUTE ÉCRITURE SUPABASE.**

Objectif : garantir que My Way démarre sur une isolation utilisateur saine sans déclencher une refonte sécurité de toute l'application.

Périmètre proposé :
1. sécuriser le chemin strictement nécessaire `profil` / Mon Pourquoi ;
2. définir la stratégie de compatibilité pour les 3 profils existants avant modification de policy ;
3. définir les futures tables/colonnes My Way avec `user_id UUID NOT NULL` et RLS propriétaire dès leur création ;
4. prévoir les policies SELECT/INSERT/UPDATE/DELETE avec propriété `auth.uid() = user_id` ;
5. vérifier les contraintes et index utiles ;
6. ne pas modifier Idéaux, Défis, cycles ou autres tables dans P2.5 sauf nécessité démontrée pour le premier flux My Way ;
7. toute migration sera testée avant raccord UI et fera l'objet d'un accord utilisateur explicite.

**Important : P2.5 n'autorise encore aucune migration.** Il prépare la modification minimale et son plan de test.

## P3 — Fondation de données My Way

**État : À FAIRE après P2.5.**

Stocker uniquement ce qui n'existe pas déjà : expressions libres, éléments validés, direction éventuellement exprimée, aspirations, principes d'incarnation éventuellement validés, provenance et statut.

Contraintes : isolation utilisateur explicite ; migration préparée ; pas de tables conceptuelles inutiles.

## P4 — My Way V1 sans dépendance forte à l'IA

**État : À FAIRE.**

Consulter, ajouter, modifier, archiver/supprimer selon règle retenue, « je ne sais pas / pas maintenant », continuer normalement. Fonctionnement possible sans IA.

## P5 — IA V1 « reformuler sans inventer »

**État : À FAIRE.**

Flux : texte utilisateur → route serveur → contexte minimal → proposition structurée → Ça me ressemble / Je modifie / Je garde mes mots / Je refuse → seule la formulation validée devient référence.

Avant implémentation : recalculer coût API pour test personnel, 20 utilisateurs actifs/mois, fréquence/volume et coût moyen utilisateur.

## P6 — Raccord My Way → Idéaux

**État : À FAIRE.**

Une aspiration ne devient jamais automatiquement un Idéal. UX, données transmises et retour/refus restent à définir au moment du raccord.

## P7 — Finalisation fonctionnelle d'Idéaux

**État : À FAIRE après raccord P6.**

Cible : aspiration concrète → objectif → Palier 1 → actions → observation → adaptation → palier suivant.

À réévaluer sur le code courant : généricité hors course, multi-paliers, retard/avance, reprise après interruption, alternatives, bonus, durée, isolation utilisateur, raccord GROW.

## P8 — OBSERVE / moteur événementiel V1

**État : À FAIRE.**

Candidats : retour après extra, retour après interruption, progression Idéaux, transfert après Défi si prouvable, Cristallisation.

Pipeline : **LIVE → OBSERVE → DETECT → DECIDE**, avec `NO_INTERVENTION` si preuve/utilité/contexte insuffisants.

## P9 — GROW V1

**État : À FAIRE.**

Preuve : P0 donnée brute → P1 fait → P2 répétition → P3 tendance → P4 transfert → P5 autonomie.

Candidat MVP : retour après écart/interruption.

## P10 — GROW + Idéaux

**État : À FAIRE.**

Distinguer résultat mesuré et mise en sens. La reconnexion à My Way n'est permise que si l'utilisateur a validé l'élément de direction concerné.

## P11 — Raccord aux cycles

**État : À FAIRE.**

Préparation → Jeûne → Reprise → Cristallisation restent distincts. GROW peut traverser les phases ; Journal spirituel reste Jeûne-only ; transfert d'une prise de conscience spirituelle uniquement volontaire.

## P12 — ADAPT / orchestration avancée

**État : À FAIRE EN DERNIER.**

Router vers l'outil légitime : Plan/Suivi, Idéaux, Défi, future Capsule/Porte ; sinon `NO_INTERVENTION`. ADAPT n'est pas un écran autonome.

---

# 4. FORMAT OBLIGATOIRE DU JOURNAL

Chaque changement autorisé consigne : date/heure ; branche ; HEAD avant ; objectif ; accord utilisateur ; fichiers inspectés ; fichiers modifiés ; Supabase/API/migration ; comportement avant/après ; tests ; résultats ; régressions/anomalies/limites ; décisions ; commit SHA ; HEAD après ; prochaine étape autorisée ou non.

Le SHA du commit courant, inconnu avant sa création, est vérifié immédiatement après et consolidé dans l'entrée suivante autorisée.

---

# 5. JOURNAL CHRONOLOGIQUE

## LOG 001 — Initialisation de la gouvernance Align-Life

**Date : 1er septembre 2026**  
**Branche : `Align-Life`**  
**HEAD avant : `0f9be4e3c2b5278d4c1fadc4fcc63110a3a9d36e`**  
**Objectif :** créer le plan d'action et la source de passation.  
**Accord utilisateur : OUI — « ok go ».**  
**Fichier créé :** `docs/ALIGN_LIFE_PLAN_ACTION_ET_JOURNAL.md`.  
**Supabase/API/migration :** non.  
**Code/comportement utilisateur :** aucun changement.  
**Tests :** vérification fichier + commit sur `Align-Life`.  
**Résultat :** succès.  
**Commit / HEAD après : `d531ee315d9491c468b6865fc7d8f98e31a97b62`.**  
**Suite :** P1.

## LOG 002 — Validation du parcours UX et du naming My Way

**Date : 1er septembre 2026**  
**Branche : `Align-Life`**  
**HEAD avant : `d531ee315d9491c468b6865fc7d8f98e31a97b62`**  
**Objectif :** figer P1, implantation UX et naming `My Way`.  
**Accord utilisateur : OUI — autorisation documentaire uniquement.**  
**Fichiers inspectés :** Navigation, Profil, Dashboard, Suivi, Idéaux, journal.  
**Fichier modifié :** journal uniquement.  
**Supabase/API/migration :** non.  
**Comportement utilisateur :** aucun changement.  
**Résultat :** P1 validé.  
**Commit / HEAD après : `eda00ff29b60969876eba0ce60caa23e5036bbdc`.**  
**Suite :** P2 lecture seule.

## LOG 003 — Audit technique P2 et définition du garde-fou P2.5

**Date / heure : 2 septembre 2026, après audit P2.**  
**Branche : `Align-Life`.**  
**HEAD avant : `eda00ff29b60969876eba0ce60caa23e5036bbdc`.**  
**Objectif :** consigner l'audit technique réel de My Way, ses raccords, les risques d'isolation utilisateur et introduire P2.5 avant P3.  
**Accord utilisateur : OUI — « ok vasi » après restitution de P2 et proposition explicite de documenter P2 + P2.5 avant développement.**  
**Fichiers inspectés pendant P2 :** notamment `components/Navigation.js`, `pages/profil.js`, `pages/tableau-de-bord.js`, `pages/suivi.js`, `pages/ideaux.js`, `pages/defis.js`, `components/DefisContext.js`, `lib/repasPersistence.js`, `pages/preparation-jeune.js`, `lib/preparationsJeune.js`, `lib/parcoursJeuneAPI.js`, `lib/cristallisationAPI.js`, `lib/journalSpirituelAPI.js`, `lib/supabaseClient.js`, documentation Align-Life.  
**Fichier modifié par ce changement :** `docs/ALIGN_LIFE_PLAN_ACTION_ET_JOURNAL.md` uniquement.  
**Supabase/API/migration :** Supabase a été interrogé **en lecture seule** pour vérifier tables, colonnes, RLS, policies, volumétrie ciblée et advisor sécurité. **Aucune donnée, policy, table, migration ou fonction n'a été modifiée.**  
**Comportement avant :** P2 était marqué à faire ; aucune matrice fiable ne distinguait les raccords déjà sains des dettes historiques.  
**Comportement attendu après :** aucun changement visible dans l'application ; le journal devient la référence technique pour P2 et interdit de démarrer P3 avant le garde-fou P2.5.  
**Tests/vérifications :** HEAD contrôlé ; code réel inspecté ; schéma/policies RLS interrogés ; comptages ciblés effectués ; advisor sécurité Supabase exécuté.  
**Résultats :** `repas_reels` est correctement propriétaire et 1 400/1 400 lignes ont `user_id` ; `profil`, `ideaux`, `defis`, `seances_reelles`, `parcours_cristallisation` ont des policies permissives observées ; `parcours_jeune` a RLS désactivée et 22/25 lignes avec `user_id` ; Idéaux reste orienté course ; My Way peut réutiliser l'existant sans recréer les moteurs.  
**Régressions/anomalies/limites :** aucune régression car documentation uniquement ; aucune migration testée ; P2.5 n'est pas encore exécuté ; l'audit sécurité complet de toute l'application n'est pas dans ce périmètre.  
**Décisions :** réutiliser `profil.pourquoi` ; ne pas dupliquer Mon Pourquoi ; Dashboard comme entrée légère ; Suivi comme LIVE ; GROW au-dessus de faits existants ; sécurisation progressive des raccords ; créer les futures données My Way avec ownership strict dès l'origine ; ne pas lancer une refonte globale des RLS dans ce chantier.  
**Commit SHA / HEAD après :** à vérifier immédiatement après création du présent commit et à consolider au prochain commit autorisé.  
**Prochaine étape : P2.5 à concevoir précisément. Aucune migration ni modification applicative n'est autorisée par ce commit.**

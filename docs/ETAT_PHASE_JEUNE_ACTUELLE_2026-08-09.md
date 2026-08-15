# 📋 ÉTAT DES LIEUX — Phase Jeûne

**Date d'analyse :** 09/08/2026  
**Périmètre :** uniquement la phase **jeûne** entre la préparation et la reprise alimentaire.  
**Objectif :** disposer d'un document court, vérifiable et à jour sur l'état réel de `/pages/jeune.js` et de ses dépendances directes.

> Ce document se limite volontairement au cycle de jeûne lui-même. Il ne détaille pas la préparation ni la reprise au-delà de ce qu'elles alimentent directement dans la phase jeune.

---

## 1. Résumé exécutif

La phase jeune est aujourd'hui **fonctionnelle de bout en bout** pour un parcours individuel déjà amorcé : l'utilisateur peut entrer dans le jeûne, consulter un contenu jour par jour, suivre des conseils d'activation, valider ses jours, générer un programme de reprise et consulter son historique de jeûnes terminés.

Le noyau du flux est bien présent dans [pages/jeune.js](../pages/jeune.js) :
- chargement du contexte de préparation et du parcours Supabase,
- affichage du jour en cours,
- validation séquentielle des jours,
- génération du programme de reprise,
- archivage et consultation d'historique,
- blocs pédagogiques et motivationnels.

En revanche, plusieurs écarts existent encore entre la vision documentaire et l'implémentation réelle :
- le contenu `JEUNE_DAYS_CONTENT` est incomplet/incohérent sur les derniers jours,
- certaines redirections de fin de jeûne sont encore fragiles,
- le parcours dépend encore de caches localStorage et de fallbacks mockés,
- la continuité vers la reprise n'est pas totalement automatisée.

---

## 2. Ce qui fonctionne aujourd'hui

### 2.1 Structure globale de la page

[pages/jeune.js](../pages/jeune.js) embarque déjà :
- la récupération du contexte via Supabase et localStorage,
- le suivi du jour courant,
- le calcul du contenu affiché,
- l'interface principale de suivi,
- la logique de fin de jeûne et de reprise.

### 2.2 Contenu pédagogique du jour

La page contient un bloc `JEUNE_DAYS_CONTENT` avec des textes détaillés pour les jours 1 à 14, plus un jour 15 ajouté en fin de structure. Les jours proposent :
- esprit,
- corps,
- ressenti,
- conseils,
- message du jour.

### 2.3 Conseils d'activation interactifs

La section des conseils d'activation est bien branchée dans la page via [components/ChecklistConseilsActivation.js](../components/ChecklistConseilsActivation.js). Elle permet :
- l'affichage de conseils spécifiques par jour,
- le cochage des conseils,
- le calcul d'un score,
- un feedback motivationnel immédiat.

La page rend ce bloc conditionnellement quand `contenuJour.conseilsActivation` existe.

### 2.4 Message de soutien et outils du jour

La phase jeune inclut déjà :
- un message de soutien personnalisable,
- une boîte à outils du jour,
- des suggestions d'outils rapides,
- l'enregistrement local des outils utilisés.

### 2.5 Analyse comportementale et perte de poids estimée

La page affiche également :
- une analyse comportementale,
- une estimation de perte de poids,
- un accès à un journal spirituel.

### 2.6 Validation des jours

Le flux de validation quotidienne est en place :
- vérification que le jour n'est pas dans le futur,
- validation séquentielle des jours précédents,
- sauvegarde du jour validé,
- passage automatique au jour suivant si possible.

### 2.7 Préparation à la reprise

Le module de fin de jeûne génère un programme de reprise et prépare l'utilisateur à la suite :
- [lib/genererProgrammeReprise.js](../lib/genererProgrammeReprise.js),
- [lib/jeuneUtils.js](../lib/jeuneUtils.js),
- [pages/validation-plan-reprise.js](../pages/validation-plan-reprise.js),
- [pages/reprise-alimentaire-apres-jeune.js](../pages/reprise-alimentaire-apres-jeune.js).

### 2.8 Historique des jeûnes

La page peut archiver un jeûne terminé et le relire ensuite via [components/HistoriqueJeunesModal.js](../components/HistoriqueJeunesModal.js). Le stockage local de l'historique fonctionne déjà.

### 2.9 Intégration Supabase du parcours

L'API [lib/parcoursJeuneAPI.js](../lib/parcoursJeuneAPI.js) existe et fournit :
- lecture du parcours actif,
- création d'un parcours,
- mise à jour des jours validés,
- mise à jour du message personnel,
- mise à jour des outils,
- terminaison du parcours,
- lecture du poids et des repas récents côté Supabase.

---

## 3. Ce qui reste à faire

### 3.1 Continuité de parcours

Le point faible principal de la phase jeune est la continuité entre les écrans et les données :
- la page dépend encore de plusieurs sauvegardes localStorage,
- certains fallbacks mockés subsistent,
- la transition vers la reprise n'est pas encore totalement unifiée.

### 3.2 Synchronisation des données

Même si Supabase est déjà branché, la phase jeune ne repose pas encore exclusivement sur des données distantes :
- poids de secours encore présent,
- repas de secours encore présents,
- redondance localStorage / Supabase encore importante.

### 3.3 Cohérence des contenus jour par jour

Le tableau `JEUNE_DAYS_CONTENT` demande une remise à plat :
- les derniers jours ne sont pas homogènes,
- une clé de jour est dupliquée dans la structure,
- le jour 14 peut tomber sur un fallback générique si la clé correspondante n'est pas correctement exposée,
- le jour 15 est présent mais sort du périmètre métier le plus courant.

### 3.4 Fin de jeûne / reprise

La fin de jeûne fonctionne, mais reste perfectible :
- certaines redirections pointent encore vers des routes fragiles,
- la continuité vers la reprise devrait être rendue plus robuste,
- le parcours post-jeûne mérite une validation plus cohérente.

---

## 4. Écarts entre attendu métier et code réel

### 4.1 Ce qui était attendu

La phase jeune attendue par le métier devait :
- s'appuyer sur le contexte de préparation,
- récupérer les vraies données utilisateur,
- proposer un coaching jour par jour,
- persister la progression,
- faciliter la transition vers la reprise,
- rester cohérente sur tout le cycle.

### 4.2 Ce que fait réellement le code

Le code réel :
- couvre bien l'usage quotidien du jeûne,
- fournit un contenu éditorial fort,
- permet la validation des jours,
- enregistre un historique,
- prépare la reprise,
- mais reste encore partiellement dépendant de caches locaux et de textes parfois incomplets.

### 4.3 Écart principal

L'écart principal n'est pas un bug bloquant unique, mais un **écart de maturité produit** :
- le flux est utilisable,
- mais il n'est pas encore totalement unifié,
- ni totalement aligné avec un parcours métier idéal et entièrement dynamique.

---

## 5. Fichiers clés à suivre

- [pages/jeune.js](../pages/jeune.js)
- [components/ChecklistConseilsActivation.js](../components/ChecklistConseilsActivation.js)
- [components/MessageSoutien.js](../components/MessageSoutien.js)
- [components/AnalyseComportementale.js](../components/AnalyseComportementale.js)
- [components/PertePoidsEstimee.js](../components/PertePoidsEstimee.js)
- [components/BilanJeune.js](../components/BilanJeune.js)
- [components/HistoriqueJeunesModal.js](../components/HistoriqueJeunesModal.js)
- [lib/parcoursJeuneAPI.js](../lib/parcoursJeuneAPI.js)
- [lib/genererProgrammeReprise.js](../lib/genererProgrammeReprise.js)
- [pages/validation-plan-reprise.js](../pages/validation-plan-reprise.js)
- [pages/reprise-alimentaire-apres-jeune.js](../pages/reprise-alimentaire-apres-jeune.js)

---

## 6. Priorités concrètes

1. Corriger et homogénéiser `JEUNE_DAYS_CONTENT`.
2. Vérifier et sécuriser les redirections de fin de jeûne.
3. Réduire la dépendance aux fallbacks mockés.
4. Consolider la synchronisation Supabase/localStorage.
5. Garder le flux de reprise lisible et prévisible.

---

## 7. Verdict actuel

### Fonctionnel
- la phase jeune est exploitable,
- la navigation jour par jour fonctionne,
- la validation des jours fonctionne,
- les conseils d'activation fonctionnent,
- le bilan et l'historique existent.

### À corriger
- cohérence des jours de contenu,
- robustesse de fin de jeûne,
- dépendance résiduelle à des caches/fallbacks,
- unification de la continuité vers la reprise.

### À surveiller
- toute nouvelle modification de `pages/jeune.js` doit conserver l'ordre hooks / effets / handlers,
- toute évolution du contenu doit rester compatible avec le rendu actuel,
- toute modification de transition doit être testée jusqu'à la reprise.

---

**Statut global :** phase jeune fonctionnelle mais encore perfectible sur la cohérence métier, le contenu et la continuité de données.

Liste de tâches à faire mise à jour

Je vais d’abord auditer la phase jeûne dans le code + le document d’état, puis je te dis clairement ce qui est branché Supabase et ce qui manque selon les logs.

Read 

Searched for files matching `supabase|Supabase`, 9 results

Searched for files matching `phase.?je[uû]ne|je[uû]ne|fasting|phase`, 230 results

Read 

Read 

Searched for files matching `localStorage|mock|fallback|console\.log|supabase|parcours`, 9 results

Searched for files matching `supabase|localStorage|mock|fallback|console\.log|warn|error|getParcoursJeuneActif|createParcoursJeune|updateJoursValides|getDernierPoids|getDerniersRepas`, 9 results

Read 

Searched for files matching `TODO|reste|à faire|manque|log|journal|erreur|warning`, 7 results









Read , lines 221 to 440

Read , lines 1 to 220

Read , lines 441 to 800



Read , lines 166 to 220



Je vais lire les zones clés de `pages/jeune.js` pour confirmer précisément où Supabase est utilisé vs où le local prend encore le relais.

Read , lines 1020 to 1180

Read , lines 1220 to 1385

Read , lines 1385 to 1525

Read , lines 330 to 460

Read , lines 560 to 660

Read , lines 1520 to 1625

Read , lines 500 to 560

Read , lines 840 to 980

Searched for files matching `supabase|localStorage|fallback|mock|console\.warn|console\.error|genererEtSauvegarderProgramme|ParcoursAPI`, 101 results

Read 

Read 

Read , lines 1 to 140

Read , lines 1 to 170

Read , lines 170 to 280

Searched for files matching `verifierFinJeuneProche|validerProgrammeReprise|genererEtSauvegarderProgramme|getJeuneEnCours`, 9 results

Searched for files matching `historiqueJeunes|jeunesSupprimés|programmeRepriseValide|reprises_alimentaires|parcours_jeune`, 26 results

Read , lines 1178 to 1205

Searched for files matching `**/*{PHASE_JEUNE,phase_jeune,phase-jeune,JEUNE}*2026-08-09*.md`, 2 results

Searched for files matching `log|logs|Supabase|fallback|localStorage|reste à faire|à faire|TODO`, 9 results

Read , lines 1 to 220

Searched for files matching `updateMessagePerso|updateOutilsActives|createParcoursJeune|getParcoursJeuneActif|terminerParcoursJeune|updateJoursValides`, 11 results



Non, **la phase jeûne n’est pas 100% branchée Supabase** aujourd’hui — elle est en mode **hybride Supabase + localStorage**.

### Ce qui est bien branché Supabase
- Parcours actif jeûne (création/lecture/mise à jour jours validés/fin) via `lib/parcoursJeuneAPI.js`.
- Génération du programme de reprise avec tentative de sauvegarde Supabase depuis `pages/jeune.js` (`genererEtSauvegarderProgramme`).
- Sauvegarde du bilan jeûne dans `bilans_jeune` (si possible).

### Ce que les logs/code montrent encore
On voit beaucoup de logs de fallback du type :
- `Fallback repasRecentsCache`
- `Fallback poidsDepartCache`
- `Erreur init parcours, fallback localStorage`
- `Erreur sauvegarde Supabase, génération locale`
- `Pas de parcoursId, sauvegarde locale uniquement`

Donc la sync distante n’est pas garantie à 100% sur tout le flux.

### Ce qui reste à faire (prioritaire)
1. **Validation plan reprise**: `pages/validation-plan-reprise.js` est encore **localStorage only** (pas de `validerProgrammeReprise` Supabase).
2. **Historique jeûnes/corbeille**: dans `pages/jeune.js`, c’est encore stocké localement (`historiqueJeunes`, `jeunesSupprimés`).
3. **Messages/outils du jeûne**: APIs existent (`updateMessagePerso`, `updateOutilsActives`) mais **non utilisées**.
4. **Reprise alimentaire** (`pages/reprise-alimentaire-apres-jeune.js`): très majoritairement localStorage + mode debug/test encore présent.
5. **Réduire les fallbacks mockés** (ex. poids fallback `72.4`) et harmoniser les clés user-scopées.

.
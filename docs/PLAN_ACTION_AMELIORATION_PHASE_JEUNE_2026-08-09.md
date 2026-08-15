# Plan d'action d'amélioration — Phase Jeûne

**Date :** 09/08/2026  
**Périmètre :** uniquement la phase jeune entre la préparation et la reprise alimentaire.  
**Base de départ :** [docs/ETAT_PHASE_JEUNE_ACTUELLE_2026-08-09.md](ETAT_PHASE_JEUNE_ACTUELLE_2026-08-09.md)

## 1. Objectif

Faire passer la phase jeune d'un état « fonctionnel mais encore fragmenté » à un état :
- cohérent sur les contenus,
- fiable sur les transitions,
- plus dépendant de Supabase que du localStorage,
- plus simple à maintenir et à tester,
- compatible avec une durée de jeûne choisie librement par l'utilisateur.

## 2. Écarts à corriger

1. `JEUNE_DAYS_CONTENT` n'est pas homogène sur toute la durée.
2. Le contenu et les règles de durée doivent rester compatibles avec un jeûne paramétrable par l'utilisateur.
3. La fin de jeûne et la redirection vers la reprise restent fragiles.
4. Les fallbacks mockés et les caches locaux restent trop présents.
5. La synchronisation entre historique, bilan et parcours actif n'est pas assez unifiée.
6. Le document métier et le code ne racontent pas toujours exactement la même chose.

## 3. Priorités d'exécution

### Priorité 1 — Fiabiliser le contenu jour par jour

Actions :
- relire et homogénéiser `JEUNE_DAYS_CONTENT` jour par jour,
- supprimer les doublons ou clés ambiguës,
- vérifier que chaque jour affiché correspond bien au bon texte,
- aligner le niveau de détail avec [docs/Jeûne.md](Je%C3%BBne.md), y compris le jour 15.

Résultat attendu :
- aucun jour générique non voulu,
- contenu lisible, stable et cohérent,
- une seule source de vérité pour les textes.

### Priorité 1 bis — Laisser la durée du jeûne pilotée par l'utilisateur

Actions :
- ne pas imposer de plafond métier arbitraire sur la durée du jeûne,
- conserver la durée comme un paramètre saisi ou validé par l'utilisateur,
- vérifier que les calculs d'affichage et de progression restent cohérents quelle que soit la durée choisie,
- garder le jour 15 comme partie du référentiel, pas comme exception cachée.

Résultat attendu :
- l'utilisateur fixe sa durée,
- l'interface suit cette durée sans contradiction,
- le jour 15 reste disponible dans le contenu de référence.

### Priorité 2 — Sécuriser la transition fin de jeûne → reprise

Actions :
- vérifier toutes les routes de sortie vers la reprise,
- consolider la génération et la sauvegarde du programme de reprise,
- éviter les redirections manuelles fragiles quand un état validé existe déjà,
- tester le chemin complet de fin de jeûne jusqu'à l'ouverture du plan validé.

Résultat attendu :
- un passage reproductible et sans blocage,
- moins de dépendance à des actions manuelles,
- un seul flux logique de sortie.

### Priorité 3 — Réduire les dépendances locales

Actions :
- remplacer progressivement les caches localStorage par la donnée Supabase quand elle existe,
- conserver localStorage uniquement comme fallback,
- tracer clairement les cas où les fallbacks sont encore utilisés,
- harmoniser les clés de persistance entre parcours actif, historique et bilan.

Résultat attendu :
- meilleure continuité entre appareils,
- moins de divergence entre sessions,
- comportement plus prévisible après rafraîchissement ou reconnexion.

### Priorité 4 — Unifier les blocs métier

Actions :
- vérifier que `pages/jeune.js`, `lib/parcoursJeuneAPI.js` et les composants liés manipulent les mêmes structures,
- documenter les champs réellement utilisés,
- réduire les structures implicites ou calculées de façon dispersée,
- préparer une séparation plus nette entre affichage, calcul et persistance.

Résultat attendu :
- moins d'effets de bord,
- code plus simple à comprendre,
- maintenance plus rapide.

### Priorité 5 — Consolider la traçabilité

Actions :
- relier chaque amélioration à un test ou une validation manuelle,
- mettre à jour les docs quand le comportement change,
- conserver un document d'état unique et à jour,
- noter les écarts encore acceptés explicitement.

Résultat attendu :
- moins de divergences entre doc et code,
- décisions plus faciles à reprendre,
- historique clair des changements.

## 4. Ordre recommandé

1. Corriger le contenu jour par jour.
2. Vérifier que la durée du jeûne reste bien pilotée par l'utilisateur.
3. Vérifier le flux complet de fin de jeûne.
4. Réduire les fallbacks locaux les plus visibles.
5. Nettoyer les incohérences de structure métier.
6. Revalider l'ensemble avec une lecture du parcours complet.

## 5. Critères de succès

Le plan est considéré comme bien avancé quand :
- chaque jour du jeûne affiche le bon contenu,
- le jour 15 est disponible dans la référence et cohérent avec le reste,
- la durée de jeûne reste paramétrable par l'utilisateur,
- la validation quotidienne reste fiable,
- la fin de jeûne ouvre la reprise sans détour fragile,
- Supabase devient la source principale des données de parcours,
- le document d'état et le code racontent la même chose.

## 6. Risques à surveiller

- casser la navigation en corrigeant les contenus,
- introduire des régressions de hooks ou d'effets dans `pages/jeune.js`,
- créer une dépendance Supabase trop agressive sans fallback,
- modifier la reprise sans garder la compatibilité avec le jeûne actif.

## 7. Livrable attendu par étape

Chaque étape devrait produire :
- une modification ciblée du code,
- une validation rapide,
- une mise à jour du document d'état,
- si besoin, un ajustement du plan.
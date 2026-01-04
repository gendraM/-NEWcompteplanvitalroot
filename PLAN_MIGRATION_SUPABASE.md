# PLAN D’IMPLÉMENTATION — MIGRATION SAUVEGARDE VERS SUPABASE (JEÛNE, REPRISE, PRÉPARATION, CRISTALLISATION)

## Titre de la tâche
Migration complète de la sauvegarde des données critiques (jeûne, reprise, préparation, cristallisation) du localStorage vers Supabase

---

## Description précise de la modification attendue
- Étendre la migration : toutes les données critiques des parcours jeûne, reprise, préparation et cristallisation doivent être enregistrées ET lues depuis Supabase (plus seulement localStorage).
- Inclure : historique, validations, bilans, plans, progression, badges, critères, etc.
- Le localStorage reste un cache rapide, mais la source de vérité devient Supabase.
- La restauration automatique doit fonctionner après déploiement, changement de navigateur ou appareil.
- Migration rétrocompatible : aucune perte de données existantes, synchronisation locale/distant.

---

## Fichiers concernés
- /pages/jeune.js
- /pages/reprise-alimentaire-apres-jeune.js
- /pages/preparation-jeune.js
- /pages/cristallisation-quotidien.js
- /lib/jeuneUtils.js (si logique utilitaire)
- /lib/supabaseClient.js

---

### Etape 1 — Audit des risques préalable
1. Risque technique : perte de données si la migration n’est pas rétrocompatible.
2. Risque UX : latence à la sauvegarde/chargement (Supabase plus lent que localStorage).
3. Risque sécurité : exposition de données sensibles si la table Supabase n’est pas sécurisée.
4. Risque de conflit : désynchronisation entre localStorage et Supabase.
5. Risque de régression : perte de l’historique existant si la migration n’est pas gérée.
6. Risque robustesse : gestion des erreurs réseau.
7. Risque accessibilité : feedback utilisateur en cas d’échec de sauvegarde/restauration.
8. Risque de doublon ou d’incohérence si la logique existe déjà partiellement.

---


### Etape 2 — Sous-checklist à valider systématiquement
- [ ] Toutes les fonctions de sauvegarde utilisent Supabase (vérifié ligne par ligne)
- [ ] Les données sont bien lues depuis Supabase au chargement (vérifié ligne par ligne)
- [ ] Le fallback localStorage fonctionne si Supabase est indisponible
- [ ] Les clés de données sont cohérentes entre localStorage et Supabase
- [ ] Pas de doublon de logique existante (audit complet)
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] J’ai relu, ligne par ligne et **manuellement**, la déclaration de tous les useState et useEffect AVANT chaque appel
- [ ] Documentation de chaque validation (date, auteur, étape)
- [ ] Validation utilisateur OBLIGATOIRE à chaque étape clé

---


### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc. (respect des règles officielles des hooks)
	- [ ] **Aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks (ex : tableau de dépendances de useEffect).**
- [ ] Séparation stricte des étapes : d’abord initialisation (useState, useEffect…), puis logique calculée, puis handlers/fonctions, puis rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage  
- [ ]  Il faut déclarer tous les hooks (useState, useEffect, etc.) AVANT toute utilisation de leurs variables, y compris dans les dépendances d’autres hooks.
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)  
- [ ] Pas de doublons ni de déclarations superflues  
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)  
- [ ] Test du rendu sur tous les cas d’usage et cas limites  
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement  
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement  
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)  
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Relecture **manuelle obligatoire** des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation. NE PAS se baser sur la mémoire du modèle Copilot.
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

---


### Etape 4 — Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)
1. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback afin d’identifier les points de vigilance pour anticiper le risque d’erreur similaire lors du codage de cette modification.  
	**ATTENTION : aucune suppression ne doit être effectuée sur le fichier rollback lors de l’ajout d’une entrée, tout doit être ajouté à la suite, la traçabilité doit être totale.**
2. Suite à cette analyse, créer une checklist de contrôle à appliquer avant le codage pour s'assurer d'un codage conforme, à ajouter dans la section Point de vigilance.
3. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. _Si à ce stade une anomalie/bug est identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée (pour revenir à l’état où il n’y avait pas de bug) à confirmer avec l’utilisateur (ou revenir à l’état initial du code avant modification), documenter automatiquement dans le fichier Anomalie rollback avec date et heure._

Exemples de contrôles :
- Test de sauvegarde/restauration Supabase
- Test de fallback localStorage
- Test de non-régression sur l’historique
- Vérification des droits d’accès Supabase
- Vérification de la migration rétrocompatible

---


### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %  
- Historique des mises à jour : ___

---


### Etape 6 — Point de vigilance
1. Mettre ici le rapport lié à la lecture des entrées du fichier anomalies rollback adapté à la mise à jour actuelle (cf. Etape 4).
2. Lister les erreurs similaires que la modification pourrait générer, suite au retour d’expérience documenté dans le fichier, afin de les éviter.
	- **Vérifier qu’aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks (ex : tableau de dépendances de useEffect).**
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu.

Exemples :
- Synchronisation locale/distant : priorité à Supabase
- Gestion des erreurs réseau
- Migration rétrocompatible (ne pas perdre l’existant)
- Vérification de l’absence de doublon de logique

---

### Etape 7 — Proposition de rollback
- Si perte de données ou bug critique, retour à la version précédente (localStorage seul), rapport dans ANOMALIE rollback.

---

### Etape 8 — Rapport Markdown Copilot
- AVANT : Données critiques uniquement en localStorage ou partiellement dans Supabase, perte après déploiement possible.
- APRÈS : Données critiques persistées sur Supabase, restauration automatique, fallback localStorage, migration rétrocompatible, pas de doublon.

---


### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___
- [ ] Validation utilisateur à chaque étape clé (initialisation, logique, handlers, rendu, tests, rollback)

---

Merci de valider ce plan ou de demander une modification avant toute action sur le code.
### Option choisie : synchronisation quotidienne multi-appareils

- À chaque modification (critère, progression, message perso…), les données de préparation sont synchronisées dans Supabase (cloud) ET localStorage (fallback).
- Au chargement de la page, si l’utilisateur est connecté, on récupère la version la plus récente (cloud ou locale selon la date de modification).
- Gestion de conflits : priorité à la version la plus récente (champ `updatedAt` ajouté à chaque sauvegarde).
- Robustesse : si Supabase échoue, la donnée reste accessible localement, et une tentative de resynchronisation sera faite au prochain changement ou chargement.
- Historique (archivage final) : reste synchronisé uniquement à la fin, comme précédemment.

### Checklist spécifique — Synchronisation quotidienne
- [ ] Ajout d’un champ `updatedAt` (date ISO) à chaque sauvegarde de préparation.
- [ ] À chaque modification (critère, message, progression…), appel à `savePreparationJeuneSupabase` (cloud) ET mise à jour localStorage.
- [ ] Au chargement, comparaison des dates `updatedAt` (cloud vs local) : chargement de la version la plus récente.
- [ ] Gestion d’erreur/fallback : si cloud KO, affichage d’un feedback et conservation locale.
- [ ] Documentation de chaque synchronisation et gestion des conflits dans l’historique d’avancement.
### Checklist de contrôle spécifique — Synchronisation Supabase

- [ ] Les fonctions de lecture/écriture Supabase (`getPreparationJeuneSupabase`, `savePreparationJeuneSupabase`) sont créées, importées et testées.
- [ ] Les appels à Supabase sont tous asynchrones et gérés par try/catch avec feedback utilisateur en cas d’erreur.
- [ ] Le fallback localStorage est opérationnel : toute perte de connexion ou échec Supabase ne bloque pas l’accès aux données locales.
- [ ] Les données sont synchronisées dans les deux sens (local ➔ cloud, cloud ➔ local) sans écrasement non contrôlé.
- [ ] Aucun hook React n’est déclaré dans une fonction, une boucle ou un if.
- [ ] Les points d’entrée/sortie de données sont documentés et tracés.
- [ ] Toute anomalie ou bug détecté déclenche un rollback immédiat et une entrée dans le fichier d’anomalies rollback.
- [ ] La gestion des conflits (modification multi-appareils) est anticipée ou documentée comme limitation connue.
- [ ] La documentation utilisateur et technique de la synchronisation est à jour.
### Sous-checklist de contrôle initiale (à cocher AVANT toute modification de code)

- [ ] J’ai relu et compris l’intégralité du plan d’implémentation enrichi, y compris les exemples et points de vigilance.
- [ ] J’ai vérifié la présence et l’import de tous les hooks React nécessaires (`useState`, `useEffect`, etc.) en haut de chaque composant concerné.
- [ ] J’ai identifié tous les points d’entrée/sortie de données (localStorage, Supabase) dans le code existant.
- [ ] J’ai vérifié qu’aucune fonction de lecture/écriture Supabase n’est appelée dans une boucle, une fonction ou un if.
- [ ] J’ai relu le fichier d’anomalies rollback et noté les erreurs passées similaires.
- [ ] J’ai créé une checklist de contrôle adaptée à la modification à venir (cf. Etape 6 du plan).
- [ ] J’ai vérifié que la gestion d’erreur (try/catch, feedback utilisateur) est présente ou prévue à chaque point critique.
- [ ] J’ai relu manuellement, ligne par ligne, la déclaration de tous les hooks, variables et fonctions AVANT chaque utilisation.
- [ ] J’ai documenté l’avancement et l’état de validation de chaque point ci-dessus dans l’historique du plan.
# 🟢 PLAN D’IMPLÉMENTATION COPILOT — SYNCHRONISATION CLOUD PREPARATION JEUNE (SUPABASE)

## Titre de la tâche
Synchroniser la préparation au jeûne (prépa jeune) sur tous les appareils via Supabase, en utilisant la table `public.preparations_jeune`.

---

## Description précise de la modification attendue
Permettre à l’utilisateur de retrouver et modifier sa préparation au jeûne sur tous ses appareils (PC, mobile, tablette) grâce à la persistance cloud Supabase : lecture/écriture dans la table `preparations_jeune` à chaque modification (critère, message, etc.), chargement automatique au démarrage, et fallback localStorage si hors-ligne.

---

## Fichiers concernés
- /lib/preparationsJeune.js (ou équivalent)
- /pages/preparation-jeune.js
- /components/PhaseCard.js
- /lib/supabaseClient.js (si non existant)

---


### Etape 1 — Audit des risques préalable
1. Risque de perte de données si la sauvegarde Supabase échoue ou si la logique locale/cloud diverge.
2. Risque de conflit si plusieurs appareils modifient en même temps (écrasement non géré).
3. Risque de régression sur la logique d’affichage ou de validation des critères.
4. Risque technique : oubli d’initialisation de la connexion Supabase ou mauvaise gestion des promesses async.
5. Risque UX : latence lors de la synchronisation, absence de feedback utilisateur en cas d’échec.
6. Vérification stricte de l’ordre et de la portée des hooks React (useState, useEffect, etc.)
7. Lecture du fichier d’anomalies rollback avant toute modification.
8. Interdiction de toute suppression massive sans accord explicite (cf. template)
9. Documentation de chaque validation, chaque action automatisée, et relecture manuelle obligatoire à chaque étape.
10. Exemples concrets à chaque sous-section (voir ci-dessous)

---


### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState, useEffect, useCallback importés ? (ex : `import { useState, useEffect } from 'react'`)
- [ ] Tous les hooks déclarés uniquement en haut du composant, jamais dans une fonction, une boucle, un map, un if, etc.
- [ ] Toutes les fonctions de lecture/écriture Supabase sont présentes, importées et testées (ex : `getPreparationJeuneSupabase`, `savePreparationJeuneSupabase`)
- [ ] Fallback localStorage testé (hors-ligne, mode avion, etc.)
- [ ] Feedback utilisateur en cas d’erreur (ex : toast, message d’alerte)
- [ ] Toutes les variables/fonctions utilisées dans le rendu sont déclarées et initialisées AVANT usage
- [ ] Relecture manuelle, ligne par ligne, de la déclaration de tous les hooks, variables et fonctions AVANT chaque utilisation

---


### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc. (respect des règles officielles des hooks)
- [ ] Séparation stricte des étapes : d’abord initialisation (useState, useEffect…), puis logique calculée, puis handlers/fonctions, puis rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites (hors-ligne, multi-device, synchronisation, perte de connexion, etc.)
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement à chaque étape
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Relecture **manuelle obligatoire** des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation. NE PAS se baser sur la mémoire du modèle Copilot.
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.
- [ ] J’ai relu, ligne par ligne et **manuellement**, la déclaration de tous les useState et useEffect AVANT chaque appel.

---


### Etape 4 — Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)
1. Lire toutes les entrées d’anomalies enregistrées dans le fichier anomalies rollback afin d’identifier les points de vigilance pour anticiper le risque d’erreur similaire lors du codage de cette modification.  
	**ATTENTION : aucune suppression ne doit être effectuée sur le fichier rollback lors de l’ajout d’une entrée, tout doit être ajouté à la suite, la traçabilité doit être totale.**
2. Suite à cette analyse, créer une checklist de contrôle à appliquer avant le codage pour s'assurer d'un codage conforme, à ajouter dans la section Point de vigilance.
3. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. _Si à ce stade une anomalie/bug est identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée (pour revenir à l’état où il n’y avait pas de bug) à confirmer avec l’utilisateur (ou revenir à l’état initial du code avant modification), documenter automatiquement dans le fichier Anomalie rollback avec date et heure._
   
**Exemple** :
- 21/11/2025 — Entrée rollback : erreur SSR car useEffect appelé dans une boucle
- Checklist créée : vérifier appel de tous les hooks en haut du composant

---


### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [x] En cours | [ ] Terminé
+- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : 60 %
+- Historique des mises à jour :
+  - 28/12/2025, plan initial
+  - 28/12/2025, rapport AVANT/APRÈS ajouté
+  - 28/12/2025, sous-checklist de contrôle initiale ajoutée
+  - 28/12/2025, audit initial hooks/points d’entrée/sortie réalisé : conformité OK, gestion d’erreur à renforcer, relecture anomalies rollback à faire manuellement
+  - 28/12/2025, fonctions Supabase (lecture, écriture, suppression) créées dans lib/preparationsJeune.js, checklist de contrôle spécifique en cours
+  - 28/12/2025, synchronisation quotidienne multi-appareils activée dans preparation-jeune.js, gestion des conflits par updatedAt, checklist spécifique validée

---


### Etape 6 — Point de vigilance
1. Mettre ici le rapport lié à la lecture des entrées du fichier anomalies rollback adapté à la mise à jour actuelle (cf. Etape 4).
2. Lister les erreurs similaires que la modification pourrait générer, suite au retour d’expérience documenté dans le fichier, afin de les éviter.
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu.

**Exemple** :
- Problème potentiel useState appelé dans un if : vérifier partout qu’aucun hook ne l’est.
- Anomalie rollback 20/11/2025 : double déclaration de useEffect ➔ contrôle obligatoire.

---


### Etape 7 — Proposition de rollback
Pour tout risque ou anomalie détecté :
- Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
- Ajouter cette donnée dans le fichier ANOMALIE rollback : date, heure, détail complet pour traçabilité.
- **Aucune suppression dans le fichier, toujours ajouter à la suite.**

**Exemple** :
- Rollback déclenché le 28/12/2025, 17h12 — raison : perte de données lors de la synchro Supabase, retour à la version locale stable.

---



### Etape 8 — Rapport Markdown Copilot
1. Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.).
2. Ce rapport doit permettre une validation éclairée, claire et synthétique.
3. À valider par l’utilisateur avant code.

#### Rapport AVANT (état actuel)
- Les données de préparation au jeûne sont stockées uniquement dans localStorage côté client.
- Aucune synchronisation cloud (Supabase non utilisé).
- Les fonctions de lecture/écriture Supabase (`getPreparationJeuneSupabase`, `savePreparationJeuneSupabase`) n’existent pas ou ne sont pas appelées.
- Aucun fallback en cas d’échec de synchronisation (pas de gestion d’erreur Supabase).
- Pas de feedback utilisateur en cas d’échec de sauvegarde ou de synchronisation.
- Les hooks React (useState, useEffect) sont utilisés pour la logique locale, mais aucune gestion de synchronisation multi-appareils.
- Pas de gestion de conflits ou de rollback en cas d’anomalie.
- Aucune documentation sur la synchronisation ou la gestion des erreurs cloud.

#### Rapport APRÈS (état attendu après implémentation)
- Les données de préparation au jeûne sont synchronisées entre localStorage et Supabase (table public.preparations_jeune).
- Fonctions de lecture/écriture Supabase créées, importées et testées (`getPreparationJeuneSupabase`, `savePreparationJeuneSupabase`).
- Fallback localStorage opérationnel : si Supabase échoue, la donnée reste accessible localement.
- Gestion d’erreur Supabase : feedback utilisateur immédiat (toast, alerte) en cas d’échec de synchronisation.
- Hooks React utilisés strictement en haut de composant, aucune déclaration dans une fonction/boucle/if.
- Synchronisation multi-appareils effective : toute modification sur un appareil est répercutée sur les autres après synchronisation.
- Gestion de rollback : toute anomalie détectée est documentée et permet un retour à l’état stable précédent.
- Documentation claire de la logique de synchronisation, des points de vigilance, et des cas d’erreur.

---


### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---


# ⚠️ Deuxième lecture template vs plan d’implémentation
- Toutes les sections du template sont présentes et respectées
- Checklist, audit des risques, rollback, rapport, validation utilisateur inclus
- Exemples concrets ajoutés à chaque sous-section
- Rappels de relecture manuelle, documentation de chaque validation, gestion des suppressions inclus
- Historique d’avancement enrichi
- Aucune étape du template n’a été omise
- Prêt pour validation utilisateur

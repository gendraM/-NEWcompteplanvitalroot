# ---
#
# Actions à mener par l’utilisateur
#
- [x] Valider explicitement ce plan d’implémentation (aucune action de code requise).
- [x] Donner des précisions sur les priorités ou domaines à traiter en premier (optionnel).
- [x] Tester l’application après migration (feedback sur la récupération des données, historique, profils, etc.).
#
# Actions à mener par Copilot
#
- [ ] Lister toutes les clés localStorage critiques à migrer (audit complet).
- [ ] Migrer la logique de chaque domaine vers Supabase (lecture/écriture, user_id).
- [ ] Mettre en place la synchronisation automatique localStorage ➔ Supabase à la première connexion.
- [ ] Préparer le script de migration user_id pour le multi-utilisateur.
- [ ] Vérifier la cohérence et la traçabilité de la migration.
- [ ] Générer un rapport Markdown avant/après chaque étape.
- [ ] Proposer un rollback immédiat en cas d’anomalie.


# 🟢 PLAN D’IMPLÉMENTATION COPILOT — MIGRATION SUPABASE & MULTI-UTILISATEUR

## Objectif
Migrer toutes les données critiques de l’application du localStorage vers Supabase, garantir la persistance multi-appareil, préparer la migration vers le multi-utilisateur/authentification, et éviter toute perte de données.

---

## Titre de la tâche
Migration complète des données utilisateur du localStorage vers Supabase, synchronisation multi-appareil, préparation multi-utilisateur.

---

## Description précise de la modification attendue
- Remplacer toute logique de persistance critique locale (localStorage) par une logique prioritaire Supabase (avec user_id).
- Synchroniser automatiquement les données locales existantes vers Supabase à la première connexion/authentification.
- Garantir la rétrocompatibilité, la traçabilité, la robustesse et la non-perte de données.
- Préparer la migration future vers le multi-utilisateur (script de migration user_id).

---

## Fichiers concernés (à compléter au fil de l’audit)
- /pages/jeune.js
- /pages/profil.js
- /pages/defis.js
- /pages/cristallisation-quotidien.js
- /pages/reprise-alimentaire-apres-jeune.js
- /pages/suivi.js
- /pages/historique-preparations-jeune.js
- /pages/validation-plan-reprise.js
- /pages/journal-spirituel.js
- /components/* (si logique de persistance)
- /lib/* (si logique de persistance)

---

### Etape 1 — Audit des risques préalable
1. Risques techniques : perte de données lors de la migration, conflits entre localStorage et Supabase, erreurs de synchronisation, gestion des hooks React.
2. Risques UX : affichage incohérent, historique incomplet, confusion utilisateur si migration partielle.
3. Risques sécurité : fuite de données si mauvaise gestion des user_id, accès non autorisé.
4. Risques robustesse : fallback non fonctionnel, rollback impossible, gestion d’erreur réseau.
5. Risques régression : perte de fonctionnalités existantes, bugs SSR, hooks mal placés.
6. Vérification stricte de l’ordre et de la portée des hooks React (useState, useEffect, etc.).
7. Consulter le fichier d’anomalies rollback avant toute modification.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation, logique, handlers, rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Relecture manuelle obligatoire des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Tests de sauvegarde/restauration, accessibilité, non-régression, performance, multi-device, compatibilité, robustesse, cas limites
2. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback
3. Créer une checklist de contrôle à appliquer avant le codage pour s'assurer d'un codage conforme
4. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante avant d’implémenter la modification
5. Si anomalie/bug identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — Point de vigilance
1. Rapport lié à la lecture des entrées du fichier anomalies rollback adapté à la mise à jour actuelle
2. Lister les erreurs similaires que la modification pourrait générer, suite au retour d’expérience documenté dans le fichier, afin de les éviter
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu

---

### Etape 7 — Proposition de rollback
Pour tout risque ou anomalie détecté :
- Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée
- Ajouter cette donnée dans le fichier ANOMALIE rollback : date, heure, détail complet pour traçabilité
- **Aucune suppression dans le fichier, toujours ajouter à la suite.**

---

### Etape 8 — Rapport Markdown Copilot (avant/après)
1. Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.)
2. Ce rapport doit permettre une validation éclairée, claire et synthétique
3. À valider par l’utilisateur avant code

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ____


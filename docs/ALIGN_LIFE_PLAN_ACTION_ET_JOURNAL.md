# Align-Life — Plan d'action & journal de passation

**Branche : `Align-Life`**  
**Statut : P0-P4 implémentés ; P4 = premier vertical slice My Way visible à tester ; P5+ non commencés.**

## Principes verrouillés
- Nom visible : **My Way** ; Boussole = concept interne.
- Mon Pourquoi reste dans `profil.pourquoi` et n'est pas dupliqué.
- My Way évolue sans formulaire obligatoire.
- Aspiration → Idéal uniquement sur choix explicite.
- LIVE réutilise les moteurs existants ; GROW part de faits observables.
- Fait ≠ tendance ≠ transformation ; `NO_INTERVENTION` reste légitime.
- Journal spirituel reste Jeûne-only.
- L'IA propose/formule ; l'utilisateur valide.
- Aucun commit sans accord explicite ; le journal accompagne chaque changement.

## Plan actif
### P0 — Gouvernance
TERMINÉ.
### P1 — UX My Way
TERMINÉ. Profil = graine ; Dashboard = entrée légère ; GROW contextuel.
### P2 — Audit technique
TERMINÉ sur `eda00ff29b60969876eba0ce60caa23e5036bbdc`.
### P2.5 + P3 — Fondation technique My Way
TERMINÉE. Commit `9bdb761401fe9537a46e6a1b21537ede03321acc`.

### P4 — My Way visible
**IMPLÉMENTÉ — À TESTER EN CONDITIONS UTILISATEUR.**

Premier vertical slice :
- entrée My Way visible uniquement sur le tableau de bord, sans nouvel onglet principal ;
- écran `/my-way` ;
- lecture de `profil.pourquoi` existant, sans duplication ;
- trois dimensions librement renseignables : direction, aspiration, incarnation ;
- ajout, modification et archivage ;
- aucun champ obligatoire ; bouton « Pas maintenant » ;
- GROW visible comme espace futur, sans permettre à l'utilisateur de s'auto-attribuer une transformation ;
- aucune IA dans P4 ;
- aucune conversion automatique aspiration → Idéal.

Choix technique : l'entrée Dashboard est injectée par `_app.js` uniquement lorsque `router.pathname === '/tableau-de-bord'`. Cela évite de modifier le très gros fichier historique `pages/tableau-de-bord.js` pour ce premier vertical slice et réduit le risque de régression. Ce raccord pourra être déplacé directement dans le Dashboard lors d'un futur refactoring ciblé si nécessaire.

### P5+
IA de reformulation, raccord Idéaux, OBSERVE, GROW, cycles et ADAPT à faire progressivement après validation utilisateur de P4.

---
# Journal chronologique
## LOG 001 — Gouvernance
Commit `d531ee315d9491c468b6865fc7d8f98e31a97b62`.
## LOG 002 — UX et naming My Way
Commit `eda00ff29b60969876eba0ce60caa23e5036bbdc`.
## LOG 003 — Audit P2
Commit `3ac4cf50c6e82b31cf1aed76b457951cd895481a`.
## LOG 004 — Fondation P2.5/P3
Commit `9bdb761401fe9537a46e6a1b21537ede03321acc`.

## LOG 005 — P4 premier My Way visible
**Date : 2 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `9bdb761401fe9537a46e6a1b21537ede03321acc`.**  
**Objectif :** rendre My Way réellement visible et testable sans ajouter une nouvelle navigation principale ni reconstruire les moteurs existants.  
**Accord utilisateur : OUI — « ok go » après annonce explicite du démarrage de P4.**  
**Fichiers inspectés :** `pages/tableau-de-bord.js`, `pages/_app.js`, `lib/myWayAPI.js`, journal Align-Life.  
**Fichiers modifiés/créés :** `pages/_app.js`, `pages/my-way.js`, `components/MyWayDashboardEntry.js`, ce journal.  
**Supabase/API/migration :** aucune migration ni changement de schéma dans P4 ; réutilisation de `profil.pourquoi` et `my_way_items` créés en P2.5/P3.  
**Avant :** fondation My Way disponible mais aucune expérience visible.  
**Après attendu :** carte My Way sur Dashboard → `/my-way` → Pourquoi existant → saisie facultative direction/aspiration/incarnation → édition/archivage.  
**Tests techniques possibles dans ce contexte :** contrôle du HEAD avant changement, cohérence statique des imports et appels API, absence de changement Supabase, vérification GitHub des fichiers après commit.  
**Tests utilisateur encore nécessaires :** ouvrir Dashboard connecté ; ouvrir My Way ; vérifier le Pourquoi ; ajouter/modifier/archiver chaque type ; recharger ; vérifier persistance ; vérifier « Pas maintenant » ; vérifier absence d'entrée My Way sur les autres pages.  
**Limite :** aucun test navigateur réel n'a été exécuté depuis cette session ; ne pas considérer P4 comme validé fonctionnellement avant test utilisateur.  
**Commit SHA / HEAD après :** à vérifier après création du commit.  
**Suite :** corriger toute anomalie P4 avant P5 ; P5 non autorisé automatiquement.

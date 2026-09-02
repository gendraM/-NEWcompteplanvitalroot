# Align-Life — Plan d'action & journal de passation

**Branche : `Align-Life`**  
**Statut : P0-P2 terminés ; P2.5/P3 implémentés et vérifiés ; P4 = prochaine étape.**

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
**TERMINÉE ET VÉRIFIÉE le 2 septembre 2026.**

Implémentation :
1. `profil` propriétaire de bout en bout : code filtré par utilisateur + RLS `auth.uid() = user_id` ;
2. `profil.user_id` est `UUID NOT NULL` ; les 3 profils préexistants avaient déjà un `user_id`, aucune ligne perdue ;
3. `profil.pourquoi` reste la source unique de Mon Pourquoi ;
4. `my_way_items` créé avec ownership strict, types direction/aspiration/incarnation/grow, source, statut et timestamps ;
5. `lib/myWayAPI.js` fournit le premier accès applicatif à Mon Pourquoi et aux éléments My Way ;
6. aucune UX My Way visible dans ce sprint.

Vérifications : 3/3 profils conservés ; RLS active sur `profil` et `my_way_items` ; policies propriétaire présentes ; table My Way initialement vide ; advisor sécurité sans alerte sur ces deux tables. Les alertes historiques restantes sont hors périmètre.

### P4 — My Way visible
**PROCHAINE ÉTAPE.** Entrée Dashboard → écran My Way → Mon Pourquoi existant → premiers éléments ajoutables/modifiables/archivables → droit de ne rien compléter.

### P5+
IA, Idéaux, OBSERVE, GROW, cycles et ADAPT à faire progressivement.

---
# Journal chronologique
## LOG 001 — Gouvernance
Commit `d531ee315d9491c468b6865fc7d8f98e31a97b62`.
## LOG 002 — UX et naming My Way
Commit `eda00ff29b60969876eba0ce60caa23e5036bbdc`.
## LOG 003 — Audit P2
Commit `3ac4cf50c6e82b31cf1aed76b457951cd895481a`.

## LOG 004 — Premier sprint technique P2.5/P3
**Date : 2 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `3ac4cf50c6e82b31cf1aed76b457951cd895481a`.**  
**Objectif :** fondation réelle de My Way + garde-fou Profil.  
**Accord utilisateur : OUI — « ok go », puis « ok continue ».**  
**Fichiers :** `pages/profil.js`, `lib/myWayAPI.js`, `migrations/20260902_my_way_foundation.sql`, ce journal.  
**Supabase :** migration `my_way_foundation` appliquée au projet connecté.  
**Avant :** Profil sans ownership explicite de bout en bout ; policies permissives ; aucun stockage My Way.  
**Après :** Profil lié au compte connecté + RLS propriétaire ; stockage My Way isolé ; Mon Pourquoi non dupliqué.  
**Tests :** 3/3 profils conservés avec `user_id`; `profil.user_id` non nullable ; structure My Way vérifiée ; RLS et policies vérifiées ; 0 donnée My Way artificielle ; advisor sécurité exécuté.  
**Résultat : SUCCÈS sur P2.5/P3.**  
**Anomalies hors périmètre :** anciennes alertes RLS sur `parcours_jeune`, `bilans_jeune`, `referentiel_user_custom` et autres avertissements historiques ; non modifiés.  
**Commit SHA / HEAD après :** à vérifier après création du commit.  
**Suite : P4 My Way visible ; non autorisée automatiquement.**

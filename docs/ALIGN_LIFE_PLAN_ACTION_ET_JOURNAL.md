# Align-Life — Plan d'action & journal de passation

**Branche : `Align-Life`**  
**Statut : P0-P4.5 validés ; P5 Incarnation/ALIGN implémenté, validation Vercel à faire ; OBSERVE/GROW comportemental non commencé.**

## Principes verrouillés
- Nom visible : **My Way** ; Boussole = concept interne.
- Mon Pourquoi reste dans `profil.pourquoi` et n'est pas dupliqué.
- My Way évolue sans formulaire obligatoire.
- **Ne jamais exposer toutes les dimensions My Way d'un coup au premier accès.**
- Parcours : graine → ouverture → « je sais déjà / je découvre en avançant » → dévoilement progressif.
- **Incarnation ≠ questionnaire obligatoire : elle peut être exprimée volontairement ou révélée plus tard par le réel.**
- **Direction → Incarnation est un chemin direct ; l'aspiration n'est pas un prérequis.**
- **ALIGN montre à la fois ce qui est déjà vécu et ce qui reste à construire ; il ne fabrique pas un problème.**
- **L'IA P5 propose des incarnations possibles mais ne prétend jamais savoir ce que l'utilisateur vit déjà.**
- Aspiration → Idéal uniquement sur choix explicite.
- GROW n'apparaît que lorsqu'il existe réellement une preuve à afficher.
- LIVE réutilise les moteurs existants ; fait ≠ tendance ≠ transformation.
- Journal spirituel reste Jeûne-only.
- **L'IA P4.5 est un miroir sémantique : elle propose/formule, l'utilisateur garde ses mots, modifie ou valide.**
- **Toute idée d'une reformulation P4.5 doit être traçable au texte utilisateur ; le contexte Pourquoi ne doit pas enrichir la direction.**
- Aucun remplacement silencieux du texte utilisateur par l'IA.
- Aucun commit sans accord explicite ; le journal accompagne chaque changement.

## Plan actif
### P0-P4
TERMINÉS et validés.

### P4.5 — Reformulation IA de la direction
**TERMINÉ et validé par test utilisateur le 6 septembre 2026.**
- direction uniquement ;
- endpoint serveur authentifié ; clé OpenAI serveur ;
- clarification sans invention ;
- proposition modifiable ;
- validation explicite ;
- parcours manuel conservé si IA indisponible.

### P5 — Incarnation / premier ALIGN
**Implémenté ; validation Vercel à faire.**
- l'incarnation est accessible directement depuis une direction validée ;
- elle ne dépend plus de l'existence d'une aspiration ;
- l'utilisateur peut ignorer cette étape et continuer son parcours ;
- un endpoint IA distinct de P4.5 traduit la direction en 2 à 4 incarnations possibles ;
- ces propositions sont explicitement présentées comme des pistes, jamais comme des constats ;
- avant validation d'une incarnation, l'utilisateur peut indiquer très légèrement sa réalité actuelle : « déjà souvent / parfois / pas encore vraiment / je ne sais pas » ;
- la même proposition peut donc faire apparaître un alignement déjà présent ou quelque chose à construire, sans score de personne ;
- validation explicite avant persistance en `my_way_items` ;
- aucune nouvelle table ni migration Supabase ;
- aucun détecteur repas/extra n'est branché dans P5 : les constats automatiques devront venir d'OBSERVE déterministe après audit de fiabilité.

### P6+
- La vie que je veux créer / aspirations.
- Raccordement sélectif aspiration → Idéaux sur choix utilisateur.
- LIVE réutilise l'existant.
- OBSERVE/DETECT déterministe.
- DECIDE/ALIGN/ADAPT avec `NO_INTERVENTION` valide.
- GROW avec hiérarchie de preuves fait → répétition → tendance → transfert → autonomie.

---
# Journal chronologique
## LOG 001 — Gouvernance
Commit `d531ee315d9491c468b6865fc7d8f98e31a97b62`.
## LOG 002 — UX et naming
Commit `eda00ff29b60969876eba0ce60caa23e5036bbdc`.
## LOG 003 — Audit P2
Commit `3ac4cf50c6e82b31cf1aed76b457951cd895481a`.
## LOG 004 — Fondation P2.5/P3
Commit `9bdb761401fe9537a46e6a1b21537ede03321acc`.
## LOG 005 — P4 initial
Commit `4fc25cb903e3d629fb187cbb725fd27e939c00a0`.
## LOG 006 — Correction UX P4 progressive
Commit `4283c9a1166955caa442b00ec19c85835a724fa8`. Validation utilisateur : OUI.
## LOG 007 — P4.5 Reformulation IA My Way
Commits `bc087f12d250c281a1aa82ee0170d9fb2e25bef5`, `f64f3e9aea230e4fc92c4fab2b2ba2f35c5d5ef7`, `8c34b54f963aec677c85e9c15943ebb83ecad5d9`, journal `530f4bda872464bfd7f304ed609a4e6311271532`.
**Validation utilisateur finale : OUI — 6 septembre 2026 : « C'est bon, ça fonctionne, j'ai fait les tests, c'est OK. »**

## LOG 008 — P5 Incarnation / ALIGN
**Date : 6 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `530f4bda872464bfd7f304ed609a4e6311271532`.**  
**Accord utilisateur pour commit : OUI — « ok tu peux commit ».**  
**Décision fonctionnelle :** ne pas transformer My Way en questionnaire de coaching. L'incarnation peut être posée si elle est déjà claire ou découverte plus tard par le réel. Le premier ALIGN distingue ce qui est déjà vécu de ce qui reste à construire.  
**Implémentation :** endpoint IA P5 séparé ; propositions d'incarnations à partir de la direction validée ; mini-positionnement de réalité actuelle ; validation explicite avant persistance ; Direction → Incarnation direct ; Aspiration reste une branche indépendante.  
**Limite volontaire :** aucun constat automatique à partir des repas/extras tant que le futur OBSERVE déterministe n'est pas audité et raccordé.  
**Migration Supabase : AUCUNE.**  
**Tests :** validation Vercel utilisateur à faire après déploiement.

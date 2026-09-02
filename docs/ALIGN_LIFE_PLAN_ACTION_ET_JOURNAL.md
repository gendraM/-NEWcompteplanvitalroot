# Align-Life — Plan d'action & journal de passation

**Branche : `Align-Life`**  
**Statut : P0-P4 validés ; P4.5 reformulation IA My Way en cours ; P5 OBSERVE/GROW non commencé.**

## Principes verrouillés
- Nom visible : **My Way** ; Boussole = concept interne.
- Mon Pourquoi reste dans `profil.pourquoi` et n'est pas dupliqué.
- My Way évolue sans formulaire obligatoire.
- **Ne jamais exposer toutes les dimensions My Way d'un coup au premier accès.**
- Parcours : graine → ouverture → « je sais déjà / je découvre en avançant » → dévoilement progressif.
- Aspiration → Idéal uniquement sur choix explicite.
- GROW n'apparaît que lorsqu'il existe réellement une preuve à afficher.
- LIVE réutilise les moteurs existants ; fait ≠ tendance ≠ transformation.
- Journal spirituel reste Jeûne-only.
- **L'IA est un miroir sémantique : elle propose/formule, l'utilisateur garde ses mots, modifie ou valide.**
- Aucun remplacement silencieux du texte utilisateur par l'IA.
- Aucun commit sans accord explicite ; le journal accompagne chaque changement.

## Plan actif
### P0-P3
TERMINÉS. Fondation technique commit `9bdb761401fe9537a46e6a1b21537ede03321acc`.

### P4 — My Way visible
Premier commit P4 : `4fc25cb903e3d629fb187cbb725fd27e939c00a0`.
Correction UX progressive : `4283c9a1166955caa442b00ec19c85835a724fa8`.
**Validation utilisateur : OUI — test visuel/fonctionnel confirmé avant lancement P4.5.**

### P4.5 — Reformulation IA de la direction
**Périmètre minimal :**
- uniquement `direction` / « Qui je choisis de devenir » ;
- endpoint serveur authentifié par session Supabase ;
- clé OpenAI uniquement serveur via `OPENAI_API_KEY` ;
- modèle configurable via `OPENAI_MY_WAY_MODEL`, défaut coût-efficace ;
- texte brut + Pourquoi facultatif envoyés au modèle ;
- consigne stricte : clarifier sans inventer ni classifier automatiquement ;
- proposition modifiable avant validation ;
- choix explicites « Oui, ça me ressemble », « Garder mes mots », « Revenir » ;
- pour un texte déjà enregistré : bouton « Clarifier avec My Way » ;
- aucune nouvelle table, aucune migration Supabase, aucun chatbot ;
- en cas d'indisponibilité IA, le parcours manuel reste utilisable.

### P5+
OBSERVE/GROW, aspiration→Idéal et autres usages IA restent hors P4.5.

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
**Date : 2 septembre 2026.**  
**HEAD avant : `4fc25cb903e3d629fb187cbb725fd27e939c00a0`.**  
**Accord utilisateur : OUI — « ok fais la correction » puis « ok go ».**  
**Commit après : `4283c9a1166955caa442b00ec19c85835a724fa8`.**  
**Validation utilisateur : OUI — « ok cbon la suite ».**

## LOG 007 — P4.5 Reformulation IA My Way
**Date : 2 septembre 2026.**  
**Branche : `Align-Life`.**  
**HEAD avant : `4283c9a1166955caa442b00ec19c85835a724fa8`.**  
**Déclencheur :** test utilisateur avec une direction libre longue et non structurée ; besoin que l'IA puisse la clarifier sans déposséder l'utilisateur de ses mots.  
**Accord utilisateur : OUI — « ok go ».**  
**Audit :** aucun dossier `pages/api` existant ; Next.js 15 déjà installé ; Supabase JS déjà disponible ; `my_way_items.source` accepte déjà `user`/`ai` ; aucune dépendance OpenAI existante.  
**Choix technique :** appel direct à la Responses API depuis une route serveur Next.js afin d'éviter une dépendance supplémentaire ; authentification de la route avec le bearer Supabase de l'utilisateur ; aucune clé OpenAI côté navigateur.  
**Fichiers :** ajout `pages/api/my-way/reformulate.js`, ajout `lib/myWayAI.js`, modification `pages/my-way.js`, mise à jour de ce journal.  
**UX :** nouvelle direction → « M'aider à clarifier » ou « Garder mes mots » ; direction existante → « Clarifier avec My Way » ; proposition toujours éditable avant validation.  
**Persistance :** texte utilisateur conservé si « Garder mes mots » ; proposition IA enregistrée uniquement après validation explicite (`source: ai`).  
**Fallback :** si API non configurée ou indisponible, message non bloquant et saisie manuelle toujours disponible.  
**Migration Supabase : AUCUNE.**  
**Pré-requis déploiement :** variable serveur Vercel `OPENAI_API_KEY`; `OPENAI_MY_WAY_MODEL` facultative.  
**Test à faire après commit :** build Vercel ; session authentifiée ; reformulation d'une direction existante ; retour JSON ; modification de proposition ; validation ; conservation des mots ; comportement quand clé absente.  
**Commit SHA / HEAD après :** à renseigner après création du commit.

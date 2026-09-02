# Align-Life — Plan d'action & journal de passation

**Branche : `Align-Life`**  
**Statut : P0-P3 terminés ; P4 implémenté puis corrigé après test UX ; correction prête à committer/tester.**

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
- L'IA propose/formule ; l'utilisateur valide.
- Aucun commit sans accord explicite ; le journal accompagne chaque changement.

## Plan actif
### P0-P3
TERMINÉS. Fondation technique commit `9bdb761401fe9537a46e6a1b21537ede03321acc`.

### P4 — My Way visible
Premier commit P4 : `4fc25cb903e3d629fb187cbb725fd27e939c00a0`.

**ANOMALIE UX détectée par test utilisateur :** le premier écran exposait simultanément Pourquoi, direction, aspiration, incarnation et un bloc GROW vide. Même facultatifs, ces blocs donnaient l'impression d'un questionnaire à compléter, en contradiction avec la conception progressive validée.

**Correction préparée :**
- premier accès sans contenu personnel : Pourquoi + une seule ouverture ;
- choix explicite : « J'ai déjà une idée » ou « Je veux la découvrir en avançant » ;
- voie découverte : aucun autre champ ; retour au parcours normal ;
- voie « je sais » : seulement la direction s'ouvre ;
- aspiration proposée seulement après qu'une direction existe et via une invitation légère ;
- incarnation proposée seulement après qu'une aspiration existe ;
- les éléments existants restent visibles et éditables ;
- GROW totalement masqué s'il n'existe aucun élément GROW réel ;
- aucune migration, aucun changement Supabase, aucun changement Navigation/Dashboard dans cette correction.

### P5+
NON COMMENCÉS. Ne pas passer à P5 avant validation utilisateur de P4 corrigé.

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
**Branche : `Align-Life`.**  
**HEAD avant : `4fc25cb903e3d629fb187cbb725fd27e939c00a0`.**  
**Déclencheur :** test utilisateur : « tout est dedans » dès l'ouverture de My Way.  
**Diagnostic :** concepts corrects mais exposés simultanément ; comportement non conforme au parcours progressif documenté.  
**Accord utilisateur : OUI — « ok fais la correction ».**  
**Fichiers inspectés :** `pages/my-way.js`, journal.  
**Fichiers préparés :** `pages/my-way.js`, journal.  
**Supabase/migration : AUCUN changement.**  
**Comportement attendu après :** Pourquoi seul + choix de maturité ; dévoilement des dimensions uniquement lorsqu'elles deviennent pertinentes ou sont déjà renseignées ; GROW masqué tant qu'il est vide.  
**Compatibilité données :** les items My Way déjà saisis ne sont ni supprimés ni transformés ; ils restent visibles selon leur type.  
**Tests avant commit :** revue statique du flux et de la compatibilité API ; test navigateur nécessitera le déploiement Vercel après commit.  
**Commit SHA / HEAD après :** en attente d'autorisation explicite de commit.  
**Suite :** déployer/tester P4 corrigé ; aucune progression P5 avant validation.

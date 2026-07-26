# A lire avant mise en public

## Contexte actuel

Ce projet est encore en phase test.

- Push sur GitHub: OK pour sauvegarder et collaborer.
- Mise en public multi-utilisateur: PAS encore prete en l'etat.

Important:
- Push sur GitHub != mise en production publique.
- Le push n'expose pas automatiquement l'application aux utilisateurs finaux.

## Ce qui est safe maintenant

- Continuer les tests en environnement de dev.
- Pousser les branches de travail sur GitHub.
- Faire des merges progressifs avec validation fonctionnelle.

## Ce qui n'est pas safe pour un lancement public immediat

- Architecture melangee entre anciens patterns NO AUTH et nouveaux patterns AUTH.
- Verification RLS/policies incomplète table par table.
- Au moins une migration a verifier/corriger avant industrialisation.
- Certains flux doivent encore etre valides en scenario multi-comptes reels.

## Points critiques a valider AVANT ouverture publique

1. Migrations
- Verifier que toutes les migrations sont valides et rejouables.
- Corriger immediatement tout fichier de migration incomplet/corrompu.

2. Securite base de donnees
- Activer et verifier RLS sur les tables sensibles.
- Verifier les policies: chaque utilisateur ne voit que ses donnees.
- Tester explicitement qu'aucune fuite inter-utilisateur n'est possible.

3. Cohérence code Auth
- Uniformiser les acces utilisateur via AuthContext/Supabase Auth.
- Eliminer les restes de patterns user_id fixe ou logique NO AUTH obsolete.

4. Requetes applicatives
- Verifier les requetes critiques (profil, repas, parcours, bilans):
  filtrage par user_id obligatoire, sauf tables purement referentielles publiques.

5. Tests de non-regression multi-utilisateur
- Compte A: cree/edite/consulte ses donnees.
- Compte B: ne voit jamais les donnees du compte A.
- Deconnexion/reconnexion: session stable et donnees coherentes.

6. Observabilite minimale
- Journaliser les erreurs critiques de connexion/session/requetes.
- Definir une procedure rollback simple en cas d'incident post-deploiement.

## Decision pratique pour maintenant

- Oui: push GitHub pour continuer le travail en test.
- Non: ne pas annoncer l'app comme publique multi-utilisateur tant que la checklist ci-dessus n'est pas validee.

## Plan court "go public" (au bon moment)

1. Geler la branche candidate release.
2. Executer audit securite (RLS, policies, user_id) et corriger.
3. Executer tests multi-comptes A/B complets.
4. Rejouer migrations sur environnement propre.
5. Valider avec une checklist PASS/FAIL signee.
6. Deployer progressivement (beta), puis ouverture publique.

## Statut

- Statut actuel: TEST / PRE-PROD
- Statut attendu pour lancement: PUBLIC READY (apres checklist validee)

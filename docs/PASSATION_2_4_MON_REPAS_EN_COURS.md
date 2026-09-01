# Passation sous-lot 2.4 — Mon repas en cours

## Statut

Sous-lot **implémenté et validé techniquement** sur la branche `plan-alimentaire-intelligent-chatgpt`.

La validation fonctionnelle authentifiée reste à réaliser sur la prévisualisation de branche avant de déclarer ce sous-lot terminé.

## Comportement ajouté

- Le parcours mono-aliment historique reste disponible avec `Enregistrer ce repas` lorsque le repas en cours est vide.
- `RepasBloc` peut transmettre un aliment déjà validé à `suivi.js` avec `+ Ajouter un autre aliment`.
- `suivi.js` conserve les aliments par date et type de repas.
- La zone `Mon repas en cours` affiche les lignes, permet leur retrait et calcule le total calorique.
- La finalisation construit plusieurs lignes partageant le même `occurrence_repas_id`, puis utilise le `handleSaveRepas` commun.
- À partir de deux aliments compatibles avec le modèle existant, l'assiette peut facultativement être nommée et enregistrée dans `repas_complets` pour être réutilisée.
- En cas d'échec d'insertion du repas réel, le repas en cours n'est pas effacé.

## Fichiers concernés

- `components/RepasBloc.js` : callback étroit d'ajout d'un aliment validé ; comportement mono préservé.
- `components/RepasEnCours.js` : présentation et finalisation de l'assiette.
- `pages/suivi.js` : état du repas en cours, orchestration, persistance et création facultative du modèle.
- `lib/repasEnCours.js` : clé date/type et construction du payload multi-lignes avec contexte commun.
- `tests/repasEnCours.test.js` et `tests/repasEnCoursInterface.test.js` : contrat métier et raccord d'interface.

## Périmètre volontairement inchangé

- chemin `Repas conforme au planning` ;
- `SaisieRepasCompose` ;
- parcours reprise alimentaire et défi alimentaire ;
- lecture des plans composés ;
- schéma et politiques Supabase ;
- branche `main`.

## Validations techniques

- tests ciblés repas en cours/persistance/interface : 15/15 réussis ;
- suite Jest complète : 168/168 réussis ;
- build Next.js réussi ;
- `/suivi` compilé et réponse HTTP 200 en serveur local ;
- contrôle navigateur automatisé indisponible dans l'environnement Work (`agent-browser` absent).

## Validation utilisateur attendue

1. vérifier que l'enregistrement direct d'un seul aliment fonctionne toujours ;
2. ajouter deux aliments à `Mon repas en cours` ;
3. retirer puis ajouter de nouveau un aliment ;
4. finaliser l'assiette et vérifier le message de réussite ;
5. recommencer en cochant l'enregistrement réutilisable et en donnant un nom ;
6. vérifier que le repas nommé apparaît dans les repas composés disponibles.

Après cette validation, le sous-lot pourra être clôturé. Le chemin `Repas conforme au planning` restera le prochain raccord distinct.

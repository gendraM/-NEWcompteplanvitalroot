# Plan d'implémentation — Lot Fruits

Date : 2026-09-10
Branche : `referentiel-alimentaire`

## Objectif
Enrichir `fruit` avec les fruits frais réellement manquants, sans doublon et sans modifier le comportement existant.

## Déjà présents vérifiés
Banane, Pomme, Raisin, Fruits rouges, Orange / Clémentine, Mangue, Kiwi, Ananas (frais), Papaye, Fraises, Framboises, Myrtilles, Abricots (frais), Prunes, Pêche, Nectarine.

Anomalie historique hors périmètre : `Kiwi` existe deux fois avec des valeurs différentes. Ne pas supprimer/corriger dans ce lot.

## Candidats
Pêche plate; Brugnon; Cerise; Mirabelle; Quetsche; Mûre; Cassis; Groseille; Grenade; Fruit de la passion; Goyave; Litchi; Kaki; Figue fraîche; Carambole; Corossol; Pitaya (fruit du dragon); Physalis; Nèfle; Pastèque; Melon; Pomelo / Pamplemousse; Citron; Citron vert; Mandarine; Noix de coco fraîche.

## Anti-doublon obligatoire
- Contrôle exact du nom, casse ignorée.
- Contrôle singulier/pluriel, accents et synonymes.
- Une seule entrée pour un synonyme nutritionnellement identique (ex. pitaya/fruit du dragon).
- Pas de raisin blanc/noir/rouge si `Raisin` générique suffit.
- Aucun nettoyage/suppression historique dans ce lot.

## Contrat nouvel aliment
- `categorie: "fruit"`.
- Sous-catégorie existante et cohérente.
- Calories correspondant exactement à la portion par défaut.
- `qn: 5` pour fruit frais brut (doctrine validée : 1 transformé, 5 naturel).
- Portion concrète et unité compatible avec le moteur actuel.
- `kcalParUnite` cohérent.
- Alternatives uniquement vers des aliments existants.
- Conserver les conventions actuelles de repas/moment.

## Sources
Priorité ANSES Ciqual pour les données génériques. Si une référence n'y est pas suffisamment détaillée, source nutritionnelle institutionnelle reconnue. Aucune valeur inventée.

## Périmètre
Modification autorisée : ajout chirurgical dans `data/referentiel.js`.
Aucune modification de `main`, `RepasBloc.js`, `socleQuantitesCalories.js`, `useUserReferentiel.js`, Supabase, catégories historiques ou anciennes entrées Fruits. Aucune suppression.

## Vérifications avant commit d'implémentation
1. Zéro candidat déjà présent ou synonyme équivalent.
2. Zéro nouvel exact doublon.
3. Toutes les alternatives existent.
4. Portions/kcal/unités cohérentes.
5. QN 5 sur chaque fruit brut ajouté.
6. Noms retrouvables par l'autocomplete existant.
7. Aucune entrée historique modifiée.
8. Build/tests existants si l'environnement connecté permet leur exécution.
9. Diff final limité au lot Fruits et à sa documentation.

## Rollback
Commit autonome, réversible par revert sans nettoyage destructif.

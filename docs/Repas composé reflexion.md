# Réflexion Fonctionnalité : Repas Composé

## Objectif
Permettre à l’utilisateur de créer, enregistrer et réutiliser facilement des repas composés de plusieurs aliments, avec calcul automatique des valeurs nutritionnelles.

---

## 1. Constat Actuel

- **Saisie classique** : L’utilisateur ajoute chaque aliment un par un dans RepasBloc.js.
- **Pas de notion de repas composé** : Impossible d’enregistrer ou de réutiliser une assiette/repas multi-aliments en une seule action.
- **Référentiel** : Utilisation d’un référentiel central enrichi, possibilité d’ajouter des aliments personnalisés.

---

## 2. Idées et besoins identifiés

- Permettre la création de repas composés, sauvegardables et réutilisables.
- Calcul automatique des totaux nutritionnels (kcal, QN, macros).
- Interface fluide : ajout multi-aliments, quantités, autocomplete.
- Réutilisation rapide dans la saisie réelle et la planification.

---

## 3. Proposition de workflow utilisateur

1. **Accès** : Bouton « Créer un repas/assiette composée » dans la zone de saisie des repas.
2. **Création** :
   - Saisie du nom du repas composé.
   - Ajout de plusieurs aliments (autocomplete sur chaque ligne).
   - Saisie des quantités/unités pour chaque aliment.
   - Ajout de lignes supplémentaires à volonté.
3. **Aperçu dynamique** :
   - Calcul automatique et affichage des totaux nutritionnels (kcal, protéines, glucides, lipides, QN moyen, etc.).
4. **Sauvegarde** :
   - Enregistrement du repas composé (option « favori »).
   - Stockage dans une table dédiée (ex : `repas_composes`).
5. **Réutilisation** :
   - Repas composés proposés dans l’autocomplete ou une liste dédiée lors de la saisie d’un repas ou dans la planification.
   - Ajout en un clic de tous les aliments du repas composé.

---

## 4. Points techniques à prévoir

- **Schéma de données** :
  - Table `repas_composes` : id, nom, liste d’aliments [{alimentId, nom, quantité, unité}], totaux nutritionnels.
- **Calcul automatique** :
  - À chaque modification, recalculer les totaux à partir du référentiel enrichi (et des aliments custom).
- **Composant UI** :
  - Modal ou page dédiée pour la création/édition de repas composés.
  - Affichage dynamique des totaux.
- **Favoris et duplication** :
  - Possibilité de dupliquer/modifier un repas composé existant.
  - Marquer certains repas comme favoris.

---

## 5. Expérience utilisateur attendue

- **Fluidité** : Moins de clics, moins de ressaisies.
- **Personnalisation** : Référentiel enrichi par l’utilisateur, repas favoris accessibles.
- **Cohérence** : Même logique autocomplete/calcul partout (RepasBloc.js, plan.js).
- **Réutilisabilité** : Repas composés proposés dans la planification et la saisie réelle.

---

## 6. Prochaines étapes

- Définir le schéma de données pour `repas_composes`.
- Créer le composant pour la création/édition de repas composés.
- Intégrer le calcul automatique des totaux.
- Ajouter la logique de sauvegarde et de réutilisation.

---
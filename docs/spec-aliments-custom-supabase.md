# Spécification : Ajout et gestion des aliments personnalisés (Supabase)

## Règles fonctionnelles
- Lorsqu’un utilisateur ajoute un aliment personnalisé :
  - Il est visible **immédiatement** dans son autocomplete (privé, non visible des autres).
  - Il est **persisté** dans la table Supabase `aliments_custom` (ou équivalent).
  - Un champ `status` (par exemple : `"pending"`, `"approved"`, `"rejected"`) permet la modération.
- Les modérateurs peuvent voir tous les aliments custom, et approuver/rejeter.
- Si un aliment est approuvé, il devient disponible pour tous (fusionné dans le référentiel global).
- Tant qu’il n’est pas approuvé, il reste visible **uniquement** pour son créateur (et les modérateurs).

## Table Supabase : aliments_custom
- id (uuid ou int, PK)
- user_id (uuid, FK vers users)
- nom (string)
- categorie (string)
- sous_categorie (string)
- unite (string)
- quantite (number)
- kcal (number)
- qn (number)
- portion_defaut (number)
- marque (string, optionnel)
- alternatives (string, optionnel)
- status (string: 'pending', 'approved', 'rejected')
- date_creation (timestamp)

## Flux utilisateur
1. Ajout → status = 'pending', visible pour l’utilisateur et les modérateurs.
2. Modérateur approuve → status = 'approved', visible pour tous (fusionné dans le global).
3. Modérateur rejette → status = 'rejected', visible seulement pour l’utilisateur (optionnel).

## Sécurité/UX
- L’utilisateur ne voit **que** ses propres aliments custom non approuvés.
- Les modérateurs voient tout.
- Les aliments approuvés sont fusionnés dans le référentiel global (autocomplete pour tous).

---

**À implémenter :**
- Ajout dans Supabase à la création.
- Récupération filtrée (user_id OU status = 'approved').
- Rafraîchissement du référentiel après ajout.
- Préparer la logique de modération (interface à venir).

# Extras — constance récente

## Branche et intégration

- Branche de travail : `extras-constance-recente`
- Branche cible : `main-consolidation`
- Pull request : #7
- Ne pas fusionner dans `main`.

## Règles métier implémentées

- Palier 5 vers 3 : 4 semaines respectées parmi les 5 dernières.
- Palier 3 vers 2 : 8 semaines respectées parmi les 10 dernières.
- Palier 2 vers 1 : 12 semaines respectées parmi les 15 dernières.
- Une semaine non fiable reste visible mais ne fait pas progresser.
- Trois semaines consécutives au-dessus du nombre de moments adaptent le palier vers le haut.
- Après une adaptation, les anciennes semaines ne permettent pas une descente immédiate.
- Les badges déjà obtenus restent permanents.
- Un retour à un palier enrichit l'histoire du badge sans créer de doublon.

## États affichés

- CREATE : Je crée ce rythme.
- ALIGN : Je maintiens ce rythme.
- ADAPT : Mon rythme s'adapte.
- GROW : Je retrouve mon rythme.

## Persistance

La table `public.extras_palier_events` conserve les événements :

- `first_reached`
- `reached_again`
- `adapted_up`

La migration est appliquée sur le projet Supabase Becomingtherealme. La table utilise RLS avec accès limité au propriétaire. Les lignes ne sont pas modifiables ou supprimables depuis le client.

## Vérifications

- 20 tests ciblés réussis.
- Badge historique du palier 3 repris en événement `first_reached`.
- PR sans conflit avec `main-consolidation`.
- Build Vercel et contrôle visuel à valider avant fusion.

# Mise en conformité Extras — badges de palier

## Décision fonctionnelle

Le badge Extras matérialise un changement réel de palier dans le chemin `5 → 3 → 2 → 1`.
Il ne remplace ni la carte Budget Extras ni le message continu « Mon chemin » : il célèbre ponctuellement le cap puis reste consultable dans le tableau de bord.

## Condition d’attribution

Une semaine contribue au badge uniquement si :

- elle est validée ;
- le nombre de moments d’extra respecte le palier appliqué cette semaine-là ;
- les calories des extras respectent le budget calorique figé de cette semaine.

Une semaine non conforme met la progression en pause sans supprimer les semaines déjà acquises. Elle ne figure pas parmi les preuves du badge.

## Comportement utilisateur

1. L’utilisateur valide sa semaine et consulte son bilan hebdomadaire.
2. Si cette validation déclenche un changement de palier, le badge `Nouveau rythme` est enregistré automatiquement.
3. À la fermeture du bilan, une célébration ponctuelle présente le nouveau palier.
4. Le badge reste dans `Tableau de bord → Mon chemin · Extras`.
5. Un clic affiche :
   - la date d’obtention ;
   - le palier de départ et le palier atteint ;
   - le nombre de semaines nécessaires ;
   - chaque semaine ayant réellement contribué ;
   - les moments et calories de la semaine décisive.

## Source de vérité

- `lib/extrasProgression.js` calcule les paliers, les semaines acquises et les transitions.
- `semaines_validees` fournit les données hebdomadaires figées.
- `badges` conserve un badge unique par `user_id + code` avec ses preuves dans `details`.
- `lib/extrasBadges.js` est le raccord unique d’enregistrement des badges Extras.

## Sécurité et non-régression

- La table `badges` applique RLS avec lecture, création et mise à jour limitées au propriétaire.
- Le badge `extras-palier-3`, `extras-palier-2` ou `extras-palier-1` ne peut être enregistré qu’une fois par utilisateur.
- `badges_cristallisation` reste séparée et n’est pas utilisée par le parcours Extras.
- Les badges de défis existants utilisent désormais la même table générique avec leur propre type et leur propre code.

## Vérifications

- Tests ciblés Extras : 8/8 réussis.
- Suite complète : 25 suites, 203 tests réussis.
- Build Next.js 15.5.7 : réussi.
- Table Supabase active : créée, RLS activé, politiques propriétaire `SELECT`, `INSERT`, `UPDATE` présentes.

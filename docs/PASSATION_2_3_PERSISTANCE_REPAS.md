# Passation sous-lot 2.3 — persistance repas mono / multi

## Statut

Préparation technique versionnée sur la branche `plan-alimentaire-intelligent-chatgpt`.

Le sous-lot 2.3 n'est **pas encore déclaré raccordé ni terminé** : `pages/suivi.js` n'est pas modifié dans ce commit, afin d'éviter une réécriture intégrale risquée de ce fichier sensible avec l'outil d'édition actuellement disponible.

## Éléments ajoutés

- `lib/repasPersistence.js` : normaliseur pur acceptant soit l'objet historique mono-aliment, soit un tableau de lignes.
- Chaque ligne reçoit `user_id` depuis sa valeur existante ou depuis l'utilisateur de session fourni au normaliseur.
- Les propriétés métier existantes, dont `occurrence_repas_id`, restent inchangées.
- Le tableau vide et les entrées invalides sont refusés explicitement.
- `tests/repasPersistence.test.js` couvre le contrat mono-ligne, le multi-lignes, la conservation d'un `user_id` explicite et les entrées invalides.

## Micro-raccord restant dans `pages/suivi.js`

Ajouter :

```js
import { normaliserRepasPourPersistance } from '../lib/repasPersistence';
```

Puis, dans `handleSaveRepas`, remplacer la construction actuelle de `repasPayload` et `.insert([repasPayload])` par :

```js
const repasPayloads = normaliserRepasPourPersistance(repasData, user?.id || null);

const { data, error } = await supabase
  .from('repas_reels')
  .insert(repasPayloads);
```

Aucun changement UX n'est prévu dans ce micro-raccord. `RepasBloc` reste intact.

## Validation attendue après raccord

1. ancien appel mono-aliment toujours fonctionnel ;
2. tableau multi-aliments accepté ;
3. `user_id` appliqué ligne par ligne ;
4. `occurrence_repas_id` conservé ;
5. erreur Supabase sans succès mensonger ;
6. suite Jest complète ;
7. build Next.js/Vercel.

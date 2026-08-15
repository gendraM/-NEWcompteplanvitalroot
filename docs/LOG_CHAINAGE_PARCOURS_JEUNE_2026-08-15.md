# Journal de passation — Chaînage du parcours jeûne

**Date :** 15 août 2026  
**Branche :** `finalisation-jeune-chatgpt`  
**Objectif :** relier préparation → jeûne → reprise → consolidation autour d'un identifiant central unique.

---

## 1. État avant intervention

Les modules existaient mais fonctionnaient comme plusieurs cycles indépendants :

- `preparations_jeune` enregistrait la préparation sans relation réelle avec le jeûne ;
- le bouton « Démarrer mon jeûne » écrivait dans l'ancienne table `jeune` ;
- cette insertion n'envoyait pas le champ obligatoire `duree_jours` ;
- `lib/jeuneUtils.js` cherchait une table inexistante `jeunes` au pluriel ;
- `reprises_alimentaires.jeune_id` était un UUID alors que `jeune.id` était un bigint ;
- le plan de reprise était validé uniquement dans `localStorage` ;
- la fin du jeûne marquait tout le parcours comme terminé avant la reprise ;
- la fin de reprise restait principalement locale ;
- le statut `supprime` utilisé par le code n'était pas autorisé par la contrainte SQL ;
- `parcours_jeune.id` n'avait pas de clé primaire ;
- le RLS de `parcours_jeune` était désactivé.

---

## 2. Architecture retenue

Une ligne de `parcours_jeune` représente désormais le cycle complet.

```text
parcours_jeune.id
├── preparations_jeune.parcours_id
├── phase de jeûne portée par parcours_jeune
├── reprises_alimentaires.parcours_id
└── consolidation
```

La colonne `type` de `parcours_jeune` représente la phase courante :

- `preparation`
- `jeune`
- `reprise`
- `consolidation`

Le même UUID est conservé pendant tout le cycle.

---

## 3. Modifications SQL réalisées

Migration :

`supabase/migrations/20260815000001_complete_parcours_jeune_chainage.sql`

### Ajouts dans `parcours_jeune`

- clé primaire sur `id` ;
- `date_debut_preparation` ;
- `date_fin_preparation` ;
- `date_debut_jeune` ;
- `date_fin_jeune` ;
- `date_debut_reprise` ;
- `date_fin_reprise` ;
- `date_debut_consolidation` ;
- `date_fin_consolidation` ;
- `duree_preparation_jours` ;
- `duree_reprise_jours`.

### Relations ajoutées

- `preparations_jeune.parcours_id → parcours_jeune.id` ;
- `reprises_alimentaires.parcours_id → parcours_jeune.id`.

Les deux relations utilisent `ON DELETE SET NULL` afin qu'une éventuelle suppression du parcours ne supprime pas automatiquement les données détaillées.

### Autres corrections

- ajout du statut autorisé `supprime` ;
- index sur le parcours actif d'un utilisateur ;
- index sur les deux nouvelles colonnes `parcours_id`.

### Point volontairement non réalisé

Le RLS n'a pas été activé à la demande de la propriétaire du projet.  
Aucune politique RLS n'a été créée dans cette migration.

---

## 4. Modifications du code

### `lib/parcoursJeuneAPI.js`

Ajouts :

- prise en charge des nouvelles dates lors de la création ;
- `getParcoursJeuneById` ;
- `demarrerPhaseJeune` ;
- `terminerPhaseJeune` ;
- `demarrerPhaseReprise` ;
- `terminerPhaseReprise`.

La fin du jeûne et la fin du cycle ne sont plus confondues.

### `lib/preparationsJeune.js`

Ajouts :

- retour de la ligne enregistrée avec son identifiant Supabase pour éviter les doublons lors de l’archivage ;
- conversion `parcoursId ↔ parcours_id` ;
- autorisation de `parcours_id` dans les colonnes synchronisées.

### `pages/preparation-jeune.js`

Avant :

- création locale de la préparation ;
- insertion indépendante dans `jeune` au démarrage.

Après :

- création d'un `parcours_jeune` dès l'activation de la préparation connectée ;
- stockage de son UUID dans la préparation et dans `localStorage.parcoursJeuneActifId` ;
- passage du même parcours à `type = jeune` ;
- suppression de la nouvelle écriture dans l'ancienne table `jeune` ;
- conservation du stockage local comme secours.

### `lib/jeuneUtils.js`

Avant :

- recherche dans `jeunes`, table inexistante ;
- recherche du programme par `jeune_id`.

Après :

- recherche dans `parcours_jeune` avec `type = jeune` et `statut = en_cours` ;
- recherche du programme par `parcours_id` ;
- insertion du même UUID dans `parcours_id` et, temporairement, dans `jeune_id` pour compatibilité.

### `pages/jeune.js`

Avant :

- le bilan terminait le parcours complet ;
- la génération du plan ne transmettait pas le parcours central.

Après :

- le bilan clôt uniquement la phase de jeûne ;
- le parcours reste actif pour continuer vers la reprise ;
- le programme de reprise reçoit `parcours_id`, les dates et la durée du jeûne.

### `pages/validation-plan-reprise.js`

Avant :

- validation exclusivement dans `localStorage`.

Après :

- validation dans `reprises_alimentaires` lorsque le programme possède un identifiant Supabase ;
- mise à jour du cache local après réussite ;
- fallback local maintenu si le programme n'existe pas encore dans Supabase.

### `pages/reprise-alimentaire-apres-jeune.js`

Ajouts :

- démarrage Supabase de la reprise lorsque `date_debut_reprise` est atteinte ;
- passage du parcours central à `type = reprise` ;
- une consultation anticipée du plan ne démarre pas prématurément la reprise ;
- fin Supabase de `reprises_alimentaires` ;
- passage du parcours à `type = consolidation` ;
- stockage du bilan de reprise dans `parcours_jeune.progression` ;
- aucune erreur distante ne supprime la copie locale.

---

## 5. Garanties de non-régression des données

- aucune table supprimée ;
- aucune colonne supprimée ;
- aucune ligne supprimée ;
- ancienne table `jeune` conservée ;
- données historiques locales conservées ;
- aucune purge de `localStorage` ajoutée ;
- une erreur Supabase ne remplace pas le local par une valeur vide ;
- RLS non activé.

---

## 6. État après intervention

Pour un nouveau cycle créé avec un utilisateur connecté :

```text
Création préparation
      ↓
Création parcours_jeune UUID
      ↓
preparations_jeune.parcours_id = UUID
      ↓
Démarrage jeûne : parcours.type = jeune
      ↓
Génération reprise : reprises_alimentaires.parcours_id = UUID
      ↓
Validation du plan dans Supabase
      ↓
À la date prévue : parcours.type = reprise
      ↓
Fin reprise : parcours.type = consolidation
```

---

## 7. Vérification de compilation

Build de production exécuté le 15 août 2026 sur la branche `finalisation-jeune-chatgpt` :

```text
npm ci
npm run build
```

Résultat :

- compilation Next.js réussie ;
- vérification des types réussie ;
- 37 pages statiques générées ;
- pages `/preparation-jeune`, `/jeune`, `/validation-plan-reprise` et `/reprise-alimentaire-apres-jeune` compilées ;
- code de sortie : `0` ;
- aucune erreur de compilation détectée.

Le dépôt ne contient pas de workflow GitHub Actions pour automatiser ce build. Le test fonctionnel connecté à Supabase reste distinct du test de compilation.

---

## 8. Tests manuels à effectuer

1. Se connecter avec le compte de test.
2. Créer une nouvelle préparation.
3. Vérifier que `parcours_jeune` contient une ligne `type = preparation`.
4. Vérifier que `preparations_jeune.parcours_id` correspond à cette ligne.
5. Cliquer sur « Démarrer mon jeûne ».
6. Vérifier que la même ligne passe à `type = jeune`.
7. Générer le plan de reprise.
8. Vérifier que `reprises_alimentaires.parcours_id` correspond au même UUID.
9. Valider le plan.
10. Vérifier le passage à `plan_valide`.
11. À la date de reprise, ouvrir la page de reprise.
12. Vérifier `type = reprise` et `statut = en_cours`.
13. Terminer la reprise.
14. Vérifier `type = consolidation`.

Tester également que les données locales restent visibles après chaque actualisation.

---

## 9. Reste à faire

### Priorité immédiate

- exécuter les tests manuels du cycle complet ;
- corriger toute incohérence révélée par les données réelles de test ;
- vérifier que les clés locales suffixées par utilisateur et les clés historiques non suffixées restent compatibles.

### Sécurité avant ouverture multi-utilisateur

- créer les politiques RLS `SELECT`, `INSERT`, `UPDATE`, `DELETE` ;
- utiliser `auth.uid()::text = user_id` tant que `parcours_jeune.user_id` reste de type texte ;
- activer le RLS seulement après création des politiques ;
- tester les quatre opérations avec le compte authentifié ;
- ne jamais activer le RLS seul sans politiques.

### Nettoyage futur, non urgent

- décider du devenir de l'ancienne table `jeune` après validation complète ;
- retirer progressivement l'usage temporaire de `reprises_alimentaires.jeune_id` ;
- rattacher éventuellement les journaux spirituels au `parcours_id` ;
- remplacer les derniers stockages locaux métier par une synchronisation cloud contrôlée.

---

## 10. Commits principaux

- `6829225` — migration SQL de structure ;
- `f351ecb` — transitions du parcours central ;
- `6439f55` — synchronisation de `parcours_id` dans les préparations ;
- `61daa96` — préparation reliée au parcours central ;
- `10c986d` — distinction fin du jeûne / fin du cycle ;
- `1af3c1d` — programme de reprise relié au parcours ;
- `a0dbd02` — transmission du parcours depuis la page jeûne ;
- `66347ad` — ouverture de la consolidation ;
- `8a18505` — validation Supabase du plan ;
- `7856ccd` — synchronisation de la reprise ;
- `668157b` — retour de l’identifiant Supabase de la préparation ;
- `f8a24f2` — conservation du même identifiant pendant l’archivage.

---

## 11. Règle pour toute reprise du chantier

Ne pas recréer un parcours à chaque phase.

Toujours réutiliser le même `parcours_jeune.id` et le transmettre dans `parcours_id`.

# Etat des lieux defis

Date: 2026-07-26
Branche analysee: defis-N
Perimetre: pages, composants, utilitaires, docs et migrations lies aux defis

## 1) Ce que represente "un defi" dans ce projet

Un defi est une action comportementale suivie dans le temps avec:
- un objectif (nom + description),
- une duree (jours/repas/tentatives...),
- une progression numerique,
- un statut (disponible, en cours, termine),
- potentiellement un journal quotidien pour certains defis personnalises.

Deux familles coexistent:
- Defis de referentiel (10 mini-defis fixes) via `lib/defisReferentiel.js`.
- Defis personnalises (crees par formulaire) via `components/SaisieDefisDynamiques.js`.

## 2) Comportement attendu (d apres docs)

Attendus majeurs identifies:
- 10 mini-defis integres conformement au cahier des charges (`docs/defis.md`).
- Suivi de progression robuste avec persistance.
- Validation quotidienne (une fois par jour) pour certains parcours de defis.
- Feedback clair: badge/termine + prevention des doubles validations.
- Journal personnalise matin/soir pour defis personnalises (engagements, validation, historique).

## 3) Comportement actuel constate dans le code

### 3.1 Page defis principale

`pages/defis.js`:
- Chargement des defis depuis Supabase (`defis`).
- Initialisation auto des defis referentiel si la table est vide.
- Onglets: disponibles / en-cours / termines / creer.
- Creation de defis personnalises via formulaire.
- Demarrage d un defi:
  - personnalise: passe en cours puis redirection journal,
  - referentiel: passe directement `progress = 1`.
- Validation d une etape referentiel via `lib/defisUtils.js`.

### 3.2 Journal defi personnalise

`pages/journal-defi/[id].js` + `components/JournalDefiPersonnalise.js` + `lib/journalDefisUtils.js`:
- Ecran dedie avec navigation jour et progression.
- Logique matin/soir, engagements, notes, tentative de validation.
- Ecriture/lecture via table `journal_defis` (supposee existante).

### 3.3 Composants d affichage

- `components/DefisContext.js`: expose `defis`, `defisEnCours`, `refreshDefis`.
- `components/DefisEnCoursBanner.js`: resume des defis en cours.
- `components/BandeauDefiActif.js`: bandeau UI motivation.

### 3.4 Donnees versionnees

- Les migrations presentes sous `supabase/migrations` ne contiennent pas de migration versionnee pour `defis`, `journal_defis` ni `badges` dans cette branche.

## 4) Ecarts entre attendu et actuel

## Ecart critique A - Journal personnalise: incompatibilite de contrat de donnees

Constat:
- `chargerJournalDefi` retourne `{ data, error? }` mais le composant consomme le retour comme un objet direct du journal.
- Le composant utilise les proprietes `eng.valide` alors que les utilitaires calculent le score avec `eng.tenu`.

Impact:
- Chargement du journal incoherent (etat non restaure correctement).
- Score calcule a 0 dans la plupart des cas.
- Progression potentiellement jamais incrementee meme si l utilisateur coche des engagements.

Risque metier:
- Defis personnalises inutilisables en production sur le coeur de valeur (validation quotidienne).

## Ecart critique B - Reponse utilitaire vs UI non alignee

Constat:
- Le composant attend `result.progressionIncrementee` et `result.newProgress`.
- L utilitaire retourne `success` et `etapeValidee`, sans ces champs.

Impact:
- Messages de confirmation faux/incomplets.
- Mise a jour de progression UI non fiable.

## Ecart majeur C - Machine d etat non uniforme des statuts

Constat:
- Referentiel et init utilisent `en attente`.
- D autres parcours utilisent `disponible` et `en cours`.
- Filtres de la page defis reposent surtout sur `progress` et non sur `status`.
- `DefisContext` determine `defisEnCours` uniquement sur `status === 'en cours'`.

Impact:
- Risque de desalignement entre ecrans (un meme defi peut apparaitre differemment selon composant).
- Complexite de maintenance et regressions probables.

## Ecart majeur D - Logique de progression heterogene au demarrage

Constat:
- Defi referentiel: `Commencer` force `progress = 1`.
- Defi personnalise: `Commencer` laisse `progress = 0` puis journal.

Impact:
- Semantique metier differente sans explicititation produit.
- Comparaison de progression entre defis faussee.

## Ecart majeur E - Faux bandeau actif en dur

Constat:
- La page affiche `BandeauDefiActif` avec une donnee de test (`Defi test`, progression 2/5) non liee a la vraie base.

Impact:
- UX trompeuse.
- Perte de confiance utilisateur.

## Ecart moyen F - Code mort / non connecte dans SaisieDefisDynamiques

Constat:
- Presence de nombreux sous-formulaires et references `setQuantite` non definies.
- Ces sous-formulaires ne sont pas relies au rendu principal exporte.

Impact:
- Dette technique elevee.
- Risque d erreurs runtime si ce code est rebranche sans nettoyage.

## Ecart moyen G - Traçabilite BDD incompletement versionnee

Constat:
- Les docs decrivent des tables et comportements (`journal_defis`, `badges`) mais aucune migration associee n est versionnee ici.

Impact:
- Reproductibilite environnement insuffisante.
- Onboarding et rollback fragiles.

## 5) Priorisation recommandations

P0 (bloquant fonctionnel)
1. Corriger le contrat JournalDefiPersonnalise <-> journalDefisUtils:
   - unifier format retour `chargerJournalDefi` (consommer `journal.data`),
   - unifier un seul champ booleen d engagement (`tenu` ou `valide`) partout,
   - aligner payload/retour de `validerEtapeDefi` avec attentes UI.
2. Ajouter tests minimaux de non-regression pour le journal personnalise:
   - chargement jour existant,
   - validation >= 2/3,
   - incrementation progression.

P1 (coherence metier)
3. Definir une machine d etat unique pour defis:
   - ex: `disponible` -> `en cours` -> `termine`,
   - deprecier `en attente` ou mapper proprement.
4. Unifier la regle de demarrage progression (0 ou 1) selon decision produit explicite.

P2 (qualite / dette)
5. Remplacer le bandeau "Defi test" par un vrai defi actif calcule.
6. Nettoyer `SaisieDefisDynamiques` (retirer code mort, composants non relies, references non definies).
7. Versionner les migrations manquantes pour `defis`, `journal_defis`, `badges`.

## 6) Preuves de lecture (extraits de references)

- Statuts et filtres:
  - `lib/defisReferentiel.js`
  - `lib/initDefisUser.js`
  - `pages/defis.js`
  - `components/DefisContext.js`
- Journal personnalise:
  - `components/JournalDefiPersonnalise.js`
  - `lib/journalDefisUtils.js`
  - `pages/journal-defi/[id].js`
- Creation defi personnalise:
  - `components/SaisieDefisDynamiques.js`
- Attendus docs:
  - `docs/defis.md`
  - `docs/PLAN_IMPL_SUIVI_VALIDATION_DEFIS.md`
  - `docs/PLAN_IMPL_Journal_Defis_Personnalises.md`

## 7) Conclusion operationnelle

Le socle "defis" est riche mais fragile sur la partie la plus differenciante (journal personnalise et validation quotidienne). Le principal ecart n est pas visuel: il est dans les contrats de donnees non alignes entre UI et utilitaires. Tant que P0 n est pas corrige, le comportement reel restera incoherent pour l utilisateur final.
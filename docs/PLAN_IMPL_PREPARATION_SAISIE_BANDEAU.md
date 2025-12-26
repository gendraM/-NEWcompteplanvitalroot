# PLAN D’IMPLÉMENTATION — Mini‑bandeau Préparation (Saisie) + Période & critères (Préparation)

Important: Ce plan suit le template. Aucune modification de code ne sera faite sans validation explicite.

## Titre de la tâche
Intégrer un mini‑bandeau “Préparation en cours” sur la page de saisie, ajouter le bouton “En savoir plus” ouvrant la phase active sur Préparation, et un deep‑link “Voir mes repas (semaine)” vers Suivi préfiltré. Adapter le panneau “Période & critères” côté Préparation avec état synthétique et date/heure de validation.

## Description précise de la modification attendue
- Sur la page de saisie (Suivi):
  - Afficher un mini‑bandeau synthétique quand `préparationActive` est vrai.
  - Ligne 1: “Préparation du jeûne • Période: lundi JJ/MM/AA → dimanche JJ/MM/AA”.
  - Ligne 2: pastilles de règles contextuelles au **jour J et type de repas** en cours:
    - 1. Portions: repères visuels (toujours)
    - 2. Dîner: sans féculents (si type = Dîner)
    - 7. Eau: ≥ 2L/jour (toujours)
    - 8. Dernier repas < 19h (si type = Dîner)
    - 9. Repas ≤ 45 min (si plage horaire disponible)
  - États pastilles: gris = neutre, vert = OK (auto), orange = à surveiller (écart détecté dans la saisie en cours).
  - Boutons:
    - “En savoir plus” → ouvre Préparation sur la **phase active** avec panneau “Période & critères”.
    - “Voir mes repas (semaine)” → ouvre Suivi préfiltré sur la période de la phase: `/suivi?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- Sur la page Préparation:
  - Dans l’entête de chaque phase: pastille discrète “Période: lundi JJ/MM/AA → dimanche JJ/MM/AA”.
  - Bouton “Période & critères” dans la carte Phase: ouvre un panneau détaillé listant les critères de la phase:
    - [Auto] 1/2/7/8/9 et [Interactif] 3/6, avec **état synthétique** (✅/⏳) et **date/heure de validation** si validé (`typeValidation` auto/manuel + `dateValidation`).
    - Aides: “Voir mes repas sur la période” (deep‑link from/to).
  - Nettoyage visuel (sur demande utilisateur): retirer la barre de jours et le panneau “Auto‑détection (7 jours)” pour éviter la surcharge. Aucun autre comportement existant n’est supprimé.

## Fichiers concernés
- [pages/suivi.js](pages/suivi.js)
- [pages/preparation-jeune.js](pages/preparation-jeune.js)
- [lib/validerCriterePreparation.js](lib/validerCriterePreparation.js) (lecture `typeValidation` et `dateValidation`)
- (ajout) [components/BandeauPreparationSaisie.js](components/BandeauPreparationSaisie.js) — si factorisation souhaitée
- (optionnel) [components/PhaseCard.js](components/PhaseCard.js) — ajout du bouton “Période & critères” et pastille période

## Etape 1 — Audit des risques préalable
1. Risques techniques:
   - Mauvaise lecture des params `from/to` ➔ période incorrecte dans Suivi.
   - SSR: accès `window`/`localStorage` avant montage.
   - Hooks mal positionnés (dans des conditions) ➔ erreur React.
   - Régression d’UI sur Préparation si panneau injecté au mauvais endroit.
2. Règles des hooks: `useState/useEffect` uniquement en haut du composant; jamais dans un if/map/boucle.
3. Points de vigilance:
   - Vérifier la clé `préparationActive` et la phase active depuis le storage/BDD.
   - Format de dates (fr‑FR, année sur 2 chiffres) et jours (“lundi”, “mardi”…).
   - Ne pas dupliquer la logique d’auto‑détection; utiliser les utilitaires existants.
4. Lecture des anomalies rollback: voir [docs/Anomalie roll back](docs/Anomalie%20roll%20back) et intégrer les leçons (hooks mal placés, JSX conditionnels non équilibrés).

## Etape 2 — Sous‑checklist à valider systématiquement
- [ ] Imports nécessaires présents: hooks React, utilitaires de validation, supabase, router (pour deep‑link).
- [ ] Variables et fonctions déclarées **avant** leur usage dans le rendu.
- [ ] Accès `window/localStorage` encapsulé dans `useEffect` ou guards `typeof window !== 'undefined'`.
- [ ] Paramètres `from/to` lus et validés (ISO `YYYY-MM-DD`).

## Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète des composants modifiés.
- [ ] Initialiser tous les hooks en tête de composant.
- [ ] Séparer: initialisation ➔ logique calculée ➔ handlers ➔ rendu.
- [ ] Contrôles d’erreur sur Supabase et parsing des dates.
- [ ] Accessibilité: rôle/balises, focus, SR pour le panneau.
- [ ] Tests de non‑régression: Préparation, Reprise, aucune collision de contextes.
- [ ] Mise à jour du pourcentage d’avancement avant validation.

## Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d’anomalies dans [docs/Anomalie roll back](docs/Anomalie%20roll%20back).
2. Créer la checklist de contrôle ciblée: hooks au bon endroit, JSX conditionnels équilibrés, deep‑link parsé correctement.
3. Vérifier qu’aucune anomalie bloquante n’est présente avant implémentation.
4. Si anomalie détectée: proposer rollback et documenter (ajout à la fin du fichier d’anomalies, jamais suppression).

## Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement: 0 %
- Historique: 26/12/2025 — Plan rédigé, en attente de validation.

## Etape 6 — Point de vigilance
1. Rapport lecture anomalies: erreurs de JSX/conditionnels dans Préparation déjà rencontrées ➔ revoir l’équilibrage `{… ? (…) : (…)}`.
2. Éviter l’accès aux hooks dans le JSX ou dans un handler.
3. Checklist:
   - [ ] Tous les hooks en haut
   - [ ] Guards SSR pour `window/localStorage`
   - [ ] Deep‑link `/suivi?from&to` parsé et validé
   - [ ] Aucune suppression non demandée; retrait uniquement des éléments visuels explicitement refusés (barre jours/panneau 7j)

## Etape 7 — Proposition de rollback
- Si la page Préparation casse (syntax JSX/conditionnel): rollback à la dernière version stable, puis ré‑intégration du panneau “Période & critères” de façon isolée.
- Documenter dans `Anomalie roll back` avec date/heure et description.

## Etape 8 — Rapport Markdown Copilot
### AVANT
- Pas de mini‑bandeau synthétique sur la page de saisie.
- Préparation affiche des éléments jugés intrusifs (barre jours/panneau 7j).
- Suivi n’accepte pas de deep‑link semaine.

### APRÈS (objectif)
- Mini‑bandeau sur saisie: période + 5 pastilles contextuelles + 2 boutons.
- Préparation: pastille période en entête + bouton “Période & critères”; panneau avec état synthétique et “Validé le … (auto/manuel)”.
- Suivi: deep‑link `/suivi?from=YYYY-MM-DD&to=YYYY-MM-DD` pour ouvrir la semaine de la phase active.

## Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date: ___


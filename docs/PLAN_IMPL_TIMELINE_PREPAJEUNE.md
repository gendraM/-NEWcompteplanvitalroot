# 🟢 PLAN D’IMPLÉMENTATION — AJOUT TIMELINE MÉTIER PRÉPARATION JEÛNE

## Titre de la tâche
Ajouter la timeline métier (phases, critères, cadenas, dates) à la page préparation-jeûne, sans suppression ni modification des fonctionnalités existantes.

## Description précise de la modification attendue
Affichage visuel et fonctionnel des phases métier (Allègement, Végétalisation, Pré-jeûne), avec périodes (J-XX à J-YY), icônes, couleurs, critères associés, cadenas (verrouillage/déverrouillage automatique selon la date), dates de jalon pour chaque critère, progression globale, synthèse finale et conseils personnalisés. Ajout en complément du rendu actuel, sans suppression ni altération des fonctions existantes. Respect strict de l’ordre de déclaration des hooks React et composants.

## Fichiers concernés
- `/pages/preparation-jeune.js`
- `/components/TimelinePreparation.js` (création ou enrichissement)
- `/components/PhaseCard.js` (création ou enrichissement)

### Etape 1 — Audit des risques préalable
1. Risque technique : conflit avec hooks existants si ordre non respecté.
2. Risque UX : superposition ou confusion visuelle si l’ajout n’est pas harmonieux.
3. Risque robustesse : oubli d’initialisation d’un hook ➔ non mise à jour d’état ou bug.
4. Risque accessibilité : icônes/couleurs non accessibles.
5. Risque régression : perte de fonctionnalité existante si une fonction est modifiée ou supprimée.
6. Risque performance : surcharge du rendu si la timeline est trop lourde.
7. Risque SSR : hook mal placé ➔ erreur serveur.
8. Risque documentation : oubli de rapport Markdown ou de traçabilité rollback.
9. Risque de non-respect du template Copilot.
10. Vérification stricte de l’ordre de déclaration des hooks React (useState, useEffect, etc.) uniquement en haut du composant.
11. Lecture du fichier d’anomalies rollback avant toute modification.

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Hooks déclarés uniquement en haut du composant fonctionnel
- [ ] Aucune déclaration de hook dans une fonction, boucle, map, if, etc.
- [ ] Toutes les fonctions et handlers présents et initialisés avant usage dans le rendu
- [ ] Vérification de la non-suppression de toute fonction existante

### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc. (respect des règles officielles des hooks)
- [ ] Séparation stricte des étapes : d’abord initialisation (useState, useEffect…), puis logique calculée, puis handlers/fonctions, puis rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement
- [ ] Ajout uniquement, aucune modification ou suppression de code existant
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Relecture **manuelle obligatoire** des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation. NE PAS se baser sur la mémoire du modèle Copilot.
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

### Etape 4 — Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)
1. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback pour anticiper les risques.
2. Créer une checklist de contrôle à appliquer avant le codage (points de vigilance : hooks, UI, accessibilité, non-régression, robustesse, cas limites, rollback).
3. Vérifier qu’il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. Si une anomalie/bug est identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée, documentée dans le fichier Anomalie rollback (date/heure, détail complet, ajout à la suite uniquement).

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : 0 %
- Historique des mises à jour : 06/12/2025, plan rédigé et soumis à validation

### Etape 6 — Point de vigilance
1. Rapport lié à la lecture des entrées du fichier anomalies rollback : aucun bug bloquant sur l’ajout de timeline métier, mais vigilance sur l’ordre des hooks et la non-suppression de code existant.
2. Erreurs similaires à éviter : hook déclaré dans une fonction, modification d’un handler existant, suppression d’une fonctionnalité, non-respect du flow initialisation ➔ logique ➔ handler ➔ rendu.
3. Checklist de vérification : hooks en haut, ajout uniquement, UI claire, accessibilité, rollback prêt en cas d’anomalie.
4. Impact attendu : enrichissement visuel et fonctionnel sans régression ni perte de données.

### Etape 7 — Proposition de rollback
Pour tout risque ou anomalie détecté :
- Action de rollback : retour à la version précédente du composant, ajout d’une entrée dans le fichier ANOMALIE rollback (date/heure, détail, contexte, alternative sûre).
- Jamais de suppression dans le fichier, toujours ajout à la suite.

### Etape 8 — Rapport Markdown Copilot
1. Rapport structuré AVANT : structure actuelle, absence de timeline métier visuelle, hooks existants OK.
2. Rapport structuré APRÈS : timeline métier ajoutée, hooks et composants respectés, aucune suppression, enrichissement visuel et fonctionnel, conformité au plan et au template.
3. À valider par l’utilisateur avant code.

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---


## Exemple visuel attendu (conforme fiche métier & anciens commits)

### 🌅 Ma préparation au jeûne — Jeûne prévu le 15 décembre

---

#### Timeline complète (J-30 → J-0)

| Phase                        | Période         | Icône | Couleur   | Critères (avec cadenas, paliers)                                                                 |
|------------------------------|-----------------|-------|-----------|--------------------------------------------------------------------------------------------------|
| **Phase 1 : Fondations**     | J-30 à J-18     | 🧱    | #FFD166   | 🔒 Respect strict des quantités (J-30)<br>🔒 Pas de féculents le soir (J-17)<br>🔒 Action post-repas (J-17) |
| **Phase 2 : Intensification**| J-17 à J-1      | ⚡    | #4F8FFF   | 🔒 Éliminer produits transformés (J-14)<br>🔒 Éliminer sucreries (J-14)<br>🔒 Jeûne test 2j (J-12)<br>🔒 Hydratation 2L/j (J-7)<br>🔒 Pas de repas après 19h (J-7)<br>🔒 Plage 45min (J-7) |
| **Phase 3 : Pré-jeûne**      | J0              | 🚀    | #43D9A3   | 🔒 Lancement du jeûne (J0)                                                                        |

---

#### Affichage dynamique des critères (exemples)

- **Respect strict des quantités**  
  Jalon : J-30  
  🔒 Critère verrouillé — Débloquage automatique le 15 novembre (J-30)  
  [Valider ce critère] (bouton grisé si verrouillé)

- **Pas de féculents le soir**  
  Jalon : J-17  
  🔒 Critère verrouillé — Débloquage automatique le 28 novembre (J-17)  
  [Valider ce critère] (bouton grisé si verrouillé)

- **Hydratation optimale**  
  Jalon : J-7  
  🔓 Critère déverrouillé — Valider maintenant  
  [Valider ce critère] (bouton actif)

---

#### Progression globale

- Décompte dynamique : J-30 → J-0 (ex : « Tu es à J-17 »)
- Progression : 4/9 critères validés
- Barre de progression visuelle

---

#### Feedback et synthèse finale

- Notification/alerte à chaque palier débloqué (ex : « Nouveau palier débloqué ! »)
- Points forts validés
- Axes d’amélioration (critères non validés)
- Statistiques de préparation (jours, poids, extras, etc.)
- Message d’encouragement personnalisé

---

**Ce rendu combine :**
- Phases, couleurs, icônes, granularité des paliers (J-30, J-17, J-14, J-12, J-7, J-0)
- Critères révélés progressivement, feedback visuel/contextuel à chaque étape
- Progression et synthèse enrichies, conforme fiche métier et anciens commits

> Ce visuel doit être respecté dans l’UI, comme dans la fiche métier et les anciens commits fonctionnels (phase jeune OK).

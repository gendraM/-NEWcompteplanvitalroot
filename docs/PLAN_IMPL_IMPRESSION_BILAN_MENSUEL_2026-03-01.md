# 🟢 PLAN D’IMPLÉMENTATION COPILOT — Impression du bilan mensuel (inspirée du histo bilan hebdo)

**Date :** 01/03/2026  
**Statut :** Pré-implémentation (AUCUNE modification de code fonctionnel effectuée dans cette étape)

---

## Titre de la tâche
Ajouter la fonctionnalité d’impression du bilan mensuel en s’inspirant de l’existant du histo bilan hebdo.

---

## Description précise de la modification attendue
Permettre à l’utilisateur d’imprimer le contenu de la modale `BilanMensuelModal` avec un rendu propre et complet (sections dépliées au moment de l’impression), sans régression des fonctionnalités existantes (fermeture, sauvegarde, navigation historique, calculs mensuels).

Objectif UX :
- Ajouter un bouton d’impression explicite dans la modale mensuelle.
- Garantir un rendu imprimable lisible (fond blanc, contenu visible, actions non pertinentes masquées à l’impression).
- Conserver strictement l’existant hors impression.

---

## Fichiers concernés
- `/components/BilanMensuelModal.js`
- `/styles/print.css`
- `/pages/_app.js` (déjà import `print.css`, vérification uniquement)
- `/pages/suivi.js` (vérification du flux d’ouverture de la modale mensuelle)

---

### Etape 1 — Audit des risques préalable
1. Risques techniques
   - Régression sur l’ouverture/fermeture de la modale mensuelle.
   - Régression sur les états `sectionsOuvertes` si impression manipule les accordéons.
   - Risque de styles print trop globaux impactant d’autres écrans.
   - Risque de handlers print non nettoyés (`afterprint`) créant des effets secondaires.

2. Risques UX
   - Impression partielle si certaines sections restent fermées.
   - Boutons inutiles imprimés (fermer/sauvegarder/historique) nuisant à la lisibilité.
   - Sauts de page incohérents.

3. Risques robustesse/sécurité
   - Perte de données non attendue (ne doit pas arriver : aucun write BDD dans la feature print).
   - Régression des actions de sauvegarde existantes.

4. Audit hooks React (ordre attendu)
   - Tous les `useState` / `useEffect` de `BilanMensuelModal` restent en haut du composant.
   - Aucune variable d’état utilisée avant déclaration.
   - Dépendances `useEffect` revues manuellement si ajout d’un handler print.

5. Consultation anomalies rollback
   - Lecture de `/docs/ANALYSE_LECTURE_ANOMALIE_rollback_BILAN_HEBDO_2026-01-13.md`.
   - Point clé retenu : vigilance maximale sur ordre des hooks, non-régression, et traçabilité.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [x] Vérification de la présence/import des hooks/fonctions utilisés (`useState`, `useEffect`, handlers)
- [x] Vérification des zones modales concernées (`overlay`, `modal`, `footer`, sections)
- [x] Vérification de l’existant d’impression hebdo (`window.print`, `print.css`, `print-expand`)

---

### Etape 3 — Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [x] Lecture complète du code concerné
- [x] Initialisation systématique avant usage (hooks/variables/handlers)
- [x] Hooks uniquement en haut du composant
- [x] Aucune variable d’état ou hook utilisée avant déclaration
- [x] Séparation initialisation → logique → handlers → rendu
- [x] Vérification de la présence des handlers utilisés dans le rendu
- [x] Ordre et portée logiques stricts
- [x] Pas de doublons ni déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation/runtime/SSR/accessibilité) — à faire après implémentation
- [ ] Test du rendu cas d’usage et cas limites — à faire après implémentation
- [x] Préservation stricte des fonctionnalités existantes (objectif d’implémentation)
- [x] Audit des risques de redéfinition / conflits de nommage
- [x] Documentation des étapes et validations
- [x] Relecture manuelle obligatoire avant implémentation
- [ ] Validation utilisateur OBLIGATOIRE avant implémentation

---

### Etape 4 — Contrôles conformité à réaliser (ordre)
1. Lecture de l’historique anomalies rollback (fait).
2. Checklist de vigilance créée (faite).
3. Validation absence d’anomalie bloquante avant code (faite).
4. En cas d’anomalie pendant implémentation :
   - Stop immédiat,
   - proposition rollback,
   - ajout d’entrée horodatée en fin de fichier anomalies (sans suppression).

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [x] En cours | [ ] Terminé
- Avancement précis : **35%**
- Historique :
  - 01/03/2026 18:xx — Audit risques + lecture fichiers + préparation du plan.

---

### Etape 6 — Point de vigilance
1. Retours d’expérience anomalies
   - Risque principal : erreurs liées à la structure React (hooks/ordre/dépendances).
   - Risque secondaire : régression UX si styles print débordent sur d’autres vues.

2. Erreurs similaires à éviter
   - Déclarer un handler print après usage dans le JSX.
   - Oublier de restaurer l’état des sections après impression.
   - Rendre le CSS print trop global (`button { display:none }`) sans scope.

3. Checklist opérationnelle de vigilance
   - [ ] Scoped print CSS pour mensuel (classes dédiées).
   - [ ] Bouton impression visible uniquement hors mode print.
   - [ ] Ouverture temporaire de toutes sections lors impression.
   - [ ] Restauration de l’état initial post-print.
   - [ ] Test manuel : ouvrir modale mensuelle → imprimer → vérifier retour état initial.
   - [ ] Vérifier que sauvegarde/fermeture restent inchangées.

Impact attendu : impression mensuelle fiable, sans impact sur les autres écrans.

---

### Etape 7 — Proposition de rollback
Si anomalie critique détectée après ajout :
- Rollback ciblé des hunks ajoutés dans `BilanMensuelModal.js` et `print.css`.
- Retour à l’état pré-implémentation (commit précédent).
- Journalisation horodatée en fin de fichier anomalies rollback.

---

### Etape 8 — Rapport Markdown Copilot (prévu)
#### AVANT
- Impression disponible sur histo bilan hebdo, pas sur bilan mensuel.
- `BilanMensuelModal` sans bouton impression ni workflow print dédié.

#### APRÈS (cible)
- Bouton impression dans `BilanMensuelModal`.
- Impression avec sections mensuelles visibles.
- CSS print mensuel scoped et non-régressif.
- Aucun impact sur calculs/sauvegarde/navigation existants.

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

## Deuxième lecture template vs plan (contrôle d’écarts)
Écarts identifiés :
1. La phase “post-implémentation” (tests runtime détaillés, journal anomalies en cas d’erreur) n’est pas exécutable avant code — elle est bien prévue mais non cochée.
2. Le fichier “ANOMALIE rollback” dédié n’est pas clairement identifié sous ce nom dans le repo ; la source lue est `ANALYSE_LECTURE_ANOMALIE_rollback_BILAN_HEBDO_2026-01-13.md`.

Action proposée pour conformité totale :
- Démarrer l’implémentation uniquement après validation explicite de ce plan.
- Exécuter ensuite la checklist post-implémentation complète et te livrer un rapport avant/après.

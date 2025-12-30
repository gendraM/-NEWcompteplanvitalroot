# PLAN D’IMPLÉMENTATION — AJOUT phaseMaxAtteinte À L’ARCHIVAGE

## Titre de la tâche
Ajouter le champ `phaseMaxAtteinte` à chaque archive de reprise dans `/pages/reprise-alimentaire-apres-jeune.js` (lignes 552-600)

---

## Description précise de la modification attendue
- Lorsqu’une reprise alimentaire est archivée (fin de Phase 5 ou interruption), ajouter un champ `phaseMaxAtteinte` dans l’objet archive.
- Ce champ doit contenir le numéro de la phase la plus élevée atteinte par l’utilisateur lors de cette reprise (ex : 3 si arrêté en phase 3, 5 si terminé).
- Permettre l’analyse de progression, la détection de blocages, et la génération de statistiques sur la réussite des reprises.

---

## Fichiers concernés
- `/pages/reprise-alimentaire-apres-jeune.js`

---

### Etape 1 — Audit des risques préalable
1. Risque de régression sur la logique d’archivage (mauvais calcul de la phase max, oubli d’incrémentation, etc.)
2. Risque UX : affichage incohérent si la valeur est mal calculée ou non initialisée.
3. Risque technique : hook ou variable mal placée, non respect des règles React (hooks en haut du composant).
4. Risque de perte de données si la structure d’archivage est modifiée sans migration des anciennes archives.
5. Vérification de la déclaration de tous les hooks React (useState, useEffect) en haut du composant.
6. Consulter le fichier d’anomalies rollback avant toute modification.

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé et utilisé correctement
- [ ] useEffect importé et utilisé correctement
- [ ] Toutes les variables nécessaires présentes AVANT usage
- [ ] La variable phaseMaxAtteinte est bien calculée AVANT d’être utilisée dans l’archive

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code d’archivage (lignes 552-600)
- [ ] Initialisation de toutes les variables nécessaires AVANT usage
- [ ] Respect strict des règles des hooks React
- [ ] Séparation stricte des étapes (init, logique, handlers, rendu)
- [ ] Vérification de la présence de phaseMaxAtteinte dans chaque archive créée
- [ ] Aucun doublon, aucune déclaration superflue
- [ ] Contrôle d’erreur compilation/runtime/SSR
- [ ] Test du rendu sur tous les cas limites (arrêt en phase 2, 3, 4, 5)
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise du pourcentage d’avancement
- [ ] Toute anomalie ➔ rollback immédiat, rapport d’anomalie
- [ ] Documentation claire de chaque étape
- [ ] Relecture manuelle obligatoire des hooks/variables AVANT usage
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d’anomalies rollback
2. Créer une checklist de contrôle adaptée
3. S’assurer qu’aucune anomalie bloquante n’est présente
4. Proposer rollback immédiat si anomalie détectée

---

### Etape 5 — Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement : 0 %
- Historique : 28/12/2025, plan initial rédigé

---

### Etape 6 — Point de vigilance
- Vérifier que la détection de la phase max ne dépend pas d’un état asynchrone ou d’une variable non initialisée
- S’assurer que la modification ne casse pas la rétrocompatibilité des anciennes archives
- Contrôler que la valeur est bien numérique et comprise entre 1 et 5
- Vérifier la cohérence avec les autres champs archivés

---

### Etape 7 — Proposition de rollback
- Si une anomalie est détectée (ex : phaseMaxAtteinte incorrecte, bug d’archivage, régression), rollback immédiat à la version précédente du code d’archivage, ajout d’une entrée dans le fichier ANOMALIE rollback avec date/heure/détail.

---

### Etape 8 — Rapport Markdown Copilot
#### AVANT
- Archivage sans champ phaseMaxAtteinte
- Impossible de savoir jusqu’à quelle phase l’utilisateur est allé

#### APRÈS
- Archivage avec champ phaseMaxAtteinte (1 à 5)
- Analyse de progression possible, stats et alertes personnalisées

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

## Double lecture template vs plan
- Toutes les étapes du template sont respectées : description, audit, checklist, contrôle, rollback, rapport, validation.
- Aucun écart détecté entre le plan et le template fourni.
- Prêt à soumettre pour validation utilisateur.

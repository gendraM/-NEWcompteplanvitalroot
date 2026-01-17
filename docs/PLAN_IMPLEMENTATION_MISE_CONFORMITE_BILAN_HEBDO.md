# 🟢 PLAN D’IMPLÉMENTATION COPILOT — Mise en conformité bilan hebdomadaire avec le prototype

## Titre de la tâche  
Mise en conformité totale du bilan hebdomadaire avec le prototype validé

---

## **Description précise de la modification attendue**  
- Adapter l’affichage, la logique et les feedbacks du bilan hebdomadaire pour qu’ils correspondent strictement au prototype validé (docs/PROTOTYPE_BILAN_HEBDO_VALIDÉ.md).
- Garantir la présence de toutes les sections, champs, feedbacks, badges, graphiques, et comportements attendus.
- Supprimer ou corriger tout élément non conforme ou obsolète.
- Préserver toutes les fonctionnalités techniques et métiers existantes (pas de perte d’information, pas de régression).

---

## **Fichiers concernés**
- /pages/suivi.js
- /components/BilanHebdoModal.js
- /components/ModalFeedbackValidation.js
- /lib/validationSemaine.js
- /docs/PROTOTYPE_BILAN_HEBDO_VALIDÉ.md
- /docs/FICHE_METIER_BILAN_HEBDO_ALIMENTAIRE_2026-01-13.md

---

### Etape 1 — **Audit des risques préalable**
1. Risque de régression sur la logique de validation ou d’archivage des semaines.
2. Risque d’incohérence d’affichage (ordre, labels, feedbacks, badges).
3. Risque de perte de données ou de feedback utilisateur.
4. Risque de non-respect de l’ordre des hooks React (voir anomalies rollback).
5. Risque de doublon ou de suppression accidentelle de champs techniques.
6. Risque de non-conformité UX (feedback non pédagogique, section manquante).
7. Risque de performance si enrichissement graphique non optimisé.

---

### Etape 2 — **Sous-checklist à valider systématiquement**
- [ ] useState importé et déclaré en haut de chaque composant
- [ ] useEffect importé et déclaré en haut de chaque composant
- [ ] Tous les nouveaux hooks/états/fonctions déclarés AVANT usage
- [ ] Tous les champs du prototype présents dans le rendu
- [ ] Aucune variable d’état ou hook utilisé avant déclaration
- [ ] Vérification manuelle ligne par ligne de l’ordre des hooks

---

### Etape 3 — **Checklist stricte sécurité & qualité**
- [ ] Lecture complète des fichiers concernés (hooks, dépendances, logique)
- [ ] Initialisation systématique de tout nouvel état/hook AVANT usage
- [ ] Respect strict de l’ordre : useState → useEffect → useCallback → logique → handlers → rendu
- [ ] Séparation stricte des étapes (init, logique, handlers, rendu)
- [ ] Contrôle d’erreur compilation, runtime, SSR, accessibilité
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Documentation claire de chaque étape, chaque validation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — **Contrôles conformité à réaliser**
1. Lire toutes les entrées d’anomalies rollback (AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md)
2. Créer une checklist de contrôle adaptée à chaque anomalie connue
3. Vérifier l’absence d’anomalie bloquante avant d’implémenter
4. Proposer rollback immédiat en cas de bug détecté

---

### Etape 5 — **Mise à jour de l’avancement**
- [ ] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — **Point de vigilance**
- Rapport de lecture des anomalies rollback
- Liste des erreurs similaires potentielles (ordre hooks, boucle infinie, doublon, fonction avant usage)
- Checklist de vérification/point de vigilance, impact attendu

---

### Etape 7 — **Proposition de rollback**
- Décrire l’action de rollback, contexte, alternative sûre
- Ajouter l’entrée dans le fichier ANOMALIE rollback (date, heure, détail)

---

### Etape 8 — **Rapport Markdown Copilot**
- Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.)
- À valider par l’utilisateur avant code

---

### Etape 9 — **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

## Prochaine étape

## Synthèse des écarts code/prototype

| Élément / Section                | Présent dans le code | Présent dans le prototype | Écart / Action à mener                         |
|----------------------------------|:--------------------:|:------------------------:|------------------------------------------------|
| Modal bilan hebdo (feedback)     |          ✔           |           ✔              | Harmoniser structure et labels                 |
| Champs extras (nombre/détail)    |          ✔           |           ✔              | Vérifier affichage détaillé (type, moment)     |
| Graphique évolution extras       |          ✖           |           ✔              | À ajouter (7/14j, courbe)                     |
| Répartition types/moments extras |          ✖           |           ✔              | À ajouter (mini/normal/majeur, matin/soir)    |
| Synthèse jours respectés         |          ✖           |           ✔              | À ajouter (structure repas)                    |
| Conseils personnalisés           |          ✔/partiel    |           ✔              | Enrichir selon tendance/écarts                 |
| Évolution paliers/badges         |          ✔/partiel    |           ✔              | Harmoniser affichage, ajouter projection       |
| Projection trajectoire           |          ✖           |           ✔              | À ajouter (perte/maintien/surplus)            |
| Historique/consultation rétro    |          ✔           |           ✔              | Vérifier UX, badge notification                |
| Modal feedback validation        |          ✔           |           ✔              | Harmoniser contenu, feedback détaillé          |
| Notification semaines non validées|         ✔           |           ✔              | Vérifier logique et UX                         |
| Sécurité/ordre hooks             |          ✔           |           ✔              | Vérifier à chaque étape                        |
| Accessibilité/SSR                |          ✔           |           ✔              | Tester tous cas limites                        |

Résumé :
- Les éléments manquants ou partiels concernent surtout les graphiques, la répartition des extras, la projection, et la synthèse structure repas.
- Les feedbacks et conseils sont à enrichir pour coller au prototype.
- L’UX/structure des modals et notifications doit être harmonisée.

---

## Feuille de route technique détaillée

1. **Ajout des graphiques d’évolution (extras/calories 7/14j)**
	- Créer un composant graphique réutilisable (ex: Chart.js ou équivalent)
	- Intégrer dans la section “En savoir plus” du bilan
	- Récupérer et formater les données nécessaires

2. **Répartition types/moments d’extras**
	- Adapter le calcul dans lib/validationSemaine.js
	- Afficher dans le bilan (modal et “En savoir plus”)

3. **Synthèse jours respectés/non respectés**
	- Ajouter la logique de calcul (structure repas)
	- Afficher synthèse claire dans le bilan

4. **Conseils personnalisés enrichis**
	- Adapter genererMessageFeedback pour intégrer tendance, écarts, projection
	- Ajouter des cas de feedback selon la fiche métier

5. **Évolution paliers, badges, récompenses**
	- Harmoniser l’affichage avec le prototype (historique, projection)
	- Ajouter la projection douce sur la trajectoire

6. **Projection trajectoire (perte/maintien/surplus)**
	- Ajouter la logique de calcul et d’affichage

7. **Harmonisation modals et notifications**
	- Vérifier structure, labels, accessibilité, UX
	- Tester tous les cas limites (validation, consultation rétro, badge)

8. **Sécurité, accessibilité, SSR**
	- Vérifier l’ordre des hooks, l’accessibilité, le rendu SSR à chaque étape
	- Tester sur tous devices (desktop, mobile, tablette)

9. **Documentation et traçabilité**
	- Documenter chaque étape, chaque validation, chaque anomalie
	- Mettre à jour le plan d’avancement à chaque jalon

10. **Tests finaux et validation utilisateur**
	- Vérifier la conformité sur tous les cas d’usage
	- Attendre validation utilisateur avant toute mise en production

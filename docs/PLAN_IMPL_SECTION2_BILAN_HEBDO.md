## 🔎 Analyse de conformité Section 7 — « Comment j’ai mangé »

### Points conformes à l’attendu métier

- Bloc rétractable respecté (pas de surcharge, accès par bouton).
- Titres et sous-titres alignés fiche métier (« Ressenti global de la semaine », « Répartition des extras hors repas »).
- Données affichées : satiété, humeur, répartition extras (matin, après-midi, soir, nuit).
- Message doux présent, non redondant, conforme à l’esprit Plan Vital.
- Absence de surcharge et de phrase de remerciement inutile.
- Accessibilité visuelle (contraste, hiérarchie, lisibilité) respectée.

### Écarts ou points à enrichir

1. **Données dynamiques** :
	- Les valeurs affichées semblent par défaut/simulées. Il faut garantir l’agrégation dynamique à partir des données réelles (repas_reels, extras, etc.).
2. **Note utilisateur** :
	- La note n’apparaît pas. Afficher la note si présente, sinon « Non renseigné ».
3. **Répartition extras hors repas** :
	- Toutes les valeurs à 0. Vérifier la logique d’agrégation ; si aucun extra, afficher « Aucun extra hors repas cette semaine ».
4. **Accessibilité ARIA** :
	- Vérifier navigation clavier et focus (cf. checklist métier).
5. **Personnalisation du verbatim** :
	- Adapter le message doux selon la semaine (ex : beaucoup d’extras, humeur basse, etc.).
6. **Robustesse cas limites** :
	- Si aucune donnée n’est saisie, prévoir un affichage pédagogique (« Aucune donnée saisie cette semaine. Pense à compléter ton journal pour un suivi plus précis ! »).

---

## 🛠️ Plan d’action pour traiter les écarts Section 7

1. **Rendre tous les champs dynamiques**
	- Brancher l’agrégation sur les vraies données de la semaine (repas_reels, extras, etc.).
	- Supprimer toute valeur par défaut statique.
2. **Afficher la note utilisateur**
	- Si présente, afficher la note ; sinon, indiquer « Non renseigné ».
3. **Gestion pédagogique des extras hors repas**
	- Si aucun extra hors repas, afficher une mention pédagogique.
	- Vérifier la logique d’agrégation par moment de la journée.
4. **Accessibilité**
	- Vérifier et tester la navigation clavier, le focus, et les attributs ARIA du bloc rétractable.
5. **Personnalisation du message doux**
	- Adapter le verbatim selon les données de la semaine (ex : humeur basse, extras nombreux, etc.).
6. **Gestion des cas sans saisie**
	- Si aucune donnée n’est saisie, afficher un message pédagogique global.
7. **Tests**
	- Tester tous les cas d’usage et cas limites (aucune donnée, données partielles, etc.).

---

*Cette analyse et ce plan d’action doivent être validés et suivis avant toute évolution ou enrichissement de la Section 7.*
# 🟢 PLAN D’IMPLÉMENTATION — Bilan Hebdomadaire Alimentaire (Section 2)

## Titre de la tâche
Implémenter la section 2 “Tendance et trajectoire” du bilan hebdomadaire alimentaire, en conformité stricte avec la fiche métier et la méthodologie Copilot.

---

## Description précise de la modification attendue
- Afficher la tendance pondérale (perte/maintien/surplus) sur 7j et 14j.
- Comparer la semaine N à la semaine N-1 (évolution, flèche, couleur, verbatim dynamique).
- Calculer et afficher la moyenne énergétique sur 14 jours.
- Positionner la semaine courante par rapport à la trajectoire (visualisation, phrase signature).
- Générer la phrase signature métier sur la répétition de tendance.
- Tous les blocs doivent être dynamiques, strictement alignés sur les règles métier, et visuellement différenciés selon la situation réelle.

---

## Fichiers concernés
- /components/BilanHebdoModal.js
- /lib/validationSemaine.js
- /pages/suivi.js
- /docs/COMPARAISON_FICHE_METIER_BILAN_HEBDO.md

---

### Etape 1 — Audit des risques préalable
1. Risque UX : 
	- Mauvaise lisibilité des tendances (7j/14j) si trop d’informations affichées d’un coup.
	- Confusion sur la période (7j/14j) si les labels ne sont pas explicites.
	- Surcharge visuelle si la section 2 n’est pas intégrée dans un bloc rétractable (accordion) comme validé.
	- Risque que l’utilisateur ne voie pas le détail si le bloc rétractable n’est pas bien signalé (bouton “Voir le détail” peu visible).
2. Risque technique : 
	- Erreurs de calcul sur la moyenne 14j (doit être la moyenne réelle des calories consommées, pas une projection).
	- Mauvaise récupération de l’historique N-1 (données manquantes, semaine non validée).
	- Problème de synchronisation des données si la logique de Section 2 interfère avec Section 1.
3. Risque de régression sur la logique de Section 1 (toute modification doit préserver l’affichage et la dynamique de la première section).
4. Risque d’incohérence si données manquantes (ex : pas de semaine N-1 validée, pas assez de jours pour la moyenne 14j).
5. Risque accessibilité : 
	- Navigation modale (focus, tabulation, accessibilité clavier).
	- Couleurs et icônes (doivent être compréhensibles pour tous, y compris daltoniens).
	- Bloc rétractable doit être accessible (ARIA, focus, etc.).
6. Risque de non-conformité métier : 
	- Verbatims non strictement alignés avec la fiche métier.
	- Séquençage ou visualisation non conforme (ordre, couleurs, icônes).
	- Bloc “Moyenne énergétique 14j” doit afficher la moyenne réelle des calories consommées, pas une estimation.
7. Consulter le fichier d’anomalies rollback avant toute modification (pour éviter la reproduction d’erreurs passées et garantir la traçabilité).

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé en haut du composant ?
- [ ] useEffect importé en haut du composant ?
- [ ] Toutes les variables d’état et hooks déclarées AVANT leur usage (y compris dans les dépendances de useEffect) ?
- [ ] Fonctions de calcul et helpers importés et testés ?
- [ ] Props et handlers bien typés, documentés et testés ?
- [ ] Bloc rétractable (accordion) importé ou codé, et accessibilité vérifiée ?
- [ ] Labels et verbatims strictement alignés fiche métier ?
- [ ] Données N-1 et 14j vérifiées comme disponibles avant tout calcul ?
- [ ] Couleurs et icônes accessibles (contraste, ARIA, etc.) ?
- [ ] Tests unitaires ou manuels prévus pour chaque sous-bloc ?

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (BilanHebdoModal.js, validationSemaine.js, etc.)
- [ ] Initialisation systématique de tous les hooks et variables d’état AVANT usage
- [ ] Hooks déclarés uniquement en haut du composant (jamais dans une fonction, boucle, map, if, etc.)
- [ ] Séparation stricte des étapes : initialisation → logique calculée → handlers/fonctions → rendu
- [ ] Contrôle d’erreur systématique :
	- Données manquantes (N-1, 14j)
	- Calculs (moyenne, tendance, comparaison)
	- Rendu (affichage conditionnel, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites (ex : pas de N-1, moins de 14 jours, données incomplètes)
- [ ] Préservation stricte des fonctionnalités existantes (Section 1, aucun effet de bord)
- [ ] Documentation claire de chaque étape (commentaires, changelog, rapport Copilot)
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation ou commit
- [ ] Bloc rétractable testé sur accessibilité (clavier, ARIA, focus, contraste)

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d’anomalies rollback (fichier dédié) pour identifier les points de vigilance et éviter la reproduction d’erreurs passées.
2. Créer une checklist de contrôle à appliquer avant le codage :
	- Vérifier la disponibilité des données N-1 et 14j
	- Vérifier l’import et la déclaration de tous les hooks/variables AVANT usage
	- Vérifier l’accessibilité du bloc rétractable (clavier, ARIA, contraste)
	- Vérifier la conformité stricte des verbatims et labels
	- Vérifier la robustesse du rendu sur tous les cas limites
	- Vérifier la non-régression sur Section 1
3. Ajouter l’analyse de l’audit des risques (cf. étape 1) et s’assurer qu’il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. Si anomalie/bug identifié, proposition immédiate de rollback à confirmer avec l’utilisateur :
	- Retour à la version précédente
	- Ajout d’une entrée détaillée dans le fichier rollback (date, heure, contexte, impact)
	- Rapport à l’utilisateur pour validation

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé

| Étape | Statut | Date | Commentaire |
|-------|--------|------|-------------|
| Audit des risques | [x] | 18/01/2026 | Complété, retours validés intégrés |
| Checklist systématique | [x] | 18/01/2026 | Complétée, conforme au plan |
| Checklist sécurité/qualité | [x] | 18/01/2026 | Complétée, détaillée |
| Contrôles conformité | [x] | 18/01/2026 | Checklist et gestion rollback intégrées |
| ... | ... | ... | ... |

Avancement précis/Pourcentage réel : ____ %
Historique des mises à jour : ___

---

### Etape 6 — Point de vigilance
1. Vérifier la disponibilité effective des données N-1 et 14j avant tout calcul (afficher un message pédagogique si absent).
2. S’assurer que la logique de tendance (Section 2) ne perturbe jamais l’affichage, la logique ou les calculs de la Section 1.
3. Contrôler la robustesse de la navigation modale et de l’accessibilité (focus, tabulation, ARIA, contraste, clavier).
4. Relire tous les hooks, variables et dépendances pour éviter toute anomalie (ordre, portée, initialisation).
5. Intégrer le rapport de lecture du fichier anomalies rollback et la checklist de vérification adaptée à chaque étape.
6. Vérifier que le bloc rétractable (accordion) est bien accessible et signalé visuellement (bouton “Voir le détail” visible, ARIA, focus).
7. Vérifier la conformité stricte des verbatims, labels et couleurs avec la fiche métier.

---

### Etape 7 — Proposition de rollback
- Si anomalie détectée :
	- Retour immédiat à la version précédente (rollback Git ou code)
	- Ajout d’une entrée détaillée dans le fichier rollback (date, heure, contexte, impact, code concerné)
	- Rapport à l’utilisateur pour validation et choix de la suite
	- Aucune suppression dans le fichier rollback, toujours ajouter à la suite pour garantir la traçabilité

---

### Etape 8 — Rapport Markdown Copilot
- Générer un rapport structuré AVANT et APRÈS toute modification (structure, hooks, fonctions, rendu, accessibilité, conformité métier).
- Ce rapport doit permettre une validation éclairée, claire et synthétique par l’utilisateur.
- Exemple :
	- AVANT : useState non importé, labels non conformes, bloc non accessible
	- APRÈS : useState importé, labels strictement métier, bloc rétractable accessible (ARIA, focus, contraste)
- Ce rapport doit être validé par l’utilisateur avant tout commit ou déploiement.

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [x] Plan validé par l’utilisateur à la date : 18/01/2026

---

## 🟢 Plan d’action étape par étape (Section 2)

1. Afficher la tendance pondérale (perte/maintien/surplus) sur 7j et 14j, avec visualisation dynamique.
2. Ajouter la comparaison N/N-1 (flèche, couleur, verbatim dynamique).
3. Calculer et afficher la moyenne énergétique sur 14 jours.
4. Positionner la semaine courante sur la trajectoire (visualisation, phrase signature).
5. Générer la phrase signature métier sur la répétition de tendance.
6. Tester chaque étape indépendamment.
7. Recueillir le feedback utilisateur et ajuster au fil de l’eau.

─────────────────────────────────────────────

Merci de valider ce plan ou de demander des ajustements avant toute implémentation de code.

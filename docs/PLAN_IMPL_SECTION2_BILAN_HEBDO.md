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
## 📋 TODO DÉTAILLÉE — MISE EN CONFORMITÉ SECTION 2 & SECTION 7

**Date création** : 21 janvier 2026  
**Statut global** : En cours de planification  
**Prochaine revue** : Après validation utilisateur

---

### 🎯 SECTION 7 — "Comment j'ai mangé"

#### ✅ TODO 7.1 — Phase 1 : Dynamiser les données (PRIORITÉ 🔥 CRITIQUE)

**Objectif** : Remplacer données simulées par calculs réels

**Tâches** :
- [ ] **7.1.1** Calculer `satieteMoyenne` dans `pages/suivi.js`
  - Filtrer repas avec `satiete !== null`
  - Calculer moyenne : `sum(satiete) / count`
  - Format affichage : "4.2 / 5" ou "Non renseigné"
  - **Fichier** : `pages/suivi.js` (ligne ~1090, préparation bilan)
  - **Durée estimée** : 20min

- [ ] **7.1.2** Calculer `humeurDominante` dans `pages/suivi.js`
  - Filtrer repas avec `humeur_associee !== null`
  - Calculer mode statistique (humeur la plus fréquente)
  - Format affichage : "Bonne énergie" ou "Non renseigné"
  - **Fichier** : `pages/suivi.js` (ligne ~1090, préparation bilan)
  - **Durée estimée** : 20min

- [ ] **7.1.3** Ajouter `satieteMoyenne` et `humeurDominante` à l'objet `bilan`
  - Passer au composant `BilanHebdoModal`
  - Remplacer valeurs statiques dans `SectionCommentMange`
  - **Fichier** : `pages/suivi.js` (objet bilanData) + `components/BilanHebdoModal.js` (ligne 617)
  - **Durée estimée** : 15min

- [ ] **7.1.4** Afficher note utilisateur si présente
  - Vérifier `bilan?.note` (pas `syntheseSemaine.note`)
  - Affichage conditionnel avec style italique
  - **Fichier** : `components/BilanHebdoModal.js` (ligne 649)
  - **Durée estimée** : 10min

- [ ] **7.1.5** Gérer cas "Aucune donnée saisie"
  - Si `!satieteMoyenne && !humeurDominante` → message pédagogique
  - Message : "Aucune donnée de ressenti saisie cette semaine. Pense à compléter ton journal !"
  - **Fichier** : `components/BilanHebdoModal.js` (ligne 630)
  - **Durée estimée** : 15min

**Validation** : Tests avec semaines réelles, cas limites (0 donnée, données partielles)

---

#### ✅ TODO 7.2 — Phase 2 : Répartition extras temporelle (PRIORITÉ 🔥 HAUTE)

**Objectif** : Détecter patterns temporels (grignotage soir/nuit)

**Tâches** :
- [ ] **7.2.1** Créer fonction `categoriserMomentJournee(heure)` dans `lib/validationSemaine.js`
  - Matin : 6h-12h
  - Après-midi : 12h-18h
  - Soir : 18h-23h
  - Nuit : 23h-6h
  - **Fichier** : `lib/validationSemaine.js` (après fonction `calculerTendance7j`)
  - **Durée estimée** : 15min

- [ ] **7.2.2** Créer fonction `calculerRepartitionExtrasTemporelle(repasExtras)` dans `lib/validationSemaine.js`
  - Retourner objet `{ matin: 0, apresmidi: 0, soir: 0, nuit: 0 }`
  - Compter extras par moment si `heure_saisie` présente
  - **Fichier** : `lib/validationSemaine.js` (après `categoriserMomentJournee`)
  - **Durée estimée** : 25min

- [ ] **7.2.3** Intégrer calcul dans `pages/suivi.js`
  - Filtrer extras avec `heure_saisie`
  - Appeler `calculerRepartitionExtrasTemporelle`
  - Ajouter à `bilanData.extrasHorsRepas`
  - **Fichier** : `pages/suivi.js` (ligne ~1090, calcul bilan)
  - **Durée estimée** : 20min

- [ ] **7.2.4** Affichage conditionnel dans `BilanHebdoModal.js`
  - Si tous moments === 0 → "Aucun extra hors repas cette semaine. Bravo !"
  - Sinon → afficher répartition avec `<span>Matin : <b>{x}</b></span>`
  - **Fichier** : `components/BilanHebdoModal.js` (ligne 652-658)
  - **Durée estimée** : 30min

- [ ] **7.2.5** Vérifier que table `repas_reels` a colonne `heure_saisie`
  - Si absente → créer migration Supabase
  - Type : `TIME` ou `TIMESTAMP`
  - **Fichier** : Vérifier schéma BDD, créer migration si nécessaire
  - **Durée estimée** : 20min (si migration nécessaire)

**Validation** : Tests avec extras répartis différemment, cas 0 extra, heure manquante

---

#### ✅ TODO 7.3 — Phase 3 : Personnalisation message doux (PRIORITÉ 🟡 MOYENNE)

**Objectif** : Adapter verbatim selon patterns détectés

**Tâches** :
- [ ] **7.3.1** Créer fonction `genererMessageDoux(syntheseSemaine, bilan)` dans `BilanHebdoModal.js`
  - Cas 1 : Extras soir/nuit > 70% → "signal fatigue/charge mentale"
  - Cas 2 : Humeur basse + extras > 3 → "corps cherche réconfort"
  - Cas 3 : Satiété < 3.5 → "augmente protéines/fibres"
  - Cas 4 : Tout OK → "belle régularité"
  - Cas défaut : Message actuel
  - **Fichier** : `components/BilanHebdoModal.js` (avant composant `SectionCommentMange`)
  - **Durée estimée** : 45min

- [ ] **7.3.2** Appeler fonction dans rendu message doux
  - Remplacer message statique par `{genererMessageDoux(syntheseSemaine, bilan)}`
  - **Fichier** : `components/BilanHebdoModal.js` (ligne 661)
  - **Durée estimée** : 10min

**Validation** : Tests tous les cas (fatigue, humeur basse, satiété basse, tout OK)

---

### 🧭 SECTION 2 — "Tendance et trajectoire"

#### ✅ TODO 2.1 — Nouvelle logique comparaison N/N-1 (PRIORITÉ 🔥 CRITIQUE)

**Objectif** : Implémenter 3 cas métier (éloignement/rapprochement/reproduction)

**Référence métier** :
- CAS 1 🔴 : ÉLOIGNEMENT (écart augmente > 100 kcal)
- CAS 2 🟢 : RAPPROCHEMENT (écart diminue > 100 kcal)
- CAS 3 🟡 : REPRODUCTION (variation < 100 kcal)

**Tâches** :
- [ ] **2.1.1** Modifier fonction `calculerComparaisonN1` dans `lib/validationSemaine.js`
  - Calculer `evolutionEcart = Math.abs(ecartN) - Math.abs(ecartN1)`
  - Si `evolutionEcart > 100` → ÉLOIGNEMENT
  - Si `evolutionEcart < -100` → RAPPROCHEMENT
  - Si `Math.abs(evolutionEcart) <= 100` → REPRODUCTION
  - **Fichier** : `lib/validationSemaine.js` (fonction existante ligne ~400)
  - **Durée estimée** : 45min

- [ ] **2.1.2** Créer verbatims conformes métier
  - ÉLOIGNEMENT : "L'écart avec l'objectif augmente. Le comportement s'éloigne de la cible."
  - RAPPROCHEMENT : "L'écart avec l'objectif diminue. Le comportement se rapproche de la cible."
  - REPRODUCTION : "L'écart reste quasiment identique. Le même schéma se répète, sans ajustement notable."
  - **Interdictions** : "Tu devrais", "Attention", "Alerte", "Déséquilibre", "Risque"
  - **Fichier** : `lib/validationSemaine.js` (dans fonction `calculerComparaisonN1`)
  - **Durée estimée** : 30min

- [ ] **2.1.3** Mettre à jour couleurs et icônes
  - ÉLOIGNEMENT : Rouge `#e74c3c`, icône `↗️` ou `📈`
  - RAPPROCHEMENT : Vert `#27ae60`, icône `↘️` ou `📉`
  - REPRODUCTION : Orange `#f39c12`, icône `➡️` ou `🔄`
  - **Fichier** : `lib/validationSemaine.js` + `components/BilanHebdoModal.js`
  - **Durée estimée** : 20min

**Validation** : Tests avec vraies données N et N-1, cas limites (N-1 absente)

---

#### ✅ TODO 2.2 — Nouveau rôle moyenne 14j (PRIORITÉ 🔥 HAUTE)

**Objectif** : Moyenne confirme direction, ne la décide pas

**Hiérarchie métier** :
1. Semaine en cours → ce que tu viens de faire
2. Comparaison N/N-1 → ajustes-tu ou répètes-tu
3. Moyenne 14j → est-ce que ça commence à s'imprimer

**Tâches** :
- [ ] **2.2.1** Repositionner bloc Moyenne 14j APRÈS comparaison N/N-1
  - Actuellement dans `AccordionTendance`, ordre OK mais verbatim à revoir
  - **Fichier** : `components/BilanHebdoModal.js` (ligne ~280)
  - **Durée estimée** : 10min (vérification uniquement)

- [ ] **2.2.2** Créer phrase de mise en garde si moyenne biaisée
  - Si semaine N et N-1 ont tendances opposées :
    - "⚠️ Cette moyenne est influencée par la semaine précédente, plus proche de l'équilibre. La semaine en cours, elle, s'éloigne davantage."
  - **Fichier** : `components/Moyenne14jBlock.js` ou `BilanHebdoModal.js`
  - **Durée estimée** : 30min

- [ ] **2.2.3** Ajouter phrase signature selon répétition
  - Si 2 semaines surplus : "Un schéma commence à se fixer."
  - Si stabilité : "Pas de progrès. Pas de dégradation. Répétition."
  - Si amélioration : "Le corps perçoit un changement dans la direction prise."
  - **Fichier** : `components/Moyenne14jBlock.js`
  - **Durée estimée** : 40min

**Validation** : Tests avec vraies données 14j, cas semaines opposées

---

#### ✅ TODO 2.3 — Intégrer verbatim référence partie chiffrée (PRIORITÉ 🔥 CRITIQUE)

**Objectif** : Implémenter structure exacte du verbatim métier

**Structure obligatoire** :
```
📊 Lecture sur 14 jours — ce qui s'accumule
  → Cumul total
  → Phrase interprétation (écarts s'additionnent)

📊 Lecture du rythme réel
  → Moyenne journalière
  → Phrase clé : "Le corps ne réagit pas aux journées isolées"

📊 Mise en perspective temporelle
  → Détail semaines N-1 et N
  → Traduction consciente

🧭 Phrase signature récurrente
  → "Une journée ne décide rien. Une semaine oriente. Deux semaines commencent à s'imprimer."
```

**Tâches** :
- [ ] **2.3.1** Créer composant `BlocLecture14j` dans `BilanHebdoModal.js`
  - Reprendre verbatim exact du document COMPARAISON_FICHE_METIER_BILAN_HEBDO.md
  - Respecter ordre strict : Cumul → Rythme → Perspective → Signature
  - **Fichier** : `components/BilanHebdoModal.js` (nouveau composant après `AccordionTendance`)
  - **Durée estimée** : 1h30

- [ ] **2.3.2** Calculer données nécessaires dans `pages/suivi.js`
  - `cumul14j` : Total écart sur 14 jours
  - `moyenneJour14j` : Cumul ÷ 14
  - `ecartN1` : Écart semaine précédente
  - `ecartN` : Écart semaine courante
  - **Fichier** : `pages/suivi.js` (calcul bilan, ligne ~1090)
  - **Durée estimée** : 45min

- [ ] **2.3.3** Implémenter affichage avec formatage métier
  - "Sur les 14 derniers jours : Ton corps a reçu **+1 890 kcal** au-dessus de ton objectif."
  - "Cela représente une moyenne de **+135 kcal par jour**"
  - "Détail des deux semaines : • Semaine N-1 : **+912 kcal** • Semaine N : **+978 kcal**"
  - **Fichier** : `components/BilanHebdoModal.js` (composant `BlocLecture14j`)
  - **Durée estimée** : 1h

- [ ] **2.3.4** Vérifier conformité stricte verbatims
  - ❌ Interdits : "Tu devrais", "Attention", "Alerte", "Déséquilibre", "Risque"
  - ✅ Requis : Trajectoire, direction, continuité, rythme, temps
  - Phrases exactes du document référence
  - **Fichier** : Revue complète `BilanHebdoModal.js` + `validationSemaine.js`
  - **Durée estimée** : 30min

**Validation** : Relecture utilisateur obligatoire, tests tous cas (surplus, déficit, maintien)

---

### 🔐 RÈGLES STRICTES COPILOT (À RESPECTER PARTOUT)

**Principes fondamentaux** :
- ✅ Parler en trajectoire, direction, chemin, rythme
- ✅ Toujours interpréter les chiffres, jamais seuls
- ✅ Rappeler : journée ≠ décision, répétition = orientation
- ❌ Jamais juger (bien/mal)
- ❌ Jamais ordonner ou conseiller directement
- ❌ Interdits : "Tu devrais", "Attention", "Alerte", "Déséquilibre", "Risque"

**Phrase signature récurrente** (à utiliser systématiquement) :
> "Une journée ne décide rien.  
> Une semaine oriente.  
> Deux semaines commencent à s'imprimer."

---

### 🧪 TODO 7.4 & 2.4 — Tests d'accessibilité (PRIORITÉ 🟡 MOYENNE)

**Objectif** : Garantir navigation clavier, ARIA, contraste

**Tâches communes Section 2 & 7** :
- [ ] **T.1** Navigation clavier complète
  - Tab : focus visible sur tous boutons
  - Enter/Espace : ouvre/ferme blocs
  - Escape : ferme modale
  - **Tests** : Naviguer sans souris
  - **Durée estimée** : 20min

- [ ] **T.2** Attributs ARIA complets
  - `aria-expanded`, `aria-controls` sur blocs rétractables
  - `aria-label` descriptifs
  - `role="region"` sur sections importantes
  - **Tests** : Screen reader (NVDA, JAWS, VoiceOver)
  - **Durée estimée** : 30min

- [ ] **T.3** Contraste couleurs WCAG AA
  - Rouge : `#e74c3c` → vérifier ratio ≥ 4.5:1
  - Vert : `#27ae60` → vérifier ratio ≥ 4.5:1
  - Orange : `#f39c12` → vérifier ratio ≥ 4.5:1
  - **Outil** : Contrast Checker online
  - **Durée estimée** : 15min

- [ ] **T.4** Focus management
  - Focus automatique sur modale à l'ouverture
  - Trap focus dans modale (pas d'échappement)
  - Retour focus au déclencheur à la fermeture
  - **Tests** : Navigation Tab complète
  - **Durée estimée** : 25min

**Validation** : Tests utilisateurs réels, checklist WCAG

---

### 📊 RÉCAPITULATIF DURÉES ESTIMÉES

| Section | Phase | Durée totale |
|---------|-------|--------------|
| Section 7 - Phase 1 | Dynamiser données | 1h20 |
| Section 7 - Phase 2 | Répartition temporelle | 2h10 |
| Section 7 - Phase 3 | Message personnalisé | 55min |
| Section 2 - Comparaison N/N-1 | Nouvelle logique | 1h35 |
| Section 2 - Moyenne 14j | Nouveau rôle | 1h20 |
| Section 2 - Verbatim référence | Partie chiffrée | 3h45 |
| Tests accessibilité | Sections 2 & 7 | 1h30 |
| **TOTAL ESTIMÉ** | | **12h35** |

---

### 🎯 ORDRE DE PRIORITÉ RECOMMANDÉ

1. **🔥 TODO 2.3** — Verbatim référence partie chiffrée (fondation métier)
2. **🔥 TODO 2.1** — Nouvelle logique comparaison N/N-1 (logique métier)
3. **🔥 TODO 7.1** — Dynamiser données Section 7 (quick win visible)
4. **🔥 TODO 2.2** — Nouveau rôle moyenne 14j (cohérence métier)
5. **🟡 TODO 7.2** — Répartition extras temporelle (insight utilisateur)
6. **🟡 TODO 7.3** — Message doux personnalisé (coaching)
7. **🟡 TODO 7.4 & 2.4** — Tests accessibilité (qualité finale)

---

### ✅ VALIDATION UTILISATEUR REQUISE

**Avant implémentation** :
- [ ] Validation ordre de priorité
- [ ] Validation verbatims Section 2 (conformité stricte requise)
- [ ] Validation approche répartition extras temporelle
- [ ] Validation stratégie message doux personnalisé

**Après chaque phase** :
- [ ] Revue code + tests
- [ ] Validation UX utilisateur final
- [ ] Ajustements si nécessaire

**DATE VALIDATION GLOBALE** : _______________

---

*TODO créée le 21 janvier 2026 par GitHub Copilot*  
*Conformité stricte : COMPARAISON_FICHE_METIER_BILAN_HEBDO.md + PLAN_IMPL_SECTION2_BILAN_HEBDO.md*

─────────────────────────────────────────────
Merci de valider ce plan ou de demander des ajustements avant toute implémentation de code.

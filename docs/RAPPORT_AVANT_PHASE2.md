# 📊 RAPPORT AVANT PHASE 2 - État actuel pages/suivi.js

**Date** : 18 janvier 2026 (avant intégration calculs ABC)  
**Branche** : `feature/bilan-lectures-abc`  
**Contexte** : Phase 1 terminée (5 fonctions créées), Phase 2 va intégrer ces fonctions dans handleValiderSemaine

---

## 1️⃣ Imports existants (lignes 35-45)

```javascript
import {
  calculerExtrasSemaine,
  genererMessageFeedback,
  calculerVariation,
  getMonday,
  addDays,
  formatDate,
  calculerTendance7j,
  calculerRepartitionExtrasTemporelle
} from '../lib/validationSemaine';
```

✅ **Déjà importé** : validationSemaine accessible  
⚠️ **À ajouter** : 4 nouvelles fonctions (calculerRepartitionJours, calculerImpactJours, calculerEvolutionExtras, analyserFragilites)

---

## 2️⃣ Structure handleValiderSemaine (lignes 1016-1293)

### Séquence actuelle :
1. **Lignes 1016-1034** : Calcul bornes semaine (lundi-dimanche ISO 8601)
2. **Lignes 1036-1052** : Fetch repas via `fetchRepasPeriode()`
3. **Lignes 1054-1082** : Récupération profil utilisateur + calcul budgetExtras
4. **Lignes 1084-1099** : Calcul extras semaine N (`calculerExtrasSemaine`), variation N vs N-1, messageFeedback
5. **Lignes 1101-1109** : Calcul Section 1 (apportsTotaux, objectifHebdo, kcalExtras, tendance7j)
6. **Lignes 1111-1185** : Calcul Section 7 (satiété moyenne, ressenti dominant, note utilisateur)
7. **Lignes 1187-1197** : Calcul répartition temporelle extras (`calculerRepartitionExtrasTemporelle`)
8. **Lignes 1200-1212** : Construction objet `bilanToInsert` pour Supabase (semaines_validees)
9. **Lignes 1224-1239** : Insert Supabase avec upsert
10. **Lignes 1241-1255** : Construction `bilanData` pour modale + `setBilanData()` + `setShowBilanModal(true)`
11. **Lignes 1257-1270** : Détection fin de mois → popup bilan mensuel
12. **Lignes 1273-1283** : Rechargement timeline validations

### Variables clés disponibles pour Phase 2 :
- ✅ `repasData` (array repas de la semaine) — ligne 1038
- ✅ `selectedWeekStart` (date lundi 'yyyy-MM-dd') — ligne 1023
- ✅ `objectifHebdo` (nombre) — ligne 1105
- ✅ `objectifJour` (apport cible journalier) — ligne 1104
- ✅ `extrasInfo` (objet {count, details, kcal}) — ligne 1084

---

## 3️⃣ Objet bilanData actuel (ligne 1242)

```javascript
setBilanData({
  weekStart: selectedWeekStart,
  apportsTotaux,
  objectifHebdo,
  kcalExtras,
  extras: extrasInfo.count,
  budgetExtras,
  variation,
  // Section 7 - Données ressenti
  satieteMoyenne,
  humeurDominante,
  noteUtilisateur,
  nbRepasSatiete,
  nbRepasRessenti,
  extrasHorsRepas: repartitionTemporelle,
});
```

### Propriétés existantes :
- `weekStart` (string)
- `apportsTotaux` (number)
- `objectifHebdo` (number)
- `kcalExtras` (number)
- `extras` (number - count extras)
- `budgetExtras` (number)
- `variation` (number - delta extras N vs N-1)
- `satieteMoyenne` (string float "4.2")
- `humeurDominante` (string emoji + texte)
- `noteUtilisateur` (string | null)
- `nbRepasSatiete` (number)
- `nbRepasRessenti` (number)
- `extrasHorsRepas` (object)

### ⚠️ Propriétés à ajouter (Phase 2) :
- **Lecture A** : `joursCategories`, `joursIncomplets`, `detailsJours`, `longestStreak`, `streaks`, `objectifJournalier`
- **Lecture B** : `surplusTotal`, `jourPlusLourd`, `repartition`
- **Lecture C** : `deltaKcal`, `deltaNb`, `tendanceExtras`
- **Enrichissement** : `fragilites` (objet avec joursDebordement, typologieProblematique, momentFragile)

---

## 4️⃣ Variables disponibles pour Fetch N-1

**Ligne 1088-1095** : Déjà présent un fetch semaine N-1 pour `variation` extras :
```javascript
const { data: semainesPrecedentes } = await supabase
  .from('semaines_validees')
  .select('weekStart, extras_count')
  .lt('weekStart', selectedWeekStart)
  .order('weekStart', { ascending: false })
  .limit(1);
const extrasN1 = semainesPrecedentes && semainesPrecedentes.length > 0 ? semainesPrecedentes[0].extras_count : null;
const variation = (extrasN1 !== null && typeof extrasN1 === 'number') ? extrasInfo.count - extrasN1 : 0;
```

✅ **Réutilisable** : `semainesPrecedentes[0].weekStart` donne le lundi N-1  
⚠️ **À compléter** : Fetch `extras_details` pour extraire kcalExtras N-1 et nbExtras N-1

---

## 5️⃣ Point d'insertion Phase 2

**🎯 Ligne 1185-1200** : Après calcul `repartitionTemporelle`, avant construction `bilanToInsert`

**Séquence Phase 2** :
1. Appeler `calculerRepartitionJours(repasData, selectedWeekStart, objectifHebdo)` → récupérer `joursCategories`, `detailsJours`, etc.
2. Appeler `calculerImpactJours(detailsJours)` → récupérer `surplusTotal`, `jourPlusLourd`, `repartition`
3. Compléter fetch N-1 pour récupérer `extras_details` → parser JSON → extraire kcalExtras N-1 et nbExtras N-1
4. Appeler `calculerEvolutionExtras(extrasKcalN, extrasNbN, extrasKcalN1, extrasNbN1)` → récupérer `deltaKcal`, `deltaNb`, `tendanceExtras`
5. Appeler `analyserFragilites(detailsJours, repasData)` → récupérer `fragilites`
6. Enrichir `bilanData` avec toutes ces nouvelles propriétés

---

## 6️⃣ Risques identifiés

- ⚠️ **Dépendance N-1** : Si aucune semaine N-1 validée, `calculerEvolutionExtras` retourne `null` → gérer cas `tendanceExtras === null` dans BilanHebdoModal
- ⚠️ **Type objectifHebdo** : Actuellement number (ligne 1105 : `objectifJour * 7`), cohérent avec Phase 1 qui attend number
- ⚠️ **repasData vs repasSemaine** : Phase 1 attend `repasSemaine` en paramètre, mais variable locale est `repasData` → utiliser `repasData`
- ⚠️ **Performance** : 4 appels de fonctions + 1 fetch Supabase supplémentaire → impact estimé <200ms acceptable

---

## 7️⃣ Vérifications pré-modification

- ✅ `validationSemaine.js` exporte bien les 4 fonctions (vérifié Phase 1)
- ✅ Tests unitaires passent (test-phase1.js validé)
- ✅ Aucune syntaxe error dans lib/validationSemaine.js (node -c OK)
- ✅ Branche Git active : `feature/bilan-lectures-abc`
- ✅ Backup créé : `pages/suivi.js.backup-avant-abc`

---

## 8️⃣ Checklist Phase 2

- [ ] Ajouter 4 imports dans section imports (ligne 35-45)
- [ ] Insérer calculs ligne ~1185 (après `repartitionTemporelle`)
- [ ] Compléter fetch N-1 pour récupérer `extras_details`
- [ ] Parser JSON `extras_details` pour extraire kcal/nb
- [ ] Appeler `calculerRepartitionJours` avec `(repasData, selectedWeekStart, objectifHebdo)`
- [ ] Appeler `calculerImpactJours` avec `detailsJours`
- [ ] Appeler `calculerEvolutionExtras` avec 4 paramètres
- [ ] Appeler `analyserFragilites` avec `(detailsJours, repasData)`
- [ ] Enrichir `bilanData` avec 15 nouvelles propriétés
- [ ] Tester compilation : `node -c pages/suivi.js`
- [ ] Créer rapport APRÈS Phase 2
- [ ] Demander validation utilisateur avant Phase 3

---

**État** : ✅ Prêt pour Phase 2  
**Prochaine action** : Modification pages/suivi.js selon plan ci-dessus

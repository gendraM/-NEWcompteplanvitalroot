# TODO - ANALYSE ÉCART: Comportement attendu vs Code existant

## 📖 ANALYSE DU FICHIER SYNTHESE_HISTORIQUE_REPRISES.md

### Comportement ATTENDU pour l'historique reprises

D'après `SYNTHESE_HISTORIQUE_REPRISES.md` (pp. 28/12/2025), l'historique doit :

#### **#1: Propositions intelligentes quotidiennes** 🎯
```
Jour 5 Phase 2 → User saisit Yaourt + Lentilles
→ App regarde historique et propose :
   "✨ Jour 5 Phase 2 : Tu réussis bien avec Yaourt (3 fois). Continues !"
```
**Comment :** Comparer jour/phase actuel vs historique → tirer patterns
**Source données :** `historiqueReprises[].alimentsConsommes` par phase/jour

#### **#2: Débloquer les jours critiques** 🔓
```
Jour 8 Phase 3 (stagnation récurrente) 
→ App détecte : "Stagnation 2/3 reprises"
→ Propose : "Essaie Saumon (ça a marché avant jour 8)"
```
**Comment :** Identifier patterns de succès/échec par jour
**Source données :** `historiqueReprises[].poidsParJourParPhase` + `alimentsConsommes`

#### **#3: Dashboard analytique** 📊
```
Après 3 reprises :
- "Phase 5 atteinte 100% (3/3 reprises)"
- "Jour 8 Phase 3 : Problématique (stagnation 2x sur 3)"
- "🏆 Aliment meilleur : Yaourt +0.35kg avg vs Fromage +0.1kg"
- "📈 Poids moyen : 78kg → 73kg (progression +5kg/reprise)"
```
**Comment :** Aggréger données historique → statistiques
**Source données :** Tous les champs de repriseArchive

#### **#4: Optimiser future reprise** 🚀
```
"Ces 3 reprises montrent que Phase 1 + Yaourt c'est ton combo gagnant"
→ Suggestions pour prochaine reprise
```
**Comment :** Identifier meilleure combo phase/aliments de l'utilisateur
**Source données :** Patterns dans `historiqueReprises`

---

## ⚠️ ÉCARTS IDENTIFIÉS: Code vs Attendu

### Écart #1: Le modal affiche SEULEMENT les données, pas les insights 🚫
```
CODE EXISTANT (HistoriqueReprisesModal.js):
✅ Affiche : taux_conformite, taux_validation, repas count
✅ Affiche : bilan par phase, badge réussie/échouée
❌ MANQUE : Aucune PROPOSITION intelligente
❌ MANQUE : Aucun INSIGHT (aliment bon pour toi, jour problématique, etc.)

ATTENDU (SYNTHESE):
✅ Devrait proposer : "Tu réussis avec Yaourt jour 5 Phase 2"
✅ Devrait analyser : Patterns d'aliments par jour/phase
✅ Devrait alerter : "Jour 8 Phase 3 critique pour toi"
```

### Écart #2: Aucune agrégation de données historiques 🚫
```
CODE EXISTANT:
✅ Affiche 1 reprise à la fois
❌ Pas de vue GLOBALE sur toutes reprises
❌ Pas de statistiques cross-reprises
❌ Pas d'identification patterns récurrents

ATTENDU (SYNTHESE):
✅ Dashboard : "Phase 5 atteinte 100% (3/3 reprises)"
✅ Analytics : "Aliment meilleur pour toi : Yaourt +0.35kg"
✅ Trends : "Poids moyen progression +5kg/reprise"
✅ Alertes : "Jour 8 Phase 3 problématique (2/3 stagnation)"
```

### Écart #3: Pas d'aide sur prochaine reprise 🚫
```
CODE EXISTANT:
✅ Affiche historique passé
❌ Aucune proposition pour FUTURE reprise
❌ Pas d'apprentissage appliqué au jour actuel

ATTENDU (SYNTHESE):
✅ Pendant saisie jour 5 Phase 2 en reprise #4:
   "Tu as réussi 3x avec Yaourt à ce jour/phase. Continues ?"
✅ Pendant jour 8 Phase 3 bloqué:
   "Jour critique pour toi. Essaie Saumon (marché avant)."
```

### Écart #4: Structure données archivées incomplet 🚫
```
CODE EXISTANT (reprise-alimentaire-apres-jeune.js, lignes 552-600):
✅ Archive : id, dateDebut, dateFin, duree, joursValides
✅ Archive : repasConsommes (array complet)
✅ Archive : bilan (taux, phases, totaux)
❌ MANQUE : poidsParJourParPhase (pour trends)
❌ MANQUE : alimentsConsommes PAR phase/jour (pour patterns)
❌ MANQUE : notes utilisateur (contexte)
❌ MANQUE : phaseMaxAtteinte (métrique clé)

ATTENDU (SYNTHESE):
```javascript
historiqueReprises = [{
  ...existant...
  phaseMaxAtteinte: 5,                    // ← MANQUE
  poidsParJourParPhase: {                 // ← MANQUE
    Phase1: [78, 77.8, 77.5],
    Phase2: [77.5, 77.3, 77.2],
    ...
  },
  alimentsConsommes: {                    // ← MANQUE (structure par phase)
    Phase1: ["Pomme", "Poulet vapeur"],
    Phase2: ["+ Yaourt", "+ Fromage"],
    ...
  },
  notes: "Bonne reprise",                 // ← MANQUE
}]
```

### Écart #5: Logique d'apprentissage inexistante 🚫
```
CODE EXISTANT:
- reprise-alimentaire-apres-jeune.js: saisit repas du jour
- suivi.js: enregistre repas
- HistoriqueReprisesModal.js: affiche archives

❌ MANQUE: Fonction "comparer_jour_actuel_vs_historique"
❌ MANQUE: Fonction "identifier_aliments_gagnants"
❌ MANQUE: Fonction "détecter_jours_critiques"
❌ MANQUE: Fonction "calculer_statistiques_globales"

ATTENDU (SYNTHESE):
✅ Lors saisie jour/phase → consulte historique
✅ Compare patterns → propose aliments efficaces
✅ Détecte blocages → propose déblocages
✅ Agrège données → affiche stats utilisateur
```

---

## 📋 DIFFÉRENCE CLÉS: WHAT IS vs WHAT SHOULD BE

| Aspect | Actuellement | Attendu |
|--------|-------------|---------|
| **Modal affiche** | Données brutes (taux, dates, repas) | Insights + Propositions intelligentes |
| **Analytics** | Aucune | Dashboard avec stats cross-reprises |
| **Aide utilisateur** | Passive (lecture seule) | Active (propositions, alertes, déblocages) |
| **Données archivées** | Basique (id, dates, repas, bilan) | Enrichie (poids/jour, aliments/phase, notes) |
| **Logique apprentissage** | Absente | Présente (patterns, comparaisons, trends) |
| **Cas d'usage couverts** | 0/4 | 4/4 attendus |

---

## ✅ TRAVAIL À FAIRE (FUTURE - EN TODO)

### Phase 1: Enrichir structure de données archivées
- [ ] Ajouter `phaseMaxAtteinte` lors archivage
- [ ] Ajouter `poidsParJourParPhase` (extraire de `bilanReprise`)
- [ ] Ajouter `alimentsConsommes` par phase (extraire de `repasConsommes`)
- [ ] Ajouter `notes` optionnelles utilisateur

### Phase 2: Créer logique d'apprentissage (nouveau fichier)
- [ ] Fonction: analyzerHistorique(historiqueReprises, jourActuel, phaseActuelle)
- [ ] Fonction: trouverAlimentsGagnants(historiqueReprises, jour, phase)
- [ ] Fonction: detecterJoursCritiques(historiqueReprises)
- [ ] Fonction: calculerStatsGlobales(historiqueReprises)

### Phase 3: Intégrer aux pages existantes
- [ ] Afficher propositions dans suivi.js lors saisie
- [ ] Afficher alertes pour jours critiques
- [ ] Créer onglet "Dashboard" dans reprise-alimentaire-apres-jeune.js
- [ ] Afficher insights dans modal historique

### Phase 4: Tests & Validation
- [ ] Vérifier propositions justes vs historical data
- [ ] Tester avec 3+ reprises dans historique
- [ ] Validation UX/UI avec propositions

---

## 📝 RÉSUMÉ

**Le code actuel:** Affiche historique (données brutes)
**Le code attendu:** Utilise historique pour APPRENDRE et AIDER (insights + propositions)

**Écart:** 5 points critiques → Features manquantes → Tasks pour future session

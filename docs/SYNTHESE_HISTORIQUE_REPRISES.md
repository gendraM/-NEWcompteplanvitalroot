# 📋 SYNTHÈSE — Système d'Historique & Apprentissage pour "Reprise après Jeûne"

**Date** : 28 décembre 2025  
**Objet** : Validation du concept et clarification de la compréhension du projet

---

## 🎯 **Ce qui a été clarifié**

### **1. L'historique N'EST PAS un stockage passif**

❌ **Faux concept écarté :**
- Historique = "Restaurer un ancien programme identique"
- Historique = "Recopier les aliments d'une reprise antérieure"

✅ **Bon concept validé :**
- Historique = **Base de connaissance active** pour **personnaliser & aider l'utilisateur**
- Chaque reprise est **unique** : plan créé après jeûne, puis saisies libres basées sur le vécu
- L'app **apprend du profil utilisateur** en analysant les reprises passées

---

## 📊 **Comment l'historique aide l'utilisateur**

### **Exemple 1 : Propositions intelligentes jour par jour**

```
Reprise #4 — Jour 5 Phase 2
├─ User saisit : Yaourt + Lentilles + Eau
├─ L'app regarde historique :
│  ├─ Reprise #1 jour 5 Phase 2 : Yaourt → +0.4kg perte ✅
│  ├─ Reprise #2 jour 5 Phase 2 : Fromage → stagnation ❌
│  ├─ Reprise #3 jour 5 Phase 2 : Yaourt → +0.3kg perte ✅
├─ L'app propose :
│  └─ "✨ Jour 5 Phase 2 : Tu réussis bien avec Yaourt (3 fois). Continues !"
└─ User fait choix éclairé basé sur SON profil
```

### **Exemple 2 : Identifier & lever blocages**

```
Jour 8 Phase 3 (critique : stagnation récurrente)
├─ L'app regarde historique :
│  ├─ Reprise #1 jour 8 Phase 3 : stagnation
│  ├─ Reprise #2 jour 8 Phase 3 : stagnation
│  ├─ Reprise #3 jour 8 Phase 3 + Saumon : succès ! ✅
├─ L'app propose :
│  └─ "🎯 Jour critique pour toi. Essaie Saumon (ça a marché avant jour 8)."
└─ Aide user progresser vers Phase 4 (objectif)
```

### **Exemple 3 : Dashboard analytique**

```
Après 3 reprises, l'app affiche :
├─ "Ton profil en reprise :"
├─ "✅ Phase 5 atteinte 100% (3/3 reprises)"
├─ "⚠️ Jour 8 Phase 3 : Problématique (stagnation 2x sur 3)"
├─ "🏆 Aliment meilleur pour toi : Yaourt +0.35kg avg vs Fromage +0.1kg"
├─ "📈 Poids moyen : 78kg → 73kg (progression +5kg/reprise)"
└─ → User COMPREND son profil → optimise prochaine reprise
```

---

## 🏗️ **Architecture décidée**

### **2 univers indépendants**

| Reprise EN COURS | HISTORIQUE |
|------------------|-----------|
| **Action** : User saisit repas du jour | **Connaissance** : Profil apprentissage |
| Modifiable à volonté | Immuable (archives) |
| Immédiat (aujourd'hui) | Contexte comparatif |
| User **crée** les données | App **lit** pour aider |
| localStorage['repriseEnCours'] | localStorage['historiqueReprises'] |

### **Pourquoi indépendant ✅**

**Clarté mentale :**
- Reprise en cours = mon espace de saisie libre
- Historique = mon tableau de bord apprentissage

**Sécurité :**
- ❌ Pas risque : modifier historique = casser profil
- ❌ Pas confusion : restaurer = accident
- ✅ Données séparées = workflows distincts

**Différence du jeûne :**
- Jeûne : retrouvable exactement (mêmes jours, même structure)
- Reprise : unique à chaque fois (aliments différents) → historique = intelligence, pas replay

---

## 📝 **Données archivées par reprise**

```javascript
historiqueReprises = [
  {
    id: "2025-12-28_reprise_1",
    dateDebut: "2025-12-28",
    dateFin: "2026-01-11",        // quand Phase 5 complétée
    duree: "15 jours",
    phaseMaxAtteinte: 5,
    joursValides: [1,2,3,...,15],
    poidsInitial: 78,
    poidsFinal: 73,
    poidParJourParPhase: {       // pour analytics
      Phase1: [78, 77.8, 77.5],
      Phase2: [77.5, 77.3, 77.2],
      ...
    },
    alimentsConsommes: {           // ce qui a réellement marché
      Phase1: ["Pomme", "Poulet vapeur", "Riz complet"],
      Phase2: ["+ Yaourt", "+ Fromage chèvre"],
      ...
    },
    programmeReprise: {...},       // programme proposé (pas utilisé, juste historique)
    notes: "Bonne reprise, bien toléré",
    statut: "termine",
    dateArchivage: "2026-01-11T..."
  }
]
```

---

## 🚀 **Cas d'usage clés**

### **#1 : Propositions intelligentes quotidiennes**
- ✅ Jour 5 Phase 2, user saisit → app compare historique → "Tu as réussi avec Yaourt, continues"

### **#2 : Débloquer les jours critiques**
- ✅ Jour 8 Phase 3 stagne ? App : "Essaie Saumon (ça a marché avant)"

### **#3 : Comprendre son profil**
- ✅ Dashboard : "Aliments meilleurs pour toi", "Phase difficile pour toi", "Progression moyenne"

### **#4 : Optimiser future reprise**
- ✅ "Ces 3 reprise montrent que Phase 1 + Yaourt c'est ton combo gagnant"

---

## ❌ **Ce qui N'est PAS le cas (clarifiés)**

| ❌ FAUX | ✅ VRAI |
|---------|--------|
| Restaurer = Réutiliser aliments anciens | Restaurer = n'existe pas (chaque reprise unique) |
| Reprise #2 = Reprise #1 + jours manquants | Reprise #2 = Plan nouveau, saisies libres |
| Historique = Stockage passif | Historique = Intelligence active (comparaisons) |
| Lié à reprise en cours | Indépendant (2 univers clairs) |

---

## 📌 **Prérequis pour implémentation**

1. ✅ Bien comprendre : historique = apprentissage app, pas replay utilisateur
2. ✅ Bien comprendre : indépendant = sécurité + clarté
3. ✅ Bien comprendre : objectif = aider user atteindre ses objectifs via patterns personnels

---

## **Validation**

- [x] Concept validé
- [x] Architecture décidée
- [x] Cas d'usage clairs
- [x] Compréhension alignée (Copilot ↔ Utilisateur)

---

**Prêt pour le plan d'implémentation ✅**

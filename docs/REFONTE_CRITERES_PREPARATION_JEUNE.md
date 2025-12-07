# 🔄 REFONTE CRITÈRES DE PRÉPARATION AU JEÛNE

**Date création** : 7 décembre 2025  
**Objectif** : Reformuler les 9 critères de préparation au jeûne avec suivi quotidien + objectifs clairs  
**Statut** : ⏳ EN COURS

---

## 📋 **PRIORISATION DES REFORMULATIONS**

### 🔴 **URGENT** (critères bloquants/dangereux)
1. ❌ **Critère 6** : "2 jours de jeûne plein" → Dangereux, mal guidé
2. ❌ **Critère 4** : "Produits transformés" → Trop flou, paralysant
3. ❌ **Critère 1** : "Respect quantités" → Pas actionnable

### 🟠 **IMPORTANT** (amélioration UX significative)
4. ⏳ **Critère 9** : "Plage 45 min" → Jargon incompréhensible
5. ⏳ **Critère 3** : "Action après repas" → Durée floue
6. ⏳ **Critère 7** : "2L eau" → Suivi inexistant

### 🟢 **AMÉLIORATION MINEURE** (déjà clairs)
7. ⏳ **Critère 2** : "Féculents le soir" → Ajouter exemples
8. ⏳ **Critère 5** : "Sucreries" → Ajouter alternatives
9. ⏳ **Critère 8** : "Pas repas 19h" → Ajouter guidance

---

## ✅ **VALIDATIONS COMPLÉTÉES**

### **🎯 STRUCTURE GÉNÉRALE VALIDÉE**

**Format de chaque critère** :
```
TITRE : [Action claire et mesurable]

POURQUOI ?
[Explication pédagogique courte avec contexte physiologique]

COMMENT FAIRE ?
[Liste d'actions concrètes numérotées]

OBJECTIF QUOTIDIEN : X/7 jours
└─ "Question de suivi quotidien claire"

SOUS-OBJECTIFS HEBDOMADAIRES :
└─ [Obligatoire] Action mesurable
└─ [Optionnel] Action bonus
└─ [Optionnel] Ressenti/feedback

✅ VALIDATION : Automatique si objectif quotidien + sous-objectifs obligatoires atteints
```

**Règle de validation mixte (Option B + C)** :
- Suivi quotidien : 5/7 jours minimum (sauf exceptions)
- Sous-objectifs : Au moins 1 obligatoire + optionnels pour progression
- Sauvegarde localStorage (AUCUNE connexion requise)

---

## 📝 **REFORMULATIONS EN COURS**

### 🔴 **CRITÈRE 6 : 2 jours de jeûne plein** (URGENT - Dangereux)

#### ❌ **VERSION ACTUELLE**
```
Titre : "2 jours de jeûne plein (préparation métabolique)"
Description : "Tester la tolérance au jeûne"
Jalon : J-12
```

#### ⚠️ **PROBLÈMES IDENTIFIÉS**
- "Jeûne plein" = 0 calorie ? Eau uniquement ? NON DÉFINI
- 2 jours consécutifs ou espacés ? NON PRÉCISÉ
- Aucune guidance médicale/sécurité
- Dangereux sans accompagnement
- Pas de préparation progressive

#### ✅ **VERSION REFORMULÉE** (EN ATTENTE VALIDATION)
```
TITRE : "Tester 2 jeûnes courts de 16h"

POURQUOI ?
Avant un jeûne long, ton corps doit apprendre à puiser dans ses réserves.
Le jeûne intermittent 16h (20h→12h) est sans danger et prépare ton métabolisme.
Tu habitues progressivement ton corps à fonctionner sans apport alimentaire constant.

COMMENT FAIRE ?
1. Choisis 2 jours NON CONSÉCUTIFS dans la semaine (ex: mardi + vendredi)
2. Dernier repas : avant 20h la veille
3. Premier repas : 12h le lendemain (= 16h de jeûne)
4. Pendant le jeûne : eau, tisanes, thé/café sans sucre uniquement
5. Si vertiges/malaise : arrête immédiatement et mange quelque chose
6. Évite les journées intenses (sport, réunions importantes)

OBJECTIF HEBDOMADAIRE : 2 jeûnes réussis (16h chacun)
└─ "J'ai sauté le petit-déjeuner et tenu jusqu'à 12h sans manger"

SOUS-OBJECTIFS :
└─ [Obligatoire] J'ai choisi 2 jours non consécutifs (mardi + vendredi)
└─ [Obligatoire] J'ai tenu 16h sans manger (20h→12h) les 2 fois
└─ [Optionnel] Je me suis hydraté(e) correctement (eau, tisanes)
└─ [Optionnel] Je n'ai pas ressenti de vertiges ou malaise

⚠️ CONTRE-INDICATIONS :
- Diabète, hypoglycémie, troubles alimentaires
- Grossesse, allaitement
- En cas de doute : consulte un médecin

✅ VALIDATION : 2 jeûnes de 16h réussis + aucun malaise
```

**Statut** : ⏳ EN ATTENTE VALIDATION UTILISATEUR

---

### 🔴 **CRITÈRE 4 : Produits transformés** (URGENT - Trop flou)

**Statut** : ⏳ À TRAITER

---

### 🔴 **CRITÈRE 1 : Respect quantités** (URGENT - Pas actionnable)

**Statut** : ⏳ À TRAITER

---

### 🟠 **CRITÈRE 9 : Plage 45 min** (IMPORTANT - Jargon)

**Statut** : ⏳ À TRAITER

---

### 🟠 **CRITÈRE 3 : Action après repas** (IMPORTANT - Durée floue)

**Statut** : ⏳ À TRAITER

---

### 🟠 **CRITÈRE 7 : 2L eau** (IMPORTANT - Suivi inexistant)

**Statut** : ⏳ À TRAITER

---

## 🎯 **TODO : PROCHAINES ÉTAPES**

### **Session en cours**
- [ ] Valider reformulation Critère 6 (jeûne plein → jeûnes 16h)
- [ ] Reformuler Critère 4 (produits transformés)
- [ ] Reformuler Critère 1 (respect quantités)
- [ ] Reformuler Critère 9 (plage 45 min)
- [ ] Reformuler Critère 3 (action après repas)
- [ ] Reformuler Critère 7 (2L eau)

### **Session suivante**
- [ ] Améliorer Critère 2 (féculents le soir)
- [ ] Améliorer Critère 5 (sucreries)
- [ ] Améliorer Critère 8 (pas repas 19h)

### **Implémentation technique**
- [ ] Créer structure de données complète (9 critères)
- [ ] Modifier PhaseCard.js (bloc extensible + suivi quotidien)
- [ ] Ajouter gestion localStorage (suiviQuotidien + sousObjectifs)
- [ ] Tester parcours complet utilisateur

---

## 📊 **SUIVI GLOBAL**

| Critère | Phase | Priorité | Statut | Date validation |
|---------|-------|----------|--------|-----------------|
| 6. Jeûne plein | 2 | 🔴 URGENT | ⏳ En attente | - |
| 4. Produits transformés | 2 | 🔴 URGENT | ❌ À faire | - |
| 1. Respect quantités | 1 | 🔴 URGENT | ❌ À faire | - |
| 9. Plage 45 min | 3 | 🟠 IMPORTANT | ❌ À faire | - |
| 3. Action après repas | 2 | 🟠 IMPORTANT | ❌ À faire | - |
| 7. 2L eau | 3 | 🟠 IMPORTANT | ❌ À faire | - |
| 2. Féculents soir | 2 | 🟢 MINEUR | ❌ À faire | - |
| 5. Sucreries | 2 | 🟢 MINEUR | ❌ À faire | - |
| 8. Pas repas 19h | 3 | 🟢 MINEUR | ❌ À faire | - |

---

## 🔄 **HISTORIQUE DES MODIFICATIONS**

### 7 décembre 2025 - 18:30
- Création du fichier de refonte
- Structure générale validée (suivi quotidien + sous-objectifs)
- Reformulation Critère 6 proposée (jeûne plein → jeûnes 16h)
- En attente validation utilisateur

---

**Prochaine action** : Validation Critère 6 puis passage au Critère 4

# 🎯 COMPRÉHENSION : portionDefaut & Moteur Calorique

**Date de création :** 2026-01-07  
**Contexte :** Enrichissement référentiel fast-food - Erreur conceptuelle identifiée  
**Statut :** Documenté pour implémentation future

---

## ❌ ERREUR DE COMPRÉHENSION INITIALE

### Ce que j'avais compris (INCORRECT)
`portionDefaut` = **Description du produit commercial**

**Exemple erroné :**
```javascript
{ 
  nom: "Frites McDo petite", 
  portionDefaut: "1 portion",  // ← Décrit le produit
  unite: "piece",
  kcal: 230 
}
```

**Logique erronée :** "C'est une petite portion de frites, donc portionDefaut = '1 portion'"

---

## ✅ COMPRÉHENSION CORRIGÉE

### Ce qu'est réellement `portionDefaut`
**Outil de pilotage calorique** pour aider l'utilisateur à respecter son objectif quotidien.

### Rôle dans le système

#### 1. Moteur calorique
```
TDEE = BMR × facteur_activité
Objectif quotidien = TDEE ± déficit/surplus
Budget par catégorie = allocation intelligente
```

**Exemple concret :**
- Utilisateur : objectif perte de poids
- TDEE : 2000 kcal/jour
- Objectif : 1800 kcal/jour (déficit -200)
- Budget féculents : 6-10 CAS/jour (150-250 kcal)

#### 2. Système CAS (Cuillères À Soupe)
```
1 CAS féculent cuit ≈ 25 kcal
```

**Repères journaliers par objectif :**
- **Perte :** 6-10 CAS/jour
- **Maintien :** 14-18 CAS/jour
- **Surplus :** 20+ CAS/jour

#### 3. Cohérence `portionDefaut` existante

**Riz blanc :**
```javascript
{ 
  nom: "Riz blanc / basmati",
  portionDefaut: "2 CS",  // ← 180 kcal
  kcal: 180,
  qn: 2
}
```
→ **Logique :** S'intègre dans budget midi (6-8 CAS en perte)

**Bouillon :**
```javascript
{ 
  nom: "Bouillon de légumes clair",
  portionDefaut: "200ml",  // ← 15 kcal seulement
  kcal: 15,
  qn: 5
}
```
→ **Logique :** Ultra-compatible objectif perte (négligeable caloriquement)

---

## 🍔 PROBLÈME AVEC FAST-FOOD

### Analyse des incohérences

#### Frites McDo petite : 230 kcal
```javascript
{ 
  nom: "Frites McDo petite",
  portionDefaut: "1 portion",  // ← PROBLÈME
  kcal: 230 
}
```

**Équivalence CAS :**
```
230 kcal ÷ 25 kcal/CAS = 9,2 CAS
```

**Impact sur objectif perte (6-10 CAS/jour) :**
- Consomme **92% du budget féculents quotidien**
- Ne laisse plus que 0,8 CAS pour le reste de la journée
- QN = 1 (ultra-transformé, faible satiété)
- **Conclusion :** Suggérer "1 portion" = sabotage de l'équilibre

#### Big Mac : 500 kcal
```javascript
{ 
  nom: "Big Mac McDo",
  portionDefaut: "1 burger",  // ← PROBLÈME
  kcal: 500 
}
```

**Impact sur objectif 1800 kcal/jour :**
- **27% de l'apport journalier** en un seul aliment
- Pas de légumes, déséquilibre lipides/glucides
- QN = 1
- **Conclusion :** Incompatible avec équilibre nutritionnel quotidien

---

## 🎯 SOLUTION PRÉCONISÉE (À implémenter plus tard)

### Principe : Avertissement contextuel adapté à l'objectif

Au lieu de modifier `portionDefaut`, **conserver la structure actuelle** mais ajouter un **système d'avertissement intelligent**.

### Structure proposée

#### 1. Ajouter champs au référentiel
```javascript
{ 
  nom: "Frites McDo petite",
  categorie: "fast-food",
  kcal: 230,
  qn: 1,
  portionDefaut: "1 portion",
  unite: "piece",
  
  // NOUVEAUX CHAMPS (à ajouter plus tard)
  compatibilitePerte: "occasionnel",  // occasionnel | déconseillé | incompatible
  frequenceMax: "1×/semaine",
  equivalentCAS: 9.2,
  alerteEquilibre: true,
  messageContextuel: {
    perte: "⚠️ Cette portion consomme 92% de ton budget féculents quotidien. Occasionnel uniquement (max 1×/semaine).",
    maintien: "⚠️ Cette portion représente 37% de ton budget féculents quotidien. Modération conseillée.",
    surplus: "✓ Compatible avec ton objectif. Attention à l'équilibre du reste de la journée."
  }
}
```

#### 2. Logique d'affichage (RepasBloc.js - à implémenter)

**Quand utilisateur sélectionne un aliment fast-food :**

```javascript
// Pseudo-code

const objectifUtilisateur = getObjectifFromProfile(); // "perte" | "maintien" | "surplus"
const aliment = referentielAliments.find(...);

if (aliment.categorie === "fast-food" && aliment.alerteEquilibre) {
  
  // Afficher message adapté à l'objectif
  const message = aliment.messageContextuel[objectifUtilisateur];
  
  // Badge visuel
  if (objectifUtilisateur === "perte") {
    afficherBadge("🔴 OCCASIONNEL", "orange");
  }
  
  // Suggestion alternative
  if (aliment.equivalentCAS > 8) {
    suggererAlternatives(aliment, objectifUtilisateur);
  }
}
```

**Exemples de messages selon objectif :**

| Aliment | Objectif Perte | Objectif Maintien | Objectif Surplus |
|---------|---------------|-------------------|------------------|
| Frites McDo petite (230 kcal) | ⚠️ 92% budget féculents. Max 1×/semaine | ⚠️ 37% budget féculents. Modération | ✓ Compatible. Équilibre le reste |
| Big Mac (500 kcal) | 🔴 27% apport quotidien. Exceptionnel uniquement | ⚠️ 22% apport quotidien. Occasionnel | ✓ Compatible. Ajoute légumes |
| Coca 40cl (168 kcal) | ⚠️ Calories vides. Privilégie eau/zéro | ℹ️ Modération conseillée | ✓ OK si dans budget |

#### 3. Système de badges (visuel)

**Couleurs selon compatibilité :**
- 🟢 **VERT** : Compatible quotidien (QN ≥ 3)
- 🟠 **ORANGE** : Occasionnel (1-2×/semaine)
- 🔴 **ROUGE** : Exceptionnel (1×/mois max)

**Critères de classification :**
```javascript
function getCompatibilite(aliment, objectif) {
  if (objectif === "perte") {
    if (aliment.qn >= 4) return "quotidien";
    if (aliment.qn >= 3) return "régulier";
    if (aliment.equivalentCAS < 5) return "occasionnel";
    return "exceptionnel";
  }
  // ... autres objectifs
}
```

---

## 📋 RÈGLES D'INTÉGRATION (à implémenter)

### Phase 1 : Enrichissement données (FAIT)
- ✅ Ajout 85 produits fast-food avec calories exactes
- ✅ QN = 1-2 (ultra-transformé)
- ✅ Structure portionDefaut basique

### Phase 2 : Calcul équivalents CAS (À FAIRE)
```javascript
// Pour chaque aliment fast-food
equivalentCAS = Math.round((kcal / 25) * 10) / 10;
```

### Phase 3 : Messages contextuels (À FAIRE)
- Définir seuils par objectif (perte/maintien/surplus)
- Créer templates de messages
- Ajouter fréquence recommandée

### Phase 4 : Interface utilisateur (À FAIRE)
- Badge visuel selon compatibilité
- Message contextuel à la sélection
- Suggestions alternatives intelligentes
- Compteur impact sur budget quotidien

### Phase 5 : Système d'alertes (À FAIRE)
```javascript
// Si cumul fast-food > seuil hebdomadaire
if (fastFoodWeekCount > maxFrequence[objectif]) {
  afficherAlerte({
    type: "tendance",
    message: "Tu as consommé du fast-food 3× cette semaine. Pour ton objectif perte, max 1×/semaine recommandé.",
    action: "Voir alternatives savoureuses"
  });
}
```

---

## 🎓 LEÇONS APPRISES

### 1. `portionDefaut` n'est PAS une description
C'est un **outil de pilotage** intégré au moteur calorique.

### 2. Le référentiel sert l'objectif utilisateur
Chaque donnée doit aider à **respecter le budget calorique et l'équilibre nutritionnel**.

### 3. Fast-food = cas particulier
Ne peut pas être traité comme aliments basiques. Nécessite **couche d'intelligence contextuelle**.

### 4. L'app guide, pas punit
Messages type "interdit" → remplacer par "occasionnel avec X fréquence".

---

## 📌 PROCHAINES ÉTAPES

1. ✅ **Documenter compréhension** (ce fichier)
2. ⏳ **Calculer equivalentCAS** pour tous les fast-foods
3. ⏳ **Définir seuils de fréquence** par objectif
4. ⏳ **Créer messages contextuels** par produit
5. ⏳ **Implémenter badges visuels** dans RepasBloc.js
6. ⏳ **Tester avec profil utilisateur réel**

---

## 💡 NOTES IMPLÉMENTATION FUTURE

### Option A : Système simple (MVP)
Afficher badge "⚠️ OCCASIONNEL" si :
- `categorie === "fast-food"`
- `objectif === "perte"`

### Option B : Système intelligent (complet)
```javascript
const alerteContextuelle = {
  condition: aliment.equivalentCAS > budgetDisponible * 0.5,
  message: `Cette portion consomme ${pourcentage}% de ton budget. ${suggestion}`,
  alternatives: getAlternativesIntelligentes(aliment, budgetRestant)
};
```

### Option C : Système évolutif (idéal)
Apprendre des choix utilisateur :
- Si fast-food ET objectif atteint → fréquence OK
- Si fast-food ET plateau → suggérer réduction
- Si fast-food ET objectif perte → alerte proactive

---

**Conclusion :** Le référentiel est COMPLET en données brutes. La **logique d'avertissement contextuel** sera implémentée ultérieurement dans la couche interface/business logic, pas dans le référentiel lui-même.

---

*Document créé suite à identification d'erreur conceptuelle lors de l'enrichissement fast-food du 2026-01-07*

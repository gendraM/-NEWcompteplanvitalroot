# 📊 ANALYSE COMPLÈTE : GESTION DES EXTRAS


**Date** : 9 janvier 2026  
**Contexte** : Audit complet de la notion "extra" dans l'application  
**Objectif** : Comprendre, documenter et améliorer le système de gestion des extras


---


## 🎯 1. DÉFINITION ACTUELLE DES EXTRAS


### 1.1 Qu'est-ce qu'un EXTRA ?


**Définition métier actuelle** :
> Les extras sont les aliments liés à la **sphère émotionnelle, sociale ou compulsive**. Très riches en sucre, graisses ou additifs, ils sont souvent consommés par **envie plus que par besoin**.


**Critères d'identification** :
1. **Par catégorie** : `categorie: "extra"` dans le référentiel
2. **Par tag** : `tag: "fast-food"` ou `categorie: "fast-food"`
3. **Par flag** : `est_extra: true` dans les repas_reels
4. **Par comportement** : Choix utilisateur via checkbox "Cet aliment est-il un extra ?"


### 1.2 Classification actuelle (Référentiel.js, lignes 2030-3020)


**📦 CATÉGORIES D'EXTRAS (69 aliments identifiés)** :


| Sous-catégorie | Nombre | Exemples | kcal moyen |
|----------------|--------|----------|-----------|
| **Snacks salés** | 6 | Chips, cacahuètes salées, pop-corn | 130-170 |
| **Confiseries** | 5 | Chocolat noir, barres chocolatées (Mars, Snickers) | 30-250 |
| **Bonbons** | 7 | Haribo, caramels, sucettes | 10-140 |
| **Biscuits industriels** | 6 | Prince, Oreo, Petit Beurre | 90-160 |
| **Viennoiseries** | 5 | Croissant, pain au chocolat, brioche | 150-280 |
| **Pâtisseries** | 10 | Éclair, mille-feuille, macaron | 90-420 |
| **Fast food** | 11 | Burger+frites, pizza, kebab, tacos | 250-2000 |
| **Desserts glacés** | 5 | Glaces, sorbet, magnum | 80-330 |
| **Boissons sucrées** | 5 | Soda, jus industriel, Red Bull | 85-180 |
| **Pâtes à tartiner** | 3 | Nutella, confiture industrielle | 50-100 |
| **Sauces** | 1 | Sauce industrielle | 80 |
| **Céréales industrielles** | 1 | Chocapic, Frosties | 150 |
| **Autres** | 4 | - | - |


**🔍 DÉTECTION MULTI-CRITÈRES** :


```javascript
// Méthode 1 : Catégorie pure
aliment.categorie === "extra"


// Méthode 2 : Fast-food (sous-catégorie d'extra)
aliment.categorie === "fast-food"
repas.tag?.includes("fast-food")


// Méthode 3 : Flag utilisateur
repas.est_extra === true


// Méthode 4 : Calcul dynamique (validationSemaine.js)
const extras = repasSemaine.filter(repas => {
  return repas.categorie === 'fast-food' ||
         (repas.tag && repas.tag.toLowerCase().includes('fast-food')) ||
         repas.est_extra === true; // ⚠️ MANQUE DANS CODE ACTUEL
});
```


---


## 📐 2. RÈGLES ET QUOTAS ACTUELS


### 2.1 Quota hebdomadaire


**Système de paliers progressifs** :


| Palier | Quota extras/semaine | Condition | Objectif |
|--------|---------------------|-----------|----------|
| Débutant | 5 extras | Démarrage | Réduction progressive |
| Intermédiaire | 3 extras | 4 semaines à ≤5 | Ancrage discipline |
| Avancé | 2 extras | 8 semaines à ≤3 | Excellence |
| Expert | **1 extra** | 12 semaines à ≤2 | **Objectif final** |


**Source** : `suivi.js` ligne 825
```javascript
const currentPalier = 1; // Palier métier : 1 extra autorisé par semaine
const objectifFinal = 1;
```


### 2.2 Règles de validation


**Validation hebdomadaire** (dimanche soir) :
- ✅ **Quota respecté** : `extrasCount <= quota` → Message encourageant
- ⚠️ **Léger dépassement** : `extrasCount === quota + 1` → Alerte douce
- 🚨 **Dépassement important** : `extrasCount > quota + 1` → Alerte critique


**Messages automatiques** (`lib/validationSemaine.js`) :
```javascript
if (extrasCount === 0)
  return "🎉 Incroyable ! Aucun extra cette semaine, c'est parfait !";
if (extrasCount === 1)
  return "👏 Excellent travail ! 1 seul extra, tu restes dans le quota.";
if (extrasCount <= quota)
  return `✅ Bravo ! ${extrasCount} extras, quota respecté (${quota} max).`;
if (extrasCount === quota + 1)
  return `⚠️ Attention : ${extrasCount} extras, léger dépassement du quota (${quota} max).`;
// Dépassement important
const difference = extrasCount - quota;
return `🚨 Dépassement : ${extrasCount} extras au lieu de ${quota} max (+${difference}). Reprends le contrôle la semaine prochaine !`;
```


### 2.3 Système de streaks et badges


**Milestones de progression** (`suivi.js` lignes 130-139) :


| Streak | Durée | Message de victoire |
|--------|-------|---------------------|
| 1 semaine | 7 jours | "Félicitations ! Tu as réussi à limiter tes extras à 1 cette semaine." |
| 2 semaines | 14 jours | "Bravo, deux semaines de suite ! Ta régularité paie." |
| 4 semaines | 28 jours | "4 semaines d'affilée, c'est impressionnant ! Tu installes une vraie discipline." |
| 8 semaines | 56 jours | "8 semaines de maîtrise des extras ! Tu prouves que tu peux tenir sur la durée." |
| 12 semaines | 84 jours | "3 mois sans dépasser 1 extra/semaine : Ta gestion des extras est exemplaire." |


**Message d'interruption** :
> "Pas grave, chaque semaine est une nouvelle chance ! Tu as dépassé ton quota d'extras cette fois-ci, mais ce n'est qu'une étape. Reprends ta série, tu sais que tu peux y arriver !"


---


## 🔄 3. WORKFLOW DE GESTION ACTUEL


### 3.1 Saisie d'un repas (RepasBloc.js)


```
┌─────────────────────────────────────────────┐
│ 1. Utilisateur saisit un aliment           │
│    → Recherche dans référentiel             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 2. Détection automatique                   │
│    ✓ aliment.categorie === "extra"         │
│    ✓ aliment.categorie === "fast-food"     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 3. Checkbox manuelle                       │
│    "Cet aliment est-il un extra ?"         │
│    → État estExtra (useState)              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 4. Vérification quota restant              │
│    extrasRestants = quota - extrasUsed     │
│    Si extrasRestants <= 0 ET estExtra      │
│    → Alerte : "Tu as dépassé ton quota"    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 5. Enregistrement en base                 │
│    repas_reels.est_extra = true/false      │
└─────────────────────────────────────────────┘
```


### 3.2 Calcul hebdomadaire (validationSemaine.js)


```javascript
export function calculerExtrasSemaine(weekStart, repasReels) {
  // 1. Filtrer repas de la semaine (lundi → dimanche)
  const debut = new Date(weekStart);
  const fin = addDays(debut, 6);
 
  // 2. Détecter les extras
  const extras = repasDesSemaine.filter(repas => {
    return repas.categorie === 'fast-food' ||
           (repas.tag && repas.tag.toLowerCase().includes('fast-food'));
    // ⚠️ PROBLÈME : Ne prend pas en compte repas.est_extra
  });
 
  // 3. Construire détails
  const details = extras.map(extra => ({
    type: 'fast-food',
    nom: extra.nom || 'Repas fast-food',
    date: extra.date,
    moment: extra.moment
  }));
 
  // 4. Dédupliquer (même date + moment)
 
  return { count, details, variation };
}
```


### 3.3 Validation dimanche (suivi.js)


```javascript
async function handleValiderSemaine() {
  // 1. Calcul extras de la semaine
  const extrasInfo = calculerExtrasSemaine(selectedWeekStart, repasSemaine);
 
  // 2. Récupération quota utilisateur
  const quota = palierData?.quota_extras || 5;
 
  // 3. Génération message personnalisé
  const message = genererMessageFeedback(extrasInfo.count, quota);
 
  // 4. Calcul variation vs semaine précédente
  const variation = calculerVariation(extrasInfo.count, semainesValidees, selectedWeekStart);
 
  // 5. Enregistrement en base
  await supabase.from('semaines_validees').upsert({
    semaine_debut: selectedWeekStart,
    extras_count: extrasInfo.count,
    extras_details: extrasInfo.details, // JSONB
    message_feedback: message,
    variation: variation,
    date_validation: new Date().toISOString()
  });
 
  // 6. Ouverture modal feedback
  setFeedbackData({ extrasCount, extrasDetails, message, variation });
  setShowFeedbackModal(true);
}
```


---


## 🔍 4. ANALYSE DES DONNÉES STOCKÉES


### 4.1 Table `repas_reels`


| Colonne | Type | Rôle | Exemple |
|---------|------|------|---------|
| `categorie` | TEXT | Catégorie alimentaire | "extra", "fast-food", "féculent" |
| `est_extra` | BOOLEAN | Flag manuel utilisateur | true/false |
| `tag` | TEXT | Tags supplémentaires | "fast-food", "restaurant" |
| `extras` | INTEGER | ⚠️ **Colonne mystère** (non utilisée?) | NULL |


**⚠️ INCOHÉRENCE DÉTECTÉE** :
- Colonne `extras` (INTEGER) existe mais n'est jamais alimentée ni lue dans le code
- Possible legacy ou fonctionnalité future ?


### 4.2 Table `semaines_validees`


| Colonne | Type | Ajoutée | Rôle |
|---------|------|---------|------|
| `extras_count` | INTEGER | ✅ 2026-01-09 | Nombre total d'extras |
| `extras_details` | JSONB | ✅ 2026-01-09 | Liste détaillée [{ type, nom, date, moment }] |
| `message_feedback` | TEXT | ✅ 2026-01-09 | Message personnalisé |
| `variation` | INTEGER | ✅ 2026-01-09 | Évolution vs semaine N-1 |
| `date_validation` | TIMESTAMPTZ | ✅ 2026-01-09 | Horodatage validation |


### 4.3 Table `extras` (legacy?)


**Structure** (Struture supabase.md, lignes 269-283) :
```sql
CREATE TABLE extras (
  id BIGINT PRIMARY KEY,
  user_id UUID,
  date DATE NOT NULL,
  heure TIME,
  type TEXT,
  aliment TEXT,
  quantite TEXT,
  grammes NUMERIC,
  kcal NUMERIC,
  contexte TEXT,
  humeur TEXT,
  lie_a_repas_id BIGINT,
  tag TEXT,
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```


**⚠️ QUESTIONS** :
- Cette table est-elle encore utilisée ?
- Relation avec `repas_reels` ?
- Fusionner ou déprécier ?


### 4.4 Référentiel critères de cristallisation


**CRITERE_EXTRAS_FREQUENTS** (referentiel.js, lignes 3284-3316) :


```javascript
{
  id: 'extras_reduction',
  nom: 'Réduction extras fréquents',
  conditions_activation: {
    seuil_reprise: 10,
    formule: 'bilan_reprise.extras.total > 10',
    description: 'Activé si >10 extras durant reprise'
  },
  configuration: {
    calcul_seuil: (bilanReprise) => {
      const extrasReprise = bilanReprise?.extras?.total || 0;
      return Math.ceil(extrasReprise * 0.32); // 68% de réduction
    },
    validation_quotidienne: (repasJour) => {
      return repasJour.filter(r => r.est_extra).length === 0;
    },
    validation_hebdomadaire: (repasSemaine, seuil) => {
      const nbExtras = repasSemaine.filter(r => r.est_extra).length;
      return nbExtras <= seuil;
    }
  },
  messages: {
    encouragement: 'Bravo ! Aucun extra aujourd\'hui 💪',
    victoire_21j: '🏆 21 jours sans extras ! Habitude vaincue !',
    victoire_finale: '🎯 45 jours terminés ! Les extras ne sont plus une habitude'
  }
}
```


**Logique** : Si utilisateur a eu >10 extras pendant reprise jeûne → Activer défi "Réduction 68%" pendant cristallisation


---


## ⚠️ 5. ANOMALIES ET INCOHÉRENCES DÉTECTÉES


### 5.1 Bugs critiques 🔴


#### A1 : Calcul incomplet dans `calculerExtrasSemaine()`
**Fichier** : `lib/validationSemaine.js`, ligne 146  
**Problème** :
```javascript
const extras = repasDesSemaine.filter(repas => {
  return repas.categorie === 'fast-food' ||
         (repas.tag && repas.tag.toLowerCase().includes('fast-food'));
  // ❌ MANQUE : || repas.est_extra === true
});
```


**Impact** : Les extras saisis manuellement via checkbox ne sont PAS comptés dans la validation hebdomadaire


**Correction** :
```javascript
const extras = repasDesSemaine.filter(repas => {
  return repas.categorie === 'fast-food' ||
         (repas.tag && repas.tag.toLowerCase().includes('fast-food')) ||
         repas.est_extra === true; // ✅ AJOUT
});
```


#### A2 : Incohérence `categorie` vs `est_extra`
**Scénario problématique** :
1. Utilisateur saisit "Chocolat noir 70%" (categorie: "extra" dans référentiel)
2. Checkbox "est extra ?" pré-cochée automatiquement
3. Utilisateur décoche (car dans son quota)
4. Sauvegarde : `est_extra: false` MAIS `categorie: "extra"`
5. **Résultat** : L'aliment est-il extra ou non ? 🤔


**Question métier** : Quelle est la source de vérité ?
- Option A : `categorie` prime (extra = toujours extra)
- Option B : `est_extra` prime (choix utilisateur final)
- Option C : Logique combinée (extra SI categorie="extra" ET est_extra=true)


#### A3 : Colonne `extras` (INTEGER) non utilisée
**Table** : `repas_reels`  
**Colonne** : `extras` (INTEGER)  
**Statut** : Jamais alimentée ni lue dans le code actuel  
**Action** : Déprécier ou documenter son usage prévu


#### A4 : Table `extras` legacy
**Statut** : Structure complète mais aucune référence dans le code métier  
**Action** : Confirmer si active ou à supprimer


### 5.2 Améliorations majeures 🟡


#### B1 : Granularité insuffisante
**Problème** : Tous les extras sont traités de manière identique  
**Exemples** :
- 1 carré de chocolat noir (30 kcal) = 1 extra
- 1 pizza complète (2000 kcal) = 1 extra
- Chewing-gum sans sucre (5 kcal) = 1 extra


**Proposition** : Système de pondération par kcal ou impact glycémique


#### B2 : Pas de distinction petit-déj / goûter / collation
**Problème** : Un biscuit au petit-déjeuner = même poids qu'un fast-food le soir  
**Proposition** : Catégorie "snacking" vs "repas complet extra"


#### B3 : Absence de catégorie "Gâteaux maison"
**Demande utilisateur** : Différencier gâteaux industriels vs faits maison  
**Proposition** : Nouvelle sous-catégorie avec règles adaptées


#### B4 : Pas de suivi par période de la journée
**Manque** : Identifier si extras concentrés sur certains moments  
**Proposition** : Tag `moment: "Matin" | "Après-midi" | "Soir" | "Nuit"`


---


## 📊 6. STATISTIQUES ACTUELLES


### 6.1 Distribution des extras par moment (référentiel)


| Moment | Nombre d'aliments | % |
|--------|------------------|---|
| Après-midi | 32 | 46% |
| Matin (petit-déj) | 14 | 20% |
| Midi (déjeuner) | 18 | 26% |
| Soir | 5 | 7% |


### 6.2 Top 10 extras par calories


| Aliment | kcal | Sous-catégorie |
|---------|------|----------------|
| Pizza complète | 2000 | Fast food |
| Fast food (burger+frites) | 900 | Fast food |
| Kebab/Döner | 800 | Fast food |
| Tacos | 700 | Fast food |
| Panini | 500 | Fast food |
| Paris-Brest | 420 | Pâtisserie |
| Viennoiserie (pain au chocolat) | 400 | Viennoiserie |
| Religieuse | 380 | Pâtisserie |
| Frites McDo | 340 | Fast food |
| Mille-feuille | 340 | Pâtisserie |


---


## 🎯 7. RECOMMANDATIONS POUR AMÉLIORATION


### 7.1 Corrections urgentes (Sprint 1)


**P0 - Blocker** :
- [ ] Corriger `calculerExtrasSemaine()` pour inclure `est_extra === true`
- [ ] Définir source de vérité : `categorie` vs `est_extra`
- [ ] Documenter ou supprimer colonne `extras` (INTEGER)


**P1 - Critique** :
- [ ] Ajouter catégorie "Gâteaux maison" vs "industriels"
- [ ] Créer sous-catégorie "Biscuits petit-déj" vs "Snacking"
- [ ] Ajouter pondération par impact calorique (optionnel)


### 7.2 Nouvelles fonctionnalités (Sprint 2-3)


**Catégorisation fine** :
```javascript
// Proposition de nouvelle structure
{
  nom: "Gâteau au chocolat maison",
  categorie: "extra",
  sousCategorie: "Pâtisseries maison", // ✅ NOUVEAU
  typeExtra: "occasionnel", // occasionnel | snacking | fast-food
  moment: "Après-midi",
  impact: "moyen", // faible | moyen | fort (selon kcal)
  kcal: 280,
  planifiable: true // Peut être intégré dans le planning
}
```


**Système de pondération** :
```javascript
// Quota basé sur "points d'impact" au lieu de "nombre"
const impactMap = {
  faible: 0.5,  // Chewing-gum, 1 carré chocolat
  moyen: 1,     // Biscuit, viennoiserie
  fort: 2       // Fast-food complet, pizza
};


// Quota hebdo = 3 points au lieu de 3 extras
// 6 chewing-gums = 3 points ✅
// 1 pizza + 1 biscuit = 3 points ✅
// 3 fast-food = 6 points ❌
```


**Gestion par profil objectif** :
```javascript
// Adapter quota selon objectif poids
const quotaParObjectif = {
  "perte-rapide": { quota: 1, tolerance: 0 },
  "perte-moderee": { quota: 2, tolerance: 1 },
  "stabilisation": { quota: 3, tolerance: 1 },
  "reprise": { quota: 5, tolerance: 2 }
};
```


### 7.3 Nouvelles catégories à ajouter


**Catégorie "Petit-déjeuner sucré"** :
- Céréales sucrées
- Viennoiseries
- Pâtes à tartiner
- Confitures industrielles


**Catégorie "Goûter/Snacking"** :
- Biscuits industriels
- Barres chocolatées
- Chips, cacahuètes
- Bonbons


**Catégorie "Gâteaux maison"** :
- Gâteau au chocolat maison
- Cookies maison
- Muffins maison
- ⚠️ Règle : 50% moins pénalisant que version industrielle


**Catégorie "Fast-food restaurant"** :
- Séparation fast-food classique vs restaurant gastronomique
- Restaurant = contexte social accepté
- Fast-food = impulsivité à gérer


---


## 🔬 8. QUESTIONS À VALIDER AVEC UTILISATEUR


### 8.1 Définition et périmètre


1. **Un fruit sec (dattes, pruneaux) est-il un extra ?**
   - Actuellement : NON (categorie: "fruit")
   - Débat : Forte teneur en sucre mais naturel


2. **Un smoothie maison est-il un extra ?**
   - Actuellement : Dépend de checkbox manuelle
   - Proposition : Jamais extra si 100% fruits + légumes


3. **Pain blanc vs pain complet** :
   - Pain blanc devrait-il être catégorisé "extra" ?
   - Référentiel propose "pain blanc" en extra (ligne 3630)


4. **Biscuit maison vs industriel** :
   - Même traitement ou règle différente ?
   - Proposition : Maison = 50% impact


### 8.2 Règles métier


5. **Quota identique toute l'année ?**
   - Ou variation selon période (Noël, vacances, etc.) ?


6. **Extra planifié vs spontané** :
   - Un extra prévu à l'avance devrait-il compter moins ?
   - Encourager planification vs impulsivité


7. **Contexte social** :
   - Extra en famille/amis vs seul devant TV ?
   - Impact psychologique différent


8. **Quantité vs présence** :
   - 1 carré chocolat = 10 carrés ?
   - Ou système de portions graduées ?


### 8.3 Profils et adaptation


9. **Marges selon objectif poids** :
   - Personne proche objectif : plus de marge ?
   - Personne éloignée : quota strict ?


10. **Historique de l'utilisateur** :
    - Ancien compulsif sucre → quota sucré réduit
    - Ancien fumeur → quota snacking augmenté (compensation)


---


## 📝 9. PLAN D'ACTION PROPOSÉ


### Phase 1 : Corrections bugs (1-2 jours)
1. Corriger `calculerExtrasSemaine()` pour inclure `est_extra`
2. Tests validation hebdomadaire
3. Documentation source de vérité `categorie` vs `est_extra`


### Phase 2 : Catégorisation enrichie (3-5 jours)
1. Ajouter sous-catégories :
   - Gâteaux maison
   - Snacking petit-déj
   - Goûter après-midi
2. Ajouter champ `typeExtra` : occasionnel | snacking | fast-food
3. Migration données existantes


### Phase 3 : Pondération intelligente (5-7 jours)
1. Définir système de points d'impact
2. Adapter logique quota (3 extras → 3 points)
3. UI : Afficher "1.5/3 points" au lieu de "2/3 extras"


### Phase 4 : Profils adaptatifs (7-10 jours)
1. Récupérer objectif poids utilisateur
2. Adapter quotas selon profil
3. Messages personnalisés selon historique


### Phase 5 : Analytics avancés (Optionnel)
1. Graphiques extras par moment de journée
2. Corrélation extras ↔ poids
3. Identification patterns (extras week-end, soir, stress)


---


## 🎓 10. ANNEXES


### 10.1 Code complet des aliments extras


**Voir** : `/data/referentiel.js` lignes 2030-3020 (69 aliments)


### 10.2 Messages de feedback complets


**Voir** : `/lib/validationSemaine.js` lignes 182-207


### 10.3 Schéma base de données


```
repas_reels
├── categorie (TEXT)        → "extra", "fast-food", "féculent"...
├── est_extra (BOOLEAN)     → true/false (choix utilisateur)
├── tag (TEXT)              → "fast-food", "restaurant"
├── extras (INTEGER)        → ⚠️ Non utilisé
└── ...


semaines_validees
├── extras_count (INTEGER)      → Nombre total extras
├── extras_details (JSONB)      → [{ type, nom, date, moment }]
├── message_feedback (TEXT)     → Message personnalisé
├── variation (INTEGER)         → Évolution vs N-1
└── date_validation (TIMESTAMPTZ)


extras (legacy?)
├── id, user_id, date, heure
├── type, aliment, quantite
└── kcal, contexte, humeur...
```


---


## ✅ CONCLUSION


**État actuel** :
- ✅ Système de base fonctionnel (69 aliments, quota, validation)
- ⚠️ 4 bugs critiques identifiés
- 🟡 4 améliorations majeures à prioriser


**Prochaines étapes** :
1. Valider définitions avec utilisateur (10 questions)
2. Corriger bugs P0 (calcul extras incomplet)
3. Enrichir catégorisation (gâteaux, snacking)
4. Implémenter pondération intelligente


**Effort estimé** : 2-3 semaines (selon scope retenu)


---


**Document créé le** : 9 janvier 2026  
**Auteur** : GitHub Copilot  
**Statut** : 📋 EN ATTENTE VALIDATION UTILISATEUR


info complementaires :

Fichier 1

export default function Regles() {
  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Règles et Cadre des Extras</h1>

      <p><strong>Quota mensuel :</strong> 12 extras</p>
      <p><strong>Quota hebdomadaire :</strong> 3 extras maximum</p>

      <h2>Types d’extras autorisés</h2>
      <ul>
        <li><strong>Goûter partagé maison :</strong> 120-150 kcal, 1 fois / semaine</li>
        <li><strong>Bonbon :</strong> 100g max, 1 fois / semaine, après un repas</li>
        <li><strong>Pâtisserie :</strong> 1 part, 1 fois tous les 10-15 jours</li>
        <li><strong>Combo cinéma :</strong> 100g total, 1 fois / mois</li>
        <li><strong>Chips :</strong> 25g, 1 fois / mois, avec crudités</li>
        <li><strong>Glace :</strong> 1 boule, 1 fois tous les 10-15 jours, en extérieur</li>
        <li><strong>Bouchée test :</strong> 1 à 2 bouchées, 2 à 3 fois / semaine (ne compte pas dans les extras)</li>
        <li><strong>Fast-Food :</strong> 8 fois / an max, avec compensation (jeûne ou repas léger)</li>
      </ul>

      <h2>Rappels importants</h2>
      <ul>
        <li>Les extras doivent toujours être assumés, jamais culpabilisés.</li>
        <li>Ils s’intègrent dans une stratégie globale de stabilité, pas de perfection.</li>
        <li>Le fait de ne pas consommer ses extras renforce ta progression, mais ils sont là pour durer.</li>
      </ul>

      <p style={{ marginTop: 20, fontStyle: 'italic', color: '#555' }}>
        Ces règles sont ton cadre bienveillant : elles t’aident à garder le cap tout en te respectant.
      </p>
    </div>
  );
}


fichier 2 
import { useState } from 'react';

export default function Extras() {
  const quotaMensuel = 12;
  const quotaHebdo = 3;

  const [extrasPris, setExtrasPris] = useState([]);
  const [typeExtra, setTypeExtra] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const extrasRestantsSemaine = quotaHebdo - extrasPris.filter(e => e.semaine === currentWeek()).length;
  const extrasRestantsMois = quotaMensuel - extrasPris.length;

  function currentWeek() {
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
  }

  const ajouterExtra = () => {
    if (!typeExtra) {
      setConfirmation("Choisis un type d’extra avant de valider.");
      return;
    }

    const nouvelExtra = {
      type: typeExtra,
      date: new Date().toLocaleDateString(),
      semaine: currentWeek()
    };

    setExtrasPris([...extrasPris, nouvelExtra]);
    setTypeExtra('');
    setConfirmation(`Extra "${nouvelExtra.type}" enregistré !`);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Gestion des Extras</h1>

      <p><strong>Quota mensuel :</strong> {quotaMensuel}</p>
      <p><strong>Quota hebdomadaire :</strong> {quotaHebdo}</p>

      <p><strong>Extras pris ce mois-ci :</strong> {extrasPris.length}</p>
      <p><strong>Extras restants cette semaine :</strong> {extrasRestantsSemaine}</p>
      <p><strong>Extras restants ce mois-ci :</strong> {extrasRestantsMois}</p>

      <hr />

      <h2>Déclarer un nouvel extra</h2>
      <select value={typeExtra} onChange={(e) => setTypeExtra(e.target.value)} style={{ padding: 8, width: '100%' }}>
        <option value="">-- Choisir un type d’extra --</option>
        <option value="Goûter partagé maison">Goûter partagé maison</option>
        <option value="Bonbon">Bonbon</option>
        <option value="Pâtisserie">Pâtisserie</option>
        <option value="Combo cinéma">Combo cinéma</option>
        <option value="Chips">Chips</option>
        <option value="Glace">Glace</option>
        <option value="Bouchée test">Bouchée test</option>
        <option value="Fast-Food">Fast-Food</option>
      </select>

      <button onClick={ajouterExtra} style={btnStyle}>Valider</button>

      {confirmation && (
        <p style={{ color: 'green', marginTop: 10 }}>{confirmation}</p>
      )}

      <hr />
      <h3>Historique local (non sauvegardé)</h3>
      <ul>
        {extrasPris.map((e, i) => (
          <li key={i}>{e.date} – {e.type}</li>
        ))}
      </ul>
    </div>
  );
}

const btnStyle = {
  marginTop: 10,
  padding: 10,
  backgroundColor: '#333',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  width: '100%',
  marginBottom: 20
};


Fichier 3

✅ STRUCTURE COMPORTEMENTALE – MESSAGES EXTRAS + VARIATION POSITIVE

🔹 Catégorie 1 — +1 extra dépassé
Message principal (TA VERSION) :
🟡 « Un extra dépassé, et si on commençait à envisager un retour à l’équilibre dès à présent ? »
🔘 Bouton : Planifier la suite
Variante complémentaire :
« Un petit écart. C’est le bon moment pour choisir comment tu veux finir ta semaine. »
« Un extra, ce n’est pas une faute. C’est une occasion de t’observer avec lucidité. »

🔹 Catégorie 2 — +2 extras dépassés
Message principal (TA VERSION) :
🟡 « N’oublie pas que plus tu consommes tes extras, plus tu auras du mal à te contrôler. Je te propose de mieux planifier tes extras de la semaine prochaine. »
🔘 Bouton : Planifier mes extras
Variante complémentaire :
« Deux extras dépassés. Tu veux t’aider à retrouver ton équilibre avant dimanche ? »
« Rien n’est perdu. C’est maintenant que ton plan peut t’aider. »

🔹 Catégorie 3 — 3 extras ou plus
Message principal (TA VERSION) :
⚠️ « Tu dépasses souvent ton quota. Tu veux de l’aide pour te rééquilibrer ? »
🔘 Bouton : Commencer un défi
Variante complémentaire :
« Ce que tu vis n’est pas un échec. C’est un signal. Tu veux reprendre la main ? »
« Ces extras s’additionnent. Ce n’est pas une faute, mais c’est une habitude à observer. »

🔹 Catégorie 4 — Retour à l’équilibre (après dépassement précédent)
Message recommandée :
✅ « La semaine dernière, tu avais dépassé ton quota. Cette semaine, tu es resté(e) dans les clous. C’est une vraie reprise en main. »
Variante :
« Tu es revenu(e) à l’essentiel cette semaine. Voilà le vrai mouvement de fond. »

🔹 Catégorie 5 — Aucun extra dépassé (quota utilisé ou non)
Cas A : quota totalement utilisé (3/3) sans dépassement :
« 3 extras pile, pas un de plus. Tu tiens ton cap avec justesse. »
Cas B : quota non épuisé (ex : 1 ou 2/3) :
« Tu as économisé un extra cette semaine. Tu te rapproches de ton objectif de perte de poids. »
« Il te reste des extras non utilisés. Ce n’est pas de la frustration, c’est de l’alignement. »

🔹 Catégorie 6 — Semaine encore récupérable (ex : vendredi, avec 1 ou 2 extras déjà dépassés)
Messages complémentaires :
« Il n’est pas trop tard. Même avec un écart, tu peux encore créer une fin de semaine solide. »
« Ce n’est pas foutu. Ce que tu choisis aujourd’hui comptera plus que ce que tu as fait hier. »🔹 Catégorie 1 — +1 extra dépassé
🟡 « Un extra dépassé, et si on commençait à envisager un retour à l’équilibre dès à présent ? »
🚫 Aucun bouton
Variantes complémentaires :
« Un petit écart. C’est le bon moment pour choisir comment tu veux finir ta semaine. »
« Un extra, ce n’est pas une faute. C’est une occasion de t’observer avec lucidité. »

🔹 Catégorie 2 — +2 extras dépassés
🟡 « N’oublie pas que plus tu consommes tes extras, plus tu auras du mal à te contrôler. Je te propose de mieux planifier tes extras de la semaine prochaine. »
🔘 Bouton : Planifier mes extras
Variantes complémentaires :
« Deux extras dépassés. Tu veux t’aider à retrouver ton équilibre avant dimanche ? »
« Rien n’est perdu. C’est maintenant que ton plan peut t’aider. »

🔹 Catégorie 3 — 3 extras ou plus
⚠️ « Tu dépasses souvent ton quota. Tu veux de l’aide pour te rééquilibrer ? »
🔘 Bouton : Commencer un défi
Variantes complémentaires :
« Ce que tu vis n’est pas un échec. C’est un signal. Tu veux reprendre la main ? »
« Ces extras s’additionnent. Ce n’est pas une faute, mais c’est une habitude à observer. »

🔹 Catégorie 4 — Retour à l’équilibre (après dépassement la semaine précédente)
✅ « La semaine dernière, tu avais dépassé ton quota. Cette semaine, tu as su garder le cap. »
✅ « Tu es revenue à l’essentiel cette semaine. »

🔹 Catégorie 5 — Aucun extra dépassé (quota utilisé ou non)
Cas A : quota totalement utilisé (3/3) sans dépassement
« 3 extras pile, pas un de plus. Tu tiens ton cap avec justesse. »
Cas B : quota non épuisé (ex : 1 ou 2/3)
« Tu as économisé un extra cette semaine. Tu te rapproches de ton objectif de perte de poids. »

🔹 Catégorie 6 — Semaine encore récupérable (milieu ou fin de semaine, extras déjà dépassés)
Messages complémentaires :
« Il n’est pas trop tard. Même avec un écart, tu peux encore créer une fin de semaine solide. »
« Ce n’est pas foutu. Ce que tu choisis aujourd’hui comptera plus que ce que tu as fait hier. »


💡 RECOMMANDATIONS TECHNIQUES POUR COPILOT
Chaque catégorie peut contenir 2 à 3 messages max


Utiliser une logique de sélection aléatoire ou cyclique dans chaque groupe


Respecter les intentions comportementales associées aux boutons (non gamifiés, non punitifs)


Ajouter une vérification du quota restant pour déclencher le message “tu as économisé un extra”





🔁 LOGIQUE « RETOUR À L’ÉQUILIBRE » – POUR GESTION INTELLIGENTE DES DÉPASSEMENTS

🎯 Objectif :
Valoriser explicitement les semaines où l’utilisateur respecte son quota après une période de dépassement, sans culpabilisation, en évitant que les extras hors quota deviennent la norme visuelle implicite.

1. 🧠 Message comportemental de progression
Déclencheur :
À la fin d’une semaine sans aucun extra au-delà du quota (0 dans “au-delà du nécessaire”)


Et s’il y a eu des extras hors quota visibles la semaine précédente


Affichage automatique :
« La semaine dernière, tu avais franchi ton quota plusieurs fois. Cette semaine, tu es revenu(e) à l’essentiel. C’est un vrai pas vers la régularité. »
👉 Ce message doit être affiché en haut de la page /suivi, au-dessus du compteur, pour marquer l’amélioration.

2. 📁 Gestion visuelle des extras dépassés : logique d’épuration naturelle
Règle :
Les entrées dans la section « Au-delà du nécessaire » restent visibles 7 jours glissants maximum


Passé ce délai, elles sont automatiquement archivées dans la section statistique mensuelle


Elles n’apparaissent plus sur l’écran principal, sauf en cas d’analyse comportementale déclenchée


👉 Cela empêche la normalisation visuelle des écarts, et favorise une remise à zéro naturelle après retour à l’équilibre

3. 🎨 Adaptation visuelle de la section « Au-delà du nécessaire »
Logique :
Si l’utilisateur revient à l’équilibre (0 extra hors quota cette semaine), modifier l’apparence du bloc :


Ancien titre : « Au-delà du nécessaire »
Nouveau titre (temporaire) : « Écarts récents – en cours de rééquilibrage »
Teinte visuelle neutre (gris clair) → contraste avec le bloc actif de la semaine en cours


Affichage d’un mini-message sous le bloc :

 « Ces écarts font partie de ton chemin. L’important, c’est ce que tu choisis maintenant. »



4. 🔒 Règle de design à intégrer dans toute l’application
Ne jamais laisser un excès passé devenir un seuil implicite ou un point de comparaison dominant.
Toujours réinitialiser visuellement l’attention vers la norme initiale (quota 3/3)


S’appuyer sur le passé uniquement pour renforcer la perception d’un retour en maîtrise






🔁 LOGIQUE AMÉLIORÉE – GESTION DU QUOTA D’EXTRAS

1. COMPTEUR PRINCIPAL : VISUEL CLAIR, RÈGLE SÛRE
Le compteur s’arrête à 3/3. Même si l’utilisateur entre 4, 5 ou 6 extras, l’affichage reste bloqué à 3/3.
But : tu respectes la règle, mais tu vois ce que tu choisis de faire.

2. ENREGISTREMENT DES EXTRAS HORS QUOTA : 
PRÉSENTS, NON EXCUSÉS
Tout extra au-delà du quota est :
enregistré avec date/heure,
affiché dans un bloc à part, nommé sobrement :
🟡 « Au-delà du nécessaire »
jamais mis en rouge ou en négatif (pas de score baissé).
Un petit symbole (ex : ↗) peut les différencier discrètement.

3. MESSAGE CONTEXTUEL : PAS UN AVERTISSEMENT, UNE INTERPELLATION
Premier dépassement dans la semaine :
« Tu es libre d’aller au-delà. Ce qui compte, c’est ce que tu décides d’apprendre de ce geste. »
Dépassement ≥ 2 fois dans la même semaine :
« Tu dépasses souvent ton quota. Et si tu regardais de plus près ce que tu tentes de combler ? »
Dépassement ≥ 4 fois sur 7 jours :
« Ce que tu vis mérite mieux qu’un automatisme. Tu veux qu’on te propose une pause de recentrage ? »

4. ENCOURAGEMENTS DYNAMIQUES : AJUSTER SANS CULPABILISER

5. MINI-SYSTÈME DE BOUCLE DE RÉAJUSTEMENT (facultatif mais puissant)
Si 5 extras hors quota sont enregistrés sur une période glissante de 7 jours :


L’app suggère d’activer temporairement une Porte de Recentrage :

 « Tu veux respirer un instant ? Le moment est peut-être venu d’un vrai choix. »


Cela déclenche (optionnel) une mini-capsule (souffle, ancrage, mantra, message d’alignement) selon ton humeur.







Situation
Message proposé
🎯 Exactement 3/3
« Tu as su utiliser ton quota sans débordement. Ce n’est pas un score, c’est un repère. »
💨 Moins de 3/3
« Il reste de l’espace. Mais l’équilibre, ce n’est pas “tout utiliser”. C’est écouter. »
🚧 Hors quota
« Un pas de côté. Ce n’est pas grave, mais ce n’est pas neutre. Qu’est-ce que tu choisis maintenant ? »



Bloc technique – Déclaration et analyse intelligente des repas quotidiens

1. 🔍 
Vérification de la complétude des repas
Déclencheur :
À la fin de la journée (ou sur action explicite : “j’ai terminé ma journée”), lancer une vérification automatique des repas déclarés.


Logique :
Si un ou plusieurs repas sont manquants (petit-déjeuner, déjeuner, dîner, collation), alors :


Afficher une demande discrète :

 « Aucun petit-déjeuner n’a été enregistré. Souhaites-tu ajouter une raison ? »



2. 🧾 
Justification du repas manquant (optionnelle mais proposée)
Composant : 
justificationRepasManquant
Propose des choix pré-définis cliquables :


Jeûne


Pas faim


Pas eu le temps


Autre (avec champ texte facultatif)


Enregistrer chaque justification dans la table Repas_Journaliers avec :


repas_sauté = true


raison_justification = texte (choix ou saisie libre)



3. 📊 
Analyse comportementale sur la durée
Fréquence d’analyse :
Hebdomadaire et mensuelle


Variables à suivre :
Nombre de repas manquants par type (petit-déjeuner, dîner, etc.)


Raison la plus fréquente


Corrélation avec humeur ou déclenchement d’extras


But :
Détecter des tendances (ex : jeûne chronique non anticipé)


Déclencher des recommandations douces :

 « Tu sautes souvent le petit-déjeuner. Est-ce intentionnel ? Si oui, veux-tu activer un suivi du jeûne ? »



4. 🧠 
Estimation des calories & perte de poids potentielle
À partir des repas déclarés :
Calculer la moyenne des apports caloriques réels sur les 7 derniers jours


Comparer à l’objectif calorique défini


Si l’écart est significatif :
Estimer une tendance théorique de perte/prise de poids sur 4 semaines


Afficher une projection dynamique avec une formulation non normative :

 « À ce rythme, tu pourrais perdre environ X kg. Tu veux ajuster ton plan ou conserver ce rythme ? »



5. 📱 
Interface de déclaration des repas – flexible & personnalisée
Fonctionnalités attendues :
Possibilité de déclarer :


Une assiette entière (modèle pré-structuré avec portions typiques par type d’aliment)


Ou des aliments un par un, avec quantité précise (g, ml, portion)


Calcul automatique des calories par ingrédient ou assiette


Possibilité d’indiquer un repas “sans calcul” (si jeûne, ou juste pour mémoire)



6. 🔔 
Rappels personnalisés pour consigner les repas
Système :
Envoi d’un rappel doux selon heure personnalisée ou habitudes détectées

 « C’est l’heure du déjeuner. Tu veux enregistrer ce que tu as mangé ? »


Si un repas est oublié 2 jours de suite → message bienveillant :

 « Tu as sauté l’enregistrement du dîner deux fois. Tu veux ajuster ton planning ou recevoir moins de rappels ? »






1. Interface flexible
J’aimerais avoir une interface plus flexible, où je peux choisir le type de repas, ajouter les aliments un par un ou en groupe, et calculer les calories en fonction de la quantité réelle que j’indique. Ça rendrait l’utilisation plus intuitive et personnalisée.

2. Rappels et projection pondérale
J’aimerais que l’application m’envoie des rappels pour consigner chaque repas, puis qu’elle calcule une moyenne de mes calories quotidiennes. Ensuite, elle pourrait estimer ma perte de poids potentielle sur la durée, en se basant sur mes habitudes alimentaires, et me donner des conseils personnalisés pour ajuster mon alimentation afin d’optimiser ma perte de poids.

3. Création de catégories d’aliments
Chaque aliment est déjà classé par catégorie (féculents, légumes, protéines, etc.). L’application peut proposer des portions standards pour chaque type d’aliment (par exemple, une portion de légumes = 100g, une portion de féculents = 150g, etc.).


Enregistrement par assiette ou par aliment : Je pourrais choisir d’enregistrer un repas entier (une assiette) ou d’ajouter des aliments un par un. Pour une assiette, l’application pourrait proposer un modèle de répartition (par exemple, 50% légumes, 25% féculents, 25% protéines).


Quantification flexible : Une fois que j’enregistre une assiette, je peux indiquer le nombre de portions (par exemple, 1,5 assiette). L’application multipliera les portions standards par le nombre indiqué pour obtenir la quantité totale.


Suivi des aliments : Pour chaque assiette enregistrée, l’application peut garder en mémoire les aliments inclus et les portions correspondantes. Ainsi, elle peut analyser les tendances alimentaires sur la durée et donner des conseils personnalisés en fonction de mes habitudes de consommation.



4. Vérification et justification des repas manquants
Vérification de la complétude : À la fin de la journée, lorsque j’indique que j’ai terminé d’enregistrer mes repas, l’application peut vérifier s’il manque des entrées (par exemple, aucun petit-déjeuner enregistré).


Demande de justification : Si un repas manque, l’application peut me demander pourquoi (par exemple : “Vous n’avez pas enregistré de petit-déjeuner. Souhaitez-vous ajouter une raison comme ‘jeûne’, ‘pas faim’, ou ‘pas eu le temps’ ?”).


Analyse des comportements : Les réponses que je donne (par exemple, “jeûne”) peuvent être stockées dans une base de données pour analyser mes habitudes alimentaires et mes comportements (comme le fait de sauter certains repas).


Statistiques et conseils personnalisés : En analysant ces données sur la durée, l’application pourrait détecter des tendances (par exemple, un jeûne fréquent le matin) et offrir des recommandations adaptées, comme des conseils pour équilibrer les autres repas ou ajuster les apports caloriques.


Interface intuitive : Tout cela peut être présenté de manière simple et fluide, avec des rappels et des suggestions non intrusives pour m’encourager à consigner mes repas et à comprendre mes habitudes alimentaires.


Fichier 4
Règle 1 : 8 fast-foods / an MAX
→ ≈ 1 tous les 45 jours
→ Poids toujours en baisse si compensé

Règle 2 : 36 extras sucrés / an MAX (hors fast-foods)
→ = 3 extras / mois
→ Répartis comme tu veux parmi :
	•	Glaces
	•	Pâtisseries (boulangerie ou maison)
	•	Bonbons
	•	Popcorn
	•	Goûter partagé fait maison
	•	Cinéma

Règle 3 : Jamais plus de 1 extra sucré par semaine
→ Sinon, risque de :
	•	Stockage des sucres
	•	Augmentation de la faim les jours suivants
	•	Perte de contrôle



🍰 6. EXTRAS
Ce que c’est :
Les extras sont les aliments liés à la sphère émotionnelle, sociale ou compulsive. Très riches en sucre, graisses ou additifs, ils sont souvent consommés par envie plus que par besoin.
Ils peuvent être source de plaisir s’ils sont intégrés consciemment, mais deviennent délétères s’ils comblent un vide intérieur.
Aliments associés :
Chips


Pâtisseries industrielles


Glaces


Fast food


Bonbons


Chocolat au lait


Boissons sucrées


Viennoiseries


Nutella


Plats préparés


Ketchup, sauces
Fichier 5 
3.3 Extras
Catégorisation précise : pâtisseries, bonbons, fast food, etc.


Règles paramétrées (fréquence, quantité, conditions)


Saisie rapide d’un extra avec son type


Alerte si quota atteint ou règle non respectée


Suggestion d’alternative (“aliment booster”)


Si extra évité : “gain” théorique affiché


Si extra consommé : message informatif + solution douce


Fichier 6




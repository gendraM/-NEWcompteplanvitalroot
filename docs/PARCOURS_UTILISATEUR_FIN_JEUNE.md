# 🔄 PARCOURS UTILISATEUR : FIN DU JEÛNE → REPRISE ALIMENTAIRE

## 📊 VUE D'ENSEMBLE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PARCOURS COMPLET DE L'UTILISATEUR                    │
└─────────────────────────────────────────────────────────────────────────┘

1. PENDANT LE JEÛNE (pages/jeune.js)
   └─> Saisie alimentaire quotidienne
   └─> Validation des critères de préparation
   └─> Détection automatique J-3 (ou mi-parcours)
   └─> Génération du programme de reprise

2. VALIDATION DU PLAN (pages/validation-plan-reprise.js)
   └─> Engagement utilisateur (2 checkboxes)
   └─> Sauvegarde en localStorage
   └─> Redirection automatique vers reprise

3. FIN DU JEÛNE (pages/jeune.js)
   └─> Détection automatique : joursValides >= dureeJeune
   └─> Sauvegarde du plan validé
   └─> Redirection automatique vers /reprise-alimentaire-apres-jeune

4. REPRISE ALIMENTAIRE (pages/reprise-alimentaire-apres-jeune.js)
   └─> Lecture depuis Supabase (ou localStorage en fallback)
   └─> Affichage du contexte jeûne (poids_fin_jeune, message_personnel)
   └─> Validation quotidienne des jours
   └─> Transition automatique vers consolidation (45 jours)
```

---

## 1️⃣ PENDANT LE JEÛNE : SAISIE ALIMENTAIRE & CRITÈRES

### 📍 **Fichier** : `pages/jeune.js` + `components/SaisieDefiAlimentaire.js`

### 🎯 **Objectif**
Permettre à l'utilisateur de :
- Valider chaque jour de jeûne
- Saisir ses repas (pendant la préparation)
- Valider automatiquement le critère "Respect des quantités"

### 🔄 **Flux technique**

#### A. Saisie d'un repas (composant `SaisieDefiAlimentaire`)

```javascript
// 1. L'utilisateur saisit un repas
{
  type: "Déjeuner",
  date: "2025-12-02",
  heure: "12:30",
  aliment: "Poulet grillé",
  categorie: "protéine",
  quantite: 150, // grammes
  kcal: 240
}

// 2. Validation automatique du critère
const found = referentielAliments.find(a => a.nom === "Poulet grillé");
const portionMax = found.portionMax; // 200g

if (quantite <= portionMax) {
  // ✅ CRITÈRE VALIDÉ
  validerCriterePreparation('quantites', new Date().toISOString());
}

// 3. Insertion en BDD
await supabase.from("repas_reels").insert([{...repasData}]);
```

#### B. Stockage du critère validé

**Fichier** : `lib/validerCriterePreparation.js`

```javascript
// localStorage (pour instant)
{
  "preparationJeuneCriteres": {
    "quantites": {
      "validé": true,
      "dateValidation": "2025-12-02T12:35:00.000Z"
    },
    "feculents": {
      "validé": true,
      "dateValidation": "2025-11-25T18:20:00.000Z"
    }
    // ... autres critères
  }
}
```

### 📊 **Critères de validation disponibles**

| Code | Titre | Jalon | Validation |
|------|-------|-------|------------|
| `quantites` | Respect des quantités | J-30 | Automatique (si quantité ≤ portionMax) |
| `feculents` | Réduction féculents | J-17 | Manuelle (via défi) |
| `sucres` | Suppression sucres raffinés | J-14 | Manuelle |
| `proteines` | Protéines animales | J-12 | Manuelle |
| `alcool` | Zéro alcool | J-7 | Manuelle |
| `cafe` | Réduction café | J-7 | Manuelle |

---

## 2️⃣ DÉTECTION J-3 : GÉNÉRATION DU PROGRAMME DE REPRISE

### 📍 **Fichier** : `pages/jeune.js` (lignes 482-615)

### 🎯 **Déclenchement automatique**

```javascript
// Calcul automatique : jourEnCours >= Math.max(4, Math.ceil(dureeJeune / 2))
// Exemple : jeûne de 7 jours → J4
// Exemple : jeûne de 14 jours → J7

const showReprise = !isFini && (jourEnCours >= Math.max(4, Math.ceil(dureeJeune / 2)));
```

### 🚨 **Alerte visuelle**

```javascript
// Alerte J-3 (urgence si dans les 3 derniers jours)
{
  message: "⚠️ ALERTE : Tu es à J-3 de la fin de ton jeûne !",
  urgence: true, // Affichage rouge
  action: "Générer mon programme de reprise"
}
```

### 🔧 **Génération du programme**

**Fonction appelée** : `lib/jeuneUtils.js` → `genererEtSauvegarderProgramme()`

```javascript
// INPUT
const jeuneData = {
  id: "uuid-jeune",
  duree_jours: 7,
  date_debut: "2025-11-25",
  date_fin: "2025-12-02",
  poids_depart: 85,
  poids_fin_jeune: 81.5, // ⚠️ IMPORTANT : poids fin jeûne
  message_personnel: "Je veux me reconnecter à mon corps"
};

// PROCESS
const programme = genererProgrammeReprise({
  dureeJeune: 7,
  poidsDepart: 85,
  dateFin: "2025-12-02"
});
// → duree_reprise = 7 × 2 = 14 jours
// → date_debut_reprise = 2025-12-03
// → date_fin_reprise = 2025-12-16

// OUTPUT - Insertion dans Supabase
await supabase.from('reprises_alimentaires').insert({
  user_id: userId,
  jeune_id: jeuneData.id,
  duree_jeune_jours: 7,
  poids_depart: 85,
  poids_fin_jeune: 81.5, // ✅ Sauvegardé
  date_debut_jeune: "2025-11-25",
  date_fin_jeune: "2025-12-02",
  message_personnel: "Je veux me reconnecter à mon corps", // ✅ Sauvegardé
  duree_reprise_jours: 14,
  date_debut_reprise: "2025-12-03",
  date_fin_reprise: "2025-12-16",
  phases: { /* détails phases 1-4 */ },
  liste_courses: [/* aliments J1-J2 */],
  statut: 'proposition', // ⚠️ Pas encore validé
  plan_genere_le: "2025-12-02T15:30:00.000Z"
});

// Insertion des jours détaillés
await supabase.from('reprises_jours_valides').insert([
  {
    reprise_id: programmeId,
    jour_numero: 1,
    date: "2025-12-03",
    phase: 1,
    aliments_autorises: [/* bouillon, jus légumes */],
    valide: false // ⚠️ Pas encore validé
  },
  // ... 14 jours au total
]);
```

---

## 3️⃣ VALIDATION DU PLAN DE REPRISE

### 📍 **Fichier** : `pages/validation-plan-reprise.js`

### 🎯 **Engagement utilisateur**

```javascript
// 2 checkboxes obligatoires
✅ J'ai lu et compris le plan de reprise
✅ Je m'engage à suivre ce plan pour fortifier mon pouvoir de volonté
```

### 🔧 **Validation technique**

```javascript
const handleValider = () => {
  // 1. Sauvegarder dans localStorage (clé spécifique)
  localStorage.setItem('programmeRepriseValide', JSON.stringify(programme));
  
  // 2. Supprimer l'ancien brouillon
  localStorage.removeItem('programmeReprise');
  
  // 3. Mise à jour Supabase (si applicable)
  await supabase
    .from('reprises_alimentaires')
    .update({
      statut: 'plan_valide', // ✅ Changement de statut
      plan_valide_le: new Date().toISOString()
    })
    .eq('id', programmeId);
  
  // 4. Redirection automatique
  router.push('/reprise-alimentaire-apres-jeune');
};
```

---

## 4️⃣ FIN DU JEÛNE : REDIRECTION AUTOMATIQUE

### 📍 **Fichier** : `pages/jeune.js` (lignes 482-492)

### 🎯 **Détection automatique**

```javascript
// Condition : tous les jours du jeûne sont validés
const isFini = joursValides.length >= dureeJeune;

// useEffect qui écoute cette condition
useEffect(() => {
  if (isFini && programmeReprise) {
    // 1. Sauvegarder le plan validé
    localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeReprise));
    
    // 2. Redirection automatique vers la page de reprise
    window.location.href = '/reprise-alimentaire-apres-jeune';
  }
}, [isFini, programmeReprise]);
```

### ⚠️ **IMPORTANT**

Cette redirection se fait **automatiquement** dès que :
- ✅ Le dernier jour du jeûne est validé
- ✅ Un programme de reprise existe (généré + validé)

**Pas d'intervention manuelle nécessaire** → Expérience fluide

---

## 5️⃣ REPRISE ALIMENTAIRE : SUIVI QUOTIDIEN

### 📍 **Fichier** : `pages/reprise-alimentaire-apres-jeune.js`

### 🎯 **Chargement des données**

```javascript
// 1. Authentification
const { data: { user } } = await supabase.auth.getUser();

// 2. Lecture depuis Supabase (priorité)
const { data: programmeData } = await supabase
  .from('reprises_alimentaires')
  .select('*')
  .eq('user_id', user.id)
  .in('statut', ['plan_valide', 'en_cours', 'termine'])
  .order('created_at', { ascending: false })
  .single();

// 3. Chargement des jours détaillés
const { data: joursData } = await supabase
  .from('reprises_jours_valides')
  .select('*')
  .eq('reprise_id', programmeData.id)
  .order('jour_numero', { ascending: true });

// 4. Restructuration pour compatibilité UI
const programme = {
  id: programmeData.id,
  poids_fin_jeune: programmeData.poids_fin_jeune, // ✅ Affiché en haut
  message_personnel: programmeData.message_personnel, // ✅ Affiché en haut
  jours_detailles: joursData
};
```

### 📊 **Affichage du contexte jeûne**

```jsx
{/* Bloc visuel en haut de page */}
<div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
  <h3>🌙 Contexte de ton jeûne</h3>
  
  {/* Message personnel */}
  <p>"{programme.message_personnel}"</p>
  
  {/* Métriques clés */}
  <div>
    <div>Durée du jeûne : {programme.duree_jeune_jours} jours</div>
    <div>Poids fin jeûne : {programme.poids_fin_jeune} kg</div> {/* ✅ */}
    <div>Fin du jeûne : {new Date(programme.date_fin_jeune).toLocaleDateString()}</div>
    <div>Durée reprise : {programme.duree_reprise_jours} jours</div>
  </div>
</div>
```

### ✅ **Validation quotidienne**

```javascript
// Fonction de validation d'un jour
const validerJour = async (jourData) => {
  // 1. Vérifier que c'est la bonne date
  const dateJour = new Date(jourData.date);
  const aujourdhui = new Date();
  
  if (dateJour > aujourdhui) {
    alert("Ce jour n'est pas encore accessible !");
    return;
  }
  
  // 2. Mise à jour dans Supabase
  await supabase
    .from('reprises_jours_valides')
    .update({
      valide: true,
      valide_le: new Date().toISOString()
    })
    .eq('reprise_id', programme.id)
    .eq('jour_numero', jourData.jour_numero)
    .eq('user_id', user.id);
  
  // 3. Vérifier si c'est le dernier jour
  if (jourData.jour_numero === programme.duree_reprise_jours) {
    // 🎉 REPRISE TERMINÉE !
    await supabase
      .from('reprises_alimentaires')
      .update({
        statut: 'termine',
        reprise_terminee_le: new Date().toISOString()
      })
      .eq('id', programme.id);
    
    // Afficher bannière félicitations + bouton consolidation
  }
  
  // 4. Rafraîchir les données
  chargerProgramme();
};
```

### 🎉 **Transition vers consolidation**

```javascript
// Détection du dernier jour validé
const dernierJourValide = jours.every(j => j.valide);

if (dernierJourValide) {
  return (
    <div style={{ background: '#c8e6c9', padding: '2rem' }}>
      <h2>🎉 Félicitations !</h2>
      <p>Tu as terminé ta reprise alimentaire de {programme.duree_reprise_jours} jours</p>
      
      <Link href={{
        pathname: '/consolidation-45-jours',
        query: {
          poids: programme.poids_fin_jeune,
          date_fin_reprise: programme.date_fin_reprise,
          jeune_id: programme.jeune_id
        }
      }}>
        <button>🚀 Commencer ma phase de consolidation (45 jours)</button>
      </Link>
    </div>
  );
}
```

---

## 📋 RÉSUMÉ DES DONNÉES PERSISTÉES

### **Table `reprises_alimentaires`**

| Colonne | Source | Moment de sauvegarde |
|---------|--------|---------------------|
| `jeune_id` | ID du jeûne | Génération du programme (J-3 ou mi-parcours) |
| `poids_depart` | Poids début jeûne | Génération du programme |
| `poids_fin_jeune` | ⚠️ **Poids fin jeûne** | ⚠️ **À sauvegarder lors de la validation du dernier jour du jeûne** |
| `message_personnel` | Message utilisateur | Génération du programme (depuis jeune.js) |
| `statut` | `'proposition'` → `'plan_valide'` → `'en_cours'` → `'termine'` | Évolution progressive |
| `plan_genere_le` | Timestamp génération | Génération du programme |
| `plan_valide_le` | Timestamp validation | Validation du plan |
| `reprise_commencee_le` | Timestamp début | Premier jour validé |
| `reprise_terminee_le` | Timestamp fin | Dernier jour validé |

### **Table `reprises_jours_valides`**

| Colonne | Description | Évolution |
|---------|-------------|-----------|
| `reprise_id` | Lien vers `reprises_alimentaires` | Fixe |
| `jour_numero` | 1 à duree_reprise_jours | Fixe |
| `date` | Date du jour (2025-12-03, etc.) | Fixe |
| `phase` | 1 à 4 | Fixe |
| `valide` | `false` → `true` | ✅ Mise à jour quotidienne |
| `valide_le` | `null` → timestamp | ✅ Mise à jour quotidienne |

### **Table `repas_reels`** (saisie alimentaire)

| Colonne | Exemple | Usage |
|---------|---------|-------|
| `type` | "Déjeuner" | Classification |
| `date` | "2025-12-02" | Historique |
| `aliment` | "Poulet grillé" | Traçabilité |
| `categorie` | "protéine" | Analyse nutritionnelle |
| `quantite` | 150 | Validation critère "quantités" |
| `kcal` | 240 | Bilan énergétique |

---

## ⚠️ PROBLÈMES IDENTIFIÉS & SOLUTIONS

### 🔴 **Problème 1 : `poids_fin_jeune` non sauvegardé**

**État actuel** : La colonne existe dans Supabase, mais **elle n'est pas remplie** lors de la validation du dernier jour du jeûne.

**Impact** : Le bloc "Poids en fin de jeûne" dans `/reprise-alimentaire-apres-jeune.js` affiche `null`.

**Solution** :

```javascript
// Dans pages/jeune.js, fonction de validation du dernier jour
const validerDernierJour = async (jour) => {
  const nouveauxJours = [...joursValides, jour];
  
  // Si c'est le dernier jour du jeûne
  if (nouveauxJours.length === dureeJeune) {
    // 1. Demander le poids actuel à l'utilisateur
    const poidsActuel = prompt("Quel est ton poids à la fin de ce jeûne (en kg) ?");
    
    // 2. Mettre à jour le programme de reprise dans Supabase
    if (programmeReprise && poidsActuel) {
      await supabase
        .from('reprises_alimentaires')
        .update({
          poids_fin_jeune: parseFloat(poidsActuel),
          statut: 'en_cours', // Passage de 'plan_valide' à 'en_cours'
          reprise_commencee_le: new Date().toISOString()
        })
        .eq('id', programmeReprise.id);
    }
  }
  
  setJoursValides(nouveauxJours);
};
```

### 🔴 **Problème 2 : Critères stockés en localStorage**

**État actuel** : Les 9 critères de préparation sont dans `localStorage` uniquement.

**Impact** : 
- Perte des données si changement de device
- Pas d'historique dans Supabase
- Impossible d'analyser les parcours utilisateurs

**Solution** : Créer table `criteres_preparation_valides` dans Supabase.

```sql
CREATE TABLE criteres_preparation_valides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  preparation_id UUID, -- Lien vers une future table preparations_jeune
  critere_id INTEGER NOT NULL, -- 1 à 9
  critere_code VARCHAR(50), -- 'quantites', 'feculents', etc.
  valide BOOLEAN DEFAULT false,
  date_validation TIMESTAMP WITH TIME ZONE,
  jour_relatif INTEGER, -- J-30, J-17, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_criteres_user ON criteres_preparation_valides(user_id);
CREATE INDEX idx_criteres_code ON criteres_preparation_valides(critere_code);
```

### 🔴 **Problème 3 : Pas de lien entre préparation et jeûne**

**État actuel** : 
- La préparation (`preparation-jeune.js`) est isolée
- Le jeûne (`jeune.js`) ne récupère pas les critères validés
- Pas de table `parcours_jeune` unifiée

**Solution** : Créer architecture unifiée (voir `docs/ANALYSE_ECART_JEUNE_VS_EXISTANT.md`).

---

## 🎯 CHECKLIST DE VALIDATION COMPLÈTE

### Phase 0 : Préparation (J-30 à J-0)
- [x] ✅ Page `preparation-jeune.js` fonctionnelle
- [x] ✅ 9 critères progressifs débloqués
- [x] ✅ Composant `SaisieDefiAlimentaire` intégré
- [x] ✅ Validation automatique critère "quantités"
- [x] ✅ Stockage dans `repas_reels` (Supabase)
- [ ] ⚠️ Migration critères localStorage → Supabase

### Phase 1 : Jeûne (J1 à JX)
- [x] ✅ Contenu pédagogique J1-J10 complet
- [x] ✅ Validation quotidienne des jours
- [x] ✅ Détection J-3 ou mi-parcours
- [x] ✅ Génération du programme de reprise
- [ ] ⚠️ Sauvegarde `poids_fin_jeune` au dernier jour

### Phase 2 : Validation plan reprise
- [x] ✅ Page `validation-plan-reprise.js` fonctionnelle
- [x] ✅ 2 checkboxes d'engagement
- [x] ✅ Sauvegarde en Supabase
- [x] ✅ Changement statut `'proposition'` → `'plan_valide'`

### Phase 3 : Reprise alimentaire
- [x] ✅ Chargement depuis Supabase
- [x] ✅ Affichage contexte jeûne (poids, message)
- [x] ✅ Validation quotidienne des jours
- [x] ✅ Transition vers consolidation

---

## 📞 ACTIONS PRIORITAIRES IMMÉDIATES

1. **Implémenter sauvegarde `poids_fin_jeune`** lors du dernier jour du jeûne
2. **Créer table `criteres_preparation_valides`** dans Supabase
3. **Migrer logique critères** de localStorage vers Supabase
4. **Créer table `parcours_jeune`** pour unifier préparation → jeûne → reprise
5. **Tester le parcours complet** J-30 → J-0 → Jeûne → Reprise

---

## 💡 EXEMPLE CONCRET : PARCOURS DE SARAH

### 👤 **Sarah décide de faire un jeûne**

**Aujourd'hui, nous sommes le 15 novembre 2025.**

Sarah veut faire un jeûne. Elle décide :
- **Durée du jeûne** : 7 jours (elle ne mangera RIEN pendant 7 jours)
- **Quand ?** : Elle veut commencer le 15 décembre 2025
- **Poids actuel** : 72 kg

**Question** : Que se passe-t-il entre aujourd'hui (15 nov) et le début du jeûne (15 déc) ?

**Réponse** : Elle doit **SE PRÉPARER** pendant 30 jours. C'est obligatoire.

---

## 📊 CHRONOLOGIE SIMPLE (VUE DE SARAH)

### 🔵 **ÉTAPE 1 : PRÉPARATION** (30 jours où Sarah mange encore)

**Du 15 novembre au 14 décembre 2025** = 30 jours

Sarah mange normalement MAIS elle doit respecter des critères progressifs :
- J-30 (15 nov) : Respecter les portions
- J-17 (28 nov) : Plus de féculents le soir
- J-14 (1er déc) : Plus de produits transformés ni sucreries
- J-7 (8 déc) : Plus de repas après 19h, etc.

**Ce que fait Sarah** : Elle saisit ses repas dans l'application chaque jour.

---

### 🟣 **ÉTAPE 2 : JEÛNE** (7 jours où Sarah NE MANGE RIEN)

**Du 15 décembre au 21 décembre 2025** = **7 JOURS SANS MANGER**

- **15 déc** : Sarah commence son jeûne. Elle ne mange RIEN. Elle boit de l'eau.
- **16 déc** : Jour 2 de jeûne. Elle ne mange toujours rien.
- **17 déc** : Jour 3 de jeûne.
- **18 déc** : Jour 4 de jeûne. L'app lui dit "Attention, dans 3 jours ton jeûne sera fini, il faut préparer ta reprise alimentaire"
- **19 déc** : Jour 5 de jeûne.
- **20 déc** : Jour 6 de jeûne.
- **21 déc** : Jour 7 de jeûne. **DERNIER JOUR SANS MANGER.**

**Ce que fait Sarah** : Elle valide chaque jour pour dire "Oui, aujourd'hui j'ai bien jeûné".

---

### 🟢 **ÉTAPE 3 : REPRISE ALIMENTAIRE** (14 jours où Sarah recommence à manger)

**Du 22 décembre 2025 au 4 janvier 2026** = **14 jours** (= 7 jours de jeûne × 2)

- **22 déc** : Sarah peut enfin remanger ! MAIS ATTENTION : seulement des liquides (bouillon, jus)
- **23 déc** : Toujours que des liquides
- **24 déc** : Elle peut ajouter des légumes cuits
- ... (progression douce sur 14 jours)
- **4 jan 2026** : Dernier jour de reprise. Elle peut manger normalement.

**Ce que fait Sarah** : Elle valide chaque jour pour dire "Oui, j'ai bien suivi le programme du jour".

---

## 🎯 RÉSUMÉ ULTRA SIMPLE

| Quand ? | Sarah fait quoi ? | Durée |
|---------|-------------------|-------|
| **15 nov → 14 déc** | Elle MANGE et se prépare | 30 jours |
| **15 déc → 21 déc** | Elle NE MANGE PAS (jeûne) | **7 jours** |
| **22 déc → 4 jan** | Elle REMANGE progressivement | 14 jours |

**TOTAL** : 30 + 7 + 14 = 51 jours du début à la fin.

**LA DURÉE DU JEÛNE** = **7 JOURS** (du 15 au 21 décembre, Sarah ne mange RIEN)

---

### 📅 **15 NOVEMBRE 2025 (J-30 de préparation)**

#### 🖥️ Écran : `/preparation-jeune.js`

Sarah arrive sur la page et voit :
```
🌙 Préparation à mon jeûne

🎯 Ton jeûne est prévu pour le : 15 décembre 2025
📆 Durée de préparation : 30 jours
📍 Tu es actuellement à : J-30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 : FONDATIONS (J-30 à J-18)
✅ Critère 1 : Respect strict des quantités à chaque repas (ACTIF)
🔒 Critère 2 : Supprimer féculents le soir (Débloqué à J-17)
🔒 Critère 3 : Action après repas (Débloqué à J-17)
```

#### 🍽️ Action : Sarah saisit son déjeuner

**Composant** : `SaisieDefiAlimentaire`

```javascript
// Sarah clique sur "Saisir un repas" → Modal s'ouvre

// Formulaire affiché :
Type de repas : [Déjeuner] ▼
Date : [15/11/2025]
Heure : [12:30]
Aliment : [Poulet grillé]
Catégorie : [protéine] (auto-détecté)
Quantité : [150g]
Kcal : [240] (auto-calculé)

☑️ Je confirme avoir respecté une seule portion

[Valider le repas]
```

#### ⚙️ Code exécuté :

```javascript
// 1. Recherche dans le référentiel
const found = referentielAliments.find(a => 
  a.nom.toLowerCase() === "poulet grillé".toLowerCase()
);
// Résultat : { nom: "Poulet grillé", portionMax: 200, kcal: 165, ... }

// 2. Vérification portion
const quantiteNum = 150; // Sarah a saisi 150g
const portionMax = 200;  // Le référentiel indique 200g max

if (quantiteNum <= portionMax) {
  // ✅ VALIDATION AUTOMATIQUE
  validerCriterePreparation('1', new Date().toISOString());
  
  // Message affiché :
  // "Bravo ! Repas enregistré et critère « Respect des quantités » validé."
}

// 3. Insertion en BDD
await supabase.from("repas_reels").insert([{
  user_id: "uuid-sarah",
  type: "Déjeuner",
  date: "2025-11-15",
  heure: "12:30",
  aliment: "Poulet grillé",
  categorie: "protéine",
  quantite: 150,
  kcal: 240,
  est_extra: false
}]);

// 4. Stockage localStorage
localStorage.setItem('preparationJeuneCriteres', JSON.stringify({
  "1": {
    validé: true,
    dateValidation: "2025-11-15T12:35:00.000Z"
  }
}));
```

#### 📊 Résultat visuel :

```
PHASE 1 : FONDATIONS (J-30 à J-18)
✅ Critère 1 : Respect strict des quantités (VALIDÉ le 15/11) ✨
🔒 Critère 2 : Supprimer féculents le soir (Débloqué à J-17)

Progression : 1/9 critères validés (11%)
```

---

### 📅 **28 NOVEMBRE 2025 (J-17 de préparation)**

Sarah continue de saisir ses repas. Elle arrive à J-17, de nouveaux critères se débloquent :

```
PHASE 1 : FONDATIONS (J-30 à J-18)
✅ Critère 1 : Respect quantités (VALIDÉ ✓)
✅ Critère 2 : Supprimer féculents le soir (ACTIF - À valider)
✅ Critère 3 : Action après repas (ACTIF - À valider)

Progression : 1/9 critères validés (11%)
```

---

### 📅 **14 DÉCEMBRE 2025 (J-0 de préparation = veille du jeûne)**

Sarah a maintenant validé tous ses critères de préparation. Elle est prête pour demain.

```
PRÉPARATION TERMINÉE ✅

9/9 critères validés :
✅ Respect des quantités
✅ Suppression féculents le soir
✅ Action après repas
✅ Éliminer produits transformés
✅ Éliminer sucreries
✅ 2 jours de jeûne plein
✅ 2 litres d'eau par jour
✅ Pas de repas après 19h
✅ Plage alimentaire 45 min

Tu es prêt(e) à commencer ton jeûne demain ! 🌙
```

---

### 📅 **15 DÉCEMBRE 2025 (Jour 1 du jeûne de 7 jours)**

#### 🖥️ Écran : `/jeune.js`

Sarah a validé ses 9 critères. Elle démarre son jeûne :

```javascript
// État initial
const [dureeJeune, setDureeJeune] = useState(7);
const [joursValides, setJoursValides] = useState([]);
const [jourEnCours, setJourEnCours] = useState(1);

// Affichage
```

**Interface :**
```
🌙 Mon jeûne en cours

📆 Jour 1 / 7 – Jour 1 – Lancement du jeûne

🧠 Esprit : Tu entres dans la phase de rupture...
🧬 Corps : La glycémie baisse doucement...
❤️ Synthèse émotionnelle : C'est le début d'un reset...

⚖️ Poids de départ : 72 kg
🍽️ Dernier repas analysé : [Aliment de la veille]

[Valider ce jour] ← Sarah clique
```

```javascript
// Code exécuté
const validerJour = (jour) => {
  const nouveaux = [...joursValides, jour]; // [1]
  setJoursValides(nouveaux);
  localStorage.setItem('joursValides', JSON.stringify(nouveaux));
};
```

---

### 📅 **18 DÉCEMBRE 2025 (Jour 4 du jeûne = J-3 avant la fin)**

⚠️ **CLARIFICATION** : "J-3" signifie "3 jours avant la FIN du jeûne", pas "jour 3 du jeûne".

- Jeûne prévu : 7 jours (15 déc → 21 déc)
- Aujourd'hui : 18 déc = Jour 4
- Reste : 3 jours (19, 20, 21 déc)
- **C'est le moment de préparer la reprise !**

```javascript
// Calcul automatique
const jourEnCours = 4;
const dureeJeune = 7;
const showReprise = jourEnCours >= Math.max(4, Math.ceil(dureeJeune / 2));
// → showReprise = true (car 4 >= 4)
```

**Interface :**
```
🌙 Mon jeûne en cours

📆 Jour 4 / 7 – Brûle le gras profond

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ALERTE : Tu es à J-3 de la fin de ton jeûne !

Tu dois MAINTENANT préparer ta sortie de jeûne pour éviter 
le syndrome de réalimentation.

[Générer mon programme de reprise] ← Sarah clique
```

#### ⚙️ Code exécuté :

```javascript
// Fonction appelée
const genererProgrammeRepriseManuel = async () => {
  setLoadingProgramme(true);
  
  // 1. Récupération des données
  const jeuneData = {
    id: "uuid-jeune-sarah",
    duree_jours: 7,
    date_debut: "2025-12-15",
    date_fin: "2025-12-21",
    poids_depart: 72,
    // ⚠️ poids_fin_jeune pas encore connu (elle est encore en jeûne)
    message_personnel: localStorage.getItem('messagePersoJeune') || ""
  };
  
  // 2. Génération du programme
  const programme = genererProgrammeReprise({
    dureeJeune: 7,
    poidsDepart: 72,
    dateFin: "2025-12-21"
  });
  
  // Résultat :
  // {
  //   duree_reprise_jours: 14, // 7 × 2
  //   date_debut_reprise: "2025-12-22",
  //   date_fin_reprise: "2026-01-04",
  //   phases: { phase1: {...}, phase2: {...}, ... }
  // }
  
  // 3. Sauvegarde en Supabase
  const { data } = await supabase
    .from('reprises_alimentaires')
    .insert([{
      user_id: "uuid-sarah",
      jeune_id: "uuid-jeune-sarah",
      duree_jeune_jours: 7,
      poids_depart: 72,
      poids_fin_jeune: null, // ⚠️ Pas encore renseigné
      date_debut_jeune: "2025-12-15",
      date_fin_jeune: "2025-12-21",
      message_personnel: "Je veux me reconnecter à mon corps",
      duree_reprise_jours: 14,
      date_debut_reprise: "2025-12-22",
      date_fin_reprise: "2026-01-04",
      phases: {...},
      liste_courses: [...],
      statut: 'proposition' // ⚠️ Pas encore validé
    }])
    .select()
    .single();
  
  // 4. Insertion des 14 jours détaillés
  await supabase.from('reprises_jours_valides').insert([
    { reprise_id: data.id, jour_numero: 1, date: "2025-12-22", phase: 1, valide: false },
    { reprise_id: data.id, jour_numero: 2, date: "2025-12-23", phase: 1, valide: false },
    // ... 14 lignes au total
  ]);
  
  setProgrammeReprise(data);
  setLoadingProgramme(false);
};
```

**Interface après génération :**
```
✅ Programme généré !

Programme créé :
• 14 jours de reprise
• Du 22/12/2025 au 04/01/2026

[👀 Visualiser le plan] ← Redirige vers /validation-plan-reprise
```

---

### 📅 **18 DÉCEMBRE 2025 (suite) : Sarah valide le plan de reprise**

#### 🖥️ Écran : `/validation-plan-reprise.js`

```
📋 Validation de ton plan de reprise

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RÉSUMÉ DE TON PLAN

Durée de reprise : 14 jours
Date début : 22 décembre 2025
Date fin : 4 janvier 2026

PHASE 1 : LIQUIDES (J1-J2) 💧
• Bouillon de légumes clair
• Jus de légumes filtré
• Eau citronnée

[Voir tous les détails] ▼

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENGAGEMENT REQUIS

☑️ J'ai lu et compris le plan de reprise progressive
☑️ Je m'engage à suivre rigoureusement ce plan

[Valider mon engagement] ← Sarah coche et clique
```

#### ⚙️ Code exécuté :

```javascript
const handleValider = async () => {
  // 1. Sauvegarde localStorage
  localStorage.setItem('programmeRepriseValide', JSON.stringify(programme));
  
  // 2. Mise à jour Supabase
  await supabase
    .from('reprises_alimentaires')
    .update({
      statut: 'plan_valide', // ✅ Changement
      plan_valide_le: "2025-12-18T15:30:00.000Z"
    })
    .eq('id', programme.id);
  
  // 3. Redirection
  router.push('/jeune'); // Retour à la page jeûne
};
```

---

### 📅 **21 DÉCEMBRE 2025 (Jour 7 du jeûne = DERNIER JOUR)**

```
🌙 Mon jeûne en cours

📆 Jour 7 / 7 – Autophagie maximale & reset

⚖️ Poids de départ : 72 kg

[Valider ce jour] ← Sarah clique (dernier jour)
```

#### ⚙️ Code exécuté :

```javascript
const validerJour = (jour) => {
  const nouveaux = [...joursValides, 7]; // [1,2,3,4,5,6,7]
  setJoursValides(nouveaux);
};

// Détection automatique
const isFini = joursValides.length >= dureeJeune; // 7 >= 7 → true

// useEffect déclenché
useEffect(() => {
  if (isFini && programmeReprise) {
    // ⚠️ PROBLÈME : poids_fin_jeune pas sauvegardé !
    
    localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeReprise));
    
    // Redirection automatique
    window.location.href = '/reprise-alimentaire-apres-jeune';
  }
}, [isFini, programmeReprise]);
```

**Résultat** : Sarah est automatiquement redirigée vers `/reprise-alimentaire-apres-jeune`.

---

### 📅 **22 DÉCEMBRE 2025 (Jour 1 de la reprise alimentaire sur 14 jours)**

#### 🖥️ Écran : `/reprise-alimentaire-apres-jeune.js`

```javascript
// Chargement des données
const { data: programmeData } = await supabase
  .from('reprises_alimentaires')
  .select('*')
  .eq('user_id', 'uuid-sarah')
  .in('statut', ['plan_valide', 'en_cours'])
  .single();

// Résultat :
// {
//   id: "uuid-prog",
//   poids_depart: 72,
//   poids_fin_jeune: null, ← ⚠️ VIDE !
//   message_personnel: "Je veux me reconnecter à mon corps",
//   duree_reprise_jours: 14,
//   statut: "plan_valide"
// }
```

**Interface :**
```
🌙 Reprise alimentaire après jeûne

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌙 Contexte de ton jeûne
"Je veux me reconnecter à mon corps"

Durée du jeûne : 7 jours
Poids fin jeûne : [Aucun] ← ⚠️ PROBLÈME
Fin du jeûne : 21 déc
Durée reprise : 14 jours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 JOUR 1 / 14 – PHASE 1 : LIQUIDES

Date : 22 décembre 2025

Aliments autorisés :
• Bouillon de légumes clair (200ml)
• Jus de légumes filtré (150ml)
• Eau citronnée

[✅ Valider ce jour] ← Sarah clique
```

#### ⚙️ Code de validation :

```javascript
const validerJour = async (jourData) => {
  // Vérification date
  const dateJour = new Date("2025-12-22");
  const aujourdhui = new Date(); // 2025-12-22
  
  if (dateJour > aujourdhui) {
    alert("Ce jour n'est pas encore accessible !");
    return; // Ne s'exécute pas
  }
  
  // Mise à jour
  await supabase
    .from('reprises_jours_valides')
    .update({
      valide: true,
      valide_le: "2025-12-22T19:00:00.000Z"
    })
    .eq('reprise_id', programme.id)
    .eq('jour_numero', 1);
  
  // Rafraîchir
  chargerProgramme();
};
```

**Interface après validation :**
```
📍 JOUR 1 / 14 – PHASE 1 : LIQUIDES
✅ Validé le 22/12/2025 à 19:00

[Jour suivant →]
```

---

### 📅 **4 JANVIER 2026 (Jour 14 de la reprise = DERNIER JOUR)**

Sarah valide le jour 14 :

```javascript
// Vérification si dernier jour
if (jourData.jour_numero === programme.duree_reprise_jours) {
  // 🎉 REPRISE TERMINÉE !
  await supabase
    .from('reprises_alimentaires')
    .update({
      statut: 'termine',
      reprise_terminee_le: "2026-01-04T20:00:00.000Z"
    })
    .eq('id', programme.id);
}
```

**Interface :**
```
🎉 Félicitations !

Tu as terminé ta reprise alimentaire de 14 jours !

✅ Durée du jeûne : 7 jours
✅ Poids en fin de jeûne : [Aucun] ← ⚠️ Toujours vide
✅ Date de fin : 4 janvier 2026

🚀 Commencer ma phase de consolidation (45 jours)
```

---

## 🔴 **RÉSUMÉ DES PROBLÈMES CONCRETS**

1. **`poids_fin_jeune` jamais sauvegardé** → Affichage vide dans l'interface
2. **Critères de préparation perdus** si Sarah change de device (localStorage)
3. **Pas de lien** entre la préparation et le jeûne dans la BDD

---

**Date de création** : 2 décembre 2025  
**Dernière mise à jour** : 2 décembre 2025 (ajout exemple concret Sarah)  
**Statut** : Documentation technique complète avec exemple réel ✅

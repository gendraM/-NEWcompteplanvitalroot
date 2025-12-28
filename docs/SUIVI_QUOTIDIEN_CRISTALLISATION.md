# 📅 SUIVI QUOTIDIEN : PHASE CRISTALLISATION (45 JOURS)

**Date** : 26 décembre 2025  
**Objectif** : Définir l'accompagnement quotidien actif pendant la cristallisation

---

## 🎯 VISION GLOBALE

### **2 PAGES SÉPARÉES**

```
┌─────────────────────────────────────────────────────────┐
│  PAGE 1 : VUE D'ENSEMBLE (Dashboard)                   │
│  Fichier : /pages/cristallisation.js                   │
│  Usage : Voir progression globale, stats, défis        │
│  Affichage : Bilan + Stats + Semaines                  │
└─────────────────────────────────────────────────────────┘
               ↓ Bouton "Mon suivi quotidien"
┌─────────────────────────────────────────────────────────┐
│  PAGE 2 : SUIVI QUOTIDIEN (Détaillé)                   │
│  Fichier : /pages/cristallisation-quotidien.js         │
│  Usage : Valider critères jour par jour + saisir repas │
│  Affichage : Timeline + Critères + Feedback            │
└─────────────────────────────────────────────────────────┘
```

### **NAVIGATION ENTRE LES 2 PAGES**

```javascript
// PAGE 1 (/cristallisation.js)
<button onClick={() => router.push('/cristallisation-quotidien')}>
  📅 Mon suivi quotidien
</button>

// PAGE 2 (/cristallisation-quotidien.js)
<button onClick={() => router.push('/cristallisation')}>
  ← Retour vue d'ensemble
</button>
```

---

## 📱 PAGE 1 : `/cristallisation.js` (Vue d'ensemble)

**Contenu** : Voir [VISION_CRISTALLISATION_VISUELLE.md](./VISION_CRISTALLISATION_VISUELLE.md)

### **BANDEAU + BOUTON ACCÈS PAGE 2**

```
┌─────────────────────────────────────────────────────────┐
│  🏔️ CRISTALLISATION - Jour 5/45                        │
│  Semaine 1 • Du 09/12/2025 au 22/01/2026               │
│  ▓▓▓░░░░░░░░░░░░░░░░░░░░░░  11% complété               │
│                                                         │
│  [📅 Mon suivi quotidien →]                            │
└─────────────────────────────────────────────────────────┘

// Affichage ensuite : Dashboard global
// (Voir VISION_CRISTALLISATION_VISUELLE.md)
```

---

## 📱 PAGE 2 : `/cristallisation-quotidien.js` (Détaillé)

### **BANDEAU SUPÉRIEUR**

```
┌─────────────────────────────────────────────────────────┐
│  ← Vue d'ensemble                                       │
│                                                         │
│  🏔️ CRISTALLISATION - Jour 5/45                        │
│  Jeudi 13 décembre 2025                                │
└─────────────────────────────────────────────────────────┘
```

---

### **VUE JOUR PAR JOUR (Timeline interactive)**

```
┌─────────────────────────────────────────────────────────┐
│  📅 MON SUIVI QUOTIDIEN                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ◀ Jour 4     [JOUR 5 - Jeudi 13/12]     Jour 6 ▶     │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  📋 CRITÈRES DU JOUR (5 à valider)                      │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ ✅ Respect des quantités                      │     │
│  │ Validé : ✔️ 14:32                             │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ ⬜ Pas de féculents après 19h                 │     │
│  │ À valider ce soir                             │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ ⬜ Score QN ≥ 3 pour tous les repas           │     │
│  │ En cours : 2/3 repas validés                  │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ ⬜ Aucun extra aujourd'hui                    │     │
│  │ À valider en fin de journée                   │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ ⬜ Pratique spirituelle du jour               │     │
│  │ Suggéré : 5 min méditation                   │     │
│  │ [🎙️ Accéder au journal]                      │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  🍽️ MES REPAS DU JOUR                                  │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ Petit-déjeuner (8h30)                         │     │
│  │ • Yaourt 0% (150g) - QN: 4/5 ✅               │     │
│  │ • Fruits rouges (100g) - QN: 4/5 ✅           │     │
│  │ Total : 180 kcal                              │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ Déjeuner (12h45)                              │     │
│  │ • Saumon (150g) - QN: 4/5 ✅                  │     │
│  │ • Brocolis (200g) - QN: 5/5 ✅                │     │
│  │ Total : 380 kcal                              │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ ➕ Ajouter mon dîner                          │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  💪 DÉFIS EN COURS                                      │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ 🍎 Pas de dessert par automatisme             │     │
│  │ Progression : ▓▓▓▓░░░░░░  2/5 jours          │     │
│  │ [✅ Valider aujourd'hui]                      │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  💬 FEEDBACK DU JOUR                                    │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ 🟢 Excellente journée !                       │     │
│  │                                               │     │
│  │ ✅ 4/5 critères validés                       │     │
│  │ ✅ Score QN : 4.3/5                           │     │
│  │ ✅ Poids stable                               │     │
│  │                                               │     │
│  │ 💡 Conseil pour demain :                      │     │
│  │ "Continue sur cette lancée. Pense à ta        │     │
│  │  pratique spirituelle du matin."              │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  [✔️ VALIDER CETTE JOURNÉE]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 CRITÈRES DE VALIDATION QUOTIDIENS

### **5 CRITÈRES OBLIGATOIRES (Inspirés de la reprise + nouveaux)**

| # | Critère | Comment valider | Auto-validé ? |
|---|---------|----------------|---------------|
| **1** | Respect des quantités | Au moins 3 repas conformes (portions OK) | ✅ Oui (via repas_reels) |
| **2** | Pas de féculents après 19h | Aucun féculent saisi après 19h | ✅ Oui (via heure + catégorie) |
| **3** | Score QN ≥ 3 pour tous repas | Tous les repas du jour QN ≥ 3 | ✅ Oui (via champ qn) |
| **4** | Aucun extra aujourd'hui | 0 repas avec `est_extra = true` | ✅ Oui (via champ est_extra) |
| **5** | Pratique spirituelle | Au moins 1 entrée dans journal_spirituel_* | ✅ Oui (via tables spirituel) |

### **CRITÈRES HEBDOMADAIRES (Bonus)**

| Critère | Fréquence | Validation |
|---------|-----------|------------|
| **Jeûne ponctuel** | 1x/semaine | Au moins 1 jeûne déclaré dans la semaine |
| **Poids stable** | 1x/semaine | Pesée hebdomadaire + delta < 1kg |
| **Score QN moyen ≥ 3.5** | 1x/semaine | Moyenne des 7 derniers jours |

---

## 🔄 WORKFLOW QUOTIDIEN

### **1️⃣ DÉBUT DE JOURNÉE (8h-10h)**

```
L'utilisateur ouvre la page
             ↓
Affichage jour courant (ex: Jour 5/45)
             ↓
Critères du jour affichés :
• ✅ 1 validé (hier soir)
• ⬜ 4 en attente
             ↓
Message d'encouragement :
"Bonjour ! Aujourd'hui, focus sur la qualité de tes repas."
             ↓
Suggestion spirituelle :
"🎙️ Commence par 5 min de méditation"
```

---

### **2️⃣ PENDANT LA JOURNÉE (Saisie repas)**

```
Utilisateur saisit un repas
             ↓
Système analyse :
• Catégorie aliment
• Heure de saisie
• QN de l'aliment
• Quantité vs portion max
• Si extra ou non
             ↓
Validation critères automatique :
┌─────────────────────────────┐
│ Repas enregistré ✅         │
│                             │
│ Critères mis à jour :       │
│ ✅ Quantités : OK           │
│ ✅ QN : 4/5 (excellent)     │
│ ⏳ Féculents soir : à venir │
└─────────────────────────────┘
             ↓
Compteur critères du jour : 2/5 ✅
```

---

### **3️⃣ FIN DE JOURNÉE (21h-23h)**

```
Utilisateur revient sur la page
             ↓
Système calcule le bilan du jour :
• 4/4 repas saisis ✅
• 4/5 critères validés ✅
• 1 critère manquant : Pratique spirituelle ⚠️
             ↓
Affichage feedback :
┌─────────────────────────────────────┐
│ 🟡 Très bonne journée !             │
│                                     │
│ ✅ 4/5 critères validés             │
│ ⚠️ Manquant : Pratique spirituelle │
│                                     │
│ 💡 Astuce :                         │
│ "Prends 2 minutes avant de dormir  │
│  pour écrire une intention."       │
│                                     │
│ [✔️ Valider quand même]            │
│ [🎙️ Ajouter une pratique]         │
└─────────────────────────────────────┘
```

---

### **4️⃣ VALIDATION DE LA JOURNÉE**

```
Utilisateur clique "Valider cette journée"
             ↓
Système enregistre :
• Date validée
• Score critères : 4/5 (80%)
• Score QN moyen : 4.2/5
• Défis progressés : +1 jour
             ↓
Stockage :
localStorage : joursValidesCristallisation = [1,2,3,4,5]
             ↓
Passage automatique au jour suivant :
"✅ Jour 5 validé ! Rendez-vous demain pour le Jour 6."
```

---

## 🧠 SYSTÈME DE GUIDAGE INTELLIGENT

### **ANALYSE DES DONNÉES COLLECTÉES**

Le système analyse **en temps réel** :

#### **A. Historique repas (table repas_reels)**
```sql
SELECT 
  categorie,
  qn,
  heure,
  est_extra,
  note,
  ressenti
FROM repas_reels
WHERE date >= date_debut_cristallisation
ORDER BY date DESC
```

#### **B. Patterns détectés → Actions**

| Pattern détecté | Guidage automatique |
|-----------------|---------------------|
| **3 jours sans féculents soir** | ✅ "Continue ! Ton corps digère mieux le soir." |
| **2 extras en 3 jours** | ⚠️ "Attention, tes anciens réflexes reviennent. Active le défi '3 jours sans extra'." |
| **QN moyen < 3 cette semaine** | 🔴 "Trop d'aliments transformés. Focus légumes + protéines maigres." |
| **5 jours sans pratique spirituelle** | 💡 "Le volet spirituel aide à ancrer. Prends 5 min aujourd'hui." |
| **Poids +1.5kg en 2 semaines** | 🟠 "Ton poids augmente. Recommandation : 1 jeûne 24h cette semaine." |
| **7 jours validés d'affilée** | 🏆 "Série de 7 jours ! Tu ancres parfaitement." |

---

### **MESSAGES CONTEXTUELS**

#### **Matin (8h-12h)**
```
"Bonjour ! Aujourd'hui c'est le Jour 12.
Tu es en Semaine 2 : Jeûnes hebdomadaires.

💪 Hier : 5/5 critères validés ✅
🎯 Aujourd'hui : Focus sur la qualité (QN ≥ 3)

💡 Suggestion : Planifie ton jeûne 24h pour lundi prochain."
```

#### **Midi (12h-14h)**
```
"Déjeuner saisi ✅

Score du repas : 🟢 4.5/5 (Excellent)
Critères validés : 2/5

⚠️ Attention : Tu n'as pas pris de petit-déjeuner.
Pense à maintenir 3-4 repas/jour."
```

#### **Soir (19h-22h)**
```
"Il est 19h30. Rappel :
⚠️ Pas de féculents après 19h

Suggestions dîner :
• Poisson + légumes vapeur
• Salade composée + œuf dur
• Soupe maison + protéine"
```

#### **Fin de journée (22h-23h)**
```
"Bilan du Jour 12 :

✅ 4/5 critères validés (80%)
✅ Score QN : 4.1/5
⚠️ Manquant : Pratique spirituelle

📊 Semaine en cours : 6/7 jours validés

💡 Conseil demain :
'Prends 5 min le matin pour méditer.'"
```

---

## 📊 FEEDBACK HEBDOMADAIRE (Dimanche soir)

### **Bilan de la semaine**

```
┌─────────────────────────────────────────────────────────┐
│  📊 BILAN SEMAINE 2                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🗓️ Du 16/12 au 22/12 (Jours 8-14)                    │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  📈 PROGRESSION                                         │
│                                                         │
│  Jours validés : ▓▓▓▓▓▓░  6/7 (86%)                   │
│  Score moyen critères : 4.3/5 (86%)                    │
│  Score QN moyen : 🟢 4.1/5 (Excellent)                 │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  ✅ TES RÉUSSITES                                       │
│                                                         │
│  • 6 jours sans extras                                 │
│  • 5 jours sans féculents après 19h                    │
│  • 1 jeûne intermittent réalisé                        │
│  • 4 pratiques spirituelles                            │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  ⚠️ POINTS D'ATTENTION                                  │
│                                                         │
│  • Jeudi : 1 extra (gâteau)                            │
│  • Dimanche : Aucune pratique spirituelle              │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  ⚖️ SUIVI POIDS                                         │
│                                                         │
│  Début semaine : 76.5 kg                               │
│  Fin semaine : 76.7 kg                                 │
│  Évolution : +0.2 kg                                   │
│                                                         │
│  🟡 Léger gain, mais stable. Continue tes efforts.     │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  🎯 OBJECTIF SEMAINE 3                                  │
│                                                         │
│  • Réaliser 1 jeûne 24h (lundi recommandé)             │
│  • Maintenir score QN ≥ 4                              │
│  • Pratique spirituelle quotidienne                    │
│                                                         │
│  💪 Tu progresses bien ! Continue l'ancrage.           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPOSANTS RÉUTILISABLES

### **De la reprise alimentaire :**
- ✅ `SaisieRepriseJeune` → Adapter pour cristallisation
- ✅ Timeline jour par jour
- ✅ Validation critères automatique
- ✅ Feedback visuel (badges, couleurs)

### **De la préparation jeûne :**
- ✅ Système de critères progressifs
- ✅ PhaseCard (adapter pour semaines)
- ✅ ProAGE 1 : `/pages/cristallisation.js` (Dashboard)**

```javascript
// États principaux
const [programmeCristallisation, setProgramme] = useState(null);
const [statsGlobales, setStatsGlobales] = useState({});
const [defisActifs, setDefisActifs] = useState([]);

// Navigation vers page 2
const allerAuSuiviQuotidien = () => {
  router.push('/cristallisation-quotidien');
};

return (
  <>
    <BandeauCristallisation programme={programmeCristallisation} />
    
    <button onClick={allerAuSuiviQuotidien}>
      📅 Mon suivi quotidien
    </button>
    
    <DashboardGlobal 
      programme={programmeCristallisation}
      stats={statsGlobales}
      defis={defisActifs}
    />
  </>
);
```

---

### **PAGE 2 : `/pages/cristallisation-quotidien.js` (Détaillé)**

```javascript
// États principaux
const [jourCourant, setJourCourant] = useState(null); // Auto-calculé
const [joursValides, setJoursValides] = useState([]);
const [criteresDuJour, setCriteresDuJour] = useState([]);
const [repasDuJour, setRepasDuJour] = useState([]);
const [defisActifs, setDefisActifs] = useState([]);

// Chargement automatique du jour actuel
useEffect(() => {
  const dateDebut = localStorage.getItem('dateDebutCristallisation');
  const jourActuel = calculerJourCourant(dateDebut); // Ex: 5
  setJourCourant(jourActuel);
  chargerDonneesJour(jourActuel);
}, []);

// Navigation vers page 1
const retourVueEnsemble = () => {
  router.push('/cristallisation');
};

return (
  <>
    <button onClick={retourVueEnsemble}>
      ← Retour vue d'ensemble
    </button>
    
    <BandeauJourCourant jour={jourCourant} />
    
    <NavigationJours 
      jour={jourCourant} 
      onChange={setJourCourant} 
    />
    
    <SectionCriteres 
      criteres={criteresDuJour}
      onValidationAuto={handleValidationAuto}
    />
    
    <SectionRepas 
      repas={repasDuJour}
      onAjoutRepas={handleAjoutRepas}
    />
    
    <SectionDefis 
      defis={defisActifs}
      onProgression={handleProgressionDefi}
    />
    
✅ **OUI** - **2 PAGES SÉPARÉES** :
- 📊 **`/cristallisation.js`** : Vue d'ensemble (dashboard global)
- 📅 **`/cristallisation-quotidien.js`** : Vue détaillée (suivi jour par jour
    />
    
    <ButtonValiderJournee 
      onClick={handleValiderJournee}
      disabled={!peutValider()}
    />
  </>
);  Séparation claire** | Dashboard vs Suivi détaillé (pas de surcharge cognitive) |
| **Cohérence UX** | Même logique que reprise (l'utilisateur connaît déjà) |
| **Réutilisation code** | 70% des composants déjà existants |
| **Guidage intelligent** | Conseils basés sur données réelles |
| **Progression visible** | Timeline + validation jour par jour |
| **Navigation fluide** | Boutons clairs entre les 2 pag
      <ButtonValiderJournee 
        onClick={handleValiderJournee}
        disabled={!peutValider()}
      />
    </>s 2 pages séparées, dis-moi :**

1. ✅ L'architecture 2 pages séparées est OK maintenant ?
2. ✅ Les 5 critères quotidiens te conviennent ?
3. ✅ Le système de guidage intelligent te semble pertinent
---

---

## ⚡ DYNAMISME EN TEMPS RÉEL

### **1. VALIDATION AUTO DES CRITÈRES**

**Principe** : Dès qu'un repas est saisi, le système recalcule INSTANTANÉMENT les critères.

```javascript
// Après chaque saisie de repas
const handleAjoutRepas = async (nouveauRepas) => {
  // 1. Enregistrer le repas
  await sauvegarderRepas(nouveauRepas);
  
  // 2. Recharger repas du jour
  const repasDuJour = await getRepasDuJour(dateAujourdhui);
  
  // 3. VALIDATION AUTO IMMÉDIATE
  const criteresMAJ = validerCriteresEnTempsReel(repasDuJour);
  
  // 4. Update UI avec animation
  setCriteresDuJour(criteresMAJ); // ✅ Critère passe en vert
  
  // 5. Afficher toast notification
  if (criteresMAJ.nouveauCritereValide) {
    showToast(`✅ Critère validé : ${criteresMAJ.nom}`);
  }
};
```

---

### **2. ANIMATIONS VISUELLES**

#### **Validation d'un critère**

```
┌───────────────────────────────────────────────┐
│ ⬜ Respect des quantités                      │
│ En attente...                                 │
└───────────────────────────────────────────────┘
            ↓ Utilisateur saisit un repas conforme
┌───────────────────────────────────────────────┐
│ ✅ Respect des quantités                      │  ← Animation "pulse green"
│ Validé : ✔️ 14:32                             │
└───────────────────────────────────────────────┘
```

**CSS Animation** :
```css
@keyframes pulseGreen {
  0% { background: white; }
  50% { background: #4caf50; }
  100% { background: white; }
}

.critere-valide {
  animation: pulseGreen 0.8s ease-in-out;
}
```

#### **Progression des critères**

```
┌─────────────────────────────────────────────────────────┐
│  📋 CRITÈRES DU JOUR                                    │
│                                                         │
│  ▓▓▓▓░░░░░░  3/5 validés (60%)                         │  ← Barre animée
│                                                         │
│  ✅ Respect des quantités                              │
│  ✅ Score QN ≥ 3                                        │
│  ✅ Pratique spirituelle                               │
│  ⬜ Pas de féculents après 19h (19h30 - à venir)      │
│  ⬜ Aucun extra                                         │
└─────────────────────────────────────────────────────────┘
```

---

### **3. NOTIFICATIONS CONTEXTUELLES**

#### **Toast notifications (en bas à droite)**

```
┌────────────────────────────────┐
│  ✅ Repas enregistré            │
│  Critère "Score QN" validé !   │
│  3/5 critères OK aujourd'hui   │
└────────────────────────────────┘
```

#### **Alertes en temps réel**

```
// Si saisie féculent après 19h
┌─────────────────────────────────────────────────────────┐
│  ⚠️ ATTENTION                                           │
│                                                         │
│  Tu saisis un féculent après 19h.                      │
│  Cela invalidera le critère "Pas de féculents soir".   │
│                                                         │
│  [Continuer quand même] [Choisir autre aliment]        │
└─────────────────────────────────────────────────────────┘
```

---

### **4. COMPTEURS DYNAMIQUES**

```
┌─────────────────────────────────────────────────────────┐
│  📊 ÉTAT ACTUEL                                         │
│                                                         │
│  Repas du jour : 2/3 🍽️                                │
│  Score QN moyen : 4.2/5 🟢                             │
│  Extras : 0 ✅                                          │
│  Féculents après 19h : 0 ✅                            │
│                                                         │
│  💪 Prochain objectif : Dîner conforme                  │
└─────────────────────────────────────────────────────────┘
```

Ces compteurs se mettent à jour **instantanément** après chaque saisie.

---

### **5. FEEDBACK PRÉDICTIF**

**Avant validation de la journée**, le système anticipe :

```
┌─────────────────────────────────────────────────────────┐
│  💬 PRÉVISION FIN DE JOURNÉE                            │
│                                                         │
│  🟢 Si tu dînes sans extra et sans féculent :           │
│     → 5/5 critères validés                             │
│     → Journée PARFAITE                                 │
│                                                         │
│  🟡 Si tu ajoutes un dessert :                          │
│     → 4/5 critères validés                             │
│     → Bonne journée mais perfectible                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🍽️ INTÉGRATION PAGE SAISIE REPAS

### **CONTEXTE : Détection phase cristallisation**

```javascript
// Dans /pages/saisie-repas.js (ou équivalent)
const [phaseCourante, setPhaseCourante] = useState(null);

useEffect(() => {
  // Détection automatique de la phase
  const dateDebutCristal = localStorage.getItem('dateDebutCristallisation');
  const dateFinCristal = localStorage.getItem('dateFinCristallisation');
  const aujourdhui = new Date();
  
  if (dateDebutCristal && dateFinCristal) {
    if (aujourdhui >= dateDebutCristal && aujourdhui <= dateFinCristal) {
      setPhaseCourante('cristallisation');
    }
  }
}, []);
```

---

### **BANDEAU CONTEXTUEL PENDANT LA SAISIE**

#### **Si phase = cristallisation**

```
┌─────────────────────────────────────────────────────────┐
│  🍽️ SAISIE REPAS                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🏔️ CRISTALLISATION - Jour 5/45                        │
│  Critères du jour : 3/5 validés                        │
│  [Voir mes critères]                                   │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  📅 Déjeuner - 13:45                                   │
│                                                         │
│  [Choisir un aliment]                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### **ALERTES DYNAMIQUES PENDANT LA SAISIE**

#### **Scénario 1 : Saisie féculent après 19h**

```
┌─────────────────────────────────────────────────────────┐
│  🍽️ Dîner - 20:15                                      │
│                                                         │
│  Aliment sélectionné : Riz blanc (200g)                │
│                                                         │
│  ⚠️ ALERTE CRISTALLISATION                              │
│  ┌─────────────────────────────────────────────┐       │
│  │ ⚠️ Féculents après 19h                      │       │
│  │                                             │       │
│  │ Cet aliment invalidera le critère          │       │
│  │ "Pas de féculents après 19h".              │       │
│  │                                             │       │
│  │ Alternatives suggérées :                   │       │
│  │ • Légumes vapeur                           │       │
│  │ • Poisson grillé                           │       │
│  │ • Salade verte                             │       │
│  │                                             │       │
│  │ [🔄 Changer aliment] [Continuer quand même]│       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

#### **Scénario 2 : Saisie extra**

```
┌─────────────────────────────────────────────────────────┐
│  Aliment sélectionné : Gâteau chocolat (150g)          │
│                                                         │
│  ⚠️ ALERTE CRISTALLISATION                              │
│  ┌─────────────────────────────────────────────┐       │
│  │ 🚨 Extra détecté                            │       │
│  │                                             │       │
│  │ Cet aliment invalidera le critère          │       │
│  │ "Aucun extra aujourd'hui".                 │       │
│  │                                             │       │
│  │ ⚠️ Tu as actuellement 0 extra cette semaine│       │
│  │    Continue tes efforts !                  │       │
│  │                                             │       │
│  │ Suggestion :                               │       │
│  │ "Et si tu remplaçais par 2 carrés de       │       │
│  │  chocolat noir (20g) ?"                    │       │
│  │                                             │       │
│  │ [🔄 Choisir autre chose] [Je valide quand  │       │
│  │                           même]             │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

#### **Scénario 3 : Score QN faible**

```
┌─────────────────────────────────────────────────────────┐
│  Aliment sélectionné : Pain blanc (100g)               │
│  Score QN : 2/5 🟡                                      │
│                                                         │
│  💡 CONSEIL CRISTALLISATION                             │
│  ┌─────────────────────────────────────────────┐       │
│  │ ℹ️ QN moyen du jour : 3.8/5                 │       │
│  │                                             │       │
│  │ Ce repas fera baisser ton score.           │       │
│  │ Objectif : maintenir QN ≥ 3                │       │
│  │                                             │       │
│  │ 💡 Meilleur choix :                         │       │
│  │ Pain complet (QN 3/5) ou pain aux céréales │       │
│  │                                             │       │
│  │ [🔄 Modifier] [Continuer]                  │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

#### **Scénario 4 : Quantité excessive**

```
┌─────────────────────────────────────────────────────────┐
│  Aliment : Pâtes (350g)                                │
│  ⚠️ Portion supérieure à la référence (250g max)       │
│                                                         │
│  💡 CONSEIL CRISTALLISATION                             │
│  ┌─────────────────────────────────────────────┐       │
│  │ ⚠️ Quantité excessive                       │       │
│  │                                             │       │
│  │ Référence féculent : 200-250g              │       │
│  │ Tu saisis : 350g (+40%)                    │       │
│  │                                             │       │
│  │ Cela invalidera le critère                 │       │
│  │ "Respect des quantités".                   │       │
│  │                                             │       │
│  │ Suggestion : Réduis à 250g et ajoute       │       │
│  │ des légumes pour la satiété.               │       │
│  │                                             │       │
│  │ [✏️ Modifier quantité] [Valider quand même]│       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

### **VALIDATION POSITIVE (Encouragement)**

#### **Repas conforme**

```
┌─────────────────────────────────────────────────────────┐
│  Aliment : Saumon grillé (150g)                        │
│  Score QN : 4/5 🟢                                      │
│  Portion : Conforme ✅                                  │
│  Catégorie : Protéine maigre                           │
│                                                         │
│  ✅ EXCELLENT CHOIX !                                   │
│  ┌─────────────────────────────────────────────┐       │
│  │ 🎉 Repas parfait pour la cristallisation    │       │
│  │                                             │       │
│  │ ✅ Score QN excellent (4/5)                 │       │
│  │ ✅ Quantité respectée                       │       │
│  │ ✅ Protéine de qualité                      │       │
│  │                                             │       │
│  │ Critères validés : 4/5 aujourd'hui         │       │
│  │ Continue comme ça ! 💪                      │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  [✔️ Enregistrer ce repas]                             │
└─────────────────────────────────────────────────────────┘
```

---

### **IMPACT IMMÉDIAT SUR LES CRITÈRES**

```javascript
// Workflow complet
const saisirRepas = async (repas) => {
  // 1. Validation préalable
  const alertes = detecterAlertesCristallisation(repas);
  
  if (alertes.length > 0) {
    // Afficher alertes AVANT enregistrement
    const confirmation = await showAlertModal(alertes);
    if (!confirmation) return; // Utilisateur annule
  }
  
  // 2. Enregistrement
  await sauvegarderRepas(repas);
  
  // 3. Recalcul IMMÉDIAT critères
  const criteresMAJ = await recalculerCriteresDuJour();
  
  // 4. Notifications
  const nouveauxCriteresValides = criteresMAJ.filter(c => 
    c.valide && !criteresPrecedents.find(cp => cp.id === c.id)?.valide
  );
  
  nouveauxCriteresValides.forEach(critere => {
    showToast(`✅ ${critere.nom} validé !`, 'success');
  });
  
  // 5. Update page cristallisation-quotidien
  broadcastEvent('criteres-updated', criteresMAJ);
};
```

---

### **SYNCHRONISATION TEMPS RÉEL ENTRE PAGES**

**Problème** : Utilisateur saisit repas sur `/saisie-repas`, mais il est sur `/cristallisation-quotidien`

**Solution** : Utiliser `localStorage` + `window.addEventListener('storage')`

```javascript
// Page cristallisation-quotidien.js
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'last_repas_update') {
      // Recharger critères automatiquement
      rechargerCriteresDuJour();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);

// Page saisie-repas.js (après enregistrement)
const sauvegarderRepas = async (repas) => {
  await API.createRepas(repas);
  
  // Trigger reload sur autre page
  localStorage.setItem('last_repas_update', Date.now());
};
```

---

### **WIDGET FLOTTANT "CRITÈRES DU JOUR"**

**Sur la page saisie repas**, afficher un widget flottant en bas à droite :

```
┌────────────────────────────────┐
│  📋 Cristallisation            │
│  3/5 critères validés          │
│                                │
│  ✅ Quantités                  │
│  ✅ QN ≥ 3                     │
│  ✅ Pratique spirituelle       │
│  ⬜ Pas féculents soir         │
│  ⬜ Aucun extra                │
│                                │
│  [Voir détails →]             │
└────────────────────────────────┘
```

**Ce widget se met à jour en temps réel** après chaque saisie.

---

## 🔄 WORKFLOW COMPLET DYNAMIQUE

### **Exemple : Journée type**

#### **8h30 - Petit-déjeuner**

```
Utilisateur va sur /saisie-repas
             ↓
Saisit : Yaourt 0% (150g) + Fruits rouges (100g)
             ↓
Validation pré-saisie :
• QN : 4/5 ✅
• Quantité : OK ✅
• Pas d'extra ✅
             ↓
Enregistrement
             ↓
Recalcul critères automatique :
✅ "Respect quantités" → VALIDÉ
✅ "Score QN ≥ 3" → VALIDÉ
             ↓
Toast notification :
"✅ 2 critères validés ! Continue comme ça."
             ↓
Page /cristallisation-quotidien se met à jour automatiquement
```

---

#### **13h00 - Déjeuner**

```
Utilisateur va sur /saisie-repas
             ↓
Saisit : Pâtes (350g)
             ↓
⚠️ ALERTE : Quantité excessive (max 250g)
             ↓
Utilisateur modifie → 250g
             ↓
Saisit : Légumes vapeur (200g)
             ↓
Validation : Tout OK ✅
             ↓
Enregistrement
             ↓
Toast : "✅ Déjeuner conforme ! 3/5 critères validés"
```

---

#### **20h15 - Dîner**

```
Utilisateur va sur /saisie-repas
             ↓
Saisit : Riz blanc (200g)
             ↓
⚠️ ALERTE : Féculent après 19h
             ↓
Modal :
"⚠️ Cela invalidera le critère 'Pas de féculents soir'.
Alternatives : légumes, poisson, salade"
             ↓
Utilisateur clique [Changer aliment]
             ↓
Choisit : Salade + thon (150g)
             ↓
✅ Validation : Excellent choix !
             ↓
Enregistrement
             ↓
Recalcul :
✅ "Pas de féculents soir" → VALIDÉ
             ↓
Toast : "🎉 4/5 critères validés ! Plus qu'une pratique spirituelle"
```

---

## 🎨 ÉLÉMENTS VISUELS DYNAMIQUES

### **1. Barre de progression animée**

```css
.progress-bar {
  transition: width 0.5s ease-in-out;
}

/* Quand critère validé : animation de remplissage */
.progress-fill {
  animation: fillAnimation 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### **2. Badges dynamiques**

```
Avant validation : ⬜ (gris)
Pendant validation : ⏳ (orange clignotant)
Après validation : ✅ (vert avec animation pulse)
```

### **3. Compteur en temps réel**

```javascript
// Update compteur après chaque action
<div className="compteur-criteres">
  <span className="nombre">{criteresValides.length}</span>
  <span>/</span>
  <span>{criteres.length}</span>
  <span>critères</span>
</div>
```

---

## 💡 SUGGESTIONS INTELLIGENTES PROACTIVES

### **Détection patterns + suggestions**

```javascript
// Si l'utilisateur saisit souvent extras le soir
if (detecterPattern('extras_soir', userId)) {
  showSuggestion({
    type: 'conseil',
    message: "📊 J'ai remarqué que tu craques souvent le soir. " +
             "💡 Astuce : Prépare une tisane + 2 carrés chocolat noir.",
    defi: "Active le défi '5 soirées sans extra'"
  });
}
```

---

## 📱 NOTIFICATIONS PUSH (OPTIONNEL)

### **Rappels contextuels**

```
18h30 : "⏰ Bientôt le dîner. Rappel : pas de féculents après 19h !"

21h00 : "💤 Pense à valider ta journée. 4/5 critères OK aujourd'hui."

Dimanche 20h : "📊 Bilan de la semaine disponible !"
```

---

## 🎯 RÉPONSE À TES QUESTIONS

### **1. Comment rendre le suivi quotidien le plus dynamique ?**

✅ **Validation temps réel** : Critères se valident automatiquement après chaque repas  
✅ **Animations visuelles** : Pulse green, barres animées, badges  
✅ **Toast notifications** : Feedback immédiat sur chaque action  
✅ **Compteurs live** : Mise à jour instantanée des stats  
✅ **Feedback prédictif** : "Si tu fais X, tu auras Y critères validés"  
✅ **Synchronisation pages** : Update auto entre saisie et cristallisation  

### **2. Comment la page saisie réagit pendant cristallisation ?**

✅ **Détection auto phase** : Bandeau contextuel "🏔️ CRISTALLISATION"  
✅ **Alertes pré-saisie** : Avant validation, warning si critère menacé  
✅ **Suggestions alternatives** : Propose meilleurs choix  
✅ **Validation positive** : Encourage les bons choix  
✅ **Widget flottant** : Critères du jour visibles en permanence  
✅ **Impact immédiat** : Recalcul critères + notification instantanée  

---

## 🚀 PROCHAINE ÉTAPE

**Tu valides cette approche dynamique ?**

1. ✅ Validation temps réel des critères
2. ✅ Alertes pendant la saisie repas
3. ✅ Animations + notifications
4. ✅ Synchronisation entre pages
5. ✅ Widget flottant critères

**➡️ Je passe à l'implémentation complète ?** 🎯

---

## 🎯 RÉPONSE À TES QUESTIONS

### **1. Bandeau change ?**
✅ **OUI** - Nouveau bandeau "🏔️ CRISTALLISATION" avec couleur bleue + durée fixe 45j

### **2. Critères comme la reprise ?**
✅ **OUI** - 5 critères quotidiens + 3 hebdomadaires (voir tableau ci-dessus)

### **3. Comment guider avec données collectées ?**
✅ **ANALYSEUR INTELLIGENT** - Détecte patterns → Génère conseils/défis personnalisés

### **4. Besoin d'une autre page ?**
**NON** - **Même page `/cristallisation.js` avec 2 onglets** :
- 📊 **Vue d'ensemble** : Dashboard global (ce que j'ai montré avant)
- 📅 **Mon suivi quotidien** : Timeline + critères + repas (ce document)

---

## ✅ AVANTAGES DE CETTE ARCHITECTURE

| Avantage | Explication |
|----------|-------------|
| **Cohérence UX** | Même logique que reprise (l'utilisateur connaît déjà) |
| **Réutilisation code** | 70% des composants déjà existants |
| **Guidage intelligent** | Conseils basés sur données réelles |
| **Progression visible** | Timeline + validation jour par jour |
| **Pas de surcharge** | 1 seule page avec 2 vues |

---

## 🚀 PROCHAINE ÉTAPE

**Maintenant que tu as vu le suivi quotidien, dis-moi :**

1. ✅ Les 5 critères quotidiens te conviennent ?
2. ✅ Le système de guidage intelligent te semble pertinent ?
3. ✅ L'architecture 1 page / 2 onglets est OK ?
4. ✅ Feedback hebdomadaire (dimanche soir) te plaît ?
5. ✅ Navigation jour par jour (◀ Jour 4 | Jour 5 | Jour 6 ▶) est claire ?

**➡️ Valide et je passe au code complet !** 🎯

# 📖 PARCOURS UTILISATEUR - PRÉPARATION AU JEÛNE
## Tous les scénarios possibles avec visuels

**Date de création** : 6 décembre 2025  
**Contexte** : Documentation complète des parcours utilisateurs pour la préparation au jeûne selon différents scénarios de démarrage

---

## 🎯 CRITÈRES OFFICIELS (RÉFÉRENCE FICHE MÉTIER)

```
✅ J-30 : Respect strict des quantités à chaque repas
✅ J-17 : Pas de féculents le soir (lundi-dimanche)
✅ J-17 : Action immédiate après repas (marche/ménage)
✅ J-14 : Pas de produits transformés
✅ J-14 : Pas de sucreries
✅ J-12 : 2 jours de jeûne plein (préparation métabolique)
✅ J-7  : 2 litres d'eau par jour
✅ J-7  : Pas de repas après 19h00
✅ J-7  : Plage alimentaire 45 minutes maximum
```

---

## 📋 LOGIQUE DE VERROUILLAGE (RÈGLES MÉTIER)

### **Principe de base**

Un critère peut être dans 3 états :

1. **[À VENIR]** : Critère pas encore accessible (date future)
2. **[EN COURS]** ou **[ACTIF]** : Critère accessible, user peut valider
3. **[VERROUILLÉ]** : Critère dont la date est passée

### **Formule de calcul**

```javascript
function getStatut(jalonJ, jourCourant) {
  // Critère pas encore atteint
  if (jourCourant < jalonJ) return 'À VENIR';
  
  // Jour du critère (ou après, dans la fenêtre de validation)
  if (jourCourant >= jalonJ && jourCourant <= fenetreValidation) {
    return jourCourant === jalonJ ? 'EN COURS' : 'ACTIF';
  }
  
  // Critère passé (hors fenêtre)
  return 'VERROUILLÉ';
}
```

### **Fenêtres de validation**

- **Critère J-30** : Validable jusqu'à J-18 (fin phase Fondation)
- **Critères J-17, J-14, J-12** : Validables jusqu'à J-8 (fin phase Allègement)
- **Critères J-7** : Validables jusqu'à J-0 (jour du jeûne)

---

## 🎬 SCÉNARIO 1 : DÉMARRAGE IDÉAL (J-30)

### **Profil utilisateur : Marie**
- Date du jeûne : 15 janvier 2026
- Date de démarrage : 16 décembre 2025 (J-30 exact)
- Situation : Démarrage pile à temps, tous les critères accessibles

---

### **📅 Jour 1 - 16 décembre (J-30)**

#### **Écran : Page d'accueil `/tableau-de-bord.js`**

```
┌─────────────────────────────────────────────────────────────┐
│ 🌙 Mon Plan Vital                    [Profil] [Déconnexion] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔔 NOUVEAU : Jeûne prévu le 15 janvier 2026               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⏰ Il te reste 30 jours                              │  │
│  │ 💡 C'est le moment idéal pour commencer !            │  │
│  │                                                      │  │
│  │ [Commencer ma préparation] [Plus tard]              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Action** : Marie clique sur "Commencer ma préparation"

---

#### **Écran : Page `/preparation-jeune.js` - Vue initiale**

```
┌─────────────────────────────────────────────────────────────┐
│ 🌙 Préparation au jeûne         Retour au tableau de bord  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 Jeûne prévu : 15 janvier 2026                           │
│  📍 Position : J-30 (pile à l'heure)                        │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  💚 PARFAIT !                                                │
│  Tu démarres exactement à J-30. Tous les critères seront   │
│  accessibles si tu restes régulier dans ton suivi.          │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗  │
│  ║  PHASE 1 : FONDATION (J-30 à J-18)                  ║  │
│  ╚══════════════════════════════════════════════════════╝  │
│                                                              │
│  ✅ 1. Respect strict des quantités (J-30)                  │
│     [🟢 EN COURS - Valide ton engagement maintenant]        │
│     💡 Une portion = ce qui tient dans ta main fermée      │
│                                                              │
│  ⏳ 2. Pas de féculents le soir (J-17)                      │
│     [🔒 Se débloquera le 29 décembre]                      │
│                                                              │
│  ⏳ 3. Action après repas (J-17)                            │
│     [🔒 Se débloquera le 29 décembre]                      │
│                                                              │
│  [Voir les phases suivantes ↓]                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Statut** : Critère 1 **[EN COURS]**, autres critères **[À VENIR]**

---

### **📅 Jour 7 - 16 décembre (J-30) - Activation 1er critère**

```
┌─────────────────────────────────────────────────────────────┐
│ 🌙 Préparation au jeûne                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔔 NOUVEAU CRITÈRE ACTIF !                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🎯 Tu arrives à J-30                                 │  │
│  │ Le critère "Respect des quantités" est maintenant   │  │
│  │ actif. À partir d'aujourd'hui, respecte les         │  │
│  │ portions recommandées à chaque repas.               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗  │
│  ║  PHASE 1 : FONDATION (J-30 à J-18)                  ║  │
│  ╚══════════════════════════════════════════════════════╝  │
│                                                              │
│  ✅ 1. Respect strict des quantités (J-30)                  │
│     [🟢 EN COURS - Clique pour valider ton engagement]      │
│     💡 Une portion = ce qui tient dans ta main fermée      │
│     Fenêtre de validation : jusqu'au 28 décembre (J-18)    │
│                                                              │
│     [✅ Je valide mon engagement]                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Action** : Marie clique sur "Je valide mon engagement" → Modal de confirmation

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ VALIDATION CRITÈRE                                       │
│                                                              │
│  Es-tu prête à t'engager sur ce critère ?                  │
│                                                              │
│  "Respecter les portions recommandées à chaque repas"      │
│                                                              │
│  📊 Ton suivi sera analysé automatiquement via :            │
│  • Tes repas saisis dans la page Suivi                     │
│  • Comparaison avec les portions du référentiel            │
│                                                              │
│  [Annuler]  [✅ Je m'engage]                                │
└─────────────────────────────────────────────────────────────┘
```

**Résultat** : Critère 1 validé, suivi automatique activé

---

### **📊 Bilan Scénario 1**

- ✅ **Tous les critères accessibles** : Aucun verrouillage
- ✅ **Validation progressive** : Chaque critère se débloque à sa date
- ✅ **Suivi automatique** : Analyse des repas saisis
- ✅ **Fenêtres larges** : 12-18 jours pour valider chaque critère
- ✅ **Expérience optimale** : Pas de stress, temps suffisant

---

## 🎬 SCÉNARIO 2 : DÉMARRAGE LÉGÈREMENT TARDIF (J-25)

### **Profil utilisateur : Thomas**
- Date du jeûne : 15 janvier 2026
- Date de démarrage : 21 décembre 2025 (J-25)
- Situation : Démarrage 5 jours après J-30

---

### **📅 Jour 1 - 21 décembre (J-25)**

```
┌─────────────────────────────────────────────────────────────┐
│ 🌙 Préparation au jeûne                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 Jeûne prévu : 15 janvier 2026                           │
│  📍 Position : J-25 (5 jours après J-30)                    │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  💛 ENCORE TEMPS !                                           │
│  Tu démarres 5 jours après J-30. Le critère J-30 est       │
│  encore validable (fenêtre jusqu'à J-18). Tu peux encore   │
│  faire une excellente préparation !                         │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗  │
│  ║  PHASE 1 : FONDATION (J-30 à J-18)                  ║  │
│  ╚══════════════════════════════════════════════════════╝  │
│                                                              │
│  ✅ 1. Respect strict des quantités (J-30)                  │
│     [🟢 ACTIF - Tu peux encore valider !]                   │
│     Fenêtre : jusqu'au 28 décembre (J-18)                  │
│                                                              │
│  ⏳ 2-3. Critères J-17                                      │
│     [📅 Disponibles dans 8 jours]                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bilan** : Critère J-30 encore validable (dans la fenêtre J-30 à J-18)

---

## 🎬 SCÉNARIO 3 : DÉMARRAGE TARDIF (J-20)

### **Profil utilisateur : Sophie**
- Date du jeûne : 15 janvier 2026
- Date de démarrage : 26 décembre 2025 (J-20)
- Situation : 10 jours de retard sur J-30

---

### **📅 Jour 1 - 26 décembre (J-20)**

```
┌─────────────────────────────────────────────────────────────┐
│ 🌙 Préparation au jeûne                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 Jeûne prévu : 15 janvier 2026                           │
│  📍 Position : J-20 (10 jours après le début recommandé)   │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  ⚠️ DÉMARRAGE TARDIF                                         │
│  Tu démarres 10 jours après J-30. Certains critères ne     │
│  sont plus accessibles, mais tu peux encore faire une       │
│  excellente préparation avec les critères restants !        │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗  │
│  ║  PHASE 1 : FONDATION (J-30 à J-18)                  ║  │
│  ╚══════════════════════════════════════════════════════╝  │
│                                                              │
│  🔒 1. Respect strict des quantités (J-30)                  │
│     [VERROUILLÉ - Critère passé]                            │
│     ┌──────────────────────────────────────────────────┐   │
│     │ 💡 Ce critère devait démarrer le 16 décembre.   │   │
│     │ Pas de panique ! Tu peux quand même faire une   │   │
│     │ bonne préparation avec les 8 critères restants. │   │
│     │                                                  │   │
│     │ 🎯 Pour ton prochain jeûne, démarre plus tôt    │   │
│     │ pour profiter de tous les bienfaits. 😊         │   │
│     └──────────────────────────────────────────────────┘   │
│                                                              │
│  ✅ 2-3. Critères J-17 (Disponibles !)                      │
│     [🟢 ACTIFS - Tu peux valider maintenant]                │
│     • Pas de féculents le soir                              │
│     • Action après repas                                    │
│                                                              │
│  ⏳ 4-5. Critères J-14                                      │
│     [📅 Disponibles dans 6 jours]                          │
│                                                              │
│  Progression : ▓░░░░░░░░  1/9 critères validables          │
│  (1 critère verrouillé, 8 critères accessibles)            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### **📊 Bilan Scénario 3**

- ❌ **1 critère verrouillé** : J-30 (Respect quantités)
- ✅ **8 critères accessibles** : J-17, J-14, J-12, J-7
- ⚠️ **Message pédagogique** : Pas de blâme, conseil pour prochaine fois
- ✅ **Expérience positive** : Focus sur ce qui est possible

---

## 🎬 SCÉNARIO 4 : DÉMARRAGE TRÈS TARDIF (J-9)

### **Profil utilisateur : Karim**
- Date du jeûne : 15 janvier 2026
- Date de démarrage : 6 janvier 2026 (J-9)
- Situation : 21 jours de retard, phase Fondation ET Allègement passées

---

### **📅 Jour 1 - 6 janvier (J-9)**

```
┌─────────────────────────────────────────────────────────────┐
│ 🌙 Préparation au jeûne                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 Jeûne prévu : 15 janvier 2026 (dans 9 jours)           │
│  📍 Position : J-9 (démarrage très tardif)                  │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  🔴 DÉMARRAGE TRÈS TARDIF                                    │
│  Il ne reste que 9 jours avant ton jeûne. La plupart des   │
│  critères ne sont plus accessibles, MAIS tu peux encore    │
│  faire une mini-préparation avec les critères de la        │
│  phase finale (J-7) pour optimiser ton jeûne !              │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗  │
│  ║  PHASE 1 : FONDATION (J-30 à J-18) - VERROUILLÉE    ║  │
│  ╚══════════════════════════════════════════════════════╝  │
│                                                              │
│  🔒 1. Respect quantités (J-30) [VERROUILLÉ]                │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗  │
│  ║  PHASE 2 : ALLÈGEMENT (J-17 à J-8) - VERROUILLÉE    ║  │
│  ╚══════════════════════════════════════════════════════╝  │
│                                                              │
│  🔒 2-3. Critères J-17 [VERROUILLÉS]                        │
│  🔒 4-5. Critères J-14 [VERROUILLÉS]                        │
│  🔒 6. Jeûne 2 jours J-12 [VERROUILLÉ]                      │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗  │
│  ║  ✅ PHASE 3 : FINALISATION (J-7 à J-0) - ACTIVE !   ║  │
│  ╚══════════════════════════════════════════════════════╝  │
│                                                              │
│  ✅ 7. 2L d'eau par jour (J-7)                              │
│     [🟢 ACTIF - Validation possible maintenant]             │
│                                                              │
│  ✅ 8. Pas de repas après 19h (J-7)                         │
│     [🟢 ACTIF - Validation possible maintenant]             │
│                                                              │
│  ✅ 9. Plage 45 minutes (J-7)                               │
│     [🟢 ACTIF - Validation possible maintenant]             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💡 RECOMMANDATION                                    │  │
│  │                                                      │  │
│  │ Tu peux encore préparer ton corps avec la phase     │  │
│  │ finale (J-7). Ces 3 critères vont :                 │  │
│  │ • Hydrater ton organisme (2L eau)                   │  │
│  │ • Préparer ton système digestif (repas avant 19h)   │  │
│  │ • Limiter le temps de repas (45 min max)            │  │
│  │                                                      │  │
│  │ C'est mieux que rien ! Pour ton prochain jeûne,     │  │
│  │ démarre à J-30 pour profiter de tous les bienfaits. │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Progression : ▓░░░░░░░░  0/3 critères validables          │
│  (6 critères verrouillés, 3 critères accessibles)          │
│                                                              │
│  [Valider mes engagements J-7]                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### **📊 Bilan Scénario 4**

- ❌ **6 critères verrouillés** : J-30, J-17 (×2), J-14 (×2), J-12
- ✅ **3 critères accessibles** : J-7 (×3)
- ⚠️ **Message pragmatique** : "C'est mieux que rien"
- 🎯 **Conseil constructif** : Démarrer plus tôt la prochaine fois
- ✅ **Expérience salvable** : Mini-préparation possible

---

## 🎬 SCÉNARIO 5 : DÉMARRAGE EXTRÊME (J-2)

### **Profil utilisateur : Lisa**
- Date du jeûne : 15 janvier 2026
- Date de démarrage : 13 janvier 2026 (J-2)
- Situation : Tous les critères passés

---

### **📅 Jour 1 - 13 janvier (J-2)**

```
┌─────────────────────────────────────────────────────────────┐
│ 🌙 Préparation au jeûne                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 Jeûne prévu : 15 janvier 2026 (dans 2 jours)           │
│  📍 Position : J-2 (démarrage à la dernière minute)         │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  🔴 TROP TARD POUR UNE PRÉPARATION COMPLÈTE                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⚠️ ALERTE : Tous les critères sont verrouillés      │  │
│  │                                                      │  │
│  │ Il ne reste que 2 jours avant ton jeûne. Il est     │  │
│  │ trop tard pour une vraie préparation.               │  │
│  │                                                      │  │
│  │ 🩺 RECOMMANDATION MÉDICALE                           │  │
│  │                                                      │  │
│  │ Un jeûne sans préparation peut être difficile et    │  │
│  │ provoquer des effets secondaires (maux de tête,     │  │
│  │ fatigue, nausées).                                   │  │
│  │                                                      │  │
│  │ 💡 OPTIONS :                                         │  │
│  │                                                      │  │
│  │ 1️⃣ Reporter ton jeûne de 30 jours                   │  │
│  │    → Faire une vraie préparation                    │  │
│  │    → Maximiser les bienfaits                        │  │
│  │    → Éviter les inconforts                          │  │
│  │                                                      │  │
│  │ 2️⃣ Continuer sans préparation (déconseillé)         │  │
│  │    → Risque d'effets secondaires importants         │  │
│  │    → Bénéfices réduits                              │  │
│  │    → Expérience difficile                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [📅 Reporter mon jeûne et démarrer une vraie préparation] │
│  [⚠️ Continuer sans préparation (non recommandé)]          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Si Lisa clique sur "Continuer quand même"** :

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ CONFIRMATION REQUISE                                     │
│                                                              │
│  Es-tu sûre de vouloir continuer sans préparation ?        │
│                                                              │
│  Les risques :                                              │
│  • Maux de tête intenses (crise d'acidose)                 │
│  • Fatigue extrême dès le 1er jour                         │
│  • Nausées et vertiges                                     │
│  • Risque d'abandon du jeûne                               │
│                                                              │
│  Nous te recommandons VRAIMENT de reporter et de faire     │
│  une vraie préparation de 30 jours.                        │
│                                                              │
│  [Annuler et reporter] [Je comprends les risques]          │
└─────────────────────────────────────────────────────────────┘
```

---

### **📊 Bilan Scénario 5**

- ❌ **Tous les critères verrouillés** : 9/9
- ⚠️ **Alerte médicale** : Déconseillé fortement
- 🎯 **Proposition alternative** : Reporter de 30 jours
- 🔒 **Protection utilisateur** : Double confirmation requise

---

## 📊 TABLEAU RÉCAPITULATIF DES SCÉNARIOS

| Scénario | Démarrage | Critères accessibles | Critères verrouillés | Expérience |
|----------|-----------|----------------------|----------------------|------------|
| **1. Idéal** | J-30 | 9/9 (100%) | 0/9 (0%) | 😊 Excellente |
| **2. Léger retard** | J-25 | 9/9 (100%) | 0/9 (0%) | 😊 Très bonne |
| **3. Tardif** | J-20 | 8/9 (89%) | 1/9 (11%) | 😐 Bonne |
| **4. Très tardif** | J-9 | 3/9 (33%) | 6/9 (67%) | 😕 Acceptable |
| **5. Extrême** | J-2 | 0/9 (0%) | 9/9 (100%) | 😞 Non recommandé |

---

## 🔄 WORKFLOW VISUEL COMPLET

```
                    CYCLE COMPLET DE JEÛNE
                            
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  📅 J-30 (16 déc)       [CRITÈRE 1 ACTIF]                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ DÉMARRAGE IDÉAL                                    │    │
│  │ → Tous critères accessibles                        │    │
│  │ → Expérience optimale                              │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ PHASE 1 : FONDATION                                │    │
│  │ ✅ Respect strict des quantités                     │    │
│  │ Fenêtre : J-30 à J-18                              │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  📅 J-17 (29 déc)       [CRITÈRES 2-3 ACTIFS]              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ PHASE 2 : ALLÈGEMENT (début)                      │    │
│  │ ✅ Pas de féculents le soir                        │    │
│  │ ✅ Action après repas                              │    │
│  │ Fenêtre : J-17 à J-8                               │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  📅 J-14 (2 jan)        [CRITÈRES 4-5 ACTIFS]              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ Pas de transformés                              │    │
│  │ ✅ Pas de sucreries                                │    │
│  │ Fenêtre : J-14 à J-8                               │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  📅 J-12 (4 jan)        [CRITÈRE 6 ACTIF]                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ 2 jours jeûne plein                             │    │
│  │ Fenêtre : J-12 à J-8                               │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  📅 J-7 (8 jan)         [CRITÈRES 7-8-9 ACTIFS]            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ PHASE 3 : FINALISATION                             │    │
│  │ ✅ 2L eau/jour                                      │    │
│  │ ✅ Pas de repas après 19h                          │    │
│  │ ✅ Plage 45 minutes                                │    │
│  │ Fenêtre : J-7 à J-0                                │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  📅 J-0 (15 jan)        [LANCEMENT JEÛNE]                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🚀 DÉBUT DU JEÛNE                                  │    │
│  │ • Synthèse préparation                             │    │
│  │ • Message personnel relu                           │    │
│  │ • Transition vers page jeûne                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

           LÉGENDE DES ZONES DE DÉMARRAGE

🟢 ZONE VERTE (J-30 à J-18)   → Idéal (100% critères)
🟡 ZONE ORANGE (J-17 à J-8)   → Acceptable (33-89% critères)
🟠 ZONE ROUGE (J-7 à J-1)     → Difficile (11-33% critères)
🔴 ZONE CRITIQUE (J-0 ou après) → Non recommandé (0% critères)
```

---

## 🎯 MESSAGES PÉDAGOGIQUES PAR SCÉNARIO

### **Messages pour Scénario 1 (Idéal J-30)**

```
💚 PARFAIT ! Tu démarres exactement à J-30.
   Tous les critères seront accessibles si tu restes régulier.
   Chaque critère se débloquera progressivement.
```

### **Messages pour Scénario 2 (Léger retard J-25)**

```
💛 ENCORE TEMPS ! Tu démarres 5 jours après J-30, mais le critère
   est encore validable grâce à la fenêtre (jusqu'à J-18).
   Tous les critères restent accessibles !
```

### **Messages pour Scénario 3 (Tardif)**

```
💛 PAS DE PANIQUE ! Tu as manqué le 1er critère, mais tu peux
   encore faire une excellente préparation avec les 8 restants.
   
   💡 Pour ton prochain jeûne, démarre à J-30 pour profiter
      de tous les bienfaits.
```

### **Messages pour Scénario 4 (Très tardif)**

```
🧡 MINI-PRÉPARATION ! Il ne reste que la phase finale (J-7),
   mais c'est déjà mieux que rien.
   
   Ces 3 critères vont quand même préparer ton corps :
   • Hydratation optimale
   • Système digestif au repos le soir
   • Limitation du temps de repas
   
   💡 Pour ton prochain jeûne, démarre à J-30 pour une vraie
      transformation.
```

### **Messages pour Scénario 5 (Extrême)**

```
🔴 ALERTE ! Il est trop tard pour une préparation.
   
   Un jeûne sans préparation peut être difficile :
   • Maux de tête intenses (crise d'acidose)
   • Fatigue extrême dès le 1er jour
   • Nausées et vertiges
   
   💡 RECOMMANDATION : Reporte ton jeûne de 30 jours et fais
      une vraie préparation. Ton corps te remerciera !
```

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### **Fonction de calcul du statut**

```javascript
// /pages/preparation-jeune.js

function getStatut(critere, jourCourant) {
  const jalon = critere.jalon;
  const fenetre = getFenetreValidation(jalon);
  
  // Critère pas encore atteint
  if (jourCourant < jalon) {
    return {
      statut: 'À VENIR',
      couleur: 'gray',
      message: `Disponible dans ${Math.abs(jourCourant - jalon)} jours`,
      actionPossible: false
    };
  }
  
  // Critère actif (dans la fenêtre)
  if (jourCourant >= jalon && jourCourant <= fenetre) {
    return {
      statut: jourCourant === jalon ? 'EN COURS' : 'ACTIF',
      couleur: 'green',
      message: 'Clique pour valider ton engagement',
      actionPossible: true
    };
  }
  
  // Critère verrouillé (hors fenêtre)
  return {
    statut: 'VERROUILLÉ',
    couleur: 'red',
    message: getCritereLockMessage(critere),
    actionPossible: false
  };
}

function getFenetreValidation(jalon) {
  if (jalon === 30) return 18;  // J-30 validable jusqu'à J-18
  if ([17, 14, 12].includes(jalon)) return 8;  // J-17/14/12 jusqu'à J-8
  if (jalon === 7) return 0;  // J-7 jusqu'à J-0
  return jalon;
}

function getCritereLockMessage(critere) {
  return `💡 Ce critère devait démarrer à J-${critere.jalon}.
Pas de panique ! Tu peux encore faire une bonne préparation 
avec les critères restants. Pour ton prochain jeûne, démarre 
plus tôt pour profiter de tous les bienfaits. 😊`;
}
```

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Tous les scénarios testés (J-35, J-30, J-20, J-9, J-2)
- [ ] Messages pédagogiques non culpabilisants
- [ ] Verrouillage progressif selon les jalons
- [ ] Fenêtres de validation respectées
- [ ] Alertes médicales pour démarrages extrêmes
- [ ] Visuels clairs pour chaque scénario
- [ ] Navigation fluide entre préparation → jeûne
- [ ] Synchronisation avec page Suivi
- [ ] Stats finales de préparation
- [ ] Message personnel à soi-même

---

## 📝 NOTES IMPORTANTES

1. **Jamais de blâme** : Tous les messages sont pédagogiques et constructifs
2. **Toujours une solution** : Même en retard, on propose une alternative
3. **Protection utilisateur** : Alertes pour démarrages dangereux
4. **Expérience valorisante** : Focus sur ce qui EST possible, pas sur ce qui ne l'est pas
5. **Cohérence métier** : Respect strict de la fiche métier officielle

---

**Date de mise à jour** : 6 décembre 2025  
**Auteur** : GitHub Copilot (Agent spécialisé Préparation Jeûne)  
**Validation** : En attente validation utilisateur

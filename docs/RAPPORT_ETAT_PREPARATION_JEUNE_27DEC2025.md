# 📊 RAPPORT D'ÉTAT - MODULE PRÉPARATION JEÛNE

**Date** : 27 décembre 2025  
**Statut général** : ✅ FONCTIONNEL avec quelques points d'amélioration

---

## ✅ CE QUI EST FAIT ET FONCTIONNEL

### 1. **Page préparation-jeune.js** ✅
- ✅ Affichage des 3 phases (Allègement, Végétalisation, Pré-jeûne)
- ✅ Calcul dynamique des périodes avec dates réelles
- ✅ 9 critères métier intégrés avec jalons corrects
- ✅ Timer minuit pour mise à jour automatique de la date
- ✅ Pattern client-only respecté (isMounted + localStorage)
- ✅ Bannière "Lever de soleil" avec date/heure du jour
- ✅ Barre de progression globale
- ✅ Interface épurée sans doublons

### 2. **Logique de validation des critères** ✅
- ✅ Fenêtres de validation implémentées :
  - J-30 validable jusqu'à J-18 (12 jours)
  - J-17, J-14, J-12 validables jusqu'à J-8
  - J-7 validable jusqu'à J-0
- ✅ 3 états des critères : À VENIR / ACTIF / DÉPASSÉ
- ✅ Messages pédagogiques pour critères dépassés
- ✅ Validation manuelle + validation automatique
- ✅ Préservation des validations manuelles

### 3. **Composant PhaseCard** ✅
- ✅ Affichage des critères avec états visuels
- ✅ Bouton "Valider" actif/inactif selon période
- ✅ Messages explicatifs pour critères À VENIR et DÉPASSÉ
- ✅ Guidances détaillées pour chaque critère
- ✅ Statut coloré (vert/gris/rouge)

### 4. **Intégration avec page Suivi** ✅
- ✅ Lien "Voir mes repas (semaine)" depuis chaque phase
- ✅ Deep-link avec dates from/to calculées
- ✅ Validation automatique des critères selon repas saisis

---

## 🔄 WORKFLOW ACTUEL

### **Étape 1 : Activation préparation**
```
Tableau de bord → [Démarrer préparation] → Modal configuration
  ↓
Saisie date jeûne + durée → localStorage: preparationData
  ↓
preparationActive = true
```

### **Étape 2 : Calcul jour courant (jCourant)**
```
useEffect déclenché à minuit
  ↓
aujourdhui = new Date()
  ↓
jCourant = -diffJours (ex: -13 si 13 jours avant jeûne)
```

### **Étape 3 : Détermination statut critères**
```
Pour chaque critère avec jalon (ex: J-30):
  ↓
Si jCourant < jalon → À VENIR
Si jCourant >= jalon && jCourant <= fenetre → ACTIF
Si jCourant > fenetre → DÉPASSÉ
```

### **Étape 4 : Validation critère**
```
User clique "Valider" → Modal confirmation
  ↓
validerCritere(id) → localStorage: preparationJeuneCriteres
  ↓
critere.validé = true + dateValidation + typeValidation: 'manuel'
```

### **Étape 5 : Validation automatique (parallèle)**
```
User saisit repas dans /suivi
  ↓
analyseRepas7Jours() vérifie respect critères
  ↓
Si 5/7 jours OK → validerCritereAuto(id)
  ↓
localStorage: typeValidation: 'auto'
```

---

## ⚠️ CE QUI RESTE À FAIRE

### 🔴 **Priorité 1 : Lien Préparation ↔ Jeûne ↔ Reprise**

**Problème actuel** :
- Les 3 modules (préparation / jeûne / reprise) sont **isolés**
- Pas de continuum dans la base de données
- Pas de traçabilité du parcours complet

**Ce qui manque** :
```javascript
// Table manquante : parcours_jeune
{
  id: 1,
  user_id: "xxx",
  date_debut_preparation: "2025-12-09",
  date_debut_jeune: "2026-01-08",
  duree_jeune: 10,
  criteres_preparation_valides: [1, 2, 7, 8, 9],
  statut: "en_preparation", // en_preparation | en_jeune | en_reprise | terminé
  progression_jeune: 3, // jour actuel du jeûne
  date_fin_jeune: "2026-01-18",
  date_fin_reprise: "2026-01-28"
}
```

**Action requise** :
1. ✅ Créer table `parcours_jeune` dans Supabase
2. ✅ Modifier `/pages/preparation-jeune.js` pour sauvegarder le parcours au démarrage
3. ✅ Créer logique de transition : préparation → jeûne → reprise
4. ✅ Afficher continuité dans tableau de bord

---

### 🟡 **Priorité 2 : Validation auto des critères améliorée**

**Fonctionnel actuellement** :
- ✅ Critère 1 : Portions (détecte via quantités saisies)
- ✅ Critère 2 : Pas de féculents le soir (détecte via catégorie + heure)
- ✅ Critère 7 : Hydratation (compte l'eau dans les repas)

**Manquant** :
- ❌ Critère 3 : Action après repas (besoin d'un champ dédié)
- ❌ Critère 4 : Pas de produits transformés (détection via catégorie aliment)
- ❌ Critère 5 : Pas de sucreries (détection via catégorie aliment)
- ❌ Critère 6 : 2 jours de jeûne plein (détection si 0 repas saisi sur 2 jours)
- ❌ Critère 8 : Pas de repas après 19h (détecte via heure saisie)
- ❌ Critère 9 : Plage alimentaire 45 min (besoin champ début/fin repas)

**Action requise** :
1. Ajouter champs manquants dans SaisieRepas :
   - ✅ `action_apres_repas` (oui/non)
   - ✅ `heure_debut_repas` / `heure_fin_repas`
2. Améliorer `analyseRepas7Jours()` dans `lib/analyseRepas3Jours.js`
3. Tester validation auto pour chaque critère

---

### 🟡 **Priorité 3 : Gestion scénarios démarrage tardif**

**Fonctionnel** :
- ✅ Détection si user démarre après J-30
- ✅ Verrouillage critères dépassés
- ✅ Messages pédagogiques

**Manquant** :
- ❌ Proposition de "mini-préparation" si démarrage à J-10
- ❌ Suggestion de reporter le jeûne si démarrage à J-3
- ❌ Calcul de "qualité de préparation" (score/10)

**Exemple à implémenter** :
```javascript
if (jCourant > -10 && jCourant < 0) {
  // User démarre très tard (moins de 10 jours)
  afficherModal({
    titre: "⚠️ Démarrage très tardif",
    message: "Tu démarres à J-7. Pour un jeûne optimal, nous recommandons :",
    options: [
      "Reporter le jeûne de 2 semaines (recommandé)",
      "Faire une mini-préparation J-7 seulement",
      "Continuer quand même (non recommandé)"
    ]
  });
}
```

---

### 🟢 **Priorité 4 : Amélioration UX**

**Petites améliorations** :
1. ❌ Ajouter barre de progression par phase (ex: 2/3 critères validés en Phase 1)
2. ❌ Afficher badge "Phase terminée ✅" quand tous critères d'une phase validés
3. ❌ Animation confettis lors validation d'un critère
4. ❌ Récapitulatif final avant démarrage jeûne :
   ```
   🎉 Préparation terminée !
   ✅ 8/9 critères validés
   ⚠️ 1 critère manqué : Respect portions
   
   💪 Tu es prêt à 89% pour ton jeûne !
   [Démarrer mon jeûne maintenant]
   ```

---

## 📋 WORKFLOW IDÉAL COMPLET (Vision)

```
1. Tableau de bord
   ↓
2. [Démarrer préparation] → Saisie date jeûne
   ↓
3. Préparation jeûne (J-30 à J-0)
   - Validation critères jour par jour
   - Suivi automatique via repas saisis
   - Timeline progression
   ↓
4. J-0 : Récapitulatif préparation
   - Score qualité préparation
   - Critères validés / manqués
   - Conseils personnalisés
   ↓
5. [Démarrer mon jeûne] → Transition auto vers /jeune
   ↓
6. Page jeune (J1 à JX)
   - Suivi jour par jour
   - Validation journée
   - Préparation reprise dès J+4
   ↓
7. JX (fin jeûne) : [Démarrer ma reprise]
   ↓
8. Reprise alimentaire (10 jours)
   - Suivi repas adaptés
   - Alertes si reprise trop rapide
   ↓
9. Fin : [Terminer le parcours]
   ↓
10. Bilan complet : Préparation + Jeûne + Reprise
    - Statistiques
    - Badges débloqués
    - Export PDF
```

---

## 🎯 ACTIONS CONCRÈTES À FAIRE (Par priorité)

### **Court terme (1-2 jours)** 🔴

1. ✅ **Créer table `parcours_jeune`** dans Supabase
   ```sql
   CREATE TABLE parcours_jeune (
     id SERIAL PRIMARY KEY,
     user_id TEXT NOT NULL,
     date_debut_preparation DATE,
     date_debut_jeune DATE,
     duree_jeune INTEGER,
     criteres_valides JSONB,
     statut TEXT, -- en_preparation | en_jeune | en_reprise | terminé
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. ✅ **Lier préparation → jeûne** : 
   - Bouton "Démarrer mon jeûne" à J-0 dans `/preparation-jeune.js`
   - Transition automatique vers `/jeune` avec context

3. ✅ **Améliorer messages pédagogiques** pour scénarios tardifs

### **Moyen terme (3-5 jours)** 🟡

4. ✅ **Compléter validation auto** pour les 6 critères manquants
5. ✅ **Ajouter champs manquants** dans SaisieRepas (action après repas, horaires précis)
6. ✅ **Implémenter mini-préparation** pour démarrage tardif

### **Long terme (1-2 semaines)** 🟢

7. ✅ **Créer continuum complet** : préparation → jeûne → reprise
8. ✅ **Dashboard unifié** affichant tout le parcours
9. ✅ **Export PDF** du bilan complet
10. ✅ **Système de badges** pour motivation

---

## ✅ CONCLUSION

**La page préparation-jeune est fonctionnelle à 80%** :
- ✅ Affichage, calculs, validations manuelles : OK
- ⚠️ Validation auto : partielle (3/9 critères)
- ❌ Lien avec jeûne/reprise : manquant
- ❌ Scénarios tardifs : incomplet

**Prochaine étape critique** : Créer le lien préparation ↔ jeûne ↔ reprise pour avoir un parcours complet et cohérent.

---

**Souhaitez-vous que je commence par l'action #1 (créer table parcours_jeune) ou préférez-vous une autre priorité ?**

# 📋 RAPPORT TODO — Mise en conformité Bilan Hebdomadaire

**Date création** : 21 janvier 2026  
**Auteur** : GitHub Copilot  
**Documents sources** :
- PLAN_IMPL_SECTION2_BILAN_HEBDO.md
- COMPARAISON_FICHE_METIER_BILAN_HEBDO.md
- RAPPORT_SECTION7_ANALYSE_IMPLEMENTATION.md

---

## 🎯 OBJECTIF GLOBAL

Mettre en conformité les Sections 2 et 7 du Bilan Hebdomadaire avec les spécifications métier actualisées, en respectant strictement :
- Les verbatims de référence (non négociables)
- Les principes fondamentaux Plan Vital (trajectoire, conscience, non-jugement)
- Les règles d'accessibilité (WCAG AA, navigation clavier, ARIA)

---

## 📊 SYNTHÈSE VISUELLE

```
┌─────────────────────────────────────────────────────────────┐
│  SECTION 7 — "Comment j'ai mangé"                          │
├─────────────────────────────────────────────────────────────┤
│  Phase 1: Dynamiser données          │ 1h20  │ 🔥 CRITIQUE │
│  Phase 2: Répartition temporelle     │ 2h10  │ 🔥 HAUTE    │
│  Phase 3: Message personnalisé       │ 0h55  │ 🟡 MOYENNE  │
├─────────────────────────────────────────────────────────────┤
│  TOTAL SECTION 7                     │ 4h25                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 2 — "Tendance et trajectoire"                     │
├─────────────────────────────────────────────────────────────┤
│  Comparaison N/N-1 (nouvelle logique)│ 1h35  │ 🔥 CRITIQUE │
│  Moyenne 14j (nouveau rôle)          │ 1h20  │ 🔥 HAUTE    │
│  Verbatim référence (partie chiffrée)│ 3h45  │ 🔥 CRITIQUE │
├─────────────────────────────────────────────────────────────┤
│  TOTAL SECTION 2                     │ 6h40                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TESTS & QUALITÉ                                            │
├─────────────────────────────────────────────────────────────┤
│  Tests accessibilité (Sections 2 & 7)│ 1h30  │ 🟡 MOYENNE  │
└─────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════╗
║  DURÉE TOTALE ESTIMÉE : 12h35                              ║
╚═════════════════════════════════════════════════════════════╝
```

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### 📌 Sprint 1 : Fondations métier (5h20)

**Objectif** : Implémenter verbatims et logique métier stricte

1. **TODO 2.3** — Verbatim référence partie chiffrée (3h45)
   - Créer composant `BlocLecture14j`
   - Implémenter structure exacte : Cumul → Rythme → Perspective → Signature
   - Phrase clé récurrente : "Une journée ne décide rien..."
   - **Validation** : Revue utilisateur obligatoire

2. **TODO 2.1** — Nouvelle logique comparaison N/N-1 (1h35)
   - 3 cas métier : ÉLOIGNEMENT / RAPPROCHEMENT / REPRODUCTION
   - Seuil variation négligeable : < 100 kcal
   - Verbatims conformes (interdictions strictes)
   - **Validation** : Tests avec vraies données N et N-1

---

### 📌 Sprint 2 : Quick wins visibles (2h40)

**Objectif** : Améliorer immédiatement l'expérience utilisateur

3. **TODO 7.1** — Dynamiser données Section 7 (1h20)
   - Calculer satiété/humeur moyennes
   - Afficher note utilisateur
   - Gérer cas "Aucune donnée"
   - **Validation** : Tests cas limites

4. **TODO 2.2** — Nouveau rôle moyenne 14j (1h20)
   - Repositionner après comparaison N/N-1
   - Phrase de mise en garde si moyenne biaisée
   - Phrase signature selon répétition
   - **Validation** : Tests semaines opposées

---

### 📌 Sprint 3 : Insights utilisateur (3h05)

**Objectif** : Apporter coaching et insights personnalisés

5. **TODO 7.2** — Répartition extras temporelle (2h10)
   - Catégoriser moments journée (matin/après-midi/soir/nuit)
   - Détecter patterns (grignotage soir/nuit)
   - Affichage conditionnel
   - **Validation** : Tests répartitions variées

6. **TODO 7.3** — Message doux personnalisé (55min)
   - 4 cas adaptatifs (fatigue, humeur, satiété, OK)
   - Verbatims bienveillants
   - **Validation** : Tests tous les cas

---

### 📌 Sprint 4 : Qualité & accessibilité (1h30)

**Objectif** : Garantir accessibilité universelle

7. **TODO 7.4 & 2.4** — Tests accessibilité (1h30)
   - Navigation clavier complète
   - Attributs ARIA
   - Contraste WCAG AA
   - Focus management
   - **Validation** : Tests utilisateurs réels

---

## 🎯 POINTS CRITIQUES À VALIDER AVANT DÉMARRAGE

### ⚠️ Validation métier requise

- [ ] **Verbatims Section 2** (conformité stricte requise)
  - Structure exacte du bloc "Lecture sur 14 jours"
  - Phrase signature récurrente
  - Interdictions absolues ("Tu devrais", "Attention", etc.)

- [ ] **Logique comparaison N/N-1**
  - 3 cas métier validés (ÉLOIGNEMENT/RAPPROCHEMENT/REPRODUCTION)
  - Seuil 100 kcal confirmé
  - Couleurs et icônes approuvées

- [ ] **Hiérarchie temporelle**
  - Ordre : Semaine N → Comparaison N/N-1 → Moyenne 14j
  - Rôle de la moyenne : "confirme, ne décide pas"

### ⚠️ Validation technique requise

- [ ] **Table repas_reels**
  - Colonne `heure_saisie` existe ?
  - Type : `TIME` ou `TIMESTAMP` ?
  - Si absente → migration Supabase nécessaire

- [ ] **Calculs disponibles dans pages/suivi.js**
  - `satieteMoyenne` : Champ `satiete` existe ?
  - `humeurDominante` : Champ `humeur_associee` existe ?
  - `cumul14j` : Historique 14 jours accessible ?

---

## 📋 CHECKLIST PRÉ-IMPLÉMENTATION

### ✅ Documents lus et compris
- [x] PLAN_IMPL_SECTION2_BILAN_HEBDO.md
- [x] COMPARAISON_FICHE_METIER_BILAN_HEBDO.md (nouvelle approche)
- [x] RAPPORT_SECTION7_ANALYSE_IMPLEMENTATION.md
- [x] Instructions Copilot (verbatim référence)

### ✅ Règles métier assimilées
- [x] Principes fondamentaux (trajectoire, non-jugement)
- [x] Interdictions strictes (vocabulaire prescriptif)
- [x] Phrase signature récurrente
- [x] Hiérarchie temporelle (journée/semaine/14j)

### ✅ Environnement technique prêt
- [ ] Base de données accessible (Supabase)
- [ ] Schéma tables vérifié (repas_reels, profil)
- [ ] Environnement dev fonctionnel (npm run dev)
- [ ] Tests manuels possibles (données réelles ou simulées)

### ✅ Validation utilisateur obtenue
- [ ] Ordre de priorité validé
- [ ] Verbatims approuvés
- [ ] Stratégies techniques validées
- [ ] Budget temps accepté (12h35)

---

## 🔍 RISQUES IDENTIFIÉS & MITIGATIONS

### 🔴 Risque 1 : Verbatims non conformes

**Impact** : Violation de l'ADN Plan Vital, perte confiance utilisateur  
**Probabilité** : Moyenne (vigilance constante requise)  
**Mitigation** :
- Copier-coller verbatims référence depuis document source
- Revue utilisateur obligatoire après implémentation
- Tests avec vraies phrases avant intégration

### 🔴 Risque 2 : Régression Section 1

**Impact** : Perte fonctionnalités existantes  
**Probabilité** : Faible (si séparation stricte respectée)  
**Mitigation** :
- Aucune modification Section 1
- Tests non-régression après chaque sprint
- Rollback immédiat si régression détectée

### 🟡 Risque 3 : Données manquantes (heure_saisie)

**Impact** : Répartition extras temporelle impossible  
**Probabilité** : Moyenne (schéma BDD à vérifier)  
**Mitigation** :
- Vérification schéma AVANT TODO 7.2
- Migration Supabase si nécessaire
- Fallback pédagogique si heure absente

### 🟡 Risque 4 : Calculs 14j lourds

**Impact** : Performances dégradées  
**Probabilité** : Faible (peu de données)  
**Mitigation** :
- Calcul côté serveur si possible
- Cache résultats 14j
- Affichage progressif (skeleton loader)

---

## 📊 MÉTRIQUES DE SUCCÈS

### Conformité métier
- [ ] 100% verbatims respectent document référence
- [ ] 0 occurrence vocabulaire interdit ("Tu devrais", "Attention", etc.)
- [ ] Phrase signature récurrente présente partout
- [ ] Hiérarchie temporelle respectée

### Qualité technique
- [ ] 0 régression Section 1
- [ ] 100% données dynamiques (0 hardcodé)
- [ ] Navigation clavier complète fonctionnelle
- [ ] Contraste WCAG AA sur tous textes

### Expérience utilisateur
- [ ] Temps lecture Section 2 : < 2 min
- [ ] Compréhension verbatims : > 90% utilisateurs tests
- [ ] Satisfaction message personnalisé Section 7 : > 85%
- [ ] 0 confusion période (7j/14j/N/N-1)

---

## 🎯 PROCHAINES ACTIONS IMMÉDIATES

### 1. Validation utilisateur (OBLIGATOIRE)
- [ ] Relire TODO complète
- [ ] Valider ordre de priorité (Sprint 1-4)
- [ ] Approuver verbatims Section 2
- [ ] Valider budget temps (12h35)

### 2. Vérifications techniques
- [ ] Vérifier schéma table `repas_reels` (colonne `heure_saisie`)
- [ ] Vérifier champs `satiete` et `humeur_associee` disponibles
- [ ] Tester accès historique 14 jours

### 3. Démarrage Sprint 1
- [ ] Créer branche Git : `feature/bilan-hebdo-section2-conformite`
- [ ] TODO 2.3 : Créer composant `BlocLecture14j`
- [ ] TODO 2.1 : Modifier `calculerComparaisonN1`
- [ ] Tests + revue utilisateur Sprint 1

---

## 📝 NOTES IMPORTANTES

### Verbatim référence (À NE JAMAIS MODIFIER)

```
Lecture sur 14 jours — ce qui s'accumule

Sur les 14 derniers jours :
Ton corps a reçu +1 890 kcal au-dessus de ton objectif.

Pris isolément, chaque jour peut sembler anodin.
Mais sur 14 jours, ces écarts s'additionnent et commencent à orienter la trajectoire.

Lecture du rythme réel

Cela représente une moyenne de +135 kcal par jour au-dessus de l'objectif.

Le corps ne réagit pas aux journées isolées,
il réagit à ce rythme répété jour après jour.

Mise en perspective temporelle (semaines)

Détail des deux semaines :
• Semaine N-1 : +912 kcal
• Semaine N : +978 kcal

Les deux semaines sont au-dessus de l'objectif,
avec un écart très proche d'une semaine à l'autre.

Traduction consciente

Cela signifie que, sur deux semaines consécutives,
le corps reçoit un message de continuité plutôt que d'ajustement.

Ancrage Plan Vital (phrase clé récurrente)

Une journée ne décide rien.
Une semaine oriente.
Deux semaines commencent à s'imprimer.
```

### Interdictions absolues

❌ **Vocabulaire interdit** :
- "Tu devrais..."
- "Attention..."
- "Alerte..."
- "Déséquilibre..."
- "Risque..."
- Toute formulation morale ou prescriptive

✅ **Vocabulaire requis** :
- Trajectoire, direction, chemin, rythme
- Construire, orienter, s'imprimer
- Percevoir, recevoir, intégrer
- Conscience, continuité, répétition

---

## 📞 CONTACT & VALIDATION

**Validation requise par** : [NOM UTILISATEUR]  
**Date limite validation** : _______________  
**Contact** : [EMAIL/SLACK]

**Questions en suspens** :
1. Schéma table `repas_reels` confirmé ?
2. Ordre de priorité Sprint 1-4 validé ?
3. Budget temps 12h35 accepté ?
4. Date démarrage Sprint 1 ?

---

*Rapport généré le 21 janvier 2026 par GitHub Copilot*  
*Conformité stricte : COMPARAISON_FICHE_METIER_BILAN_HEBDO.md*  
*TODO détaillée disponible : PLAN_IMPL_SECTION2_BILAN_HEBDO.md*

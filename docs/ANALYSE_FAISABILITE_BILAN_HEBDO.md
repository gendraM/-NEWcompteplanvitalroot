# 📊 ANALYSE FAISABILITÉ : VALIDATION SEMAINE & BILAN HEBDOMADAIRE
Date : 18 janvier 2026
Périmètre : Validation de la semaine + Génération du bilan hebdomadaire
Référence : Fiche métier "Bilan de la semaine"

---

## ✅ SECTION 1 : Gestion des kcal et développement du plaisir conscient

| Donnée demandée                | Disponible dans l'app | Source                  | Notes |
|-------------------------------|:---------------------:|-------------------------|-------|
| Kcal total consommé            | ✅ OUI                | suivi.js ligne 1020     | kcalSemaine = semaineDates.reduce((acc, r) => acc + (r.kcal) |
| Budget extras hebdo            | ✅ OUI                | BudgetExtrasCard.js     | calculs.budgetExtras via routeur poids |
| Budget consommé                | ✅ OUI                | BudgetExtrasCard.js     | budgetConsomme = repasFiltres.reduce((sum, r) => sum + (r.kcal) |
| Nombre d'extras                | ✅ OUI                | suivi.js                | extrasInfo.count |
| Répartition extras             | ✅ OUI                | suivi.js ligne 1015     | calculerExtrasSemaine() retourne le détail |

| Donnée demandée                | État actuel           | Action requise |
|-------------------------------|:---------------------:|----------------|
| Objectif hebdomadaire estimé   | ⚠️ Partiel            | Existe en journalier (objectifCalorique), multiplier par 7 |
| Écart hebdomadaire             | ⚠️ À calculer          | kcalSemaine - (objectifCalorique × 7) |
| Tendance (déficit/maintien/surplus) | ⚠️ À implémenter   | Logique conditionnelle basée sur l'écart |
| Moments planifiés vs impulsifs | ❌ NON                | Nécessite ajout d'un champ planifie: boolean dans la saisie repas |

---

## ✅ SECTION 2 : Trajectoire énergétique (7j + 14j)

| Donnée demandée                | Disponible | Source                  | Notes |
|-------------------------------|:----------:|-------------------------|-------|
| Apports semaine précédente     | ✅ OUI     | suivi.js + semaines_validees | Récupérer kcal_semaine de la semaine N-1 |
| Apports semaine actuelle       | ✅ OUI     | suivi.js ligne 1020     | kcalSemaine |
| Évolution semaine vs semaine   | ✅ OUI     | Calcul simple           | kcalSemaineActuelle - kcalSemainePrecedente |

| Donnée demandée                | État actuel           | Action requise |
|-------------------------------|:---------------------:|----------------|
| Moyenne 14 jours glissants     | ⚠️ À implémenter       | Récupérer 2 dernières semaines de semaines_validees, calculer moyenne |
| Positionnement (déficit/maintien/surplus) | ⚠️ À implémenter | Comparer moyenne 14j avec objectif hebdo × 2 |
| Schémas récurrents             | ⚠️ Partiel            | Nécessite analyse patterns (extras tardifs, accumulation, etc.) |
| Ce qui s'ancre (renforcements positifs) | ⚠️ À implémenter | Comparaison comportementale semaine N vs N-1 |

---

## ✅ SECTION 3 : Comment j'ai mangé

| Donnée demandée                | Disponible | Source                  | Notes |
|-------------------------------|:----------:|-------------------------|-------|
| Satiété moyenne                | ✅ OUI     | suivi.js ligne 1023-1024| satieteMoyenne déjà calculée |
| Humeur moyenne                 | ✅ OUI     | suivi.js ligne 1026-1027| humeurMoyenne déjà calculée |
| Notes écrites utilisateur      | ✅ OUI     | Table repas             | Champ commentaire ou note (à vérifier) |

| Donnée demandée                | État actuel           | Action requise |
|-------------------------------|:---------------------:|----------------|
| Répartition extras hors repas (matin/après-midi/soir/nuit) | ❌ NON | Nécessite extraction de l'heure de saisie + catégorisation temporelle |

---

## 📊 SYNTHÈSE GLOBALE

✅ Données 100% disponibles (prêtes à afficher)
- Kcal total semaine
- Budget extras hebdo
- Budget extras consommé
- Nombre d'extras
- Satiété moyenne
- Humeur moyenne
- Apports semaine actuelle vs précédente

🟡 Données disponibles mais nécessitant calculs supplémentaires
- Objectif hebdomadaire (×7)
- Écart hebdomadaire
- Tendance (déficit/maintien/surplus)
- Moyenne 14 jours glissants
- Évolution comportementale

🔴 Données NON disponibles (nécessitent développement)
- Moments planifiés vs impulsifs → Ajouter champ planifie: boolean dans saisie repas
- Répartition temporelle extras (matin/midi/soir/nuit) → Ajouter extraction heure + catégorisation
- Schémas récurrents détaillés → Analyse patterns avancée
- Ce qui s'ancre (renforcements positifs) → Logique de comparaison comportementale

---

## 🎯 RECOMMANDATIONS POUR IMPLÉMENTATION

**Phase 1 : Quick Win (1-2h de dev)**
- Afficher les données déjà disponibles :
  - Bloc "Apports de la semaine" (kcal, budget extras, extras count)
  - Bloc "Ressentis" (satiété, humeur)
  - Comparaison semaine N vs N-1

**Phase 2 : Calculs supplémentaires (2-3h de dev)**
- Objectif hebdomadaire (×7)
- Écart + tendance (déficit/maintien/surplus)
- Moyenne 14 jours glissants
- Positionnement trajectoire

**Phase 3 : Enrichissements (3-5h de dev)**
- Champ planifie dans saisie repas
- Extraction heure + catégorisation temporelle
- Messages dynamiques selon écart
- Schémas récurrents (analyse simple)

**Phase 4 : Analyse avancée (5-10h de dev)**
- Patterns comportementaux
- Renforcements positifs automatiques
- Projection consciente semaine suivante
- Modal "En savoir plus" avec conseils personnalisés

---

## 📝 STRUCTURE TABLE semaines_validees (À ENRICHIR)

---

## ✅ CONCLUSION
Faisabilité globale : 70% immédiate, 30% développement complémentaire
- Section 1 : 80% faisable (manque uniquement planifié vs impulsif)
- Section 2 : 60% faisable (nécessite moyenne 14j + patterns)
- Section 3 : 70% faisable (manque répartition temporelle)

**Recommandation :** Implémenter Phase 1 + Phase 2 pour avoir un bilan exploitable, puis enrichir progressivement avec Phase 3 et 4.

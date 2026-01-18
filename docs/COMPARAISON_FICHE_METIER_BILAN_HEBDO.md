# Comparaison fiche métier vs données app

## Section 1 — Signal énergétique de la semaine
- **Fiche métier** :
  - Apports totaux de la semaine
  - Objectif hebdomadaire estimé
  - Écart hebdomadaire
  - Phrase automatique selon déficit/maintien/surplus
- **Données app** :
  - ✅ Apports totaux (repas_reels)
  - ✅ Objectif hebdo (profil + routeur poids)
  - ✅ Écart hebdo (calcul JS)
  - ✅ Phrase automatique (présente dans BilanHebdoModal)

## Section 2 — Tendance et trajectoire (7j + 14j)
- **Fiche métier** :
  - Tendance identifiée (perte/maintien/surplus)
  - Comparaison semaine N vs N-1
  - Moyenne énergétique sur 14 jours
  - Positionnement sur 14 jours
  - Phrase signature sur la répétition
- **Données app** :
  - ✅ Tendance (calculée via écart et projection)
  - ✅ Comparaison N/N-1 (historique, calcul JS)
  - ✅ Moyenne 14j (calcul JS sur repas)
  - ✅ Positionnement (calcul JS)
  - ✅ Phrase signature (présente)

## Section 3 — Plaisir & extras
- **Fiche métier** :
  - Budget extras hebdo
  - Consommé en extras
  - Part des extras dans la semaine
  - Nombre d’extras (mini/normal/majeur)
  - Moments extras planifiés vs impulsifs
  - Lecture automatique (répartition)
- **Données app** :
  - ✅ Budget extras (profil + routeur poids)
  - ✅ Consommé (repas_reels, est_extra)
  - ✅ Part extras (calcul JS)
  - ✅ Nombre d’extras (calcul JS, type à enrichir)
  - ✅ Moments planifiés/impulsifs (repas_reels, à enrichir)
  - ✅ Lecture automatique (présente)

## Section 4 — Moments forts & fragilité
- **Fiche métier** :
  - Moments favorables (repas structurés, extras planifiés, journées sans dépassement)
  - Moments de fragilité (extras tardifs, non planifiés, accumulation)
  - Phrase de cadrage
- **Données app** :
  - ⚠️ Moments favorables/fragilité : partiellement présents, logique à enrichir
  - ✅ Phrase de cadrage (présente)

## Section 5 — Lecture synthèse
- **Fiche métier** :
  - Phrase synthèse selon déficit/maintien/surplus
  - Lecture motivationnelle (sous budget/dépassé)
- **Données app** :
  - ✅ Phrase synthèse (présente)
  - ✅ Lecture motivationnelle (présente)

## Section 6 — Projection semaine suivante
- **Fiche métier** :
  - Conseil pour la semaine à venir (planifier plaisir, sécuriser moment, etc.)
  - Message de clôture
- **Données app** :
  - ✅ Conseil basique (présent)
  - ✅ Message de clôture (présent)

## Section 7 — Comment j’ai mangé
- **Fiche métier** :
  - Satiété, humeur, notes utilisateur
  - Répartition extras hors repas (matin, après-midi, soir, nuit)
  - Message doux
- **Données app** :
  - ✅ Satiété, humeur, notes (si saisis)
  - ✅ Répartition extras hors repas (à enrichir)
  - ✅ Message doux (présent)

---

## Points à enrichir pour coller au métier
- Typologie des extras (mini/normal/majeur)
- Moments planifiés/impulsifs (besoin d’un tag ou d’une saisie dédiée)
- Détection automatique des moments favorables/fragilité
- Répartition extras hors repas (besoin d’un champ ou d’une logique)
- Conseils personnalisés plus avancés
- Visualisation (jauge, flèche, etc.)

---

**Sources :**
- [docs/Fiche métier bilan de la semaine](docs/Fiche%20m%C3%A9tier%20bilan%20de%20la%20semaine)
- [components/BilanHebdoModal.js](components/BilanHebdoModal.js)
- [components/BudgetExtrasCard.js](components/BudgetExtrasCard.js)
- [lib/validationSemaine.js](lib/validationSemaine.js)
- [pages/suivi.js](pages/suivi.js)
- [supabase/extras_budget]

---

*Document à compléter au fil des évolutions métier et techniques.*

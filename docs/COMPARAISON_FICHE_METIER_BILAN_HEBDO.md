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


données complementaire 
section 2 new approche a prendre en compte:
SECTION 2 — Comparaison avec la semaine précédente
Objectif hebdomadaire (fixe) : 12 110 kcal

Règle de lecture (à garder en tête)
Chaque semaine est lue par rapport à l’objectif.
La comparaison montre si tu te rapproches, si tu répètes, ou si tu t’éloignes.

SEUIL “variation négligeable”
Si l’évolution de l’écart est < 100 kcal → on considère que c’est une reproduction (pas un changement).

🔴 CAS 1 — ÉLOIGNEMENT DE L’OBJECTIF (anciennement “détérioration”)

Semaine dernière (N-1)
Objectif : 12 110 kcal
Consommé : 12 610 kcal
Écart : +500 kcal

Cette semaine (N)
Objectif : 12 110 kcal
Consommé : 13 088 kcal
Écart : +978 kcal

Évolution (distance à l’objectif)
+478 kcal → l’écart avec l’objectif augmente

Verbatim — Option 1 (ultra-synthèse)
L’écart avec l’objectif augmente.
Le comportement s’éloigne de la cible.

Verbatim — Option 2 (conscience / ADN Plan Vital)
L’écart avec l’objectif augmente.
Le corps perçoit un déséquilibre plus marqué.

🟢 CAS 2 — RAPPROCHEMENT DE L’OBJECTIF (anciennement “amélioration”)

Semaine dernière (N-1)
Objectif : 12 110 kcal
Consommé : 12 610 kcal
Écart : +500 kcal

Cette semaine (N)
Objectif : 12 110 kcal
Consommé : 12 310 kcal
Écart : +200 kcal

Évolution (distance à l’objectif)
-300 kcal → l’écart avec l’objectif diminue

Verbatim — Option 1 (ultra-synthèse)
L’écart avec l’objectif diminue.
Le comportement se rapproche de la cible.

Verbatim — Option 2 (conscience / ADN Plan Vital)
L’écart avec l’objectif diminue.
Le corps perçoit un ajustement dans la bonne direction.

🟡 CAS 3 — REPRODUCTION DU DÉSÉQUILIBRE (remplace “stabilité”)

Semaine dernière (N-1)
Objectif : 12 110 kcal
Consommé : 12 610 kcal
Écart : +500 kcal

Cette semaine (N)
Objectif : 12 110 kcal
Consommé : 12 630 kcal
Écart : +520 kcal

Évolution (distance à l’objectif)
+20 kcal → variation négligeable (< 100 kcal)

Explication (alignée avec ton besoin)
Les deux semaines, tu es au-dessus de l’objectif.
Et comme l’écart est quasiment identique, cela signifie que tu reproduis presque le même comportement.

Verbatim — Option 1 (ultra-synthèse)
L’écart avec l’objectif reste quasiment identique.
Cela signifie que le même schéma se répète, sans ajustement notable.

Verbatim — Option 2 (conscience / ADN Plan Vital)
L’écart avec l’objectif reste quasiment identique.
Le corps perçoit une continuité, pas un changement.

Variantes courtes “rotation” (si tu veux éviter la répétition exacte tout en gardant le sens)

Pour le cas 1 (éloignement)

Version alternative A : L’écart augmente : tu t’éloignes de ton repère.

Version alternative B : Le signal est plus lourd : la trajectoire s’écarte.

Pour le cas 2 (rapprochement)

Version alternative A : L’écart diminue : tu reviens vers ton repère.

Version alternative B : Le signal s’allège : la direction est meilleure.

Pour le cas 3 (reproduction du déséquilibre)

Version alternative A : Même écart, même schéma : pas de changement notable.

Version alternative B : Le signal se répète : le corps lit une continuité.
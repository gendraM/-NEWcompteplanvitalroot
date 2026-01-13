# 🟢 Fiche métier — Bilan hebdomadaire alimentaire (validation semaine)

## Objectif
Fournir à l’utilisateur un bilan motivant, pédagogique et personnalisé à la validation de sa semaine (dimanche soir après le dîner), pour l’aider à progresser, se situer, et rester motivé.

---

## Déclenchement & Archivage
- Le bilan n’est généré et affiché **qu’au moment où l’utilisateur valide la semaine** (action explicite, dimanche soir après le dîner).
- Le bilan est **archivé** et consultable plus tard, mais **n’est disponible que pour les semaines validées**.

---

## Structure du bilan (modale pop-up)

### 1. Titre & période
- **Titre** : « Bilan de ta semaine alimentaire »
- **Sous-titre** : « Semaine du [date début] au [date fin] »
- **Verbatim** : « Ton corps évolue dans le temps. Ce bilan te montre la trajectoire, pas un jugement. »

### 2. Axes d’analyse (semaine)
- **Extras consommés** : « Tu as consommé X extras cette semaine, soit Y% de ton budget hebdo. »
- **Équilibre calorique** : Total des calories consommées vs. objectif hebdo, jours de dépassement/sous-consommation.
- **Progression/tendance** : Tendance pondérale ou calorique sur 14 jours glissants, projection.
- **Points forts & axes d’amélioration** : Points positifs détectés, suggestions personnalisées, message motivation.

### 3. Mot doux de fin
- Exemple : « Cette semaine a été riche, mais pas de panique : ton corps a besoin de temps pour intégrer de nouvelles habitudes. L’important, c’est la régularité. Tu es sur la bonne voie ! »

### 4. Bouton “En savoir plus”
- Permet d’accéder à :
  - Tendance sur le mois (extras, calories, courbe)
  - Comparaison à l’objectif mensuel
  - Historique des bilans validés
  - Explications détaillées, conseils personnalisés

---

## Visuel utilisateur (wireframe simplifié)

```
┌──────────────────────────────────────────────────────────────┐
│  Bilan de ta semaine alimentaire                            │
│  Semaine du 05/01/2026 au 11/01/2026                        │
│  Ton corps évolue dans le temps. Ce bilan te montre la      │
│  trajectoire, pas un jugement.                              │
├──────────────────────────────────────────────────────────────┤
│  • Extras consommés : 3/5 (60% du budget hebdo)             │
│  • Calories totales : 1720 kcal / 2000 kcal                 │
│  • Jours respectés : 5/7                                    │
│  • Tendance 14j : Maintien                                  │
│  • Points forts : régularité, moins d’extras                │
│  • À améliorer : répartir les extras, viser 6/7 jours ok    │
│                                                            │
│  Cette semaine a été riche, mais pas de panique : ton corps │
│  a besoin de temps pour intégrer de nouvelles habitudes.    │
│  L’important, c’est la régularité. Tu es sur la bonne voie !│
├──────────────────────────────────────────────────────────────┤
│  [En savoir plus]                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Workflow utilisateur

1. **L’utilisateur saisit ses repas et extras toute la semaine.**
2. **Dimanche soir (après le dîner), il clique sur “Valider ma semaine”.**
3. **La modale bilan s’affiche automatiquement** avec le résumé de la semaine (voir visuel ci-dessus).
4. **L’utilisateur peut lire son bilan, puis cliquer sur “En savoir plus”** pour accéder à la tendance mensuelle, à l’historique, et à des conseils détaillés.
5. **Le bilan est archivé** et consultable dans l’historique des bilans validés.
6. **La nouvelle semaine commence** (remise à zéro des compteurs hebdo, conservation de la tendance sur 14j/mois).

---

## Points clés UX
- Bilan uniquement après validation explicite de la semaine.
- Ton bienveillant, pédagogique, jamais culpabilisant.
- Double niveau : synthèse hebdo immédiate + détail mensuel/historique accessible.
- Archivage automatique pour suivi de la progression.

---

**À valider avant toute implémentation.**

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


donnée complementaires :

Ton corps évolue dans le temps.
Ce bilan te montre la trajectoire, pas un jugement

TITRE ÉCRAN
Bilan de ta semaine (Semaine du 05/01 au 11/01)
SOUS-TEXTE
Ton corps se construit sur des moyennes. Ce bilan te donne la trajectoire, pas un verdict.
BOUTON PRINCIPAL
Comprendre en détail (ouvre une page “Détails & conseils” avec sections)

AXE 1. BUDGET EXTRAS ET PLAISIR CONSCIENT
Objectif : rendre l’utilisateur lucide sur le plaisir, sans culpabilité.
Affichages clés :
Budget extras hebdo : X kcal


Consommé : Y kcal


Écart : +/– Z kcal


Nombre d’extras (et répartition par type) :

 mini / normal / 2x / majeur


“Moments extras” : combien ont été planifiés vs impulsifs (si tu as l’info, sinon “non disponible” en mode test)


Lecture motivationnelle (message dynamique) :
Si sous budget :

 “Tu as laissé volontairement de l’espace. C’est là que la perte se crée.”


Si budget dépassé :

 “Semaine plus riche. Pas grave : on se recalibre. Ce qui compte, c’est la répétition, pas la perfection.”


Mini-action pour la semaine prochaine (1 phrase) :
“Choisis 1 extra à planifier dès lundi. Le reste restera plus simple.”


Bouton “En savoir plus” section :
Détails extras (liste + catégories + règles “Extra = hors repas”, et “extra majeur = impact fort”)

AXE 2. TRAJECTOIRE ÉNERGÉTIQUE ET TENDANCE (7 JOURS + 14 JOURS)
Objectif : ancrer le concept “le changement se fige sur 14 jours glissants” et éviter la panique.
Affichages clés :
Résumé tendance 7 jours :

 Perte / Maintien / Surplus (avec intensité : léger / net)


Message de stabilité :

 “La journée isolée ne décide de rien. La moyenne sur 7 jours parle.”


Bloc “14 jours glissants” (pédagogique) :

 “Les habitudes se voient et se fixent surtout sur 14 jours. Une semaine riche ne t’annule pas.”


Option graphique simple (si possible plus tard) :
Courbe (ou barre) “extras kcal par jour” sur 7 jours


Et une ligne “budget cible” hebdo divisée /7 pour donner un repère

 Même si l’UI n’est pas parfaite, ça donne une conscience immédiate.


Mini-action :
Si surplus :

 “Prochain ajustement simple : –1 extra normal OU +1 journée sans extra.”


Si déficit fort :

 “Trajectoire forte : veille à ta satiété et à ton énergie.”


Bouton “En savoir plus” section :
Comprendre la trajectoire (explication 3j/7j/14j + projection douce)

AXE 3. RÉGULARITÉ ET STRUCTURE DES REPAS
Objectif : distinguer “extras hors repas” vs “équilibre repas” (ton point clé).
Affichages clés (selon ce que ton app stocke déjà) :
Nombre de jours “structurés” (petit-déj / déjeuner / dîner) vs jours désorganisés


Répartition “extras hors repas” :

 matin / après-midi / soir / nuit


Signal comportemental :

 “Extras plutôt le soir/nuit = souvent fatigue/charge mentale, pas un manque de volonté.”


Message doux, non punitif :
“Ton rythme explique une partie de tes choix. On va rendre la semaine prochaine plus facile, pas plus stricte.”


Mini-action :
“Prévois une collation structurée (yaourt + fruit) à l’heure où tu craques d’habitude.”


ou “Décale ton ‘vrai’ dîner un peu plus tard si tu travailles tard.”


Bouton “En savoir plus” section :
Rythme & faim (fin de journée = sommeil, collation tardive structurée, etc.)

AXE 4. COMPÉTENCE CLÉ : LA FERMETURE (STOP CONSCIENT)
Objectif : travailler exactement ce que tu as décrit : accepter la fin, éviter “foutu pour foutu”.
Affichages clés (même si c’est simple au début) :
“Nombre de fermetures réussies” (si tu peux le capter via un bouton “J’ai fermé” après un extra)

 Sinon version MVP :


“Moment le plus dur identifié” (ex : après 21h / après un extra sucré)


“Déclencheur dominant” :

 fatigue / stress / travail tard / social


Message signature :
“Tu n’as pas renoncé. Tu as choisi le moment.”
“Dire non maintenant, ce n’est pas dire non pour toujours.”
Mini-action très concrète :
“Semaine prochaine : 1 seul objectif de maîtrise”

 Exemple :

 “Après un extra sucré : je bois un verre d’eau + je range le paquet.”

 (simple, réaliste, répétable)


Bouton “En savoir plus” section :
Rituel de fermeture (3 étapes : nommer la fin / futur visible / gain)

STRUCTURE UI RECOMMANDÉE (lecture facile)
1 écran = 4 cartes (une par axe) + 1 zone “1 action pour demain”
Chaque carte :
3 chiffres max


1 phrase de lecture


1 suggestion micro-action


Tout le reste dans “En savoir plus”.

TONE & MESSAGES (ce que tu veux)
Si semaine riche :
“Cette semaine a été plus riche. Ton corps n’est pas en échec : il s’adapte. On construit sur 14 jours glissants. Reviens lundi avec 1 décision simple, pas une punition.”
Si semaine alignée :
“Tu as été constante. Tu as laissé de l’espace et tu as tenu la trajectoire. Continue : la répétition crée le résultat.”

BONUS : LE BOUTON “EN SAVOIR PLUS” (où ça mène)
Une page/onglet “Détails de la semaine” avec :
Détail extras (liste + moments + types)


Graph tendance 7 jours (extras kcal/j)


Explication 14 jours glissants


Conseils personnalisés (2–3 max)





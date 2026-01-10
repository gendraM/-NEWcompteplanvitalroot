# 📱 SCÉNARIO MARIE : Mode Avancé en Situation Réelle

**Date** : 9 janvier 2026  
**Objectif** : Démontrer le fonctionnement concret du Mode Avancé avec budget calorique

---

## 👤 PROFIL MARIE

**Informations** :
- Femme, 32 ans
- Taille : 168 cm
- Poids : 75 kg
- Activité : Modérée
- Objectif : **Perte de poids**

**Calculs automatiques app** :
- BMR = 1450 kcal/jour (métabolisme de base)
- TDEE = 2248 kcal/jour (maintien calorique)
- Déficit visé = -500 kcal/jour
- **Budget extras hebdo** = **400 kcal/semaine**

---

## 📅 DÉROULÉ SEMAINE (Lundi au Dimanche)

### 🟢 LUNDI - Premier Extra (Biscuit)

**Action** : Marie mange 2 biscuits Prince

**Saisie app** :
```
┌──────────────────────────────────────────┐
│ Saisir un aliment                        │
├──────────────────────────────────────────┤
│ Aliment : Prince (2 biscuits)            │
│ Catégorie : Extra                        │
│ Calories : 90 kcal                       │
│                                          │
│ Type d'extra :                           │
│ ● Mini-extra (80-120 kcal)               │
│ ○ Extra (180-250 kcal)                   │
│ ○ 2-extras (300-400 kcal)                │
│ ○ 3-extras (700-900 kcal)                │
│                                          │
│ [Valider]                                │
└──────────────────────────────────────────┘
```

**Budget mis à jour** :
```
┌──────────────────────────────────────────────┐
│ 💰 Budget Extras Cette Semaine              │
├──────────────────────────────────────────────┤
│ Total : 400 kcal                             │
│ Consommé : 90 kcal                           │
│ Réservé : 0 kcal                             │
│ ════════════════════════════════════════════ │
│ 💡 DISPONIBLE : 310 kcal                     │
│                                              │
│ 📊 [████████████████░░░░] 22% utilisé        │
└──────────────────────────────────────────────┘
```

---

### 🟡 MERCREDI - Planification Cinéma

**Action** : Marie prévoit un pop-corn pour samedi

**Interface app** :
```
┌──────────────────────────────────────────────┐
│ 📅 Planifier un Extra                        │
├──────────────────────────────────────────────┤
│ Nom : Pop-corn cinéma                        │
│ Date : Samedi 12 janvier 2026                │
│                                              │
│ Type d'extra :                               │
│ ○ Mini-extra (90 kcal)                       │
│ ○ Extra (220 kcal)                           │
│ ● 2-extras (350 kcal) ← Sélectionné          │
│ ○ 3-extras (800 kcal)                        │
│                                              │
│ Contexte (optionnel) :                       │
│ Cinéma avec Julie                            │
│                                              │
│ [Annuler] [Planifier]                        │
└──────────────────────────────────────────────┘
```

**⚠️ ALERTE APP (CRITIQUE)** :
```
┌──────────────────────────────────────────────┐
│ ⚠️ Budget insuffisant                        │
├──────────────────────────────────────────────┤
│ Budget total : 400 kcal                      │
│ Déjà consommé : 90 kcal                      │
│ Tu veux réserver : 350 kcal                  │
│                                              │
│ Budget RÉELLEMENT libre après : -40 kcal ❌  │
│                                              │
│ ⚠️ Conséquence :                             │
│ • Si tu planifies cet extra, tu seras        │
│   en négatif de -40 kcal cette semaine       │
│ • Cela peut créer une zone de maintien       │
│   (contraire à ton objectif : perte)         │
│                                              │
│ 💡 Options :                                 │
│ 1. Planifier quand même (déconseillé)        │
│ 2. Choisir un extra plus petit (220 kcal)    │
│ 3. Annuler                                   │
│                                              │
│ [Option 1] [Option 2] [Annuler]              │
└──────────────────────────────────────────────┘
```

**Choix Marie** : Elle planifie quand même (Option 1)

**Budget mis à jour** :
```
┌──────────────────────────────────────────────┐
│ 💰 Budget Extras Cette Semaine              │
├──────────────────────────────────────────────┤
│ Total : 400 kcal                             │
│                                              │
│ ✅ Consommé : 90 kcal (biscuit lundi)        │
│ 🔒 Réservé : 350 kcal (pop-corn samedi)      │
│    └─ Non disponible pour autre extra        │
│                                              │
│ ════════════════════════════════════════════ │
│ 💡 DISPONIBLE : -40 kcal ⚠️                  │
│                                              │
│ ⚠️ Budget dépassé                            │
│ Rappel objectif : Déficit pour perte         │
│                                              │
│ 📅 Extras planifiés :                        │
│  • Pop-corn - Samedi 12/01 - 350 kcal        │
│    Contexte : Cinéma avec Julie              │
│    [Annuler la planification]                │
└──────────────────────────────────────────────┘
```

**🎨 Affichage visuel** :
- Budget "Réservé" = **grisé** (non dispo)
- Budget "Disponible" = **rouge** si négatif
- Icône 🔒 pour indiquer "bloqué"

---

### 🟠 JEUDI - Envie de Dessert

**Action** : Marie veut manger une part de gâteau

**Interface app** :
```
┌──────────────────────────────────────────────┐
│ Saisir un aliment                            │
├──────────────────────────────────────────────┤
│ Aliment : Part de gâteau                     │
│ Catégorie : Extra                            │
│ Calories : 220 kcal                          │
│                                              │
│ Type d'extra : Extra (220 kcal)              │
│                                              │
│ ⚠️ ATTENTION                                 │
│ Disponible : -40 kcal                        │
│ Si tu valides : -260 kcal au total           │
│                                              │
│ Impact : Zone de maintien (contraire         │
│ à ton objectif perte)                        │
│                                              │
│ Conscientisation :                           │
│ Rappel : Profil créé pour PERTE              │
│ Dépasser régulièrement = maintien            │
│                                              │
│ [Annuler] [Je comprends, valider]            │
└──────────────────────────────────────────────┘
```

**Choix Marie** : Elle annule (sage décision !)

**Budget** : Reste à -40 kcal (réservé samedi)

---

### 🔵 SAMEDI - Cinéma (Extra Planifié)

**Action** : Marie au cinéma, elle commande son pop-corn

**Déclenchement automatique app** :
```
┌──────────────────────────────────────────────┐
│ 🎬 Extra planifié détecté                    │
├──────────────────────────────────────────────┤
│ Tu as un extra planifié pour aujourd'hui :   │
│                                              │
│ Pop-corn cinéma - 350 kcal                   │
│ Contexte : Cinéma avec Julie                 │
│                                              │
│ C'est bien cet extra ?                       │
│                                              │
│ [Oui, c'est ça] [Non, autre chose]           │
└──────────────────────────────────────────────┘
```

**Marie valide**

**Budget mis à jour** :
```
┌──────────────────────────────────────────────┐
│ 💰 Budget Extras Cette Semaine              │
├──────────────────────────────────────────────┤
│ Total : 400 kcal                             │
│                                              │
│ ✅ Consommé : 440 kcal                       │
│   • Biscuit lundi : 90 kcal                  │
│   • Pop-corn samedi : 350 kcal               │
│                                              │
│ Réservé : 0 kcal                             │
│                                              │
│ ════════════════════════════════════════════ │
│ DÉPASSEMENT : -40 kcal ⚠️                    │
│                                              │
│ 📊 [████████████████████] 110% utilisé       │
└──────────────────────────────────────────────┘
```

**Vérification Tendance 14 jours** :

App calcule automatiquement :

```javascript
// Tendances énergétiques
cumul_7j = -1200 kcal   // Déficit
cumul_14j = -2400 kcal  // Déficit

// Classification
tendance_7j = 'perte'   // OK
tendance_14j = 'perte'  // OK
```

**Message app** :
```
┌──────────────────────────────────────────────┐
│ 📊 TA SITUATION CETTE SEMAINE                │
├──────────────────────────────────────────────┤
│ Budget extras : 400 kcal                     │
│ Tu as consommé : 440 kcal                    │
│                                              │
│ Détail :                                     │
│ • Lundi : Biscuit (90 kcal)                  │
│ • Samedi : Pop-corn (350 kcal)               │
│                                              │
│ ⚠️ Surplus extras : +40 kcal                 │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ 💡 MAIS PAS DE PANIQUE                       │
│                                              │
│ La prise ou la perte de poids,               │
│ ça se joue sur une ÉCHELLE DE TEMPS.         │
│                                              │
│ Tendance sur 7 derniers jours :              │
│ ✅ Déficit de -1200 kcal                     │
│                                              │
│ Ton objectif : PERTE                         │
│ Ton statut : ✅ SUR TRAJECTOIRE              │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ 🎯 SI TU CONTINUES comme cette semaine :     │
│ Sur les 7 prochains jours : environ -150g    │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ 💪 TU AS 7 JOURS pour équilibrer             │
│                                              │
│ Recommandation pour la semaine prochaine :   │
│ • Vise 350 kcal d'extras max                 │
│   (au lieu de 400 kcal habituels)            │
│ • Cela compensera le léger surplus           │
│ • Et renforcera ta progression      │
│                                              │
│ Ou alors :                                   │
│ • Garde ton budget de 400 kcal d'extras,     │
│   mais utilise seulement 80-90%              │
│   (ne pas tout consommer systématiquement)   │
│                                              │
│ [J'ai compris] [En savoir plus ⓘ]            │
└──────────────────────────────────────────────┘
```

**Explication "déficit intact 14j"** :

Le budget extras (400 kcal) est une **marge de plaisir** DANS le déficit global. Même si Marie dépasse de 40 kcal ce budget, sa consommation alimentaire totale reste en déficit par rapport à son TDEE (2248 kcal).

Exemple chiffré :
- TDEE Marie : 2248 kcal/jour
- Apports moyens 7j : 2077 kcal/jour (avec les extras)
- Déficit moyen : -171 kcal/jour
- Cumul 7j : -171 × 7 = **-1197 kcal** (≈ -1200 kcal)

Donc : Budget extras dépassé ≠ Perte annulée (tant que déficit global maintenu)

---

### 🟣 DIMANCHE - Fin de Semaine (Rituel de Fermeture)

**Déclenchement automatique** : 21h00 dimanche

**Modal Rituel de Fermeture** :
```
┌──────────────────────────────────────────────┐
│ ✨ ÉTAPE 1 : Nommer la fin                   │
├──────────────────────────────────────────────┤
│ Cette semaine est terminée.                  │
│ Une nouvelle commence demain.                │
│                                              │
│ D'autres moments viendront.                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 📊 ÉTAPE 2 : Rendre le futur visible         │
├──────────────────────────────────────────────┤
│ Budget extras cette semaine :                │
│ • Budget : 400 kcal                          │
│ • Consommé : 440 kcal                        │
│ • Dépassement : -40 kcal                     │
│                                              │
│ 🔄 Renouvellement : Demain (lundi)           │
│ Nouveau budget : 400 kcal                    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 💪 ÉTAPE 3 : Transformer en gain             │
├──────────────────────────────────────────────┤
│ Tu as dépassé ton budget extras cette        │
│ semaine, mais tu as fait des choix :         │
│                                              │
│ • Jeudi : Tu as annulé le gâteau             │
│ • Tu décides de t'arrêter, car tu prends     │
│   conscience que demain est un autre jour.   │
│ • Tu fais un pas de plus vers ton bien-être. │
│                                              │
│ Tendance globale 7 jours : -1200 kcal ✅     │
│ Trajectoire : Perte maintenue                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ � TA SITUATION CETTE SEMAINE                │
├──────────────────────────────────────────────┤
│ Budget extras : 400 kcal                     │
│ Tu as consommé : 440 kcal                    │
│                                              │
│ Détail :                                     │
│ • Lundi : Biscuit (90 kcal)                  │
│ • Samedi : Pop-corn (350 kcal)               │
│                                              │
│ ⚠️ Aujourd'hui : Surplus de 40 kcal          │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ 💡 MAIS PAS DE PANIQUE                       │
│                                              │
│ La prise ou la perte de poids,               │
│ ça se joue sur une ÉCHELLE DE TEMPS.         │
│                                              │
│ Tendance sur 7 derniers jours :              │
│ Tu es en DÉFICIT de -1200 kcal               │
│                                              │
│ Ton objectif : PERTE                         │
│ Ton statut : ✅ SUR TRAJECTOIRE              │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ 🎯 SI TU CONTINUES comme les 7 derniers j :  │
│                                              │
│ Sur les 7 prochains jours : environ -150g    │
│ D'ici fin janvier (13 jours) : environ -300g │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ 💪 TU AS 7 JOURS pour équilibrer             │
│                                              │
│ Recommandation pour la semaine prochaine :   │
│ • Vise 350 kcal d'extras max                 │
│   (au lieu de 400 kcal habituels)            │
│ • Cela compensera le léger surplus           │
│ • Et renforcera ta progression      │
│                                              │
│ Ou alors :                                   │
│ • Garde ton budget de 400 kcal d'extras,     │
│   mais utilise seulement 80-90%              │
│   (ne pas tout consommer systématiquement)   │
│                                              │
│ [J'ai compris] [En savoir plus ⓘ]            │
└──────────────────────────────────────────────┘
```

**Explication "projection sur la durée"** :

**AVANT (abstrait)** : Formules, calculs techniques ❌  
**APRÈS (concret)** : Situation + Action ✅

**📊 Message contextualisé** :

```
┌─────────────────────────────────────────────┐
│ TA SITUATION                                │
├─────────────────────────────────────────────┤
│ Cette semaine :                             │
│ • Extras consommés : 440 kcal               │
│ • Budget : 400 kcal                         │
│ • Surplus : +40 kcal                        │
│                                             │
│ MAIS                                        │
│ • Tendance 7j : -1200 kcal (déficit)        │
│ • Objectif : PERTE                          │
│ • Statut : ✅ Sur trajectoire               │
│                                             │
│ PAS DE PANIQUE                              │
│ Perte/prise = échelle de temps              │
│                                             │
│ SI tu continues comme cette semaine :       │
│ 7 prochains jours : environ -150g           │
│                                             │
│ TU AS 7 JOURS pour rectifier                │
│ Recommandation : Vise 350 kcal la semaine   │
│ prochaine (au lieu de 400)                  │
└─────────────────────────────────────────────┘
```

**💡 Valeur ajoutée de la tendance** :

La tendance n'est affichée QUE si elle **permet d'agir** :

1️⃣ **Rectifier trajectoire** :
- "Tu es en surplus extras, MAIS tendance 7j OK"
- "Action : Réduis à 350 kcal semaine prochaine"

2️⃣ **Encourager** :
- "Tu as économisé 100 kcal cette semaine"
- "Tendance 7j : -1400 kcal (excellent !)"
- "Continue comme ça, tu renforces ta perte"

3️⃣ **Alerter avec solution** :
- "Tendance 7j : +500 kcal (surplus)"
- "Action : Réduis extras à 300 kcal cette semaine"
- "Ou : Ajoute 20 min marche/jour"

**❌ Ce qu'on NE fait PAS** :
- Afficher juste "-171 kcal/jour" sans contexte
- Formules techniques sans action
- Info brute non actionnable

---

### 📱 Bouton "En savoir plus ⓘ" (facultatif)

Si l'utilisateur clique sur "En savoir plus", ALORS on affiche les détails techniques :

```
┌─────────────────────────────────────────────┐
│ ⓘ COMMENT C'EST CALCULÉ ?                   │
├─────────────────────────────────────────────┤
│ L'app mesure sur 14 jours :                 │
│ • Apports réels vs TDEE                     │
│ • Moyenne déficit : -171 kcal/jour          │
│                                             │
│ Projection :                                │
│ -171 × 7 = -1197 kcal ÷ 7700 = -155g        │
│                                             │
│ Variations possibles :                      │
│ • Eau ±1-2 kg                               │
│ • Glycogène ±500g                           │
│ → Poids balance ≠ Graisse perdue            │
└─────────────────────────────────────────────┘
```

Mais **par défaut**, on affiche la version **actionnab le**.

---

## 📊 COMPARAISON MODE SIMPLE vs MODE AVANCÉ

| Moment | Mode Simple | Mode Avancé (Marie) |
|--------|------------|---------------------|
| **Lundi biscuit** | ❌ "1/1 extra utilisé" → Quota épuisé | ✅ "90/400 kcal" → Reste 310 kcal |
| **Mercredi planif** | ❌ Impossible de planifier | ⚠️ Planifié avec alerte budget insuffisant |
| **Jeudi dessert** | ❌ "0/1 extra" → Frustration | ⚠️ Alerte déficit, Marie choisit d'annuler |
| **Samedi cinéma** | ❌ Culpabilité ou frustration | ✅ Extra planifié validé |
| **Bilan semaine** | "2 extras (quota: 1)" → Échec ressenti | "440/400 kcal, tendance 7j: -1200" → Nuancé |

---

## ✅ AVANTAGES MODE AVANCÉ

1. **Granularité** : Biscuit ≠ Pizza (90 kcal ≠ 800 kcal)
2. **Planification** : Événements gérables sans culpabilité
3. **Conscience** : Alertes pédagogiques (pas punitives)
4. **Tendances** : Vue 7j/14j (pas binaire OK/KO)
5. **Projection** : Chiffres précis (pas abstraits)
6. **Autonomie** : Choix éclairés (pas règles rigides)

---

## 🎯 MESSAGES CLÉS

**Budget réservé** :
> "Les 350 kcal planifiés pour samedi sont déjà engagés. Ton budget réellement disponible est de -40 kcal. Si tu consommes un autre extra, tu dépasseras ton budget et cela peut ralentir ta perte."

**Déficit 14j intact** :
> "Ton budget extras est dépassé cette semaine, MAIS ta consommation énergétique globale reste en déficit par rapport à ton maintien (TDEE). Ta progression continue."

**Projection précise** :
> "Sur 7 prochains jours : environ -150g | Sur 30 jours : environ -650g. Ceci est une tendance, pas une promesse."

**Rituel fermeture** :
> "Tu décides de t'arrêter, car tu prends conscience que demain est un autre jour. Tu fais un pas de plus vers ton bien-être."

---

**Document créé le** : 9 janvier 2026  
**Auteur** : GitHub Copilot  
**Statut** : ✅ SCÉNARIO VALIDÉ  
**Intégration** : Retours utilisateur pris en compte

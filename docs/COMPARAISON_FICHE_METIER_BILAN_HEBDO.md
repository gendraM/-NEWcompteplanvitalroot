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


Step 3 du plan d implémentation section 2
New approche
👉 Changement de rôle de la moyenne 14j

La moyenne 14j doit répondre à UNE seule question :

“Est-ce qu’un schéma est en train de s’installer ou pasSur les 14 derniers jours, l’écart moyen est de +135 kcal/jour au-dessus de l’objectif.

Puis IMMÉDIATEMENT :

⚠️ Cette moyenne est influencée par la semaine précédente, plus proche de l’équilibre.
La semaine en cours, elle, s’éloigne davantage.7️⃣ La bonne hiérarchie mentale (à respecter partout)

1️⃣ Semaine en cours → ce que tu viens de faire
2️⃣ Comparaison N / N-1 → est-ce que tu ajustes ou répètes
3️⃣ Moyenne 14j → est-ce que ça commence à s’imprimer

👉 La moyenne 14j confirme une direction, elle ne la décide pas ; surplus sur 2 semaines consécutives

Un schéma commence à se fixer.
La direction prise s’éloigne de l’équilibre que tu as choisi.

⚪ Si stabilité (ton cas “confus”)

L’écart avec l’objectif reste quasiment identique.
Le corps perçoit une continuité, pas un ajustement.

👉 Pas de progrès. Pas de dégradation. Répétition.

🟢 Si amélioration

L’écart avec l’objectif se réduit.
Le corps perçoit un changement dans la direction prise.



new comprehension tendance jours !
🎯 Le vrai objectif de la partie chiffrée (à ne jamais perdre de vue)

La partie chiffrée ne sert pas à dire “bien / pas bien”.
Elle sert à faire passer 3 idées clés :

Chaque action compte (chaque repas, chaque jour)

Mais c’est la répétition dans le temps qui décide

On ajuste une trajectoire, pas une journée

👉 Les chiffres doivent raconter le temps, pas le condamner.

🧠 Le problème actuel (et tu l’as très bien vu)

Si tu balances juste :

Total 14j : +1 890 kcal

Moyenne : +135 kcal/jour

👉 l’utilisateur :

soit ne comprend pas ce que ça représente

soit minimise (“c’est rien 135 kcal”)

soit se perd (“mais cette semaine c’était +978 ?!”)

Donc il faut mettre les chiffres en mouvement.

✅ Structure recommandée – PARTIE CHIFFRÉE (claire + consciente)
📊 Lecture sur 14 jours — ce qui s’accumule

Bloc 1 — Le cumul (vision globale)

Sur les 14 derniers jours :
Ton corps a reçu +1 890 kcal au-dessus de ton objectif.

Puis immédiatement une clé de lecture :

Pris isolément, chaque jour peut sembler anodin.
Mais sur 14 jours, ces écarts s’additionnent et commencent à orienter la trajectoire.

👉 Tu introduis la notion de construction, pas de faute.

📊 Bloc 2 — La moyenne (rythme réel du corps)

Cela représente une moyenne de +135 kcal par jour au-dessus de l’objectif.

Et surtout la phrase essentielle (ADN Plan Vital) :

Le corps ne réagit pas aux journées isolées,
il réagit à ce rythme répété jour après jour.

👉 Là, la moyenne prend du sens.
Ce n’est plus un chiffre, c’est un tempo.

📊 Bloc 3 — Mise en perspective avec les semaines (ancrage temporel)

Détail des deux semaines :
• Semaine N-1 : +912 kcal
• Semaine N : +978 kcal

Puis la traduction consciente (très importante) :

Les deux semaines sont au-dessus de l’objectif,
avec un écart très proche d’une semaine à l’autre.

👉 Tu montres la répétition, pas la gravité.

🧭 Traduction Plan Vital (le lien entre chiffres et conscience)

C’est ici que tu fais le pont entre maths et vécu :

Cela signifie que, sur deux semaines consécutives,
le corps reçoit un message de continuité plutôt que d’ajustement.

Ou variante (selon ton ton préféré) :

Sur la durée, le corps perçoit une direction stable,
même si chaque journée te semble différente.

🪜 Message clé à faire passer (et à répéter partout)

Tu peux même le figer comme micro-verbatim récurrent :

Une journée ne décide rien.
Une semaine oriente.
Deux semaines commencent à s’imprimer.

Ça, c’est ultra puissant.
Et 100 % aligné avec ce que tu veux transmettre.

❌ Ce qu’il faut absolument éviter dans la partie chiffrée

❌ Dire “proche de l’objectif” quand il y a surplus répété

❌ Laisser penser que la moyenne “efface” une semaine chargée

❌ Comparer les chiffres sans traduction humaine

Les chiffres sans interprétation consciente = anxiogènes ou anesthésiants.0 

NEW A PRENDRE EN compte la plus récente !
📌 INSTRUCTIONS À DESTINATION DE COPILOT — MODULE BILAN & TRAJECTOIRE (PLAN VITAL)
🎯 Objectif général

Ce module a pour but de donner une lecture consciente de la trajectoire dans le temps, et non un jugement ponctuel.
Les données chiffrées servent à raconter ce qui se construit sur la durée, pas à sanctionner une journée ou une semaine.

Le verbatim ci-dessous constitue la référence sémantique et conceptuelle de l’application.
Il ne doit pas être modifié, seulement adapté par déclinaisons cohérentes selon les situations prévues par les règles métier.

🧭 PRINCIPES FONDAMENTAUX À RESPECTER (OBLIGATOIRES)

Ne jamais juger (pas de “bien / mal”, pas de culpabilisation)

Ne jamais donner d’ordres ou de conseils directs

Toujours parler en trajectoire, direction, chemin, rythme

Toujours rappeler que :

une journée ne décide rien

c’est la répétition dans le temps qui oriente

Les chiffres doivent toujours être interprétés, jamais laissés seuls

📊 VERBATIM DE RÉFÉRENCE — PARTIE CHIFFRÉE (À CONSERVER EN L’ÉTAT)
Lecture sur 14 jours — ce qui s’accumule

Sur les 14 derniers jours :
Ton corps a reçu +1 890 kcal au-dessus de ton objectif.

Pris isolément, chaque jour peut sembler anodin.
Mais sur 14 jours, ces écarts s’additionnent et commencent à orienter la trajectoire.

Lecture du rythme réel

Cela représente une moyenne de +135 kcal par jour au-dessus de l’objectif.

Le corps ne réagit pas aux journées isolées,
il réagit à ce rythme répété jour après jour.

Mise en perspective temporelle (semaines)

Détail des deux semaines :
• Semaine N-1 : +912 kcal
• Semaine N : +978 kcal

Les deux semaines sont au-dessus de l’objectif,
avec un écart très proche d’une semaine à l’autre.

Traduction consciente (indispensable)

Cela signifie que, sur deux semaines consécutives,
le corps reçoit un message de continuité plutôt que d’ajustement.

Ancrage Plan Vital (phrase clé récurrente)

Une journée ne décide rien.
Une semaine oriente.
Deux semaines commencent à s’imprimer.

🔁 RÈGLE D’ADAPTATION DES VARIANTES (SANS SORTIR DU VERBATIM)

Copilot peut :

reformuler légèrement certaines phrases

varier la syntaxe ou le rythme

adapter le ton (plus doux / plus factuel / plus incarné)

Copilot ne doit jamais :

changer le sens

introduire des termes externes (signal, alerte, faute, vigilance, danger…)

transformer une observation en recommandation

Chaque variante doit toujours :

parler de trajectoire / direction / continuité

relier le chiffre au temps

rappeler implicitement que l’ajustement est possible

🧠 RÈGLE D’INTERPRÉTATION DES DONNÉES

Le cumul 14j sert à montrer ce qui s’accumule

La moyenne journalière sert à montrer le rythme perçu par le corps

Les comparaisons hebdomadaires servent à identifier :

amélioration

reproduction du même schéma

éloignement progressif

Aucune donnée chiffrée ne doit être affichée sans traduction humaine.

❌ INTERDIT DANS CE MODULE

“Tu devrais…”

“Attention…”

“Alerte…”

“Déséquilibre…”

“Risque…”

Toute formulation morale ou prescriptive

✅ FINALITÉ DU MODULE

Aider l’utilisateur à :

comprendre ce qui se joue dans le temps

reprendre du pouvoir par la conscience

ajuster sans pression

sortir du “tout ou rien”

👉 Ce texte est la base de référence.
👉 Copilot doit s’y conformer strictement.
👉 Les adaptations ne sont autorisées qu’à partir de ce socle, jamais en dehors.
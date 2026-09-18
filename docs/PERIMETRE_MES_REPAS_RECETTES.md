# Périmètre fonctionnel — Mes repas & recettes

> Document de référence du chantier `recettes-intelligentes-planning-suivi`.
> En cas de doute, revenir à ce document avant de développer.

## 1. Finalité

Le chantier réduit la charge mentale au moment de choisir quoi manger et raccorde ce choix aux moteurs déjà présents.

```
"Qu'est-ce que je mange ?"
→ Mes repas & recettes
→ quelques choix pertinents
→ Préparer maintenant OU Ajouter à mon planning
→ repas composé / moteurs existants
→ Suivi réel
→ satiété + ressentis + historique
→ valeurs sûres / OBSERVE
→ ALIGN → ADAPT → GROW
```

La recette ou proposition n'est ni un deuxième moteur alimentaire ni un nouveau système de développement personnel.

## 2. Expérience cible figée

Entrées principales : **Prêt en moins de 10 min · Moins de 30 min · Mes valeurs sûres · Déjà prévu cette semaine · Bien vécu les dernières fois**.

Une fiche peut afficher nom, ingrédients/quantités structurés, préparation, temps et difficulté. Les calories utilisent le moteur alimentaire existant. Actions principales : **Préparer maintenant · Ajouter à mon planning · Modifier**.

Une proposition IA reste temporaire tant que l'utilisateur ne choisit pas explicitement de l'enregistrer.

### Préparer maintenant
Le choix est transformé en repas composé. L'utilisateur confirme ce qu'il a réellement mangé ou ajuste les quantités. Les lignes réelles sont envoyées à Suivi par la persistance existante, sans nouvelle recherche des aliments ni recalcul parallèle.

### Ajouter à mon planning
Le même choix est transformé dans le contrat du planning existant et bénéficie ensuite des déplacements et de la liste de courses existants.

### Après consommation
Restituer des observations personnelles (« chez toi, ce repas a été associé à une satiété satisfaisante 5 fois sur 6 »), jamais une propriété générale non démontrée (« ce repas est rassasiant »).

## 3. Contextes de déclenchement — AVANT / MAINTENANT / PENDANT / APRÈS

**Mes repas & recettes est une capacité transversale, pas uniquement une page.** Tous les points d'entrée doivent converger vers le même moteur.

### A. Entrée volontaire
L'utilisateur demande explicitement de l'aide : « Qu'est-ce que je mange ? », « Je veux manger rapidement », « Que faire avec poulet + courgettes ? ». Le module peut alors proposer 2–3 choix pertinents.

### B. Depuis Planning — AVANT
Quand l'utilisateur organise sa semaine ou un repas :
- composer lui-même ;
- choisir une valeur sûre ;
- trouver quelque chose de rapide ;
- réutiliser un repas connu.

Le module s'insère dans le flux Planning sans créer un second calendrier.

### C. Aide contextuelle depuis Suivi — AVANT le prochain repas
Le module peut détecter **une occasion d'aider pendant une autre action**, sans supposer l'état émotionnel de l'utilisateur.

Exemple validé : jeudi, l'utilisateur saisit son déjeuner dans Suivi. Le dîner du soir n'est pas planifié et/ou le lendemain comporte des repas non planifiés. Une sollicitation légère peut apparaître :

> Ton dîner de ce soir n'est pas encore prévu. Tu veux qu'on t'enlève ça de la tête ?
>
> ⚡ J'ai peu de temps · 🙂 J'ai un peu de temps · Pas maintenant

Si l'utilisateur accepte, le module exploite ce qui est réellement connu et propose quelques choix : valeur sûre rapide, repas enregistré pertinent, repas déjà connu ou, plus tard, nouvelle proposition.

**Ne jamais conclure automatiquement** « tu n'as rien planifié donc tu vas faire un extra ». Une relation entre absence d'anticipation et extras ne peut être restituée que si l'historique individuel la soutient réellement.

### D. PENDANT — exécuter sans ressaisie
Après « Préparer maintenant », afficher le repas choisi, sa préparation et ses quantités. L'utilisateur confirme ou modifie. Il ne reconstruit pas son assiette.

### E. APRÈS — apprendre
Suivi conserve le réel : quantités, calories, satiété, ressentis. Quand les occurrences deviennent suffisantes, l'application restitue les observations et peut faire émerger des valeurs sûres.

### F. Boucle vers le prochain AVANT
L'expérience passée améliore les choix futurs :

```
AVANT : je choisis
→ PENDANT : je prépare / mange
→ APRÈS : j'observe
→ prochain AVANT : l'application réutilise ce qui fonctionne chez moi
```

## 4. Règles anti-intrusion pour les suggestions contextuelles

Une suggestion contextuelle est une **offre d'aide**, jamais une injonction.

Elle doit respecter au minimum :
- un besoin observable : repas futur réellement non planifié ;
- une proximité temporelle pertinente ;
- pas de supposition « fatigue », « flemme », « risque d'excès » sans donnée ;
- possibilité immédiate de répondre **Pas maintenant** ;
- ne pas répéter la même sollicitation après un refus récent ;
- ne pas interrompre la saisie du repas en cours ;
- limiter la fréquence des sollicitations ;
- ne proposer que quelques options après acceptation.

Les seuils précis de fréquence/proximité seront définis et testés avant implémentation. Ils ne doivent pas être inventés dans l'UI.

## 5. Valeurs sûres et OBSERVE / ALIGN

Une valeur sûre est fondée sur l'expérience réelle répétée de l'utilisateur, pas sur une étiquette « healthy ». `repasReperes` doit être réutilisé/étendu, pas remplacé.

Mes repas & recettes nourrit OBSERVE → ALIGN → ADAPT → GROW avec des données réelles. Il ne crée aucun système de points nutritionnels ni un deuxième moteur de développement personnel.

## 6. Briques existantes à réutiliser

- `lib/repasComposes.js` : composition, ajustement, planning et occurrences réelles.
- `components/GestionRepasComposes.js` : modèles réutilisables.
- `components/SaisieRepasCompose.js` : consommation d'un modèle, ajustement, satiété, ressenti, note.
- `lib/repasPersistence.js` + `pages/suivi.js` : persistance réelle.
- `lib/planificationRepas.js` : contrat planning.
- `lib/socleQuantitesCalories.js` : quantités/calories.
- `lib/listeCoursesGenerale.js` : courses à partir du planning.
- `lib/repasReperes.js` : valeurs sûres.
- Supabase : `repas_complets`, `repas_planifies`, `repas_reels`, `occurrence_repas_id`.

La branche parallèle `planification-gamification-chatgpt` possède la composition pédagogique, les capsules nutrition/cuisson et le pont vers les défis. Ne pas les recréer ici.

## 7. Ce qui n'est pas validé

Ne pas créer sans démonstration du besoin : deuxième moteur repas/calories/planning/courses/valeurs sûres, score nutritionnel concurrent, mécanique OBSERVE/ALIGN propre aux recettes, bibliothèque IA automatique, nouvelle table ou identité Supabase.

La migration `supabase/migrations/20260918_recettes_identite_modele.sql` est une hypothèse technique **non validée et non appliquée**.

## 8. Matrice UX → existant → manque réel

| Entrée / besoin | Existant | Manque réel | Décision minimale |
|---|---|---|---|
| Mes valeurs sûres | `repasReperes` + occurrences + satiété/ressenti | historique ancien partiellement non groupable ; durée absente | réutiliser/étendre, ne pas recréer |
| Bien vécu les dernières fois | `repas_reels` + regroupement/signaux | présentateur orienté dernières expériences | fonction pure, pas de table |
| Déjà prévu cette semaine | `repas_planifies` | présentation comme carte de choix | adapter le planning existant |
| <10 min / <30 min | repas composés sans durée | **durée structurée** | définir le minimum à l'étape 2 |
| Préparer maintenant | `SaisieRepasCompose` fait déjà ajustement/calories/Suivi | re-sélection manuelle du modèle | permettre le préchargement direct |
| Ajouter au planning | `PlanificateurRepas` sait charger/planifier | pas d'entrée directe depuis le choix | contrat de préchargement |
| Courses | `listeCoursesGenerale` depuis `repas_planifies` | aucun manque recette | aucun moteur supplémentaire |
| Calories | moteurs existants | aucun | réutilisation stricte |
| Je veux manger rapidement | sources disponibles séparément | orchestrateur + durée | moteur de sélection pur après contrat |
| IA sous contraintes | référentiel + calories + repas composé | contrat commun de sortie | IA seulement après contrat |
| Suggestion depuis Suivi | Suivi connaît date/repas saisi ; planning connaît les repas futurs | règle de détection + contexte d'appel + anti-répétition | construire plus tard un déclencheur contextuel réutilisant le même moteur |

## 9. Étape 2 — contrat fonctionnel minimal « choix repas »

**Aucune migration Supabase pour cette étape.** Le contrat est d'abord un objet métier en mémoire et testable.

Il doit permettre à une même proposition de provenir d'un repas composé, d'une valeur sûre, d'un repas planifié ou plus tard d'une proposition IA.

### Informations minimales du choix

Conceptuellement :

```js
{
  source,                 // repas_compose | valeur_sure | planning | ia...
  sourceId,               // si la source possède déjà un identifiant
  titre,
  composition,            // aliments + quantités + unités + kcal issues des moteurs existants
  preparation,            // facultatif
  dureeMinutes,           // facultatif tant qu'inconnue
  difficulte,             // facultatif
  observation,            // fait personnel vérifiable, facultatif
  actions                 // préparer / planifier / modifier / éventuellement enregistrer
}
```

Ce contrat **n'est pas une nouvelle entité persistée**. C'est un adaptateur commun entre les sources existantes et l'expérience utilisateur.

### Contexte d'appel séparé du repas

Le contexte ne doit pas polluer le modèle du repas. Il accompagne la demande :

```js
{
  origine,                // volontaire | suivi | planning
  dateCible,
  typeRepasCible,         // dîner, déjeuner...
  contrainteTempsMinutes, // uniquement si connue/exprimée
  repasNonPlanifie,       // fait issu du planning
  intention               // rapide, valeur_sure, etc.
}
```

Important : ne jamais encoder comme fait `fatigue=true` ou `risqueExtra=true` simplement parce que l'utilisateur n'a rien planifié.

### Pourquoi séparer choix et contexte ?

Le **choix** décrit ce qui peut être mangé/préparé. Le **contexte** explique pourquoi et où l'aide est demandée. Ainsi, le même repas peut être proposé depuis Planning, depuis Suivi ou depuis « Qu'est-ce que je mange ? » sans être dupliqué.

## 10. Plan d'action restant

1. **Contrat minimal :** créer les adaptateurs purs des sources existantes vers « choix repas » + tests.
2. **Préparer maintenant :** rendre le flux repas composé préchargeable depuis un choix.
3. **Planifier :** brancher le même choix sur le planificateur existant.
4. **Déclencheur contextuel Suivi :** détecter un prochain repas non planifié, appliquer les règles anti-intrusion, puis ouvrir le même moteur.
5. **Historique / valeurs sûres :** restitution et extensions uniquement si nécessaires.
6. **Qu'est-ce que je mange ? :** orchestrateur déterministe renvoyant quelques propositions.
7. **IA sous contraintes :** seulement après stabilisation du contrat ; proposition temporaire par défaut.
8. **OBSERVE / ALIGN :** raccord aux moteurs existants.

## 11. Critère de réussite

Depuis une demande volontaire **ou une occasion d'aide pertinente détectée dans Suivi/Planning**, l'utilisateur obtient quelques choix utiles, peut préparer ou planifier immédiatement, puis enregistrer le réel sans ressaisie inutile. L'historique améliore progressivement les choix futurs sans jugement ni sollicitation envahissante.

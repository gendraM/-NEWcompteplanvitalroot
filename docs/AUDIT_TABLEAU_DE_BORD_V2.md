# Chantier Tableau de bord V2 — Audit fonctionnel & UX

## 1. Cadre du chantier

Branche de travail : `tableau-de-bord-v2`  
Branche de référence : `main-consolidation`  
Cible d'intégration future : `main-consolidation` uniquement.  
`main` est hors périmètre.

### Règles de sécurité
- Aucune perte de fonctionnalité.
- Aucun merge automatique vers `main` ou `main-consolidation`.
- Aucune suppression de fonctionnalité ou résolution destructive sans validation explicite.
- Les règles métier restent portées par leurs modules canoniques ; le tableau de bord les restitue sans les réinventer.
- Absence de donnée ≠ échec utilisateur.
- Les états incomplets, retours après interruption et périodes sans suivi doivent être traités explicitement et sans jugement.

## 2. Mission du tableau de bord

Le tableau de bord doit permettre à l'utilisateur de comprendre rapidement son parcours sans sacrifier la profondeur d'analyse.

Principe :
**Couche 1 : comprendre → Couche 2 : analyser → Module : agir / explorer.**

Le tableau de bord ne doit pas afficher tout ce que Mon Plan Vital sait au premier regard. Il doit afficher ce qu'il est utile de savoir maintenant, tout en laissant toute la profondeur accessible à la demande.

## 3. Audit de l'existant

La page actuelle dispose déjà d'une matière riche :
- période semaine / mois / année ;
- évolution du poids ;
- Extras, historique et progression ;
- Fast-food, historique, délai et récompenses ;
- satiété / faim ;
- humeur ;
- Idéaux ;
- préparation au jeûne ;
- badges ;
- validation rétrospective des semaines ;
- graphiques et timeline ;
- raccourcis vers les modules.

### Forces
- Beaucoup de données du parcours sont déjà exploitables.
- La page couvre plusieurs dimensions, pas uniquement le poids.
- L'historique et les mécanismes de progression existent déjà.
- Le tableau de bord peut devenir le point de lecture transversal de l'application.

### Écarts
1. Trop d'informations sont présentées au même niveau.
2. Poids et Extras sont représentés plusieurs fois.
3. Les badges complets, Fast-food détaillé, timeline Extras et historiques spécialisés prennent trop de place dans une page de synthèse.
4. La moyenne de poids est moins pertinente que départ → tendance → aujourd'hui → objectif.
5. Certains graphiques et périodes ne sont pas cohérents entre eux.
6. Certaines formulations historiques sont trop binaires ou punitives.
7. Plusieurs calculs sont effectués localement dans le tableau de bord alors que les modules métier évoluent.
8. Certaines sources sont fragiles ou transitoires (ex. données locales de préparation au jeûne).
9. La page juxtapose des statistiques mais raconte encore insuffisamment le parcours.
10. Une simplification seule ferait perdre la profondeur voulue à l'origine.

## 4. Architecture UX validée

### Couche 1 — Vue principale : « Où j'en suis ? »

Objectif : lecture en environ 10 secondes.

Ordre proposé :
1. **Mon chemin maintenant** — synthèse courte et contextualisée.
2. **3 indicateurs prioritaires maximum** — variables selon le parcours.
3. **Mes highlights du moment** — progrès ou constance réellement observés.
4. **Ce qui m'aide / À observer** — points d'appui et fragilités sans jugement.
5. **Mon évolution** — un seul espace graphique avec sélecteur Poids / Extras / Repas / Bien-être.
6. **En ce moment** — défi actif + Idéal/cap actif.
7. Accès clair à **Détails & analyses**.

La page principale ne doit pas reproduire les pages Défis, Idéaux, Extras, Jeûne ou Suivi.

### Couche 2 — « Détails & analyses »

Cette couche conserve la profondeur.

Entrées prévues :
- Poids
- Extras
- Repas & faim/satiété
- Bien-être / humeur
- Défis
- Idéaux
- Jeûne / reprise
- Badges
- Fast-food
- Validation & régularité

Chaque domaine présente une synthèse puis permet d'ouvrir ses données détaillées : évolution, historique, constance, événements, comparaisons et informations métier pertinentes.

Filtres possibles selon les données :
- semaine ;
- mois ;
- année ;
- période personnalisée lorsque cela apporte une vraie valeur.

### Couche 3 — Module métier

Depuis l'analyse détaillée, l'utilisateur peut rejoindre le module concerné pour agir ou explorer davantage.

Exemple :
Dashboard → Extras détaillés → module Extras.

## 5. Principes de restitution

### Highlights
Un highlight n'est pas obligatoirement un badge. Il peut refléter :
- une constance ;
- une amélioration ;
- une routine qui s'installe ;
- un palier maintenu ;
- un défi terminé ;
- une évolution favorable objectivement observable.

### Points d'appui / À observer
Le langage suit la philosophie Mon Plan Vital :
**observer → comprendre → ajuster**, jamais sanctionner.

Exemples :
- « Ton palier Extras est stable depuis 5 semaines. »
- « Tes repas du midi sont particulièrement réguliers. »
- « Les Extras se concentrent davantage en fin de semaine. »

Les corrélations ne doivent être présentées comme telles que si les données sont suffisantes. Pas de causalité inventée.

## 6. Données à raccorder aux chantiers existants

Le tableau de bord devra consommer les résultats stabilisés de :
- Extras et progression de paliers ;
- Défis V2 ;
- Idéaux finalisés ;
- Align-Life ;
- planification et suivi réel ;
- faim / satiété ;
- humeur / bien-être ;
- poids ;
- jeûne / reprise ;
- Fast-food ;
- badges et régularité.

L'intégration se fera progressivement selon l'état réel des branches. Le tableau de bord ne doit pas recopier leurs règles métier.

## 7. États indispensables

Prévoir explicitement :
- nouvel utilisateur ;
- données insuffisantes ;
- semaine partiellement renseignée ;
- période sans saisie ;
- retour après une longue interruption ;
- données disponibles sur un module mais pas un autre ;
- progression stable sans changement spectaculaire.

La constance et la reprise doivent pouvoir être valorisées.

## 8. Résultat cible

Le nouveau tableau de bord doit fournir :
- moins de bruit au premier regard ;
- aucune perte de profondeur ;
- une lecture plus humaine du parcours ;
- des données fiables et explicables ;
- une navigation progressive ;
- des highlights motivants ;
- des fragilités visibles sans culpabilisation ;
- une continuité avec les autres chantiers de Mon Plan Vital.

**Principe final : l'essentiel immédiatement, la profondeur à la demande, le module pour agir.**

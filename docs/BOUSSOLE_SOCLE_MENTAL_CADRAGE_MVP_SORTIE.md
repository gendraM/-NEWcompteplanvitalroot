# Boussole / socle mental — cadrage fonctionnel MVP de sortie

**Date : 1er septembre 2026**  
**Branche : `Ideo`**  
**Statut : cadrage fonctionnel — aucun code applicatif modifié**  
**Document parent : `docs/ETAT_DES_LIEUX_IDEAUX.md`**

---

## 1. Objet de cette mise à jour

Ce document consigne les décisions prises après le dernier état des lieux global concernant le **parcours progressif de la boussole**, l’usage ciblé de l’IA et le passage de la direction intérieure à l’incarnation réelle.

Il ne remplace pas `ETAT_DES_LIEUX_IDEAUX.md`. Il constitue le journal de cadrage détaillé de la prochaine étape fonctionnelle, afin de ne pas modifier le code avant validation du parcours.

---

## 2. Moment 1 — La graine

### Décision

Le premier niveau de la boussole réutilise **Mon Pourquoi** existant au lieu de créer immédiatement un nouvel écran ou un nouveau module.

Parcours :

**Objectif concret / poids → Mon Pourquoi → début du parcours réel.**

`Mon Pourquoi` devient le **premier noyau de la boussole**, sans perdre son rôle historique : donner du sens, jamais devenir un objectif à atteindre.

### Règles

Au démarrage, ne pas demander simultanément : identité, valeurs, vision de vie, qualités, habitudes, futur soi, défis ou micro-actions.

La graine doit rester légère :

> **Je veux changer quelque chose. Voilà pourquoi cela compte pour moi.**

La formulation brute de l’utilisateur doit être conservée.

Le premier retour de Mon Plan Vital doit introduire l’idée que le parcours ne regardera pas uniquement le poids mais aussi ce qui change progressivement dans la manière de vivre.

### Interdits

- pas de vision board obligatoire ;
- pas de questionnaire de personnalité ;
- pas de liste de valeurs obligatoire ;
- pas de Défi créé automatiquement ;
- pas de gestionnaire de tâches supplémentaire ;
- pas de surcharge de l’onboarding.

---

## 3. Passage au Moment 2 : maturité d’usage, pas simple ancienneté

Le Moment 2 ne doit pas être déclenché arbitrairement à J+7.

Il devient pertinent lorsque l’utilisateur a **réellement commencé à vivre dans l’application** et que Mon Plan Vital dispose d’un minimum de matière issue du réel : plusieurs journées utilisées, plusieurs repas ou observations, et/ou un premier retour comportemental exploitable.

Les seuils exacts ne sont pas figés à ce stade. Ils devront être définis plus tard à partir du fonctionnement réel et testés en runtime.

Principe :

**la profondeur de la boussole augmente avec la maturité du parcours, pas avec le seul temps écoulé.**

---

## 4. Moment 2 — Qui je choisis de devenir

Question fonctionnelle de référence :

> **Au-delà du poids que tu veux atteindre, quelle personne aimerais-tu devenir dans ta manière de prendre soin de toi ?**

Le périmètre reste volontairement lié à Mon Plan Vital : corps, alimentation, bien-être, relation à soi et développement personnel directement connecté au parcours. La boussole n’a pas vocation à transformer l’application en gestionnaire complet de carrière, couple, argent ou organisation de toute la vie.

### Une seule direction identitaire, potentiellement multidimensionnelle

La formulation précédente « combien de personnes je veux devenir ? » est abandonnée.

Il ne s’agit pas de créer plusieurs identités ni de limiter artificiellement l’utilisateur à 1, 2 ou 3 « personnes ».

La boussole contient une **direction identitaire globale**, qui peut comporter plusieurs dimensions et évoluer avec le temps.

Exemple :

> « Je veux devenir une personne qui prend soin d’elle, qui ne s’abandonne plus lorsqu’elle fait une erreur et qui apprend à écouter son corps. »

Constance, écoute du corps, confiance ou capacité à revenir sont des facettes possibles d’une même direction, pas des identités séparées.

### Droit de ne pas savoir

L’utilisateur peut répondre qu’il ne sait pas encore. La boussole reste alors incomplète sans bloquer le parcours et sans relance culpabilisante.

Une direction peut être déclarée directement par l’utilisateur ou émerger plus tard de son expérience réelle. Dans tous les cas, **l’utilisateur reste propriétaire de la formulation qui décrit qui il choisit de devenir.**

---

## 5. IA — décision d’intégration dans la cible MVP de sortie

### Constat technique

Mon Plan Vital ne possède pas actuellement de LLM intégré. GitHub héberge le code mais n’apporte pas de compréhension du langage naturel à l’application.

Les logiques intelligentes actuelles reposent principalement sur des règles métier, calculs, données Supabase et conditions déterministes.

### Décision

L’usage ciblé d’une IA est retenu dans la **cible MVP de sortie** du nouveau socle lorsque cela apporte une valeur réelle, notamment pour aider l’utilisateur à clarifier ses propres mots.

La boussole doit néanmoins conserver une architecture contrôlée : l’IA ne remplace ni les règles métier ni la décision de l’utilisateur.

### Fonction V1 retenue : reformuler sans inventer

Exemple utilisateur :

> « J’en ai marre de faire n’importe quoi dès que je craque et de recommencer tous les lundis. »

L’IA peut proposer une reformulation fidèle, par exemple :

> « Je veux devenir quelqu’un qui sait continuer même après un écart. »

Puis l’utilisateur choisit :

**Ça me ressemble / Je modifie / Je refuse.**

La proposition IA ne devient une donnée validée de la boussole qu’après confirmation de l’utilisateur.

### Règles de sécurité fonctionnelle

L’IA peut :
- reformuler ;
- clarifier ;
- synthétiser une intention déjà exprimée ;
- plus tard, formuler certains retours GROW à partir de faits déjà vérifiés.

L’IA ne doit pas :
- inventer une identité ;
- décider qui est l’utilisateur ;
- poser un diagnostic psychologique ;
- transformer automatiquement une identité en Défi ;
- décider seule qu’une transformation a eu lieu ;
- remplacer les moteurs déterministes de calcul, détection et routage.

Principe d’architecture :

**les règles métier établissent les faits ; l’IA aide à comprendre ou formuler ; l’utilisateur garde la validation finale lorsqu’il s’agit de son identité.**

---

## 6. Architecture IA envisagée

Architecture cible simplifiée :

**Socle / boussole**  
↓  
**orchestration Mon Plan Vital**  
↙︎ règles métier — service IA ciblé ↘︎  
↓  
**expérience utilisateur**

La clé du fournisseur IA doit rester côté serveur et ne jamais être exposée dans le navigateur.

Les données envoyées doivent être minimisées : transmettre uniquement le contexte nécessaire à la tâche, et non l’historique complet ou des données personnelles inutiles.

La boussole ne doit pas dépendre entièrement de l’IA pour fonctionner. Une indisponibilité du service IA ne doit pas empêcher l’utilisateur de saisir, modifier ou utiliser sa direction.

---

## 7. Règle économique IA

Le coût IA ne doit pas être ignoré mais il ne doit pas non plus conduire à supprimer une fonctionnalité utile sans estimation réelle.

À chaque nouvelle capacité IA envisagée, le cadrage devra fournir au minimum :

1. une estimation pour **1 personne en test** ;
2. une estimation pour environ **20 utilisateurs réguliers par mois** ;
3. lorsque pertinent, le **coût moyen par utilisateur actif** à intégrer au modèle économique ;
4. une hypothèse de fréquence d’appels et de volume de contexte ;
5. le modèle envisagé et la possibilité d’utiliser un modèle plus économique pour les tâches simples.

Les estimations doivent être recalculées avec les tarifs API en vigueur au moment de l’implémentation ou de la commercialisation. Elles ne doivent pas être figées comme un coût permanent dans cette documentation.

---

## 8. Moment 3 — L’incarnation

Après le Pourquoi et la direction identitaire, la question devient :

> **Si tu commençais déjà à vivre comme cette personne, qu’est-ce qui serait différent dans ta manière d’agir avec toi-même ?**

Cette formulation est préférée à une question produisant directement une liste de tâches.

### Exemple

Direction :

> « Je veux devenir quelqu’un qui ne s’abandonne plus dès qu’elle fait un écart. »

Réponse utilisateur :

> « J’arrêterais de me dire que tout est foutu. Je reprendrais normalement au repas suivant au lieu d’attendre lundi. »

L’IA peut proposer une reformulation fidèle :

> « Après un écart, je reprends simplement au prochain repas au lieu d’abandonner le reste de ma journée. »

Après validation, cette formulation devient un **principe d’incarnation**.

### Ce qu’un principe d’incarnation n’est pas

Ce n’est :
- ni un objectif chiffré ;
- ni un Défi ;
- ni une habitude à cocher ;
- ni une règle alimentaire imposée ;
- ni une tâche quotidienne.

Il décrit comment la direction choisie peut commencer à prendre forme dans la vraie vie.

---

## 9. LIVE réutilise le réel existant

Une fois le principe d’incarnation défini, Mon Plan Vital ne crée pas automatiquement un nouveau programme.

Exemple :

**Boussole** : après un écart, je reprends au prochain repas.  
**Réalité** : un extra est enregistré.  
**LIVE** : le repas suivant est vécu et renseigné normalement.  
**OBSERVE** : le retour est constaté.  
**GROW** : l’application peut rendre visible que le comportement réel correspond à la transformation recherchée.

Le calcul ou la détection du fait doit rester déterministe lorsque les données le permettent : extra enregistré, repas suivant, délai de retour, continuité du suivi, etc.

L’IA peut ensuite être utilisée pour **formuler** un retour GROW contextualisé à partir de faits déjà établis.

Exemple de retour :

> « Tu avais choisi de ne plus attendre le “bon moment” pour revenir. Cette fois, tu es revenue dès le repas suivant. C’est exactement ce que tu voulais commencer à construire. »

---

## 10. Lien avec Idéaux

La boussole ne doit pas absorber Idéaux.

Exemple :

**Direction** : retrouver confiance dans ses capacités physiques.  
**Vie souhaitée** : pouvoir courir, voyager et bouger plus librement.  
**Aspiration concrète** : courir 6 km.  
**Idéaux** : transforme cette aspiration en objectif, paliers et actions.  
**LIVE** : les séances sont réellement vécues.  
**OBSERVE** : durée, distance, vitesse, régularité et difficultés.  
**ADAPT** : Idéaux ajuste la trajectoire.  
**GROW** : la progression réelle est reconnectée au sens initial.

La gamification peut célébrer la réalisation ; GROW explique ce que cette réalisation représente dans la transformation personnelle.

---

## 11. Point de conception désormais ouvert : « La vie que je veux créer »

La prochaine frontière fonctionnelle est la composante CREATE :

> **La vie que je veux créer.**

Elle ne doit pas être supprimée, car une qualité comme « être constante » n’est pas une vision de vie.

Exemples de projection vécue :
- avoir davantage d’énergie ;
- pouvoir courir ou bouger librement ;
- voyager sans que l’alimentation occupe toute la place mentale ;
- se sentir plus libre dans son corps ;
- vivre certaines expériences aujourd’hui empêchées ou limitées.

Le travail suivant doit définir comment permettre cette projection sans transformer Mon Plan Vital en application chargée de gérer l’ensemble de la carrière, de l’argent, du couple, de la maison, des voyages ou de toute l’existence.

---

## 12. Décisions consolidées depuis le dernier état des lieux

1. **Moment 1 = Mon Pourquoi comme graine initiale de la boussole.**
2. **Aucune surcharge identitaire au démarrage.**
3. **Moment 2 dépend d’une maturité d’usage, pas uniquement du nombre de jours écoulés.**
4. **« Qui je choisis de devenir » représente une direction identitaire globale et évolutive, pas plusieurs personnes.**
5. **L’utilisateur peut ne pas savoir et poursuivre normalement.**
6. **L’IA ciblée est retenue dans la cible MVP de sortie du socle.**
7. **Première fonction IA : reformuler sans inventer, avec validation/modification/refus par l’utilisateur.**
8. **La boussole doit rester fonctionnelle sans dépendance totale au LLM.**
9. **Les faits comportementaux restent calculés/détectés par les moteurs métier lorsqu’ils sont déterminables.**
10. **L’IA peut aider à formuler certains retours GROW à partir de faits vérifiés.**
11. **Chaque nouvelle fonction IA devra être accompagnée d’une simulation de coût test / 20 utilisateurs / coût unitaire lorsque pertinent.**
12. **Moment 3 transforme la direction en principes d’incarnation, jamais automatiquement en tâches ou Défis.**
13. **LIVE réutilise les moteurs et données existants.**
14. **Idéaux reste le moteur de transformation d’une aspiration concrète en trajectoire progressive et adaptative.**
15. **La prochaine conception porte sur “La vie que je veux créer” et sa frontière avec le périmètre de Mon Plan Vital.**

---

## 13. Prochaine étape

Poursuivre le cadrage fonctionnel de **« La vie que je veux créer »** avant toute implémentation technique du socle.

Questions à résoudre :
- quelle profondeur de projection proposer ;
- quelles dimensions relèvent légitimement de Mon Plan Vital ;
- comment accueillir une vision plus large sans chercher à gérer toute la vie ;
- comment relier cette vision aux Idéaux concrets ;
- comment éviter une nouvelle to-do list ;
- comment l’IA peut éventuellement aider sans inventer la vision de l’utilisateur ;
- comment cette projection évolue grâce à LIVE / OBSERVE / GROW.

**Aucun code applicatif n’est modifié à ce stade.**
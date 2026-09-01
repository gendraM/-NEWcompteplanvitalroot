# Boussole / socle mental — Log 02 : vision, découverte assistée et déclenchements GROW

**Date : 1er septembre 2026**  
**Branche : `Ideo`**  
**Statut : cadrage fonctionnel — aucun code applicatif modifié**  
**Suite de : `docs/BOUSSOLE_SOCLE_MENTAL_CADRAGE_MVP_SORTIE.md`**

---

## 1. Objet de ce log

Ce document consigne les décisions prises depuis le dernier log concernant :

- « La vie que je veux créer » ;
- la réduction de la charge cognitive et de l’effet « questionnaire de coaching » ;
- le double chemin **exprimer quand je sais / découvrir quand je ne sais pas** ;
- le rôle combiné de LIVE, OBSERVE, GROW et de l’IA ;
- les règles de déclenchement de la boussole ;
- le droit au silence de Mon Plan Vital ;
- l’architecture événementielle envisagée pour le socle.

Ce log complète le document précédent sans modifier le code applicatif.

---

## 2. Correction majeure : ne pas transformer la boussole en questionnaire de coaching

La proposition consistant à demander directement :

> « Si ton poids n’était plus le centre du problème, quelle vie aimerais-tu réellement construire ? »

n’est **pas retenue comme parcours de référence**.

### Motif

Même si la question peut être pertinente dans un contexte de coaching, elle crée dans une application :

- une charge cognitive importante ;
- une impression de devoir produire une « bonne réponse » ;
- de la lassitude ;
- un blocage lorsque l’utilisateur ne sait pas encore répondre ;
- un risque de transformer le socle en succession de grandes questions introspectives.

### Nouvelle règle

La boussole ne doit pas exiger que l’utilisateur sache définir sa vision ou son identité avant de commencer à vivre son parcours.

Principe :

> **Mon Plan Vital peut aider l’utilisateur à découvrir progressivement ce qui compte pour lui à partir de ce qu’il vit réellement.**

---

## 3. Double chemin : exprimer quand je sais / découvrir quand je ne sais pas

Le système doit permettre simultanément deux parcours.

### Chemin A — l’utilisateur sait déjà

S’il sait ce qu’il souhaite devenir, construire ou vivre, il doit pouvoir l’exprimer directement sans attendre que l’application le déduise.

Exemple :

> « Je veux devenir quelqu’un de plus constante, qui arrête de tout abandonner dès qu’elle fait une erreur. »

L’IA peut proposer une reformulation fidèle, mais l’utilisateur conserve le choix :

**Ça me ressemble / Je modifie / Je garde mes mots / Je refuse.**

La formulation validée devient une donnée de boussole.

### Chemin B — l’utilisateur ne sait pas

S’il répond « je ne sais pas » ou ne souhaite pas réfléchir à ce sujet, Mon Plan Vital ne déclenche pas une batterie de questions de remplacement.

Le parcours normal continue.

LIVE et OBSERVE accumulent progressivement de la matière réelle. GROW peut ensuite rendre visible une évolution ou une direction possible.

Exemple :

- auparavant, un extra pouvait provoquer plusieurs jours d’abandon ;
- désormais, l’utilisateur revient au repas suivant ;
- le moteur déterministe constate cette évolution ;
- GROW peut la rendre visible ;
- l’utilisateur peut reconnaître ou non qu’elle correspond à quelque chose qu’il souhaite construire.

### Règle consolidée

> **Exprimer quand je sais. Découvrir quand je ne sais pas. Continuer à évoluer dans les deux cas.**

Le fait d’avoir déjà déclaré une direction n’arrête jamais OBSERVE/GROW : la vie réelle peut enrichir ou nuancer la boussole plus tard.

---

## 4. La boussole devient vivante, pas « remplie puis terminée »

La boussole ne doit pas fonctionner comme :

**questionnaire → réponses enregistrées → terminé.**

Elle fonctionne plutôt comme :

**ce que je sais déjà de moi**  
+  
**ce que ma vie me fait découvrir**  
=  
**boussole évolutive.**

Une direction identitaire déclarée et une évolution observée peuvent coexister.

L’utilisateur reste toujours propriétaire de ce qui est reconnu comme faisant partie de son identité, de sa vision ou de sa transformation.

---

## 5. « La vie que je veux créer » : nouvelle définition fonctionnelle

« La vie que je veux créer » n’est plus conçue comme une étape obligatoire ni comme un formulaire de vision à cinq ans.

Elle devient une représentation évolutive de :

> **ce que l’utilisateur souhaite pouvoir vivre davantage.**

Elle peut être alimentée :

1. directement, lorsque l’utilisateur sait déjà l’exprimer ;
2. progressivement, à partir de sa vie réelle et d’éléments qu’il valide.

### Exemple volontaire

L’utilisateur peut exprimer :

> « J’aimerais pouvoir voyager sans me demander si je vais réussir à marcher toute la journée, remettre les vêtements que j’aime et arrêter de penser constamment à mon poids. »

L’IA peut organiser ce contenu sans inventer :

- liberté physique pendant les voyages ;
- liberté dans la manière de s’habiller ;
- réduction de la place mentale prise par le poids et l’alimentation.

L’utilisateur valide ou corrige cette lecture.

### Exemple émergent

Si l’utilisateur ne sait pas répondre à une question de vision, Mon Plan Vital peut observer que la liberté de mouvement revient dans plusieurs éléments explicites ou comportements du parcours.

GROW peut alors proposer une hypothèse légère :

> « Dans ce que tu construis, quelque chose semble revenir : pouvoir bouger plus librement et te sentir moins limitée physiquement. Est-ce que cela fait partie de ce que tu recherches ? »

L’utilisateur confirme ou refuse.

---

## 6. Vision large, action limitée au périmètre légitime de Mon Plan Vital

La boussole peut accueillir une vision de vie plus large que les fonctionnalités de l’application.

Principe :

> **La boussole peut voir plus large que ce sur quoi Mon Plan Vital agit.**

Exemple : un utilisateur peut parler de voyage, famille, activité professionnelle, liberté, confiance, corps ou énergie.

Mon Plan Vital peut conserver ces éléments comme contexte de sens, mais ne doit pas automatiquement devenir gestionnaire de carrière, finances, couple, parentalité, voyages ou organisation globale de la vie.

Il n’opérationnalise que les dimensions pour lesquelles ses moteurs ont une compétence réelle et cohérente avec le produit.

---

## 7. Territoire de vie ≠ objectif ≠ Idéal

Plusieurs expressions peuvent appartenir à un même territoire de vie sans devenir plusieurs objectifs.

Exemple :

- voyager ;
- courir avec ses enfants ;
- remettre certains vêtements ;
- être moins fatigué ;
- ne plus se cacher sur les photos.

Ces éléments peuvent exprimer un territoire plus large comme :

> **retrouver de la liberté dans mon corps.**

Les formulations originales restent importantes comme significations personnelles.

### Règle Idéaux

Une aspiration de la boussole ne devient pas automatiquement un Idéal.

Elle devient une trajectoire Idéaux seulement lorsqu’elle est suffisamment concrète **et que l’utilisateur choisit de travailler dessus**.

Exemple :

**Territoire de vie** : liberté physique.  
**Aspiration concrète** : pouvoir courir 6 km.  
**Choix utilisateur** : « je veux en faire quelque chose de concret ».  
**Idéaux** : objectif → paliers → actions → observation → adaptation.

---

## 8. OBSERVE + GROW : aider à découvrir sans psychanalyser

L’IA ne doit jamais recevoir l’historique complet avec une instruction du type :

> « Dis-moi quels sont ses rêves ou qui cette personne est. »

La découverte assistée doit partir de signaux légitimes :

- éléments explicitement écrits par l’utilisateur ;
- Mon Pourquoi ;
- éléments de boussole déjà validés ;
- Idéaux choisis ;
- objectifs déclarés ;
- comportements mesurables répétés ;
- évolutions factuelles calculées par les moteurs métier.

Architecture :

**données réelles → faits/signaux déterministes → éventuelle formulation IA → hypothèse → validation utilisateur.**

Jamais :

**données → IA → vérité psychologique sur l’utilisateur.**

---

## 9. La boussole ne réclame pas de l’attention selon un calendrier arbitraire

Une interaction de boussole ne doit pas apparaître simplement parce qu’un délai est écoulé.

Interdits de référence :

- « J+7 = identité » ;
- « J+14 = vision » ;
- pop-up introspectif hebdomadaire ;
- notification « complète ta boussole » ;
- obligation d’atteindre 100 % de complétion.

Principe :

> **Une interaction Boussole apparaît parce qu’il existe une raison utile de la proposer, pas parce qu’elle était prévue au calendrier.**

La boussole peut rester partiellement construite pendant longtemps sans que cela constitue un problème.

---

## 10. Quatre familles de déclenchement

### A. Ouverture volontaire par l’utilisateur

L’utilisateur peut ajouter spontanément quelque chose à sa boussole sans devoir choisir une catégorie psychologique avant d’écrire.

Exemple :

> « En fait, je veux aussi arrêter de me cacher sur les photos. »

Le système peut ensuite proposer un rattachement ou une reformulation, soumis à validation.

### B. Évolution réelle détectée par OBSERVE

Le moteur métier constate un pattern suffisamment étayé.

Exemple : amélioration répétée du délai de retour après un extra.

Le moteur détecte un fait comportemental, pas une identité.

GROW peut ensuite rendre ce changement visible et, si cela apporte une vraie valeur, proposer d’aider à mettre des mots dessus.

### C. Événement important naturellement porteur de sens

Exemple : un Idéal concret est atteint.

Le système peut produire un retour GROW sans nécessairement poser une question.

Exemple :

> « Tu avais associé cet objectif au fait de retrouver de la liberté dans ton corps. Aujourd’hui, une partie de cette liberté existe déjà dans ta vraie vie. »

GROW peut parfois simplement **montrer**, sans demander une nouvelle réponse.

### D. Moment difficile nécessitant ALIGN ou ADAPT

La boussole peut servir de rappel de direction mais jamais d’arme culpabilisante.

Interdit :

> « Tu t’éloignes de la personne que tu veux devenir. »

Approche retenue : rappeler une formulation validée avec bienveillance, puis laisser le moteur adapté prendre le relais si nécessaire.

Exemple :

> « Ces derniers jours semblent plus difficiles. Tu avais écrit que tu voulais arrêter de t’abandonner quand tout ne se passe pas comme prévu. Aujourd’hui n’a pas besoin d’être parfait pour que cette direction reste la tienne. »

Le relais peut ensuite être assuré par Suivi, un Défi approprié ou, plus tard, une Capsule/Porte selon le contexte.

---

## 11. Droit au silence : `NO_INTERVENTION`

Le moteur doit posséder explicitement un état où la meilleure décision est de ne rien dire.

Une intervention ne doit pas être déclenchée simplement parce que :

- un repas est enregistré ;
- deux bonnes journées ont eu lieu ;
- une donnée varie ;
- une semaine est passée ;
- l’IA serait capable de produire un message.

Avant toute intervention, l’orchestration devra vérifier au minimum :

1. **Nouveauté** — est-ce réellement nouveau ?
2. **Niveau de preuve** — les données sont-elles suffisantes ?
3. **Utilité** — ce message apporte-t-il quelque chose maintenant ?
4. **Saturation** — une intervention similaire a-t-elle déjà été envoyée récemment ?
5. **Contexte** — le moment est-il approprié, notamment au regard des signaux émotionnels disponibles ?

Si ces conditions ne sont pas réunies :

`NO_INTERVENTION`

Le silence est une décision fonctionnelle, pas une absence de fonctionnalité.

---

## 12. Architecture événementielle cible du socle

Le socle est désormais envisagé comme un moteur transversal événementiel :

**LIVE**  
L’utilisateur vit normalement dans Mon Plan Vital.  
↓  
**OBSERVE**  
Les moteurs existants captent les faits.  
↓  
**DETECT**  
Des événements ou patterns significatifs deviennent candidats.  
↓  
**DECIDE**  
Intervenir, proposer, orienter ou se taire.  
↓  
**ALIGN / GROW / ADAPT**  
Le bon type d’intervention est choisi.  
↓  
**IA ciblée si nécessaire**  
Elle formule à partir de faits bornés.  
↓  
**Utilisateur**  
Il conserve le dernier mot dès qu’une interprétation touche à son identité ou sa vision.

Exemples futurs de types d’événements internes :

- `RETURN_AFTER_EXTRA_IMPROVED` ;
- `IDEAL_MILESTONE_REACHED` ;
- `SATIETY_LISTENING_TREND` ;
- `REPEATED_DRIFT` ;
- `USER_EXPRESSED_NEW_ASPIRATION`.

Ces noms sont des exemples de cadrage, pas une implémentation validée.

---

## 13. IA : principe d’appel après détection, pas analyse permanente

Approche non retenue :

**historique complet → LLM quotidien → « que dois-je dire aujourd’hui ? »**

Approche retenue :

1. les moteurs Mon Plan Vital observent les données ;
2. ils détectent des événements candidats ;
3. l’orchestrateur décide si une intervention est justifiée ;
4. seulement si une formulation sémantique personnalisée apporte de la valeur, un appel IA est réalisé ;
5. l’IA reçoit des faits minimisés et bornés ;
6. elle formule sans inventer ni diagnostiquer.

Cette architecture réduit simultanément :

- les hallucinations ;
- les interprétations psychologiques abusives ;
- le coût API ;
- les messages inutiles ;
- l’exposition de données ;
- la dépendance au fournisseur IA.

---

## 14. Exemple de comportement silencieux sur une semaine

Un fonctionnement intelligent n’implique pas un message mental quotidien.

Exemple :

- lundi : repas enregistré → aucune intervention boussole ;
- mardi : extra → fonctionnement normal Extra ;
- mercredi : repas suivant normal → retour constaté mais pas encore assez de preuve pour GROW ;
- jeudi : satiété renseignée → aucune intervention ;
- vendredi : Défi utilisé → fonctionnement normal Défi ;
- samedi : rien ;
- dimanche : bilan ; si un pattern déjà suffisamment étayé existe, une seule observation GROW peut éventuellement apparaître.

Objectif UX : une intelligence discrète, pertinente et non bavarde.

---

## 15. Impact économique IA de cette architecture

Le principe économique du log précédent reste valide : chaque nouvelle fonction IA devra être simulée en coût test, environ 20 utilisateurs réguliers et coût moyen/utilisateur lorsque pertinent.

L’architecture événementielle réduit naturellement le nombre d’appels :

- les observations déterministes ne nécessitent pas de LLM ;
- `NO_INTERVENTION` ne nécessite aucun appel ;
- de nombreux événements peuvent utiliser des formulations déterministes ;
- l’IA n’est appelée que lorsque sa valeur sémantique justifie l’appel.

La précédente enveloppe prudente peut donc rester un plafond de conception provisoire, à recalculer avec les tarifs réels au moment de l’implémentation.

---

## 16. Décisions consolidées de ce log

1. **La grande question de vision de vie n’est plus le parcours obligatoire de référence.**
2. **La boussole ne doit pas devenir un questionnaire de coaching.**
3. **Deux chemins coexistent : expression volontaire et découverte assistée par le réel.**
4. **« Je ne sais pas » met fin aux questions ; le parcours normal continue.**
5. **Un utilisateur qui sait déjà peut répondre immédiatement et bénéficier de la reformulation IA.**
6. **Une direction déjà déclarée continue d’évoluer grâce à OBSERVE/GROW.**
7. **« La vie que je veux créer » est une représentation évolutive de ce que l’utilisateur souhaite vivre davantage, pas un formulaire à remplir.**
8. **La boussole peut accueillir une vision plus large que le périmètre d’action direct de l’application.**
9. **Une aspiration n’est jamais automatiquement transformée en Idéal.**
10. **Idéaux n’intervient qu’après concrétisation suffisante et choix de l’utilisateur.**
11. **Les faits/signaux doivent précéder l’interprétation IA.**
12. **L’IA ne psychanalyse pas et ne déduit pas seule l’identité ou les rêves.**
13. **Les interactions de boussole sont déclenchées par pertinence, pas par calendrier arbitraire.**
14. **Quatre familles de déclenchement sont retenues : volontaire, évolution observée, événement significatif, moment difficile.**
15. **`NO_INTERVENTION` est un état fonctionnel explicite du futur moteur.**
16. **La boussole devient un système transversal événementiel : LIVE → OBSERVE → DETECT → DECIDE → ALIGN/GROW/ADAPT.**
17. **L’IA est appelée après sélection d’un événement pertinent, pas en surveillance sémantique permanente de tout l’historique.**
18. **La prochaine étape de cadrage est GROW : définir ce qui constitue une preuve légitime de transformation et les limites d’interprétation.**

---

## 17. Prochaine étape

Concevoir précisément **GROW** avant implémentation :

- quelles transformations Mon Plan Vital est légitime à reconnaître ;
- quelles données peuvent constituer une preuve ;
- combien d’observations sont nécessaires selon le phénomène ;
- différence entre événement ponctuel, tendance et transformation ;
- comment relier un fait à une boussole validée sans surinterpréter ;
- quels messages peuvent être déterministes ;
- quels messages justifient une formulation IA ;
- quand demander validation ;
- quand simplement montrer une évolution ;
- quand rester silencieux.

**Aucun code applicatif n’est modifié à ce stade.**
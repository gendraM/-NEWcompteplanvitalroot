# Boussole / socle mental — Log 02 : vision, découverte assistée et déclenchements GROW

**Date : 1er septembre 2026**  
**Statut : cadrage fonctionnel — aucun code applicatif modifié**  
**Suite de : `docs/BOUSSOLE_SOCLE_MENTAL_CADRAGE_MVP_SORTIE.md`**

---

## 1. Objet

Ce log consigne les décisions concernant : « La vie que je veux créer », la réduction de l’effet questionnaire de coaching, le double chemin **exprimer quand je sais / découvrir quand je ne sais pas**, le rôle combiné de LIVE, OBSERVE, GROW et de l’IA, les déclenchements de la boussole, le droit au silence et l’architecture événementielle envisagée.

---

## 2. Ne pas transformer la boussole en questionnaire

La boussole ne doit pas exiger que l’utilisateur sache définir sa vision ou son identité avant de commencer à vivre son parcours.

> **Mon Plan Vital peut aider l’utilisateur à découvrir progressivement ce qui compte pour lui à partir de ce qu’il vit réellement.**

---

## 3. Double chemin

### L’utilisateur sait déjà

Il peut exprimer directement ce qu’il souhaite devenir, construire ou vivre. L’IA peut proposer une reformulation fidèle, mais l’utilisateur conserve le choix : **Ça me ressemble / Je modifie / Je garde mes mots / Je refuse.**

### L’utilisateur ne sait pas

Mon Plan Vital ne déclenche pas une batterie de questions de remplacement. LIVE et OBSERVE accumulent progressivement de la matière réelle. GROW peut ensuite rendre visible une évolution ou une direction possible, toujours soumise à reconnaissance de l’utilisateur lorsqu’elle touche à son identité.

> **Exprimer quand je sais. Découvrir quand je ne sais pas. Continuer à évoluer dans les deux cas.**

---

## 4. Boussole vivante

La boussole ne fonctionne pas comme : **questionnaire → réponses enregistrées → terminé.**

Elle fonctionne comme :

**ce que je sais déjà de moi + ce que ma vie me fait découvrir = boussole évolutive.**

L’utilisateur reste propriétaire de ce qui est reconnu comme faisant partie de son identité, de sa vision ou de sa transformation.

---

## 5. « La vie que je veux créer »

Elle devient une représentation évolutive de **ce que l’utilisateur souhaite pouvoir vivre davantage**.

Elle peut être alimentée directement lorsque l’utilisateur sait l’exprimer, ou progressivement à partir de sa vie réelle et d’éléments qu’il valide.

La boussole peut accueillir une vision plus large que les fonctionnalités de l’application, mais Mon Plan Vital n’opérationnalise que les dimensions pour lesquelles ses moteurs ont une compétence réelle.

---

## 6. Territoire de vie ≠ objectif ≠ Idéal

Plusieurs aspirations peuvent exprimer un territoire plus large, par exemple **retrouver de la liberté dans mon corps**.

Une aspiration de la boussole ne devient pas automatiquement un Idéal.

Elle devient une trajectoire Idéaux seulement lorsqu’elle est suffisamment concrète **et que l’utilisateur choisit de travailler dessus**.

Exemple :

**Territoire** : liberté physique.  
**Aspiration** : pouvoir courir 6 km.  
**Choix utilisateur** : je veux en faire quelque chose de concret.  
**Idéaux** : objectif → paliers → actions → observation → adaptation.

---

## 7. OBSERVE + GROW sans psychanalyser

La découverte assistée doit partir de signaux légitimes : éléments explicitement écrits, Mon Pourquoi, boussole validée, Idéaux choisis, objectifs déclarés, comportements mesurables répétés et évolutions factuelles calculées par les moteurs métier.

Architecture :

**données réelles → faits/signaux déterministes → éventuelle formulation IA → hypothèse → validation utilisateur.**

Jamais :

**données → IA → vérité psychologique sur l’utilisateur.**

---

## 8. Déclenchement par pertinence, pas calendrier

Une interaction Boussole apparaît parce qu’il existe une raison utile de la proposer, pas parce qu’elle était prévue à J+7 ou J+14.

Quatre familles de déclenchement sont retenues :

1. ouverture volontaire par l’utilisateur ;
2. évolution réelle détectée par OBSERVE ;
3. événement important naturellement porteur de sens ;
4. moment difficile nécessitant ALIGN ou ADAPT.

La boussole peut rester partiellement construite longtemps sans problème.

---

## 9. Droit au silence : `NO_INTERVENTION`

Avant toute intervention, l’orchestration doit vérifier au minimum : nouveauté, niveau de preuve, utilité, saturation et contexte.

Si les conditions ne sont pas réunies : `NO_INTERVENTION`.

Le silence est une décision fonctionnelle.

---

## 10. Architecture événementielle cible

**LIVE** → l’utilisateur vit normalement.  
**OBSERVE** → les moteurs existants captent les faits.  
**DETECT** → événements ou patterns candidats.  
**DECIDE** → intervenir, orienter ou se taire.  
**ALIGN / GROW / ADAPT** → choix du type d’intervention.  
**IA ciblée si nécessaire** → formulation à partir de faits bornés.  
**Utilisateur** → dernier mot sur identité et vision.

Exemples conceptuels d’événements : `RETURN_AFTER_EXTRA_IMPROVED`, `IDEAL_MILESTONE_REACHED`, `SATIETY_LISTENING_TREND`, `REPEATED_DRIFT`, `USER_EXPRESSED_NEW_ASPIRATION`.

---

## 11. IA après détection, pas surveillance permanente

Approche retenue :

1. moteurs Mon Plan Vital observent les données ;
2. ils détectent des événements candidats ;
3. l’orchestrateur décide si une intervention est justifiée ;
4. un appel IA n’est réalisé que si une formulation sémantique personnalisée apporte de la valeur ;
5. l’IA reçoit des faits minimisés et bornés ;
6. elle formule sans inventer ni diagnostiquer.

Cette architecture réduit hallucinations, interprétations abusives, coût API, messages inutiles, exposition de données et dépendance au fournisseur.

---

## 12. Décisions consolidées

- pas de questionnaire de coaching obligatoire ;
- exprimer quand je sais / découvrir quand je ne sais pas ;
- boussole vivante et évolutive ;
- vision potentiellement large mais action limitée au périmètre légitime de Mon Plan Vital ;
- aspiration ≠ objectif ≠ Idéal ;
- OBSERVE/GROW partent de faits légitimes ;
- déclenchement par pertinence ;
- `NO_INTERVENTION` est un état fonctionnel ;
- architecture événementielle ;
- IA après détection déterministe, pas analyse permanente.
# 🟢 TEMPLATE FINAL — PLAN D’IMPLÉMENTATION COPILOT (CONTRÔLE MAXIMAL)

## 🚨 RATIFICATION STRINGENTE : ÉTAPES ET CONTRÔLES INDISPENSABLES

**⚠️ AUCUNE modification de code (même minimale) ne doit être produite tant que toutes les étapes n'ont pas été accomplies ET validées par l’utilisateur de manière explicite.**

- Copilot ne peut procéder ou déclarer un produit final « terminé » qu’après **validation complète utilisateur à chaque étape**.
- Cette procédure garantit un produit final **fonctionnel, fiable et sans anomalie**, grâce au contrôle strict pendant et après l'implémentation.

```
Attention : Ce fichier/template lui-même ne doit JAMAIS être modifié sans faire l’objet d’une discussion, validation et traçabilité explicites.
```

---

## 🔒 RÈGLES ABSOLUES  
- **Aucune suppression massive ou automatisée sans justification explicite.**
  - ❌ **Interdit d’utiliser `sed` pour modification destructive/massive.**
  - ❌ Copilot ne doit **JAMAIS** supprimer > 10 lignes de code sans liste précise des suppressions, avec impact anticipé et validation utilisateur explicite.
  - ✅ Chaque suppression doit être justifiée, validée et suivie par l’utilisateur.
  
- **Bonnes pratiques Copilot à appliquer à CHAQUE étape :**
  1. 🔄 **Présenter TOUT code produit, modifié ou supprimé avant validation**.
  2. 🛠️ **Tester les modifications pour le comportement attendu et les cas limites.**
  3. 📋 Générer des rapports Markdown détaillés entre chaque étape (TRAÇABILITÉ OBLIGATOIRE).

---

# 🟢 STRUCTURE GÉNÉRALE

## Titre de la tâche  
_Décrire succinctement l’objectif principal de l’implémentation à réaliser._

### EXEMPLE : Enrichir `/pages/preparation-jeune.js` pour intégrer la progression utilisateur et une synthèse dynamique

---

### **1️⃣ Description précise de la modification attendue**
- Décrivez précisément ce qui est attendu, en **expliquant la fonctionnalité et son impact** dans le workflow utilisateur.
  
#### EXEMPLE :  
- Ajouter un **indicateur de progression utilisateur** et une synthèse dynamique dans le formulaire.
- Dynamiser l’affichage des données en fonction des réponses saisies.  

---

### **2️⃣ FICHIERS CONCERNÉS**
- Lister de manière exhaustive tous les fichiers qui seront affectés.  

#### EXEMPLE :  
- `/pages/preparation-jeune.js`  
- `/components/SynthesePreparation.js`  

---

## 🔍 ÉTAPES D’IMPLÉMENTATION 
_(Toutes les étapes doivent être validées avant passage à la suivante)_

---

### **3️⃣ Audit strict des risques**
1. **Évaluer et documenter TOUS les risques (technique, UX, sécurité, régression, etc.)** :  
   - ⚙️ Technique (mauvais placement des hooks / gestion d’état imprévisible).  
   - 👁️ Régression fonctionnelle.  
   - 🔓 Sécurité (fuite de données ou faille exploitée).  
   
2. **Checklist technique (React et Hooks)** :  
   - Vérifiez que tous les hooks React (e.g. `useEffect`, `useState`) sont **au bon emplacement**.  
   - Empêchez strictement leur usage dans des boucles, conditions ou fonctions imbriquées.  

#### EXEMPLES RISQUES/ROBUSTESSE À AUDITER :  
- ⚠️ Problème potentiel : Runtime error si un hook dépend de variables non initialisées.  
- ⚠️ UX : Perte d’état visuel si la déclaration des handlers est modifiée.

**Validez explicitement cet audit avant d’implémenter le moindre code.**

---

### **4️⃣ Plan de TESTS pré-implémentation**  
1. **Automatisation initiale :**
   - Utilisez un **linter** pour vérifier :  
     - L’ordre correct des hooks et leur portée.
     - Les dépendances correctes des tableaux (`useEffect`, etc.).

2. **Définissez des cas limite :**
   - Par exemple, tester les états où l'utilisateur initie mais abandonne une interaction.

#### OUTILS À UTILISER :
- ESLint (React Plugin actif).  
- Jest ou framework équivalent pour tests unitaires.  

---

## 🛠️ **ÉTAPES D’IMPLÉMENTATION PRATIQUES**
### Étape principale d’éxécution (code)
- Copilot réalise les modifications strictes **uniquement dans les fichiers validés ci-dessus.**
- Chaque segment de code modifié doit être communiqué **et approuvé** avant exécution.

---

## ✅ **CHECKLIST SÉCURITÉ AVANT VALIDATION FINALE**

Le produit final, avant validation, doit remplir **TOUTES CES CONDITIONS** :

1. **Sécurisation technique complète :**
   - Tous les hooks React (`useState`, `useEffect`, etc.) respectent strictement leur emplacement approprié (aucun dans des boucles, conditions, etc.).
   - Pas d’erreur ou de faille de compilation (lancer un Build).

2. **Traçabilité garantie :**
   - 📋 Rapport généré (via Markdown) pour enregistrer toutes les étapes avant/après.

3. **Tests complets :**
   - **PAS de warning runtime.**
   - Vérifiez plusieurs cas limites (valeurs nulles, absence de données, etc.).

---

### **POST-VALIDATION (Contrôles définitifs)**
Après implémentation, suivez ces étapes :
1. **Tests manuels & dynamiques :** Effectuez un parcours utilisateur **complet**.
2. **Contrôle d’erreurs & logs :** Validez que **TOUS LES LOGS sont propres.**
3. **Documentation et captures :** Générer des captures des outputs.
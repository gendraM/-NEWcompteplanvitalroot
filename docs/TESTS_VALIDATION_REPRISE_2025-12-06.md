# ✅ PROTOCOLE DE TESTS - Harmonisation SaisieDefiAlimentaire.js

**Date** : 06/12/2025  
**Fichier** : `components/SaisieDefiAlimentaire.js`  
**Backup** : `components/SaisieDefiAlimentaire.js.backup-2025-12-06`  
**Statut** : ⚠️ EN ATTENTE VALIDATION UTILISATEUR

---

## 🎯 OBJECTIF

Valider que toutes les corrections apportées fonctionnent correctement sans régression.

---

## 📋 CHECKLIST TESTS MANUELS (8/8 REQUIS)

### Test 1️⃣ : Autocomplete avec score QN

**Procédure** :
1. Ouvrir `/suivi` en mode test reprise (`test_modeRepriseActif = true`)
2. Dans le formulaire violet, saisir "bou" dans le champ "Aliment mangé"
3. Observer le dropdown qui apparaît

**Résultat attendu** :
- ✅ Dropdown s'affiche avec liste d'aliments contenant "bou"
- ✅ Chaque aliment affiche son score QN coloré :
  - QN ≥ 4 : vert (#22c55e)
  - QN ≥ 3 : orange (#f59e0b)
  - QN < 3 : rouge (#ef4444)
- ✅ Portion recommandée affichée entre () (ex: "Bouillon de légumes (200ml)")
- ✅ Hover change le background en gris (#f0f0f0)

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 2️⃣ : Pré-remplissage automatique catégorie + kcal

**Procédure** :
1. Dans le dropdown, cliquer sur "Bouillon de légumes"
2. Observer les champs catégorie, quantité et kcal

**Résultat attendu** :
- ✅ Champ "Aliment" = "Bouillon de légumes"
- ✅ Champ "Catégorie" = "boisson" (ou catégorie du référentiel)
- ✅ Champ "Quantité" = valeur portionDefaut (ex: "200")
- ✅ Champ "Kcal" = valeur calculée automatiquement

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 3️⃣ : Calcul automatique kcal selon quantité

**Procédure** :
1. Aliment = "Bouillon de légumes" (déjà rempli du test 2)
2. Modifier quantité de "200" → "400"
3. Observer le champ kcal

**Résultat attendu** :
- ✅ Kcal se met à jour automatiquement (doublement si quantité doublée)
- ✅ Label affiche "(calculées automatiquement)" en gris
- ✅ Aucune erreur console

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 4️⃣ : Validation repas Phase 1 autorisé

**Procédure** :
1. Vérifier que le bandeau violet affiche "Phase 1"
2. Sélectionner aliment autorisé Phase 1 (ex: "Bouillon de légumes")
3. Cocher "J'ai respecté une seule portion"
4. Cliquer "Valider l'étape"

**Résultat attendu** :
- ✅ Message vert "Bravo ! Repas enregistré..."
- ✅ Formulaire se réinitialise
- ✅ Aucun message d'erreur rouge
- ✅ Données enregistrées dans Supabase (table repas_reels)

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 5️⃣ : Warning pédagogique Phase 3 non autorisé

**Procédure** :
1. Forcer phase = 1 dans localStorage test
2. Sélectionner aliment Phase 3+ (ex: "Avocat")
3. Cocher confirmation
4. Cliquer "Valider"

**Résultat attendu** :
- ⚠️ Message jaune/orange avec :
  - "ℹ️ Cet aliment n'est pas encore recommandé. Il sera disponible en Phase 3."
  - "💡 Conseil : Attends quelques jours..."
  - "✅ Tu peux quand même enregistrer..."
- ✅ PAS de blocage (pas de return)
- ✅ Enregistrement possible malgré l'avertissement

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 6️⃣ : Warning horaires féculents Phase 4

**Procédure** :
1. Forcer phase = 4 dans localStorage test
2. Modifier heure du système ou champ heure → 20:00 (après 19h)
3. Sélectionner féculent (ex: "Riz basmati")
4. Cocher confirmation
5. Cliquer "Valider"

**Résultat attendu** :
- ⚠️ Message jaune avec :
  - "⚠️ Les féculents après 19h ne sont pas recommandés..."
  - "💡 Conseil : Privilégie les légumes, protéines..."
  - "✅ Tu peux quand même enregistrer..."
- ✅ PAS de blocage
- ✅ Enregistrement possible

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 7️⃣ : Console propre (aucun log)

**Procédure** :
1. Ouvrir DevTools (F12) → Console
2. Effectuer toutes les actions des tests 1-6
3. Observer les messages console

**Résultat attendu** :
- ✅ AUCUN log `[SaisieDefiAlimentaire] Props reçues`
- ✅ AUCUN log `[DEBUG SaisieDefiAlimentaire] Insertion repas_reels`
- ✅ AUCUN log `[DEBUG] Données envoyées à Supabase`
- ✅ Seuls logs légitimes : erreurs Supabase éventuelles

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 8️⃣ : Baromètre ressenti + Signaux satiété

**Procédure** :
1. Remplir formulaire (aliment, quantité, etc.)
2. Cliquer sur icône "😊 Satisfait" dans le baromètre
3. Cocher 2 signaux : "Ventre qui se resserre" + "Perte d'envie de manger"
4. Valider le formulaire
5. Vérifier dans Supabase table `repas_reels`

**Résultat attendu** :
- ✅ Icône "😊 Satisfait" s'affiche avec border bleu 3px
- ✅ Background change en couleur (#ffe082)
- ✅ Checkboxes cochées restent cochées
- ✅ Dans Supabase :
  - Colonne `ressenti` = "satisfait"
  - Colonne `details_signaux` = ["Ventre qui se resserre", "Perte d'envie de manger"]

**Statut** : [ ] PASS | [ ] FAIL

---

## 🔍 TESTS SUPPLÉMENTAIRES (OPTIONNELS)

### Test 9️⃣ : Unité dynamique affichée

**Procédure** :
1. Sélectionner "Huile d'olive" (unité = CS)
2. Observer label du champ Quantité

**Résultat attendu** :
- ✅ Label affiche "Quantité (cuillère(s) à soupe) :"

**Statut** : [ ] PASS | [ ] FAIL

---

### Test 🔟 : Portion recommandée sous champ aliment

**Procédure** :
1. Saisir "Bouillon de légumes"
2. Observer sous le champ aliment

**Résultat attendu** :
- ✅ Texte gris "📏 Portion recommandée : 200ml"
- ✅ Affichage sous le champ, pas dans le dropdown

**Statut** : [ ] PASS | [ ] FAIL

---

## 📊 RÉSUMÉ FINAL

**Tests critiques** : __ / 8 PASS  
**Tests optionnels** : __ / 2 PASS  

**Verdict** :
- [ ] ✅ **CONFORME** - Tous les tests critiques passent → Prêt pour commit
- [ ] ⚠️ **PARTIEL** - 6-7/8 tests passent → Corrections mineures nécessaires
- [ ] ❌ **NON CONFORME** - <6/8 tests → Rollback requis

---

## 🚨 PROCÉDURE DE ROLLBACK (SI ÉCHEC)

```bash
# 1. Restaurer version backup
cp /workspaces/-NEWcompteplanvitalroot/components/SaisieDefiAlimentaire.js.backup-2025-12-06 /workspaces/-NEWcompteplanvitalroot/components/SaisieDefiAlimentaire.js

# 2. Vérifier compilation
npm run build

# 3. Tester que l'ancienne version fonctionne
# 4. Documenter l'échec dans docs/Anomalie roll back
```

---

## 📝 NOTES UTILISATEUR

*Espace pour noter observations, bugs découverts, suggestions...*

---

**Date de validation** : __________  
**Validé par** : __________  
**Signature** : __________

# ✅ Checklist Validation Reprise Alimentaire

## 📦 Préparation

- [ ] Serveur dev démarré (`npm run dev`)
- [ ] Script SQL exécuté dans Supabase (`scripts/test-reprise-alimentaire.sql`)
- [ ] Données test créées (`TEST_USER` visible dans `reprises_alimentaires`)
- [ ] User authentifié dans l'app

---

## 🧪 Tests Fonctionnels

### Test 1 : Bandeau reprise

- [ ] Aller sur `/suivi`
- [ ] **Voir** : Bandeau violet gradient avec "🔁 Reprise Alimentaire en cours"
- [ ] **Voir** : "Phase 2 - Jour 3"
- [ ] **Voir** : Liste aliments autorisés Phase 2

**Si échec** : Console → Vérifier `repriseActive` = `true`

---

### Test 2 : Aliment autorisé Phase 2

- [ ] Cliquer "🥐 Petit-déjeuner"
- [ ] Aliment : `Concombre`
- [ ] Quantité : `100`
- [ ] Heure : `08:00`
- [ ] Cliquer "Valider"
- [ ] **Voir** : Message "✅ Bravo ! Repas enregistré"

**Si échec** : Console → Vérifier `modeReprise` props

---

### Test 3 : Aliment phase supérieure refusé

- [ ] Aliment : `Riz complet` (Phase 4)
- [ ] Quantité : `150`
- [ ] Cliquer "Valider"
- [ ] **Voir** : Erreur "⚠️ Cet aliment n'est pas encore autorisé. Il sera disponible en Phase 4"

**Si échec** : Debug `SaisieDefiAlimentaire.js` ligne 120

---

### Test 4 : Féculent soir interdit

- [ ] Type repas : `Dîner`
- [ ] Heure : `20:00` (après 19h)
- [ ] Aliment : `Quinoa` (féculent)
- [ ] Quantité : `150`
- [ ] Cliquer "Valider"
- [ ] **Voir** : Erreur "⚠️ Les féculents sont interdits après 19h"

**Si échec** : Vérifier validation ligne 135 (heureNum >= 19)

---

### Test 5 : Quantité excessive refusée

- [ ] Aliment : `Tomate`
- [ ] Quantité : `300` (max 200g)
- [ ] Cliquer "Valider"
- [ ] **Voir** : Erreur "⚠️ Quantité excessive. Portion maximale recommandée : 200g"

**Si échec** : Vérifier validation ligne 145 (quantiteNum > portionMax)

---

### Test 6 : Validation jour bloquée (<2 repas)

- [ ] Aller sur `/reprise-alimentaire-apres-jeune`
- [ ] Naviguer jusqu'à J+3 (carte "Aujourd'hui")
- [ ] Cliquer "✅ Valider ce jour"
- [ ] **Voir** : Erreur "⚠️ Tu dois enregistrer au moins 2 repas conformes. Actuellement : 0/2 repas"

**Si échec** : Vérifier `validerJour()` ligne 391

---

### Test 7 : Validation jour autorisée (≥2 repas)

- [ ] Retour sur `/suivi`
- [ ] Ajouter repas 1 : `Concombre` 100g à 12:00
- [ ] Ajouter repas 2 : `Avocat` 80g à 19:00
- [ ] Retour sur `/reprise-alimentaire-apres-jeune`
- [ ] Cliquer "✅ Valider ce jour"
- [ ] **Voir** : Message "✅ Jour 3 validé ! Continue comme ça 🌱"

**Si échec** : Console → Vérifier requête `repas_reels`

---

## 🗄️ Vérifications Base de Données

### Repas avec contexte reprise

```sql
SELECT 
  aliment, 
  quantite, 
  jour_reprise, 
  phase_reprise,
  contexte_reprise
FROM repas_reels 
WHERE programme_reprise_id = 'TEST_USER'
ORDER BY jour_reprise, heure;
```

**Attendu** :
- 6 repas J+1 et J+2 (historique)
- 2+ repas J+3 (nouveaux tests)
- `contexte_reprise = true` pour tous
- `jour_reprise` et `phase_reprise` corrects

---

### Jour validé

```sql
SELECT 
  jour_numero, 
  phase, 
  valide, 
  nb_repas_enregistres,
  valide_le
FROM reprises_jours_valides 
WHERE reprise_id = 'TEST_USER' 
AND jour_numero = 3;
```

**Attendu** :
- `valide = true`
- `nb_repas_enregistres >= 2`
- `valide_le` = timestamp aujourd'hui

---

## 🔍 Console Navigateur

**F12 → Console → Rechercher** :

### État reprise (suivi.js)
```javascript
{
  repriseActive: true,
  phaseReprise: 2,
  jourReprise: 3,
  alimentsAutorises: [...]  // Liste aliments Phase 2
}
```

### Payload repas (SaisieDefiAlimentaire.js)
```javascript
{
  aliment: "Concombre",
  quantite: "100",
  contexte_reprise: true,
  jour_reprise: 3,
  phase_reprise: 2,
  programme_reprise_id: "TEST_USER"
}
```

---

## 🗑️ Nettoyage

- [ ] Exécuter dans Supabase SQL Editor :

```sql
DELETE FROM reprises_jours_valides WHERE reprise_id = 'TEST_USER';
DELETE FROM repas_reels WHERE programme_reprise_id = 'TEST_USER';
DELETE FROM reprises_alimentaires WHERE id = 'TEST_USER';
```

- [ ] Vérifier suppression :

```sql
SELECT COUNT(*) FROM reprises_alimentaires WHERE id = 'TEST_USER';
-- Attendu: 0
```

---

## 📊 Score Final

| Catégorie | Tests OK | Total |
|-----------|----------|-------|
| Affichage | __ / 1 | Bandeau visible |
| Validation aliments | __ / 4 | Autorisé, Phase, Féculent, Quantité |
| Validation jour | __ / 2 | Bloqué <2 repas, OK ≥2 repas |
| **TOTAL** | **__ / 7** | **Tous validés = ✅ Prêt** |

---

## 🚀 Si tous les tests passent

- [ ] Console sans erreurs JavaScript
- [ ] DB vérifiée (métadonnées correctes)
- [ ] Données test nettoyées
- [ ] Screenshots des tests (optionnel)
- [ ] Commit des changements :

```bash
git add .
git commit -m "feat(reprise): Validation système reprise alimentaire

✅ Détection phase active (suivi.js)
✅ Bandeau contextuel (gradient violet)
✅ Validation stricte (phase/féculent/quantité)
✅ Métadonnées repas (contexte_reprise)
✅ Validation jour (≥2 repas requis)
📝 Tests 7/7 validés

Refs: GUIDE_TEST_REPRISE.md, VALIDATION_RAPIDE.md"
```

- [ ] Push vers origin :

```bash
git push origin AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS
```

---

## 📝 Notes de Test

**Date** : _______________  
**Testeur** : _______________  
**Navigateur** : _______________  
**Résultat** : ✅ Validé / ❌ Échecs

**Problèmes rencontrés** :
- 
- 
- 

**Solutions appliquées** :
- 
- 
- 

---

**Prêt à tester !** 🚀

1. Exécuter SQL → 2. `npm run dev` → 3. Cocher les cases ci-dessus

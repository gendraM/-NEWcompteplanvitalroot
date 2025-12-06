# 🧪 Guide de Test - Reprise Alimentaire

## 📋 Prérequis

1. **Serveur dev démarré** : `npm run dev`
2. **Supabase configuré** : Variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`
3. **User authentifié** : Être connecté dans l'application

---

## 🚀 Étape 1 : Créer les données de test

### Option A : Via script Node.js (recommandé)

```bash
node scripts/test-reprise-alimentaire.js
```

Ce script crée automatiquement :
- Programme reprise commencé il y a 3 jours
- 10 jours de programme (Phase 1-4)
- Situation actuelle : **J+3, Phase 2**
- J+1 et J+2 déjà validés avec repas

### Option B : Manuellement via SQL (Supabase Dashboard)

```sql
-- 1. Créer programme reprise
INSERT INTO reprises_alimentaires (id, created_by, date_fin_jeune, duree_jeune_jours, type_jeune, duree_reprise_jours, statut, reprise_commencee_le)
VALUES (
  'TEST_USER',
  'TEST_USER',
  (CURRENT_DATE - INTERVAL '4 days')::date,
  7,
  'hydrique',
  10,
  'en_cours',
  (CURRENT_DATE - INTERVAL '3 days')::timestamp
);

-- 2. Générer jour J+3 (aujourd'hui, Phase 2)
INSERT INTO reprises_jours_valides (reprise_id, jour_numero, date, phase, valide)
VALUES ('TEST_USER', 3, CURRENT_DATE, 2, false);

-- 3. Créer J+1 et J+2 (déjà validés)
INSERT INTO reprises_jours_valides (reprise_id, jour_numero, date, phase, valide, nb_repas_enregistres)
VALUES 
  ('TEST_USER', 1, (CURRENT_DATE - INTERVAL '2 days')::date, 1, true, 3),
  ('TEST_USER', 2, (CURRENT_DATE - INTERVAL '1 day')::date, 1, true, 3);
```

---

## ✅ Étape 2 : Tests fonctionnels

### Test 1 : Bandeau de reprise s'affiche

1. Aller sur `/suivi`
2. **Attendu** : Bandeau gradient violet visible avec :
   - "🔁 Reprise Alimentaire en cours"
   - "Phase 2 - Jour 3"
   - Liste des aliments autorisés Phase 2

**✅ Succès** : Bandeau visible avec infos correctes  
**❌ Échec** : Rien ne s'affiche → Vérifier `repriseActive` dans console

---

### Test 2 : Validation aliment autorisé (Phase 2)

1. Sur `/suivi`, cliquer "🥐 Petit-déjeuner"
2. Saisir aliment : **"Concombre"** (Phase 2)
3. Quantité : **100g**
4. Cliquer "Valider"

**✅ Succès** : Repas enregistré, message "Bravo !"  
**❌ Échec** : Erreur → Vérifier validation dans `SaisieDefiAlimentaire.js`

**Vérification DB** :
```sql
SELECT * FROM repas_reels 
WHERE contexte_reprise = true 
AND jour_reprise = 3 
AND phase_reprise = 2;
```

---

### Test 3 : Refus aliment phase supérieure

1. Essayer d'ajouter : **"Riz complet"** (Phase 4)
2. Quantité : **150g**

**✅ Succès** : Message d'erreur "⚠️ Cet aliment n'est pas encore autorisé. Il sera disponible en Phase 4."  
**❌ Échec** : Repas accepté → Bug dans validation phase

---

### Test 4 : Refus féculent le soir (Phase 2+)

1. Changer l'heure à **20:00** (après 19h)
2. Type : **"Dîner"**
3. Essayer d'ajouter : **"Quinoa"** (féculent, Phase 2)

**✅ Succès** : Erreur "⚠️ Les féculents sont interdits après 19h"  
**❌ Échec** : Repas accepté → Bug validation heure

---

### Test 5 : Refus quantité excessive

1. Aliment : **"Tomate"** (Phase 2, portion max : 200g)
2. Quantité : **300g** (au-dessus du max)

**✅ Succès** : Erreur "⚠️ Quantité excessive. Portion maximale : 200g"  
**❌ Échec** : Repas accepté → Bug validation quantité

---

### Test 6 : Validation jour bloquée (<2 repas)

1. Aller sur `/reprise-alimentaire-apres-jeune`
2. Naviguer jusqu'à J+3 (aujourd'hui)
3. Cliquer **"✅ Valider ce jour"**

**✅ Succès** : Erreur "⚠️ Tu dois enregistrer au moins 2 repas conformes"  
**❌ Échec** : Jour validé sans repas → Bug dans `validerJour()`

---

### Test 7 : Validation jour autorisée (≥2 repas)

1. Retourner sur `/suivi`
2. Ajouter 2 repas conformes :
   - **Concombre** (100g) à 12h
   - **Avocat** (80g) à 19h
3. Retourner sur `/reprise-alimentaire-apres-jeune`
4. Cliquer **"✅ Valider ce jour"**

**✅ Succès** : Message "✅ Jour 3 validé ! Continue comme ça 🌱"  
**❌ Échec** : Toujours bloqué → Vérifier requête `repas_reels`

**Vérification DB** :
```sql
SELECT * FROM reprises_jours_valides 
WHERE reprise_id = 'TEST_USER' 
AND jour_numero = 3;
-- valide = true, nb_repas_enregistres = 2
```

---

## 📊 Vérifications console navigateur

Ouvrir DevTools (F12) → Console :

```javascript
// Vérifier état reprise dans suivi.js
console.log({
  repriseActive: ...,  // true
  phaseReprise: ...,   // 2
  jourReprise: ...,    // 3
  alimentsAutorises: [...] // Liste aliments Phase 2
});

// Vérifier payload repas dans SaisieDefiAlimentaire.js
// Doit contenir :
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

## 🗑️ Nettoyage après tests

### Via SQL (Supabase Dashboard)

```sql
-- Supprimer toutes les données test
DELETE FROM reprises_jours_valides WHERE reprise_id = 'TEST_USER';
DELETE FROM repas_reels WHERE programme_reprise_id = 'TEST_USER';
DELETE FROM reprises_alimentaires WHERE id = 'TEST_USER';
```

### Vérification nettoyage

```sql
SELECT COUNT(*) FROM reprises_alimentaires WHERE id = 'TEST_USER';
-- Attendu: 0
```

---

## 🐛 Debugging si problèmes

### Problème 1 : Bandeau ne s'affiche pas

**Cause probable** : `repriseActive` reste `false`

**Solutions** :
1. Vérifier dans console : `localStorage.getItem('repriseActive')`
2. Vérifier requête Supabase dans useEffect de `suivi.js`
3. Vérifier date du jour vs `date` dans `reprises_jours_valides`

### Problème 2 : Validation accepte tout

**Cause probable** : `modeReprise` pas reçu par `SaisieDefiAlimentaire`

**Solutions** :
1. Console log dans `SaisieDefiAlimentaire` : `console.log('modeReprise:', modeReprise)`
2. Vérifier props passés ligne 994 de `suivi.js`
3. Vérifier destructuration props ligne 11 de `SaisieDefiAlimentaire.js`

### Problème 3 : Erreur Supabase lors insertion

**Cause probable** : Colonnes manquantes dans table `repas_reels`

**Solution** :
```sql
-- Ajouter colonnes si manquantes
ALTER TABLE repas_reels 
ADD COLUMN IF NOT EXISTS contexte_reprise BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS jour_reprise INTEGER,
ADD COLUMN IF NOT EXISTS phase_reprise INTEGER,
ADD COLUMN IF NOT EXISTS programme_reprise_id TEXT;
```

---

## 📈 Résultats attendus

| Test | Résultat | Détails |
|------|----------|---------|
| Bandeau reprise | ✅ Affiché | Phase 2, Jour 3, aliments listés |
| Aliment autorisé | ✅ Accepté | Concombre (Phase 2) enregistré |
| Aliment futur | ❌ Refusé | Riz complet (Phase 4) bloqué |
| Féculent soir | ❌ Refusé | Quinoa après 19h bloqué |
| Quantité excessive | ❌ Refusé | >portionDefaut bloqué |
| Validation <2 repas | ❌ Bloqué | Message erreur affiché |
| Validation ≥2 repas | ✅ Validé | Jour marqué valide en DB |

---

## 🎯 Checklist finale

- [ ] Script test exécuté sans erreur
- [ ] Bandeau reprise visible sur `/suivi`
- [ ] Validation phase fonctionne (autorisé/refusé)
- [ ] Validation féculent soir fonctionne
- [ ] Validation quantité fonctionne
- [ ] Validation jour bloquée si <2 repas
- [ ] Validation jour OK si ≥2 repas
- [ ] Métadonnées reprise enregistrées en DB
- [ ] Console sans erreurs JS
- [ ] Données test nettoyées

---

## 📝 Notes

- **Phase 1** (J1-2) : Liquides uniquement
- **Phase 2** (J3-5) : Liquides + légumes crus/cuits
- **Phase 3** (J6-8) : + Fruits + Protéines végétales
- **Phase 4** (J9-10) : + Féculents (sauf soir)

**Féculent soir** : Interdit après 19h pour Phase 2-4

**Validation jour** : Requiert ≥2 repas avec `contexte_reprise=true`, `jour_reprise` et `phase_reprise` corrects

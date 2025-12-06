# 🎯 Validation Rapide - Reprise Alimentaire

## ⚡ En 2 étapes

### 1️⃣ Créer les données test (2 min)

**Option A : Script SQL (RECOMMANDÉ)**

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner ton projet → SQL Editor
3. Copier tout le contenu de `scripts/test-reprise-alimentaire.sql`
4. Cliquer **Run**

**Option B : Script Node.js**

```bash
npm install @supabase/supabase-js
node scripts/test-reprise-alimentaire.js
```

**Résultat attendu** :
- Programme `TEST_USER` créé (statut `en_cours`)
- 10 jours générés (Phase 1-4)
- Aujourd'hui = J+3, Phase 2
- J+1 et J+2 déjà validés
- 6 repas historiques

---

### 2️⃣ Tester dans l'application (5 min)

#### A. Démarrer le serveur

```bash
npm run dev
```

#### B. Tests rapides

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Bandeau** | Aller sur `/suivi` | Bandeau violet "Phase 2 - Jour 3" visible |
| **Aliment OK** | Ajouter "Concombre" 100g | ✅ Accepté, enregistré |
| **Aliment futur** | Ajouter "Riz complet" | ❌ Refusé "Phase 4 pas accessible" |
| **Féculent soir** | Ajouter "Quinoa" à 20h | ❌ Refusé "Interdit après 19h" |
| **Quantité** | Ajouter "Tomate" 300g | ❌ Refusé "Portion max 200g" |
| **Validation** | Valider J+3 sans repas | ❌ Bloqué "Min 2 repas" |
| **Validation OK** | Ajouter 2 repas → Valider | ✅ "Jour 3 validé !" |

---

## 🔍 Vérifications DB (optionnel)

```sql
-- Voir les repas avec contexte reprise
SELECT aliment, quantite, jour_reprise, phase_reprise 
FROM repas_reels 
WHERE contexte_reprise = true 
ORDER BY created_at DESC 
LIMIT 10;

-- Voir statut jour actuel
SELECT jour_numero, phase, valide, nb_repas_enregistres 
FROM reprises_jours_valides 
WHERE reprise_id = 'TEST_USER' 
AND jour_numero = 3;
```

---

## 🗑️ Nettoyage

```sql
DELETE FROM reprises_jours_valides WHERE reprise_id = 'TEST_USER';
DELETE FROM repas_reels WHERE programme_reprise_id = 'TEST_USER';
DELETE FROM reprises_alimentaires WHERE id = 'TEST_USER';
```

---

## 🐛 Si problème

1. **Bandeau absent** : Vérifier console navigateur → `repriseActive` doit être `true`
2. **Tout accepté** : Vérifier props dans console → `modeReprise` doit être `true`
3. **Erreur DB** : Vérifier colonnes dans `repas_reels` (voir GUIDE_TEST_REPRISE.md)

**Guide complet** : `docs/GUIDE_TEST_REPRISE.md` (tests détaillés + debugging)
